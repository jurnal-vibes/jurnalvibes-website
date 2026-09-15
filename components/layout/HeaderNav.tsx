'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, Menu, X, Home, Bookmark, Film, MessageCircle, ExternalLink } from 'lucide-react';
import { SearchOverlay } from './SearchOverlay';
import { Logo } from '../ui/Logo';
import { WeatherWidget } from '../widgets/WeatherWidget';

export const HeaderNav: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '/berita', label: 'Berita' },
    { href: '/lifestyle', label: 'Lifestyle' },
    { href: '/loker', label: 'Loker' },
    { href: '/sport', label: 'Sport' }
  ];

  const dropdownLinks = [
    { href: '/otomotif', label: 'Otomotif' },
    { href: '/science', label: 'Science' },
    { href: '/health', label: 'Health' },
    { href: '/tech', label: 'Tech' }
  ];

  const mobileDrawerContent = (
    <div className="fixed inset-0 z-[9999] md:hidden flex overflow-hidden">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 z-0"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Solid Slide-over Content Drawer */}
      <div className="relative w-4/5 max-w-[320px] bg-surface text-on-surface h-full min-h-screen shadow-2xl flex flex-col z-10 overflow-y-auto border-r border-outline-variant/60 animate-in slide-in-from-left duration-300 opacity-100">
        {/* 1. Header Logo + Close Button */}
        <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface shrink-0 sticky top-0 z-20">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <Logo variant="light" size="sm" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full text-on-surface-variant hover:text-[#e74c3c] hover:bg-surface-variant transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 2. Drawer Body (Main Navigation & Categories) */}
        <div className="p-4 flex flex-col gap-6 flex-1 bg-surface">
          {/* Search Button for Mobile */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setTimeout(() => setIsSearchOpen(true), 150);
            }}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm text-on-surface bg-surface-variant/50 hover:bg-surface-variant hover:text-[#e74c3c] transition-all cursor-pointer w-full text-left"
          >
            <Search className="w-5 h-5 shrink-0 text-on-surface-variant" />
            <span>Cari Berita...</span>
          </button>

          {/* Main Navigation */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold uppercase text-[#e74c3c] tracking-widest px-3 mb-1">
              NAVIGASI UTAMA
            </span>

            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                pathname === '/'
                  ? 'bg-red-50 text-[#e74c3c] shadow-xs'
                  : 'text-on-surface hover:bg-surface-variant hover:text-[#e74c3c]'
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span>For You</span>
            </Link>

            <Link
              href="/bookmark"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                pathname === '/bookmark'
                  ? 'bg-red-50 text-[#e74c3c] shadow-xs'
                  : 'text-on-surface hover:bg-surface-variant hover:text-[#e74c3c]'
              }`}
            >
              <Bookmark className="w-5 h-5 shrink-0" />
              <span>Tersimpan</span>
            </Link>

            <Link
              href="/reels"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                pathname === '/reels'
                  ? 'bg-red-50 text-[#e74c3c] shadow-xs'
                  : 'text-on-surface hover:bg-surface-variant hover:text-[#e74c3c]'
              }`}
            >
              <Film className="w-5 h-5 shrink-0" />
              <span>Vibes Reels</span>
            </Link>

            <a
              href="https://halo-jurnal-app.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm text-on-surface hover:bg-surface-variant hover:text-[#e74c3c] transition-all group cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-[#e74c3c] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="flex-1 font-bold">Hallo Jurnal</span>
              <ExternalLink className="w-4 h-4 opacity-50 shrink-0" />
            </a>
          </div>

          {/* Categories Section */}
          <div className="pt-4 border-t border-outline-variant/60 flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold uppercase text-on-surface-variant tracking-widest px-3 mb-1">
              KATEGORI BERITA
            </span>
            {[...navLinks, ...dropdownLinks].map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    isActive
                      ? 'text-[#e74c3c] font-bold bg-red-50'
                      : 'text-on-surface-variant hover:text-[#e74c3c] hover:bg-surface-variant'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. Drawer Footer */}
        <div className="p-4 border-t border-outline-variant/60 bg-surface-container-lowest shrink-0 text-center">
          <span className="text-[11px] text-on-surface-variant opacity-90">
            © Jurnal Vibes • Portal Berita Sukabumi
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant transition-colors duration-300">
        <div className="flex justify-between items-center px-4 pr-4 md:px-margin-desktop h-16 md:h-20 max-w-container-max mx-auto w-full relative z-10 gap-2 md:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
                    className={`hover:text-[#e74c3c] transition-colors ${
                      isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-[#e74c3c] transition-colors cursor-pointer">
                  Eksplor
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-outline-variant rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
                  {dropdownLinks.map((drop, idx) => (
                    <Link
                      key={idx}
                      href={drop.href}
                      className="block px-4 py-2 hover:bg-surface-variant hover:text-[#e74c3c] transition-colors"
                    >
                      {drop.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Header Actions (Top Right) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 justify-end">
            <WeatherWidget />
            <div className="h-5 w-px bg-outline-variant/60 hidden sm:block" />
            
            {/* Search Button (Hidden on Mobile, now in Drawer) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex text-on-surface hover:text-[#e74c3c] transition-colors p-1.5 sm:p-2 rounded-full hover:bg-surface-variant items-center justify-center cursor-pointer shrink-0"
              title="Cari Berita"
              aria-label="Cari Berita"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Mobile Hamburger Menu (Moved to right) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-on-surface hover:text-[#e74c3c] p-2 rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
              aria-label="Buka Menu Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Quick Category Bar */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar gap-3 px-4 py-2 text-xs font-semibold text-on-surface border-t border-outline-variant/30 bg-surface-container-lowest/80">
          {navLinks.map((link, idx) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={idx}
                href={link.href}
                className={`shrink-0 px-2.5 py-1 rounded-full transition-colors ${
                  isActive ? 'bg-primary text-on-primary font-bold' : 'hover:text-[#e74c3c]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {dropdownLinks.map((drop, idx) => (
            <Link
              key={idx}
              href={drop.href}
              className={`shrink-0 px-2.5 py-1 rounded-full transition-colors ${
                pathname === drop.href ? 'bg-primary text-on-primary font-bold' : 'hover:text-[#e74c3c]'
              }`}
            >
              {drop.label}
            </Link>
          ))}
        </div>

        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </header>

      {/* Render Mobile Drawer at document.body level via React Portal */}
      {isMobileMenuOpen && mounted && createPortal(mobileDrawerContent, document.body)}
    </>
  );
};

