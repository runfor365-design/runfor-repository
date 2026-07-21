import { geolocation } from '@vercel/functions'
import { NextResponse, type NextRequest } from 'next/server'
import { guessRegionFromGeo } from '@/lib/region-map'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { city, countryRegion } = geolocation(request)
  const region = guessRegionFromGeo(city, countryRegion)
  return NextResponse.json({ region })
}
