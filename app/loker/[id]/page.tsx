'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  GraduationCap,
  Briefcase,
  Banknote,
  Bookmark,
  Share2,
  ExternalLink,
  ShieldCheck,
  Flag,
  ChevronRight
} from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { DUMMY_JOBS } from '@/data/dummyJobs';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const job = DUMMY_JOBS.find(j => j.id === id) || DUMMY_JOBS[0];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: job.title,
          text: `Lowongan kerja ${job.title} di ${job.company}`,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link lowongan berhasil disalin ke clipboard!');
      }
    }
  };

  const handleApply = () => {
    window.location.href = `mailto:${job.applyEmail}?subject=Lamaran%20Pekerjaan%20-%20${encodeURIComponent(job.title)}%20-%20[Nama%20Lengkap]&body=Halo%20Tim%20HRD%20${encodeURIComponent(job.company)},%0D%0A%0D%0ASaya%20tertarik%20untuk%20melamar%20posisi%20${encodeURIComponent(job.title)}.%20Terlampir%20CV%20dan%20dokumen%20pendukung%20saya.%0D%0A%0D%0ATerima%20kasih.`;
  };

  const recruiterRequirements = [
    'Semua jenis kelamin',
    'Tidak ada batas usia',
    job.education || 'Minimal SMA/SMK/Sederajat',
    job.type
  ];

  const defaultSkills = [
    'Komunikasi Efektif',
    'Kerja Sama Tim',
    'Manajemen Waktu',
    'Ketelitian & Problem Solving'
  ];

  const defaultBenefits = [
    'Asuransi kesehatan',
    'Bonus kinerja',
    'BPJS Ketenagakerjaan',
    'Cuti tahunan',
    'Gaji Pokok',
    'Tunjangan Hari Raya (THR)'
  ];

  return (
    <div className="flex flex-1 mx-auto max-w-container-max w-full px-margin-mobile md:px-margin-desktop gap-gutter py-stack-lg">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="flex-1 flex flex-col min-w-0 pr-0 md:pr-4 pb-24 md:pb-stack-lg">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/loker"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Daftar Loker</span>
          </Link>
        </div>

        {/* ================= 1. HEADER KARTU LOKER ================= */}
        <div className="bg-surface border border-outline-variant/60 rounded-2xl p-5 sm:p-7 shadow-2xs mb-6 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-variant/70 border border-outline-variant/50 flex items-center justify-center shrink-0 text-primary font-bold shadow-2xs">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {job.title}
              </h1>
              <p className="text-sm sm:text-base font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                {job.company}
              </p>
            </div>
          </div>

          {/* 4 Info Utama Berikon */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 pt-1 border-t border-outline-variant/40">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0 stroke-[2]" />
              <span>{job.location}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-primary shrink-0 stroke-[2]" />
              <span>{job.education || 'Minimal SMA/SMK/Sederajat'}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-primary shrink-0 stroke-[2]" />
              <span>{job.type} • Penempatan Area Sukabumi</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Banknote className="w-4 h-4 text-primary shrink-0 stroke-[2]" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{job.salaryRange}</span>
            </div>
          </div>

          {/* Info Tanggal Posting */}
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-normal -mt-1">
            {job.createdAt ? job.createdAt.split('-')[0].trim() : 'Terbaru'}
          </div>

          {/* Tombol Aksi Utama */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleApply}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-xs transition-all cursor-pointer active:scale-95 text-center"
            >
              Lamar Sekarang
            </button>

            <button
              onClick={() => setIsSaved(!isSaved)}
              aria-label="Simpan Lowongan"
              title={isSaved ? 'Tersimpan' : 'Simpan Lowongan'}
              className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isSaved
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant/70 text-zinc-500 hover:text-primary hover:border-primary bg-surface'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              aria-label="Bagikan Lowongan"
              title="Bagikan Lowongan"
              className="w-11 h-11 rounded-xl border border-outline-variant/70 text-zinc-500 hover:text-primary hover:border-primary bg-surface flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= 2. DESKRIPSI & KUALIFIKASI ================= */}
        <div className="bg-surface border border-outline-variant/60 rounded-2xl p-5 sm:p-7 shadow-2xs mb-6 flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Deskripsi Pekerjaan
            </h2>

            <div className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Jobdesk pekerjaan :</span>
              <p className="whitespace-pre-line">{job.description}</p>
            </div>
          </section>

          {/* Kualifikasi */}
          <section className="flex flex-col gap-3 pt-4 border-t border-outline-variant/40">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Kualifikasi :</span>
            <ul className="list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300 flex flex-col gap-1.5 leading-relaxed">
              {job.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </section>

          {/* Kebijakan Data Pribadi */}
          <div className="p-4 rounded-xl bg-surface-variant/40 border border-outline-variant/40 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
              {job.company} tunduk pada ketentuan UU Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi
            </span>
            Data lamaran kerja yang Anda kirimkan hanya akan digunakan untuk keperluan verifikasi dan seleksi rekrutmen di {job.company}.
          </div>

          {/* Hari & Jam Kerja (2 Kolom) */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/40">
            <div>
              <span className="block text-xs text-zinc-500 font-medium">Hari Kerja</span>
              <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                Senin - Jumat
              </span>
            </div>
            <div>
              <span className="block text-xs text-zinc-500 font-medium">Jam Kerja</span>
              <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                08:30 - 17:30 WIB
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. PERSYARATAN, KEAHLIAN & BENEFIT (CHIPS) ================= */}
        <div className="bg-surface border border-outline-variant/60 rounded-2xl p-5 sm:p-7 shadow-2xs mb-6 flex flex-col gap-6">
          {/* Persyaratan dari rekruter */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Persyaratan dari rekruter
            </h3>
            <div className="flex flex-wrap gap-2">
              {recruiterRequirements.map((req, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>

          {/* Keahlian yang dibutuhkan */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Keahlian yang dibutuhkan
            </h3>
            <div className="flex flex-wrap gap-2">
              {defaultSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Benefit (Chips Oranye Lembut) */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Benefit
            </h3>
            <div className="flex flex-wrap gap-2">
              {(job.benefits && job.benefits.length > 0 ? job.benefits : defaultBenefits).map((ben, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/40"
                >
                  {ben}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ================= 4. TENTANG PERUSAHAAN ================= */}
        <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-5 sm:p-7 shadow-2xs mb-6 flex flex-col gap-4">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Tentang Perusahaan
          </span>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/60 flex items-center justify-center text-primary font-bold shadow-2xs shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                {job.company}
              </h4>
              <p className="text-xs text-zinc-500">Kemitraan Usaha &amp; Industri Sukabumi</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pt-2 border-t border-sky-200/40 dark:border-sky-800/40">
            {job.company} merupakan salah satu entitas usaha terpercaya yang beroperasi di wilayah Sukabumi dan sekitarnya, berkomitmen memberikan kontribusi nyata serta peluang karir yang berkelanjutan bagi tenaga kerja lokal.
          </p>
        </div>

        {/* ================= 5. TIPS AMAN & LAPORKAN ================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 mb-6 flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <h5 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              Tips Aman Lamar Kerja
            </h5>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              Harap waspada &amp; laporkan ke tim kami jika ada lowongan yang memintamu untuk transfer uang. Seluruh proses rekrutmen di Jurnal Vibes tidak dipungut biaya apa pun.
            </p>
          </div>
        </div>

        {/* Laporkan Lowongan */}
        <div className="flex items-center justify-start pb-12">
          <button
            onClick={() => alert('Terima kasih. Laporan lowongan Anda telah kami terima dan akan segera ditinjau oleh tim moderator Jurnal Vibes.')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <Flag className="w-4 h-4" />
            <span>Laporkan Lowongan Ini</span>
          </button>
        </div>
      </main>
    </div>
  );
}
