'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Building2, MapPin, Banknote } from 'lucide-react';
import { Job } from '@/types';
import { Badge } from '@/components/ui/badge';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isSaved, setIsSaved] = useState<boolean>(job.isSaved || false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div className="bg-surface border border-outline-variant/60 rounded-2xl p-6 relative card-hover transition-all duration-300 flex flex-col gap-4">
      <button
        onClick={toggleBookmark}
        aria-label="Bookmark Lowongan"
        className="absolute top-5 right-5 text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer p-1.5 rounded-full hover:bg-surface-variant"
      >
        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current text-primary' : ''}`} />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="flex-1 pr-6">
          <Link href={`/loker/${job.id}`}>
            <h3 className="text-base sm:text-lg font-bold text-on-surface hover:text-primary transition-colors leading-tight mb-1">
              {job.title}
            </h3>
          </Link>
          <p className="text-sm font-semibold text-primary">{job.company}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-xs sm:text-sm text-on-surface-variant/80">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-primary shrink-0" />
          <span>{job.salaryRange}</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-outline-variant/60 flex items-center justify-between">
        <Badge variant="subtle" className="text-[10px] uppercase font-bold tracking-wider">
          {job.type}
        </Badge>
      </div>
    </div>
  );
};
