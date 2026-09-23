import React from 'react'
import Link from 'next/link'
import { Megaphone, ExternalLink, ArrowRight } from 'lucide-react'

export default function HaloJurnalFooter() {
  return (
    <footer className="border-t border-outline-variant/60 bg-surface text-on-surface py-10 md:py-12 transition-colors duration-300">
      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-outline-variant/60">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-rose-500 text-white flex items-center justify-center">
                <Megaphone className="w-4 h-4 fill-current" />
              </div>
              <span className="font-heading font-black text-lg text-on-surface">Halo Jurnal</span>
            </div>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-md">
              Inisiatif platform transparansi publik dan penyaluran aspirasi masyarakat Kota &amp; Kabupaten Sukabumi yang dikelola secara independen oleh PT Media Jurnal Sukabumi.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>Kunjungi Portal Berita Jurnal Vibes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-on-surface mb-3">
              Layanan Warga
            </h4>
            <ul className="space-y-2 text-xs text-secondary">
              <li>
                <Link href="/halo-jurnal" className="hover:text-primary transition-colors">
                  Beranda Halo Jurnal
                </Link>
              </li>
              <li>
                <Link href="/halo-jurnal/lapor" className="hover:text-primary transition-colors">
                  Kirim Laporan &amp; Aduan
                </Link>
              </li>
              <li>
                <Link href="/halo-jurnal/feed-publik" className="hover:text-primary transition-colors">
                  Feed Laporan Publik
                </Link>
              </li>
              <li>
                <Link href="/halo-jurnal/laporan-saya" className="hover:text-primary transition-colors">
                  Pantau Laporan Saya
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-on-surface mb-3">
              Tentang &amp; Aturan
            </h4>
            <ul className="space-y-2 text-xs text-secondary">
              <li>
                <Link href="/halo-jurnal/tentang" className="hover:text-primary transition-colors">
                  Tentang Halo Jurnal
                </Link>
              </li>
              <li>
                <Link href="/halo-jurnal/kebijakan-privasi" className="hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/halo-jurnal/syarat-ketentuan" className="hover:text-primary transition-colors">
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/halo-jurnal/hubungi-kami" className="hover:text-primary transition-colors">
                  Hubungi Dukungan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-secondary gap-2 text-center sm:text-left">
          <p>© 2026 PT Media Jurnal Sukabumi. Seluruh hak cipta dilindungi undang-undang.</p>
          <p className="text-[11px]">Terintegrasi dalam ekosistem digital Jurnal Vibes</p>
        </div>
      </div>
    </footer>
  )
}
