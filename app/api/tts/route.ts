import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { fetchArticleById } from '@/lib/wordpress';

import os from 'os';
import { EdgeTTS } from '@andresaya/edge-tts';

// Suara resmi presenter berita Jurnal Wave: Microsoft Azure/Edge Neural Voice (Pria Dewasa, Tegas, Berwibawa)
const VOICE_NAME = 'id-ID-ArdiNeural';
const VOICE_RATE = '-2%'; // Tempo stabil dan tenang khas pembaca berita TV
const VOICE_PITCH = '+0Hz';

// Direktori cache audio yang aman baik di lokal maupun di serverless cloud Vercel (/tmp)
const CACHE_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'jurnalwave-tts')
  : path.join(process.cwd(), '.cache', 'tts');

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Cache dir creation notice:', err);
  }
}

// Kamus fonetik istilah serapan & singkatan agar dilafalkan alami oleh TTS Bahasa Indonesia
const PHONETIC_REPLACEMENTS: [RegExp, string][] = [
  // Singkatan umum & Lembaga
  [/\bUMKM\b/g, 'U M K M'],
  [/\bGen[- ]?Z\b/gi, 'Gen Zi'],
  [/\bWIB\b/g, 'W I B'],
  [/\bRp\s*([\d.,]+)/gi, '$1 rupiah'],
  // Musik & Hiburan
  [/\bline[- ]?up\b/gi, 'lain ap'],
  [/\bmerchandise\b/gi, 'mercendais'],
  [/\blive\b/gi, 'laif'],
  [/\bstreaming\b/gi, 'striming'],
  [/\bevent\b/gi, 'ivent'],
  [/\bcreative\b/gi, 'kreatif'],
  [/\bfest\b/gi, 'fes'],
  [/\bshowcase\b/gi, 'syokeis'],
  [/\bteaser\b/gi, 'tiser'],
  [/\btrailer\b/gi, 'treiler'],
  [/\bcomeback\b/gi, 'kambek'],
  // Bisnis & Gaya Hidup
  [/\bbrand\b/gi, 'brend'],
  [/\bbooth\b/gi, 'but'],
  [/\bcoffee shop\b/gi, 'kofi syop'],
  [/\bcold brew\b/gi, 'kold bru'],
  [/\blifestyle\b/gi, 'laifstail'],
  [/\breview\b/gi, 'rivyu'],
  [/\bweekend\b/gi, 'wik-end'],
  [/\bbudget\b/gi, 'bajet'],
  [/\bworkshop\b/gi, 'worsyop'],
  [/\bmeet[- ]?up\b/gi, 'mit ap'],
  // Digital & Teknologi
  [/\bstartup\b/gi, 'start ap'],
  [/\bgadget\b/gi, 'gejet'],
  [/\bsmartphone\b/gi, 'smartfon'],
  [/\bpodcast\b/gi, 'podkes'],
  [/\bonline\b/gi, 'onlain'],
  [/\boffline\b/gi, 'oflain'],
  [/\bupdate\b/gi, 'apdet'],
  [/\bdownload\b/gi, 'daunlod'],
  [/\bupload\b/gi, 'aplod'],
  [/\bgaming\b/gi, 'geming'],
  [/\bgamer\b/gi, 'gemer'],
  [/\bgame\b/gi, 'gem'],
  [/\bcontent creator\b/gi, 'konten krieitor'],
  [/\binfluencer\b/gi, 'influenser'],
  [/\brating\b/gi, 'reiting'],
  [/\bfeedback\b/gi, 'fidbek'],
  [/\bdeadline\b/gi, 'dedlain']
];

// Bersihkan teks berita agar 100% murni naskah artikel asli (tanpa instruksi/basa-basi)
function cleanArticleText(text: string): string {
  if (!text) return '';
  let cleaned = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[*_#`~[\]()]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/^(JURNALWAVE\.COM|JURNAL WAVE|JURNALVIBES\.COM|JURNAL VIBES)(\s*[-–—]\s*)/i, '')
    .replace(/\s*[–—]\s*/g, ', ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [pattern, replacement] of PHONETIC_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned;
}

import { spawn } from 'child_process';

// Menghasilkan audio pria ArdiNeural menggunakan EdgeTTS Node.js (Universal untuk Vercel & Lokal)
async function generateMaleAudioWithEdgeTTS(cleanText: string, cacheFile: string): Promise<Buffer> {
  const tts = new EdgeTTS();

  await tts.synthesize(cleanText, VOICE_NAME, {
    rate: VOICE_RATE,
    pitch: VOICE_PITCH,
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
  });
  const buffer = tts.toBuffer();
  if (buffer && buffer.length > 500) {
    try {
      ensureCacheDir();
      fs.writeFileSync(cacheFile, buffer);
    } catch (saveErr) {
      console.warn('Could not write cache file:', saveErr);
    }
    return buffer;
  }
  throw new Error('EdgeTTS produced empty buffer');
}

// Fallback Python bridge jika di lokal ingin menggunakan Python
function generateMaleAudioWithPython(cleanText: string, cacheFile: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    ensureCacheDir();
    const tempTextFile = path.join(
      CACHE_DIR,
      `temp-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`
    );
    fs.writeFileSync(tempTextFile, cleanText, 'utf8');

    const pyScript = path.join(process.cwd(), 'scripts', 'tts_engine.py');
    const child = spawn('python', [pyScript, '--text-file', tempTextFile, '--output', cacheFile]);

    child.on('close', (code) => {
      try {
        fs.unlinkSync(tempTextFile);
      } catch {}

      if (code === 0 && fs.existsSync(cacheFile)) {
        try {
          const buf = fs.readFileSync(cacheFile);
          if (buf.length > 500) {
            return resolve(buf);
          }
        } catch {}
      }
      reject(new Error(`TTS generator exited with code ${code}`));
    });

    child.on('error', (err) => {
      try {
        fs.unlinkSync(tempTextFile);
      } catch {}
      reject(err);
    });
  });
}

