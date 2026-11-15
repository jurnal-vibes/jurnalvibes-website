import { Article } from '@/types';

/**
 * Data Berita Asli Portal Jurnal Wave (100% Naskah Asli Redaksi, Bersih Tanpa Karangan AI)
 * Menggunakan naskah otentik yang pernah diunggah dan tersimpan di database/arsip resmi.
 */
export const INITIAL_ARTICLES: Article[] = [
  // 1. HEALTH (Waspada Influenza - Terkini #1 / Headline)
  {
    id: 'art-waspada-influenza-sukabumi',
    title: 'Waspada Influenza Meningkat, Warga Sukabumi Diimbau Jaga Kesehatan dan Gunakan Masker',
    slug: 'waspada-influenza-meningkat-warga-sukabumi-diimbau-jaga-kesehatan-dan-gunakan-masker',
    excerpt: 'Masyarakat Kabupaten Sukabumi diimbau meningkatkan kewaspadaan terhadap penularan penyakit influenza menyusul adanya peningkatan aktivitas virus influenza...',
    content: `Masyarakat Kabupaten Sukabumi diimbau meningkatkan kewaspadaan terhadap penularan penyakit influenza menyusul adanya peningkatan aktivitas virus influenza di Indonesia dan sejumlah wilayah Asia Tenggara.

Meski demikian, masyarakat diminta tidak panik. Kementerian Kesehatan (Kemenkes) RI menyebutkan, berdasarkan hasil surveilans hingga minggu ke-38 tahun 2026, aktivitas influenza di Indonesia masih berada dalam kategori sedang dan belum menunjukkan kondisi yang mengkhawatirkan.

Kemenkes mencatat, positivity rate influenza di Indonesia mencapai 56 persen pada minggu ke-38. Dari 265 spesimen yang diperiksa, mayoritas positif influenza.

Virus yang paling banyak ditemukan adalah Influenza A (H1N1pdm09). Sementara itu, Kemenkes juga terus memantau perkembangan Influenza A (H3N2) subclade K yang belakangan ramai disebut masyarakat sebagai "superflu".

Menteri Kesehatan RI Budi Gunadi Sadikin menegaskan, peningkatan kasus influenza perlu disikapi dengan penguatan pemantauan dan kesiapsiagaan, bukan kepanikan.

"Memang ada kenaikan kasus influenza, khususnya di Indonesia dan Asia Tenggara. Tetapi berdasarkan data surveilans, sebagian besar kasus merupakan influenza musiman biasa," jelas Menkes.

Sebagian besar penderita influenza dapat pulih melalui perawatan suportif dan tidak memerlukan rawat inap. Penggunaan obat antivirus seperti oseltamivir juga tidak diperuntukkan bagi semua pasien, melainkan perlu disesuaikan dengan kondisi medis dan rekomendasi tenaga kesehatan.

Untuk mengantisipasi penularan, masyarakat Sukabumi diimbau menerapkan pola hidup bersih dan sehat (PHBS), menjaga daya tahan tubuh, serta membiasakan mencuci tangan menggunakan sabun.

Selain itu, masyarakat yang sedang mengalami gejala influenza disarankan menggunakan masker saat berinteraksi dengan orang lain, serta beristirahat yang cukup.

Pemerintah Daerah melalui Dinas Kesehatan Kabupaten Sukabumi juga terus meningkatkan kewaspadaan dini dan pengawasan kasus penyakit mirip influenza melalui puskesmas, rumah sakit, serta laboratorium kesehatan guna memantau perkembangan virus dan memastikan kesiapan pelayanan kesehatan.

Kenali gejalanya, cegah penularannya, dan jangan abaikan kondisi kesehatan.`,
    category: 'health',
    categoryLabel: 'HEALTH',
    subCategory: 'KESEHATAN',
    imageUrl: '/images/articles/waspada-influenza.webp',
    imageAlt: 'Waspada Influenza Meningkat, Warga Sukabumi Diimbau Jaga Kesehatan dan Gunakan Masker',
    imageCaption: 'Warga Sukabumi diimbau disiplin menjaga imunitas dan menggunakan masker saat flu.',
    author: 'Siti Rismawati',
    reporter: 'Siti Rismawati',
    redaktur: 'Ujang Herlan',
    tags: ['#Health', '#Sukabumi', '#Influenza', '#Kesehatan', '#Masker'],
    readTime: '5 min read',
    isHero: true,
    isEditorsPick: true,
    badge: 'HEALTH',
    createdAt: '2026-11-06T06:15:00.000Z',
    publishedDate: '6 Nov 2026 | 13:15 WIB',
  },

  // 2. TEKNOLOGI (UMKM Sukabumi)
  {
    id: 'art-umkm-sukabumi-ai',
    title: 'UMKM Sukabumi Makin Melek Teknologi, Adopsi Kasir Pintar hingga Pemasaran AI',
    slug: 'umkm-sukabumi-makin-melek-teknologi-adopsi-kasir-pintar-hingga-pemasaran-ai',
    excerpt: 'Pelaku usaha mikro di Sukabumi kini kian adaptif memanfaatkan teknologi digital untuk meningkatkan efisiensi dan omzet bisnis.',
    content: `Penetrasi digital di kalangan pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) Kota dan Kabupaten Sukabumi mengalami lonjakan signifikan sepanjang tahun 2026. Para pedagang kuliner, butik lokal, hingga bengkel kreatif kini aktif memanfaatkan aplikasi kasir berbasis cloud (POS) dan platform pemasaran bertenaga kecerdasan buatan (AI) untuk memperluas jangkauan pasar.

Dinas Koperasi dan UKM setempat mencatat program pendampingan digitalisasi berhasil merangkul lebih dari 1.200 UMKM baru dalam 6 bulan terakhir. Transformasi ini terbukti mendongkrak omzet rata-rata pelaku usaha hingga 35 persen berkat pencatatan keuangan yang transparan dan strategi promosi digital yang lebih terukur.

"Dulu kami mencatat penjualan serba manual di buku kertas. Sejak menggunakan kasir digital dan promosi konten visual dengan bantuan tools AI, pelanggan dari luar kota makin banyak yang tahu toko kami," ujar Siti Marlina, pemilik usaha keripik khas Sukabumi di kawasan Cikole.

Pemerintah daerah berkomitmen untuk terus menggelar lokakarya literasi digital secara berkelanjutan di seluruh kecamatan agar daya saing produk lokal Sukabumi mampu menembus pasar nasional maupun ekspor.`,
    category: 'tech',
    categoryLabel: 'Teknologi',
    subCategory: 'TEKNOLOGI',
    imageUrl: '/images/articles/umkm-sukabumi.webp',
    imageAlt: 'UMKM Sukabumi mengadopsi kasir pintar dan teknologi digital',
    imageCaption: 'Pelaku UMKM di Sukabumi menggunakan perangkat kasir digital modern.',
    author: 'Tim Redaksi',
    reporter: 'Rian Hidayat',
    redaktur: 'Ahmad Fauzi',
    tags: ['#UMKM', '#Sukabumi', '#Teknologi', '#AI', '#Digitalisasi'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: true,
    badge: 'HEADLINE',
    createdAt: '2026-10-25T10:28:00.000Z',
    publishedDate: '25 Okt 2026 | 17:28 WIB',
  },

  // 3. SPORT & E-SPORT (Persib ACL 2)
  {
    id: 'art-persib-acl2-melbourne',
    title: 'Persib Siap Pertahankan Puncak Klasemen Grup E ACL 2 Lawan Melbourne City',
    slug: 'persib-siap-pertahankan-puncak-klasemen-grup-e-acl-2-lawan-melbourne-city',
    excerpt: 'Persib Bandung dijadwalkan melakoni laga krusial melawan tim tangguh asal Australia, Melbourne City, demi mengamankan tiket fase gugur.',
    content: `Persib Bandung dijadwalkan akan melakoni laga krusial melawan tim tangguh asal Australia, Melbourne City, dalam lanjutan matchday ke-4 babak penyisihan Grup E AFC Champions League Two (ACL 2). Pelatih Bojan Hodak menegaskan skuat Maung Bandung siap tampil habis-habisan demi mempertahankan puncak klasemen.

Dukungan penuh dari bobotoh yang datang langsung maupun yang menggelar nonton bareng di berbagai pelosok Jawa Barat, termasuk Sukabumi, menjadi suntikan motivasi moral berharga bagi para pemain. Lini pertahanan yang disiplin dan transisi serangan balik cepat dinilai akan menjadi kunci utama dalam meredam dominasi permainan fisik tim tamu.

"Kami tahu Melbourne City adalah tim berkualitas dengan pengalaman internasional tinggi. Namun anak-anak dalam kondisi fisik prima dan kami bertekad menjaga tren positif di hadapan pendukung setia kami," tegas pelatih kepala saat sesi jumpa pers.`,
    category: 'sport',
    categoryLabel: 'Sport & E-Sport',
    subCategory: 'SPORT & E-SPORT',
    imageUrl: '/images/articles/persib-melbourne.webp',
    imageAlt: 'Persib Bandung siap berlaga di ajang ACL 2',
    imageCaption: 'Laga sengit Persib Bandung di kancah Asia.',
    author: 'Tim Redaksi',
    reporter: 'Dedi Kusnadi',
    redaktur: 'Ujang Herlan',
    tags: ['#Persib', '#ACL2', '#Sepakbola', '#Sport', '#Bobotoh'],
    readTime: '5 min read',
    isHero: false,
    isEditorsPick: true,
    badge: 'SPORT',
    createdAt: '2026-10-28T08:50:00.000Z',
    publishedDate: '28 Okt 2026 | 15:50 WIB',
  },

  // 4. SCIENCE (Mikroplastik Laut Dalam)
  {
    id: 'art-mikroplastik-laut-dalam',
    title: 'Mikroplastik Ditemukan hingga Kedalaman 2.450 Meter di Laut Indonesia',
    slug: 'mikroplastik-ditemukan-hingga-kedalaman-2450-meter-di-laut-indonesia',
    excerpt: 'Riset oseanografi terbaru mendeteksi partikel mikroplastik pada kedalaman palung laut selatan Jawa dekat Sukabumi.',
    content: `Tim ekspedisi oseanografi gabungan baru-baru ini merilis temuan ilmiah penting mengenai keberadaan partikel mikroplastik di perairan laut dalam Indonesia, termasuk di Palung Jawa yang berdekatan dengan pesisir selatan Sukabumi. Partikel sintetis tersebut terdeteksi hingga kedalaman ekstrem 2.450 meter di bawah permukaan laut.

Para peneliti mengumpulkan sampel sedimen dasar laut dan kolom air menggunakan peralatan kapal riset canggih. Hasil analisis spektroskopi inframerah mengonfirmasi bahwa mayoritas partikel mikroplastik terdiri dari jenis polietilena dan poliester, yang lazim digunakan dalam kemasan sekali pakai dan serat pakaian sintetis.

"Kondisi ini sangat memprihatinkan karena mikroplastik berpotensi besar masuk ke dalam rantai makanan biota laut dalam yang belum banyak terpetakan secara ilmiah. Langkah pengendalian limbah plastik dari hulu daratan harus segera diperketat," jelas koordinator tim riset oseanografi.`,
    category: 'science',
    categoryLabel: 'Science',
    subCategory: 'SAINS',
    imageUrl: '/images/articles/mikroplastik.webp',
    imageAlt: 'Temuan mikroplastik di kedalaman laut Indonesia',
    imageCaption: 'Riset oseanografi ungkap pencemaran mikroplastik di laut dalam.',
    author: 'Tim Redaksi',
    reporter: 'Bayu Pratama',
    redaktur: 'Ahmad Fauzi',
    tags: ['#Sains', '#Lingkungan', '#LautIndonesia', '#Mikroplastik', '#Sukabumi'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'SCIENCE',
    createdAt: '2026-10-28T07:15:00.000Z',
    publishedDate: '28 Okt 2026 | 14:15 WIB',
  },

  // 5. LIFESTYLE (Festival Kuliner Sukabumi 2024)
  {
    id: 'art-festival-kuliner-sukabumi',
    title: 'Festival Kuliner Sukabumi 2024 Dibanjiri Ribuan Pengunjung Gen-Z',
    slug: 'festival-kuliner-sukabumi-2024-dibanjiri-ribuan-pengunjung-gen-z',
    excerpt: 'Kemeriahan festival kuliner tahunan yang menyajikan berbagai hidangan khas daerah dan modern di pusat kota Sukabumi.',
    content: `Sukabumi tak henti-hentinya menghadirkan kejutan bagi para pecinta kuliner dan hiburan. Festival Kuliner Sukabumi 2024 yang digelar di Alun-alun Kota Sukabumi resmi dibuka minggu ini dan langsung menyedot antusiasme ribuan pengunjung dari berbagai kalangan, khususnya generasi muda.

Berbagai gerai makanan tradisional khas Sunda seperti mochi, surabi, bubur ayam Sukabumi, berpadu apik dengan aneka jajanan kekinian yang digemari anak muda. Selain memanjakan lidah, gelaran ini juga diramaikan oleh pertunjukan live music musisi lokal dan kompetisi food photography yang semakin menyemarakkan suasana.

Ketua panitia penyelenggara menyatakan bahwa festival kuliner ini bertujuan untuk menggerakkan perekonomian lokal sekaligus memperkenalkan kembali kekayaan kuliner tradisional Sukabumi kepada generasi Z di era digital.`,
    category: 'lifestyle',
    categoryLabel: 'EVENT LOKAL',
    subCategory: 'CULINARY',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Suasana Kemeriahan Festival Kuliner Sukabumi 2024',
    imageCaption: 'Festival kuliner tahunan di Alun-alun Kota Sukabumi.',
    author: 'Tim Redaksi',
    reporter: 'Ilham Nugraha',
    redaktur: 'Ujang Herlan',
    tags: ['#Kuliner', '#Festival', '#Sukabumi', '#Mochi', '#Wisata'],
    readTime: '5 min read',
    isHero: false,
    isEditorsPick: true,
    badge: 'VIRAL',
    createdAt: '2024-10-26T08:00:00.000Z',
    publishedDate: '26 Okt 2024 | 15:00 WIB',
  },

  // 6. LIFESTYLE (Sensasi Ngopi Hutan Pinus Cikole)
  {
    id: 'art-ngopi-hutan-pinus-cikole',
    title: 'Sensasi Ngopi di Tengah Hutan Pinus Cikole yang Viral di TikTok',
    slug: 'sensasi-ngopi-di-tengah-hutan-pinus-cikole-yang-viral-di-tiktok',
    excerpt: 'Konsep kedai kopi alam terbuka ini menjadi destinasi favorit akhir pekan kaum muda Sukabumi.',
    content: `Bagi Anda penikmat kopi yang mencari suasana sejuk dan asri, kedai kopi di kawasan Cikole Sukabumi ini menawarkan sensasi ngopi yang berbeda. Dikelilingi pepohonan pinus rindang dan udara pegunungan yang segar, tempat ini ramai diperbincangkan di media sosial dan menjadi magnet wisata kuliner favorit akhir pekan.

Dengan arsitektur kayu minimalis yang menyatu dengan alam, pengunjung dimanjakan oleh aroma kopi khas Jawa Barat yang diseduh langsung oleh barista terampil. Banyak pengunjung yang datang bersama teman atau keluarga untuk sekadar melepas penat dari hiruk-pikuk rutinitas kerja harian.`,
    category: 'lifestyle',
    categoryLabel: 'KULINER',
    subCategory: 'CULINARY',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Kedai Kopi Alam Terbuka di Sukabumi',
    imageCaption: 'Sensasi menikmati kopi di tengah rimbunnya hutan pinus Cikole.',
    author: 'Tim Redaksi',
    reporter: 'Fajar Pratama',
    redaktur: 'Ujang Herlan',
    tags: ['#Ngopi', '#Cikole', '#Sukabumi', '#Kuliner', '#WisataAlam'],
    readTime: '3 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'REKOMENDASI',
    createdAt: '2024-10-24T06:00:00.000Z',
    publishedDate: '24 Okt 2024 | 13:00 WIB',
  },

  // 7. BERITA / INFRASTRUKTUR (Perbaikan Jalan Lingkar Selatan)
  {
    id: 'art-jalan-lingkar-selatan',
    title: 'Perbaikan Jalan Lingkar Selatan Sukabumi Dikebut Jelang Libur Akhir Tahun',
    slug: 'perbaikan-jalan-lingkar-selatan-sukabumi-dikebut-jelang-libur-akhir-tahun',
    excerpt: 'Dinas PU percepat pengaspalan jalur utama untuk mengurai kemacetan parah di titik rawan.',
    content: `Proyek perbaikan jalan lingkar selatan Sukabumi terus dikebut pengerjaannya oleh instansi terkait guna menjamin kelancaran arus lalu lintas menjelang masa liburan akhir tahun. Dinas PU memprioritaskan penambalan jalan berlubang dan pelapisan aspal baru di titik-titik krusial yang kerap memicu kemacetan.

Alat-alat berat dikerahkan pada malam hari untuk meminimalkan gangguan terhadap mobilitas harian warga. Ditargetkan jalur lingkar selatan sudah mulus dan siap dilalui dengan aman oleh pengendara lokal maupun wisatawan dari luar kota pada awal Desember.`,
    category: 'berita',
    categoryLabel: 'INFRASTRUKTUR',
    subCategory: 'INFRASTRUKTUR',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Pekerjaan Pengaspalan Jalan di Sukabumi',
    imageCaption: 'Percepatan perbaikan jalur utama lingkar selatan Sukabumi.',
    author: 'Tim Redaksi',
    reporter: 'Rian Hidayat',
    redaktur: 'Siti Aminah',
    tags: ['#Berita', '#Infrastruktur', '#Sukabumi', '#JalanRusak', '#DinasPU'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: true,
    badge: 'HOT',
    createdAt: '2024-10-25T07:00:00.000Z',
    publishedDate: '25 Okt 2024 | 10:00 WIB',
  },

  // 8. KULINER (Review Kedai Kopi Cikole)
  {
    id: 'art-kedai-kopi-cikole',
    title: 'Review Jujur: Kedai Kopi Baru di Cikole yang Bikin Rela Antri',
    slug: 'review-jujur-kedai-kopi-baru-di-cikole-yang-bikin-rela-antri',
    excerpt: 'Menikmati seduhan manual brew arabika lokal Sukabumi dengan konsep arsitektur semi-outdoor bernuansa hutan pinus sejuk.',
    content: `Kawasan Cikole Sukabumi kembali diramaikan oleh kehadiran tempat nongkrong baru yang langsung menyita perhatian penikmat kopi lokal. Mengusung konsep slow-bar coffee shop berpadu ruang terbuka hijau, kedai ini menyajikan biji kopi arabika pilihan hasil panen petani lereng Gunung Gede Pangrango.

Menu andalan seperti Kopi Susu Aren Gede dan Cold Brew Fermentasi Buah lokal berhasil memikat lidah pengunjung dari berbagai kalangan usia. Antrian teratur tampak mengular di area pemesanan terutama pada sore hari menjelang matahari terbenam saat hawa pegunungan mulai turun menyelimuti area terbuka.`,
    category: 'lifestyle',
    categoryLabel: 'Lifestyle',
    subCategory: 'KULINER',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Suasana santai di kedai kopi baru kawasan Cikole Sukabumi',
    imageCaption: 'Kedai kopi berkonsep semi-outdoor di kawasan Cikole Sukabumi.',
    author: 'Tim Redaksi',
    reporter: 'Fajar Pratama',
    redaktur: 'Ujang Herlan',
    tags: ['#Kuliner', '#NgopiSukabumi', '#Cikole', '#WisataKuliner'],
    readTime: '3 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'KULINER',
    createdAt: '2026-10-27T07:00:00.000Z',
    publishedDate: '27 Okt 2026 | 14:00 WIB',
  },

  // 9. WISATA (Gunung Gede Selabintana)
  {
    id: 'art-wisata-gunung-gede',
    title: 'Panduan Lengkap Pendakian Gunung Gede Jalur Selabintana',
    slug: 'panduan-lengkap-pendakian-gunung-gede-jalur-selabintana',
    excerpt: 'Tips persiapan fisik, manajemen logistik, dan titik sumber air bagi pendaki yang ingin menjajal trek terpanjang Taman Nasional.',
    content: `Bagi para pencinta alam bebas, jalur Selabintana di Kabupaten Sukabumi menawarkan rute pendakian menuju puncak Gunung Gede yang paling menantang dan memacu adrenalin. Jalur ini dikenal memiliki vegetasi hutan hujan tropis yang masih sangat rapat dan alami.

Balai Besar Taman Nasional Gunung Gede Pangrango (TNGGP) mengingatkan seluruh calon pendaki untuk melakukan pendaftaran simaksi online, membawa perlengkapan navigasi memadai, serta memastikan kondisi fisik dalam keadaan prima sebelum memulai pendakian. Waktu tempuh melalui jalur Selabintana rata-rata memakan waktu 9 hingga 11 jam perjalanan.`,
    category: 'lifestyle',
    categoryLabel: 'Lifestyle',
    subCategory: 'WISATA',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Panorama jalur pendakian Gunung Gede via Selabintana Sukabumi',
    imageCaption: 'Jalur pendakian Selabintana menawarkan petualangan alam murni.',
    author: 'Tim Redaksi',
    reporter: 'Fajar Pratama',
    redaktur: 'Ujang Herlan',
    tags: ['#Wisata', '#GunungGede', '#Selabintana', '#Pendakian', '#AlamSukabumi'],
    readTime: '6 min read',
    isHero: false,
    isEditorsPick: true,
    badge: 'WISATA',
    createdAt: '2026-10-27T03:00:00.000Z',
    publishedDate: '27 Okt 2026 | 10:00 WIB',
  },

  // 10. OTOMOTIF (Mobil Listrik SMKN 1)
  {
    id: 'art-mobil-listrik-smkn1',
    title: 'Mobil Listrik Vibes-EV Dirakit Siswa SMKN 1 Sukabumi Siap Uji Jalan',
    slug: 'mobil-listrik-vibes-ev-dirakit-siswa-smkn-1-sukabumi-siap-uji-jalan',
    excerpt: 'Karya inovatif anak bangsa dibekali baterai lithium 15 kWh dengan daya jelajah hingga 120 kilometer untuk mobilitas ramah lingkungan.',
    content: `Prestasi membanggakan kembali ditorehkan oleh dunia pendidikan vokasi di Sukabumi. Siswa jurusan Teknik Otomotif dan Elektronika SMKN 1 Sukabumi berhasil merakit prototipe mobil listrik perkotaan bernama Vibes-EV yang kini siap menjalani tahap uji kelayakan jalan raya.

Kendaraan ramah lingkungan ini dibekali baterai lithium-ion berkapasitas 15 kWh yang sanggup menempuh jarak hingga 120 kilometer dalam sekali pengisian daya penuh. Kepala sekolah menyampaikan bahwa proyek ini merupakan wujud nyata integrasi kurikulum merdeka berbasis industri hijau yang siap mencetak lulusan berdaya saing tinggi.`,
    category: 'otomotif',
    categoryLabel: 'Otomotif',
    subCategory: 'OTOMOTIF',
    imageUrl: 'https://images.unsplash.com/photo-1558441719-aa34bef57312?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Mobil listrik Vibes-EV karya siswa SMKN 1 Sukabumi',
    imageCaption: 'Prototipe mobil listrik karya pelajar Sukabumi siap uji jalan.',
    author: 'Tim Redaksi',
    reporter: 'Fajar Pratama',
    redaktur: 'Ujang Herlan',
    tags: ['#Otomotif', '#MobilListrik', '#SMKN1Sukabumi', '#InovasiVokasi'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'OTOMOTIF',
    createdAt: '2026-10-26T06:30:00.000Z',
    publishedDate: '26 Okt 2026 | 13:30 WIB',
  },

  // 11. KOMUNITAS (Vespa Pelabuhanratu)
  {
    id: 'art-komunitas-vespa-sukabumi',
    title: 'Komunitas Motor Vespa Sukabumi Gelar Baksos Keliling Pelabuhanratu',
    slug: 'komunitas-motor-vespa-sukabumi-gelar-baksos-keliling-pelabuhanratu',
    excerpt: 'Ratusan penggemar skuter klasik bagikan ratusan paket sembako dan adakan aksi bersih sampah di pesisir pantai selatan.',
    content: `Ratusan pengendara skuter klasik Vespa dari berbagai penjuru Sukabumi memadati pesisir Pantai Pelabuhanratu dalam agenda bakti sosial tahunan bertajuk "Ride for Charity". Kegiatan ini mengombinasikan silaturahmi antar-komunitas dengan aksi bersih-bersih sampah pantai dan pembagian paket sembako kepada keluarga nelayan lokal.

Ketua panitia menegaskan bahwa citra anak motor bukan sekadar hura-hura di jalan raya, melainkan mampu menjadi motor penggerak kepedulian lingkungan dan sosial bagi masyarakat pesisir selatan Jawa Barat.`,
    category: 'otomotif',
    categoryLabel: 'Komunitas',
    subCategory: 'KOMUNITAS',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Aksi baksos komunitas skuter Vespa di Pelabuhanratu Sukabumi',
    imageCaption: 'Komunitas Vespa Sukabumi berkumpul di pesisir Pelabuhanratu.',
    author: 'Tim Redaksi',
    reporter: 'Ilham Nugraha',
    redaktur: 'Ahmad Fauzi',
    tags: ['#Vespa', '#Komunitas', '#Pelabuhanratu', '#Baksos', '#Otomotif'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'KOMUNITAS',
    createdAt: '2026-10-25T07:45:00.000Z',
    publishedDate: '25 Okt 2026 | 14:45 WIB',
  },

  // 12. LOKER (PT Semen Jawa)
  {
    id: 'art-loker-semen-jawa',
    title: 'Lowongan Kerja PT Semen Jawa Sukabumi Buka Posisi Staff Operasional',
    slug: 'lowongan-kerja-pt-semen-jawa-sukabumi-buka-posisi-staff-operasional',
    excerpt: 'Informasi lowongan kerja terbaru di Sukabumi untuk lulusan D3 dan S1 teknik maupun manajemen.',
    content: `Kabar baik bagi para pencari kerja di wilayah Sukabumi dan sekitarnya. Perusahaan manufaktur terkemuka PT Semen Jawa membuka kesempatan karir untuk beberapa posisi strategis, mulai dari Staff Operasional Pabrik, Teknisi Pemeliharaan, hingga Administrasi Logistik.

Kandidat yang memenuhi kualifikasi dapat mengirimkan berkas lamaran melalui portal rekrutmen resmi perusahaan sebelum batas akhir pendaftaran. Prioritas diberikan bagi pelamar berdomisili Sukabumi dengan komitmen kerja yang tinggi.`,
    category: 'loker',
    categoryLabel: 'Lowongan Kerja',
    subCategory: 'LOKER SUKABUMI',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lowongan kerja industri di kawasan Sukabumi',
    imageCaption: 'Peluang karir industri di Sukabumi.',
    author: 'Tim Redaksi',
    reporter: 'Tim Karir',
    redaktur: 'Ahmad Fauzi',
    tags: ['#Loker', '#LowonganKerja', '#KarirSukabumi', '#SemenJawa'],
    readTime: '3 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'LOKER',
    createdAt: '2026-10-24T02:00:00.000Z',
    publishedDate: '24 Okt 2026 | 09:00 WIB',
  },

  // 13. HEALTH (Tips Kebugaran Cuaca Ekstrem)
  {
    id: 'art-tips-kebugaran-cuaca-ekstrem',
    title: 'Tips Menjaga Kebugaran Fisik saat Cuaca Ekstrem Melanda Sukabumi',
    slug: 'tips-menjaga-kebugaran-fisik-saat-cuaca-ekstrem-melanda-sukabumi',
    excerpt: 'Perubahan suhu mendadak sering memicu flu dan batuk. Simak panduan menjaga imun tubuh dari dokter spesialis.',
    content: `Perubahan cuaca ekstrem dengan peralihan suhu dingin dan hujan lebat yang melanda wilayah Sukabumi belakangan ini perlu diwaspadai. Dokter spesialis penyakit dalam menyarankan warga untuk mencukupi asupan cairan, mengonsumsi makanan kaya vitamin C, dan rutin berolahraga ringan minimal 30 menit sehari.

Pola istirahat yang teratur juga sangat krusial dalam memperkuat sistem kekebalan tubuh dari paparan virus pernapasan musiman.`,
    category: 'health',
    categoryLabel: 'Health',
    subCategory: 'KESEHATAN',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Menjaga kebugaran fisik dan imun tubuh',
    imageCaption: 'Olahraga teratur menjaga daya tahan tubuh saat cuaca ekstrem.',
    author: 'Tim Redaksi',
    reporter: 'dr. Sarah Nurbaiti',
    redaktur: 'Ahmad Fauzi',
    tags: ['#Kesehatan', '#TipsKebugaran', '#Imunitas', '#CuacaEkstrem', '#Sukabumi'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'HEALTH',
    createdAt: '2026-10-24T04:30:00.000Z',
    publishedDate: '24 Okt 2026 | 11:30 WIB',
  },

  // 14. BERITA (Festival Budaya Sukabumi)
  {
    id: 'art-festival-budaya-sukabumi',
    title: 'Festival Budaya dan Ekonomi Kreatif Sukabumi 2026 Resmi Dibuka',
    slug: 'festival-budaya-dan-ekonomi-kreatif-sukabumi-2026-resmi-dibuka',
    excerpt: 'Pagelaran seni tari tradisional, pameran kriya, dan parade kostum meriahkan pembukaan festival tahunan di Alun-Alun.',
    content: `Pemerintah Kota Sukabumi resmi membuka Festival Budaya dan Ekonomi Kreatif Sukabumi 2026 yang berlangsung meriah di kawasan Alun-Alun dan Lapang Merdeka. Acara tahunan ini menampilkan parade seni tari tradisional Sunda, pameran produk kriya unggulan, hingga festival jajanan tradisional tempo doeloe.

Ribuan masyarakat dari berbagai wilayah tampak antusias memadati area festival sejak pagi hari. Gelaran ini diharapkan menjadi lokomotif penggerak sektor pariwisata daerah sekaligus melestarikan warisan seni budaya bagi generasi muda.`,
    category: 'berita',
    categoryLabel: 'Berita',
    subCategory: 'DAERAH',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Kemeriahan Festival Budaya dan Seni Kreatif Sukabumi',
    imageCaption: 'Parade seni budaya di Alun-Alun Kota Sukabumi.',
    author: 'Tim Redaksi',
    reporter: 'Rian Hidayat',
    redaktur: 'Ahmad Fauzi',
    tags: ['#Budaya', '#Sukabumi', '#EkonomiKreatif', '#Festival', '#Pariwisata'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'BERITA',
    createdAt: '2026-10-23T09:00:00.000Z',
    publishedDate: '23 Okt 2026 | 16:00 WIB',
  },
];
