'use client';

import React, { useState, useEffect } from 'react';
import { Vote, Check } from 'lucide-react';
import { Poll } from '@/types';

interface PollingWidgetProps {
  poll: Poll;
}

export const PollingWidget: React.FC<PollingWidgetProps> = ({ poll }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    poll.options.forEach(opt => {
      initial[opt.id] = opt.votes || 0;
    });
    return initial;
  });

  // Ambil data voting dari localStorage jika pengguna sudah pernah vote
  useEffect(() => {
    try {
      const savedChoice = localStorage.getItem(`jv_poll_${poll.id}`);
      if (savedChoice) {
        setSelectedOption(savedChoice);
        setHasVoted(true);
      }
    } catch {
      // ignore
    }
  }, [poll.id]);

  const handleSelect = (optionId: string) => {
    if (hasVoted) return;

    setSelectedOption(optionId);
    setHasVoted(true);
    setVoteCounts(prev => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1,
    }));

    try {
      localStorage.setItem(`jv_poll_${poll.id}`, optionId);
    } catch {
      // ignore
    }
  };

  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

  return (
    <section className="bg-surface rounded-2xl p-4 sm:p-5 border border-outline-variant/60 my-3 sm:my-4 shadow-2xs transition-all">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Vote className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-on-surface text-sm sm:text-base">Polling Pembaca</h3>
      </div>

      {/* Question */}
      <p className="text-on-surface/90 text-xs sm:text-sm font-semibold mb-3 sm:mb-3.5 leading-snug">
        {poll.question}
      </p>

      {/* Options List */}
      <div className="flex flex-col gap-2">
        {poll.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const votes = voteCounts[option.id] || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

          if (hasVoted) {
            return (
              <div
                key={option.id}
                className={`relative overflow-hidden p-2.5 sm:p-3 rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-primary/60 bg-primary/5 shadow-2xs'
                    : 'border-outline-variant/50 bg-surface-container-low/50'
                }`}
              >
                {/* Progress Bar Fill */}
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out ${
                    isSelected ? 'bg-primary/20' : 'bg-surface-variant/70'
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                {/* Content Overlay */}
                <div className="relative z-10 flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold">
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <span className={`truncate ${isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>
                      {option.text}
                    </span>
                  </div>
                  <span className={`shrink-0 font-bold ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
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
              className="w-full text-left p-2.5 sm:p-3 rounded-xl border border-outline-variant/60 bg-surface hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-200 group active:scale-[0.99] flex items-center justify-between gap-2"
            >
              <span className="text-xs sm:text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                {option.text}
              </span>
              <span className="w-4 h-4 rounded-full border border-outline-variant group-hover:border-primary shrink-0 transition-colors" />
            </button>
          );
        })}
      </div>
    </section>
  );
};
