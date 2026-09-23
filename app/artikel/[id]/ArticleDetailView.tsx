'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Bookmark,
  Share2,
  Check,
  Link as LinkIcon,
  Play,
  Pause,
  X,
  Tag
} from 'lucide-react';
import { FaFacebookF, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import { FaTelegramPlane } from 'react-icons/fa';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { NewsCard } from '@/components/cards/NewsCard';
import { Article } from '@/types';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { fetchArticlesFromSupabase, fetchArticleByIdFromSupabase } from '@/lib/supabase';

type FontSize = 'sm' | 'md' | 'lg';

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-[13px] sm:text-[14px] leading-relaxed',
  md: 'text-[15px] sm:text-[16px] leading-relaxed',
  lg: 'text-[17px] sm:text-[18px] leading-relaxed'
};

export function ArticleDetailView({ id }: { id: string }) {
  const initialArticle = DUMMY_ARTICLES.find(a => a.id === id || a.slug === id) || DUMMY_ARTICLES[0];

  const [article, setArticle] = useState<Article>(initialArticle);
  const [allArticles, setAllArticles] = useState<Article[]>(DUMMY_ARTICLES);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [headerCopied, setHeaderCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<FontSize>('md');

  // Audio Player State (Opsi 3: Floating Mini Player)
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Perkiraan durasi membaca / TTS (~140 kata per menit)
  const wordCount = article?.content ? article.content.trim().split(/\s+/).length : 0;
  const totalDuration = Math.max(30, Math.round((wordCount / 140) * 60));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startSpeech = (startFromSec = 0, currentRate = playbackRate) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Kalkulasi posisi teks berdasarkan durasi
    const fraction = totalDuration > 0 ? startFromSec / totalDuration : 0;
    const startIndex = Math.floor((article.content || '').length * fraction);
    const textToRead = `${article.title}. ` + (article.content || '').slice(startIndex);

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'id-ID';
    utterance.rate = currentRate;

    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis event:', e.error);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      const intervalMs = 50;
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + (intervalMs / 1000) * playbackRate;
          if (next >= totalDuration) {
            setIsPlaying(false);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            return 0;
          }
          return next;
        });
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackRate]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Sync active audio state to document body so floating buttons (like Chatbot) don't obstruct the player
  useEffect(() => {
    if (isAudioActive) {
      document.body.setAttribute('data-audio-player', 'active');
    } else {
      document.body.removeAttribute('data-audio-player');
    }
    return () => {
      document.body.removeAttribute('data-audio-player');
    };
  }, [isAudioActive]);

  const handlePlayToggle = () => {
    if (!isAudioActive) {
      setIsAudioActive(true);
      setIsPlaying(true);
      startSpeech(0);
    } else {
      if (isPlaying) {
        setIsPlaying(false);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.pause();
        }
      } else {
        setIsPlaying(true);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          } else {
            startSpeech(currentTime);
          }
        }
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.round(newProgress * totalDuration);
    setCurrentTime(newTime);
    if (isPlaying) {
      startSpeech(newTime);
    }
  };

  const handleSpeedToggle = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (isPlaying) {
      startSpeech(currentTime, nextRate);
    }
  };

  const handleCloseAudio = () => {
    setIsAudioActive(false);
    setIsPlaying(false);
    setCurrentTime(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

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

  const getArticleUrl = () => {
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  };

  const handleShareFacebook = () => {
    const url = getArticleUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const url = getArticleUrl();
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const url = getArticleUrl();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.title}\n\n${url}`)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const url = getArticleUrl();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`, '_blank', 'noopener,noreferrer');
  };

  const handleHeaderShare = async () => {
    const url = getArticleUrl();
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
    suka: { emoji: '👍', label: 'Suka', count: 14, userVoted: false, bg: '', border: '', text: '' },
    informatif: { emoji: '💡', label: 'Informatif', count: 9, userVoted: false, bg: '', border: '', text: '' },
    lucu: { emoji: '😂', label: 'Lucu', count: 6, userVoted: false, bg: '', border: '', text: '' },
    sedih: { emoji: '😢', label: 'Sedih', count: 4, userVoted: false, bg: '', border: '', text: '' },
    geram: { emoji: '😡', label: 'Geram', count: 2, userVoted: false, bg: '', border: '', text: '' }
  });

  const handleReactionClick = (key: string) => {
    setReactions(prev => {
      const next = { ...prev };
      const isCurrentlyVoted = prev[key].userVoted;

      // Unvote any previously selected reaction
      Object.keys(next).forEach(k => {
        if (next[k].userVoted) {
          next[k] = {
            ...next[k],
            count: Math.max(0, next[k].count - 1),
            userVoted: false
          };
        }
      });

      // If clicked reaction wasn't the active one, vote for it
      if (!isCurrentlyVoted) {
        next[key] = {
          ...next[key],
          count: next[key].count + 1,
          userVoted: true
        };
      }

      return next;
    });
  };

  const relatedArticles = allArticles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-6 lg:px-gutter pt-stack-lg pb-6 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={allArticles} />

      <main className="w-full md:w-3/4 flex flex-col gap-stack-lg pr-0 md:pr-6 lg:pr-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/70 mb-2">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <Link href="/berita" className="hover:text-primary transition-colors">
            Berita
          </Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span className="text-on-surface font-medium">{article.categoryLabel}</span>
        </nav>

        {/* Article Header (Beri Jarak dengan Judul & Rapet ke Gambar) */}
        <header className="flex flex-col gap-7 -mb-5">
          <h1 className="font-headline-xl text-xl sm:text-2xl md:text-[26px] lg:text-[28px] font-bold text-on-surface dark:text-white leading-snug tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Penulis & Tanggal (Kiri) */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-red-600 font-bold text-sm">
                  {article.author || 'Tim Redaksi'}
                </span>
                {/* Centang Biru Verifikasi */}
                <svg className="w-4 h-4 text-[#1D9BF0] inline-block shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.49 4.49 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-on-surface-variant/70">
                {article.createdAt || `${article.publishedDate} - 12:19 WIB`}
              </span>
            </div>

            {/* Tombol Bagikan Populer + Tombol Simpan (Kanan): FB -> X -> WA -> Telegram -> Salin -> Simpan */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Facebook */}
              <button
                type="button"
                onClick={handleShareFacebook}
                title="Bagikan ke Facebook"
                aria-label="Bagikan ke Facebook"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <FaFacebookF className="w-3.5 h-3.5" />
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={handleShareTwitter}
                title="Bagikan ke X (Twitter)"
                aria-label="Bagikan ke X"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <FaXTwitter className="w-3.5 h-3.5" />
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="Bagikan ke WhatsApp"
                aria-label="Bagikan ke WhatsApp"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <FaWhatsapp className="w-4 h-4" />
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleShareTelegram}
                title="Bagikan ke Telegram"
                aria-label="Bagikan ke Telegram"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#229ED9] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <FaTelegramPlane className="w-3.5 h-3.5 mr-0.5" />
              </button>

              {/* Salin Link */}
              <button
                type="button"
                onClick={handleHeaderShare}
                title={headerCopied ? 'Link Tersalin!' : 'Salin Link Artikel'}
                aria-label="Salin Link Artikel"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer relative"
              >
                {headerCopied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <LinkIcon className="w-4 h-4" />
                )}
              </button>

              {/* Tombol Simpan (Bookmark) */}
              <button
                type="button"
                onClick={() => setIsSaved(!isSaved)}
                title={isSaved ? 'Tersimpan (Klik untuk batal)' : 'Simpan Artikel'}
                aria-label="Simpan Artikel"
                className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 ${
                  isSaved
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-variant/80 text-on-surface hover:bg-surface-variant hover:text-primary border border-outline-variant/60'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image & Baris Utilitas Baca (Rapet ke Gambar) */}
        <div className="flex flex-col gap-3">
          <figure>
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-video border border-outline-variant/40">
              {/* eslint-disable-next-img-element */}
              <img
                src={article.imageUrl}
                alt={article.imageAlt || article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </figure>

          {/* Baris Utilitas Baca: Dengarkan Artikel (Kiri) & Ukuran Teks (Kanan) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          {/* Sisi Kiri: Trigger Dengarkan Artikel */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePlayToggle}
              className="inline-flex items-center gap-2.5 py-1 text-on-surface hover:text-primary text-xs sm:text-sm font-semibold transition-colors cursor-pointer group"
            >
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                {isPlaying ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </span>
              <span className="flex items-center min-h-[20px]">
                {isAudioActive ? (
                  isPlaying ? (
                    <div className="flex items-center h-5 gap-[3px] mx-1" title="Sedang Memutar">
                      <style>{`
                        @keyframes eq {
                          0%, 100% { transform: scaleY(0.25); }
                          50% { transform: scaleY(1); }
                        }
                        .eq-bar {
                          transform-origin: center;
                        }
                        .bar-1 { animation: eq 1s ease-in-out infinite 0s; }
                        .bar-2 { animation: eq 0.9s ease-in-out infinite 0.2s; }
                        .bar-3 { animation: eq 1.1s ease-in-out infinite 0.4s; }
                        .bar-4 { animation: eq 0.85s ease-in-out infinite 0.15s; }
                        .bar-5 { animation: eq 1.05s ease-in-out infinite 0.35s; }
                        .bar-6 { animation: eq 0.95s ease-in-out infinite 0.55s; }
                        .bar-7 { animation: eq 1s ease-in-out infinite 0.1s; }
                        .bar-8 { animation: eq 1.1s ease-in-out infinite 0.3s; }
                        .bar-9 { animation: eq 0.9s ease-in-out infinite 0.5s; }
                        .bar-10 { animation: eq 1.05s ease-in-out infinite 0.25s; }
                        .bar-11 { animation: eq 0.85s ease-in-out infinite 0.45s; }
                        .bar-12 { animation: eq 1s ease-in-out infinite 0.15s; }
                        .bar-13 { animation: eq 0.95s ease-in-out infinite 0.35s; }
                      `}</style>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-1"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-2"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-3"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-4"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-5"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-6"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-7"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-8"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-9"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-10"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-11"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-12"></span>
                      <span className="w-[3px] h-full bg-primary rounded-full eq-bar bar-13"></span>
                    </div>
                  ) : (
                    'Lanjutkan Dengarkan'
                  )
                ) : (
                  'Dengarkan Artikel'
                )}
              </span>
              <span className="text-on-surface-variant/70 text-xs font-normal">
                • {formatTime(totalDuration)}
              </span>
            </button>
          </div>

          {/* Sisi Kanan: Pengatur Ukuran Teks (A- / A / A+) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-medium text-on-surface-variant/70 hidden sm:inline">
              Ukuran Teks:
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                title="Ukuran teks kecil (13-14px)"
                aria-label="Ukuran teks kecil"
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  fontSize === 'sm'
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-variant/50'
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('md')}
                title="Ukuran teks normal (15-16px)"
                aria-label="Ukuran teks normal"
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  fontSize === 'md'
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-variant/50'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                title="Ukuran teks besar (17-18px)"
                aria-label="Ukuran teks besar"
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  fontSize === 'lg'
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-variant/50'
                }`}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Article Body, Reporter & Tags (Uniform Gap) */}
        <div className={`font-body-lg text-on-surface dark:text-gray-100 flex flex-col gap-3.5 transition-all duration-200 ${FONT_SIZE_CLASSES[fontSize]}`}>
          {article.content.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            if (idx === 0) {
              const cleanFirst = trimmed.replace(/^(JURNALVIBES\.COM|JURNAL VIBES)(\s*[-–—]\s*)/i, '');
              return (
                <p key={idx}>
                  <span className="text-red-600 dark:text-red-500">
                    JURNALVIBES.COM
                  </span>{' '}
                  – {cleanFirst}
                </p>
              );
            }

            return <p key={idx}>{trimmed}</p>;
          })}

          {/* Reporter & Redaktur Credit Line */}
          <div className="text-on-surface dark:text-gray-200">
            <span>
              Reporter: <strong className="font-bold text-on-surface dark:text-white">{article.reporter || (article.author && article.author !== 'Tim Redaksi' ? article.author : 'Ilham Nugraha')}</strong>
            </span>
            <span className="mx-2.5 text-outline-variant dark:text-slate-600">|</span>
            <span>
              Redaktur: <strong className="font-bold text-on-surface dark:text-white">{article.redaktur || article.editor || 'Ujang Herlan'}</strong>
            </span>
          </div>

          {/* Tags Section (Clean text/hashtag style - Tanpa Card) */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 dark:text-gray-400 mr-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-on-surface-variant/70" />
              Tag:
            </span>
            {(article.tags && article.tags.length > 0
              ? article.tags
              : [
                  article.categoryLabel || article.category,
                  article.subCategory || 'Sukabumi',
                  'JurnalVibes',
                  'Trending'
                ]
            ).map((tag, idx) => {
              const cleanTag = tag.replace(/^#/, '');
              return (
                <Link
                  key={idx}
                  href={`/berita?q=${encodeURIComponent(cleanTag)}`}
                  className="text-xs sm:text-sm font-medium text-on-surface-variant/90 hover:text-primary dark:text-gray-400 dark:hover:text-primary hover:underline transition-colors"
                >
                  #{cleanTag}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Reaction Section (Simple Pill Bar with Label) */}
        <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="text-xs font-semibold text-on-surface-variant/70 mr-1 select-none">
            Reaksi:
          </span>
          {Object.entries(reactions).map(([key, r]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleReactionClick(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer active:scale-95 select-none border ${
                r.userVoted
                  ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs'
                  : 'bg-surface-variant/40 hover:bg-surface-variant/80 border-outline-variant/60 text-on-surface-variant hover:text-on-surface dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:border-slate-700'
              }`}
            >
              <span className="text-sm leading-none select-none">{r.emoji}</span>
              <span className="font-medium text-xs">{r.label}</span>
              <span className="font-bold text-[11px] ml-0.5 opacity-80">{r.count}</span>
            </button>
          ))}
        </div>

        {/* Related Articles */}
        <section className="mt-10 sm:mt-14 pb-4 sm:pb-8">
          <div className="flex flex-col gap-1 mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-on-surface dark:text-white tracking-wider uppercase">
              BERITA TERKAIT
            </h3>
            <div className="w-10 h-[2.5px] bg-primary rounded-full mt-0.5" />
          </div>
          <div className="flex flex-col gap-2 sm:gap-4">
            {relatedArticles.map(rel => (
              <NewsCard key={rel.id} article={rel} variant="row" />
            ))}
          </div>
        </section>
      </main>

      {/* Floating Bottom Mini Player (Simple Capsule - Positioned above BottomNav on mobile) */}
      {isAudioActive && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl border border-outline-variant/80 dark:border-slate-800 px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handlePlayToggle}
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shrink-0 shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title={isPlaying ? 'Jeda' : 'Putar'}
            aria-label={isPlaying ? 'Jeda' : 'Putar'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Scrubbing Bar & Time */}
          <div className="flex items-center gap-2.5 flex-grow min-w-0">
            <span className="text-[11px] font-mono text-on-surface-variant/80 shrink-0 select-none">
              {formatTime(currentTime)}
            </span>
            <div
              onClick={handleSeek}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={totalDuration}
              aria-valuenow={currentTime}
              tabIndex={0}
              className="relative flex-grow h-2 bg-outline-variant/40 dark:bg-slate-800 rounded-full cursor-pointer overflow-hidden group"
              title="Geser posisi pemutaran"
            >
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-75 ease-linear"
                style={{
                  width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`
                }}
              />
            </div>
            <span className="text-[11px] font-mono text-on-surface-variant/80 shrink-0 select-none">
              {formatTime(totalDuration)}
            </span>
          </div>

          {/* Speed & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSpeedToggle}
              title="Kecepatan pemutaran"
              className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-surface-variant/80 hover:bg-surface-variant text-on-surface dark:text-gray-200 cursor-pointer border border-outline-variant/60 transition-colors"
            >
              {playbackRate}x
            </button>
            <button
              type="button"
              onClick={handleCloseAudio}
              title="Tutup Player"
              aria-label="Tutup Player"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-surface-variant/50 hover:bg-surface-variant text-on-surface-variant hover:text-primary dark:text-gray-300 dark:hover:text-white cursor-pointer transition-all shrink-0 active:scale-90"
            >
              <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
