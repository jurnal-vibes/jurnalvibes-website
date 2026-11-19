'use client';

import React from 'react';
import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import { Article } from '@/types';

interface NewsArticleSidebarProps {
  currentArticleId?: string;
  allArticles: Article[];
}

const FALLBACK_SIDEBAR_IMAGE = '/hero-banner.webp';

export function NewsArticleSidebar({
  currentArticleId,
  allArticles,
}: NewsArticleSidebarProps) {
  // 1. Ambil 5 Berita Terpopuler
  const popularArticles = React.useMemo(() => {
    const list = (allArticles || []).filter(
      (a) => a.id !== currentArticleId && a.slug !== currentArticleId
    );
    return list.slice(0, 5);
  }, [allArticles, currentArticleId]);

  // 2. Video Populer (Dikosongkan dari mock dummy)
  const popularVideos: any[] = [];

  // 3. Tag / Topik Populer Jurnal Wave
  const popularTags = [
    '#KulinerSukabumi',
    '#WisataSukabumi',
    '#Lifestyle',
    '#Otomotif',
    '#LokerSukabumi',
    '#HaloJurnal',
    '#Cikole',
    '#Palabuhanratu',
    '#JurnalWave',
  ];

  return (
    <aside className="w-full flex flex-col gap-5 select-none">
      {/* ============================================================== */}
      {/* 1. TERPOPULER (Persis seperti Screenshot Referensi SukabumiUpdate) */}
      {/* ============================================================== */}
      {popularArticles.length > 0 && (
        <section className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          {/* Header Widget */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-1 h-4.5 bg-[#c00015] rounded-none shrink-0 inline-block" />
            <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900 dark:text-white">
              TERPOPULER
            </h3>
          </div>
          {/* Garis Aksen Merah */}
          <div className="w-full border-b border-slate-200 dark:border-slate-800 relative mb-4 sm:mb-4.5">
            <div className="absolute -top-[1px] left-0 w-8 h-[2px] bg-[#c00015]" />
          </div>

          <div className="flex flex-col gap-2.5">
            {popularArticles.map((item) => {
              const rawLabel = (item.categoryLabel || item.category || 'BERITA').toUpperCase();
              const displayCategory = rawLabel === 'INFRASTRUKTUR' ? 'BERITA' : rawLabel;
              const validImg =
                item.imageUrl &&
                (item.imageUrl.startsWith('http') ||
                  item.imageUrl.startsWith('/') ||
                  item.imageUrl.startsWith('data:image/'))
                  ? item.imageUrl
                  : FALLBACK_SIDEBAR_IMAGE;

              return (
                <Link
                  key={item.id}
                  href={`/artikel/${item.slug || item.id}`}
                  className="group p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs flex items-center gap-3 transition-all"
                >
                  {/* Thumbnail Foto */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    <img
                      src={validImg}
                      alt={item.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== window.location.origin + FALLBACK_SIDEBAR_IMAGE) {
                          target.src = FALLBACK_SIDEBAR_IMAGE;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Teks Berita */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#c00015] block mb-0.5">
                      {displayCategory}
                    </span>
                    <h4 className="font-heading font-bold text-[11px] text-slate-900 dark:text-slate-100 group-hover:text-[#c00015] transition-colors line-clamp-3 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 2. VIDEO POPULER (Desain Seragam dengan Terpopuler) */}
      {/* ============================================================== */}
      {popularVideos.length > 0 && (
        <section className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-1 h-4.5 bg-[#c00015] rounded-none shrink-0 inline-block" />
            <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900 dark:text-white">
              VIDEO POPULER
            </h3>
          </div>
          <div className="w-full border-b border-slate-200 dark:border-slate-800 relative mb-4 sm:mb-4.5">
            <div className="absolute -top-[1px] left-0 w-8 h-[2px] bg-[#c00015]" />
          </div>

          <div className="flex flex-col gap-2.5">
            {popularVideos.map((vid) => (
              <Link
                key={vid.id}
                href={vid.link}
                className="group p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs flex items-center gap-3 transition-all"
              >
                {/* Thumbnail Video dengan Tombol Play Merah */}
                <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_SIDEBAR_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-5 h-5 rounded-full bg-[#c00015] text-white flex items-center justify-center shadow-xs">
                      <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Keterangan Video */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-bold text-[11px] text-slate-900 dark:text-slate-100 group-hover:text-[#c00015] transition-colors line-clamp-3 leading-snug">
                    {vid.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                    {vid.date}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 3. HALLO JURNAL BANNER (Kompak dengan Karakter 3D Beranda) */}
      {/* ============================================================== */}
      <section className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-1 h-4.5 bg-[#c00015] rounded-none shrink-0 inline-block" />
          <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900 dark:text-white">
            HALLO JURNAL
          </h3>
        </div>
        <div className="w-full border-b border-slate-200 dark:border-slate-800 relative mb-4 sm:mb-4.5">
          <div className="absolute -top-[1px] left-0 w-8 h-[2px] bg-[#c00015]" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-red-100/90 dark:border-red-900/30 bg-gradient-to-b from-red-50/40 via-white to-slate-50/50 dark:from-red-950/20 dark:via-slate-900/40 dark:to-slate-900/60 p-3 sm:p-3.5 transition-all hover:shadow-xs group">
          {/* Subtle Background Glows */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#c00015]/5 blur-2xl pointer-events-none" />

          {/* Top Row: Karakter 3D Presenter + Headline & Deskripsi Resmi */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
            <div className="relative w-18 h-24 sm:w-20 sm:h-26 shrink-0 flex items-end justify-center">
              {/* eslint-disable-next-img-element */}
              <img
                src="/hallo-jurnal-presenter.webp"
                alt="Hallo Jurnal Presenter"
                className="w-full h-full object-contain object-bottom drop-shadow-md group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-extrabold text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 leading-snug">
                Salurkan Aduan Anda
                <span className="block text-[#c00015]">di Hallo Jurnal</span>
              </h4>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5">
                Wadah aduan online dan komunikasi warga, anda secara langsung disini.
              </p>
            </div>
          </div>

          {/* Tombol CTA Menuju Layanan Hallo Jurnal */}
          <Link
            href="/halo-jurnal"
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#c00015] hover:bg-[#a80012] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer group/btn"
          >
            <span>Buka Layanan Hallo Jurnal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. TAGAR TERPOPULER (Desain Seragam dengan Terpopuler) */}
      {/* ============================================================== */}
      <section className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-1 h-4.5 bg-[#c00015] rounded-none shrink-0 inline-block" />
          <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900 dark:text-white">
            TAGAR TERPOPULER
          </h3>
        </div>
        <div className="w-full border-b border-slate-200 dark:border-slate-800 relative mb-4 sm:mb-4.5">
          <div className="absolute -top-[1px] left-0 w-8 h-[2px] bg-[#c00015]" />
        </div>

        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Link
              key={tag}
              href={`/topik/${encodeURIComponent(tag.replace(/^#/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`}
              className="px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-[#c00015] dark:hover:border-[#c00015] text-slate-700 dark:text-slate-300 hover:text-[#c00015] dark:hover:text-[#c00015] text-xs font-semibold transition-all hover:shadow-2xs"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}
