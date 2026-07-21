import { daysUntil } from './date'
import type { NormalizedRace } from '@/types/race'

export type RecommendReason = 'featured' | 'nearby' | 'soon'

export interface RecommendedRace {
  race: NormalizedRace
  reason: RecommendReason
}

const COUNT = 4
/** '대회 임박' 후보를 진짜 가까운 대회로만 좁힌 뒤 그 안에서 무작위로 뽑기 위한 창 크기 */
const SOON_WINDOW = 15

function shuffle<T>(list: T[]) {
  return [...list].sort(() => Math.random() - 0.5)
}

/**
 * 추천 대회 4건을 우선순위대로 채운다.
 * 1) 추천여부(race-extra.json)가 true인 대회 → 2) 방문자 지역 대회 → 3) 접수중이면서 대회일이 가까운 대회
 * 앞 순위가 모자라면 다음 순위로 자동 대체되어 항상 최대 COUNT건까지 채워진다.
 * 각 단계 후보군 안에서는 무작위로 골라, 새로고침/재방문마다 다른 조합이 보인다.
 */
export function getRecommendedRaces(
  races: NormalizedRace[],
  region: string | null,
): RecommendedRace[] {
  const picked = new Map<string, RecommendedRace>()

  const featured = shuffle(races.filter((race) => race.extra?.추천여부 && daysUntil(race.date) >= 0))
  for (const race of featured) {
    if (picked.size >= COUNT) break
    picked.set(race.slug, { race, reason: 'featured' })
  }

  if (region) {
    const nearby = shuffle(
      races.filter(
        (race) => race.region === region && race.status !== '접수마감' && daysUntil(race.date) >= 0,
      ),
    )
    for (const race of nearby) {
      if (picked.size >= COUNT) break
      if (!picked.has(race.slug)) picked.set(race.slug, { race, reason: 'nearby' })
    }
  }

  const soonPool = races
    .filter((race) => race.status === '접수중' && daysUntil(race.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, SOON_WINDOW)
  const soon = shuffle(soonPool)
  for (const race of soon) {
    if (picked.size >= COUNT) break
    if (!picked.has(race.slug)) picked.set(race.slug, { race, reason: 'soon' })
  }

  return [...picked.values()]
}
