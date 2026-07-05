import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY id DESC`
    );

    return res.json({
      message: "Data user berhasil diambil",
      data: rows,
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ message: "Terjadi kesalahan server", error: err.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Nama, email, password, dan role wajib diisi",
      });
    }

    const allowedRoles = ["admin", "operator", "viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query<ResultSetHeader>(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    return res.status(201).json({ message: "User berhasil ditambahkan" });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ message: "Terjadi kesalahan server", error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Nama, email, dan role wajib diisi" });
    }

    const allowedRoles = ["admin", "operator", "viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
      [name, email, role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.json({ message: "User berhasil diperbarui" });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ message: "Terjadi kesalahan server", error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ message: "Terjadi kesalahan server", error: err.message });
  }
};

function generateTemporaryPassword() {
  return Math.random().toString(36).slice(-10);
}

export const resetPasswordByAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.json({
      message: "Password berhasil direset",
      temporaryPassword,
      note: "Tampilkan hanya sekali, lalu minta user mengganti password.",
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ message: "Terjadi kesalahan server", error: err.message });
  }
};
