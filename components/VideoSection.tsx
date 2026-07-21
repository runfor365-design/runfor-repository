'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Play, RefreshCw } from 'lucide-react'
import type { FeedItem } from '@/types/race'

const VISIBLE_COUNT = 4

function sample<T>(pool: T[], count: number) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count)
}

export default function VideoSection() {
  const [pool, setPool] = useState<FeedItem[]>([])
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(false)
  useEffect(() => {
    fetch('/api/youtube')
      .then((r) => r.json())
      .then((data) => {
        const fetched = data.items || []
        setPool(fetched)
        setItems(sample(fetched, VISIBLE_COUNT))
        setSetup(Boolean(data.setupRequired))
      })
      .finally(() => setLoading(false))
  }, [])
  return (
    <section className="feed-panel video-panel" aria-labelledby="video-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">RUNNING VIDEO</span>
          <h2 id="video-title">러너들의 동영상</h2>
        </div>
        {pool.length > VISIBLE_COUNT && (
          <button
            type="button"
            className="refresh-button"
            aria-label="다른 영상 보기"
            onClick={() => setItems(sample(pool, VISIBLE_COUNT))}
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>
      {loading ? (
        <div className="video-loading">
          <span />
          <span />
        </div>
      ) : items.length ? (
        <div className="video-grid">
          {items.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="video-card"
            >
              <div className="video-thumb">
                {item.thumbnail && (
                  <Image src={item.thumbnail} fill sizes="(max-width: 760px) 100vw, 300px" alt="" />
                )}
                <i>
                  <Play size={17} fill="currentColor" />
                </i>
              </div>
              <strong>{item.title}</strong>
              <small>
                {item.source} · {new Date(item.publishedAt).toLocaleDateString('ko-KR')}
              </small>
            </a>
          ))}
        </div>
      ) : (
        <div className="video-placeholder">
          <span className="video-placeholder-icon">
            <Play size={22} fill="currentColor" />
          </span>
          <div>
            <strong>
              {setup ? '추천 채널을 준비하고 있습니다' : '새 영상을 불러오지 못했습니다'}
            </strong>
            <p>채널 목록은 데이터 파일만 교체하면 자동으로 업데이트됩니다.</p>
          </div>
          <a
            href="https://www.youtube.com/results?search_query=%EB%A7%88%EB%9D%BC%ED%86%A4+%EB%9F%AC%EB%8B%9D"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube에서 보기 <ArrowUpRight size={15} />
          </a>
        </div>
      )}
    </section>
  )
}
