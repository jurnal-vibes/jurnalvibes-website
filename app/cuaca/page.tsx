import type { Metadata } from 'next';
import { CuacaView } from '@/components/weather/CuacaView';
import { fetchLiveSukabumiWeather } from '@/lib/weather';

export const metadata: Metadata = {
  title: 'Cuaca Sukabumi Hari Ini | Jurnal Wave',
  description: 'Prakiraan cuaca satelit terkini dan estimasi 7 hari ke depan untuk wilayah Kota Sukabumi, Palabuhanratu, Cisaat, dan Cibadak.',
  openGraph: {
    title: 'Cuaca Sukabumi Hari Ini | Jurnal Wave',
    description: 'Prakiraan cuaca satelit terkini dan estimasi 7 hari ke depan untuk wilayah Sukabumi.',
  },
};

// Revalidate data halaman cuaca tiap 5 menit (300 detik)
export const revalidate = 300;

export default async function CuacaPage() {
  const initialData = await fetchLiveSukabumiWeather('kota');

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-12 flex flex-col min-w-0">
      <header className="flex flex-col gap-2 mb-4 pb-4 border-b border-outline-variant/50">
        <h1 className="text-2xl md:text-4xl font-bold font-headline-xl text-on-surface tracking-tight">
          Cuaca Sukabumi Hari Ini
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant font-body-lg">
          Prakiraan cuaca satelit real-time dan proyeksi 7 hari ke depan di berbagai penjuru Sukabumi.
        </p>
      </header>

      <CuacaView initialData={initialData} />
    </div>
  );
}
