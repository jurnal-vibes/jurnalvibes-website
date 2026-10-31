import nodemailer from 'nodemailer'

// Inisialisasi transporter Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'jurnalvibes2@gmail.com',
    pass: (process.env.SMTP_PASS || 'tfztbfaawstyqdby').replace(/\s+/g, ''),
  },
})

/**
 * Mengirimkan email OTP resmi untuk reset kata sandi warga
 */
export async function sendResetPasswordOtp(toEmail: string, otpCode: string, residentName?: string) {
  const senderAddress = process.env.SMTP_FROM || 'Hallo Jurnal Sukabumi <jurnalvibes2@gmail.com>'
  const displayName = residentName || 'Warga Sukabumi'

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode OTP Reset Kata Sandi - Hallo Jurnal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #c00015; padding: 24px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                Hallo Jurnal
              </h1>
              <p style="margin: 4px 0 0 0; color: #fee2e2; font-size: 12px; font-weight: 500;">
                Aspirasi &amp; Aduan Warga Sukabumi
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #0f172a;">
                Halo, ${displayName}!
              </p>
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun warga Anda di <strong>Hallo Jurnal</strong>. Gunakan kode verifikasi (OTP) berikut untuk melanjutkan:
              </p>

              <!-- OTP Box -->
              <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                  Kode Verifikasi OTP Anda
                </span>
                <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; color: #c00015; letter-spacing: 8px; display: inline-block;">
                  ${otpCode}
                </span>
                <span style="display: block; font-size: 11px; color: #64748b; margin-top: 8px;">
                  Berlaku selama <strong>10 menit</strong>
                </span>
              </div>

              <!-- Peringatan Keamanan -->
              <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; color: #9f1239; line-height: 1.5;">
                  <strong>Penting:</strong> Jangan pernah memberikan kode OTP ini kepada siapa pun, termasuk pihak yang mengatasnamakan tim redaksi Hallo Jurnal.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b;">
                Jika Anda tidak merasa meminta reset kata sandi ini, silakan abaikan email ini. Akun Anda tetap aman.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #475569;">
                PT Media Jurnal Sukabumi
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                Perum Bukit Randu Asri, Cibadak, Kabupaten Sukabumi, Jawa Barat<br>
                Layanan Aspirasi, Aduan Publik, &amp; Jurnalisme Warga
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const mailOptions = {
    from: senderAddress,
    to: toEmail,
    subject: `[Hallo Jurnal] ${otpCode} adalah Kode OTP Reset Kata Sandi Anda`,
    text: `Halo, ${displayName}. Kode OTP reset kata sandi Anda di Hallo Jurnal adalah: ${otpCode}. Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.`,
    html: htmlContent,
  }

  const info = await transporter.sendMail(mailOptions)
  return info
}
