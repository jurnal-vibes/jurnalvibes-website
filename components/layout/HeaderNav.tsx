'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Menu,
  Home,
  Newspaper,
  Briefcase,
  Bookmark,
  Film,
  Sparkles,
  Compass,
  ExternalLink,
  X,
} from 'lucide-react';
import { SearchOverlay } from './SearchOverlay';
import { Logo } from '../ui/Logo';
import { WeatherWidget } from '../widgets/WeatherWidget';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';

export const HeaderNav: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
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
              <div className="flex items-center gap-5 lg:gap-7 text-sm font-semibold text-on-surface">
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
                      Sains &amp; Lingkungan
                    </Link>
                    <Link
                      href="/health"
                      className="block px-3.5 py-2 rounded-lg text-xs font-semibold text-on-surface hover:text-primary hover:bg-surface-variant/80 transition-all"
                    >
                      Kesehatan
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* Header Actions (Top Right) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
              <WeatherWidget />

              <div className="h-5 w-px bg-outline-variant/60 hidden sm:block" />

              {/* Bookmark Button (Desktop Only) */}
              <Link
                href="/bookmark"
                className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-colors cursor-pointer ${
                  pathname === '/bookmark'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface hover:text-primary hover:bg-surface-variant/80'
                }`}
                title="Artikel Tersimpan"
                aria-label="Artikel Tersimpan"
              >
                <Bookmark className="w-4 h-4" />
              </Link>

              {/* Search Button (Desktop Only) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex rounded-full text-on-surface hover:text-primary hover:bg-surface-variant/80"
                title="Cari Berita"
                aria-label="Cari Berita"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Mobile Hamburger Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-on-surface hover:text-primary hover:bg-surface-variant/80 rounded-xl"
                aria-label="Buka Menu"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Quick Category Bar (Only visible on small screen when search is closed) */}
        {!isSearchOpen && (
          <div className="md:hidden flex overflow-x-auto no-scrollbar gap-4 px-4 text-xs font-semibold text-on-surface border-t border-outline-variant/30 bg-surface">
            {mobileQuickCategories.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={idx}
                  href={link.href}
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

      {/* Modern Mobile Menu Drawer (Full Screen) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="full" showCloseButton={false} className="w-full h-full p-0 bg-surface flex flex-col justify-between">
          <div className="flex flex-col h-full overflow-hidden">
            {/* Sheet Header */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface shrink-0">
              <Link
                href="/"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  handleLogoClick(e);
                }}
                className="flex items-center shrink-0 cursor-pointer"
              >
                <Logo variant="light" size="md" />
              </Link>
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <div className="flex items-center gap-2 sm:gap-3">
                <div onClick={() => setIsMobileMenuOpen(false)}>
                  <WeatherWidget />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-surface-variant/70 hover:bg-primary hover:text-white flex items-center justify-center text-on-surface transition-colors cursor-pointer active:scale-90 shrink-0"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sheet Body (Scrollable) */}
            <div className="p-5 pb-12 flex flex-col gap-5 flex-1 overflow-y-auto">
              {/* Search Bar Action */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setTimeout(() => setIsSearchOpen(true), 200);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-on-surface-variant/80 bg-surface-variant/50 hover:bg-surface-variant hover:text-primary border border-outline-variant/50 transition-all cursor-pointer w-full text-left shadow-2xs"
              >
                <Search className="w-5 h-5 shrink-0 text-primary" />
                <span className="text-sm">Cari berita, topik, info Sukabumi...</span>
              </button>

              {/* 1. Kanal Utama */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-extrabold uppercase text-primary tracking-widest px-1">
                  KANAL UTAMA
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      pathname === '/'
                        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/30'
                        : 'bg-surface-container-low hover:bg-surface-variant/70 text-on-surface hover:text-primary border border-outline-variant/40'
                    }`}
                  >
                    <Home className="w-4 h-4 shrink-0 text-primary" />
                    <span>Beranda</span>
                  </Link>

                  <Link
                    href="/loker"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      pathname.startsWith('/loker')
                        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/30'
                        : 'bg-surface-container-low hover:bg-surface-variant/70 text-on-surface hover:text-primary border border-outline-variant/40'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0 text-primary" />
                    <span>Loker</span>
                  </Link>

                  <Link
                    href="/reels"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      pathname === '/reels'
                        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/30'
                        : 'bg-surface-container-low hover:bg-surface-variant/70 text-on-surface hover:text-primary border border-outline-variant/40'
                    }`}
                  >
                    <Film className="w-4 h-4 shrink-0 text-primary" />
                    <span>Wave Reels</span>
                  </Link>

                  <Link
                    href="/bookmark"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      pathname === '/bookmark'
                        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/30'
                        : 'bg-surface-container-low hover:bg-surface-variant/70 text-on-surface hover:text-primary border border-outline-variant/40'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 shrink-0 text-primary" />
                    <span>Tersimpan</span>
                  </Link>
                </div>
              </div>

              {/* 2. Berita & Sub-Kategori */}
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/60">
                <span className="text-[11px] font-extrabold uppercase text-primary tracking-widest px-1 flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>RUBRIK BERITA</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Link
                    href="/berita"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs border transition-all ${
                      pathname === '/berita'
                        ? 'bg-primary/10 text-primary border-primary/40 font-bold'
                        : 'bg-surface-container-low/70 border-outline-variant/40 text-on-surface hover:text-primary'
                    }`}
                  >
                    Semua Berita
                  </Link>
                  <Link
                    href="/berita?sub=kampus"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Kampus
                  </Link>
                  <Link
                    href="/berita?sub=sekolah"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Sekolah
                  </Link>
                </div>
              </div>

              {/* 3. Lifestyle & Sub-Kategori */}
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/60">
                <span className="text-[11px] font-extrabold uppercase text-primary tracking-widest px-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>LIFESTYLE</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/lifestyle"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`col-span-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs border transition-all ${
                      pathname === '/lifestyle'
                        ? 'bg-primary/10 text-primary border-primary/40 font-bold'
                        : 'bg-surface-container-low/70 border-outline-variant/40 text-on-surface hover:text-primary'
                    }`}
                  >
                    Semua Lifestyle
                  </Link>
                  <Link
                    href="/lifestyle?sub=style"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Style
                  </Link>
                  <Link
                    href="/lifestyle?sub=culinary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Culinary
                  </Link>
                  <Link
                    href="/lifestyle?sub=traveling"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="col-span-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Traveling
                  </Link>
                </div>
              </div>

              {/* 4. Eksplor (Otomotif, Sport, Tech, Science, Health) */}
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/60">
                <span className="text-[11px] font-extrabold uppercase text-primary tracking-widest px-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>EKSPLOR</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/otomotif"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Otomotif
                  </Link>
                  <Link
                    href="/sport"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Sport &amp; E-Sport
                  </Link>
                  <Link
                    href="/tech"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Teknologi
                  </Link>
                  <Link
                    href="/science"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Sains &amp; Lingkungan
                  </Link>
                  <Link
                    href="/health"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="col-span-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/40 bg-surface-container-low/70 text-on-surface hover:text-primary transition-all text-center"
                  >
                    Kesehatan
                  </Link>
                </div>
              </div>

              {/* 5. Hallo Jurnal Card */}
              <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-surface to-surface border border-outline-variant/70 text-on-surface flex items-center justify-between gap-2.5 group hover:border-primary/40 transition-all shadow-2xs mt-1">
                <div className="w-11 sm:w-12 h-14 sm:h-16 shrink-0 flex items-center justify-center pointer-events-none">
                  {/* eslint-disable-next-img-element */}
                  <img
                    src="/hallo-jurnal-presenter.webp"
                    alt="Hallo Jurnal Presenter"
                    className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300 select-none"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-sm text-on-surface">Hallo Jurnal</span>
                  <span className="block text-xs text-secondary leading-snug line-clamp-2 mt-0.5">
                    Wadah laporan &amp; aspirasi warga Sukabumi
                  </span>
                </div>

                <Link
                  href="/halo-jurnal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-full bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Lapor</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/90" />
                </Link>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
