import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const REQUIRED_FIELDS = [
  '대회명',
  '날짜',
  '집결',
  '종목',
  '지역',
  '장소',
  '주최',
  '접수시작',
  '접수마감',
  '홈페이지',
  '이메일',
  '전화',
  '소개내용',
] as const

/**
 * 공개 신청 접수 라우트. 로그인 불필요 — 누구나 호출 가능하므로
 * 절대 공개여부를 true로 저장하지 않는다(관리자가 /admin에서 승인해야 노출).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }
  const record = body as Record<string, unknown>

  for (const field of REQUIRED_FIELDS) {
    if (typeof record[field] !== 'string' || !record[field].toString().trim()) {
      return NextResponse.json({ error: `필수 항목(${field})이 비어 있습니다.` }, { status: 400 })
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(record.날짜))) {
    return NextResponse.json({ error: '날짜는 YYYY-MM-DD 형식이어야 합니다.' }, { status: 400 })
  }

  const 종목배열 = String(record.종목)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (!종목배열.length) {
    return NextResponse.json({ error: '종목을 1개 이상 선택해 주세요.' }, { status: 400 })
  }

  const row = {
    slug: `apply-${randomUUID()}`,
    대회명: record.대회명,
    날짜: record.날짜,
    집결: record.집결,
    종목배열,
    지역: record.지역,
    장소: record.장소,
    주최: record.주최,
    접수시작: record.접수시작 || null,
    접수마감: record.접수마감 || null,
    홈페이지: record.홈페이지 || null,
    이메일: record.이메일,
    전화: record.전화 || null,
    소개내용: record.소개내용 || null,
    공개여부: false,
  }

  const admin = createAdminClient()
  const { error } = await admin.from('races').insert(row)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
