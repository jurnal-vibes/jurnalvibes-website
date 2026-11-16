import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'kiq4ox5q'
    const apiKey = process.env.CLOUDINARY_API_KEY || '531944874518224'
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '4KZlYWgaR_bkbNyIBjKIrTWihYE'

    let buffer: Buffer
    let filename = `article-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    let mimeType = 'image/jpeg'
    let extension = 'jpg'

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ success: false, message: 'Tidak ada file yang diunggah' }, { status: 400 })
      }
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      mimeType = file.type || 'image/jpeg'
      if (mimeType.includes('png')) extension = 'png'
      else if (mimeType.includes('webp')) extension = 'webp'
      else if (mimeType.includes('gif')) extension = 'gif'
    } else {
      // JSON body (base64 string)
      const body = await request.json()
      const rawData = body.file || body.image
      if (!rawData) {
        return NextResponse.json({ success: false, message: 'Data gambar tidak valid' }, { status: 400 })
      }

      if (typeof rawData === 'string' && rawData.startsWith('data:image/')) {
        const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        if (matches && matches.length === 3) {
          mimeType = matches[1]
          if (mimeType.includes('png')) extension = 'png'
          else if (mimeType.includes('webp')) extension = 'webp'
          buffer = Buffer.from(matches[2], 'base64')
        } else {
          buffer = Buffer.from(rawData.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        }
      } else {
        buffer = Buffer.from(rawData, 'base64')
      }
    }

    // Opsi 1: Upload ke Cloudinary CDN jika kredensial lengkap (ada apiSecret)
    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.round(Date.now() / 1000).toString()
        const folder = 'jurnalwave-articles'
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex')

        const cloudinaryForm = new FormData()
        cloudinaryForm.append('file', `data:${mimeType};base64,${buffer.toString('base64')}`)
        cloudinaryForm.append('api_key', apiKey)
        cloudinaryForm.append('timestamp', timestamp)
        cloudinaryForm.append('signature', signature)
        cloudinaryForm.append('folder', folder)

        const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cloudinaryForm,
        })

        if (cRes.ok) {
          const cData = await cRes.json()
          if (cData.secure_url) {
            // Otomatis terapkan transformasi WebP/AVIF Cloudinary (f_auto,q_auto) untuk kecepatan maksimal
            const optimizedUrl = cData.secure_url.includes('/upload/')
              ? cData.secure_url.replace('/upload/', '/upload/f_auto,q_auto/')
              : cData.secure_url

            return NextResponse.json({
              success: true,
              url: optimizedUrl,
              source: 'cloudinary',
            })
          }
        } else {
          const errText = await cRes.text()
          console.warn('Cloudinary upload warning (falling back to local):', errText)
        }
      } catch (cErr) {
        console.warn('Cloudinary upload error, falling back to local file:', cErr)
      }
    }

    // Opsi 2 (Fallback / Local): Simpan file langsung ke public/uploads/articles/
    const safeName = `${filename}.${extension}`
    const publicPath = join(process.cwd(), 'public', 'uploads', 'articles', safeName)
    await writeFile(publicPath, buffer)

    const fileUrl = `/uploads/articles/${safeName}`
    return NextResponse.json({
      success: true,
      url: fileUrl,
      source: 'local-filesystem',
    })
  } catch (err: any) {
    console.error('API Upload error:', err)
    return NextResponse.json(
      { success: false, message: 'Gagal mengunggah gambar: ' + (err?.message || err) },
      { status: 500 }
    )
  }
}
