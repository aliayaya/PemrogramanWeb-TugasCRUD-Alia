"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/auth";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getUser());
  }, []);

  return (
    <main className="container center-landing">
      <div className="card" style={{ padding: "60px 40px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ background: "none", WebkitTextFillColor: "initial", color: "var(--foreground)", fontSize: "2.5rem", marginTop: 0 }}>
          Frontend Next.js untuk Express CRUD API
        </h1>
        <p style={{ color: "#555", fontSize: "1.1rem", lineHeight: "1.6" }}>
          Aplikasi ini adalah contoh frontend Next.js yang mengakses backend
          Express.js melalui REST API dengan database MySQL.
        </p>

        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/mahasiswa">
              <button className="btn-primary" style={{ padding: "16px 32px", fontSize: "1rem" }}>
                Buka Data Mahasiswa
              </button>
            </Link>
            <Link href="/produk">
              <button className="btn-secondary" style={{ padding: "16px 32px", fontSize: "1rem", border: "1px solid #d1d5db" }}>
                Buka Data Produk
              </button>
            </Link>
          </div>

          {currentUser && currentUser.role === "admin" && (
            <Link href="/users" style={{ width: "100%", maxWidth: "392px" }}>
              <button className="btn-secondary" style={{ width: "100%", padding: "16px 32px", fontSize: "1rem", color: "#2563eb", borderColor: "#bfdbfe" }}>
                Kelola Pengguna (Admin Only)
              </button>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
