'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Bookmark,
  X,
} from 'lucide-react';
import { SearchOverlay } from './SearchOverlay';
import { Logo } from '../ui/Logo';
import { WeatherWidget } from '../widgets/WeatherWidget';
import { Button } from '../ui/button';

export const HeaderNav: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const isBeritaActive = pathname === '/berita';
  const isLifestyleActive = pathname === '/lifestyle';
  const isLokerActive = pathname.startsWith('/loker');
  const isReelsActive = pathname === '/reels';
  const isEksplorActive = ['/otomotif', '/sport', '/tech', '/science', '/health'].includes(pathname);

  // Kategori ringkas untuk quick-bar mobile di bawah header
  const mobileQuickCategories = [
    { href: '/', label: 'Beranda' },
    { href: '/berita', label: 'Berita' },
    { href: '/lifestyle', label: 'Lifestyle' },
    { href: '/loker', label: 'Loker' },
    { href: '/reels', label: 'Wave Reels' },
    { href: '/otomotif', label: 'Otomotif' },
    { href: '/sport', label: 'Sport' },
    { href: '/tech', label: 'Tech' },
    { href: '/science', label: 'Science' },
    { href: '/health', label: 'Health' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/60 transition-colors duration-300">
        {isSearchOpen ? (
          /* In-Navbar Search Bar Mode */
          <div className="flex items-center gap-3 px-3 sm:px-4 md:px-6 h-16 md:h-20 max-w-container-max mx-auto w-full relative z-10 animate-in fade-in duration-200">
            <Search className="w-5 h-5 text-primary shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari berita, topik, atau kata kunci..."
              className="flex-1 bg-transparent text-sm sm:text-base md:text-lg font-semibold text-on-surface dark:text-white placeholder:text-on-surface-variant/40 outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="p-1.5 rounded-full text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-variant/80 transition-colors cursor-pointer shrink-0"
                title="Hapus teks"
                aria-label="Hapus teks pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-variant/60 hover:bg-surface-variant text-on-surface-variant hover:text-primary flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0"
              title="Tutup pencarian (ESC)"
              aria-label="Tutup pencarian"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ) : (
          /* Normal Navbar Row */
          <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 h-16 md:h-20 max-w-container-max mx-auto w-full relative z-10 gap-3 md:gap-5">
            {/* Brand Logo */}
            <div className="flex items-center shrink-0">
              <Link
                href="/"
                onClick={handleLogoClick}
                className="flex items-center shrink-0 cursor-pointer"
                aria-label="Kembali ke Beranda atau Gulir ke Atas"
              >
                <Logo variant="light" size="md" />
              </Link>
            </div>

            {/* Navigation Links (Desktop Only - 6 Menu Super Elegan & Ramping) */}
            <nav className="hidden md:flex flex-1 items-center justify-center min-w-0">
              <div className="flex items-center gap-3.5 lg:gap-6 text-xs lg:text-sm font-semibold text-on-surface">
                {/* 1. Beranda */}
                <Link
                  href="/"
                  className={`hover:text-primary transition-colors py-1 ${
                    pathname === '/' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface'
                  }`}
                >
                  Beranda
                </Link>

                {/* 2. Berita ▾ (Dropdown) */}
                <div className="relative group py-2">
                  <Link
                    href="/berita"
                    className={`flex items-center gap-1 hover:text-primary transition-colors cursor-pointer py-1 ${
                      isBeritaActive ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    <span>Berita</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-200" />
                  </Link>

                  <div className="absolute top-full left-0 mt-0.5 min-w-[180px] bg-surface/98 backdrop-blur-md border border-outline-variant/80 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1.5">
                    <Link
                      href="/berita"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Semua Berita
                    </Link>
                    <Link
                      href="/berita?sub=kampus"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Kampus
                    </Link>
                    <Link
                      href="/berita?sub=sekolah"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Sekolah
                    </Link>
                  </div>
                </div>

                {/* 3. Lifestyle ▾ (Dropdown) */}
                <div className="relative group py-2">
                  <Link
                    href="/lifestyle"
                    className={`flex items-center gap-1 hover:text-primary transition-colors cursor-pointer py-1 ${
                      isLifestyleActive ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    <span>Lifestyle</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-200" />
                  </Link>

                  <div className="absolute top-full left-0 mt-0.5 min-w-[180px] bg-surface/98 backdrop-blur-md border border-outline-variant/80 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1.5">
                    <Link
                      href="/lifestyle"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Semua Lifestyle
                    </Link>
                    <Link
                      href="/lifestyle?sub=style"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Style
                    </Link>
                    <Link
                      href="/lifestyle?sub=culinary"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Culinary
                    </Link>
                    <Link
                      href="/lifestyle?sub=traveling"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Traveling
                    </Link>
                  </div>
                </div>

                {/* 4. Loker */}
                <Link
                  href="/loker"
                  className={`hover:text-primary transition-colors py-1 ${
                    isLokerActive ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface'
                  }`}
                >
                  Loker
                </Link>

                {/* 5. Wave Reels */}
                <Link
                  href="/reels"
                  className={`hover:text-primary transition-colors py-1 ${
                    isReelsActive ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface'
                  }`}
                >
                  Wave Reels
                </Link>

                {/* 6. Eksplor ▾ (Dropdown Kategori Tematik) */}
                <div className="relative group py-2">
                  <button
                    type="button"
                    className={`flex items-center gap-1 hover:text-primary transition-colors cursor-pointer py-1 ${
                      isEksplorActive ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    <span>Eksplor</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-200" />
                  </button>

                  <div className="absolute top-full left-0 mt-0.5 min-w-[190px] bg-surface/98 backdrop-blur-md border border-outline-variant/80 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1.5">
                    <Link
                      href="/otomotif"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Otomotif
                    </Link>
                    <Link
                      href="/sport"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Sport &amp; E-Sport
                    </Link>
                    <Link
                      href="/tech"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Teknologi
                    </Link>
                    <Link
                      href="/science"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Science
                    </Link>
                    <Link
                      href="/health"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Health
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* Header Actions (Top Right) */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 justify-end">
              <WeatherWidget />

              <div className="h-5 w-px bg-outline-variant/60 hidden sm:block" />

              {/* Bookmark Button (Langsung aktif di Web & HP) */}
              <Link
                href="/bookmark"
                className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-colors cursor-pointer active:scale-90 ${
                  pathname === '/bookmark'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface hover:text-primary hover:bg-surface-variant/80'
                }`}
                title="Artikel Tersimpan"
                aria-label="Artikel Tersimpan"
              >
                <Bookmark className="w-4 h-4" />
              </Link>

              {/* Search Button (Langsung aktif di Web & HP) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-on-surface hover:text-primary hover:bg-surface-variant/80 active:scale-90"
                title="Cari Berita"
                aria-label="Cari Berita"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Quick Category Bar (Only visible on small screen when search is closed) */}
        {!isSearchOpen && (
          <div className="md:hidden flex overflow-x-auto no-scrollbar gap-4 px-4 text-xs font-semibold text-on-surface border-t border-outline-variant/30 bg-surface">
            {mobileQuickCategories.map((link, idx) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href === '/' && pathname === '/') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`shrink-0 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-on-surface hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </header>
    </>
  );
};
