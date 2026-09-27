'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Eye,
  Download,
  RotateCcw,
  X,
} from 'lucide-react'
import { DUMMY_REPORTS, DummyReport } from '@/data/dummyReports'

export default function AdminLaporanPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('semua')
  const [selectedCategory, setSelectedCategory] = useState<string>('semua')
  const [selectedVisibility, setSelectedVisibility] = useState<string>('semua')

  // Helper normalisasi kategori (hindari all-caps kasar)
  const formatCategory = (cat: string) => {
    if (!cat) return 'Umum'
    if (cat === cat.toUpperCase() && cat.length > 2) {
      return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
    }
    return cat
  }

  // Status badge styling
  const getStatusBadge = (status: DummyReport['status']) => {
    switch (status) {
      case 'diterima':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Menunggu
          </span>
        )
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <Search className="w-3 h-3 text-blue-600" />
            Investigasi
          </span>
        )
      case 'ditindaklanjuti':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200">
            <AlertTriangle className="w-3 h-3 text-purple-600" />
            Dinas
          </span>
        )
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Selesai
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {status}
          </span>
        )
    }
  }

  // Format tanggal rapi
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const [reportsList, setReportsList] = useState<DummyReport[]>(DUMMY_REPORTS)

  // Muat override status dari localStorage saat dibuka
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const overrides = JSON.parse(
          localStorage.getItem('halo_jurnal_status_overrides') || '{}'
        )
        const userReports = JSON.parse(
          localStorage.getItem('halo_jurnal_user_reports') || '[]'
        )
        const combined = [...userReports, ...DUMMY_REPORTS]
        const unique = new Map<string, any>()
        combined.forEach((item) => {
          const key = item.id || item.nomor_tiket || item.ticket_number
          if (key && !unique.has(key)) {
            unique.set(key, item)
          }
        })
        const updated = Array.from(unique.values()).map((r) => {
          const saved = overrides[r.id] || (r.nomor_tiket ? overrides[r.nomor_tiket] : null)
          if (saved) {
            return {
              ...r,
              status: saved.status || r.status,
              is_public: saved.is_public !== undefined ? saved.is_public : r.is_public,
              status_log: saved.status_log || r.status_log,
            }
          }
          return r
        })
        setReportsList(updated)

        const sp = new URLSearchParams(window.location.search)
        const q = sp.get('search')
        if (q) setSearchQuery(q)
      } catch (err) {
        console.error('Error loading reports override:', err)
      }
    }
  }, [])

  // Daftar kategori unik
  const categories = useMemo(() => {
    const set = new Set<string>()
    reportsList.forEach((r) => {
      if (r.kategori) set.add(r.kategori)
    })
    return Array.from(set)
  }, [reportsList])

  // Filter laporan
  const filteredReports = useMemo(() => {
    return reportsList.filter((r) => {
      // 1. Pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = r.judul?.toLowerCase().includes(q)
        const matchTicket = r.nomor_tiket?.toLowerCase().includes(q)
        const matchDesc = r.deskripsi?.toLowerCase().includes(q)
        const matchLoc = r.lokasi?.toLowerCase().includes(q)
        if (!matchTitle && !matchTicket && !matchDesc && !matchLoc) return false
      }

      // 2. Status
      if (selectedStatus !== 'semua' && r.status !== selectedStatus) {
        return false
      }

      // 3. Kategori
      if (selectedCategory !== 'semua' && r.kategori !== selectedCategory) {
        return false
      }

      // 4. Visibilitas
      if (selectedVisibility === 'publik' && !r.is_public) return false
      if (selectedVisibility === 'privat' && r.is_public) return false

      return true
    })
  }, [reportsList, searchQuery, selectedStatus, selectedCategory, selectedVisibility])

  // Hitung jumlah tiap status untuk tab
  const statusCounts = useMemo(() => {
    return {
      semua: reportsList.length,
      diterima: reportsList.filter((r) => r.status === 'diterima').length,
      diproses: reportsList.filter((r) => r.status === 'diproses').length,
      ditindaklanjuti: reportsList.filter((r) => r.status === 'ditindaklanjuti').length,
      selesai: reportsList.filter((r) => r.status === 'selesai').length,
    }
  }, [reportsList])

  const handleResetFilter = () => {
    setSearchQuery('')
    setSelectedStatus('semua')
    setSelectedCategory('semua')
    setSelectedVisibility('semua')
  }

  // Fitur Nyata: Ekspor CSV yang langsung mengunduh file
  const handleExportCSV = () => {
    const headers = ['Nomor Tiket', 'Tanggal', 'Judul Laporan', 'Kategori', 'Status', 'Visibilitas', 'Lokasi', 'Dukungan']
    const rows = filteredReports.map((r) => [
      `"${r.nomor_tiket}"`,
      `"${formatDate(r.created_at)}"`,
      `"${r.judul.replace(/"/g, '""')}"`,
      `"${r.kategori}"`,
      `"${r.status}"`,
      `"${r.is_public ? 'Publik' : 'Privat'}"`,
      `"${r.lokasi.replace(/"/g, '""')}"`,
      r.dukungan_count || 0,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `laporan-halo-jurnal-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Manajemen Laporan Warga
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap seluruh pengaduan dan aspirasi warga Sukabumi yang masuk ke redaksi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Ekspor CSV Nyata Berfungsi */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer"
            title="Unduh data laporan ke format CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Status Tab Cepat */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'semua', label: 'Semua Laporan', count: statusCounts.semua },
          { key: 'diterima', label: 'Menunggu Verifikasi', count: statusCounts.diterima },
          { key: 'diproses', label: 'Investigasi Redaksi', count: statusCounts.diproses },
          { key: 'ditindaklanjuti', label: 'Koordinasi Dinas', count: statusCounts.ditindaklanjuti },
          { key: 'selesai', label: 'Dituntaskan', count: statusCounts.selesai },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              selectedStatus === tab.key
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                selectedStatus === tab.key
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Panel Filter & Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor tiket, judul masalah, atau lokasi jalan..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] focus:ring-1 focus:ring-[#c00015] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdown Kategori */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
            >
              <option value="semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Filter Visibilitas */}
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
            >
              <option value="semua">Semua Visibilitas</option>
              <option value="publik">Feed Publik</option>
              <option value="privat">Privat / Tertutup</option>
            </select>

            {/* Tombol Reset Filter */}
            {(searchQuery || selectedCategory !== 'semua' || selectedVisibility !== 'semua') && (
              <button
                onClick={handleResetFilter}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs text-slate-500 hover:text-[#c00015] hover:bg-slate-100 rounded-lg transition"
                title="Reset Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Tabel Tabular Laporan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredReports.length}</strong> laporan
          </span>
          <span className="text-[11px]">Diurutkan berdasarkan tanggal terbaru</span>
        </div>

        {filteredReports.length === 0 ? (
          /* Empty State */
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Tidak ada laporan yang sesuai
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau reset filter untuk menampilkan semua data.
              </p>
            </div>
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        ) : (
          /* Tabel Data Tabular Simpel & Rapi */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Tiket &amp; Tanggal</th>
                  <th className="py-3 px-4">Judul Aduan &amp; Lokasi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Status Penanganan</th>
                  <th className="py-3 px-4">Dukungan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* No. Tiket, Tanggal & Badge Publik/Privat */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {report.nomor_tiket}
                        </span>
                        {report.is_public ? (
                          <span className="text-[10px] font-semibold text-[#c00015] bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                            Publik
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            Privat
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatDate(report.created_at)}
                      </p>
                    </td>

                    {/* Judul & Lokasi */}
                    <td className="py-3.5 px-4 max-w-md align-top">
                      <Link
                        href={`/halo-jurnal/admin/laporan/${report.id}`}
                        className="font-heading font-semibold text-slate-900 hover:text-[#c00015] transition-colors line-clamp-1 block"
                      >
                        {report.judul}
                      </Link>
                      <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                        📍 {report.lokasi}
                      </p>
                    </td>

                    {/* Kategori */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-top">
                      <span className="text-[11px] font-medium text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-md border border-slate-200/80">
                        {formatCategory(report.kategori)}
                      </span>
                    </td>

                    {/* Status Penanganan */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-top">
                      {getStatusBadge(report.status)}
                    </td>

                    {/* Dukungan Warga */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-top">
                      <span className="text-slate-700 font-semibold text-xs inline-flex items-center gap-1">
                        <span>👍</span>
                        <span>{report.dukungan_count || 0} suara</span>
                      </span>
                    </td>

                    {/* Tombol Aksi Bersih & Elegan */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right align-top">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/halo-jurnal/laporan/${report.id}`}
                          target="_blank"
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Lihat Tampilan Warga di Portal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/halo-jurnal/admin/laporan/${report.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-300 text-xs font-semibold transition shadow-2xs cursor-pointer group"
                        >
                          <span>Tinjau Detail</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
