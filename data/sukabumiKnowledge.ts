/**
 * SUKABUMI KNOWLEDGE BASE (MASTER DATA LOKAL SUKABUMI)
 * Basis pengetahuan otentik, faktual, dan mendalam seputar Kota dan Kabupaten Sukabumi.
 * Digunakan oleh Jurnal Vibes AI agar bebas halusinasi dan memiliki pemahaman wilayah yang presisi.
 */

export interface CafeSpot {
  name: string
  area: string
  addressOrZone: string
  concept: string
  highlights: string
}

export interface CulinarySpot {
  name: string
  type: string
  location: string
  description: string
}

export interface RegionInfo {
  name: string
  type: 'kota' | 'kabupaten'
  character: string
  landmarks: string[]
}

// 1. ZONASI WILAYAH KOTA & KABUPATEN SUKABUMI
export const SUKABUMI_REGIONS: RegionInfo[] = [
  {
    name: 'Cikole',
    type: 'kota',
    character: 'Kawasan dataran tinggi utara kota, berhawa sejuk pegunungan, asri dikelilingi pohon pinus menuju kaki Gunung Gede Selabintana. Pusat kafe berkonsep alam/pegunungan dan resto Sunda keluarga.',
    landmarks: ['Jl. Surya Kencana', 'Jl. Selabintana', 'Habit Coffee', 'Kopi D\'Cikole', 'Rumah Makan Cikole', 'Kopi Nako Kebon Jati']
  },
  {
    name: 'Dago Sukabumi (Jl. Ir. H. Juanda)',
    type: 'kota',
    character: 'Pusat tongkrongan jalanan (street food) anak muda Sukabumi di sore dan malam hari, pedestrian ramah pejalan kaki.',
    landmarks: ['Balaikota Sukabumi', 'Kawasan Pedestrian Dago', 'Aneka jajanan kekinian dan kopi gerobak']
  },
  {
    name: 'Bhayangkara & Siliwangi (Jalur Protokol Kota)',
    type: 'kota',
    character: 'Koridor perkotaan utama, perbankan, rumah sakit, instansi kepolisian, dan sentra kuliner legendaris serta kedai kopi modern perkotaan.',
    landmarks: ['RSUD Syamsudin SH (Bunut)', 'Polres Sukabumi Kota', 'Bubur Ayam Bunut (Jl. Siliwangi)', 'Mochi Lampion (Gang Kaswari)', 'Mokopi Bhayangkara']
  },
  {
    name: 'Ahmad Yani & Pasar Pelita',
    type: 'kota',
    character: 'Jantung perniagaan legendaris Kota Sukabumi, pusat belanja, pertokoan emas, tekstil, dan kuliner malam legendaris.',
    landmarks: ['Pasar Pelita', 'Sekoteng Singapore', 'Toko Kue & Roti Tradisional', 'Masjid Agung Kota Sukabumi', 'Alun-Alun Kota']
  },
  {
    name: 'Warudoyong & Citamiang',
    type: 'kota',
    character: 'Kawasan perniagaan dan stasiun kereta api aktif Sukabumi (jalur KA Pangrango Sukabumi - Bogor dan KA Siliwangi Sukabumi - Cipatat).',
    landmarks: ['Stasiun Kereta Api Sukabumi', 'Jl. Pelabuhan II', 'Bubur Ayam Odeon Nyomplong']
  },
  {
    name: 'Baros & Lembursitu',
    type: 'kota',
    character: 'Pintu gerbang Sukabumi bagian selatan, kawasan perumahan berkembang, jalur lingkar selatan (Lingsel), dan wisata pemandian air panas Cikundul.',
    landmarks: ['Jalur Lingkar Selatan (Lingsel)', 'Pemandian Air Panas Cikundul', 'Terminal Tipe A Sukabumi (KH Ahmad Sanusi)']
  },
  {
    name: 'Cisaat (Kabupaten Sukabumi)',
    type: 'kabupaten',
    character: 'Pusat keramaian Kabupaten Sukabumi perbatasan barat kota, pusat kuliner rakyat, sentra perikanan hias, dan akses menuju wisata Kadudampit / Situ Gunung.',
    landmarks: ['Alun-Alun Cisaat', 'Masjid Qubbatul Islam', 'Sentra Kuliner Cisaat', 'Jalur masuk Polsek Cisaat / Kantor Pos Cisaat']
  },
  {
    name: 'Kadudampit & Selabintana',
    type: 'kabupaten',
    character: 'Gerbang wisata alam pegunungan Taman Nasional Gunung Gede Pangrango.',
    landmarks: ['Situ Gunung Suspension Bridge (Jembatan Gantung)', 'Curug Sawer', 'Taman Rekreasi Hotel Selabintana']
  },
  {
    name: 'Cibadak & Cicurug',
    type: 'kabupaten',
    character: 'Pintu gerbang Sukabumi Utara, kawasan industri padat, perniagaan lintasan antar-provinsi Bogor-Sukabumi, dan akses tol Bocimi.',
    landmarks: ['Gerbang Tol Parungkuda / Cibadak', 'Pasar Cibadak', 'RSUD Sekarwangi', 'Pabrik Air Mineral Aqua Babakanpari']
  },
  {
    name: 'Palabuhanratu & Geopark Ciletuh',
    type: 'kabupaten',
    character: 'Ibukota Kabupaten Sukabumi di pesisir Samudera Hindia, pusat wisata bahari, pelelangan ikan, dan warisan bumi dunia UNESCO Geopark Ciletuh.',
    landmarks: ['Pantai Karang Hawu', 'Pantai Citepus', 'Pelabuhan Perikanan Samudera', 'Curug Cimarinjung', 'Puncak Darma']
  }
]

