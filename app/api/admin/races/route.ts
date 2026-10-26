import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BOOLEAN_FIELDS, DATE_FIELDS, TEXT_FIELDS } from '@/lib/admin-races'
import { revalidateRacePages } from '@/lib/revalidate-races'

const REQUIRED_TEXT = ['대회명', '날짜'] as const

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** 대회 수정 (승인·숨김·추천 토글도 이 경로로 처리) */
export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.slug !== 'string' || typeof body.fields !== 'object' || !body.fields) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }
  const input = body.fields as Record<string, unknown>
  const update: Record<string, unknown> = {}

  for (const field of TEXT_FIELDS) {
    if (!(field in input)) continue
    const value = input[field]
    if (value !== null && typeof value !== 'string') {
      return NextResponse.json({ error: `${field} 값이 올바르지 않습니다.` }, { status: 400 })
    }
    const trimmed = typeof value === 'string' ? value.trim() : ''
    if ((REQUIRED_TEXT as readonly string[]).includes(field) && !trimmed) {
      return NextResponse.json({ error: `${field}은(는) 비울 수 없습니다.` }, { status: 400 })
    }
    if (
      (DATE_FIELDS as readonly string[]).includes(field) &&
      trimmed &&
      !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ) {
      return NextResponse.json({ error: `${field}은(는) YYYY-MM-DD 형식이어야 합니다.` }, { status: 400 })
    }
    update[field] = trimmed || null
  }

  if ('종목배열' in input) {
    const list = input.종목배열
    if (!Array.isArray(list) || list.some((item) => typeof item !== 'string')) {
      return NextResponse.json({ error: '종목배열은 문자열 배열이어야 합니다.' }, { status: 400 })
    }
    update.종목배열 = [...new Set(list.map((item: string) => item.trim()).filter(Boolean))]
  }

  for (const field of BOOLEAN_FIELDS) {
    if (!(field in input)) continue
    if (typeof input[field] !== 'boolean') {
      return NextResponse.json({ error: `${field} 값이 올바르지 않습니다.` }, { status: 400 })
    }
    update[field] = input[field]
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: '변경할 내용이 없습니다.' }, { status: 400 })
  }

  const { data, error } = await createAdminClient()
    .from('races')
    .update(update)
    .eq('slug', body.slug)
    .select('slug')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: '대회를 찾을 수 없습니다.' }, { status: 404 })

  revalidateRacePages([body.slug])
  return NextResponse.json({ ok: true })
}

/** 완전 삭제 (신청 거절 포함). 수집 데이터는 races.json 재업로드 시 다시 들어올 수 있다. */
export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.slug !== 'string') {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { error } = await createAdminClient().from('races').delete().eq('slug', body.slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateRacePages([body.slug])
  return NextResponse.json({ ok: true })
}
