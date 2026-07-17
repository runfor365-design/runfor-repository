import { NextResponse } from 'next/server'
import channels from '@/data/youtube-channels.json'

export const revalidate = 1800

function clean(value = '') { return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() }

export async function GET() {
  const active = channels.filter((channel) => channel.id)
  if (!active.length) return NextResponse.json({ items: [], setupRequired: true })
  try {
    const feeds = await Promise.all(active.map(async (channel) => {
      const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(6500) })
      if (!response.ok) return []
      const xml = await response.text()
      return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 4).map((match) => {
        const entry = match[1]
        const videoId = clean(entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/)?.[1])
        return { title: clean(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]), link: `https://www.youtube.com/watch?v=${videoId}`, publishedAt: clean(entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]), source: channel.name, thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` }
      })
    }))
    const items = feeds.flat().sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)).slice(0, 8)
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [], error: '영상을 불러오지 못했습니다.' })
  }
}
