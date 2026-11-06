/**
 * Utilitas Cache Sisi Klien untuk Halaman Admin JurnalCentral & Hallo Jurnal
 * Menerapkan pola Stale-While-Revalidate (SWR): render instan (0 milidetik) dari cache lokal,
 * lalu perbarui data di latar belakang tanpa ada kedipan angka 0 atau layar kosong.
 */

// Memory Cache RAM
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let memoryReportsCache: any[] | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let memoryArticlesCache: any[] | null = null

export const ADMIN_REPORTS_CACHE_KEY = 'halo_jurnal_admin_reports_cache'
export const ADMIN_ARTICLES_CACHE_KEY = 'jurnal_wave_articles_cache'
export const ADMIN_SIDEBAR_COUNTS_KEY = 'halo_jurnal_sidebar_counts'

/**
 * Mengambil cache laporan aduan secara sinkron untuk inisialisasi state instan (0ms).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedAdminReports(): any[] {
  if (memoryReportsCache && memoryReportsCache.length > 0) {
    return memoryReportsCache
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ADMIN_REPORTS_CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryReportsCache = parsed
          return parsed
        }
      }
    } catch {}
  }
  return []
}

/**
 * Menyimpan data laporan terbaru ke cache RAM dan localStorage.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setCachedAdminReports(reports: any[]): void {
  if (!Array.isArray(reports)) return
  memoryReportsCache = reports
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ADMIN_REPORTS_CACHE_KEY, JSON.stringify(reports))
    } catch {}
  }
}

/**
 * Mengambil cache artikel secara sinkron untuk inisialisasi state instan (0ms).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedAdminArticles(): any[] {
  if (memoryArticlesCache && memoryArticlesCache.length > 0) {
    return memoryArticlesCache
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ADMIN_ARTICLES_CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryArticlesCache = parsed
          return parsed
        }
      }
    } catch {}
  }
  return []
}

/**
 * Menyimpan data artikel terbaru ke cache RAM dan localStorage.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setCachedAdminArticles(articles: any[]): void {
  if (!Array.isArray(articles)) return
  memoryArticlesCache = articles
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ADMIN_ARTICLES_CACHE_KEY, JSON.stringify(articles))
    } catch {}
  }
}

/**
 * Mengambil cache ringkasan badge sidebar.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedSidebarCounts(): any | null {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ADMIN_SIDEBAR_COUNTS_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
  }
  return null
}

/**
 * Menyimpan cache ringkasan badge sidebar.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setCachedSidebarCounts(counts: any): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ADMIN_SIDEBAR_COUNTS_KEY, JSON.stringify(counts))
    } catch {}
  }
}

