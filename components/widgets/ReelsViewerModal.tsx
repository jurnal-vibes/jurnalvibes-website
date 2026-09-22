'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Heart, MessageCircle, Share2, Volume2, VolumeX, ChevronUp, ChevronDown, Music, ExternalLink, Send } from 'lucide-react';
import { Reel } from '@/types';

interface ReelsViewerModalProps {
  reels: Reel[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ReelsViewerModal: React.FC<ReelsViewerModalProps> = ({
  reels,
  initialIndex = 0,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({
    'reel-1': 142,
    'reel-2': 289,
    'reel-3': 195,
  });

  // Interactive Comments state
  const [isCommentOpen, setIsCommentOpen] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [commentsMap, setCommentsMap] = useState<Record<string, Array<{ id: string; user: string; text: string; time: string }>>>({
    'reel-1': [
      { id: 'c1', user: 'warga_sukabumi', text: 'Keren banget infonya min! 🔥', time: '2j lalu' },
      { id: 'c2', user: 'diki_ramadhan', text: 'Tempatnya di sebelah mana ya min?', time: '1j lalu' },
      { id: 'c3', user: 'alisa_fitria', text: 'Wajib mampir kesini akhir pekan ini 😍', time: '30m lalu' }
    ],
    'reel-2': [
      { id: 'c4', user: 'bayu_pratama', text: 'Gokil suasananya asik parah 🙌', time: '3j lalu' },
      { id: 'c5', user: 'siti_nurhaliza', text: 'Sukabumi makin banyak hidden gem ya!', time: '1j lalu' }
    ],
    'reel-3': [
      { id: 'c6', user: 'rendi_kurnia', text: 'Mantap Jurnal Vibes selalu update info lokal!', time: '4j lalu' }
    ]
  });

  const emptySubscribe = React.useCallback(() => () => {}, []);
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to target index smoothly
  const scrollToIndex = React.useCallback((index: number) => {
    setCurrentIndex(index);
    if (containerRef.current) {
      const targetChild = containerRef.current.children[index] as HTMLElement;
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const togglePlay = React.useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const toggleMute = React.useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCommentOpen) {
          setIsCommentOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < reels.length - 1) {
          scrollToIndex(currentIndex + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          scrollToIndex(currentIndex - 1);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCommentOpen, currentIndex, reels.length, onClose, scrollToIndex, togglePlay]);

  // Play/Pause current video
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === currentIndex && isPlaying && isOpen) {
          video.play().catch(() => {
            // Autoplay policy fallback
          });
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex, isPlaying, isOpen]);

  const toggleLike = (id: string) => {
    setLikedMap(prev => {
      const isLiked = !!prev[id];
      setLikeCounts(cPrev => ({
        ...cPrev,
        [id]: (cPrev[id] || 100) + (isLiked ? -1 : 1)
      }));
      return { ...prev, [id]: !isLiked };
    });
  };

  const handleShare = async (title: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.log('Share canceled:', err);
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert('Link video berhasil disalin ke clipboard!');
    }
  };

  const handleAddComment = (reelId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      user: 'kamu',
      text: commentInput.trim(),
      time: 'Baru saja'
    };

    setCommentsMap(prev => ({
      ...prev,
      [reelId]: [newComment, ...(prev[reelId] || [])]
    }));
    setCommentInput('');
  };

  if (!isOpen || !mounted) return null;

  // Sample video URLs for reels if not provided in data
  const sampleVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  ];

