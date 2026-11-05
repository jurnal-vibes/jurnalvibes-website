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
  aspirasi: [],
  informasi: [],
  inspirasi: [],
}

// Seluruh daftar kategori unik yang selaras di semua halaman Hallo Jurnal
export const ALL_REPORT_CATEGORIES: string[] = [
  'Infrastruktur',
  'Pelayanan Publik',
  'Kebersihan Lingkungan',
  'Keamanan & Ketertiban',
  'Kesehatan',
  'Lainnya',
]

/**
 * Mendapatkan daftar kategori yang selaras berdasarkan jenis laporan yang dipilih.
 */
export function getCategoriesForJenis(_jenis?: string | null): string[] {
  return ALL_REPORT_CATEGORIES
}

/**
 * Normalisasi nama kategori (misal: 'keamanan' -> 'Keamanan & Ketertiban')
 */
export function normalizeCategoryName(rawCategory?: string | null): string {
  if (!rawCategory) return 'Pengaduan Warga'
  const trimmed = rawCategory.trim()
  const lower = trimmed.toLowerCase()

  const match = ALL_REPORT_CATEGORIES.find((cat) => cat.toLowerCase() === lower)
  if (match) return match

  // Alias kompatibilitas jika ada data lama
  if (lower === 'keamanan') return 'Keamanan & Ketertiban'
  if (lower === 'kebersihan') return 'Kebersihan Lingkungan'
  if (lower === 'pembangunan') return 'Infrastruktur'
  if (lower === 'pengaduan' || lower === 'pengaduan warga') return 'Pengaduan Warga'

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

/**
 * Mendapatkan jenis laporan ('pengaduan') berdasarkan nama kategori.
 */
export function getJenisForCategory(_category?: string | null): ReportType {
  return 'pengaduan'
}
