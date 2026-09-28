'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Search,
  Eye,
  Check,
  X,
  ExternalLink,
  FileText,
  Clock,
  XCircle,
} from 'lucide-react'

interface KtpVerificationItem {
  id: string
  resident_name: string
  email: string
  phone: string
  nik: string
  ktp_image_url: string
  ai_confidence: number
  ai_detected_name: string
  ai_detected_nik: string
  ai_notes: string
  status: 'flagged' | 'auto_approved' | 'manual_approved' | 'rejected'
  submitted_at: string
}

const INITIAL_KTP_DATA: KtpVerificationItem[] = [
  {
    id: 'KTP-001',
    resident_name: 'Dedi Supriadi',
    email: 'dedi.supriadi@email.com',
    phone: '0812-3456-7890',
    nik: '3202111508890003',
    ktp_image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    ai_confidence: 68,
    ai_detected_name: 'DEDI SUPRIADI',
    ai_detected_nik: '3202111508890003',
    ai_notes: 'Foto KTP agak buram di sudut kanan bawah karena pantulan cahaya.',
    status: 'flagged',
    submitted_at: '2026-09-26T08:15:00Z',
  },
  {
    id: 'KTP-002',
    resident_name: 'Siti Nurhaliza',
    email: 'siti.nur@email.com',
    phone: '0857-9876-5432',
    nik: '3202055204950001',
    ktp_image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    ai_confidence: 72,
    ai_detected_name: 'SITI NUR HALIZAH',
    ai_detected_nik: '3202055204950001',
    ai_notes: 'Terdapat perbedaan penulisan spasi nama antara formulir dengan dokumen e-KTP fisik.',
    status: 'flagged',
    submitted_at: '2026-09-26T09:30:00Z',
  },
  {
    id: 'KTP-003',
    resident_name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@email.com',
    phone: '0813-8877-6655',
    nik: '3202120101900005',
    ktp_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    ai_confidence: 98,
    ai_detected_name: 'AHMAD FAUZI',
    ai_detected_nik: '3202120101900005',
    ai_notes: 'Seluruh karakter NIK dan nama terverifikasi sesuai data kependudukan.',
    status: 'auto_approved',
    submitted_at: '2026-09-25T14:20:00Z',
  },
  {
    id: 'KTP-004',
    resident_name: 'Budi Santoso',
    email: 'budi.s@email.com',
    phone: '0821-4455-6677',
    nik: '3202141011880002',
    ktp_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    ai_confidence: 96,
    ai_detected_name: 'BUDI SANTOSO',
    ai_detected_nik: '3202141011880002',
    ai_notes: 'Format e-KTP wilayah Jawa Barat valid dan terverifikasi.',
    status: 'auto_approved',
    submitted_at: '2026-09-25T11:05:00Z',
  },
  {
    id: 'KTP-005',
    resident_name: 'Hendra Gunawan',
    email: 'hendra.g@email.com',
    phone: '0899-1234-5678',
    nik: '3202000000000000',
    ktp_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    ai_confidence: 25,
    ai_detected_name: 'TIDAK TERDETEKSI',
    ai_detected_nik: 'TIDAK TERDETEKSI',
    ai_notes: 'Bukan gambar fisik e-KTP yang valid. Gambar berupa foto profil non-identitas.',
    status: 'rejected',
    submitted_at: '2026-09-24T16:45:00Z',
  },
]

