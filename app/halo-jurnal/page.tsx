import Link from 'next/link'
import CategoryCards from '@/components/halo-jurnal/CategoryCards'
import { Search, Calendar, MapPin, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import RecentPublicReports from '@/components/halo-jurnal/RecentPublicReports'

export default async function HaloJurnalLandingPage() {
  let totalLaporan = 0
  let tuntasLaporan = 0
  let prosesLaporan = 0
  let recentReports: any[] = []

  try {
    const dbReports = await prisma.report.findMany({
      include: {
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    if (dbReports.length > 0) {
      totalLaporan = dbReports.length
      tuntasLaporan = dbReports.filter((r) => r.status === 'selesai').length
      prosesLaporan = dbReports.filter((r) => r.status === 'diproses').length
      recentReports = dbReports
        .filter((r) => r.isPublic !== false)
        .slice(0, 4)
        .map((item) => ({
          id: item.id,
          nomor_tiket: item.ticketNumber,
          ticket_number: item.ticketNumber,
          ticketNumber: item.ticketNumber,
          judul: item.title,
          deskripsi: item.description,
          kategori: item.reportType,
          lokasi: item.address,
          status: item.status,
          is_public: Boolean(item.isPublic),
          created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
          laporan_lampiran: (item.attachments || []).map((att: any) => ({
            id: att.id,
            file_url: att.fileUrl,
            file_type: att.fileType,
          })),
        }))
    }
  } catch {}

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[460px] sm:min-h-[640px] md:min-h-[720px] flex items-center justify-center overflow-hidden pt-14 pb-18 sm:pt-10 sm:pb-36 md:pt-12 md:pb-44">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/40 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-cover object-center"
            alt="Hallo Jurnal Wave Banner"
            src="/hero-banner.webp"
          />
        </div>

        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center mt-5 sm:mt-0">
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl text-white mb-3 md:mb-4 tracking-tight drop-shadow-md">
            Suara Anda, Wadah Kami
          </h1>

          <p className="text-white/90 text-xs sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-sm font-medium">
            Sampaikan aspirasi, aduan pelayanan publik, dan inspirasi Anda secara langsung dan transparan kepada redaksi Jurnal Wave.
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
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 -mt-14 sm:-mt-20 md:-mt-32 relative z-30 pb-8 sm:pb-12">
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

      {/* Stats Section: Clean Editorial Metric Strip */}
      <section className="relative py-3.5 sm:py-6 bg-surface-container-low/50 border-t border-outline-variant/60">
        <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs py-3 sm:py-4 px-1 sm:px-4">
            <div className="grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
              {/* 1. Laporan Masuk */}
              <div className="flex flex-col items-center justify-center text-center px-1 sm:px-3">
                <span className="font-heading font-extrabold text-base sm:text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  {totalLaporan || 0}
                </span>
                <span className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="sm:hidden">Laporan</span>
                  <span className="hidden sm:inline">Laporan Masuk</span>
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Aspirasi warga
                </span>
              </div>

              {/* 2. Tuntas Ditangani */}
              <div className="flex flex-col items-center justify-center text-center px-1 sm:px-3">
                <span className="font-heading font-extrabold text-base sm:text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  {tuntasLaporan || 0}
                </span>
                <span className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="sm:hidden">Selesai</span>
                  <span className="hidden sm:inline">Tuntas Ditangani</span>
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Solusi tervalidasi
                </span>
              </div>

              {/* 3. Sedang Diproses */}
              <div className="flex flex-col items-center justify-center text-center px-1 sm:px-3">
                <span className="font-heading font-extrabold text-base sm:text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  {prosesLaporan || 0}
                </span>
                <span className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="sm:hidden">Diproses</span>
                  <span className="hidden sm:inline">Sedang Diproses</span>
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Tindak lanjut instansi
                </span>
              </div>

              {/* 4. Transparansi */}
              <div className="flex flex-col items-center justify-center text-center px-1 sm:px-3">
                <span className="font-heading font-extrabold text-base sm:text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  100%
                </span>
                <span className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Transparansi
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Terbuka &amp; akuntabel
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
