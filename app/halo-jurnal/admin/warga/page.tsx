'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageSquare,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Check,
} from 'lucide-react'

interface CitizenItem {
  id: string
  email: string
  fullName: string
  phone: string
  domisili: string
  isVerified: boolean
  createdAt: string
  totalReports: number
}

export default function AdminWargaPage() {
  const [citizens, setCitizens] = useState<CitizenItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'ditangguhkan'>('semua')

  // Modal Reset Password State
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenItem | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)

  // Floating Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load citizens data from API
  const loadCitizens = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/citizens', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setCitizens(json.data)
        }
      }
    } catch (err) {
      console.error('Error fetching citizens:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCitizens()
  }, [])

  // Filter list
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = c.fullName.toLowerCase().includes(q)
        const matchEmail = c.email.toLowerCase().includes(q)
        const matchPhone = c.phone.includes(q)
        const matchDomisili = c.domisili.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchPhone && !matchDomisili) return false
      }

      // 2. Status filter
      if (statusFilter === 'aktif' && !c.isVerified) return false
      if (statusFilter === 'ditangguhkan' && c.isVerified) return false

      return true
    })
  }, [citizens, searchQuery, statusFilter])

  // Hitung stats
  const totalCount = citizens.length
  const activeCount = citizens.filter((c) => c.isVerified).length
  const totalReportsLinked = citizens.reduce((acc, c) => acc + (c.totalReports || 0), 0)

  // Format tanggal pendaftaran
  const formatDate = (isoString?: string) => {
    if (!isoString) return '-'
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  // Generate kata sandi acak yang aman
  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let pass = 'Sukabumi'
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    pass += '!'
    setNewPassword(pass)
  }

  // Handle Eksekusi Reset Password
  const handleExecuteResetPassword = async (sendViaWhatsApp: boolean) => {
    if (!selectedCitizen || !newPassword.trim()) return
    setResetting(true)
    setResetSuccess(null)

    try {
      const res = await fetch('/api/admin/citizens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: selectedCitizen.id,
          action: 'reset_password',
          newPassword: newPassword.trim(),
        }),
      })

      const json = await res.json()
      if (json.success) {
        setResetSuccess(newPassword.trim())
        setToastMessage(`Kata sandi untuk ${selectedCitizen.fullName} berhasil diperbarui!`)
        setTimeout(() => setToastMessage(null), 4000)

        // Jika opsi kirim WA dipilih
        if (sendViaWhatsApp) {
          const cleanWa = selectedCitizen.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')
          const waMessage = `Sampurasun ${encodeURIComponent(selectedCitizen.fullName)}, kami dari Tim Redaksi Hallo Jurnal Sukabumi. Berdasarkan permohonan bantuan Anda, kata sandi akun Anda telah kami atur ulang menjadi:%0A%0A🔑 Kata Sandi Baru: *${encodeURIComponent(newPassword.trim())}*%0A%0ASilakan masuk di menu login dan Anda dapat memperbarui kata sandi tersebut kapan saja di menu profil. Hatur nuhun!`
          const waUrl = `https://wa.me/${cleanWa}?text=${waMessage}`
          window.open(waUrl, '_blank')
        }
      } else {
        alert(json.message || 'Gagal mereset kata sandi.')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      alert('Terjadi kesalahan koneksi saat mereset kata sandi.')
    } finally {
      setResetting(false)
    }
  }

  // Handle Toggle Status Akun (Aktif / Blokir)
  const handleToggleStatus = async (citizen: CitizenItem) => {
    const newStatusText = citizen.isVerified ? 'Tangguhkan / Nonaktifkan' : 'Aktifkan Kembali'
    if (!confirm(`Apakah Anda yakin ingin ${newStatusText} akun ${citizen.fullName}?`)) return

    try {
      const res = await fetch('/api/admin/citizens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: citizen.id,
          action: 'toggle_status',
        }),
      })

      const json = await res.json()
      if (json.success) {
        setCitizens((prev) =>
          prev.map((c) => (c.id === citizen.id ? { ...c, isVerified: !c.isVerified } : c))
        )
        setToastMessage(json.message)
        setTimeout(() => setToastMessage(null), 4000)
      }
    } catch (err) {
      console.error(err)
      alert('Gagal mengubah status akun warga.')
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman Eksekutif */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
              Direktori Warga
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verifikasi Resmi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Direktori &amp; Kelola Warga Terdaftar
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Daftar resmi masyarakat pelapor Hallo Jurnal. Kendalikan akses akun, reset kata sandi, dan pantau riwayat aduan.
          </p>
        </div>

        <button
          onClick={loadCitizens}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition self-start md:self-auto cursor-pointer"
          title="Segarkan Data"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 2. Kartu Statistik Kompak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Total Warga Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-slate-900 mt-2">{totalCount}</p>
          <span className="text-[11px] text-slate-400">Akun terdaftar di database</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Warga Aktif Terverifikasi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-emerald-700 mt-2">{activeCount}</p>
          <span className="text-[11px] text-slate-400">Memiliki hak lapor penuh</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Total Aduan Terhubung</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-slate-900 mt-2">{totalReportsLinked}</p>
          <span className="text-[11px] text-slate-400">Laporan diajukan warga</span>
        </div>
      </div>

      {/* 3. Filter Bar & Pencarian Cepat */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama warga, nomor WhatsApp, email, atau wilayah domisili..."
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none focus:border-[#c00015] cursor-pointer"
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif Terverifikasi</option>
              <option value="ditangguhkan">Ditangguhkan / Terblokir</option>
            </select>

            {(searchQuery || statusFilter !== 'semua') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('semua')
                }}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs text-slate-500 hover:text-[#c00015] hover:bg-slate-100 rounded-lg transition cursor-pointer whitespace-nowrap"
                title="Reset Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Tabel Direktori Akun Warga */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredCitizens.length}</strong> dari <strong>{citizens.length}</strong> warga
          </span>
          <span className="text-[11px]">Diurutkan dari pendaftaran terbaru</span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#c00015] mx-auto" />
            <p className="text-xs text-slate-500">Memuat direktori akun warga...</p>
          </div>
        ) : filteredCitizens.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Tidak ada akun warga yang cocok</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada warga yang mendaftar di sistem.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full min-w-[950px] table-fixed text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-[240px]">Identitas Akun Warga</th>
                  <th className="py-3.5 px-4 w-[150px]">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Alamat Domisili Resmi</th>
                  <th className="py-3.5 px-4 w-[110px] text-center">Aduan Masuk</th>
                  <th className="py-3.5 px-4 w-[130px]">Status Akun</th>
                  <th className="py-3.5 px-4 w-[180px] text-center">Aksi Kendali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCitizens.map((citizen) => {
                  const cleanWaNumber = citizen.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')
                  const waUrl = `https://wa.me/${cleanWaNumber}?text=Sampurasun%20${encodeURIComponent(citizen.fullName)},%20kami%20dari%20Tim%20Redaksi%20Halo%20Jurnal%20Sukabumi.`

                  return (
                    <tr key={citizen.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Identitas Warga */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            {citizen.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-heading font-semibold text-slate-900 block truncate text-xs">
                              {citizen.fullName}
                            </span>
                            <span className="text-slate-400 text-[11px] block truncate mt-0.5">
                              {citizen.email}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Daftar: {formatDate(citizen.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kontak WhatsApp */}
                      <td className="py-3.5 px-4 align-middle">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs font-semibold text-slate-800 hover:text-emerald-700 inline-flex items-center gap-1.5 transition"
                          title="Chat via WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{citizen.phone}</span>
                        </a>
                      </td>

                      {/* Alamat Domisili */}
                      <td className="py-3.5 px-4 align-middle">
                        <p className="text-slate-700 text-xs line-clamp-2 leading-relaxed">
                          {citizen.domisili}
                        </p>
                      </td>

                      {/* Aduan Masuk */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        {citizen.totalReports > 0 ? (
                          <Link
                            href={`/halo-jurnal/admin/laporan?search=${encodeURIComponent(citizen.email)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-[#c00015] font-semibold text-xs transition"
                            title="Lihat semua aduan warga ini"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{citizen.totalReports} Laporan</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Belum ada</span>
                        )}
                      </td>

                      {/* Status Akun */}
                      <td className="py-3.5 px-4 align-middle">
                        {citizen.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-800 border border-rose-500/20">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                            <span>Ditangguhkan</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi Kendali */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* Tombol Reset Password */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCitizen(citizen)
                              setNewPassword('')
                              setResetSuccess(null)
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-[11px] font-semibold transition cursor-pointer"
                            title="Reset Kata Sandi Warga"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-[#c00015]" />
                            <span>Reset Sandi</span>
                          </button>

                          {/* Tombol Hubungi WA */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition"
                            title="Hubungi via WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* Tombol Blokir / Aktifkan */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(citizen)}
                            className={`p-1.5 rounded-md transition cursor-pointer ${
                              citizen.isVerified
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={citizen.isVerified ? 'Tangguhkan Akun' : 'Aktifkan Akun'}
                          >
                            {citizen.isVerified ? (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
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
      </div>

      {/* 5. Modal Reset Password Warga Terpadu */}
      {selectedCitizen && (
        <div
          onClick={() => setSelectedCitizen(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                  Reset Password Warga
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Atur ulang kata sandi untuk akun pelapor
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCitizen(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Akun Warga */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nama Pelapor:</span>
                <span className="font-semibold text-slate-900">{selectedCitizen.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-[11px] text-slate-700">{selectedCitizen.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">WhatsApp:</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">{selectedCitizen.phone}</span>
              </div>
            </div>

            {/* Input Kata Sandi Baru */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-800">
                  Password Baru <span className="text-[#c00015]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  title="Buat password acak otomatis"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Acak Sandi</span>
                </button>
              </div>

              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-lg bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
              />
              <p className="text-[11px] text-slate-400">
                Gunakan minimal 8 karakter kombinasi huruf atau angka.
              </p>
            </div>

            {/* Notifikasi Berhasil */}
            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block">Kata sandi berhasil diperbarui!</span>
                  Sandi aktif: <strong className="font-mono">{resetSuccess}</strong>
                </div>
              </div>
            )}

            {/* Tombol Aksi Modal */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCitizen(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetting || !newPassword.trim()}
                onClick={() => handleExecuteResetPassword(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Simpan Sandi</span>
              </button>
              <button
                type="button"
                disabled={resetting || !newPassword.trim()}
                onClick={() => handleExecuteResetPassword(true)}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Simpan sandi dan kirim langsung ke WhatsApp warga"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Simpan &amp; Kirim WA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-800 text-xs font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
