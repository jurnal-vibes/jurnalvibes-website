'use client';

import React from 'react';
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
  if (variant === 'sidebar') {
    return (
      <Link
        href="/cuaca"
        className="mt-8 px-4 flex flex-col gap-1 group cursor-pointer block hover:opacity-90 transition-opacity"
      >
        <p className="text-xs text-gray-500 group-hover:text-primary transition-colors">{date}</p>
        <div className="flex items-center gap-2 text-on-surface group-hover:text-primary transition-colors">
          <CloudSun className="w-5 h-5 text-on-surface group-hover:text-primary transition-colors" />
          <span className="text-base font-bold">{temp}</span>
          <span className="text-sm opacity-70">{location}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/cuaca"
      className="flex items-center gap-1.5 sm:gap-3 p-0 md:px-3.5 md:py-1 rounded-none md:rounded-full bg-transparent md:bg-surface-container/70 md:hover:bg-surface-variant border-0 md:border md:border-outline-variant/60 shadow-none md:shadow-2xs md:hover:shadow-xs transition-all duration-300 group shrink-0 cursor-pointer backdrop-blur-none md:backdrop-blur-xs"
      title="Lihat Perkiraan Cuaca Sukabumi"
    >
      {/* Weather Icon Badge */}
      <div className="hidden md:flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shrink-0">
        <CloudSun className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
      </div>

      {/* Weather Info */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
        <span className="text-xs font-semibold md:font-extrabold md:text-sm text-primary tracking-tight">{temp}</span>
        <span className="hidden md:inline text-[11px] text-on-surface-variant font-medium opacity-90">{location}</span>
      </div>

      {/* Divider */}
      <span className="hidden lg:block w-px h-3.5 bg-outline-variant/60 shrink-0" />

      {/* Date Info */}
      <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant/90 shrink-0">
        <Calendar className="w-3.5 h-3.5 opacity-60 text-primary" />
        <span>{date}</span>
      </div>
    </Link>
  );
};

