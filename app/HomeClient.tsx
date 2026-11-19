'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { HeroCarousel } from '@/components/cards/HeroCarousel';
import { NewsCard } from '@/components/cards/NewsCard';
import { HomeCategorySection } from '@/components/cards/HomeCategorySection';
import { ReelsSection } from '@/components/cards/ReelsSection';
import { HalloJurnalBanner } from '@/components/cards/HalloJurnalBanner';
import { PollingWidget } from '@/components/widgets/PollingWidget';
import { Article, Reel } from '@/types';
import { fetchArticles } from '@/lib/wordpress';

interface HomeClientProps {
  initialArticles?: Article[];
  initialReels?: Reel[];
}

export function HomeClient({ initialArticles = [], initialReels = [] }: HomeClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);

  useEffect(() => {
    const syncFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_articles');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArticles(parsed);
              setLoading(false);
            }
          }
        } catch {}
      }
    };

    // FIX BUG #2: Fungsi fetch terbaru dari server (bukan hanya baca localStorage)
    const fetchLatestArticles = () => {
      fetch('/api/articles', { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
        })
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setArticles(json.data);
            if (typeof window !== 'undefined') {
              localStorage.setItem('jurnal_wave_articles', JSON.stringify(json.data));
            }
            setLoading(false);
          }
        })
        .catch((err) => {
          console.warn('Background sync artikel dari server notice:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    // 1. Instant render dari initialArticles (SSR data)
    if (initialArticles && initialArticles.length > 0) {
      setArticles(initialArticles);
      try {
        localStorage.setItem('jurnal_wave_articles', JSON.stringify(initialArticles));
      } catch {}
      setLoading(false);
    } else {
      // Fallback: baca localStorage jika SSR kosong
      syncFromLocalStorage();
    }

    // 2. Background sync: selalu ambil data terbaru dari server
    fetchLatestArticles();

    // FIX BUG #11: focus handler sekarang re-fetch dari API, bukan hanya baca localStorage
    const handleFocus = () => fetchLatestArticles();
    const handleStorage = () => syncFromLocalStorage();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tampilkan seluruh artikel terkini sesuai urutan publikasi redaksi
  const displayArticles = articles;

  // Filter 7 Kategori Resmi Jurnal Wave (Murni dari Database & Sistem)
  const beritaArticles = articles.filter(
    a =>
      a.category === 'berita' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'BERITA') ||
      ((a.subCategory || '').toUpperCase() === 'BERITA')
  );

  const kulinerArticles = articles.filter(
    a =>
      a.category === 'kuliner' ||
      (a.categoryLabel && a.categoryLabel.toUpperCase() === 'KULINER') ||
      ((a.subCategory || '').toUpperCase() === 'KULINER')
  );

  const wisataArticles = articles.filter(
    a =>
      a.category === 'wisata' ||
      ['WISATA', 'TRAVELING'].includes((a.categoryLabel || '').toUpperCase()) ||
      ((a.subCategory || '').toUpperCase() === 'WISATA')
  );

  const hiburanArticles = articles.filter(
    a =>
      a.category === 'hiburan' ||
      ['HIBURAN', 'ENTERTAINMENT'].includes((a.categoryLabel || '').toUpperCase()) ||
      ((a.subCategory || '').toUpperCase() === 'HIBURAN')
  );

  const techArticles = articles.filter(
    a =>
      a.category === 'tech' ||
      ['TECH', 'TECH & GAME', 'TEKNOLOGI', 'GAME'].includes((a.categoryLabel || '').toUpperCase()) ||
      ((a.subCategory || '').toUpperCase() === 'TECH')
  );

  const sportArticles = articles.filter(
    a =>
      a.category === 'sport' ||
      ['SPORT', 'OLAHRAGA'].includes((a.categoryLabel || '').toUpperCase()) ||
      ((a.subCategory || '').toUpperCase() === 'SPORT')
  );

  const inspirasiArticles = articles.filter(
    a =>
      a.category === 'inspirasi' ||
      a.category === 'lifestyle' ||
      ['INSPIRASI', 'LIFESTYLE', 'KOMUNITAS', 'TOKOH', 'KREATIF'].includes((a.categoryLabel || '').toUpperCase()) ||
      ((a.subCategory || '').toUpperCase() === 'INSPIRASI')
  );

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12 flex flex-col relative">
      <main className="w-full flex flex-col gap-7 sm:gap-9">
        {/* 1. Hero / Headline Carousel */}
        <HeroCarousel articles={articles} />

        {/* 2. Section: Artikel Terkini */}
        <div className="w-full flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 sm:h-5 bg-[#c00015] rounded-none shrink-0 inline-block" />
              <h2 className="text-sm sm:text-base font-heading font-extrabold text-slate-900 dark:text-zinc-100 tracking-wider uppercase">
                ARTIKEL TERKINI
              </h2>
            </div>
            <Link
              href="/artikel"
              className="text-xs font-semibold text-[#c00015] hover:text-[#a00012] flex items-center gap-0.5 group transition-colors"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {displayArticles.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800/80">
              {displayArticles.slice(0, 8).map(article => (
                <NewsCard key={article.id} article={article} variant="row" />
              ))}
            </div>
          ) : !loading ? (
            <div className="flex flex-col items-center justify-center p-10 text-center bg-surface border border-outline-variant/50 rounded-2xl my-2">
              <div className="w-12 h-12 rounded-full bg-surface-variant/60 flex items-center justify-center text-on-surface-variant/60 mb-3">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-on-surface">Belum ada berita yang diterbitkan</h3>
              <p className="text-xs text-on-surface-variant/70 mt-1 max-w-sm">
                Berita baru akan muncul di sini setelah diterbitkan melalui Meja Redaksi.
              </p>
            </div>
          ) : null}
        </div>

        {/* 3. Kategori 1: BERITA */}
        <HomeCategorySection
          title="BERITA"
          href="/berita"
          articles={beritaArticles}
          reverseLayout={false}
        />

        {/* 4. Kategori 2: KULINER (Layout Seling: Kartu Kecil di Kiri, 1 Besar di Kanan) */}
        <HomeCategorySection
          title="KULINER"
          href="/kuliner"
          articles={kulinerArticles}
          reverseLayout={true}
        />

        {/* 5. Kategori 3: WISATA */}
        <HomeCategorySection
          title="WISATA"
          href="/wisata"
          articles={wisataArticles}
          reverseLayout={false}
        />

        {/* 6. Kategori 4: HIBURAN (Layout Seling) */}
        <HomeCategorySection
          title="HIBURAN"
          href="/hiburan"
          articles={hiburanArticles}
          reverseLayout={true}
        />

        {/* 7. Polling Pembaca (Jeda Interaktif di Tengah Halaman) */}
        <PollingWidget />

        {/* 8. Hallo Jurnal Action Banner (Pemisah ritme visual di tengah halaman) */}
        <HalloJurnalBanner />

        {/* 9. Kategori 5: TECH & GAME */}
        <HomeCategorySection
          title="TECH & GAME"
          href="/tech"
          articles={techArticles}
          reverseLayout={false}
        />

        {/* 10. Kategori 6: SPORT (Layout Seling) */}
        <HomeCategorySection
          title="SPORT"
          href="/sport"
          articles={sportArticles}
          reverseLayout={true}
        />

        {/* 11. Kategori 7: INSPIRASI */}
        <HomeCategorySection
          title="INSPIRASI"
          href="/inspirasi"
          articles={inspirasiArticles}
          reverseLayout={false}
        />

        {/* 12. Wave Reels Compact Carousel */}
        <ReelsSection reels={initialReels} limit={8} />
      </main>
    </div>
  );
}
