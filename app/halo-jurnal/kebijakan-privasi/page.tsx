import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi perlindungan data pengguna dan kerahasiaan identitas pelapor di platform Halo Jurnal Sukabumi.',
  openGraph: {
    title: 'Kebijakan Privasi | Halo Jurnal',
    description: 'Kebijakan privasi perlindungan data pengguna dan kerahasiaan identitas pelapor di platform Halo Jurnal Sukabumi.',
  },
}

export default function HaloJurnalKebijakanPrivasiPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 md:pb-16 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
        <Link href="/halo-jurnal" className="hover:text-primary transition-colors">
          Halo Jurnal
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-on-surface dark:text-white font-semibold">Kebijakan Privasi</span>
      </nav>

      {/* Header Dokumen */}
      <header className="border-b border-outline-variant dark:border-slate-800 pb-5">
        <h1 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface dark:text-white leading-tight">
          Kebijakan Privasi (Privacy Policy)
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 mt-2">
          Komitmen resmi PT Media Jurnal Sukabumi dalam menjaga kerahasiaan data pribadi seluruh pelapor di Halo Jurnal.
        </p>
      </header>

      {/* Konten Kebijakan Privasi */}
      <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-on-surface/90 dark:text-gray-300 leading-relaxed space-y-6">
        <p>
          Di <strong>Halo Jurnal</strong> yang dikelola secara independen oleh <strong>PT Media Jurnal Sukabumi</strong>, privasi dan keselamatan para pelapor adalah prioritas mutlak kami. Dokumen Kebijakan Privasi ini menguraikan jenis informasi yang kami kumpulkan, bagaimana informasi tersebut digunakan, dan komitmen kami dalam melindungi identitas Anda.
        </p>

        <section className="pt-1">
          <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
            1. Informasi yang Kami Kumpulkan
          </h2>
          <p>
            Untuk memastikan setiap pengaduan sah dan dapat ditindaklanjuti secara bertanggung jawab, sistem kami mengumpulkan sejumlah informasi pengguna:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-secondary dark:text-gray-400 mt-3">
            <li><strong>Data Akun:</strong> Nama lengkap, alamat email aktif, dan nomor WhatsApp untuk keperluan komunikasi tindak lanjut aduan.</li>
            <li><strong>Verifikasi Identitas (KTP):</strong> Unggahan foto kartu identitas (KTP) yang murni digunakan sebagai validasi internal tim verifikator agar platform terhindar dari akun palsu atau laporan manipulatif.</li>
            <li><strong>Data Laporan Publik:</strong> Judul aduan, uraian kejadian, dokumentasi foto/video di lokasi, dan titik koordinat peta yang Anda tandai.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
            2. Kerahasiaan Dokumen KTP &amp; Identitas Sensitif
          </h2>
          <div className="bg-primary/5 dark:bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg text-sm text-on-surface dark:text-gray-300">
            <strong>Jaminan Keamanan:</strong> Foto KTP dan nomor identitas pribadi Anda <strong>TIDAK PERNAH</strong> dipublikasikan ke Feed Publik, tidak dibagikan kepada khalayak umum, dan tidak diperjualbelikan kepada pihak ketiga manapun. Data tersebut disimpan dengan enkripsi khusus untuk kebutuhan validasi internal tim redaksi.
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
            3. Penayangan di Feed Publik &amp; Opsi Anonim
          </h2>
          <p>
            Ketika Anda memilih agar laporan Anda dapat dibaca publik di laman <em>Feed Laporan Warga</em>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-secondary dark:text-gray-400 mt-3">
            <li>Hanya data substansi laporan (judul masalah, kategori, foto bukti fasilitas, dan wilayah kecamatan) yang dapat dilihat oleh pengunjung lain.</li>
            <li>Anda dapat memilih opsi pelaporan secara anonim agar nama lengkap Anda disamarkan saat laporan tayang ke publik.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
            4. Keamanan Sistem &amp; Enkripsi Data
          </h2>
          <p>
            Kami menerapkan protokol keamanan standar industri (HTTPS / SSL dan enkripsi database) untuk mencegah akses tidak sah, pengubahan data, atau pengungkapan informasi tanpa izin. Seluruh interaksi obrolan klarifikasi antara pelapor dan admin redaksi dienkripsi demi kenyamanan bersama.
          </p>
        </section>

        <section className="border-t border-outline-variant dark:border-slate-800 pt-5 text-xs text-secondary dark:text-gray-400">
          <p>
            Jika Anda memiliki pertanyaan mengenai perlindungan privasi data Anda, silakan hubungi tim kami melalui laman{' '}
            <Link href="/halo-jurnal/hubungi-kami" className="text-primary font-semibold hover:underline">
              Hubungi Kami
            </Link>
            .
          </p>
        </section>
      </article>
    </div>
  )
}
