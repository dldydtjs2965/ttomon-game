import type { DailyVerification, WeekSummary, StreakInfo, VerificationService } from "./types"
import { MOCK_VERIFICATIONS } from "./mock-data"
import { generateWeeklySummaries, calculateStreak } from "./utils"

/**
 * Mock 인증 서비스 구현
 * 실제 Supabase 연동 시 이 구현을 교체
 */
export const mockVerificationService: VerificationService = {
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
 * 현재 활성화된 서비스
 * TODO: 실제 Supabase 연동 시 supabaseVerificationService로 교체
 */
export const verificationService = mockVerificationService

/**
 * Supabase 연동용 서비스 템플릿 (추후 구현)
 *
 * import { createClient } from "@/lib/supabase/client"
 *
 * export const supabaseVerificationService: VerificationService = {
 *   async getVerifications(userId: string, weeks: number): Promise<DailyVerification[]> {
 *     const supabase = createClient()
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
