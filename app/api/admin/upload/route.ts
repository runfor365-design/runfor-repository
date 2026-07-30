import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const REQUIRED_FIELDS = ['slug', '대회명', '날짜'] as const
const ALLOWED_FIELDS = [
  'slug',
  '대회명',
  '날짜',
  '집결',
  '종목배열',
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
] as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '올바른 JSON 파일이 아닙니다.' }, { status: 400 })
  }

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ error: 'JSON 배열(1건 이상) 형태여야 합니다.' }, { status: 400 })
  }

  const rows: Record<string, unknown>[] = []
  for (const [index, item] of body.entries()) {
    if (typeof item !== 'object' || item === null) {
      return NextResponse.json({ error: `${index + 1}번째 항목이 객체가 아닙니다.` }, { status: 400 })
    }
    const record = item as Record<string, unknown>

    for (const field of REQUIRED_FIELDS) {
      if (!record[field]) {
        return NextResponse.json(
          { error: `${index + 1}번째 항목에 필수 필드(${field})가 없습니다.` },
          { status: 400 },
        )
      }
    }
    if (typeof record.날짜 === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(record.날짜)) {
      return NextResponse.json(
        { error: `${index + 1}번째 항목의 날짜는 YYYY-MM-DD 형식이어야 합니다.` },
        { status: 400 },
      )
    }
    if (record.종목배열 !== undefined && !Array.isArray(record.종목배열)) {
      return NextResponse.json(
        { error: `${index + 1}번째 항목의 종목배열은 배열이어야 합니다.` },
        { status: 400 },
      )
    }

    const row: Record<string, unknown> = {}
    for (const field of ALLOWED_FIELDS) {
      if (record[field] !== undefined) row[field] = record[field]
    }
    rows.push(row)
  }

  const admin = createAdminClient()
  const { error } = await admin.from('races').upsert(rows, { onConflict: 'slug' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, count: rows.length })
}
