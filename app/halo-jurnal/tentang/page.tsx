import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ShieldCheck,
  ExternalLink,
  Target,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tentang Halo Jurnal',
  description: 'Mengenal platform aspirasi dan pengaduan publik warga Sukabumi oleh PT Media Jurnal Sukabumi.',
}

export default async function HaloJurnalTentangPage() {
  const supabase = await createClient()

  const { count: ditindaklanjutiCount } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })
    .in('status', ['ditindaklanjuti', 'selesai'])

  const { count: totalLaporanCount } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-[#8b1e2c] to-rose-900 text-white py-16 md:py-24 px-4 sm:px-6 md:px-6 overflow-hidden">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-300" />
              Digital Governance & Citizen Voice
            </span>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4 leading-tight">
              Tentang Halo Jurnal
            </h1>

            <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
              Platform aspirasi dan pengaduan warga yang dikelola secara independen oleh redaksi Jurnal Sukabumi (PT Media Jurnal Sukabumi). Kami menerima, memverifikasi, dan menjembatani komunikasi langsung dengan pihak berwenang demi transparansi dan kemajuan Sukabumi.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/halo-jurnal/lapor"
                className="px-6 py-3 rounded-xl bg-white text-primary font-bold text-xs sm:text-sm shadow-md hover:bg-white/90 transition-all cursor-pointer"
              >
                Buat Laporan Sekarang
              </Link>
              <a
                href="https://jurnalsukabumi.com/tentang-kami/"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all inline-flex items-center gap-2"
              >
                <span>Profil Resmi Perusahaan</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 h-72 sm:h-80 md:h-96">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-banner.webp"
              alt="Halo Jurnal Sukabumi"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Transparansi untuk Sukabumi Lebih Baik
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-on-surface mb-2">Tepat Sasaran</h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Setiap laporan diteruskan dan dipantau bersama instansi kedinasan terkait di Kota maupun Kabupaten Sukabumi.
            </p>
          </div>

          <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-on-surface mb-2">Didukung Warga</h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Masyarakat dapat memberikan dukungan suara dan komentar konstruktif sehingga urgensi masalah terlihat jelas.
            </p>
          </div>

          <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-on-surface mb-2">Liputan Media</h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Aduan penting akan diangkat menjadi artikel jurnalistik resmi di Jurnal Sukabumi untuk mempercepat penyelesaian.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
