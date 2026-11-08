'use client'

import { getRaceStatus } from '@/lib/date'
import { useToday } from '@/lib/use-today'

/** 상세페이지 상태 표시. 페이지가 캐시돼 있어도 방문한 날(한국 시간) 기준으로 대회예정/종료를 보여준다. */
export default function RaceStatus({
  date,
  serverToday,
  badge = false,
}: {
  date: string
  serverToday: string
  badge?: boolean
}) {
  const status = getRaceStatus(date, useToday(serverToday))
  return badge ? (
    <span className={`status-badge status-${status}`}>{status}</span>
  ) : (
    <strong>{status}</strong>
  )
}
