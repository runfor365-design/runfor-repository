'use client'

import { useState } from 'react'
import { isLikelyDuplicate, type AdminRace } from '@/lib/admin-races'
import type { RaceActions } from './AdminDashboard'

export default function PendingTab({
  pending,
  published,
  actions,
}: {
  pending: AdminRace[]
  published: AdminRace[]
  actions: RaceActions
}) {
  const [busy, setBusy] = useState<string | null>(null)

  if (!pending.length) {
    return <p className="admin-section admin-empty">승인 대기 중인 신청이 없습니다.</p>
  }

  return (
    <section className="admin-section">
      <p>
        문의하기 → 대회관련으로 접수된 신청입니다. 승인하면 사이트에 바로 노출되고, 삭제하면 신청 자체가
        지워집니다.
      </p>
      <div className="admin-pending-list">
        {pending.map((race) => {
          const duplicates = published.filter((other) => isLikelyDuplicate(race, other))
          return (
            <article key={race.slug} className="admin-pending-card">
              <header>
                <strong>{race.대회명}</strong>
                <span>{race.날짜}</span>
              </header>
              {duplicates.length > 0 && (
                <p className="admin-dup-warning">
                  중복 의심: {duplicates.map((item) => item.대회명).join(', ')}
                </p>
              )}
              <dl className="admin-detail">
                <dt>집결</dt>
                <dd>{race.집결 || '-'}</dd>
                <dt>종목</dt>
                <dd>{race.종목배열.join(', ') || '-'}</dd>
                <dt>지역 / 장소</dt>
                <dd>
                  {race.지역 || '-'} / {race.장소 || '-'}
                </dd>
                <dt>주최</dt>
                <dd>{race.주최 || '-'}</dd>
                <dt>접수기간</dt>
                <dd>
                  {race.접수시작 || '-'} ~ {race.접수마감 || '-'}
                </dd>
                <dt>홈페이지</dt>
                <dd>
                  {race.홈페이지 ? (
                    <a href={race.홈페이지} target="_blank" rel="noopener noreferrer">
                      {race.홈페이지}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
                <dt>연락처</dt>
                <dd>
                  {race.이메일 || '-'} · {race.전화 || '-'}
                </dd>
                <dt>소개</dt>
                <dd className="admin-detail-long">{race.소개내용 || '-'}</dd>
              </dl>
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="admin-button"
                  disabled={busy === race.slug}
                  onClick={async () => {
                    setBusy(race.slug)
                    await actions.save(race.slug, { 공개여부: true })
                    setBusy(null)
                  }}
                >
                  승인
                </button>
                <button
                  type="button"
                  className="admin-button-ghost"
                  onClick={() => actions.edit(race, 'approve')}
                >
                  수정 후 승인
                </button>
                <button
                  type="button"
                  className="admin-button-danger"
                  disabled={busy === race.slug}
                  onClick={() => actions.remove(race)}
                >
                  삭제
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
