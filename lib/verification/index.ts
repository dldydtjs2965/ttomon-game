// Types
export type {
  DailyVerification,
  WeekSummary,
  StreakInfo,
  VerificationData,
  VerificationService,
  // 기수별 히트맵 타입
  CohortInfo,
  CohortMember,
  UserWeeklyCount,
  UserHeatmapData,
  PaginationInfo,
  CohortHeatmapResponse,
} from "./types"

// Utils
export {
  formatDate,
  getWeekBounds,
  isCurrentWeek,
  isToday,
  isFutureDate,
  generateWeeklySummaries,
  calculateStreak,
  getCurrentWeekCount,
  checkTodayVerified,
  getCurrentWeekDates,
  getDayName,
  formatDateKorean,
  // 기수별 히트맵 유틸리티
  getIntensityLevel,
  getIntensityClass,
  getWeeksInCohort,
  formatDateRange,
} from "./utils"

// Mock Data
export {
  MOCK_VERIFICATIONS,
  generateDynamicMockData,
  // 기수별 히트맵 Mock 데이터
  MOCK_COHORT,
  MOCK_MEMBERS,
  MOCK_USER_HEATMAP_DATA,
  getMockCohortHeatmapResponse,
} from "./mock-data"

// Service
export { verificationService, mockVerificationService } from "@/lib/api/verification"
