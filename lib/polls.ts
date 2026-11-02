import { prisma } from '@/lib/prisma';
import { Poll } from '@/types';

export const DEFAULT_FALLBACK_POLL: Poll = {
  id: 'default-active-poll',
  question: 'Jelang laga big match akhir pekan ini, tim mana yang menurut kamu bakal menang dan mendominasi pertandingan?',
  category: 'Sport & Komunitas',
  isActive: true,
  createdAt: new Date().toISOString(),
  options: [
    { id: 'opt-1', text: 'Tuan Rumah Menang Telak', votes: 142 },
    { id: 'opt-2', text: 'Tim Tamu Bikin Kejutan', votes: 88 },
    { id: 'opt-3', text: 'Pertandingan Imbang (Draw)', votes: 65 },
    { id: 'opt-4', text: 'Nonton Saja Yang Penting Seru!', votes: 120 },
  ],
};

// Seed poll perdana jika database masih kosong
export async function seedInitialPollIfEmpty(): Promise<Poll> {
  try {
    const count = await prisma.poll.count();
    if (count === 0) {
      const created = await prisma.poll.create({
        data: {
          question: DEFAULT_FALLBACK_POLL.question,
          category: DEFAULT_FALLBACK_POLL.category || 'Sport & Komunitas',
          isActive: true,
          options: {
            create: DEFAULT_FALLBACK_POLL.options.map(opt => ({
              text: opt.text,
              votes: opt.votes,
            })),
          },
        },
        include: {
          options: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return {
        id: created.id,
        question: created.question,
        category: created.category || 'Umum',
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        options: created.options.map(o => ({
          id: o.id,
          text: o.text,
          votes: o.votes,
        })),
        totalVotes: created.options.reduce((sum, o) => sum + o.votes, 0),
      };
    }
  } catch (error) {
    console.error('Error seeding initial poll:', error);
  }
  return DEFAULT_FALLBACK_POLL;
}

// Ambil 1 Polling yang Sedang Aktif untuk Homepage & Publik
export async function getActivePoll(): Promise<Poll | null> {
  try {
    const poll = await prisma.poll.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        options: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Jika tidak ada polling aktif di database, kembalikan null (jangan dipaksa aktif)
    if (!poll) {
      return null;
    }

    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
    return {
      id: poll.id,
      question: poll.question,
      category: poll.category || 'Umum',
      isActive: poll.isActive,
      createdAt: poll.createdAt.toISOString(),
      totalVotes,
      options: poll.options.map(o => ({
        id: o.id,
        text: o.text,
        votes: o.votes,
      })),
    };
  } catch (error) {
    console.error('Error fetching active poll from DB:', error);
    return null;
  }
}

// Ambil seluruh daftar polling untuk Dashboard Admin
export async function getAllPolls(): Promise<Poll[]> {
  try {
    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        options: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return polls.map(p => ({
      id: p.id,
      question: p.question,
      category: p.category || 'Umum',
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
      totalVotes: p.options.reduce((sum, o) => sum + o.votes, 0),
      options: p.options.map(o => ({
        id: o.id,
        text: o.text,
        votes: o.votes,
      })),
    }));
  } catch (error) {
    console.error('Error fetching all polls:', error);
    return [];
  }
}
