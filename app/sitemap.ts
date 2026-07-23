import type { MetadataRoute } from 'next'
import { getRaces } from '@/lib/races'

/**
 * 원본 데이터(data/races.json)에는 수정 시각(updatedAt) 필드가 없어 lastModified는
 * 임의로 채우지 않는다. 실제 수정 이력 필드가 생기면 그때 race별로 넣는다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://runfor.kr'
  const seenSlugs = new Set<string>()
  const raceEntries = getRaces()
    .filter((race) => {
      if (!race.slug || seenSlugs.has(race.slug)) return false
      seenSlugs.add(race.slug)
      return true
    })
    .map((race) => ({
      url: `${base}/race/${race.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    ...raceEntries,
  ]
}
