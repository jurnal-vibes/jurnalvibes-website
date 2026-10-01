import { NextRequest, NextResponse } from 'next/server'
import { DUMMY_ARTICLES } from '@/data/dummyArticles'

const SYSTEM_PROMPT = `Anda adalah "Jurnal Vibes AI", asisten virtual resmi untuk portal berita Jurnal Vibes dan layanan pengaduan warga Halo Jurnal Sukabumi.

Aturan Penting Format & Gaya Menjawab:
1. DILARANG KERAS menggunakan simbol bintang (*) sama sekali. Jangan gunakan tanda bintang tunggal (*) maupun ganda (**) untuk mencetak tebal, miring, atau penanda daftar. Tulis teks secara bersih dan mengalir natural.
2. Jika memberikan daftar rekomendasi atau poin-poin, selalu gunakan format rapi:
   - Nama Tempat atau Poin: Penjelasan ringkas dan jelas.
   (Gunakan tanda titik dua ':' setelah nama tempat atau judul poin agar mudah dipindai pembaca).
3. Gunakan emotikon HANYA BILA SANGAT DIPERLUKAN (maksimal 1 emotikon di pembuka atau penutup saja). Jangan menaburkan banyak emotikon di setiap kalimat.
4. Gaya Bahasa:
   - Jawab secara langsung to the point, ringkas, dan mudah dipahami dalam sekali baca.
   - Gunakan bahasa percakapan sehari-hari yang santai, jelas, dan ramah seperti mengobrol dengan warga Sukabumi yang berpengetahuan luas.
   - Hindari kata-kata asing atau istilah rumit yang tidak perlu.
5. Akurasi Lokasi Sukabumi (ANTI-HALUSINASI, SANGAT PENTING):
   - JANGAN MENGARANG LOKASI! Jawablah secara faktual sesuai letak geografis Sukabumi yang sebenarnya:
     • Kawasan Cikole / Selabintana: Dataran tinggi berhawa sejuk pegunungan. Tempat ngopi di sini misalnya Habit Coffee, Kopi D'Cikole, Selabintana Coffee, Kopi Nako Kebon Jati.
     • Mokopi Sukabumi: Berada di area perkotaan/jalan protokol (seperti Jalan Bhayangkara dan Jalan Tipar), BUKAN di kawasan Cikole. Jika ditanya apakah ada Mokopi di Cikole, jelaskan dengan jujur bahwa tidak ada Mokopi di Cikole.
     • Kawasan Dago Sukabumi (Jl. Ir. H. Juanda): Pusat jajanan/street food di pusat kota.
     • Kuliner Legendaris: Mochi Lampion di Gang Kaswari, Bubur Ayam Bunut di Jalan Siliwangi.
   - Jika Anda tidak yakin dengan lokasi cabang suatu tempat, katakan dengan jujur dan sarankan memeriksa Google Maps atau artikel di Jurnal Vibes. JANGAN MENGARANG LOKASI PALSU.
6. Pengetahuan Layanan:
   - Info lowongan kerja Sukabumi ada di menu /loker.
   - Pengaduan fasilitas umum (jalan rusak, sampah, lampu PJU mati) di Halo Jurnal: pandu warga melapor di /halo-jurnal/lapor dan cek status di /halo-jurnal/laporan-saya.`

