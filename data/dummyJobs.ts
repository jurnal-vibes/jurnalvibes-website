import { Job } from '@/types';

export const DUMMY_JOBS: Job[] = [
  {
    id: 'job-yakult',
    title: 'Operator Produksi & Quality Control',
    company: 'PT Yakult Indonesia Persada',
    location: 'Kawasan Industri Pasawahan, Cicurug, Sukabumi',
    region: 'Cicurug',
    salaryRange: 'Rp 3.500.000 - Rp 4.600.000',
    type: 'Full-Time',
    education: 'SMK Teknik / IPA / Kimia / Farmasi / D3',
    description: 'Menjalankan operasional mesin produksi pengolahan dan pembotolan susu fermentasi berstandar higienitas tinggi pabrik Jepang.\nMelakukan pencatatan parameter mutu, suhu, serta pemantauan sterilisasi ruang produksi.\nMemastikan kepatuhan terhadap standar keselamatan kerja (K3) dan sanitasi pangan pabrik.',
    requirements: [
      'Pria/Wanita, usia 18 - 25 tahun',
      'Pendidikan SMK Teknik Mesin/Listrik/Kimia/Farmasi atau SMA IPA',
      'Sehat jasmani dan mata normal (tidak buta warna)',
      'Teliti, disiplin tinggi, dan siap bekerja sistem shift di Cicurug'
    ],
    benefits: [
      'Gaji pokok standar UMK Kabupaten Sukabumi',
      'BPJS Kesehatan & BPJS Ketenagakerjaan lengkap',
      'Makan siang kantin pabrik & seragam kerja',
      'Tunjangan shift malam dan premi hadir bulanan'
    ],
    applyEmail: 'https://karir.yakult.co.id',
    applyUrl: 'https://karir.yakult.co.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-otsuka',
    title: 'Staff Logistik & Pergudangan',
    company: 'PT Amerta Indah Otsuka',
    location: 'Jl. Siliwangi Km 28, Desa Benda, Cicurug, Sukabumi',
    region: 'Cicurug',
    salaryRange: 'Rp 3.800.000 - Rp 5.000.000',
    type: 'Full-Time',
    education: 'D3 / S1 Manajemen Logistik / Teknik Industri',
    description: 'Mengelola pencatatan stok barang masuk dan keluar di gudang bahan baku dan produk jadi pabrik Pocari Sweat Cicurug.\nMelakukan koordinasi dengan tim armada logistik untuk jadwal pengiriman distributor se-Jawa Barat.\nMengoperasikan sistem manajemen pergudangan (WMS / SAP) dan audit stock opname fisik berkala.',
    requirements: [
      'Pria/Wanita, usia maksimal 28 tahun',
      'Pendidikan D3/S1 Manajemen Logistik, Teknik Industri, atau Administrasi',
      'Mahir menggunakan Microsoft Excel (VLOOKUP, Pivot) dan terbiasa dengan ERP/WMS',
      'Mampu bekerja sama dalam tim dan memiliki komunikasi profesional'
    ],
    benefits: [
      'Gaji pokok kompetitif di atas UMK Sukabumi',
      'Asuransi kesehatan swasta + BPJS Ketenagakerjaan',
      'Jemputan karyawan dan tunjangan makan',
      'Jenjang karir perusahaan multinasional Jepang'
    ],
    applyEmail: 'https://rise.otsuka.co.id',
    applyUrl: 'https://rise.otsuka.co.id',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-hermina',
    title: 'Front Office & Customer Care RS',
    company: 'Rumah Sakit Hermina Sukabumi',
    location: 'Jl. Raya Sukaraja, Sukabumi',
    region: 'Sukabumi Kota',
    salaryRange: 'Rp 3.400.000 - Rp 4.500.000',
    type: 'Full-Time',
    education: 'D3 / S1 Komunikasi / Manajemen / Administrasi RS',
    description: 'Melayani pendaftaran pasien rawat jalan dan rawat inap dengan ramah dan solutif (service excellence).\nMemberikan edukasi alur pelayanan rumah sakit, asuransi/BPJS Kesehatan, dan jadwal praktik dokter spesialis.\nMenangani keluhan awal pasien serta koordinasi cepat dengan unit medis rumah sakit.',
    requirements: [
      'Pria/Wanita, penampilan rapi, ramah, dan berjiwa melayani',
      'Pendidikan minimal D3 atau S1 Komunikasi, Manajemen, atau Administrasi Rumah Sakit',
      'Mampu berkomunikasi efektif dan empati tinggi terhadap pasien',
      'Mampu mengoperasikan sistem informasi rumah sakit (SIMRS) dasar'
    ],
    benefits: [
      'Gaji pokok standar UMK Kota Sukabumi',
      'Jaminan pemeliharaan kesehatan keluarga & BPJS',
      'Pelatihan hospitality medis Hermina Group',
      'Tunjangan insentif kinerja pelayanan'
    ],
    applyEmail: 'https://herminahospitals.com/karir',
    applyUrl: 'https://herminahospitals.com/karir',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];
