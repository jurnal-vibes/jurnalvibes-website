import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CategoryCards from '@/components/halo-jurnal/CategoryCards'
import { Search, Calendar, MapPin, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import { DUMMY_REPORTS } from '@/data/dummyReports'
import RecentPublicReports from '@/components/halo-jurnal/RecentPublicReports'

export const dynamic = 'force-dynamic'

export default async function HaloJurnalLandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/halo-jurnal/beranda')
  }

  // Fetch recent public reports
  const { data: dbRecentReports } = await supabase
    .from('laporan')
    .select('*, laporan_lampiran(file_url)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const recentReports = dbRecentReports && dbRecentReports.length > 0 ? dbRecentReports : DUMMY_REPORTS.slice(0, 3)

  const { count: countTotal } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })

  const { count: countTuntas } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'selesai')

  const { count: countProses } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'diproses')

  const totalLaporan = countTotal || DUMMY_REPORTS.length
  const tuntasLaporan = countTuntas || DUMMY_REPORTS.filter((r) => r.status === 'selesai').length
  const prosesLaporan = countProses || DUMMY_REPORTS.filter((r) => r.status === 'diproses').length

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
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 -mt-10 sm:-mt-20 md:-mt-32 relative z-30 pb-12 sm:pb-16">
        <CategoryCards />
      </section>

      {/* Recent Reports Grid */}
      <section className="bg-surface-container-low/60 border-y border-outline-variant/60 py-12 md:py-16 px-4 sm:px-6 md:px-6">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
                Laporan Publik Terkini
              </h2>
              <p className="text-secondary text-xs sm:text-sm mt-1">
                Pantau perkembangan penanganan pengaduan masyarakat secara terbuka.
              </p>
            </div>

            <Link
              href="/halo-jurnal/feed-publik"
              className="group inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <span className="group-hover:underline underline-offset-4">Lihat Semua Laporan</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <RecentPublicReports initialReports={recentReports} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 sm:py-16 bg-surface border-t border-outline-variant/60 overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Laporan Masuk */}
            <div className="group relative p-6 sm:py-7 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-on-surface tracking-tight mb-1">
                {totalLaporan || 0}
              </span>
              <span className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider mb-0.5">
                Laporan Masuk
              </span>
              <span className="text-[11px] sm:text-xs text-secondary">
                Aspirasi warga terhimpun
              </span>
            </div>

            {/* Tuntas Ditangani */}
            <div className="group relative p-6 sm:py-7 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-on-surface tracking-tight mb-1">
                {tuntasLaporan || 0}
              </span>
              <span className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider mb-0.5">
                Tuntas Ditangani
              </span>
              <span className="text-[11px] sm:text-xs text-secondary">
                Solusi tervalidasi
              </span>
            </div>

            {/* Sedang Diproses */}
            <div className="group relative p-6 sm:py-7 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-on-surface tracking-tight mb-1">
                {prosesLaporan || 0}
              </span>
              <span className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider mb-0.5">
                Sedang Diproses
              </span>
              <span className="text-[11px] sm:text-xs text-secondary">
                Tindak lanjut instansi
              </span>
            </div>

            {/* Transparansi */}
            <div className="group relative p-6 sm:py-7 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-on-surface tracking-tight mb-1">
                100%
              </span>
              <span className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wider mb-0.5">
                Transparansi
              </span>
              <span className="text-[11px] sm:text-xs text-secondary">
                Terbuka & akuntabel
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
