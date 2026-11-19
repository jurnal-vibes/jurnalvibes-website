import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan resmi penggunaan platform aspirasi dan pengaduan publik Hallo Jurnal Sukabumi.',
  openGraph: {
    title: 'Syarat & Ketentuan | Hallo Jurnal',
    description: 'Syarat dan ketentuan resmi penggunaan platform aspirasi dan pengaduan publik Hallo Jurnal Sukabumi.',
  },
}

export default function HaloJurnalSyaratKetentuanPage() {
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
          Syarat &amp; Ketentuan
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Ketentuan partisipasi warga dalam penyampaian aspirasi dan aduan publik di Kota &amp; Kabupaten Sukabumi.
        </p>
      </div>

      {/* Kartu Konten Utama */}
      <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xs space-y-7 leading-relaxed text-xs sm:text-sm text-on-surface/90">
        <p className="text-secondary leading-relaxed">
          Selamat datang di platform <strong className="text-on-surface font-semibold">Hallo Jurnal</strong>, sebuah inisiatif advokasi publik independen yang dikelola oleh <strong className="text-on-surface font-semibold">PT Media Jurnal Sukabumi</strong>. Dengan mengakses, mendaftar, atau menyampaikan laporan pengaduan melalui platform ini, Anda menyetujui untuk terikat dengan seluruh syarat dan ketentuan berikut.
        </p>

        {/* 1. Ketentuan Umum */}
        <section className="space-y-2.5 pt-1 border-t border-outline-variant/50 pt-5">
          <h2 className="font-heading font-bold text-sm sm:text-base text-primary tracking-tight">
            1. Ketentuan Umum &amp; Keabsahan Pelapor
          </h2>
          <p className="text-secondary leading-relaxed">
            Platform Hallo Jurnal terbuka bagi seluruh warga Kota dan Kabupaten Sukabumi yang ingin menyampaikan aspirasi, keluhan layanan masyarakat, atau kerusakan fasilitas umum. Untuk menjamin akuntabilitas dan mencegah laporan fiktif:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-secondary">
            <li>Pengguna bertanggung jawab penuh atas kebenaran data dan informasi kejadian yang disampaikan.</li>
            <li>Identitas akun warga diverifikasi secara digital dan dilindungi kerahasiaannya sesuai kebijakan perlindungan data pribadi.</li>
            <li>Setiap warga mendaftar menggunakan nomor WhatsApp aktif yang terverifikasi melalui kode OTP di portal Hallo Jurnal.</li>
          </ul>
        </section>

        {/* 2. Larangan Konten */}
        <section className="space-y-2.5 border-t border-outline-variant/50 pt-5">
          <h2 className="font-heading font-bold text-sm sm:text-base text-primary tracking-tight">
            2. Larangan Konten &amp; Etika Pengaduan
          </h2>
          <p className="text-secondary leading-relaxed">
            Hallo Jurnal menjunjung tinggi asas keadilan, praduga tak bersalah, dan fakta objektif di lapangan. Setiap pengguna dilarang keras menyampaikan laporan yang memuat:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-secondary">
            <li>Unsur fitnah, pencemaran nama baik, atau ujaran kebencian berbasis suku, agama, ras, dan antargolongan (SARA).</li>
            <li>Informasi palsu, rekayasa bukti kejadian, manipulasi foto/video, atau berita bohong (hoaks).</li>
            <li>Penyebaran data pribadi sensitif pihak ketiga tanpa izin sah (doxing).</li>
            <li>Konten kekerasan eksplisit, pornografi, ancaman fisik, atau muatan yang melanggar hukum Republik Indonesia.</li>
          </ul>
        </section>

        {/* 3. Alur Moderasi */}
        <section className="space-y-2.5 border-t border-outline-variant/50 pt-5">
          <h2 className="font-heading font-bold text-sm sm:text-base text-primary tracking-tight">
            3. Alur Moderasi &amp; Penayangan Laporan
          </h2>
          <p className="text-secondary leading-relaxed">
            Seluruh laporan yang masuk ke sistem akan melalui tahap peninjauan awal oleh tim admin dan redaksi sebelum statusnya ditingkatkan atau diteruskan ke instansi berwenang:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-secondary">
            <li><strong className="text-on-surface">Laporan Publik:</strong> Laporan yang disetujui untuk tayang di Feed Publik hanya menampilkan deskripsi peristiwa, dokumentasi foto, dan lokasi, tanpa menampilkan nomor kontak sensitif pelapor.</li>
            <li><strong className="text-on-surface">Hak Moderasi Redaksi:</strong> Tim Hallo Jurnal berhak menolak, meminta kelengkapan bukti tambahan, menyunting redaksi tanpa mengubah makna fakta, atau menutup laporan yang tidak memenuhi standar kelayakan.</li>
            <li><strong className="text-on-surface">Tindak Lanjut &amp; Klarifikasi:</strong> Tim kami berkoordinasi dengan instansi terkait dan dinas berwenang untuk melakukan kroscek lapangan serta menghadirkan tanggapan resmi.</li>
          </ul>
        </section>

        {/* 4. Tanggung Jawab Hukum */}
        <section className="space-y-2.5 border-t border-outline-variant/50 pt-5">
          <h2 className="font-heading font-bold text-sm sm:text-base text-primary tracking-tight">
            4. Tanggung Jawab Hukum
          </h2>
          <p className="text-secondary leading-relaxed">
            Pengguna memahami bahwa segala tindakan yang secara sengaja menyalahgunakan platform untuk tujuan pemerasan, rekayasa perkara, atau penyebaran berita bohong yang merugikan pihak lain dapat ditindaklanjuti sesuai ketentuan peraturan perundang-undangan Republik Indonesia (termasuk UU ITE dan KUHP).
          </p>
        </section>

        <section className="border-t border-outline-variant/50 pt-5 text-xs text-secondary">
          <p>
            Ketentuan ini berlaku sejak tanggal ditetapkan dan dapat diperbarui sewaktu-waktu demi meningkatkan kenyamanan serta keamanan seluruh pengguna platform Hallo Jurnal Sukabumi.
          </p>
        </section>
      </div>
    </div>
  )
}
