export interface DummyReport {
  id: string
  nomor_tiket: string
  judul: string
  deskripsi: string
  jenis: 'pengaduan' | 'aspirasi' | 'informasi' | 'inspirasi'
  kategori: string
  lokasi: string
  latitude: number
  longitude: number
  status: 'diterima' | 'diproses' | 'ditindaklanjuti' | 'selesai'
  is_public: boolean
  dukungan_count: number
  komentar_count: number
  created_at: string
  laporan_lampiran: {
    id: string
    file_url: string
    file_type?: string
  }[]
  status_log?: {
    id: string
    status: string
    catatan: string
    created_at: string
  }[]
}

export const DUMMY_REPORTS: DummyReport[] = [
  {
    id: 'JS-20260728-5266',
    nomor_tiket: 'JS-20260728-5266',
    judul: 'data anggaran kebersihan 2025',
    deskripsi: 'minta data rincian anggara kebersihan',
    jenis: 'informasi',
    kategori: 'ANGGARAN',
    lokasi: 'Balai Disabilitas Phala Martha, Jalan Perintis Kemerdekaan, Sekarwangi, Sukabumi, Jawa Barat, 43351, Indonesia',
    latitude: -6.9012,
    longitude: 106.8712,
    status: 'selesai',
    is_public: true,
    dukungan_count: 0,
    komentar_count: 0,
    created_at: '2026-07-28T10:30:00Z',
    laporan_lampiran: [],
    status_log: [
      {
        id: 'log-anggaran-001',
        status: 'selesai',
        catatan: 'Status diubah menjadi selesai oleh Admin Jurnal Sukabumi.',
        created_at: '2026-09-04T15:31:00Z',
      },
      {
        id: 'log-anggaran-002',
        status: 'ditindaklanjuti',
        catatan: 'Status diubah menjadi ditindaklanjuti oleh Admin Jurnal Sukabumi.',
        created_at: '2026-08-09T19:55:00Z',
      },
      {
        id: 'log-anggaran-003',
        status: 'diterima',
        catatan: 'Laporan baru diterima',
        created_at: '2026-07-28T10:30:00Z',
      },
    ],
  },
  {
    id: 'lap-sukabumi-001',
    nomor_tiket: 'TKT-202609-001',
    judul: 'Jalan Rusak & Berlubang Parah di Jalur Utama Cisaat - Cibadak',
    deskripsi: 'Kondisi jalan berlubang cukup dalam sekitar 15-20 cm dan sering menyebabkan pengendara roda dua terjatuh terutama saat malam hari dan hujan deras. Mohon segera dilakukan penambalan atau perbaikan aspal demi keselamatan warga dan kelancaran arus lalu lintas.',
    jenis: 'pengaduan',
    kategori: 'Infrastruktur',
    lokasi: 'Jl. Raya Cisaat No. 120, Kec. Cisaat, Kab. Sukabumi',
    latitude: -6.9175,
    longitude: 106.9290,
    status: 'diproses',
    is_public: true,
    dukungan_count: 184,
    komentar_count: 12,
    created_at: '2026-09-22T08:30:00Z',
    laporan_lampiran: [
      {
        id: 'lamp-001',
        file_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        file_type: 'image/jpeg',
      },
    ],
    status_log: [
      {
        id: 'log-001',
        status: 'diterima',
        catatan: 'Laporan telah diverifikasi oleh tim admin Halo Jurnal.',
        created_at: '2026-09-22T08:35:00Z',
      },
      {
        id: 'log-002',
        status: 'diproses',
        catatan: 'Laporan diteruskan ke Dinas PU Kabupaten Sukabumi untuk penjadwalan tambal sulam.',
        created_at: '2026-09-22T10:15:00Z',
      },
    ],
  },
  {
    id: 'lap-sukabumi-002',
    nomor_tiket: 'TKT-202609-002',
    judul: 'Usulan Penambahan Lampu PJU dan Rambu di Tikungan Jalur Cikidang',
    deskripsi: 'Jalur alternatif Cikidang menuju Palabuhanratu sangat minim penerangan jalan umum (PJU) saat malam hari. Mengingat kontur jalan berliku dan rawan kabut, kami mengusulkan pemasangan PJU bertenaga surya dan rambu mata kucing tambahan.',
    jenis: 'aspirasi',
    kategori: 'Infrastruktur',
    lokasi: 'Jalur Alternatif Cikidang, Kab. Sukabumi',
    latitude: -6.9856,
    longitude: 106.6341,
    status: 'diterima',
    is_public: true,
    dukungan_count: 96,
    komentar_count: 7,
    created_at: '2026-09-21T14:15:00Z',
    laporan_lampiran: [
      {
        id: 'lamp-002',
        file_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        file_type: 'image/jpeg',
      },
    ],
    status_log: [
      {
        id: 'log-003',
        status: 'diterima',
        catatan: 'Aspirasi warga dicatat dan diagendakan dalam pembahasan rapat koordinasi Dishub.',
        created_at: '2026-09-21T14:20:00Z',
      },
    ],
  },
  {
    id: 'lap-sukabumi-003',
    nomor_tiket: 'TKT-202609-003',
    judul: 'Penumpukan Sampah Liar di Pinggir Sungai Cipelang Berhasil Dibersihkan',
    deskripsi: 'Aliran sungai Cipelang di dekat jembatan perbatasan Lembursitu sempat tersumbat sampah plastik dan limbah rumah tangga. Terima kasih atas respon cepat tim kebersihan DLH yang telah mengangkut seluruh timbunan sampah.',
    jenis: 'pengaduan',
    kategori: 'Lingkungan',
    lokasi: 'Kec. Lembursitu, Kota Sukabumi',
    latitude: -6.9532,
    longitude: 106.9189,
    status: 'selesai',
    is_public: true,
    dukungan_count: 245,
    komentar_count: 19,
    created_at: '2026-09-20T09:00:00Z',
    laporan_lampiran: [
      {
        id: 'lamp-003',
        file_url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
        file_type: 'image/jpeg',
      },
    ],
    status_log: [
      {
        id: 'log-004',
        status: 'diterima',
        catatan: 'Laporan sampah liar diverifikasi.',
        created_at: '2026-09-20T09:05:00Z',
      },
      {
        id: 'log-005',
        status: 'diproses',
        catatan: 'Armada truk sampah DLH meluncur ke lokasi.',
        created_at: '2026-09-20T11:00:00Z',
      },
      {
        id: 'log-006',
        status: 'selesai',
        catatan: 'Area bantaran sungai telah bersih dan dipasang spanduk larangan membuang sampah.',
        created_at: '2026-09-20T16:30:00Z',
      },
    ],
  },
  {
    id: 'lap-sukabumi-004',
    nomor_tiket: 'TKT-202609-004',
    judul: 'Aksi Gotong Royong Warga Baros Bersihkan Saluran Irigasi Sambut Musim Hujan',
    deskripsi: 'Warga RW 04 Kelurahan Baros serentak turun ke selokan dan saluran irigasi sawah untuk mengangkat endapan lumpur. Inisiatif swadaya masyarakat ini berhasil memulihkan aliran air lancar dan mengantisipasi banjir lokal saat hujan deras.',
    jenis: 'inspirasi',
    kategori: 'Lingkungan',
    lokasi: 'Kel. Baros, Kec. Baros, Kota Sukabumi',
    latitude: -6.9412,
    longitude: 106.9324,
    status: 'selesai',
    is_public: true,
    dukungan_count: 312,
    komentar_count: 24,
    created_at: '2026-09-19T07:45:00Z',
    laporan_lampiran: [
      {
        id: 'lamp-004',
        file_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
        file_type: 'image/jpeg',
      },
    ],
    status_log: [
      {
        id: 'log-007',
        status: 'selesai',
        catatan: 'Cerita inspirasi warga telah diverifikasi dan dipublikasikan di feed publik.',
        created_at: '2026-09-19T09:00:00Z',
      },
    ],
  },
  {
    id: 'lap-sukabumi-005',
    nomor_tiket: 'TKT-202609-005',
    judul: 'Permohonan Transparansi Jadwal & Alur Pembuatan KTP Digital (IKD) di Kelurahan',
    deskripsi: 'Banyak warga lansia dan pemula yang belum memahami alur aktivasi Identitas Kependudukan Digital (IKD). Kami memohon informasi sosialisasi jadwal jemput bola petugas Disdukcapil di tingkat RT/RW se-Kecamatan Cikole.',
    jenis: 'informasi',
    kategori: 'Pelayanan Publik',
    lokasi: 'Disdukcapil Kota Sukabumi, Jl. Bhayangkara',
    latitude: -6.9189,
    longitude: 106.9278,
    status: 'ditindaklanjuti',
    is_public: true,
    dukungan_count: 88,
    komentar_count: 5,
    created_at: '2026-09-18T10:20:00Z',
    laporan_lampiran: [
      {
        id: 'lamp-005',
        file_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
        file_type: 'image/jpeg',
      },
    ],
    status_log: [
      {
        id: 'log-008',
        status: 'diterima',
        catatan: 'Permohonan informasi publik diterima.',
        created_at: '2026-09-18T10:30:00Z',
      },
      {
        id: 'log-009',
        status: 'ditindaklanjuti',
        catatan: 'Disdukcapil telah merilis poster jadwal pelayanan keliling per kecamatan pekan ini.',
        created_at: '2026-09-18T14:00:00Z',
      },
    ],
  },
  {
    id: 'lap-sukabumi-006',
    nomor_tiket: 'TKT-202609-006',
    judul: 'Keluhan Air Bersih PDAM Sering Keruh dan Mengalir Kecil Saat Jam Sibuk',
    deskripsi: 'Sudah tiga hari berturut-turut pasokan air PDAM di kawasan Selabatu dan sekitarnya berwarna kecokelatan dan debit air sangat kecil pada pagi hari pukul 06.00 - 08.00 WIB. Mohon pengecekan pipa filter atau pengurasan pipa induk.',
    jenis: 'pengaduan',
    kategori: 'Pelayanan Publik',
    lokasi: 'Kel. Selabatu, Kec. Cikole, Kota Sukabumi',
    latitude: -6.9145,
    longitude: 106.9360,
    status: 'diproses',
    is_public: true,
    dukungan_count: 167,
    komentar_count: 14,
    created_at: '2026-09-17T16:10:00Z',
    laporan_lampiran: [
      {
        id: 'lamp-006',
        file_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
        file_type: 'image/jpeg',
      },
    ],
    status_log: [
      {
        id: 'log-010',
        status: 'diterima',
        catatan: 'Pengaduan dicatat ke nomor tiket layanan PDAM Tirta Bumi Wibawa.',
        created_at: '2026-09-17T16:20:00Z',
      },
      {
        id: 'log-011',
        status: 'diproses',
        catatan: 'Petugas teknisi lapangan sedang melakukan pengecekan katup distribusi zona Selabatu.',
        created_at: '2026-09-17T17:45:00Z',
      },
    ],
  },
]
