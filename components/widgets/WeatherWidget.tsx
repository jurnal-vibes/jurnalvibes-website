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
  temp = '22°C',
  location = 'Sukabumi',
  variant = 'header'
}) => {
  const [fullDate, setFullDate] = useState<string>('Minggu, 25 Oktober 2026');
  const [shortDate, setShortDate] = useState<string>('25 Okt 2026');
  const [currentTemp, setCurrentTemp] = useState<string>(temp);
  const [currentCondition, setCurrentCondition] = useState<string>('Berawan');
  const [iconName, setIconName] = useState<string>('CloudSun');

  useEffect(() => {
    // 1. Format tanggal hari ini
    try {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const monthsFull = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

      const dayName = days[now.getDay()];
      const day = now.getDate();
      const monthFull = monthsFull[now.getMonth()];
      const monthShort = monthsShort[now.getMonth()];
      const year = now.getFullYear();

      setFullDate(`${dayName}, ${day} ${monthFull} ${year}`);
      setShortDate(`${day} ${monthShort} ${year}`);
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
        <p className="text-xs text-zinc-500 group-hover:text-primary transition-colors">{fullDate}</p>
        <div className="flex items-center gap-2 text-on-surface group-hover:text-primary transition-colors">
          {renderIcon('w-5 h-5 text-amber-500 group-hover:scale-105 transition-transform')}
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{currentTemp}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{location}</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full bg-surface-container-low/90 hover:bg-surface-container border border-outline-variant/40 hover:border-outline-variant/80 shadow-2xs hover:shadow-xs transition-all duration-200 shrink-0">
      {/* Date / Calendar Part (Format SukabumiUpdate) */}
      <Link
        href="/indeks-berita?preset=hari-ini"
        className="flex items-center gap-1 sm:gap-1.5 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors cursor-pointer group"
        title="Lihat Berita Hari Ini di Indeks Berita"
      >
        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 dark:text-slate-400 shrink-0 group-hover:text-primary transition-colors" />
        {/* Desktop / Tablet: Minggu, 25 Oktober 2026 */}
        <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
          {fullDate}
        </span>
        {/* Mobile: 25 Okt 2026 */}
        <span className="sm:hidden text-[10px] font-semibold whitespace-nowrap">
          {shortDate}
        </span>
      </Link>

      {/* Divider */}
      <span className="w-px h-2.5 sm:h-3.5 bg-outline-variant/60 shrink-0" />

      {/* Weather Part (Ikon Awan + Suhu disempilkan) */}
      <Link
        href="/cuaca"
        className="flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors cursor-pointer group shrink-0"
        title={`Cuaca Sukabumi: ${currentCondition} ${currentTemp}. Klik untuk detail prakiraan cuaca.`}
      >
        <div className="flex items-center justify-center shrink-0">
          {renderIcon('w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 group-hover:scale-110 transition-transform shrink-0')}
        </div>
        <span className="font-bold text-[10px] sm:text-xs text-on-surface whitespace-nowrap group-hover:text-primary transition-colors">
          {currentTemp}
        </span>
      </Link>
    </div>
  );
};
