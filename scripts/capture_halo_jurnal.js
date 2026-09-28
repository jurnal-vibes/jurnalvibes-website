const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'screenshots');

const pagesToCapture = [
  // Halaman Publik & Warga
  { name: '01_landing_sebelum_login', url: 'http://localhost:3000/halo-jurnal', title: 'Landing Page (Sebelum Login)' },
  { name: '02_beranda_warga', url: 'http://localhost:3000/halo-jurnal/beranda', title: 'Beranda Warga (Setelah Login)' },
  { name: '03_form_buat_laporan', url: 'http://localhost:3000/halo-jurnal/lapor', title: 'Formulir Lapor Pengaduan' },
  { name: '04_laporan_saya', url: 'http://localhost:3000/halo-jurnal/laporan-saya', title: 'Riwayat Laporan Saya' },
  { name: '05_feed_publik', url: 'http://localhost:3000/halo-jurnal/feed-publik', title: 'Feed Publik Laporan Warga' },
  { name: '06_detail_laporan_warga', url: 'http://localhost:3000/halo-jurnal/laporan/lap-sukabumi-001', title: 'Detail Laporan Warga & Diskusi' },
  { name: '07_profil_pengguna', url: 'http://localhost:3000/halo-jurnal/profil', title: 'Profil Pengguna' },
  { name: '08_tentang', url: 'http://localhost:3000/halo-jurnal/tentang', title: 'Tentang Halo Jurnal' },
  { name: '09_hubungi_kami', url: 'http://localhost:3000/halo-jurnal/hubungi-kami', title: 'Hubungi Kami' },
  { name: '10_kebijakan_privasi', url: 'http://localhost:3000/halo-jurnal/kebijakan-privasi', title: 'Kebijakan Privasi' },
  { name: '11_syarat_ketentuan', url: 'http://localhost:3000/halo-jurnal/syarat-ketentuan', title: 'Syarat & Ketentuan' },

  // Halaman Panel Admin
  { name: '12_admin_dashboard', url: 'http://localhost:3000/halo-jurnal/admin', title: 'Admin Dashboard Utama' },
  { name: '13_admin_kelola_laporan', url: 'http://localhost:3000/halo-jurnal/admin/laporan', title: 'Admin Kelola Seluruh Laporan' },
  { name: '14_admin_detail_laporan', url: 'http://localhost:3000/halo-jurnal/admin/laporan/lap-sukabumi-001', title: 'Admin Detail Manajemen Laporan' },
  { name: '15_admin_feed_publik', url: 'http://localhost:3000/halo-jurnal/admin/feed-publik', title: 'Admin Moderasi Feed Publik' },
  { name: '16_admin_verifikasi_ktp', url: 'http://localhost:3000/halo-jurnal/admin/verifikasi-ktp', title: 'Admin Verifikasi KTP Warga' },
  { name: '17_admin_pengguna', url: 'http://localhost:3000/halo-jurnal/admin/pengguna', title: 'Admin Manajemen Pengguna' },
  { name: '18_admin_kategori', url: 'http://localhost:3000/halo-jurnal/admin/kategori', title: 'Admin Kategori Layanan' },
  { name: '19_admin_berita', url: 'http://localhost:3000/halo-jurnal/admin/berita', title: 'Admin Kelola Berita Redaksi' },
  { name: '20_admin_reels', url: 'http://localhost:3000/halo-jurnal/admin/reels', title: 'Admin Video Reels' },
  { name: '21_admin_chat', url: 'http://localhost:3000/halo-jurnal/admin/chat', title: 'Admin Ruang Chat & Tanggapan' },
  { name: '22_admin_pengaturan', url: 'http://localhost:3000/halo-jurnal/admin/pengaturan', title: 'Admin Pengaturan Sistem' }
];

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Starting full-page screenshot capture for ${pagesToCapture.length} pages...`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1440,
    height: 960,
    deviceScaleFactor: 2 // High resolution Retina
  });

  const results = [];

  for (let i = 0; i < pagesToCapture.length; i++) {
    const item = pagesToCapture[i];
    const outputPath = path.join(OUTPUT_DIR, `${item.name}.png`);
    console.log(`[${i + 1}/${pagesToCapture.length}] Capturing: ${item.title} (${item.url})...`);

    try {
      await page.goto(item.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Tunggu rendering DOM & animasi
      await new Promise((r) => setTimeout(r, 1500));

      await page.screenshot({
        path: outputPath,
        fullPage: true
      });

      const stats = fs.statSync(outputPath);
      results.push({
        name: item.name,
        title: item.title,
        sizeKb: Math.round(stats.size / 1024),
        status: 'OK'
      });
      console.log(`  -> Saved ${item.name}.png (${Math.round(stats.size / 1024)} KB)`);
    } catch (err) {
      console.error(`  -> Failed: ${item.name}: ${err.message}`);
      results.push({
        name: item.name,
        title: item.title,
        error: err.message,
        status: 'FAILED'
      });
    }
  }

  await browser.close();
  console.log('\n--- ALL SCREENSHOTS CAPTURED SUCCESSFULLY ---');
  console.table(results);
}

run().catch((err) => {
  console.error('Fatal error in screenshot runner:', err);
  process.exit(1);
});