// Mendapatkan buffer audio pria ArdiNeural konsisten 100% untuk seluruh artikel
async function getAudioBuffer(cleanText: string, cacheFile: string): Promise<Buffer> {
  ensureCacheDir();
  // 1. Jika sudah ada di disk cache, baca langsung (0.001 detik)
  if (fs.existsSync(cacheFile)) {
    try {
      const existing = fs.readFileSync(cacheFile);
      if (existing.length > 500) {
        return existing;
      }
    } catch {}
  }

  // 2. Generate audio pria ArdiNeural resmi via Node.js EdgeTTS (bekerja 100% di server Vercel & lokal)
  try {
    return await generateMaleAudioWithEdgeTTS(cleanText, cacheFile);
  } catch (err) {
    console.warn('EdgeTTS Node.js notice, attempting python fallback:', err);
    return await generateMaleAudioWithPython(cleanText, cacheFile);
  }
}

// Handler GET: Digunakan oleh pemutar audio HTML5 (<audio src="/api/tts?id=...">)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    let rawText = searchParams.get('text') || '';

    let cacheKey = '';

    if (id) {
      cacheKey = `article-${id}-ardi-v3`;
      if (!rawText) {
        const article = await fetchArticleById(id);
        if (article) {
          const title = article.title ? `${article.title.replace(/[.?!]+$/, '')}.` : '';
          const excerpt = article.excerpt ? `${article.excerpt.replace(/[.?!]+$/, '')}.` : '';
          const content = article.content || '';
          rawText = `${title} ${excerpt} ${content}`;
        }
      }
    }

    const clean = cleanArticleText(rawText);
    if (!clean) {
      return NextResponse.json({ error: 'Naskah berita kosong.' }, { status: 400 });
    }

    if (!cacheKey) {
      const hash = crypto.createHash('md5').update(clean).digest('hex').slice(0, 12);
      cacheKey = `text-${hash}-ardi-v3`;
    }

    ensureCacheDir();
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.mp3`);

    const fullBuffer = await getAudioBuffer(clean, cacheFile);
    const total = fullBuffer.length;

    // Dukungan HTTP Range seek (geser maju/mundur 10 detik atau klik slider)
    const range = request.headers.get('range');
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      const chunksize = end - start + 1;
      const slice = fullBuffer.subarray(start, end + 1);

      return new Response(new Uint8Array(slice), {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunksize),
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        },
      });
    }

    return new Response(new Uint8Array(fullBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(total),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('TTS GET Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses audio berita' },
      { status: 500 }
    );
  }
}

// Handler POST: Mendukung pengiriman custom text
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let rawText = body.text || '';
    const id = body.id;

    let cacheKey = '';
    if (id) {
      cacheKey = `article-${id}-ardi-v3`;
      if (!rawText) {
        const article = await fetchArticleById(id);
        if (article) {
          const title = article.title ? `${article.title.replace(/[.?!]+$/, '')}.` : '';
          const excerpt = article.excerpt ? `${article.excerpt.replace(/[.?!]+$/, '')}.` : '';
          const content = article.content || '';
          rawText = `${title} ${excerpt} ${content}`;
        }
      }
    }

    const clean = cleanArticleText(rawText);
    if (!clean) {
      return NextResponse.json({ error: 'Naskah teks tidak boleh kosong.' }, { status: 400 });
    }

    if (!cacheKey) {
      const hash = crypto.createHash('md5').update(clean).digest('hex').slice(0, 12);
      cacheKey = `text-${hash}-ardi-v3`;
    }

    ensureCacheDir();
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.mp3`);

    const fullBuffer = await getAudioBuffer(clean, cacheFile);

    return new Response(new Uint8Array(fullBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(fullBuffer.length),
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('TTS POST Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal menghasilkan audio' },
      { status: 500 }
    );
  }
}
