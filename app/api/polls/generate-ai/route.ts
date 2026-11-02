import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper deteksi kategori liputan media secara kontekstual
function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes('bola') ||
    lower.includes('persib') ||
    lower.includes('fc') ||
    lower.includes('laga') ||
    lower.includes('vs') ||
    lower.includes('lawan') ||
    lower.includes('timnas') ||
    lower.includes('atlet') ||
    lower.includes('sport') ||
    lower.includes('pertandingan') ||
    lower.includes('skor') ||
    lower.includes('turnamen') ||
    lower.includes('champions') ||
    lower.includes('liga')
  ) {
    return 'Sport & E-Sport';
  }
  if (
    lower.includes('kuliner') ||
    lower.includes('makanan') ||
    lower.includes('mochi') ||
    lower.includes('kopi') ||
    lower.includes('wisata') ||
    lower.includes('curug') ||
    lower.includes('pantai') ||
    lower.includes('hotel') ||
    lower.includes('resto') ||
    lower.includes('kafe')
  ) {
    return 'Kuliner & Wisata';
  }
  if (
    lower.includes('ai') ||
    lower.includes('teknologi') ||
    lower.includes('gadget') ||
    lower.includes('aplikasi') ||
    lower.includes('digital') ||
    lower.includes('internet') ||
    lower.includes('robot') ||
    lower.includes('smartphone')
  ) {
    return 'Teknologi & Digital';
  }
  if (
    lower.includes('jalan') ||
    lower.includes('rusak') ||
    lower.includes('kebijakan') ||
    lower.includes('walikota') ||
    lower.includes('bupati') ||
    lower.includes('fasilitas') ||
    lower.includes('lapang') ||
    lower.includes('pasar') ||
    lower.includes('trotoar') ||
    lower.includes('angkot') ||
    lower.includes('transportasi') ||
    lower.includes('sukabumi') ||
    lower.includes('warga') ||
    lower.includes('pemerintah')
  ) {
    return 'Advokasi & Isu Publik';
  }
  if (
    lower.includes('film') ||
    lower.includes('musik') ||
    lower.includes('nongkrong') ||
    lower.includes('healing') ||
    lower.includes('trend') ||
    lower.includes('outfit') ||
    lower.includes('liburan')
  ) {
    return 'Lifestyle & Hiburan';
  }
  return 'Isu Hangat & Komunitas';
}

