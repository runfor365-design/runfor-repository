import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** 서버 컴포넌트/라우트 핸들러에서 로그인 세션을 확인할 때 쓰는 클라이언트. anon 키만 사용. */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component에서 호출되면 세션 쓰기가 막히는데, 미들웨어가 세션 갱신을 대신 처리한다.
          }
        },
      },
    },
  )
}
