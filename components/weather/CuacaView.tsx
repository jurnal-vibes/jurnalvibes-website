'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  MoreVertical,
  ChevronDown,
  RefreshCw,
  X,
  Home,
  Crosshair,
  Info,
  Check,
  Loader2
} from 'lucide-react';
import {
  SUKABUMI_WEATHER_LOCATIONS,
  type SukabumiWeatherData,
  type WeatherHourPoint
} from '@/lib/weather';

interface CuacaViewProps {
  initialData: SukabumiWeatherData;
}

type MetricTab = 'suhu' | 'presipitasi' | 'angin';
type TempUnit = 'C' | 'F';

export function CuacaView({ initialData }: CuacaViewProps) {
  const [data, setData] = useState<SukabumiWeatherData>(initialData);
  const [selectedLocId, setSelectedLocId] = useState<string>(initialData.locationId || 'kota');
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<MetricTab>('suhu');
  const [unit, setUnit] = useState<TempUnit>('C');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // Modal "Pilih area" Google Cuaca
  const [isAreaModalOpen, setIsAreaModalOpen] = useState<boolean>(false);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [homeLocation, setHomeLocation] = useState<{ id: string; name: string } | null>(null);
  const [isSettingHome, setIsSettingHome] = useState<boolean>(false);

  // Ambil data home dari localStorage saat mount
  useEffect(() => {
    try {
      const savedHome = localStorage.getItem('jv_weather_home');
      if (savedHome) {
        setHomeLocation(JSON.parse(savedHome));
      }
    } catch {
      // ignore
    }
  }, []);

  // Ganti lokasi via modal
  const handleSelectLocation = async (locId: string) => {
    setSelectedLocId(locId);
    setIsAreaModalOpen(false);
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/weather?loc=${locId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setSelectedDayIdx(0);
      }
    } catch (err) {
      console.error('Error switching location:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Tetapkan alamat rumah
  const handleSetHome = (locId: string, name: string) => {
    const homeObj = { id: locId, name };
    setHomeLocation(homeObj);
    try {
      localStorage.setItem('jv_weather_home', JSON.stringify(homeObj));
    } catch {
      // ignore
    }
    setIsSettingHome(false);
    handleSelectLocation(locId);
  };

  // Gunakan lokasi presisi via Browser Geolocation
  const handleUsePreciseLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `/api/weather?lat=${latitude}&lon=${longitude}&name=${encodeURIComponent('Lokasi Anda')}`
          );
          if (res.ok) {
            const json = await res.json();
            setData(json);
            setSelectedLocId('presisi');
            setSelectedDayIdx(0);
            setIsAreaModalOpen(false);
          }
        } catch (err) {
          console.error('Gagal mengambil cuaca dari GPS:', err);
        } finally {
          setIsDetectingGps(false);
        }
      },
      (error) => {
        console.warn('Geolocation denied/error:', error);
        setIsDetectingGps(false);
        alert('Izin lokasi ditolak atau tidak dapat diakses. Menampilkan cuaca Sukabumi.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setShowMenu(false);
    try {
      const res = await fetch(`/api/weather?loc=${selectedLocId}&_t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error refreshing weather:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Konversi suhu ke F jika user memilih Fahrenheit
  const formatTemp = (celsius: number) => {
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  // 8 Titik waktu untuk grafik per jam (3 jam sekali selama 24 jam)
  const currentPoints: WeatherHourPoint[] = useMemo(() => {
    if (!data.hourlyPoints || data.hourlyPoints.length === 0) return [];

    const now = new Date();
    const currentHour = now.getHours();

    let startIdx = 0;
    if (selectedDayIdx === 0) {
      const roundedNextHour = Math.ceil(currentHour / 3) * 3;
      startIdx = Math.min(roundedNextHour, 21);
    } else {
      startIdx = selectedDayIdx * 24 + 8;
    }

    const points: WeatherHourPoint[] = [];
    for (let i = 0; i < 8; i++) {
      const targetIdx = startIdx + i * 3;
      if (data.hourlyPoints[targetIdx]) {
        points.push(data.hourlyPoints[targetIdx]);
      } else if (data.hourlyPoints[data.hourlyPoints.length - 1]) {
        points.push(data.hourlyPoints[data.hourlyPoints.length - 1]);
      }
    }
    return points;
  }, [data.hourlyPoints, selectedDayIdx]);

  // Kalkulasi kurva SVG Spline (Warna Emas & Kontras Elegan di atas Card Merah)
  const chartConfig = useMemo(() => {
    const width = 800;
    const height = 110;
    const padX = 45;
    const padTop = 32;
    const padBottom = 16;
    const usableWidth = width - padX * 2;
    const usableHeight = height - padTop - padBottom;

    if (currentPoints.length < 2) {
      return { pathD: '', areaD: '', pointsWithCoords: [], strokeColor: '#fbbc04', fillColor: 'url(#goldGrad)' };
    }

    let values: number[] = [];
    let unitLabel = '';
    let strokeColor = '#fbbc04'; // Kuning Emas Google
    let gradId = 'goldGrad';

    if (activeTab === 'suhu') {
      values = currentPoints.map(p => formatTemp(p.temp));
      unitLabel = '';
      strokeColor = '#fbbc04';
      gradId = 'goldGrad';
    } else if (activeTab === 'presipitasi') {
      values = currentPoints.map(p => p.precipitation);
      unitLabel = '%';
      strokeColor = '#93c5fd'; // Biru Lembut Kontras
      gradId = 'blueGrad';
    } else {
      values = currentPoints.map(p => p.windSpeed);
      unitLabel = ' km/h';
      strokeColor = '#6ee7b7'; // Toska Lembut Kontras
      gradId = 'tealGrad';
    }

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const coords = currentPoints.map((pt, i) => {
      const x = padX + (i / (currentPoints.length - 1)) * usableWidth;
      const val = values[i];
      const norm = (val - minVal) / range;
      const y = padTop + (1 - norm) * usableHeight;
      return {
        x,
        y,
        valStr: `${val}${unitLabel}`,
        timeStr: pt.timeStr,
        pt
      };
    });

    // Spline generator
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    return {
      pathD,
      areaD,
      pointsWithCoords: coords,
      strokeColor,
      fillColor: `url(#${gradId})`
    };
  }, [currentPoints, activeTab, unit]);

  // Ikon Cuaca Google 3D / Flat
  const renderGoogleWeatherIcon = (
    iconName: string,
    sizeClass = 'w-12 h-12'
  ) => {
    switch (iconName) {
      case 'Sun':
        return (
          <svg className={sizeClass} viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="16" fill="#FBBC04" />
            <circle cx="32" cy="32" r="22" stroke="#F29900" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
          </svg>
        );
      case 'Cloud':
        return (
          <svg className={sizeClass} viewBox="0 0 64 64" fill="none">
            <path
              d="M48 42H18a12 12 0 0 1-2.4-23.76A16 16 0 0 1 47 22a11 11 0 0 1 1 20z"
              fill="#D1D5DB"
            />
            <path
              d="M46 40H20a10 10 0 0 1-2-19.8A14 14 0 0 1 45 23a9 9 0 0 1 1 17z"
              fill="#F3F4F6"
            />
          </svg>
        );
      case 'CloudRain':
        return (
          <svg className={sizeClass} viewBox="0 0 64 64" fill="none">
            <path
              d="M46 36H20a10 10 0 0 1-2-19.8A14 14 0 0 1 45 19a9 9 0 0 1 1 17z"
              fill="#D1D5DB"
            />
            <circle cx="22" cy="46" r="2.5" fill="#60A5FA" />
            <circle cx="32" cy="48" r="2.5" fill="#60A5FA" />
            <circle cx="42" cy="46" r="2.5" fill="#60A5FA" />
          </svg>
        );
      case 'CloudLightning':
        return (
          <svg className={sizeClass} viewBox="0 0 64 64" fill="none">
            <path
              d="M46 34H20a10 10 0 0 1-2-19.8A14 14 0 0 1 45 17a9 9 0 0 1 1 17z"
              fill="#9CA3AF"
            />
            <polygon points="30,34 25,44 31,44 28,52 38,41 32,41" fill="#FDE047" />
            <circle cx="20" cy="48" r="2" fill="#60A5FA" />
            <circle cx="44" cy="48" r="2" fill="#60A5FA" />
          </svg>
        );
      case 'CloudSunRain':
        return (
          <svg className={sizeClass} viewBox="0 0 64 64" fill="none">
            <circle cx="40" cy="22" r="10" fill="#FBBC04" />
            <path
              d="M42 38H18a9 9 0 0 1-1.8-17.8A12 12 0 0 1 39 21a8 8 0 0 1 3 17z"
              fill="#E5E7EB"
            />
            <circle cx="24" cy="46" r="2" fill="#60A5FA" />
            <circle cx="34" cy="48" r="2" fill="#60A5FA" />
          </svg>
        );
      case 'CloudSun':
      default:
        return (
          <svg className={sizeClass} viewBox="0 0 64 64" fill="none">
            <circle cx="26" cy="24" r="13" fill="#FBBC04" />
            <path
              d="M48 44H22a11 11 0 0 1-2.2-21.78A15 15 0 0 1 46 25a10 10 0 0 1 2 19z"
              fill="#E5E7EB"
            />
            <path
              d="M47 42H24a9 9 0 0 1-1.8-17.8A13 13 0 0 1 45 26a8 8 0 0 1 2 16z"
              fill="#FFFFFF"
            />
          </svg>
        );
    }
  };

  const selectedDay = data.forecast7Days[selectedDayIdx] || data.forecast7Days[0];

  return (
    <div className="w-full flex justify-center">
      {/* CARD MERAH GRADIEN ELEGAN JURNAL VIBES */}
      <div className="w-full max-w-[760px] bg-gradient-to-br from-[#ba1a1a] via-[#a30010] to-[#76000a] text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-red-900/40 font-sans transition-all duration-300 relative select-none overflow-hidden">
        
        {/* Glow ambient background subtle */}
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-black/25 blur-3xl pointer-events-none" />

        {/* TOP BAR: Location Pin & Pilih Area */}
        <div className="flex items-center justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-2 text-sm sm:text-base text-white/95 font-medium flex-wrap">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
            <span className="font-bold tracking-tight text-white">{data.locationFull}</span>
            <span className="text-white/40">•</span>

            {/* Tombol 'Pilih area' Kuning Terang Elegan */}
            <button
              type="button"
              onClick={() => setIsAreaModalOpen(true)}
              className="text-amber-300 hover:text-amber-200 underline flex items-center gap-0.5 text-sm font-semibold transition-colors cursor-pointer"
            >
              Pilih area
            </button>
          </div>

          {/* Three dots menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Opsi"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#1f2023] text-zinc-100 rounded-xl shadow-2xl border border-zinc-700 py-1 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full text-left px-3.5 py-2 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                  <span>Segarkan Data</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HERO WEATHER DISPLAY */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
          {/* Sisi Kiri: Ikon Besar + Suhu + Presipitasi/Kelembapan/Angin */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="shrink-0 drop-shadow-md">
              {renderGoogleWeatherIcon(
                selectedDayIdx === 0 ? data.iconName : selectedDay.iconName,
                'w-18 h-18 sm:w-20 sm:h-20'
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-6xl sm:text-7xl font-light tracking-tight text-white drop-shadow-xs">
                {formatTemp(selectedDayIdx === 0 ? data.temperature : selectedDay.tempMax)}
              </span>
              <div className="flex items-center text-sm font-semibold text-white/70 select-none ml-1">
                <button
                  type="button"
                  onClick={() => setUnit('C')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    unit === 'C' ? 'text-white font-bold' : 'text-white/60'
                  }`}
                >
                  °C
                </button>
                <span className="mx-1 text-white/40">|</span>
                <button
                  type="button"
                  onClick={() => setUnit('F')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    unit === 'F' ? 'text-white font-bold' : 'text-white/60'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>

            <div className="hidden sm:flex flex-col text-xs sm:text-[13px] text-white/85 leading-relaxed ml-2 border-l border-white/20 pl-4 font-medium">
              <span>Presipitasi: <strong className="text-white font-bold">{data.precipitation}%</strong></span>
              <span>Kelembapan: <strong className="text-white font-bold">{data.humidity}%</strong></span>
              <span>Angin: <strong className="text-white font-bold">{data.windSpeed} km/h</strong></span>
            </div>
          </div>

          {/* Sisi Kanan: Cuaca, Hari & Jam, Kondisi */}
          <div className="text-left sm:text-right flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Cuaca
            </h2>
            <div className="text-sm font-medium text-white/80 mt-0.5">
              {selectedDayIdx === 0 ? `${data.dayName} ${data.timeNow}` : selectedDay.dayFullName}
            </div>
            <div className="text-sm font-semibold text-amber-300">
              {selectedDayIdx === 0 ? data.condition : selectedDay.condition}
            </div>
          </div>
        </div>

        {/* Mobile metrics */}
        <div className="flex sm:hidden justify-between text-xs text-white/90 mb-4 pb-3 border-b border-white/15 font-medium relative z-10">
          <span>Presipitasi: {data.precipitation}%</span>
          <span>Kelembapan: {data.humidity}%</span>
          <span>Angin: {data.windSpeed} km/h</span>
        </div>

        {/* TABS ROW: Suhu | Presipitasi | Angin */}
        <div className="flex items-center gap-6 border-b border-white/20 mb-4 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab('suhu')}
            className={`pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'suhu'
                ? 'text-amber-300'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Suhu
            {activeTab === 'suhu' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-400 rounded-t-sm" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presipitasi')}
            className={`pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'presipitasi'
                ? 'text-blue-200'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Presipitasi
            {activeTab === 'presipitasi' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-300 rounded-t-sm" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('angin')}
            className={`pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'angin'
                ? 'text-emerald-200'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Angin
            {activeTab === 'angin' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-300 rounded-t-sm" />
            )}
          </button>
        </div>

        {/* HOURLY SPLINE CHART (Google Area Spline di atas Card Merah) */}
        <div className="w-full relative overflow-x-auto no-scrollbar py-2 relative z-10">
          <div className="min-w-[620px] w-full">
            <svg
              viewBox="0 0 800 135"
              className="w-full h-[135px] overflow-visible"
            >
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbc04" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#fbbc04" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {chartConfig.areaD && (
                <path
                  d={chartConfig.areaD}
                  fill={chartConfig.fillColor}
                  className="transition-all duration-300"
                />
              )}

              {chartConfig.pathD && (
                <path
                  d={chartConfig.pathD}
                  fill="none"
                  stroke={chartConfig.strokeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )}

              {chartConfig.pointsWithCoords.map((pt, i) => (
                <g key={`val-${i}`}>
                  <text
                    x={pt.x}
                    y={Math.max(16, pt.y - 10)}
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pt.valStr}
                  </text>
                  <text
                    x={pt.x}
                    y={128}
                    fill="rgba(255, 255, 255, 0.75)"
                    fontSize="11"
                    fontWeight="normal"
                    textAnchor="middle"
                  >
                    {pt.timeStr}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* 8 DAYS FORECAST ROW (Google Weather 8 Days Bar dengan Frosted Glass) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mt-4 pt-4 border-t border-white/15 relative z-10">
          {data.forecast7Days.slice(0, 8).map((day, idx) => {
            const isSelected = selectedDayIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-zinc-900 shadow-lg scale-102 border border-white'
                    : 'bg-white/10 hover:bg-white/20 border border-white/15 text-white'
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-zinc-900' : 'text-white'
                  }`}
                >
                  {day.dayName}
                </span>

                <div className="my-2 drop-shadow-xs">
                  {renderGoogleWeatherIcon(day.iconName, 'w-8 h-8')}
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className={`font-bold ${isSelected ? 'text-zinc-900' : 'text-white'}`}>
                    {formatTemp(day.tempMax)}°
                  </span>
                  <span className={`${isSelected ? 'text-zinc-500' : 'text-white/70'}`}>
                    {formatTemp(day.tempMin)}°
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-6 pt-3 flex justify-between items-center text-[11px] text-white/70 border-t border-white/15 relative z-10">
          <span>
            Diperbarui {data.updatedAt} • Data Satelit Open-Meteo
          </span>
          <div className="flex items-center gap-2">
            <span
              onClick={() => setIsAreaModalOpen(true)}
              className="text-white/80 hover:text-amber-300 transition-colors cursor-pointer font-medium"
            >
              Google Cuaca
            </span>
            <span>•</span>
            <span
              onClick={handleRefresh}
              className="text-white/80 hover:text-amber-300 transition-colors cursor-pointer font-medium"
            >
              Masukan
            </span>
          </div>
        </div>

      </div>

      {/* MODAL "PILIH AREA" (TEMA PUTIH BERSIH NETRAL DENGAN AKSEN MERAH JURNAL VIBES) */}
      {isAreaModalOpen && (
        <div 
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsAreaModalOpen(false)}
        >
          <div
            className="w-full max-w-[430px] bg-white text-zinc-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150 relative select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Judul & Tombol Close (✕) */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
                Pilih area
              </h3>
              <button
                type="button"
                onClick={() => setIsAreaModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-red-50 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* SECTION 1: Untuk Anda */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-800">
                  <span>Untuk Anda</span>
                  <Info className="w-4 h-4 text-zinc-400" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (homeLocation) {
                        handleSelectLocation(homeLocation.id);
                      } else {
                        setIsSettingHome(!isSettingHome);
                      }
                    }}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-zinc-200 hover:border-primary/50 bg-zinc-50 hover:bg-red-50/40 text-xs sm:text-sm text-zinc-800 hover:text-primary transition-colors cursor-pointer group"
                  >
                    <Home className="w-4 h-4 text-primary group-hover:scale-105 transition-transform" />
                    <span className="font-medium">
                      {homeLocation ? `Rumah (${homeLocation.name})` : 'Tetapkan alamat rumah'}
                    </span>
                  </button>
                </div>

                {/* Submenu pilih alamat rumah jika belum ditetapkan */}
                {isSettingHome && !homeLocation && (
                  <div className="mt-2 p-3 bg-red-50/40 rounded-xl border border-red-100 text-xs flex flex-col gap-2">
                    <span className="text-zinc-600 font-medium">Pilih area rumah Anda di Sukabumi:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUKABUMI_WEATHER_LOCATIONS.map(loc => (
                        <button
                          key={`set-home-${loc.id}`}
                          type="button"
                          onClick={() => handleSetHome(loc.id, loc.name)}
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-primary text-zinc-800 hover:text-white border border-zinc-200 hover:border-primary cursor-pointer transition-colors shadow-2xs"
                        >
                          {loc.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Populer */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-800">
                  <span>Populer</span>
                  <Info className="w-4 h-4 text-zinc-400" />
                </div>

                {/* Flow of Pill Buttons - Putih Merah */}
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {SUKABUMI_WEATHER_LOCATIONS.map((loc) => {
                    const isActive = selectedLocId === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectLocation(loc.id)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs sm:text-sm transition-all cursor-pointer ${
                          isActive
                            ? 'bg-primary border-primary text-white font-semibold shadow-xs'
                            : 'bg-zinc-50 hover:bg-red-50/40 border-zinc-200 hover:border-primary/50 text-zinc-700 hover:text-primary'
                        }`}
                      >
                        <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-primary/70'}`} />
                        <span>{loc.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Lokasi Saat Ini */}
              <div className="flex flex-col gap-2 pt-1 border-t border-zinc-100">
                <div className="text-xs sm:text-sm font-semibold text-zinc-800">
                  Lokasi Saat Ini
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleUsePreciseLocation}
                    disabled={isDetectingGps}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-zinc-200 hover:border-primary/50 bg-zinc-50 hover:bg-red-50/40 text-xs sm:text-sm text-zinc-800 hover:text-primary transition-colors cursor-pointer disabled:opacity-50 group"
                  >
                    {isDetectingGps ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <Crosshair className="w-4 h-4 text-primary group-hover:scale-105 transition-transform" />
                    )}
                    <span className="font-medium">
                      {isDetectingGps ? 'Mendeteksi koordinat Anda...' : 'Gunakan lokasi presisi'}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
