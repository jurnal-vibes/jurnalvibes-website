'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const HalloJurnalBanner: React.FC = () => {
  return (
    <section className="relative w-full rounded-3xl bg-surface text-on-surface my-2 shadow-xs border border-outline-variant/70 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -left-10 -top-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute right-10 bottom-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-row items-center justify-between p-4 sm:p-6 md:px-12 md:py-8 gap-3.5 sm:gap-6 md:gap-12">
        {/* Left Side: 3D Presenter Character standing seamlessly */}
        <div className="relative w-20 sm:w-36 md:w-64 h-28 sm:h-44 md:h-80 shrink-0 flex items-end justify-center pointer-events-none -mb-1">
          {/* eslint-disable-next-img-element */}
          <img
            src="/hallo-jurnal-presenter.webp"
            alt="Hallo Jurnal Presenter"
            className="w-full h-full object-contain object-bottom drop-shadow-md sm:drop-shadow-xl hover:scale-105 transition-transform duration-300 select-none"
          />
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 flex flex-col items-start text-left max-w-xl min-w-0">
          <h2 className="text-sm sm:text-2xl md:text-4xl font-extrabold tracking-tight leading-snug sm:leading-tight text-on-surface mb-1 sm:mb-2 md:mb-3">
            Salurkan Aspirasimu <br className="hidden sm:inline" />
            <span className="text-primary">
              di Hallo Jurnal
            </span>
          </h2>

          <p className="text-secondary text-[11px] sm:text-xs md:text-sm leading-relaxed mb-2.5 sm:mb-4 md:mb-5 max-w-lg line-clamp-2 md:line-clamp-none">
            Wadah laporan dan aspirasi online warga Sukabumi. Sampaikan aduan fasilitas publik secara langsung, cepat, dan transparan.
          </p>

          <Link
            href="/halo-jurnal"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs sm:text-sm px-3.5 py-1.5 sm:px-6 sm:py-2.5 md:px-7 md:py-3 rounded-full shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer group"
          >
            <span>Kirim Laporan</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
