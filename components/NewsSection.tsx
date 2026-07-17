'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Newspaper, RefreshCw } from 'lucide-react'
import type { FeedItem } from '@/types/race'

export default function NewsSection() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => { fetch('/api/news').then((r) => r.json()).then((data) => { setItems(data.items || []); setFailed(Boolean(data.error)) }).catch(() => setFailed(true)).finally(() => setLoading(false)) }, [])
  return (
    <section className="feed-panel news-panel" aria-labelledby="news-title">
      <div className="feed-heading"><div><span className="eyebrow">RUNNING NEWS</span><h2 id="news-title">오늘의 러닝 소식</h2></div><Newspaper size={22} /></div>
      {loading ? <div className="feed-loading">{[1,2,3,4].map((n) => <span key={n} />)}</div> : items.length ? <div className="news-list">{items.slice(0, 6).map((item, index) => <a key={`${item.link}-${index}`} href={item.link} target="_blank" rel="noopener noreferrer" className="news-item"><span className="news-index">{String(index + 1).padStart(2, '0')}</span><span className="news-copy"><strong>{item.title}</strong><small>{item.source} · {new Date(item.publishedAt).toLocaleDateString('ko-KR')}</small></span><ArrowUpRight size={16} /></a>)}</div> : <div className="feed-empty"><RefreshCw size={22} /><strong>{failed ? '뉴스 연결이 잠시 원활하지 않습니다' : '표시할 새 소식이 없습니다'}</strong><span>잠시 후 다시 확인해 주세요.</span></div>}
      <p className="feed-caption">제목과 출처만 제공하며, 원문은 각 언론사에서 확인합니다.</p>
    </section>
  )
}
