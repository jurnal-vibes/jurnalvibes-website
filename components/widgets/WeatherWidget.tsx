'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudSunRain,
  CloudLightning,
  Calendar
} from 'lucide-react';

interface WeatherWidgetProps {
  date?: string;
  temp?: string;
  location?: string;
  variant?: 'header' | 'sidebar';
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  date = '',
  temp = '26°C',
  location = 'Sukabumi',
  variant = 'header'
}) => {
  const [currentDate, setCurrentDate] = useState<string>(date);
  const [currentTemp, setCurrentTemp] = useState<string>(temp);
  const [currentCondition, setCurrentCondition] = useState<string>('Berawan');
  const [iconName, setIconName] = useState<string>('CloudSun');

  useEffect(() => {
    // 1. Format tanggal hari ini
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
      // fallback date
    }

    // 2. Ambil cuaca nyata Sukabumi dari API
    let isMounted = true;
    async function loadWeather() {
      try {
        const res = await fetch('/api/weather?loc=kota');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.temperature !== undefined) {
          setCurrentTemp(`${data.temperature}°C`);
          setCurrentCondition(data.condition || 'Berawan');
          setIconName(data.iconName || 'CloudSun');
        }
      } catch (err) {
        console.warn('Gagal memuat cuaca realtime:', err);
      }
    }

    loadWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderIcon = (className: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={className} />;
      case 'Cloud':
        return <Cloud className={className} />;
      case 'CloudRain':
        return <CloudRain className={className} />;
      case 'CloudSunRain':
        return <CloudSunRain className={className} />;
      case 'CloudLightning':
        return <CloudLightning className={className} />;
      default:
        return <CloudSun className={className} />;
    }
  };

  if (variant === 'sidebar') {
    return (
      <Link
        href="/cuaca"
        className="mt-8 px-4 flex flex-col gap-1 group cursor-pointer block hover:opacity-90 transition-opacity"
        title={`Cuaca Sukabumi: ${currentCondition} ${currentTemp}`}
      >
        <p className="text-xs text-zinc-500 group-hover:text-primary transition-colors">{currentDate}</p>
        <div className="flex items-center gap-2 text-on-surface group-hover:text-primary transition-colors">
          {renderIcon('w-5 h-5 text-amber-500 group-hover:scale-105 transition-transform')}
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{currentTemp}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{location}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/cuaca"
      className="flex items-center gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-surface-container-low/90 hover:bg-surface-container border border-outline-variant/40 hover:border-outline-variant/80 shadow-2xs hover:shadow-xs transition-all duration-200 group shrink-0 cursor-pointer"
      title={`Cuaca Sukabumi: ${currentCondition} ${currentTemp}. Klik untuk detail 7 hari.`}
    >
      {/* Weather Icon Badge */}
      <div className="flex items-center justify-center w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200 shrink-0">
        {renderIcon('w-3.5 h-3.5 stroke-[2.2] group-hover:scale-105 transition-transform')}
      </div>

      {/* Weather Info */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="font-bold text-on-surface group-hover:text-primary transition-colors text-xs sm:text-sm">
          {currentTemp}
        </span>
        <span className="text-on-surface-variant/50 text-[10px] hidden sm:inline">•</span>
        <span className="text-on-surface-variant font-medium text-[11px] sm:text-xs hidden sm:inline group-hover:text-on-surface transition-colors">
          {location}
        </span>
      </div>
    </Link>
  );
};
