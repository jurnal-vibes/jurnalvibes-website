'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const isLoginPage = pathname === '/halo-jurnal/admin/login'

  useEffect(() => {
    // Jika sedang di halaman login, tidak perlu cek autentikasi di layout
    if (isLoginPage) {
      setIsAuthenticated(true)
      return
    }

    let isMounted = true

    const verifyAdmin = async () => {
      try {
        // Verifikasi status sesi resmi server via HTTP-Only Cookie
        const res = await fetch('/api/admin/auth', {
          method: 'GET',
          cache: 'no-store',
        })
        const data = await res.json()

        if (!isMounted) return

        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.replace('/halo-jurnal/admin/login')
        }
      } catch {
        if (!isMounted) return
        setIsAuthenticated(false)
        router.replace('/halo-jurnal/admin/login')
      }
    }

    verifyAdmin()

    return () => {
      isMounted = false
    }
  }, [pathname, isLoginPage, router])

  // Jika di halaman login, tampilkan halaman login utuh
  if (isLoginPage) {
    return <>{children}</>
  }

  // Tampilan transisi saat verifikasi keamanan berlangsung
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] text-[#1b1c1c] flex flex-col items-center justify-center p-4 font-sans antialiased">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/halo-jurnal-icon.webp"
              alt="Halo Jurnal Logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs tracking-wide">
            <Loader2 className="w-4 h-4 animate-spin text-[#c00015]" />
            <span>Memverifikasi Hak Akses Redaksi...</span>
          </div>
          <p className="text-[11px] text-slate-400">
            JurnalCentral — Pusat Kendali Jurnal Wave &amp; Halo Jurnal
          </p>
        </div>
      </div>
    )
  }

  // Layout Dashboard Admin Utama jika sudah terautentikasi
  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#1b1c1c] flex font-sans antialiased selection:bg-[#c00015] selection:text-white">
      {/* Sidebar Navigasi Kiri */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Konten Utama Kanan */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-200">
        {/* Topbar Header */}
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Konten Halaman */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Footer Kecil Admin */}
        <footer className="px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-500 bg-white/50">
          © 2026 <strong className="text-slate-800 font-semibold">Jurnal Wave</strong> — Meja Redaksi &amp;
          Pusat Kendali Jurnal Wave &amp; Halo Jurnal.
        </footer>
      </div>
    </div>
  )
}
