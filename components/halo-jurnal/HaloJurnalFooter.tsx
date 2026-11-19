'use client'

import React from 'react'
import Link from 'next/link'

export default function HaloJurnalFooter() {
  return (
    <footer className="hidden md:block w-full bg-surface border-t border-outline-variant/60 mt-auto relative transition-colors duration-300">
      <div className="max-w-container-max mx-auto py-5 px-4 sm:px-6 md:px-12">
        <div className="flex flex-row items-center justify-between gap-4">
          {/* Sisi Kiri: Copyright */}
          <div className="text-left">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              &copy; {new Date().getFullYear()} Jurnal Wave. All rights reserved.
            </p>
          </div>

          {/* Sisi Kanan: Navigasi Ringkas */}
          <div className="text-right">
            <nav
              aria-label="Footer Navigation"
              className="flex flex-wrap justify-end items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium"
            >
              <Link href="/halo-jurnal/tentang" className="hover:text-primary transition-colors">
                Tentang Kami
              </Link>
              <Link href="/halo-jurnal/syarat-ketentuan" className="hover:text-primary transition-colors">
                Syarat &amp; Ketentuan
              </Link>
              <Link href="/halo-jurnal/kebijakan-privasi" className="hover:text-primary transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/halo-jurnal/hubungi-kami" className="hover:text-primary transition-colors">
                Kontak Kami
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

