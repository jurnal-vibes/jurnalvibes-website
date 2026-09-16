'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Heart, MessageCircle, Share2, Volume2, VolumeX, ChevronUp, ChevronDown, Music } from 'lucide-react';
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
        onClose();
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
  }, [isOpen, currentIndex, reels.length, onClose, scrollToIndex, togglePlay]);

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

  if (!isOpen || !mounted) return null;

  // Sample video URLs for reels if not provided in data
  const sampleVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar Controls */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Reels ({currentIndex + 1}/{reels.length})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Navigation Buttons for Desktop */}
      <div className="hidden md:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={() => currentIndex > 0 && scrollToIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer"
          title="Video Sebelumnya (Panah Atas)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={() => currentIndex < reels.length - 1 && scrollToIndex(currentIndex + 1)}
          disabled={currentIndex === reels.length - 1}
          className="p-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer"
          title="Video Selanjutnya (Panah Bawah)"
        >
          <ChevronDown className="w-6 h-6" />
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
              <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-5">
                <button
                  onClick={() => toggleLike(reel.id)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className={`p-3 rounded-full bg-black/40 backdrop-blur-sm group-hover:scale-110 transition-all ${isLiked ? 'text-red-500' : 'text-white'}`}>
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-xs font-bold shadow-xs">{count}</span>
                </button>

                <button
                  onClick={() => alert(`Komentar untuk ${reel.title}`)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white group-hover:scale-110 transition-all">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold shadow-xs">24</span>
                </button>

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
                  <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                    IKUTI
                  </span>
                </div>

                <p className="text-white text-sm font-semibold leading-snug line-clamp-2 pointer-events-auto">
                  {reel.title}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-300 pointer-events-auto mt-1">
                  <Music className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="truncate max-w-[200px]">
                    {reel.location ? `${reel.location} • Suara Asli` : 'Suara Asli - Jurnal Vibes Sukabumi'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
