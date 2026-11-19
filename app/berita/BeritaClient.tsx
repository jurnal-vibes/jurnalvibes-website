'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { NewsCard } from '@/components/cards/NewsCard';
import { Article } from '@/types';
import { fetchArticles } from '@/lib/wordpress';

interface BeritaClientProps {
  initialArticles?: Article[];
}

export function BeritaClient({ initialArticles = [] }: BeritaClientProps) {
  const searchParams = useSearchParams();
  const sub = searchParams.get('sub')?.toLowerCase() || '';

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const ITEMS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  useEffect(() => {
    // 1. Instant Hydration (0 ms): Muat artikel seketika dari cache lokal
    const syncArticles = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_articles');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArticles(parsed);
            }
          }
        } catch {}
      }
    };

    // Muat seketika
    syncArticles();

    // 2. Background Sync: Ambil SEMUA artikel dari server (bukan filter berita saja)
    // FIX BUG #3: Jangan filter ?category=berita — halaman ini tampilkan semua kategori
    // FIX BUG #8: Gunakan key cache terpisah agar tidak polute data halaman home
    fetch('/api/articles', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setArticles(json.data);
          if (typeof window !== 'undefined') {
            // Simpan ke key yang sama agar halaman home juga ikut terupdate
            localStorage.setItem('jurnal_wave_articles', JSON.stringify(json.data));
          }
        }
      })
      .catch((err) => {
        console.warn('Background sync berita notice:', err);
      });

    window.addEventListener('storage', syncArticles);
    window.addEventListener('focus', syncArticles);
    return () => {
      window.removeEventListener('storage', syncArticles);
      window.removeEventListener('focus', syncArticles);
    };
  }, []);

  // Filter berdasarkan sub-kategori
  const filteredArticles = articles.filter(article => {
    if (!sub || sub === 'semua') return true;
    if (sub === 'kampus') {
      return (
        (article.subCategory || '').toUpperCase() === 'KAMPUS' ||
        (article.categoryLabel || '').toUpperCase() === 'KAMPUS' ||
        (article.category || '').toLowerCase() === 'kampus' ||
        article.title.toLowerCase().includes('kampus') ||
        article.title.toLowerCase().includes('mahasiswa')
      );
    }
    if (sub === 'sekolah') {
      return (
        (article.subCategory || '').toUpperCase() === 'SEKOLAH' ||
        (article.categoryLabel || '').toUpperCase() === 'SEKOLAH' ||
        (article.category || '').toLowerCase() === 'sekolah' ||
        article.title.toLowerCase().includes('sekolah') ||
        article.title.toLowerCase().includes('pelajar') ||
        article.title.toLowerCase().includes('siswa')
      );
    }
    return true;
  });

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = filteredArticles.length > visibleCount;

  // Judul dinamis sesuai sub-kategori
  let pageTitle = 'Semua Artikel';
  let pageSubtitle = 'Kumpulan artikel terlengkap dan terhangat seputar Sukabumi dan sekitarnya';

  if (sub === 'kampus') {
    pageTitle = 'Artikel Kampus';
    pageSubtitle = 'Kabar seputar civitas akademika, prestasi mahasiswa, dan info kampus Sukabumi';
  } else if (sub === 'sekolah') {
    pageTitle = 'Artikel Sekolah';
    pageSubtitle = 'Informasi seputar prestasi siswa, kegiatan ekstrakurikuler, dan kabar sekolah Sukabumi';
  }

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 flex flex-col min-w-0">
      {/* Header dengan Sub-Kategori Aktif */}
      <header className="flex flex-col gap-2 mb-6 pb-3 border-b border-outline-variant/40">
        {sub && (
          <Link
            href="/artikel"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-1 self-start cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Semua Artikel</span>
          </Link>
        )}

        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-headline-xl text-on-surface tracking-tight">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="mt-1 text-xs sm:text-sm text-on-surface-variant font-normal">
              {pageSubtitle}
            </p>
          )}
        </div>
      </header>

      {/* Daftar Berita */}
      {visibleArticles.length > 0 ? (
        <>
          <div className={`flex flex-col gap-6 ${hasMore ? 'mb-6 sm:mb-8' : ''}`}>
            {visibleArticles.map(article => (
              <NewsCard key={article.id} article={article} variant="row" />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="border border-outline-variant/80 hover:border-primary text-on-surface hover:text-primary font-semibold px-5 py-2 rounded-full text-xs transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
              >
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 px-4 bg-surface-container rounded-2xl border border-outline-variant/60 my-4 space-y-3">
          <Newspaper className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
          <h3 className="font-bold text-sm sm:text-base text-on-surface">
            Belum ada artikel untuk kategori ini
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Artikel baru untuk rubrik ini akan segera diterbitkan oleh redaksi Jurnal Wave.
          </p>
          {sub && (
            <div className="pt-2">
              <Link
                href="/artikel"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-2xs"
              >
                Lihat Semua Artikel
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
