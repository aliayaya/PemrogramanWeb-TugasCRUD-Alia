import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container center-landing">
      <div className="card" style={{ padding: "60px 40px" }}>
        <h1 style={{ background: "none", WebkitTextFillColor: "initial", color: "var(--foreground)", fontSize: "2.5rem" }}>Frontend Next.js untuk Express CRUD API</h1>
        <p>
          Aplikasi ini adalah contoh frontend Next.js yang mengakses backend
          Express.js melalui REST API.
        </p>

        <div style={{ marginTop: '40px' }}>
          <Link href="/mahasiswa">
            <button className="btn-primary" style={{ padding: "16px 40px", fontSize: "1.1rem" }}>
              Buka Data Mahasiswa
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
