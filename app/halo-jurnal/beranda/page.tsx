'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Search,
  PlusCircle,
  ClipboardList,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Calendar,
  Copy,
  Check,
  FileText,
  UserCheck,
  ShieldCheck,
} from 'lucide-react'
import UserAvatar from '@/components/halo-jurnal/UserAvatar'
import CategoryCards from '@/components/halo-jurnal/CategoryCards'
import RecentPublicReports from '@/components/halo-jurnal/RecentPublicReports'

const TRACKER_STEPS = [
  {
    step: 1,
    key: 'diterima',
    title: '1. Diterima',
    shortTitle: 'Diterima',
    desc: 'Laporan tercatat di sistem',
  },
  {
    step: 2,
    key: 'diproses',
    title: '2. Diproses',
    shortTitle: 'Diproses',
    desc: 'Verifikasi & cek redaksi',
  },
  {
    step: 3,
    key: 'ditindaklanjuti',
    title: '3. Ditindaklanjuti',
    shortTitle: 'Ditindaklanjuti',
    desc: 'Koordinasi dinas terkait',
  },
  {
    step: 4,
    key: 'selesai',
    title: '4. Selesai',
    shortTitle: 'Selesai',
    desc: 'Solusi tuntas & arsip',
  },
]

function formatDisplayTitle(text?: string): string {
  if (!text) return ''
  const trimmed = text.trim()
  if (trimmed === trimmed.toUpperCase()) {
    return trimmed.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return trimmed
}

export default function HaloJurnalBerandaPage() {
  const router = useRouter()

  // State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userReports, setUserReports] = useState<any[]>([])
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Sync user and reports from LocalStorage
  const syncDashboardData = async () => {
    try {
      let currentUser: any = null

      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('halo_jurnal_current_user')
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser)
            if (
              parsed &&
              (parsed.id === 'demo-user-id' ||
                parsed.id === 'warga-demo' ||
                parsed.email === 'warga@sukabumi.com' ||
                (typeof parsed.id === 'string' && parsed.id.startsWith('warga-17')))
            ) {
              localStorage.removeItem('halo_jurnal_current_user')
              currentUser = null
            } else {
              currentUser = parsed
            }
          } catch {}
        }
      }

      if (!currentUser) {
        setUser(null)
        setProfile(null)
        router.replace('/halo-jurnal')
        return
      }

      setUser(currentUser)

      setProfile({
        full_name: currentUser.full_name || currentUser.user_metadata?.full_name || 'Warga Sukabumi',
        role: currentUser.role || 'warga',
      })

      // 2. Fetch reports for this user (sinkron database Neon & storage lokal)
      const currentUserId = currentUser?.id
      const currentUserEmail = (currentUser?.email || '').toLowerCase().trim()
      const currentUserPhone = (currentUser?.phone || currentUser?.phone_number || '').trim()

      // Ambil laporan resmi dari API database Neon DB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dbReports: any[] = []
      try {
        const res = await fetch('/api/reports', { cache: 'no-store' })
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          dbReports = json.data
        }
      } catch (err) {
        console.warn('Gagal memuat laporan database di Beranda:', err)
      }

      // Ambil laporan dari local storage browser
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let localReports: any[] = []
      if (typeof window !== 'undefined') {
        try {
          const storedReports = localStorage.getItem('halo_jurnal_user_reports')
          if (storedReports) {
            const parsed = JSON.parse(storedReports)
            if (Array.isArray(parsed) && parsed.length > 0) {
              localReports = parsed
            }
          }
        } catch {}
      }

      // Gabungkan laporan secara unik berdasarkan nomor tiket / ID
      const allCombined = [...localReports, ...dbReports]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uniqueMap = new Map<string, any>()
      allCombined.forEach((item) => {
        const key = item.ticketNumber || item.nomor_tiket || item.ticket_number || item.id
        if (key && !uniqueMap.has(key)) {
          uniqueMap.set(key, item)
        }
      })

      // Saring laporan agar HANYA milik akun yang sedang login saat ini
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // Terapkan override status dari admin jika ada
      if (typeof window !== 'undefined') {
        try {
          const overrides = JSON.parse(localStorage.getItem('halo_jurnal_status_overrides') || '{}')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          baseReports = baseReports.map((r: any) => {
            const saved =
              overrides[r.id] ||
              (r.nomor_tiket ? overrides[r.nomor_tiket] : null) ||
              (r.ticket_number ? overrides[r.ticket_number] : null) ||
              (r.ticketNumber ? overrides[r.ticketNumber] : null)
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
        } catch {}
      }

      setUserReports(baseReports)
    } catch (err) {
      console.error('Error syncing beranda dashboard:', err)
    }
  }

  useEffect(() => {
    syncDashboardData()

    window.addEventListener('storage', syncDashboardData)
    window.addEventListener('focus', syncDashboardData)

    return () => {
      window.removeEventListener('storage', syncDashboardData)
      window.removeEventListener('focus', syncDashboardData)
    }
  }, [])

  // Derived user display name & details
  const displayName =
    profile?.full_name ||
    user?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email && user.email.includes('@') ? user.email.split('@')[0] : 'Warga Sukabumi')

  const userPhone = user?.phone || user?.phone_number || '081234567890'
  const isVerified = user?.is_verified ?? true

  // Report statistics
  const totalReportsCount = userReports.length
  const diprosesCount = userReports.filter((r) => {
    const s = (r.status || '').toLowerCase()
    return s === 'diproses' || s === 'diterima'
  }).length
  const selesaiCount = userReports.filter((r) => {
    const s = (r.status || '').toLowerCase()
    return s === 'selesai' || s === 'ditindaklanjuti'
  }).length

  // Latest active report
  const latestReport = userReports.length > 0 ? userReports[0] : null
  const latestTicketId =
    latestReport?.nomor_tiket ||
    latestReport?.ticket_number ||
    (latestReport?.id ? `JS-${latestReport.id.substring(0, 8).toUpperCase()}` : '')

  const latestStatus = (latestReport?.status || 'diterima').toLowerCase()

  const statusMap: Record<string, number> = {
    diterima: 1,
    diproses: 2,
    ditindaklanjuti: 3,
    selesai: 4,
  }
  const currentStepNumber = statusMap[latestStatus] || 1

  // Stepper helper
  const getStepState = (stepIndex: number, currentStatus: string) => {
    const currentStep = statusMap[currentStatus] || 1
    if (currentStatus === 'selesai' && stepIndex === 4) return 'completed'
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'upcoming'
  }

  const handleCopyTicket = (ticket: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard?.writeText(ticket)
    setCopiedTicket(ticket)
    setTimeout(() => setCopiedTicket(null), 2000)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/halo-jurnal/feed-publik?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/halo-jurnal/feed-publik')
    }
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-lowest text-on-surface">
      {/* 1. WARGA GREETING HEADER (Kompak 1 Baris) */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 pb-2 sm:pb-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Avatar Inisial & Teks Sapaan Ringkas */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <UserAvatar
              name={displayName}
              size="sm"
              bgColor="primary"
              className="w-8 h-8 sm:w-9 sm:h-9 text-xs font-bold shadow-2xs ring-1.5 ring-primary/20 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-heading font-bold text-xs sm:text-sm text-on-surface tracking-tight truncate leading-tight">
                  Halo, <span className="capitalize">{displayName}</span>
                </h1>
                {isVerified && (
                  <span title="Warga Terverifikasi Sukabumi" className="inline-flex items-center text-sky-500 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 fill-sky-500/15 stroke-[2.2px]" />
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-secondary font-medium truncate mt-0.5">
                Warga Sukabumi {userPhone ? `• ${userPhone}` : ''}
              </p>
            </div>
          </div>

          {/* Right: Tombol Laporan Saya Ringkas */}
          <Link
            href="/halo-jurnal/laporan-saya"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-container-high border border-outline-variant/80 text-on-surface font-semibold text-[11px] sm:text-xs tracking-tight transition-all shadow-2xs hover:border-primary/40 shrink-0 cursor-pointer"
            title="Lihat Laporan Saya"
          >
            <ClipboardList className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="hidden xs:inline sm:inline">Laporan Saya</span>
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] leading-none">
              {totalReportsCount}
            </span>
          </Link>
        </div>
      </section>

      {/* 2. HERO BANNER WITH FOTO BERANDA (SESUAI CONTOH REFERENSI) */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-black border border-outline-variant/50 shadow-md py-10 sm:py-20 px-4 sm:px-10 text-white text-center flex flex-col items-center justify-center">
          {/* Background Foto Beranda (/hero-banner.webp) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <Image
              src="/hero-banner.webp"
              alt="Hallo Jurnal Wave Banner"
              fill
              className="object-cover object-bottom"
              priority
            />
            {/* Dark & Brand Red Gradient Overlay agar teks kontras tajam */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/55 to-black/45 z-10" />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
          </div>

          <div className="relative z-20 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white mb-2.5 md:mb-3 tracking-tight drop-shadow-md">
              Suara Anda, Wadah Kami
            </h2>

            <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto font-medium">
              Sampaikan aspirasi dan laporan pengaduan Anda secara langsung kepada tim redaksi Jurnal Wave.
            </p>

            {/* Search Bar persis seperti referensi */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-1.5 sm:p-2 w-full max-w-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center flex-1 w-full px-3">
                <Search className="w-5 h-5 text-secondary shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari laporan publik..."
                  className="w-full bg-transparent border-none outline-none px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-secondary"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-2.5 sm:py-3 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-95 shadow-xs cursor-pointer shrink-0"
              >
                Cari Laporan
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. 4 PILAR KATEGORI LAPORAN (MENUMPUK DI BAWAH HERO BANNER) */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 -mt-6 sm:-mt-12 md:-mt-14 relative z-30 pb-10">
        <CategoryCards isLoggedIn={true} />
      </section>

      {/* 4. REAL-TIME ACTIVE REPORT TRACKER */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pb-6">
        <div className="bg-surface border border-outline-variant/70 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
          {/* Card Top: Live Pulse Header & History Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-outline-variant/50">
            <div>
              <h2 className="font-heading font-bold text-sm sm:text-base text-on-surface tracking-tight">
                Status Aduan Aktif Anda
              </h2>
              <p className="text-secondary text-xs mt-0.5">
                Pantau tahapan penanganan laporan Anda secara transparan.
              </p>
            </div>

            <Link
              href="/halo-jurnal/laporan-saya"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors self-start sm:self-auto shrink-0"
            >
              <span>Semua Riwayat ({totalReportsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestReport ? (
            <div className="pt-3.5 space-y-3.5">
              {/* Ticket & Report Meta Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    {latestTicketId && (
                      <button
                        type="button"
                        onClick={(e) => handleCopyTicket(latestTicketId, e)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/60 font-mono text-[11px] font-semibold text-secondary hover:text-on-surface transition-colors cursor-pointer"
                        title="Klik untuk menyalin nomor tiket"
                      >
                        <span>Tiket: {latestTicketId}</span>
                        {copiedTicket === latestTicketId ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-secondary" />
                        )}
                      </button>
                    )}

                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold capitalize">
                      {latestReport.kategori || 'Pengaduan Warga'}
                    </span>

                    <span className="text-secondary text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {latestReport.created_at
                        ? new Date(latestReport.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Hari ini'}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                    {formatDisplayTitle(latestReport.judul)}
                  </h3>

                  {latestReport.lokasi && (
                    <p className="text-[11px] sm:text-xs text-secondary flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{latestReport.lokasi}</span>
                    </p>
                  )}
                </div>

                <div className="shrink-0 w-full sm:w-auto self-stretch sm:self-auto mt-1 md:mt-0">
                  <Link
                    href={`/halo-jurnal/laporan/${latestReport.id}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>Detail &amp; Diskusi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Milestone Timeline (Desktop: Linear Rail / Mobile: Vertical Flow) */}
              <div className="py-1 sm:py-2">
                {/* Desktop Linear Rail */}
                <div className="hidden sm:block relative pt-1.5 pb-1.5">
                  {/* Connecting track line */}
                  <div className="absolute top-[22px] left-[12.5%] right-[12.5%] h-0.5 bg-outline-variant/60 -translate-y-1/2 z-0" />
                  {/* Active progress fill line */}
                  <div
                    className="absolute top-[22px] left-[12.5%] h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 z-0"
                    style={{
                      width: `${((currentStepNumber - 1) / 3) * 75}%`,
                    }}
                  />

                  {/* 4 Stage Nodes */}
                  <div className="grid grid-cols-4 relative z-10">
                    {TRACKER_STEPS.map((s) => {
                      const state = getStepState(s.step, latestStatus)
                      return (
                        <div key={s.step} className="flex flex-col items-center text-center px-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              state === 'completed'
                                ? 'bg-primary text-white shadow-xs'
                                : state === 'current'
                                ? 'bg-primary text-white ring-4 ring-primary/20 shadow-md scale-105'
                                : 'bg-surface-container-high border border-outline-variant/80 text-secondary/60'
                            }`}
                          >
                            {state === 'completed' ? (
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <span className="text-xs font-bold font-heading">{s.step}</span>
                            )}
                          </div>

                          <div className="mt-2">
                            <span
                              className={`text-xs font-heading font-bold block ${
                                state === 'completed'
                                  ? 'text-on-surface'
                                  : state === 'current'
                                  ? 'text-primary'
                                  : 'text-secondary/70'
                              }`}
                            >
                              {s.shortTitle}
                            </span>
                            <p className="text-[10px] sm:text-[11px] text-secondary mt-0.5 leading-snug max-w-[140px] mx-auto">
                              {s.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile Vertical Flow */}
                <div className="sm:hidden relative pl-7 space-y-3 py-1">
                  <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-outline-variant/50 -translate-x-1/2 z-0" />
                  <div
                    className="absolute left-[13px] top-3 w-0.5 bg-primary -translate-x-1/2 transition-all duration-500 z-0"
                    style={{
                      height: `${Math.min(100, Math.max(0, ((currentStepNumber - 1) / 3) * 100))}%`,
                    }}
                  />

                  {TRACKER_STEPS.map((s) => {
                    const state = getStepState(s.step, latestStatus)
                    return (
                      <div key={s.step} className="relative flex items-start gap-3 z-10">
                        <div
                          className={`-ml-7 w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-all ${
                            state === 'completed'
                              ? 'bg-primary text-white shadow-2xs'
                              : state === 'current'
                              ? 'bg-primary text-white ring-4 ring-primary/20 shadow-xs'
                              : 'bg-surface-container-high border border-outline-variant/80 text-secondary/70 text-xs'
                          }`}
                        >
                          {state === 'completed' ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <span className="text-[11px] font-bold font-heading">{s.step}</span>
                          )}
                        </div>

                        <div className="min-w-0 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                state === 'completed'
                                  ? 'text-on-surface'
                                  : state === 'current'
                                  ? 'text-primary'
                                  : 'text-secondary/70'
                              }`}
                            >
                              {s.shortTitle}
                            </span>
                            {state === 'current' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                Tahap Terkini
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-secondary mt-0.5 leading-snug">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Status Explanation Strip */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3.5 py-2 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Status Terkini:</span>
                  <span className="capitalize font-bold text-primary">{latestStatus}</span>
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {latestStatus === 'selesai'
                      ? 'Laporan telah tuntas ditindaklanjuti.'
                      : latestStatus === 'ditindaklanjuti'
                      ? 'Diteruskan resmi ke dinas / instansi terkait.'
                      : latestStatus === 'diproses'
                      ? 'Sedang ditinjau lapangan oleh tim redaksi.'
                      : 'Dalam antrean verifikasi tim redaksi.'}
                  </span>
                </div>

                <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0 self-end sm:self-auto">
                  <span>Sinkronisasi Otomatis</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4 mt-4 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-on-surface mb-1">
                Belum Ada Laporan Aktif
              </h3>
              <p className="text-secondary text-xs sm:text-sm max-w-md mx-auto mb-4">
                Punya keluhan jalan rusak, lampu jalan padam, atau ide pembangunan di lingkungan Anda? Sampaikan sekarang agar dapat segera ditindaklanjuti.
              </p>
              <Link
                href="/halo-jurnal/lapor"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Mulai Buat Laporan Pertama</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 5. PANTAUAN LAPORAN PUBLIK TERKINI (SEJAJAR PERSIS DENGAN KONTEN ATAS) */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pb-12 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Suara Warga Sukabumi
            </span>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-on-surface tracking-tight mt-0.5">
              Pantauan Laporan Publik Terkini
            </h2>
            <p className="text-secondary text-xs mt-0.5">
              Keterbukaan informasi aduan warga se-Sukabumi yang diverifikasi tim redaksi Jurnal Wave.
            </p>
          </div>

          <Link
            href="/halo-jurnal/feed-publik"
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-semibold text-xs sm:text-sm transition-colors self-start sm:self-auto"
          >
            <span>Lihat Semua Laporan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recent Reports Grid - 4 Kolom Sejajar Sempurna */}
        <RecentPublicReports />
      </section>
    </main>
  )
}
