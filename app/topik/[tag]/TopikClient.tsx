'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { NewsCard } from '@/components/cards/NewsCard';
import { NewsArticleSidebar } from '@/components/layout/NewsArticleSidebar';
import { Article } from '@/types';
import { fetchArticles } from '@/lib/wordpress';

interface TopikClientProps {
  tag: string;
}

export function TopikClient({ tag }: TopikClientProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bersihkan slug tag menjadi judul tampilan (contoh: "pantai-cibuaya-sukabumi" -> "PANTAI CIBUAYA SUKABUMI")
  const decodedTag = useMemo(() => {
    try {
      return decodeURIComponent(tag).replace(/[-_]+/g, ' ').trim();
    } catch {
      return tag.replace(/[-_]+/g, ' ').trim();
    }
  }, [tag]);

  const topicTitle = decodedTag.toUpperCase();

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchArticles();
        if (data && data.length > 0) {
          setArticles(data);
        }
      } catch (err) {
        console.error('Error loading articles in TopikPage:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filter artikel yang memiliki relevansi dengan topik/tagar ini
  const matchedArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];

    const cleanQuery = decodedTag.toLowerCase().replace(/[^a-z0-9]/g, '');
    const searchWords = decodedTag
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    const scored = articles
      .map((art) => {
        let score = 0;

        // 1. Pencocokan Tagar (Bobot +5)
        const artTags = (
          Array.isArray(art.tags)
            ? art.tags
            : typeof art.tags === 'string'
            ? (art.tags as string).split(',')
            : []
        ).map((t) => String(t).toLowerCase().replace(/[^a-z0-9]/g, ''));

        if (artTags.some((t) => t.includes(cleanQuery) || cleanQuery.includes(t))) {
          score += 5;
        }

        // 2. Pencocokan Kategori / Subkategori (Bobot +4)
        const cat = (art.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const catLabel = (art.categoryLabel || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const subCat = (art.subCategory || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        if (cat && (cat.includes(cleanQuery) || cleanQuery.includes(cat))) score += 4;
        if (catLabel && (catLabel.includes(cleanQuery) || cleanQuery.includes(catLabel))) score += 4;
        if (subCat && (subCat.includes(cleanQuery) || cleanQuery.includes(subCat))) score += 4;

        // 3. Pencocokan Kata pada Judul (Bobot +2 per kata)
        const titleLower = (art.title || '').toLowerCase();
        searchWords.forEach((word) => {
          if (titleLower.includes(word)) score += 2;
        });

        // 4. Pencocokan Kata pada Cuplikan / Excerpt (Bobot +1)
        const excerptLower = (art.excerpt || '').toLowerCase();
        searchWords.forEach((word) => {
          if (excerptLower.includes(word)) score += 1;
        });

        return { article: art, score };
      })
      .filter((item) => item.score > 0);

    scored.sort((a, b) => b.score - a.score);

    // Jika ada yang cocok secara spesifik, kembalikan artikel hasil pencocokan
    if (scored.length > 0) {
      return scored.map((s) => s.article);
    }

    // Jika belum ada artikel bertagar sama persis, tampilkan artikel terkini sebagai rekomendasi
    return articles.slice(0, 5);
  }, [articles, decodedTag]);

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12 flex flex-col relative">
      {/* Breadcrumb Sederhana */}
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant/70 mb-4">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="text-slate-400">/</span>
        <Link href="/berita" className="hover:text-primary transition-colors">
          Topik
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-[#c00015] font-bold truncate max-w-[200px] sm:max-w-none">
          {topicTitle}
        </span>
      </nav>

      {/* Grid 12 Kolom Utama (Kiri: Feed Berita 8 Kolom, Kanan: Sidebar Terpopuler 4 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Kolom Kiri: Header Topik & Daftar Berita (8 Kolom) */}
        <main className="lg:col-span-8 flex flex-col min-w-0">
          {/* Header Topik Terkait (Gaya Resmi SukabumiUpdate) */}
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-1.5 h-6 bg-[#c00015] rounded-full shrink-0" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white font-heading">
              {topicTitle}
            </h1>
          </div>

          {/* Daftar Berita Terkait Topik */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-7 h-7 border-2 border-[#c00015] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Memuat berita terkait topik...</p>
            </div>
          ) : matchedArticles.length > 0 ? (
            <div className="flex flex-col">
              {matchedArticles.map((article) => (
                <NewsCard key={article.id} article={article} variant="row" />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 my-4 space-y-3">
              <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Belum ada liputan untuk topik ini
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Liputan berita seputar topik ini akan segera diperbarui oleh tim redaksi Jurnal Wave.
              </p>
              <div className="pt-2">
                <Link
                  href="/berita"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-bold transition shadow-2xs"
                >
                  Lihat Semua Berita
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Kolom Kanan: Sidebar Terpopuler (4 Kolom) */}
        <aside className="lg:col-span-4 sticky top-20">
          <NewsArticleSidebar allArticles={articles} />
        </aside>
      </div>
    </div>
  );
}
