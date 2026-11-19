import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi Jurnal Wave — informasi pengumpulan data, cookie, dan perlindungan privasi pengunjung.',
  openGraph: {
    title: 'Kebijakan Privasi | Jurnal Wave',
    description: 'Kebijakan privasi Jurnal Wave — informasi pengumpulan data, cookie, dan perlindungan privasi pengunjung.',
  },
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col min-w-0">
      <main className="w-full flex flex-col gap-6">
        {/* Breadcrumb Ringkas */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-on-surface dark:text-white font-semibold">Kebijakan Privasi</span>
        </nav>

        {/* Header Dokumen */}
        <header className="border-b border-outline-variant dark:border-slate-800 pb-3 sm:pb-4">
          <h1 className="font-headline-xl text-lg sm:text-xl md:text-2xl font-bold text-on-surface dark:text-white leading-tight">
            Kebijakan Privasi
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 mt-1.5">
            Komitmen PT Media Jurnal Sukabumi dalam menjaga privasi dan keamanan data seluruh pengunjung portal Jurnal Wave.
          </p>
        </header>

        {/* Konten Kebijakan Privasi */}
        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-on-surface/90 dark:text-gray-300 leading-relaxed space-y-6">
          <div className="bg-surface-container-low dark:bg-slate-900 p-4 rounded-xl border-l-4 border-primary text-xs sm:text-sm leading-relaxed space-y-2">
            <p>
              Di portal berita <strong>Jurnal Wave</strong> (dikelola oleh <strong>PT Media Jurnal Sukabumi</strong>), privasi pengunjung adalah prioritas mendasar kami. Dokumen Kebijakan Privasi ini menguraikan jenis informasi yang dicatat serta bagaimana informasi tersebut dikelola secara bertanggung jawab.
            </p>
          </div>

          <div className="space-y-5 divide-y divide-outline-variant/40 dark:divide-slate-800">
            <section className="pt-3">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                1. Berkas Log (Log Files)
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 leading-relaxed">
                Jurnal Wave menerapkan prosedur standar pencatatan berkas log ketika pengunjung mengakses situs. Informasi yang terekam meliputi alamat protokol internet (IP), tipe peramban (browser), Penyedia Layanan Internet (ISP), tanggal dan waktu kunjungan, serta halaman rujukan. Data ini bersifat anonim untuk keperluan analisis tren teknis dan pemeliharaan performa situs.
              </p>
            </section>

            <section className="pt-4">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                2. Cookie dan Pengalaman Pengguna
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 leading-relaxed">
                Kami menggunakan cookie standar untuk menyimpan preferensi pengunjung dan mengoptimalkan kecepatan akses halaman. Pengunjung dapat memilih untuk menonaktifkan cookie melalui pengaturan peramban masing-masing sewaktu-waktu.
              </p>
            </section>

            <section className="pt-4">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                3. Mitra Iklan &amp; Layanan Pihak Ketiga
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 leading-relaxed">
                Beberapa mitra periklanan pihak ketiga pada portal ini dapat menggunakan cookie atau suar web guna mengukur efektivitas kampanye promosi mereka. Kebijakan privasi masing-masing mitra periklanan berlaku secara independen di luar kendali langsung Jurnal Wave.
              </p>
            </section>

            <section className="pt-4">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                4. Perlindungan Data Anak
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 leading-relaxed">
                Jurnal Wave tidak secara sadar mengumpulkan identitas pribadi dari anak di bawah usia 13 tahun. Jika Anda mendapati anak Anda memberikan informasi pribadi di situs kami, silakan hubungi tim kami agar data tersebut dapat segera dihapus dari sistem.
              </p>
            </section>

            <section className="pt-4">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                5. Ruang Lingkup Kebijakan
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 leading-relaxed">
                Kebijakan Privasi ini hanya berlaku untuk aktivitas online di portal web Jurnal Wave dan tidak berlaku untuk pengumpulan data secara offline maupun melalui saluran eksternal lainnya.
              </p>
            </section>

            <section className="pt-4 bg-surface-container-low dark:bg-slate-900 p-4 rounded-xl border border-outline-variant/60 dark:border-slate-800">
              <h2 className="text-sm font-bold text-on-surface dark:text-white mb-1">
                Persetujuan Pengunjung
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-gray-400 leading-relaxed">
                Dengan menggunakan situs web kami, Anda menyatakan menyetujui Kebijakan Privasi ini beserta syarat dan ketentuan resmi PT Media Jurnal Sukabumi.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
