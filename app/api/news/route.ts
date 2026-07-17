import { NextResponse } from 'next/server'

export const revalidate = 1200

function text(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
}

export async function GET() {
  try {
    const query = encodeURIComponent('마라톤 OR 러닝 대회 when:7d')
    const response = await fetch(`https://news.google.com/rss/search?q=${query}&hl=ko&gl=KR&ceid=KR:ko`, { next: { revalidate: 1200 }, signal: AbortSignal.timeout(6500) })
    if (!response.ok) throw new Error('News feed unavailable')
    const xml = await response.text()
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8).map((match) => {
      const item = match[1]
      const pick = (tag: string) => text(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? '')
      const rawTitle = pick('title')
      const source = pick('source') || rawTitle.split(' - ').pop() || 'Google 뉴스'
      return { title: rawTitle.replace(new RegExp(` - ${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), ''), link: pick('link'), publishedAt: pick('pubDate'), source }
    }).filter((item) => item.title && item.link)
    return NextResponse.json({ items, updatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ items: [], error: '최신 뉴스를 불러오지 못했습니다.' }, { status: 200 })
  }
}
