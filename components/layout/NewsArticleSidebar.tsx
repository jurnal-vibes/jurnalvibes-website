'use client';

import React from 'react';
import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import { Article } from '@/types';

interface NewsArticleSidebarProps {
  currentArticleId?: string;
  allArticles: Article[];
}

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

  // 2. Video Populer
  const popularVideos = [
    {
      id: 'v1',
      title: 'Kondisi Terkini Aspal Jalur Lingkar Selatan Sukabumi Dikebut',
      thumbnail:
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      date: 'Selasa, 22 Okt 2026, 17:07 WIB',
      link: '/reels',
    },
    {
      id: 'v2',
      title: 'Sensasi Ngopi di Tengah Hutan Pinus Cikole yang Viral',
      thumbnail:
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
      date: 'Selasa, 22 Okt 2026, 15:45 WIB',
      link: '/reels',
    },
    {
      id: 'v3',
      title: 'Pantauan Arus Wisatawan Menuju Palabuhanratu Akhir Pekan',
      thumbnail:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      date: 'Selasa, 22 Okt 2026, 11:20 WIB',
      link: '/reels',
    },
    {
      id: 'v4',
      title: 'Festival Kuliner Sukabumi 2024 Dipadati Ribuan Pengunjung',
      thumbnail:
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
      date: 'Senin, 21 Okt 2026, 19:10 WIB',
      link: '/reels',
    },
  ];

  // 3. Tag / Topik Populer Sukabumi
  const popularTags = [
    'pemda mandiri insigne sukabumi',
    'mentan gaji pegawai eselon gaji nasional',
    'oppo reno 12',
    'hitung sukabumi',
    'sarjana penggerak pembangunan indonesia',
    'kuliner sukabumi',
    'jalan lingkar selatan',
  ];

  return (
    <aside className="w-full flex flex-col gap-9 select-none">
      {/* ============================================================== */}
      {/* 1. TERPOPULER (Gaya Murni SukabumiUpdate: Tanpa Icon, Garis Merah Kiri) */}
      {/* ============================================================== */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="w-1 h-4 bg-[#c00015]" />
          <h3 className="font-heading font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100">
            Terpopuler
          </h3>
        </div>

        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/70">
          {popularArticles.map((item) => (
            <Link
              key={item.id}
              href={`/artikel/${item.id}`}
              className="group py-3 first:pt-0 last:pb-0 flex items-start gap-3 transition-colors"
            >
              {/* Thumbnail di Kiri */}
              {item.imageUrl && (
                <div className="w-20 h-14 rounded overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Teks Berita */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#c00015] block mb-0.5">
                  {item.categoryLabel || item.category || 'Sukabumi'}
                </span>
                <h4 className="font-heading font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#c00015] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. VIDEO POPULER (Gaya Murni SukabumiUpdate) */}
      {/* ============================================================== */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="w-1 h-4 bg-[#c00015]" />
          <h3 className="font-heading font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100">
            Video Populer
          </h3>
        </div>

        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/70">
          {popularVideos.map((vid) => (
            <Link
              key={vid.id}
              href={vid.link}
              className="group py-3 first:pt-0 last:pb-0 flex items-start gap-3"
            >
              {/* Thumbnail Video dengan Tombol Play Merah */}
              <div className="relative w-20 h-14 rounded overflow-hidden shrink-0 bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
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
                <h4 className="font-heading font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#c00015] transition-colors line-clamp-2 leading-snug">
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

      {/* ============================================================== */}
      {/* 3. BALE WARGA (Gaya Murni SukabumiUpdate) */}
      {/* ============================================================== */}
      <section>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="w-1 h-4 bg-[#c00015]" />
          <h3 className="font-heading font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100">
            Bale Warga
          </h3>
        </div>

        <Link
          href="/halo-jurnal"
          className="group block border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-white dark:bg-slate-900"
        >
          <div className="w-full h-32 rounded overflow-hidden mb-2.5 bg-slate-100 dark:bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80"
              alt="Bale Warga Halo Jurnal"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-[10px] font-bold uppercase text-[#c00015] block mb-1">
            Opini Warga
          </span>
          <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-[#c00015] transition-colors line-clamp-2 leading-snug mb-2">
            Mengapa Wacana Gaji ASN Lewat Koperasi adalah Skandal Besar?
          </h4>
          <span className="text-[11px] font-semibold text-[#c00015] inline-flex items-center gap-1 group-hover:underline">
            Sampaikan Aspirasi di Halo Jurnal
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </section>

      {/* ============================================================== */}
      {/* 4. TAG POPULER (Gaya Murni SukabumiUpdate) */}
      {/* ============================================================== */}
      <section>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="w-1 h-4 bg-[#c00015]" />
          <h3 className="font-heading font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100">
            Tag Populer
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}
