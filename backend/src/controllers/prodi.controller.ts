import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export const getProdi = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM prodi ORDER BY nama ASC');
    res.json({
      message: 'Data prodi berhasil diambil',
      data: rows
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal mengambil data prodi', error: err.message });
  }
};
