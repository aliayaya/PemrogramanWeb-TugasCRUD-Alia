"use client";

import { useState } from "react";
import Link from "next/link";
import { saveAuth } from "@/lib/auth";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "register") {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Registrasi gagal");
        }

        setSuccess("Registrasi berhasil! Silakan login menggunakan akun Anda.");
        setName("");
        setPassword("");
        setMode("login");
      } else {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Login gagal");
        }

        saveAuth(result.token, result.user);
        window.location.href = "/mahasiswa";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container center-landing">
      <div className="card" style={{ width: "100%", maxWidth: "450px", padding: "45px 30px" }}>
        
        {/* Toggle Mode Tab Headers */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "30px" }}>
          <button 
            type="button" 
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            style={{ 
              flex: 1, 
              background: "none", 
              border: "none", 
              color: mode === "login" ? "var(--primary)" : "var(--text-muted)", 
              borderBottom: mode === "login" ? "3px solid var(--primary)" : "3px solid transparent",
              borderRadius: 0,
              padding: "12px",
              boxShadow: "none",
              cursor: "pointer"
            }}
          >
            Login
          </button>
          <button 
            type="button" 
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
            style={{ 
              flex: 1, 
              background: "none", 
              border: "none", 
              color: mode === "register" ? "var(--primary)" : "var(--text-muted)", 
              borderBottom: mode === "register" ? "3px solid var(--primary)" : "3px solid transparent",
              borderRadius: 0,
              padding: "12px",
              boxShadow: "none",
              cursor: "pointer"
            }}
          >
            Daftar Akun
          </button>
        </div>

        <h1 style={{ fontSize: "1.75rem", marginBottom: "10px", textAlign: "center", marginTop: 0 }}>
          {mode === "login" ? "Selamat Datang" : "Registrasi Akun"}
        </h1>
        <p style={{ textAlign: "center", marginBottom: "25px", fontSize: "0.95rem", color: "var(--text-muted)" }}>
          {mode === "login" ? "Masuk untuk mengelola data kampus Anda" : "Buat akun baru untuk mulai mengakses sistem"}
        </p>

        {success && <div className="message" style={{ margin: "0 0 20px 0" }}>{success}</div>}
        {error && <div className="message error" style={{ margin: "0 0 20px 0" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "register" && (
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="name">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin Baru"
                required
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="email">Alamat Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kampus.com"
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: "100%", marginTop: "10px", padding: "14px" }}
          >
            {loading ? "Memproses..." : mode === "login" ? "Masuk Sekarang" : "Daftar Sekarang"}
          </button>
        </form>

        <div style={{ marginTop: "25px", textAlign: "center", fontSize: "0.9rem" }}>
          <Link href="/" style={{ color: "var(--primary)", fontWeight: 500 }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
