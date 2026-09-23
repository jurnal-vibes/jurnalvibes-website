'use client';

import React, { useState } from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { FilterChips } from '@/components/ui/FilterChips';
import { NewsCard } from '@/components/cards/NewsCard';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export function LifestyleClient() {
  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const filters = ['Semua', 'Kuliner', 'Wisata', 'Musik', 'Event', 'Fashion'];

  const allLifestyleArticles = DUMMY_ARTICLES.filter(
    a =>
      a.category === 'lifestyle' ||
      ['KULINER', 'WISATA', 'MUSIK', 'EVENT LOKAL', 'FASHION', 'KOMUNITAS'].includes(
        a.categoryLabel.toUpperCase()
      ) ||
      ['KULINER', 'WISATA', 'MUSIK', 'EVENT LOKAL', 'FASHION'].includes(
        (a.subCategory || '').toUpperCase()
      )
  );

  const filteredArticles = allLifestyleArticles.filter(article => {
    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Kuliner') {
      return (
        article.categoryLabel.toUpperCase() === 'KULINER' ||
        (article.subCategory || '').toUpperCase() === 'KULINER'
      );
    }
    if (activeFilter === 'Wisata') {
      return (
        article.categoryLabel.toUpperCase() === 'WISATA' ||
        (article.subCategory || '').toUpperCase() === 'WISATA'
      );
    }
    if (activeFilter === 'Musik') {
      return (
        article.categoryLabel.toUpperCase() === 'MUSIK' ||
        (article.subCategory || '').toUpperCase() === 'MUSIK' ||
        article.badge === 'EVENT'
      );
    }
    if (activeFilter === 'Event') {
      return (
        article.categoryLabel.toUpperCase() === 'EVENT LOKAL' ||
        (article.subCategory || '').toUpperCase() === 'EVENT LOKAL' ||
        article.badge === 'EVENT'
      );
    }
    if (activeFilter === 'Fashion') {
      return (
        article.categoryLabel.toUpperCase() === 'FASHION' ||
        (article.subCategory || '').toUpperCase() === 'FASHION'
      );
    }
    return true;
  });

  return (
    <div className="flex flex-1 mx-auto max-w-container-max w-full px-margin-mobile md:px-margin-desktop gap-gutter pt-stack-lg pb-10 md:pb-stack-lg">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="w-full md:w-3/4 flex flex-col min-w-0 pr-0 md:pr-12">
        <header className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            Lifestyle & Culture
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
            Gaya hidup, tempat nongkrong, kuliner, dan tren terbaru pemuda Sukabumi
          </p>
        </header>

        <FilterChips
          categories={filters}
          activeCategory={activeFilter}
          onSelectCategory={setActiveFilter}
        />

        {filteredArticles.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredArticles.map(article => (
              <NewsCard key={article.id} article={article} variant="row" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-container rounded-2xl border border-outline-variant">
            <p className="text-on-surface-variant font-medium">
              Belum ada artikel untuk kategori <span className="font-bold text-primary">{activeFilter}</span>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
