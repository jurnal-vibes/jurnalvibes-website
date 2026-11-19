export interface DummyReport {
  id: string
  nomor_tiket: string
  ticketNumber?: string
  ticket_number?: string
  judul: string
  title?: string
  deskripsi: string
  description?: string
  jenis: 'pengaduan' | 'aspirasi' | 'informasi' | 'inspirasi'
  kategori: string
  lokasi: string
  latitude: number
  longitude: number
  status: 'diterima' | 'diproses' | 'ditindaklanjuti' | 'selesai' | 'ditolak'
  is_public: boolean
  dukungan_count: number
  komentar_count: number
  nama_pelapor?: string
  pelaporName?: string
  telepon?: string
  pelaporPhone?: string
  email?: string
  pelaporEmail?: string
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
    id: 'rep-001',
    nomor_tiket: 'HJ-001',
    judul: 'Jalan Rusak Berlubang Parah Dekat Bundaran Cisaat',
    deskripsi: 'Aspal terkelupas cukup dalam dan membahayakan pengendara motor terutama saat hujan tergenang air.',
    jenis: 'pengaduan',
    kategori: 'Infrastruktur',
    lokasi: 'Jl. Raya Cisaat, Sukabumi',
    latitude: -6.9147,
    longitude: 106.8972,
    status: 'diterima',
    is_public: true,
    dukungan_count: 24,
    komentar_count: 5,
    nama_pelapor: 'Ahmad Fauzi',
    telepon: '081234567890',
    email: 'ahmad.fauzi@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    laporan_lampiran: [
      {
        id: 'att-001',
        file_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        file_type: 'image/jpeg',
      },
    ],
    status_log: [
      {
        id: 'log-001',
        status: 'diterima',
        catatan: 'Laporan warga diterima ke sistem redaksi Hallo Jurnal. Menunggu verifikasi tim.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
  },
  {
    id: 'rep-002',
    nomor_tiket: 'HJ-002',
    judul: 'Lampu PJU Padam di Sepanjang Jalur Lingkar Selatan',
    deskripsi: 'Sudah tiga malam lampu penerangan jalan mati total, jalanan gelap rawan tindak kriminalitas.',
    jenis: 'pengaduan',
    kategori: 'Fasilitas Umum',
    lokasi: 'Jalur Lingkar Selatan, Baros',
    latitude: -6.9351,
    longitude: 106.9324,
    status: 'diproses',
    is_public: true,
    dukungan_count: 18,
    komentar_count: 3,
    nama_pelapor: 'Siti Rahmawati',
    telepon: '085712345678',
    email: 'siti.rahmawati@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    laporan_lampiran: [
      {
        id: 'att-002',
        file_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
        file_type: 'image/jpeg',
      },
    ],
    status_log: [
      {
        id: 'log-002a',
        status: 'diterima',
        catatan: 'Laporan diterima oleh sistem.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
      {
        id: 'log-002b',
        status: 'diproses',
        catatan: 'Diverifikasi oleh tim redaksi dan diteruskan ke Dishub Kota Sukabumi.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'rep-003',
    nomor_tiket: 'HJ-003',
    judul: 'Tumpukan Sampah Menumpuk Menimbulkan Bau Dekat Pasar Cibadak',
    deskripsi: 'Tempat pembuangan sementara meluap sampai ke bahu jalan, mohon segera ada pengangkutan kontainer.',
    jenis: 'pengaduan',
    kategori: 'Kebersihan',
    lokasi: 'Kawasan Pasar Cibadak, Kab. Sukabumi',
    latitude: -6.8921,
    longitude: 106.7825,
    status: 'diterima',
    is_public: true,
    dukungan_count: 32,
    komentar_count: 7,
    nama_pelapor: 'Budi Santoso',
    telepon: '087898765432',
    email: 'budi.santoso@yahoo.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    laporan_lampiran: [
      {
        id: 'att-003',
        file_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
        file_type: 'image/jpeg',
      },
    ],
    status_log: [
      {
        id: 'log-003',
        status: 'diterima',
        catatan: 'Laporan warga tercatat dalam antrean verifikasi redaksi.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
    ],
  },
  {
    id: 'rep-004',
    nomor_tiket: 'HJ-004',
    judul: 'Drainase Tersumbat Menyebabkan Luapan Air Hujan di Cikole',
    deskripsi: 'Saluran air tersumbat material tanah dan sampah sehingga meluap ke trotoar pejalan kaki.',
    jenis: 'aspirasi',
    kategori: 'Infrastruktur',
    lokasi: 'Kec. Cikole, Kota Sukabumi',
    latitude: -6.9205,
    longitude: 106.9298,
    status: 'ditindaklanjuti',
    is_public: false,
    dukungan_count: 12,
    komentar_count: 2,
    nama_pelapor: 'Rina Marlina',
    telepon: '082155667788',
    email: 'rina.marlina@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    laporan_lampiran: [],
    status_log: [
      {
        id: 'log-004a',
        status: 'diterima',
        catatan: 'Laporan aspirasi diterima.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'log-004b',
        status: 'ditindaklanjuti',
        catatan: 'Petugas Dinas PUPR telah menjadwalkan pengerukan sedimen drainase akhir pekan.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ],
  },
  {
    id: 'rep-005',
    nomor_tiket: 'HJ-005',
    judul: 'Penebangan Dahan Pohon Rawan Tumbang di Jl. Siliwangi',
    deskripsi: 'Dinas Pertamanan telah merapikan dan memangkas dahan pohon tua yang condong ke kabel listrik.',
    jenis: 'pengaduan',
    kategori: 'Keamanan',
    lokasi: 'Jl. Siliwangi, Cikole',
    latitude: -6.9189,
    longitude: 106.9312,
    status: 'selesai',
    is_public: true,
    dukungan_count: 45,
    komentar_count: 11,
    nama_pelapor: 'Hendri Kurniawan',
    telepon: '081399887766',
    email: 'hendri.kurniawan@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    laporan_lampiran: [],
    status_log: [
      {
        id: 'log-005a',
        status: 'diterima',
        catatan: 'Laporan diterima.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      },
      {
        id: 'log-005b',
        status: 'selesai',
        catatan: 'Dahan pohon telah selesai dirapikan oleh BPBD dan Dinas Pertamanan Sukabumi.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ],
  },
  {
    id: 'rep-006',
    nomor_tiket: 'HJ-006',
    judul: 'Antrean e-KTP Lambat Akibat Gangguan Server di Disdukcapil',
    deskripsi: 'Warga mengeluhkan antrean pencetakan e-KTP dan perekaman biometrik terhambat karena server pusat down.',
    jenis: 'aspirasi',
    kategori: 'Layanan Publik',
    lokasi: 'Disdukcapil Kota Sukabumi',
    latitude: -6.9241,
    longitude: 106.9275,
    status: 'diproses',
    is_public: true,
    dukungan_count: 29,
    komentar_count: 8,
    nama_pelapor: 'Dedi Kusnadi',
    telepon: '085211223344',
    email: 'dedi.kusnadi@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    laporan_lampiran: [],
    status_log: [
      {
        id: 'log-006',
        status: 'diproses',
        catatan: 'Laporan telah dikonfirmasikan ke humas dinas terkait.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: 'rep-007',
    nomor_tiket: 'HJ-007',
    judul: 'Rambu Lalu Lintas Rusak Tertabrak Truk di Simpang Degung',
    deskripsi: 'Tiang rambu penunjuk arah roboh menghalangi bahu jalan dan berisiko membahayakan pengguna jalan.',
    jenis: 'pengaduan',
    kategori: 'Infrastruktur',
    lokasi: 'Simpang Tiga Degung, Warudoyong',
    latitude: -6.9178,
    longitude: 106.9156,
    status: 'ditindaklanjuti',
    is_public: true,
    dukungan_count: 15,
    komentar_count: 4,
    nama_pelapor: 'Fitri Handayani',
    telepon: '081900112233',
    email: 'fitri.handayani@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
    laporan_lampiran: [],
    status_log: [
      {
        id: 'log-007',
        status: 'ditindaklanjuti',
        catatan: 'Unit laka lantas dan petugas Dishub sudah mengamankan lokasi rambu.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
      },
    ],
  },
  {
    id: 'rep-008',
    nomor_tiket: 'HJ-008',
    judul: 'Pencemaran Limbah Saluran Irigasi Sawah Warga Nagrak',
    deskripsi: 'Air irigasi berubah warna keruh berbusa dan berbau menyengat, diduga ada pembuangan limbah ilegal.',
    jenis: 'pengaduan',
    kategori: 'Lingkungan',
    lokasi: 'Kecamatan Nagrak, Kab. Sukabumi',
    latitude: -6.8742,
    longitude: 106.8123,
    status: 'selesai',
    is_public: true,
    dukungan_count: 53,
    komentar_count: 14,
    nama_pelapor: 'Iwan Setiawan',
    telepon: '087788990011',
    email: 'iwan.setiawan@gmail.com',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    laporan_lampiran: [],
    status_log: [
      {
        id: 'log-008a',
        status: 'diproses',
        catatan: 'Dinas Lingkungan Hidup mengambil sampel air uji laboratorium.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      },
      {
        id: 'log-008b',
        status: 'selesai',
        catatan: 'Sumber pembuangan liar telah ditutup paksa dan saluran dinormalisasi.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      },
    ],
  },
]
