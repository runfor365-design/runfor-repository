'use client'

import { normalizeRegion, shortRegionName } from '@/lib/region-map'
import { isApplication, type AdminRace } from '@/lib/admin-races'
import type { RaceActions } from './AdminDashboard'

export default function DuplicatesTab({
  groups,
  actions,
}: {
  groups: AdminRace[][]
  actions: RaceActions
}) {
  if (!groups.length) {
    return <p className="admin-section admin-empty">중복으로 의심되는 대회가 없습니다.</p>
  }

  return (
    <section className="admin-section">
      <p>
        같은 날짜에 열리면서 지역과 이름이 비슷하거나 홈페이지 주소가 같은 대회를 묶었습니다. 실제 다른
        대회일 수도 있으니 내용을 확인한 뒤 정리해 주세요. 수집 데이터는 삭제해도 races.json을 다시
        올리면 돌아오므로, 남겨둘 필요가 없는 쪽은 <strong>숨김</strong>을 권장합니다.
      </p>
      <div className="admin-dup-groups">
        {groups.map((group) => (
          <div key={group.map((race) => race.slug).join('|')} className="admin-dup-group">
            <h3>
              {group[0].날짜} · {group.length}건
            </h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>대회명</th>
                  <th>지역 / 장소</th>
                  <th>홈페이지</th>
                  <th>출처</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {group.map((race) => (
                  <tr key={race.slug} className={race.숨김여부 ? 'admin-row-hidden' : undefined}>
                    <td>
                      {race.대회명}
                      {race.숨김여부 && <span className="admin-tag admin-tag-muted">숨김</span>}
                    </td>
                    <td>
                      {shortRegionName(normalizeRegion(race.지역 ?? '')) || '-'} / {race.장소 || '-'}
                    </td>
                    <td className="admin-cell-url">{race.홈페이지 || '-'}</td>
                    <td>{isApplication(race) ? '신청 접수' : '수집 데이터'}</td>
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
        ))}
      </div>
    </section>
  )
}
