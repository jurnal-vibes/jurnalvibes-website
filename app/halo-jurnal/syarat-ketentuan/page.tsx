export const metadata = {
  title: 'Syarat & Ketentuan - Halo Jurnal',
  description: 'Syarat dan ketentuan penggunaan layanan Halo Jurnal Sukabumi.',
}

export default function HaloJurnalSyaratKetentuanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-6 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight mb-2">
          Syarat & Ketentuan Layanan
        </h1>
        <p className="text-xs text-secondary">
          Terakhir diperbarui: 2026
        </p>
      </div>

      <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-on-surface text-xs sm:text-sm leading-relaxed">
        <div>
          <h2 className="font-heading font-bold text-base text-on-surface mb-2">1. Ketentuan Umum</h2>
          <p className="text-secondary">
            Dengan mendaftar dan menggunakan platform Halo Jurnal, Anda menyatakan bahwa seluruh data yang diberikan adalah benar dan dapat dipertanggungjawabkan di hadapan hukum Republik Indonesia.
          </p>
        </div>

        <div>
          <h2 className="font-heading font-bold text-base text-on-surface mb-2">2. Larangan Konten</h2>
          <p className="text-secondary mb-2">
            Pengguna dilarang keras menyampaikan laporan yang memuat:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-secondary">
            <li>Unsur fitnah, kebencian, pencemaran nama baik, atau diskriminasi SARA.</li>
            <li>Informasi palsu, rekayasa kejadian, atau hoax.</li>
            <li>Konten pornografi, kekerasan eksplisit, atau pelanggaran hak cipta.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading font-bold text-base text-on-surface mb-2">3. Moderasi & Tindak Lanjut</h2>
          <p className="text-secondary">
            Redaksi berhak menolak, menyunting untuk kesesuaian kaidah jurnalistik, atau menghapus laporan yang melanggar syarat dan ketentuan ini tanpa pemberitahuan sebelumnya.
          </p>
        </div>
      </div>
    </div>
  )
}
