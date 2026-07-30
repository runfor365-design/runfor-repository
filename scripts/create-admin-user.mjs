// 관리자 계정 1개 생성 (1회성)
// 실행: npm run create:admin -- <이메일> <비밀번호>

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const [email, password] = process.argv.slice(2)

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '환경 변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 설정하세요.',
  )
  process.exit(1)
}
if (!email || !password) {
  console.error('사용법: npm run create:admin -- <이메일> <비밀번호>')
  process.exit(1)
}
if (password.length < 8) {
  console.error('비밀번호는 8자 이상이어야 합니다.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})

if (error) {
  console.error('관리자 계정 생성 실패:', error.message)
  process.exit(1)
}

console.log(`관리자 계정 생성 완료: ${data.user.email} (id: ${data.user.id})`)
