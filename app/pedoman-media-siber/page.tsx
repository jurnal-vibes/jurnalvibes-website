import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pedoman Media Siber',
  description: 'Pedoman pemberitaan media siber Jurnal Wave sesuai Kode Etik Jurnalistik dan UU Pers.',
  openGraph: {
    title: 'Pedoman Media Siber | Jurnal Wave',
    description: 'Pedoman pemberitaan media siber Jurnal Wave sesuai Kode Etik Jurnalistik dan UU Pers.',
  },
};

export default function PedomanMediaSiberPage() {
  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col min-w-0">
      <main className="w-full flex flex-col gap-6">
        {/* Breadcrumb Ringkas */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-on-surface dark:text-white font-semibold">Pedoman Media Siber</span>
        </nav>

        {/* Header Dokumen */}
        <header className="border-b border-outline-variant dark:border-slate-800 pb-3 sm:pb-4">
          <h1 className="font-headline-xl text-lg sm:text-xl md:text-2xl font-bold text-on-surface dark:text-white leading-tight">
            Pedoman Pemberitaan Media Siber
          </h1>
          <p className="text-xs text-on-surface-variant dark:text-gray-400 mt-1.5">
            Disahkan oleh Dewan Pers bersama Komunitas Pers Indonesia di Jakarta, 3 Februari 2012.
          </p>
        </header>

        {/* Konten Dokumen Regulasi Pers */}
        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-on-surface/90 dark:text-gray-300 leading-relaxed space-y-6">
          <div className="bg-surface-container-low dark:bg-slate-900 p-4 rounded-xl border-l-4 border-primary text-xs sm:text-sm space-y-2">
            <p>
              Kemerdekaan berpendapat, berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB. Media siber memiliki karakter khusus sehingga memerlukan pedoman agar pengelolaannya terlaksana secara profesional sesuai Undang-Undang Nomor 40 Tahun 1999 tentang Pers dan Kode Etik Jurnalistik.
            </p>
          </div>

          <div className="space-y-6 divide-y divide-outline-variant/40 dark:divide-slate-800">
            <section className="pt-2">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                1. Ruang Lingkup
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-on-surface-variant dark:text-gray-400">
                <li>
                  <strong className="text-on-surface dark:text-white">Media Siber</strong> adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pers dan Standar Perusahaan Pers yang ditetapkan Dewan Pers.
                </li>
                <li>
                  <strong className="text-on-surface dark:text-white">Isi Buatan Pengguna (User Generated Content)</strong> adalah segala isi yang dibuat dan atau dipublikasikan oleh pengguna media siber, antara lain artikel, gambar, komentar, suara, video, dan berbagai bentuk unggahan yang melekat pada media siber.
                </li>
              </ol>
            </section>

            <section className="pt-5">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                2. Verifikasi dan Keberimbangan Berita
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-on-surface-variant dark:text-gray-400">
                <li>Pada prinsipnya setiap berita harus melalui proses verifikasi.</li>
                <li>Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip akurasi dan keberimbangan.</li>
                <li>
                  Ketentuan verifikasi serentak dapat dikecualikan apabila mengandung kepentingan publik mendesak, sumber berita kredibel dan kompeten, subjek konfirmasi belum diketahui keberadaannya, serta diberi keterangan bahwa berita masih memerlukan verifikasi lanjutan.
                </li>
              </ol>
            </section>

            <section className="pt-5">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                3. Isi Buatan Pengguna (User Generated Content)
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-on-surface-variant dark:text-gray-400">
                <li>Media siber wajib mencantumkan syarat dan ketentuan mengenai Isi Buatan Pengguna yang tidak bertentangan dengan UU Pers dan Kode Etik Jurnalistik.</li>
                <li>Pengguna wajib memberi persetujuan bahwa isi yang diunggah bebas dari fitnah, hoaks, pornografi, dan ujaran kebencian SARA.</li>
                <li>Media siber berhak mengedit atau menghapus isi yang melanggar ketentuan, serta menyediakan mekanisme pengaduan yang mudah diakses.</li>
              </ol>
            </section>

            <section className="pt-5">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                4. Ralat, Koreksi, dan Hak Jawab
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-on-surface-variant dark:text-gray-400">
                <li>Ralat, koreksi, dan hak jawab mengacu pada UU Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab Dewan Pers.</li>
                <li>Ralat, koreksi, dan atau hak jawab wajib ditautkan pada berita yang diralat, dikoreksi, atau yang diberi hak jawab.</li>
                <li>Di setiap berita ralat dicantumkan waktu pemuatan ralat atau hak jawab tersebut secara transparan.</li>
              </ol>
            </section>

            <section className="pt-5">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                5. Pencabutan Berita
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-on-surface-variant dark:text-gray-400">
                <li>Berita yang sudah dipublikasikan tidak dapat dicabut karena sensor pihak luar, kecuali terkait masalah SARA, kesusilaan, masa depan anak, traumatik korban, atau pertimbangan khusus Dewan Pers.</li>
                <li>Pencabutan berita wajib disertai alasan resmi dan diumumkan secara terbuka kepada publik.</li>
              </ol>
            </section>

            <section className="pt-5">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                6. Iklan dan Advertorial
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-on-surface-variant dark:text-gray-400">
                <li>Media siber wajib membedakan dengan tegas antara produk berita jurnalistik dan konten iklan/promosi.</li>
                <li>Setiap konten berbayar wajib mencantumkan keterangan jelas seperti &quot;advertorial&quot;, &quot;iklan&quot;, &quot;ads&quot;, atau &quot;sponsored&quot;.</li>
              </ol>
            </section>

            <section className="pt-5">
              <h2 className="text-base font-bold text-on-surface dark:text-white mb-2">
                7. Hak Cipta &amp; Sengketa
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 leading-relaxed">
                Media siber wajib menghormati hak cipta sebagaimana diatur dalam peraturan perundang-undangan. Penilaian akhir atas sengketa mengenai pelaksanaan Pedoman Pemberitaan Media Siber diselesaikan oleh <strong>Dewan Pers</strong>.
              </p>
            </section>
          </div>

          <div className="border-t border-outline-variant/60 dark:border-slate-800 pt-5 text-xs text-on-surface-variant dark:text-gray-400">
            <p className="font-semibold text-on-surface dark:text-white">Dewan Pers Indonesia</p>
            <p className="mt-0.5">
              Pedoman ini ditandatangani oleh Dewan Pers dan komunitas pers di Jakarta, 3 Februari 2012.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
