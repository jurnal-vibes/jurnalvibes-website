'use client';

import React from 'react';
import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import { Article } from '@/types';

interface NewsArticleSidebarProps {
  currentArticleId?: string;
  allArticles: Article[];
}

const FALLBACK_SIDEBAR_IMAGE =
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80';

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
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-4 bg-[#c00015] rounded-xs inline-block" />
            <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900 dark:text-white">
              TERPOPULER
            </h3>
          </div>
          {/* Garis Aksen Merah */}
          <div className="w-full border-b border-slate-100 dark:border-slate-800 relative mb-3.5">
            <div className="absolute -top-[1.5px] left-0 w-12 h-[2.5px] bg-[#c00015]" />
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
                  href={`/artikel/${item.id}`}
                  className="group p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs flex items-center gap-3 transition-all"
                >
                  {/* Thumbnail Foto */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    <img
                      src={validImg}
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_SIDEBAR_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Teks Berita */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#c00015] block mb-0.5">
                      {displayCategory}
                    </span>
                    <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-[#c00015] transition-colors line-clamp-3 leading-snug">
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
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-4 bg-[#c00015] rounded-xs inline-block" />
            <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900 dark:text-white">
              VIDEO POPULER
            </h3>
          </div>
          <div className="w-full border-b border-slate-100 dark:border-slate-800 relative mb-3.5">
            <div className="absolute -top-[1.5px] left-0 w-12 h-[2.5px] bg-[#c00015]" />
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
                  <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-[#c00015] transition-colors line-clamp-3 leading-snug">
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
      {/* 3. HALLO JURNAL (Desain Seragam dengan Terpopuler) */}
      {/* ============================================================== */}
      <section className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-4 bg-[#c00015] rounded-xs inline-block" />
          <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900 dark:text-white">
            HALLO JURNAL
          </h3>
        </div>
        <div className="w-full border-b border-slate-100 dark:border-slate-800 relative mb-3.5">
          <div className="absolute -top-[1.5px] left-0 w-12 h-[2.5px] bg-[#c00015]" />
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#c00015] block mb-1">
            Aspirasi &amp; Pengaduan Warga
          </span>
          <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug mb-1.5">
            Punya Keluhan Fasilitas Publik di Sukabumi?
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            Laporkan jalan rusak, lampu PJU mati, atau fasilitas publik langsung ke Meja Redaksi Hallo Jurnal untuk dikawal bersama.
          </p>
          <Link
            href="/halo-jurnal/lapor"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#c00015] hover:bg-[#a80012] text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <span>Kirim Laporan Warga</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. TAG POPULER (Desain Seragam dengan Terpopuler) */}
      {/* ============================================================== */}
      <section className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-4 bg-[#c00015] rounded-xs inline-block" />
          <h3 className="font-heading font-black text-sm tracking-wider uppercase text-slate-900 dark:text-white">
            TAG POPULER
          </h3>
        </div>
        <div className="w-full border-b border-slate-100 dark:border-slate-800 relative mb-3.5">
          <div className="absolute -top-[1.5px] left-0 w-12 h-[2.5px] bg-[#c00015]" />
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
