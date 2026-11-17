import crypto from 'crypto';

export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  publicId?: string;
  error?: string;
}

export async function uploadToCloudinary(options: {
  buffer?: Buffer;
  base64?: string;
  folder?: string;
  mimeType?: string;
}): Promise<CloudinaryUploadResult> {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    'kiq4ox5q';
  const apiKey = process.env.CLOUDINARY_API_KEY || '531944874518224';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '4KZlYWgaR_bkbNyIBjKIrTWihYE';

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      url: '',
      error: 'Konfigurasi kredensial Cloudinary belum lengkap',
    };
  }

  let finalBase64 = '';
  let finalMime = options.mimeType || 'image/jpeg';

  if (options.base64) {
    const raw = options.base64.trim();
    if (raw.startsWith('data:')) {
      const match = raw.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (match && match.length === 3) {
        finalMime = match[1];
        finalBase64 = match[2];
      } else {
        finalBase64 = raw.replace(/^data:[^;]+;base64,/, '');
      }
    } else {
      finalBase64 = raw;
    }
  } else if (options.buffer) {
    finalBase64 = options.buffer.toString('base64');
  } else {
    return {
      success: false,
      url: '',
      error: 'Tidak ada data file atau base64 yang diberikan',
    };
  }

  try {
    const timestamp = Math.round(Date.now() / 1000).toString();
    const folder = options.folder || 'jurnalwave-uploads';
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    const form = new FormData();
    form.append('file', `data:${finalMime};base64,${finalBase64}`);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp);
    form.append('signature', signature);
    form.append('folder', folder);

    const isVideo = finalMime.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        url: '',
        error: `Cloudinary error ${res.status}: ${errText}`,
      };
    }

    const data = await res.json();
    let optimizedUrl = data.secure_url || data.url;

    // Tambahkan transformasi otomatis WebP/AVIF (f_auto,q_auto) untuk gambar
    if (!isVideo && optimizedUrl && optimizedUrl.includes('/upload/')) {
      optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    return {
      success: true,
      url: optimizedUrl,
      publicId: data.public_id,
    };
  } catch (err) {
    return {
      success: false,
      url: '',
      error: (err as any)?.message || String(err),
    };
  }
}

/**
 * Helper untuk mengubah URL gambar/lampiran apapun:
 * Jika Base64, otomatis unggah ke Cloudinary CDN.
 * Jika sudah URL biasa (http/https), kembalikan apa adanya.
 */
export async function ensureCloudinaryUrl(
  inputUrl?: string | null,
  folder = 'jurnalwave-media'
): Promise<string> {
  if (!inputUrl || !inputUrl.trim()) return '';
  const trimmed = inputUrl.trim();

  // Jika bukan base64, kembalikan URL yang ada
  if (!trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Jika Base64, upload ke Cloudinary CDN
  try {
    const res = await uploadToCloudinary({ base64: trimmed, folder });
    if (res.success && res.url) {
      return res.url;
    }
  } catch (err) {
    console.warn('Gagal mengunggah base64 ke Cloudinary CDN:', err);
  }

  return trimmed;
}
