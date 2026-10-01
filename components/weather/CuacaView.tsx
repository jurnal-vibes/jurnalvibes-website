'use client';

import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSunRain,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Gauge,
  RefreshCw,
  MapPin,
  Thermometer,
  Info,
  Umbrella,
  Compass
} from 'lucide-react';
import {
  SUKABUMI_WEATHER_LOCATIONS,
  type SukabumiWeatherData,
  type WeatherDayForecast
} from '@/lib/weather';

interface CuacaViewProps {
  initialData: SukabumiWeatherData;
}

export function CuacaView({ initialData }: CuacaViewProps) {
  const [selectedLoc, setSelectedLoc] = useState<string>('kota');
  const [data, setData] = useState<SukabumiWeatherData>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLocationChange = async (locId: string) => {
    if (locId === selectedLoc && !isLoading) return;
    setSelectedLoc(locId);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/weather?loc=${locId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to switch weather location:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/weather?loc=${selectedLoc}&_t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to refresh weather:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderWeatherIcon = (
    iconName: WeatherDayForecast['iconName'],
    className: string
  ) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={className} />;
      case 'CloudSun':
        return <CloudSun className={className} />;
      case 'Cloud':
        return <Cloud className={className} />;
      case 'CloudRain':
        return <CloudRain className={className} />;
      case 'CloudSunRain':
        return <CloudSunRain className={className} />;
      case 'CloudLightning':
        return <CloudLightning className={className} />;
      case 'CloudFog':
        return <CloudFog className={className} />;
      default:
        return <CloudSun className={className} />;
    }
  };

  // Karakteristik per wilayah untuk tips kontekstual
  const getLocationNotes = () => {
    switch (selectedLoc) {
      case 'palabuhanratu':
        return {
          zone: 'Pesisir Pantai Selatan',
          tip: 'Kawasan maritim dengan hembusan angin laut dan kelembapan pesisir. Cocok untuk aktivitas bahari, tetap perhatikan informasi pasang surut air laut.',
        };
      case 'cisaat':
        return {
          zone: 'Kaki Gunung Gede - Pangrango',
          tip: 'Suhu cenderung lebih sejuk dan sering berkabut pada sore hingga malam hari. Kenakan jaket saat berkendara malam.',
        };
      case 'cibadak':
        return {
          zone: 'Jalur Arteri Sukabumi Utara',
          tip: 'Kawasan transit utama Sukabumi. Waspadai potensi hujan lokal mendadak pada jam pulang kerja sore hari.',
        };
      default:
        return {
          zone: 'Pusat Kota Sukabumi',
          tip: 'Cuaca perkotaan yang sejuk. Ideal untuk eksplorasi kuliner di Dago dan santai di Alun-alun Kota Sukabumi.',
        };
    }
  };

  const locationNotes = getLocationNotes();

  return (
    <div className="flex flex-col gap-6">
      {/* Location Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/60 pb-3">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          Pilih Wilayah:
        </span>
        {SUKABUMI_WEATHER_LOCATIONS.map((loc) => {
          const isActive = selectedLoc === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => handleLocationChange(loc.id)}
              disabled={isLoading}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-xs scale-102'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/50'
              }`}
            >
              {loc.name}
            </button>
          );
        })}
      </div>

      {/* Main Weather Card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#b30010] to-[#7a000a] rounded-2xl p-6 sm:p-8 text-white shadow-lg transition-all duration-300">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        {/* Top Header inside card: Location badge & Refresh button */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Satelit Real-Time • {data.locationName}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-white/90 hover:text-white transition-all duration-150 cursor-pointer disabled:opacity-50"
            title="Perbarui data cuaca sekarang"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Diperbarui {data.updatedAt}</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          {/* Main Temperature & Condition */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              {renderWeatherIcon(
                data.iconName,
                'w-14 h-14 sm:w-18 sm:h-18 text-amber-300 stroke-[1.6]'
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                  {data.temperature}°C
                </span>
                <span className="text-xs sm:text-sm font-medium opacity-80 bg-white/15 px-2 py-0.5 rounded-md">
                  Terasa {data.apparentTemp}°C
                </span>
              </div>
              <div className="text-base sm:text-lg font-medium opacity-95 mt-1">
                {data.condition} • {data.locationName}
              </div>
            </div>
          </div>

          {/* 3 Metric Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-white/20 pt-5 md:pt-0 md:pl-8 w-full md:w-auto text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider opacity-80 mb-1">
                <Droplets className="w-3.5 h-3.5" />
                <span>Kelembapan</span>
              </div>
              <div className="font-bold text-lg sm:text-xl">{data.humidity}%</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider opacity-80 mb-1">
                <Wind className="w-3.5 h-3.5" />
                <span>Angin</span>
              </div>
              <div className="font-bold text-lg sm:text-xl">
                {data.windSpeed} km/h
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider opacity-80 mb-1">
                <Gauge className="w-3.5 h-3.5" />
                <span>Udara (AQI)</span>
              </div>
              <div className="font-bold text-lg sm:text-xl">
                {data.aqiValue}{' '}
                <span className="text-xs font-normal opacity-90">({data.aqiStatus})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Days Forecast */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">
            Prakiraan 7 Hari ({data.locationName})
          </h2>
          <span className="text-xs text-on-surface-variant font-medium">
            Sumber: Satelit Open-Meteo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {data.forecast7Days.map((item, idx) => {
            const isToday = idx === 0;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border text-center flex flex-col items-center justify-between gap-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                  isToday
                    ? 'bg-primary/5 border-primary/40 dark:bg-primary/10'
                    : 'bg-surface-container-low border-outline-variant/60 hover:border-primary/50'
                }`}
              >
                {/* Day Header */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold uppercase text-on-surface">
                      {item.dayName}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-primary text-white rounded-full">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  {item.dateStr && (
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {new Date(item.dateStr).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  )}
                </div>

                {/* Weather Icon */}
                <div className="my-1">
                  {renderWeatherIcon(
                    item.iconName,
                    'w-7 h-7 text-primary stroke-[1.8]'
                  )}
                </div>

                {/* Condition Name */}
                <div className="text-[11px] font-medium text-on-surface-variant line-clamp-1">
                  {item.condition}
                </div>

                {/* Min / Max Temp */}
                <div className="text-xs font-bold text-on-surface bg-surface-container px-2 py-1 rounded-md w-full">
                  {item.tempMax}° <span className="text-on-surface-variant font-normal">/ {item.tempMin}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weather Notes & Location Insights */}
      <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Karakteristik {locationNotes.zone}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {locationNotes.tip}
          </p>
        </div>
      </section>
    </div>
  );
}
