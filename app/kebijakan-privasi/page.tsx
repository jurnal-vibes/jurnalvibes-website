import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi Jurnal Vibes — informasi pengumpulan data, cookie, dan perlindungan privasi pengunjung.',
  openGraph: {
    title: 'Kebijakan Privasi | Jurnal Vibes',
    description: 'Kebijakan privasi Jurnal Vibes — informasi pengumpulan data, cookie, dan perlindungan privasi pengunjung.',
  },
};



export default function KebijakanPrivasiPage() {
  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-stack-lg pb-24 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="w-full md:w-3/4 flex flex-col gap-6 pr-0 md:pr-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-on-surface dark:text-white font-semibold">Kebijakan Privasi</span>
        </nav>

        {/* Header Dokumen */}
        <header className="border-b border-outline-variant dark:border-slate-800 pb-5">
          <span className="text-primary font-bold text-xs uppercase tracking-wider block mb-2">
            Perlindungan Privasi Pengunjung
          </span>
          <h1 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface dark:text-white leading-tight">
            Kebijakan Privasi (Privacy Policy)
          </h1>
        </header>

        {/* Konten Kebijakan Privasi */}
        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-on-surface/90 dark:text-gray-300 leading-relaxed space-y-5">
          <p>
            Di <strong>Jurnal Sukabumi</strong>, yang dapat diakses dari{' '}
            <a href="https://jurnalsukabumi.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
              jurnalsukabumi.com
            </a>{' '}
            dan jaringan medianya, salah satu prioritas utama kami adalah privasi pengunjung kami. Dokumen Kebijakan Privasi ini berisi jenis-jenis informasi yang dikumpulkan dan dicatat oleh Jurnal Sukabumi dan bagaimana kami menggunakannya.
          </p>
          <p>
            Jika Anda memiliki pertanyaan tambahan atau memerlukan informasi lebih lanjut tentang Kebijakan Privasi kami, jangan ragu untuk menghubungi kami melalui saluran kontak yang tersedia.
          </p>

          <section className="pt-2">
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
              File Log (Log Files)
            </h2>
            <p>
              Jurnal Sukabumi mengikuti prosedur standar menggunakan file log. File-file ini mencatat pengunjung ketika mereka mengunjungi situs web. Semua perusahaan hosting melakukan ini dan bagian dari analisis layanan hosting. Informasi yang dikumpulkan oleh file log termasuk alamat protokol internet (IP), tipe peramban (browser), Penyedia Layanan Internet (ISP), cap tanggal dan waktu, halaman rujukan/keluar, dan mungkin jumlah klik. Informasi ini tidak terkait dengan informasi apa pun yang dapat diidentifikasi secara pribadi. Tujuan dari informasi ini adalah untuk menganalisis tren, mengelola situs, melacak pergerakan pengguna di situs web, dan mengumpulkan informasi demografis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
              Cookie dan Beacon Web
            </h2>
            <p>
              Seperti situs web lainnya, Jurnal Sukabumi menggunakan &apos;cookies&apos;. Cookie ini digunakan untuk menyimpan informasi termasuk preferensi pengunjung, dan halaman-halaman di situs web yang diakses atau dikunjungi pengunjung. Informasi ini digunakan untuk mengoptimalkan pengalaman pengguna dengan menyesuaikan konten halaman web kami berdasarkan jenis browser pengunjung dan/atau informasi lainnya.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
              Mitra Iklan Kami
            </h2>
            <p>
              Beberapa pengiklan di situs kami mungkin menggunakan cookie dan suar web. Setiap mitra periklanan kami memiliki Kebijakan Privasi sendiri untuk kebijakan mereka tentang data pengguna.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
              Kebijakan Privasi Pihak Ketiga
            </h2>
            <p>
              Server iklan pihak ketiga atau jaringan iklan menggunakan teknologi seperti cookie, JavaScript, atau Web Beacon yang digunakan dalam iklan masing-masing dan tautan yang muncul di Jurnal Sukabumi, yang dikirim langsung ke peramban pengguna. Mereka secara otomatis menerima alamat IP Anda ketika hal ini terjadi. Teknologi ini digunakan untuk mengukur efektivitas kampanye iklan mereka dan/atau untuk mempersonalisasi konten iklan yang Anda lihat di situs web yang Anda kunjungi. Perhatikan bahwa Jurnal Sukabumi tidak memiliki akses atau kontrol terhadap cookie ini yang digunakan oleh pengiklan pihak ketiga.
            </p>
            <p>
              Kebijakan Privasi Jurnal Sukabumi tidak berlaku untuk pengiklan atau situs web lain. Anda dapat memilih untuk menonaktifkan cookie melalui opsi peramban individual Anda.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
              Informasi Perlindungan Anak
            </h2>
            <p>
              Bagian lain dari prioritas kami adalah menambahkan perlindungan untuk anak-anak saat menggunakan internet. Kami mendorong orang tua dan wali untuk mengamati, berpartisipasi, dan/atau memantau dan membimbing aktivitas online mereka. Jurnal Sukabumi tidak secara sadar mengumpulkan Informasi Identifikasi Pribadi apa pun dari anak di bawah usia 13 tahun. Jika Anda meyakini anak Anda memberikan informasi semacam ini di situs web kami, segera hubungi kami agar kami dapat menghapus informasi tersebut dari catatan kami.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
              Hanya Kebijakan Privasi Online
            </h2>
            <p>
              Kebijakan Privasi ini hanya berlaku untuk aktivitas online kami dan berlaku untuk pengunjung situs web kami sehubungan dengan informasi yang mereka bagikan dan/atau kumpulkan di Jurnal Sukabumi. Kebijakan ini tidak berlaku untuk informasi apa pun yang dikumpulkan secara offline atau melalui saluran selain dari situs web ini.
            </p>
          </section>

          <section className="bg-surface-container-low dark:bg-slate-900 p-4 rounded-lg border-l-4 border-primary mt-6">
            <h2 className="text-base font-bold text-on-surface dark:text-white mb-1">
              Persetujuan
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400">
              Dengan menggunakan situs web kami, Anda dengan ini menyetujui Kebijakan Privasi kami dan menyetujui Syarat dan Ketentuannya.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
