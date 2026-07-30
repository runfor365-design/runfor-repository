import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body.slug !== 'string' || typeof body.추천여부 !== 'boolean') {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('races').update({ 추천여부: body.추천여부 }).eq('slug', body.slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
