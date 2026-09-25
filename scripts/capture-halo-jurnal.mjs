import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.resolve('screenshots-halo-jurnal');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pagesToCapture = [
  {
    name: '01_Landing_Publik_Halo_Jurnal',
    url: 'http://localhost:3000/halo-jurnal',
    waitMs: 2000,
  },
  {
    name: '02_Beranda_Warga_Login',
    url: 'http://localhost:3000/halo-jurnal/beranda',
    waitMs: 2000,
  },
  {
    name: '03_Formulir_Lapor_Dan_Peta',
    url: 'http://localhost:3000/halo-jurnal/lapor',
    waitMs: 2500,
  },
  {
    name: '04_Feed_Laporan_Publik',
    url: 'http://localhost:3000/halo-jurnal/feed-publik',
    waitMs: 2000,
  },
  {
    name: '05_Monitoring_Laporan_Saya',
    url: 'http://localhost:3000/halo-jurnal/laporan-saya',
    waitMs: 2000,
  },
  {
    name: '06_Detail_Laporan_Dan_Chat',
    url: 'http://localhost:3000/halo-jurnal/laporan/lap-sukabumi-001',
    waitMs: 2000,
  },
  {
    name: '07_Profil_Warga_Dan_KTP',
    url: 'http://localhost:3000/halo-jurnal/profil',
    waitMs: 2000,
  },
  {
    name: '08_Tentang_Redaksi_Dan_Legalitas',
    url: 'http://localhost:3000/halo-jurnal/tentang',
    waitMs: 2000,
  },
  {
    name: '09_Kebijakan_Privasi_UU_PDP',
    url: 'http://localhost:3000/halo-jurnal/kebijakan-privasi',
    waitMs: 1500,
  },
  {
    name: '10_Syarat_Dan_Ketentuan_Lapor',
    url: 'http://localhost:3000/halo-jurnal/syarat-ketentuan',
    waitMs: 1500,
  },
  {
    name: '11_Hubungi_Kami_Dukungan',
    url: 'http://localhost:3000/halo-jurnal/hubungi-kami',
    waitMs: 1500,
  },
];

async function capture() {
  console.log('🚀 Memulai browser Edge headless untuk capture Full-Page...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Capture Desktop Full-Page (1440px width, crisp Retina scale 2)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  for (const item of pagesToCapture) {
    console.log(`📸 Capturing Desktop: ${item.name} (${item.url})...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise((r) => setTimeout(r, item.waitMs));

      const outputPath = path.join(OUTPUT_DIR, `${item.name}.png`);
      await page.screenshot({ path: outputPath, fullPage: true });
      console.log(`✅ Saved: ${outputPath}`);
    } catch (err) {
      console.error(`❌ Gagal capture ${item.name}:`, err.message);
    }
  }

  // 2. Capture Mobile Full-Page (390px width - iPhone standard)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });

  const mobilePages = [
    { name: 'Mobile_01_Landing_Halo_Jurnal', url: 'http://localhost:3000/halo-jurnal' },
    { name: 'Mobile_02_Form_Lapor_Dan_Peta', url: 'http://localhost:3000/halo-jurnal/lapor' },
    { name: 'Mobile_03_Feed_Publik', url: 'http://localhost:3000/halo-jurnal/feed-publik' },
    { name: 'Mobile_04_Profil_KTP', url: 'http://localhost:3000/halo-jurnal/profil' },
    { name: 'Mobile_05_Detail_Laporan', url: 'http://localhost:3000/halo-jurnal/laporan/lap-sukabumi-001' },
  ];

  for (const item of mobilePages) {
    console.log(`📱 Capturing Mobile: ${item.name}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 2000));

      const outputPath = path.join(OUTPUT_DIR, `${item.name}.png`);
      await page.screenshot({ path: outputPath, fullPage: true });
      console.log(`✅ Saved Mobile: ${outputPath}`);
    } catch (err) {
      console.error(`❌ Gagal capture ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log(`🎉 SELURUH FULL-PAGE SCREENSHOT SELESAI DISIMPAN DI: ${OUTPUT_DIR}`);
}

capture().catch(console.error);
