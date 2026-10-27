'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { HeroCarousel } from '@/components/cards/HeroCarousel';
import { NewsCard } from '@/components/cards/NewsCard';
import { HomeCategorySection } from '@/components/cards/HomeCategorySection';
import { ReelsSection } from '@/components/cards/ReelsSection';
import { HalloJurnalBanner } from '@/components/cards/HalloJurnalBanner';
import { Article, Reel } from '@/types';
import { fetchArticles } from '@/lib/wordpress';

interface HomeClientProps {
  initialArticles?: Article[];
  initialReels?: Reel[];
}

export function HomeClient({ initialArticles = [], initialReels = [] }: HomeClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);

  useEffect(() => {
    async function loadArticles() {
      // 1. Sync from localStorage if present
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_articles');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArticles(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {}
      }

      // 2. Fetch from DB via API / Prisma if initialArticles was empty
      if (initialArticles.length === 0) {
        try {
          const data = await fetchArticles();
          if (data && data.length > 0) {
            setArticles(data);
          }
        } catch (err) {
          console.error('Error fetching articles:', err);
        } finally {
          setLoading(false);
        }
      }
    }

    loadArticles();

    const handleSync = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_articles');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArticles(parsed);
            }
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Filter feed articles
  const feedArticles = articles.filter(a => !a.isHero);
  const displayArticles = feedArticles.length > 0 ? feedArticles : articles;

  // Filter 4 Kategori Unggulan Jurnal Wave (Murni dari Database)
  const lifestyleArticles = articles.filter(
    a =>
      a.category === 'lifestyle' ||
      a.category === 'kuliner' ||
      ['LIFESTYLE', 'KULINER', 'FASHION'].includes((a.categoryLabel || '').toUpperCase()) ||
      ((a.subCategory || '').toUpperCase() === 'KULINER')
  );

  const techArticles = articles.filter(
    a =>
      a.category === 'tech' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'TECH') ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'TEKNOLOGI') ||
      ((a.subCategory || '').toUpperCase() === 'TECH')
  );

  const sportArticles = articles.filter(
    a =>
      a.category === 'sport' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'SPORT') ||
      ((a.subCategory || '').toUpperCase() === 'SPORT')
  );

  const otomotifArticles = articles.filter(
    a =>
      a.category === 'otomotif' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'OTOMOTIF') ||
      ((a.subCategory || '').toUpperCase() === 'OTOMOTIF')
  );

  const scienceArticles = articles.filter(
    a =>
      a.category === 'science' ||
      (a.category as string) === 'sains' ||
      ['SCIENCE', 'SAINS'].includes((a.categoryLabel || '').toUpperCase()) ||
      ['SCIENCE', 'SAINS'].includes((a.subCategory || '').toUpperCase())
  );

  const healthArticles = articles.filter(
    a =>
      a.category === 'health' ||
      (a.category as string) === 'kesehatan' ||
      ['HEALTH', 'KESEHATAN'].includes((a.categoryLabel || '').toUpperCase()) ||
      ['HEALTH', 'KESEHATAN'].includes((a.subCategory || '').toUpperCase())
  );

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12 flex flex-col relative">
      <main className="w-full flex flex-col gap-7 sm:gap-9">
        {/* 1. Hero / Headline Carousel */}
        <HeroCarousel articles={articles} />

        {/* 2. Section: Berita Terkini */}
        <div className="w-full flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 sm:h-5 bg-[#c00015] rounded-full" />
              <h2 className="text-sm sm:text-base font-heading font-extrabold text-slate-900 dark:text-zinc-100 tracking-wider uppercase">
                BERITA TERKINI
              </h2>
            </div>
            <Link
              href="/berita"
              className="text-xs font-semibold text-[#c00015] hover:text-[#a00012] flex items-center gap-0.5 group transition-colors"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {displayArticles.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800/80">
              {displayArticles.slice(0, 5).map(article => (
                <NewsCard key={article.id} article={article} variant="row" />
              ))}
            </div>
          ) : !loading ? (
            <div className="flex flex-col items-center justify-center p-10 text-center bg-surface border border-outline-variant/50 rounded-2xl my-2">
              <div className="w-12 h-12 rounded-full bg-surface-variant/60 flex items-center justify-center text-on-surface-variant/60 mb-3">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-on-surface">Belum ada berita yang diterbitkan</h3>
              <p className="text-xs text-on-surface-variant/70 mt-1 max-w-sm">
                Berita baru akan muncul di sini setelah diterbitkan melalui Meja Redaksi.
              </p>
            </div>
          ) : null}
        </div>

        {/* 3. Kategori 1: LIFESTYLE (Layout Seling: 1 Besar di Kiri, Kartu Kecil di Kanan) */}
        <HomeCategorySection
          title="LIFESTYLE"
          href="/lifestyle"
          articles={lifestyleArticles}
          reverseLayout={false}
        />

        {/* 4. Kategori 2: TEKNOLOGI (Layout Seling: Kartu Kecil di Kiri, 1 Besar di Kanan) */}
        <HomeCategorySection
          title="TEKNOLOGI"
          href="/tech"
          articles={techArticles}
          reverseLayout={true}
        />

        {/* 5. Hallo Jurnal Action Banner (Pemisah ritme visual di tengah halaman) */}
        <HalloJurnalBanner />

        {/* 6. Kategori 3: SPORT & E-SPORT (Layout Seling: 1 Besar di Kiri, Kartu Kecil di Kanan) */}
        <HomeCategorySection
          title="SPORT & E-SPORT"
          href="/sport"
          articles={sportArticles}
          reverseLayout={false}
        />

        {/* 7. Kategori 4: OTOMOTIF (Layout Seling: Kartu Kecil di Kiri, 1 Besar di Kanan) */}
        <HomeCategorySection
          title="OTOMOTIF"
          href="/otomotif"
          articles={otomotifArticles}
          reverseLayout={true}
        />

        {/* 8. Kategori 5: SCIENCE (Layout Seling: 1 Besar di Kiri, Kartu Kecil di Kanan) */}
        <HomeCategorySection
          title="SCIENCE"
          href="/science"
          articles={scienceArticles}
          reverseLayout={false}
        />

        {/* 9. Kategori 6: HEALTH (Layout Seling: Kartu Kecil di Kiri, 1 Besar di Kanan) */}
        <HomeCategorySection
          title="HEALTH"
          href="/health"
          articles={healthArticles}
          reverseLayout={true}
        />

        {/* 10. Wave Reels Compact Carousel */}
        <ReelsSection reels={initialReels} limit={8} />
      </main>
    </div>
  );
}
