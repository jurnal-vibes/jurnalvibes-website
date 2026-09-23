'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export const HalloJurnalBanner: React.FC = () => {
  return (
    <section className="relative w-full rounded-3xl bg-surface text-on-surface my-2 shadow-xs border border-outline-variant/70 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -left-10 -top-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute right-10 bottom-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 py-8 md:px-12 md:py-8 gap-8 md:gap-12">
        {/* Left Side: 3D Presenter Character standing and gesturing */}
        <div className="relative w-48 sm:w-56 md:w-64 h-60 sm:h-72 md:h-80 shrink-0 flex items-end justify-center">
          {/* eslint-disable-next-img-element */}
          <img
            src="/hallo-jurnal-presenter.webp"
            alt="Hallo Jurnal Presenter"
            className="w-full h-full object-contain object-bottom drop-shadow-xl hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
          />
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-on-surface mb-3">
            Salurkan Laporan &amp; Aspirasimu <br className="hidden sm:inline" />
            <span className="text-primary">
              di Hallo Jurnal
            </span>
          </h2>

          <p className="text-secondary text-sm leading-relaxed mb-5 max-w-lg">
            Wadah laporan dan komunikasi online untuk seluruh warga Sukabumi. Sampaikan aduan fasilitas publik, laporan peristiwa terkini, atau aspirasi Anda secara langsung, cepat, dan transparan.
          </p>

          <a
            href="https://halo-jurnal-app.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer group"
          >
            <span>Kirim Laporan Online</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
