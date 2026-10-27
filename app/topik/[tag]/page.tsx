import type { Metadata } from 'next';
import { TopikClient } from './TopikClient';

interface TopikPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: TopikPageProps): Promise<Metadata> {
  const { tag } = await params;
  let decoded = tag;
  try {
    decoded = decodeURIComponent(tag).replace(/[-_]+/g, ' ');
  } catch {}

  const title = `Topik: ${decoded.toUpperCase()} - Jurnal Wave`;
  const description = `Kumpulan liputan berita terkini dan terhangat seputar topik ${decoded} di Jurnal Wave.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function TopikPage({ params }: TopikPageProps) {
  const { tag } = await params;
  return <TopikClient tag={tag} />;
}
