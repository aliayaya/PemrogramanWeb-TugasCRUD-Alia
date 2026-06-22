"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaForm from "@/components/MahasiswaForm";
import MahasiswaTable from "@/components/MahasiswaTable";
import {
  createMahasiswa,
  deleteMahasiswa,
  getMahasiswa,
  Mahasiswa,
  MahasiswaInput,
  updateMahasiswa,
} from "@/lib/api";

export default function MahasiswaPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadMahasiswa = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMahasiswa();
      setMahasiswa(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMahasiswa();
  }, []);

  const handleSubmit = async (payload: MahasiswaInput) => {
    try {
      setMessage("");
      setError("");

      if (selectedMahasiswa) {
        await updateMahasiswa(selectedMahasiswa.id, payload);
        setMessage("Data mahasiswa berhasil diperbarui.");
      } else {
        await createMahasiswa(payload);
        setMessage("Data mahasiswa berhasil ditambahkan.");
      }

      setSelectedMahasiswa(null);
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      await deleteMahasiswa(id);
      setMessage("Data mahasiswa berhasil dihapus.");
      await loadMahasiswa();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data.");
    }
  };

  return (
    <main className="container">
      <div className="card header" style={{ padding: "30px 40px", marginBottom: "30px", borderBottom: "none" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Dashboard Mahasiswa</h1>
          <p style={{ margin: 0 }}>Kelola pusat informasi mahasiswa Anda secara real-time.</p>
        </div>

        <Link href="/">
          <button className="btn-secondary">Kembali</button>
        </Link>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <MahasiswaForm
        selectedMahasiswa={selectedMahasiswa}
        onSubmit={handleSubmit}
        onCancelEdit={() => setSelectedMahasiswa(null)}
      />

      <section className="card" style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Daftar Mahasiswa</h2>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <MahasiswaTable
            mahasiswa={mahasiswa}
            onEdit={setSelectedMahasiswa}
            onDelete={handleDelete}
          />
        )}
      </section>
    </main>
  );
}