// 2. PEMETAAN TEMPAT NGOPI / KAFE SUKABUMI YANG AKURAT (ANTI-HALUSINASI)
export const SUKABUMI_CAFES: CafeSpot[] = [
  // Kafe Area Cikole & Selabintana (Suasana Alam & Pegunungan Dingin)
  {
    name: 'Habit Coffee',
    area: 'Cikole / Selabintana',
    addressOrZone: 'Kawasan atas Cikole arah Selabintana',
    concept: 'Kafe estetik dengan udara sejuk pegunungan, desain modern-minimalis, sangat nyaman untuk work from cafe atau ngobrol santai.',
    highlights: 'Signature latte, filter coffee V60, croissant, dan ambience sejuk.'
  },
  {
    name: 'Kopi D\'Cikole',
    area: 'Cikole',
    addressOrZone: 'Jl. Cikole Sukabumi',
    concept: 'Tempat ngopi semi outdoor dengan panorama perbukitan hijau dan udara sejuk khas perbukitan utara Sukabumi.',
    highlights: 'Kopi tubruk lokal, es kopi susu gula aren, pisang goreng keju.'
  },
  {
    name: 'Selabintana Coffee & Eatery',
    area: 'Selabintana / Cikole Atas',
    addressOrZone: 'Kawasan Wisata Selabintana',
    concept: 'Nuansa alam terbuka di bawah rindangnya pohon pinus tua, udara sangat segar dan dingin.',
    highlights: 'Kopi hangat seduh manual, camilan tradisional, suasana healing di bawah pinus.'
  },
  {
    name: 'Kopi Nako Kebon Jati',
    area: 'Cikole / Sukabumi Utara',
    addressOrZone: 'Jl. Gunung Jaya / Cikole',
    concept: 'Kafe berarsitektur kaca khas Nako yang berada di tengah perkebunan jati yang luas, instagramable dan ramah keluarga.',
    highlights: 'Es Kopi Nako, Nasi Bogana, aneka pastry, dan spot foto estetik.'
  },
  {
    name: 'Pine Forest Cafe',
    area: 'Cikole Atas',
    addressOrZone: 'Jalur wisata alam Selabintana',
    concept: 'Menyesap kopi langsung di tengah kanopi hutan pinus pegunungan.',
    highlights: 'Minuman hangat penghalau dingin, sosis bakar, wedang jahe dan latte.'
  },

  // Kafe Area Perkotaan & Pusat Kota (Bukan di Cikole!)
  {
    name: 'Mokopi Sukabumi',
    area: 'Perkotaan (Bhayangkara / Tipar)',
    addressOrZone: 'Jl. Bhayangkara dan area pusat kota Sukabumi (BUKAN DI CIKOLE)',
    concept: 'Tempat nongkrong kasual yang sangat populer di kalangan pelajar dan mahasiswa karena harga menunya yang ramah di kantong.',
    highlights: 'Mokosusu (kopi susu aneka rasa), minuman cokelat, teh kekinian, dan camilan kentang goreng.'
  },
  {
    name: 'Anatomi Coffee',
    area: 'Pusat Kota',
    addressOrZone: 'Kawasan tengah kota Sukabumi',
    concept: 'Specialty coffee shop untuk penikmat cita rasa kopi serius dengan racikan barista handal.',
    highlights: 'Single origin beans, espresso based drinks, manual brew.'
  },
  {
    name: 'Kawasan Pedestrian Dago (Street Coffee)',
    area: 'Dago (Jl. Ir. H. Juanda)',
    addressOrZone: 'Jl. Ir. H. Juanda, Kota Sukabumi',
    concept: 'Area jalan kaki di jantung kota tempat berkumpulnya berbagai tenant kopi dan jajanan jalanan di bawah lampu kota.',
    highlights: 'Kopi tubruk, es kopi susu cup praktis, roti bakar, dan aneka sate taichan.'
  }
]

