'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, ChevronRight } from 'lucide-react';
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';
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

    const fetchLatestReels = async () => {
      try {
        const res = await fetch('/api/reels', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            setCurrentReels(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reels from server:', err);
      }
    };

    if (reels && reels.length > 0) {
      setCurrentReels(reels);
    } else {
      fetchLatestReels();
    }

    const handleUpdate = () => {
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

  const renderPlatformBadge = (reel: Reel) => {
    const url = (reel.socialUrl || reel.videoUrl || '').toLowerCase();
    const platform = reel.platform?.toLowerCase();

    if (platform === 'tiktok' || url.includes('tiktok.com')) {
      return (
        <span
          title="Buka di TikTok"
          className="w-6 h-6 rounded-md bg-black border border-white/20 flex items-center justify-center text-white shadow-xs"
        >
          <FaTiktok className="w-3 h-3 text-white" />
        </span>
      );
    }

    if (platform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      return (
        <span
          title="Buka di YouTube Shorts"
          className="w-6 h-6 rounded-md bg-[#FF0000] border border-white/20 flex items-center justify-center text-white shadow-xs"
        >
          <FaYoutube className="w-3.5 h-3.5 text-white" />
        </span>
      );
    }

    // Default: Instagram gradient
    return (
      <span
        title="Buka di Instagram Reels"
        className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] border border-white/20 flex items-center justify-center text-white shadow-xs"
      >
        <FaInstagram className="w-3.5 h-3.5 text-white" />
      </span>
    );
  };

  return (
    <section className={hideHeader ? 'my-2' : 'border-t border-slate-100 dark:border-zinc-800 pt-4 mt-2 mb-4'}>
      {/* Header ala SukabumiUpdate (dengan garis merah dan tombol Geser) */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 sm:h-5 bg-[#c00015] rounded-full inline-block" />
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
                title={`Buka "${reel.title}" di ${reel.platform || 'Medsos'}`}
                className={`relative ${
                  isGalleryPage
                    ? 'w-full'
                    : 'w-[150px] sm:w-[165px] md:w-[175px] shrink-0 snap-start'
                } aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer bg-zinc-950 shadow-2xs hover:shadow-md transition-all duration-300 block select-none border border-slate-200/20`}
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

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/40 flex flex-col justify-between p-2 sm:p-2.5">
                  {/* Top Row: Kategori (Selaras dengan Admin) & Badge Medsos */}
                  <div className="flex items-center justify-between w-full z-10">
                    <span className="text-[8px] sm:text-[9px] font-semibold tracking-wide text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20 truncate max-w-[110px]">
                      {!reel.category || reel.category === '-' ? 'Berita' : reel.category}
                    </span>
                    {renderPlatformBadge(reel)}
                  </div>

                  {/* Center Play Button (Selaras 100% dengan Admin) */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-[#c00015] group-hover:border-[#c00015] transition-all duration-300">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Content: Creator, Title & Lokasi (Selaras dengan Admin) */}
                  <div className="flex flex-col gap-0.5 z-10">
                    <div className="flex items-center justify-between text-[9px] text-white/80">
                      {reel.creator && (
                        <span className="font-semibold line-clamp-1">
                          {reel.creator}
                        </span>
                      )}
                      {reel.location && (
                        <span className="text-[8px] text-white/70 truncate max-w-[70px]">
                          {reel.location}
                        </span>
                      )}
                    </div>

                    <p className="text-white font-bold text-[11px] sm:text-xs leading-snug line-clamp-2 drop-shadow-sm group-hover:text-red-200 transition-colors">
                      {reel.title}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
};
