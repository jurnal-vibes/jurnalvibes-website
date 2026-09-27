'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldCheck,
  ExternalLink,
  Eye,
  Globe,
  User,
  FileText,
  X,
  Check,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { DUMMY_REPORTS, DummyReport } from '@/data/dummyReports'
import { createClient } from '@/lib/supabase/client'

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
  const [editorialNote, setEditorialNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<{
    status: string
    isPublic: boolean
    message: string
  } | null>(null)
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  // Chat message counter
  const [chatMessages, setChatMessages] = useState<any[]>([])

  // Riwayat milestone toggle (default ringkas: 3 terbaru)
  const [showAllLogs, setShowAllLogs] = useState(false)

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

  // Sinkronisasi pesan chat dua arah dengan pelapor
  const syncChatMessages = async () => {
    const targetId = report?.id || initialReport?.id || id
    const targetTicket = report?.nomor_tiket || initialReport?.nomor_tiket

    let chatData: any = null
    try {
      const supabase = createClient()
      const res = await supabase
        .from('chat_messages')
        .select(`*, profiles:sender_id(full_name, role)`)
        .eq('laporan_id', targetId)
        .order('created_at', { ascending: true })
      chatData = res.data
    } catch {}

    let merged = chatData || []
    if (typeof window !== 'undefined') {
      const local = JSON.parse(
        localStorage.getItem(`halo_jurnal_chat_${targetId}`) ||
        (targetTicket ? localStorage.getItem(`halo_jurnal_chat_${targetTicket}`) : null) ||
        '[]'
      )
      const map = new Map<string, any>()
      merged.forEach((m: any) => map.set(m.id, m))
      local.forEach((m: any) => {
        if (!map.has(m.id)) map.set(m.id, m)
      })
      merged = Array.from(map.values()).sort(
        (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }
    setChatMessages(merged)
  }

  useEffect(() => {
    syncChatMessages()
    const handleStorageChange = () => {
      syncChatMessages()
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [report?.id, report?.nomor_tiket, id])

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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold"
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

  // Eksekusi Simpan Keputusan Redaksi (Terpadu: Status, Visibilitas, Catatan)
  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const hasStatusChanged = currentStatus !== report.status
    const hasVisibilityChanged = isPublic !== report.is_public
    const customNote = editorialNote.trim()

    const statusLabels: Record<string, string> = {
      diterima: 'Diterima',
      diproses: 'Diproses',
      ditindaklanjuti: 'Ditindaklanjuti',
      selesai: 'Selesai',
    }

    let defaultNote = ''
    if (customNote) {
      defaultNote = customNote
    } else if (hasStatusChanged && hasVisibilityChanged) {
      defaultNote = `Tahap diubah ke "${statusLabels[currentStatus] || currentStatus}" dan visibilitas diatur ke "${isPublic ? 'Tayang Publik' : 'Privat'}".`
    } else if (hasStatusChanged) {
      defaultNote = `Tahap penanganan diubah ke "${statusLabels[currentStatus] || currentStatus}".`
    } else if (hasVisibilityChanged) {
      defaultNote = `Visibilitas laporan diatur ke "${isPublic ? 'Tayang Publik' : 'Privat'}".`
    } else {
      defaultNote = `Keputusan redaksi diperbarui.`
    }

    const shouldAddLog = hasStatusChanged || hasVisibilityChanged || !!customNote

    const updatedLogs = shouldAddLog
      ? [
          {
            id: `log-${Date.now()}`,
            status: currentStatus,
            catatan: defaultNote,
            created_at: new Date().toISOString(),
          },
          ...statusLogs,
        ]
      : statusLogs

    setStatusLogs(updatedLogs)
    setEditorialNote('')

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
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving status override:', err)
      }
    }

    setActionSuccess({
      status: currentStatus,
      isPublic: isPublic,
      message: `Keputusan redaksi berhasil diperbarui.`,
    })
    setIsSubmitting(false)
    setTimeout(() => {
      setActionSuccess(null)
    }, 3500)
  }

  // Format kategori (Title Case)
  const formatCategory = (cat?: string) => {
    if (!cat) return 'Umum'
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
  }

  // Helper warna badge status (Stripe Modern Tag - Sudut Tumpul, Tint Lembut, Tanpa Border Pagar)
  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case 'selesai':
        return {
          label: 'Selesai',
          bg: 'bg-emerald-500/10 text-emerald-800',
          dot: 'bg-emerald-600',
        }
      case 'ditindaklanjuti':
        return {
          label: 'Ditindaklanjuti',
          bg: 'bg-purple-500/10 text-purple-800',
          dot: 'bg-purple-600',
        }
      case 'diproses':
        return {
          label: 'Diproses',
          bg: 'bg-blue-500/10 text-blue-800',
          dot: 'bg-blue-600',
        }
      default:
        return {
          label: 'Diterima',
          bg: 'bg-amber-500/10 text-amber-800',
          dot: 'bg-amber-600',
        }
    }
  }

  const currentBadge = getStatusBadgeConfig(report.status)

  // Data kontak pelapor
  const residentPhone =
    (report as any)?.phone ||
    (report as any)?.user_phone ||
    (report as any)?.telepon ||
    '0857-2345-6789'

  // Dedup log status untuk menghilangkan pesan spam berulang
  const cleanedLogs = statusLogs.filter((log, idx, arr) => {
    if (idx === 0) return true
    const prev = arr[idx - 1]
    return !(prev.status === log.status && prev.catatan === log.catatan)
  })

  // Tampilkan 3 riwayat terbaru jika mode ringkas aktif
  const visibleLogs = showAllLogs ? cleanedLogs : cleanedLogs.slice(0, 3)

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Header & Navigasi Eksekutif (Responsif Mobile & Desktop) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-slate-200">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            href="/halo-jurnal/admin/laporan"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition mt-0.5 sm:mt-0"
            title="Kembali ke Daftar Laporan"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                {report.nomor_tiket}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${currentBadge.bg}`}
              >
                {currentBadge.label}
              </span>
              {report.is_public ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-800">
                  Tayang Publik
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                  Privat
                </span>
              )}
            </div>
            <h1 className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">
              Tinjauan Aduan Warga
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href={`/halo-jurnal/laporan/${report.id}`}
            target="_blank"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Tampilan Warga</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href={
              report.is_public
                ? `/halo-jurnal/feed-publik?search=${encodeURIComponent(report.nomor_tiket)}`
                : `/halo-jurnal/feed-publik`
            }
            target="_blank"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Feed Publik</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 2. Grid Dua Kolom: Kiri (Dokumen Aduan Warga) & Kanan (Meja Eksekusi Redaksi) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= KOLOM KIRI (7 Col): DOKUMEN ADUAN WARGA ================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-5">
            {/* Meta Header Dokumen */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md text-xs">
                  {formatCategory(report.kategori)}
                </span>
                <span className="font-medium text-slate-500 bg-slate-100/70 px-2 py-0.5 rounded-md uppercase text-[10px] tracking-wider">
                  {report.jenis || 'Aspirasi'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(report.created_at)}</span>
              </div>
            </div>

            {/* Judul & Teks Aduan Warga (Tipografi Editorial Bersih) */}
            <div className="space-y-3">
              <h2 className="text-lg font-heading font-bold text-slate-900 leading-snug">
                {report.judul}
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line py-0.5">
                {report.deskripsi}
              </div>
            </div>

            {/* Lokasi Kejadian */}
            <div className="flex items-start gap-2.5 text-xs pt-3 border-t border-slate-100">
              <MapPin className="w-4 h-4 text-[#c00015] shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <p className="font-semibold text-slate-900">{report.lokasi}</p>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <a
                    href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#c00015] hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <span>Buka Titik Peta di Google Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Identitas Pelapor Terintegrasi */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0 border border-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">
                    {(report as any).is_anonim ? 'Pelapor Anonim' : 'Warga Sukabumi Terverifikasi'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    KTP Sah
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-slate-500 text-[11px]">{residentPhone}</span>
                </div>
              </div>

              <Link
                href="/halo-jurnal/admin/verifikasi-ktp"
                className="text-[11px] font-semibold text-[#c00015] hover:underline self-start sm:self-auto"
              >
                Cek Berkas KTP &rarr;
              </Link>
            </div>

            {/* Galeri Foto Bukti Lampiran */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
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

            {/* Bar Akses Chat Warga Bersih & Terarah */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Dialog dengan Pelapor:</span>
                {chatMessages.length > 0 ? (
                  <span className="font-semibold text-slate-900">{chatMessages.length} pesan terarsip</span>
                ) : (
                  <span className="text-slate-400 italic">Belum ada pesan</span>
                )}
              </div>
              <Link
                href={`/halo-jurnal/admin/chat?ticket=${report.nomor_tiket || report.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs self-start sm:self-auto"
              >
                <span>Buka di Pusat Chat Warga</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================= KOLOM KANAN (5 Col): MEJA EKSEKUSI REDAKSI ================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Panel Form Keputusan Terpadu */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Meja Eksekusi Redaksi
            </h3>

            <form onSubmit={handleSaveAction} className="space-y-4">
              {/* 1. Tahapan Penanganan (Segmented Bar Ramping & Elegan) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Tahap Penanganan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 p-1 rounded-lg bg-slate-100 border border-slate-200 gap-1 text-xs">
                  {[
                    { key: 'diterima', label: 'Diterima' },
                    { key: 'diproses', label: 'Diproses' },
                    { key: 'ditindaklanjuti', label: 'Ditindaklanjuti' },
                    { key: 'selesai', label: 'Selesai' },
                  ].map((st) => {
                    const isSelected = currentStatus === st.key
                    return (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setCurrentStatus(st.key as DummyReport['status'])}
                        className={`py-2 px-1 text-center rounded-md font-semibold text-xs transition cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#c00015] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        {st.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Visibilitas Feed Publik (Segmented Control Bersih) */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Hak Tayang Feed Warga
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 p-1 rounded-lg bg-slate-100 border border-slate-200 gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`py-1.5 px-3 rounded-md font-semibold text-xs transition cursor-pointer text-center ${
                      isPublic
                        ? 'bg-[#c00015] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tayang di Feed Publik
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`py-1.5 px-3 rounded-md font-semibold text-xs transition cursor-pointer text-center ${
                      !isPublic
                        ? 'bg-[#c00015] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Privat (Arsip Redaksi)
                  </button>
                </div>
              </div>

              {/* 3. Catatan Progres Redaksi */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Catatan Progres Redaksi (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={editorialNote}
                  onChange={(e) => setEditorialNote(e.target.value)}
                  placeholder="Ketik rilis atau catatan resmi tindak lanjut dinas..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] leading-relaxed transition"
                />
              </div>

              {/* Tombol Simpan Tunggal dengan Micro-Feedback */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wide transition shadow-2xs cursor-pointer text-center ${
                  actionSuccess
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#c00015] hover:bg-[#a00012] disabled:opacity-50 text-white'
                }`}
              >
                {actionSuccess ? '✓ Keputusan Berhasil Disimpan' : 'Simpan Keputusan Redaksi'}
              </button>
            </form>
          </div>

          {/* Timeline Riwayat Kronologi Penanganan (Bersih, Kompak & Expandable) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kronologi Riwayat Penanganan
                </h3>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {cleanedLogs.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Arsip Milestone</span>
            </div>

            {/* Riwayat Logs (Default: 3 Terbaru agar Tidak Menumpuk ke Bawah) */}
            <div className="relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {visibleLogs.map((log, idx) => (
                <div key={log.id || idx} className="relative text-xs space-y-1">
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
                  <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                    {log.catatan}
                  </p>
                </div>
              ))}
            </div>

            {/* Tombol Buka / Tutup Riwayat Lengkap */}
            {cleanedLogs.length > 3 && (
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAllLogs(!showAllLogs)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {showAllLogs ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tampilkan Lebih Ringkas (3 Terbaru)</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lihat Semua Riwayat ({cleanedLogs.length - 3} lainnya)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Zoom Foto Resolusi Penuh (Mobile Friendly Close Button) */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img
              src={activePhoto}
              alt="Foto Bukti Diperbesar"
              className="max-h-[85vh] max-w-full w-auto rounded-xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-2 right-2 sm:-top-3 sm:-right-3 p-2 bg-slate-900/90 hover:bg-black text-white rounded-full shadow-lg transition"
              title="Tutup foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Floating Feedback Toast (Zero Layout Shift, Pure Enterprise Standard) */}
      {actionSuccess && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-800 text-xs font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{actionSuccess.message}</span>
            <button
              onClick={() => setActionSuccess(null)}
              className="ml-2 text-slate-400 hover:text-white transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
