import type { MetadataRoute } from 'next'

/**
 * 네이버/구글에 메인 도메인 색인이 정상적으로 잡히는지 먼저 확인하기 위해
 * 대회 상세 993건은 잠시 빼고 메인 페이지 하나만 제출한다.
 * 색인 상태가 확인되면 대회 상세 페이지를 다시 포함시킨다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://runfor.kr'
  return [{ url: base, changeFrequency: 'daily', priority: 1 }]
}
