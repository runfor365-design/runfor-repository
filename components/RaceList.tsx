'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Calendar, MapPin } from 'lucide-react'
import { daysUntil, formatKoreanDate } from '@/lib/date'
import { shortRegionName } from '@/lib/region-map'
import type { NormalizedRace } from '@/types/race'

const PAGE_SIZE = 5

export default function RaceList({ races, region }: { races: NormalizedRace[]; region: string }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [prevRaces, setPrevRaces] = useState(races)
  if (races !== prevRaces) {
    setPrevRaces(races)
    setVisibleCount(PAGE_SIZE)
  }
  const visible = races.slice(0, visibleCount)
  const remaining = races.length - visible.length

  return (
    <section className="race-list-section" aria-labelledby="race-list-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">RACES LIST</span>
          <h2 id="race-list-title">대회 목록</h2>
        </div>
        <span className="list-region">{region ? shortRegionName(region) : '전체'}</span>
      </div>
      {races.length ? (
        <div className="race-cards">
          {visible.map((race) => {
            const dday = daysUntil(race.date)
            const tags = race.종목.slice(0, 3)
            const extra = race.종목.length - tags.length
            return (
              <Link className="race-card" href={`/race/${race.slug}`} key={race.slug}>
                <div className="race-card-date">
                  <strong>{new Date(`${race.date}T00:00:00`).getDate()}</strong>
                  <span>{formatKoreanDate(race.date, false).split(' ')[0]}</span>
                </div>
                <div className="race-card-body">
                  <div className="race-card-top">
                    <span className={`status-badge status-${race.status}`}>{race.status}</span>
                    <small>{dday === 0 ? 'D-DAY' : `D-${dday}`}</small>
                    <span className="race-card-meta">
                      <MapPin size={12} />
                      {shortRegionName(race.region)} · {race.장소}
                    </span>
                  </div>
                  <strong className="race-card-title">{race.대회명}</strong>
                  <div className="race-card-tags">
                    {tags.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                    {extra > 0 && <span>+{extra}</span>}
                  </div>
                </div>
                <ArrowUpRight size={16} className="race-card-arrow" />
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Calendar size={28} />
          <strong>조건에 맞는 대회가 없습니다.</strong>
          <span>필터를 조정해 다른 일정을 찾아보세요.</span>
        </div>
      )}
      {remaining > 0 && (
        <button
          type="button"
          className="race-load-more"
          onClick={() => setVisibleCount(races.length)}
        >
          대회 더보기 ({remaining})
        </button>
      )}
    </section>
  )
}
