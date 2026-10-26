'use client'

import { useMemo, useState } from 'react'
import { getRaceStatus } from '@/lib/date'
import { normalizeRegion, shortRegionName } from '@/lib/region-map'
import { isApplication, type AdminRace } from '@/lib/admin-races'
import type { RaceActions } from './AdminDashboard'

const PAGE_SIZE = 50

const INITIAL_FILTERS = {
  keyword: '',
  from: '',
  to: '',
  region: '',
  status: '',
  recommended: '',
  source: '',
  visibility: '',
}

export default function RacesTab({ races, actions }: { races: AdminRace[]; actions: RaceActions }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [page, setPage] = useState(0)
  const set = (key: keyof typeof INITIAL_FILTERS, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const regionOptions = useMemo(
    () =>
      [...new Set(races.map((race) => normalizeRegion(race.지역 ?? '')).filter(Boolean))].sort(),
    [races],
  )

  const filtered = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return races.filter((race) => {
      if (keyword && !`${race.대회명} ${race.장소 ?? ''}`.toLowerCase().includes(keyword)) return false
      if (filters.from && race.날짜 < filters.from) return false
      if (filters.to && race.날짜 > filters.to) return false
      if (filters.region && normalizeRegion(race.지역 ?? '') !== filters.region) return false
      if (filters.status && getRaceStatus(race.날짜) !== filters.status) return false
      if (filters.recommended && String(race.추천여부) !== filters.recommended) return false
      if (filters.source === 'application' && !isApplication(race)) return false
      if (filters.source === 'collected' && isApplication(race)) return false
      if (filters.visibility && String(race.숨김여부) !== filters.visibility) return false
      return true
    })
  }, [races, filters])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <section className="admin-section">
      <div className="admin-filters">
        <input
          className="admin-filter-wide"
          placeholder="대회명 또는 장소 검색"
          value={filters.keyword}
          onChange={(e) => set('keyword', e.target.value)}
        />
        <label>
          <span>시작일</span>
          <input type="date" value={filters.from} onChange={(e) => set('from', e.target.value)} />
        </label>
        <label>
          <span>종료일</span>
          <input type="date" value={filters.to} onChange={(e) => set('to', e.target.value)} />
        </label>
        <label>
          <span>지역</span>
          <select value={filters.region} onChange={(e) => set('region', e.target.value)}>
            <option value="">전체</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {shortRegionName(region)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>상태</span>
          <select value={filters.status} onChange={(e) => set('status', e.target.value)}>
            <option value="">전체</option>
            <option>대회예정</option>
            <option>대회종료</option>
          </select>
        </label>
        <label>
          <span>추천</span>
          <select value={filters.recommended} onChange={(e) => set('recommended', e.target.value)}>
            <option value="">전체</option>
            <option value="true">추천</option>
            <option value="false">일반</option>
          </select>
        </label>
        <label>
          <span>출처</span>
          <select value={filters.source} onChange={(e) => set('source', e.target.value)}>
            <option value="">전체</option>
            <option value="collected">수집 데이터</option>
            <option value="application">신청 접수</option>
          </select>
        </label>
        <label>
          <span>노출</span>
          <select value={filters.visibility} onChange={(e) => set('visibility', e.target.value)}>
            <option value="">전체</option>
            <option value="false">노출 중</option>
            <option value="true">숨김</option>
          </select>
        </label>
        <button
          type="button"
          className="admin-button-ghost"
          onClick={() => {
            setFilters(INITIAL_FILTERS)
            setPage(0)
          }}
        >
          초기화
        </button>
      </div>

      <p className="admin-result-count">{filtered.length}건</p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>대회명</th>
              <th>날짜</th>
              <th>지역</th>
              <th>상태</th>
              <th>추천</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((race) => (
              <tr key={race.slug} className={race.숨김여부 ? 'admin-row-hidden' : undefined}>
                <td>
                  {race.대회명}
                  {isApplication(race) && <span className="admin-tag">신청</span>}
                  {race.숨김여부 && <span className="admin-tag admin-tag-muted">숨김</span>}
                </td>
                <td>{race.날짜}</td>
                <td>{shortRegionName(normalizeRegion(race.지역 ?? '')) || '-'}</td>
                <td>{getRaceStatus(race.날짜)}</td>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`${race.대회명} 추천`}
                    checked={race.추천여부}
                    onChange={(e) => actions.save(race.slug, { 추천여부: e.target.checked })}
                  />
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-button-ghost"
                      onClick={() => actions.edit(race)}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="admin-button-ghost"
                      onClick={() => actions.save(race.slug, { 숨김여부: !race.숨김여부 })}
                    >
                      {race.숨김여부 ? '숨김 해제' : '숨김'}
                    </button>
                    <button
                      type="button"
                      className="admin-button-danger"
                      onClick={() => actions.remove(race)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="admin-pagination">
          <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>
            이전
          </button>
          <span>
            {page + 1} / {pageCount}
          </span>
          <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}>
            다음
          </button>
        </div>
      )}
    </section>
  )
}
