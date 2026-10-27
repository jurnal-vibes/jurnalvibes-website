'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  ClipboardList,
  Inbox,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  ChevronDown,
  FileQuestion,
  PlusCircle,
  X,
  MapPin,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import {
  ALL_REPORT_CATEGORIES,
  normalizeCategoryName,
} from '@/data/haloJurnalCategories'

export default function HaloJurnalLaporanSayaPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allReports, setAllReports] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [displayedReports, setDisplayedReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori')
  const [sortOrder, setSortOrder] = useState('Terbaru')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_current_user')
        if (stored) {
          try {
            setUser(JSON.parse(stored))
            return
          } catch {}
        }
      }
      setUser(null)
    }
    checkUser()

    const handleSync = () => {
      fetchAllUserReports()
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('focus', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('focus', handleSync)
    }
  }, [])

  useEffect(() => {
    fetchAllUserReports()
  }, [user])

  useEffect(() => {
    filterAndSortReports()
  }, [allReports, statusFilter, categoryFilter, sortOrder, searchQuery])

  const fetchAllUserReports = async () => {
    setLoading(true)
    let localUserReports: any[] = []
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_user_reports')
        if (stored) {
          localUserReports = JSON.parse(stored)
        }
      }
    } catch {}

    // Ambil data user aktif saat ini
    let activeUser = user
    if (!activeUser && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('halo_jurnal_current_user')
        if (storedUser) activeUser = JSON.parse(storedUser)
      } catch {}
    }

    const currentUserId = activeUser?.id
    const currentUserEmail = (activeUser?.email || '').toLowerCase().trim()
    const currentUserPhone = (activeUser?.phone || activeUser?.phone_number || '').trim()

    // 1. Ambil laporan resmi dari API database Neon DB
    let dbReports: any[] = []
    try {
      const res = await fetch('/api/reports', { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        dbReports = json.data
      }
    } catch (err) {
      console.warn('Gagal memuat laporan database di Laporan Saya:', err)
    }

    // Gabungkan laporan dari database dan local storage
    const allCombined = [...localUserReports, ...dbReports]
    const uniqueMap = new Map<string, any>()
    allCombined.forEach((item) => {
      const key = item.ticketNumber || item.nomor_tiket || item.ticket_number || item.id
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, item)
      }
    })

    // Saring laporan milik akun yang sedang login
    let baseReports = Array.from(uniqueMap.values()).filter((r: any) => {
      if (!currentUserId && !currentUserEmail && !currentUserPhone) return false
      const reportUserId = r.user_id || r.userId
      const reportEmail = (r.email || r.user_email || r.pelaporEmail || r.pelapor_email || '').toLowerCase().trim()
      const reportPhone = (r.telepon || r.phone || r.pelaporPhone || r.citizenPhone || '').trim()

      if (currentUserId && reportUserId && String(reportUserId) === String(currentUserId)) return true
      if (currentUserEmail && reportEmail && reportEmail === currentUserEmail) return true
      if (currentUserPhone && reportPhone && reportPhone === currentUserPhone) return true
      return false
    })

    // Terapkan override dari admin secara realtime
    if (typeof window !== 'undefined') {
      try {
        const overrides = JSON.parse(
          localStorage.getItem('halo_jurnal_status_overrides') || '{}'
        )
        baseReports = baseReports.map((r: any) => {
          const saved =
            overrides[r.id] ||
            (r.nomor_tiket ? overrides[r.nomor_tiket] : null) ||
            (r.ticket_number ? overrides[r.ticket_number] : null) ||
            (r.ticketNumber ? overrides[r.ticketNumber] : null)
          if (saved) {
            return {
              ...r,
              status: saved.status || r.status,
              is_public:
                saved.is_public !== undefined ? saved.is_public : r.is_public,
              status_log: saved.status_log || r.status_log,
            }
          }
          return r
        })
      } catch {}
    }

    setAllReports(baseReports)
    setLoading(false)

  }

  const filterAndSortReports = () => {
    let list = [...allReports]

    // Filter Status
    if (statusFilter !== 'Semua Status' && statusFilter !== 'TOTAL') {
      const targetStatus = statusFilter.toLowerCase()
      list = list.filter((r) => r.status?.toLowerCase() === targetStatus)
    }

    // Filter Kategori
    if (categoryFilter !== 'Semua Kategori') {
      list = list.filter(
        (r) =>
          normalizeCategoryName(r.kategori).toLowerCase() ===
          categoryFilter.toLowerCase()
      )
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          (r.judul && r.judul.toLowerCase().includes(q)) ||
          (r.kategori && r.kategori.toLowerCase().includes(q)) ||
          (r.deskripsi && r.deskripsi.toLowerCase().includes(q)) ||
          (r.lokasi && r.lokasi.toLowerCase().includes(q)) ||
          (r.ticket_number && r.ticket_number.toLowerCase().includes(q)) ||
          (r.nomor_tiket && r.nomor_tiket.toLowerCase().includes(q)) ||
          (r.id && r.id.toLowerCase().includes(q))
      )
    }

    // Sort order
    list.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime()
      const timeB = new Date(b.created_at).getTime()
      return sortOrder === 'Terlama' ? timeA - timeB : timeB - timeA
    })

    setDisplayedReports(list)
  }

  // Count stats
  const totalCount = allReports.length
  const diterimaCount = allReports.filter((r) => r.status?.toLowerCase() === 'diterima').length
  const diprosesCount = allReports.filter((r) => r.status?.toLowerCase() === 'diproses').length
  const ditindaklanjutiCount = allReports.filter(
    (r) => r.status?.toLowerCase() === 'ditindaklanjuti'
  ).length
  const selesaiCount = allReports.filter((r) => r.status?.toLowerCase() === 'selesai').length

  const userCats = Array.from(
    new Set(allReports.map((r) => normalizeCategoryName(r.kategori)).filter(Boolean))
  )
  const categoryOptions = [
    'Semua Kategori',
    ...Array.from(new Set([...ALL_REPORT_CATEGORIES, ...userCats])),
  ]

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard?.writeText(id)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  const resetAllFilters = () => {
    setStatusFilter('Semua Status')
    setCategoryFilter('Semua Kategori')
    setSortOrder('Terbaru')
    setSearchQuery('')
  }

  const hasActiveFilters =
    statusFilter !== 'Semua Status' ||
    categoryFilter !== 'Semua Kategori' ||
    sortOrder !== 'Terbaru' ||
    searchQuery.trim().length > 0

  return (
    <div className="w-full max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-20">
      {/* 1. Header Halaman */}
      <div className="mb-5">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
          Laporan Saya
        </h1>
        <p className="text-secondary text-xs sm:text-sm mt-1">
          Pantau status dan tindak lanjut aduan yang Anda ajukan secara transparan.
        </p>
      </div>

      {!user && !loading ? (
        <div className="text-center py-14 bg-surface rounded-2xl border border-outline-variant/70 p-6 sm:p-10 shadow-2xs max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-bold text-lg text-on-surface mb-2">
            Masuk untuk Memantau Laporan Anda
          </h2>
          <p className="text-xs sm:text-sm text-secondary mb-6 leading-relaxed">
            Riwayat laporan bersifat privat dan terikat khusus dengan akun Anda agar aman dan tidak dapat diakses oleh pengguna lain.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?redirect=/halo-jurnal/laporan-saya"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              Masuk ke Akun
            </Link>
            <Link
              href="/daftar"
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs sm:text-sm font-semibold transition-all border border-outline-variant/60"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Stat Control Bar: 1 Hero Total Card di Atas + 4 Status Grid 2x2 di Bawah */}
          <div className="mb-6">
            {/* Card 1: Total Semua Laporan (Hero Overview Card) */}
            <button
              type="button"
              onClick={() => setStatusFilter('Semua Status')}
              className={`w-full p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer text-left mb-2.5 ${
                statusFilter === 'Semua Status'
                  ? 'bg-surface border-2 border-primary/40 ring-1 ring-primary/20 shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container border border-outline-variant/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    statusFilter === 'Semua Status'
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-surface-container-high text-secondary'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-bold text-xs sm:text-sm text-on-surface block leading-tight">
                    Total Semua Laporan
                  </span>
                  <span className="text-[11px] text-secondary mt-0.5 block">
                    Seluruh aduan dan aspirasi yang diajukan
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-heading font-black text-xl sm:text-2xl text-on-surface leading-none">
                  {totalCount}
                </span>
                {statusFilter === 'Semua Status' && (
                  <span className="hidden xs:inline-flex text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Semua
                  </span>
                )}
              </div>
            </button>

            {/* Grid 2x2: 4 Status Penanganan Aduan (Simetris & Pas) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {[
                {
                  key: 'Diterima',
                  label: 'Diterima',
                  count: diterimaCount,
                  icon: Inbox,
                },
                {
                  key: 'Diproses',
                  label: 'Diproses',
                  count: diprosesCount,
                  icon: Clock,
                },
                {
                  key: 'Ditindaklanjuti',
                  label: 'Ditindaklanjuti',
                  count: ditindaklanjutiCount,
                  icon: ShieldCheck,
                },
                {
                  key: 'Selesai',
                  label: 'Selesai',
                  count: selesaiCount,
                  icon: CheckCircle2,
                },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = statusFilter === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(isActive ? 'Semua Status' : tab.key)}
                    className={`py-2.5 px-3 sm:py-3 sm:px-3.5 rounded-2xl flex items-center justify-between gap-2 transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-surface border-2 border-primary/40 ring-1 ring-primary/20 shadow-xs text-on-surface'
                        : 'bg-surface-container-low hover:bg-surface-container border border-outline-variant/70 text-secondary hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-surface-container-high text-secondary'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-medium text-secondary truncate block">
                          {tab.label}
                        </span>
                        <span className="font-heading font-bold text-base sm:text-lg text-on-surface leading-none mt-0.5 block">
                          {tab.count}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

      {/* 3. Search & Filter Bar (After UX Style) */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-2.5 sm:p-3 mb-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul aduan, ID tiket, atau lokasi..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c00015]/20 focus:border-[#c00015] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Dropdown Kategori */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#c00015] cursor-pointer shadow-2xs"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Dropdown Sort */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#c00015] cursor-pointer shadow-2xs"
              >
                <option value="Terbaru">Terbaru</option>
                <option value="Terlama">Terlama</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#c00015] hover:bg-[#c00015]/10 rounded-xl border border-[#c00015]/20 transition-colors cursor-pointer shrink-0"
                title="Reset filter"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Daftar Laporan */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-28 h-5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="w-20 h-5 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="w-3/4 h-5 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
              <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : displayedReports.length > 0 ? (
        <div className="space-y-4">
          {displayedReports.map((report) => {
            const ticketId =
              report.nomor_tiket ||
              report.ticket_number ||
              `JS-${report.id.substring(0, 8)}`

            const imgUrl =
              report.laporan_lampiran &&
              report.laporan_lampiran.length > 0 &&
              report.laporan_lampiran[0].file_url
                ? report.laporan_lampiran[0].file_url
                : null

            const status = (report.status || 'diterima').toLowerCase()
            const isCopied = copiedId === ticketId
            const isInspirasi = (report.jenis || report.kategori || '').toLowerCase().includes('inspirasi')

            return (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group"
              >
                {/* Header: ID, Kategori, Tanggal, Status Pill (Subtle After UX style) */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {/* Ticket ID */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(ticketId, e)}
                      className="inline-flex items-center gap-1 font-mono font-medium hover:text-[#c00015] dark:hover:text-[#ff6b6b] transition-colors cursor-pointer"
                      title="Salin nomor tiket"
                    >
                      <span>#{ticketId}</span>
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    <span className="text-slate-300 dark:text-slate-600">•</span>

                    {/* Kategori */}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {normalizeCategoryName(report.kategori)}
                    </span>

                    <span className="text-slate-300 dark:text-slate-600">•</span>

                    {/* Tanggal */}
                    <span className="text-slate-400 dark:text-slate-500">
                      {formatDate(report.created_at)}
                    </span>
                  </div>

                  {/* Status Tag (Linear / Apple Monochromatic Minimalist) */}
                  <div>
                    {status === 'selesai' && (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide ${
                        isInspirasi
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
                      }`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 stroke-[2.2px] ${isInspirasi ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span>{isInspirasi ? 'Disetujui & Tayang' : 'Selesai'}</span>
                      </span>
                    )}
                    {status === 'ditindaklanjuti' && (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide ${
                        isInspirasi
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
                      }`}>
                        {isInspirasi ? (
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[2.2px]" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.2px]" />
                        )}
                        <span>{isInspirasi ? '🌟 Liputan Berita' : 'Ditindaklanjuti'}</span>
                      </span>
                    )}
                    {status === 'diproses' && (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide ${
                        isInspirasi
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
                      }`}>
                        <Clock className={`w-3.5 h-3.5 stroke-[2.2px] ${isInspirasi ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span>{isInspirasi ? 'Sedang Dikurasi' : 'Diproses'}</span>
                      </span>
                    )}
                    {status === 'diterima' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold tracking-wide">
                        <Inbox className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[2.2px]" />
                        <span>{isInspirasi ? 'Menunggu Kurasi' : 'Diterima'}</span>
                      </span>
                    )}
                    {status === 'ditolak' && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold tracking-wide">
                        <X className="w-3.5 h-3.5 text-rose-500 stroke-[2.2px]" />
                        <span>{isInspirasi ? 'Tidak Lolos' : 'Ditolak'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content: Title, Description, Location + Photo */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/halo-jurnal/laporan/${report.id}`}
                      className="block group/title"
                    >
                      <h2 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100 group-hover/title:text-[#c00015] dark:group-hover/title:text-[#ff6b6b] transition-colors leading-snug mb-1.5 tracking-tight">
                        {report.judul}
                      </h2>
                    </Link>

                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3">
                      {report.deskripsi}
                    </p>

                    {report.lokasi && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{report.lokasi}</span>
                      </div>
                    )}
                  </div>

                  {imgUrl && (
                    <Link
                      href={`/halo-jurnal/laporan/${report.id}`}
                      className="shrink-0 w-full sm:w-36 h-36 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-800 block shadow-2xs"
                      title="Lihat lampiran"
                    >
                      <img
                        src={imgUrl}
                        alt={report.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  )}
                </div>

                {/* Footer: Chat Admin & Detail Link */}
                <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <Link
                    href={`/halo-jurnal/laporan/${report.id}#chat`}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#c00015] dark:text-slate-400 dark:hover:text-[#ff6b6b] font-medium transition-colors group/chat shrink-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover/chat:bg-[#c00015]/10 group-hover/chat:text-[#c00015] transition-colors shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <span className="hidden sm:inline">Ruang Koordinasi Redaksi</span>
                      <span className="sm:hidden">Chat Redaksi</span>
                    </span>
                    {report.chat_messages && report.chat_messages[0]?.count > 0 && (
                      <span className="px-1.5 py-0.5 bg-[#c00015]/10 text-[#c00015] rounded-full text-[10px] font-bold">
                        {report.chat_messages[0].count}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={`/halo-jurnal/laporan/${report.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-[#c00015] dark:text-slate-300 dark:hover:text-white transition-colors group/cta shrink-0"
                  >
                    <span>
                      <span className="hidden sm:inline">Lihat Detail</span>
                      <span className="sm:hidden">Detail</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-14 bg-surface rounded-xl border border-outline-variant/70 p-6 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center mx-auto mb-3">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-base text-on-surface mb-1">
            Tidak ada laporan yang sesuai
          </h3>
          <p className="text-xs text-secondary mb-4 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Silakan sesuaikan kata kunci pencarian atau bersihkan filter yang aktif.'
              : 'Anda belum memiliki riwayat pengaduan atau aspirasi.'}
          </p>

          <div>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
              >
                Reset Filter
              </button>
            ) : (
              <Link
                href="/halo-jurnal/lapor"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buat Laporan Baru</span>
              </Link>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
