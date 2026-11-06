'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Search,
  ChevronRight,
  Eye,
  Download,
  RotateCcw,
  X,
  MessageSquare,
  Trash2,
  Globe,
  Lock,
} from 'lucide-react'
import { DummyReport } from '@/data/dummyReports'
import { useAdminData } from '@/context/AdminDataContext'

export default function AdminLaporanPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVisibility, setSelectedVisibility] = useState<'semua' | 'publik' | 'privat'>('semua')
  // Mengambil data terpusat dari AdminDataContext (0ms instant render, tersinkronisasi)
  const { reports: reportsList, isLoadingReports: isLoading, refreshReports } = useAdminData()
  const [chatCounts, setChatCounts] = useState<Record<string, number>>({})

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

  // Scan jumlah pesan chat warga aktif
  useEffect(() => {
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

    const scanChats = () => {
      if (typeof window === 'undefined') return
      const map: Record<string, number> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('halo_jurnal_chat_')) {
          try {
            const list = JSON.parse(localStorage.getItem(key) || '[]')
            if (Array.isArray(list) && list.length > 0) {
              const wargaMsgs = list.filter(
                (m: any) =>
                  m.sender_id !== 'admin-redaksi' &&
                  m.profiles?.role !== 'admin' &&
                  m.role !== 'admin'
              )
              const idPart = key.replace('halo_jurnal_chat_', '')
              if (wargaMsgs.length > 0) {
                map[idPart] = wargaMsgs.length
              }
            }
          } catch {}
        }
      }
      setChatCounts(map)
    }

    scanChats()
    window.addEventListener('storage', scanChats)
    window.addEventListener('focus', scanChats)
    return () => {
      window.removeEventListener('storage', scanChats)
      window.removeEventListener('focus', scanChats)
    }
  }, [])

  // Baca query pencarian dari parameter URL jika ada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      const q = sp.get('search')
      if (q) setSearchQuery(q)
    }
  }, [])

  // Filter aduan
  const filteredReports = useMemo(() => {
    return reportsList.filter((r) => {
      // 1. Pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = r.judul?.toLowerCase().includes(q)
        const matchTicket = r.nomor_tiket?.toLowerCase().includes(q)
        const matchDesc = r.deskripsi?.toLowerCase().includes(q)
        if (!matchTitle && !matchTicket && !matchDesc) return false
      }

      // 2. Visibilitas
      const isPublic = r.is_public || (r as any).visibilitas === 'publik'
      if (selectedVisibility === 'publik' && !isPublic) return false
      if (selectedVisibility === 'privat' && isPublic) return false

      return true
    })
  }, [reportsList, searchQuery, selectedVisibility])

  const totalPublik = useMemo(
    () => reportsList.filter((r) => r.is_public || (r as any).visibilitas === 'publik').length,
    [reportsList]
  )
  const totalPrivat = reportsList.length - totalPublik

  const PAGE_SIZE = 10
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchQuery, selectedVisibility])

  const visibleReports = useMemo(() => {
    return filteredReports.slice(0, visibleCount)
  }, [filteredReports, visibleCount])

  const handleDeleteReport = async (id: string, ticketNumber?: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus aduan "${ticketNumber || id}" secara permanen? Data yang dihapus tidak dapat dipulihkan.`)) {
      return
    }

    try {
      await fetch(`/api/reports?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        const userReports = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
        const filtered = userReports.filter(
          (r: any) =>
            r.id !== id &&
            r.nomor_tiket !== id &&
            r.ticket_number !== id &&
            (!ticketNumber || r.nomor_tiket !== ticketNumber)
        )
        localStorage.setItem('halo_jurnal_user_reports', JSON.stringify(filtered))
        window.dispatchEvent(new Event('storage'))
      } catch {}
    }

    await refreshReports()
  }

  const handleResetFilter = () => {
    setSearchQuery('')
    setSelectedVisibility('semua')
    setVisibleCount(PAGE_SIZE)
  }

  // Ekspor CSV bersih
  const handleExportCSV = () => {
    const headers = ['Nomor Tiket', 'Tanggal', 'Judul Pengaduan', 'Visibilitas', 'Dukungan']
    const rows = filteredReports.map((r) => [
      `"${r.nomor_tiket}"`,
      `"${formatDate(r.created_at)}"`,
      `"${r.judul.replace(/"/g, '""')}"`,
      `"${r.is_public ? 'Publik' : 'Privat'}"`,
      r.dukungan_count || 0,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `aduan-halo-jurnal-${new Date().toISOString().slice(0, 10)}.csv`
    )
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
            Buku Induk &amp; Arsip Pengaduan Warga
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Database arsip lengkap seluruh riwayat pengaduan warga Sukabumi yang masuk ke redaksi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer hover:border-[#c00015]/40 hover:text-[#c00015]"
            title="Unduh data aduan ke format CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Tab Filter Visibilitas Aduan */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'semua' as const, label: 'Semua Aduan', count: reportsList.length },
          { key: 'publik' as const, label: 'Feed Publik', count: totalPublik },
          { key: 'privat' as const, label: 'Aduan Privat', count: totalPrivat },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedVisibility(tab.key)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedVisibility === tab.key
                ? 'bg-[#c00015] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                selectedVisibility === tab.key
                  ? 'bg-black/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Panel Search Bar & Filter */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor tiket atau judul pengaduan..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
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

          {(searchQuery || selectedVisibility !== 'semua') && (
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-600 hover:text-[#c00015] hover:bg-slate-100 rounded-lg transition cursor-pointer border border-slate-200"
              title="Reset Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Tabel Tabular Aduan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{Math.min(visibleCount, filteredReports.length)}</strong> dari{' '}
            <strong>{filteredReports.length}</strong> pengaduan
          </span>
          <span className="text-[11px]">Diurutkan berdasarkan tanggal terbaru</span>
        </div>

        {isLoading && reportsList.length === 0 ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-1/6" />
              </div>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Tidak ada aduan yang sesuai
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
              <span>Reset Filter</span>
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full min-w-[750px] table-fixed text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap w-[200px]">No. Tiket &amp; Tanggal</th>
                  <th className="py-3.5 px-4">Judul Pengaduan</th>
                  <th className="py-3.5 px-4 whitespace-nowrap w-[110px] text-center">Dukungan</th>
                  <th className="py-3.5 px-4 whitespace-nowrap w-[130px] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleReports.map((report) => {
                  const reportChatCount =
                    chatCounts[report.id] ||
                    (report.nomor_tiket ? chatCounts[report.nomor_tiket] : 0) ||
                    0
                  const isItemPublic = report.is_public || (report as any).visibilitas === 'publik'

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {report.nomor_tiket}
                          </span>
                          {isItemPublic ? (
                            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                              Publik
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                              Privat
                            </span>
                          )}
                          {reportChatCount > 0 && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary"
                              title={`${reportChatCount} pesan dari warga di tiket ini`}
                            >
                              <MessageSquare className="w-3 h-3 text-primary" />
                              <span>{reportChatCount}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatDate(report.created_at)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 align-middle min-w-0 overflow-hidden">
                        <Link
                          href={`/halo-jurnal/admin/laporan/${report.id}`}
                          className="font-heading font-semibold text-slate-900 hover:text-[#c00015] transition-colors truncate block text-xs"
                          title={report.judul}
                        >
                          {report.judul}
                        </Link>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {report.deskripsi}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap align-middle text-center text-slate-700 font-semibold text-xs">
                        {report.dukungan_count || 0} suara
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <Link
                            href={`/halo-jurnal/laporan/${report.id}`}
                            target="_blank"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Lihat Tampilan Warga di Portal"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/halo-jurnal/admin/laporan/${report.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-[#c00015] hover:text-white hover:border-[#c00015] text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer group"
                          >
                            <span>Detail</span>
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(report.id, report.nomor_tiket)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                            title="Hapus Aduan Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {visibleCount < filteredReports.length && (
          <div className="p-3 border-t border-slate-100 text-center bg-slate-50/50">
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              Muat Lebih Banyak ({filteredReports.length - visibleCount} lagi)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
