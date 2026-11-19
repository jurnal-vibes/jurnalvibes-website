import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kontak Kami',
  description:
    'Informasi alamat kantor sekretariat dan kontak email resmi redaksi PT Media Jurnal Sukabumi.',
  openGraph: {
    title: 'Kontak Kami | Hallo Jurnal',
    description:
      'Informasi alamat kantor sekretariat dan kontak email resmi redaksi PT Media Jurnal Sukabumi.',
  },
}

export default function HaloJurnalKontakKamiPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-24 md:pb-16 space-y-6">
      {/* 1. Navigasi Kembali Ringkas */}
      <div className="flex items-center justify-start">
        <Link
          href="/halo-jurnal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda Hallo Jurnal</span>
        </Link>
      </div>

      {/* 2. Judul Halaman (Simpel, Tanpa Ikon Berlebih) */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight leading-tight">
          Kontak Kami
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Informasi alamat kantor sekretariat dan kontak email resmi redaksi PT Media Jurnal Sukabumi.
        </p>
      </div>

      {/* 3. Kartu Informasi Kontak (Alamat & Email) */}
      <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="pb-2.5 border-b border-outline-variant/60">
          <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
            Alamat Redaksi
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-secondary leading-relaxed">
          <strong className="text-on-surface font-semibold block mb-0.5">PT Media Jurnal Sukabumi</strong>
          Perum Bukit Randu Asri, Blok K, Nomor 14, RT 07 RW 22, Kel./Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351.
        </p>

        <div className="divide-y divide-outline-variant/40 pt-1 border-t border-outline-variant/60 text-xs">
          <div className="py-2.5 flex items-center justify-between gap-2">
            <span className="text-secondary text-[11px] sm:text-xs">Email Resmi</span>
            <a
              href="mailto:redaksi.jurnalwave@gmail.com"
              className="font-bold text-on-surface hover:text-primary hover:underline text-xs"
            >
              redaksi.jurnalwave@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