export default function AdminVerifikasiKtpPage() {
  const [items, setItems] = useState<KtpVerificationItem[]>(INITIAL_KTP_DATA)
  const [filterTab, setFilterTab] = useState<string>('flagged')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<KtpVerificationItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Muat status verifikasi dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('halo_jurnal_ktp_verifications')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed)
            return
          }
        }
        localStorage.setItem(
          'halo_jurnal_ktp_verifications',
          JSON.stringify(INITIAL_KTP_DATA)
        )
      } catch (err) {
        console.error('Error loading KTP verifications:', err)
      }
    }
  }, [])

  const persistItems = (updated: KtpVerificationItem[]) => {
    setItems(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'halo_jurnal_ktp_verifications',
          JSON.stringify(updated)
        )
        // Kirim event realtime agar sidebar badge terupdate seketika
        window.dispatchEvent(new Event('storage'))
      } catch (err) {
        console.error('Error saving KTP verifications:', err)
      }
    }
  }

  // Mask NIK demi privasi (UU PDP)
  const maskNik = (nik: string) => {
    if (nik.length < 16) return nik
    return `${nik.slice(0, 6)}******${nik.slice(12)}`
  }

  // Aksi Redaksi
  const handleApprove = (id: string) => {
    const updated: KtpVerificationItem[] = items.map((item) =>
      item.id === id ? { ...item, status: 'manual_approved' as const } : item
    )
    persistItems(updated)
    if (selectedItem?.id === id) {
      setSelectedItem(null)
    }
    setToastMessage('Dokumen KTP berhasil diverifikasi dan disetujui.')
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleReject = (id: string, reason: string) => {
    const updated: KtpVerificationItem[] = items.map((item) =>
      item.id === id ? { ...item, status: 'rejected' as const, ai_notes: reason } : item
    )
    persistItems(updated)
    if (selectedItem?.id === id) {
      setSelectedItem(null)
    }
    setToastMessage('Dokumen KTP ditolak. Pelapor diminta mengunggah ulang.')
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filterTab === 'flagged' && item.status !== 'flagged') return false
    if (
      filterTab === 'approved' &&
      item.status !== 'auto_approved' &&
      item.status !== 'manual_approved'
    )
      return false
    if (filterTab === 'rejected' && item.status !== 'rejected') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = item.resident_name.toLowerCase().includes(q)
      const matchNik = item.nik.includes(q)
      const matchEmail = item.email.toLowerCase().includes(q)
      if (!matchName && !matchNik && !matchEmail) return false
    }

    return true
  })

  const countFlagged = items.filter((i) => i.status === 'flagged').length
  const countApproved = items.filter(
    (i) => i.status === 'auto_approved' || i.status === 'manual_approved'
  ).length
  const countRejected = items.filter((i) => i.status === 'rejected').length

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman Bersih & Profesional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Verifikasi KTP Warga
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemeriksaan dan validasi keaslian berkas e-KTP pelapor aduan warga Sukabumi.
          </p>
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

      {/* 2. Kartu Ringkasan Status Verifikasi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Menunggu Tinjauan */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Menunggu Tinjauan</span>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900">{countFlagged}</p>
          <p className="text-[11px] text-slate-500">Perlu pemeriksaan manual berkas</p>
        </div>

        {/* Terverifikasi */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Terverifikasi Sah</span>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900">{countApproved}</p>
          <p className="text-[11px] text-slate-500">Kesesuaian data kependudukan sah</p>
        </div>

        {/* Ditolak */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Ditolak</span>
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900">{countRejected}</p>
          <p className="text-[11px] text-slate-500">Dokumen tidak memenuhi persyaratan</p>
        </div>
      </div>

      {/* 3. Filter Segmented & Kolom Pencarian */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTab('flagged')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterTab === 'flagged'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>Menunggu Tinjauan</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                filterTab === 'flagged' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {countFlagged}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('approved')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterTab === 'approved'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>Terverifikasi Sah</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                filterTab === 'approved' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {countApproved}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('rejected')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterTab === 'rejected'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>Ditolak</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                filterTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {countRejected}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-[#c00015] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>Semua Berkas</span>
            </button>
          </div>

          {/* Kolom Pencarian */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama warga atau NIK..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c00015] transition"
            />
          </div>
        </div>
      </div>

      {/* 4. Tabel Daftar Berkas KTP (Desktop Pas, Mobile Scrollable) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] md:min-w-0 table-fixed text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 pl-4 pr-3 whitespace-nowrap w-[240px]">Nama Pelapor &amp; Kontak</th>
                <th className="py-3 px-2 whitespace-nowrap w-[130px]">NIK (Terproteksi)</th>
                <th className="py-3 px-2 whitespace-nowrap w-[100px]">Kesesuaian</th>
                <th className="py-3 px-3">Catatan Hasil Cek</th>
                <th className="py-3 px-2 whitespace-nowrap w-[115px]">Status</th>
                <th className="py-3 pl-2 pr-4 whitespace-nowrap w-[125px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="font-semibold text-slate-600">Tidak ada berkas ditemukan</p>
                    <p className="text-[11px]">Coba sesuaikan filter atau kata kunci pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nama & Kontak */}
                    <td className="py-3 px-3.5 align-middle min-w-0">
                      <p className="font-heading font-semibold text-slate-900 truncate">
                        {item.resident_name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={`${item.phone} • ${item.email}`}>
                        {item.phone} • {item.email}
                      </p>
                    </td>

                    {/* NIK */}
                    <td className="py-3 px-2 whitespace-nowrap align-middle">
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {maskNik(item.nik)}
                      </span>
                    </td>

                    {/* Skor Kesesuaian */}
                    <td className="py-3 px-2 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${
                              item.ai_confidence >= 85
                                ? 'bg-slate-800'
                                : item.ai_confidence >= 60
                                ? 'bg-slate-600'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${item.ai_confidence}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-slate-800 text-xs">
                          {item.ai_confidence}%
                        </span>
                      </div>
                    </td>

                    {/* Catatan Validasi */}
                    <td className="py-3 px-3 align-middle min-w-0">
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {item.ai_notes}
                      </p>
                    </td>

                    {/* Status Badge (Ghost Minimalist Linear-Style - Clean Neutral Typography) */}
                    <td className="py-3 px-2 whitespace-nowrap align-middle">
                      {item.status === 'flagged' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Perlu Tinjau</span>
                        </span>
                      )}
                      {(item.status === 'auto_approved' || item.status === 'manual_approved') && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                          <span>Terverifikasi</span>
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ditolak</span>
                        </span>
                      )}
                    </td>

                    {/* Tombol Aksi */}
                    <td className="py-3 pl-2 pr-4 whitespace-nowrap align-middle text-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#c00015] hover:text-white hover:border-[#c00015] text-slate-800 border border-slate-200 text-xs font-semibold transition shadow-2xs cursor-pointer group"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                        <span>Periksa</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal / Dialog Inspeksi Berkas Bersanding */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#c00015]" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Verifikasi Dokumen: {selectedItem.resident_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Isi Inspeksi Bersanding */}
            <div className="p-5 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kiri: Foto Dokumen KTP */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Foto Fisik e-KTP Pelapor:
                  </p>
                  <div className="rounded-xl border border-slate-200 bg-slate-100 overflow-hidden aspect-[16/10] relative group">
                    <img
                      src={selectedItem.ktp_image_url}
                      alt="Foto Dokumen KTP"
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={selectedItem.ktp_image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-xs font-semibold rounded-md flex items-center gap-1 backdrop-blur-xs transition"
                    >
                      <span>Buka Resolusi Penuh</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Kanan: Hasil Ekstraksi Data */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Hasil Ekstraksi Dokumen:</span>
                  </p>

                  <div className="space-y-2 divide-y divide-slate-200/60">
                    <div className="pt-1">
                      <span className="text-slate-500">Nama di Formulir:</span>
                      <p className="font-bold text-slate-900">{selectedItem.resident_name}</p>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-500">Nama pada Fisik KTP:</span>
                      <p className="font-bold text-slate-900">
                        {selectedItem.ai_detected_name}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-500">NIK Terbaca:</span>
                      <p className="font-mono font-bold text-slate-900">
                        {selectedItem.ai_detected_nik}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-500">Tingkat Kesesuaian:</span>
                      <p className="font-bold text-slate-900">
                        {selectedItem.ai_confidence}%
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-500">Catatan Validasi:</span>
                      <p className="text-slate-700 leading-relaxed mt-0.5">
                        {selectedItem.ai_notes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Aksi Modal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                onClick={() =>
                  handleReject(
                    selectedItem.id,
                    'Foto KTP buram atau tidak terbaca dengan jelas. Pelapor diminta mengunggah ulang foto fisik e-KTP.'
                  )
                }
                className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer text-center"
              >
                Tolak Dokumen
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer text-center"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleApprove(selectedItem.id)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-semibold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Setujui KTP Sah</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
