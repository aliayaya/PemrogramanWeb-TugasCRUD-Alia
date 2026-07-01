"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MahasiswaForm from "@/components/MahasiswaForm";
import MahasiswaTable from "@/components/MahasiswaTable";
import { logout, getUser } from "@/lib/auth";
import {
  createMahasiswa,
  deleteMahasiswa,
  getMahasiswa,
  getProdi,
  Mahasiswa,
  Prodi,
  updateMahasiswa,
} from "@/lib/api";

export default function MahasiswaPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProdiFilter, setSelectedProdiFilter] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 5; // limit 5 to demonstrate pagination easily

  // UI States
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProdis = async () => {
    try {
      const data = await getProdi();
      setProdis(data);
    } catch (err) {
      console.error("Gagal memuat prodi:", err);
    }
  };

  const loadMahasiswa = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await getMahasiswa({
        prodi_id: selectedProdiFilter,
        page: page,
        limit: limit,
      });
      setMahasiswa(res.data);
      setCurrentPage(res.pagination.currentPage);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Gagal memuat data mahasiswa";
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
    loadProdis();
    loadMahasiswa(1);
  }, [selectedProdiFilter]);

  const handleSubmit = async (payload: FormData) => {
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
      await loadMahasiswa(currentPage);
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
      
      const nextPage = (mahasiswa.length === 1 && currentPage > 1) ? currentPage - 1 : currentPage;
      await loadMahasiswa(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data.");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadMahasiswa(page);
    }
  };

  const displayedMahasiswa = mahasiswa.filter((m) =>
    m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.nim.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="container">
      <div className="card header" style={{ padding: "30px 40px", marginBottom: "30px", borderBottom: "none" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Dashboard Mahasiswa</h1>
          <p style={{ margin: 0 }}>
            Kelola pusat informasi mahasiswa Anda secara real-time.
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

      <MahasiswaForm
        selectedMahasiswa={selectedMahasiswa}
        onSubmit={handleSubmit}
        onCancelEdit={() => setSelectedMahasiswa(null)}
      />

      <section className="card" style={{ marginTop: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Daftar Mahasiswa</h2>
          
          {/* Search & Filter Controls */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Cari Nama atau NIM... (Tugas 3)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "250px" }}
            />
            
            <select
              value={selectedProdiFilter}
              onChange={(e) => {
                setSelectedProdiFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Semua Prodi</option>
              {prodis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="spinner" style={{ margin: "0 auto 10px auto" }}></div>
            <p style={{ color: "#666" }}>Memuat data mahasiswa...</p>
          </div>
        ) : (
          <>
            <MahasiswaTable
              mahasiswa={displayedMahasiswa}
              onEdit={setSelectedMahasiswa}
              onDelete={handleDelete}
              startIndex={(currentPage - 1) * limit}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Menampilkan {displayedMahasiswa.length} dari {totalItems} data
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary"
                    style={{ padding: "6px 12px", opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                  >
                    Sebelumnya
                  </button>
                  <span style={{ display: "flex", alignItems: "center", padding: "0 8px", fontSize: "14px", fontWeight: "600" }}>
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary"
                    style={{ padding: "6px 12px", opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
