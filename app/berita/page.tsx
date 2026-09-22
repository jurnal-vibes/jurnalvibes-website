'use client';

import React, { useState, useEffect } from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { FilterChips } from '@/components/ui/FilterChips';
import { NewsCard } from '@/components/cards/NewsCard';
import { Article } from '@/types';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { fetchArticlesFromSupabase } from '@/lib/supabase';

export default function BeritaPage() {
  const [articles, setArticles] = useState<Article[]>(DUMMY_ARTICLES);
  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const filters = ['Semua', 'Kampus', 'Sekolah', 'Komunitas', 'Event Lokal'];

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await fetchArticlesFromSupabase();
        if (data && data.length > 0) {
          setArticles(data);
        }
      } catch (err) {
        console.error('Error fetching articles in BeritaPage:', err);
      }
    }
    loadArticles();
  }, []);

  const ITEMS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  const handleSelectCategory = (cat: string) => {
    setActiveFilter(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const filteredArticles = articles.filter(article => {
    if (activeFilter === 'Semua' || activeFilter === 'Semua Berita') return true;
    if (activeFilter === 'Kampus') {
      return article.subCategory === 'KAMPUS' || article.categoryLabel === 'KAMPUS';
    }
    if (activeFilter === 'Sekolah') {
      return article.subCategory === 'SEKOLAH' || article.categoryLabel === 'SEKOLAH';
    }
    if (activeFilter === 'Komunitas') {
      return article.subCategory === 'KOMUNITAS' || article.categoryLabel === 'KOMUNITAS';
    }
    if (activeFilter === 'Event Lokal') {
      return (
        article.subCategory === 'EVENT LOKAL' ||
        article.categoryLabel === 'EVENT LOKAL' ||
        article.badge === 'EVENT'
      );
    }
    return true;
  });

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = filteredArticles.length > visibleCount;

  return (
    <div className="flex flex-1 mx-auto max-w-container-max w-full px-margin-mobile md:px-margin-desktop gap-gutter py-stack-lg">
      <LeftSidebar articles={articles} />

      <main className="w-full md:w-3/4 flex flex-col min-w-0 pr-0 md:pr-12 pb-24 md:pb-stack-lg">
        <header className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            Berita Terkini
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
            Informasi terhangat seputar Sukabumi dan sekitarnya
          </p>
        </header>

        <FilterChips
          categories={filters}
          activeCategory={activeFilter}
          onSelectCategory={handleSelectCategory}
        />

        {visibleArticles.length > 0 ? (
          <>
            <div className="flex flex-col gap-6 mb-8">
              {visibleArticles.map(article => (
                <NewsCard key={article.id} article={article} variant="row" />
              ))}
            </div>

            {/* Load More Button - Hanya muncul jika berita melebihi kuota tampil */}
            {hasMore && (
              <div className="flex justify-center pb-12">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  className="border border-outline-variant/80 hover:border-primary text-on-surface hover:text-primary font-semibold px-6 py-2 rounded-full text-xs transition-all cursor-pointer"
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-surface-container rounded-2xl border border-outline-variant">
            <p className="text-on-surface-variant font-medium">
              Belum ada berita untuk kategori <span className="font-bold text-primary">{activeFilter}</span>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

