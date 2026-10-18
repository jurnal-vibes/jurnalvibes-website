'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Globe,
  Lock,
  Search,
  Eye,
  ExternalLink,
  ShieldCheck,
  FileText,
  Check,
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
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error updating override:', err)
      }
    }

    setToastMessage(
      targetVisibility
        ? `Laporan "${target?.judul}" sekarang tayang di Feed Publik.`
        : `Laporan "${target?.judul}" berhasil ditarik dari Feed Publik.`
    )
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter list
  const filteredReports = useMemo(() => {
    return reportsList.filter((r) => {
      if (tabFilter === 'publik' && r.is_public === false) return false
      if (tabFilter === 'privat' && r.is_public !== false) return false

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

  // Helper warna badge status penanganan (Ghost Minimalist Linear-Style - Clean Neutral Typography)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Selesai</span>
      case 'ditindaklanjuti':
        return <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Ditindaklanjuti</span>
      case 'diproses':
        return <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Diproses</span>
      default:
        return <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Diterima</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Moderasi Feed Publik
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola hak tayang laporan warga pada portal publik Sukabumi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/halo-jurnal/feed-publik"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Buka Feed Publik</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Kartu Metrik Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Tayang Publik</p>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{totalPublik}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Dapat diakses warga</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Disembunyikan (Privat)</p>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{totalPrivat}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Khusus pelapor &amp; redaksi</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Aduan Terdaftar</p>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{reportsList.length}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Arsip seluruh laporan</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Panel Filter & Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setTabFilter('publik')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                tabFilter === 'publik'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Tayang Publik ({totalPublik})</span>
            </button>
            <button
              onClick={() => setTabFilter('privat')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                tabFilter === 'privat'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Disembunyikan ({totalPrivat})</span>
            </button>
            <button
              onClick={() => setTabFilter('semua')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                tabFilter === 'semua'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>Semua ({reportsList.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor tiket, judul..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
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
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">Tidak ada laporan yang sesuai kriteria</p>
            <p className="text-xs text-slate-400">Coba sesuaikan filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[680px] md:min-w-0 table-fixed text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 pl-4 pr-3 whitespace-nowrap w-[135px]">No. Tiket</th>
                  <th className="py-3 px-3">Judul &amp; Lokasi Aduan</th>
                  <th className="py-3 px-2.5 whitespace-nowrap w-[95px]">Status</th>
                  <th className="py-3 px-2.5 whitespace-nowrap w-[95px]">Visibilitas</th>
                  <th className="py-3 px-2 whitespace-nowrap w-[85px] text-center">Dukungan</th>
                  <th className="py-3 pl-2 pr-4 whitespace-nowrap w-[125px] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* No. Tiket */}
                    <td className="py-3 px-3.5 whitespace-nowrap align-middle">
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {report.nomor_tiket}
                      </span>
                    </td>

                    {/* Judul & Lokasi */}
                    <td className="py-3 px-3.5 align-middle min-w-0">
                      <Link
                        href={`/halo-jurnal/admin/laporan/${report.id}`}
                        className="font-semibold text-slate-900 hover:text-[#c00015] transition truncate block"
                      >
                        {report.judul}
                      </Link>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{report.lokasi}</p>
                    </td>

                    {/* Status Penanganan */}
                    <td className="py-3 px-2 whitespace-nowrap align-middle">
                      {getStatusBadge(report.status)}
                    </td>

                    {/* Status Visibilitas (Ghost Minimalist) */}
                    <td className="py-3 px-2 whitespace-nowrap align-middle">
                      {report.is_public !== false ? (
                        <span className="text-xs font-semibold text-slate-700">
                          Publik
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">
                          Privat
                        </span>
                      )}
                    </td>

                    {/* Dukungan */}
                    <td className="py-3 px-2 whitespace-nowrap align-middle text-center text-slate-700 font-semibold text-xs">
                      {report.dukungan_count || 0} suara
                    </td>

                    {/* Aksi Moderasi */}
                    <td className="py-3 pl-2 pr-4 whitespace-nowrap align-middle text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        {report.is_public !== false ? (
                          <button
                            onClick={() => handleToggleVisibility(report.id, false)}
                            className="px-2 py-1 rounded text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer shadow-2xs"
                            title="Tarik laporan ini dari Feed Publik"
                          >
                            Tarik
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleVisibility(report.id, true)}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-[#c00015] hover:bg-[#a00012] text-white transition cursor-pointer shadow-2xs"
                            title="Tayangkan kembali laporan ini ke Feed Publik"
                          >
                            Tayang
                          </button>
                        )}

                        <Link
                          href={`/halo-jurnal/admin/laporan/${report.id}`}
                          className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Buka Detail Laporan"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
