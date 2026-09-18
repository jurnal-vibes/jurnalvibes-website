import type { Metadata } from 'next';
import { Inter, Literata } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Jurnal Vibes - Portal Berita & Lifestyle Sukabumi',
  description: 'Portal berita, lifestyle, loker, otomotif, tech, dan informasi harian Sukabumi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${literata.variable} light`}>
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
