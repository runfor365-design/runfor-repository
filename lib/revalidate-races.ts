import { revalidatePath } from 'next/cache'

/**
 * 공개 페이지는 12시간 ISR이라, 관리자가 고친 내용이 바로 보이도록 해당 경로를 즉시 재생성한다.
 * slug를 넘기면 그 대회 상세페이지도 함께 갱신한다(삭제·숨김이면 404로 바뀐다).
 */
export function revalidateRacePages(slugs: string[] = []) {
  revalidatePath('/')
  revalidatePath('/sitemap.xml')
  // 대량 업로드면 상세페이지 전체를 한 번에 무효화한다.
  if (slugs.length > 50) revalidatePath('/race/[slug]', 'page')
  else for (const slug of slugs) revalidatePath(`/race/${slug}`)
}
