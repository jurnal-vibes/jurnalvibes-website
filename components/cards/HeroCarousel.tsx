'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Article } from '@/types';
import { Badge } from '@/components/ui/badge';

interface HeroCarouselProps {
  articles: Article[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ articles }) => {
  const heroArticles = articles.filter(a => a.isHero).slice(0, 3);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [savedArticles, setSavedArticles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroArticles.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroArticles.length]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedArticles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!heroArticles.length) return null;

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden mb-4 group shadow-md border border-outline-variant/40">
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

            {/* Badge */}
            {article.badge && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="secondary" className="shadow-xs font-bold text-xs uppercase tracking-wider">
                  {article.badge}
                </Badge>
              </div>
            )}

            {/* Bookmark button */}
            <button
              onClick={e => toggleBookmark(article.id, e)}
              aria-label="Bookmark Berita Utama"
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/40 backdrop-blur-xs hover:bg-primary transition-colors cursor-pointer"
            >
              <Bookmark
                className={`w-5 h-5 drop-shadow-md ${
                  savedArticles[article.id] || article.isSaved ? 'fill-current text-white' : ''
                }`}
              />
            </button>

            {/* Slide Content */}
            <div className="absolute bottom-7 md:bottom-8 left-4 right-4 md:left-6 md:right-6 z-10 flex flex-col gap-1.5 sm:gap-2">
              <div className="flex items-center">
                <Badge className="bg-primary text-white font-bold text-[10px] uppercase tracking-wider">
                  {article.categoryLabel}
                </Badge>
              </div>
              <Link href={`/artikel/${article.id}`}>
                <h2 className="text-white text-base sm:text-xl md:text-2xl font-bold hover:text-primary-fixed transition-colors cursor-pointer line-clamp-2 leading-tight">
                  {article.title}
                </h2>
              </Link>
              <span className="text-white/80 text-xs font-normal">
                {article.createdAt}
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
