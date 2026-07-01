import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs';
import path from 'path';

export const getMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search ? String(req.query.search).trim() : '';
    const prodiId = req.query.prodi_id ? Number(req.query.prodi_id) : null;
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 10;
    const offset = (page - 1) * limit;

    let queryConditions: string[] = [];
    let queryParams: any[] = [];

    if (search) {
      queryConditions.push('(m.nama LIKE ? OR m.nim LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (prodiId) {
      queryConditions.push('m.prodi_id = ?');
      queryParams.push(prodiId);
    }

    const whereClause = queryConditions.length > 0 ? 'WHERE ' + queryConditions.join(' AND ') : '';

    // Count total rows
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM mahasiswa m 
      ${whereClause}
    `;
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, queryParams);
    const totalItems = countRows[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Data query
    const dataQuery = `
      SELECT m.*, p.nama AS nama_prodi 
      FROM mahasiswa m 
      LEFT JOIN prodi p ON m.prodi_id = p.id 
      ${whereClause} 
      ORDER BY m.id DESC 
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query<RowDataPacket[]>(dataQuery, [...queryParams, limit, offset]);

    res.json({
      message: 'Data mahasiswa berhasil diambil',
      data: rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal mengambil data mahasiswa', error: err.message });
  }
};

export const createMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nim, nama, prodi_id, angkatan } = req.body;
    const foto = req.file ? req.file.filename : null;

    const parsedProdiId = prodi_id ? Number(prodi_id) : null;
    const parsedAngkatan = Number(angkatan);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan, foto) VALUES (?, ?, ?, ?, ?)',
      [nim, nama, parsedProdiId, parsedAngkatan, foto]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT m.*, p.nama AS nama_prodi FROM mahasiswa m LEFT JOIN prodi p ON m.prodi_id = p.id WHERE m.id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Data mahasiswa berhasil ditambahkan',
      data: rows[0]
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/mahasiswa', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menambahkan data mahasiswa', error: err.message });
  }
};

export const updateMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nim, nama, prodi_id, angkatan } = req.body;

    const [current] = await pool.query<RowDataPacket[]>(
      'SELECT foto FROM mahasiswa WHERE id = ?',
      [id]
    );

    if (current.length === 0) {
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    let foto = current[0].foto;
    if (req.file) {
      if (foto) {
        const oldPath = path.join(__dirname, '../../uploads/mahasiswa', foto);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      foto = req.file.filename;
    }

    const parsedProdiId = prodi_id ? Number(prodi_id) : null;
    const parsedAngkatan = Number(angkatan);

    await pool.query<ResultSetHeader>(
      'UPDATE mahasiswa SET nim = ?, nama = ?, prodi_id = ?, angkatan = ?, foto = ? WHERE id = ?',
      [nim, nama, parsedProdiId, parsedAngkatan, foto, id]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT m.*, p.nama AS nama_prodi FROM mahasiswa m LEFT JOIN prodi p ON m.prodi_id = p.id WHERE m.id = ?',
      [id]
    );

    res.json({
      message: 'Data mahasiswa berhasil diperbarui',
      data: rows[0]
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/mahasiswa', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    const err = error as Error;
    res.status(500).json({ message: 'Gagal diperbarui data mahasiswa', error: err.message });
  }
};

export const deleteMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [current] = await pool.query<RowDataPacket[]>(
      'SELECT foto FROM mahasiswa WHERE id = ?',
      [id]
    );

    if (current.length === 0) {
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    const foto = current[0].foto;
    if (foto) {
      const filePath = path.join(__dirname, '../../uploads/mahasiswa', foto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query<ResultSetHeader>('DELETE FROM mahasiswa WHERE id = ?', [id]);

    res.json({
      message: 'Data mahasiswa berhasil dihapus'
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menghapus data mahasiswa', error: err.message });
  }
};
