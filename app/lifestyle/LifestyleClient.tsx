'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { NewsCard } from '@/components/cards/NewsCard';
import { Article } from '@/types';

export function LifestyleClient({ initialArticles = [] }: { initialArticles?: Article[] }) {
  const searchParams = useSearchParams();
  const sub = searchParams.get('sub')?.toLowerCase() || '';

  const [articles, setArticles] = useState<Article[]>(initialArticles);

  useEffect(() => {
    const deduplicate = (items: Article[]): Article[] => {
      const seen = new Set<string>();
      return items.filter(item => {
        const key = (item.slug || item.id || item.title || '').toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const syncArticles = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('jurnal_wave_articles');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArticles(prev => deduplicate([...parsed, ...prev]));
            }
          }
        } catch {}
      }
    };

    syncArticles();

    fetch('/api/articles')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setArticles(prev => deduplicate([...json.data, ...prev]));
        }
      })
      .catch(() => {});

    window.addEventListener('storage', syncArticles);
    window.addEventListener('focus', syncArticles);
    return () => {
      window.removeEventListener('storage', syncArticles);
      window.removeEventListener('focus', syncArticles);
    };
  }, []);

  const allLifestyleArticles = articles.filter(a => {
    const cat = (a.category || '').toLowerCase().trim();
    const catLabel = (a.categoryLabel || '').toUpperCase().trim();
    const subCat = (a.subCategory || '').toLowerCase().trim();

    return (
      cat === 'lifestyle' ||
      cat === 'kuliner' ||
      cat === 'wisata' ||
      ['LIFESTYLE', 'STYLE', 'CULINARY', 'KULINER', 'WISATA', 'TRAVELING', 'MUSIK', 'EVENT LOKAL', 'FASHION', 'KOMUNITAS'].some(k => catLabel.includes(k)) ||
      ['style', 'culinary', 'kuliner', 'wisata', 'traveling', 'musik', 'event lokal', 'fashion'].includes(subCat)
    );
  });

  const filteredArticles = allLifestyleArticles.filter(article => {
    if (!sub || sub === 'semua') return true;

    const catLabel = (article.categoryLabel || '').toUpperCase().trim();
    const subCat = (article.subCategory || '').toLowerCase().trim();
    const titleLower = (article.title || '').toLowerCase();

    if (sub === 'style' || sub === 'fashion') {
      return (
        subCat === 'style' ||
        subCat === 'fashion' ||
        catLabel === 'STYLE' ||
        catLabel === 'FASHION' ||
        catLabel.includes('STYLE') ||
        titleLower.includes('style') ||
        titleLower.includes('fashion') ||
        titleLower.includes('outfit')
      );
    }
    if (sub === 'culinary' || sub === 'kuliner') {
      return (
        subCat === 'culinary' ||
        subCat === 'kuliner' ||
        catLabel === 'CULINARY' ||
        catLabel === 'KULINER' ||
        catLabel.includes('KULINER') ||
        catLabel.includes('CULINARY') ||
        titleLower.includes('kuliner') ||
        titleLower.includes('makanan') ||
        titleLower.includes('jajanan') ||
        titleLower.includes('kopi') ||
        titleLower.includes('cafe')
      );
    }
    if (sub === 'traveling' || sub === 'wisata') {
      return (
        subCat === 'traveling' ||
        subCat === 'wisata' ||
        catLabel === 'TRAVELING' ||
        catLabel === 'WISATA' ||
        catLabel.includes('TRAVEL') ||
        catLabel.includes('WISATA') ||
        titleLower.includes('travel') ||
        titleLower.includes('wisata') ||
        titleLower.includes('curug') ||
        titleLower.includes('pantai') ||
        titleLower.includes('ciletuh')
      );
    }
    return true;
  });

  let pageTitle = 'Semua Lifestyle';
  let pageSubtitle = 'Gaya hidup, tempat nongkrong, kuliner, dan tren terbaru di Sukabumi';

  if (sub === 'style' || sub === 'fashion') {
    pageTitle = 'Style';
    pageSubtitle = 'Tren busana, gaya hidup anak muda, dan inspirasi outfit Sukabumi';
  } else if (sub === 'culinary' || sub === 'kuliner') {
    pageTitle = 'Culinary';
    pageSubtitle = 'Eksplorasi rasa, kuliner legendaris, kafe aesthetic, dan jajanan lezat Sukabumi';
  } else if (sub === 'traveling' || sub === 'wisata') {
    pageTitle = 'Traveling';
    pageSubtitle = 'Destinasi wisata alam Geopark Ciletuh, pantai, curug, dan spot healing Sukabumi';
  }

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 flex flex-col min-w-0">
      {/* Header dengan Sub-Kategori Aktif */}
      <header className="flex flex-col gap-2.5 mb-8 pb-4 border-b border-outline-variant/50">
        {sub && (
          <Link
            href="/lifestyle"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-1 self-start cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Semua Lifestyle</span>
          </Link>
        )}

        <div>
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </header>

      {/* Sub-Kategori Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 mb-6">
        {[
          { label: 'Semua Lifestyle', href: '/lifestyle', active: !sub },
          { label: 'Style', href: '/lifestyle?sub=style', active: sub === 'style' || sub === 'fashion' },
          { label: 'Culinary', href: '/lifestyle?sub=culinary', active: sub === 'culinary' || sub === 'kuliner' },
          { label: 'Traveling', href: '/lifestyle?sub=traveling', active: sub === 'traveling' || sub === 'wisata' },
        ].map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              item.active
                ? 'bg-primary text-white shadow-2xs font-bold'
                : 'bg-surface-variant/60 text-on-surface hover:bg-surface-variant border border-outline-variant/40'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {filteredArticles.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredArticles.map(article => (
            <NewsCard key={article.id} article={article} variant="row" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-surface-container rounded-2xl border border-outline-variant/60 my-4 space-y-3">
          <Sparkles className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
          <h3 className="font-bold text-sm sm:text-base text-on-surface">
            Belum ada artikel untuk sub-kategori ini
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Artikel baru untuk rubrik ini akan segera diterbitkan oleh redaksi Jurnal Wave.
          </p>
          {sub && (
            <div className="pt-2">
              <Link
                href="/lifestyle"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-2xs"
              >
                Lihat Semua Lifestyle
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