// Mesin Cerdas Pembuat Polling Kontekstual (Context-Aware Generator)
function generateSmartPolling(input: string, recentArticles: any[]) {
  const text = (input || '').trim();

  // 1. Jika pengguna tidak mengetik topik, gunakan berita terkini atau topik redaksi hangat
  if (!text) {
    if (recentArticles.length > 0) {
      const topArticle = recentArticles[0];
      return {
        question: `Terkait berita terkini: "${topArticle.title}", bagaimana pandangan kamu?`,
        category: topArticle.category || 'Berita Terkini',
        options: [
          'Sangat Mendukung & Positif',
          'Perlu Evaluasi & Pengawasan',
          'Kurang Sepakat / Masih Ragu',
          'Menunggu Realisasi Nyata',
        ],
      };
    }
    return {
      question: 'Di antara rubrik liputan Jurnal Wave berikut, mana yang paling kamu minati setiap hari?',
      category: 'Komunitas & Pembaca',
      options: [
        'Berita Utama & Isu Publik',
        'Kabar Olahraga & E-Sport',
        'Kuliner & Wisata Sukabumi',
        'Lowongan Kerja & Karir',
      ],
    };
  }

  // 2. Deteksi Pertandingan / Duel Olahraga (VS / Lawan / Kontra)
  const vsMatch = text.match(
    /(?:sepak\s*bola|laga|pertandingan|duel|big\s*match|jadwal|prediksi|tebak\s*skor|menjelang\s*laga|menjelang)?\s*(.+?)\s+(?:vs\.?|v\.s\.?|lawan|kontra)\s+(.+)/i
  );
  if (vsMatch) {
    let t1 = vsMatch[1].trim();
    let t2 = vsMatch[2].trim();

    // Bersihkan prefix instruksi di depan tim 1
    const prefixes = /^(sepak\s*bola|laga|pertandingan|duel|big\s*match|jadwal|prediksi|tebak\s*skor|tebak\s*sc|menjelang\s*laga|menjelang|tentang|soal)\s+/gi;
    while (prefixes.test(t1)) {
      t1 = t1.replace(prefixes, '').trim();
    }

    // Bersihkan suffix kata kerja / sisa ketikan di belakang tim 2
    const suffixes = /\s+(tebak\s*skor|tebak\s*sc|skor|prediksi|laga|pertandingan|menang|siapa)$/gi;
    while (suffixes.test(t2)) {
      t2 = t2.replace(suffixes, '').trim();
    }

    if (t1.length > 0 && t2.length > 0) {
      return {
        question: `Jelang laga ${t1} vs ${t2}, bagaimana prediksi kamu untuk hasil akhirnya?`,
        category: 'Sport & E-Sport',
        options: [
          `${t1} Menang`,
          `${t2} Menang`,
          'Hasil Imbang (Draw)',
          'Nonton Saja Yang Penting Seru',
        ],
      };
    }
  }

  // 3. Deteksi Perbandingan Pilihan ("atau" / "/")
  const atauMatch = text.match(/(?:pilih|rekomendasi|lebih\s*suka|antara)?\s*(.+?)\s+(?:atau|\/)\s+(.+)/i);
  if (atauMatch) {
    let opt1 = atauMatch[1].replace(/^(pilih|rekomendasi|lebih\s*suka|antara|tentang)\s+/gi, '').trim();
    let opt2 = atauMatch[2].replace(/\s+(yang\s*mana|mana|favorit)$/gi, '').trim();
    if (opt1.length > 0 && opt2.length > 0) {
      return {
        question: `Di antara ${opt1} atau ${opt2}, mana yang lebih kamu rekomendasikan / sukai?`,
        category: detectCategory(text),
        options: [
          opt1,
          opt2,
          'Keduanya Sama Bagusnya',
          'Belum Pernah Coba / Belum Tahu',
        ],
      };
    }
  }

  // 4. Deteksi Kalimat Tanya Langsung (Berisi '?' atau kata tanya)
  if (text.endsWith('?') || /^(apakah|bagaimana|siapa|menurut)/i.test(text)) {
    let cleanQ = text;
    if (!cleanQ.endsWith('?')) cleanQ += '?';
    cleanQ = cleanQ.charAt(0).toUpperCase() + cleanQ.slice(1);
    const cat = detectCategory(text);

    let options = [
      'Sangat Setuju & Mendukung',
      'Cukup Setuju / Positif',
      'Kurang Setuju / Perlu Evaluasi',
      'Belum Menentukan Pendapat',
    ];
    if (/^siapa/i.test(cleanQ)) {
      options = [
        'Kandidat / Pilihan Utama',
        'Alternatif Pilihan Lain',
        'Belum Menentukan Pilihan',
        'Menunggu Momen Tepat',
      ];
    } else if (/^bagaimana/i.test(cleanQ)) {
      options = [
        'Sangat Positif & Memuaskan',
        'Cukup Baik tapi Perlu Pembenahan',
        'Masih Kurang / Mengecewakan',
        'Belum Terlihat Dampak Nyata',
      ];
    }

    return {
      question: cleanQ,
      category: cat,
      options,
    };
  }

  // 5. Penanganan Topik Bebas / Spesifik
  let cleanTopic = text
    .replace(/^(buatkan\s*polling|polling|buat\s*polling|tentang|mengenai|isu|topik)\s+/gi, '')
    .trim();
  cleanTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
  const cat = detectCategory(cleanTopic);

  let question = `Bagaimana pandangan kamu mengenai ${cleanTopic} yang saat ini ramai dibicarakan?`;
  let options = [
    'Sangat Mendukung & Positif',
    'Perlu Evaluasi & Perbaikan',
    'Kurang Sepakat / Masih Ragu',
    'Menunggu Bukti Nyata di Lapangan',
  ];

  if (cat === 'Kuliner & Wisata') {
    question = `Terkait destinasi "${cleanTopic}", bagaimana penilaian kamu terhadap daya tariknya?`;
    options = [
      'Sangat Direkomendasikan / Wajib Dicoba!',
      'Bagus tapi Perlu Peningkatan Fasilitas',
      'Biasa Saja / Standar',
      'Belum Pernah Berkunjung',
    ];
  } else if (cat === 'Sport & E-Sport') {
    question = `Terkait kabar ${cleanTopic}, bagaimana prediksi atau ekspektasi kamu?`;
    options = [
      'Sangat Optimis Bakal Juara / Sukses',
      'Perlu Perbaikan Performa Tim',
      'Bakal Berlangsung Sangat Sengit',
      'Masih Menunggu Laga Selanjutnya',
    ];
  }

  return {
    question,
    category: cat,
    options,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedTopic = (body.topic || '').trim();

    // 1. Ambil 5 artikel terbaru dari database untuk konteks liputan
    let recentArticles: any[] = [];
    let recentNewsContext = '';
    try {
      recentArticles = await prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { title: true, category: true, excerpt: true },
      });
      if (recentArticles.length > 0) {
        recentNewsContext = recentArticles
          .map((a, i) => `${i + 1}. [${a.category.toUpperCase()}] ${a.title}`)
          .join('\n');
      }
    } catch {}

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Jika API key Google Gemini tersedia, jalankan Gemini AI dengan prompt presisi entitas
    if (apiKey && apiKey.trim() !== '') {
      try {
        const promptText = `Kamu adalah redaktur senior media digital Jurnal Wave. 
Tugasmu adalah membuat 1 topik polling pembaca yang interaktif, sangat menarik, dan relevan sesuai topik yang diketik pengguna.

SANGAT PENTING:
- Jika pengguna mengetik topik spesifik (misal nama tim laga bola "Persib Bandung vs Melbourne City", nama tokoh, tempat, atau kebijakan tertentu), kamu WAJIB mengekstrak nama-nama entitas tersebut ke dalam kalimat pertanyaan dan pilihan jawaban secara presisi! 
- JANGAN PERNAH menggantinya dengan template generik umum!

${requestedTopic ? `Topik/Fokus yang diminta pengguna: "${requestedTopic}"` : ''}
${recentNewsContext ? `Berita terbaru media saat ini:\n${recentNewsContext}` : ''}

Ketentuan output (JSON murni tanpa markdown):
{
  "question": "Kalimat pertanyaan polling yang padat dan menarik (maksimal 150 karakter)?",
  "category": "Kategori singkat (contoh: Sport & E-Sport, Isu Publik, Lifestyle, Kuliner, atau Teknologi)",
  "options": [
    "Pilihan jawaban 1",
    "Pilihan jawaban 2",
    "Pilihan jawaban 3",
    "Pilihan jawaban 4"
  ]
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);
            if (parsed.question && Array.isArray(parsed.options) && parsed.options.length >= 2) {
              return NextResponse.json({
                success: true,
                source: 'gemini-ai',
                data: {
                  question: parsed.question,
                  category: parsed.category || detectCategory(parsed.question),
                  options: parsed.options.slice(0, 4),
                },
              });
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to smart local entity engine:', geminiErr);
      }
    }

    // 3. Mesin Analisis Entitas Kontekstual Lokal (100% Mengikuti Input Pengguna)
    const smartPoll = generateSmartPolling(requestedTopic, recentArticles);

    return NextResponse.json({
      success: true,
      source: 'smart-entity-engine',
      data: {
        question: smartPoll.question,
        category: smartPoll.category,
        options: smartPoll.options,
      },
    });
  } catch (error) {
    console.error('Error in generate-ai route:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat rekomendasi polling otomatis.' },
      { status: 500 }
    );
  }
}
