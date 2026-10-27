'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Megaphone, Compass, PlusCircle, ListChecks, Newspaper, User } from 'lucide-react'

export default function HaloJurnalBottomNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = () => {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('halo_jurnal_current_user')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (
              parsed &&
              (parsed.id === 'warga-demo' ||
                parsed.id === 'demo-user-id' ||
                parsed.id === 'warga-demo-sukabumi' ||
                parsed.email === 'warga@sukabumi.com' ||
                (typeof parsed.id === 'string' && parsed.id.startsWith('warga-17')))
            ) {
              setUser(null)
            } else {
              setUser(parsed)
            }
          } else {
            setUser(null)
          }
        }
      } catch {
        setUser(null)
      }
    }

    checkUser()
    window.addEventListener('storage', checkUser)
    window.addEventListener('focus', checkUser)
    return () => {
      window.removeEventListener('storage', checkUser)
      window.removeEventListener('focus', checkUser)
    }
  }, [])

  const isBeranda = pathname === '/halo-jurnal' || pathname === '/halo-jurnal/beranda'
  const isFeed = pathname === '/halo-jurnal/feed-publik' || pathname.startsWith('/halo-jurnal/feed-publik/')
  const isLapor = pathname === '/halo-jurnal/lapor' || pathname.startsWith('/halo-jurnal/lapor/')
  const isLaporanSaya = pathname === '/halo-jurnal/laporan-saya' || pathname.startsWith('/halo-jurnal/laporan-saya/')
  const isProfil = pathname === '/halo-jurnal/profil' || pathname.startsWith('/halo-jurnal/profil/')

  const berandaHref = user ? '/halo-jurnal/beranda' : '/halo-jurnal'

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-2 transition-colors">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* 1. Beranda */}
        <Link
          href={berandaHref}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            isBeranda
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/75 hover:text-on-surface font-medium'
          }`}
        >
          <Megaphone className={`w-5 h-5 ${isBeranda ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Beranda</span>
        </Link>

        {/* 2. Feed Publik */}
        <Link
          href="/halo-jurnal/feed-publik"
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            isFeed
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/75 hover:text-on-surface font-medium'
          }`}
        >
          <Compass className={`w-5 h-5 ${isFeed ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Feed</span>
        </Link>

        {/* 3. Buat Laporan (Sejajar & Rata) */}
        <Link
          href="/halo-jurnal/lapor"
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            isLapor
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/75 hover:text-on-surface font-medium'
          }`}
          title="Buat Laporan Baru"
        >
          <PlusCircle className={`w-5 h-5 ${isLapor ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Lapor</span>
        </Link>

        {/* 4. Laporan Saya */}
        <Link
          href="/halo-jurnal/laporan-saya"
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            isLaporanSaya
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/75 hover:text-on-surface font-medium'
          }`}
        >
          <ListChecks className={`w-5 h-5 ${isLaporanSaya ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Aduan Saya</span>
        </Link>

        {/* 5. Profil / Portal */}
        <Link
          href="/halo-jurnal/profil"
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            isProfil
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/75 hover:text-on-surface font-medium'
          }`}
        >
          <User className={`w-5 h-5 ${isProfil ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Profil</span>
        </Link>
      </div>
    </nav>
  )
}
