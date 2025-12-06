/**
 * 인증 시스템 타입 정의
 */

/** 일별 인증 기록 */
export interface DailyCertification {
  date: string // YYYY-MM-DD
  verified: boolean
  imageUrl?: string // 선택적 (슬랙에서 온 이미지)
}

/** 주간 요약 */
export interface WeekSummary {
  weekStart: string // YYYY-MM-DD (월요일)
  weekEnd: string // YYYY-MM-DD (일요일)
  certificationCount: number // 0, 1, 2
  isComplete: boolean // count >= 2
}

/** 스트릭 정보 */
export interface StreakInfo {
  currentStreak: number // 현재 연속 주
  longestStreak: number // 최고 기록
  isActive: boolean // 이번 주 완료 여부
}

/** 인증 데이터 전체 */
export interface CertificationData {
  certifications: DailyCertification[]
  weeklySummaries: WeekSummary[]
  streak: StreakInfo
  todayCertified: boolean
  currentWeekCount: number
}

/** 인증 API 인터페이스 (추후 실제 구현으로 교체 가능) */
export interface CertificationApi {
  getCertifications(userId: string, weeks: number): Promise<DailyCertification[]>
  getCertificationsByWeek(userId: string, weekNumber: number, seasonId?: number): Promise<Certification[]>
  getWeeklySummaries(userId: string, weeks: number): Promise<WeekSummary[]>
  getStreakInfo(userId: string): Promise<StreakInfo>
}

/** 인증 기록 (DB 기반) */
export interface Certification {
  id: number
  createdAt: string
  updatedAt: string | null
  seasonId: number | null
  userId: number | null
  weekNumber: number | null
  content: string | null
  certificationDate: string | null // YYYY-MM-DD
}

// ============================================
// 기수별 히트맵 관련 타입
// ============================================

/** 기수 정보 */
export interface CohortInfo {
  id: number
  name: string // "1기 또몬스터디"
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

/** 기수 멤버 정보 */
export interface CohortMember {
  id: string
  name: string
  isCurrentUser: boolean
}

/** 사용자별 주차 인증 횟수 */
export interface UserWeeklyCount {
  weekNumber: number // 1, 2, 3, 4
  count: number // 0~7 (해당 주 인증 횟수)
}

/** 사용자별 히트맵 데이터 */
export interface UserHeatmapData {
  user: CohortMember
  weeklyData: UserWeeklyCount[]
}

/** 페이지네이션 정보 */
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/** 기수 히트맵 전체 응답 (서버에서 페이지네이션 처리) */
export interface CohortHeatmapResponse {
  cohort: CohortInfo
  currentUser: UserHeatmapData // 나의 데이터 (항상 포함)
  otherUsers: UserHeatmapData[] // 현재 페이지의 다른 사용자들
  pagination: PaginationInfo
}
