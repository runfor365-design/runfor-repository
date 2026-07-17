'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, Flag, MapPinned, MoveRight, X } from 'lucide-react'
import FilterBar from './FilterBar'
import KoreaMap from './KoreaMap'
import RaceCalendar from './RaceCalendar'
import RaceList from './RaceList'
import NewsSection from './NewsSection'
import VideoSection from './VideoSection'
import { formatKoreanDate } from '@/lib/date'
import { regions, shortRegionName } from '@/lib/region-map'
import type { NormalizedRace } from '@/types/race'

export default function DashboardClient({ races }: { races: NormalizedRace[] }) {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [distance, setDistance] = useState('')
  const [status, setStatus] = useState('')
  const [month, setMonth] = useState('')
  const [selectedRace, setSelectedRace] = useState<NormalizedRace | null>(null)

  const filtered = useMemo(() => races.filter((race) => {
    const keyword = search.trim().toLowerCase()
    return (!keyword || `${race.대회명} ${race.장소}`.toLowerCase().includes(keyword)) && (!region || race.region === region) && (!distance || race.종목.includes(distance)) && (!status || race.status === status) && (!month || race.date.startsWith(month))
  }), [races, search, region, distance, status, month])
  const availableMonths = [...new Set(races.map((race) => race.date.slice(0, 7)))]
  const availableRegions = regions.filter((item) => races.some((race) => race.region === item))
  const openCount = races.filter((race) => race.status === '접수중').length
  const nextRace = races.find((race) => new Date(`${race.date}T23:59:59`) >= new Date()) || races[0]
  const regionCounts = availableRegions.map((name) => ({ name, count: races.filter((race) => race.region === name).length })).sort((a, b) => b.count - a.count).slice(0, 5)
  const maxRegion = Math.max(1, ...regionCounts.map((item) => item.count))
  const reset = () => { setSearch(''); setRegion(''); setDistance(''); setStatus(''); setMonth('') }

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><span className="hero-kicker"><i /> 2026 RACE INDEX</span><h1 id="hero-title">달릴 이유를 찾는<br /><em>가장 선명한 방법.</em></h1><p>전국 마라톤 일정을 지도와 달력으로 한눈에 살펴보세요.<br />다음 출발선까지, 런포가 함께 찾습니다.</p></div>
        <div className="hero-line" aria-hidden="true"><span className="runner-dot" /><span className="finish-flag">FINISH?</span></div>
        <dl className="hero-stats">
          <div><dt>등록 대회</dt><dd>{races.length}<small>RACES</small></dd></div>
          <div><dt>접수 진행</dt><dd>{openCount}<small>OPEN</small></dd></div>
          <div><dt>확인 지역</dt><dd>{availableRegions.length}<small>REGIONS</small></dd></div>
        </dl>
      </section>

      <section className="race-explorer" id="races">
        <div className="section-intro"><div><span className="eyebrow">FIND YOUR START LINE</span><h2>다음 출발선을 찾아보세요</h2></div><p>지도, 달력, 목록이 하나의 필터로 함께 움직입니다.</p></div>
        <FilterBar search={search} onSearch={setSearch} region={region} onRegion={setRegion} distance={distance} onDistance={setDistance} status={status} onStatus={setStatus} month={month} onMonth={setMonth} months={availableMonths} availableRegions={availableRegions} resultCount={filtered.length} onReset={reset} />
        <div className="explorer-grid">
          <section className="map-panel"><KoreaMap races={filtered} selectedRegion={region} onSelect={setRegion} /></section>
          <aside className="insight-rail" aria-label="대회 요약">
            {nextRace && <article className="next-race-card"><span className="eyebrow light">NEXT START</span><div className="next-date"><strong>{new Date(`${nextRace.date}T00:00:00`).getDate()}</strong><span>{new Date(`${nextRace.date}T00:00:00`).toLocaleDateString('ko-KR', { month: 'short', weekday: 'short' })}</span></div><h3>{nextRace.대회명}</h3><p>{shortRegionName(nextRace.region)} · {nextRace.종목.join(' / ')}</p><Link href={`/race/${nextRace.slug}`}>대회 정보 보기 <MoveRight size={17} /></Link></article>}
            <article className="region-ranking"><div className="rail-title"><span>지역별 대회</span><MapPinned size={18} /></div>{regionCounts.map((item, index) => <button key={item.name} type="button" onClick={() => setRegion(item.name)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{shortRegionName(item.name)}</strong><i><b style={{ width: `${(item.count / maxRegion) * 100}%` }} /></i><em>{item.count}</em></button>)}</article>
            <article className="tip-card"><Flag size={18} /><div><strong>대회 정보 확인 안내</strong><p>일정과 접수 상태는 주최 측 사정에 따라 바뀔 수 있습니다. 신청 전 공식 요강을 확인하세요.</p></div></article>
          </aside>
        </div>
      </section>

      <div className="content-band"><RaceCalendar races={filtered} onSelect={setSelectedRace} /></div>
      <div className="content-band"><RaceList races={filtered.slice(0, 8)} /></div>
      <section className="running-feed" id="running-feed"><div className="section-intro"><div><span className="eyebrow">STAY IN THE LOOP</span><h2>달리기 좋은 정보만 모았습니다</h2></div><p>뉴스와 채널 RSS를 통해 최신 콘텐츠를 가볍게 연결합니다.</p></div><div className="feed-grid"><NewsSection /><VideoSection /></div></section>

      {selectedRace && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedRace(null)}><section className="race-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedRace(null)} aria-label="닫기"><X size={20} /></button><span className={`status-badge status-${selectedRace.status}`}>{selectedRace.status}</span><h2 id="modal-title">{selectedRace.대회명}</h2><dl><div><dt><CalendarCheck size={16} />일정</dt><dd>{formatKoreanDate(selectedRace.date)} · {selectedRace.집결시간}</dd></div><div><dt><MapPinned size={16} />장소</dt><dd>{selectedRace.장소상세 || selectedRace.장소}</dd></div><div><dt><Flag size={16} />종목</dt><dd>{selectedRace.종목.join(' · ')}</dd></div></dl><Link href={`/race/${selectedRace.slug}`}>상세 정보 보기 <ArrowRight size={16} /></Link></section></div>}
    </main>
  )
}
