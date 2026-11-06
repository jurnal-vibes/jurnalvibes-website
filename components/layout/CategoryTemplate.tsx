'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NewsCard } from '@/components/cards/NewsCard';
import { Article } from '@/types';

interface CategoryTemplateProps {
  title: string;
  description: string;
  articles: Article[];
  categoryName: string;
  allArticles?: Article[];
}

export const CategoryTemplate: React.FC<CategoryTemplateProps> = ({
  title,
  description,
  articles: initialArticles,
  categoryName,
}) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  const deduplicate = (items: Article[]): Article[] => {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = (item.slug || item.id || item.title || '').toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const matchCategory = useCallback(
    (article: Article): boolean => {
      const target = (categoryName || '').toLowerCase().trim();
      const cat = (article.category || '').toLowerCase().trim();
      const catLabel = (article.categoryLabel || '').toLowerCase().trim();
      const subCat = (article.subCategory || '').toLowerCase().trim();

      if (cat === target || catLabel === target || subCat === target) return true;

      if (target === 'otomotif') {
        return cat === 'otomotif' || catLabel === 'otomotif' || subCat === 'otomotif';
      }
      if (target === 'health') {
        return (
          cat === 'health' ||
          cat === 'kesehatan' ||
          catLabel === 'health' ||
          catLabel === 'kesehatan' ||
          subCat === 'health' ||
          subCat === 'kesehatan'
        );
      }
      if (target === 'science') {
        return (
          cat === 'science' ||
          cat === 'sains' ||
          catLabel.includes('science') ||
          catLabel.includes('sains') ||
          subCat.includes('science') ||
          subCat.includes('sains')
        );
      }
      if (target === 'sport') {
        return (
          cat === 'sport' ||
          catLabel.includes('sport') ||
          subCat.includes('sport') ||
          catLabel.includes('olahraga')
        );
      }
      if (target === 'tech') {
        return (
          cat === 'tech' ||
          catLabel.includes('tech') ||
          catLabel.includes('teknologi') ||
          subCat.includes('tech')
        );
      }
      if (target === 'berita') {
        return (
          cat === 'berita' ||
          catLabel === 'berita' ||
          cat === 'daerah' ||
          cat === 'sekolah' ||
          cat === 'kampus'
        );
      }
      if (target === 'lifestyle') {
        return (
          cat === 'lifestyle' ||
          cat === 'kuliner' ||
          cat === 'wisata' ||
          ['lifestyle', 'kuliner', 'wisata', 'fashion', 'style', 'traveling'].includes(catLabel) ||
          ['lifestyle', 'kuliner', 'wisata', 'fashion', 'style', 'traveling'].includes(subCat)
        );
      }

      return false;
    },
    [categoryName]
  );

  useEffect(() => {
    const syncArticles = () => {
      let combined: Article[] = [...initialArticles];

      // 1. Sync dari localStorage
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_articles');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const matchedFromLocal = parsed.filter(matchCategory);
              combined = deduplicate([...matchedFromLocal, ...combined]);
            }
          }
        } catch {}
      }

      setArticles(combined);
    };

    syncArticles();

    // 2. Fetch fresh dari API articles
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/articles');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const matched = json.data.filter(matchCategory);
            setArticles(prev => deduplicate([...matched, ...prev]));
          }
        }
      } catch {}
    };

    fetchLatest();

    // 3. Listener event storage & focus agar sinkron seketika saat admin terbitkan berita
    window.addEventListener('storage', syncArticles);
    window.addEventListener('focus', syncArticles);
    return () => {
      window.removeEventListener('storage', syncArticles);
      window.removeEventListener('focus', syncArticles);
    };
  }, [categoryName, initialArticles, matchCategory]);

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 flex flex-col min-w-0">
      <header className="flex flex-col gap-2.5 mb-8 pb-4 border-b border-outline-variant/50">
        <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
          {title}
        </h1>
      </header>

      {articles.length > 0 ? (
        <div className="flex flex-col gap-6">
          {articles.map(article => (
            <NewsCard key={article.id} article={article} variant="row" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-surface-container rounded-2xl border border-outline-variant/60 my-4">
          <p className="text-on-surface-variant font-medium text-sm">
            Belum ada artikel untuk kategori <span className="font-bold text-primary">{categoryName}</span>.
          </p>
        </div>
      )}
    </div>
  );
};
