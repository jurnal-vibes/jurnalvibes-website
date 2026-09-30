export type ReportType = 'pengaduan' | 'aspirasi' | 'informasi' | 'inspirasi'

export const REPORT_CATEGORIES_BY_TYPE: Record<ReportType, string[]> = {
  pengaduan: [
    'Infrastruktur',
    'Kebersihan Lingkungan',
    'Keamanan & Ketertiban',
    'Pelayanan Publik',
    'Kesehatan',
    'Lainnya',
  ],
  aspirasi: [
    'Pembangunan Daerah',
    'Program Kemasyarakatan',
    'Inovasi Pelayanan',
    'Fasilitas Umum',
    'Lainnya',
  ],
  informasi: [
    'Kebijakan',
    'Data Statistik',
    'Anggaran',
    'Laporan Kegiatan',
    'Lainnya',
  ],
  inspirasi: [
    'Gotong Royong',
    'Prestasi Warga',
    'UMKM & Ekonomi Lokal',
    'Komunitas & Kegiatan Sosial',
    'Lainnya',
  ],
}

// Seluruh daftar kategori unik yang selaras di semua halaman Halo Jurnal
export const ALL_REPORT_CATEGORIES: string[] = [
  // Pengaduan
  'Infrastruktur',
  'Kebersihan Lingkungan',
  'Keamanan & Ketertiban',
  'Pelayanan Publik',
  'Kesehatan',
  // Aspirasi
  'Pembangunan Daerah',
  'Program Kemasyarakatan',
  'Inovasi Pelayanan',
  'Fasilitas Umum',
  // Informasi
  'Kebijakan',
  'Data Statistik',
  'Anggaran',
  'Laporan Kegiatan',
  // Inspirasi
  'Gotong Royong',
  'Prestasi Warga',
  'UMKM & Ekonomi Lokal',
  'Komunitas & Kegiatan Sosial',
  // Umum
  'Lainnya',
]

/**
 * Mendapatkan daftar kategori yang selaras berdasarkan jenis laporan yang dipilih.
 * Jika 'Semua Jenis' atau tidak ditentukan, mengembalikan seluruh kategori.
 */
export function getCategoriesForJenis(jenis?: string | null): string[] {
  if (!jenis || jenis === 'Semua Jenis') {
    return ALL_REPORT_CATEGORIES
  }

  const key = jenis.toLowerCase().trim() as ReportType
  if (REPORT_CATEGORIES_BY_TYPE[key]) {
    return REPORT_CATEGORIES_BY_TYPE[key]
  }

  return ALL_REPORT_CATEGORIES
}

/**
 * Normalisasi nama kategori (misal: 'ANGGARAN' -> 'Anggaran', 'keamanan' -> 'Keamanan & Ketertiban')
 */
export function normalizeCategoryName(rawCategory?: string | null): string {
  if (!rawCategory) return 'Lainnya'
  const trimmed = rawCategory.trim()
  const lower = trimmed.toLowerCase()

  const match = ALL_REPORT_CATEGORIES.find((cat) => cat.toLowerCase() === lower)
  if (match) return match

  // Alias kompatibilitas jika ada data lama
  if (lower === 'keamanan') return 'Keamanan & Ketertiban'
  if (lower === 'kebersihan') return 'Kebersihan Lingkungan'
  if (lower === 'pembangunan') return 'Pembangunan Daerah'

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}
