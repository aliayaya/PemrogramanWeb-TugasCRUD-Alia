"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout, getUser } from "@/lib/auth";
import {
  getProduk,
  createProduk,
  updateProduk,
  deleteProduk,
  Produk,
  ProdukInput,
} from "@/lib/api";

const initialForm: ProdukInput = {
  nama: "",
  harga: 0,
  stok: 0,
};

export default function ProdukPage() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const [form, setForm] = useState<ProdukInput>(initialForm);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const loadProduk = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProduk();
      setProduk(data);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Gagal memuat data produk";
      if (errMsg.includes("Failed to fetch") || errMsg.includes("fetch failed") || errMsg.includes("Token tidak valid")) {
        setError("Koneksi gagal atau sesi habis. Harap login kembali atau nyalakan backend.");
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setCurrentUser(user);
    loadProduk();
  }, []);

  useEffect(() => {
    if (selectedProduk) {
      setForm({
        nama: selectedProduk.nama,
        harga: selectedProduk.harga,
        stok: selectedProduk.stok,
      });
    } else {
      setForm(initialForm);
    }
  }, [selectedProduk]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage("");
    setError("");

    try {
      if (selectedProduk) {
        await updateProduk(selectedProduk.id, form);
        setMessage("Produk berhasil diperbarui.");
      } else {
        await createProduk(form);
        setMessage("Produk berhasil ditambahkan.");
      }

      setForm(initialForm);
      setSelectedProduk(null);
      await loadProduk();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus produk ini?");
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      await deleteProduk(id);
      setMessage("Produk berhasil dihapus.");
      await loadProduk();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus produk.");
    }
  };

  return (
    <main className="container">
      <div className="card header" style={{ padding: "30px 40px", marginBottom: "30px", borderBottom: "none" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Pusat Kelola Produk</h1>
          <p style={{ margin: 0 }}>
            Kelola inventaris dan stok barang produk Anda secara langsung.
            {currentUser && (
              <span style={{ marginLeft: "10px", color: "var(--primary)", fontWeight: "600" }}>
                (Masuk sebagai: {currentUser.name})
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/">
            <button className="btn-secondary">Beranda</button>
          </Link>
          <button className="btn-danger" onClick={logout} style={{ padding: "10px 20px" }}>
            Logout
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="message error">{error}</div>}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card">
        <h2 style={{ color: "var(--foreground)", marginTop: 0 }}>
          {selectedProduk ? "Edit Produk" : "Tambah Produk Baru"}
        </h2>

        <div className="grid">
          <div className="form-group">
            <label htmlFor="nama">Nama Produk</label>
            <input
              id="nama"
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Mouse Wireless Logitech"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="harga">Harga (Rp)</label>
            <input
              id="harga"
              type="number"
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })}
              placeholder="120000"
              min="0"
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label htmlFor="stok">Stok Barang</label>
            <input
              id="stok"
              type="number"
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })}
              placeholder="50"
              min="0"
              required
            />
          </div>
        </div>

        <div className="actions" style={{ marginTop: "20px" }}>
          <button type="submit" className="btn-primary" disabled={formLoading}>
            {formLoading ? "Menyimpan..." : selectedProduk ? "Simpan Perubahan" : "Tambah Produk"}
          </button>

          {selectedProduk && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSelectedProduk(null)}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* List Table Card */}
      <section className="card" style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", marginTop: 0 }}>Daftar Produk</h2>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="spinner" style={{ margin: "0 auto 10px auto" }}></div>
            <p style={{ color: "#666" }}>Memuat inventaris produk...</p>
          </div>
        ) : produk.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "20px 0" }}>Belum ada data produk.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Produk</th>
                <th>Harga (Rp)</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produk.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 500, color: "var(--foreground)" }}>{item.nama}</td>
                  <td>{item.harga.toLocaleString("id-ID")}</td>
                  <td>{item.stok} unit</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-secondary"
                        onClick={() => setSelectedProduk(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
