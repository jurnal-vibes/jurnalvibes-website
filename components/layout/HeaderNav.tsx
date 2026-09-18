'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Menu,
  Home,
  Bookmark,
  Film,
  ExternalLink,
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

  const navLinks = [
    { href: '/berita', label: 'Berita' },
    { href: '/lifestyle', label: 'Lifestyle' },
    { href: '/loker', label: 'Loker' },
    { href: '/sport', label: 'Sport' },
  ];

  const dropdownLinks = [
    { href: '/otomotif', label: 'Otomotif' },
    { href: '/science', label: 'Science' },
    { href: '/health', label: 'Health' },
    { href: '/tech', label: 'Tech' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/60 transition-colors duration-300">
        <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 h-16 md:h-20 max-w-container-max mx-auto w-full relative z-10 gap-2 md:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0 -ml-1 md:-ml-2">
            <Link href="/" className="flex items-center shrink-0">
              <Logo variant="light" size="md" />
            </Link>
          </div>

          {/* Navigation Links (Desktop Only) */}
          <nav className="hidden md:flex flex-1 items-center justify-center min-w-0">
            <div className="flex items-center gap-6 text-sm font-semibold text-on-surface">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={idx}
                    href={link.href}
                    className={`hover:text-primary transition-colors py-1 ${
                      isActive
                        ? 'text-primary font-bold border-b-2 border-primary'
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

            {/* Desktop Search Button */}
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

        {/* Mobile Quick Category Bar */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar gap-2 px-4 py-2 text-xs font-semibold text-on-surface border-t border-outline-variant/30 bg-surface-container-lowest/80">
          {navLinks.map((link, idx) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={idx}
                href={link.href}
                className={`shrink-0 px-3 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-surface-variant/50 text-on-surface hover:bg-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {dropdownLinks.map((drop, idx) => {
            const isActive = pathname === drop.href;
            return (
              <Link
                key={idx}
                href={drop.href}
                className={`shrink-0 px-3 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-surface-variant/50 text-on-surface hover:bg-surface-variant hover:text-primary'
                }`}
              >
                {drop.label}
              </Link>
            );
          })}
        </div>

        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </header>

      {/* Modern Radix Mobile Drawer (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[340px] flex flex-col justify-between p-0">
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Sheet Header */}
            <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface shrink-0">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Logo variant="light" size="sm" />
              </Link>
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            </div>

            {/* Sheet Body */}
            <div className="p-4 flex flex-col gap-6 flex-1">
              {/* Search Action inside Drawer */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setTimeout(() => setIsSearchOpen(true), 200);
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-on-surface-variant/80 bg-surface-variant/50 hover:bg-surface-variant hover:text-primary border border-outline-variant/50 transition-all cursor-pointer w-full text-left"
              >
                <Search className="w-4 h-4 shrink-0 text-on-surface-variant" />
                <span>Cari Berita...</span>
              </button>

              {/* Main Nav */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-widest px-3 mb-1">
                  NAVIGASI UTAMA
                </span>

                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    pathname === '/'
                      ? 'bg-primary/10 text-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-variant/70 hover:text-primary'
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>For You</span>
                </Link>

                <Link
                  href="/bookmark"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    pathname === '/bookmark'
                      ? 'bg-primary/10 text-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-variant/70 hover:text-primary'
                  }`}
                >
                  <Bookmark className="w-4 h-4 shrink-0" />
                  <span>Tersimpan</span>
                </Link>

                <Link
                  href="/reels"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    pathname === '/reels'
                      ? 'bg-primary/10 text-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-variant/70 hover:text-primary'
                  }`}
                >
                  <Film className="w-4 h-4 shrink-0" />
                  <span>Vibes Reels</span>
                </Link>

                <div className="mt-1 p-3 rounded-2xl bg-surface border border-outline-variant/70 text-on-surface flex items-center gap-3 group hover:border-primary/40 transition-colors">
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-2xs border border-outline-variant/70 bg-surface-variant/40 flex items-center justify-center">
                    {/* eslint-disable-next-img-element */}
                    <img
                      src="/hallo-jurnal-presenter.webp"
                      alt="Hallo Jurnal Presenter"
                      className="w-full h-full object-contain object-top group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs text-on-surface">Hallo Jurnal</span>
                    <span className="block text-[11px] text-secondary truncate">Wadah laporan &amp; komunikasi online warga Sukabumi</span>
                  </div>
                  <a
                    href="https://halo-jurnal-app.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-full bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shrink-0 shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span>Lapor</span>
                    <ExternalLink className="w-3 h-3 text-white/90" />
                  </a>
                </div>
              </div>

              {/* Categories */}
              <div className="pt-4 border-t border-outline-variant/60 flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase text-on-surface-variant/80 tracking-widest px-3 mb-1">
                  KATEGORI BERITA
                </span>
                {[...navLinks, ...dropdownLinks].map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isActive
                          ? 'text-primary font-bold bg-primary/10'
                          : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/60'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer inside Drawer */}
            <div className="p-4 border-t border-outline-variant/60 bg-surface-container-lowest shrink-0 text-center">
              <span className="text-[11px] text-on-surface-variant/70">
                © Jurnal Vibes • Portal Berita Sukabumi
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
