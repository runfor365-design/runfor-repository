import type { MetadataRoute } from 'next'
import { getRaces } from '@/lib/races'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://runfor.kr'
  const races = await getRaces()
  const seenSlugs = new Set<string>()
  const raceEntries = races
    .filter((race) => {
      if (!race.slug || seenSlugs.has(race.slug)) return false
      seenSlugs.add(race.slug)
      return true
    })
    .map((race) => ({
      url: `${base}/race/${race.slug}`,
      lastModified: race.updatedAt ? new Date(race.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    ...raceEntries,
  ]
}
