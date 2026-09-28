const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const OUTPUT_DIR = path.resolve('screenshots');

const pagesToCapture = [
  // 1. Halaman Autentikasi & Masuk/Daftar (Tanpa Tombol Demo)
  {
    name: '01_landing_sebelum_login',
    url: 'http://localhost:3000/halo-jurnal',
    title: 'Landing Page Halo Jurnal (Sebelum Login)',
    role: 'guest',
  },
  {
    name: '02_login_resmi',
    url: 'http://localhost:3000/login',
    title: 'Halaman Masuk Resmi (Tanpa Tombol Demo)',
    role: 'guest',
  },
  {
    name: '03_daftar_akun_baru',
    url: 'http://localhost:3000/daftar',
    title: 'Halaman Pendaftaran Akun Warga (Tanpa Tombol Demo)',
    role: 'guest',
  },
  {
    name: '04_reset_password',
    url: 'http://localhost:3000/reset-password',
    title: 'Halaman Lupa & Reset Password',
    role: 'guest',
  },

  // 2. Halaman Warga Publik
  {
    name: '05_beranda_warga',
    url: 'http://localhost:3000/halo-jurnal/beranda',
    title: 'Beranda Warga (Setelah Login)',
    role: 'citizen',
  },
  {
    name: '06_form_buat_laporan',
    url: 'http://localhost:3000/halo-jurnal/lapor',
    title: 'Formulir Lapor Pengaduan & Peta Leaflet',
    role: 'citizen',
    waitMs: 3000,
  },
  {
    name: '07_laporan_saya',
    url: 'http://localhost:3000/halo-jurnal/laporan-saya',
    title: 'Monitoring Status Riwayat Laporan Saya',
    role: 'citizen',
  },
  {
    name: '08_feed_publik',
    url: 'http://localhost:3000/halo-jurnal/feed-publik',
    title: 'Feed Publik Laporan Warga Sukabumi',
    role: 'citizen',
  },
  {
    name: '09_detail_laporan_warga',
    url: 'http://localhost:3000/halo-jurnal/laporan/lap-sukabumi-001',
    title: 'Detail Laporan Warga & Ruang Diskusi Terbuka',
    role: 'citizen',
  },
  {
    name: '10_profil_pengguna',
    url: 'http://localhost:3000/halo-jurnal/profil',
    title: 'Profil Pengguna & Status KTP Terverifikasi',
    role: 'citizen',
  },

  // 3. Halaman Informasi & Legalitas
  {
    name: '11_tentang',
    url: 'http://localhost:3000/halo-jurnal/tentang',
    title: 'Tentang Halo Jurnal & Profil Media Jurnal Wave',
    role: 'citizen',
  },
  {
    name: '12_hubungi_kami',
    url: 'http://localhost:3000/halo-jurnal/hubungi-kami',
    title: 'Hubungi Kami & Layanan Bantuan',
    role: 'citizen',
  },
  {
    name: '13_kebijakan_privasi',
    url: 'http://localhost:3000/halo-jurnal/kebijakan-privasi',
    title: 'Kebijakan Privasi Standar UU PDP',
    role: 'citizen',
  },
  {
    name: '14_syarat_ketentuan',
    url: 'http://localhost:3000/halo-jurnal/syarat-ketentuan',
    title: 'Syarat & Ketentuan Pelaporan',
    role: 'citizen',
  },

  // 4. Halaman Panel Admin
  {
    name: '15_admin_dashboard',
    url: 'http://localhost:3000/halo-jurnal/admin',
    title: 'Admin Dashboard Utama & Statistik',
    role: 'admin',
  },
  {
    name: '16_admin_kelola_laporan',
    url: 'http://localhost:3000/halo-jurnal/admin/laporan',
    title: 'Admin Manajemen Seluruh Laporan',
    role: 'admin',
  },
  {
    name: '17_admin_detail_laporan',
    url: 'http://localhost:3000/halo-jurnal/admin/laporan/lap-sukabumi-001',
    title: 'Admin Detail Manajemen Laporan',
    role: 'admin',
  },
  {
    name: '18_admin_feed_publik',
    url: 'http://localhost:3000/halo-jurnal/admin/feed-publik',
    title: 'Admin Moderasi Feed Publik',
    role: 'admin',
  },
  {
    name: '19_admin_verifikasi_ktp',
    url: 'http://localhost:3000/halo-jurnal/admin/verifikasi-ktp',
    title: 'Admin Verifikasi KTP Warga',
    role: 'admin',
  },
  {
    name: '20_admin_pengguna',
    url: 'http://localhost:3000/halo-jurnal/admin/pengguna',
    title: 'Admin Manajemen Pengguna',
    role: 'admin',
  },
  {
    name: '21_admin_kategori',
    url: 'http://localhost:3000/halo-jurnal/admin/kategori',
    title: 'Admin Kategori Layanan',
    role: 'admin',
  },
  {
    name: '22_admin_berita',
    url: 'http://localhost:3000/halo-jurnal/admin/berita',
    title: 'Admin Kelola Berita Redaksi',
    role: 'admin',
  },
  {
    name: '23_admin_reels',
    url: 'http://localhost:3000/halo-jurnal/admin/reels',
    title: 'Admin Video Reels Edukasi Publik',
    role: 'admin',
  },
  {
    name: '24_admin_chat',
    url: 'http://localhost:3000/halo-jurnal/admin/chat',
    title: 'Admin Ruang Chat & Tanggapan',
    role: 'admin',
  },
  {
    name: '25_admin_pengaturan',
    url: 'http://localhost:3000/halo-jurnal/admin/pengaturan',
    title: 'Admin Pengaturan Sistem & Redaksi',
    role: 'admin',
  },
];

