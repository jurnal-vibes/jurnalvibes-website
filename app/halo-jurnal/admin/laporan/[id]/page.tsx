'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Eye,
  Globe,
  Lock,
  User,
  Check,
  FileText,
  X,
  Radio,
  Building,
} from 'lucide-react'
import { DUMMY_REPORTS, DummyReport } from '@/data/dummyReports'

export default function AdminDetailLaporanPage() {
  const params = useParams()
  const id = params?.id as string

  // Ambil data laporan awal
  const initialReport = DUMMY_REPORTS.find(
    (r) => r.id === id || r.nomor_tiket === id
  )

  const [report, setReport] = useState<DummyReport | null>(initialReport || null)
  const [currentStatus, setCurrentStatus] = useState<DummyReport['status']>(
    initialReport?.status || 'diterima'
  )
  const [isPublic, setIsPublic] = useState<boolean>(initialReport?.is_public ?? true)
  const [actionNote, setActionNote] = useState('')
  const [notifyResident, setNotifyResident] = useState(true)
  const [actionSuccess, setActionSuccess] = useState<{
    status: string
    isPublic: boolean
    message: string
  } | null>(null)
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  // Status logs
  const [statusLogs, setStatusLogs] = useState(
    initialReport?.status_log || [
      {
        id: 'log-001',
        status: initialReport?.status || 'diterima',
        catatan: 'Laporan warga diterima oleh sistem redaksi.',
        created_at: initialReport?.created_at || new Date().toISOString(),
      },
    ]
  )

  // Muat override dari localStorage saat halaman dibuka
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        let currentTarget = initialReport
        if (!currentTarget) {
          const userReports = JSON.parse(
            localStorage.getItem('halo_jurnal_user_reports') || '[]'
          )
          currentTarget = userReports.find(
            (r: any) => r.id === id || r.nomor_tiket === id || r.ticket_number === id
          )
        }

        const overrides = JSON.parse(
          localStorage.getItem('halo_jurnal_status_overrides') || '{}'
        )
        const saved =
          overrides[id] ||
          (currentTarget?.id ? overrides[currentTarget.id] : null) ||
          (currentTarget?.nomor_tiket ? overrides[currentTarget.nomor_tiket] : null)

        if (currentTarget) {
          const merged: DummyReport = {
            ...currentTarget,
            status: saved?.status || currentTarget.status,
            is_public: saved?.is_public !== undefined ? saved.is_public : currentTarget.is_public,
            status_log: saved?.status_log || currentTarget.status_log || statusLogs,
          }
          setReport(merged)
          setCurrentStatus(merged.status)
          setIsPublic(merged.is_public)
          if (merged.status_log) setStatusLogs(merged.status_log)
        }
      } catch (err) {
        console.error('Error loading overrides:', err)
      }
    }
  }, [id])

  if (!report) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">Laporan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            ID tiket <code>{id}</code> tidak terdaftar di sistem.
          </p>
        </div>
        <Link
          href="/halo-jurnal/admin/laporan"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Laporan</span>
        </Link>
      </div>
    )
  }

  // Format tanggal
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // Eksekusi Simpan Tindak Lanjut (Terpadu: Status + Visibilitas + Catatan)
  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault()

    const newLog = {
      id: `log-${Date.now()}`,
      status: currentStatus,
      catatan:
        actionNote.trim() ||
        `Status laporan diubah menjadi "${currentStatus}" dan visibilitas diatur ke "${
          isPublic ? 'Tayang Publik' : 'Privat/Rahasia'
        }" oleh Redaksi.`,
      created_at: new Date().toISOString(),
    }

    const updatedLogs = [newLog, ...statusLogs]
    setStatusLogs(updatedLogs)

    // 1. Update state report lokal seketika
    const updatedReport: DummyReport = {
      ...report,
      status: currentStatus,
      is_public: isPublic,
      status_log: updatedLogs,
    }
    setReport(updatedReport)

    // 2. Update objek in-memory DUMMY_REPORTS
    const target = DUMMY_REPORTS.find(
      (r) => r.id === report.id || r.nomor_tiket === report.nomor_tiket
    )
    if (target) {
      target.status = currentStatus
      target.is_public = isPublic
      target.status_log = updatedLogs
    }

    // 3. Simpan ke localStorage agar sinkron dengan Feed Publik & Halaman Warga
    if (typeof window !== 'undefined') {
      try {
        const overrides = JSON.parse(
          localStorage.getItem('halo_jurnal_status_overrides') || '{}'
        )
        const payload = {
          status: currentStatus,
          is_public: isPublic,
          status_log: updatedLogs,
        }
        overrides[report.id] = payload
        if (report.nomor_tiket) {
          overrides[report.nomor_tiket] = payload
        }
        localStorage.setItem(
          'halo_jurnal_status_overrides',
          JSON.stringify(overrides)
        )

        // Perbarui data user reports jika ada
        const userReports = JSON.parse(
          localStorage.getItem('halo_jurnal_user_reports') || '[]'
        )
        const updatedUserReports = userReports.map((r: any) =>
          r.id === report.id || r.ticket_number === report.id || r.nomor_tiket === report.id
            ? { ...r, status: currentStatus, is_public: isPublic, status_log: updatedLogs }
            : r
        )
        localStorage.setItem(
          'halo_jurnal_user_reports',
          JSON.stringify(updatedUserReports)
        )
        // Kirim event realtime agar seluruh tab/komponen langsung tersinkron
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving status override:', err)
      }
    }

    setActionNote('')
    setActionSuccess({
      status: currentStatus,
      isPublic: isPublic,
      message: `Keputusan Redaksi berhasil disimpan ke sistem!`,
    })
  }

  // Format kategori (Title Case)
  const formatCategory = (cat?: string) => {
    if (!cat) return 'Umum'
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
  }

  // Helper warna badge status
  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case 'selesai':
        return {
          label: 'Selesai Dituntaskan',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        }
      case 'ditindaklanjuti':
        return {
          label: 'Koordinasi Dinas',
          color: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          icon: AlertTriangle,
        }
      case 'diproses':
        return {
          label: 'Investigasi Lapangan',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          icon: Search,
        }
      default:
        return {
          label: 'Menunggu Verifikasi',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock,
        }
    }
  }

  const currentBadge = getStatusBadgeConfig(report.status)
  const CurrentIcon = currentBadge.icon

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/halo-jurnal/admin/laporan"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Kembali ke Daftar Laporan"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {report.nomor_tiket}
              </span>
              <span className="text-[11px] text-slate-400">•</span>
              <span className="text-[11px] text-slate-500 font-medium">Tinjauan Berkas Pengaduan</span>
            </div>
            <h1 className="text-lg font-heading font-bold text-slate-900 tracking-tight">
              Tinjauan &amp; Tindak Lanjut Laporan Warga
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/halo-jurnal/laporan/${report.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Lihat Tampilan Warga</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 2. Banner Indikator Nyata Status & Distribusi Publik (Kondisi Terkini di Sistem) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Status Tahapan */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tahap Penanganan Saat Ini
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${currentBadge.color}`}
                >
                  <CurrentIcon className="w-3.5 h-3.5" />
                  <span>{currentBadge.label}</span>
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Status Visibilitas Publik */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Status Tayang di Portal Warga
              </span>
              <div className="flex items-center gap-2">
                {report.is_public ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>🌐 Tayang di Feed Publik Warga</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    <span>🔒 Disembunyikan (Laporan Privat)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tombol Aksi Pembuktian Langsung ke Portal */}
          <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <Link
              href={
                report.is_public
                  ? `/halo-jurnal/feed-publik?search=${encodeURIComponent(report.nomor_tiket)}`
                  : `/halo-jurnal/feed-publik`
              }
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition"
              title="Buka Feed Publik untuk memastikan laporan ada atau tersembunyi"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {report.is_public ? 'Buka di Feed Publik' : 'Pastikan Nihil di Feed'}
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Alert Konfirmasi Eksekusi Berhasil */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-sm space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  {actionSuccess.message}
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Status sekarang:{' '}
                  <strong className="capitalize">{actionSuccess.status}</strong> |
                  Visibilitas:{' '}
                  <strong>
                    {actionSuccess.isPublic
                      ? '🌐 Tayang di Feed Publik Warga'
                      : '🔒 Disembunyikan dari Publik (Privat)'}
                  </strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded hover:bg-emerald-100 transition"
            >
              ✕ Tutup
            </button>
          </div>

          <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-emerald-800 font-medium">Buktikan langsung:</span>
            <Link
              href={
                actionSuccess.isPublic
                  ? `/halo-jurnal/feed-publik?search=${encodeURIComponent(report.nomor_tiket)}`
                  : `/halo-jurnal/feed-publik`
              }
              target="_blank"
              className="inline-flex items-center gap-1 font-bold text-emerald-900 hover:underline"
            >
              <span>
                {actionSuccess.isPublic
                  ? 'Lihat di Feed Publik Warga ↗'
                  : 'Cek Feed Publik (Pastikan Laporan Hilang) ↗'}
              </span>
            </Link>
            <span className="text-emerald-300">•</span>
            <Link
              href={`/halo-jurnal/laporan/${report.id}`}
              target="_blank"
              className="inline-flex items-center gap-1 font-bold text-emerald-900 hover:underline"
            >
              <span>Buka Halaman Aduan Warga ↗</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4. Grid Dua Kolom: Kiri (Bukti Aduan Warga) & Kanan (Meja Eksekusi Redaksi) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= KOLOM KIRI (7 Col): FAKTA & BUKTI ADUAN ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Kartu 1: Kronologi Aduan Warga */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {formatCategory(report.kategori)}
                </span>
                <span className="text-slate-500 uppercase tracking-wider font-medium">
                  {report.jenis}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(report.created_at)}</span>
              </div>
            </div>

            {/* Judul & Deskripsi */}
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 leading-snug">
                {report.judul}
              </h2>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {report.deskripsi}
              </div>
            </div>

            {/* Titik Lokasi Masalah */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-[#c00015] shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-semibold text-slate-900">{report.lokasi}</p>
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span>
                    Koordinat: {report.latitude}, {report.longitude}
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#c00015] hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <span>Buka Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Galeri Foto Bukti */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Foto Bukti Lampiran ({report.laporan_lampiran?.length || 0})
                </h3>
                <span className="text-[11px] text-slate-400">Klik untuk perbesar</span>
              </div>

              {report.laporan_lampiran && report.laporan_lampiran.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {report.laporan_lampiran.map((lamp, i) => (
                    <div
                      key={lamp.id || i}
                      onClick={() => setActivePhoto(lamp.file_url)}
                      className="group cursor-pointer rounded-lg border border-slate-200 overflow-hidden bg-slate-100 aspect-video relative"
                    >
                      <img
                        src={lamp.file_url}
                        alt={`Bukti aduan ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                        Perbesar ↗
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-50 border border-slate-100">
                  Pelapor tidak mengunggah lampiran foto fisik.
                </p>
              )}
            </div>
          </div>

          {/* Kartu 2: Identitas & Keabsahan Pelapor */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Identitas Pelapor
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">
                      {(report as any).is_anonim ? 'Pelapor Anonim' : 'Warga Sukabumi Terverifikasi'}
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      KTP Sah
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Terverifikasi sistem NIK kependudukan Jawa Barat
                  </p>
                </div>
              </div>

              <Link
                href="/halo-jurnal/admin/verifikasi-ktp"
                className="text-[11px] font-semibold text-[#c00015] hover:underline self-end sm:self-center"
              >
                Cek Berkas KTP &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* ================= KOLOM KANAN (5 Col): MEJA EKSEKUSI REDAKSI ================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Panel Terpadu Eksekusi Tindak Lanjut */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider">
                  Meja Eksekusi Tindak Lanjut
                </h3>
                <span className="text-[11px] font-semibold text-[#c00015] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Panel Keputusan
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Tentukan tahapan laporan, atur apakah aduan ini boleh dibaca publik di feed warga, dan rilis tanggapan resmi.
              </p>
            </div>

            <form onSubmit={handleSaveAction} className="space-y-4">
              {/* BAGIAN 1: Pilihan 4 Tahapan Status */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Tahapan Penanganan Aduan:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'diterima', label: 'Menunggu', desc: 'Verifikasi Awal', icon: Clock, color: 'text-amber-700' },
                    { key: 'diproses', label: 'Investigasi', desc: 'Cek Lapangan', icon: Search, color: 'text-blue-700' },
                    { key: 'ditindaklanjuti', label: 'Dinas', desc: 'Koordinasi Instansi', icon: AlertTriangle, color: 'text-purple-700' },
                    { key: 'selesai', label: 'Dituntaskan', desc: 'Masalah Selesai', icon: CheckCircle2, color: 'text-emerald-700' },
                  ].map((st) => {
                    const isSelected = currentStatus === st.key
                    const Icon = st.icon
                    return (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setCurrentStatus(st.key as DummyReport['status'])}
                        className={`flex flex-col p-2.5 rounded-lg border text-left transition ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : st.color}`} />
                          <span>{st.label}</span>
                          {isSelected && <Check className="w-3 h-3 ml-auto text-emerald-400" />}
                        </div>
                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {st.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* BAGIAN 2: Pengaturan Visibilitas Publik (Tayang Feed Publik) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  2. Izin Tayang di Feed Publik Warga:
                </label>

                {/* Dua Kartu Pilihan Jelas (Publik vs Privat) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Opsi A: Tayang Publik */}
                  <div
                    onClick={() => setIsPublic(true)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      isPublic
                        ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Globe className={`w-3.5 h-3.5 ${isPublic ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span>Tayang Publik</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isPublic ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {isPublic && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                      Muncul di feed warga &amp; bisa didukung (upvote).
                    </p>
                  </div>

                  {/* Opsi B: Sembunyikan (Privat) */}
                  <div
                    onClick={() => setIsPublic(false)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      !isPublic
                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Lock className={`w-3.5 h-3.5 ${!isPublic ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span>Disembunyikan</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        !isPublic ? 'border-white bg-white text-slate-900' : 'border-slate-300'
                      }`}>
                        {!isPublic && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                      </div>
                    </div>
                    <p className={`text-[10px] mt-1 leading-snug ${!isPublic ? 'text-slate-300' : 'text-slate-500'}`}>
                      Hanya bisa diakses via tiket oleh pelapor &amp; admin.
                    </p>
                  </div>
                </div>

                {/* Keterangan Konsekuensi Nyata */}
                <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                  isPublic
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}>
                  {isPublic ? (
                    <p>
                      🟢 <strong>Laporan Tayang Publik:</strong> Seluruh warga Sukabumi dapat menemukan laporan ini di Feed Publik dan memberikan vote dukungan.
                    </p>
                  ) : (
                    <p>
                      🔒 <strong>Laporan Disembunyikan (Privat):</strong> Laporan ini ditarik dari Feed Publik warga. Warga umum tidak dapat melihat atau memberi dukungan.
                    </p>
                  )}
                </div>
              </div>

              {/* BAGIAN 3: Catatan Progres / Tanggapan Resmi */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  3. Catatan Progres / Rilis Dinas:
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Ketik keterangan tindak lanjut lapangan atau rilis resmi dinas..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed"
                />

                {/* Checkbox Notifikasi Warga */}
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={notifyResident}
                    onChange={(e) => setNotifyResident(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#c00015] focus:ring-[#c00015]"
                  />
                  <span>Tampilkan catatan ini di timeline akun pelapor</span>
                </label>
              </div>

              {/* 1 Tombol Simpan Terpadu */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Keputusan Redaksi</span>
              </button>
            </form>
          </div>

          {/* Timeline Riwayat Kronologi Penanganan */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kronologi Riwayat Penanganan
            </h3>

            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {statusLogs.map((log, idx) => (
                <div key={log.id || idx} className="relative text-xs space-y-1">
                  {/* Titik Peluru Berwarna Sesuai Status */}
                  <span
                    className={`absolute -left-4 top-1 w-2.5 h-2.5 rounded-full ${
                      log.status === 'selesai'
                        ? 'bg-emerald-500 ring-4 ring-emerald-50'
                        : log.status === 'ditindaklanjuti'
                        ? 'bg-purple-500 ring-4 ring-purple-50'
                        : log.status === 'diproses'
                        ? 'bg-blue-500 ring-4 ring-blue-50'
                        : 'bg-amber-500 ring-4 ring-amber-50'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 capitalize">
                      Tahap: {log.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                    {log.catatan}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Zoom Foto Resolusi Penuh */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={activePhoto}
              alt="Foto Bukti Diperbesar"
              className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-3 -right-3 p-1.5 bg-white text-slate-900 rounded-full shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
