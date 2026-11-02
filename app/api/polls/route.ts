import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActivePoll, getAllPolls } from '@/lib/polls';

export const dynamic = 'force-dynamic';

// GET /api/polls - Mengambil polling aktif untuk beranda, atau semua polling untuk admin (?all=true)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const getAll = searchParams.get('all') === 'true';

    if (getAll) {
      const polls = await getAllPolls();
      return NextResponse.json({ success: true, data: polls });
    }

    const activePoll = await getActivePoll();
    return NextResponse.json({ success: true, data: activePoll });
  } catch (error) {
    console.error('Error in GET /api/polls:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data polling.' },
      { status: 500 }
    );
  }
}

// POST /api/polls - Menambahkan polling baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, category = 'Isu Hangat', options, isActive = true } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pertanyaan polling wajib diisi.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Minimal harus ada 2 pilihan jawaban.' },
        { status: 400 }
      );
    }

    // Jika polling baru ini dijadikan aktif, nonaktifkan polling aktif lainnya
    if (isActive) {
      await prisma.poll.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    // Format pilihan jawaban (bisa berupa string[] atau { text: string }[])
    const formattedOptions = options
      .map((opt: any) => (typeof opt === 'string' ? opt.trim() : (opt.text || '').trim()))
      .filter((text: string) => text.length > 0)
      .map((text: string) => ({
        text,
        votes: 0,
      }));

    if (formattedOptions.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Pilihan jawaban tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const newPoll = await prisma.poll.create({
      data: {
        question: question.trim(),
        category: category.trim(),
        isActive: Boolean(isActive),
        options: {
          create: formattedOptions,
        },
      },
      include: {
        options: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Polling berhasil diterbitkan.',
      data: {
        id: newPoll.id,
        question: newPoll.question,
        category: newPoll.category,
        isActive: newPoll.isActive,
        createdAt: newPoll.createdAt.toISOString(),
        totalVotes: 0,
        options: newPoll.options.map(o => ({
          id: o.id,
          text: o.text,
          votes: o.votes,
        })),
      },
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat polling baru.' },
      { status: 500 }
    );
  }
}

// PUT /api/polls - Mengubah polling atau mengaktifkan polling tertentu
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, question, category, isActive, options } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID Polling wajib disertakan.' },
        { status: 400 }
      );
    }

    // Jika mengaktifkan polling ini, nonaktifkan polling lainnya
    if (isActive) {
      await prisma.poll.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false },
      });
    }

    const updateData: any = {};
    if (typeof question === 'string' && question.trim()) updateData.question = question.trim();
    if (typeof category === 'string' && category.trim()) updateData.category = category.trim();
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updated = await prisma.poll.update({
      where: { id },
      data: updateData,
      include: {
        options: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Jika ada options baru yang disertakan
    if (Array.isArray(options) && options.length >= 2) {
      // Hapus opsi lama dan buat opsi baru
      await prisma.pollOption.deleteMany({ where: { pollId: id } });
      await prisma.pollOption.createMany({
        data: options.map((opt: any) => ({
          pollId: id,
          text: typeof opt === 'string' ? opt.trim() : (opt.text || '').trim(),
          votes: typeof opt === 'object' && typeof opt.votes === 'number' ? opt.votes : 0,
        })),
      });
    }

    const finalPoll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Polling berhasil diperbarui.',
      data: finalPoll,
    });
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui polling.' },
      { status: 500 }
    );
  }
}

// DELETE /api/polls - Menghapus polling
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID Polling wajib disertakan.' },
        { status: 400 }
      );
    }

    await prisma.poll.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Polling berhasil dihapus.',
    });
  } catch (error) {
    console.error('Error deleting poll:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus polling.' },
      { status: 500 }
    );
  }
}
