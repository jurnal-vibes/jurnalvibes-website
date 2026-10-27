'use client'

import React from 'react'
import Link from 'next/link'

export default function HaloJurnalFooter() {
  return (
    <footer className="w-full bg-surface border-t border-outline-variant/60 mt-auto relative transition-colors duration-300">
      <div className="max-w-container-max mx-auto pt-4 sm:pt-5 pb-20 md:pb-5 px-4 sm:px-6 md:px-12">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Sisi Kiri (Desktop) / Bawah (Mobile): Copyright */}
          <div className="text-center md:text-left">
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
              &copy; 2026 Jurnal Wave. All rights reserved.
            </p>
          </div>

          {/* Sisi Kanan (Desktop) / Atas (Mobile): Navigasi Ringkas */}
          <div className="text-center md:text-right">
            <nav
              aria-label="Footer Navigation"
              className="flex flex-wrap justify-center md:justify-end items-center gap-x-3.5 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium"
            >
              <Link href="/halo-jurnal/tentang" className="hover:text-primary transition-colors">
                Tentang Kami
              </Link>
              <span className="text-slate-300 dark:text-slate-700 select-none">&bull;</span>
              <Link href="/halo-jurnal/syarat-ketentuan" className="hover:text-primary transition-colors">
                Syarat &amp; Ketentuan
              </Link>
              <span className="text-slate-300 dark:text-slate-700 select-none">&bull;</span>
              <Link href="/halo-jurnal/kebijakan-privasi" className="hover:text-primary transition-colors">
                Kebijakan Privasi
              </Link>
              <span className="text-slate-300 dark:text-slate-700 select-none hidden sm:inline">&bull;</span>
              <Link href="/halo-jurnal/hubungi-kami" className="hover:text-primary transition-colors">
                Hubungi Kami
              </Link>
              <span className="text-slate-300 dark:text-slate-700 select-none">&bull;</span>
              <Link href="/" className="hover:text-primary transition-colors">
                Berita Jurnal Wave
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

