'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Article } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatIndoDate } from '@/lib/utils';

import { getSavedArticleIds, toggleArticleBookmark } from '@/lib/bookmarks';

interface HeroCarouselProps {
  articles: Article[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ articles }) => {
  const heroes = articles.filter(a => a.isHero);
  const heroArticles = heroes.length > 0 ? heroes.slice(0, 10) : articles.slice(0, 5);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [savedArticles, setSavedArticles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const syncSaved = () => {
      const ids = getSavedArticleIds();
      const map: Record<string, boolean> = {};
      ids.forEach(id => {
        map[id] = true;
      });
      setSavedArticles(map);
    };

    syncSaved();
    window.addEventListener('storage', syncSaved);
    window.addEventListener('bookmarks-updated', syncSaved);
    return () => {
      window.removeEventListener('storage', syncSaved);
      window.removeEventListener('bookmarks-updated', syncSaved);
    };
  }, []);

  useEffect(() => {
    if (currentSlide >= heroArticles.length) {
      setCurrentSlide(0);
    }
  }, [heroArticles.length, currentSlide]);

  useEffect(() => {
    if (heroArticles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroArticles.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroArticles.length]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleArticleBookmark(id);
    setSavedArticles(prev => ({ ...prev, [id]: newState }));
  };

  if (!heroArticles.length) return null;

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[2/1] md:aspect-[2.3/1] max-h-[350px] rounded-2xl overflow-hidden mb-4 group shadow-xs border border-slate-200 dark:border-zinc-800">
      {/* Carousel Track */}
      <div
        className="flex h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {heroArticles.map(article => (
          <article key={article.id} className="relative w-full h-full shrink-0">
            {/* eslint-disable-next-img-element */}
            <img
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Badge Atas: HEADLINE */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <Badge variant="secondary" className="shadow-xs font-bold text-[10px] uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-xs border border-white/20">
                HEADLINE
              </Badge>
            </div>

            {/* Bookmark button */}
            <button
              onClick={e => toggleBookmark(article.id, e)}
              aria-label="Bookmark Berita Utama"
              className="absolute top-3.5 right-3.5 z-10 text-white/80 hover:text-white p-1.5 rounded-full bg-black/40 backdrop-blur-xs hover:bg-[#c00015] transition-colors cursor-pointer"
            >
              <Bookmark
                className={`w-4 h-4 drop-shadow-md ${
                  savedArticles[article.id] || article.isSaved ? 'fill-current text-white' : ''
                }`}
              />
            </button>

            {/* Slide Content */}
            <div className="absolute bottom-4 sm:bottom-6 left-3.5 right-3.5 md:left-5 md:right-5 z-10 flex flex-col gap-1 sm:gap-1.5">
              {/* Badge Bawah: Kategori Berita */}
              <div className="flex items-center">
                <Badge className="bg-[#c00015] text-white font-bold text-[9px] uppercase tracking-wider">
                  {article.categoryLabel || article.category || 'BERITA'}
                </Badge>
              </div>
              <Link href={`/artikel/${article.id}`}>
                <h2 className="text-white text-sm sm:text-lg md:text-xl font-bold hover:text-red-200 transition-colors cursor-pointer line-clamp-2 leading-snug">
                  {article.title}
                </h2>
              </Link>
              <span className="text-white/80 text-[11px] font-normal">
                {formatIndoDate(article.createdAt || article.publishedDate)}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroArticles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Pindah ke slide ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full bg-white transition-all duration-300 cursor-pointer ${
              currentSlide === index ? 'opacity-100 scale-125 bg-primary' : 'opacity-50 hover:opacity-100'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
