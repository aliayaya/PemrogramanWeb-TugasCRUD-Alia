import express from 'express';
import cors from 'cors';
import path from 'path';
import mahasiswaRoutes from './routes/mahasiswa.route';
import prodiRoutes from './routes/prodi.route';
import produkRoutes from './routes/produk.route';
import authRoutes from './routes/auth.route';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Backend Express berjalan' });
});

app.use('/api/auth', authRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/prodi', prodiRoutes);
app.use('/api/produk', produkRoutes);

export default app;
