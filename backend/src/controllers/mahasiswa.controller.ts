import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM mahasiswa');
    res.json({
      message: 'Data mahasiswa berhasil diambil',
      data: rows
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal mengambil data mahasiswa', error: err.message });
  }
};

export const createMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nim, nama, prodi, angkatan } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO mahasiswa (nim, nama, prodi, angkatan) VALUES (?, ?, ?, ?)',
      [nim, nama, prodi, angkatan]
    );
    
    // Asumsikan struktur database memiliki id auto_increment
    res.status(201).json({
      message: 'Data mahasiswa berhasil ditambahkan',
      data: {
        id: result.insertId,
        nim,
        nama,
        prodi,
        angkatan
      }
    });
  } catch (error) {
    console.error("Create Mahasiswa Error:", error);
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menambahkan data mahasiswa', error: err.message || error });
  }
};

export const updateMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nim, nama, prodi, angkatan } = req.body;
    
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE mahasiswa SET nim = ?, nama = ?, prodi = ?, angkatan = ? WHERE id = ?',
      [nim, nama, prodi, angkatan, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    res.json({
      message: 'Data mahasiswa berhasil diperbarui',
      data: {
        id: Number(id),
        nim,
        nama,
        prodi,
        angkatan
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal memperbarui data mahasiswa', error: err.message });
  }
};

export const deleteMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM mahasiswa WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    res.json({
      message: 'Data mahasiswa berhasil dihapus'
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menghapus data mahasiswa', error: err.message });
  }
};
