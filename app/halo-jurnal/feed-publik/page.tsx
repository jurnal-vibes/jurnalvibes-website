'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Filter,
  ThumbsUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  X,
  AlertTriangle,
  Lightbulb,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Check,
} from 'lucide-react'

import { DUMMY_REPORTS } from '@/data/dummyReports'
import {
  KOTA_SUKABUMI_KECAMATAN,
  KAB_SUKABUMI_KECAMATAN,
  SEMUA_WILAYAH_LABEL,
} from '@/data/sukabumiRegions'
import {
  getCategoriesForJenis,
  normalizeCategoryName,
} from '@/data/haloJurnalCategories'

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

  // Filters state dari Sidebar Filter Laporan
  const [selectedJenis, setSelectedJenis] = useState<string>('Semua Jenis')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua Laporan')
  const [selectedWilayah, setSelectedWilayah] = useState<string>(SEMUA_WILAYAH_LABEL)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Custom Dropdown Wilayah State
  const [isWilayahOpen, setIsWilayahOpen] = useState(false)
  const [wilayahSearch, setWilayahSearch] = useState('')
  const wilayahRef = useRef<HTMLDivElement>(null)
  const wilayahSearchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wilayahRef.current && !wilayahRef.current.contains(event.target as Node)) {
        setIsWilayahOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsWilayahOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (isWilayahOpen) {
      setTimeout(() => {
        wilayahSearchInputRef.current?.focus()
      }, 50)
    } else {
      setWilayahSearch('')
    }
  }, [isWilayahOpen])

  const categories = getCategoriesForJenis(selectedJenis)

  const statusOptions = ['Semua Laporan', 'Diterima', 'Diproses', 'Selesai']
  const jenisOptions = ['Semua Jenis', 'Pengaduan', 'Aspirasi', 'Informasi', 'Inspirasi']

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

    // Sinkronisasi otomatis saat beralih tab dari Admin
    const handleSync = () => {
      fetchReports()
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('focus', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('focus', handleSync)
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    fetchReports()
  }, [selectedCategories, selectedStatus, selectedJenis, selectedWilayah, searchQuery])

  useEffect(() => {
    if (reports.length > 0) {
      fetchUserLikes()
    }
  }, [reports])

  const fetchUserLikes = () => {
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
      let baseReports: any[] = [...DUMMY_REPORTS]

      // Gabungkan laporan warga dari localStorage (yang dibuat via Buat Laporan / Laporan Saya)
      if (typeof window !== 'undefined') {
        try {
          const userReports = JSON.parse(
            localStorage.getItem('halo_jurnal_user_reports') || '[]'
          )
          const overrides = JSON.parse(
            localStorage.getItem('halo_jurnal_status_overrides') || '{}'
          )

          // Gabungkan semua sumber laporan dan cegah duplikasi
          const combined = [...userReports, ...baseReports]
          const uniqueMap = new Map<string, any>()
          combined.forEach((item) => {
            const key = item.id || item.nomor_tiket || item.ticket_number
            if (key && !uniqueMap.has(key)) {
              uniqueMap.set(key, item)
            }
          })

          baseReports = Array.from(uniqueMap.values()).map((r: any) => {
            const saved =
              overrides[r.id] ||
              (r.nomor_tiket ? overrides[r.nomor_tiket] : null) ||
              (r.ticket_number ? overrides[r.ticket_number] : null)
            if (saved) {
              return {
                ...r,
                status: saved.status || r.status,
                is_public:
                  saved.is_public !== undefined ? saved.is_public : r.is_public,
                status_log: saved.status_log || r.status_log,
              }
            }
            return r
          })
        } catch (e) {
          console.error('Error combining user reports in feed publik:', e)
        }
      }

      // 1. Filter KETAT: Hanya laporan yang diizinkan tayang publik (is_public !== false)
      let filtered = baseReports.filter((r) => r.is_public !== false)

      // 2. Filter Kategori
      if (selectedCategories.length > 0) {
        filtered = filtered.filter((r) =>
          selectedCategories.some(
            (c) =>
              normalizeCategoryName(c).toLowerCase() ===
              normalizeCategoryName(r.kategori).toLowerCase()
          )
        )
      }

      // 3. Filter Status
      if (selectedStatus && selectedStatus !== 'Semua Laporan') {
        const statusMap: Record<string, string> = {
          Diterima: 'diterima',
          Diproses: 'diproses',
          Selesai: 'selesai',
        }
        if (statusMap[selectedStatus]) {
          filtered = filtered.filter((r) => r.status === statusMap[selectedStatus])
        }
      }

      // 4. Filter Jenis Laporan
      if (selectedJenis && selectedJenis !== 'Semua Jenis') {
        filtered = filtered.filter((r) => r.jenis?.toLowerCase() === selectedJenis.toLowerCase())
      }

      // 5. Filter Wilayah
      if (selectedWilayah && selectedWilayah !== SEMUA_WILAYAH_LABEL) {
        if (selectedWilayah === 'Kota Sukabumi') {
          const kotaKeywords = [
            'kota sukabumi',
            'cikole',
            'citamiang',
            'warudoyong',
            'baros',
            'lembursitu',
            'gunungpuyuh',
            'cibeureum',
          ]
          filtered = filtered.filter((r) => {
            const loc = (r.lokasi || '').toLowerCase()
            return kotaKeywords.some((k) => loc.includes(k))
          })
        } else if (selectedWilayah === 'Kab. Sukabumi') {
          filtered = filtered.filter((r) => {
            const loc = (r.lokasi || '').toLowerCase()
            return loc.includes('kab') || loc.includes('kabupaten')
          })
        } else {
          const cleanWilayah = selectedWilayah.replace(/^Kec\.\s*/i, '').trim().toLowerCase()
          filtered = filtered.filter((r) => (r.lokasi || '').toLowerCase().includes(cleanWilayah))
        }
      }

      // 6. Filter Pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (r) =>
            r.judul?.toLowerCase().includes(q) ||
            r.deskripsi?.toLowerCase().includes(q) ||
            r.nomor_tiket?.toLowerCase().includes(q) ||
            r.ticket_number?.toLowerCase().includes(q) ||
            r.lokasi?.toLowerCase().includes(q)
        )
      }

      setReports(filtered)
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
      if (typeof window !== 'undefined') {
        const storedLikes: string[] = JSON.parse(
          localStorage.getItem('halo_jurnal_user_likes') || '[]'
        )
        const nextLikes = isCurrentlyLiked
          ? storedLikes.filter((id) => id !== reportId)
          : [...storedLikes, reportId]
        localStorage.setItem('halo_jurnal_user_likes', JSON.stringify(nextLikes))
      }
    } catch (err) {
      console.error('Error saving like locally:', err)
    } finally {
      setLikingReports((prev) => {
        const next = new Set(prev)
        next.delete(reportId)
        return next
      })
    }
  }

  const handleSelectJenis = (item: string) => {
    setSelectedJenis(item)
    const validCats = getCategoriesForJenis(item)
    setSelectedCategories((prev) =>
      prev.filter((c) =>
        validCats.some((v) => v.toLowerCase() === c.toLowerCase())
      )
    )
  }

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat))
    } else {
      setSelectedCategories([...selectedCategories, cat])
    }
  }

  const resetAllFilters = () => {
    setSelectedJenis('Semua Jenis')
    setSelectedCategories([])
    setSelectedStatus('Semua Laporan')
    setSelectedWilayah(SEMUA_WILAYAH_LABEL)
    setSearchQuery('')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    selectedJenis !== 'Semua Jenis' ||
    selectedCategories.length > 0 ||
    selectedStatus !== 'Semua Laporan' ||
    selectedWilayah !== SEMUA_WILAYAH_LABEL ||
    searchQuery.trim().length > 0

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

  // Filter list kecamatan berdasarkan input pencarian dropdown
  const searchClean = wilayahSearch.trim().toLowerCase()
  const filteredKotaKec = KOTA_SUKABUMI_KECAMATAN.filter((w) =>
    w.toLowerCase().includes(searchClean)
  )
  const filteredKabKec = KAB_SUKABUMI_KECAMATAN.filter((w) =>
    w.toLowerCase().includes(searchClean)
  )
  const showSemuaWilayah =
    !searchClean || SEMUA_WILAYAH_LABEL.toLowerCase().includes(searchClean)
  const showSemuaKota =
    !searchClean || 'semua kota sukabumi'.includes(searchClean)
  const showSemuaKab =
    !searchClean || 'semua kab. sukabumi'.includes(searchClean)
  const hasAnyMatches =
    showSemuaWilayah ||
    showSemuaKota ||
    showSemuaKab ||
    filteredKotaKec.length > 0 ||
    filteredKabKec.length > 0

  return (
    <div className="w-full max-w-container-max mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/60">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-outline-variant text-xs font-bold text-primary shadow-2xs cursor-pointer"
        >
          <Filter className="w-4 h-4" />
          <span>Filter Laporan {hasActiveFilters && '(Aktif)'}</span>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-8 relative">
        {/* ===================== SIDEBAR KIRI: FILTER LAPORAN (STICKY) ===================== */}
        <aside
          className={`w-full md:w-64 lg:w-72 shrink-0 md:border-r border-outline-variant/60 md:pr-6 self-stretch ${
            mobileFilterOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto subtle-scrollbar pr-1 pb-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-xl text-primary tracking-tight">
                Filter Laporan
              </h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {/* 1. JENIS LAPORAN */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary mb-3">
                JENIS LAPORAN
              </span>
              <div className="space-y-2.5">
                {jenisOptions.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer select-none group"
                  >
                    <input
                      type="radio"
                      name="sidebar-jenis-laporan"
                      checked={selectedJenis === item}
                      onChange={() => handleSelectJenis(item)}
                      className="w-4 h-4 accent-primary text-primary cursor-pointer"
                    />
                    <span
                      className={`transition-colors ${
                        selectedJenis === item
                          ? 'font-bold text-on-surface'
                          : 'text-secondary group-hover:text-on-surface'
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. KATEGORI */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary mb-3">
                KATEGORI
              </span>
              <div className="space-y-2.5 max-h-56 overflow-y-auto subtle-scrollbar pr-1">
                {categories.map((cat) => {
                  const checked = selectedCategories.includes(cat)
                  return (
                    <label
                      key={cat}
                      className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer select-none group"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 rounded accent-primary text-primary cursor-pointer"
                      />
                      <span
                        className={`transition-colors ${
                          checked
                            ? 'font-bold text-on-surface'
                            : 'text-secondary group-hover:text-on-surface'
                        }`}
                      >
                        {cat}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* 3. STATUS */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary mb-3">
                STATUS
              </span>
              <div className="space-y-2.5">
                {statusOptions.map((st) => (
                  <label
                    key={st}
                    className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer select-none group"
                  >
                    <input
                      type="radio"
                      name="sidebar-status-laporan"
                      checked={selectedStatus === st}
                      onChange={() => setSelectedStatus(st)}
                      className="w-4 h-4 accent-primary text-primary cursor-pointer"
                    />
                    <span
                      className={`transition-colors ${
                        selectedStatus === st
                          ? 'font-bold text-on-surface'
                          : 'text-secondary group-hover:text-on-surface'
                      }`}
                    >
                      {st}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. WILAYAH (CUSTOM SEARCHABLE DROPDOWN BUTTON) */}
            <div ref={wilayahRef} className="relative inline-block w-full max-w-[210px]">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  WILAYAH
                </span>
                {selectedWilayah !== SEMUA_WILAYAH_LABEL && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWilayah(SEMUA_WILAYAH_LABEL)
                      setIsWilayahOpen(false)
                    }}
                    className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Trigger Button - Ramping & Tidak Terlalu Lebar ke Kanan */}
              <button
                type="button"
                onClick={() => setIsWilayahOpen(!isWilayahOpen)}
                className={`w-full max-w-[210px] flex items-center justify-between gap-1.5 px-3 py-2 text-xs bg-surface border rounded-xl text-on-surface font-semibold shadow-2xs cursor-pointer transition-all duration-150 ${
                  isWilayahOpen
                    ? 'border-primary ring-2 ring-primary/10 shadow-sm'
                    : selectedWilayah !== SEMUA_WILAYAH_LABEL
                    ? 'border-primary/80 bg-primary/[0.03]'
                    : 'border-outline-variant/80 hover:border-primary/50'
                }`}
                aria-expanded={isWilayahOpen}
                aria-haspopup="listbox"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <MapPin
                    className={`w-3.5 h-3.5 shrink-0 ${
                      selectedWilayah !== SEMUA_WILAYAH_LABEL ? 'text-primary' : 'text-secondary'
                    }`}
                  />
                  <span className="truncate text-left font-medium text-xs">
                    {selectedWilayah}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 text-secondary transition-transform duration-200 ${
                    isWilayahOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {/* Floating Dropdown Popover */}
              {isWilayahOpen && (
                <div className="absolute top-full left-0 w-64 max-w-[calc(100vw-2rem)] mt-1.5 z-50 bg-surface border border-outline-variant rounded-2xl shadow-xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                  {/* Search Input Bar inside Popover */}
                  <div className="p-2 border-b border-outline-variant/60 bg-surface-container-lowest/90 sticky top-0 z-10">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        ref={wilayahSearchInputRef}
                        type="text"
                        value={wilayahSearch}
                        onChange={(e) => setWilayahSearch(e.target.value)}
                        placeholder="Cari kecamatan..."
                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                      />
                      {wilayahSearch && (
                        <button
                          type="button"
                          onClick={() => setWilayahSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Options List - Menggunakan subtle-scrollbar */}
                  <div className="max-h-56 overflow-y-auto subtle-scrollbar p-1.5 space-y-1 text-xs divide-y divide-outline-variant/40">
                    {/* Opsi: Semua Wilayah */}
                    {showSemuaWilayah && (
                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWilayah(SEMUA_WILAYAH_LABEL)
                            setIsWilayahOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                            selectedWilayah === SEMUA_WILAYAH_LABEL
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          <span>{SEMUA_WILAYAH_LABEL}</span>
                          {selectedWilayah === SEMUA_WILAYAH_LABEL && (
                            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Group: Kota Sukabumi */}
                    {(showSemuaKota || filteredKotaKec.length > 0) && (
                      <div className="pt-1.5 space-y-1">
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center justify-between">
                          <span>Kota Sukabumi</span>
                          <span className="text-[10px] bg-surface-container px-1.5 py-0.2 rounded font-normal">
                            7 Kec
                          </span>
                        </div>

                        {showSemuaKota && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWilayah('Kota Sukabumi')
                              setIsWilayahOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                              selectedWilayah === 'Kota Sukabumi'
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'text-on-surface hover:bg-surface-container'
                            }`}
                          >
                            <span className="font-semibold text-xs">Semua Kota Sukabumi</span>
                            {selectedWilayah === 'Kota Sukabumi' && (
                              <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                            )}
                          </button>
                        )}

                        {filteredKotaKec.map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => {
                              setSelectedWilayah(w)
                              setIsWilayahOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                              selectedWilayah === w
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'text-on-surface hover:bg-surface-container'
                            }`}
                          >
                            <span className="text-xs">{w}</span>
                            {selectedWilayah === w && (
                              <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Group: Kabupaten Sukabumi */}
                    {(showSemuaKab || filteredKabKec.length > 0) && (
                      <div className="pt-1.5 space-y-1">
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center justify-between">
                          <span>Kabupaten Sukabumi</span>
                          <span className="text-[10px] bg-surface-container px-1.5 py-0.2 rounded font-normal">
                            47 Kec
                          </span>
                        </div>

                        {showSemuaKab && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWilayah('Kab. Sukabumi')
                              setIsWilayahOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                              selectedWilayah === 'Kab. Sukabumi'
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'text-on-surface hover:bg-surface-container'
                            }`}
                          >
                            <span className="font-semibold text-xs">Semua Kab. Sukabumi</span>
                            {selectedWilayah === 'Kab. Sukabumi' && (
                              <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                            )}
                          </button>
                        )}

                        {filteredKabKec.map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => {
                              setSelectedWilayah(w)
                              setIsWilayahOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                              selectedWilayah === w
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'text-on-surface hover:bg-surface-container'
                            }`}
                          >
                            <span className="text-xs">{w}</span>
                            {selectedWilayah === w && (
                              <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {!hasAnyMatches && (
                      <div className="py-6 px-3 text-center text-secondary">
                        <p className="text-xs font-semibold text-on-surface">Kecamatan tidak ditemukan</p>
                        <p className="text-[11px] mt-0.5">Coba kata kunci lain atau periksa ejaan.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ===================== KONTEN UTAMA ===================== */}
        <main ref={feedTopRef} className="flex-1 min-w-0 w-full scroll-mt-24">
          {/* Top Header: Judul & Deskripsi */}
          <div className="mb-6">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
              Transparansi Aspirasi Sukabumi
            </h1>
            <p className="text-secondary text-xs sm:text-sm mt-1">
              Daftar laporan warga yang dibuka secara transparan untuk pengawasan bersama.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, kata kunci, atau nama jalan..."
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-surface border border-outline-variant/80 rounded-xl text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary shadow-2xs transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Reports List: Kartu Panjang Membentang */}
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 text-secondary">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs">Memuat laporan publik...</p>
            </div>
          ) : reports.length > 0 ? (
            <>
              <div className="space-y-4">
                {currentReports.map((report) => {
                  const isLiked = likedReports.has(report.id)
                  const imgUrl =
                    report.laporan_lampiran &&
                    report.laporan_lampiran.length > 0 &&
                    report.laporan_lampiran[0].file_url
                      ? report.laporan_lampiran[0].file_url
                      : null

                  return (
                    <div
                      key={report.id}
                      className="bg-surface border border-outline-variant/80 hover:border-primary/50 rounded-2xl p-4 sm:p-6 shadow-2xs transition-all duration-200"
                    >
                      {/* Header Card: Pelapor Terenkripsi & Waktu / Alamat */}
                      <div className="mb-3">
                        <span className="block font-bold text-xs sm:text-sm text-on-surface leading-tight">
                          Pelapor Terenkripsi
                        </span>
                        <span className="block text-[11px] text-secondary mt-0.5 leading-snug line-clamp-1">
                          {getRelativeTime(report.created_at)} &bull; {report.lokasi || 'Sukabumi, Jawa Barat'}
                        </span>
                      </div>

                      {/* Badges Row: Jenis Laporan & Status */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {/* Jenis Badge */}
                        {report.jenis === 'informasi' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-[11px] font-semibold border border-outline-variant/60">
                            <FileText className="w-3 h-3 text-secondary" />
                            <span>Informasi</span>
                          </span>
                        )}
                        {report.jenis === 'pengaduan' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-[11px] font-semibold border border-outline-variant/60">
                            <AlertTriangle className="w-3 h-3 text-secondary" />
                            <span>Pengaduan</span>
                          </span>
                        )}
                        {report.jenis === 'aspirasi' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-[11px] font-semibold border border-outline-variant/60">
                            <Lightbulb className="w-3 h-3 text-secondary" />
                            <span>Aspirasi</span>
                          </span>
                        )}
                        {report.jenis === 'inspirasi' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-[11px] font-semibold border border-outline-variant/60">
                            <BookOpen className="w-3 h-3 text-secondary" />
                            <span>Inspirasi</span>
                          </span>
                        )}

                        {/* Kategori Badge */}
                        {report.kategori && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-surface-container-low text-secondary text-[11px] font-medium border border-outline-variant/60">
                            {normalizeCategoryName(report.kategori)}
                          </span>
                        )}

                        {/* Status */}
                        {report.status === 'selesai' && (
                          <span className="text-[11px] font-bold text-secondary dark:text-slate-400 tracking-tight">
                            Selesai
                          </span>
                        )}
                        {report.status === 'diproses' && (
                          <span className="text-[11px] font-bold text-secondary dark:text-slate-400 tracking-tight">
                            Diproses
                          </span>
                        )}
                        {report.status === 'diterima' && (
                          <span className="text-[11px] font-bold text-secondary dark:text-slate-400 tracking-tight">
                            Diterima
                          </span>
                        )}
                        {report.status === 'ditindaklanjuti' && (
                          <span className="text-[11px] font-bold text-secondary dark:text-slate-400 tracking-tight">
                            Ditindaklanjuti
                          </span>
                        )}
                      </div>

                      {/* Content Section: Title & Description di kiri, Image di kanan */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link href={`/halo-jurnal/laporan/${report.id}`} className="group/title block">
                            <h3 className="font-heading font-bold text-base sm:text-lg text-on-surface group-hover/title:text-primary transition-colors leading-snug mb-1.5">
                              {report.judul}
                            </h3>
                          </Link>
                          <p className="text-secondary text-xs sm:text-sm line-clamp-3 leading-relaxed">
                            {report.deskripsi}
                          </p>
                        </div>

                        {imgUrl && (
                          <Link
                            href={`/halo-jurnal/laporan/${report.id}`}
                            className="shrink-0 w-full sm:w-44 md:w-56 h-40 sm:h-28 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/60 relative group block"
                          >
                            <img
                              src={imgUrl}
                              alt={report.judul}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        )}
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="pt-3.5 mt-4 border-t border-outline-variant/60 flex items-center justify-between gap-2.5 text-xs">
                        <button
                          type="button"
                          onClick={(e) => handleLike(report.id, e)}
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
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline group shrink-0"
                        >
                          <span className="hidden sm:inline">Lihat Detail &amp; Chat Admin</span>
                          <span className="sm:hidden">Detail &amp; Chat</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Kontrol Paginasi Angka Klasik */}
              {totalPages > 1 && (
                <div className="pt-6 pb-2 flex items-center justify-center border-t border-outline-variant/60 mt-6">
                  <div className="flex items-center gap-1.5">
                    {/* Tombol Sebelumnya */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-outline-variant/80 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 text-on-surface hover:text-primary cursor-pointer active:scale-95 bg-surface shadow-2xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    {/* Nomor Halaman */}
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

                    {/* Tombol Selanjutnya */}
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
                Tidak ada laporan publik yang cocok
              </p>
              <p className="text-xs text-secondary mb-4">
                Coba ubah kata kunci pencarian atau sesuaikan pilihan filter di sebelah kiri.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </main>
      </div>
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
