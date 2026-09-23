'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  ThumbsUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  X,
  Share2,
} from 'lucide-react'

import { DUMMY_REPORTS } from '@/data/dummyReports'

function FeedPublikContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()

  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [likedReports, setLikedReports] = useState<Set<string>>(new Set())
  const [likingReports, setLikingReports] = useState<Set<string>>(new Set())

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedJenis, setSelectedJenis] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    fetchReports()
  }, [selectedCategories, selectedStatus, selectedJenis, searchQuery])

  useEffect(() => {
    if (user && reports.length > 0) {
      fetchUserLikes()
    }
  }, [user, reports])

  const fetchUserLikes = async () => {
    if (!user) return
    const reportIds = reports.map((r) => r.id)
    const { data } = await supabase
      .from('dukungan')
      .select('laporan_id')
      .eq('user_id', user.id)
      .in('laporan_id', reportIds)

    if (data) {
      setLikedReports(new Set(data.map((d: { laporan_id: string }) => d.laporan_id)))
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    let query = supabase
      .from('laporan')
      .select('*, laporan_lampiran(file_url), chat_messages(count)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (selectedCategories.length > 0) {
      query = query.in('kategori', selectedCategories)
    }

    if (selectedStatus && selectedStatus !== 'Semua Laporan') {
      const statusMap: Record<string, string> = {
        Diterima: 'diterima',
        Diproses: 'diproses',
        Selesai: 'selesai',
        Ditindaklanjuti: 'ditindaklanjuti',
      }
      if (statusMap[selectedStatus]) {
        query = query.eq('status', statusMap[selectedStatus])
      }
    }

    if (selectedJenis && selectedJenis !== 'Semua Jenis') {
      const jenisMap: Record<string, string> = {
        Pengaduan: 'pengaduan',
        Aspirasi: 'aspirasi',
        Informasi: 'informasi',
        Inspirasi: 'inspirasi',
      }
      if (jenisMap[selectedJenis]) {
        query = query.eq('jenis', jenisMap[selectedJenis])
      }
    }

    if (searchQuery.trim()) {
      query = query.or(`judul.ilike.%${searchQuery}%,deskripsi.ilike.%${searchQuery}%,lokasi.ilike.%${searchQuery}%`)
    }

    try {
      const { data, error } = await query
      if (!error && data && data.length > 0) {
        setReports(data)
      } else {
        // Fallback ke DUMMY_REPORTS dengan filter client-side
        let filtered = [...DUMMY_REPORTS]
        if (selectedCategories.length > 0) {
          filtered = filtered.filter((r) => selectedCategories.includes(r.kategori))
        }
        if (selectedStatus && selectedStatus !== 'Semua Laporan') {
          const statusMap: Record<string, string> = {
            Diterima: 'diterima',
            Diproses: 'diproses',
            Selesai: 'selesai',
            Ditindaklanjuti: 'ditindaklanjuti',
          }
          if (statusMap[selectedStatus]) {
            filtered = filtered.filter((r) => r.status === statusMap[selectedStatus])
          }
        }
        if (selectedJenis && selectedJenis !== 'Semua Jenis') {
          filtered = filtered.filter((r) => r.jenis.toLowerCase() === selectedJenis.toLowerCase())
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (r) =>
              r.judul.toLowerCase().includes(q) ||
              r.deskripsi.toLowerCase().includes(q) ||
              r.lokasi.toLowerCase().includes(q)
          )
        }
        setReports(filtered)
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
      setReports(DUMMY_REPORTS)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (reportId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      alert('Silakan login terlebih dahulu untuk memberikan dukungan pada laporan ini.')
      return
    }

    if (likingReports.has(reportId)) return

    setLikingReports((prev) => new Set(prev).add(reportId))
    const isCurrentlyLiked = likedReports.has(reportId)

    // Optimistic UI update
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
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
        next.delete(reportId)
      } else {
        next.add(reportId)
      }
      return next
    })

    try {
      if (isCurrentlyLiked) {
        await supabase.from('dukungan').delete().eq('laporan_id', reportId).eq('user_id', user.id)
      } else {
        await supabase.from('dukungan').insert({ laporan_id: reportId, user_id: user.id })
      }
    } catch (err) {
      console.error('Error toggling support:', err)
      // Rollback on error
      fetchReports()
    } finally {
      setLikingReports((prev) => {
        const next = new Set(prev)
        next.delete(reportId)
        return next
      })
    }
  }

  const categories = [
    'Infrastruktur',
    'Kebersihan Lingkungan',
    'Keamanan & Ketertiban',
    'Pelayanan Publik',
    'Kesehatan',
    'Pembangunan Daerah',
    'Program Kemasyarakatan',
    'Gotong Royong',
    'Prestasi Warga',
  ]

  const statusOptions = ['Semua Laporan', 'Diterima', 'Diproses', 'Ditindaklanjuti', 'Selesai']
  const jenisOptions = ['Semua Jenis', 'Pengaduan', 'Aspirasi', 'Informasi', 'Inspirasi']

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat))
    } else {
      setSelectedCategories([...selectedCategories, cat])
    }
  }

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 pt-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Transparansi Aspirasi Sukabumi
          </h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Daftar laporan warga yang dibuka secara transparan untuk pengawasan bersama.
          </p>
        </div>

        <Link
          href="/halo-jurnal/lapor"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold tracking-tight shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
        >
          + Buat Laporan Baru
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface border border-outline-variant/80 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, kata kunci, atau nama jalan..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-semibold focus:outline-none focus:border-primary"
            >
              {jenisOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-semibold focus:outline-none focus:border-primary"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isFilterOpen || selectedCategories.length > 0
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container-high'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Kategori</span>
              {selectedCategories.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] flex items-center justify-center font-bold">
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Category Chips */}
        {isFilterOpen && (
          <div className="pt-3 mt-3 border-t border-outline-variant/60 flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-bold text-secondary mr-1">Filter Kategori:</span>
            {categories.map((cat) => {
              const active = selectedCategories.includes(cat)
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    active
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategories([])}
                className="text-[11px] text-rose-500 hover:underline font-semibold ml-2"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 text-secondary">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs">Memuat laporan publik...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => {
            const isLiked = likedReports.has(report.id)
            const chatCount = report.chat_messages?.[0]?.count || 0

            return (
              <div
                key={report.id}
                className="group bg-surface border border-outline-variant/80 hover:border-primary/40 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="p-5 flex-1">
                  {/* Status & Date */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    {report.status === 'selesai' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200/50">
                        <CheckCircle2 className="w-3 h-3" />
                        {report.jenis === 'inspirasi' ? 'Tayang' : 'Selesai'}
                      </span>
                    )}
                    {report.status === 'diproses' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-200/50">
                        <Clock className="w-3 h-3" />
                        Diproses
                      </span>
                    )}
                    {report.status === 'diterima' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200/50">
                        <Clock className="w-3 h-3" />
                        Diterima
                      </span>
                    )}
                    {report.status === 'ditindaklanjuti' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200/50">
                        <ShieldCheck className="w-3 h-3" />
                        Ditindaklanjuti
                      </span>
                    )}

                    <span className="text-[11px] font-medium text-secondary flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(report.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <Link href={`/halo-jurnal/laporan/${report.id}`}>
                    <h3 className="font-heading font-bold text-base text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {report.judul}
                    </h3>
                  </Link>

                  <p className="text-secondary text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed">
                    {report.deskripsi}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{report.lokasi || 'Sukabumi'}</span>
                  </div>
                </div>

                {report.laporan_lampiran &&
                  report.laporan_lampiran.length > 0 &&
                  report.laporan_lampiran[0].file_url && (
                    <Link
                      href={`/halo-jurnal/laporan/${report.id}`}
                      className="h-44 relative overflow-hidden bg-surface-container-high block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={report.judul}
                        src={report.laporan_lampiran[0].file_url}
                      />
                    </Link>
                  )}

                {/* Footer Actions: Dukungan & Diskusi */}
                <div className="px-5 py-3 border-t border-outline-variant/60 flex items-center justify-between bg-surface-container-lowest/50 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleLike(report.id, e)}
                      className={`inline-flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                        isLiked
                          ? 'text-primary'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                      title={isLiked ? 'Batal dukung' : 'Beri dukungan warga'}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{report.dukungan_count || 0} Dukungan</span>
                    </button>

                    <Link
                      href={`/halo-jurnal/laporan/${report.id}`}
                      className="inline-flex items-center gap-1.5 text-secondary hover:text-on-surface font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{chatCount} Tanggapan</span>
                    </Link>
                  </div>

                  <Link
                    href={`/halo-jurnal/laporan/${report.id}`}
                    className="font-bold text-primary hover:text-primary-dark tracking-tight"
                  >
                    Detail &rarr;
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/60">
          <p className="text-sm font-semibold text-on-surface mb-1">
            Tidak ada laporan publik yang cocok
          </p>
          <p className="text-xs text-secondary mb-4">
            Coba ubah kata kunci pencarian atau reset filter kategori di atas.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategories([])
              setSelectedStatus('')
              setSelectedJenis('')
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
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
