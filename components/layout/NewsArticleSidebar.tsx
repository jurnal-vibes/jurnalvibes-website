'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Flame, ArrowRight, Tag, MessageSquare, Video } from 'lucide-react';
import { Article } from '@/types';

interface NewsArticleSidebarProps {
  currentArticleId?: string;
  allArticles: Article[];
}

export function NewsArticleSidebar({
  currentArticleId,
  allArticles,
}: NewsArticleSidebarProps) {
  // 1. Ambil 5 Berita Terpopuler (selain artikel yang sedang dibuka)
  const popularArticles = React.useMemo(() => {
    const list = (allArticles || []).filter(
      (a) => a.id !== currentArticleId && a.slug !== currentArticleId
    );
    // Prioritaskan artikel dengan badge 'HOT'/'VIRAL' atau urutan awal
    return list.slice(0, 5);
  }, [allArticles, currentArticleId]);

  // 2. Video Populer / Reels Sukabumi
  const popularVideos = [
    {
      id: 'v1',
      title: 'Kondisi Terkini Aspal Jalur Lingkar Selatan Sukabumi',
      duration: '01:14',
      thumbnail:
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      views: '12.4K tayang',
      link: '/reels',
    },
    {
      id: 'v2',
      title: 'Sensasi Ngopi Pagi di Hutan Pinus Cikole Sukabumi',
      duration: '00:52',
      thumbnail:
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
      views: '8.7K tayang',
      link: '/reels',
    },
    {
      id: 'v3',
      title: 'Pantauan Arus Wisatawan Menuju Pantai Palabuhanratu',
      duration: '01:45',
      thumbnail:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      views: '19.2K tayang',
      link: '/reels',
    },
  ];

  // 3. Tag / Topik Populer Sukabumi
  const popularTags = [
    '#Sukabumi',
    '#KulinerSukabumi',
    '#JalanRusak',
    '#Cikole',
    '#Palabuhanratu',
    '#Pilkada2026',
    '#WisataAlam',
    '#GenZ',
    '#HaloJurnal',
  ];

  return (
    <aside className="w-full flex flex-col gap-8 select-none">
      {/* ============================================================== */}
      {/* 1. WIDGET BERITA TERPOPULER */}
      {/* ============================================================== */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#c00015]/10 text-[#c00015] flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-wider uppercase">
              Terpopuler
            </h3>
          </div>
          <div className="w-8 h-[2.5px] bg-[#c00015] rounded-full" />
        </div>

        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/80">
          {popularArticles.map((item, index) => {
            const rank = index + 1;
            return (
              <Link
                key={item.id}
                href={`/artikel/${item.id}`}
                className="group py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 transition-colors"
              >
                {/* Ranking Number */}
                <span
                  className={`text-lg font-heading font-black leading-none shrink-0 w-5 text-center mt-0.5 ${
                    rank === 1
                      ? 'text-[#c00015]'
                      : rank === 2
                      ? 'text-amber-600'
                      : rank === 3
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {rank}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#c00015] block mb-1">
                    {item.categoryLabel || item.category || 'Sukabumi'}
                  </span>
                  <h4 className="font-heading font-semibold text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 group-hover:text-[#c00015] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                    {item.publishedDate || 'Hari ini'}
                  </span>
                </div>

                {/* Thumbnail Mini */}
                {item.imageUrl && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. WIDGET VIDEO POPULER */}
      {/* ============================================================== */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#c00015]/10 text-[#c00015] flex items-center justify-center">
              <Video className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-wider uppercase">
              Video Populer
            </h3>
          </div>
          <Link
            href="/reels"
            className="text-[11px] font-bold text-[#c00015] hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        <div className="flex flex-col gap-3.5">
          {popularVideos.map((vid) => (
            <Link
              key={vid.id}
              href={vid.link}
              className="group flex gap-3 items-center"
            >
              <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-[#c00015] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Play className="w-3 h-3 fill-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 bg-black/75 text-white font-mono text-[9px] px-1 py-0.2 rounded font-semibold">
                  {vid.duration}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#c00015] transition-colors line-clamp-2 leading-snug">
                  {vid.title}
                </h4>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {vid.views}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. WIDGET SUARA WARGA / HALO JURNAL BANNER */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-white via-rose-50/30 to-rose-100/20 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-[#c00015]">
          <MessageSquare className="w-4 h-4" />
          <span className="font-heading font-bold text-xs uppercase tracking-wider">
            Suara Warga Sukabumi
          </span>
        </div>

        <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight leading-snug mb-1.5">
          Punya Keluhan atau Aspirasi di Wilayah Anda?
        </h4>

        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
          Laporkan fasilitas rusak, sampah, atau jalan berlubang langsung ke
          Redaksi Halo Jurnal untuk diteruskan ke dinas berwenang.
        </p>

        <Link
          href="/halo-jurnal/lapor"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#c00015] hover:bg-[#a80012] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
        >
          <span>Kirim Laporan Warga</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* ============================================================== */}
      {/* 4. WIDGET TAG POPULER */}
      {/* ============================================================== */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-wider uppercase">
              Tag Populer
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {popularTags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag.replace('#', ''))}`}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}