  const currentReel = reels[currentIndex];
  const currentComments = currentReel ? (commentsMap[currentReel.id] || []) : [];

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar Controls */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full">
            {currentIndex + 1} / {reels.length}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Buttons for Desktop */}
      <div className="hidden md:flex flex-col gap-2.5 absolute right-6 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={() => currentIndex > 0 && scrollToIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer"
          title="Video Sebelumnya (Panah Atas)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => currentIndex < reels.length - 1 && scrollToIndex(currentIndex + 1)}
          disabled={currentIndex === reels.length - 1}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer"
          title="Video Selanjutnya (Panah Bawah)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Vertical Feed Container with Scroll Snap */}
      <div
        ref={containerRef}
        onScroll={e => {
          const target = e.currentTarget;
          const index = Math.round(target.scrollTop / target.clientHeight);
          if (index !== currentIndex && index >= 0 && index < reels.length) {
            setCurrentIndex(index);
          }
        }}
        className="w-full max-w-[420px] h-full overflow-y-auto snap-y snap-mandatory no-scrollbar relative"
      >
        {reels.map((reel, idx) => {
          const isCurrent = idx === currentIndex;
          const isLiked = !!likedMap[reel.id];
          const count = likeCounts[reel.id] || 120 + idx * 35;
          const commentsCount = (commentsMap[reel.id] || []).length + (idx * 6 + 12);
          const videoSrc = reel.videoUrl || sampleVideos[idx % sampleVideos.length];

          return (
            <div
              key={reel.id}
              className="w-full h-full snap-start snap-always relative flex items-center justify-center bg-zinc-950 overflow-hidden"
            >
              {/* Video Element / Poster */}
              <video
                ref={el => {
                  videoRefs.current[idx] = el;
                }}
                src={videoSrc}
                poster={reel.thumbnailUrl}
                loop
                playsInline
                muted={isMuted}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Play / Pause Touch Overlay Indicator */}
              {!isPlaying && isCurrent && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white scale-110 animate-pulse">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
              )}

              {/* Right Side Social Actions */}
              <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-4">
                {/* Like Button */}
                <button
                  onClick={() => toggleLike(reel.id)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className={`p-3 rounded-full bg-black/40 backdrop-blur-sm group-hover:scale-110 transition-all ${isLiked ? 'text-red-500' : 'text-white'}`}>
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-xs font-bold shadow-xs">{count}</span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCommentOpen(true);
                  }}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                  title="Lihat Komentar"
                >
                  <div className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white group-hover:scale-110 transition-all">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold shadow-xs">{commentsCount}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShare(reel.title)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white group-hover:scale-110 transition-all">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold shadow-xs">Bagikan</span>
                </button>
              </div>

              {/* Bottom Video Details Overlay */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white hover:underline cursor-pointer">
                    {reel.creator || '@jurnalvibes'}
                  </span>
                  {reel.category && (
                    <span className="text-[10px] font-bold bg-white/20 backdrop-blur-xs text-white px-2 py-0.5 rounded-full uppercase">
                      {reel.category}
                    </span>
                  )}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full transition-colors pointer-events-auto cursor-pointer"
                  >
                    <span>Buka di Medsos</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-white text-sm font-semibold leading-snug line-clamp-2 pointer-events-auto">
                  {reel.title}
                </p>

                {/* Static Music Indicator (tidak bergerak) */}
                <div className="flex items-center gap-2 text-xs text-gray-300 pointer-events-auto mt-1">
                  <Music className="w-3.5 h-3.5 shrink-0 text-white/80" />
                  <span className="truncate max-w-[200px]">
                    {reel.location ? `${reel.location} • Suara Asli` : 'Suara Asli - Jurnal Vibes Sukabumi'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Comments Drawer (Slide-up Bottom Sheet) */}
      {isCommentOpen && (
        <div 
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs"
          onClick={() => setIsCommentOpen(false)}
        >
          <div 
            className="w-full max-w-[420px] bg-zinc-900/95 backdrop-blur-xl rounded-t-2xl border-t border-white/15 flex flex-col max-h-[65%] h-[460px] shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="w-8" />
              <h4 className="text-sm font-bold text-white text-center">
                Komentar ({currentComments.length})
              </h4>
              <button
                onClick={() => setIsCommentOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
              {currentComments.length === 0 ? (
                <div className="text-center text-white/40 text-xs py-10">
                  Belum ada komentar. Jadilah yang pertama berkomentar!
                </div>
              ) : (
                currentComments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {c.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {c.user}
                        </span>
                        <span className="text-[10px] text-white/40">{c.time}</span>
                      </div>
                      <p className="text-xs text-white/80 mt-0.5 leading-relaxed break-words">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Box */}
            <form
              onSubmit={(e) => handleAddComment(currentReel?.id || '', e)}
              className="p-3 border-t border-white/10 flex items-center gap-2 bg-zinc-950"
            >
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Tulis komentar..."
                className="flex-1 bg-white/10 text-white text-xs px-3.5 py-2.5 rounded-full outline-none placeholder:text-white/40 focus:ring-1 focus:ring-primary border border-white/10"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="p-2.5 rounded-full bg-primary text-white disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};
