'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Film, ExternalLink } from 'lucide-react';
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { Reel } from '@/types';

interface ReelsSectionProps {
  reels: Reel[];
  hideSeeAll?: boolean;
  hideHeader?: boolean;
  showCategoryFilter?: boolean;
  isGalleryPage?: boolean;
  title?: string;
  subtitle?: string;
  limit?: number;
}

const CATEGORIES = ['Semua', 'Kuliner', 'Wisata', 'Lifestyle', 'Sport', 'Budaya', 'Event'];

export const ReelsSection: React.FC<ReelsSectionProps> = ({
  reels,
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

  useEffect(() => {
    const syncReels = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_reels');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              // Bersihkan seluruh reel dummy sisa cache browser lama
              const clean = parsed.filter(
                (r: any) =>
                  !String(r.id || '').startsWith('reel-00') &&
                  !String(r.title || '').toLowerCase().includes('jajanan hits') &&
                  !String(r.title || '').toLowerCase().includes('bukit baros') &&
                  !String(r.title || '').toLowerCase().includes('skatepark') &&
                  !String(r.title || '').toLowerCase().includes('cikole vintage') &&
                  !String(r.title || '').toLowerCase().includes('curug cikaso') &&
                  !String(r.title || '').toLowerCase().includes('ujung genteng') &&
                  !String(r.title || '').toLowerCase().includes('ciletuh') &&
                  !String(r.title || '').toLowerCase().includes('selabintana')
              );
              if (clean.length !== parsed.length) {
                localStorage.setItem('jurnal_wave_reels', JSON.stringify(clean));
              }
              setCurrentReels(clean);
              return;
            }
          }
          if (reels && reels.length > 0) {
            const clean = reels.filter(
              (r: any) => !String(r.id || '').startsWith('reel-00')
            );
            localStorage.setItem('jurnal_wave_reels', JSON.stringify(clean));
            setCurrentReels(clean);
          } else {
            setCurrentReels([]);
          }
        } catch {}
      }
    };
    syncReels();
    window.addEventListener('storage', syncReels);
    return () => window.removeEventListener('storage', syncReels);
  }, [reels]);

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
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/85 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
        >
          <FaTiktok className="w-3.5 h-3.5 text-[#25F4EE]" />
        </span>
      );
    }
    if (platform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      return (
        <span
          title="Buka di YouTube Shorts"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FF0000] border border-white/20 flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
        >
          <FaYoutube className="w-4 h-4 text-white" />
        </span>
      );
    }
    // Default: Instagram gradient
    return (
      <span
        title="Buka di Instagram Reels"
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] border border-white/20 flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
      >
        <FaInstagram className="w-4 h-4 text-white" />
      </span>
    );
  };

  return (
    <section className={hideHeader ? 'my-2' : 'border-t border-outline-variant/60 pt-4 sm:pt-stack-lg mt-2 mb-4 sm:mb-6'}>
      {/* Optional Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3.5 sm:mb-5">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <h2 className="font-headline-md text-on-surface text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-2.5">
              <Film className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
              <span>{title}</span>
            </h2>
            {subtitle && (
              <p className="text-on-surface-variant text-xs sm:text-sm font-body-md">
                {subtitle}
              </p>
            )}
          </div>
          {!hideSeeAll && (
            <Link
              href="/reels"
              className="inline-flex items-center gap-1.5 text-primary font-button hover:text-primary-dark hover:underline text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Lihat Semua</span>
              <span className="text-xs">→</span>
            </Link>
          )}
        </div>
      )}

      {/* Category Filter Pills (if enabled) */}
      {showCategoryFilter && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 mb-4 sm:mb-5">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'bg-surface-variant/60 text-on-surface hover:bg-surface-variant border border-outline-variant/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Responsive Layout: Grid atau Carousel */}
      {filteredReels.length === 0 ? (
        <div className="py-12 text-center text-on-surface-variant text-sm border border-dashed border-outline-variant/60 rounded-xl">
          Belum ada video reels yang tersedia.
        </div>
      ) : (
        <div
          className={
            isGalleryPage
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5'
              : 'flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory pb-2 md:pb-0'
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
                    : 'w-[140px] sm:w-[180px] md:w-auto shrink-0 snap-start md:shrink md:snap-align-none'
                } aspect-[9/16] rounded-xl sm:rounded-2xl overflow-hidden group cursor-pointer bg-zinc-950 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block select-none`}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50 flex flex-col justify-between p-2.5 sm:p-3.5">
                  {/* Top Row: Mini News Portal Badge & Social Media Icon */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white/95 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/15">
                      Jurnal Wave
                    </span>
                    {renderPlatformBadge(reel)}
                  </div>

                  {/* Center Hover Action Indicator */}
                  <div className="flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/50 text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-xl">
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>

                  {/* Bottom Content: Creator & Title */}
                  <div className="flex flex-col gap-1 z-10">
                    {reel.creator && (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-white/80 line-clamp-1 drop-shadow-xs">
                        {reel.creator}
                      </span>
                    )}

                    <p className="text-white font-bold text-xs sm:text-[13px] md:text-sm leading-snug line-clamp-2 drop-shadow-sm group-hover:text-primary-light transition-colors">
                      {reel.title}
                    </p>

                    {reel.category && (
                      <span className="inline-block text-[9px] uppercase font-extrabold tracking-wider text-amber-300 drop-shadow-xs pt-0.5">
                        #{reel.category}
                      </span>
                    )}
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
