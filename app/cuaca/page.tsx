import type { Metadata } from 'next';
import { CloudSun, Sun, CloudRain, CloudSunRain } from 'lucide-react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';

export const metadata: Metadata = {
  title: 'Cuaca Sukabumi',
  description: 'Prakiraan cuaca terkini dan estimasi 7 hari ke depan di wilayah Sukabumi.',
  openGraph: {
    title: 'Cuaca Sukabumi Hari Ini | Jurnal Vibes',
    description: 'Prakiraan cuaca terkini dan estimasi 7 hari ke depan di wilayah Sukabumi.',
  },
};

const forecast7Days = [
  { day: 'Sen', icon: Sun, temp: '28° / 22°' },
  { day: 'Sel', icon: CloudSun, temp: '26° / 21°' },
  { day: 'Rab', icon: CloudRain, temp: '24° / 20°' },
  { day: 'Kam', icon: CloudSun, temp: '24° / 21°' },
  { day: 'Jum', icon: CloudRain, temp: '23° / 20°' },
  { day: 'Sab', icon: CloudSunRain, temp: '25° / 21°' },
  { day: 'Min', icon: Sun, temp: '27° / 22°' },
];

export default function CuacaPage() {
  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-6 lg:px-gutter pt-stack-lg pb-10 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="w-full md:w-3/4 flex flex-col gap-6 pr-0 md:pr-6 lg:pr-12">
        <header className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            Cuaca Sukabumi Hari Ini
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
            Prakiraan cuaca terkini dan estimasi 7 hari ke depan di wilayah Sukabumi.
          </p>
        </header>

        {/* Current Weather Banner */}
        <section className="bg-gradient-to-br from-primary to-[#93000d] rounded-2xl p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5 sm:gap-6">
              <CloudSun className="w-16 h-16 sm:w-20 sm:h-20 text-white stroke-[1.5] shrink-0" />
              <div>
                <div className="text-5xl sm:text-6xl font-bold">24°C</div>
                <div className="text-base sm:text-lg opacity-90 mt-1">Berawan • Sukabumi</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-8 w-full md:w-auto text-center">
              <div>
                <div className="text-xs uppercase tracking-wider opacity-75 mb-1">Kelembapan</div>
                <div className="font-bold text-lg sm:text-xl">78%</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider opacity-75 mb-1">Angin</div>
                <div className="font-bold text-lg sm:text-xl">12 km/h</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider opacity-75 mb-1">Udara (AQI)</div>
                <div className="font-bold text-lg sm:text-xl">42 (Baik)</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7 Days Forecast */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-on-surface">
            Prakiraan 7 Hari
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {forecast7Days.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 text-center flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                >
                  <div className="text-xs font-bold uppercase text-on-surface">{item.day}</div>
                  <IconComp className="w-7 h-7 text-primary" />
                  <div className="text-sm font-bold text-on-surface">{item.temp}</div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
