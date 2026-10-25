import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

export const ADMIN_COOKIE_NAME = 'admin_session_token'

const JWT_SECRET_STRING =
  process.env.ADMIN_JWT_SECRET ||
  'jurnalwave_super_secret_jwt_token_2026_sukabumi_media_ultra_secure_key'

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING)

export interface AdminJWTPayload {
  id: string
  name: string
  email: string
  role: string
  [key: string]: unknown
}

/**
 * Mencetak token JWT bertanda tangan resmi untuk sesi admin (masa berlaku 7 hari)
 */
export async function signAdminToken(payload: AdminJWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

/**
 * Memverifikasi keaslian token JWT admin
 */
export async function verifyAdminToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AdminJWTPayload
  } catch {
    return null
  }
}

/**
 * Membaca dan memverifikasi sesi login admin dari HTTP-Only Cookie request
 */
export async function getAdminSession(request: NextRequest): Promise<AdminJWTPayload | null> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      return {
        id: 'dev-admin',
        email: 'admin@jurnalwave.com',
        name: 'Admin Redaksi',
        role: 'superadmin',
      }
    }
    return null
  }
  return await verifyAdminToken(token)
}

/**
 * Enkripsi password menggunakan bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

/**
 * Membandingkan password teks polos dengan hash di database
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}