// 3. KULINER KHAS LEGENDARIS SUKABUMI
export const SUKABUMI_CULINARY: CulinarySpot[] = [
  {
    name: 'Mochi Lampion (Mochi Kaswari)',
    type: 'Oleh-oleh Legendaris',
    location: 'Gang Kaswari No. 19 (Masuk dari Jl. Bhayangkara), Kota Sukabumi',
    description: 'Kue mochi legendaris nomor 1 Sukabumi sejak 1983. Dikemas dalam keranjang bambu kecil (besek), teksturnya super kenyal dan lembut dengan isian kacang tanah manis autentik, durian, cokelat, hingga keju.'
  },
  {
    name: 'Bubur Ayam Bunut Siliwangi',
    type: 'Sarapan & Makan Legendaris',
    location: 'Jl. Siliwangi No. 93, Cikole, Kota Sukabumi',
    description: 'Bubur ayam khas Sukabumi paling tersohor sejak 1975. Ciri khasnya adalah kuah kaldu gurih kuning bening, suwiran ayam kampung tebal, emping, serta aneka sate usus dan ati ampela.'
  },
  {
    name: 'Bubur Ayam Odeon',
    type: 'Kuliner Non-Halal / Tradisional Legendaris',
    location: 'Jl. Danalaya No. 1 (dekat Nyomplong), Kota Sukabumi',
    description: 'Bubur khas peranakan Tionghoa legendaris Sukabumi yang berdiri sejak puluhan tahun silam dengan racikan ayam rebus oriental gurih.'
  },
  {
    name: 'Sekoteng Singapore Sukabumi',
    type: 'Kuliner Malam Penghangat',
    location: 'Jl. Jenderal Ahmad Yani (depan ruko perkotaan malam hari)',
    description: 'Minuman hangat jahe manis legendaris Sukabumi dengan isian melimpah: pacar cina, kolang-kaling, kacang tanah sangrai gurih, potongan roti tawar, dan susu kental manis.'
  },
  {
    name: 'Rumah Makan Cikole',
    type: 'Restoran Sunda Keluarga',
    location: 'Jl. Cikole Dalam, Kota Sukabumi',
    description: 'Restoran masakan Sunda otentik favorit keluarga Sukabumi. Menu andalannya adalah pepes ikan mas, ayam bakar bumbu rujak, lalapan petai segar, dan sambal dadak pedas nikmat.'
  },
  {
    name: 'Bandros Atta',
    type: 'Jajanan Tradisional Malam',
    location: 'Jl. Gudang, Kebonjati, Kota Sukabumi',
    description: 'Kue bandros tradisional berbahan tepung beras dan kelapa parut gurih yang dimasak dengan cetakan arang tradisional. Disajikan hangat bertabur gula pasir.'
  },
  {
    name: 'Nasi Uduk Mamih Ungu',
    type: 'Kuliner Khas Unik',
    location: 'Jl. Brawijaya No. 16, Sriwidari, Kota Sukabumi',
    description: 'Nasi uduk berwarna ungu alami yang dibuat dari sari buah bit dan ubi ungu, disajikan lengkap dengan ayam goreng, tempe orek, dan sambal terasi.'
  }
]

