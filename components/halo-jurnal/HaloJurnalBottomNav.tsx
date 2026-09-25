'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Megaphone, Compass, PlusCircle, ListChecks, Newspaper, User } from 'lucide-react'

export default function HaloJurnalBottomNav() {
  const pathname = usePathname()

  const isBeranda = pathname === '/halo-jurnal' || pathname === '/halo-jurnal/beranda'
  const isFeed = pathname === '/halo-jurnal/feed-publik' || pathname.startsWith('/halo-jurnal/feed-publik/')
  const isLapor = pathname === '/halo-jurnal/lapor' || pathname.startsWith('/halo-jurnal/lapor/')
  const isLaporanSaya = pathname === '/halo-jurnal/laporan-saya' || pathname.startsWith('/halo-jurnal/laporan-saya/')
  const isProfil = pathname === '/halo-jurnal/profil' || pathname.startsWith('/halo-jurnal/profil/')

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-2 transition-colors">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* 1. Beranda */}
        <Link
          href="/halo-jurnal"
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

        {/* 3. Tombol Tengah Menonjol: Buat Laporan */}
        <Link
          href="/halo-jurnal/lapor"
          className="flex flex-col items-center justify-center -mt-5 group transition-transform active:scale-95"
          title="Buat Laporan Baru"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-rose-500 text-white flex items-center justify-center shadow-[0_6px_18px_-2px_rgba(192,0,21,0.5)] group-hover:scale-105 transition-all">
            <PlusCircle className="w-6 h-6 stroke-[2.5px]" />
          </div>
          <span className="text-[10px] font-extrabold text-primary tracking-tight mt-1">
            Lapor
          </span>
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
