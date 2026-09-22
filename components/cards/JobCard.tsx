'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Building2, MapPin, Banknote, GraduationCap, Share2 } from 'lucide-react';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isSaved, setIsSaved] = useState<boolean>(job.isSaved || false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
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
      className="bg-surface border border-outline-variant/60 hover:border-primary/70 rounded-2xl p-5 transition-all duration-200 shadow-2xs hover:shadow-xs block group cursor-pointer"
    >
      <div className="flex flex-col gap-3.5">
        {/* Header: Logo Perusahaan + Posisi & Nama Perusahaan */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-surface-variant/60 border border-outline-variant/50 flex items-center justify-center shrink-0 text-primary font-bold group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors leading-snug line-clamp-1">
              {job.title}
            </h3>
            <p className="text-xs sm:text-sm font-normal text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              {job.company}
            </p>
          </div>
        </div>

        {/* 3 Baris Info Kunci Berikon ala KitaLulus */}
        <div className="flex flex-col gap-2 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0 stroke-[2]" />
            <span className="truncate">{job.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary shrink-0 stroke-[2]" />
            <span>{job.education || 'Minimal SMA/SMK/Sederajat'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-primary shrink-0 stroke-[2]" />
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{job.salaryRange}</span>
          </div>
        </div>

        {/* Footer: Tanggal Posting & Tombol Aksi (Share & Bookmark) */}
        <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs mt-1">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-normal">
            {job.createdAt ? job.createdAt.split('-')[0].trim() : 'Terbaru'}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={toggleBookmark}
              aria-label="Simpan Lowongan"
              title={isSaved ? 'Tersimpan' : 'Simpan Lowongan'}
              className="w-8 h-8 rounded-full border border-outline-variant/60 hover:border-primary flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-primary' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              aria-label="Bagikan Lowongan"
              title="Bagikan Lowongan"
              className="w-8 h-8 rounded-full border border-outline-variant/60 hover:border-primary flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
