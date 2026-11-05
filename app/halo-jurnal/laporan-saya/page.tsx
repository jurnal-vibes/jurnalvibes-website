'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  ClipboardList,
  MessageSquare,
  ChevronDown,
  FileQuestion,
  PlusCircle,
  X,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export default function HaloJurnalLaporanSayaPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allReports, setAllReports] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [displayedReports, setDisplayedReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)

  // Filters & sorting
  const [sortOrder, setSortOrder] = useState('Terbaru')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_current_user')
        if (stored) {
          try {
            setUser(JSON.parse(stored))
            return
          } catch {}
        }
      }
      setUser(null)
    }
    checkUser()

    const handleSync = () => {
      fetchAllUserReports()
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('focus', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('focus', handleSync)
    }
  }, [])

  useEffect(() => {
    fetchAllUserReports()
  }, [user])

  useEffect(() => {
    filterAndSortReports()
  }, [allReports, sortOrder, searchQuery])

  const fetchAllUserReports = async () => {
    setLoading(true)
    let localUserReports: any[] = []
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_user_reports')
        if (stored) {
          localUserReports = JSON.parse(stored)
        }
      }
    } catch {}

    // Ambil data user aktif saat ini
    let activeUser = user
    if (!activeUser && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('halo_jurnal_current_user')
        if (storedUser) activeUser = JSON.parse(storedUser)
      } catch {}
    }

    const currentUserId = activeUser?.id
    const currentUserEmail = (activeUser?.email || '').toLowerCase().trim()
    const currentUserPhone = (activeUser?.phone || activeUser?.phone_number || '').trim()

    // 1. Ambil laporan resmi dari API database Neon DB
    let dbReports: any[] = []
    try {
      const res = await fetch('/api/reports', { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        dbReports = json.data
      }
    } catch (err) {
      console.warn('Gagal memuat laporan database di Laporan Saya:', err)
    }

    // Gabungkan laporan dari database dan local storage
    const allCombined = [...localUserReports, ...dbReports]
    const uniqueMap = new Map<string, any>()
    allCombined.forEach((item) => {
      const key = item.ticketNumber || item.nomor_tiket || item.ticket_number || item.id
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, item)
      }
    })

    // Saring laporan milik akun yang sedang login
    let baseReports = Array.from(uniqueMap.values()).filter((r: any) => {
      if (!currentUserId && !currentUserEmail && !currentUserPhone) return false
      const reportUserId = r.user_id || r.userId
      const reportEmail = (r.email || r.user_email || r.pelaporEmail || r.pelapor_email || '').toLowerCase().trim()
      const reportPhone = (r.telepon || r.phone || r.pelaporPhone || r.citizenPhone || '').trim()

      if (currentUserId && reportUserId && String(reportUserId) === String(currentUserId)) return true
      if (currentUserEmail && reportEmail && reportEmail === currentUserEmail) return true
      if (currentUserPhone && reportPhone && reportPhone === currentUserPhone) return true
      return false
    })

    // Terapkan override dari admin secara realtime
    if (typeof window !== 'undefined') {
      try {
        const overrides = JSON.parse(
          localStorage.getItem('halo_jurnal_status_overrides') || '{}'
        )
        baseReports = baseReports.map((r: any) => {
          const saved =
            overrides[r.id] ||
            (r.nomor_tiket ? overrides[r.nomor_tiket] : null) ||
            (r.ticket_number ? overrides[r.ticket_number] : null) ||
            (r.ticketNumber ? overrides[r.ticketNumber] : null)
          if (saved) {
            return {
              ...r,
              is_public: saved.is_public !== undefined ? saved.is_public : r.is_public,
            }
          }
          return r
        })
      } catch {}
    }

    setAllReports(baseReports)
    setLoading(false)
  }

  const filterAndSortReports = () => {
    let list = [...allReports]

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (r) =>
          (r.judul && r.judul.toLowerCase().includes(q)) ||
          (r.deskripsi && r.deskripsi.toLowerCase().includes(q)) ||
          (r.ticket_number && r.ticket_number.toLowerCase().includes(q)) ||
          (r.nomor_tiket && r.nomor_tiket.toLowerCase().includes(q)) ||
          (r.id && r.id.toLowerCase().includes(q))
      )
    }

    // Sort order
    list.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime()
      const timeB = new Date(b.created_at || 0).getTime()
      return sortOrder === 'Terlama' ? timeA - timeB : timeB - timeA
    })

    setDisplayedReports(list)
  }

  const totalCount = allReports.length

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard?.writeText(id)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <div className="w-full max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-20">
      {/* 1. Header Halaman */}
      <div className="mb-5">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
          Aduan Saya
        </h1>
        <p className="text-secondary text-xs sm:text-sm mt-1">
          Pantau seluruh aduan dan koordinasi langsung dengan redaksi Hallo Jurnal.
        </p>
      </div>

      {!user && !loading ? (
        <div className="text-center py-14 bg-surface rounded-2xl border border-outline-variant/70 p-6 sm:p-10 shadow-2xs max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-bold text-lg text-on-surface mb-2">
            Masuk untuk Memantau Aduan Anda
          </h2>
          <p className="text-xs sm:text-sm text-secondary mb-6 leading-relaxed">
            Riwayat aduan terikat khusus dengan akun Anda agar aman dan dapat dipantau langsung.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?redirect=/halo-jurnal/laporan-saya"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              Masuk Akun
            </Link>
            <Link
              href="/halo-jurnal/lapor"
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-xs sm:text-sm font-medium transition-all"
            >
              Buat Pengaduan Baru
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Overview Card: Total Aduan */}
          <div className="mb-6">
            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/70 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-2xs">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-heading font-bold text-sm text-on-surface block leading-tight">
                    Total Pengaduan Anda
                  </span>
                  <span className="text-xs text-secondary mt-0.5 block">
                    Seluruh aduan yang telah Anda kirimkan
                  </span>
                </div>
              </div>
              <span className="font-heading font-black text-2xl text-on-surface">
                {totalCount}
              </span>
            </div>
          </div>

          {/* 3. Search & Sort Bar */}
          <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-2.5 sm:p-3 mb-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul aduan atau ID tiket..."
                  className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c00015]/20 focus:border-[#c00015] transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#c00015] cursor-pointer shadow-2xs"
                >
                  <option value="Terbaru">Terbaru</option>
                  <option value="Terlama">Terlama</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 4. Daftar Aduan */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-pulse"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-28 h-5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div className="w-20 h-5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>
                  <div className="w-3/4 h-5 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
                  <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : displayedReports.length > 0 ? (
            <div className="space-y-4">
              {displayedReports.map((report) => {
                const ticketId =
                  report.nomor_tiket ||
                  report.ticket_number ||
                  `JS-${report.id.substring(0, 8)}`

                const imgUrl =
                  report.laporan_lampiran &&
                  report.laporan_lampiran.length > 0 &&
                  report.laporan_lampiran[0].file_url
                    ? report.laporan_lampiran[0].file_url
                    : null

                const isCopied = copiedId === ticketId

                return (
                  <div
                    key={report.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group"
                  >
                    {/* Header: ID & Tanggal */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {/* Ticket ID */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(ticketId, e)}
                          className="inline-flex items-center gap-1 font-mono font-medium hover:text-[#c00015] dark:hover:text-[#ff6b6b] transition-colors cursor-pointer"
                          title="Salin nomor tiket"
                        >
                          <span>#{ticketId}</span>
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>

                        <span className="text-slate-300 dark:text-slate-600">•</span>

                        {/* Tanggal */}
                        <span className="text-slate-400 dark:text-slate-500">
                          {formatDate(report.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Content: Title, Description + Photo */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/halo-jurnal/laporan/${report.id}`}
                          className="block group/title"
                        >
                          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100 group-hover/title:text-[#c00015] dark:group-hover/title:text-[#ff6b6b] transition-colors leading-snug mb-1.5 tracking-tight">
                            {report.judul}
                          </h2>
                        </Link>

                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                          {report.deskripsi}
                        </p>
                      </div>

                      {imgUrl && (
                        <Link
                          href={`/halo-jurnal/laporan/${report.id}`}
                          className="shrink-0 w-full sm:w-36 h-36 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-800 block shadow-2xs"
                          title="Lihat lampiran"
                        >
                          <img
                            src={imgUrl}
                            alt={report.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                      )}
                    </div>

                    {/* Footer: Chat Admin & Detail Link */}
                    <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                      <Link
                        href={`/halo-jurnal/laporan/${report.id}#chat`}
                        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#c00015] dark:text-slate-400 dark:hover:text-[#ff6b6b] font-medium transition-colors group/chat shrink-0"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover/chat:bg-[#c00015]/10 group-hover/chat:text-[#c00015] transition-colors shrink-0">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <span>
                          <span className="hidden sm:inline">Ruang Koordinasi Redaksi</span>
                          <span className="sm:hidden">Chat Redaksi</span>
                        </span>
                        {report.chat_messages && report.chat_messages[0]?.count > 0 && (
                          <span className="px-1.5 py-0.5 bg-[#c00015]/10 text-[#c00015] rounded-full text-[10px] font-bold">
                            {report.chat_messages[0].count}
                          </span>
                        )}
                      </Link>

                      <Link
                        href={`/halo-jurnal/laporan/${report.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-[#c00015] dark:text-slate-300 dark:hover:text-white transition-colors group/cta shrink-0"
                      >
                        <span>
                          <span className="hidden sm:inline">Lihat Detail Aduan</span>
                          <span className="sm:hidden">Detail Aduan</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-14 bg-surface rounded-xl border border-outline-variant/70 p-6 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center mx-auto mb-3">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-on-surface mb-1">
                Tidak ada aduan yang sesuai
              </h3>
              <p className="text-xs text-secondary mb-4 max-w-sm mx-auto">
                {searchQuery
                  ? 'Silakan sesuaikan kata kunci pencarian.'
                  : 'Anda belum memiliki riwayat pengaduan.'}
              </p>

              <div>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
                  >
                    Hapus Pencarian
                  </button>
                ) : (
                  <Link
                    href="/halo-jurnal/lapor"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Buat Pengaduan Baru</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