// Smart Fallback jika API key belum diisi atau kuota habis
function generateSmartFallback(query: string): string {
  const lower = query.toLowerCase()

  // 1. Pengaduan & Halo Jurnal
  if (lower.includes('lapor') || lower.includes('aduan') || lower.includes('rusak') || lower.includes('sampah') || lower.includes('jalan') || lower.includes('lampu') || lower.includes('pju') || lower.includes('halo jurnal') || lower.includes('hallo jurnal') || lower.includes('pengaduan')) {
    return '📢 **Layanan Pengaduan Halo Jurnal:**\n\nUntuk menyampaikan keluhan seperti jalan berlubang, tumpukan sampah, atau fasilitas umum rusak:\n1. Kunjungi menu **/halo-jurnal/lapor**\n2. Masukkan judul laporan dan pilih kecamatan di Sukabumi\n3. Unggah bukti foto/video kondisi lapangan\n4. Kirim laporan dan pantau status penanganannya di **/halo-jurnal/laporan-saya**.\n\nLaporan kamu akan segera diverifikasi tim redaksi dan diteruskan ke instansi dinas terkait!'
  }

  if (lower.includes('kopi') || lower.includes('cikole') || lower.includes('kuliner') || lower.includes('makan') || lower.includes('nongkrong')) {
    return '☕ **Rekomendasi Kuliner & Ngopi di Sukabumi:**\n\n• **Kawasan Cikole & Dago Sukabumi:** Pusat kafe hits kekinian dengan konsep industrial & outdoor yang nyaman untuk kerja atau kumpul santai.\n• **Kuliner Khas Legendaris:** Jangan lewatkan Mochi Lampion Kaswari, Bubur Ayam Bunut Siliwangi, dan Mie Goreng Sukabumi.\n\nCek ulasan lengkap dan resep kuliner di kategori **Lifestyle** Jurnal Vibes!'
  }

  if (lower.includes('loker') || lower.includes('kerja') || lower.includes('lowongan') || lower.includes('karir')) {
    return '💼 **Info Lowongan Kerja Sukabumi:**\n\nJurnal Vibes rutin memperbarui informasi lowongan kerja di area Sukabumi dan sekitarnya (mulai dari F&B, Staff Digital, hingga Desain Grafis).\n\nKamu bisa melihat daftar lowongan terbaru dan kualifikasinya langsung di menu **/loker**!'
  }

  if (lower.includes('wisata') || lower.includes('liburan') || lower.includes('ciletuh') || lower.includes('pantai') || lower.includes('curug') || lower.includes('gunung')) {
    return '🏔️ **Rekomendasi Wisata Sukabumi:**\n\n• **Geopark Ciletuh Palabuhanratu:** Warisan dunia UNESCO dengan pemandangan amfiteater alam dan pantai eksotis.\n• **Situ Gunung Suspension Bridge:** Jembatan gantung terpanjang di Asia Tenggara di kaki Gunung Gede Pangrango.\n• **Curug Cikaso & Selabintana:** Pilihan tepat untuk wisata alam air terjun dan udara sejuk pegunungan.'
  }

  if (lower.includes('cuaca') || lower.includes('hujan') || lower.includes('panas')) {
    return '⛅ **Prakiraan Cuaca Sukabumi:**\n\nKamu bisa memantau prakiraan cuaca realtime, suhu udara, kelembaban, dan potensi hujan di Kota maupun Kabupaten Sukabumi melalui halaman **/cuaca**.'
  }

  if (lower.includes('berita') || lower.includes('terkini') || lower.includes('hari ini') || lower.includes('update')) {
    return '📰 **Berita Terkini Sukabumi & Nasional:**\n\nJurnal Vibes menyajikan liputan hangat dari berbagai kategori: **Tech, Science, Sport, Lifestyle, Otomotif, dan Health**. Telusuri beranda kami untuk membaca laporan investigasi dan berita terbaru hari ini!'
  }

  if (lower.includes('halo') || lower.includes('hai') || lower.includes('pagi') || lower.includes('siang') || lower.includes('malam') || lower.includes('sampurasun')) {
    return 'Halo! Sampurasun! 👋 Selamat datang di Jurnal Vibes AI. Ada yang bisa saya bantu terkait berita Sukabumi, kuliner hits, info loker, atau cara lapor aduan di Halo Jurnal?'
  }

  return `✨ Terima kasih atas pertanyaannya! Saya adalah asisten cerdas Jurnal Vibes. 

Kamu bisa menanyakan berbagai hal seputar:
• 📰 **Berita Terkini & Kategori Populer**
• ☕ **Rekomendasi Kuliner & Wisata Sukabumi**
• 💼 **Info Lowongan Kerja (/loker)**
• 📢 **Panduan Melapor Fasilitas Umum di Halo Jurnal (/halo-jurnal)**

Ada topik spesifik yang ingin kamu ketahui lebih lanjut?`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, history } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Pesan tidak boleh kosong' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    // Jika API Key belum diisi, gunakan Smart Fallback Engine yang kaya informasi
    if (!apiKey || apiKey.trim() === '') {
      const fallbackReply = generateSmartFallback(message)
      return NextResponse.json({
        reply: fallbackReply,
        source: 'smart-fallback',
        notice: 'Menggunakan smart engine lokal. Tambahkan GEMINI_API_KEY di .env.local untuk Gemini AI penuh.'
      })
    }

    // Format chat history untuk Gemini REST API
    const formattedContents: Array<{
      role: 'user' | 'model'
      parts: Array<{ text: string }>
    }> = []

    if (Array.isArray(history)) {
      // Ambil maksimal 6 pesan terakhir untuk efisiensi context window
      const recentHistory = history.slice(-6)
      for (const msg of recentHistory) {
        if (msg.sender === 'user') {
          formattedContents.push({
            role: 'user',
            parts: [{ text: msg.text }]
          })
        } else if (msg.sender === 'ai') {
          formattedContents.push({
            role: 'model',
            parts: [{ text: msg.text }]
          })
        }
      }
    }

    // Masukkan pesan pengguna saat ini
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // Siapkan daftar artikel berita terbaru dari website untuk konteks dinamis AI (RAG)
    const recentArticlesList = DUMMY_ARTICLES.slice(0, 8)
      .map(
        (a, i) =>
          `${i + 1}. [Kategori ${a.category.toUpperCase()}] "${a.title}" (Link: /artikel/${a.id}) - ${a.excerpt}`
      )
      .join('\n')

    const dynamicSystemInstruction = `${SYSTEM_PROMPT}

Daftar Berita & Artikel Terkini yang Sedang Tayang di Jurnal Vibes:
${recentArticlesList}

(Bila pengunjung bertanya tentang berita terbaru, update hari ini, atau topik yang terkait berita di atas, sebutkan judul artikel dan berikan link rujukan /artikel/[id] agar pembaca bisa langsung membacanya).`

    // Panggil Google Gemini Flash-Lite API (respons instan, stabil, dan konsisten)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: dynamicSystemInstruction }]
        },
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048
        }
      })
    })

    if (!geminiRes.ok) {
      console.error('Gemini API Error:', geminiRes.status, await geminiRes.text())
      // Fallback anggun jika ada kendala di Gemini API
      const fallbackReply = generateSmartFallback(message)
      return NextResponse.json({
        reply: fallbackReply,
        source: 'smart-fallback',
        warning: 'Gemini API sedang sibuk, merespons dengan smart engine lokal.'
      })
    }

    const geminiData = await geminiRes.json()
    const replyText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      generateSmartFallback(message)

    return NextResponse.json({
      reply: replyText,
      source: 'gemini'
    })
  } catch (error: any) {
    console.error('AI Route Handler Error:', error)
    return NextResponse.json(
      {
        reply:
          'Maaf, terjadi gangguan sementara pada sistem AI. Silakan coba sesaat lagi atau gunakan menu navigasi untuk mencari informasi.',
        error: error.message
      },
      { status: 500 }
    )
  }
}
