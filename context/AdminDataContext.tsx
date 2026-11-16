'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { DummyReport } from '@/data/dummyReports'
import { Article } from '@/types'
import {
  getCachedAdminReports,
  setCachedAdminReports,
  getCachedAdminArticles,
  setCachedAdminArticles,
  getCachedSidebarCounts,
  setCachedSidebarCounts,
} from '@/lib/adminCache'

export interface SidebarCounts {
  pendingReports: number
  unreadChat: number
  articles: number
  reels: number
  jobs: number
}

interface AdminDataContextType {
  reports: DummyReport[]
  articles: Article[]
  isLoadingReports: boolean
  isLoadingArticles: boolean
  counts: SidebarCounts
  refreshReports: () => Promise<void>
  refreshArticles: () => Promise<void>
  refreshAll: () => Promise<void>
}

const defaultCounts: SidebarCounts = {
  pendingReports: 0,
  unreadChat: 0,
  articles: 0,
  reels: 0,
  jobs: 0,
}

const AdminDataContext = createContext<AdminDataContextType>({
  reports: [],
  articles: [],
  isLoadingReports: false,
  isLoadingArticles: false,
  counts: defaultCounts,
  refreshReports: async () => {},
  refreshArticles: async () => {},
  refreshAll: async () => {},
})

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  // 1. Inisialisasi sinkron dari cache lokal agar 0 milidetik render awal
  const [reports, setReports] = useState<DummyReport[]>(() => getCachedAdminReports())
  const [articles, setArticles] = useState<Article[]>(() => getCachedAdminArticles())
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(
    () => getCachedAdminReports().length === 0
  )
  const [isLoadingArticles, setIsLoadingArticles] = useState<boolean>(
    () => getCachedAdminArticles().length === 0
  )
  const [counts, setCounts] = useState<SidebarCounts>(
    () => getCachedSidebarCounts() || defaultCounts
  )

  // Ref penampung data aktif untuk menghindari re-render loop
  const reportsRef = useRef(reports)
  const articlesRef = useRef(articles)

  useEffect(() => {
    reportsRef.current = reports
  }, [reports])

  useEffect(() => {
    articlesRef.current = articles
  }, [articles])

  // 2. Fungsi Hitung Unread Chat dari localStorage
  const calculateUnreadChats = useCallback(() => {
    if (typeof window === 'undefined') return 0
    try {
      const readSet = new Set<string>(
        JSON.parse(localStorage.getItem('halo_jurnal_read_chats') || '[]')
      )
      let unread = 0
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('halo_jurnal_chat_')) {
          try {
            const list = JSON.parse(localStorage.getItem(k) || '[]')
            if (Array.isArray(list)) {
              list.forEach((m: any) => {
                if (
                  m.sender_id !== 'admin-redaksi' &&
                  m.profiles?.role !== 'admin' &&
                  m.role !== 'admin' &&
                  !readSet.has(m.id)
                ) {
                  unread++
                }
              })
            }
          } catch {}
        }
      }
      return unread
    } catch {
      return 0
    }
  }, [])

  // 3. Sinkronisasi Badge Counts
  const syncCounts = useCallback(
    (currentReports: DummyReport[], currentArticles: Article[]) => {
      if (typeof window === 'undefined') return

      const pending = currentReports.filter((r) => r.status === 'diterima').length
      const unreadChatCount = calculateUnreadChats()

      let totalReels = 0
      try {
        const reelsSaved = JSON.parse(localStorage.getItem('jurnal_wave_reels') || '[]')
        totalReels = Array.isArray(reelsSaved) ? reelsSaved.length : 0
      } catch {}

      let totalJobs = 5
      try {
        const jobsSaved = JSON.parse(localStorage.getItem('jurnal_wave_jobs') || '[]')
        totalJobs = Array.isArray(jobsSaved) && jobsSaved.length > 0 ? jobsSaved.length : 5
      } catch {}

      const nextCounts: SidebarCounts = {
        pendingReports: pending,
        unreadChat: unreadChatCount,
        articles: currentArticles.length,
        reels: totalReels,
        jobs: totalJobs,
      }

      setCounts(nextCounts)
      setCachedSidebarCounts(nextCounts)
    },
    [calculateUnreadChats]
  )

  // 4. Fetch Reports dari API & Sinkronisasi Laporan Portal Warga
  const refreshReports = useCallback(async () => {
    let apiReports: DummyReport[] = []
    try {
      const res = await fetch('/api/reports', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          apiReports = json.data
        }
      }
    } catch (err) {
      console.warn('Gagal memuat aduan di AdminDataProvider:', err)
    }

    // Sinkronisasi dengan laporan portal warga (halo_jurnal_user_reports)
    let userReports: any[] = []
    let overrides: Record<string, any> = {}
    if (typeof window !== 'undefined') {
      try {
        userReports = JSON.parse(
          localStorage.getItem('halo_jurnal_user_reports') || '[]'
        )
        overrides = JSON.parse(
          localStorage.getItem('halo_jurnal_status_overrides') || '{}'
        )
      } catch {}
    }

    // Gabungkan laporan dari API dan dari Portal Warga (deduplikasi berdasarkan nomor tiket / ID)
    const combined = [...apiReports, ...userReports]
    const uniqueMap = new Map<string, any>()
    combined.forEach((item: any) => {
      const key = item.ticketNumber || item.nomor_tiket || item.ticket_number || item.id
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, item)
      }
    })

    const finalReports = Array.from(uniqueMap.values()).map((r: any) => {
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
        }
      }
      return r
    })

    setReports(finalReports)
    setCachedAdminReports(finalReports)
    syncCounts(finalReports, articlesRef.current)
    setIsLoadingReports(false)
  }, [syncCounts])

  // 5. Fetch Articles dari API
  const refreshArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/articles', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setArticles(json.data)
          setCachedAdminArticles(json.data)
          setIsLoadingArticles(false)
          syncCounts(reportsRef.current, json.data)
          return
        }
      }
    } catch (err) {
      console.warn('Gagal memuat artikel di AdminDataProvider:', err)
    }

    // Fallback ke penyimpanan lokal jika server kosong atau offline
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jurnal_wave_articles')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setArticles(parsed)
            setCachedAdminArticles(parsed)
            syncCounts(reportsRef.current, parsed)
          }
        }
      } catch {}
    }
    setIsLoadingArticles(false)
  }, [syncCounts])

  // 6. Refresh All
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshReports(), refreshArticles()])
  }, [refreshReports, refreshArticles])

  // 7. Initial Fetch & Auto-Sync dengan Portal Warga
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleSync = () => {
        refreshReports()
      }
      window.addEventListener('storage', handleSync)
      window.addEventListener('reports-updated', handleSync)
      return () => {
        window.removeEventListener('storage', handleSync)
        window.removeEventListener('reports-updated', handleSync)
      }
    }
  }, [refreshReports])

  useEffect(() => {
    refreshAll()

    const handleStorage = () => {
      syncCounts(reportsRef.current, articlesRef.current)
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)

    // Polling latar belakang berkala tiap 15 detik hanya saat tab aktif
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshReports()
      }
    }, 15000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [refreshAll, refreshReports, syncCounts])

  const contextValue = useMemo(
    () => ({
      reports,
      articles,
      isLoadingReports,
      isLoadingArticles,
      counts,
      refreshReports,
      refreshArticles,
      refreshAll,
    }),
    [
      reports,
      articles,
      isLoadingReports,
      isLoadingArticles,
      counts,
      refreshReports,
      refreshArticles,
      refreshAll,
    ]
  )

  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  )
}

export function useAdminData() {
  const context = useContext(AdminDataContext)
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider')
  }
  return context
}
