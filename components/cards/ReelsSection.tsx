'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Film, Play } from 'lucide-react';
import { Reel } from '@/types';
import { ReelsViewerModal } from '../widgets/ReelsViewerModal';

interface ReelsSectionProps {
  reels: Reel[];
  hideSeeAll?: boolean;
  hideHeader?: boolean;
  showCategoryFilter?: boolean;
  title?: string;
  subtitle?: string;
  limit?: number;
}

const CATEGORIES = ['Semua', 'Kuliner', 'Wisata', 'Lifestyle', 'Sport'];

export const ReelsSection: React.FC<ReelsSectionProps> = ({
  reels,
  hideSeeAll = false,
  hideHeader = false,
  showCategoryFilter = false,
  title = 'Vibes Reels',
  subtitle,
  limit
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const filteredReels = useMemo(() => {
    let list = activeCategory === 'Semua'
      ? reels
      : reels.filter(
          reel => reel.category?.toLowerCase() === activeCategory.toLowerCase()
        );
    if (limit && limit > 0) {
      list = list.slice(0, limit);
    }
    return list;
  }, [reels, activeCategory, limit]);

  const handleOpenViewer = (index: number) => {
    setSelectedIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <>
      <section className={hideHeader ? 'my-2' : 'border-t border-outline-variant/60 pt-stack-lg my-6'}>
        {/* Optional Header */}
        {!hideHeader && (
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col gap-1">
              <h2 className="font-headline-md text-on-surface text-xl md:text-2xl font-bold flex items-center gap-2.5">
                <Film className="w-6 h-6 text-primary shrink-0" />
                <span>{title}</span>
              </h2>
              {subtitle && (
                <p className="text-on-surface-variant text-sm font-body-md">
                  {subtitle}
                </p>
              )}
            </div>
            {!hideSeeAll && (
              <Link
                href="/reels"
                className="inline-flex items-center gap-1.5 text-primary font-button hover:text-primary-dark hover:underline text-sm font-semibold transition-colors"
              >
                <span>Lihat Semua</span>
                <span className="text-xs">→</span>
              </Link>
            )}
          </div>
        )}

        {/* Category Filter Pills (if enabled) */}
        {showCategoryFilter && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-5">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                      : 'bg-surface-variant/60 text-on-surface-variant hover:bg-surface-variant hover:text-primary border border-outline-variant/30'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Responsive Layout: Swipe/Carousel on Mobile, Grid 3-4 cols on Tablet/Desktop */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory pb-4 md:pb-0">
          {filteredReels.map((reel, idx) => (
            <div
              key={reel.id}
              onClick={() => handleOpenViewer(idx)}
              className="relative w-[190px] sm:w-[220px] md:w-auto shrink-0 snap-center md:shrink md:snap-align-none aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer bg-zinc-900 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image Poster */}
              {/* eslint-disable-next-img-element */}
              <img
                src={reel.thumbnailUrl}
                alt={reel.imageAlt || reel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3.5 sm:p-4">
                {/* Center Hover Play Indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-xs text-white flex items-center justify-center scale-95 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Content: Title & Views */}
                <div className="flex flex-col gap-1 z-10">
                  <p className="text-white font-bold text-sm sm:text-base leading-snug line-clamp-2 drop-shadow-xs">
                    {reel.title}
                  </p>

                  {reel.viewsCount && (
                    <span className="flex items-center gap-1 text-[11px] text-white/80 font-medium pt-0.5">
                      <Play className="w-3 h-3 fill-current" />
                      <span>{reel.viewsCount}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ReelsViewerModal
        reels={filteredReels}
        initialIndex={selectedIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
};



