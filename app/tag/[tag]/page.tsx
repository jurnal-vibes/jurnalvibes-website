import type { Metadata } from 'next';
import { TopikClient } from '@/app/topik/[tag]/TopikClient';

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  let decoded = tag;
  try {
    decoded = decodeURIComponent(tag).replace(/[-_]+/g, ' ');
  } catch {}

  const title = `Tagar #${decoded} - Jurnal Wave`;
  const description = `Kumpulan liputan berita terkini dan terhangat dengan tagar #${decoded} di Jurnal Wave.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  return <TopikClient tag={tag} />;
}
