"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mahasiswa, getProdi, Prodi, UPLOADS_URL } from "@/lib/api";

type Props = {
  selectedMahasiswa: Mahasiswa | null;
  onSubmit: (payload: FormData) => Promise<void>;
  onCancelEdit: () => void;
};

type MahasiswaFormInput = {
  nim: string;
  nama: string;
  prodi_id: string;
  angkatan: number;
};

const initialForm: MahasiswaFormInput = {
  nim: "",
  nama: "",
  prodi_id: "",
  angkatan: new Date().getFullYear(),
};

export default function MahasiswaForm({
  selectedMahasiswa,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [form, setForm] = useState<MahasiswaFormInput>(initialForm);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch prodi options on mount
  useEffect(() => {
    async function fetchProdis() {
      try {
        const data = await getProdi();
        setProdis(data);
      } catch (err) {
        console.error("Gagal mengambil data prodi:", err);
      }
    }
    fetchProdis();
  }, []);

  useEffect(() => {
    if (selectedMahasiswa) {
      setForm({
        nim: selectedMahasiswa.nim,
        nama: selectedMahasiswa.nama,
        prodi_id: selectedMahasiswa.prodi_id ? String(selectedMahasiswa.prodi_id) : "",
        angkatan: selectedMahasiswa.angkatan,
      });
      setFotoFile(null);
      setPreviewUrl(
        selectedMahasiswa.foto
          ? `${UPLOADS_URL}/${selectedMahasiswa.foto}`
          : null
      );
    } else {
      setForm(initialForm);
      setFotoFile(null);
      setPreviewUrl(null);
    }
  }, [selectedMahasiswa]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFotoFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nim", form.nim);
      formData.append("nama", form.nama);
      formData.append("prodi_id", form.prodi_id);
      formData.append("angkatan", String(form.angkatan));
      if (fotoFile) {
        formData.append("foto", fotoFile);
      }

      await onSubmit(formData);
      setForm(initialForm);
      setFotoFile(null);
      setPreviewUrl(null);
      // Reset file input
      const fileInput = document.getElementById("foto") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 style={{ color: "var(--foreground)", marginTop: 0 }}>
        {selectedMahasiswa ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
      </h2>

      <div className="grid">
        <div className="form-group">
          <label htmlFor="nim">NIM</label>
          <input
            id="nim"
            value={form.nim}
            onChange={(e) => setForm({ ...form, nim: e.target.value })}
            placeholder="Contoh: 2201001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nama">Nama</label>
          <input
            id="nama"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama mahasiswa"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prodi_id">Program Studi</label>
          <select
            id="prodi_id"
            value={form.prodi_id}
            onChange={(e) => setForm({ ...form, prodi_id: e.target.value })}
            required
          >
            <option value="">-- Pilih Program Studi --</option>
            {prodis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="angkatan">Angkatan</label>
          <input
            id="angkatan"
            type="number"
            value={form.angkatan}
            onChange={(e) =>
              setForm({ ...form, angkatan: Number(e.target.value) })
            }
            required
          />
        </div>

        <div className="form-group" style={{ gridColumn: "span 2" }}>
          <label htmlFor="foto">Foto Profil (Opsional, Max 2MB)</label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ border: "none", padding: "4px 0" }}
          />
          {previewUrl && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ fontSize: "12px", margin: "0 0 5px 0", color: "#666" }}>Preview Foto:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="actions" style={{ marginTop: "20px" }}>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : selectedMahasiswa ? "Simpan Perubahan" : "Tambah Data"}
        </button>

        {selectedMahasiswa && (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
