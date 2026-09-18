'use client';

import React, { useState } from 'react';
import { Vote } from 'lucide-react';
import { Poll } from '@/types';
import { Button } from '@/components/ui/button';

interface PollingWidgetProps {
  poll: Poll;
}

export const PollingWidget: React.FC<PollingWidgetProps> = ({ poll }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  const handleVote = () => {
    if (selectedOption) {
      setHasVoted(true);
    }
  };

  return (
    <section className="bg-surface rounded-2xl p-6 border border-outline-variant/60 my-4 shadow-sm">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Vote className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-on-surface text-lg sm:text-xl">Polling Lokal</h3>
      </div>
      <p className="text-on-surface/90 text-sm sm:text-base font-medium mb-5">{poll.question}</p>

      <div className="flex flex-col gap-2.5">
        {poll.options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <label
              key={option.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 group ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-2xs'
                  : 'border-outline-variant/60 bg-surface hover:border-primary/50 hover:bg-surface-variant/40'
              }`}
            >
              <span className={`text-sm font-semibold transition-colors ${
                isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'
              }`}>
                {option.text}
              </span>
              <input
                type="radio"
                name="poll"
                checked={isSelected}
                onChange={() => setSelectedOption(option.id)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </label>
          );
        })}
      </div>

      <div className="mt-5 text-right">
        <Button
          onClick={handleVote}
          disabled={!selectedOption || hasVoted}
          variant="default"
          className="rounded-full px-6"
        >
          {hasVoted ? 'Terima Kasih!' : 'Vote Sekarang'}
        </Button>
      </div>
    </section>
  );
};
