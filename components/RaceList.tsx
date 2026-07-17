'use client'

import Link from 'next/link'
import { ArrowUpRight, Calendar, MapPin, Timer } from 'lucide-react'
import { daysUntil, formatKoreanDate } from '@/lib/date'
import { shortRegionName } from '@/lib/region-map'
import type { NormalizedRace } from '@/types/race'

export default function RaceList({ races }: { races: NormalizedRace[] }) {
  return (
    <section className="race-list-section" aria-labelledby="race-list-title">
      <div className="section-heading list-heading"><div><span className="eyebrow">UPCOMING RACES</span><h2 id="race-list-title">다가오는 대회</h2></div><span className="data-notice">현재 샘플 데이터로 운영 중</span></div>
      {races.length ? <div className="race-table">
        <div className="race-table-head"><span>일정</span><span>대회 정보</span><span>지역 · 종목</span><span>접수</span><span /></div>
        {races.map((race) => { const dday = daysUntil(race.date); return (
          <article className="race-row" key={race.slug}>
            <div className="race-date"><strong>{new Date(`${race.date}T00:00:00`).getDate()}</strong><span>{formatKoreanDate(race.date, false).split(' ')[0]}</span><small>{dday >= 0 ? `D-${dday}` : '종료'}</small></div>
            <div className="race-main"><Link href={`/race/${race.slug}`}>{race.대회명}</Link><span><MapPin size={14} />{race.장소}</span><span><Timer size={14} />{race.집결시간}</span></div>
            <div className="race-meta"><strong>{shortRegionName(race.region)}</strong><div>{race.종목.map((item) => <span key={item}>{item}</span>)}</div></div>
            <div><span className={`status-badge status-${race.status}`}>{race.status}</span></div>
            <Link className="row-link" href={`/race/${race.slug}`} aria-label={`${race.대회명} 자세히 보기`}><ArrowUpRight size={18} /></Link>
          </article>
        )})}
      </div> : <div className="empty-state"><Calendar size={28} /><strong>조건에 맞는 대회가 없습니다.</strong><span>필터를 조정해 다른 일정을 찾아보세요.</span></div>}
    </section>
  )
}
