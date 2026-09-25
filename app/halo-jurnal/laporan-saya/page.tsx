'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
} from 'lucide-react'
import { DUMMY_REPORTS } from '@/data/dummyReports'

export default function HaloJurnalLaporanSayaPage() {
  const supabase = createClient()
  const [allReports, setAllReports] = useState<any[]>([])
  const [displayedReports, setDisplayedReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori')
  const [sortOrder, setSortOrder] = useState('Terbaru')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      } else {
        setUser({ id: 'demo-user-id', user_metadata: { full_name: 'Warga Sukabumi' } })
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchAllUserReports()
    }
  }, [user])

  useEffect(() => {
    filterAndSortReports()
  }, [allReports, statusFilter, categoryFilter, sortOrder, searchQuery])

  const fetchAllUserReports = async () => {
    setLoading(true)
    let supabaseData: any[] | null = null

    try {
      let query = supabase
        .from('laporan')
        .select('*, laporan_lampiran(file_url), chat_messages(count)')
        .order('created_at', { ascending: false })

      if (user && user.id !== 'demo-user-id') {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query
      if (!error && data && data.length > 0) {
        supabaseData = data
      }
    } catch {
      // Fallback silent
    }

    if (supabaseData && supabaseData.length > 0) {
      setAllReports(supabaseData)
    } else {
      let localUserReports: any[] = []
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('halo_jurnal_user_reports')
          if (stored) {
            localUserReports = JSON.parse(stored)
          }
        }
      } catch {}

      const baseReports =
        localUserReports.length > 0
          ? localUserReports
          : DUMMY_REPORTS.slice(0, 4)

      setAllReports(baseReports)
    }

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
        (r) => (r.kategori || '').toLowerCase() === categoryFilter.toLowerCase()
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

  const categoryOptions = [
    'Semua Kategori',
    ...Array.from(new Set(allReports.map((r) => r.kategori).filter(Boolean))),
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Laporan Saya
          </h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Pantau status dan tindak lanjut aduan yang Anda ajukan secara transparan.
          </p>
        </div>

        <Link
          href="/halo-jurnal/lapor"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-2xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Laporan</span>
        </Link>
      </div>

      {/* 2. Stat Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {/* TOTAL */}
        <button
          type="button"
          onClick={() => setStatusFilter('Semua Status')}
          className={`p-4 rounded-xl flex flex-col justify-between transition-all cursor-pointer text-left border ${
            statusFilter === 'Semua Status' || statusFilter === 'TOTAL'
              ? 'bg-surface border-primary ring-1 ring-primary/30 shadow-2xs'
              : 'bg-surface hover:bg-surface-container-low border-outline-variant/70'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-heading font-bold text-2xl text-on-surface leading-none block mb-1">
              {totalCount}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
              Total Laporan
            </span>
          </div>
        </button>

        {/* DITERIMA */}
        <button
          type="button"
          onClick={() => setStatusFilter('Diterima')}
          className={`p-4 rounded-xl flex flex-col justify-between transition-all cursor-pointer text-left border ${
            statusFilter === 'Diterima'
              ? 'bg-surface border-blue-500 ring-1 ring-blue-500/30 shadow-2xs'
              : 'bg-surface hover:bg-surface-container-low border-outline-variant/70'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-heading font-bold text-2xl text-on-surface leading-none block mb-1">
              {diterimaCount}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
              Diterima
            </span>
          </div>
        </button>

        {/* DIPROSES */}
        <button
          type="button"
          onClick={() => setStatusFilter('Diproses')}
          className={`p-4 rounded-xl flex flex-col justify-between transition-all cursor-pointer text-left border ${
            statusFilter === 'Diproses'
              ? 'bg-surface border-amber-500 ring-1 ring-amber-500/30 shadow-2xs'
              : 'bg-surface hover:bg-surface-container-low border-outline-variant/70'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-heading font-bold text-2xl text-on-surface leading-none block mb-1">
              {diprosesCount}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
              Diproses
            </span>
          </div>
        </button>

        {/* DITINDAKLANJUTI */}
        <button
          type="button"
          onClick={() => setStatusFilter('Ditindaklanjuti')}
          className={`p-4 rounded-xl flex flex-col justify-between transition-all cursor-pointer text-left border ${
            statusFilter === 'Ditindaklanjuti'
              ? 'bg-surface border-purple-500 ring-1 ring-purple-500/30 shadow-2xs'
              : 'bg-surface hover:bg-surface-container-low border-outline-variant/70'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-heading font-bold text-2xl text-on-surface leading-none block mb-1">
              {ditindaklanjutiCount}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
              Ditindaklanjuti
            </span>
          </div>
        </button>

        {/* SELESAI */}
        <button
          type="button"
          onClick={() => setStatusFilter('Selesai')}
          className={`p-4 rounded-xl flex flex-col justify-between transition-all cursor-pointer text-left border col-span-2 sm:col-span-1 ${
            statusFilter === 'Selesai'
              ? 'bg-surface border-emerald-500 ring-1 ring-emerald-500/30 shadow-2xs'
              : 'bg-surface hover:bg-surface-container-low border-outline-variant/70'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-heading font-bold text-2xl text-on-surface leading-none block mb-1">
              {selesaiCount}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
              Selesai
            </span>
          </div>
        </button>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-surface border border-outline-variant/70 rounded-xl p-3 mb-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul aduan, ID tiket, atau lokasi..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
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

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Dropdown Kategori */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 text-xs font-medium bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Dropdown Sort */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 text-xs font-medium bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Terbaru">Terbaru</option>
                <option value="Terlama">Terlama</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded-lg border border-rose-500/30 transition-colors cursor-pointer shrink-0"
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
              className="bg-surface border border-outline-variant/60 rounded-xl p-5 shadow-2xs animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-28 h-5 bg-surface-container-high rounded" />
                <div className="w-20 h-5 bg-surface-container-high rounded" />
              </div>
              <div className="w-3/4 h-5 bg-surface-container-high rounded mb-2" />
              <div className="w-full h-4 bg-surface-container-high rounded" />
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

            return (
              <div
                key={report.id}
                className="bg-surface border border-outline-variant/70 hover:border-outline-variant rounded-xl p-4 sm:p-5 shadow-2xs transition-all group"
              >
                {/* Header: ID, Kategori, Tanggal, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Ticket ID */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(ticketId, e)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 text-[11px] font-mono font-medium text-secondary hover:text-on-surface transition-colors cursor-pointer"
                      title="Salin nomor tiket"
                    >
                      <span>ID: {ticketId}</span>
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-secondary/70" />
                      )}
                    </button>

                    {/* Kategori */}
                    <span className="inline-block px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-[11px] font-medium">
                      {report.kategori || 'Umum'}
                    </span>

                    {/* Tanggal */}
                    <span className="text-[11px] text-secondary">
                      {formatDate(report.created_at)}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {status === 'selesai' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium border border-emerald-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai</span>
                      </span>
                    )}
                    {status === 'ditindaklanjuti' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-xs font-medium border border-purple-200/60">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Ditindaklanjuti</span>
                      </span>
                    )}
                    {status === 'diproses' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-medium border border-amber-200/60">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Diproses</span>
                      </span>
                    )}
                    {status === 'diterima' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium border border-blue-200/60">
                        <Inbox className="w-3.5 h-3.5 text-blue-600" />
                        <span>Diterima</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content: Title, Description, Location + Photo */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/halo-jurnal/laporan/${report.id}`}
                      className="block group/title"
                    >
                      <h2 className="font-heading font-bold text-base text-on-surface group-hover/title:text-primary transition-colors leading-snug mb-1.5">
                        {report.judul}
                      </h2>
                    </Link>

                    <p className="text-secondary text-xs sm:text-sm line-clamp-2 leading-relaxed mb-2.5">
                      {report.deskripsi}
                    </p>

                    {report.lokasi && (
                      <div className="flex items-center gap-1.5 text-xs text-secondary">
                        <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span className="line-clamp-1">{report.lokasi}</span>
                      </div>
                    )}
                  </div>

                  {imgUrl && (
                    <Link
                      href={`/halo-jurnal/laporan/${report.id}`}
                      className="shrink-0 w-full sm:w-36 h-24 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant/60 block"
                      title="Lihat lampiran"
                    >
                      <img
                        src={imgUrl}
                        alt={report.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </Link>
                  )}
                </div>

                {/* Footer: Chat Admin & Detail Link */}
                <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between gap-3 text-xs">
                  <Link
                    href={`/halo-jurnal/laporan/${report.id}#chat`}
                    className="inline-flex items-center gap-1.5 text-secondary hover:text-primary font-medium transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ruang Chat &amp; Tanggapan</span>
                    {report.chat_messages && report.chat_messages[0]?.count > 0 && (
                      <span className="px-1.5 py-0.2 bg-primary/10 text-primary rounded-full text-[10px] font-bold">
                        {report.chat_messages[0].count}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={`/halo-jurnal/laporan/${report.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline group/cta"
                  >
                    <span>Lihat Detail</span>
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
    </div>
  )
}
