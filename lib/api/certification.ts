import type { DailyCertification, WeekSummary, StreakInfo, CertificationApi } from "@/lib/certification/types"
import { MOCK_CERTIFICATIONS } from "@/lib/certification/mock-data"
import { generateWeeklySummaries, calculateStreak } from "@/lib/certification/utils"

/**
 * Mock 인증 API 구현
 * 실제 Supabase 연동 시 이 구현을 교체
 */
export const mockCertificationApi: CertificationApi = {
  async getCertifications(
    _userId: string,
    weeks: number = 12
  ): Promise<DailyCertification[]> {
    // 실제 구현 시: Supabase에서 해당 기간의 인증 데이터 조회
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - weeks * 7)

    return MOCK_CERTIFICATIONS.filter((c) => {
      const cDate = new Date(c.date)
      return cDate >= startDate && cDate <= today
    })
  },

  async getWeeklySummaries(
    userId: string,
    weeks: number = 12
  ): Promise<WeekSummary[]> {
    const certifications = await this.getCertifications(userId, weeks)
    return generateWeeklySummaries(certifications, weeks)
  },

  async getStreakInfo(userId: string): Promise<StreakInfo> {
    const summaries = await this.getWeeklySummaries(userId, 52) // 1년치로 계산
    return calculateStreak(summaries)
  },
}

/**
 * 현재 활성화된 API
 * TODO: 실제 Supabase 연동 시 supabaseCertificationApi로 교체
 */
export const certificationApi = mockCertificationApi

/**
 * Supabase 연동용 API 템플릿 (추후 구현)
 *
 * import { createBrowserSupabase } from "@/lib/supabase/browser"
 *
 * export const supabaseCertificationApi: CertificationApi = {
 *   async getCertifications(userId: string, weeks: number): Promise<DailyCertification[]> {
 *     const supabase = createBrowserSupabase()
 *     const startDate = new Date()
 *     startDate.setDate(startDate.getDate() - weeks * 7)
 *
 *     const { data, error } = await supabase
 *       .from('daily_certifications')
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
