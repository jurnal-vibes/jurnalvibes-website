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
  Phone,
  Loader2,
} from 'lucide-react'
import { DummyReport } from '@/data/dummyReports'

export default function AdminDetailLaporanPage() {
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<DummyReport | null>(null)
  const [currentStatus, setCurrentStatus] = useState<DummyReport['status']>('diterima')
  const [isPublic, setIsPublic] = useState<boolean>(true)
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
  const [statusLogs, setStatusLogs] = useState<
    NonNullable<DummyReport['status_log']>
  >([])

  // Muat data laporan dari database Neon DB via /api/reports (dengan fallback dummy & localStorage)
  useEffect(() => {
    let isMounted = true

    const loadReportDetail = async () => {
      setLoading(true)
      let found: DummyReport | null = null

      // 1. Fetch langsung dari Neon DB via /api/reports?ticket=${encodeURIComponent(id)}
      try {
        const res = await fetch(`/api/reports?ticket=${encodeURIComponent(id)}`, {
          cache: 'no-store',
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            found = json.data[0]
          }
        }
      } catch (err) {
        console.warn('Gagal memuat detail laporan dari API:', err)
      }

      // 2. Fallback: localStorage jika DB tidak mengembalikan
      if (!found && typeof window !== 'undefined') {
        try {
          const userReports = JSON.parse(
            localStorage.getItem('halo_jurnal_user_reports') || '[]'
          )
          const local = userReports.find(
            (r: any) => r.id === id || r.nomor_tiket === id || r.ticket_number === id
          )
          if (local) found = local
        } catch {}
      }

      // 3. Gabungkan dengan localStorage status overrides jika ada
      if (found && typeof window !== 'undefined') {
        try {
          const overrides = JSON.parse(
            localStorage.getItem('halo_jurnal_status_overrides') || '{}'
          )
          const saved =
            overrides[id] ||
            (found.id ? overrides[found.id] : null) ||
            (found.nomor_tiket ? overrides[found.nomor_tiket] : null)

          if (saved) {
            found = {
              ...found,
              status: saved.status || found.status,
              is_public: saved.is_public !== undefined ? saved.is_public : found.is_public,
              status_log: saved.status_log || found.status_log,
            }
          }
        } catch {}
      }

      if (isMounted) {
        if (found) {
          setReport(found)
          setCurrentStatus(found.status || 'diterima')
          setIsPublic(found.is_public !== undefined ? found.is_public : true)
          if (found.status_log && found.status_log.length > 0) {
            setStatusLogs(found.status_log)
          } else {
            setStatusLogs([
              {
                id: 'log-001',
                status: found.status || 'diterima',
                catatan: 'Laporan warga diterima oleh sistem redaksi.',
                created_at: found.created_at || new Date().toISOString(),
              },
            ])
          }
        } else {
          setReport(null)
        }
        setLoading(false)
      }
    }

    if (id) {
      loadReportDetail()
    }

    return () => {
      isMounted = false
    }
  }, [id])

  // Sinkronisasi pesan chat dua arah dengan pelapor
  const syncChatMessages = async () => {
    const targetTicket = report?.nomor_tiket || id
    const targetId = report?.id || id
    let dbMessages: any[] = []

    try {
      const res = await fetch(`/api/chat?ticketNumber=${encodeURIComponent(targetTicket)}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          dbMessages = json.data
        }
      }
    } catch {}

    let merged = dbMessages
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

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-[#c00015]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Memuat Detail Investigasi Laporan...</h2>
          <p className="text-xs text-slate-500">
            Sedang menghubungkan ke basis data redaksi untuk tiket <code>{id}</code>
          </p>
        </div>
      </div>
    )
  }

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
  const handleSaveAction = async (e: React.FormEvent) => {
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



    // 3. Simpan ke localStorage agar sinkron dengan Feed Publik & Halaman Warga
    // Kirim pembaruan status ke MySQL XAMPP via API
    try {
      await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: report.id,
          ticketNumber: report.nomor_tiket,
          status: currentStatus,
          is_public: isPublic,
          catatan: defaultNote,
        }),
      })
    } catch (err) {
      console.warn('Gagal simpan pembaruan status ke MySQL:', err)
    }

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

  // Helper warna badge status (Harmonisasi Monokrom Redaksi - Pembeda Kurung Bersih)
  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case 'selesai':
      case 'ditayangkan':
        return {
          label: '[Ditayangkan]',
          bg: 'bg-slate-100 text-slate-800 border border-slate-200',
        }
      case 'diproses':
      case 'konfirmasi':
        return {
          label: '[Diproses]',
          bg: 'bg-slate-100 text-slate-800 border border-slate-200',
        }
      case 'ditindaklanjuti':
        return {
          label: '[Ditindaklanjuti]',
          bg: 'bg-slate-100 text-slate-800 border border-slate-200',
        }
      case 'ditolak':
        return {
          label: '[Ditolak]',
          bg: 'bg-slate-100 text-slate-800 border border-slate-200',
        }
      default:
        return {
          label: '[Menunggu Review]',
          bg: 'bg-slate-100 text-slate-800 border border-slate-200',
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Tayang Publik
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
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
            {(() => {
              const rawPhone = (report as any)?.phone || (report as any)?.pelaporPhone || (report as any)?.telepon || '081234567890'
              const cleanWaNumber = rawPhone.replace(/[^0-9]/g, '').replace(/^0/, '62')
              const pelaporNama = (report as any)?.pelaporName || (report as any)?.nama_pelapor || 'Warga Sukabumi'
              const waUrl = `https://wa.me/${cleanWaNumber}?text=Halo%20${encodeURIComponent(pelaporNama)},%20kami%20dari%20Tim%20Redaksi%20Jurnal%20Sukabumi%20ingin%20mengonfirmasi%20laporan%20nomor%20${encodeURIComponent(report.nomor_tiket)}.`

              return (
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                  {/* Info Identitas Pelapor */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0 border border-slate-200 mt-0.5">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {pelaporNama}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                          Warga Terverifikasi
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Identitas Otomatis Dirahasiakan di Publik
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                        <span>Alamat: {(report as any).alamat_domisili || (report as any).domisili || (report as any).address || 'Sukabumi, Jawa Barat'}</span>
                        <span>•</span>
                        <span>Kontak WA: <strong>{rawPhone}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi Komunikasi Redaksi: Bersih, Rapi, Sejajar & Tidak Terpotong */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs whitespace-nowrap transition shadow-2xs cursor-pointer"
                      title="Buka WhatsApp Pelapor"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Hubungi via WhatsApp</span>
                    </a>
                    <a
                      href={`/halo-jurnal/admin/chat?ticket=${report.nomor_tiket || report.id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200 whitespace-nowrap transition shadow-2xs cursor-pointer"
                      title="Buka Ruang Obrolan Web"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Buka Chat di Web</span>
                    </a>
                  </div>

                  {/* Status Pernyataan Hukum */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Pernyataan Pertanggungjawaban Hukum Sah:</strong> Pelapor telah menyetujui pernyataan siap hadir dan bertanggung jawab secara hukum atas kebenaran laporan ini.
                    </span>
                  </div>
                </div>
              )
            })()}

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
              {/* 1. Tahapan Penanganan (Grid 2 Kolom Rapi & Lega, Bebas Tumpang Tindih) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Tahap Penanganan
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  {[
                    { key: 'diterima', label: 'Menunggu Review' },
                    { key: 'diproses', label: 'Diproses' },
                    { key: 'ditindaklanjuti', label: 'Ditindaklanjuti' },
                    { key: 'selesai', label: 'Ditayangkan' },
                    { key: 'ditolak', label: 'Ditolak / Arsip' },
                  ].map((st, idx) => {
                    const isSelected = currentStatus === st.key
                    const isFull = idx === 4
                    return (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setCurrentStatus(st.key as DummyReport['status'])}
                        className={`py-2 px-2 text-center rounded-lg font-semibold text-xs transition cursor-pointer flex items-center justify-center whitespace-nowrap ${
                          isFull ? 'col-span-2' : 'col-span-1'
                        } ${
                          isSelected
                            ? 'bg-[#c00015] text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs'
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

                <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`py-2 px-2 rounded-lg font-semibold text-xs transition cursor-pointer text-center whitespace-nowrap ${
                      isPublic
                        ? 'bg-[#c00015] text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    Tayang di Feed Publik
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`py-2 px-2 rounded-lg font-semibold text-xs transition cursor-pointer text-center whitespace-nowrap ${
                      !isPublic
                        ? 'bg-[#c00015] text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs'
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
                  <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-slate-700 ring-4 ring-slate-100" />
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
