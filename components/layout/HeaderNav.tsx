'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
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

  // Kategori menu (Baris Bawah Navbar)
  const navCategories = [
    { href: '/', label: 'Beranda' },
    { href: '/artikel', label: 'Semua Artikel' },
    { href: '/berita', label: 'Berita' },
    { href: '/kuliner', label: 'Kuliner' },
    { href: '/wisata', label: 'Wisata' },
    { href: '/hiburan', label: 'Hiburan' },
    { href: '/tech', label: 'Tech & Game' },
    { href: '/sport', label: 'Sport' },
    { href: '/inspirasi', label: 'Inspirasi' },
    { href: '/loker', label: 'Loker' },
    { href: '/reels', label: 'Wave Reels' },
    { href: '/halo-jurnal', label: 'Hallo Jurnal' },
  ];

  // Media sosial samping logo (Duplikat persis dari Footer, ukuran ramping untuk header)
  const headerSocialLinks = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/jurnalwave/',
      hoverColor: 'hover:bg-primary hover:text-white hover:border-primary',
      icon: (
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@jurnal.wave',
      hoverColor: 'hover:bg-primary hover:text-white hover:border-primary',
      icon: (
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.36 1.52-1.36 2.53-.02 1.07.47 2.12 1.31 2.78.85.67 2.02.9 3.06.6 1.16-.31 2.11-1.25 2.45-2.39.12-.48.15-.99.14-1.49.01-4.87.01-9.74.01-14.61z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      hoverColor: 'hover:bg-red-600 hover:text-white hover:border-red-600',
      icon: (
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: 'Saluran WhatsApp Resmi',
      href: 'https://whatsapp.com/channel',
      hoverColor: 'hover:bg-primary hover:text-white hover:border-primary',
      icon: (
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300">
        {isSearchOpen ? (
          /* In-Navbar Search Bar Mode */
          <div className="flex items-center gap-3 px-3 sm:px-4 md:px-6 h-12 sm:h-14 max-w-container-max mx-auto w-full relative z-10 animate-in fade-in duration-200">
            <Search className="w-5 h-5 text-primary shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari artikel, topik, atau kata kunci..."
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
          /* BARIS 1: Header Utama (Logo & Action Tools) */
          <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 h-12 sm:h-14 max-w-container-max mx-auto w-full relative z-10 gap-3 md:gap-5">
            {/* Brand Logo & Media Sosial */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <Link
                href="/"
                onClick={handleLogoClick}
                className="flex items-center shrink-0 cursor-pointer"
                aria-label="Kembali ke Beranda atau Gulir ke Atas"
              >
                <Logo variant="light" size="sm" />
              </Link>

              {/* Pemisah Vertikal & Ikon Media Sosial (Duplikat dari Footer) */}
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 pl-1">
                <div className="h-4 w-px bg-outline-variant/60 mr-0.5" />
                {headerSocialLinks.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-6 h-6 rounded-full bg-surface-variant/70 border border-outline-variant/60 flex items-center justify-center text-on-surface-variant ${item.hoverColor} transition-all duration-200 shadow-2xs cursor-pointer active:scale-95`}
                    title={item.name}
                    aria-label={item.name}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Header Actions (Top Right - Opsi B) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 justify-end">
              <WeatherWidget />

              <div className="h-5 w-px bg-outline-variant/60 hidden sm:block" />

              {/* Bookmark Button */}
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

              {/* Search Button (Opsi B: Ikon buka pencarian) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-on-surface hover:text-primary hover:bg-surface-variant/80 active:scale-90"
                title="Cari Artikel"
                aria-label="Cari Artikel"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* BARIS 2: Sub-Navbar Menu Kategori (Di Bawah Header Utama, Desktop & Mobile) */}
        {!isSearchOpen && (
          <div>
            <div className="max-w-container-max mx-auto px-3 sm:px-4 md:px-6">
              <div className="border-t border-black/[0.03] dark:border-white/[0.03]" />
              <nav
                aria-label="Navigasi Kategori"
                className="flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar gap-4 sm:gap-6 lg:gap-7 text-[11px] sm:text-xs font-semibold text-on-surface whitespace-nowrap"
              >
                {navCategories.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : item.href === '/artikel'
                      ? pathname === '/artikel'
                      : item.href === '/berita'
                      ? pathname === '/berita' || pathname.startsWith('/berita/')
                      : pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href + '/')) ||
                        (item.href === '/halo-jurnal' && pathname.startsWith('/halo-jurnal'));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        if (item.href === '/' && pathname === '/') {
                          e.preventDefault();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={`shrink-0 py-2 border-b-[1.5px] transition-all cursor-pointer ${
                        isActive
                          ? 'border-primary text-primary font-bold'
                          : 'border-transparent text-on-surface hover:text-primary hover:border-primary/40'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
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
