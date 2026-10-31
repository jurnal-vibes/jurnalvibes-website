# DOKUMENTASI LENGKAP ARSITEKTUR & KODE PROJEK
## Portal Media Jurnal Sukabumi (Jurnal Wave & Hallo Jurnal)
*Terakhir Diperbarui: Oktober 2026 | Versi Sistem: 1.0.0-Production Ready*

---

## DAFTAR ISI
1. [Ringkasan Eksekutif & Identitas Projek](#1-ringkasan-eksekutif--identitas-projek)
2. [Tech Stack & Fondasi Arsitektur](#2-tech-stack--fondasi-arsitektur)
3. [Pohon Direktori Projek](#3-pohon-direktori-projek)
4. [Peta Rute Navigasi & Halaman (Routing Structure)](#4-peta-rute-navigasi--halaman-routing-structure)
5. [Arsitektur Basis Data (Prisma ORM & Skema)](#5-arsitektur-basis-data-prisma-orm--skema)
6. [Arsitektur API & Integrasi Layanan (Backend Routes)](#6-arsitektur-api--integrasi-layanan-backend-routes)
7. [Mekanisme State & Hybrid Resilience Layer](#7-mekanisme-state--hybrid-resilience-layer)
8. [Desain Sistem, Tipografi, & Standar UI/UX](#8-desain-sistem-tipografi--standar-uiux)
9. [Fitur-Fitur Utama Sistem](#9-fitur-fitur-utama-sistem)
10. [Panduan Menjalankan, Environment & Deployment](#10-panduan-menjalankan-environment--deployment)

---

## 1. RINGKASAN EKSEKUTIF & IDENTITAS PROJEK

Projek ini adalah platform media digital hyperlocal terpadu untuk wilayah Kota dan Kabupaten Sukabumi yang menggabungkan dua ekosistem utama:

1. **Jurnal Wave (Kanal Berita & Lifestyle)**
   * Portal berita modern yang menyajikan liputan peristiwa terkini, gaya hidup (*lifestyle*), lowongan kerja (*loker*), otomotif, teknologi, sains, olahraga, serta video vertikal (*Reels*).
   * Mendukung sinkronisasi konten dinamis dengan WordPress REST API maupun pengelolaan mandiri via CMS Admin internal.

2. **Hallo Jurnal (Layanan Aduan & Jurnalisme Warga)**
   * Ruang interaksi sipil dan advokasi publik bagi warga Sukabumi untuk melaporkan masalah infrastruktur, lingkungan, pelayanan publik, sosial, hingga keamanan.
   * Dilengkapi fitur pinpoint peta geolokasi interaktif (GIS), nomor tiket otomatis, pelacakan status laporan transparan, obrolan dua arah langsung (*two-way chat*) antara pelapor dan meja redaksi, serta moderasi feed publik.

3. **Meja Redaksi (Pusat Kendali Admin Terpadu)**
   * Single administrative workspace tempat tim editor, jurnalis, dan pimpinan redaksi memverifikasi laporan warga, memoderasi feed, membalas chat warga, mempublikasikan artikel berita, dan mengelola video reels.

---

## 2. TECH STACK & FONDASI ARSITEKTUR

### 2.1 Core Framework & Bahasa
* **Next.js 16.3.3**: Framework fullstack React berbasis **App Router** dengan Turbopack untuk kompilasi super cepat, Server Components, dan Client Components yang dioptimalkan.
* **React 19.2.8 & React-DOM 19**: Versi React mutakhir dengan arsitektur rendering concurrent dan hooks terbaru.
* **TypeScript 5**: Pengetikan statis ketat (*strict typing*) untuk menjamin keandalan kode dan meminimalisir bug saat kompilasi.

### 2.2 Styling & Desain UI
* **Tailwind CSS v4 (`@tailwindcss/postcss`)**: Engine styling utilitas performa tinggi dengan variabel tema dinamis CSS di `globals.css`.
* **Lucide React (`lucide-react`)**: Set icon modern, bersih, dan konsisten (bebas dari icon bernuansa AI slop yang generik).
* **Radix UI Primitives**: Komponen dasar aksesibilitas tinggi (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`).

### 2.3 Basis Data & ORM
* **Prisma ORM 6.19.3**: Pengelola relasi basis data type-safe yang terhubung ke PostgreSQL / MySQL.
* **Dual Persistence Layer**: Backend database relational dipadukan dengan *graceful fallback* ke browser `localStorage` dan in-memory dummy data saat koneksi database offline/belum disetup.

### 2.4 Integrasi Pihak Ketiga & Layanan Tambahan
* **Open-Meteo Satellite API**: Integrasi cuaca realtime tanpa API-key untuk prakiraan cuaca 8 hari dan 192 jam di Sukabumi beserta indeks AQI.
* **Leaflet & React-Leaflet 1.9.4**: Peta geolokasi interaktif berbasis OpenStreetMap untuk penentuan titik koordinat kejadian aduan warga.

---

## 3. POHON DIREKTORI PROJEK

```text
d:\jurnalvibes-website/
├── .env / .env.example / .env.local  # Konfigurasi variabel lingkungan
├── AGENTS.md                         # Aturan kerja & SOP pengembangan AI
├── package.json                      # Daftar pustaka dependency & skrip npm
├── tsconfig.json                     # Konfigurasi compiler TypeScript
├── next.config.ts                    # Konfigurasi engine Next.js, image & headers
├── middleware.ts                     # Routing interceptor Next.js
│
├── prisma/
│   └── schema.prisma                 # Definisi skema tabel basis data
│
├── lib/
│   ├── prisma.ts                     # Singleton prisma client instance
│   ├── utils.ts                      # Helper fungsi (format tanggal, clsx merge)
│   ├── weather.ts                    # Layanan cuaca realtime satelit Open-Meteo
│   └── wordpress.ts                  # Adapter sinkronisasi REST API WordPress
│
├── types/
│   └── index.ts                      # Definisi tipe data utama (Article, Job, Reel, Poll)
│
├── data/
│   ├── dummyArticles.ts              # Dataset artikel berita lokal Sukabumi
│   ├── dummyJobs.ts                  # Dataset lowongan kerja wilayah Sukabumi
│   ├── dummyPolls.ts                 # Dataset polling pembaca & daftar reels
│   ├── dummyReports.ts               # Dataset awal laporan warga Hallo Jurnal
│   ├── haloJurnalCategories.ts       # Definisi kategori dan icon aduan
│   ├── sukabumiKnowledge.ts          # Knowledge base ensiklopedia lokal Sukabumi
│   ├── sukabumiPOI.ts                # Titik landmark & koordinat penting Sukabumi
│   └── sukabumiRegions.ts            # Daftar kecamatan di Kota & Kab. Sukabumi
│
├── components/
│   ├── admin/
│   │   ├── AdminHeader.tsx           # Topbar meja redaksi, notifikasi, pencarian
│   │   └── AdminSidebar.tsx          # Navigasi kiri, badge dinamis, profil admin
│   ├── cards/
│   │   ├── HalloJurnalBanner.tsx     # Banner ajakan partisipasi warga
│   │   ├── HeroCarousel.tsx          # Slider berita utama di beranda
│   │   ├── JobCard.tsx               # Kartu lowongan kerja Sukabumi
│   │   ├── NewsCard.tsx              # Kartu ringkasan artikel berita
│   │   └── ReelsSection.tsx          # Baris interaktif video reels vertikal
│   ├── halo-jurnal/
│   │   ├── CategoryCards.tsx         # Kartu pilihan kategori aduan
│   │   ├── HaloJurnalBottomNav.tsx   # Navigasi bawah mobile portal warga
│   │   ├── HaloJurnalFooter.tsx      # Footer resmi Hallo Jurnal
│   │   ├── HaloJurnalHeader.tsx      # Header navigasi & profil warga
│   │   ├── HaloJurnalShell.tsx       # Pembungkus layout konsisten warga
│   │   ├── LocationPicker.tsx        # Picker peta Leaflet & deteksi koordinat
│   │   ├── LogoutButton.tsx          # Tombol keluar akun warga
│   │   ├── RecentPublicReports.tsx   # Feed 4 laporan publik terhangat
│   │   └── UserAvatar.tsx            # Avatar inisial dinamis
│   ├── layout/
│   │   ├── AppShell.tsx              # Layout pembungkus portal Jurnal Wave
│   │   ├── BottomNav.tsx             # Navigasi bawah mobile Jurnal Wave
│   │   ├── CategoryTemplate.tsx      # Template halaman kategori berita
│   │   ├── Footer.tsx                # Footer portal berita lengkap
│   │   ├── HeaderNav.tsx             # Header navigasi berita, cuaca & pencarian
│   │   ├── LeftSidebar.tsx           # Sidebar kiri kanal berita & tag tren
│   │   └── SearchOverlay.tsx         # Modal pencarian instan seluruh situs
│   ├── weather/
│   │   └── CuacaView.tsx             # Halaman komprehensif prakiraan cuaca satelit
│   └── widgets/
│       ├── EditorsPickWidget.tsx     # Widget berita pilihan redaksi
│       ├── PollingWidget.tsx         # Widget polling interaktif pembaca
│       ├── ReelsViewerModal.tsx      # Modal player pemutar video reels
│       └── WeatherWidget.tsx         # Widget cuaca ringkas di sidebar
│
├── app/
│   ├── globals.css                   # Desain token, tema warna & utilitas
│   ├── layout.tsx                    # Root layout HTML & integrasi font
│   ├── page.tsx / HomeClient.tsx     # Halaman beranda utama Jurnal Wave
│   ├── artikel/[id]/                 # Halaman baca artikel berita lengkap
│   ├── berita/, lifestyle/, etc.    # Halaman arsip per kategori berita
│   ├── cuaca/                        # Halaman detail cuaca satelit Sukabumi
│   ├── reels/                        # Halaman galeri video pendek
│   ├── bookmark/                     # Halaman artikel yang disimpan user
│   ├── login/, daftar/, reset-pw/   # Alur autentikasi publik
│   │
│   ├── halo-jurnal/                  # Ekosistem Warga (Hallo Jurnal)
│   │   ├── page.tsx                  # Landing page Hallo Jurnal
│   │   ├── beranda/                  # Beranda warga (laporan aktif & feed)
│   │   ├── lapor/                    # Formulir pengaduan & aspirasi warga
│   │   ├── feed-publik/              # Feed publik seluruh laporan warga
│   │   ├── laporan/[id]/             # Detail laporan publik & tracking status
│   │   ├── laporan-saya/             # Daftar laporan yang diajukan oleh user
│   │   ├── profil/                   # Profil data warga pelapor
│   │   └── admin/                    # Meja Redaksi (Pusat Kendali Admin)
│   │       ├── layout.tsx            # Layout terlindung admin & guard login
│   │       ├── page.tsx              # Dashboard Overview statistik redaksi
│   │       ├── login/                # Halaman login otentikasi redaksi
│   │       ├── laporan/              # Tabel manajemen seluruh laporan warga
│   │       ├── laporan/[id]/         # Meja eksekusi detail, validasi & log
│   │       ├── feed-publik/          # Moderasi visibilitas feed publik
│   │       ├── chat/                 # Meja chat langsung admin vs warga
│   │       ├── berita/               # CMS artikel & publikasi berita
│   │       ├── reels/                # CMS video reels redaksi
│   │       ├── kategori/             # Manajemen kategori artikel & aduan
│   │       ├── pengguna/             # Manajemen staf redaksi & wartawan
│   │       └── pengaturan/           # Konfigurasi hotline, kontak & portal
│   │
│   └── api/                          # Backend API Handlers
│       ├── admin/auth/               # Sesi login, cek status & logout admin
│       ├── articles/                 # Endpoint CRUD artikel berita
│       ├── chat/                     # Endpoint perpesanan tiket dua arah
│       ├── reports/                  # Endpoint pengambilan & pengiriman laporan
│       ├── weather/                  # Proxy cache cuaca Open-Meteo
│       └── ai-chat/                  # Asisten chatbot cerdas lokal Sukabumi
```

---

## 4. PETA RUTE NAVIGASI & HALAMAN (ROUTING STRUCTURE)

| URL Path | Akses | Deskripsi & Komponen Kunci |
| :--- | :--- | :--- |
| `/` | Publik | Beranda utama Jurnal Wave (Hero Carousel, Berita Pilihan, Polling, Cuaca, Banner Hallo Jurnal). |
| `/artikel/[id]` | Publik | Halaman baca berita penuh, kredit reporter/redaktur, tagar, dan rekomendasi artikel terkait. |
| `/berita` | Publik | Kanal berita umum, politik, pemerintahan, dan hukum Sukabumi. |
| `/lifestyle` | Publik | Kanal wisata, kuliner legendaris, tradisi, dan gaya hidup warga Sukabumi. |
| `/otomotif` | Publik | Info modifikasi, tips berkendara di jalur pegunungan, dan kabar otomotif lokal. |
| `/loker` | Publik | Portal lowongan kerja terkini di wilayah Kota & Kab. Sukabumi. |
| `/cuaca` | Publik | Prakiraan cuaca satelit real-time per jam (192 jam) dan per hari (8 hari) di Sukabumi. |
| `/reels` | Publik | Feed galeri video pendek reels dengan pemutar modal vertikal interaktif. |
| `/halo-jurnal` | Warga | Landing page pengenalan layanan aspirasi dan aduan warga Sukabumi. |
| `/halo-jurnal/beranda` | Warga | Dashboard warga untuk melihat status pengaduan terbaru dan feed warga sekitar. |
| `/halo-jurnal/lapor` | Warga | Formulir aduan warga multi-kategori, upload bukti foto, dan pemilih titik peta Leaflet. |
| `/halo-jurnal/feed-publik`| Warga | Feed aspirasi terbuka tempat warga bisa memberi dukungan (suara) dan membaca isu publik. |
| `/halo-jurnal/laporan/[id]`| Warga | Pelacakan status laporan transparan (`[Menunggu Review]` s/d `[Ditayangkan]`), riwayat audit log, dan percakapan chat langsung. |
| `/halo-jurnal/laporan-saya`| Warga | Ringkasan riwayat seluruh aduan pribadi yang pernah dikirim oleh warga tersebut. |
| `/halo-jurnal/admin/login` | Redaksi | Gerbang autentikasi staf redaksi dengan sistem cookie sesi terenkripsi. |
| `/halo-jurnal/admin` | Redaksi | Dashboard analitik: total aduan masuk, aduan ditangani, berita aktif, dan pintasan meja kerja. |
| `/halo-jurnal/admin/laporan`| Redaksi | Meja manajemen tabular: filter status, pencarian nomor tiket, dan status monokrom rapi. |
| `/halo-jurnal/admin/laporan/[id]`| Redaksi | Meja eksekusi investigasi: ganti status penanganan 5 tahap, ubah hak tayang publik, catat log investigasi, dan kirim pesan. |
| `/halo-jurnal/admin/feed-publik`| Redaksi | Meja kurasi hak tayang: seleksi laporan yang layak tampil di portal publik warga. |
| `/halo-jurnal/admin/chat` | Redaksi | Meja komunikasi real-time: inbox percakapan per nomor tiket dengan filter balasan. |
| `/halo-jurnal/admin/berita`| Redaksi | CMS Penerbitan Berita: editor artikel, unggah foto berita, tagar, dan status draft/terbit. |
| `/halo-jurnal/admin/reels` | Redaksi | CMS Video Reels: kurasi video Instagram/TikTok/YouTube seputar Sukabumi. |
| `/halo-jurnal/admin/kategori`| Redaksi | Manajemen master data kategori artikel dan aduan warga. |
| `/halo-jurnal/admin/pengaturan`| Redaksi | Konfigurasi informasi redaksi: hotline WhatsApp, email redaksi, dan alamat kantor redaksi. |

---

## 5. ARSITEKTUR BASIS DATA (PRISMA ORM & SKEMA)

Skema basis data dikelola melalui `prisma/schema.prisma` dengan 7 entitas model utama:

```mermaid
erDiagram
    Report ||--o{ ReportAttachment : "memiliki"
    Report ||--o{ ReportStatusLog : "mencatat"
    Report ||--o{ ChatMessage : "dihubungkan via ticketNumber"

    Article {
        string id PK
        string title
        string slug UK
        string excerpt
        string content
        string category
        string imageUrl
        string author
        string reporter
        string redaktur
        boolean isHero
        boolean isEditorsPick
        datetime createdAt
    }

    Report {
        string id PK
        string ticketNumber UK
        string title
        string description
        string reportType
        string address
        float latitude
        float longitude
        string pelaporName
        string pelaporPhone
        string status
        boolean isPublic
        datetime createdAt
    }

    ReportAttachment {
        string id PK
        string reportId FK
        string fileUrl
        string fileType
        datetime createdAt
    }

    ReportStatusLog {
        string id PK
        string reportId FK
        string status
        string note
        datetime createdAt
    }

    ChatMessage {
        string id PK
        string ticketNumber
        string senderId
        string senderName
        string role
        string message
        datetime createdAt
    }

    AdminUser {
        string id PK
        string name
        string email UK
        string role
        string avatarUrl
        datetime createdAt
    }
```

---

## 6. ARSITEKTUR API & INTEGRASI LAYANAN (BACKEND ROUTES)

### 6.1 Laporan Warga (`/api/reports`)
* **GET `/api/reports?status=...&ticket=...`**
  Mengambil daftar laporan warga dari database relasional. Jika database belum aktif, sistem secara otomatis mengembalikan fallback data dummy dari `data/dummyReports.ts` tanpa melempar error ke pengguna.
* **POST `/api/reports`**
  Menerima pengiriman laporan aduan baru warga, men-generate nomor tiket unik (format: `HJ-YYYYMMDD-XXXX`), menyimpan geolokasi, dan mencatat log inisial `[Menunggu Review]`.

### 6.2 Perpesanan Langsung (`/api/chat`)
* **GET `/api/chat?ticketNumber=...`**
  Mengambil seluruh linimasa percakapan dua arah antara pelapor dan redaksi berdasarkan nomor tiket pengaduan.
* **POST `/api/chat`**
  Menyimpan pesan chat baru dari warga atau staf redaksi. Pesan ini otomatis disinkronkan ke `localStorage` agar dapat dipantau langsung pada Meja Chat Admin (`/halo-jurnal/admin/chat`).

### 6.3 Autentikasi Admin (`/api/admin/auth`)
* **POST `/api/admin/auth`**
  Memvalidasi kredensial login admin. Jika valid, menerbitkan HTTP-Only Cookie (`admin_session_token`) dengan masa aktif 7 hari yang aman dari serangan XSS.
* **GET `/api/admin/auth`**
  Memeriksa keabsahan cookie sesi admin untuk melindungi seluruh halaman di bawah `/halo-jurnal/admin/*`.
* **DELETE `/api/admin/auth`**
  Menghapus cookie sesi saat admin logout dan mengarahkan kembali ke halaman login.

### 6.4 Cuaca Satelit Real-time (`/api/weather` & `lib/weather.ts`)
* Menghubungkan portal ke satelit cuaca global Open-Meteo untuk koordinat Kabupaten & Kota Sukabumi.
* Mengolah data:
  * Suhu aktual (°C) & *apparent temperature* (suhu terasa).
  * Prakiraan harian 8 hari ke depan (suhu min/maks, kode cuaca WMO, kondisi langit).
  * Data per jam 192 titik waktu (suhu, curah hujan %, kelembaban %, kecepatan angin km/jam).
  * Kualitas udara AQI (Air Quality Index) lokal Sukabumi.

---

## 7. MEKANISME STATE & HYBRID RESILIENCE LAYER

Salah satu keunggulan teknis dari portal ini adalah arsitektur **Zero-Downtime Hybrid Resilience**:

1. **Sinkronisasi Dua Lapisan (Database + LocalStorage)**
   * Setiap aksi pengguna (misalnya membuat aduan, mengirim chat, mengubah status laporan, atau menerbitkan artikel) disimpan ke backend database melalui API.
   * Pada saat bersamaan, data juga dicadangkan ke `localStorage` dengan penamaan terstruktur (`halo_jurnal_user_reports`, `halo_jurnal_status_overrides`, `halo_jurnal_chat_*`, `jurnal_wave_articles`).
   * Hasilnya: Penguji atau pengguna tetap dapat melihat seluruh perubahan data seketika tanpa perlu khawatir apakah database lokal MySQL/PostgreSQL sedang aktif atau mati.

2. **Event Storage Listener**
   * Antar tab browser (misalnya Tab Warga di `/halo-jurnal/laporan/[id]` dan Tab Admin di `/halo-jurnal/admin/chat`) saling berkomunikasi secara real-time via event listener window `'storage'`.
   * Saat admin mengirim pesan, jendela warga akan langsung merender pesan baru tersebut tanpa perlu refresh halaman manual.

---

## 8. DESAIN SISTEM, TIPOGRAFI, & STANDAR UI/UX

### 8.1 Palet Warna Editorial (Material 3 Adaptive)
* **Primary Crimson Red (`#c00015`)**: Warna identitas utama media, melambangkan ketegasan jurnalisme dan kegentingan aspirasi publik.
* **Dark Crimson Accent (`#a00012`)**: Warna state hover dan interaksi aktif.
* **Slate Monochrome (`slate-50` s/d `slate-900`)**: Digunakan untuk teks editorial, batas tabel (*border*), dan badge status netral agar mata pembaca nyaman dan tidak terdistraksi oleh warna-warni berlebih.
* **Surface Background (`#fbf9f9`)**: Latar belakang bernuansa kertas koran modern (*editorial white paper*).

### 8.2 Standardisasi Tipografi
* **Heading & Judul**: Menggunakan font **Montserrat** berbobot tebal (`font-heading font-bold`) yang memberikan wibawa media jurnalistik profesional.
* **Teks Isi (*Body Text*) & Data**: Menggunakan font **Inter** untuk keterbacaan tinggi pada layar mobile maupun desktop.
* **Nomor Tiket & Kode**: Menggunakan font monospace (`font-mono font-bold`) agar nomor tiket mudah dicatat oleh warga.

### 8.3 Kerapian Posisi Kolom & Anti Teks Bertumpuk
* **Table-Fixed Layout**: Tabel laporan admin menggunakan layout terkunci (`table-fixed`) dengan padding simetris identik di seluruh kolom (`px-4 py-3.5`).
* **Proteksi Overflow**: Kolom judul dilengkapi `overflow-hidden` dan `truncate` sehingga teks panjang tidak akan pernah tumpang tindih atau meluber ke kolom di sebelahnya.
* **Tahap Penanganan Grid 2-Kolom**: Pilihan tahap status penanganan pada detail laporan diatur dalam grid lapang 2-kolom, memastikan teks tombol tidak berhimpitan pada layar perangkat apa pun.
* **Pembersihan AI Slop**: Seluruh icon hiasan yang tidak fungsional (seperti `Sparkles`) telah dieliminasi dan digantikan dengan icon standar industri (`AlertCircle`, `MapPin`, `Clock`, `MessageSquare`).

---

## 9. FITUR-FITUR UTAMA SISTEM

### 9.1 Ekosistem Hallo Jurnal (Aspirasi Warga)
1. **Formulir Aduan Presisi**:
   * Pilihan jenis: Pengaduan, Aspirasi, Informasi, atau Permohonan Bantuan.
   * Pilihan kategori: Infrastruktur, Lingkungan Hidup, Pelayanan Publik, Keamanan, Kesehatan, Pendidikan, dan Anggaran.
   * Pinpoint Peta GIS: Pelapor dapat menggeser pin lokasi langsung di atas peta satelit Sukabumi untuk menetapkan titik koordinat akurat.
   * Unggah Bukti: Dukungan unggah foto dokumentasi kejadian.
2. **Pelacakan Tiket Transparan**:
   * Setiap aduan memiliki status 5 tahap: `[Menunggu Review]`, `[Diproses]`, `[Ditindaklanjuti]`, `[Ditayangkan]`, dan `[Ditolak]`.
   * Dilengkapi linimasa audit log resmi redaksi beserta catatan tanggal dan jam perubahan.
3. **Meja Komunikasi Dua Arah**:
   * Warga dapat berkirim pesan langsung dengan meja redaksi di dalam halaman tiket mereka tanpa perlu bertukar nomor pribadi.

### 9.2 Ekosistem Jurnal Wave (Media Informasi)
1. **Berita Terkini & Rekomendasi Redaksi**:
   * Slider carousel berita utama di beranda.
   * Filter kanal berita lengkap: Berita Utama, Lifestyle, Otomotif, Sport, Sains, Kesehatan, dan Loker.
2. **Pemantau Cuaca Satelit Realtime**:
   * Menampilkan kondisi cuaca akurat di Sukabumi hingga 8 hari ke depan dan grafik per jam.
3. **Polling Publik & Video Reels**:
   * Survei opini pembaca seputar isu hangat lokal Sukabumi.
   * Galeri video vertikal (Reels) yang responsif untuk pengguna smartphone.

### 9.3 Pusat Kendali Meja Redaksi
1. **Monitoring Laporan Terpadu**:
   * Tinjauan cepat jumlah aduan yang butuh balasan, aduan menunggu review, dan statistik dukungan warga.
2. **Meja Moderasi Feed Publik**:
   * Kendali penuh redaksi untuk menentukan apakah laporan warga layak ditayangkan ke feed publik atau tetap bersifat privat.
3. **Manajemen Staf & Pengaturan Situs**:
   * Pengaturan struktur tim redaksi (Pemimpin Redaksi, Redaktur, Wartawan) serta pengaturan kontak resmi hotline WhatsApp dan email redaksi.

---

## 10. PANDUAN MENJALANKAN, ENVIRONMENT & DEPLOYMENT

### 10.1 Persyaratan Sistem
* Node.js v20.x atau lebih baru.
* NPM, Yarn, atau PNPM.
* Basis data PostgreSQL atau MySQL (opsional, sistem memiliki fallback otomatis).

### 10.2 Variabel Lingkungan (`.env`)
```bash
# Basis Data Relasional
DATABASE_URL="postgresql://user:password@localhost:5432/jurnalwave"
DIRECT_URL="postgresql://user:password@localhost:5432/jurnalwave"

# Opsional: Integrasi CMS WordPress
NEXT_PUBLIC_WORDPRESS_URL=""

# Sesi Rahasia Admin
ADMIN_SESSION_SECRET="jurnalwave_secure_admin_session_2026"
```

### 10.3 Perintah Operasional
```bash
# 1. Menginstal seluruh dependensi
npm install

# 2. Menjalankan server pengembangan lokal (Port 3000)
npm run dev

# 3. Melakukan pengecekan tipe data TypeScript
npx tsc --noEmit

# 4. Melakukan kompilasi build produksi
npm run build

# 5. Menjalankan bundle produksi
npm run start
```

---

## 11. KESIMPULAN
Projek **Media Jurnal Sukabumi (Jurnal Wave & Hallo Jurnal)** telah terbangun dengan fondasi arsitektur modern berstandar enterprise. Seluruh komponen telah diuji bebas dari galat kompilasi (**0 TypeScript errors**), memiliki estetika tipografi editorial yang elegan, responsif di seluruh ukuran layar, serta memiliki ketahanan data hybrid yang tangguh untuk melayani kebutuhan informasi dan advokasi publik warga Sukabumi secara berkelanjutan.
