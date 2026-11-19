'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Reel } from '@/types';

interface ReelsSectionProps {
  reels?: Reel[];
  hideSeeAll?: boolean;
  hideHeader?: boolean;
  showCategoryFilter?: boolean;
  isGalleryPage?: boolean;
  title?: string;
  subtitle?: string;
  limit?: number;
}

const BASE_CATEGORIES = [
  'Semua',
  'Berita',
  'Pendidikan & Sekolah',
  'Lifestyle',
  'Kuliner',
  'Wisata',
  'Otomotif',
  'Sport & E-Sport',
  'Teknologi',
  'Science',
  'Health',
  'Loker',
  'Hiburan',
];

export const ReelsSection: React.FC<ReelsSectionProps> = ({
  reels = [],
  hideSeeAll = false,
  hideHeader = false,
  showCategoryFilter = false,
  isGalleryPage = false,
  title = 'Wave Reels',
  subtitle,
  limit
}) => {
  const [currentReels, setCurrentReels] = useState<Reel[]>(reels);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Muat seketika dari localStorage agar video reels yang diunggah pengguna langsung muncul
    const syncLocalReels = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_reels');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
              setCurrentReels(parsed);
              return true;
            }
          }
        } catch {}
      }
      return false;
    };

    const hasLocal = syncLocalReels();

    const fetchLatestReels = async () => {
      try {
        const res = await fetch('/api/reels', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
            setCurrentReels(json.data);
            if (typeof window !== 'undefined') {
              localStorage.setItem('jurnal_wave_reels', JSON.stringify(json.data));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch reels from server:', err);
      }
    };

    if (reels && reels.length > 0) {
      if (!hasLocal) setCurrentReels(reels);
    } else {
      fetchLatestReels();
    }

    const handleUpdate = () => {
      syncLocalReels();
      fetchLatestReels();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('reels-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('reels-updated', handleUpdate);
    };
  }, [reels]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>(['Semua']);
    currentReels.forEach(r => {
      if (r.category && r.category.trim()) {
        set.add(r.category.trim());
      }
    });
    BASE_CATEGORIES.forEach(c => set.add(c));
    return Array.from(set);
  }, [currentReels]);

  const filteredReels = useMemo(() => {
    let list = activeCategory === 'Semua'
      ? currentReels
      : currentReels.filter(
          reel => reel.category?.toLowerCase() === activeCategory.toLowerCase()
        );
    if (limit && limit > 0) {
      list = list.slice(0, limit);
    }
    return list;
  }, [currentReels, activeCategory, limit]);

  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!isGalleryPage && filteredReels.length === 0) {
    return null;
  }

  return (
    <section className={hideHeader ? 'my-2' : 'border-t border-slate-100 dark:border-zinc-800 pt-4 mt-2 mb-4'}>
      {/* Header ala SukabumiUpdate (dengan garis merah dan tombol Geser) */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 sm:h-5 bg-[#c00015] rounded-none shrink-0 inline-block" />
            <h2 className="font-heading font-extrabold text-sm sm:text-base tracking-wider uppercase text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>{title}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Geser Carousel */}
            {!isGalleryPage && (
              <button
                type="button"
                onClick={handleScrollRight}
                aria-label="Geser Video Reels"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700 transition cursor-pointer"
              >
                <span>Geser</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {!hideSeeAll && (
              <Link
                href="/reels"
                className="text-xs font-semibold text-[#c00015] hover:text-[#a00012] flex items-center gap-1 transition"
              >
                <span>Lihat Semua</span>
                <span className="text-[10px]">›</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Category Filter Pills (if enabled) */}
      {showCategoryFilter && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 mb-4 sm:mb-5">
          {availableCategories.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#c00015] text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 border border-slate-200/80 dark:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Responsive Layout: Compact Horizontal Slider atau Gallery Grid */}
      {filteredReels.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
          Belum ada video reels yang tersedia.
        </div>
      ) : (
        <div
          ref={sliderRef}
          className={
            isGalleryPage
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
              : 'flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2'
          }
        >
          {filteredReels.map((reel) => {
            const targetUrl = reel.socialUrl || reel.videoUrl || 'https://instagram.com';

            return (
              <a
                key={reel.id}
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={reel.title}
                className={`relative ${
                  isGalleryPage
                    ? 'w-full'
                    : 'w-[150px] sm:w-[165px] md:w-[175px] shrink-0 snap-start'
                } aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer bg-zinc-950 shadow-xs hover:shadow-md transition-all duration-300 block select-none border border-slate-200/20`}
              >
                {/* Image Poster */}
                {/* eslint-disable-next-img-element */}
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.imageAlt || reel.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Dark Gradient Overlay & Judul Simpel Sesuai Referensi Pengguna */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent flex flex-col justify-end p-2.5 sm:p-3">
                  <p className="text-white font-heading font-semibold text-[11px] sm:text-xs leading-snug line-clamp-2 drop-shadow-xs group-hover:underline underline-offset-2 decoration-white/80">
                    {reel.title}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
};
