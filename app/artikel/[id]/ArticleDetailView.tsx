'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Tag,
  RotateCcw,
  RotateCw,
  Volume2,
  Loader2,
  Clock
} from 'lucide-react';

import { NewsArticleSidebar } from '@/components/layout/NewsArticleSidebar';
import { NewsCard } from '@/components/cards/NewsCard';
import { ReelsSection } from '@/components/cards/ReelsSection';
import { Article } from '@/types';
import { fetchArticles, fetchArticleById } from '@/lib/wordpress';
import { formatIndoDateTime } from '@/lib/utils';
import { isArticleSaved, toggleArticleBookmark } from '@/lib/bookmarks';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.97.57 3.805 1.558 5.356L2 22l4.757-1.523A9.97 9.97 0 0 0 12.031 22C17.567 22 22 17.505 22 12.031 22 6.495 17.567 2 12.031 2zm0 18.232c-1.636 0-3.153-.456-4.453-1.247l-.319-.19-2.943.942.96-2.868-.208-.33a8.214 8.214 0 0 1-1.267-4.508c0-4.542 3.69-8.232 8.23-8.232s8.23 3.69 8.23 8.232c0 4.541-3.688 8.232-8.23 8.232zm4.515-6.171c-.247-.124-1.464-.722-1.691-.805-.227-.082-.392-.124-.557.124-.165.247-.64 1.805-.784.97-.144.165-.288.185-.535.062-.247-.124-1.043-.385-1.986-1.226-.734-.655-1.23-1.464-1.374-1.711-.144-.247-.015-.38.109-.503.111-.111.247-.288.371-.433.124-.144.165-.247.247-.412.082-.165.041-.309-.021-.433-.062-.124-.557-1.34-.763-1.835-.2-.484-.402-.418-.557-.426l-.474-.008c-.165 0-.433.062-.66.309-.227.247-.866.845-.866 2.062 0 1.216.886 2.392 1.01 2.557.124.165 1.742 2.66 4.22 3.732.59.255 1.05.408 1.41.522.592.188 1.13.161 1.555.098.474-.071 1.464-.598 1.67-1.175.206-.577.206-1.072.144-1.175-.062-.103-.227-.165-.474-.288z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

type FontSize = 'sm' | 'md' | 'lg';

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-[13px] sm:text-[14px] leading-relaxed',
  md: 'text-[15px] sm:text-[16px] leading-relaxed',
  lg: 'text-[17px] sm:text-[18px] leading-relaxed'
};

// Kamus Fonetik Istilah Serapan / Bahasa Inggris agar Dilafalkan Alami & Pas oleh TTS Bahasa Indonesia
// Berlaku otomatis untuk seluruh artikel berita di situs Jurnal Wave
const LOANWORD_PHONETICS: [RegExp, string][] = [
  // Musik & Event
  [/\bline[- ]?up\b/gi, 'lain ap'],
  [/\bmerchandise\b/gi, 'mercendais'],
  [/\blive\b/gi, 'laif'],
  [/\bstreaming\b/gi, 'striming'],
  [/\bevent\b/gi, 'ivent'],
  [/\bcreative\b/gi, 'kreatif'],
  [/\bfest\b/gi, 'fes'],
  [/\bshowcase\b/gi, 'syokeis'],
  [/\bteaser\b/gi, 'tiser'],
  [/\btrailer\b/gi, 'treiler'],
  [/\bcomeback\b/gi, 'kambek'],
  // Bisnis, Kuliner & Gaya Hidup
  [/\bbrand\b/gi, 'brend'],
  [/\bbooth\b/gi, 'but'],
  [/\bcoffee shop\b/gi, 'kofi syop'],
  [/\bcold brew\b/gi, 'kold bru'],
  [/\blifestyle\b/gi, 'laifstail'],
  [/\breview\b/gi, 'rivyu'],
  [/\bweekend\b/gi, 'wik-end'],
  [/\bbudget\b/gi, 'bajet'],
  [/\bworkshop\b/gi, 'worsyop'],
  [/\bmeet[- ]?up\b/gi, 'mit ap'],
  // Digital & Teknologi
  [/\bstartup\b/gi, 'start ap'],
  [/\bgadget\b/gi, 'gejet'],
  [/\bsmartphone\b/gi, 'smartfon'],
  [/\bpodcast\b/gi, 'podkes'],
  [/\bonline\b/gi, 'onlain'],
  [/\boffline\b/gi, 'oflain'],
  [/\bupdate\b/gi, 'apdet'],
  [/\bdownload\b/gi, 'daunlod'],
  [/\bupload\b/gi, 'aplod'],
  [/\bgaming\b/gi, 'geming'],
  [/\bgamer\b/gi, 'gemer'],
  [/\bgame\b/gi, 'gem'],
  [/\bcontent creator\b/gi, 'konten krieitor'],
  [/\binfluencer\b/gi, 'influenser'],
  [/\brating\b/gi, 'reiting'],
  [/\bfeedback\b/gi, 'fidbek'],
  [/\bdeadline\b/gi, 'dedlain'],
  // Format Waktu & Finansial Lokal
  [/\bWIB\b/gi, 'W I B'],
  [/\bRp\s*([\d.,]+)/gi, '$1 rupiah'],
];

