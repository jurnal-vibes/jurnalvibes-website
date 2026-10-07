import Link from 'next/link'
import CategoryCards from '@/components/halo-jurnal/CategoryCards'
import { Search, Calendar, MapPin, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import { DUMMY_REPORTS } from '@/data/dummyReports'
import RecentPublicReports from '@/components/halo-jurnal/RecentPublicReports'

export default function HaloJurnalLandingPage() {
  const recentReports = DUMMY_REPORTS.slice(0, 4)
  const totalLaporan = DUMMY_REPORTS.length
  const tuntasLaporan = DUMMY_REPORTS.filter((r) => r.status === 'selesai').length
  const prosesLaporan = DUMMY_REPORTS.filter((r) => r.status === 'diproses').length

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[520px] sm:min-h-[640px] md:min-h-[720px] flex items-center justify-center overflow-hidden pt-10 pb-24 sm:pt-10 sm:pb-36 md:pt-12 md:pb-44">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/40 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-cover object-center"
            alt="Halo Jurnal Sukabumi Banner"
            src="/hero-banner.webp"
          />
        </div>

        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl text-white mb-3 md:mb-4 tracking-tight drop-shadow-md">
            Suara Anda, Wadah Kami
          </h1>

          <p className="text-white/90 text-xs sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-sm font-medium">
            Sampaikan aspirasi, aduan pelayanan publik, dan inspirasi Anda secara langsung dan transparan kepada redaksi Jurnal Sukabumi.
          </p>

          {/* Search Bar */}
          <form
            action="/halo-jurnal/feed-publik"
            method="GET"
            className="bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl p-2 w-full max-w-2xl border border-outline-variant/60"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center flex-1 min-w-0 px-2">
                <Search className="w-5 h-5 text-secondary shrink-0" />
                <input
                  name="search"
                  className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-on-surface placeholder:text-secondary text-xs sm:text-base min-w-0"
                  placeholder="Cari laporan publik, jalan rusak, fasilitas..."
                  type="text"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-95 shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Cari Laporan</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Category Cards Section */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 -mt-10 sm:-mt-20 md:-mt-32 relative z-30 pb-8 sm:pb-12">
        <CategoryCards />
      </section>

      {/* Recent Reports Grid */}
      <section className="bg-surface-container-low/60 border-y border-outline-variant/60 py-8 sm:py-10 px-4 sm:px-6 md:px-8">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-5 sm:mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-on-surface tracking-tight">
                Laporan Publik Terkini
              </h2>
              <p className="text-secondary text-xs sm:text-sm mt-0.5">
                Pantau perkembangan penanganan pengaduan masyarakat secara terbuka.
              </p>
            </div>

            <Link
              href="/halo-jurnal/feed-publik"
              className="group inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-semibold text-xs sm:text-sm transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span className="group-hover:underline underline-offset-4">Lihat Semua Laporan</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <RecentPublicReports initialReports={recentReports} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-8 sm:py-10 bg-surface border-t border-outline-variant/60 overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
            {/* Laporan Masuk */}
            <div className="group relative p-4 sm:p-5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
              <span className="font-heading font-bold text-2xl sm:text-3xl text-on-surface tracking-tight mb-1">
                {totalLaporan || 0}
              </span>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider mb-0.5">
                Laporan Masuk
              </span>
              <span className="text-[11px] text-secondary">
                Aspirasi warga terhimpun
              </span>
            </div>

            {/* Tuntas Ditangani */}
            <div className="group relative p-4 sm:p-5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
              <span className="font-heading font-bold text-2xl sm:text-3xl text-on-surface tracking-tight mb-1">
                {tuntasLaporan || 0}
              </span>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider mb-0.5">
                Tuntas Ditangani
              </span>
              <span className="text-[11px] text-secondary">
                Solusi tervalidasi
              </span>
            </div>

            {/* Sedang Diproses */}
            <div className="group relative p-4 sm:p-5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
              <span className="font-heading font-bold text-2xl sm:text-3xl text-on-surface tracking-tight mb-1">
                {prosesLaporan || 0}
              </span>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider mb-0.5">
                Sedang Diproses
              </span>
              <span className="text-[11px] text-secondary">
                Tindak lanjut instansi
              </span>
            </div>

            {/* Transparansi */}
            <div className="group relative p-4 sm:p-5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
              <span className="font-heading font-bold text-2xl sm:text-3xl text-on-surface tracking-tight mb-1">
                100%
              </span>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider mb-0.5">
                Transparansi
              </span>
              <span className="text-[11px] text-secondary">
                Terbuka & akuntabel
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
