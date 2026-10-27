'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  MapPin,
  Banknote,
  GraduationCap,
  Share2,
  Coffee,
  Calculator,
  Megaphone,
  Package,
  Laptop,
  Briefcase,
} from 'lucide-react';
import { Job } from '@/types';
import { isJobSaved, toggleJobBookmark } from '@/lib/bookmarks';

interface JobCardProps {
  job: Job;
}

// Ikon Tematik Sesuai Profesi Lowongan Kerja
export const getJobRoleIcon = (title: string = '', company: string = '') => {
  const text = `${title} ${company}`.toLowerCase();
  if (
    text.includes('barista') ||
    text.includes('kopi') ||
    text.includes('cafe') ||
    text.includes('f&b') ||
    text.includes('restoran')
  ) {
    return Coffee;
  }
  if (
    text.includes('keuangan') ||
    text.includes('administrasi') ||
    text.includes('akuntansi') ||
    text.includes('finance') ||
    text.includes('kasir')
  ) {
    return Calculator;
  }
  if (
    text.includes('social media') ||
    text.includes('content') ||
    text.includes('kreatif') ||
    text.includes('marketing') ||
    text.includes('media')
  ) {
    return Megaphone;
  }
  if (
    text.includes('logistik') ||
    text.includes('gudang') ||
    text.includes('kurir') ||
    text.includes('operasional') ||
    text.includes('pengiriman')
  ) {
    return Package;
  }
  if (
    text.includes('it') ||
    text.includes('web') ||
    text.includes('developer') ||
    text.includes('software') ||
    text.includes('komputer')
  ) {
    return Laptop;
  }
  return Briefcase;
};

// Format tanggal natural Indonesia (bervariasi dan natural)
export const formatJobDate = (dateStr?: string) => {
  if (!dateStr) return 'Terbaru';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Terbaru';
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return 'Dibutuhkan Segera';
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 hari lalu';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 14) return '1 minggu lalu';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return 'Terbaru';
  }
};

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isSaved, setIsSaved] = useState<boolean>(() => (job?.id ? isJobSaved(job.id) : false));
  const RoleIcon = getJobRoleIcon(job.title, job.company);

  useEffect(() => {
    if (!job?.id) return;
    const syncSaved = () => {
      setIsSaved(isJobSaved(job.id));
    };
    syncSaved();
    window.addEventListener('storage', syncSaved);
    window.addEventListener('bookmarks-updated', syncSaved);
    return () => {
      window.removeEventListener('storage', syncSaved);
      window.removeEventListener('bookmarks-updated', syncSaved);
    };
  }, [job?.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!job?.id) return;
    const next = toggleJobBookmark(job.id);
    setIsSaved(next);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Lowongan kerja ${job.title} di ${job.company}`,
        url: window.location.origin + `/loker/${job.id}`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/loker/${job.id}`);
      alert('Link lowongan berhasil disalin!');
    }
  };

  return (
    <Link
      href={`/loker/${job.id}`}
      className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 hover:border-[#c00015]/60 dark:hover:border-[#c00015]/60 rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between h-full group cursor-pointer"
    >
      <div className="flex flex-col gap-2.5 sm:gap-3.5">
        {/* Header: Ikon Profesi Pekerjaan + Posisi & Nama Perusahaan */}
        <div className="flex items-start gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#c00015] group-hover:text-white group-hover:border-[#c00015] transition-all duration-200">
            <RoleIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-zinc-100 group-hover:text-[#c00015] transition-colors leading-snug line-clamp-2 sm:line-clamp-1">
              {job.title}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
              {job.company}
            </p>
          </div>
        </div>

        {/* 3 Baris Info Kunci Berikon Netral */}
        <div className="flex flex-col gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 text-[11px] sm:text-xs text-slate-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.education || 'Minimal SMA/SMK'}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Banknote className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{job.salaryRange}</span>
          </div>
        </div>
      </div>

      {/* Footer: Tanggal Posting & Tombol Aksi (Share & Bookmark) */}
      <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs mt-2.5 sm:mt-3">
        <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
          {formatJobDate(job.createdAt)}
        </span>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={toggleBookmark}
            aria-label="Simpan Lowongan"
            title={isSaved ? 'Tersimpan' : 'Simpan Lowongan'}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-200 hover:border-[#c00015] flex items-center justify-center text-slate-400 hover:text-[#c00015] hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Bookmark className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSaved ? 'fill-current text-[#c00015]' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            aria-label="Bagikan Lowongan"
            title="Bagikan Lowongan"
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-200 hover:border-[#c00015] flex items-center justify-center text-slate-400 hover:text-[#c00015] hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </Link>
  );
};
