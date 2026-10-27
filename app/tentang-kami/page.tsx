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
    { jabatan: 'Publisher', nama: 'Yoga Arya Suhada, H Agustina' },
    { jabatan: 'Manager IT', nama: 'Mohammad Nur' },
    { jabatan: 'Media Sosial', nama: 'Nofa Apekariasnya' },
    { jabatan: 'Reporter', nama: 'Ilham Nugraha, Idris' },
  ];

  const legalitas = [
    { label: 'Nama Perusahaan', nilai: 'PT Media Jurnal Sukabumi' },
    { label: 'SK Pengesahan Menkumham', nilai: 'Nomor AHU-0007259.AH.01.01. Tahun 2020' },
    { label: 'Nomor Induk Berusaha (NIB)', nilai: '0220109361089' },
    { label: 'NPWP Perusahaan', nilai: '94.265.244.7-405.000' },
    { label: 'Izin Mendirikan Bangunan (IMB)', nilai: '503.3/644.4/2717/PMB-DPTMPTSP/2020' },
  ];

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col min-w-0">
      <main className="w-full flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-on-surface dark:text-white font-semibold">Tentang Kami</span>
        </nav>

        {/* Header Artikel */}
        <header className="border-b border-outline-variant dark:border-slate-800 pb-5">
          <h1 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface dark:text-white leading-tight">
            Tentang Kami
          </h1>
        </header>

        {/* Konten Redaksional */}
        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-on-surface/90 dark:text-gray-300 leading-relaxed space-y-4">
          <p>
            Portal berita <strong>Jurnal Wave</strong> beroperasi di bawah naungan badan hukum pers resmi <strong>PT. Media Jurnal Sukabumi</strong>. Kami berdedikasi menyajikan jurnalisme yang independen, berimbang, dan mendalam seputar dinamika serta peristiwa di Kota dan Kabupaten Sukabumi.
          </p>
          <p>
            Berpegang teguh pada Kode Etik Jurnalistik dan Undang-Undang Pers, redaksi kami berkomitmen mengawal kepentingan masyarakat. Sebagai wujud nyata keterbukaan informasi dan advokasi publik, kami juga mengoperasikan <strong>Halo Jurnal</strong>—kanal interaktif aspirasi dan aduan warga untuk mendorong peningkatan fasilitas serta pelayanan publik di Sukabumi.
          </p>
          <div className="pt-1">
            <Link
              href="/halo-jurnal"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#c00015] hover:text-[#a00012] hover:underline transition-colors group"
            >
              <span>Jelajahi Portal Layanan Warga: Halo Jurnal</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>

        {/* Box Susunan Redaksi (Gaya Khas Media Pers Indonesia) */}
        <section className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 md:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-outline-variant dark:border-slate-800 pb-3 mb-4">
            Susunan Redaksi &amp; Manajemen
          </h2>
          <div className="divide-y divide-outline-variant/50 dark:divide-slate-800">
            {redaksi.map((item, idx) => (
              <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between text-sm gap-1 sm:gap-4">
                <span className="text-on-surface-variant dark:text-gray-400 font-medium sm:w-1/2">
                  {item.jabatan}
                </span>
                <span className="text-on-surface dark:text-white font-bold sm:w-1/2 sm:text-right">
                  {item.nama}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Box Legalitas Perusahaan */}
        <section className="bg-surface-container-low dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 md:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-outline-variant dark:border-slate-800 pb-3 mb-4">
            Legalitas Badan Hukum
          </h2>
          <div className="divide-y divide-outline-variant/50 dark:divide-slate-800">
            {legalitas.map((item, idx) => (
              <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between text-sm gap-1 sm:gap-4">
                <span className="text-on-surface-variant dark:text-gray-400 font-medium sm:w-1/2">
                  {item.label}
                </span>
                <span className="text-on-surface dark:text-white font-mono font-semibold sm:w-1/2 sm:text-right text-xs sm:text-sm break-all sm:break-normal">
                  {item.nilai}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Informasi Kantor & Rekening */}
        <section className="border-t border-outline-variant dark:border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div>
            <h3 className="font-bold text-on-surface dark:text-white mb-2">Kantor Redaksi</h3>
            <p className="text-on-surface-variant dark:text-gray-400 leading-relaxed">
              Perum Bukit Randu Asri, Blok K, Nomor 14, RT 07 RW 22 Kelurahan/Kecamatan Cibadak, Kabupaten Sukabumi, Jawa Barat.<br />
              <strong>Kode Pos: 43351</strong>
            </p>
            <div className="mt-3 space-y-1.5 text-on-surface-variant dark:text-gray-400">
              <p>
                Telepon / Kontak:{' '}
                <a href="tel:082111651470" className="font-bold text-on-surface dark:text-white hover:text-primary hover:underline">
                  082111651470
                </a>
                {' '}/{' '}
                <a href="tel:081572738335" className="font-bold text-on-surface dark:text-white hover:text-primary hover:underline">
                  081572738335
                </a>
              </p>
              <p>
                Email Redaksi:{' '}
                <a href="mailto:redaksi@jurnalsukabumi.com" className="font-bold text-primary hover:underline">
                  redaksi@jurnalsukabumi.com
                </a>
              </p>
              <p>
                Email Umum:{' '}
                <a href="mailto:jurnal.smi@gmail.com" className="font-bold text-primary hover:underline">
                  jurnal.smi@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-on-surface dark:text-white mb-2">Rekening Perusahaan</h3>
            <p className="text-on-surface-variant dark:text-gray-400 leading-relaxed mb-2">
              Transaksi resmi iklan dan advertorial hanya melalui rekening:
            </p>
            <div className="p-3 bg-surface-container-high dark:bg-slate-800 rounded-lg border border-outline-variant dark:border-slate-700">
              <div className="font-bold text-on-surface dark:text-white">Bank Jabar Banten (BJB), KCP Cibadak</div>
              <div className="font-mono text-sm font-bold text-primary mt-0.5">0122-4504-14100</div>
              <div className="text-xs text-on-surface-variant dark:text-gray-400 mt-0.5">a/n <strong>PT Media Jurnal Sukabumi</strong></div>
            </div>
            <p className="mt-2 text-xs text-on-surface-variant dark:text-gray-400">
              Email Iklan:{' '}
              <a href="mailto:iklan@jurnalsukabumi.com" className="font-bold text-primary hover:underline">
                iklan@jurnalsukabumi.com
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
