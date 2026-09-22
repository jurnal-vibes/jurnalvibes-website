import type { Metadata } from 'next';
import { Inter, Literata, Montserrat } from 'next/font/google';
import './globals.css';
import { HeaderNav } from '@/components/layout/HeaderNav';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChatbotButton } from '@/components/ui/ChatbotButton';

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
  keywords: ['Jurnal Vibes', 'Berita Sukabumi', 'Loker Sukabumi', 'Portal Berita', 'Lifestyle', 'Teknologi'],
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
        <link rel="preconnect" href="https://halo-jurnal-app.vercel.app" />
        <link rel="dns-prefetch" href="https://halo-jurnal-app.vercel.app" />
      </head>
      <body className="bg-surface text-on-surface min-h-screen flex flex-col font-body-md antialiased relative overflow-x-clip">
        <HeaderNav />
        {children}
        <Footer />
        <BottomNav />
        <ChatbotButton />
      </body>
    </html>
  );
}
