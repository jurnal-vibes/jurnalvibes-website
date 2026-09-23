import type { Metadata } from 'next';
import { Inter, Literata, Montserrat } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jurnalvibes.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Jurnal Vibes - Portal Berita & Lifestyle Sukabumi',
    template: '%s | Jurnal Vibes',
  },
  description: 'Portal berita, lifestyle, loker, otomotif, tech, dan informasi harian Sukabumi.',
  authors: [{ name: 'Redaksi Jurnal Vibes' }],
  creator: 'Jurnal Vibes',
  publisher: 'Jurnal Vibes Media',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteUrl,
    siteName: 'Jurnal Vibes',
    title: 'Jurnal Vibes - Portal Berita & Lifestyle Sukabumi',
    description: 'Portal berita, lifestyle, loker, otomotif, tech, dan informasi harian Sukabumi.',
    images: [
      {
        url: '/logo.webp',
        width: 1200,
        height: 630,
        alt: 'Jurnal Vibes Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jurnal Vibes - Portal Berita & Lifestyle Sukabumi',
    description: 'Portal berita, lifestyle, loker, otomotif, tech, dan informasi harian Sukabumi.',
    images: ['/logo.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${literata.variable} ${montserrat.variable} light`}>
      <head>
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
      </head>
      <body className="bg-surface text-on-surface min-h-screen flex flex-col font-body-md antialiased relative overflow-x-clip">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
