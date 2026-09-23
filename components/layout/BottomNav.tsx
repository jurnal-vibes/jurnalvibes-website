'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Megaphone, Film, Bookmark } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-2 transition-colors duration-300">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* 1. For You */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            pathname === '/'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/75 hover:text-on-surface font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">For You</span>
        </Link>

        {/* 2. Loker */}
        <Link
          href="/loker"
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            pathname.startsWith('/loker')
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/75 hover:text-on-surface font-medium'
          }`}
        >
          <Briefcase className={`w-5 h-5 ${pathname.startsWith('/loker') ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Loker</span>
        </Link>

        {/* 3. Hallo Jurnal (Tombol Tengah Menonjol) */}
        <Link
          href="/halo-jurnal"
          className="flex flex-col items-center justify-center -mt-5 group transition-transform active:scale-95"
          title="Salurkan Laporan & Aduan Warga Sukabumi di Hallo Jurnal"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-[#ff3b53] text-white flex items-center justify-center shadow-[0_6px_18px_-2px_rgba(192,0,21,0.5)] group-hover:scale-105 transition-all">
            <Megaphone className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] font-extrabold text-primary tracking-tight mt-1">
            Hallo Jurnal
          </span>
        </Link>

        {/* 4. Vibes Reels */}
        <Link
          href="/reels"
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            pathname === '/reels'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/75 hover:text-on-surface font-medium'
          }`}
        >
          <Film className={`w-5 h-5 ${pathname === '/reels' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Reels</span>
        </Link>

        {/* 5. Tersimpan */}
        <Link
          href="/bookmark"
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            pathname === '/bookmark'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant/75 hover:text-on-surface font-medium'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${pathname === '/bookmark' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Tersimpan</span>
        </Link>
      </div>
    </nav>
  );
};
