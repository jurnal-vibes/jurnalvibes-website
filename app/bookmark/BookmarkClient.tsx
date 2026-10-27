'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowRight, Briefcase, Newspaper, MapPin, Banknote } from 'lucide-react';
import { Article, Job } from '@/types';
import { formatIndoDate } from '@/lib/utils';
import {
  getSavedArticleIds,
  toggleArticleBookmark,
  getSavedJobIds,
  toggleJobBookmark
} from '@/lib/bookmarks';
import { getJobRoleIcon } from '@/components/cards/JobCard';

interface BookmarkClientProps {
  initialArticles?: Article[];
  initialJobs?: Job[];
}

export function BookmarkClient({ initialArticles = [], initialJobs = [] }: BookmarkClientProps) {
  const [allArticles] = useState<Article[]>(initialArticles);
  const [allJobs, setAllJobs] = useState<Job[]>(initialJobs);

  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  const [activeTab, setActiveTab] = useState<'semua' | 'artikel' | 'loker'>('semua');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  // Load jobs from localStorage if updated via admin
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

  // Sync saved articles & jobs from localStorage
  const syncData = () => {
    const articleIds = getSavedArticleIds();
    const jobIds = getSavedJobIds();

    const matchedArticles = allArticles.filter(a => articleIds.includes(a.id));
    const matchedJobs = allJobs.filter(j => jobIds.includes(j.id));

    setSavedArticles(matchedArticles);
    setSavedJobs(matchedJobs);
  };

  useEffect(() => {
    syncData();
    window.addEventListener('storage', syncData);
    window.addEventListener('bookmarks-updated', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('bookmarks-updated', syncData);
    };
  }, [allArticles, allJobs]);

  const handleRemoveArticle = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleArticleBookmark(id);
    setSavedArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleRemoveJob = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleJobBookmark(id);
    setSavedJobs(prev => prev.filter(j => j.id !== id));
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    savedArticles.forEach(a => {
      const cat = a.categoryLabel || a.category;
      if (cat) cats.add(cat.toUpperCase());
    });
    return ['Semua', ...Array.from(cats)];
  }, [savedArticles]);

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'Semua') return savedArticles;
    return savedArticles.filter(a => {
      const cat = (a.categoryLabel || a.category || '').toUpperCase();
      return cat === activeCategory.toUpperCase();
    });
  }, [savedArticles, activeCategory]);

  const totalSavedCount = savedArticles.length + savedJobs.length;

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-16 flex flex-col min-w-0">
      <main className="w-full flex flex-col min-w-0">
        <header className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#c00015] rounded-full inline-block" />
            <h1 className="text-xl md:text-3xl font-bold font-headline-xl text-slate-900 dark:text-zinc-100 tracking-tight">
              Konten Tersimpan
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
            Daftar berita, artikel, dan lowongan kerja yang Anda simpan untuk dibaca atau dilamar nanti.
          </p>
        </header>

        {/* Tab Switcher: Semua, Berita & Artikel, Lowongan Kerja (Selaras di Web & Mobile) */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3 mb-5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveTab('semua');
              setActiveCategory('Semua');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none ${
              activeTab === 'semua'
                ? 'bg-[#c00015] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <span>Semua</span>
            <span
              className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-extrabold leading-none inline-flex items-center justify-center ${
                activeTab === 'semua' ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10'
              }`}
            >
              {totalSavedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('artikel')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none ${
              activeTab === 'artikel'
                ? 'bg-[#c00015] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Berita &amp; Artikel</span>
            <span
              className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-extrabold leading-none inline-flex items-center justify-center ${
                activeTab === 'artikel' ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10'
              }`}
            >
              {savedArticles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('loker');
              setActiveCategory('Semua');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none ${
              activeTab === 'loker'
                ? 'bg-[#c00015] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Lowongan Kerja</span>
            <span
              className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-extrabold leading-none inline-flex items-center justify-center ${
                activeTab === 'loker' ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10'
              }`}
            >
              {savedJobs.length}
            </span>
          </button>
        </div>

        {/* Article category filters (if in artikel or semua tab and categories > 1) */}
        {(activeTab === 'artikel' || activeTab === 'semua') && categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 mb-5">
            {categories.map(cat => {
              const isActive = activeCategory.toUpperCase() === cat.toUpperCase();
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {totalSavedCount === 0 ||
        (activeTab === 'artikel' && savedArticles.length === 0) ||
        (activeTab === 'loker' && savedJobs.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-t border-slate-200/80 dark:border-zinc-800">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-slate-400 dark:text-zinc-500">
              <Bookmark className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
              Belum Ada Konten Tersimpan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-6">
              Klik ikon bookmark/simpan pada artikel berita maupun lowongan kerja untuk menyimpannya ke daftar ini.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/berita"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c00015] hover:bg-[#a00012] text-white font-bold text-xs transition shadow-xs"
              >
                <span>Jelajahi Berita</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/loker"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition"
              >
                <span>Lihat Lowongan Kerja</span>
                <Briefcase className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* 1. SEKSI ARTIKEL TERSIMPAN */}
            {(activeTab === 'semua' || activeTab === 'artikel') && filteredArticles.length > 0 && (
              <section className="flex flex-col">
                {activeTab === 'semua' && savedJobs.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-100 dark:border-zinc-800">
                    <span className="w-1 h-3.5 bg-[#c00015] rounded-full" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                      Berita &amp; Artikel ({filteredArticles.length})
                    </h2>
                  </div>
                )}

                <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredArticles.map(article => (
                    <article
                      key={article.id}
                      className="flex flex-row gap-3.5 sm:gap-6 group py-3.5 sm:py-4 w-full items-center justify-between"
                    >
                      <div className="flex flex-row gap-3.5 sm:gap-6 flex-1 min-w-0 items-center">
                        <Link
                          href={`/artikel/${article.slug || article.id}`}
                          className="relative w-28 sm:w-44 aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden shrink-0 block bg-slate-100 dark:bg-zinc-800"
                        >
                          {/* eslint-disable-next-img-element */}
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#c00015]">
                            {article.categoryLabel || article.category}
                          </span>
                          <Link href={`/artikel/${article.slug || article.id}`}>
                            <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-[#c00015] transition-colors line-clamp-2 leading-snug">
                              {article.title}
                            </h3>
                          </Link>
                          {article.excerpt && (
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 hidden sm:block">
                              {article.excerpt}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {formatIndoDate(article.createdAt || article.publishedDate)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={e => handleRemoveArticle(article.id, e)}
                        title="Hapus dari tersimpan"
                        aria-label="Hapus artikel dari tersimpan"
                        className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 transition-colors shrink-0 ml-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* 2. SEKSI LOWONGAN KERJA TERSIMPAN */}
            {(activeTab === 'semua' || activeTab === 'loker') && savedJobs.length > 0 && (
              <section className="flex flex-col mt-2">
                {activeTab === 'semua' && savedArticles.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-100 dark:border-zinc-800">
                    <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                      Lowongan Kerja ({savedJobs.length})
                    </h2>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {savedJobs.map(job => {
                    const RoleIcon = getJobRoleIcon(job.title, job.company);
                    return (
                      <div
                        key={job.id}
                        className="p-4 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between group hover:border-[#c00015]/40 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 group-hover:scale-105 transition-transform">
                              <RoleIcon className="w-5 h-5 text-[#c00015]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <Link href={`/loker/${job.id}`}>
                                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-[#c00015] transition-colors">
                                  {job.title}
                                </h3>
                              </Link>
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 line-clamp-1">
                                {job.company}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={e => handleRemoveJob(job.id, e)}
                            title="Hapus dari tersimpan"
                            aria-label="Hapus loker dari tersimpan"
                            className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 my-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
                          <span className="text-slate-300 dark:text-zinc-700">•</span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            <Banknote className="w-3 h-3" />
                            {job.salaryRange}
                          </span>
                          <span className="text-slate-300 dark:text-zinc-700">•</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-semibold text-[9px]">
                            {job.type}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            Diposting: {formatIndoDate(job.createdAt || job.updatedAt)}
                          </span>
                          <Link
                            href={`/loker/${job.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#c00015] hover:text-[#a00012] transition"
                          >
                            <span>Detail Lowongan</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
