import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeRegion } from './region-map'

/** 관리자 화면에서 다루는 races 테이블 한 행 (DB 컬럼 그대로) */
export interface AdminRace {
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
  공개여부: boolean
  숨김여부: boolean
  updated_at: string
}

const ADMIN_SELECT =
  'slug, 대회명, 날짜, 집결, 종목배열, 지역, 장소, 주최, 접수시작, 접수마감, 홈페이지, 이메일, 전화, 소개내용, 상세링크, 코스설명, 난이도, 후기, 팁, 추천여부, 공개여부, 숨김여부, updated_at'

/** 관리자 수정 API가 받아들이는 필드. 이 목록 밖의 키는 서버에서 버린다. */
export const TEXT_FIELDS = [
  '대회명',
  '날짜',
  '집결',
  '지역',
  '장소',
  '주최',
  '접수시작',
  '접수마감',
  '홈페이지',
  '이메일',
  '전화',
  '소개내용',
  '상세링크',
  '코스설명',
  '난이도',
  '후기',
  '팁',
] as const
export const BOOLEAN_FIELDS = ['추천여부', '공개여부', '숨김여부'] as const
export const DATE_FIELDS = ['날짜', '접수시작', '접수마감'] as const

/** 신청 접수(/api/apply-race)로 들어온 행은 slug가 apply-로 시작한다. */
export const isApplication = (race: Pick<AdminRace, 'slug'>) => race.slug.startsWith('apply-')

/** PostgREST 기본 1000행 제한을 넘기기 위해 range로 이어붙여 전체를 가져온다. */
export async function fetchAllAdminRaces(client: SupabaseClient): Promise<AdminRace[]> {
  const PAGE = 1000
  const rows: AdminRace[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await client
      .from('races')
      .select(ADMIN_SELECT)
      .order('날짜', { ascending: false })
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    const page = data as unknown as AdminRace[]
    rows.push(...page)
    if (page.length < PAGE) break
  }
  return rows
}

/** 이름 비교용: 공백·연도·회차·괄호기호·흔한 접미어를 걷어내고 소문자로 */
function nameKey(name: string) {
  return name
    .toLowerCase()
    .replace(/20\d{2}년?/g, '')
    .replace(/제?\d+(회|차)/g, '')
    .replace(/레이스|대회|러닝|마라톤|official/g, '')
    .replace(/[\s()[\]{}·,.\-_/'"!~]/g, '')
}

function bigrams(text: string) {
  const set = new Set<string>()
  for (let i = 0; i < text.length - 1; i++) set.add(text.slice(i, i + 2))
  return set
}

function similarName(a: string, b: string) {
  const ka = nameKey(a)
  const kb = nameKey(b)
  if (!ka || !kb) return false
  if (ka === kb || ka.includes(kb) || kb.includes(ka)) return true
  const ba = bigrams(ka)
  const bb = bigrams(kb)
  let shared = 0
  for (const gram of ba) if (bb.has(gram)) shared++
  return (2 * shared) / (ba.size + bb.size) >= 0.6
}

function homepageKey(url: string | null) {
  return (url ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
}

/**
 * 같은 날짜에 열리면서 (같은 지역 + 비슷한 이름) 이거나 (같은 홈페이지 주소)인 대회를 중복 의심으로 본다.
 * 한 묶음 안에서 A~B, B~C가 걸리면 A·B·C를 한 묶음으로 합친다.
 */
export function isLikelyDuplicate(a: AdminRace, b: AdminRace) {
  if (a.날짜 !== b.날짜) return false
  const sameRegion = normalizeRegion(a.지역 ?? '') === normalizeRegion(b.지역 ?? '')
  if (sameRegion && similarName(a.대회명, b.대회명)) return true
  const ha = homepageKey(a.홈페이지)
  return Boolean(ha) && ha === homepageKey(b.홈페이지)
}

export function findDuplicateGroups(races: AdminRace[]): AdminRace[][] {
  const byDate = new Map<string, AdminRace[]>()
  for (const race of races) {
    const list = byDate.get(race.날짜) ?? []
    list.push(race)
    byDate.set(race.날짜, list)
  }

  const groups: AdminRace[][] = []
  for (const sameDay of byDate.values()) {
    if (sameDay.length < 2) continue
    const parent = sameDay.map((_, i) => i)
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))
    for (let i = 0; i < sameDay.length; i++) {
      for (let j = i + 1; j < sameDay.length; j++) {
        if (isLikelyDuplicate(sameDay[i], sameDay[j])) parent[find(i)] = find(j)
      }
    }
    const buckets = new Map<number, AdminRace[]>()
    sameDay.forEach((race, i) => {
      const root = find(i)
      buckets.set(root, [...(buckets.get(root) ?? []), race])
    })
    for (const bucket of buckets.values()) if (bucket.length > 1) groups.push(bucket)
  }
  return groups.sort((a, b) => a[0].날짜.localeCompare(b[0].날짜))
}
