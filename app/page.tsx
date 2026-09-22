'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { HeroCarousel } from '@/components/cards/HeroCarousel';
import { NewsCard } from '@/components/cards/NewsCard';
import { PollingWidget } from '@/components/widgets/PollingWidget';
import { ReelsSection } from '@/components/cards/ReelsSection';
import { HalloJurnalBanner } from '@/components/cards/HalloJurnalBanner';
import { Article } from '@/types';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { DUMMY_POLL, DUMMY_REELS } from '@/data/dummyPolls';
import { fetchArticlesFromSupabase } from '@/lib/supabase';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>(DUMMY_ARTICLES);

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await fetchArticlesFromSupabase();
        if (data && data.length > 0) {
          setArticles(data);
        }
      } catch (err) {
        console.error('Error fetching articles from Supabase:', err);
      }
    }
    loadArticles();
  }, []);

  // Limit feed articles to 5 total on homepage
  const feedArticles = articles.filter(a => !a.isHero).slice(0, 5);

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-stack-lg pb-24 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={articles} />

      <main className="w-full md:w-3/4 flex flex-col gap-stack-lg pr-0 md:pr-12">
        <HeroCarousel articles={articles} />

        {/* Section Heading: Berita Terkini */}
        <div className="flex flex-col gap-1 pt-2">
          <h2 className="text-sm sm:text-base font-bold text-on-surface tracking-wider uppercase">
            BERITA TERKINI
          </h2>
          <div className="w-10 h-[2.5px] bg-primary rounded-full mt-0.5" />
        </div>

        {/* Feed Articles (First 2) */}
        <div className="flex flex-col gap-6">
          {feedArticles.slice(0, 2).map(article => (
            <NewsCard key={article.id} article={article} variant="row" />
          ))}
        </div>

        {/* Polling Widget */}
        <PollingWidget poll={DUMMY_POLL} />

        {/* Remaining Feed Articles (Next 3, total 5) */}
        <div className="flex flex-col gap-6">
          {feedArticles.slice(2, 5).map(article => (
            <NewsCard key={article.id} article={article} variant="row" />
          ))}
        </div>

        {/* "Lihat Semua" Text Link */}
        <div className="my-2 flex justify-center">
          <Link
            href="/berita"
            className="group inline-flex items-center gap-2 text-primary hover:text-primary-dark font-bold text-sm sm:text-base tracking-wide transition-colors cursor-pointer py-2"
          >
            <span className="group-hover:underline underline-offset-4">Lihat Semua Berita</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Hallo Jurnal Wide CTA Banner */}
        <HalloJurnalBanner />

        {/* Reels Section (Limited to 4 items on Homepage) */}
        <ReelsSection reels={DUMMY_REELS} limit={4} />
      </main>
    </div>
  );
}


