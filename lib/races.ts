import { supabase } from './supabase'
import { getRaceStatus } from './date'
import { normalizeRegion } from './region-map'
import type { NormalizedRace, RaceExtra } from '@/types/race'

const SELECT_COLUMNS =
  'slug, 대회명, 날짜, 집결, 종목배열, 지역, 장소, 주최, 접수시작, 접수마감, 홈페이지, 이메일, 전화, 소개내용, 상세링크, 코스설명, 난이도, 후기, 팁, 추천여부, updated_at'

interface RaceRow {
  slug: string
  대회명: string
  날짜: string
  집결: string | null
  종목배열: string[]
  지역: string | null
  장소: string | null
  주최: string | null
  접수시작: string | null
  접수마감: string | null
  홈페이지: string | null
  이메일: string | null
  전화: string | null
  소개내용: string | null
  상세링크: string | null
  코스설명: string | null
  난이도: string | null
  후기: string | null
  팁: string | null
  추천여부: boolean
  updated_at: string
}

function normalize(row: RaceRow): NormalizedRace {
  const hasExtra = Boolean(row.코스설명 || row.난이도 || row.후기 || row.팁 || row.추천여부)
  const extra: RaceExtra | undefined = hasExtra
    ? {
        slug: row.slug,
        코스설명: row.코스설명 ?? undefined,
        난이도: row.난이도 ?? undefined,
        후기: row.후기 ?? undefined,
        팁: row.팁 ?? undefined,
        추천여부: row.추천여부,
      }
    : undefined

  return {
    대회명: row.대회명,
    slug: row.slug,
    종목: [...new Set(row.종목배열)],
    장소: row.장소 ?? '',
    장소상세: row.장소 ?? '',
    집결시간: row.집결 ?? '',
    집결정보: row.집결 ?? '',
    주최: row.주최 ?? undefined,
    접수기간: row.접수시작 && row.접수마감 ? `${row.접수시작} ~ ${row.접수마감}` : '',
    상세링크: row.상세링크 ?? '',
    신청링크: row.홈페이지 || row.상세링크 || undefined,
    문의이메일: row.이메일 ?? undefined,
    문의전화: row.전화 ?? undefined,
    소개내용: row.소개내용 ?? undefined,
    date: row.날짜,
    region: normalizeRegion(row.지역 ?? ''),
    status: getRaceStatus(row.날짜),
    extra,
    updatedAt: row.updated_at,
  }
}

const FETCH_PAGE_SIZE = 1000

export async function getRaces(): Promise<NormalizedRace[]> {
  const rows: RaceRow[] = []
  let from = 0

  // PostgREST는 한 번의 조회당 기본 최대 1000행만 반환하므로, 전체를 받을 때까지 range로 이어붙인다.
  while (true) {
    const { data, error } = await supabase
      .from('races')
      .select(SELECT_COLUMNS)
      .order('날짜', { ascending: true })
      .range(from, from + FETCH_PAGE_SIZE - 1)

    if (error) throw new Error(`대회 데이터를 불러오지 못했습니다: ${error.message}`)

    const page = data as unknown as RaceRow[]
    rows.push(...page)
    if (page.length < FETCH_PAGE_SIZE) break
    from += FETCH_PAGE_SIZE
  }

  return rows.map(normalize)
}

export async function getRace(slug: string): Promise<NormalizedRace | undefined> {
  const { data, error } = await supabase
    .from('races')
    .select(SELECT_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`대회 데이터를 불러오지 못했습니다: ${error.message}`)
  return data ? normalize(data as unknown as RaceRow) : undefined
}
