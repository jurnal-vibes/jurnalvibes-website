'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function HubungiKamiClient() {
  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col min-w-0">
      <main className="w-full flex flex-col gap-6">
        {/* Breadcrumb Ringkas */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-on-surface dark:text-white font-semibold">Kontak Kami</span>
        </nav>

        {/* Header Dokumen */}
        <header className="border-b border-outline-variant dark:border-slate-800 pb-3 sm:pb-4">
          <h1 className="font-headline-xl text-lg sm:text-xl md:text-2xl font-bold text-on-surface dark:text-white leading-tight">
            Kontak Kami
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 mt-1.5">
            Informasi alamat kantor sekretariat dan kontak email resmi redaksi PT Media Jurnal Sukabumi.
          </p>
        </header>

        {/* Informasi Kontak: Alamat & Email Saja */}
        <div className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
          <div className="pb-2.5 border-b border-outline-variant/60 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Alamat Redaksi
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 leading-relaxed">
            <strong className="text-on-surface dark:text-white block mb-0.5">PT Media Jurnal Sukabumi</strong>
            Perum Bukit Randu Asri, Blok K, Nomor 14, RT 07 RW 22, Kel./Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351.
          </p>

          <div className="divide-y divide-outline-variant/40 dark:divide-slate-800 text-xs pt-1 border-t border-outline-variant/40 dark:border-slate-800">
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-on-surface-variant dark:text-gray-400 text-[11px] sm:text-xs">
                Email Redaksi
              </span>
              <a
                href="mailto:redaksi.jurnalwave@gmail.com"
                className="font-bold text-on-surface dark:text-white hover:text-primary hover:underline text-xs"
              >
                redaksi.jurnalwave@gmail.com
              </a>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-on-surface-variant dark:text-gray-400 text-[11px] sm:text-xs">
                WhatsApp Iklan &amp; Kerjasama
              </span>
              <span className="font-mono font-bold text-on-surface-variant dark:text-gray-400 text-xs">
                -
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
