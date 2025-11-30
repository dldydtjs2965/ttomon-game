import axios from 'axios'
import { createBrowserSupabase } from '@/lib/supabase/browser'

// 기본 설정
const API_TIMEOUT = 10000 // 10초

const commonConfig = {
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
}

// 인증이 필요한 API 인스턴스
export const authenticatedApi = axios.create(commonConfig)

// 인증 인터셉터
authenticatedApi.interceptors.request.use(async (config) => {
  // Supabase 세션에서 토큰 가져오기
  const supabase = createBrowserSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  
  return config
})

// 비인증 API 인스턴스
export const publicApi = axios.create(commonConfig)
