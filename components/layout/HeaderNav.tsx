'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Menu,
  Home,
  Briefcase,
  Bookmark,
  Film,
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

  const navLinks = [
    { href: '/berita', label: 'Berita' },
    { href: '/lifestyle', label: 'Lifestyle' },
    { href: '/otomotif', label: 'Otomotif' },
    { href: '/sport', label: 'Sport' },
  ];

  const dropdownLinks = [
    { href: '/tech', label: 'Tech' },
    { href: '/science', label: 'Science' },
    { href: '/health', label: 'Health' },
  ];

  // Khusus kategori berita murni (tanpa Loker karena Loker sudah ada di Navigasi Utama)
  const newsCategories = [
    { href: '/berita', label: 'Berita' },
    { href: '/lifestyle', label: 'Lifestyle' },
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
          <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 h-16 md:h-20 max-w-container-max mx-auto w-full relative z-10 gap-2 md:gap-4">
            {/* Brand Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center shrink-0">
                <Logo variant="light" size="md" />
              </Link>
            </div>

            {/* Navigation Links (Desktop Only) */}
            <nav className="hidden md:flex flex-1 items-center justify-center min-w-0">
              <div className="flex items-center gap-6 text-sm font-medium text-on-surface">
                {navLinks.map((link, idx) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={idx}
                      href={link.href}
                      className={`hover:text-primary transition-colors py-1 ${
                        isActive
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-on-surface'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer py-1 font-semibold text-on-surface">
                    Eksplor
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 duration-200" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-outline-variant/80 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                    {dropdownLinks.map((drop, idx) => (
                      <Link
                        key={idx}
                        href={drop.href}
                        className="block px-4 py-2 hover:bg-surface-variant/70 hover:text-primary transition-colors text-sm font-medium"
                      >
                        {drop.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* Header Actions (Top Right) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
              <WeatherWidget />
              <div className="h-5 w-px bg-outline-variant/60 hidden sm:block" />

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
                aria-label="Buka Menu Sidebar"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Quick Category Bar (Only visible when search is closed) */}
        {!isSearchOpen && (
          <div className="md:hidden flex overflow-x-auto no-scrollbar gap-5 px-4 text-xs font-semibold text-on-surface border-t border-outline-variant/30 bg-surface">
            {newsCategories.map((link, idx) => {
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

      {/* Modern Radix Mobile Menu (Full Screen) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="full" showCloseButton={false} className="w-full h-full p-0 bg-surface flex flex-col justify-between">
          <div className="flex flex-col h-full overflow-hidden">
            {/* Sheet Header (Full Width Top Bar) */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface shrink-0">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
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
            <div className="p-5 pb-12 flex flex-col gap-6 flex-1 overflow-y-auto">
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
                <span className="text-sm">Cari berita, informasi Sukabumi, loker...</span>
              </button>

              {/* Main Nav */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-extrabold uppercase text-primary tracking-widest px-1">
                  NAVIGASI UTAMA
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      pathname === '/'
                        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/30'
                        : 'bg-surface-container-low hover:bg-surface-variant/70 text-on-surface hover:text-primary border border-outline-variant/40'
                    }`}
                  >
                    <Home className="w-5 h-5 shrink-0 text-primary" />
                    <span>For You</span>
                  </Link>

                  <Link
                    href="/loker"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      pathname.startsWith('/loker')
                        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/30'
                        : 'bg-surface-container-low hover:bg-surface-variant/70 text-on-surface hover:text-primary border border-outline-variant/40'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 shrink-0 text-primary" />
                    <span>Loker</span>
                  </Link>

                  <Link
                    href="/reels"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      pathname === '/reels'
                        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/30'
                        : 'bg-surface-container-low hover:bg-surface-variant/70 text-on-surface hover:text-primary border border-outline-variant/40'
                    }`}
                  >
                    <Film className="w-5 h-5 shrink-0 text-primary" />
                    <span>Vibes Reels</span>
                  </Link>

                  <Link
                    href="/bookmark"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      pathname === '/bookmark'
                        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/30'
                        : 'bg-surface-container-low hover:bg-surface-variant/70 text-on-surface hover:text-primary border border-outline-variant/40'
                    }`}
                  >
                    <Bookmark className="w-5 h-5 shrink-0 text-primary" />
                    <span>Tersimpan</span>
                  </Link>
                </div>
              </div>

              {/* Hallo Jurnal Card (Seamless 3D Presenter) */}
              <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-surface to-surface border border-outline-variant/70 text-on-surface flex items-center justify-between gap-2.5 group hover:border-primary/40 transition-all shadow-2xs">
                {/* 3D Presenter Character standing seamlessly (Compact) */}
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

              {/* Kategori Berita (Grid 2 Kolom, Berita Full Width) */}
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/60">
                <span className="text-[11px] font-extrabold uppercase text-primary tracking-widest px-1">
                  KATEGORI BERITA
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {newsCategories.map((item, idx) => {
                    const isActive = pathname === item.href;
                    const isFeatured = item.href === '/berita';
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-center text-center px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                          isFeatured ? 'col-span-2' : ''
                        } ${
                          isActive
                            ? 'text-primary font-bold bg-primary/10 border-primary/50 shadow-2xs'
                            : 'bg-surface-container-low/70 border-outline-variant/40 text-on-surface hover:text-primary hover:bg-surface-variant/60'
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
