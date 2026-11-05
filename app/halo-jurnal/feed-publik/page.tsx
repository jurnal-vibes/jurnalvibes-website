'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  ThumbsUp,
  ArrowRight,
  ShieldCheck,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

function getRelativeTime(dateString: string) {
  if (!dateString) return 'Baru saja'
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = Math.max(0, now.getTime() - date.getTime())
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInDays > 0) {
    return `${diffInDays} hari yang lalu`
  }
  if (diffInHours > 0) {
    return `${diffInHours} jam yang lalu`
  }
  return 'Baru saja'
}

const ITEMS_PER_PAGE = 5

function FeedPublikContent() {
  const searchParams = useSearchParams()
  const feedTopRef = useRef<HTMLDivElement>(null)

  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [likedReports, setLikedReports] = useState<Set<string>>(new Set())
  const [likingReports, setLikingReports] = useState<Set<string>>(new Set())

  // Paginasi
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('halo_jurnal_current_user')
        if (stored) {
          try {
            setUser(JSON.parse(stored))
          } catch {}
        }
      }
    }
    checkUser()

    // Sinkronisasi otomatis saat ada pembaruan di tab lain
    const handleSync = () => {
      fetchReports()
    }
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    fetchReports()
  }, [searchQuery])

  useEffect(() => {
    if (reports.length > 0) {
      fetchUserLikes()
    }
  }, [reports, user?.email])

  const fetchUserLikes = async () => {
    if (user?.email) {
      try {
        const res = await fetch(`/api/reports/support?email=${encodeURIComponent(user.email)}`)
        const data = await res.json()
        if (data.success && Array.isArray(data.supportedTickets)) {
          setLikedReports(new Set(data.supportedTickets))
          if (typeof window !== 'undefined') {
            localStorage.setItem('halo_jurnal_user_likes', JSON.stringify(data.supportedTickets))
          }
          return
        }
      } catch {}
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('halo_jurnal_user_likes') || '[]')
        setLikedReports(new Set(stored))
      } catch {}
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      let baseReports: any[] = []

      try {
        const res = await fetch('/api/reports', { cache: 'no-store' })
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          baseReports = json.data
        }
      } catch (err) {
        console.warn('Gagal memuat laporan dari API database, menggunakan cache:', err)
      }

      if (typeof window !== 'undefined') {
        try {
          const userReports = JSON.parse(
            localStorage.getItem('halo_jurnal_user_reports') || '[]'
          )
          const overrides = JSON.parse(
            localStorage.getItem('halo_jurnal_status_overrides') || '{}'
          )

          const combined = [...baseReports, ...userReports]
          const uniqueMap = new Map<string, any>()
          combined.forEach((item) => {
            const key = item.ticketNumber || item.nomor_tiket || item.ticket_number || item.id
            if (key && !uniqueMap.has(key)) {
              uniqueMap.set(key, item)
            }
          })

          baseReports = Array.from(uniqueMap.values()).map((r: any) => {
            const saved =
              overrides[r.id] ||
              (r.nomor_tiket ? overrides[r.nomor_tiket] : null) ||
              (r.ticket_number ? overrides[r.ticket_number] : null) ||
              (r.ticketNumber ? overrides[r.ticketNumber] : null)
            if (saved) {
              return {
                ...r,
                status: saved.status || r.status,
                is_public:
                  saved.is_public !== undefined ? saved.is_public : r.is_public,
              }
            }
            return r
          })
        } catch (e) {
          console.error('Error combining user reports in feed publik:', e)
        }
      }

      // Hanya tampilkan laporan yang dibuka untuk publik (is_public !== false)
      let filtered = baseReports.filter((r) => r.is_public !== false)

      // Filter Pencarian kata kunci judul atau deskripsi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        filtered = filtered.filter(
          (r) =>
            (r.judul && r.judul.toLowerCase().includes(q)) ||
            (r.deskripsi && r.deskripsi.toLowerCase().includes(q)) ||
            (r.nomor_tiket && r.nomor_tiket.toLowerCase().includes(q)) ||
            (r.ticket_number && r.ticket_number.toLowerCase().includes(q))
        )
      }

      // Urutkan laporan terbaru di atas
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })

      setReports(filtered)
    } catch (err) {
      console.error('Error fetching reports:', err)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (report: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      alert('Silakan login terlebih dahulu untuk memberikan dukungan pada laporan ini.')
      return
    }

    const ticketKey = report.ticketNumber || report.nomor_tiket || report.ticket_number || report.id
    if (!ticketKey) return

    if (likingReports.has(ticketKey)) return
    setLikingReports((prev) => new Set(prev).add(ticketKey))

    const isCurrentlyLiked = likedReports.has(ticketKey) || likedReports.has(report.id)

    // Optimistic UI update
    setReports((prev) =>
      prev.map((r) => {
        const rKey = r.ticketNumber || r.nomor_tiket || r.ticket_number || r.id
        if (rKey === ticketKey || (r.id && report.id && r.id === report.id)) {
          const currentCount = r.dukungan_count || 0
          return {
            ...r,
            dukungan_count: isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
          }
        }
        return r
      })
    )

    setLikedReports((prev) => {
      const next = new Set(prev)
      if (isCurrentlyLiked) {
        next.delete(ticketKey)
        if (report.id) next.delete(report.id)
      } else {
        next.add(ticketKey)
        if (report.id) next.add(report.id)
      }
      return next
    })

    if (typeof window !== 'undefined') {
      try {
        const storedLikes: string[] = JSON.parse(
          localStorage.getItem('halo_jurnal_user_likes') || '[]'
        )
        const nextLikes = isCurrentlyLiked
          ? storedLikes.filter((id) => id !== ticketKey && id !== report.id)
          : Array.from(new Set([...storedLikes, ticketKey]))
        localStorage.setItem('halo_jurnal_user_likes', JSON.stringify(nextLikes))

        const storedReports = JSON.parse(localStorage.getItem('halo_jurnal_user_reports') || '[]')
        const updatedReports = storedReports.map((r: any) => {
          const rKey = r.ticketNumber || r.nomor_tiket || r.ticket_number || r.id
          if (rKey === ticketKey || (r.id && report.id && r.id === report.id)) {
            const curr = r.dukungan_count || 0
            return {
              ...r,
              dukungan_count: isCurrentlyLiked ? Math.max(0, curr - 1) : curr + 1,
            }
          }
          return r
        })
        localStorage.setItem('halo_jurnal_user_reports', JSON.stringify(updatedReports))
      } catch (err) {
        console.error('Error saving like locally:', err)
      }
    }

    try {
      const res = await fetch('/api/reports/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketNumber: ticketKey,
          email: user.email,
        }),
      })
      const data = await res.json()
      if (data.success && typeof data.dukunganCount === 'number') {
        setReports((prev) =>
          prev.map((r) => {
            const rKey = r.ticketNumber || r.nomor_tiket || r.ticket_number || r.id
            if (rKey === ticketKey || (r.id && report.id && r.id === report.id)) {
              return {
                ...r,
                dukungan_count: data.dukunganCount,
              }
            }
            return r
          })
        )
      }
    } catch (err) {
      console.error('Error saving support to database:', err)
    } finally {
      setLikingReports((prev) => {
        const next = new Set(prev)
        next.delete(ticketKey)
        return next
      })
    }
  }

  // Perhitungan Paginasi
  const totalReports = reports.length
  const totalPages = Math.ceil(totalReports / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentReports = reports.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setCurrentPage(page)
    feedTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Header: Judul & Deskripsi */}
      <div className="mb-5 sm:mb-6">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
          Transparansi Aduan Sukabumi
        </h1>
        <p className="text-secondary text-xs sm:text-sm mt-1">
          Daftar pengaduan warga yang dibuka secara transparan untuk pengawasan bersama.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6 sm:mb-8">
        <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari judul atau isi aduan warga..."
          className="w-full pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm bg-surface border border-outline-variant/80 rounded-2xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary shadow-2xs transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer p-1"
            title="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Reports List */}
      <main ref={feedTopRef} className="scroll-mt-24">
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 text-secondary">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Memuat laporan publik...</p>
          </div>
        ) : reports.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentReports.map((report) => {
                const ticketKey = report.ticketNumber || report.nomor_tiket || report.ticket_number || report.id
                const isLiked = (ticketKey && likedReports.has(ticketKey)) || (report.id && likedReports.has(report.id))
                const imgUrl =
                  report.laporan_lampiran &&
                  report.laporan_lampiran.length > 0 &&
                  report.laporan_lampiran[0].file_url
                    ? report.laporan_lampiran[0].file_url
                    : null

                return (
                  <div
                    key={report.id}
                    className="bg-surface border border-outline-variant/80 hover:border-primary/50 rounded-2xl p-4 sm:p-5 shadow-2xs transition-all duration-200"
                  >
                    {/* Header Card: Pelapor Dilindungi (Anonim) & Waktu */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 text-secondary">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-secondary/80" />
                        <span className="font-semibold text-xs sm:text-sm text-on-surface leading-tight">
                          Identitas Pelapor Dilindungi (Anonim)
                        </span>
                      </div>
                      <span className="block text-[11px] text-secondary mt-0.5">
                        {getRelativeTime(report.created_at)}
                      </span>
                    </div>

                    {/* Content Section: Title & Description di kiri, Thumbnail Foto di kanan */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link href={`/halo-jurnal/laporan/${report.id}`} className="group/title block">
                          <h3 className="font-heading font-bold text-base sm:text-lg text-on-surface group-hover/title:text-primary transition-colors leading-snug mb-2">
                            {report.judul}
                          </h3>
                        </Link>
                        <p className="text-secondary text-xs sm:text-sm line-clamp-3 leading-relaxed">
                          {report.deskripsi}
                        </p>
                      </div>

                      {imgUrl && (() => {
                        const isVid =
                          report.laporan_lampiran?.[0]?.file_type?.startsWith('video/') ||
                          imgUrl.startsWith('data:video/') ||
                          imgUrl.endsWith('.mp4') ||
                          imgUrl.endsWith('.webm')
                        return (
                          <Link
                            href={`/halo-jurnal/laporan/${report.id}`}
                            className="shrink-0 w-24 h-20 sm:w-36 sm:h-24 md:w-44 md:h-28 rounded-xl overflow-hidden bg-black border border-outline-variant/60 relative group block"
                          >
                            {isVid ? (
                              <video
                                src={imgUrl}
                                muted
                                playsInline
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <img
                                src={imgUrl}
                                alt={report.judul}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            )}
                          </Link>
                        )
                      })()}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 mt-3 border-t border-outline-variant/60 flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={(e) => handleLike(report, e)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                          isLiked
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface border-outline-variant/80 hover:border-primary/50 text-on-surface hover:text-primary'
                        }`}
                        title={isLiked ? 'Batal dukung' : 'Beri dukungan warga'}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        <span>Dukung ({report.dukungan_count || 0})</span>
                      </button>

                      <Link
                        href={`/halo-jurnal/laporan/${report.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-on-surface transition-colors group shrink-0"
                      >
                        <span>Lihat Detail Laporan</span>
                        <ArrowRight className="w-3.5 h-3.5 text-secondary/70 group-hover:text-on-surface group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Kontrol Paginasi */}
            {totalPages > 1 && (
              <div className="pt-6 pb-2 flex items-center justify-center border-t border-outline-variant/60 mt-6">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-outline-variant/80 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 text-on-surface hover:text-primary cursor-pointer active:scale-95 bg-surface shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      const isActive = page === currentPage
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-2xs ${
                            isActive
                              ? 'bg-primary text-white border border-primary shadow-xs'
                              : 'bg-surface border border-outline-variant/80 text-on-surface hover:border-primary hover:text-primary'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    }

                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-1 text-xs text-secondary">
                          ...
                        </span>
                      )
                    }

                    return null
                  })}

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-outline-variant/80 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 text-on-surface hover:text-primary cursor-pointer active:scale-95 bg-surface shadow-2xs"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/60">
            <p className="text-sm font-semibold text-on-surface mb-1">
              Tidak ada aduan warga yang cocok
            </p>
            <p className="text-xs text-secondary mb-4">
              Coba gunakan kata kunci pencarian yang lain.
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer"
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function HaloJurnalFeedPublikPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <FeedPublikContent />
    </Suspense>
  )
}
