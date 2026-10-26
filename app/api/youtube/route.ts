import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import channels from '@/data/youtube-channels.json'
import type { FeedItem } from '@/types/race'

export const revalidate = 1800

const RETRY_DELAY_MS = 700
const REQUEST_TIMEOUT_MS = 6500
const VIDEOS_PER_CHANNEL = 15

interface PlaylistItem {
  snippet: {
    title: string
    publishedAt: string
    resourceId: { videoId: string }
    thumbnails?: { medium?: { url: string } }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * YouTube Data API v3 — 채널의 업로드 재생목록(UC... → UU...)을 조회한다.
 * playlistItems.list는 호출당 1 할당량 단위라 14채널 × 하루 48회여도 일일 한도(10,000)에 한참 못 미친다.
 */
async function fetchChannel(
  channel: { id: string; name: string },
  attempt = 0,
): Promise<FeedItem[]> {
  try {
    const playlistId = `UU${channel.id.slice(2)}`
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: String(VIDEOS_PER_CHANNEL),
      key: process.env.YOUTUBE_API_KEY ?? '',
    })
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`youtube api ${response.status}`)
    const data: { items?: PlaylistItem[] } = await response.json()
    return (data.items ?? [])
      .filter((item) => !['Private video', 'Deleted video'].includes(item.snippet.title))
      .map(({ snippet }) => {
        const videoId = snippet.resourceId.videoId
        return {
          title: snippet.title,
          link: `https://www.youtube.com/watch?v=${videoId}`,
          publishedAt: snippet.publishedAt,
          source: channel.name,
          thumbnail: snippet.thumbnails?.medium?.url ?? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        }
      })
  } catch {
    // 일시적인 네트워크 오류에 대비해 한 번만 재시도한다.
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
  if (!active.length || !process.env.YOUTUBE_API_KEY) {
    return NextResponse.json({ items: [], setupRequired: true })
  }

  const fresh = await fetchAllChannels()
  if (fresh.length > 0) return NextResponse.json({ items: fresh })

  const fallback = await getLastGoodSnapshot().catch(() => [])
  return NextResponse.json({ items: fallback })
}
