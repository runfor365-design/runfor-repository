'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, RefreshCw } from 'lucide-react'
import type { FeedItem } from '@/types/race'

const VISIBLE_COUNT = 7

function sample<T>(pool: T[], count: number) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count)
}

export default function NewsSection() {
  const [pool, setPool] = useState<FeedItem[]>([])
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => {
        const fetched = data.items || []
        setPool(fetched)
        setItems(sample(fetched, VISIBLE_COUNT))
        setFailed(Boolean(data.error))
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [])
  return (
    <section className="feed-panel news-panel" aria-labelledby="news-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">RUNNING NEWS</span>
          <h2 id="news-title">러닝 관련 뉴스</h2>
        </div>
        {pool.length > VISIBLE_COUNT && (
          <button
            type="button"
            className="refresh-button"
            aria-label="다른 뉴스 보기"
            onClick={() => setItems(sample(pool, VISIBLE_COUNT))}
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>
      {loading ? (
        <div className="feed-loading">
          {[1, 2, 3, 4].map((n) => (
            <span key={n} />
          ))}
        </div>
      ) : items.length ? (
        <div className="news-list">
          {items.map((item, index) => (
            <a
              key={`${item.link}-${index}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item"
            >
              <span className="news-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="news-copy">
                <strong>{item.title}</strong>
                <small>
                  {item.source} · {new Date(item.publishedAt).toLocaleDateString('ko-KR')}
                </small>
              </span>
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      ) : (
        <div className="feed-empty">
          <RefreshCw size={22} />
          <strong>
            {failed ? '뉴스 연결이 잠시 원활하지 않습니다' : '표시할 새 소식이 없습니다'}
          </strong>
          <span>잠시 후 다시 확인해 주세요.</span>
        </div>
      )}
      <p className="feed-caption">제목과 출처만 제공하며, 원문은 각 언론사에서 확인합니다.</p>
    </section>
  )
}
