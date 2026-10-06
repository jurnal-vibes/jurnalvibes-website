import type { Metadata } from 'next';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { DUMMY_ARTICLES } from '@/data/dummyArticles';
import { CuacaView } from '@/components/weather/CuacaView';
import { fetchLiveSukabumiWeather } from '@/lib/weather';

export const metadata: Metadata = {
  title: 'Cuaca Sukabumi Hari Ini | Jurnal Vibes',
  description: 'Prakiraan cuaca satelit terkini dan estimasi 7 hari ke depan untuk wilayah Kota Sukabumi, Palabuhanratu, Cisaat, dan Cibadak.',
  openGraph: {
    title: 'Cuaca Sukabumi Hari Ini | Jurnal Vibes',
    description: 'Prakiraan cuaca satelit terkini dan estimasi 7 hari ke depan untuk wilayah Sukabumi.',
  },
};

// Revalidate data halaman cuaca tiap 5 menit (300 detik)
export const revalidate = 300;

export default async function CuacaPage() {
  const initialData = await fetchLiveSukabumiWeather('kota');

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-6 lg:px-gutter pt-stack-lg pb-10 md:pb-stack-lg flex flex-col md:flex-row gap-gutter relative">
      <LeftSidebar articles={DUMMY_ARTICLES} />

      <main className="w-full md:w-3/4 flex flex-col gap-6">
        <header className="flex flex-col gap-2 mb-2">
          <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
            Cuaca Sukabumi Hari Ini
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
            Prakiraan cuaca satelit real-time dan proyeksi 7 hari ke depan di berbagai penjuru Sukabumi.
          </p>
        </header>

        <CuacaView initialData={initialData} />
      </main>
    </div>
  );
}
