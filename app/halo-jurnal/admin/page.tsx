'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  ShieldCheck,
  ChevronRight,
  Eye,
  ArrowRight,
  MapPin,
} from 'lucide-react'
import { DUMMY_REPORTS, DummyReport } from '@/data/dummyReports'

export default function AdminDashboardPage() {
  const [filterStatus, setFilterStatus] = useState<string>('semua')
  const [reportsList, setReportsList] = useState<DummyReport[]>(DUMMY_REPORTS)

  const syncReports = () => {
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
        console.error('Error loading overrides in admin dashboard:', err)
      }
    }
  }

  useEffect(() => {
    syncReports()
    window.addEventListener('storage', syncReports)
    window.addEventListener('focus', syncReports)
    return () => {
      window.removeEventListener('storage', syncReports)
      window.removeEventListener('focus', syncReports)
    }
  }, [])

  const formatCategory = (cat?: string) => {
    if (!cat) return 'Umum'
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
  }

  const totalLaporan = reportsList.length
  const laporanSelesai = reportsList.filter((r) => r.status === 'selesai').length
  const laporanDiproses = reportsList.filter(
    (r) => r.status === 'diproses' || r.status === 'ditindaklanjuti'
  ).length
  const laporanDiterima = reportsList.filter((r) => r.status === 'diterima').length

  const filteredReports = reportsList.filter((item) => {
    if (filterStatus === 'semua') return true
    return item.status === filterStatus
  }).slice(0, 6)

  // Status badge styling (Ghost Minimalist Linear-Style - Clean Neutral Typography)
  const getStatusBadge = (status: DummyReport['status']) => {
    switch (status) {
      case 'diterima':
        return <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Diterima</span>
      case 'diproses':
        return <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Diproses</span>
      case 'ditindaklanjuti':
        return <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ditindaklanjuti</span>
      case 'selesai':
        return <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Selesai</span>
      default:
        return (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman Bersih */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Dashboard Redaksi &amp; Aduan Warga
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan operasional penanganan aspirasi publik Halo Jurnal Sukabumi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/halo-jurnal/admin/laporan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Semua Laporan Warga</span>
          </Link>
        </div>
      </div>

      {/* 2. Empat Kartu Metrik Utama (Monokrom Bersih, Angka Tegas) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Laporan */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Aduan</span>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900">{totalLaporan}</p>
          <p className="text-[11px] text-slate-500">Semua laporan terdaftar</p>
        </div>

        {/* Perlu Verifikasi */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Perlu Verifikasi</span>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900">{laporanDiterima}</p>
          <p className="text-[11px] text-slate-500 font-medium">Menunggu respon awal</p>
        </div>

        {/* Sedang Ditangani */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Dalam Penanganan</span>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900">{laporanDiproses}</p>
          <p className="text-[11px] text-slate-500">Investigasi &amp; Dinas</p>
        </div>

        {/* Selesai */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Dituntaskan</span>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900">{laporanSelesai}</p>
          <p className="text-[11px] text-slate-500 font-medium">Selesai ditangani</p>
        </div>
      </div>

      {/* 3. Kotak Tindakan Mendesak (Action Queue Ringkas) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-slate-800 leading-snug">
            <strong>Antrean Tindakan:</strong> Ada <strong>1 aduan baru</strong> belum ditinjau dan{' '}
            <strong>2 berkas KTP</strong> ditandai butuh verifikasi manual redaksi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/halo-jurnal/admin/verifikasi-ktp"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold transition shadow-2xs"
          >
            Tinjau KTP (2)
          </Link>
          <Link
            href="/halo-jurnal/admin/laporan"
            className="px-3 py-1.5 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white font-semibold transition shadow-2xs"
          >
            Buka Aduan Baru
          </Link>
        </div>
      </div>

      {/* 4. Tabel Tabular Laporan Warga (Data Table Asli) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header Tabel & Filter Cepat */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-heading font-bold text-slate-900">
              Daftar Aduan Warga Terbaru
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredReports.length} dari total {totalLaporan} laporan masyarakat.
            </p>
          </div>

          {/* Filter Status Sederhana */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 text-xs font-medium max-w-full overflow-x-auto no-scrollbar shrink-0">
            {(['semua', 'diterima', 'diproses', 'selesai'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-md capitalize text-xs whitespace-nowrap transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Tabular */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap w-36">No. Tiket</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[240px]">Judul &amp; Uraian Masalah</th>
                <th className="py-3.5 px-4 whitespace-nowrap w-28">Kategori</th>
                <th className="py-3.5 px-4 whitespace-nowrap w-36">Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap w-28">Feed</th>
                <th className="py-3.5 px-4 whitespace-nowrap w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* No. Tiket */}
                  <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                    <span className="font-mono text-xs font-semibold text-slate-700">
                      {report.nomor_tiket}
                    </span>
                  </td>

                  {/* Judul & Lokasi */}
                  <td className="py-3.5 px-4 max-w-sm align-middle">
                    <p className="font-semibold text-slate-900 line-clamp-1">{report.judul}</p>
                    <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{report.lokasi}</span>
                    </p>
                  </td>

                  {/* Kategori (Ghost Plain Text) */}
                  <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                    <span className="text-xs font-medium text-slate-700">
                      {formatCategory(report.kategori)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                    {getStatusBadge(report.status)}
                  </td>

                  {/* Feed Publik (Ghost Minimalist) */}
                  <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                    {report.is_public ? (
                      <span className="text-xs font-semibold text-slate-700">
                        Publik
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        Privat
                      </span>
                    )}
                  </td>

                  {/* Tombol Aksi */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center align-middle">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <Link
                        href={`/halo-jurnal/laporan/${report.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                        title="Tinjau Halaman Publik"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/halo-jurnal/admin/laporan/${report.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-[#c00015] hover:text-white hover:border-[#c00015] text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer group"
                      >
                        <span>Tinjau</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 text-center">
          <Link
            href="/halo-jurnal/admin/laporan"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#c00015] hover:underline"
          >
            <span>Buka Seluruh Laporan Warga &amp; Filter Wilayah Lengkap</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 5. Sebaran Masalah & Catatan Alur Kerja */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sebaran Masalah */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider">
            Sebaran Kategori Masalah Warga
          </h3>

          <div className="space-y-2.5">
            {[
              { label: 'Infrastruktur & Jalan Rusak', pct: 42, color: 'bg-[#c00015]' },
              { label: 'Pelayanan Publik & Instansi', pct: 28, color: 'bg-slate-700' },
              { label: 'Lingkungan & Kebersihan', pct: 18, color: 'bg-slate-500' },
              { label: 'Anggaran & Pungli', pct: 12, color: 'bg-slate-400' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catatan Standar Kerja Redaksi */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <h3 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider">
            Standar Penanganan Aduan Redaksi
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Panduan verifikasi fakta sebelum aduan diteruskan ke instansi dinas atau diterbitkan:
          </p>

          <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside">
            <li>Validasi foto barang bukti dan kejelasan titik koordinat lokasi.</li>
            <li>Pastikan identitas warga terverifikasi (KTP valid).</li>
            <li>Tulis tanggapan resmi dan teruskan ke instansi terkait untuk tindak lanjut.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
