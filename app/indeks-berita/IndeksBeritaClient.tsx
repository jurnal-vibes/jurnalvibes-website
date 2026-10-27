'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import { NewsArticleSidebar } from '@/components/layout/NewsArticleSidebar';
import { Article } from '@/types';
import { fetchArticles } from '@/lib/wordpress';
import { formatIndoDate } from '@/lib/utils';

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const MONTH_NAMES_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];

type QuickPreset = 'hari-ini' | '7-hari' | '30-hari' | 'bulan-ini' | 'bulan-lalu' | 'custom';

function formatDisplayDate(d: Date): string {
  const day = d.getDate();
  const month = MONTH_NAMES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDateRange(start: Date, end: Date): string {
  return `${formatDisplayDate(start)}  -  ${formatDisplayDate(end)}`;
}

function normalizeDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function parseArticleDate(article: Article): Date | null {
  if (article.createdAt) {
    const d = new Date(article.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (article.publishedDate) {
    const d = new Date(article.publishedDate);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export function IndeksBeritaClient() {
  const searchParams = useSearchParams();
  const urlPreset = searchParams.get('preset');

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Default range: Hari Ini jika urlPreset === 'hari-ini', jika tidak 30 hari terakhir
  const now = new Date();
  const isHariIni = urlPreset === 'hari-ini';
  const initialEnd = endOfDay(now);
  const initialStart = isHariIni
    ? normalizeDay(now)
    : normalizeDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));

  const [startDate, setStartDate] = useState<Date>(initialStart);
  const [endDate, setEndDate] = useState<Date>(initialEnd);
  const [activePreset, setActivePreset] = useState<QuickPreset>(isHariIni ? 'hari-ini' : '30-hari');

  // Pop-up Filter Modal State
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(initialStart);
  const [tempEndDate, setTempEndDate] = useState<Date>(initialEnd);
  const [tempPreset, setTempPreset] = useState<QuickPreset>(isHariIni ? 'hari-ini' : '30-hari');
  const [selectingStart, setSelectingStart] = useState<boolean>(false);

  // Sinkronisasi jika query param preset berubah
  useEffect(() => {
    if (urlPreset === 'hari-ini') {
      const today = new Date();
      const s = normalizeDay(today);
      const e = endOfDay(today);
      setStartDate(s);
      setEndDate(e);
      setActivePreset('hari-ini');
      setTempStartDate(s);
      setTempEndDate(e);
      setTempPreset('hari-ini');
      setCurrentPage(1);
    }
  }, [urlPreset]);

  // Month navigation for dual calendar: viewMonth is the second month (right)
  const [viewMonth, setViewMonth] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;
  const listTopRef = useRef<HTMLDivElement>(null);

  // Load articles real dari API/Database
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await fetchArticles();
        if (data && data.length > 0) {
          setArticles(data);
        }
      } catch (err) {
        console.error('Error fetching articles for Indeks Berita:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Sinkronisasi modal saat dibuka
  const handleOpenFilter = () => {
    setTempStartDate(new Date(startDate));
    setTempEndDate(new Date(endDate));
    setTempPreset(activePreset);
    setSelectingStart(false);
    setViewMonth(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  // Preset Handler
  const handleSelectPreset = (preset: QuickPreset) => {
    const today = new Date();
    let s = new Date(today);
    let e = endOfDay(today);

    if (preset === 'hari-ini') {
      s = normalizeDay(today);
      e = endOfDay(today);
    } else if (preset === '7-hari') {
      s = normalizeDay(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
      e = endOfDay(today);
    } else if (preset === '30-hari') {
      s = normalizeDay(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));
      e = endOfDay(today);
    } else if (preset === 'bulan-ini') {
      s = new Date(today.getFullYear(), today.getMonth(), 1);
      e = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    } else if (preset === 'bulan-lalu') {
      s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      e = endOfDay(new Date(today.getFullYear(), today.getMonth(), 0));
    }

    setTempStartDate(s);
    setTempEndDate(e);
    setTempPreset(preset);
    setSelectingStart(false);
    setViewMonth(new Date(e.getFullYear(), e.getMonth(), 1));
  };

  // Calendar Click Handler
  const handleDateClick = (dayDate: Date) => {
    const clicked = normalizeDay(dayDate);
    if (!selectingStart) {
      setTempStartDate(clicked);
      setTempEndDate(endOfDay(clicked));
      setSelectingStart(true);
      setTempPreset('custom');
    } else {
      if (clicked.getTime() < tempStartDate.getTime()) {
        setTempStartDate(clicked);
        setTempEndDate(endOfDay(tempStartDate));
      } else {
        setTempEndDate(endOfDay(clicked));
      }
      setSelectingStart(false);
      setTempPreset('custom');
    }
  };

  const handleApplyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setActivePreset(tempPreset);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  // Navigasi Bulan di Dual Calendar
  const handlePrevMonth = () => {
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Hitung durasi hari
  const tempDurationDays = Math.max(
    1,
    Math.round((tempEndDate.getTime() - tempStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  // Filter artikel berdasarkan rentang tanggal
  const filteredArticles = useMemo(() => {
    const startTs = startDate.getTime();
    const endTs = endDate.getTime();

    const result = articles.filter(art => {
      const artDate = parseArticleDate(art);
      if (!artDate) return true; // jika tanggal tidak parseable, tampilkan
      const ts = artDate.getTime();
      return ts >= startTs && ts <= endTs;
    });

    return result;
  }, [articles, startDate, endDate]);

  // Pagination Calculation
  const totalArticles = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalArticles / ITEMS_PER_PAGE));
  const displayedArticles = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render Calendar Grid Helper (Indonesian: Senin pertama = col 0)
  const renderCalendarMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week: 0 (Sun) .. 6 (Sat) -> transform so Mon is 0, Sun is 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const days: (Date | null)[] = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    // Next month padding to fill complete grid
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return (
      <div className="flex flex-col">
        <div className="text-center font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 py-1.5">
          {MONTH_NAMES_FULL[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2 text-center text-[10px] sm:text-[11px] font-semibold text-slate-400">
          {DAY_NAMES.map(name => (
            <div key={name} className="py-1">{name}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {days.map((d, idx) => {
            if (!d) return <div key={idx} className="h-7 w-7" />;
            const isCurrentMonth = d.getMonth() === month;
            const normalized = normalizeDay(d);
            const isStart = isSameDay(normalized, tempStartDate);
            const isEnd = isSameDay(normalized, tempEndDate);
            const inRange =
              normalized.getTime() > tempStartDate.getTime() &&
              normalized.getTime() < tempEndDate.getTime();

            let dayClasses = 'h-7 sm:h-8 text-[11px] sm:text-xs font-medium flex items-center justify-center transition-all cursor-pointer select-none rounded-md ';

            if (isStart || isEnd) {
              dayClasses += 'bg-[#c00015] text-white font-bold shadow-xs scale-105 z-10';
            } else if (inRange) {
              dayClasses += 'bg-rose-100 dark:bg-rose-950/60 text-[#c00015] dark:text-rose-300 font-semibold rounded-none';
            } else if (isCurrentMonth) {
              dayClasses += 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';
            } else {
              dayClasses += 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDateClick(d)}
                className={dayClasses}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Month A: Bulan sebelumnya, Month B: Bulan viewMonth
  const monthA = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
  const monthB = viewMonth;

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-16 min-w-0" ref={listTopRef}>
      {/* ============================================================== */}
      {/* Pop-up FILTER RENTANG WAKTU (Persis Gambar 4)                  */}
      {/* ============================================================== */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-[#c00015] rounded-xs inline-block" />
                <div>
                  <h3 className="font-heading font-black text-xs sm:text-sm tracking-wider uppercase text-slate-900 dark:text-white">
                    FILTER RENTANG WAKTU
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pilih rentang tanggal publikasi berita
                  </p>
                </div>
              </div>

              {/* Badge Tanggal Terpilih */}
              <div className="px-3 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-[#c00015] border border-rose-200/80 dark:border-rose-900 text-[11px] sm:text-xs font-bold tracking-tight">
                {formatDateRange(tempStartDate, tempEndDate)}
              </div>
            </div>

            {/* Modal Body: Rentang Cepat + Dual Calendar */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 p-4 sm:p-5">
              {/* Kolom Kiri: RENTANG CEPAT */}
              <div className="md:col-span-4 pb-4 md:pb-0 md:pr-5 flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  RENTANG CEPAT
                </span>
                <div className="flex flex-col gap-1.5">
                  {[
                    { key: 'hari-ini', label: 'Hari Ini' },
                    { key: '7-hari', label: '7 Hari Terakhir' },
                    { key: '30-hari', label: '30 Hari Terakhir' },
                    { key: 'bulan-ini', label: 'Bulan Ini' },
                    { key: 'bulan-lalu', label: 'Bulan Lalu' },
                  ].map(item => {
                    const isActive = tempPreset === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSelectPreset(item.key as QuickPreset)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-[#c00015] border border-rose-200 dark:border-rose-900'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-[#c00015]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kolom Kanan: DUAL CALENDAR */}
              <div className="md:col-span-8 pt-4 md:pt-0 md:pl-5 flex flex-col">
                {/* Header Navigasi Kalender */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Bulan Sebelumnya"
                    className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Pilih tanggal mulai & tanggal akhir
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Bulan Berikutnya"
                    className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 2 Bulan Berdampingan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderCalendarMonth(monthA)}
                  {renderCalendarMonth(monthB)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
              <span className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {tempDurationDays} hari
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseFilter}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilter}
                  className="px-5 py-2 rounded-lg bg-[#c00015] hover:bg-[#a00012] text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2 Kolom Layout (Persis Penempatan Gambar 1 SukabumiUpdate)      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Kolom Kiri: Header INDEKS BERITA + Daftar Berita Berkotak + Pagination */}
        <main className="lg:col-span-8 flex flex-col gap-4 sm:gap-5 min-w-0">
          {/* Header Box INDEKS BERITA (Sejajar dengan TERPOPULER di Kanan) */}
          <header className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Sisi Kiri: Judul & Subtitle */}
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-6 bg-[#c00015] rounded-xs inline-block shrink-0 mt-0.5" />
                <div>
                  <h1 className="font-heading font-black text-lg sm:text-xl md:text-2xl tracking-wider uppercase text-slate-900 dark:text-white leading-tight">
                    INDEKS BERITA
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Telusuri arsip publikasi berita Jurnal Wave berdasarkan rentang tanggal
                  </p>
                </div>
              </div>

              {/* Sisi Kanan: Tombol RENTANG WAKTU */}
              <div className="flex flex-col sm:items-end shrink-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  RENTANG WAKTU
                </span>
                <button
                  type="button"
                  onClick={handleOpenFilter}
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs hover:border-[#c00015]/40"
                >
                  <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>{formatDateRange(startDate, endDate)}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="flex flex-col gap-4 py-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
                  <div className="w-32 sm:w-44 aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                    <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedArticles.length > 0 ? (
            <>
              {/* List Kartu Berita Berkotak Mandiri (Persis Gambar 1 SukabumiUpdate) */}
              <div className="flex flex-col gap-3.5 sm:gap-4">
                {displayedArticles.map(article => (
                  <div
                    key={article.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-row gap-3.5 sm:gap-4 group cursor-pointer w-full items-start sm:items-center">
                      <Link
                        href={`/artikel/${article.id}`}
                        className="relative w-28 sm:w-40 md:w-44 aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden shrink-0 block bg-slate-100 dark:bg-slate-800"
                      >
                        {/* eslint-disable-next-img-element */}
                        <img
                          src={article.imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'}
                          alt={article.imageAlt || article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="flex flex-col gap-1 justify-center flex-1 min-w-0">
                        <span className="text-[#c00015] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
                          {(article.categoryLabel || article.category || 'BERITA').toUpperCase()}
                        </span>
                        <Link href={`/artikel/${article.id}`}>
                          <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-[#c00015] transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h3>
                        </Link>
                        {article.excerpt && (
                          <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {article.excerpt}
                          </p>
                        )}
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] sm:text-[11px] font-normal">
                          {formatIndoDate(article.createdAt || article.publishedDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ============================================================== */}
              {/* 4. Pagination / Penomoran Halaman (Persis Gambar 5)            */}
              {/* ============================================================== */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 select-none">
                  {/* Prev Button */}
                  {currentPage > 1 && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <span>&lt; Prev</span>
                    </button>
                  )}

                  {/* Number Pills */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Logic ellipsis jika halaman banyak
                    const isNearCurrent = Math.abs(page - currentPage) <= 1;
                    const isFirstOrLast = page === 1 || page === totalPages;

                    if (!isNearCurrent && !isFirstOrLast) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-1 text-xs text-slate-400">
                            •••
                          </span>
                        );
                      }
                      return null;
                    }

                    const isActive = page === currentPage;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  {currentPage < totalPages && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <span>Next &gt;</span>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                Tidak Ada Berita Ditemukan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Tidak ada publikasi artikel pada rentang tanggal {formatDateRange(startDate, endDate)}.
              </p>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const s = normalizeDay(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));
                  const e = endOfDay(today);
                  setStartDate(s);
                  setEndDate(e);
                  setActivePreset('30-hari');
                  setTempStartDate(s);
                  setTempEndDate(e);
                  setTempPreset('30-hari');
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#c00015] text-white hover:bg-[#a00012] transition cursor-pointer shadow-xs active:scale-95"
              >
                Reset ke 30 Hari Terakhir
              </button>
            </div>
          )}
        </main>

        {/* Kolom Kanan: Sidebar TERPOPULER (Persis Gambar 3) */}
        <aside className="lg:col-span-4 sticky top-20">
          <NewsArticleSidebar allArticles={articles} />
        </aside>
      </div>
    </div>
  );
}
