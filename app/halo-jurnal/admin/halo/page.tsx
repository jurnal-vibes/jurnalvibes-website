'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Search,
  MapPin,
  Tag,
  BarChart3,
  ShieldCheck,
  Inbox,
} from 'lucide-react'
import { DummyReport } from '@/data/dummyReports'

export default function AdminHaloJurnalDashboardPage() {
  const [reportsList, setReportsList] = useState<DummyReport[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('semua')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    // Pembersihan otomatis sisa-sisa cache percakapan lama di browser
    if (typeof window !== 'undefined') {
      try {
        const hasPurgedV2 = localStorage.getItem('halo_jurnal_chat_cleanup_v2')
        if (!hasPurgedV2) {
          localStorage.removeItem('halo_jurnal_read_chats')
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i)
            if (k && k.startsWith('halo_jurnal_chat_')) {
              localStorage.removeItem(k)
            }
          }
          localStorage.setItem('halo_jurnal_chat_cleanup_v2', 'true')
        }
      } catch {}
    }

    const loadReports = async () => {
      try {
        const res = await fetch('/api/reports', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && isMounted) {
            setReportsList(json.data)
            return
          }
        }
      } catch (err) {
        console.warn('Gagal memuat laporan Hallo Jurnal:', err)
      }

      if (typeof window !== 'undefined') {
        try {
          const saved = JSON.parse(
            localStorage.getItem('halo_jurnal_user_reports') || '[]'
          )
          if (Array.isArray(saved) && isMounted) {
            setReportsList(saved)
          }
        } catch {}
      }
    }

    const loadChatCount = () => {
      if (typeof window === 'undefined') return
      try {
        const readSet = new Set<string>(
          JSON.parse(localStorage.getItem('halo_jurnal_read_chats') || '[]')
        )
        let unread = 0
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && k.startsWith('halo_jurnal_chat_')) {
            try {
              const list = JSON.parse(localStorage.getItem(k) || '[]')
              if (Array.isArray(list)) {
                list.forEach((m: any) => {
                  if (
                    m.sender_id !== 'admin-redaksi' &&
                    m.profiles?.role !== 'admin' &&
                    m.role !== 'admin' &&
                    !readSet.has(m.id)
                  ) {
                    unread++
                  }
                })
              }
            } catch {}
          }
        }
        if (isMounted) setUnreadChatCount(unread)
      } catch {}
    }

    loadReports()
    loadChatCount()

    window.addEventListener('storage', loadReports)
    window.addEventListener('focus', loadReports)

    return () => {
      isMounted = false
      window.removeEventListener('storage', loadReports)
      window.removeEventListener('focus', loadReports)
    }
  }, [])

  // Normalisasi Kategori Rapi
  const formatCategory = (cat: string) => {
    if (!cat) return 'Umum'
    const clean = cat.trim()
    const lower = clean.toLowerCase()
    if (lower.includes('keamanan') || lower.includes('tertib')) return 'Keamanan'
    if (lower.includes('lingkungan') || lower.includes('sampah')) return 'Lingkungan'
    if (lower.includes('infrastruktur') || lower.includes('jalan')) return 'Infrastruktur'
    if (lower.includes('anggaran') || lower.includes('keuangan')) return 'Anggaran'
    if (lower.includes('kesehatan') || lower.includes('medis')) return 'Kesehatan'
    if (lower.includes('pendidikan') || lower.includes('sekolah')) return 'Pendidikan'
    if (lower.includes('pelayanan') || lower.includes('layanan')) return 'Layanan Publik'
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
  }

  // Metrics Resmi Sinkron dengan Alur Tiket & Warga
  const totalReports = reportsList.length
  const diterimaReports = reportsList.filter((r) => r.status === 'diterima').length
  const diprosesReports = reportsList.filter((r) => r.status === 'diproses').length
  const ditindaklanjutiReports = reportsList.filter((r) => r.status === 'ditindaklanjuti').length
  const selesaiReports = reportsList.filter((r) => r.status === 'selesai').length

  // Sebaran Isu Warga (Top Kategori Masalah)
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {}
    reportsList.forEach((r) => {
      const cat = formatCategory(r.kategori)
      counts[cat] = (counts[cat] || 0) + 1
    })
    const total = reportsList.length || 1
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  }, [reportsList])

  // Filtered reports untuk tabel operasional resmi
  const filteredReports = useMemo(() => {
    return reportsList.filter((item) => {
      if (statusFilter !== 'semua') {
        if (item.status !== statusFilter) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTicket = item.nomor_tiket?.toLowerCase().includes(q)
        const matchTitle = item.judul?.toLowerCase().includes(q)
        const matchDesc = item.deskripsi?.toLowerCase().includes(q)
        const matchLoc = item.lokasi?.toLowerCase().includes(q)
        if (!matchTicket && !matchTitle && !matchDesc && !matchLoc) return false
      }
      return true
    })
  }, [reportsList, statusFilter, searchQuery])

  // Status Badge Bersih
  const renderStatusBadge = (status: DummyReport['status'], jenisOrKategori?: string) => {
    const isStory = (jenisOrKategori || '').toLowerCase().includes('inspirasi')
    if (isStory) {
      if (status === 'selesai') {
        return (
          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Disetujui & Tayang
          </span>
        )
      }
      if (status === 'ditindaklanjuti') {
        return (
          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            🌟 Liputan Berita
          </span>
        )
      }
      if (status === 'diproses') {
        return (
          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Sedang Dikurasi
          </span>
        )
      }
      if (status === 'ditolak') {
        return (
          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Tidak Lolos
          </span>
        )
      }
      return (
        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
          Menunggu Kurasi
        </span>
      )
    }

    const labels: Record<string, string> = {
      diterima: 'Diterima',
      diproses: 'Diproses',
      ditindaklanjuti: 'Ditindaklanjuti',
      selesai: 'Selesai',
      ditolak: 'Ditolak',
    }
    const label = labels[status] || status

    return (
      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Khusus Dashboard Pemantauan Hallo Jurnal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Dashboard Pemantauan Hallo Jurnal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ruang kendali cepat verifikasi aduan masuk, sebaran isu masyarakat, dan tindak lanjut laporan aktif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/halo-jurnal/admin/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition border border-slate-200"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
            <span>Chat Warga</span>
            {unreadChatCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                {unreadChatCount}
              </span>
            )}
          </Link>
          <Link
            href="/halo-jurnal"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition border border-slate-200 shadow-2xs hover:border-[#c00015]/40 hover:text-[#c00015]"
          >
            <span>Buka Portal Hallo Jurnal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 2. Lima Kartu Metrik Hallo Jurnal (Sinkron 1-to-1 dengan Alur Tiket & Warga) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Aduan
            </span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {totalReports}
          </p>
          <p className="text-[11px] text-slate-500">Semua laporan warga</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Diterima
            </span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {diterimaReports}
          </p>
          <p className="text-[11px] text-slate-500">Menunggu verifikasi awal</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Diproses
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {diprosesReports}
          </p>
          <p className="text-[11px] text-slate-500">Pemeriksaan & investigasi</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Ditindaklanjuti
            </span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {ditindaklanjutiReports}
          </p>
          <p className="text-[11px] text-slate-500">Penanganan dinas/instansi</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Selesai
            </span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-slate-900">
            {selesaiReports}
          </p>
          <p className="text-[11px] text-slate-500">Laporan tuntas diselesaikan</p>
        </div>
      </div>

      {/* 3. Widget Sebaran Isu Warga (Top Kategori Masalah) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#c00015]" />
              <span>Sebaran Isu Masyarakat Sukabumi</span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {totalReports} Laporan Terdaftar
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemetaan topik keluhan warga untuk menentukan fokus liputan redaksi dan atensi stakeholder.
            </p>
          </div>
          {categoryStats.length > 0 && (
            <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
              Top Isu:{' '}
              <span className="font-bold text-slate-900">
                {categoryStats[0].name} ({categoryStats[0].percentage}%)
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categoryStats.slice(0, 4).map((cat) => (
            <div
              key={cat.name}
              className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 line-clamp-1">{cat.name}</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {cat.count} ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#c00015] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(cat.percentage, 8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Panel Tabel Aduan Sinkron dengan Alur Tiket & Warga */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { key: 'semua', label: `Total Aduan (${totalReports})` },
              { key: 'diterima', label: `Diterima (${diterimaReports})` },
              { key: 'diproses', label: `Diproses (${diprosesReports})` },
              { key: 'ditindaklanjuti', label: `Ditindaklanjuti (${ditindaklanjutiReports})` },
              { key: 'selesai', label: `Selesai (${selesaiReports})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-[#c00015] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor tiket, judul, lokasi..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#c00015]"
            />
          </div>
        </div>

        {/* Tabel Laporan Aduan */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Tiket</th>
                <th className="py-3 px-4">Uraian Laporan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-700">Tidak ada aduan dalam filter ini</p>
                    <p className="text-[11px]">Semua laporan pada kategori ini sudah tertangani atau belum tersedia.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.slice(0, 10).map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-800">
                      {rep.nomor_tiket}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {formatCategory(rep.kategori)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 line-clamp-1">
                        {rep.judul}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {rep.deskripsi}
                      </p>
                      {rep.lokasi && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#c00015] shrink-0" />
                          <span className="line-clamp-1">{rep.lokasi}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(rep.status, (rep as any).jenis || rep.kategori)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(rep.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Link
                        href={`/halo-jurnal/admin/laporan/${rep.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                      >
                        <span>Detail Tiket</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Navigasi ke Arsip Lengkap */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            Menampilkan <strong>{Math.min(filteredReports.length, 10)}</strong> dari{' '}
            <strong>{filteredReports.length}</strong> aduan dalam antrean aktif.
          </div>
          <Link
            href="/halo-jurnal/admin/laporan"
            className="inline-flex items-center gap-1.5 font-semibold text-[#c00015] hover:text-[#a00012] transition"
          >
            <span>Buka Buku Induk &amp; Arsip Lengkap Warga</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
