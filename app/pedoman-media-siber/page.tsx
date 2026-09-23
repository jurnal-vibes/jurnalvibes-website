import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export const metadata: Metadata = {
  title: 'Pedoman Media Siber',
  description: 'Pedoman pemberitaan media siber Jurnal Vibes sesuai Kode Etik Jurnalistik dan UU Pers.',
  openGraph: {
    title: 'Pedoman Media Siber | Jurnal Vibes',
    description: 'Pedoman pemberitaan media siber Jurnal Vibes sesuai Kode Etik Jurnalistik dan UU Pers.',
  },
};

export default function PedomanMediaSiberPage() {
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
          <span className="text-on-surface dark:text-white font-semibold">Pedoman Media Siber</span>
        </nav>

        {/* Header Dokumen */}
        <header className="border-b border-outline-variant dark:border-slate-800 pb-5">
          <span className="text-primary font-bold text-xs uppercase tracking-wider block mb-2">
            Standar Perusahaan &amp; Kode Etik Pers
          </span>
          <h1 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface dark:text-white leading-tight">
            Pedoman Pemberitaan Media Siber
          </h1>
          <p className="text-xs text-on-surface-variant dark:text-gray-400 mt-2">
            Disahkan oleh Dewan Pers bersama Komunitas Pers Indonesia di Jakarta, 3 Februari 2012
          </p>
        </header>

        {/* Konten Dokumen Regulasi Pers */}
        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-on-surface/90 dark:text-gray-300 leading-relaxed space-y-6">
          <div className="bg-surface-container-low dark:bg-slate-900 p-4 rounded-lg border-l-4 border-primary text-sm space-y-2">
            <p>
              Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB. Keberadaan media siber di Indonesia juga merupakan bagian dari kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers.
            </p>
            <p>
              Media siber memiliki karakter khusus sehingga memerlukan pedoman agar pengelolaannya dapat dilaksanakan secara profesional, memenuhi fungsi, hak, dan kewajibannya sesuai Undang-Undang Nomor 40 Tahun 1999 tentang Pers dan Kode Etik Jurnalistik. Untuk itu Dewan Pers bersama organisasi pers, pengelola media siber, dan masyarakat menyusun Pedoman Pemberitaan Media Siber sebagai berikut:
            </p>
          </div>

          <div className="space-y-6 pt-2">
            <section>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
                1. Ruang Lingkup
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                <li>
                  <strong>Media Siber</strong> adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pers dan Standar Perusahaan Pers yang ditetapkan Dewan Pers.
                </li>
                <li>
                  <strong>Isi Buatan Pengguna (User Generated Content)</strong> adalah segala isi yang dibuat dan atau dipublikasikan oleh pengguna media siber, antara lain, artikel, gambar, komentar, suara, video dan berbagai bentuk unggahan yang melekat pada media siber, seperti blog, forum, komentar pembaca atau pemirsa, dan bentuk lain.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
                2. Verifikasi dan Keberimbangan Berita
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                <li>Pada prinsipnya setiap berita harus melalui verifikasi.</li>
                <li>Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip akurasi dan keberimbangan.</li>
                <li>
                  Ketentuan dalam butir (1) di atas dikecualikan, dengan syarat:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-on-surface-variant dark:text-gray-400">
                    <li>Berita benar-benar mengandung kepentingan publik yang bersifat mendesak;</li>
                    <li>Sumber berita yang pertama adalah sumber yang jelas disebutkan identitasnya, kredibel dan kompeten;</li>
                    <li>Subyek berita yang harus dikonfirmasi tidak diketahui keberadaannya dan atau tidak dapat diwawancarai;</li>
                    <li>Media memberikan penjelasan kepada pembaca bahwa berita tersebut masih memerlukan verifikasi lebih lanjut yang diupayakan dalam waktu secepatnya. Penjelasan dimuat pada bagian akhir dari berita yang sama, di dalam kurung dan menggunakan huruf miring.</li>
                  </ul>
                </li>
                <li>Setelah memuat berita sesuai dengan butir (3), media wajib meneruskan upaya verifikasi, dan setelah verifikasi didapatkan, hasil verifikasi dicantumkan pada berita pemutakhiran (update) dengan tautan pada berita yang belum terverifikasi.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
                3. Isi Buatan Pengguna (User Generated Content)
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                <li>Media siber wajib mencantumkan syarat dan ketentuan mengenai Isi Buatan Pengguna yang tidak bertentangan dengan Undang-Undang No. 40 tahun 1999 tentang Pers dan Kode Etik Jurnalistik, yang ditempatkan secara terang dan jelas.</li>
                <li>Media siber mewajibkan setiap pengguna untuk melakukan registrasi keanggotaan dan melakukan proses log-in terlebih dahulu untuk dapat mempublikasikan semua bentuk Isi Buatan Pengguna.</li>
                <li>Dalam registrasi tersebut, media siber mewajibkan pengguna memberi persetujuan tertulis bahwa Isi Buatan Pengguna yang dipublikasikan tidak memuat fitnah, hoaks, sadis, pornografi, ujaran kebencian SARA, maupun diskriminasi.</li>
                <li>Media siber memiliki kewenangan mutlak untuk mengedit atau menghapus Isi Buatan Pengguna yang melanggar ketentuan.</li>
                <li>Media siber wajib menyediakan mekanisme pengaduan Isi Buatan Pengguna yang mudah diakses pengguna.</li>
                <li>Media siber wajib menyunting, menghapus, dan melakukan tindakan koreksi setiap Isi Buatan Pengguna yang dilaporkan dan melanggar ketentuan sesegera mungkin selambat-lambatnya 2 x 24 jam setelah pengaduan diterima.</li>
                <li>Media siber yang telah memenuhi ketentuan di atas tidak dibebani tanggung jawab atas masalah yang ditimbulkan akibat pemuatan isi yang melanggar ketentuan.</li>
                <li>Media siber bertanggung jawab atas Isi Buatan Pengguna yang dilaporkan bila tidak mengambil tindakan koreksi setelah batas waktu 2 x 24 jam.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
                4. Ralat, Koreksi, dan Hak Jawab
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                <li>Ralat, koreksi, dan hak jawab mengacu pada Undang-Undang Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab yang ditetapkan Dewan Pers.</li>
                <li>Ralat, koreksi dan atau hak jawab wajib ditautkan pada berita yang diralat, dikoreksi atau yang diberi hak jawab.</li>
                <li>Di setiap berita ralat, koreksi, dan hak jawab wajib dicantumkan waktu pemuatan ralat, koreksi, dan atau hak jawab tersebut.</li>
                <li>Bila suatu berita media siber tertentu disebarluaskan media siber lain, maka koreksi berita yang dilakukan oleh sebuah media siber juga harus dilakukan oleh media siber lain yang mengutip berita tersebut.</li>
                <li>Media yang menyebarluaskan berita dari sebuah media siber dan tidak melakukan koreksi bertanggung jawab penuh atas semua akibat hukum dari berita yang tidak dikoreksinya itu.</li>
                <li>Sesuai dengan Undang-Undang Pers, media siber yang tidak melayani hak jawab dapat dijatuhi sanksi hukum pidana denda paling banyak Rp500.000.000 (Lima ratus juta rupiah).</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
                5. Pencabutan Berita
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                <li>Berita yang sudah dipublikasikan tidak dapat dicabut karena alasan penyensoran dari pihak luar redaksi, kecuali terkait masalah SARA, kesusilaan, masa depan anak, pengalaman traumatik korban atau berdasarkan pertimbangan khusus lain yang ditetapkan Dewan Pers.</li>
                <li>Media siber lain wajib mengikuti pencabutan kutipan berita dari media asal yang telah dicabut.</li>
                <li>Pencabutan berita wajib disertai dengan alasan pencabutan dan diumumkan kepada publik.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
                6. Iklan
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                <li>Media siber wajib membedakan dengan tegas antara produk berita dan iklan.</li>
                <li>Setiap berita/artikel/isi yang merupakan iklan dan atau isi berbayar wajib mencantumkan keterangan &quot;advertorial&quot;, &quot;iklan&quot;, &quot;ads&quot;, &quot;sponsored&quot;, atau kata lain yang menjelaskan bahwa berita/artikel/isi tersebut adalah iklan.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
                7. Hak Cipta
              </h2>
              <p className="text-sm">
                Media siber wajib menghormati hak cipta sebagaimana diatur dalam peraturan perundang-undangan yang berlaku.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
                8. Pencantuman Pedoman
              </h2>
              <p className="text-sm">
                Media siber wajib mencantumkan Pedoman Pemberitaan Media Siber ini di medianya secara terang dan jelas.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">
                9. Sengketa
              </h2>
              <p className="text-sm">
                Penilaian akhir atas sengketa mengenai pelaksanaan Pedoman Pemberitaan Media Siber ini diselesaikan oleh Dewan Pers.
              </p>
            </section>
          </div>

          <div className="border-t border-outline-variant dark:border-slate-800 pt-6 mt-8 text-xs text-on-surface-variant dark:text-gray-400">
            <p className="font-semibold text-on-surface dark:text-white">Jakarta, 3 Februari 2012</p>
            <p className="italic mt-1">
              (Pedoman ini ditandatangani oleh Dewan Pers dan komunitas pers di Jakarta, 3 Februari 2012).
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
