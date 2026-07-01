"use client";

import { Mahasiswa, UPLOADS_URL } from "@/lib/api";

type Props = {
  mahasiswa: Mahasiswa[];
  onEdit: (item: Mahasiswa) => void;
  onDelete: (id: number) => Promise<void>;
  startIndex?: number;
};

export default function MahasiswaTable({ mahasiswa, onEdit, onDelete, startIndex = 0 }: Props) {
  if (mahasiswa.length === 0) {
    return <p style={{ color: "var(--text-muted)", padding: "20px 0", textAlign: "center" }}>Belum ada data mahasiswa.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Foto</th>
          <th>NIM</th>
          <th>Nama</th>
          <th>Prodi</th>
          <th>Angkatan</th>
          <th>Aksi</th>
        </tr>
      </thead>

      <tbody>
        {mahasiswa.map((item, index) => (
          <tr key={item.id}>
            <td>{startIndex + index + 1}</td>
            <td>
              {item.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${UPLOADS_URL}/${item.foto}`}
                  alt={item.nama}
                  style={{
                    width: "45px",
                    height: "45px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "2px solid #e5e7eb",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    backgroundColor: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#9ca3af",
                  }}
                >
                  {item.nama.charAt(0).toUpperCase()}
                </div>
              )}
            </td>
            <td>{item.nim}</td>
            <td style={{ fontWeight: 500, color: "var(--foreground)" }}>{item.nama}</td>
            <td>{item.nama_prodi || "Belum ditentukan"}</td>
            <td>{item.angkatan}</td>
            <td>
              <div className="actions">
                <button className="btn-secondary" onClick={() => onEdit(item)}>
                  Edit
                </button>

                <button className="btn-danger" onClick={() => onDelete(item.id)}>
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
