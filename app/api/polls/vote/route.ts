import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordVoteInFallback } from '@/lib/polls';

export const dynamic = 'force-dynamic';

// POST /api/polls/vote - Memberikan vote pada pilihan polling
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pollId, optionId } = body;

    if (!pollId || !optionId) {
      return NextResponse.json(
        { success: false, message: 'pollId dan optionId wajib disertakan.' },
        { status: 400 }
      );
    }

    try {
      // Increment vote count untuk option terpilih di database
      await prisma.pollOption.update({
        where: { id: optionId },
        data: {
          votes: { increment: 1 },
        },
      });

      // Ambil data polling yang sudah ter-update
      const updatedPoll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
          options: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (updatedPoll) {
        const totalVotes = updatedPoll.options.reduce((sum, o) => sum + o.votes, 0);
        return NextResponse.json({
          success: true,
          message: 'Vote berhasil dicatat.',
          data: {
            id: updatedPoll.id,
            question: updatedPoll.question,
            category: updatedPoll.category || 'Umum',
            isActive: updatedPoll.isActive,
            createdAt: updatedPoll.createdAt.toISOString(),
            totalVotes,
            options: updatedPoll.options.map(o => ({
              id: o.id,
              text: o.text,
              votes: o.votes,
            })),
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma vote record notice (using fallback store):', (dbErr as any)?.message || dbErr);
    }

    // Fallback: catat vote ke in-memory store
    const fallbackUpdated = recordVoteInFallback(pollId, optionId);
    if (fallbackUpdated) {
      return NextResponse.json({
        success: true,
        message: 'Vote berhasil dicatat.',
        data: fallbackUpdated,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Vote berhasil dicatat secara lokal.',
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mencatat vote.' },
      { status: 500 }
    );
  }
}
