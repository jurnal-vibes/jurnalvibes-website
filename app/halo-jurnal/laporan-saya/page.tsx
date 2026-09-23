'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  PlusCircle,
  FileQuestion,
  MessageSquare,
} from 'lucide-react'
import { DUMMY_REPORTS } from '@/data/dummyReports'

export default function HaloJurnalLaporanSayaPage() {
  const supabase = createClient()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [statusFilter, setStatusFilter] = useState('Semua Status')
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
      fetchReports()
    }
  }, [user, statusFilter, searchQuery])

  const fetchReports = async () => {
    setLoading(true)

    let supabaseData: any[] | null = null

    try {
      let query = supabase
        .from('laporan')
        .select('*')
        .order('created_at', { ascending: false })

      if (user && user.id !== 'demo-user-id') {
        query = query.eq('user_id', user.id)
      }

      if (statusFilter !== 'Semua Status') {
        const statusMap: Record<string, string> = {
          Diterima: 'diterima',
          Diproses: 'diproses',
          Selesai: 'selesai',
          Ditindaklanjuti: 'ditindaklanjuti',
        }
        if (statusMap[statusFilter]) {
          query = query.eq('status', statusMap[statusFilter])
        }
      }

      if (searchQuery.trim()) {
        query = query.or(
          `judul.ilike.%${searchQuery}%,deskripsi.ilike.%${searchQuery}%,ticket_number.ilike.%${searchQuery}%`
        )
      }

      const { data, error } = await query
      if (!error && data && data.length > 0) {
        supabaseData = data
      }
    } catch {
      // Supabase query error fallback
    }

    if (supabaseData && supabaseData.length > 0) {
      setReports(supabaseData)
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

      // Jika ada laporan yang baru dibuat warga, tampilkan; jika kosong gunakan data demo
      const baseReports =
        localUserReports.length > 0
          ? localUserReports
          : DUMMY_REPORTS.slice(0, 3)

      let filtered = [...baseReports]

      if (statusFilter !== 'Semua Status') {
        const statusMap: Record<string, string> = {
          Diterima: 'diterima',
          Diproses: 'diproses',
          Selesai: 'selesai',
          Ditindaklanjuti: 'ditindaklanjuti',
        }
        if (statusMap[statusFilter]) {
          filtered = filtered.filter((r) => r.status === statusMap[statusFilter])
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (r) =>
            (r.judul && r.judul.toLowerCase().includes(q)) ||
            (r.deskripsi && r.deskripsi.toLowerCase().includes(q)) ||
            (r.ticket_number && r.ticket_number.toLowerCase().includes(q)) ||
            (r.nomor_tiket && r.nomor_tiket.toLowerCase().includes(q))
        )
      }

      setReports(filtered)
    }

    setLoading(false)
  }

  const statusOptions = ['Semua Status', 'Diterima', 'Diproses', 'Ditindaklanjuti', 'Selesai']

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 pt-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Laporan Saya
          </h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Pantau status tindak lanjut seluruh laporan dan aspirasi yang telah Anda kirimkan.
          </p>
        </div>

        <Link
          href="/halo-jurnal/lapor"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold tracking-tight shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Laporan Baru</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul atau nomor tiket..."
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-surface border border-outline-variant rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary shadow-2xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-xs sm:text-sm bg-surface border border-outline-variant rounded-xl text-on-surface font-semibold focus:outline-none focus:border-primary shadow-2xs"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 text-secondary">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs">Memuat laporan Anda...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => {
            const chatCount = report.chat_messages?.[0]?.count || report.komentar_count || 0
            return (
              <Link
                key={report.id}
                href={`/halo-jurnal/laporan/${report.id}`}
                className="group block bg-surface border border-outline-variant/80 hover:border-primary/40 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-secondary bg-surface-container-high px-2.5 py-0.5 rounded-md">
                      {report.ticket_number || report.nomor_tiket || `JS-${report.id.substring(0, 8)}`}
                    </span>
                    <span className="text-xs font-bold text-primary capitalize px-2 py-0.5 rounded-full bg-primary/10">
                      {report.jenis || 'Laporan'}
                    </span>
                  </div>

                  {report.status === 'selesai' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200/50">
                      <CheckCircle2 className="w-3 h-3" />
                      Selesai
                    </span>
                  )}
                  {report.status === 'diproses' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-200/50">
                      <Clock className="w-3 h-3" />
                      Diproses
                    </span>
                  )}
                  {report.status === 'diterima' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200/50">
                      <Clock className="w-3 h-3" />
                      Diterima
                    </span>
                  )}
                  {report.status === 'ditindaklanjuti' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200/50">
                      <ShieldCheck className="w-3 h-3" />
                      Ditindaklanjuti
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {report.judul}
                </h3>
                <p className="text-secondary text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
                  {report.deskripsi}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/60 text-xs text-secondary">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(report.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{report.lokasi || 'Sukabumi'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-semibold">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{chatCount} Tanggapan</span>
                    </span>
                    <span className="text-primary font-bold">Detail &rarr;</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-3xl border border-outline-variant/80 p-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-base text-on-surface mb-1">
            Belum Ada Laporan
          </h3>
          <p className="text-xs text-secondary mb-6 max-w-sm mx-auto">
            Anda belum memiliki riwayat pengaduan atau aspirasi. Mulai suarakan aspirasi Anda sekarang.
          </p>
          <Link
            href="/halo-jurnal/lapor"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-dark transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Kirim Laporan Pertama</span>
          </Link>
        </div>
      )}
    </div>
  )
}
