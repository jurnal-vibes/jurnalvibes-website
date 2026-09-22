import { Job } from '@/types';

export const DUMMY_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Front-End Developer',
    company: 'TechNusa Solutions',
    location: 'Kota Sukabumi, Jawa Barat',
    salaryRange: 'Rp 8.000.000 - Rp 12.000.000',
    type: 'Full-Time',
    region: 'Kota Sukabumi',
    education: 'Minimal S1 / D4 Teknik Informatika',
    updatedAt: 'Terakhir diperbarui 1 hari yang lalu',
    description: `Kami mencari Senior Front-End Developer yang berbakat untuk bergabung dengan tim engineering kami yang dinamis. Anda akan bertanggung jawab untuk membangun antarmuka pengguna yang responsif, berperforma tinggi, dan estetis untuk platform web utama kami.

Anda akan bekerja sama dengan desainer UI/UX dan pengembang back-end untuk mengimplementasikan fitur-fitur baru, mengoptimalkan performa aplikasi, dan memastikan standar kualitas kode yang tinggi melalui code review dan pengujian otomatis.`,
    requirements: [
      'Pengalaman minimal 3 tahun dalam pengembangan Front-End menggunakan React.js atau Next.js.',
      'Pemahaman mendalam tentang TypeScript dan standar ES6+.',
      'Keahlian dalam menggunakan Tailwind CSS untuk membangun UI yang modular dan responsif.',
      'Pengalaman dengan state management seperti Redux, Zustand, atau React Context API.',
      'Terbiasa bekerja dengan RESTful API dan integrasi GraphQL.',
      'Memiliki portofolio yang menunjukkan kemampuan dalam membangun aplikasi web yang kompleks.'
    ],
    benefits: [
      'Gaji kompetitif sesuai dengan pengalaman dan keahlian.',
      'Asuransi kesehatan (BPJS & Swasta).',
      'Fleksibilitas kerja Hybrid (WFO/WFH).',
      'Lingkungan kerja yang mendukung pertumbuhan karir dan pembelajaran berkelanjutan.',
      'Tunjangan perangkat kerja dan internet.'
    ],
    applyEmail: 'hrd@technusa.solutions',
    isSaved: true,
    createdAt: 'Minggu, 13 September 2026 - 14:05 WIB'
  },
  {
    id: '2',
    title: 'Digital Marketing Specialist',
    company: 'Kopi Sukabumi Raya',
    location: 'Kota Sukabumi, Jawa Barat',
    salaryRange: 'Rp 4.000.000 - Rp 6.000.000',
    type: 'Full-Time',
    region: 'Kota Sukabumi',
    education: 'Minimal D3 / S1 Semua Jurusan',
    updatedAt: 'Terakhir diperbarui 2 hari yang lalu',
    description: 'Mengelola kampanye pemasaran digital, sosial media, dan engagement pelanggan untuk brand kopi lokal ternama di Sukabumi.',
    requirements: [
      'Pengalaman minimal 2 tahun di bidang Digital Marketing.',
      'Menguasai Meta Ads, Google Ads, dan TikTok Ads.',
      'Kemampuan copy-writing yang kreatif dan komunikatif.'
    ],
    benefits: [
      'Tunjangan makan & kopi sepuasnya.',
      'Bonus performa tahunan.',
      'Asuransi kesehatan.'
    ],
    applyEmail: 'career@kopisukabumiraya.id',
    createdAt: 'Sabtu, 12 September 2026 - 10:30 WIB'
  },
  {
    id: '3',
    title: 'Content Creator / Videographer',
    company: 'Creative Pulse Agency',
    location: 'Cikole, Kota Sukabumi',
    salaryRange: 'Dapat Dinegosiasikan',
    type: 'Freelance',
    region: 'Cikole',
    education: 'Minimal SMA/SMK/Sederajat',
    updatedAt: 'Terakhir diperbarui 1 hari yang lalu',
    description: 'Memproduksi konten video pendek reels & tiktok secara estetik dan konsisten untuk brand partner agency.',
    requirements: [
      'Menguasai editing video CapCut, Premiere, atau DaVinci Resolve.',
      'Memiliki kamera/smartphone dengan standar rekaman baik.',
      'Paham tren visual dan sound terkini.'
    ],
    benefits: [
      'Waktu kerja fleksibel.',
      'Fee per project + bonus virality.'
    ],
    applyEmail: 'hello@creativepulse.agency',
    createdAt: 'Jumat, 11 September 2026 - 16:45 WIB'
  },
  {
    id: '4',
    title: 'Store Manager',
    company: 'Boutique Nusantara',
    location: 'Cibadak, Sukabumi',
    salaryRange: 'Rp 5.000.000 - Rp 7.500.000',
    type: 'Full-Time',
    region: 'Cibadak',
    education: 'Minimal D3 / S1 Manajemen',
    updatedAt: 'Terakhir diperbarui 3 hari yang lalu',
    description: 'Memimpin operasional outlet ritel, manajemen tim penjualan, serta stok persediaan produk fashion.',
    requirements: [
      'Pengalaman minimal 2 tahun sebagai Store Supervisor atau Manager.',
      'Memiliki keahlian kepemimpinan dan komunikasi yang kuat.',
      'Jujur, teliti, dan berorientasi pada target penjualan.'
    ],
    benefits: [
      'Gaji pokok + komisi penjualan outlet.',
      'BPJS Ketenagakerjaan & Kesehatan.'
    ],
    applyEmail: 'recruitment@boutiquenusantara.co.id',
    createdAt: 'Kamis, 10 September 2026 - 09:20 WIB'
  },
  {
    id: '5',
    title: 'Quality Control (QC) Inspector',
    company: 'PT Sukabumi Manufacturing Corp',
    location: 'Kawasan Industri Cicurug, Sukabumi',
    salaryRange: 'Rp 4.500.000 - Rp 6.500.000',
    type: 'Full-Time',
    region: 'Cicurug',
    education: 'Minimal SMA/SMK / D3 Teknik',
    updatedAt: 'Terakhir diperbarui 4 hari yang lalu',
    description: 'Melakukan inspeksi kualitas lini produksi manufaktur, memastikan standar mutu produk dan kepatuhan SOP perusahaan.',
    requirements: [
      'Pendidikan minimal D3/S1 Teknik atau bidang terkait.',
      'Pengalaman minimal 1 tahun di bidang Quality Control manufaktur.',
      'Teliti, disiplin, dan memiliki sertifikasi ISO menjadi nilai tambah.'
    ],
    benefits: [
      'Gaji pokok kompetitif sesuai UMK Sukabumi.',
      'Tunjangan transportasi dan makan siang.',
      'BPJS Ketenagakerjaan & Kesehatan.'
    ],
    applyEmail: 'career@sukabumimfg.co.id',
    createdAt: 'Rabu, 9 September 2026 - 11:15 WIB'
  },
  {
    id: '6',
    title: 'Barista & Cafe Staff',
    company: 'Selaras Coffee & Space',
    location: 'Cisaat, Sukabumi',
    salaryRange: 'Rp 2.500.000 - Rp 3.800.000',
    type: 'Part-Time',
    region: 'Cisaat',
    education: 'Minimal SMA/SMK/Sederajat',
    updatedAt: 'Terakhir diperbarui Baru saja',
    description: 'Menyiapkan minuman kopi espresso-based dan manual brew, serta melayani pelanggan dengan ramah dan profesional.',
    requirements: [
      'Usia maksimal 25 tahun, ramah dan komunikatif.',
      'Memiliki passion di dunia kopi & hospitality.',
      'Terbuka untuk mahasiswa atau fresh graduate.'
    ],
    benefits: [
      'Jadwal kerja shift fleksibel.',
      'Insentif harian dan jatah kopi harian.',
      'Pelatihan barista profesional.'
    ],
    applyEmail: 'halo@selarascoffee.id',
    createdAt: 'Selasa, 8 September 2026 - 14:00 WIB'
  }
];
