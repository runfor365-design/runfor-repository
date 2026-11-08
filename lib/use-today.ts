'use client'

import { useSyncExternalStore } from 'react'
import { todayKST } from './date'

const subscribe = () => () => {}

/**
 * 브라우저에서 본 "오늘"(한국 시간, YYYY-MM-DD).
 * 공개 페이지는 12시간 캐시되므로, 서버가 페이지를 만들 때 계산한 상태(대회예정/종료, D-day)는 하루가 지나도 그대로 남는다.
 * 서버가 렌더링한 날짜(serverToday)로 하이드레이션한 뒤, 방문 시점의 실제 날짜로 다시 그린다.
 */
export function useToday(serverToday: string) {
  return useSyncExternalStore(subscribe, () => todayKST(), () => serverToday)
}
