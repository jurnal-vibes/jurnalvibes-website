import Link from 'next/link'
import {
  ShieldCheck,
  Shield,
  Eye,
  Gauge,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Newspaper,
  Scale,
  Landmark,
  UserCheck,
  PenLine,
  MessagesSquare,
  CheckCircle2,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tentang Halo Jurnal',
  description:
    'Mengenal platform aspirasi dan pengaduan publik warga Sukabumi oleh PT Media Jurnal Sukabumi.',
}

export default function HaloJurnalTentangPage() {
  const redaksi = [
    { jabatan: 'Chief Executive Officer', nama: 'Eman Sulaeman, S.IP' },
    { jabatan: 'Pemimpin Redaksi', nama: 'Ujang Herlan, S.Pd' },
    { jabatan: 'Reporter', nama: 'Ilham Nugraha, Idris' },
    { jabatan: 'Media Sosial', nama: 'Nofa Apekariasnya' },
    { jabatan: 'Manager IT', nama: 'Mohammad Nur' },
    { jabatan: 'Publisher', nama: 'Yoga Arya Suhada, H Agustina' },
  ]

  const legalitas = [
    { label: 'Nomor SK Kemenkumham', nilai: 'AHU-0007259.AH.01.01. Tahun 2020' },
    { label: 'NIB', nilai: '0220109361089' },
    { label: 'NPWP', nilai: '94.265.244.7-405.000' },
    { label: 'IMB', nilai: '503.3/644.4/2717/PMB-DPTMPTSP/2020' },
  ]

  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-20">
      {/* ===================== SEKSI 1: HERO BANNER (Tentang Halo Jurnal) ===================== */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 overflow-hidden shadow-sm">
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Kolom Kiri: Teks & Tombol */}
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold uppercase tracking-wider border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-200" />
              <span>DIGITAL GOVERNANCE &amp; CITIZEN VOICE</span>
            </span>

            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Tentang Halo Jurnal
            </h1>

            <p className="text-white/90 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl">
              Platform aspirasi dan pengaduan warga yang dikelola secara independen oleh redaksi Jurnal Sukabumi (PT Media Jurnal Sukabumi). Kami menerima, memverifikasi, dan menjembatani komunikasi langsung dengan pihak berwenang demi transparansi dan kemajuan Sukabumi.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/halo-jurnal/lapor"
                className="px-6 py-3 rounded-full bg-white text-primary font-bold text-xs sm:text-sm shadow-md hover:bg-white/90 transition-all cursor-pointer active:scale-95"
              >
                Buat Laporan Sekarang
              </Link>
              <a
                href="#profil-resmi"
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs sm:text-sm transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Profil Resmi Perusahaan</span>
                <ExternalLink className="w-4 h-4 text-white/80" />
              </a>
            </div>
          </div>

          {/* Kolom Kanan: Ilustrasi 3D Newsroom */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 h-64 sm:h-80 lg:h-96">
              <img
                src="/hero-banner.webp"
                alt="Tim Redaksi Halo Jurnal Sukabumi"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SEKSI: BAGAIMANA CARA KERJANYA? ===================== */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight mb-2.5">
            Bagaimana Cara Kerjanya?
          </h2>
          <p className="text-secondary text-xs sm:text-sm lg:text-base leading-relaxed">
            Alur pelaporan yang sistematis untuk memastikan setiap aspirasi Anda terdengar dan tertangani dengan baik.
          </p>
        </div>

        <div className="relative">
          {/* Garis Penghubung Horizontal (Desktop) */}
          <div className="hidden lg:block absolute top-7 left-[10%] right-[10%] h-[1.5px] bg-outline-variant/80 -z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {/* Langkah 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-2 border-primary bg-surface text-primary flex items-center justify-center mb-4 shadow-2xs hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface mb-1.5">
                1. Daftar &amp; Verifikasi
              </h3>
              <p className="text-secondary text-xs leading-relaxed max-w-[220px]">
                Pastikan identitas Anda valid untuk menjaga integritas data.
              </p>
            </div>

            {/* Langkah 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-2 border-primary bg-surface text-primary flex items-center justify-center mb-4 shadow-2xs hover:scale-105 transition-transform">
                <PenLine className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface mb-1.5">
                2. Sampaikan Laporan
              </h3>
              <p className="text-secondary text-xs leading-relaxed max-w-[220px]">
                Tulis aspirasi atau keluhan Anda secara detail dan lampirkan bukti.
              </p>
            </div>

            {/* Langkah 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-2 border-primary bg-surface text-primary flex items-center justify-center mb-4 shadow-2xs hover:scale-105 transition-transform">
                <MessagesSquare className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface mb-1.5">
                3. Diskusi Langsung
              </h3>
              <p className="text-secondary text-xs leading-relaxed max-w-[220px]">
                Berinteraksi langsung dengan Admin Jurnal Sukabumi untuk proses klarifikasi data.
              </p>
            </div>

            {/* Langkah 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-2 border-primary bg-surface text-primary flex items-center justify-center mb-4 shadow-2xs hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface mb-1.5">
                4. Pantau &amp; Selesai
              </h3>
              <p className="text-secondary text-xs leading-relaxed max-w-[220px]">
                Ikuti perkembangan status hingga laporan dinyatakan selesai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SEKSI 2: KOMITMEN KAMI TERHADAP MASYARAKAT ===================== */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mb-8">
          Komitmen Kami terhadap Masyarakat
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: 3 Kartu Nilai */}
          <div className="lg:col-span-6 space-y-4">
            {/* Card 1: Kerahasiaan Data */}
            <div className="bg-surface border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex items-start gap-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface mb-1">
                  Kerahasiaan Data
                </h3>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                  KTP hanya digunakan untuk verifikasi internal dan tidak akan pernah dipublikasikan kepada publik demi keamanan pelapor.
                </p>
              </div>
            </div>

            {/* Card 2: Transparansi Publik */}
            <div className="bg-surface border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex items-start gap-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface mb-1">
                  Transparansi Publik
                </h3>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                  Setiap laporan yang ditindaklanjuti dapat dipantau publik secara anonim untuk memastikan akuntabilitas proses.
                </p>
              </div>
            </div>

            {/* Card 3: Respon Cepat */}
            <div className="bg-surface border border-outline-variant/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex items-start gap-4 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface mb-1">
                  Respon Cepat
                </h3>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                  Setiap laporan ditangani dan direspons secara profesional oleh admin berwenang dalam waktu yang terukur.
                </p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: 3 Gambar Kolase */}
          <div className="lg:col-span-6 space-y-4">
            {/* Gambar Atas: Sertifikat Resmi / Legal Seal */}
            <div className="h-52 sm:h-60 rounded-2xl overflow-hidden border border-outline-variant/80 shadow-xs relative">
              <img
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80"
                alt="Sertifikat Resmi Halo Jurnal"
                className="w-full h-full object-cover"
              />
            </div>

            {/* 2 Gambar Bawah Side-by-Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-outline-variant/80 shadow-xs relative">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                  alt="Dashboard Transparansi Publik"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-outline-variant/80 shadow-xs relative">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                  alt="Kolaborasi Tim Redaksi & Penanganan Aduan"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SEKSI 3: PROFIL RESMI MEDIA (PT. Media Jurnal Sukabumi) ===================== */}
      <section id="profil-resmi" className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xs">
          {/* Header Profil */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-2">
                PROFIL RESMI MEDIA
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-on-surface tracking-tight">
                PT. Media Jurnal Sukabumi
              </h2>
            </div>

            <Link
              href="/tentang-kami"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm tracking-tight shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <span>Buka Halaman Tentang Kami di Portal Utama</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-8 max-w-4xl">
            Portal berita <strong className="text-on-surface">www.jurnalsukabumi.com</strong> berada di bawah naungan <strong className="text-on-surface">PT. Media Jurnal Sukabumi</strong>. Jurnalsukabumi.com hadir di tengah menjamurnya beragam media siber. Kehadirannya tentu saja diharapkan menjadi pembeda dengan media online lainnya. Maka itu, dibidani oleh sumber daya manusia yang mumpuni, profesional, dan konsisten di bidang jurnalistik, kami hadir di tengah masyarakat.
          </p>

          {/* 3 Box Grid: Susunan Redaksi, Legalitas Resmi, Rekening Resmi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Susunan Redaksi */}
            <div className="bg-surface border border-outline-variant/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-4 text-primary">
                <Newspaper className="w-5 h-5 shrink-0" />
                <h3 className="font-heading font-extrabold text-sm sm:text-base text-on-surface">
                  Susunan Redaksi
                </h3>
              </div>
              <div className="space-y-3 text-xs">
                {redaksi.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-secondary font-medium">{item.jabatan}:</span>
                    <span className="font-bold text-on-surface">{item.nama}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 2: Legalitas Resmi Perusahaan */}
            <div className="bg-surface border border-outline-variant/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-4 text-primary">
                <Scale className="w-5 h-5 shrink-0" />
                <h3 className="font-heading font-extrabold text-sm sm:text-base text-on-surface">
                  Legalitas Resmi Perusahaan
                </h3>
              </div>
              <div className="space-y-3 text-xs">
                {legalitas.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-secondary font-medium">{item.label}:</span>
                    <span className="font-bold text-on-surface">{item.nilai}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: Rekening Resmi PT */}
            <div className="bg-surface border border-outline-variant/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4 text-primary">
                  <Landmark className="w-5 h-5 shrink-0" />
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-on-surface">
                    Rekening Resmi PT
                  </h3>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-secondary leading-relaxed">
                    Bank Jabar Banten (BJB) KCP Cibadak<br />
                    Atas Nama: <strong className="text-on-surface">PT Media Jurnal Sukabumi</strong><br />
                    No. Rekening: <strong className="text-on-surface font-mono">0122-4504-14100</strong>
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-outline-variant/60 text-xs">
                <span className="text-secondary block">Email Redaksi:</span>
                <a
                  href="mailto:redaksi@jurnalsukabumi.com"
                  className="font-bold text-primary hover:underline"
                >
                  redaksi@jurnalsukabumi.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SEKSI 4: BUTUH BANTUAN / HUBUNGI KAMI ===================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-surface border border-outline-variant/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Sisi Kiri: Teks & Kontak */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-on-surface tracking-tight mb-2">
                Punya pertanyaan atau butuh bantuan?
              </h2>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg">
                Tim dukungan kami siap membantu Anda memahami lebih lanjut tentang cara kerja platform atau menangani kendala teknis yang Anda hadapi.
              </p>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-secondary pt-1">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:redaksi@jurnalsukabumi.com" className="hover:text-primary hover:underline font-medium">
                  redaksi@jurnalsukabumi.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:082111651470" className="hover:text-primary hover:underline font-medium">
                  0821-1165-1470
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Perum Bukit Randu Asri, Blok K No. 14, Cibadak, Kab. Sukabumi 43351
                </span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Tombol Hubungi Kami */}
          <div className="shrink-0 pt-2 md:pt-0">
            <Link
              href="/halo-jurnal/hubungi-kami"
              className="inline-flex items-center justify-center px-7 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer w-full md:w-auto"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
