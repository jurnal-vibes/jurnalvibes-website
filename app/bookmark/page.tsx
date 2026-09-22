'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export default function BookmarkPage() {
  const [savedArticles, setSavedArticles] = useState(
    DUMMY_ARTICLES.filter(a => a.isSaved)
  );
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const removeBookmark = (id: string) => {
    setSavedArticles(prev => prev.filter(a => a.id !== id));
  };

  // Kategori dinamis dari artikel tersimpan
  const categories = useMemo(() => {
    const cats = new Set<string>();
    savedArticles.forEach(a => {
      const cat = a.categoryLabel || a.category;
      if (cat) cats.add(cat.toUpperCase());
    });
    return ['Semua', ...Array.from(cats)];
  }, [savedArticles]);

  const getCategoryCount = (cat: string) => {
    if (cat === 'Semua') return savedArticles.length;
    return savedArticles.filter(a => {
      const c = (a.categoryLabel || a.category || '').toUpperCase();
      return c === cat.toUpperCase();
    }).length;
  };

  const filtered = useMemo(() => {
    if (activeCategory === 'Semua') return savedArticles;
    return savedArticles.filter(a => {
      const cat = (a.categoryLabel || a.category || '').toUpperCase();
      return cat === activeCategory.toUpperCase();
    });
  }, [savedArticles, activeCategory]);

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-stack-lg pb-24 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="w-full md:w-3/4 flex flex-col min-w-0 pr-0 md:pr-12">
        {/* Header: Mengikuti gaya font & hierarki Reels */}
        <header className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            Artikel Tersimpan
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
            Daftar berita, ulasan, dan artikel menarik yang telah Anda tandai untuk dibaca nanti.
          </p>
        </header>

        {/* Filter Badges: Meniru pill Reels yang compact & smooth dengan badge angka */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 mb-6">
            {categories.map(cat => {
              const isActive = activeCategory.toUpperCase() === cat.toUpperCase();
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-2xs'
                      : 'bg-surface-variant/60 text-on-surface hover:bg-surface-variant border border-outline-variant/40'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none transition-colors ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-on-surface/10 text-on-surface-variant'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Daftar Artikel: Format row editorial selaras dengan halaman For You */}
        <div className="flex flex-col">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-t border-outline-variant/60">
              <div className="w-14 h-14 rounded-full bg-surface-variant/70 flex items-center justify-center mb-4 text-on-surface-variant">
                <Bookmark className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-1">Belum Ada Artikel Tersimpan</h3>
              <p className="text-sm text-on-surface-variant max-w-sm mb-6">
                Simpan berita atau ulasan favorit Anda untuk dibaca kembali kapan saja.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-xs hover:shadow-md"
              >
                <span>Jelajahi Berita</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            filtered.map(article => (
              <article
                key={article.id}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 group border-t border-outline-variant/60 pt-4 sm:pt-5 pb-4 sm:pb-5 w-full items-start sm:items-center justify-between"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1 min-w-0 items-start sm:items-center">
                  <Link
                    href={`/artikel/${article.id}`}
                    className="relative w-full sm:w-48 md:w-52 aspect-video rounded-xl overflow-hidden shrink-0 block"
                  >
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={article.imageUrl}
                      alt={article.imageAlt || article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="flex flex-col gap-1.5 justify-center flex-1 min-w-0">
                    <span className="text-primary font-bold text-xs uppercase tracking-wider">
                      {article.categoryLabel || article.category}
                    </span>
                    <Link href={`/artikel/${article.id}`}>
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h2>
                    </Link>
                    <span className="text-on-surface-variant/70 text-xs font-normal">
                      {article.createdAt || article.publishedDate}
                    </span>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0 pl-2">
                  <button
                    onClick={() => removeBookmark(article.id)}
                    title="Hapus dari tersimpan"
                    aria-label="Hapus dari tersimpan"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant/80 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

