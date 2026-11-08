import type { RegistrationStatus } from '@/types/race'

export function normalizeRaceDate(exact: string | undefined, display: string, source: string) {
  if (exact && /^\d{4}-\d{2}-\d{2}$/.test(exact)) return exact
  const year = source.match(/(20\d{2})/)?.[1] ?? String(new Date().getFullYear())
  const match = display.match(/(\d{1,2})월\s*(\d{1,2})일/)
  if (!match) return `${year}-01-01`
  return `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
}

export function formatKoreanDate(date: string, withYear = true) {
  return new Intl.DateTimeFormat('ko-KR', {
    ...(withYear ? { year: 'numeric' } : {}),
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${date}T00:00:00`))
}

const KST_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * 한국 시간 기준 오늘 날짜(YYYY-MM-DD).
 * Vercel 서버는 UTC라 new Date()의 "오늘"이 한국보다 최대 9시간 늦으므로, 날짜 비교는 항상 이 값을 쓴다.
 */
export function todayKST(now = new Date()) {
  return KST_DATE.format(now)
}

/** 대회일까지 남은 일수. 두 날짜 모두 YYYY-MM-DD 문자열이라 실행 환경의 시간대와 무관하다. */
export function daysUntil(date: string, today = todayKST()) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000)
}

/** 대회 당일까지는 "대회예정", 다음날부터 "대회종료" */
export function getRaceStatus(date: string, today = todayKST()): RegistrationStatus {
  return daysUntil(date, today) >= 0 ? '대회예정' : '대회종료'
}
