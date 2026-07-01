CREATE DATABASE IF NOT EXISTS kampus;

USE kampus;

CREATE TABLE IF NOT EXISTS prodi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  prodi_id INT,
  angkatan INT NOT NULL,
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prodi_id) REFERENCES prodi(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  harga INT NOT NULL,
  stok INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial prodi
INSERT IGNORE INTO prodi (id, nama) VALUES 
(1, 'Informatika'), 
(2, 'Sistem Informasi'),
(3, 'Teknologi Informasi');

-- Insert initial mahasiswa
INSERT IGNORE INTO mahasiswa (id, nim, nama, prodi_id, angkatan, foto) VALUES 
(1, '2201001', 'Ahmad Fauzi', 1, 2022, NULL),
(2, '2201002', 'Budi Santoso', 2, 2022, NULL);

-- Insert initial produk
INSERT IGNORE INTO produk (id, nama, harga, stok) VALUES
(1, 'Buku Pemrograman Web', 75000, 50),
(2, 'Mouse Wireless Logitech', 120000, 30),
(3, 'Keyboard Mechanical Keychron', 1500000, 10);
