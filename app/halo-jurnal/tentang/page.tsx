import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description:
    'Mengenal platform aspirasi dan pengaduan publik warga Sukabumi oleh PT Media Jurnal Sukabumi.',
  openGraph: {
    title: 'Tentang Kami | Hallo Jurnal',
    description:
      'Mengenal platform aspirasi dan pengaduan publik warga Sukabumi oleh PT Media Jurnal Sukabumi.',
  },
}

export default function HaloJurnalTentangPage() {
  const redaksi = [
    { jabatan: 'Chief Executive Officer (CEO)', nama: 'Eman Sulaeman, S.IP' },
    { jabatan: 'Pemimpin Redaksi', nama: 'Ujang Herlan, S.Pd' },
    { jabatan: 'Redaksi & Kreatif Digital', nama: 'Tim Jurnal Wave' },
  ]

  const legalitas = [
    { label: 'Nama Perusahaan', nilai: 'PT Media Jurnal Sukabumi' },
    { label: 'SK Menkumham', nilai: 'AHU-0007259.AH.01.01. Tahun 2020' },
    { label: 'Nomor Induk Berusaha (NIB)', nilai: '0220109361089' },
    { label: 'NPWP Perusahaan', nilai: '94.265.244.7-405.000' },
    { label: 'Izin Mendirikan Bangunan (IMB)', nilai: '503.3/644.4/2717/PMB-DPTMPTSP/2020' },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-24 md:pb-16 space-y-7">
      {/* 1. Navigasi Kembali Ringkas */}
      <div className="flex items-center justify-start">
        <Link
          href="/halo-jurnal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda Hallo Jurnal</span>
        </Link>
      </div>

      {/* 2. Judul Halaman (Simpel, Tanpa Ikon Berlebih) */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight leading-tight">
          Tentang Hallo Jurnal
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Platform independen aspirasi dan pengaduan publik warga Sukabumi oleh PT Media Jurnal Sukabumi.
        </p>
      </div>

      {/* 3. Ringkasan Platform (Simpel Tanpa Tombol Berlebih) */}
      <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs">
        <p className="text-xs sm:text-sm text-on-surface/90 leading-relaxed">
          <strong className="text-primary font-bold">Hallo Jurnal</strong> adalah inisiatif ruang publik yang dikelola secara independen oleh redaksi media <strong className="text-on-surface font-semibold">Jurnal Wave (PT Media Jurnal Sukabumi)</strong>. Kami hadir sebagai wadah komunikasi langsung bagi warga Sukabumi dalam menyampaikan aspirasi, keluhan layanan masyarakat, dan kerusakan infrastruktur untuk diverifikasi serta diteruskan ke pihak berwenang secara transparan.
        </p>
      </div>

      {/* 4. Alur Aduan & Komitmen Terpadu */}
      <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div>
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-on-surface tracking-tight">
            Alur Aduan
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Mekanisme penerimaan dan penanganan aduan masyarakat oleh tim redaksi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Langkah 1 */}
          <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/60 space-y-1.5">
            <span className="font-mono font-bold text-xs text-primary block">01</span>
            <h3 className="font-heading font-bold text-xs sm:text-sm text-on-surface">
              Penyampaian Aduan
            </h3>
            <p className="text-[11px] text-secondary leading-relaxed">
              Warga mengirimkan uraian kejadian beserta lampiran bukti foto atau video langsung melalui platform.
            </p>
          </div>

          {/* Langkah 2 */}
          <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/60 space-y-1.5">
            <span className="font-mono font-bold text-xs text-primary block">02</span>
            <h3 className="font-heading font-bold text-xs sm:text-sm text-on-surface">
              Verifikasi &amp; Kurasi Fakta
            </h3>
            <p className="text-[11px] text-secondary leading-relaxed">
              Tim redaksi menelaah keabsahan bukti kejadian, memeriksa lokasi lapangan, dan menilai urgensi kepentingan publik.
            </p>
          </div>

          {/* Langkah 3 */}
          <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/60 space-y-1.5">
            <span className="font-mono font-bold text-xs text-primary block">03</span>
            <h3 className="font-heading font-bold text-xs sm:text-sm text-on-surface">
              Tindak Lanjut Redaksi
            </h3>
            <p className="text-[11px] text-secondary leading-relaxed">
              Tergantung kelayakan dan hasil telaah, redaksi menentukan apakah aduan diangkat (di-up) sebagai liputan berita, diteruskan ke dinas terkait, atau dijadikan bahan koordinasi.
            </p>
          </div>
        </div>

        {/* Komitmen Ringkas Terpadu di Bawah Alur (Mengurut ke Bawah) */}
        <div className="pt-3.5 border-t border-outline-variant/50 text-[11px] text-secondary flex flex-col gap-1.5 leading-relaxed">
          <span>• <strong>Privasi:</strong> Nomor WhatsApp pelapor otomatis dirahasiakan dan dilindungi.</span>
          <span>• <strong>Independen:</strong> Penilaian fakta aduan murni objektif tanpa intervensi.</span>
          <span>• <strong>Transparan:</strong> Aduan yang terverifikasi dan layak publik dapat dipantau di Feed Warga.</span>
        </div>
      </div>

      {/* 5. Legalitas Badan Hukum & Susunan Redaksi (Simpel & Rapi) */}
      <div className="space-y-3">
        <div>
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-on-surface tracking-tight">
            Badan Hukum &amp; Redaksi
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            PT Media Jurnal Sukabumi beroperasi resmi sesuai regulasi pers Republik Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Box A: Susunan Redaksi */}
          <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-2.5">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-primary pb-2 border-b border-outline-variant/60">
              Susunan Redaksi
            </h3>
            <div className="divide-y divide-outline-variant/40 text-xs">
              {redaksi.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-2">
                  <span className="text-secondary text-[11px]">{item.jabatan}</span>
                  <span className="font-bold text-on-surface text-right text-xs">{item.nama}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Box B: Legalitas Resmi */}
          <div className="bg-surface border border-outline-variant/80 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-2.5">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-primary pb-2 border-b border-outline-variant/60">
              Legalitas Perusahaan
            </h3>
            <div className="divide-y divide-outline-variant/40 text-xs">
              {legalitas.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-2">
                  <span className="text-secondary text-[11px]">{item.label}</span>
                  <span className="font-mono font-bold text-on-surface text-right text-xs break-all sm:break-normal">
                    {item.nilai}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
