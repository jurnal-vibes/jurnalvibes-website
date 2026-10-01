import { NextRequest, NextResponse } from 'next/server'
import { fetchLiveSukabumiWeather } from '@/lib/weather'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const loc = searchParams.get('loc') || 'kota'
    const weatherData = await fetchLiveSukabumiWeather(loc)
    return NextResponse.json(weatherData)
  } catch (error: any) {
    console.error('Weather API Route Error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat cuaca Sukabumi' },
      { status: 500 }
    )
  }
}
