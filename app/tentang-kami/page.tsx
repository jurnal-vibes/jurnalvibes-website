import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description: 'Profil media, susunan redaksi, dan legalitas badan hukum PT Media Jurnal Sukabumi.',
  openGraph: {
    title: 'Tentang Kami | Jurnal Wave',
    description: 'Profil media, susunan redaksi, dan legalitas badan hukum PT Media Jurnal Sukabumi.',
  },
};

export default function TentangKamiPage() {
  const redaksi = [
    { jabatan: 'Chief Executive Officer (CEO)', nama: 'Eman Sulaeman, S.IP' },
    { jabatan: 'Pemimpin Redaksi', nama: 'Ujang Herlan, S.Pd' },
    { jabatan: 'Redaksi & Kreatif Digital', nama: 'Tim Jurnal Wave' },
  ];

  const legalitas = [
    { label: 'Nama Perusahaan', nilai: 'PT Media Jurnal Sukabumi' },
    { label: 'SK Pengesahan Menkumham', nilai: 'AHU-0007259.AH.01.01. Tahun 2020' },
    { label: 'Nomor Induk Berusaha (NIB)', nilai: '0220109361089' },
    { label: 'NPWP Perusahaan', nilai: '94.265.244.7-405.000' },
    { label: 'Izin Mendirikan Bangunan (IMB)', nilai: '503.3/644.4/2717/PMB-DPTMPTSP/2020' },
  ];

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col min-w-0">
      <main className="w-full flex flex-col gap-6">
        {/* Breadcrumb Ringkas */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-on-surface dark:text-white font-semibold">Tentang Kami</span>
        </nav>

        {/* Header Artikel */}
        <header className="border-b border-outline-variant dark:border-slate-800 pb-3 sm:pb-4">
          <h1 className="font-headline-xl text-lg sm:text-xl md:text-2xl font-bold text-on-surface dark:text-white leading-tight">
            Tentang Jurnal Wave
          </h1>
          <p className="text-xs sm:text-sm text-primary font-semibold mt-1.5">
            Jurnal Wave — Suara Baru, Informasi Terkini
          </p>
        </header>

        {/* Konten Redaksional */}
        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-on-surface/90 dark:text-gray-300 leading-relaxed space-y-4">
          <p className="leading-relaxed">
            <strong>Jurnal Wave</strong> merupakan portal media digital yang berada di bawah naungan perusahaan pers resmi <strong>PT Media Jurnal Sukabumi</strong>. Hadir sebagai wajah baru media informasi, Jurnal Wave berkomitmen menyajikan berita aktual, inspiratif, independen, dan berimbang dengan perspektif yang segar serta relevan dengan perkembangan zaman.
          </p>
          <p className="leading-relaxed">
            Mengusung semangat jurnalisme modern, Jurnal Wave hadir untuk menangkap berbagai dinamika kehidupan masyarakat, mulai dari isu sosial, pendidikan, budaya, komunitas, kreativitas, hingga perkembangan generasi muda di Kota dan Kabupaten Sukabumi khususnya.
          </p>
          <p className="leading-relaxed">
            Kami percaya bahwa setiap suara memiliki arti dan setiap peristiwa layak mendapatkan ruang pemberitaan. Karena itu, Jurnal Wave tidak hanya menjadi sumber informasi, tetapi juga ruang ekspresi, inspirasi, dan partisipasi publik dengan berpegang teguh pada Kode Etik Jurnalistik dan Undang-Undang Pers.
          </p>
          <p className="leading-relaxed">
            Sebagai bagian dari komitmen terhadap keterbukaan informasi, Jurnal Wave juga menghadirkan <strong>Hallo Jurnal</strong>, kanal interaktif yang menjadi ruang aspirasi, pengaduan, dan penyampaian informasi masyarakat guna membangun jembatan komunikasi antara warga, media, dan para pemangku kepentingan.
          </p>
          <div className="pt-2">
            <Link
              href="/halo-jurnal"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:underline transition-colors group"
            >
              <span>Jelajahi Portal Layanan Warga: Hallo Jurnal</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>

        {/* Box Redaksi & Legalitas (2 Kolom Simpel & Rapi) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Susunan Redaksi */}
          <section className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-outline-variant/60 dark:border-slate-800 pb-2.5 mb-3">
              Susunan Redaksi &amp; Manajemen
            </h2>
            <div className="divide-y divide-outline-variant/40 dark:divide-slate-800 text-xs">
              {redaksi.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-2">
                  <span className="text-on-surface-variant dark:text-gray-400 text-[11px]">{item.jabatan}</span>
                  <span className="font-bold text-on-surface dark:text-white text-right text-xs">{item.nama}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Legalitas Badan Hukum */}
          <section className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-outline-variant/60 dark:border-slate-800 pb-2.5 mb-3">
              Legalitas Badan Hukum
            </h2>
            <div className="divide-y divide-outline-variant/40 dark:divide-slate-800 text-xs">
              {legalitas.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-2">
                  <span className="text-on-surface-variant dark:text-gray-400 text-[11px]">{item.label}</span>
                  <span className="font-mono font-bold text-on-surface dark:text-white text-right text-xs break-all sm:break-normal">
                    {item.nilai}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Informasi Kantor & Kontak (Simpel Tanpa Nomor Rekening) */}
        <section className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-outline-variant/60 dark:border-slate-800 pb-2.5">
            Alamat Redaksi
          </h2>
          <p className="text-xs text-on-surface-variant dark:text-gray-400 leading-relaxed">
            <strong className="text-on-surface dark:text-white block mb-0.5">PT Media Jurnal Sukabumi</strong>
            Perum Bukit Randu Asri, Blok K, Nomor 14, RT 07 RW 22, Kel./Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351.
          </p>
          <div className="divide-y divide-outline-variant/40 dark:divide-slate-800 text-xs pt-1 border-t border-outline-variant/40 dark:border-slate-800">
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-on-surface-variant dark:text-gray-400 text-[11px]">Email Redaksi</span>
              <a
                href="mailto:redaksi.jurnalwave@gmail.com"
                className="font-bold text-on-surface dark:text-white hover:text-primary hover:underline text-xs"
              >
                redaksi.jurnalwave@gmail.com
              </a>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-on-surface-variant dark:text-gray-400 text-[11px]">WhatsApp Iklan &amp; Kerjasama</span>
              <span className="font-mono font-bold text-on-surface-variant dark:text-gray-400 text-xs">
                -
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
