export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Set base URL for static uploads (photos)
export const UPLOADS_URL =
  API_URL.replace("/api", "/uploads/mahasiswa");

export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi_id: number | null;
  nama_prodi?: string;
  angkatan: number;
  foto: string | null;
  created_at?: string;
};

export type Prodi = {
  id: number;
  nama: string;
};

export type Produk = {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  created_at?: string;
};

export type ProdukInput = {
  nama: string;
  harga: number;
  stok: number;
};

type ApiResponse<T> = {
  message: string;
  data?: T;
};

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Terjadi kesalahan saat mengakses API");
  }

  return result;
}

// Student Pagination Response
export type MahasiswaListResponse = {
  data: Mahasiswa[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
};

export async function getMahasiswa(params?: {
  search?: string;
  prodi_id?: string | number;
  page?: number;
  limit?: number;
}): Promise<MahasiswaListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.prodi_id) queryParams.append("prodi_id", String(params.prodi_id));
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));

  const queryString = queryParams.toString();
  const url = `${API_URL}/mahasiswa${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Terjadi kesalahan saat mengakses API");
  }

  return {
    data: result.data || [],
    pagination: result.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 }
  };
}

export async function createMahasiswa(
  payload: FormData
): Promise<Mahasiswa> {
  const response = await fetch(`${API_URL}/mahasiswa`, {
    method: "POST",
    body: payload, // Multer/FormData automatically boundary
  });

  const result = await handleResponse<Mahasiswa>(response);
  return result.data as Mahasiswa;
}

export async function updateMahasiswa(
  id: number,
  payload: FormData
): Promise<void> {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "PUT",
    body: payload, // Multer/FormData automatically boundary
  });

  await handleResponse(response);
}

export async function deleteMahasiswa(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "DELETE",
  });

  await handleResponse(response);
}

// Prodi Helpers
export async function getProdi(): Promise<Prodi[]> {
  const response = await fetch(`${API_URL}/prodi`, {
    cache: "no-store",
  });
  const result = await handleResponse<Prodi[]>(response);
  return result.data || [];
}

// Produk Helpers
export async function getProduk(): Promise<Produk[]> {
  const response = await fetch(`${API_URL}/produk`, {
    cache: "no-store",
  });
  const result = await handleResponse<Produk[]>(response);
  return result.data || [];
}

export async function createProduk(payload: ProdukInput): Promise<Produk> {
  const response = await fetch(`${API_URL}/produk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await handleResponse<Produk>(response);
  return result.data as Produk;
}

export async function updateProduk(
  id: number,
  payload: ProdukInput
): Promise<void> {
  const response = await fetch(`${API_URL}/produk/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  await handleResponse(response);
}

export async function deleteProduk(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/produk/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response);
}
