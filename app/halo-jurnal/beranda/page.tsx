'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
} from 'lucide-react'
import UserAvatar from '@/components/halo-jurnal/UserAvatar'
import CategoryCards from '@/components/halo-jurnal/CategoryCards'
import RecentPublicReports from '@/components/halo-jurnal/RecentPublicReports'
import { DUMMY_REPORTS } from '@/data/dummyReports'

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

export default function HaloJurnalBerandaPage() {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [userReports, setUserReports] = useState<any[]>([])
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Sync user and reports from Supabase & LocalStorage
  const syncDashboardData = async () => {
    try {
      // 1. Check Supabase auth
      const { data } = await supabase.auth.getUser()
      let currentUser: any = data?.user || null

      // Fallback to localStorage login
      if (!currentUser && typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('halo_jurnal_current_user')
        if (storedUser) {
          try {
            currentUser = JSON.parse(storedUser)
          } catch {}
        }
      }

      // Default demo citizen if completely empty
      if (!currentUser) {
        currentUser = {
          id: 'demo-user-id',
          email: 'warga@sukabumi.com',
          full_name: 'Warga Sukabumi',
          role: 'citizen',
          nik: '3202112345670001',
          ktp_verified: true,
        }
      }

      setUser(currentUser)

      // Fetch profile
      if (currentUser.id && currentUser.id !== 'demo-user-id') {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', currentUser.id)
          .single()
        if (prof) {
          setProfile(prof)
        } else {
          setProfile({
            full_name: currentUser.full_name || currentUser.user_metadata?.full_name || 'Warga Sukabumi',
            role: currentUser.role || 'citizen',
          })
        }
      } else {
        setProfile({
          full_name: currentUser.full_name || currentUser.user_metadata?.full_name || 'Warga Sukabumi',
          role: currentUser.role || 'citizen',
        })
      }

      // 2. Fetch reports for this user
      let baseReports: any[] = []

      // Try Supabase first if real user
      if (currentUser.id && currentUser.id !== 'demo-user-id') {
        try {
          const { data: dbData } = await supabase
            .from('laporan')
            .select('*, laporan_lampiran(file_url), chat_messages(count)')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })

          if (dbData && dbData.length > 0) {
            baseReports = dbData
          }
        } catch {}
      }

      // Fallback / merge with localStorage reports
      if (typeof window !== 'undefined') {
        try {
          const storedReports = localStorage.getItem('halo_jurnal_user_reports')
          if (storedReports) {
            const parsed = JSON.parse(storedReports)
            if (Array.isArray(parsed) && parsed.length > 0) {
              baseReports = [...parsed, ...baseReports]
            }
          }
        } catch {}

        // Fallback to dummy if empty
        if (baseReports.length === 0) {
          baseReports = DUMMY_REPORTS.slice(0, 3)
        }

        // Apply admin status overrides
        try {
          const overrides = JSON.parse(localStorage.getItem('halo_jurnal_status_overrides') || '{}')
          baseReports = baseReports.map((r: any) => {
            const saved =
              overrides[r.id] ||
              (r.nomor_tiket ? overrides[r.nomor_tiket] : null) ||
              (r.ticket_number ? overrides[r.ticket_number] : null)
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

  const userNik = user?.nik || '3202••••••••0001'
  const isKtpVerified = user?.ktp_verified ?? true

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
      {/* 1. CITIZEN GREETING HEADER */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pt-7 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Avatar Inisial & Teks Selamat Datang */}
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar
              name={displayName}
              size="lg"
              bgColor="primary"
              className="w-14 h-14 sm:w-16 sm:h-16 text-xl font-extrabold shadow-sm ring-2 ring-primary/20 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-heading font-extrabold text-xl sm:text-3xl text-on-surface tracking-tight truncate">
                Selamat Datang, {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-secondary font-medium">
                {isKtpVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/80 text-secondary text-xs font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-primary" />
                    Warga Terverifikasi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/60 text-secondary text-xs font-medium">
                    Warga Terdaftar
                  </span>
                )}
                <span className="text-outline-variant">•</span>
                <span className="font-mono text-xs text-secondary/80">
                  NIK: {userNik}
                </span>
                <span className="text-outline-variant">•</span>
                <span className="text-xs text-secondary">
                  Kabupaten &amp; Kota Sukabumi
                </span>
              </div>
            </div>
          </div>

          {/* Right: Tombol Laporan Saya */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Link
              href="/halo-jurnal/laporan-saya"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-container-high border border-outline-variant/80 text-on-surface font-semibold text-xs sm:text-sm tracking-tight transition-all shadow-2xs hover:border-primary/40 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-primary" />
              <span>Laporan Saya ({totalReportsCount})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. HERO BANNER WITH FOTO BERANDA (SESUAI CONTOH REFERENSI) */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-black border border-outline-variant/50 shadow-md py-10 sm:py-20 px-4 sm:px-10 text-white text-center flex flex-col items-center justify-center">
          {/* Background Foto Beranda (/hero-banner.webp) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <Image
              src="/hero-banner.webp"
              alt="Halo Jurnal Sukabumi Banner"
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
              Sampaikan aspirasi dan laporan pengaduan Anda secara langsung kepada tim Jurnal Sukabumi (PT. MEDIA JURNAL SUKABUMI).
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
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 pb-8">
        <div className="bg-surface border border-outline-variant/70 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
          {/* Card Top: Live Pulse Header & History Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/50">
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-on-surface tracking-tight">
                Status Aduan Aktif Anda
              </h2>
              <p className="text-secondary text-xs sm:text-sm mt-0.5">
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
            <div className="pt-4 space-y-5">
              {/* Ticket & Report Meta Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {latestTicketId && (
                      <button
                        type="button"
                        onClick={(e) => handleCopyTicket(latestTicketId, e)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/60 font-mono text-[11px] font-semibold text-secondary hover:text-on-surface transition-colors cursor-pointer"
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

                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold capitalize">
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

                  <h3 className="font-heading font-bold text-base sm:text-lg text-on-surface line-clamp-1">
                    {latestReport.judul}
                  </h3>

                  {latestReport.lokasi && (
                    <p className="text-xs text-secondary flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{latestReport.lokasi}</span>
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/halo-jurnal/laporan/${latestReport.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>Detail &amp; Diskusi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Milestone Timeline (Desktop: Linear Rail / Mobile: Vertical Flow) */}
              <div className="py-2 sm:py-4">
                {/* Desktop Linear Rail */}
                <div className="hidden sm:block relative pt-2 pb-2">
                  {/* Connecting track line */}
                  <div className="absolute top-[26px] left-[12.5%] right-[12.5%] h-0.5 bg-outline-variant/60 -translate-y-1/2 z-0" />
                  {/* Active progress fill line */}
                  <div
                    className="absolute top-[26px] left-[12.5%] h-0.5 bg-emerald-500 -translate-y-1/2 transition-all duration-500 z-0"
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
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              state === 'completed'
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : state === 'current'
                                ? 'bg-primary text-white ring-4 ring-primary/20 shadow-md scale-105'
                                : 'bg-surface-container-high border border-outline-variant/80 text-secondary/60'
                            }`}
                          >
                            {state === 'completed' ? (
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <span className="text-xs font-bold font-heading">{s.step}</span>
                            )}
                          </div>

                          <div className="mt-2.5">
                            <span
                              className={`text-xs sm:text-sm font-heading font-bold block ${
                                state === 'completed'
                                  ? 'text-on-surface'
                                  : state === 'current'
                                  ? 'text-primary'
                                  : 'text-secondary/70'
                              }`}
                            >
                              {s.shortTitle}
                            </span>
                            <p className="text-[11px] text-secondary mt-0.5 leading-snug max-w-[150px] mx-auto">
                              {s.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile Vertical Flow */}
                <div className="sm:hidden relative pl-7 space-y-3.5 py-1">
                  <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-outline-variant/50 -translate-x-1/2 z-0" />
                  <div
                    className="absolute left-[13px] top-3 w-0.5 bg-emerald-500 -translate-x-1/2 transition-all duration-500 z-0"
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
                              ? 'bg-emerald-500 text-white shadow-2xs'
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
              <div className="bg-surface-container-low/80 rounded-2xl px-4 py-3 border border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-secondary flex-wrap">
                  <span className="font-semibold text-on-surface">Tahap Terkini:</span>
                  <span className="capitalize font-bold text-primary">{latestStatus}</span>
                  <span className="hidden sm:inline text-outline-variant">•</span>
                  <span className="text-secondary">
                    {latestStatus === 'selesai'
                      ? 'Laporan telah tuntas ditindaklanjuti dan dikonfirmasi selesai.'
                      : latestStatus === 'ditindaklanjuti'
                      ? 'Laporan diteruskan resmi ke dinas/instansi berwenang.'
                      : latestStatus === 'diproses'
                      ? 'Verifikasi fakta dan peninjauan lapangan tim redaksi.'
                      : 'Laporan tercatat dan dalam antrean verifikasi redaksi.'}
                  </span>
                </div>

                <div className="text-[11px] text-secondary/80 flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <span>Sinkronisasi Real-Time</span>
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

      {/* 5. PANTAUAN LAPORAN PUBLIK TERKINI */}
      <section className="bg-surface-container-low/60 border-t border-outline-variant/60 py-10 md:py-14 px-4 sm:px-6 md:px-8">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Suara Warga Sukabumi
              </span>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl text-on-surface tracking-tight mt-0.5">
                Pantauan Laporan Publik Terkini
              </h2>
              <p className="text-secondary text-xs sm:text-sm mt-1">
                Keterbukaan informasi aduan warga se-Sukabumi yang diverifikasi tim redaksi Jurnal Sukabumi.
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

          {/* Recent Reports Grid */}
          <RecentPublicReports />
        </div>
      </section>
    </main>
  )
}
