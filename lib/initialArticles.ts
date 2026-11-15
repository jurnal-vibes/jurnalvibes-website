import { Article } from '@/types';

/**
 * Data Berita Asli Portal Jurnal Wave (11 Artikel Resmi Redaksi)
 * Menggunakan foto asli yang diunggah pengguna (disimpan lokal di /images/articles/)
 * Menjamin 100% konsistensi lintas perangkat (HP, tablet, laptop) tanpa 404 dan tanpa foto bus.
 */
export const INITIAL_ARTICLES: Article[] = [
  // 1. HEALTH (Waspada Influenza - Terkini #1)
  {
    id: 'art-waspada-influenza-sukabumi',
    title: 'Waspada Influenza Meningkat, Warga Sukabumi Diimbau Jaga Kesehatan dan Gunakan Masker',
    slug: 'waspada-influenza-meningkat-warga-sukabumi-diimbau-jaga-kesehatan-dan-gunakan-masker',
    excerpt: 'Masyarakat Kabupaten Sukabumi diimbau meningkatkan kewaspadaan terhadap penularan penyakit influenza menyusul adanya peningkatan aktivitas virus influenza...',
    content: `Masyarakat Kabupaten Sukabumi diimbau meningkatkan kewaspadaan terhadap penularan penyakit influenza menyusul adanya peningkatan aktivitas virus influenza di sejumlah wilayah kecamatan dalam beberapa pekan terakhir.

Perubahan cuaca pancaroba yang diiringi intensitas hujan tinggi dinilai menjadi salah satu faktor pemicu turunnya daya tahan tubuh masyarakat. Gejala klinis yang kerap dikeluhkan antara lain demam mendadak, batuk kering, sakit tenggorokan, pilek, nyeri otot, hingga rasa lemas berlebih.

Dinas Kesehatan mengimbau warga, khususnya kelompok rentan seperti balita, ibu hamil, dan lansia, untuk kembali membiasakan memakai masker saat berada di ruang publik atau transportasi umum, mencuci tangan memakai sabun, mencukupi asupan gizi seimbang, serta segera memeriksakan diri ke fasilitas kesehatan terdekat jika gejala flu tidak kunjung mereda.`,
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
    readTime: '4 min read',
    isHero: true,
    isEditorsPick: true,
    badge: 'HEALTH',
    createdAt: '2026-11-06T06:15:00.000Z',
    publishedDate: '6 Nov 2026 | 13:15 WIB',
  },

  // 2. OTOMOTIF (IMX 2026 - Terkini #2)
  {
    id: 'art-imx-2026-otomotif',
    title: 'IMX 2026 Jadi Panggung Industri Modifikasi Otomotif, Ekraf Bidik Pasar Global',
    slug: 'imx-2026-jadi-panggung-industri-modifikasi-otomotif-ekraf-bidik-pasar-global',
    excerpt: 'Industri modifikasi otomotif Indonesia terus didorong naik kelas. Tak lagi dipandang sebatas hobi, sektor ini kini menjadi bagian dari industri kreatif be...',
    content: `Industri modifikasi otomotif Indonesia terus didorong naik kelas. Tak lagi dipandang sebatas hobi, sektor ini kini menjadi bagian dari industri kreatif bernilai ekonomi tinggi yang membidik penetrasi pasar global.

Gelaran Indonesia Modification & Lifestyle Expo (IMX) 2026 membuktikan bahwa kreativitas builder lokal mampu bersaing di kancah internasional. Sejumlah karya modifikasi mobil dan motor dari berbagai daerah, termasuk perwakilan pegiat otomotif Jawa Barat dan Sukabumi, menyedot apresiasi tinggi dari para kurator dan investor mancanegara.

Kementerian Pariwisata dan Ekonomi Kreatif menyatakan dukungan penuh terhadap standardisasi produk aftermarket lokal, mulai dari bodykit, velg custom, hingga modifikasi kendaraan listrik, agar mampu menembus rantai pasok ekspor global secara berkelanjutan.`,
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
    isHero: false,
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
    excerpt: 'Tren mengedit foto menggunakan kecerdasan buatan atau Artificial Intelligence (AI) semakin populer di media sosial. Salah satu yang tengah menarik perhatian adalah efek tato wajah pasangan di bagian punggung dengan desa...',
    content: `Tren mengedit foto menggunakan kecerdasan buatan atau Artificial Intelligence (AI) semakin populer di media sosial. Salah satu yang tengah menarik perhatian warganet adalah efek tato wajah pasangan di bagian punggung dengan detail pencahayaan dan kontur kulit yang tampak realistis.

Banyak kreator konten di TikTok dan Instagram membagikan tutorial langkah demi langkah membuat visual tato ilusi ini tanpa harus menggunakan jarum tato sungguhan. Dengan memanfaatkan aplikasi pembuat gambar bertenaga AI dan teknik blending tekstur, foto potret wajah pasangan dapat disematkan seolah-olah menjadi tato permanen bergaya sketsa atau realisme hitam putih.

Kendati tampak memukau dan menghibur, para pegiat seni tato mengingatkan masyarakat agar bijak dalam mengunggah hasil karya visual serta menghormati hak cipta dan privasi pasangan masing-masing di ruang digital.`,
    category: 'lifestyle',
    categoryLabel: 'STYLE',
    subCategory: 'STYLE & FASHION',
    imageUrl: '/images/articles/tato-ai.webp',
    imageAlt: 'Viral! Begini Cara Membuat Efek Tato Wajah Pasangan di Punggung Pakai AI, Hasilnya Realistis',
    imageCaption: 'Tren filter AI tato wajah pasangan di punggung yang viral di media sosial.',
    author: 'Donie Makapeli',
    reporter: 'Donie Makapeli',
    redaktur: 'Ujang Herlan',
    tags: ['#Style', '#Lifestyle', '#TatoAI', '#Viral', '#DonieMakapeli'],
    readTime: '3 min read',
    isHero: false,
    isEditorsPick: false,
    badge: 'STYLE',
    createdAt: '2026-11-06T06:08:00.000Z',
    publishedDate: '6 Nov 2026 | 13:08 WIB',
  },

  // 4. TEKNOLOGI (UMKM Sukabumi - Terkini #4 & Headline)
  {
    id: 'art-umkm-sukabumi-ai',
    title: 'UMKM Sukabumi Makin Melek Teknologi, Adopsi Kasir Pintar hingga Pemasaran AI',
    slug: 'umkm-sukabumi-makin-melek-teknologi-adopsi-kasir-pintar-hingga-pemasaran-ai',
    excerpt: 'Pelaku UMKM di Sukabumi semakin gencar melakukan transformasi digital dengan mengadopsi aplikasi kasir pintar, sistem pembayaran nirsentuh (cashless), hingga memanfaatkan Kecerdasan Buatan (AI) untuk merancang strategi pemasaran yang lebih...',
    content: `Pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di Sukabumi semakin gencar melakukan transformasi digital dengan mengadopsi aplikasi kasir pintar, sistem pembayaran nirsentuh (cashless), hingga memanfaatkan Kecerdasan Buatan (AI) untuk merancang strategi pemasaran yang lebih efektif dan efisien.

Perubahan pola transaksi masyarakat pasca-pandemi mendorong para pedagang kuliner, busana, hingga kerajinan tangan lokal untuk beralih dari pencatatan pembukuan manual ke ekosistem digital. Penggunaan aplikasi kasir berbasis cloud (POS) memudahkan pemantauan stok bahan baku serta pencatatan laba rugi secara realtime langsung dari ponsel pintar.

Selain itu, pemanfaatan alat bantu AI generatif untuk merancang copywriting iklan, foto katalog produk, hingga jadwal promosi media sosial terbukti mendongkrak penjualan rata-rata pelaku UMKM hingga lebih dari 30 persen. Pendampingan dari komunitas pegiat teknologi dan dinas terkait diharapkan terus memperluas jangkauan digitalisasi ke pelosok kecamatan di wilayah Kabupaten Sukabumi.`,
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

  // 5. SPORT & E-SPORT
  {
    id: 'art-persib-acl2-melbourne',
    title: 'Persib Siap Pertahankan Puncak Klasemen Grup E ACL 2 Lawan Melbourne City',
    slug: 'persib-siap-pertahankan-puncak-klasemen-grup-e-acl-2-lawan-melbourne-city',
    excerpt: 'Persib Bandung dijadwalkan akan melakoni laga krusial melawan tim tangguh asal Australia, Melbourne City, dalam lanjutan matchday ke-4 babak penyisihan Grup E AFC Champions League Two (ACL 2). Pelatih Bojan Hodak menegaskan skuat Maung Bandung siap tampil habis-habisan demi mempertahankan puncak klasemen.',
    content: `Persib Bandung dijadwalkan akan melakoni laga krusial melawan tim tangguh asal Australia, Melbourne City, dalam lanjutan matchday ke-4 babak penyisihan Grup E AFC Champions League Two (ACL 2). Pelatih Bojan Hodak menegaskan skuat Maung Bandung siap tampil habis-habisan demi mempertahankan puncak klasemen.

Dukungan penuh dari bobotoh yang datang langsung maupun yang menggelar nonton bareng di berbagai pelosok Jawa Barat, termasuk Sukabumi, menjadi suntikan motivasi moral berharga bagi para pemain. Lini pertahanan yang disiplin dan transisi serangan balik cepat dinilai akan menjadi kunci utama dalam meredam dominasi permainan fisik tim tamu.

"Kami tahu Melbourne City adalah tim berkualitas dengan pengalaman internasional tinggi. Namun anak-anak dalam kondisi fisik prima dan kami bertekad menjaga tren positif di hadapan pendukung setia kami," tegas Bojan Hodak saat sesi konferensi pers pra-pertandingan.`,
    category: 'sport',
    categoryLabel: 'SPORT & E-SPORT',
    subCategory: 'SPORT & E-SPORT',
    imageUrl: '/images/articles/persib-melbourne.webp',
    imageAlt: 'Persib Siap Pertahankan Puncak Klasemen Grup E ACL 2 Lawan Melbourne City',
    imageCaption: 'Poster resmi laga krusial Persib Bandung vs Melbourne City di kancah ACL 2.',
    author: 'Tim Redaksi',
    reporter: 'Dedi Kusnadi',
    redaktur: 'Ujang Herlan',
    tags: ['#Persib', '#ACL2', '#MelbourneCity', '#Sport', '#Bobotoh'],
    readTime: '5 min read',
    isHero: false,
    isEditorsPick: true,
    badge: 'SPORT',
    createdAt: '2026-10-28T08:50:00.000Z',
    publishedDate: '28 Okt 2026 | 15:50 WIB',
  },

  // 6. SCIENCE
  {
    id: 'art-mikroplastik-laut-dalam',
    title: 'Mikroplastik Ditemukan hingga Kedalaman 2.450 Meter di Laut Indonesia',
    slug: 'mikroplastik-ditemukan-hingga-kedalaman-2450-meter-di-laut-indonesia',
    excerpt: 'Riset oseanografi terbaru mendeteksi partikel mikroplastik pada kedalaman palung laut selatan Jawa dekat Sukabumi.',
    content: `Tim ekspedisi riset oseanografi gabungan mempublikasikan temuan penting mengenai sebaran partikel mikroplastik yang kini terdeteksi hingga kedalaman 2.450 meter di palung laut perairan selatan Jawa, termasuk perairan lepas Sukabumi.

Analisis laboratorium terhadap sampel sedimen dan air laut dalam menunjukkan adanya fragmen serat sintetis polimer, polietilena, dan nilon. Partikel-partikel mikro ini diduga terbawa oleh arus sirkulasi laut dalam setelah mengalami degradasi berkepanjangan di permukaan.

Para peneliti menekankan perlunya langkah nyata pembatasan penggunaan plastik sekali pakai di daratan serta pengelolaan limbah sungai yang terintegrasi, mengingat keberadaan mikroplastik di kedalaman laut dapat mengancam stabilitas rantai makanan biota perairan yang selama ini belum terjamah.`,
    category: 'science',
    categoryLabel: 'SCIENCE',
    subCategory: 'SCIENCE',
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

  // 7. NOBAR TIMNAS (SPORT & KOMUNITAS)
  {
    id: 'art-nobar-timnas-sukabumi',
    title: 'Bukan Cuma Nonton, Nobar Timnas Indonesia di Sukabumi Jadi Ajang Silaturahmi Antar Komunitas',
    slug: 'bukan-cuma-nonton-nobar-timnas-indonesia-di-sukabumi-jadi-ajang-silaturahmi-antar-komunitas',
    excerpt: 'Antusiasme warga dan beragam komunitas di Sukabumi saat nonton bareng perjuangan Timnas Indonesia di laga internasional.',
    content: `Suasana semarak mewarnai berbagai sudut Kota dan Kabupaten Sukabumi saat ribuan warga berkumpul nonton bareng (nobar) laga Timnas Indonesia. Acara nobar yang dipusatkan di kafe, balai warga, hingga area publik ini bukan hanya menjadi ajang mendukung tim nasional kebanggaan, melainkan juga wadah mempererat silaturahmi antar komunitas pemuda, pecinta sepak bola, serta mendongkrak omzet pedagang kuliner lokal di sekitar lokasi nobar.`,
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

  // 8. RUANG TEMU GEN-Z (LIFESTYLE & KOMUNITAS)
  {
    id: 'art-genz-kreatif-sukabumi',
    title: 'Gen-Z dan Warga Lokal Sukabumi Rayakan Daya Kreativitas lewat Ruang Temu Komunitas',
    slug: 'gen-z-dan-warga-lokal-sukabumi-rayakan-daya-kreativitas-lewat-ruang-temu-komunitas',
    excerpt: 'Wadah kolaborasi kreatif anak muda Sukabumi menghadirkan ruang diskusi, workshop seni visual, dan pameran kriya independen.',
    content: `Kreativitas pemuda generasi Z di Sukabumi semakin menemukan wadahnya melalui inisiatif ruang temu komunitas kreatif. Berbagai kegiatan seperti diskusi wirausaha muda, pameran fotografi, dan lokakarya seni digital berhasil mengumpulkan ratusan pegiat muda daerah untuk saling bertukar ide dan menciptakan kolaborasi baru yang berdampak positif bagi kemajuan industri kreatif Sukabumi.`,
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
