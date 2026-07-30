'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, Flag, MapPinned, X } from 'lucide-react'
import FilterBar from './FilterBar'
import KoreaMap from './KoreaMap'
import RaceCalendar from './RaceCalendar'
import RaceList from './RaceList'
import RecommendedRaces from './RecommendedRaces'
import NewsSection from './NewsSection'
import VideoSection from './VideoSection'
import { formatKoreanDate } from '@/lib/date'
import { regions } from '@/lib/region-map'
import type { NormalizedRace } from '@/types/race'

export default function DashboardClient({ races }: { races: NormalizedRace[] }) {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [month, setMonth] = useState('')
  const [view, setView] = useState<'map' | 'calendar'>('calendar')
  const [selectedRace, setSelectedRace] = useState<NormalizedRace | null>(null)

  const keyword = search.trim().toLowerCase()

  // 달력: 검색·지역·월 조건만 적용, 대회예정/대회종료 전부 표시(색상으로 구분)
  const calendarRaces = useMemo(
    () =>
      races.filter(
        (race) =>
          (!keyword || `${race.대회명} ${race.장소}`.toLowerCase().includes(keyword)) &&
          (!month || race.date.startsWith(month)) &&
          (!region || race.region === region),
      ),
    [races, keyword, region, month],
  )
  // 지도: 검색·월 조건만 적용(지역은 지도 자체에서 선택), 대회예정만 표시
  const mapRaces = useMemo(
    () =>
      races.filter(
        (race) =>
          (!keyword || `${race.대회명} ${race.장소}`.toLowerCase().includes(keyword)) &&
          (!month || race.date.startsWith(month)) &&
          race.status === '대회예정',
      ),
    [races, keyword, month],
  )
  // 목록: 검색·지역·월 조건 적용, 대회예정만 표시
  const listRaces = useMemo(
    () =>
      races.filter(
        (race) =>
          (!keyword || `${race.대회명} ${race.장소}`.toLowerCase().includes(keyword)) &&
          (!month || race.date.startsWith(month)) &&
          (!region || race.region === region) &&
          race.status === '대회예정',
      ),
    [races, keyword, region, month],
  )
  const availableMonths = [...new Set(races.map((race) => race.date.slice(0, 7)))]
  const availableRegions = regions.filter((item) => races.some((race) => race.region === item))
  const reset = () => {
    setSearch('')
    setRegion('')
    setMonth('')
  }

  return (
    <main>
      <section className="race-explorer" id="races" aria-labelledby="page-title">
        <div className="section-intro">
          <div>
            <span className="eyebrow">FIND YOUR START LINE</span>
            <h1 id="page-title">{new Date().getFullYear()} 전국 마라톤 대회 일정</h1>
          </div>
          <p>전국 마라톤·러닝 대회 일정을 지역, 종목, 대회 상태로 검색하고 지도와 달력으로 확인하세요.</p>
        </div>
        <FilterBar
          search={search}
          onSearch={setSearch}
          region={region}
          onRegion={setRegion}
          month={month}
          onMonth={setMonth}
          months={availableMonths}
          availableRegions={availableRegions}
          resultCount={listRaces.length}
          onReset={reset}
        />
        <div className="explorer-grid">
          <div className="explorer-panel" id="calendar" aria-labelledby="explorer-panel-title">
            <div className="section-heading">
              <div>
                <span className="eyebrow">CALENDAR &amp; MAP</span>
                <h2 id="explorer-panel-title">달력/지도로 찾기</h2>
              </div>
            </div>
            <div className="view-toggle" role="tablist" aria-label="지도 또는 달력으로 보기">
              <button
                type="button"
                role="tab"
                aria-selected={view === 'calendar'}
                className={view === 'calendar' ? 'active' : ''}
                onClick={() => setView('calendar')}
              >
                달력으로 보기
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === 'map'}
                className={view === 'map' ? 'active' : ''}
                onClick={() => setView('map')}
              >
                지도로 보기
              </button>
            </div>
            {view === 'calendar' ? (
              <RaceCalendar races={calendarRaces} onSelect={setSelectedRace} />
            ) : (
              <KoreaMap races={mapRaces} selectedRegion={region} onSelect={setRegion} />
            )}
          </div>
          <RaceList races={listRaces} region={region} />
          <RecommendedRaces races={races} />
        </div>
      </section>

      <section className="running-feed" id="running-feed">
        <div className="section-intro">
          <div>
            <span className="eyebrow">STAY IN THE LOOP</span>
            <h2>최신 콘텐츠 모아보기</h2>
          </div>
          <p>당신을 위한 뉴스와 영상 모음</p>
        </div>
        <div className="feed-grid">
          <NewsSection />
          <VideoSection />
        </div>
      </section>

      {selectedRace && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setSelectedRace(null)}
        >
          <section
            className="race-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setSelectedRace(null)} aria-label="닫기">
              <X size={20} />
            </button>
            <span className={`status-badge status-${selectedRace.status}`}>
              {selectedRace.status}
            </span>
            <h2 id="modal-title">{selectedRace.대회명}</h2>
            <dl>
              <div>
                <dt>
                  <CalendarCheck size={16} />
                  일정
                </dt>
                <dd>
                  {formatKoreanDate(selectedRace.date)} · {selectedRace.집결시간}
                </dd>
              </div>
              <div>
                <dt>
                  <MapPinned size={16} />
                  장소
                </dt>
                <dd>{selectedRace.장소상세 || selectedRace.장소}</dd>
              </div>
              <div>
                <dt>
                  <Flag size={16} />
                  종목
                </dt>
                <dd>{selectedRace.종목.join(' · ')}</dd>
              </div>
            </dl>
            <Link href={`/race/${selectedRace.slug}`}>
              상세 정보 보기 <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      )}
    </main>
  )
}
