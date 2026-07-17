import racesData from '@/data/races.json'
import extrasData from '@/data/race-extra.json'
import { normalizeRaceDate, normalizeStatus } from './date'
import { normalizeRegion } from './region-map'
import type { NormalizedRace, Race, RaceExtra } from '@/types/race'

export function getRaces(): NormalizedRace[] {
  const extras = new Map((extrasData as RaceExtra[]).map((item) => [item.slug, item]))
  return (racesData as Race[]).map((race) => ({
    ...race,
    date: normalizeRaceDate(race.날짜_정확, race.날짜, race.설명원문),
    region: normalizeRegion(race.설명원문),
    status: normalizeStatus(race.접수상태),
    extra: extras.get(race.slug),
  })).sort((a, b) => a.date.localeCompare(b.date))
}

export function getRace(slug: string) {
  return getRaces().find((race) => race.slug === slug)
}
