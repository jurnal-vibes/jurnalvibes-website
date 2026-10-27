'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  Briefcase,
  Banknote,
  Bookmark,
  Share2,
  ShieldCheck,
  Flag,
  ExternalLink,
} from 'lucide-react';
import { Job } from '@/types';
import { DUMMY_JOBS } from '@/data/dummyJobs';
import { getJobRoleIcon, formatJobDate } from '@/components/cards/JobCard';
import { isJobSaved, toggleJobBookmark } from '@/lib/bookmarks';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const [isSaved, setIsSaved] = useState<boolean>(() => (id ? isJobSaved(id) : false));
  const [allJobs, setAllJobs] = useState<Job[]>(DUMMY_JOBS);

  useEffect(() => {
    if (!id) return;
    const syncSaved = () => {
      setIsSaved(isJobSaved(id));
    };
    syncSaved();
    window.addEventListener('storage', syncSaved);
    window.addEventListener('bookmarks-updated', syncSaved);
    return () => {
      window.removeEventListener('storage', syncSaved);
      window.removeEventListener('bookmarks-updated', syncSaved);
    };
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jurnal_wave_jobs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllJobs(parsed);
          }
        }
      } catch {}
    }
  }, []);

  const handleToggleBookmark = () => {
    if (!id) return;
    const next = toggleJobBookmark(id);
    setIsSaved(next);
  };

  const job = allJobs.find(j => j.id === id) || DUMMY_JOBS.find(j => j.id === id);
  const RoleIcon = getJobRoleIcon(job?.title || '', job?.company || '');

  if (!job) {
    return (
      <div className="flex flex-1 mx-auto max-w-container-max w-full px-margin-mobile md:px-margin-desktop py-20 text-center">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <Briefcase className="w-12 h-12 text-slate-400 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Lowongan Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6">
            Lowongan kerja yang Anda cari tidak tersedia atau telah ditutup.
          </p>
          <Link
            href="/loker"
            className="px-5 py-2.5 rounded-full bg-[#c00015] text-white font-bold text-sm"
          >
            Kembali ke Daftar Loker
          </Link>
        </div>
      </div>
    );
  }

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
    const rawLink = (job.applyUrl || job.applyEmail || '').trim();
    if (!rawLink) {
      alert('Tautan pendaftaran belum tersedia untuk lowongan ini.');
      return;
    }

    if (rawLink.startsWith('http://') || rawLink.startsWith('https://')) {
      window.open(rawLink, '_blank', 'noopener,noreferrer');
      return;
    }

    if (rawLink.startsWith('wa.me/')) {
      window.open(`https://${rawLink}`, '_blank', 'noopener,noreferrer');
      return;
    }

    if (rawLink.includes('@') && !rawLink.includes('/')) {
      window.location.href = `mailto:${rawLink}?subject=Lamaran%20Pekerjaan%20-%20${encodeURIComponent(job.title)}%20-%20[Nama%20Lengkap]`;
      return;
    }

    const cleanDigits = rawLink.replace(/[^0-9]/g, '');
    if (cleanDigits.length >= 10) {
      const waNum = cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits;
      window.open(`https://wa.me/${waNum}?text=Halo%20saya%20tertarik%20melamar%20posisi%20${encodeURIComponent(job.title)}%20di%20${encodeURIComponent(job.company)}`, '_blank', 'noopener,noreferrer');
      return;
    }

    window.open(`https://${rawLink}`, '_blank', 'noopener,noreferrer');
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
    'Gaji pokok sesuai UMK',
    'BPJS Kesehatan & Ketenagakerjaan',
    'Tunjangan makan & transportasi',
    'Jenjang karir yang jelas'
  ];

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-24 flex flex-col min-w-0">
      <main className="w-full flex flex-col min-w-0">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/loker"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#c00015] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Daftar Loker</span>
          </Link>
        </div>

        {/* ================= 1. HEADER KARTU LOKER (Compact Modern Style) ================= */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xs mb-4 sm:mb-6 flex flex-col gap-3.5 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs">
              <RoleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#c00015] stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-zinc-100 leading-snug">
                {job.title}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-400 mt-0.5">
                {job.company}
              </p>
            </div>
          </div>

          {/* Info Utama: Badge Chips Kompak Modern */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {/* Gaji (Netral Elegan tanpa warna hijau) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700 text-xs font-bold tracking-tight">
              <Banknote className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>{job.salaryRange}</span>
            </div>

            {/* Lokasi (Utuh tanpa terpotong) */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/70 dark:border-zinc-700/60 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.location}</span>
            </div>

            {/* Tipe Pekerjaan */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/70 dark:border-zinc-700/60 text-xs font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.type}</span>
            </div>

            {/* Pendidikan */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/70 dark:border-zinc-700/60 text-xs font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.education || 'Minimal SMA/SMK'}</span>
            </div>

            {/* Info Tanggal Posting */}
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium ml-auto self-center">
              {formatJobDate(job.createdAt)}
            </span>
          </div>

          {/* Tombol Aksi Utama */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={handleApply}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <span>Lamar Sekarang</span>
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={handleToggleBookmark}
              aria-label="Simpan Lowongan"
              title={isSaved ? 'Tersimpan (Klik untuk batal)' : 'Simpan Lowongan'}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isSaved
                  ? 'border-[#c00015] bg-[#c00015]/10 text-[#c00015]'
                  : 'border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-[#c00015] hover:border-[#c00015] bg-white dark:bg-zinc-900'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              aria-label="Bagikan Lowongan"
              title="Bagikan Lowongan"
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-[#c00015] hover:border-[#c00015] bg-white dark:bg-zinc-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= 2. DESKRIPSI & KUALIFIKASI ================= */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xs mb-6 flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
              Deskripsi Pekerjaan
            </h2>

            <div className="flex flex-col gap-2 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-zinc-100">Jobdesk pekerjaan:</span>
              <p className="whitespace-pre-line">{job.description}</p>
            </div>
          </section>

          {/* Kualifikasi */}
          <section className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <span className="font-semibold text-sm text-slate-900 dark:text-zinc-100">Kualifikasi:</span>
            <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-zinc-300 flex flex-col gap-1.5 leading-relaxed">
              {job.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </section>

          {/* Komitmen Perlindungan Data */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-zinc-200 block mb-0.5">
              Komitmen Privasi Pelamar
            </span>
            Data lamaran kerja yang dikirimkan hanya diperuntukkan bagi proses seleksi rekrutmen resmi di {job.company}.
          </div>

          {/* Hari & Jam Kerja */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div>
              <span className="block text-xs text-slate-500 font-medium">Hari Kerja</span>
              <span className="block text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                Senin - Jumat
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-medium">Jam Kerja</span>
              <span className="block text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                08:30 - 17:30 WIB
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. PERSYARATAN, KEAHLIAN & BENEFIT (CHIPS BERSIH MONOKROM) ================= */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-2xs mb-6 flex flex-col gap-6">
          {/* Persyaratan dari rekruter */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Persyaratan dari Rekruter
            </h3>
            <div className="flex flex-wrap gap-2">
              {recruiterRequirements.map((req, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/60"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>

          {/* Keahlian yang dibutuhkan */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Keahlian yang Dibutuhkan
            </h3>
            <div className="flex flex-wrap gap-2">
              {defaultSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Benefit */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Benefit &amp; Fasilitas
            </h3>
            <div className="flex flex-wrap gap-2">
              {(job.benefits && job.benefits.length > 0 ? job.benefits : defaultBenefits).map((ben, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/60"
                >
                  {ben}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ================= 4. TENTANG PERUSAHAAN ================= */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-2xs mb-6 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tentang Perusahaan
          </span>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs">
              <RoleIcon className="w-6 h-6 text-[#c00015] stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                {job.company}
              </h4>
              <p className="text-xs text-slate-500">Kemitraan Usaha &amp; Industri Sukabumi</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-zinc-800">
            {job.company} merupakan salah satu entitas usaha terpercaya yang beroperasi di wilayah Sukabumi dan sekitarnya, berkomitmen memberikan kontribusi nyata serta peluang karir yang berkelanjutan bagi tenaga kerja lokal.
          </p>
        </div>

        {/* ================= 5. TIPS AMAN & LAPORKAN ================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 mb-6 flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100">
              Tips Aman Melamar Kerja
            </h5>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Waspadalah terhadap pihak yang mengatasnamakan rekrutmen dan meminta pungutan biaya apa pun. Seluruh publikasi lowongan kerja di Jurnal Wave adalah gratis dan tanpa perantara berbayar.
            </p>
          </div>
        </div>

        {/* Laporkan Lowongan */}
        <div className="flex items-center justify-start pb-12">
          <button
            onClick={() => alert('Terima kasih. Laporan lowongan Anda telah kami terima dan akan segera ditinjau oleh tim moderator Jurnal Wave.')}
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
