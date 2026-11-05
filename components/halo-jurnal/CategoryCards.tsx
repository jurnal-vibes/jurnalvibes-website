'use client'

import Link from 'next/link'

interface CategoryCardsProps {
  isLoggedIn?: boolean
}

export default function CategoryCards({ isLoggedIn: _isLoggedIn }: CategoryCardsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 select-none">
      {/* Tombol 1: Buat Pengaduan (Solid Putih sesuai foto referensi) */}
      <Link
        href="/halo-jurnal/lapor"
        className="px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-heading font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 inline-flex items-center justify-center cursor-pointer"
      >
        Buat Pengaduan
      </Link>

      {/* Tombol 2: Lihat Daftar Aduan (Transparan Kaca / Glassmorphism sesuai foto referensi) */}
      <Link
        href="/halo-jurnal/feed-publik"
        className="px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-heading font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 inline-flex items-center justify-center cursor-pointer"
      >
        Lihat Daftar Aduan
      </Link>
    </div>
  )
}
