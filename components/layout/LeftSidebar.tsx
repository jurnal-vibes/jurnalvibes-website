'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Bookmark, Film, ExternalLink } from 'lucide-react';
import { EditorsPickWidget } from '../widgets/EditorsPickWidget';
import { Article } from '@/types';

interface LeftSidebarProps {
  articles: Article[];
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ articles }) => {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isLoker = pathname.startsWith('/loker');
  const isBookmark = pathname === '/bookmark';
  const isReels = pathname === '/reels';

  const navItems = [
    { href: '/', label: 'For You', icon: Home, isActive: isHome },
    { href: '/loker', label: 'Loker', icon: Briefcase, isActive: isLoker },
    { href: '/reels', label: 'Vibes Reels', icon: Film, isActive: isReels },
    { href: '/bookmark', label: 'Tersimpan', icon: Bookmark, isActive: isBookmark },
  ];

  return (
    <aside className="hidden md:flex flex-col w-1/4 sticky top-28 self-start overflow-y-auto pr-4 gap-6 h-[calc(100vh-7.25rem)] no-scrollbar shrink-0 justify-between pb-0">
      <div className="flex flex-col gap-6">
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  item.isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'text-on-surface-variant hover:bg-surface-variant/70 hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <EditorsPickWidget articles={articles} />
      </div>

      {/* Hallo Jurnal Section: Tanpa Card & Tanpa Pembatas (Seamless & Bersih) */}
      <div className="mt-auto pt-4 shrink-0 mb-1">
        <div className="w-full flex items-center gap-2.5 py-1 group">
          {/* Karakter 3D Presenter berdiri di sisi kiri tanpa card */}
          <div className="w-20 h-32 shrink-0 -translate-y-3.5 flex items-end justify-center pointer-events-none">
            {/* eslint-disable-next-img-element */}
            <img
              src="/hallo-jurnal-presenter.webp"
              alt="Hallo Jurnal Presenter"
              className="w-full h-full object-contain object-bottom drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Konten teks & tombol langsung menyatu dengan sidebar */}
          <div className="flex-1 flex flex-col items-start min-w-0">
            <Link
              href="/halo-jurnal"
              className="text-xs font-extrabold text-on-surface hover:text-primary transition-colors tracking-wide"
            >
              Hallo Jurnal
            </Link>
            <span className="text-[11px] text-secondary mt-0.5 leading-snug">Wadah laporan &amp; komunikasi online warga Sukabumi</span>

            <Link
              href="/halo-jurnal"
              className="mt-2.5 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary-dark text-white font-extrabold text-xs transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
            >
              <span>Kirim Laporan</span>
              <ExternalLink className="w-3 h-3 text-white/90 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};
