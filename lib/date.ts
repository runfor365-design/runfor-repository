import type { RegistrationStatus } from '@/types/race'

export function normalizeRaceDate(exact: string | undefined, display: string, source: string) {
  if (exact && /^\d{4}-\d{2}-\d{2}$/.test(exact)) return exact
  const year = source.match(/(20\d{2})/)?.[1] ?? String(new Date().getFullYear())
  const match = display.match(/(\d{1,2})월\s*(\d{1,2})일/)
  if (!match) return `${year}-01-01`
  return `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
}

export function normalizeStatus(status: string): RegistrationStatus {
  if (status.includes('예정')) return '접수예정'
  if (status.includes('마감') || status.includes('품절') || status.includes('중단'))
    return '접수마감'
  return '접수중'
}

export function formatKoreanDate(date: string, withYear = true) {
  return new Intl.DateTimeFormat('ko-KR', {
    ...(withYear ? { year: 'numeric' } : {}),
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${date}T00:00:00`))
}

export function daysUntil(date: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${date}T00:00:00`)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}
