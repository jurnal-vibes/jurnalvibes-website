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
  Eye,
  ChevronDown,
  Loader2,
  FileQuestion,
  PlusCircle,
  X,
} from 'lucide-react'
import { DUMMY_REPORTS } from '@/data/dummyReports'

export default function HaloJurnalLaporanSayaPage() {
  const supabase = createClient()
  const [allReports, setAllReports] = useState<any[]>([])
  const [displayedReports, setDisplayedReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Filters & sorting state
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [sortOrder, setSortOrder] = useState('Terbaru')
  const [searchQuery, setSearchQuery] = useState('')

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
  }, [allReports, statusFilter, sortOrder, searchQuery])

  const fetchAllUserReports = async () => {
    setLoading(true)
    let supabaseData: any[] | null = null

    try {
      let query = supabase
        .from('laporan')
        .select('*, chat_messages(count)')
        .order('created_at', { ascending: false })

      if (user && user.id !== 'demo-user-id') {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query
      if (!error && data && data.length > 0) {
        supabaseData = data
      }
    } catch {
      // Supabase query error fallback
    }

    if (supabaseData && supabaseData.length > 0) {
      setAllReports(supabaseData)
    } else {
      // Fallback: gabungkan laporan buatan user di localStorage + DUMMY_REPORTS
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

    // Status filter
    if (statusFilter !== 'Semua Status' && statusFilter !== 'TOTAL') {
      const targetStatus = statusFilter.toLowerCase()
      list = list.filter((r) => r.status?.toLowerCase() === targetStatus)
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          (r.judul && r.judul.toLowerCase().includes(q)) ||
          (r.kategori && r.kategori.toLowerCase().includes(q)) ||
          (r.deskripsi && r.deskripsi.toLowerCase().includes(q)) ||
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="w-full max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-16">
      {/* 1. Header Halaman */}
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-on-surface tracking-tight">
          Laporan Saya
        </h1>
        <p className="text-secondary text-xs sm:text-sm mt-1">
          Pantau status aspirasi dan keluhan Anda secara real-time.
        </p>
      </div>

      {/* 2. Stat Cards Summary (TOTAL, DITERIMA, DIPROSES, DITINDAKLANJUTI, SELESAI) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {/* TOTAL */}
        <button
          type="button"
          onClick={() => setStatusFilter('Semua Status')}
          className={`p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer text-left shadow-2xs border ${
            statusFilter === 'Semua Status' || statusFilter === 'TOTAL'
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-surface hover:bg-surface-container-low text-on-surface border-outline-variant/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                statusFilter === 'Semua Status' || statusFilter === 'TOTAL'
                  ? 'bg-white/20 text-white'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-2xl sm:text-3xl leading-none">
              {totalCount}
            </span>
          </div>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              statusFilter === 'Semua Status' || statusFilter === 'TOTAL'
                ? 'text-white/90'
                : 'text-secondary'
            }`}
          >
            TOTAL
          </span>
        </button>

        {/* DITERIMA */}
        <button
          type="button"
          onClick={() => setStatusFilter('Diterima')}
          className={`p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer text-left shadow-2xs border ${
            statusFilter === 'Diterima'
              ? 'bg-surface border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-surface hover:bg-surface-container-low border-outline-variant/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-on-surface leading-none">
              {diterimaCount}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            DITERIMA
          </span>
        </button>

        {/* DIPROSES */}
        <button
          type="button"
          onClick={() => setStatusFilter('Diproses')}
          className={`p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer text-left shadow-2xs border ${
            statusFilter === 'Diproses'
              ? 'bg-surface border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-surface hover:bg-surface-container-low border-outline-variant/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-on-surface leading-none">
              {diprosesCount}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            DIPROSES
          </span>
        </button>

        {/* DITINDAKLANJUTI */}
        <button
          type="button"
          onClick={() => setStatusFilter('Ditindaklanjuti')}
          className={`p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer text-left shadow-2xs border ${
            statusFilter === 'Ditindaklanjuti'
              ? 'bg-surface border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
              : 'bg-surface hover:bg-surface-container-low border-outline-variant/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-on-surface leading-none">
              {ditindaklanjutiCount}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            DITINDAKLANJUTI
          </span>
        </button>

        {/* SELESAI */}
        <button
          type="button"
          onClick={() => setStatusFilter('Selesai')}
          className={`p-4 rounded-2xl flex flex-col justify-between transition-all cursor-pointer text-left shadow-2xs border col-span-2 sm:col-span-1 ${
            statusFilter === 'Selesai'
              ? 'bg-surface border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-surface hover:bg-surface-container-low border-outline-variant/80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-heading font-black text-2xl sm:text-3xl text-on-surface leading-none">
              {selesaiCount}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            SELESAI
          </span>
        </button>
      </div>

      {/* 3. Search & Filter Bar Container */}
      <div className="bg-surface border border-outline-variant/80 rounded-2xl p-3 sm:p-4 mb-6 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari laporan..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface border border-outline-variant/80 rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary shadow-2xs transition-colors"
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

        {/* Dropdown Status */}
        <div className="relative w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-3.5 pr-8 py-2 text-xs sm:text-sm bg-surface border border-outline-variant/80 rounded-xl text-on-surface font-semibold focus:outline-none focus:border-primary shadow-2xs cursor-pointer"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Diterima">Diterima</option>
            <option value="Diproses">Diproses</option>
            <option value="Ditindaklanjuti">Ditindaklanjuti</option>
            <option value="Selesai">Selesai</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown Sort */}
        <div className="relative w-full sm:w-auto">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-3.5 pr-8 py-2 text-xs sm:text-sm bg-surface border border-outline-variant/80 rounded-xl text-on-surface font-semibold focus:outline-none focus:border-primary shadow-2xs cursor-pointer"
          >
            <option value="Terbaru">Terbaru</option>
            <option value="Terlama">Terlama</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 4. Table / List Laporan */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 text-secondary">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs">Memuat laporan Anda...</p>
        </div>
      ) : displayedReports.length > 0 ? (
        <div className="bg-surface border border-outline-variant/80 rounded-2xl overflow-hidden shadow-2xs">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-outline-variant/60 text-[11px] font-bold uppercase tracking-wider text-secondary select-none">
            <div className="col-span-5">LAPORAN</div>
            <div className="col-span-2 text-center">KATEGORI</div>
            <div className="col-span-2 text-center">TANGGAL</div>
            <div className="col-span-2 text-center">STATUS</div>
            <div className="col-span-1 text-right">INTERAKSI</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-outline-variant/60">
            {displayedReports.map((report) => {
              const ticketId =
                report.nomor_tiket ||
                report.ticket_number ||
                `JS-${report.id.substring(0, 8)}`

              return (
                <div
                  key={report.id}
                  className="p-4 sm:p-5 md:px-6 md:py-4.5 hover:bg-surface-container-low/50 transition-colors flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 md:items-center"
                >
                  {/* Kolom 1: LAPORAN (Judul & ID) */}
                  <div className="md:col-span-5 min-w-0">
                    <Link
                      href={`/halo-jurnal/laporan/${report.id}`}
                      className="font-heading font-bold text-sm sm:text-base text-on-surface hover:text-primary transition-colors block line-clamp-2 md:line-clamp-1 leading-snug"
                    >
                      {report.judul}
                    </Link>
                    <span className="block text-[11px] sm:text-xs text-secondary mt-0.5 font-mono">
                      ID: {ticketId}
                    </span>
                  </div>

                  {/* Kolom 2: KATEGORI */}
                  <div className="md:col-span-2 flex items-center md:justify-center">
                    <span className="inline-block px-3 py-1 rounded-md bg-surface-container-high text-on-surface text-xs font-semibold">
                      {report.kategori || 'Umum'}
                    </span>
                  </div>

                  {/* Kolom 3: TANGGAL */}
                  <div className="md:col-span-2 text-xs text-secondary md:text-center font-medium">
                    {formatDate(report.created_at)}
                  </div>

                  {/* Kolom 4: STATUS */}
                  <div className="md:col-span-2 flex items-center md:justify-center">
                    {report.status === 'selesai' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200/60">
                        Selesai
                      </span>
                    )}
                    {report.status === 'diproses' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[11px] font-bold border border-amber-200/60">
                        Diproses
                      </span>
                    )}
                    {report.status === 'diterima' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[11px] font-bold border border-blue-200/60">
                        Diterima
                      </span>
                    )}
                    {report.status === 'ditindaklanjuti' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[11px] font-bold border border-purple-200/60">
                        Ditindaklanjuti
                      </span>
                    )}
                  </div>

                  {/* Kolom 5: INTERAKSI */}
                  <div className="md:col-span-1 flex items-center justify-end gap-3 text-secondary pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/40">
                    <Link
                      href={`/halo-jurnal/laporan/${report.id}`}
                      className="hover:text-primary transition-colors p-1"
                      title="Lihat Tanggapan / Chat Admin"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/halo-jurnal/laporan/${report.id}`}
                      className="hover:text-primary transition-colors p-1"
                      title="Lihat Detail Laporan"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/80 p-8 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-base text-on-surface mb-1">
            Belum Ada Laporan Ditemukan
          </h3>
          <p className="text-xs text-secondary mb-6 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'Semua Status'
              ? 'Tidak ada laporan yang sesuai dengan kriteria filter atau pencarian Anda.'
              : 'Anda belum memiliki riwayat pengaduan atau aspirasi. Mulai suarakan aspirasi Anda sekarang.'}
          </p>
          {searchQuery || statusFilter !== 'Semua Status' ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('Semua Status')
              }}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer"
            >
              Reset Filter
            </button>
          ) : (
            <Link
              href="/halo-jurnal/lapor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-dark transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Kirim Laporan Pertama</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
