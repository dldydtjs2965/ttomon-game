import type { DailyCertification, WeekSummary, StreakInfo, CertificationApi, Certification } from "@/lib/certification/types"
import type { DbCertification } from "@/lib/types/database"
import { MOCK_CERTIFICATIONS } from "@/lib/certification/mock-data"
import { generateWeeklySummaries, calculateStreak } from "@/lib/certification/utils"

/**
 * DB 인증 데이터를 프론트엔드 타입으로 변환
 */
function mapDbCertification(db: DbCertification): Certification {
  return {
    id: db.id,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    seasonId: db.season_id,
    userId: db.user_id,
    weekNumber: db.week_number,
    content: db.content,
    certificationDate: db.certification_date,
  }
}

/**
 * 주차별 인증 데이터 조회 (API 호출)
 */
export async function fetchCertificationsByWeek(
  userId: string,
  weekNumber: number,
  seasonId?: number
): Promise<Certification[]> {
  const params = new URLSearchParams({
    userId,
    weekNumber: weekNumber.toString(),
  })

  if (seasonId) {
    params.append('seasonId', seasonId.toString())
  }

  const response = await fetch(`/api/certification?${params.toString()}`)

  if (!response.ok) {
    throw new Error('인증 데이터를 가져오는데 실패했습니다.')
  }

  const data = await response.json()
  return (data.certifications as DbCertification[]).map(mapDbCertification)
}

/**
 * 유저의 전체 인증 데이터 조회 (API 호출)
 */
export async function fetchCertifications(
  userId: string,
  seasonId?: number
): Promise<Certification[]> {
  const params = new URLSearchParams({ userId })

  if (seasonId) {
    params.append('seasonId', seasonId.toString())
  }

  const response = await fetch(`/api/certification?${params.toString()}`)

  if (!response.ok) {
    throw new Error('인증 데이터를 가져오는데 실패했습니다.')
  }

  const data = await response.json()

  return (data.certifications as DbCertification[]).map(mapDbCertification)
}

/**
 * Mock 인증 API 구현
 * 실제 Supabase 연동 시 이 구현을 교체
 */
export const mockCertificationApi: CertificationApi = {
  async getCertifications(
    _userId: string,
    weeks: number = 12
  ): Promise<DailyCertification[]> {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - weeks * 7)

    return MOCK_CERTIFICATIONS.filter((c) => {
      const cDate = new Date(c.date)
      return cDate >= startDate && cDate <= today
    })
  },

  async getCertificationsByWeek(
    userId: string,
    weekNumber: number,
    seasonId?: number
  ): Promise<Certification[]> {
    return fetchCertificationsByWeek(userId, weekNumber, seasonId)
  },

  async getWeeklySummaries(
    userId: string,
    weeks: number = 12
  ): Promise<WeekSummary[]> {
    const certifications = await this.getCertifications(userId, weeks)
    return generateWeeklySummaries(certifications, weeks)
  },

  async getStreakInfo(userId: string): Promise<StreakInfo> {
    const summaries = await this.getWeeklySummaries(userId, 52)
    return calculateStreak(summaries)
  },
}

/**
 * 현재 활성화된 API
 */
export const certificationApi = mockCertificationApi