export function ArticleDetailView({ id, initialData }: { id: string; initialData?: Article }) {
  const [article, setArticle] = useState<Article>(initialData as Article);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(() => (initialData?.id ? isArticleSaved(initialData.id) : false));
  const [headerCopied, setHeaderCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<FontSize>('md');

  useEffect(() => {
    if (!article?.id) return;
    const syncSaved = () => {
      setIsSaved(isArticleSaved(article.id));
    };
    syncSaved();
    window.addEventListener('storage', syncSaved);
    window.addEventListener('bookmarks-updated', syncSaved);
    return () => {
      window.removeEventListener('storage', syncSaved);
      window.removeEventListener('bookmarks-updated', syncSaved);
    };
  }, [article?.id]);

  const handleToggleBookmark = () => {
    if (!article?.id) return;
    const next = toggleArticleBookmark(article.id);
    setIsSaved(next);
  };

  // Audio Player State & Microsoft Edge TTS Streaming Engine (Gadis & Ardi)
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Perkiraan durasi membaca / TTS (~125 kata per menit) jika durasi asli belum terload
  const fullArticleSpeechText = `${article?.title || ''} ${article?.excerpt || ''} ${article?.content || ''}`.trim();
  const wordCount = fullArticleSpeechText ? fullArticleSpeechText.split(/\s+/).length : 0;
  const estimatedDuration = Math.max(15, Math.round((wordCount / 125) * 60));
  const totalDuration = audioDuration > 0 ? audioDuration : estimatedDuration;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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

  // Blob URL untuk audio yang sudah di-download (agar mobile tidak streaming)
  const audioBlobUrlRef = useRef<string | null>(null);

  // Reset pemutar saat berganti berita
  useEffect(() => {
    setIsAudioActive(false);
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setCurrentTime(0);
    setAudioDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    // Revoke blob URL lama
    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current);
      audioBlobUrlRef.current = null;
    }
  }, [article?.id]);

  // Cleanup blob URL saat unmount
  useEffect(() => {
    return () => {
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current);
      }
    };
  }, []);

  // PRE-CACHE: Download audio di background begitu halaman artikel dibuka
  // Agar saat user klik Play, audio sudah siap → langsung bunyi
  useEffect(() => {
    if (!article?.id) return;
    // Jangan pre-cache jika sudah ada blob
    if (audioBlobUrlRef.current) return;

    const controller = new AbortController();
    const precache = async () => {
      try {
        const response = await fetch(`/api/tts?id=${encodeURIComponent(article.id)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const blob = await response.blob();
        if (blob.size < 500) return;
        // Pastikan belum di-revoke oleh navigasi artikel lain
        if (controller.signal.aborted) return;
        const blobUrl = URL.createObjectURL(blob);
        audioBlobUrlRef.current = blobUrl;
      } catch {
        // Abaikan error pre-cache (user belum klik play, tidak perlu feedback)
      }
    };
    // Delay 1 detik agar tidak mengganggu load utama halaman
    const timer = setTimeout(precache, 1000);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [article?.id]);

  // Track apakah sedang menggunakan Web Speech API (fallback)
  const usingSpeechSynthRef = useRef<boolean>(false);

  // Fallback: Gunakan Web Speech API bawaan browser jika server TTS gagal
  const playWithWebSpeech = () => {
    if (!('speechSynthesis' in window)) {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      return;
    }

    const rawText = `${article?.title || ''}. ${article?.excerpt || ''}. ${article?.content || ''}`;
    const cleanText = rawText
      .replace(/<[^>]*>/g, ' ')
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 4000));
    utterance.lang = 'id-ID';
    utterance.rate = playbackRate;

    // Coba cari suara Indonesia
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.startsWith('id'));
    if (idVoice) utterance.voice = idVoice;

    utterance.onstart = () => {
      usingSpeechSynthRef.current = true;
      setIsPlaying(true);
      setIsLoadingAudio(false);
    };
    utterance.onend = () => {
      usingSpeechSynthRef.current = false;
      setIsPlaying(false);
      setCurrentTime(0);
    };
    utterance.onerror = () => {
      usingSpeechSynthRef.current = false;
      setIsPlaying(false);
      setIsLoadingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Eksekusi pemutaran audio (Server TTS + Fallback Web Speech API)
  const handlePlayToggle = async () => {
    // Jika sedang pakai Web Speech, toggle pause/resume
    if (usingSpeechSynthRef.current) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (!isAudioActive) {
      setIsAudioActive(true);
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);

    // Jika blob sudah ada (audio sudah pernah di-download), langsung play
    if (audioBlobUrlRef.current) {
      audio.playbackRate = playbackRate;
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Play from blob failed:', err);
        setIsPlaying(false);
      }
      setIsLoadingAudio(false);
      return;
    }

    // Download audio dengan TIMEOUT 12 detik (koneksi + download body)
    try {
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`/api/tts?id=${encodeURIComponent(article.id)}`, {
        signal: controller.signal,
      });

      if (!response.ok) { clearTimeout(fetchTimeout); throw new Error(`TTS API error: ${response.status}`); }

      const blob = await response.blob();
      clearTimeout(fetchTimeout);

      if (blob.size < 500) throw new Error('Audio terlalu kecil');

      const blobUrl = URL.createObjectURL(blob);
      audioBlobUrlRef.current = blobUrl;

      audio.src = blobUrl;
      audio.playbackRate = playbackRate;
      audio.load();

      // Tunggu audio siap, lalu play
      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('error', onError);
          clearTimeout(timeout);
          resolve();
        };
        const onError = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('error', onError);
          clearTimeout(timeout);
          reject(new Error('Audio load error'));
        };
        const timeout = setTimeout(() => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('error', onError);
          resolve();
        }, 5000);
        audio.addEventListener('canplaythrough', onReady, { once: true });
        audio.addEventListener('error', onError, { once: true });
      });

      await audio.play();
      setIsPlaying(true);
      setIsLoadingAudio(false);
    } catch (err) {
      console.warn('Server TTS gagal, fallback ke Web Speech:', err);
      // FALLBACK: Gunakan browser TTS bawaan HP
      playWithWebSpeech();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.round(newProgress * totalDuration);
    setCurrentTime(newTime);

    if (audioRef.current && isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSkipTime = (deltaSeconds: number) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      const targetTime = Math.max(0, Math.min(totalDuration, audioRef.current.currentTime + deltaSeconds));
      audioRef.current.currentTime = targetTime;
      setCurrentTime(Math.round(targetTime));
    } else {
      const targetTime = Math.max(0, Math.min(totalDuration, currentTime + deltaSeconds));
      setCurrentTime(targetTime);
    }
  };

  const handleSpeedToggle = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleCloseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    usingSpeechSynthRef.current = false;
    setIsAudioActive(false);
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setCurrentTime(0);
  };

  // Media Session API (Integrasi Kontrol Play/Pause di Layar Kunci & Notifikasi HP)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;

    if (isAudioActive) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: article.title,
          artist: 'Jurnal Wave',
          album: article.categoryLabel || 'Berita Sukabumi',
          artwork: [
            { src: article.imageUrl || '/logo-white.png', sizes: '512x512', type: 'image/jpeg' },
          ],
        });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        navigator.mediaSession.setActionHandler('play', () => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          } else {
            handlePlayToggle();
          }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          handleSkipTime(-10);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
          handleSkipTime(10);
        });
        navigator.mediaSession.setActionHandler('stop', () => {
          handleCloseAudio();
        });
      } catch (err) {
        console.warn('MediaSession notice:', err);
      }
    } else {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch {}
    }
  }, [isAudioActive, isPlaying, article.title, article.categoryLabel, article.imageUrl, totalDuration]);

  useEffect(() => {
    async function loadData() {
      try {
        const [singleData, listData] = await Promise.all([
          fetchArticleById(id),
          fetchArticles()
        ]);
        if (singleData) {
          setArticle(singleData);
        }
        if (listData && listData.length > 0) {
          setAllArticles(listData);
        }
      } catch (err) {
        console.error('Error fetching article detail from WordPress/fallback:', err);
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
    suka: { emoji: '👍', label: 'Suka', count: 0, userVoted: false, bg: '', border: '', text: '' },
    informatif: { emoji: '💡', label: 'Informatif', count: 0, userVoted: false, bg: '', border: '', text: '' },
    lucu: { emoji: '😂', label: 'Lucu', count: 0, userVoted: false, bg: '', border: '', text: '' },
    sedih: { emoji: '😢', label: 'Sedih', count: 0, userVoted: false, bg: '', border: '', text: '' },
    geram: { emoji: '😡', label: 'Geram', count: 0, userVoted: false, bg: '', border: '', text: '' }
  });

  // Load reaksi tersimpan dari localStorage per artikel
  useEffect(() => {
    if (typeof window !== 'undefined' && article?.id) {
      try {
        const saved = localStorage.getItem(`jurnal_wave_reactions_${article.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setReactions(prev => {
            const next = { ...prev };
            Object.keys(parsed).forEach(k => {
              if (next[k]) {
                next[k] = { ...next[k], count: parsed[k].count || 0, userVoted: Boolean(parsed[k].userVoted) };
              }
            });
            return next;
          });
        }
      } catch (e) {
        console.error('Error loading reactions from localStorage:', e);
      }
    }
  }, [article?.id]);

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

      // Simpan perubahan ke localStorage per artikel
      if (typeof window !== 'undefined' && article?.id) {
        try {
          localStorage.setItem(`jurnal_wave_reactions_${article.id}`, JSON.stringify(next));
        } catch {}
      }

      return next;
    });
  };

  // Algoritma Rekomendasi Berita Terkait Cerdas (Smart Related Articles)
  const relatedArticles = useMemo(() => {
    if (!allArticles || allArticles.length === 0 || !article) return [];

    const currentTags = (article.tags || []).map(t => t.toLowerCase().replace(/^#/, '').trim()).filter(Boolean);
    const currentCategory = (article.category || '').toLowerCase().trim();
    const currentSubCategory = (article.subCategory || '').toLowerCase().trim();

    // Kata kunci judul penting (abaikan stopwords umum bahasa Indonesia)
    const stopWords = new Set([
      'yang', 'dan', 'dari', 'untuk', 'akan', 'pada', 'dengan', 'atau', 'ini',
      'itu', 'bisa', 'oleh', 'juga', 'saat', 'para', 'ke', 'di', 'ada', 'tak'
    ]);
    const titleKeywords = (article.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !stopWords.has(w));

    const scored = allArticles
      .filter(a => a.id !== article.id && a.slug !== article.slug)
      .map(candidate => {
        let score = 0;

        // 1. Kesamaan Tagar (+4 poin per tagar yang cocok)
        const candidateTags = (candidate.tags || []).map(t => t.toLowerCase().replace(/^#/, '').trim());
        currentTags.forEach(tag => {
          if (candidateTags.includes(tag)) {
            score += 4;
          }
        });

        // 2. Kesamaan SubKategori (+3 poin)
        const candSub = (candidate.subCategory || '').toLowerCase().trim();
        if (candSub && currentSubCategory && candSub === currentSubCategory) {
          score += 3;
        }

        // 3. Kesamaan Kategori Induk (+2 poin)
        const candCat = (candidate.category || '').toLowerCase().trim();
        if (candCat && currentCategory && candCat === currentCategory) {
          score += 2;
        }

        // 4. Kesamaan Kata Kunci Judul (+1 poin)
        const candTitle = (candidate.title || '').toLowerCase();
        titleKeywords.forEach(kw => {
          if (candTitle.includes(kw)) {
            score += 1;
          }
        });

        return { article: candidate, score };
      });

    // Urutkan berdasarkan skor relevansi tertinggi
    scored.sort((a, b) => b.score - a.score);

    // Ambil top 3 artikel paling relevan
    return scored.slice(0, 3).map(item => item.article);
  }, [article, allArticles]);

  // Berita Terkini (urutkan dari yang terbaru, kecualikan artikel aktif dan berita terkait)
  const latestArticles = useMemo(() => {
    if (!allArticles || allArticles.length === 0) return [];
    const relatedIds = new Set(relatedArticles.map(r => r.id));
    const pool = allArticles.filter(a => a.id !== article?.id && a.slug !== article?.slug && !relatedIds.has(a.id));
    if (pool.length > 0) {
      return pool.slice(0, 8);
    }
    return allArticles.filter(a => a.id !== article?.id && a.slug !== article?.slug).slice(0, 8);
  }, [allArticles, article?.id, article?.slug, relatedArticles]);

  // Rekomendasi Khusus untuk Kotak "BACA JUGA" di Sela-Sela Paragraf
  const inlineRecommendedArticles = useMemo(() => {
    if (relatedArticles.length > 0) return relatedArticles;
    const others = (allArticles || []).filter(
      (a) => a.id !== article.id && a.slug !== article.slug
    );
    return others;
  }, [relatedArticles, allArticles, article?.id, article?.slug]);

  // Ekstraksi & Penataan Paragraf Jurnalistik Berita (Standar Editorial SukabumiUpdate)
  const contentParagraphs = useMemo(() => {
    const raw = article?.content || '';
    if (!raw.trim()) return [];

    // Pisahkan berdasarkan jeda baris
    const rawBlocks = raw.split(/\r?\n+/).map(p => p.trim()).filter(Boolean);

    // Pecah blok teks yang terlalu panjang (>320 char / multi kalimat) menjadi paragraf 2-3 kalimat yang nyaman dibaca
    const formatted: string[] = [];
    for (const block of rawBlocks) {
      if (block.length > 320) {
        const sentences = block.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
        if (sentences && sentences.length > 2) {
          let currentChunk: string[] = [];
          for (let i = 0; i < sentences.length; i++) {
            currentChunk.push(sentences[i].trim());
            if (currentChunk.length >= 2 && currentChunk.join(' ').length >= 180) {
              formatted.push(currentChunk.join(' '));
              currentChunk = [];
            }
          }
          if (currentChunk.length > 0) {
            formatted.push(currentChunk.join(' '));
          }
        } else {
          formatted.push(block);
        }
      } else {
        formatted.push(block);
      }
    }

    return formatted.length > 0 ? formatted : [raw.trim()];
  }, [article?.content]);

  // Topik Terkait Dinamis dari Artikel Jurnal Wave (Deduplikasi Bersih)
  const uniqueTags = useMemo(() => {
    let rawList: string[] = [];
    if (Array.isArray(article?.tags) && article.tags.length > 0) {
      rawList = article.tags;
    } else if (typeof article?.tags === 'string' && (article.tags as string).trim()) {
      rawList = (article.tags as string).split(',').map(t => t.trim());
    } else {
      rawList = [
        article?.categoryLabel || article?.category || 'Berita',
        article?.subCategory || 'Sukabumi',
        'Jurnal Wave',
      ];
    }

    const seen = new Set<string>();
    const result: string[] = [];

    for (const raw of rawList) {
      if (!raw) continue;
      const clean = String(raw).replace(/^#+/, '').trim();
      if (!clean) continue;
      const lower = clean.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(clean);
      }
    }

    return result;
  }, [article?.tags, article?.categoryLabel, article?.category, article?.subCategory]);

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12 flex flex-col relative">
      {/* Breadcrumb di Atas Grid (Gaya SukabumiUpdate: Home / Kategori) */}
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant/70 mb-3.5">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="text-slate-400">/</span>
        <Link href="/berita" className="hover:text-primary transition-colors">
          Berita
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-[#c00015] font-bold">
          {(() => {
            const raw = (article.categoryLabel || article.category || 'BERITA').toUpperCase();
            if (raw === 'INFRASTRUKTUR') return 'BERITA';
            if (raw === 'WISATA') return 'TRAVELING';
            return raw;
          })()}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Kolom Kiri: Konten Utama Artikel - Langsung diawali Judul Berita */}
        <main className="lg:col-span-8 flex flex-col gap-stack-lg min-w-0">
          {/* Article Header (Sejajar langsung secara horizontal dengan TERPOPULER di kolom kanan) */}
          <header className="flex flex-col gap-5 -mb-4">
          <h1 className="font-headline-xl text-xl sm:text-2xl md:text-[26px] lg:text-[28px] font-bold text-on-surface dark:text-white leading-snug tracking-tight">
            {article.title}
          </h1>

          {/* Lead / Subjudul / Standfirst (Ringkasan Intisari Artikel di Bawah Judul) */}
          {article.excerpt && (
            <div className="border-l-[3.5px] border-slate-900 dark:border-slate-100 pl-4 py-1 -mt-1">
              <p className="font-serif italic text-sm sm:text-[15.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                {article.excerpt}
              </p>
            </div>
          )}

          {/* Baris Meta Penulis & Tanggal (Persis SukabumiUpdate) */}
          <div className="border-t border-b border-slate-200/80 dark:border-slate-800 py-2.5 my-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Sisi Kiri: JURNALWAVE.COM • Oleh: Nama Reporter */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-[13px]">
              <span className="text-[#c00015] font-black tracking-wide uppercase">
                JURNALWAVE.COM
              </span>
              <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
              <span className="text-slate-500 dark:text-slate-400">
                Oleh:{' '}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {article.reporter || (article.author && article.author !== 'Tim Redaksi' ? article.author : 'Ilham Nugraha')}
                </strong>
              </span>
            </div>

            {/* Sisi Kanan: Tanggal & Jam Lengkap dengan Ikon Clock */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatIndoDateTime(article.createdAt || article.publishedDate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-start gap-2 flex-wrap mb-1">
            {/* Tombol Bagikan Populer + Tombol Simpan */}
              {/* Facebook */}
              <button
                type="button"
                onClick={handleShareFacebook}
                title="Bagikan ke Facebook"
                aria-label="Bagikan ke Facebook"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={handleShareTwitter}
                title="Bagikan ke X (Twitter)"
                aria-label="Bagikan ke X"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <TwitterXIcon className="w-3.5 h-3.5" />
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="Bagikan ke WhatsApp"
                aria-label="Bagikan ke WhatsApp"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleShareTelegram}
                title="Bagikan ke Telegram"
                aria-label="Bagikan ke Telegram"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#229ED9] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <TelegramIcon className="w-3.5 h-3.5 mr-0.5" />
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
                onClick={handleToggleBookmark}
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
        </header>

        {/* Featured Image & Baris Utilitas Baca (Rapet ke Gambar) */}
        <div className="flex flex-col gap-3">
          <figure>
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-video border border-outline-variant/40 bg-slate-100 dark:bg-slate-800">
              {/* eslint-disable-next-img-element */}
              <img
                src={article?.imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'}
                alt={article?.imageCaption || article?.imageAlt || article?.title || 'Jurnal Wave'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            {(article?.imageCaption || article?.imageAlt) && (
              <figcaption className="text-xs text-slate-500 dark:text-slate-400 italic text-center mt-2.5 px-3 leading-relaxed font-sans">
                {article.imageCaption || article.imageAlt}
              </figcaption>
            )}
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
                {isLoadingAudio ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </span>
              <span className="flex items-center min-h-[20px]">
                {isLoadingAudio ? (
                  <span className="text-primary font-medium text-xs">Menyiapkan Audio...</span>
                ) : isAudioActive ? (
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
        <div className={`font-sans text-slate-800 dark:text-slate-200 flex flex-col gap-5 sm:gap-6 leading-[1.85] transition-all duration-200 ${FONT_SIZE_CLASSES[fontSize]}`}>
          {contentParagraphs.map((paragraph, idx) => {
            const isFirst = idx === 0;
            const cleanFirst = isFirst
              ? paragraph.replace(/^(JURNALWAVE\.COM|JURNAL WAVE|JURNALVIBES\.COM|JURNAL VIBES)(\s*[-–—]\s*)/i, '')
              : paragraph;

            // Posisi sisipan BACA JUGA (paragraf ke-2 atau ke-3)
            const insertFirstAt = contentParagraphs.length >= 4 ? 2 : (contentParagraphs.length >= 2 ? 1 : 0);
            const insertSecondAt = contentParagraphs.length >= 7 ? 5 : -1;

            const rec1 = inlineRecommendedArticles[0];
            const rec2 = inlineRecommendedArticles[1];

            return (
              <React.Fragment key={idx}>
                {isFirst ? (
                  <p className="leading-[1.85]">
                    <strong className="font-bold text-[#c00015] dark:text-red-500">
                      JURNALWAVE.COM
                    </strong>{' '}
                    – {cleanFirst}
                  </p>
                ) : (
                  <p className="leading-[1.85]">{paragraph}</p>
                )}

                {/* Sisipan Kotak BACA JUGA Pertama (Gaya Murni SukabumiUpdate) */}
                {idx === insertFirstAt && rec1 && (
                  <div className="not-prose my-3 sm:my-4 p-3 sm:p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-1 self-stretch min-h-[1.5rem] bg-[#c00015] rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/artikel/${rec1.id}`}
                          className="group flex flex-wrap items-baseline gap-1.5 text-xs sm:text-[13.5px] leading-snug"
                        >
                          <span className="text-[#c00015] font-extrabold tracking-wider uppercase shrink-0">
                            BACA JUGA:
                          </span>
                          <span className="font-heading font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#c00015] transition-colors line-clamp-2">
                            {rec1.title}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sisipan Kotak BACA JUGA Kedua (Jika Naskah Panjang) */}
                {idx === insertSecondAt && rec2 && (
                  <div className="not-prose my-3 sm:my-4 p-3 sm:p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-1 self-stretch min-h-[1.5rem] bg-[#c00015] rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/artikel/${rec2.id}`}
                          className="group flex flex-wrap items-baseline gap-1.5 text-xs sm:text-[13.5px] leading-snug"
                        >
                          <span className="text-[#c00015] font-extrabold tracking-wider uppercase shrink-0">
                            BACA JUGA:
                          </span>
                          <span className="font-heading font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#c00015] transition-colors line-clamp-2">
                            {rec2.title}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Kotak Editor Khas SukabumiUpdate */}
          <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">
              EDITOR:
            </span>
            <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {article.redaktur || article.editor || 'Ujang Herlan'}
            </strong>
          </div>

          {/* Kotak Topik Terkait (Standar Desain SukabumiUpdate) */}
          {uniqueTags.length > 0 && (
            <div className="mt-6 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3.5 bg-[#c00015] rounded-full shrink-0" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  TOPIK TERKAIT
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {uniqueTags.map((tag, idx) => {
                  const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                  return (
                    <Link
                      key={idx}
                      href={`/topik/${encodeURIComponent(tagSlug)}`}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#c00015] hover:text-[#c00015] dark:hover:border-[#c00015] dark:hover:text-[#c00015] transition-all shadow-2xs group cursor-pointer"
                    >
                      <span className="text-[#c00015] font-bold mr-1">#</span>
                      <span>{tag}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
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
        <section className="mt-10 sm:mt-14 pb-2 sm:pb-4">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <span className="w-1.5 h-4 sm:h-5 bg-[#c00015] rounded-xs inline-block" />
            <h3 className="font-heading font-black text-sm sm:text-base tracking-wider uppercase text-slate-900 dark:text-white">
              BERITA TERKAIT
            </h3>
          </div>
          <div className="flex flex-col gap-2 sm:gap-4">
            {relatedArticles.map(rel => (
              <NewsCard key={rel.id} article={rel} variant="row" />
            ))}
          </div>
        </section>

        {/* Wave Reels */}
        <section className="mt-2 mb-6">
          <ReelsSection
            reels={[]}
            title="Wave Reels"
            limit={6}
          />
        </section>

        {/* Berita Terkini */}
        {latestArticles.length > 0 && (
          <section className="mt-4 pb-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="w-1.5 h-4 sm:h-5 bg-[#c00015] rounded-xs inline-block" />
              <h3 className="font-heading font-black text-sm sm:text-base tracking-wider uppercase text-slate-900 dark:text-white">
                BERITA TERKINI
              </h3>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4">
              {latestArticles.map(item => (
                <NewsCard key={item.id} article={item} variant="row" />
              ))}
            </div>

            {/* Tombol Tampilkan Lebih Banyak Menuju Indeks Berita */}
            <div className="flex justify-center mt-6 sm:mt-8">
              <Link
                href="/indeks-berita"
                className="inline-flex items-center justify-center px-7 sm:px-9 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Tampilkan lebih banyak
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Kolom Kanan: Sidebar Khas Portal Berita (4 dari 12 Kolom) - Sejajar langsung dengan Judul di Kiri */}
      <div className="lg:col-span-4 sticky top-20">
        <NewsArticleSidebar
          currentArticleId={article.id}
          allArticles={allArticles}
        />
      </div>
    </div>

      {/* Floating Bottom Mini Player (Simple Capsule - Positioned above BottomNav on mobile) */}
      {isAudioActive && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl border border-outline-variant/80 dark:border-slate-800 px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Rewind 10s */}
          <button
            type="button"
            onClick={() => handleSkipTime(-10)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors cursor-pointer shrink-0"
            title="Mundur 10 detik"
            aria-label="Mundur 10 detik"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handlePlayToggle}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shrink-0 shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title={isLoadingAudio ? 'Mempersiapkan audio...' : isPlaying ? 'Jeda' : 'Putar'}
            aria-label={isLoadingAudio ? 'Mempersiapkan audio...' : isPlaying ? 'Jeda' : 'Putar'}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Forward 10s */}
          <button
            type="button"
            onClick={() => handleSkipTime(10)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors cursor-pointer shrink-0"
            title="Maju 10 detik"
            aria-label="Maju 10 detik"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Scrubbing Bar & Time */}
          <div className="flex items-center gap-2 flex-grow min-w-0">
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
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-variant/80 hover:bg-surface-variant text-on-surface dark:text-gray-200 cursor-pointer border border-outline-variant/60 transition-colors"
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

      {/* Audio Elemen Fisik DOM — src di-set via blob URL oleh handlePlayToggle */}
      <audio
        ref={audioRef}
        preload="none"
        playsInline
        onTimeUpdate={(e) => {
          setCurrentTime(Math.round(e.currentTarget.currentTime));
        }}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration && isFinite(e.currentTarget.duration)) {
            setAudioDuration(Math.round(e.currentTarget.duration));
          }
        }}
        onPlaying={() => {
          setIsLoadingAudio(false);
          setIsPlaying(true);
        }}
        onWaiting={() => {
          setIsLoadingAudio(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={(e) => {
          console.warn('Audio error:', e);
          setIsLoadingAudio(false);
          setIsPlaying(false);
        }}
        className="hidden"
      />
    </div>
  );
}
