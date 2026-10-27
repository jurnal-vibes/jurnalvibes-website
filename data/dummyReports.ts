export interface DummyReport {
  id: string
  nomor_tiket: string
  judul: string
  deskripsi: string
  jenis: 'pengaduan' | 'aspirasi' | 'informasi' | 'inspirasi'
  kategori: string
  lokasi: string
  latitude: number
  longitude: number
  status: 'diterima' | 'diproses' | 'ditindaklanjuti' | 'selesai' | 'ditolak'
  is_public: boolean
  dukungan_count: number
  komentar_count: number
  created_at: string
  laporan_lampiran: {
    id: string
    file_url: string
    file_type?: string
  }[]
  status_log?: {
    id: string
    status: string
    catatan: string
    created_at: string
  }[]
}

export const DUMMY_REPORTS: DummyReport[] = [];
