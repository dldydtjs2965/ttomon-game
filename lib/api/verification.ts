import type { DailyVerification, WeekSummary, StreakInfo, VerificationApi } from "@/lib/verification/types"
import { MOCK_VERIFICATIONS } from "@/lib/verification/mock-data"
import { generateWeeklySummaries, calculateStreak } from "@/lib/verification/utils"

/**
 * Mock 인증 API 구현
 * 실제 Supabase 연동 시 이 구현을 교체
 */
export const mockVerificationApi: VerificationApi = {
  async getVerifications(
    _userId: string,
    weeks: number = 12
  ): Promise<DailyVerification[]> {
    // 실제 구현 시: Supabase에서 해당 기간의 인증 데이터 조회
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - weeks * 7)

    return MOCK_VERIFICATIONS.filter((v) => {
      const vDate = new Date(v.date)
      return vDate >= startDate && vDate <= today
    })
  },

  async getWeeklySummaries(
    userId: string,
    weeks: number = 12
  ): Promise<WeekSummary[]> {
    const verifications = await this.getVerifications(userId, weeks)
    return generateWeeklySummaries(verifications, weeks)
  },

  async getStreakInfo(userId: string): Promise<StreakInfo> {
    const summaries = await this.getWeeklySummaries(userId, 52) // 1년치로 계산
    return calculateStreak(summaries)
  },
}

/**
 * 현재 활성화된 API
 * TODO: 실제 Supabase 연동 시 supabaseVerificationApi로 교체
 */
export const verificationApi = mockVerificationApi

/**
 * Supabase 연동용 API 템플릿 (추후 구현)
 *
 * import { createBrowserSupabase } from "@/lib/supabase/browser"
 *
 * export const supabaseVerificationApi: VerificationApi = {
 *   async getVerifications(userId: string, weeks: number): Promise<DailyVerification[]> {
 *     const supabase = createBrowserSupabase()
 *     const startDate = new Date()
 *     startDate.setDate(startDate.getDate() - weeks * 7)
 *
 *     const { data, error } = await supabase
 *       .from('daily_verifications')
 *       .select('date, verified, image_url')
 *       .eq('user_id', userId)
 *       .gte('date', startDate.toISOString().split('T')[0])
 *       .order('date', { ascending: false })
 *
 *     if (error) throw error
 *     return data.map(d => ({
 *       date: d.date,
 *       verified: d.verified,
 *       imageUrl: d.image_url
 *     }))
 *   },
 *   // ... 나머지 메서드 구현
 * }
 */
