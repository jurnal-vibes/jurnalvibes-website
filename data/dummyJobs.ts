import { Job } from '@/types';

export const DUMMY_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Staff Administrasi & Keuangan',
    company: 'PT Sukabumi Indo Prima',
    location: 'Cikole, Kota Sukabumi',
    region: 'Cikole',
    salaryRange: 'Rp 3.200.000 - Rp 4.500.000',
    type: 'Full-Time',
    education: 'D3 / S1 Akuntansi atau Manajemen',
    description: 'Bertanggung jawab atas pengelolaan dokumen pembukuan harian, faktur penjualan, pelaporan kas kecil, serta rekapitulasi data administrasi operasional kantor.',
    requirements: [
      'Pria/Wanita, usia maksimal 28 tahun',
      'Pendidikan minimal D3/S1 Akuntansi, Manajemen, atau Administrasi',
      'Menguasai Microsoft Excel (VLOOKUP, Pivot, IF) dan software akuntansi dasar',
      'Teliti, jujur, disiplin, dan memiliki integritas tinggi',
      'Domisili di Kota Sukabumi atau sekitarnya diutamakan'
    ],
    benefits: [
      'Gaji pokok sesuai UMK',
      'BPJS Kesehatan & BPJS Ketenagakerjaan',
      'Tunjangan makan & transportasi',
      'Jenjang karir yang jelas'
    ],
    applyEmail: 'karir@sukabumiindoprima.co.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-2',
    title: 'Social Media Specialist & Content Creator',
    company: 'Kreatif Media Nusantara',
    location: 'Cisaat, Sukabumi',
    region: 'Cisaat',
    salaryRange: 'Rp 2.800.000 - Rp 4.000.000',
    type: 'Full-Time',
    education: 'SMA / SMK / D3 / S1 Segala Jurusan',
    description: 'Merancang ide konten video pendek kreatif (TikTok, Reels, Shorts), membuat copy caption menarik, serta mengelola interaksi komunitas media sosial brand.',
    requirements: [
      'Kreatif dan aktif mengikuti tren media sosial terbaru',
      'Mampu mengoperasikan CapCut / Premiere Pro / Canva dasar',
      'Percaya diri di depan kamera atau handal dalam voice-over',
      'Mampu menyusun content calendar mingguan'
    ],
    benefits: [
      'Lingkungan kerja santai & dinamis',
      'Bonus performa engagement konten',
      'Pelatihan dan workshop kreatif berkala'
    ],
    applyEmail: 'hrd@kreatifmedia.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-3',
    title: 'Supervisor Operasional Lapangan',
    company: 'Sentra Logistik Sukabumi',
    location: 'Cibadak, Sukabumi',
    region: 'Cibadak',
    salaryRange: 'Rp 4.000.000 - Rp 5.500.000',
    type: 'Full-Time',
    education: 'D3 / S1 Semua Jurusan',
    description: 'Mengawasi alur keluar-masuk armada pengiriman barang, memonitor kinerja kurir gudang, serta memastikan target SLA pengiriman wilayah Sukabumi tercapai tepat waktu.',
    requirements: [
      'Pengalaman kerja minimal 1-2 tahun di bidang logistik/pergudangan',
      'Memiliki jiwa kepemimpinan tegas dan komunikasi yang baik',
      'Bersedia bekerja sistem shift bila diperlukan',
      'Memiliki kendaraan pribadi dan SIM C/A'
    ],
    benefits: [
      'Gaji pokok + Insentif pencapaian target bulanan',
      'BPJS Ketenagakerjaan & Asuransi Kesehatan',
      'Uang lembur terstruktur'
    ],
    applyEmail: 'recruitment@sentralogistik.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-4',
    title: 'Barista & Front Service',
    company: 'Kopi Ruang Karsa',
    location: 'Kota Sukabumi',
    region: 'Kota Sukabumi',
    salaryRange: 'Rp 1.800.000 - Rp 2.500.000',
    type: 'Part-Time',
    education: 'SMA / SMK Sederajat (Terbuka Mahasiswa)',
    description: 'Menyajikan aneka minuman kopi espresso-based dan manual brew, menyapa pelanggan dengan ramah, serta menjaga kebersihan bar area kopi.',
    requirements: [
      'Terbuka untuk pemula (tersedia pelatihan barista)',
      'Ramah, komunikatif, dan berpenampilan bersih rapi',
      'Fleksibel jam kerja (shift pagi/sore)',
      'Terbuka untuk mahasiswa aktif semester akhir'
    ],
    benefits: [
      'Makan harian gratis selama shift',
      'Free beverage allowance harian',
      'Tips harian & pembagian service charge'
    ],
    applyEmail: 'halo@kopiruangkarsa.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-5',
    title: 'Junior Web & IT Support',
    company: 'Solusi Digital Mandiri',
    location: 'Palabuhanratu, Sukabumi',
    region: 'Palabuhanratu',
    salaryRange: 'Rp 3.500.000 - Rp 5.000.000',
    type: 'Remote',
    education: 'SMK RPL / D3 / S1 Informatika',
    description: 'Membantu maintenance website perusahaan berbasis Next.js/React, integrasi API, serta troubleshooting jaringan dan perangkat keras kantor cabang.',
    requirements: [
      'Memahami dasar HTML, CSS, JavaScript/TypeScript',
      'Familiar dengan Git/GitHub dan sistem operasi Linux/Windows',
      'Dapat bekerja secara mandiri maupun tim dengan komunikasi lancar via Slack/WhatsApp'
    ],
    benefits: [
      'Sistem kerja remote / WFH fleksibel',
      'Subsidi kuota internet bulanan',
      'Tunjangan perangkat kerja'
    ],
    applyEmail: 'jobs@solusidigital.co.id',
    createdAt: new Date().toISOString(),
  }
];
