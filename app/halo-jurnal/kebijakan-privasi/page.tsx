import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi perlindungan data pengguna dan kerahasiaan identitas pelapor di platform Hallo Jurnal Sukabumi.',
  openGraph: {
    title: 'Kebijakan Privasi | Hallo Jurnal',
    description: 'Kebijakan privasi perlindungan data pengguna dan kerahasiaan identitas pelapor di platform Hallo Jurnal Sukabumi.',
  },
}

export default function HaloJurnalKebijakanPrivasiPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-24 md:pb-16 space-y-6">
      {/* Navigasi Kembali */}
      <div className="flex items-center justify-start">
        <Link
          href="/halo-jurnal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda Hallo Jurnal</span>
        </Link>
      </div>

      {/* Header Dokumen (Simpel, Tanpa Ikon Berlebih) */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight leading-tight">
          Kebijakan Privasi
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Komitmen PT Media Jurnal Sukabumi dalam menjaga kerahasiaan data pribadi seluruh warga dan pelapor.
        </p>
      </div>

      {/* Kartu Konten Utama */}
      <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xs space-y-7 leading-relaxed text-xs sm:text-sm text-on-surface/90">
        <p className="text-secondary leading-relaxed">
          Di <strong className="text-on-surface font-semibold">Hallo Jurnal</strong> yang dikelola secara independen oleh <strong className="text-on-surface font-semibold">PT Media Jurnal Sukabumi</strong>, privasi dan keselamatan para pelapor adalah prioritas utama kami. Dokumen Kebijakan Privasi ini menguraikan jenis informasi yang kami kumpulkan, bagaimana informasi tersebut digunakan, dan komitmen kami dalam melindungi identitas Anda.
        </p>

        {/* 1. Informasi yang Kami Kumpulkan */}
        <section className="space-y-2.5 pt-1 border-t border-outline-variant/50 pt-5">
          <h2 className="font-heading font-bold text-sm sm:text-base text-primary tracking-tight">
            1. Informasi yang Kami Kumpulkan
          </h2>
          <p className="text-secondary leading-relaxed">
            Untuk memastikan setiap pengaduan sah dan dapat ditindaklanjuti secara bertanggung jawab, sistem kami mengumpulkan informasi pengguna:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-secondary">
            <li><strong className="text-on-surface">Data Akun Warga:</strong> Nama lengkap dan nomor WhatsApp aktif untuk keperluan verifikasi kode OTP serta komunikasi klarifikasi aduan.</li>
            <li><strong className="text-on-surface">Integritas Keamanan:</strong> Autentikasi nomor WhatsApp digunakan untuk menjaga platform dari akun spam fiktif atau laporan manipulatif.</li>
            <li><strong className="text-on-surface">Data Laporan Publik:</strong> Judul aduan, uraian kejadian, bukti dokumentasi foto/video di lokasi, dan wilayah kecamatan kejadian.</li>
          </ul>
        </section>

        {/* 2. Kerahasiaan Data Akun */}
        <section className="space-y-2.5 border-t border-outline-variant/50 pt-5">
          <h2 className="font-heading font-bold text-sm sm:text-base text-primary tracking-tight">
            2. Kerahasiaan Data Akun &amp; Identitas Pribadi
          </h2>
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-xs sm:text-sm text-secondary leading-relaxed">
            <strong className="text-primary font-semibold block mb-1">Jaminan Perlindungan:</strong>
            Nomor WhatsApp dan identitas pribadi Anda <strong className="text-on-surface">TIDAK PERNAH</strong> dipublikasikan ke Feed Publik, tidak dibagikan kepada khalayak umum, dan tidak diperjualbelikan kepada pihak manapun. Anda juga memiliki opsi pelaporan anonim untuk melindungi kerahasiaan identitas Anda secara penuh.
          </div>
        </section>

        {/* 3. Penayangan di Feed Publik */}
        <section className="space-y-2.5 border-t border-outline-variant/50 pt-5">
          <h2 className="font-heading font-bold text-sm sm:text-base text-primary tracking-tight">
            3. Penayangan di Feed Publik &amp; Opsi Anonim
          </h2>
          <p className="text-secondary leading-relaxed">
            Ketika laporan Anda disetujui untuk dapat dibaca publik di laman Feed Aduan Warga:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-secondary">
            <li>Hanya data substansi laporan (judul masalah, rincian cerita, foto bukti fasilitas, dan wilayah kecamatan) yang dapat dilihat oleh pengunjung publik.</li>
            <li>Identitas nama lengkap dapat disamarkan sebagai anonim (Warga Sukabumi) sesuai pilihan Anda saat mengirimkan aduan.</li>
          </ul>
        </section>

        {/* 4. Keamanan Sistem & Enkripsi Data */}
        <section className="space-y-2.5 border-t border-outline-variant/50 pt-5">
          <h2 className="font-heading font-bold text-sm sm:text-base text-primary tracking-tight">
            4. Keamanan Sistem &amp; Enkripsi Data
          </h2>
          <p className="text-secondary leading-relaxed">
            Kami menerapkan protokol keamanan standar industri (koneksi terenkripsi SSL/HTTPS dan database aman) untuk mencegah akses tidak sah, pengubahan data, atau kebocoran informasi. Seluruh riwayat obrolan dan koordinasi laporan bersama admin redaksi dilindungi demi kenyamanan pelapor.
          </p>
        </section>

        <section className="border-t border-outline-variant/50 pt-5 text-xs text-secondary">
          <p>
            Jika Anda memiliki pertanyaan mengenai perlindungan privasi data Anda, silakan hubungi tim kami melalui laman{' '}
            <Link href="/halo-jurnal/hubungi-kami" className="text-primary font-semibold hover:underline">
              Kontak Kami
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
