'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CloudSun, Calendar } from 'lucide-react';

interface WeatherWidgetProps {
  date?: string;
  temp?: string;
  location?: string;
  variant?: 'header' | 'sidebar';
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  date = 'Kamis, 27 Ags 2026',
  temp = '24°C',
  location = 'Sukabumi',
  variant = 'header'
}) => {
  const [currentDate, setCurrentDate] = useState<string>(date);

  useEffect(() => {
    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(now);
      setCurrentDate(formatted);
    } catch {
      // keep fallback date
    }
  }, []);

  if (variant === 'sidebar') {
    return (
      <Link
        href="/cuaca"
        className="mt-8 px-4 flex flex-col gap-1 group cursor-pointer block hover:opacity-90 transition-opacity"
      >
        <p className="text-xs text-zinc-500 group-hover:text-primary transition-colors">{currentDate}</p>
        <div className="flex items-center gap-2 text-on-surface group-hover:text-primary transition-colors">
          <CloudSun className="w-5 h-5 text-amber-500 group-hover:scale-105 transition-transform" />
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{temp}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{location}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/cuaca"
      className="flex items-center gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-surface-container-low/90 hover:bg-surface-container border border-outline-variant/40 hover:border-outline-variant/80 shadow-2xs hover:shadow-xs transition-all duration-200 group shrink-0 cursor-pointer"
      title="Lihat Perkiraan Cuaca Sukabumi"
    >
      {/* Weather Icon Badge */}
      <div className="flex items-center justify-center w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200 shrink-0">
        <CloudSun className="w-3.5 h-3.5 stroke-[2.2] group-hover:scale-105 transition-transform" />
      </div>

      {/* Weather Info */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">{temp}</span>
        <span className="hidden sm:inline text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{location}</span>
      </div>

      {/* Divider */}
      <span className="hidden lg:block w-px h-3.5 bg-outline-variant/50 shrink-0" />

      {/* Date Info */}
      <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
        <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
        <span>{currentDate}</span>
      </div>
    </Link>
  );
};

