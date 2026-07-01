import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getProduk = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM produk ORDER BY id DESC');
    res.json({
      message: 'Data produk berhasil diambil',
      data: rows
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal mengambil data produk', error: err.message });
  }
};

export const createProduk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, harga, stok } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO produk (nama, harga, stok) VALUES (?, ?, ?)',
      [nama, harga, stok]
    );
    res.status(201).json({
      message: 'Data produk berhasil ditambahkan',
      data: {
        id: result.insertId,
        nama,
        harga,
        stok
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menambahkan data produk', error: err.message });
  }
};

export const updateProduk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nama, harga, stok } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE produk SET nama = ?, harga = ?, stok = ? WHERE id = ?',
      [nama, harga, stok, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Produk tidak ditemukan' });
      return;
    }

    res.json({
      message: 'Data produk berhasil diperbarui',
      data: {
        id: Number(id),
        nama,
        harga,
        stok
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal memperbarui data produk', error: err.message });
  }
};

export const deleteProduk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM produk WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Produk tidak ditemukan' });
      return;
    }

    res.json({
      message: 'Data produk berhasil dihapus'
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menghapus data produk', error: err.message });
  }
};
