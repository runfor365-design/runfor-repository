import { createClient } from '@supabase/supabase-js'

/**
 * service_role 키로 RLS를 우회하는 쓰기 전용 클라이언트.
 * 반드시 서버 라우트에서, 로그인 세션을 먼저 확인한 뒤에만 사용한다.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}
