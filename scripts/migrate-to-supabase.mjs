// 1회성 이관 스크립트: data/races.json + data/race-extra.json → Supabase races 테이블
// 실행: npm run migrate:supabase
// 사전 조건: supabase/migrations/0001_create_races.sql이 Supabase SQL Editor에서 이미 실행되어 있어야 함

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '환경 변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 설정하세요.',
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const races = JSON.parse(readFileSync(new URL('../data/races.json', import.meta.url), 'utf8'))
const extras = JSON.parse(
  readFileSync(new URL('../data/race-extra.json', import.meta.url), 'utf8'),
)
const extraBySlug = new Map(extras.map((item) => [item.slug, item]))

const seenSlugs = new Set()
const rows = []
for (const race of races) {
  if (!race.slug || seenSlugs.has(race.slug)) continue
  seenSlugs.add(race.slug)
  const extra = extraBySlug.get(race.slug)
  rows.push({
    slug: race.slug,
    대회명: race.대회명,
    날짜: race.날짜,
    집결: race.집결 || null,
    종목배열: [...new Set(race.종목배열 || [])],
    지역: race.지역 || null,
    장소: race.장소 || null,
    주최: race.주최 || null,
    접수시작: race.접수시작 || null,
    접수마감: race.접수마감 || null,
    홈페이지: race.홈페이지 || null,
    이메일: race.이메일 || null,
    전화: race.전화 || null,
    소개내용: race.소개내용 || null,
    상세링크: race.상세링크 || null,
    코스설명: extra?.코스설명 || null,
    난이도: extra?.난이도 || null,
    후기: extra?.후기 || null,
    팁: extra?.팁 || null,
    추천여부: Boolean(extra?.추천여부),
  })
}

console.log(`이관 대상 ${rows.length}건 (원본 ${races.length}건 중 중복/빈 slug 제외)`)

const BATCH_SIZE = 200
let done = 0
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  const { error } = await supabase.from('races').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`배치 ${Math.floor(i / BATCH_SIZE) + 1} 실패:`, error.message)
    process.exit(1)
  }
  done += batch.length
  console.log(`  ${done}/${rows.length} upsert 완료`)
}

const { count, error: countError } = await supabase
  .from('races')
  .select('*', { count: 'exact', head: true })

if (countError) {
  console.error('검증 조회 실패:', countError.message)
  process.exit(1)
}

console.log(`검증: races 테이블 현재 총 ${count}건`)
if (count !== rows.length) {
  console.warn(`⚠ 이관 대상(${rows.length})과 테이블 건수(${count})가 다릅니다. 확인이 필요합니다.`)
} else {
  console.log('✓ 이관 건수 일치')
}
