import { ShieldAlert, ShieldCheck, Lock } from 'lucide-react'

export const metadata = {
  title: 'Kebijakan Privasi - Halo Jurnal',
  description: 'Kebijakan privasi perlindungan data pengguna platform Halo Jurnal Sukabumi.',
}

export default function HaloJurnalKebijakanPrivasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-6 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight mb-2">
          Kebijakan Privasi Halo Jurnal
        </h1>
        <p className="text-xs text-secondary">
          Terakhir diperbarui: 2026
        </p>
      </div>

      <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-on-surface text-xs sm:text-sm leading-relaxed">
        <p>
          Selamat datang di <strong>Halo Jurnal</strong>. Kami menghargai privasi Anda dan berkomitmen penuh untuk melindungi data pribadi yang Anda bagikan saat menggunakan portal aspirasi masyarakat kami.
        </p>

        <div className="bg-surface-container-low border-l-4 border-primary p-4 rounded-r-xl text-secondary">
          Halo Jurnal adalah inisiatif digital dari <strong>PT Media Jurnal Sukabumi</strong> untuk mewujudkan transparansi dan tata kelola pelayanan publik yang akuntabel.
        </div>

        <div>
          <h2 className="font-heading font-bold text-base text-on-surface mb-2">1. Data yang Kami Kumpulkan</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-secondary">
            <li><strong>Informasi Kontak:</strong> Nama lengkap, alamat email aktif, dan nomor WhatsApp.</li>
            <li><strong>Verifikasi Identitas:</strong> Foto KTP untuk mencegah laporan fiktif atau bot.</li>
            <li><strong>Data Laporan:</strong> Deskripsi laporan, titik koordinat peta lokasi, dan bukti foto/video kejadian.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading font-bold text-base text-on-surface mb-2">2. Keamanan & Kerahasiaan KTP</h2>
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface">
              <strong>PENTING:</strong> Foto KTP Anda <strong>TIDAK PERNAH</strong> dipublikasikan ke Feed Publik atau pihak luar. Foto KTP murni dan secara eksklusif hanya digunakan untuk validasi internal tim redaksi dan admin kami.
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-heading font-bold text-base text-on-surface mb-2">3. Publikasi di Feed Publik</h2>
          <p className="text-secondary">
            Laporan yang Anda setujui sebagai laporan publik akan menampilkan judul, deskripsi, lokasi kejadian, dan bukti foto tanpa mengekspos data pribadi sensitif Anda.
          </p>
        </div>
      </div>
    </div>
  )
}
