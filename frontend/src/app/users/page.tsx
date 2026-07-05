"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout, getUser } from "@/lib/auth";
import {
  getUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  resetUserPassword,
  User,
  UserInput,
} from "@/lib/api";

const initialForm: UserInput = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserInput>(initialForm);

  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  
  // Modal / Temp Passwords state
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [tempPassUser, setTempPassUser] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Gagal memuat data user";
      if (errMsg.includes("Failed to fetch") || errMsg.includes("fetch failed") || errMsg.includes("Token tidak valid")) {
        setError("Koneksi gagal atau sesi habis. Harap login kembali.");
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
    if (user.role !== "admin") {
      window.location.href = "/mahasiswa";
      return;
    }
    setCurrentUser(user);
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setForm({
        name: selectedUser.name,
        email: selectedUser.email,
        password: "", // hide password field or make it optional on edit
        role: selectedUser.role,
      });
    } else {
      setForm(initialForm);
    }
  }, [selectedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage("");
    setError("");

    try {
      if (selectedUser) {
        // Edit User
        await updateUserByAdmin(selectedUser.id, {
          name: form.name,
          email: form.email,
          role: form.role,
        });
        setMessage("User berhasil diperbarui.");
      } else {
        // Create User
        if (!form.password) {
          throw new Error("Password wajib diisi untuk user baru");
        }
        await createUserByAdmin(form);
        setMessage("User berhasil ditambahkan.");
      }

      setForm(initialForm);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan user.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (currentUser && currentUser.id === id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!");
      return;
    }

    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus user "${name}"?`);
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      await deleteUserByAdmin(id);
      setMessage("User berhasil dihapus.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus user.");
    }
  };

  const handleResetPassword = async (user: User) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin mereset password untuk "${user.name}"?`);
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      const rawTempPass = await resetUserPassword(user.id);
      setTempPassword(rawTempPass);
      setTempPassUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mereset password.");
    }
  };

  return (
    <main className="container">
      {/* Header Card */}
      <div className="card header" style={{ padding: "30px 40px", marginBottom: "30px", borderBottom: "none" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Kelola Akun User</h1>
          <p style={{ margin: 0 }}>
            Kelola data akun pengguna, role akses, dan reset password sistem.
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

      {/* Temporary Password Dialog Alert Box */}
      {tempPassword && tempPassUser && (
        <div className="message" style={{ backgroundColor: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", marginBottom: "25px", padding: "20px" }}>
          <h3 style={{ marginTop: 0, color: "#065f46" }}>Password Berhasil Direset!</h3>
          <p style={{ margin: "5px 0 15px 0" }}>Berikut adalah password sementara untuk user <strong>{tempPassUser.name}</strong> ({tempPassUser.email}):</p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: "bold", letterSpacing: "1px", backgroundColor: "#fff", padding: "8px 16px", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
              {tempPassword}
            </span>
            <button 
              className="btn-secondary" 
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
                alert("Password disalin ke clipboard!");
              }}
              style={{ padding: "8px 12px", fontSize: "0.85rem" }}
            >
              Salin
            </button>
          </div>
          <p style={{ fontSize: "0.85rem", marginTop: "12px", marginBottom: 0, color: "#047857" }}>
            * Catatan: Password ini hanya ditampilkan sekali. Mohon segera informasikan ke pemilik akun untuk menggantinya setelah login.
          </p>
          <button 
            className="btn-primary" 
            onClick={() => { setTempPassword(null); setTempPassUser(null); }}
            style={{ marginTop: "15px", padding: "8px 16px", fontSize: "0.9rem", backgroundColor: "#059669" }}
          >
            Tutup Informasi
          </button>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card">
        <h2 style={{ color: "var(--foreground)", marginTop: 0 }}>
          {selectedUser ? `Edit User: ${selectedUser.name}` : "Tambah User Baru"}
        </h2>

        <div className="grid">
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="budi@kampus.com"
              required
            />
          </div>

          {!selectedUser ? (
            <div className="form-group">
              <label htmlFor="password">Password Default</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="password-placeholder">Password</label>
              <input
                id="password-placeholder"
                type="text"
                disabled
                value="Gunakan tombol Reset Password di bawah jika lupa"
                style={{ backgroundColor: "#f3f4f6", color: "#9ca3af", fontStyle: "italic" }}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Role Akses</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
            >
              <option value="viewer">Viewer (Read-Only)</option>
              <option value="operator">Operator (Create & Edit)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
          </div>
        </div>

        <div className="actions" style={{ marginTop: "20px" }}>
          <button type="submit" className="btn-primary" disabled={formLoading}>
            {formLoading ? "Menyimpan..." : selectedUser ? "Simpan Perubahan" : "Tambah User"}
          </button>

          {selectedUser && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSelectedUser(null)}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Users Table List */}
      <section className="card" style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", marginTop: 0 }}>Daftar Pengguna Sistem</h2>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="spinner" style={{ margin: "0 auto 10px auto" }}></div>
            <p style={{ color: "#666" }}>Memuat daftar akun...</p>
          </div>
        ) : users.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "20px 0" }}>Belum ada data user.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Pengguna</th>
                <th>Email</th>
                <th>Role</th>
                <th>Tanggal Dibuat</th>
                <th>Aksi Kelola</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 500, color: "var(--foreground)" }}>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <span 
                      style={{ 
                        display: "inline-block",
                        padding: "4px 8px", 
                        borderRadius: "12px", 
                        fontSize: "0.75rem", 
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        backgroundColor: item.role === "admin" ? "#fef3c7" : item.role === "operator" ? "#e0f2fe" : "#f3f4f6",
                        color: item.role === "admin" ? "#d97706" : item.role === "operator" ? "#0284c7" : "#4b5563"
                      }}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</td>
                  <td>
                    <div className="actions" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setSelectedUser(item)}
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleResetPassword(item)}
                        style={{ padding: "6px 12px", fontSize: "0.85rem", color: "#2563eb", borderColor: "#bfdbfe" }}
                      >
                        Reset Password
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={currentUser && currentUser.id === item.id}
                        style={{ 
                          padding: "6px 12px", 
                          fontSize: "0.85rem",
                          opacity: currentUser && currentUser.id === item.id ? 0.4 : 1,
                          cursor: currentUser && currentUser.id === item.id ? "not-allowed" : "pointer"
                        }}
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
