'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { Article } from '@/types';
import { formatIndoDate } from '@/lib/utils';

export function BookmarkClient({ initialArticles = [] }: { initialArticles?: Article[] }) {
  const [allArticles] = useState<Article[]>(initialArticles);
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedIds: string[] = JSON.parse(
          localStorage.getItem('jurnal_wave_bookmarks') || '[]'
        );
        const filtered = allArticles.filter(a => savedIds.includes(a.id));
        setSavedArticles(filtered);
      } catch {
        setSavedArticles([]);
      }
    }
  }, [allArticles]);

  const removeBookmark = (id: string) => {
    setSavedArticles(prev => prev.filter(a => a.id !== id));
    if (typeof window !== 'undefined') {
      try {
        const savedIds: string[] = JSON.parse(
          localStorage.getItem('jurnal_wave_bookmarks') || '[]'
        );
        const updated = savedIds.filter(item => item !== id);
        localStorage.setItem('jurnal_wave_bookmarks', JSON.stringify(updated));
      } catch {}
    }
  };

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
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 flex flex-col min-w-0">
      <main className="w-full flex flex-col min-w-0">
        <header className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            Artikel Tersimpan
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
            Daftar berita, ulasan, dan artikel menarik yang telah Anda tandai untuk dibaca nanti.
          </p>
        </header>

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
                className="flex flex-row gap-3.5 sm:gap-6 group border-t border-outline-variant/60 pt-3.5 sm:pt-5 pb-3.5 sm:pb-5 w-full items-center justify-between"
              >
                <div className="flex flex-row gap-3.5 sm:gap-6 flex-1 min-w-0 items-center">
                  <Link
                    href={`/artikel/${article.id}`}
                    className="relative w-28 sm:w-48 md:w-52 aspect-[4/3] sm:aspect-video rounded-xl sm:rounded-2xl overflow-hidden shrink-0 block"
                  >
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary">
                      {article.categoryLabel || article.category}
                    </span>
                    <Link href={`/artikel/${article.id}`}>
                      <h2 className="text-xs sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                    </Link>
                    <p className="text-[11px] sm:text-xs text-on-surface-variant line-clamp-1 hidden sm:block">
                      {article.excerpt}
                    </p>
                    <span className="text-[10px] text-on-surface-variant/80">
                      {formatIndoDate(article.createdAt || article.publishedDate)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeBookmark(article.id)}
                  title="Hapus dari tersimpan"
                  className="p-2 sm:p-2.5 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-red-500 transition-colors shrink-0 ml-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