async function captureAll() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Bersihkan folder screenshots terlebih dahulu agar bersih
  const existingFiles = fs.readdirSync(OUTPUT_DIR);
  for (const f of existingFiles) {
    if (f.endsWith('.png')) {
      fs.unlinkSync(path.join(OUTPUT_DIR, f));
    }
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
      '--window-size=1440,1080',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1440,
    height: 960,
    deviceScaleFactor: 2, // High resolution Retina
  });

  for (let i = 0; i < pagesToCapture.length; i++) {
    const item = pagesToCapture[i];
    const outputFile = path.join(OUTPUT_DIR, `${item.name}.png`);
    console.log(`[${i + 1}/${pagesToCapture.length}] Capturing: ${item.title} -> ${item.url}`);

    try {
      // 1. Setup session cookies / localStorage sesuai role
      await page.goto('http://localhost:3000/halo-jurnal', { waitUntil: 'domcontentloaded' });
      await page.evaluate((role) => {
        if (role === 'guest') {
          localStorage.removeItem('halo_jurnal_current_user');
          localStorage.removeItem('halo_jurnal_admin_user');
        } else if (role === 'citizen') {
          const citizenUser = {
            id: 'citizen-demo-sukabumi',
            email: 'warga@sukabumi.com',
            full_name: 'Warga Sukabumi',
            role: 'citizen',
            nik: '3202112345670001',
            ktp_verified: true,
            user_metadata: { full_name: 'Warga Sukabumi' },
          };
          localStorage.setItem('halo_jurnal_current_user', JSON.stringify(citizenUser));
        } else if (role === 'admin') {
          const adminUser = {
            id: 'admin-redaksi-001',
            email: 'adminjurnal7@gmail.com',
            full_name: 'Redaksi Admin Sukabumi',
            role: 'admin',
            user_metadata: { full_name: 'Redaksi Admin Sukabumi' },
          };
          localStorage.setItem('halo_jurnal_current_user', JSON.stringify(adminUser));
          localStorage.setItem('halo_jurnal_admin_user', JSON.stringify(adminUser));
        }
      }, item.role);

      // 2. Navigasi ke URL target
      await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 35000 }).catch(() => {
        console.log(`  Timeout on networkidle0 for ${item.url}, continuing...`);
      });

      const waitTime = item.waitMs || 2000;
      await new Promise((r) => setTimeout(r, waitTime));

      // 3. Smooth scroll down and up agar semua gambar, lazy load, dan leaflet map render utuh
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 400;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 80);
        });
      });

      await new Promise((r) => setTimeout(r, 1500));

      // 4. Ambil tangkapan layar Full Page lengkap
      await page.screenshot({
        path: outputFile,
        fullPage: true,
      });

      console.log(`  ✓ Saved: ${item.name}.png`);
    } catch (err) {
      console.error(`  ✗ Error capturing ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Finished capturing all pages successfully!');
}

captureAll();