// 4. PANDUAN PENGADUAN HALO JURNAL
export const HALO_JURNAL_GUIDE = {
  portalUrl: '/halo-jurnal',
  laporUrl: '/halo-jurnal/lapor',
  statusUrl: '/halo-jurnal/laporan-saya',
  feedUrl: '/halo-jurnal/feed-publik',
  categories: [
    'Infrastruktur Jalan & Jembatan (Jalan berlubang, aspal rusak)',
    'Penerangan Jalan Umum / PJU (Lampu jalan padam di malam hari)',
    'Kebersihan & Sampah (Tumpukan sampah liar, TPS meluap)',
    'Saluran Air & Drainase (Banjir genangan, gorong-gorong tersumbat)',
    'Pelayanan Publik & Birokrasi Dinas',
    'Ketertiban Umum & Fasilitas Sosial'
  ],
  steps: [
    'Buka halaman web /halo-jurnal/lapor',
    'Tuliskan judul laporan yang jelas dan pilih nama kecamatan di Sukabumi',
    'Unggah bukti foto atau video kondisi nyata di lapangan',
    'Kirim laporan dan simpan tiket laporan',
    'Pantau progres verifikasi redaksi dan tanggapan dinas di /halo-jurnal/laporan-saya'
  ]
}

/**
 * Helper untuk mencari wawasan lokal yang paling relevan dengan pertanyaan pengunjung
 */
export function findRelevantSukabumiKnowledge(userQuery: string): string {
  const query = userQuery.toLowerCase()
  const relevantNotes: string[] = []

  // 1. Cek kafe & kedai kopi
  const mentionedCafes = SUKABUMI_CAFES.filter(cafe => 
    query.includes(cafe.name.toLowerCase()) || 
    (query.includes(cafe.area.toLowerCase()) && (query.includes('kopi') || query.includes('kafe') || query.includes('cafe') || query.includes('nongkrong')))
  )

  if (mentionedCafes.length > 0) {
    relevantNotes.push('Referensi Kafe Terverifikasi:\n' + mentionedCafes.map(c => 
      `- ${c.name} (${c.area}): ${c.concept}. Menu/Highlight: ${c.highlights}`
    ).join('\n'))
  }

  // Khusus penegasan Mokopi
  if (query.includes('mokopi') && (query.includes('cikole') || query.includes('selabintana'))) {
    relevantNotes.push('Fakta Tegas: Mokopi Sukabumi TIDAK BERADA di Cikole atau Selabintana. Mokopi berlokasi di area pusat perkotaan (Jl. Bhayangkara dan sekitarnya). Di Cikole yang ada adalah Habit Coffee, Kopi D\'Cikole, Selabintana Coffee, Kopi Nako Kebon Jati.')
  }

  // 2. Cek kuliner legendaris
  const mentionedCulinary = SUKABUMI_CULINARY.filter(item =>
    query.includes(item.name.toLowerCase().split(' ')[0]) ||
    (query.includes('kuliner') || query.includes('makan') || query.includes('oleh-oleh') || query.includes('enak'))
  )

  if (mentionedCulinary.length > 0 && (query.includes('kuliner') || query.includes('makan') || query.includes('mochi') || query.includes('bubur') || query.includes('sekoteng') || query.includes('sunda'))) {
    relevantNotes.push('Referensi Kuliner Legendaris Sukabumi Terverifikasi:\n' + mentionedCulinary.slice(0, 4).map(cul =>
      `- ${cul.name} (${cul.location}): ${cul.description}`
    ).join('\n'))
  }

  // 3. Cek pengaduan Halo Jurnal
  if (query.includes('lapor') || query.includes('aduan') || query.includes('rusak') || query.includes('jalan') || query.includes('sampah') || query.includes('lampu') || query.includes('pju')) {
    relevantNotes.push('Panduan Resmi Halo Jurnal:\n- Akses lapor: ' + HALO_JURNAL_GUIDE.laporUrl + '\n- Akses cek status: ' + HALO_JURNAL_GUIDE.statusUrl + '\n- Syarat: Foto bukti lapangan, lokasi kecamatan jelas, dan judul aduan.')
  }

  return relevantNotes.join('\n\n')
}
