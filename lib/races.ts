import racesData from '@/data/races.json'
import extrasData from '@/data/race-extra.json'
import { normalizeStatus } from './date'
import { normalizeRegion } from './region-map'
import type { NormalizedRace, RawRace, RaceExtra } from '@/types/race'

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

export function getRaces(): NormalizedRace[] {
  const extras = new Map((extrasData as RaceExtra[]).map((item) => [item.slug, item]))
  return (racesData as RawRace[])
    .map((race) => ({
      대회명: race.대회명,
      slug: race.slug,
      종목: [...new Set(race.종목배열)],
      장소: race.장소,
      장소상세: race.장소,
      집결시간: race.집결,
      집결정보: race.집결,
      주최: race.주최 || undefined,
      접수상태: race.접수상태,
      접수기간: `${race.접수시작} ~ ${race.접수마감}`,
      상세링크: race.상세링크,
      신청링크: race.홈페이지 || race.상세링크,
      문의이메일: race.이메일 || undefined,
      문의전화: race.전화 || undefined,
      소개내용: race.소개내용,
      이미지: race.이미지,
      date: isIsoDate(race.날짜) ? race.날짜 : `${new Date().getFullYear()}-01-01`,
      region: normalizeRegion(race.지역),
      status: normalizeStatus(race.접수상태),
      extra: extras.get(race.slug),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getRace(slug: string) {
  return getRaces().find((race) => race.slug === slug)
}
