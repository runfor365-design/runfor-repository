import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import channels from '@/data/youtube-channels.json'
import type { FeedItem } from '@/types/race'

export const revalidate = 1800

const RETRY_DELAY_MS = 700
const REQUEST_TIMEOUT_MS = 6500

function clean(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .trim()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchChannel(
  channel: { id: string; name: string },
  attempt = 0,
): Promise<FeedItem[]> {
  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`,
      {
        next: { revalidate },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
      },
    )
    if (!response.ok) throw new Error(`youtube feed ${response.status}`)
    const xml = await response.text()
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => {
      const entry = match[1]
      const videoId = clean(entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/)?.[1])
      return {
        title: clean(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]),
        link: `https://www.youtube.com/watch?v=${videoId}`,
        publishedAt: clean(entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]),
        source: channel.name,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      }
    })
  } catch {
    // 유튜브 비공식 feeds.xml 엔드포인트는 순간적으로 404/500을 랜덤하게 반환할 때가 있어 한 번만 재시도한다.
    if (attempt > 0) return []
    await sleep(RETRY_DELAY_MS)
    return fetchChannel(channel, attempt + 1)
  }
}

async function fetchAllChannels(): Promise<FeedItem[]> {
  const active = channels.filter((channel) => channel.id)
  const feeds = await Promise.all(active.map((channel) => fetchChannel(channel)))
  return feeds.flat()
}

/**
 * 재시도까지 실패해 이번 요청이 빈 배열이 되더라도 완전히 빈 화면을 보여주지 않도록,
 * 마지막으로 성공했던 결과를 별도의 긴 주기(1시간) 캐시로 들고 있다가 대신 보여준다.
 * Next Data Cache 기반이라 Vercel 서버리스의 콜드 스타트와 무관하게 유지된다.
 */
const getLastGoodSnapshot = unstable_cache(fetchAllChannels, ['youtube-last-good-snapshot'], {
  revalidate: 3600,
})

export async function GET() {
  const active = channels.filter((channel) => channel.id)
  if (!active.length) return NextResponse.json({ items: [], setupRequired: true })

  const fresh = await fetchAllChannels()
  if (fresh.length > 0) return NextResponse.json({ items: fresh })

  const fallback = await getLastGoodSnapshot().catch(() => [])
  return NextResponse.json({ items: fallback })
}
