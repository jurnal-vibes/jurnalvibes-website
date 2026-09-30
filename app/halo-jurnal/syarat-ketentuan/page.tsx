import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan resmi penggunaan platform aspirasi dan pengaduan publik Halo Jurnal Sukabumi.',
  openGraph: {
    title: 'Syarat & Ketentuan | Halo Jurnal',
    description: 'Syarat dan ketentuan resmi penggunaan platform aspirasi dan pengaduan publik Halo Jurnal Sukabumi.',
  },
}

export default function HaloJurnalSyaratKetentuanPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 md:pb-16 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
        <Link href="/halo-jurnal" className="hover:text-primary transition-colors">
          Halo Jurnal
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-on-surface dark:text-white font-semibold">Syarat &amp; Ketentuan</span>
      </nav>

      {/* Header Dokumen */}
      <header className="border-b border-outline-variant dark:border-slate-800 pb-5">
        <h1 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface dark:text-white leading-tight">
          Syarat &amp; Ketentuan (Terms of Service)
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 mt-2">
          Ketentuan resmi partisipasi warga dalam penyampaian aspirasi dan aduan fasilitas publik di Kota &amp; Kabupaten Sukabumi.
        </p>
      </header>

      {/* Konten Syarat & Ketentuan */}
      <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-on-surface/90 dark:text-gray-300 leading-relaxed space-y-6">
        <p>
          Selamat datang di platform <strong>Halo Jurnal</strong>, sebuah inisiatif advokasi publik independen yang dikelola oleh <strong>PT Media Jurnal Sukabumi</strong>. Dengan mengakses, mendaftar, atau menyampaikan laporan pengaduan melalui platform ini, Anda menyetujui untuk terikat dengan seluruh syarat dan ketentuan berikut.
        </p>

        <section className="pt-1">
          <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
            1. Ketentuan Umum &amp; Keabsahan Pelapor
          </h2>
          <p>
            Platform Halo Jurnal terbuka bagi seluruh warga Kota dan Kabupaten Sukabumi yang ingin menyampaikan aspirasi, keluhan layanan masyarakat, atau kerusakan fasilitas umum. Untuk menjamin akuntabilitas dan mencegah laporan fiktif, setiap pengguna wajib melengkapi data identitas yang valid.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-secondary dark:text-gray-400 mt-3">
            <li>Pengguna bertanggung jawab penuh atas kebenaran data dan informasi yang disampaikan.</li>
            <li>Identitas diri (KTP) diverifikasi secara internal dan dilindungi kerahasiaannya sesuai ketentuan perlindungan data pribadi.</li>
            <li>Satu identitas resmi hanya diperbolehkan memiliki satu akun aktif di portal Halo Jurnal.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
            2. Larangan Konten &amp; Etika Pengaduan
          </h2>
          <p>
            Halo Jurnal menjunjung tinggi asas keadilan, praduga tak bersalah, dan fakta objektif di lapangan. Setiap pengguna dilarang keras menyampaikan laporan yang memuat:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-secondary dark:text-gray-400 mt-3">
            <li>Unsur fitnah, pencemaran nama baik, atau ujaran kebencian berbasis suku, agama, ras, dan antargolongan (SARA).</li>
            <li>Informasi palsu, rekayasa bukti kejadian, manipulasi foto/video, atau hoaks.</li>
            <li>Penyebaran data pribadi pihak ketiga tanpa persetujuan sah (doxing).</li>
            <li>Konten kekerasan eksplisit, pornografi, ancaman fisik, atau muatan yang melanggar hukum Republik Indonesia.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
            3. Alur Moderasi &amp; Penayangan Laporan
          </h2>
          <p>
            Seluruh laporan yang masuk ke sistem akan melalui tahap peninjauan awal oleh tim admin dan redaksi sebelum statusnya ditingkatkan atau diteruskan ke instansi berwenang:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-secondary dark:text-gray-400 mt-3">
            <li><strong>Laporan Publik:</strong> Laporan yang disetujui untuk tayang di Feed Publik hanya menampilkan deskripsi peristiwa, dokumentasi foto, dan lokasi, tanpa menampilkan identitas sensitif pelapor.</li>
            <li><strong>Hak Moderasi Redaksi:</strong> Tim Halo Jurnal berhak menolak, meminta kelengkapan bukti tambahan, menyunting redaksi tanpa mengubah makna fakta, atau menutup laporan yang tidak memenuhi standar kelayakan.</li>
            <li><strong>Tindak Lanjut &amp; Klarifikasi:</strong> Tim kami bekerja sama dengan instansi terkait dan dinas berwenang untuk melakukan kroscek lapangan serta menghadirkan tanggapan resmi.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
            4. Tanggung Jawab Hukum
          </h2>
          <p>
            Pengguna memahami bahwa segala tindakan yang secara sengaja menyalahgunakan platform untuk tujuan pemerasan, rekayasa perkara, atau penyebaran berita bohong yang merugikan pihak lain dapat ditindaklanjuti sesuai ketentuan peraturan perundang-undangan (termasuk UU ITE dan KUHP).
          </p>
        </section>

        <section className="border-t border-outline-variant dark:border-slate-800 pt-5 text-xs text-secondary dark:text-gray-400">
          <p>
            Ketentuan ini berlaku sejak tanggal ditetapkan dan dapat diperbarui sewaktu-waktu demi meningkatkan kenyamanan serta keamanan seluruh pengguna platform Halo Jurnal Sukabumi.
          </p>
        </section>
      </article>
    </div>
  )
}
