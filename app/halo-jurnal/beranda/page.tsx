import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CategoryCards from '@/components/halo-jurnal/CategoryCards'
import UserAvatar from '@/components/halo-jurnal/UserAvatar'
import { Search, Calendar, MapPin, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import { DUMMY_REPORTS } from '@/data/dummyReports'

export const dynamic = 'force-dynamic'

export default async function HaloJurnalBerandaPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  const user =
    authUser || {
      id: 'demo-user-id',
      email: 'warga@sukabumi.com',
      user_metadata: { full_name: 'Warga Sukabumi' },
    }

  // Fetch profile data
  const { data: profile } =
    user.id === 'demo-user-id'
      ? { data: { full_name: 'Warga Sukabumi', role: 'citizen' } }
      : await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single()

  // Fetch recent public reports
  const { data: dbRecentReports } = await supabase
    .from('laporan')
    .select('*, laporan_lampiran(file_url)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const recentReports = dbRecentReports && dbRecentReports.length > 0 ? dbRecentReports : DUMMY_REPORTS.slice(0, 3)

  const fallbackName = user.user_metadata?.full_name
  const displayName =
    profile?.full_name ||
    fallbackName ||
    (user.email && user.email.length > 24 ? user.email.substring(0, 24) + '…' : user.email)

  return (
    <main className="w-full">
      {/* Welcome Section */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3.5 bg-surface border border-outline-variant/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <UserAvatar
            name={displayName}
            size="lg"
            bgColor="primary"
            className="w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg font-extrabold shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-extrabold text-lg sm:text-2xl text-on-surface truncate tracking-tight">
              Selamat Datang, {displayName}
            </h1>
            <p className="text-secondary text-xs sm:text-sm mt-0.5">
              Anda masuk sebagai{' '}
              <span className="font-semibold text-primary capitalize">{profile?.role || 'Warga'}</span>
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/halo-jurnal/lapor"
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold tracking-tight shadow-xs transition-all active:scale-95"
            >
              + Buat Laporan
            </Link>
            <Link
              href="/halo-jurnal/laporan-saya"
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-xs font-bold tracking-tight transition-colors"
            >
              Laporan Saya
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative min-h-[440px] sm:min-h-[500px] md:min-h-[560px] flex items-center justify-center overflow-hidden mx-4 sm:mx-6 md:mx-auto rounded-3xl shadow-md max-w-container-max pt-8 pb-16 sm:pt-10 sm:pb-20 md:pt-12 md:pb-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/40 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-cover object-center"
            alt="Halo Jurnal Sukabumi Banner"
            src="/hero-banner.webp"
          />
        </div>

        <div className="relative z-20 text-center px-4 sm:px-6 max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white mb-2 md:mb-3 tracking-tight drop-shadow-md">
            Suara Anda, Wadah Kami
          </h2>

          <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-6 max-w-xl mx-auto font-medium">
            Sampaikan aspirasi dan laporan pengaduan Anda secara langsung kepada tim Jurnal Sukabumi.
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
                  className="flex-1 bg-transparent border-none outline-none px-3 py-1.5 text-on-surface placeholder:text-secondary text-xs sm:text-sm min-w-0"
                  placeholder="Cari laporan publik di Sukabumi..."
                  type="text"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-95 shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Cari</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Category Cards Section */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-6 -mt-12 sm:-mt-16 md:-mt-20 relative z-30 pb-12 sm:pb-16">
        <CategoryCards isLoggedIn={true} />
      </section>

      {/* Recent Reports Grid */}
      <section className="bg-surface-container-low/60 border-t border-outline-variant/60 py-12 md:py-16 px-4 sm:px-6 md:px-6">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-on-surface tracking-tight">
                Laporan Publik Terkini
              </h2>
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
                Belum ada laporan publik saat ini.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
