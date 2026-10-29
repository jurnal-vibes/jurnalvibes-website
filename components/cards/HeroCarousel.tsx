'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Swipe Gesture & Mouse Drag State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);

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

  const nextSlide = useCallback(() => {
    if (heroArticles.length <= 1) return;
    setCurrentSlide(prev => (prev + 1) % heroArticles.length);
  }, [heroArticles.length]);

  const prevSlide = useCallback(() => {
    if (heroArticles.length <= 1) return;
    setCurrentSlide(prev => (prev - 1 + heroArticles.length) % heroArticles.length);
  }, [heroArticles.length]);

  // Otomatis geser bergantian, jeda saat user sedang menyentuh / drag
  useEffect(() => {
    if (heroArticles.length <= 1 || isDragging) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [heroArticles.length, isDragging, nextSlide]);

  // Touch Handlers (HP & Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (heroArticles.length <= 1) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsDragging(true);
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    if (Math.abs(diff) > 8) {
      isSwipingRef.current = true;
    }
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentXRef.current - startXRef.current;
    const threshold = 40; // batas geser 40px

    if (diff < -threshold) {
      nextSlide();
    } else if (diff > threshold) {
      prevSlide();
    }
    setDragOffset(0);
    setTimeout(() => {
      isSwipingRef.current = false;
    }, 120);
  };

  // Mouse Drag Handlers (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (heroArticles.length <= 1) return;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setIsDragging(true);
    isSwipingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    currentXRef.current = e.clientX;
    const diff = currentXRef.current - startXRef.current;
    if (Math.abs(diff) > 8) {
      isSwipingRef.current = true;
    }
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentXRef.current - startXRef.current;
    const threshold = 40;

    if (diff < -threshold) {
      nextSlide();
    } else if (diff > threshold) {
      prevSlide();
    }
    setDragOffset(0);
    setTimeout(() => {
      isSwipingRef.current = false;
    }, 120);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // Mencegah klik tautan tidak sengaja saat pengguna sedang menggeser slide
  const handleLinkClick = (e: React.MouseEvent) => {
    if (isSwipingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleArticleBookmark(id);
    setSavedArticles(prev => ({ ...prev, [id]: newState }));
  };

  if (!heroArticles.length) return null;

  return (
    <div
      className="relative w-full aspect-[16/10] sm:aspect-[2/1] md:aspect-[2.3/1] max-h-[350px] rounded-2xl overflow-hidden mb-4 group shadow-xs border border-slate-200 dark:border-zinc-800 select-none touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Track dengan Animasi Swipe Real-Time */}
      <div
        className={`flex h-full w-full ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
        style={{
          transform: isDragging
            ? `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`
            : `translateX(-${currentSlide * 100}%)`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {heroArticles.map(article => (
          <article key={article.id} className="relative w-full h-full shrink-0">
            {/* eslint-disable-next-img-element */}
            <img
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Badge Atas: HEADLINE */}
            <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
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
              <Link href={`/artikel/${article.id}`} onClick={handleLinkClick}>
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

      {/* Navigasi Panah Kiri & Kanan (Desktop Hover) */}
      {heroArticles.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Headline Sebelumnya"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-xs hidden sm:flex active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Headline Selanjutnya"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-xs hidden sm:flex active:scale-95"
          >
            <ChevronRight className="w-5 h-5 -mr-0.5" />
          </button>
        </>
      )}

      {/* Navigation Indicators (Dots) */}
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
