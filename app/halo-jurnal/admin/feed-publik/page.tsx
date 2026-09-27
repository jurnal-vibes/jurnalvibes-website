'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Globe,
  Lock,
  Search,
  Eye,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Check,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import { DUMMY_REPORTS, DummyReport } from '@/data/dummyReports'

export default function AdminModerasiFeedPublikPage() {
  const [reportsList, setReportsList] = useState<DummyReport[]>(DUMMY_REPORTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [tabFilter, setTabFilter] = useState<'semua' | 'publik' | 'privat'>('publik')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Muat status dan override dari localStorage
  useEffect(() => {
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
      } catch (err) {
        console.error('Error loading reports in moderasi feed:', err)
      }
    }
  }, [])

  // Helper simpan perubahan visibilitas
  const handleToggleVisibility = (id: string, targetVisibility: boolean) => {
    const updated = reportsList.map((r) =>
      r.id === id || r.nomor_tiket === id ? { ...r, is_public: targetVisibility } : r
    )
    setReportsList(updated)

    const target = updated.find((r) => r.id === id || r.nomor_tiket === id)

    if (typeof window !== 'undefined') {
      try {
        const overrides = JSON.parse(
          localStorage.getItem('halo_jurnal_status_overrides') || '{}'
        )
        const existing = overrides[id] || (target?.nomor_tiket ? overrides[target.nomor_tiket] : {}) || {}
        const payload = {
          ...existing,
          is_public: targetVisibility,
          status: target?.status || 'diterima',
        }
        overrides[id] = payload
        if (target?.nomor_tiket) {
          overrides[target.nomor_tiket] = payload
        }
        localStorage.setItem(
          'halo_jurnal_status_overrides',
          JSON.stringify(overrides)
        )
        // Kirim event realtime agar seluruh tab/komponen langsung tersinkron
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error updating override:', err)
      }
    }

    setToastMessage(
      targetVisibility
        ? `Laporan "${target?.judul}" sekarang TAYANG di Feed Publik warga.`
        : `Laporan "${target?.judul}" berhasil DITARIK / DISEMBUNYIKAN dari Feed Publik warga.`
    )
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter list
  const filteredReports = useMemo(() => {
    return reportsList.filter((r) => {
      // Filter tab
      if (tabFilter === 'publik' && r.is_public === false) return false
      if (tabFilter === 'privat' && r.is_public !== false) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = r.judul?.toLowerCase().includes(q)
        const matchTicket = r.nomor_tiket?.toLowerCase().includes(q)
        const matchLoc = r.lokasi?.toLowerCase().includes(q)
        if (!matchTitle && !matchTicket && !matchLoc) return false
      }

      return true
    })
  }, [reportsList, tabFilter, searchQuery])

  const totalPublik = reportsList.filter((r) => r.is_public !== false).length
  const totalPrivat = reportsList.filter((r) => r.is_public === false).length

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Moderasi &amp; Distribusi Feed Publik
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kendalikan laporan mana saja yang layak ditampilkan secara terbuka atau disembunyikan demi privasi warga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/halo-jurnal/feed-publik"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Lihat Feed Warga Langsung</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:underline font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. Kartu Metrik Distribusi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Sedang Tayang di Feed Publik</p>
            <p className="text-2xl font-heading font-bold text-emerald-600 mt-1">{totalPublik}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Disembunyikan / Laporan Privat</p>
            <p className="text-2xl font-heading font-bold text-slate-700 mt-1">{totalPrivat}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Aduan Terdaftar</p>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{reportsList.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Panel Filter & Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Filter */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTabFilter('publik')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                tabFilter === 'publik'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tayang di Publik ({totalPublik})</span>
            </button>
            <button
              onClick={() => setTabFilter('privat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                tabFilter === 'privat'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Disembunyikan ({totalPrivat})</span>
            </button>
            <button
              onClick={() => setTabFilter('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                tabFilter === 'semua'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({reportsList.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor tiket, judul..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015]"
            />
          </div>
        </div>
      </div>

      {/* 4. Tabel Moderasi Publik */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredReports.length}</strong> laporan
          </span>
          <span className="text-[11px]">Gunakan tombol aksi untuk menarik atau memunculkan laporan seketika</span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-800">Tidak ada laporan yang sesuai kriteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Tiket</th>
                  <th className="py-3 px-4">Judul Aduan Warga</th>
                  <th className="py-3 px-4">Status Penanganan</th>
                  <th className="py-3 px-4">Status Visibilitas</th>
                  <th className="py-3 px-4">Dukungan Warga</th>
                  <th className="py-3 px-4 text-right">Moderasi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* No. Tiket */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-700">
                      {report.nomor_tiket}
                    </td>

                    {/* Judul & Lokasi */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-semibold text-slate-900 line-clamp-1">{report.judul}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{report.lokasi}</p>
                    </td>

                    {/* Status Penanganan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200">
                        {report.status}
                      </span>
                    </td>

                    {/* Status Visibilitas */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {report.is_public !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Globe className="w-3 h-3 text-emerald-600" />
                          <span>Tayang di Publik</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          <Lock className="w-3 h-3 text-slate-600" />
                          <span>Disembunyikan (Privat)</span>
                        </span>
                      )}
                    </td>

                    {/* Dukungan */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-800">
                      {report.dukungan_count || 0} suara
                    </td>

                    {/* Aksi Moderasi Cepat */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Tombol Tarik / Tayangkan Seketika */}
                        {report.is_public !== false ? (
                          <button
                            onClick={() => handleToggleVisibility(report.id, false)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-[#c00015] border border-slate-300 hover:border-rose-200 transition cursor-pointer"
                            title="Tarik laporan ini dari Feed Publik"
                          >
                            Tarik dari Publik
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleVisibility(report.id, true)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer"
                            title="Tayangkan kembali laporan ini ke Feed Publik"
                          >
                            Tayangkan ke Publik
                          </button>
                        )}

                        <Link
                          href={`/halo-jurnal/admin/laporan/${report.id}`}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 transition"
                          title="Buka Meja Eksekusi Laporan"
                        >
                          <Eye className="w-4 h-4" />
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
