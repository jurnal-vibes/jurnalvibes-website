'use client';

import React, { useState } from 'react';
import { Search, Briefcase, X } from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { JobCard } from '@/components/cards/JobCard';
import { DUMMY_JOBS } from '@/data/dummyJobs';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export default function LokerPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeType, setActiveType] = useState<string>('Semua');

  const JOBS_PER_PAGE = 4;
  const [visibleCount, setVisibleCount] = useState<number>(JOBS_PER_PAGE);

  const types = ['Semua', 'Full-Time', 'Part-Time', 'Freelance', 'Remote', 'Magang'];

  const filteredJobs = DUMMY_JOBS.filter(job => {
    const matchType = activeType === 'Semua' || job.type === activeType;
    const matchSearch =
      searchQuery.trim() === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = filteredJobs.length > visibleCount;

  return (
    <div className="flex flex-1 mx-auto max-w-container-max w-full px-margin-mobile md:px-margin-desktop gap-gutter py-stack-lg">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="flex-1 flex flex-col min-w-0 pr-0 md:pr-4 pb-24 md:pb-stack-lg">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            Lowongan Kerja Sukabumi
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
            Temukan peluang karir dan pekerjaan terkini di Kota &amp; Kabupaten Sukabumi.
          </p>
        </header>

        {/* Search Bar & Type Filters */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(JOBS_PER_PAGE);
              }}
              placeholder="Cari posisi kerja, perusahaan, atau wilayah Sukabumi..."
              className="w-full h-11 pl-10 pr-10 rounded-xl text-sm bg-surface border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface placeholder:text-on-surface-variant/50 transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setVisibleCount(JOBS_PER_PAGE);
                }}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-variant hover:bg-outline-variant/60 flex items-center justify-center text-on-surface-variant/70 hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Type Filter Chips (Horizontal Scroll di Layar HP) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {types.map((type, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveType(type);
                  setVisibleCount(JOBS_PER_PAGE);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeType === type
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'bg-surface-variant/60 text-on-surface hover:bg-surface-variant border border-outline-variant/40'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Job Cards Grid or Empty State */}
        {visibleJobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {visibleJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Load More Button - Hanya muncul jika lowongan melebihi kuota tampil */}
            {hasMore && (
              <div className="flex justify-center pb-12">
                <button
                  type="button"
                  onClick={() => setVisibleCount(c => c + JOBS_PER_PAGE)}
                  className="border border-outline-variant/80 hover:border-primary text-on-surface hover:text-primary font-semibold px-6 py-2 rounded-full text-xs transition-all cursor-pointer"
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-outline-variant/50 rounded-2xl my-4">
            <div className="w-12 h-12 rounded-full bg-surface-variant/60 flex items-center justify-center text-on-surface-variant/60 mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-on-surface">Tidak ada lowongan ditemukan</h3>
            <p className="text-xs text-on-surface-variant/70 mt-1 max-w-sm">
              Coba gunakan kata kunci pencarian lain atau pilih kategori pekerjaan lainnya.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
