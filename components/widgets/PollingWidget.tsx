'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Vote, Check } from 'lucide-react';
import { Poll } from '@/types';
import { DEFAULT_FALLBACK_POLL } from '@/lib/polls';

interface PollingWidgetProps {
  poll?: Poll | null;
}

export const PollingWidget: React.FC<PollingWidgetProps> = ({ poll: initialPoll }) => {
  const [poll, setPoll] = useState<Poll | null>(initialPoll || DEFAULT_FALLBACK_POLL);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() => {
    const base = initialPoll || DEFAULT_FALLBACK_POLL;
    const initialCounts: Record<string, number> = {};
    base.options.forEach(opt => {
      initialCounts[opt.id] = opt.votes || 0;
    });
    return initialCounts;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fungsi sinkronisasi dari localStorage
  const syncFromLocalStorage = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      // 1. Coba baca dari jurnal_wave_active_poll
      const savedActive = localStorage.getItem('jurnal_wave_active_poll');
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        if (parsed && parsed.options && parsed.options.length > 0 && parsed.isActive !== false) {
          setPoll(parsed);
          const counts: Record<string, number> = {};
          parsed.options.forEach((opt: any) => {
            counts[opt.id] = opt.votes || 0;
          });
          setVoteCounts(counts);

          const savedVote = localStorage.getItem(`jv_poll_${parsed.id}`);
          if (savedVote) {
            setSelectedOption(savedVote);
            setHasVoted(true);
          }
          return true;
        }
      }

      // 2. Coba cari polling aktif dari daftar admin polls
      const savedAdminPolls = localStorage.getItem('jurnal_wave_admin_polls');
      if (savedAdminPolls) {
        const parsedList = JSON.parse(savedAdminPolls);
        if (Array.isArray(parsedList) && parsedList.length > 0) {
          const activeItem = parsedList.find((p: any) => Boolean(p.isActive));
          if (activeItem && activeItem.options && activeItem.options.length > 0) {
            setPoll(activeItem);
            const counts: Record<string, number> = {};
            activeItem.options.forEach((opt: any) => {
              counts[opt.id] = opt.votes || 0;
            });
            setVoteCounts(counts);

            const savedVote = localStorage.getItem(`jv_poll_${activeItem.id}`);
            if (savedVote) {
              setSelectedOption(savedVote);
              setHasVoted(true);
            }
            return true;
          }
        }
      }
    } catch {}
    return false;
  }, []);

  // Ambil polling aktif jika tidak disediakan via props
  useEffect(() => {
    let isMounted = true;

    // 1. Muat instan dari localStorage
    const hasLocal = syncFromLocalStorage();

    if (initialPoll) {
      setPoll(initialPoll);
      const initialCounts: Record<string, number> = {};
      initialPoll.options.forEach(opt => {
        initialCounts[opt.id] = opt.votes || 0;
      });
      setVoteCounts(initialCounts);
      return;
    }

    async function loadActivePoll() {
      try {
        const res = await fetch('/api/polls', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted && json.data && json.data.isActive) {
            // Jika di localStorage sudah ada polling kustom buatan admin (misal Persib vs Melbourne),
            // jangan timpa dengan dummy lama (big match)
            if (
              hasLocal &&
              (json.data.id === 'default-active-poll' || json.data.id === 'poll-big-match-archive')
            ) {
              return;
            }

            setPoll(json.data);
            const counts: Record<string, number> = {};
            json.data.options.forEach((opt: any) => {
              counts[opt.id] = opt.votes || 0;
            });
            setVoteCounts(counts);

            // Cek apakah user sudah pernah vote di localStorage
            try {
              const saved = localStorage.getItem(`jv_poll_${json.data.id}`);
              if (saved) {
                setSelectedOption(saved);
                setHasVoted(true);
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Notice fetching active poll:', err);
      }
    }

    loadActivePoll();

    // Event listener untuk sinkronisasi realtime antar tab atau saat admin switch polling aktif
    const handleSyncEvent = () => {
      syncFromLocalStorage();
    };

    window.addEventListener('poll-updated', handleSyncEvent);
    window.addEventListener('storage', handleSyncEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('poll-updated', handleSyncEvent);
      window.removeEventListener('storage', handleSyncEvent);
    };
  }, [initialPoll, syncFromLocalStorage]);

  // Sync vote choice dari localStorage jika poll berubah
  useEffect(() => {
    if (!poll?.id) return;
    try {
      const savedChoice = localStorage.getItem(`jv_poll_${poll.id}`);
      if (savedChoice) {
        setSelectedOption(savedChoice);
        setHasVoted(true);
      } else {
        setSelectedOption('');
        setHasVoted(false);
      }
    } catch {}
  }, [poll?.id]);

  if (!poll || !poll.options || poll.options.length === 0) {
    return null;
  }

  const handleSelect = async (optionId: string) => {
    if (hasVoted || isSubmitting) return;

    setSelectedOption(optionId);
    setHasVoted(true);
    setVoteCounts(prev => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1,
    }));

    // Simpan status vote pengguna ke localStorage
    try {
      localStorage.setItem(`jv_poll_${poll.id}`, optionId);

      // Sinkronkan kenaikan vote ke jurnal_wave_active_poll di localStorage
      const savedActive = localStorage.getItem('jurnal_wave_active_poll');
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        if (parsed.id === poll.id) {
          parsed.options = parsed.options.map((opt: any) =>
            opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
          );
          parsed.totalVotes = (parsed.totalVotes || 0) + 1;
          localStorage.setItem('jurnal_wave_active_poll', JSON.stringify(parsed));
        }
      }

      // Sinkronkan juga ke daftar polling admin di localStorage
      const savedAdmin = localStorage.getItem('jurnal_wave_admin_polls');
      if (savedAdmin) {
        const parsedList = JSON.parse(savedAdmin);
        if (Array.isArray(parsedList)) {
          const updatedList = parsedList.map((p: any) => {
            if (p.id === poll.id) {
              return {
                ...p,
                totalVotes: (p.totalVotes || 0) + 1,
                options: p.options.map((opt: any) =>
                  opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
                ),
              };
            }
            return p;
          });
          localStorage.setItem('jurnal_wave_admin_polls', JSON.stringify(updatedList));
        }
      }

      window.dispatchEvent(new CustomEvent('poll-updated'));
    } catch {}

    // Kirim vote ke server
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: poll.id, optionId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updatedCounts: Record<string, number> = {};
          json.data.options.forEach((opt: any) => {
            updatedCounts[opt.id] = opt.votes || 0;
          });
          setVoteCounts(updatedCounts);
        }
      }
    } catch (err) {
      console.warn('Notice submitting vote to server:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

  return (
    <section className="w-full flex flex-col pt-2 sm:pt-4">
      {/* Editorial Section Header: | POLLING PEMBACA */}
      <div className="flex items-center justify-between pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 sm:h-5 bg-[#c00015] rounded-none shrink-0 inline-block" />
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100 tracking-wider uppercase">
            POLLING PEMBACA
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          Suara Pembaca
        </span>
      </div>

      {/* Outer Card Container Sesuai Standar Portal Berita */}
      <div className="w-full bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-stretch w-full">
          {/* Kolom Kiri: Pertanyaan Editorial & Info Status Berbobot */}
          <div className="flex flex-col justify-between">
            <h4 className="font-heading font-bold text-sm sm:text-base md:text-lg text-slate-900 dark:text-zinc-100 leading-snug">
              {poll.question}
            </h4>

            <div className="mt-4 pt-3 sm:pt-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className={`font-medium ${hasVoted ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-zinc-400'}`}>
                {hasVoted ? '✓ Pilihan Anda telah tercatat' : 'Pilih salah satu untuk melihat hasil'}
              </span>
              <span className="font-bold text-slate-800 dark:text-zinc-200 shrink-0">
                {totalVotes.toLocaleString('id-ID')} suara masuk
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Opsi Pilihan Jawaban Bersih & Elegan */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {poll.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const votes = voteCounts[option.id] || 0;
              const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

              if (hasVoted) {
                return (
                  <div
                    key={option.id}
                    className={`relative overflow-hidden py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-lg sm:rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? 'border-[#c00015]/60 bg-red-50/20 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/40'
                    }`}
                  >
                    {/* Progress Bar Fill */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out ${
                        isSelected ? 'bg-red-500/15 dark:bg-red-500/25' : 'bg-slate-200/60 dark:bg-zinc-700/50'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    {/* Content Overlay */}
                    <div className="relative z-10 flex items-center justify-between gap-2.5 text-[11px] sm:text-xs font-semibold">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-[#c00015] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        )}
                        <span className={`truncate ${isSelected ? 'text-[#c00015] font-bold' : 'text-slate-800 dark:text-zinc-200'}`}>
                          {option.text}
                        </span>
                      </div>
                      <span className={`shrink-0 font-bold ${isSelected ? 'text-[#c00015]' : 'text-slate-600 dark:text-zinc-400'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className="w-full text-left py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 hover:border-[#c00015]/60 hover:bg-red-50/30 dark:hover:bg-red-950/20 cursor-pointer transition-all duration-200 group active:scale-[0.99] flex items-center justify-between gap-2.5"
                >
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-[#c00015] transition-colors truncate">
                    {option.text}
                  </span>
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-zinc-700 group-hover:border-[#c00015] shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
