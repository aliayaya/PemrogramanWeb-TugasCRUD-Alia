CREATE DATABASE IF NOT EXISTS kampus;

USE kampus;

CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  prodi VARCHAR(100) NOT NULL,
  angkatan INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mahasiswa (nim, nama, prodi, angkatan) VALUES 
('2201001', 'Ahmad Fauzi', 'Informatika', 2022),
('2201002', 'Budi Santoso', 'Sistem Informasi', 2022);
