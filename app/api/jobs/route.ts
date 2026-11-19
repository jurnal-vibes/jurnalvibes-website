import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { clearServerJobsCache, formatJobFromDb, fetchJobs } from '@/lib/jobs';
import { DUMMY_JOBS } from '@/data/dummyJobs';

export const dynamic = 'force-dynamic';

// GET /api/jobs - Mengambil semua lowongan kerja
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const getAll = searchParams.get('all') === 'true';

    if (getAll) {
      const dbJobs = await prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
      });
      const finalJobs = dbJobs.length > 0 ? dbJobs.map(formatJobFromDb) : DUMMY_JOBS;
      return NextResponse.json({
        success: true,
        count: finalJobs.length,
        data: finalJobs,
      });
    }

    const jobs = await fetchJobs();
    return NextResponse.json(
      { success: true, count: jobs.length, data: jobs },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err) {
    console.warn('API GET /api/jobs notice:', err);
    const fallback = await fetchJobs();
    return NextResponse.json({ success: true, count: fallback.length, data: fallback });
  }
}

// POST /api/jobs - Menambahkan lowongan kerja baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      company,
      location,
      region = 'Kota Sukabumi',
      salaryRange,
      type = 'Full-Time',
      education,
      description,
      requirements,
      benefits,
      applyEmail,
      applyUrl,
    } = body;

    if (!title || !company || !location || !description) {
      return NextResponse.json(
        { success: false, message: 'Judul, perusahaan, lokasi, dan deskripsi wajib diisi.' },
        { status: 400 }
      );
    }

    const reqString = Array.isArray(requirements)
      ? JSON.stringify(requirements)
      : typeof requirements === 'string'
      ? requirements
      : '';

    const benString = Array.isArray(benefits)
      ? JSON.stringify(benefits)
      : typeof benefits === 'string'
      ? benefits
      : '';

    const newJob = await prisma.job.create({
      data: {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        region: region?.trim() || 'Kota Sukabumi',
        salaryRange: salaryRange?.trim() || 'Kompetitif',
        type: type?.trim() || 'Full-Time',
        education: education?.trim() || null,
        description: description.trim(),
        requirements: reqString,
        benefits: benString,
        applyEmail: applyEmail?.trim() || null,
        applyUrl: applyUrl?.trim() || applyEmail?.trim() || null,
        isActive: true,
      },
    });

    clearServerJobsCache();
    revalidatePath('/loker');
    revalidatePath('/halo-jurnal/admin/loker');

    return NextResponse.json({
      success: true,
      message: 'Lowongan kerja berhasil ditambahkan ke server database!',
      data: formatJobFromDb(newJob),
    });
  } catch (err) {
    console.error('API POST /api/jobs error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan lowongan ke database server.' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs - Mengubah data lowongan kerja
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      company,
      location,
      region,
      salaryRange,
      type,
      education,
      description,
      requirements,
      benefits,
      applyEmail,
      applyUrl,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID lowongan wajib disertakan.' },
        { status: 400 }
      );
    }

    const reqString = requirements !== undefined
      ? Array.isArray(requirements)
        ? JSON.stringify(requirements)
        : String(requirements)
      : undefined;

    const benString = benefits !== undefined
      ? Array.isArray(benefits)
        ? JSON.stringify(benefits)
        : String(benefits)
      : undefined;

    const updated = await prisma.job.update({
      where: { id },
      data: {
        title: title?.trim(),
        company: company?.trim(),
        location: location?.trim(),
        region: region?.trim(),
        salaryRange: salaryRange?.trim(),
        type: type?.trim(),
        education: education?.trim(),
        description: description?.trim(),
        requirements: reqString,
        benefits: benString,
        applyEmail: applyEmail?.trim(),
        applyUrl: applyUrl?.trim() || applyEmail?.trim(),
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    clearServerJobsCache();
    revalidatePath('/loker');
    revalidatePath(`/loker/${id}`);
    revalidatePath('/halo-jurnal/admin/loker');

    return NextResponse.json({
      success: true,
      message: 'Lowongan kerja berhasil diperbarui!',
      data: formatJobFromDb(updated),
    });
  } catch (err) {
    console.error('API PUT /api/jobs error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui lowongan kerja di database.' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs - Menghapus lowongan kerja
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID lowongan wajib disertakan.' },
        { status: 400 }
      );
    }

    await prisma.job.delete({
      where: { id },
    });

    clearServerJobsCache();
    revalidatePath('/loker');
    revalidatePath('/halo-jurnal/admin/loker');

    return NextResponse.json({
      success: true,
      message: 'Lowongan kerja berhasil dihapus dari server database.',
    });
  } catch (err) {
    console.error('API DELETE /api/jobs error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus lowongan dari database.' },
      { status: 500 }
    );
  }
}
