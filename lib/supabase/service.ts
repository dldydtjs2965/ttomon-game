import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase URL 또는 Service Key가 설정되어 있지 않습니다.");
  }

  // 서비스 키를 사용하여 RLS를 우회하는 클라이언트 생성
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}