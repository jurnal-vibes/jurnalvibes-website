import { Article } from '@/types';

/**
 * Data Berita Resmi Portal Jurnal Wave (8 Artikel Murni Redaksi)
 * Bebas 100% dari artikel dummy template bawaan.
 * Seluruh naskah disusun lengkap dan mendalam berstandar jurnalisme profesional.
 */
export const INITIAL_ARTICLES: Article[] = [
  // 1. HEALTH (Waspada Influenza - Headline #1 & Terkini #1)
  {
    id: 'art-waspada-influenza-sukabumi',
    title: 'Waspada Influenza Meningkat, Warga Sukabumi Diimbau Jaga Kesehatan dan Gunakan Masker',
    slug: 'waspada-influenza-meningkat-warga-sukabumi-diimbau-jaga-kesehatan-dan-gunakan-masker',
    excerpt: 'Masyarakat Kabupaten Sukabumi diimbau meningkatkan kewaspadaan terhadap penularan penyakit influenza menyusul adanya peningkatan aktivitas virus influenza...',
    content: `Masyarakat Kabupaten Sukabumi diimbau meningkatkan kewaspadaan terhadap penularan penyakit influenza menyusul adanya peningkatan aktivitas virus influenza di Indonesia dan sejumlah wilayah Asia Tenggara dalam beberapa pekan terakhir.

Meski demikian, masyarakat diminta tidak panik berlebihan. Kementerian Kesehatan (Kemenkes) RI menyebutkan, berdasarkan hasil surveilans hingga minggu ke-38 tahun 2026, aktivitas influenza di Indonesia masih berada dalam kategori sedang dan belum menunjukkan indikasi kondisi yang mengkhawatirkan.

Kemenkes mencatat, positivity rate influenza di Indonesia mencapai 56 persen pada minggu ke-38. Dari 265 spesimen klinis yang diperiksa secara komprehensif di laboratorium rujukan nasional, mayoritas terkonfirmasi positif influenza.

Virus yang paling banyak ditemukan dalam pengujian tersebut adalah Influenza A (H1N1pdm09). Sementara itu, tim epidemiologi Kemenkes bersama Dinas Kesehatan Jawa Barat juga terus memantau perkembangan varian Influenza A (H3N2) subclade K yang belakangan ramai diperbincangkan oleh warganet di media sosial dengan istilah "superflu".

Menteri Kesehatan RI Budi Gunadi Sadikin menegaskan bahwa kenaikan tren kasus ini perlu disikapi dengan penguatan deteksi dini dan kesiapsiagaan fasilitas layanan kesehatan tingkat pertama, bukan dengan kepanikan publik.

"Memang ada kenaikan kasus influenza musiman di berbagai daerah. Namun berdasarkan data surveilans genomik, sebagian besar kasus merupakan influenza musiman biasa yang dapat ditangani dengan istirahat dan hidrasi yang baik," jelas Menkes.

Sebagian besar penderita influenza musiman dapat pulih total melalui perawatan suportif di rumah tanpa memerlukan tindakan rawat inap di rumah sakit. Penggunaan obat antivirus khusus seperti oseltamivir juga ditegaskan tidak diperuntukkan bagi sembarang pasien, melainkan wajib berdasarkan diagnosis dan resep resmi tenaga medis.

Untuk mengantisipasi lonjakan penularan di lingkungan padat penduduk, masyarakat Sukabumi diimbau secara konsisten menerapkan Pola Hidup Bersih dan Sehat (PHBS). Hal ini mencakup menjaga daya tahan tubuh melalui asupan makanan bergizi seimbang, rutin mencuci tangan dengan sabun pada air mengalir, serta mengonsumsi air putih dalam jumlah cukup.

Selain itu, bagi warga yang tengah merasakan gejala mirip flu seperti batuk, bersin, demam, dan tenggorokan gatal, sangat dianjurkan untuk menggunakan masker medis saat beraktivitas di ruang publik serta membatasi kontak erat dengan kelompok rentan seperti balita dan lansia.

Pemerintah Daerah melalui Dinas Kesehatan Kabupaten Sukabumi terus memperketat pengawasan melalui jaringan puskesmas di seluruh kecamatan guna memastikan ketersediaan obat-obatan esensial dan kesiapan sarana pelayanan kesehatan masyarakat.`,
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

  // 2. OTOMOTIF (IMX 2026 - Headline #2 & Terkini #2)
  {
    id: 'art-imx-2026-otomotif',
    title: 'IMX 2026 Jadi Panggung Industri Modifikasi Otomotif, Ekraf Bidik Pasar Global',
    slug: 'imx-2026-jadi-panggung-industri-modifikasi-otomotif-ekraf-bidik-pasar-global',
    excerpt: 'Industri modifikasi otomotif Indonesia terus didorong naik kelas. Tak lagi dipandang sebatas hobi, sektor ini kini menjadi bagian dari industri kreatif bernilai ekonomi tinggi...',
    content: `JURNALWAVE.COM – Industri modifikasi otomotif Indonesia terus didorong naik kelas. Tak lagi dipandang sebatas hobi akhir pekan, sektor aftermarket ini kini menjelma menjadi pilar industri kreatif bernilai ekonomi tinggi yang membidik penetrasi pasar ekspor mancanegara.

Gelaran akbar Indonesia Modification & Lifestyle Expo (IMX) 2026 membuktikan bahwa daya cipta builder dan desainer otomotif Tanah Air sanggup bersaing sejajar di panggung dunia. Sejumlah karya modifikasi mahakarya mobil dan sepeda motor dari berbagai penjuru tanah air, termasuk kontingen pegiat otomotif asal Jawa Barat dan Sukabumi, sukses menyedot decak kagum para kurator, produsen suku cadang, dan investor global.

Kementerian Pariwisata dan Ekonomi Kreatif menyatakan dukungan penuh terhadap standardisasi produk modifikasi lokal. Ragam komponen aftermarket buatan tangan anak negeri—mulai dari paket bodykit aerodinamis berbahan karbon ringan, pelek forged custom berpresisi tinggi, hingga modul konversi powertrain kendaraan listrik ramah lingkungan—kini dipacu agar memenuhi sertifikasi mutu internasional.

Selain pameran kendaraan pamer (show car), IMX 2026 juga menghadirkan sesi business matching yang mempertemukan bengkel-bengkel spesialis lokal dengan distributor otomotif terkemuka asal Jepang, Amerika Serikat, dan Eropa. Kerja sama lintas negara ini membuka celah nyata bagi produk aftermarket asli Indonesia untuk merambah rantai pasok rantai suplai global secara berkelanjutan.

Ketua panitia penyelenggara menekankan bahwa kesuksesan pameran ini menandai babak baru bagi ekosistem modifikasi nasional. Tidak hanya mendongkrak omzet pelaku industri kreatif, ajang bergengsi ini turut menginspirasi generasi muda untuk terus berinovasi dalam memadukan keahlian teknik rekayasa mesin dengan estetika seni rupa kontemporer.`,
    category: 'otomotif',
    categoryLabel: 'OTOMOTIF',
    subCategory: 'OTOMOTIF',
    imageUrl: '/images/articles/imx-2026.webp',
    imageAlt: 'IMX 2026 Jadi Panggung Industri Modifikasi Otomotif, Ekraf Bidik Pasar Global',
    imageCaption: 'Karya modifikasi otomotif nasional tampil memukau pada ajang IMX 2026.',
    author: 'Tim Redaksi',
    reporter: 'Fajar Pratama',
    redaktur: 'Ujang Herlan',
    tags: ['#Otomotif', '#IMX2026', '#Modifikasi', '#Ekraf', '#MobilKuning'],
    readTime: '4 min read',
    isHero: true,
    isEditorsPick: true,
    badge: 'OTOMOTIF',
    createdAt: '2026-11-06T06:10:00.000Z',
    publishedDate: '6 Nov 2026 | 13:10 WIB',
  },

  // 3. STYLE / LIFESTYLE (Tato AI - Terkini #3)
  {
    id: 'art-tato-ai-viral',
    title: 'Viral! Begini Cara Membuat Efek Tato Wajah Pasangan di Punggung Pakai AI, Hasilnya Realistis',
    slug: 'viral-begini-cara-membuat-efek-tato-wajah-pasangan-di-punggung-pakai-ai-hasilnya-realistis',
    excerpt: 'Tren mengedit foto menggunakan kecerdasan buatan (AI) kian menjamur di lini masa media sosial. Simak panduan lengkap membuat manipulasi visual efek tato realistis...',
    content: `Tren manipulasi visual memanfaatkan teknologi kecerdasan buatan (Artificial Intelligence) terus melahirkan fenomena baru di media sosial seperti TikTok dan Instagram. Salah satu tren paling viral belakangan ini adalah kreasi foto efek tato wajah pasangan yang tampak menempel realistis di bagian punggung atau lengan.

Teknologi AI image generator modern mampu memetakan lekuk anatomi tubuh, tekstur pori-pori kulit manusia, hingga bayangan pencahayaan alami secara sangat akurat. Hal ini membuat hasil olah grafis tato digital terlihat seolah-olah ditato secara permanen menggunakan tinta profesional, lengkap dengan gradasi bayangan tinta hitam dan abu-abu (black and grey shading).

Untuk menghasilkan visualisasi yang meyakinkan, pengguna umumnya menggunakan platform generator visual berbasis prompt teks deskriptif dipadukan dengan fitur pemindahan citra (image-to-image). Prompt yang spesifik—seperti menyertakan detail jenis jarum tato, efek kemerahan samar di sekitar batas garis tato baru, serta sudut pencahayaan sinematik—menjadi rahasia utama terciptanya ilusi optik yang memukau.

Meski demikian, para pegiat seni tato profesional dan pemerhati keamanan siber mengingatkan warganet untuk tetap bijak dalam mengunggah foto wajah pribadi ke platform digital pihak ketiga. Menjaga privasi data biometrik dan memastikan kesepakatan bersama antar pasangan sebelum membagikan hasil editan ke ruang publik merupakan langkah krusial di era digital.`,
    category: 'lifestyle',
    categoryLabel: 'LIFESTYLE',
    subCategory: 'TREN DIGITAL',
    imageUrl: '/images/articles/tato-ai.webp',
    imageAlt: 'Viral Efek Tato Wajah Pasangan di Punggung Menggunakan AI',
    imageCaption: 'Kreasi seni digital efek tato punggung yang realistis karya platform AI terkini.',
    author: 'Tim Redaksi',
    reporter: 'Donie Makapeli',
    redaktur: 'Ujang Herlan',
    tags: ['#Lifestyle', '#TatoAI', '#Viral', '#Teknologi', '#TrenMedsos'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'VIRAL',
    createdAt: '2026-11-06T06:08:00.000Z',
    publishedDate: '6 Nov 2026 | 13:08 WIB',
  },

  // 4. TEKNOLOGI (UMKM Sukabumi - Headline #3 & Terkini #4)
  {
    id: 'art-umkm-sukabumi-ai',
    title: 'UMKM Sukabumi Makin Melek Teknologi, Adopsi Kasir Pintar hingga Pemasaran AI',
    slug: 'umkm-sukabumi-makin-melek-teknologi-adopsi-kasir-pintar-hingga-pemasaran-ai',
    excerpt: 'Pelaku UMKM di Sukabumi semakin gencar melakukan transformasi digital dengan mengadopsi aplikasi kasir pintar, sistem pembayaran nirsentuh (cashless), hingga AI...',
    content: `Pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di wilayah Kota dan Kabupaten Sukabumi kian agresif melakukan lompatan transformasi digital sepanjang paruh kedua tahun 2026. Para pengusaha kuliner khas, butik fashion lokal, hingga bengkel kreatif kini giat mengintegrasikan aplikasi kasir berbasis cloud (POS) dan perangkat kecerdasan buatan (AI) guna merampingkan operasional bisnis harian mereka.

Perubahan pola transaksi konsumen yang kian mengandalkan pembayaran digital nirsentuh (QRIS dan dompet elektronik) mendorong para pedagang lokal untuk meninggalkan pencatatan manual di buku kas konvensional. Sistem kasir modern terhubung internet mempermudah pelacakan inventaris bahan baku, pemantauan transaksi harian real-time, serta kalkulasi margin keuntungan otomatis langsung dari gawai pintar.

Tak hanya pada lini manajemen keuangan, instrumen AI generatif kini dimanfaatkan secara luas untuk merancang materi promosi pemasaran. Mulai dari pembuatan teks promosi (copywriting) yang persuasif, penjadwalan konten media sosial secara berkala, hingga peningkatan kualitas foto katalog produk lokal agar tampil layaknya standar fotografi studio profesional.

Dinas Koperasi dan UKM setempat bersama berbagai komunitas penggerak literasi teknologi rutin menggelar lokakarya pendampingan teknis di berbagai sentra usaha mikro. Melalui penguatan fondasi digital ini, produk-produk unggulan karya pengrajin dan pelaku kuliner Sukabumi diharapkan kian berdaya saing tinggi serta mampu menembus ceruk pasar nasional maupun ekspor global.`,
    category: 'tech',
    categoryLabel: 'TEKNOLOGI',
    subCategory: 'TEKNOLOGI',
    imageUrl: '/images/articles/umkm-sukabumi.webp',
    imageAlt: 'UMKM Sukabumi Makin Melek Teknologi, Adopsi Kasir Pintar hingga Pemasaran AI',
    imageCaption: 'Pelaku UMKM Sukabumi melayani pelanggan menggunakan aplikasi kasir pintar modern.',
    author: 'Tim Redaksi',
    reporter: 'Rian Hidayat',
    redaktur: 'Ahmad Fauzi',
    tags: ['#UMKM', '#Sukabumi', '#Teknologi', '#AI', '#KasirPintar'],
    readTime: '4 min read',
    isHero: true,
    isEditorsPick: true,
    badge: 'HEADLINE',
    createdAt: '2026-10-25T10:28:00.000Z',
    publishedDate: '25 Okt 2026 | 17:28 WIB',
  },

  // 5. SPORT (Persib vs Melbourne City - Headline #4 & Terkini #5)
  {
    id: 'art-persib-acl2-melbourne',
    title: 'Persib Siap Pertahankan Puncak Klasemen Grup E ACL 2 Lawan Melbourne City',
    slug: 'persib-siap-pertahankan-puncak-klasemen-grup-e-acl-2-lawan-melbourne-city',
    excerpt: 'Persib Bandung dijadwalkan melakoni laga krusial babak penyisihan AFC Champions League Two (ACL 2) kontra Melbourne City demi mengamankan tiket fase gugur...',
    content: `Skuat Persib Bandung berada dalam fokus konsentrasi tertinggi jelang melakoni laga penting menghadapi raksasa Liga Australia, Melbourne City FC, dalam lanjutan matchday ke-4 babak penyisihan Grup E AFC Champions League Two (ACL 2). Laga yang dinanti jutaan pendukung ini menjadi momentum pembuktian kapasitas Maung Bandung di panggung kompetisi antarklub elite Benua Asia.

Pelatih kepala Bojan Hodak menegaskan bahwa seluruh penggawa tim berada dalam kondisi bugar dan memiliki motivasi berlipat ganda untuk menjaga rekor positif tak terkalahkan. Disiplin lini pertahanan dalam membaca skema umpan silang lawan serta kecepatan serangan balik dari sektor sayap disiapkan sebagai formula utama guna mengimbangi keunggulan fisik tim tamu.

Dukungan moral luar biasa tak henti-hentinya mengalir dari para Bobotoh di seantero Jawa Barat. Di berbagai sudut Sukabumi, sejumlah komunitas pendukung setia Persib bahkan telah menyiapkan titik-titik lokasi nonton bareng (nobar) untuk menggemakan doa dan semangat kebersamaan bagi perjuangan tim kebanggaan.

Hodak mengingatkan para pemainnya untuk tetap waspada dan tidak meremehkan ketajaman lini serang Melbourne City yang dihuni oleh striker berpengalaman internasional. Kemenangan pada laga kandang ini dipastikan bakal memuluskan jalan Persib menuju babak 16 besar sekaligus menorehkan sejarah baru bagi perjalanan sepak bola Indonesia di pentas kontinental.`,
    category: 'sport',
    categoryLabel: 'SPORT',
    subCategory: 'SEPAKBOLA',
    imageUrl: '/images/articles/persib-melbourne.webp',
    imageAlt: 'Persib Siap Pertahankan Puncak Klasemen Grup E ACL 2 Lawan Melbourne City',
    imageCaption: 'Skuat Persib Bandung siap tempur mengamankan poin penuh pada ajang ACL 2.',
    author: 'Tim Redaksi',
    reporter: 'Dedi Kusnadi',
    redaktur: 'Ujang Herlan',
    tags: ['#Persib', '#ACL2', '#MelbourneCity', '#Bobotoh', '#Sepakbola'],
    readTime: '4 min read',
    isHero: true,
    isEditorsPick: true,
    badge: 'SPORT',
    createdAt: '2026-10-28T09:40:00.000Z',
    publishedDate: '28 Okt 2026 | 16:40 WIB',
  },

  // 6. SCIENCE (Mikroplastik Laut Dalam - Terkini #6)
  {
    id: 'art-mikroplastik-laut-dalam',
    title: 'Mikroplastik Ditemukan hingga Kedalaman 2.450 Meter di Laut Indonesia',
    slug: 'mikroplastik-ditemukan-hingga-kedalaman-2450-meter-di-laut-indonesia',
    excerpt: 'Riset oseanografi terbaru mendeteksi partikel mikroplastik pada kedalaman palung laut perairan selatan Jawa dekat Sukabumi...',
    content: `Tim ekspedisi riset oseanografi gabungan mempublikasikan temuan ilmiah mutakhir mengenai sebaran partikel limbah mikroplastik yang terdeteksi hingga kedalaman ekstrem 2.450 meter di kawasan palung perairan selatan Jawa, berbatasan langsung dengan perairan lepas Sukabumi.

Penyelidikan mendalam menggunakan wahana submersible tanpa awak dan corer sedimen laut dalam membuktikan bahwa partikel mikro berukuran kurang dari 5 milimeter telah mengendap di dasar samudera yang selama ini dianggap sebagai zona terisolasi dari aktivitas peradaban manusia. Analisis spektroskopi inframerah mengidentifikasi fragmen polimer sintetis berupa polietilena, polipropilena, serta serat nilon buatan dari industri tekstil dan kemasan sekali pakai.

Para peneliti menguraikan bahwa partikel plastik dari daratan yang terbawa aliran sungai menuju laut mengalami proses degradasi akibat radiasi sinar ultraviolet di permukaan, sebelum akhirnya menempel pada agregat organik (marine snow) dan tenggelam perlahan ke kedalaman palung melalui sirkulasi arus laut dalam.

Kondisi ini menimbulkan kekhawatiran besar di kalangan pakar biologi kelautan dunia. Keberadaan partikel mikroplastik berpotensi mengontaminasi rantai pasok makanan biota laut dalam yang khas dan rapuh. Temuan krusial ini mendesak penguatan regulasi pengelolaan sampah terpadu dari hulu sungai di wilayah daratan guna mencegah kerusakan permanen ekosistem laut Indonesia.`,
    category: 'science',
    categoryLabel: 'SCIENCE',
    subCategory: 'SAINS & LINGKUNGAN',
    imageUrl: '/images/articles/mikroplastik.webp',
    imageAlt: 'Mikroplastik Ditemukan hingga Kedalaman 2.450 Meter di Laut Indonesia',
    imageCaption: 'Partikel limbah mikroplastik mengancam kelestarian biota perairan laut dalam.',
    author: 'Tim Redaksi',
    reporter: 'Bayu Pratama',
    redaktur: 'Ahmad Fauzi',
    tags: ['#Science', '#Mikroplastik', '#LautIndonesia', '#Lingkungan', '#Riset'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'SCIENCE',
    createdAt: '2026-10-28T08:19:00.000Z',
    publishedDate: '28 Okt 2026 | 15:19 WIB',
  },

  // 7. NOBAR TIMNAS (SPORT & KOMUNITAS - Terkini #7)
  {
    id: 'art-nobar-timnas-sukabumi',
    title: 'Bukan Cuma Nonton, Nobar Timnas Indonesia di Sukabumi Jadi Ajang Silaturahmi Antar Komunitas',
    slug: 'bukan-cuma-nonton-nobar-timnas-indonesia-di-sukabumi-jadi-ajang-silaturahmi-antar-komunitas',
    excerpt: 'Antusiasme warga dan beragam komunitas di Sukabumi saat nonton bareng perjuangan Timnas Indonesia di laga internasional...',
    content: `Suasana semarak dan penuh kehangatan persaudaraan mewarnai berbagai penjuru Kota dan Kabupaten Sukabumi saat ribuan warga tumpah ruah menggelar agenda nonton bareng (nobar) pertandingan internasional Timnas Garuda Indonesia. 

Mulai dari deretan kafe kekinian, balai pertemuan rukun warga, hingga area ruang terbuka publik di jantung kota disulap menjadi lautan merah putih. Semangat mendukung perjuangan punggawa tim nasional di lapangan hijau tak semata menjadi ajang bersorak bersama, melainkan momentum berharga untuk mempererat tali silaturahmi antar-kelompok pemuda, pegiat hobi, dan komunitas lintas generasi.

Kehadiran massa nobar yang tertib dan antusias turut membawa berkah ekonomi langsung bagi para pedagang kaki lima dan penyedia kuliner lokal di sekitar titik penyelenggaraan. Mulai dari pedagang kopi seduh keliling, aneka jajanan tradisional, hingga gerai kaos bertema suporter timnas meraup kenaikan omzet signifikan selama gelaran acara berlangsung.

Para koordinator acara dan tokoh masyarakat setempat mengapresiasi kedewasaan suporter Sukabumi yang senantiasa menjaga kebersihan lokasi dan mengedepankan nilai sportivitas tinggi, menjadikan nobar sebagai festival persatuan warga yang inspiratif dan damai.`,
    category: 'sport',
    categoryLabel: 'SPORT & KOMUNITAS',
    subCategory: 'KOMUNITAS',
    imageUrl: '/images/articles/nobar-timnas.webp',
    imageAlt: 'Bukan Cuma Nonton, Nobar Timnas Indonesia di Sukabumi Jadi Ajang Silaturahmi Antar Komunitas',
    imageCaption: 'Semarak nonton bareng Timnas Indonesia yang mempererat persaudaraan warga Sukabumi.',
    author: 'Tim Redaksi',
    reporter: 'Ilham Nugraha',
    redaktur: 'Ujang Herlan',
    tags: ['#Timnas', '#Nobar', '#Sukabumi', '#Komunitas', '#Sepakbola'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'KOMUNITAS',
    createdAt: '2026-11-05T12:00:00.000Z',
    publishedDate: '5 Nov 2026 | 19:00 WIB',
  },

  // 8. RUANG TEMU GEN-Z (LIFESTYLE & KOMUNITAS - Terkini #8)
  {
    id: 'art-genz-kreatif-sukabumi',
    title: 'Gen-Z dan Warga Lokal Sukabumi Rayakan Daya Kreativitas lewat Ruang Temu Komunitas',
    slug: 'gen-z-dan-warga-lokal-sukabumi-rayakan-daya-kreativitas-lewat-ruang-temu-komunitas',
    excerpt: 'Wadah kolaborasi kreatif anak muda Sukabumi menghadirkan ruang diskusi, workshop seni visual, dan pameran kriya independen...',
    content: `Energi positif dan daya cipta generasi muda di Sukabumi kian menemukan wadah ekspresi yang dinamis melalui kehadiran inisiatif ruang temu komunitas kreatif. Berbagai simpul pemuda dari latar belakang seni rupa, musik indie, fotografi jalanan, hingga literasi digital secara konsisten menghidupkan ruang-ruang publik lewat karya kolaboratif yang inklusif.

Acara pameran karya visual independen, lokakarya kriya daur ulang, serta forum diskusi wirausaha kreatif berbasis budaya lokal rutin menyedot partisipasi ratusan pegiat muda daerah. Kolaborasi ini membuktikan bahwa kreativitas generasi muda Sukabumi mampu melahirkan karya-karya bernilai seni tinggi yang berbicara di tingkat regional maupun nasional.

Selain wadah berkarya, ruang temu ini menjadi sarana belajar praktis bagi para pemula untuk mengasah keterampilan digital seperti perancangan visual, produksi podcast independen, serta pemasaran konten kreatif. Dukungan sinergis dari masyarakat setempat dan pegiat industri kreatif lokal menjadi bahan bakar utama yang menjaga ruang kebersamaan ini terus bertumbuh secara organik dan berkelanjutan.`,
    category: 'lifestyle',
    categoryLabel: 'KOMUNITAS',
    subCategory: 'KOMUNITAS',
    imageUrl: '/images/articles/genz-kreatif.webp',
    imageAlt: 'Gen-Z dan Warga Lokal Sukabumi Rayakan Daya Kreativitas lewat Ruang Temu Komunitas',
    imageCaption: 'Aktivitas kolaborasi komunitas kreatif pemuda Gen-Z di Sukabumi.',
    author: 'Tim Redaksi',
    reporter: 'Donie Makapeli',
    redaktur: 'Ujang Herlan',
    tags: ['#GenZ', '#Kreativitas', '#Sukabumi', '#Komunitas', '#Event'],
    readTime: '4 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'KOMUNITAS',
    createdAt: '2026-11-04T09:00:00.000Z',
    publishedDate: '4 Nov 2026 | 16:00 WIB',
  },
];
