import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CategoryCards from '@/components/halo-jurnal/CategoryCards'
import { Search, Calendar, MapPin, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'

import { DUMMY_REPORTS } from '@/data/dummyReports'

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
      <section className="relative min-h-[580px] sm:min-h-[660px] md:min-h-[720px] flex items-center justify-center overflow-hidden pt-8 pb-32 sm:pt-10 sm:pb-40 md:pt-12 md:pb-44">
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
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-3 md:mb-4 tracking-tight drop-shadow-md">
            Suara Anda, Wadah Kami
          </h1>

          <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-sm font-medium">
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
                  className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-on-surface placeholder:text-secondary text-sm sm:text-base min-w-0"
                  placeholder="Cari laporan publik, jalan rusak, fasilitas..."
                  type="text"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-tight transition-all active:scale-95 shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Cari Laporan</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Category Cards Section */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 -mt-20 sm:-mt-28 md:-mt-36 relative z-30 pb-12 sm:pb-16">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentReports && recentReports.length > 0 ? (
              recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/halo-jurnal/laporan/${report.id}`}
                  className="group bg-surface border border-outline-variant/80 hover:border-primary/40 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      {report.status === 'selesai' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200/50">
                          <CheckCircle2 className="w-3 h-3" />
                          {report.jenis === 'inspirasi' ? 'Tayang' : 'Selesai'}
                        </span>
                      )}
                      {report.status === 'diproses' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-200/50">
                          <Clock className="w-3 h-3" />
                          Diproses
                        </span>
                      )}
                      {report.status === 'diterima' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200/50">
                          <Clock className="w-3 h-3" />
                          Diterima
                        </span>
                      )}
                      {report.status === 'ditindaklanjuti' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-[10px] font-extrabold uppercase tracking-wider border border-purple-200/50">
                          <ShieldCheck className="w-3 h-3" />
                          Ditindaklanjuti
                        </span>
                      )}

                      <span className="text-[11px] font-medium text-secondary flex items-center gap-1 shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {report.judul}
                    </h3>
                    <p className="text-secondary text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed">
                      {report.deskripsi}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{report.lokasi || 'Sukabumi'}</span>
                    </div>
                  </div>

                  {report.laporan_lampiran &&
                    report.laporan_lampiran.length > 0 &&
                    report.laporan_lampiran[0].file_url && (
                      <div className="h-44 relative overflow-hidden bg-surface-container-high">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={report.judul}
                          src={report.laporan_lampiran[0].file_url}
                        />
                      </div>
                    )}
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-secondary bg-surface rounded-2xl border border-outline-variant/60">
                Belum ada laporan publik saat ini. Jadilah yang pertama menyampaikan laporan!
              </div>
            )}
          </div>
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
