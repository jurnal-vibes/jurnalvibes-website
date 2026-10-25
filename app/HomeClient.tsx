'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { HeroCarousel } from '@/components/cards/HeroCarousel';
import { NewsCard } from '@/components/cards/NewsCard';
import { ReelsSection } from '@/components/cards/ReelsSection';
import { HalloJurnalBanner } from '@/components/cards/HalloJurnalBanner';
import { Article } from '@/types';
import { fetchArticles } from '@/lib/wordpress';

export function HomeClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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
            }
          }
        } catch {}
      }

      // 2. Fetch from DB via API / Prisma
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

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12 flex flex-col relative">
      <main className="w-full flex flex-col gap-stack-lg">
        <HeroCarousel articles={articles} />

        {/* Section Heading: Berita Terkini */}
        <div className="flex flex-col gap-1 pt-2">
          <h2 className="text-sm sm:text-base font-bold text-on-surface tracking-wider uppercase">
            BERITA TERKINI
          </h2>
          <div className="w-10 h-[2.5px] bg-primary rounded-full mt-0.5" />
        </div>

        {displayArticles.length > 0 ? (
          <>
            {/* Feed Articles (First 2) */}
            <div className="flex flex-col gap-6">
              {displayArticles.slice(0, 2).map(article => (
                <NewsCard key={article.id} article={article} variant="row" />
              ))}
            </div>

            {/* Remaining Feed Articles */}
            {displayArticles.length > 2 && (
              <div className="flex flex-col gap-6">
                {displayArticles.slice(2, 5).map(article => (
                  <NewsCard key={article.id} article={article} variant="row" />
                ))}
              </div>
            )}

            {/* "Lihat Semua" Text Link */}
            <div className="my-1 sm:my-2 flex justify-center">
              <Link
                href="/berita"
                className="group inline-flex items-center gap-1.5 sm:gap-2 text-primary hover:text-primary-dark font-bold text-xs sm:text-base tracking-wide transition-colors cursor-pointer py-1.5 sm:py-2"
              >
                <span className="group-hover:underline underline-offset-4">Lihat Semua Berita</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-outline-variant/50 rounded-2xl my-4">
            <div className="w-12 h-12 rounded-full bg-surface-variant/60 flex items-center justify-center text-on-surface-variant/60 mb-3">
              <Newspaper className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-on-surface">Belum ada berita yang diterbitkan</h3>
            <p className="text-xs text-on-surface-variant/70 mt-1 max-w-sm">
              Berita baru akan muncul di sini setelah diterbitkan melalui Meja Redaksi.
            </p>
          </div>
        ) : null}

        {/* Hallo Jurnal Wide CTA Banner */}
        <HalloJurnalBanner />

        {/* Reels Section */}
        <ReelsSection reels={[]} limit={4} />
      </main>
    </div>
  );
}
