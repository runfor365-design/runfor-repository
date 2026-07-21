import type { MetadataRoute } from 'next'
import { getRaces } from '@/lib/races'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://runfor.kr'
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    ...getRaces().map((race) => ({
      url: `${base}/race/${race.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
