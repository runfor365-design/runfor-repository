'use client'

import { RotateCcw, Search } from 'lucide-react'
import { shortRegionName } from '@/lib/region-map'

interface Props {
  search: string
  onSearch: (value: string) => void
  region: string
  onRegion: (value: string) => void
  status: string
  onStatus: (value: string) => void
  month: string
  onMonth: (value: string) => void
  months: string[]
  availableRegions: string[]
  resultCount: number
  onReset: () => void
}

export default function FilterBar(props: Props) {
  return (
    <section className="filter-bar" aria-label="대회 검색 필터">
      <label className="search-field" htmlFor="race-search">
        <Search size={18} aria-hidden="true" />
        <input
          id="race-search"
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="대회명 또는 장소 검색"
        />
      </label>
      <div className="select-filters">
        <label>
          <span>지역</span>
          <select value={props.region} onChange={(e) => props.onRegion(e.target.value)}>
            <option value="">전국</option>
            {props.availableRegions.map((r) => (
              <option key={r} value={r}>
                {shortRegionName(r)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>접수</span>
          <select value={props.status} onChange={(e) => props.onStatus(e.target.value)}>
            <option value="">전체 상태</option>
            <option>접수중</option>
            <option>접수예정</option>
            <option>접수마감</option>
          </select>
        </label>
        <label>
          <span>월</span>
          <select value={props.month} onChange={(e) => props.onMonth(e.target.value)}>
            <option value="">전체 월</option>
            {props.months.map((month) => (
              <option key={month} value={month}>
                {Number(month.split('-')[1])}월
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="filter-result">
        <strong>{props.resultCount}</strong>개 대회{' '}
        <button type="button" onClick={props.onReset}>
          <RotateCcw size={14} /> 초기화
        </button>
      </div>
    </section>
  )
}
