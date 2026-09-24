'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Search,
  Filter,
  ThumbsUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  X,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { DUMMY_REPORTS } from '@/data/dummyReports'

function getRelativeTime(dateString: string) {
  if (!dateString) return 'Baru saja'
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = Math.max(0, now.getTime() - date.getTime())
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInDays > 0) {
    return `${diffInDays} hari yang lalu`
  }
  if (diffInHours > 0) {
    return `${diffInHours} jam yang lalu`
  }
  return 'Baru saja'
}

const ITEMS_PER_PAGE = 5

function FeedPublikContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const feedTopRef = useRef<HTMLDivElement>(null)

  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [likedReports, setLikedReports] = useState<Set<string>>(new Set())
  const [likingReports, setLikingReports] = useState<Set<string>>(new Set())

  // Paginasi
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Filters state dari Sidebar Filter Laporan
  const [selectedJenis, setSelectedJenis] = useState<string>('Semua Jenis')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua Laporan')
  const [selectedWilayah, setSelectedWilayah] = useState<string>('Semua Wilayah Sukabumi')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const categories = [
    'Infrastruktur',
    'Pelayanan Publik',
    'Kesehatan',
    'Keamanan',
    'Kebersihan Lingkungan',
    'Keamanan & Ketertiban',
  ]

  const statusOptions = ['Semua Laporan', 'Diterima', 'Diproses', 'Selesai']
  const jenisOptions = ['Semua Jenis', 'Pengaduan', 'Aspirasi', 'Informasi', 'Inspirasi']
  const wilayahOptions = [
    'Semua Wilayah Sukabumi',
    'Kec. Cikole',
    'Kec. Citamiang',
    'Kec. Warudoyong',
    'Kec. Baros',
    'Kec. Lembursitu',
    'Kec. Gunungpuyuh',
    'Kec. Cibeureum',
    'Kab. Sukabumi',
  ]

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    fetchReports()
  }, [selectedCategories, selectedStatus, selectedJenis, selectedWilayah, searchQuery])

  useEffect(() => {
    if (user && reports.length > 0) {
      fetchUserLikes()
    }
  }, [user, reports])

  const fetchUserLikes = async () => {
    if (!user) return
    const reportIds = reports.map((r) => r.id)
    const { data } = await supabase
      .from('dukungan')
      .select('laporan_id')
      .eq('user_id', user.id)
      .in('laporan_id', reportIds)

    if (data) {
      setLikedReports(new Set(data.map((d: { laporan_id: string }) => d.laporan_id)))
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    let query = supabase
      .from('laporan')
      .select('*, laporan_lampiran(file_url), chat_messages(count)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (selectedCategories.length > 0) {
      query = query.in('kategori', selectedCategories)
    }

    if (selectedStatus && selectedStatus !== 'Semua Laporan') {
      const statusMap: Record<string, string> = {
        Diterima: 'diterima',
        Diproses: 'diproses',
        Selesai: 'selesai',
      }
      if (statusMap[selectedStatus]) {
        query = query.eq('status', statusMap[selectedStatus])
      }
    }

    if (selectedJenis && selectedJenis !== 'Semua Jenis') {
      query = query.eq('jenis', selectedJenis.toLowerCase())
    }

    if (selectedWilayah && selectedWilayah !== 'Semua Wilayah Sukabumi') {
      const cleanWilayah = selectedWilayah.replace(/^Kec\.\s*|^Kab\.\s*/i, '').trim().toLowerCase()
      query = query.ilike('lokasi', `%${cleanWilayah}%`)
    }

    if (searchQuery.trim()) {
      query = query.or(`judul.ilike.%${searchQuery}%,deskripsi.ilike.%${searchQuery}%,lokasi.ilike.%${searchQuery}%`)
    }

    try {
      const { data, error } = await query
      if (!error && data && data.length > 0) {
        setReports(data)
      } else {
        // Fallback ke DUMMY_REPORTS dengan filter client-side
        let filtered = [...DUMMY_REPORTS]
        if (selectedCategories.length > 0) {
          filtered = filtered.filter((r) => selectedCategories.includes(r.kategori))
        }
        if (selectedStatus && selectedStatus !== 'Semua Laporan') {
          const statusMap: Record<string, string> = {
            Diterima: 'diterima',
            Diproses: 'diproses',
            Selesai: 'selesai',
          }
          if (statusMap[selectedStatus]) {
            filtered = filtered.filter((r) => r.status === statusMap[selectedStatus])
          }
        }
        if (selectedJenis && selectedJenis !== 'Semua Jenis') {
          filtered = filtered.filter((r) => r.jenis.toLowerCase() === selectedJenis.toLowerCase())
        }
        if (selectedWilayah && selectedWilayah !== 'Semua Wilayah Sukabumi') {
          const cleanWilayah = selectedWilayah.replace(/^Kec\.\s*|^Kab\.\s*/i, '').trim().toLowerCase()
          filtered = filtered.filter((r) => r.lokasi?.toLowerCase().includes(cleanWilayah))
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (r) =>
              r.judul.toLowerCase().includes(q) ||
              r.deskripsi.toLowerCase().includes(q) ||
              r.lokasi.toLowerCase().includes(q)
          )
        }
        setReports(filtered)
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
      setReports(DUMMY_REPORTS)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (reportId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      alert('Silakan login terlebih dahulu untuk memberikan dukungan pada laporan ini.')
      return
    }

    if (likingReports.has(reportId)) return

    setLikingReports((prev) => new Set(prev).add(reportId))
    const isCurrentlyLiked = likedReports.has(reportId)

    // Optimistic UI update
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const currentCount = r.dukungan_count || 0
          return {
            ...r,
            dukungan_count: isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
          }
        }
        return r
      })
    )

    setLikedReports((prev) => {
      const next = new Set(prev)
      if (isCurrentlyLiked) {
        next.delete(reportId)
      } else {
        next.add(reportId)
      }
      return next
    })

    try {
      if (isCurrentlyLiked) {
        await supabase.from('dukungan').delete().eq('laporan_id', reportId).eq('user_id', user.id)
      } else {
        await supabase.from('dukungan').insert({ laporan_id: reportId, user_id: user.id })
      }
    } catch (err) {
      console.error('Error toggling support:', err)
      fetchReports()
    } finally {
      setLikingReports((prev) => {
        const next = new Set(prev)
        next.delete(reportId)
        return next
      })
    }
  }

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat))
    } else {
      setSelectedCategories([...selectedCategories, cat])
    }
  }

  const resetAllFilters = () => {
    setSelectedJenis('Semua Jenis')
    setSelectedCategories([])
    setSelectedStatus('Semua Laporan')
    setSelectedWilayah('Semua Wilayah Sukabumi')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    selectedJenis !== 'Semua Jenis' ||
    selectedCategories.length > 0 ||
    selectedStatus !== 'Semua Laporan' ||
    selectedWilayah !== 'Semua Wilayah Sukabumi' ||
    searchQuery.trim().length > 0

  // Perhitungan Paginasi
  const totalReports = reports.length
  const totalPages = Math.ceil(totalReports / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentReports = reports.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setCurrentPage(page)
    feedTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="w-full max-w-container-max mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/60">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-outline-variant text-xs font-bold text-primary shadow-2xs cursor-pointer"
        >
          <Filter className="w-4 h-4" />
          <span>Filter Laporan {hasActiveFilters && '(Aktif)'}</span>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-8 relative">
        {/* ===================== SIDEBAR KIRI: FILTER LAPORAN (STICKY) ===================== */}
        <aside
          className={`w-full md:w-64 lg:w-72 shrink-0 md:border-r border-outline-variant/60 md:pr-6 self-stretch ${
            mobileFilterOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto [scrollbar-width:thin] pr-1 pb-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-xl text-primary tracking-tight">
                Filter Laporan
              </h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {/* 1. JENIS LAPORAN */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary mb-3">
                JENIS LAPORAN
              </span>
              <div className="space-y-2.5">
                {jenisOptions.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer select-none group"
                  >
                    <input
                      type="radio"
                      name="sidebar-jenis-laporan"
                      checked={selectedJenis === item}
                      onChange={() => setSelectedJenis(item)}
                      className="w-4 h-4 accent-primary text-primary cursor-pointer"
                    />
                    <span
                      className={`transition-colors ${
                        selectedJenis === item
                          ? 'font-bold text-on-surface'
                          : 'text-secondary group-hover:text-on-surface'
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. KATEGORI */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary mb-3">
                KATEGORI
              </span>
              <div className="space-y-2.5">
                {categories.map((cat) => {
                  const checked = selectedCategories.includes(cat)
                  return (
                    <label
                      key={cat}
                      className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer select-none group"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 rounded accent-primary text-primary cursor-pointer"
                      />
                      <span
                        className={`transition-colors ${
                          checked
                            ? 'font-bold text-on-surface'
                            : 'text-secondary group-hover:text-on-surface'
                        }`}
                      >
                        {cat}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* 3. STATUS */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary mb-3">
                STATUS
              </span>
              <div className="space-y-2.5">
                {statusOptions.map((st) => (
                  <label
                    key={st}
                    className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer select-none group"
                  >
                    <input
                      type="radio"
                      name="sidebar-status-laporan"
                      checked={selectedStatus === st}
                      onChange={() => setSelectedStatus(st)}
                      className="w-4 h-4 accent-primary text-primary cursor-pointer"
                    />
                    <span
                      className={`transition-colors ${
                        selectedStatus === st
                          ? 'font-bold text-on-surface'
                          : 'text-secondary group-hover:text-on-surface'
                      }`}
                    >
                      {st}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. WILAYAH */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary mb-3">
                WILAYAH
              </span>
              <div className="relative">
                <select
                  value={selectedWilayah}
                  onChange={(e) => setSelectedWilayah(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-8 text-xs bg-surface border border-outline-variant/80 rounded-xl text-on-surface font-semibold focus:outline-none focus:border-primary shadow-2xs cursor-pointer"
                >
                  {wilayahOptions.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </aside>

        {/* ===================== KONTEN UTAMA ===================== */}
        <main ref={feedTopRef} className="flex-1 min-w-0 w-full scroll-mt-24">
          {/* Top Header: Judul & Deskripsi */}
          <div className="mb-6">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
              Transparansi Aspirasi Sukabumi
            </h1>
            <p className="text-secondary text-xs sm:text-sm mt-1">
              Daftar laporan warga yang dibuka secara transparan untuk pengawasan bersama.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, kata kunci, atau nama jalan..."
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-surface border border-outline-variant/80 rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary shadow-2xs transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Reports List: Kartu Panjang Membentang */}
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 text-secondary">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs">Memuat laporan publik...</p>
            </div>
          ) : reports.length > 0 ? (
            <>
              <div className="space-y-4">
                {currentReports.map((report) => {
                  const isLiked = likedReports.has(report.id)
                  const imgUrl =
                    report.laporan_lampiran &&
                    report.laporan_lampiran.length > 0 &&
                    report.laporan_lampiran[0].file_url
                      ? report.laporan_lampiran[0].file_url
                      : null

                  return (
                    <div
                      key={report.id}
                      className="bg-surface border border-outline-variant/80 hover:border-primary/50 rounded-2xl p-4 sm:p-6 shadow-2xs transition-all duration-200"
                    >
                      {/* Header Card: Pelapor Terenkripsi & Waktu / Alamat */}
                      <div className="flex items-start gap-3 mb-3.5">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block font-bold text-xs sm:text-sm text-on-surface leading-tight">
                            Pelapor Terenkripsi
                          </span>
                          <span className="block text-[11px] text-secondary mt-0.5 leading-snug line-clamp-1">
                            {getRelativeTime(report.created_at)} &bull; {report.lokasi || 'Sukabumi, Jawa Barat'}
                          </span>
                        </div>
                      </div>

                      {/* Badges Row: Jenis Laporan & Status */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {/* Jenis Badge */}
                        {report.jenis === 'informasi' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[10px] sm:text-[11px] font-bold border border-purple-200/60">
                            <FileText className="w-3 h-3" />
                            <span>Informasi</span>
                          </span>
                        )}
                        {report.jenis === 'pengaduan' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] sm:text-[11px] font-bold border border-rose-200/60">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Pengaduan</span>
                          </span>
                        )}
                        {report.jenis === 'aspirasi' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] sm:text-[11px] font-bold border border-amber-200/60">
                            <Lightbulb className="w-3 h-3" />
                            <span>Aspirasi</span>
                          </span>
                        )}
                        {report.jenis === 'inspirasi' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 text-[10px] sm:text-[11px] font-bold border border-cyan-200/60">
                            <Sparkles className="w-3 h-3" />
                            <span>Inspirasi</span>
                          </span>
                        )}

                        {/* Status Badge */}
                        {report.status === 'selesai' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selesai</span>
                          </span>
                        )}
                        {report.status === 'diproses' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] sm:text-[11px] font-bold border border-amber-200/60">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Diproses</span>
                          </span>
                        )}
                        {report.status === 'diterima' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] sm:text-[11px] font-bold border border-blue-200/60">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Diterima</span>
                          </span>
                        )}
                        {report.status === 'ditindaklanjuti' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[10px] sm:text-[11px] font-bold border border-purple-200/60">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Ditindaklanjuti</span>
                          </span>
                        )}
                      </div>

                      {/* Content Section: Title & Description di kiri, Image di kanan */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link href={`/halo-jurnal/laporan/${report.id}`}>
                            <h3 className="font-heading font-bold text-base sm:text-lg text-primary hover:underline transition-colors leading-snug mb-1.5">
                              {report.judul}
                            </h3>
                          </Link>
                          <p className="text-secondary text-xs sm:text-sm line-clamp-3 leading-relaxed">
                            {report.deskripsi}
                          </p>
                        </div>

                        {imgUrl && (
                          <Link
                            href={`/halo-jurnal/laporan/${report.id}`}
                            className="shrink-0 w-full sm:w-44 md:w-56 h-24 sm:h-28 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/60 relative group block"
                          >
                            <img
                              src={imgUrl}
                              alt={report.judul}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        )}
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="pt-3.5 mt-4 border-t border-outline-variant/60 flex items-center justify-between gap-3 text-xs">
                        <button
                          type="button"
                          onClick={(e) => handleLike(report.id, e)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                            isLiked
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-surface border-outline-variant/80 hover:border-primary/50 text-on-surface hover:text-primary'
                          }`}
                          title={isLiked ? 'Batal dukung' : 'Beri dukungan warga'}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                          <span>Dukung ({report.dukungan_count || 0})</span>
                        </button>

                        <Link
                          href={`/halo-jurnal/laporan/${report.id}`}
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline group"
                        >
                          <span>Lihat Detail &amp; Chat Admin</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Kontrol Paginasi Angka Klasik */}
              {totalPages > 1 && (
                <div className="pt-6 pb-2 flex items-center justify-center border-t border-outline-variant/60 mt-6">
                  <div className="flex items-center gap-1.5">
                    {/* Tombol Sebelumnya */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-outline-variant/80 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 text-on-surface hover:text-primary cursor-pointer active:scale-95 bg-surface shadow-2xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    {/* Nomor Halaman */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        const isActive = page === currentPage
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-2xs ${
                              isActive
                                ? 'bg-primary text-white border border-primary shadow-xs'
                                : 'bg-surface border border-outline-variant/80 text-on-surface hover:border-primary hover:text-primary'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      }

                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-1 text-xs text-secondary">
                            ...
                          </span>
                        )
                      }

                      return null
                    })}

                    {/* Tombol Selanjutnya */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-outline-variant/80 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 text-on-surface hover:text-primary cursor-pointer active:scale-95 bg-surface shadow-2xs"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/60">
              <p className="text-sm font-semibold text-on-surface mb-1">
                Tidak ada laporan publik yang cocok
              </p>
              <p className="text-xs text-secondary mb-4">
                Coba ubah kata kunci pencarian atau sesuaikan pilihan filter di sebelah kiri.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function HaloJurnalFeedPublikPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <FeedPublikContent />
    </Suspense>
  )
}
