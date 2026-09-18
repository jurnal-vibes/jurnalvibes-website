'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Bookmark,
  Share2,
  Play,
  Volume2,
  User,
  Check
} from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { Article } from '@/types';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { fetchArticlesFromSupabase, fetchArticleByIdFromSupabase } from '@/lib/supabase';
import { ShareButtons } from '@/components/ui/ShareButtons';

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = use(params);
  const initialArticle = DUMMY_ARTICLES.find(a => a.id === id || a.slug === id) || DUMMY_ARTICLES[0];

  const [article, setArticle] = useState<Article>(initialArticle);
  const [allArticles, setAllArticles] = useState<Article[]>(DUMMY_ARTICLES);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [headerCopied, setHeaderCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [singleData, listData] = await Promise.all([
          fetchArticleByIdFromSupabase(id),
          fetchArticlesFromSupabase()
        ]);
        if (singleData) {
          setArticle(singleData);
        }
        if (listData && listData.length > 0) {
          setAllArticles(listData);
        }
      } catch (err) {
        console.error('Error fetching article detail from Supabase:', err);
      }
    }
    loadData();
  }, [id]);

  const handleHeaderShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setHeaderCopied(true);
      setTimeout(() => setHeaderCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const [reactions, setReactions] = useState<{
    [key: string]: { emoji: string; label: string; count: number; userVoted: boolean; bg: string; border: string; text: string };
  }>({
    suka: { emoji: '🔥', label: 'Suka', count: 12, userVoted: false, bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-900 dark:text-amber-200' },
    menginspirasi: { emoji: '💖', label: 'Menginspirasi', count: 8, userVoted: false, bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-900 dark:text-rose-200' },
    menarik: { emoji: '🧐', label: 'Menarik', count: 5, userVoted: false, bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-900 dark:text-amber-200' },
    inginTahu: { emoji: '🤔', label: 'Ingin Tahu', count: 3, userVoted: false, bg: 'bg-slate-100 dark:bg-slate-800/50', border: 'border-slate-300 dark:border-slate-700', text: 'text-slate-800 dark:text-slate-200' },
    menghibur: { emoji: '😂', label: 'Menghibur', count: 7, userVoted: false, bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-900 dark:text-purple-200' }
  });

  const handleReactionClick = (key: string) => {
    setReactions(prev => {
      const current = prev[key];
      return {
        ...prev,
        [key]: {
          ...current,
          count: current.userVoted ? current.count - 1 : current.count + 1,
          userVoted: !current.userVoted
        }
      };
    });
  };

  const relatedArticles = allArticles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-stack-lg pb-24 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={allArticles} />


      <main className="w-full md:w-3/4 flex flex-col gap-stack-lg pr-0 md:pr-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400 mb-2">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/berita" className="hover:text-primary transition-colors">
            Berita
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-on-surface dark:text-white font-semibold">{article.categoryLabel}</span>
        </nav>

        {/* Article Header */}
        <header className="flex flex-col gap-4 mb-4">
          <div className="inline-flex">
            <span className="bg-red-50 text-red-600 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {article.categoryLabel}
            </span>
          </div>
          <h1 className="font-headline-xl text-3xl md:text-5xl font-bold text-on-surface dark:text-white leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-outline-variant dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-on-surface-variant dark:text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-button text-on-surface dark:text-white font-bold text-sm">
                  {article.author}
                </span>
                <span className="text-xs text-on-surface-variant dark:text-gray-400">
                  {article.publishedDate} • {article.readTime || '5 min read'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSaved(!isSaved)}
                title={isSaved ? 'Hapus Simpan' : 'Simpan Artikel'}
                className="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors text-on-surface-variant dark:text-gray-400 hover:text-primary cursor-pointer"
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current text-primary' : ''}`} />
              </button>
              <button
                onClick={handleHeaderShare}
                title={headerCopied ? 'Tersalin!' : 'Salin Link Artikel'}
                className="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors text-on-surface-variant dark:text-gray-400 hover:text-primary cursor-pointer relative"
              >
                {headerCopied ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Audio Player Widget */}
        <div className="mb-6 px-4 py-3 bg-surface-container dark:bg-slate-900 rounded-full flex items-center gap-4 border border-outline-variant dark:border-slate-800">
          <button className="w-10 h-10 flex-shrink-0 bg-primary text-on-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 flex-grow">
            <span className="font-button text-on-surface dark:text-white text-sm font-semibold whitespace-nowrap">
              Dengarkan Artikel
            </span>
            <div className="flex-grow h-1.5 bg-outline-variant dark:bg-slate-700 rounded-full relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-primary" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-on-surface-variant dark:text-gray-400 tabular-nums">
              0:00 / 3:45
            </span>
            <button className="text-on-surface-variant dark:text-gray-400 hover:text-primary transition-colors cursor-pointer">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <figure className="mb-8">
          <div className="rounded-xl overflow-hidden shadow-lg aspect-video">
            {/* eslint-disable-next-img-element */}
            <img
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              className="w-full h-full object-cover"
            />
          </div>
          <figcaption className="mt-3 text-sm text-on-surface-variant dark:text-gray-400 italic text-center">
            {article.imageAlt || article.title}
          </figcaption>
        </figure>

        {/* Article Body (Dynamic & Matched) */}
        <div className="font-body-lg text-on-surface dark:text-gray-100 leading-relaxed flex flex-col gap-6 text-base md:text-lg">
          {article.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph.trim()}</p>
          ))}
        </div>

        {/* Reaction Section (BAGAIMANA REAKSI ANDA?) */}
        <div className="mt-12 pt-8 border-t border-outline-variant dark:border-slate-800">
          <h4 className="font-button text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400 mb-4">
            BAGAIMANA REAKSI ANDA?
          </h4>
          <div className="flex flex-wrap gap-3 mb-8">
            {Object.entries(reactions).map(([key, r]) => (
              <button
                key={key}
                onClick={() => handleReactionClick(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  r.bg
                } ${r.border} ${r.text} ${
                  r.userVoted ? 'ring-2 ring-primary scale-105 shadow-sm' : 'hover:scale-105'
                }`}
              >
                <span className="text-sm">{r.emoji}</span>
                <span>{r.label}</span>
                <span className="font-bold ml-0.5">{r.count}</span>
              </button>
            ))}
          </div>

          {/* Share & Save Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-outline-variant dark:border-slate-800">
            <ShareButtons title={article.title} />
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-button font-bold text-sm hover:scale-105 transition-transform cursor-pointer shadow-md"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Tersimpan' : 'Simpan Artikel'}
            </button>
          </div>
        </div>

        {/* Related Articles */}
        <section className="mt-16 pb-12">
          <h3 className="font-headline-md text-2xl font-bold text-on-surface dark:text-white mb-6">
            Berita Terkait
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map(rel => (
              <article key={rel.id} className="group cursor-pointer">
                <div className="aspect-video rounded-lg overflow-hidden mb-3">
                  {/* eslint-disable-next-img-element */}
                  <img
                    src={rel.imageUrl}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <Link href={`/artikel/${rel.id}`}>
                  <h4 className="font-button text-on-surface dark:text-white group-hover:text-primary transition-colors line-clamp-2 font-bold text-base">
                    {rel.title}
                  </h4>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
