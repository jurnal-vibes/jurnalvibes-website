import React from 'react';
import Link from 'next/link';
import { Home, Compass, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-16 md:py-24 flex flex-col items-center justify-center text-center">
      {/* 404 Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold tracking-wider uppercase mb-6">
        <span>Error 404</span>
      </div>

      {/* Main 404 Heading */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-headline-xl text-on-surface dark:text-white tracking-tight mb-4">
        Halaman Tidak Ditemukan
      </h1>

      {/* Subtext */}
      <p className="max-w-lg text-sm sm:text-base text-on-surface-variant/80 dark:text-neutral-400 mb-8 leading-relaxed">
        Waduh! Konten atau halaman yang Kamu cari mungkin telah dipindahkan, dihapus, atau tautan yang dimasukkan salah.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link
          href="/berita"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-variant/60 hover:bg-surface-variant text-on-surface dark:text-white font-semibold text-sm transition-all border border-black/5 dark:border-white/10 cursor-pointer active:scale-95"
        >
          <Compass className="w-4 h-4 text-primary" />
          <span>Jelajahi Berita</span>
        </Link>
      </div>

      {/* Quick Category Suggestions */}
      <div className="flex flex-col items-center gap-3 pt-6 border-t border-black/5 dark:border-white/5 w-full max-w-md">
        <span className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-wider">
          Kategori Populer
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { label: 'Teknologi', href: '/tech' },
            { label: 'Olahraga', href: '/sport' },
            { label: 'Otomotif', href: '/otomotif' },
            { label: 'Kesehatan', href: '/health' },
            { label: 'Lowongan Kerja', href: '/loker' },
          ].map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-primary/10 hover:text-primary text-on-surface-variant font-medium transition-colors border border-black/5 dark:border-white/5"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
