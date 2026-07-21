'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, RefreshCw } from 'lucide-react'
import { formatKoreanDate } from '@/lib/date'
import { getRecommendedRaces, type RecommendedRace, type RecommendReason } from '@/lib/recommend'
import { shortRegionName } from '@/lib/region-map'
import type { NormalizedRace } from '@/types/race'

const REASON_LABEL: Record<RecommendReason, string> = {
  featured: '추천',
  nearby: '내 주변',
  soon: '대회 임박',
}

export default function RecommendedRaces({ races }: { races: NormalizedRace[] }) {
  const [ready, setReady] = useState(false)
  const [region, setRegion] = useState<string | null>(null)
  const [recommended, setRecommended] = useState<RecommendedRace[]>([])

  useEffect(() => {
    fetch('/api/geo')
      .then((r) => r.json())
      .then((data) => {
        const detected = data.region ?? null
        setRegion(detected)
        setRecommended(getRecommendedRaces(races, detected))
      })
      .catch(() => setRecommended(getRecommendedRaces(races, null)))
      .finally(() => setReady(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (ready && !recommended.length) return null

  return (
    <div className="recommend-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">RECOMMENDED</span>
          <h2>추천대회</h2>
        </div>
        {ready && recommended.length > 0 && (
          <button
            type="button"
            className="refresh-button"
            aria-label="다른 추천 대회 보기"
            onClick={() => setRecommended(getRecommendedRaces(races, region))}
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>
      {!ready ? (
        <div className="recommend-row">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="recommend-card recommend-loading" />
          ))}
        </div>
      ) : (
        <div className="recommend-row">
          {recommended.map(({ race, reason }) => (
            <Link key={race.slug} href={`/race/${race.slug}`} className="recommend-card">
              <span className="recommend-tag">{REASON_LABEL[reason]}</span>
              <strong>{race.대회명}</strong>
              <span className="recommend-meta">
                <MapPin size={12} />
                {shortRegionName(race.region)} · {formatKoreanDate(race.date, false)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
