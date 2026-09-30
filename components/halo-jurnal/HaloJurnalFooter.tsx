'use client'

import React from 'react'
import Link from 'next/link'

export default function HaloJurnalFooter() {
  return (
    <footer className="w-full bg-surface border-t border-outline-variant/60 mt-auto relative transition-colors duration-300">
      <div className="max-w-container-max mx-auto pt-5 sm:pt-6 pb-24 md:pb-6 px-4 sm:px-6 md:px-12">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
          {/* Sisi Kiri (Desktop) / Bawah (Mobile): Copyright */}
          <div className="text-center md:text-left">
            <p className="text-xs text-secondary">
              © 2026 Jurnal Vibes. All rights reserved.
            </p>
          </div>

          {/* Sisi Kanan (Desktop) / Atas (Mobile): Navigasi Ringkas */}
          <div className="text-center md:text-right">
            <nav
              aria-label="Footer Navigation"
              className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2 text-xs text-on-surface-variant font-medium"
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
                Hubungi Kami
              </Link>
              <Link href="/" className="hover:text-primary text-primary font-semibold transition-colors">
                Portal Utama
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

