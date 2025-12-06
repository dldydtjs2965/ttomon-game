import type {
  DailyCertification,
  CohortInfo,
  CohortMember,
  UserHeatmapData,
  UserWeeklyCount,
  CohortHeatmapResponse,
} from "./types"
import { formatDate, getWeekBounds } from "./utils"

/**
 * Mock 데이터 생성 - 최근 12주치 인증 데이터
 * 실제 구현 시 이 파일을 Supabase 연동으로 교체
 */

function generateMockCertifications(): DailyCertification[] {
  const certifications: DailyCertification[] = []
  const today = new Date()
  const { start: currentWeekStart } = getWeekBounds(today)

  // 12주치 데이터 생성
  for (let weekOffset = 0; weekOffset < 12; weekOffset++) {
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(weekStart.getDate() - weekOffset * 7)

    // 각 주별로 랜덤하게 0~2회 인증
    // 최근 주일수록 인증 확률 높임 (동기부여 데모용)
    const certificationDays: number[] = []
    const baseChance = weekOffset < 4 ? 0.8 : 0.5

    // 일주일 중 랜덤한 날짜 선택
    const availableDays = [0, 1, 2, 3, 4, 5, 6]

    // 이번 주는 오늘까지만
    const maxDay = weekOffset === 0 ? today.getDay() : 6
    const filteredDays = availableDays.filter(d => {
      // 일요일(0)을 6으로 변환하여 월~일 순서로
      const adjustedDay = d === 0 ? 6 : d - 1
      return adjustedDay <= (maxDay === 0 ? 6 : maxDay - 1 || 6)
    })

    // 주 2회 인증 목표에 맞춰 데이터 생성
    if (Math.random() < baseChance && filteredDays.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredDays.length)
      certificationDays.push(filteredDays[randomIndex])
    }

    if (Math.random() < baseChance && filteredDays.length > 1) {
      let secondDay: number
      do {
        secondDay = filteredDays[Math.floor(Math.random() * filteredDays.length)]
      } while (certificationDays.includes(secondDay))
      certificationDays.push(secondDay)
    }

    // 인증 데이터 추가
    for (const dayOfWeek of certificationDays) {
      const certificationDate = new Date(weekStart)
      // 월요일 기준으로 오프셋 계산
      const dayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      certificationDate.setDate(weekStart.getDate() + dayOffset)

      // 미래 날짜는 제외
      if (certificationDate <= today) {
        certifications.push({
          date: formatDate(certificationDate),
          verified: true,
        })
      }
    }
  }

  return certifications.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

// 고정된 Mock 데이터 (재현 가능한 데모용)
export const MOCK_CERTIFICATIONS: DailyCertification[] = (() => {
  const today = new Date()
  const { start: currentWeekStart } = getWeekBounds(today)
  const certifications: DailyCertification[] = []

  // 이번 주: 월요일에 1회 인증 (진행 중)
  const thisMonday = new Date(currentWeekStart)
  certifications.push({
    date: formatDate(thisMonday),
    verified: true,
  })

  // 지난 3주: 모두 2회씩 인증 (연속 스트릭)
  for (let weekOffset = 1; weekOffset <= 3; weekOffset++) {
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(weekStart.getDate() - weekOffset * 7)

    // 월요일
    certifications.push({
      date: formatDate(weekStart),
      verified: true,
    })

    // 목요일
    const thursday = new Date(weekStart)
    thursday.setDate(weekStart.getDate() + 3)
    certifications.push({
      date: formatDate(thursday),
      verified: true,
    })
  }

  // 4주 전: 1회만 인증 (스트릭 끊김)
  const week4Start = new Date(currentWeekStart)
  week4Start.setDate(week4Start.getDate() - 4 * 7)
  certifications.push({
    date: formatDate(week4Start),
    verified: true,
  })

  // 5-6주 전: 2회씩 인증
  for (let weekOffset = 5; weekOffset <= 6; weekOffset++) {
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(weekStart.getDate() - weekOffset * 7)

    certifications.push({
      date: formatDate(weekStart),
      verified: true,
    })

    const wednesday = new Date(weekStart)
    wednesday.setDate(weekStart.getDate() + 2)
    certifications.push({
      date: formatDate(wednesday),
      verified: true,
    })
  }

  // 7주 전: 인증 없음

  // 8-10주 전: 간헐적 인증
  for (let weekOffset = 8; weekOffset <= 10; weekOffset++) {
    if (weekOffset % 2 === 0) {
      const weekStart = new Date(currentWeekStart)
      weekStart.setDate(weekStart.getDate() - weekOffset * 7)

      certifications.push({
        date: formatDate(weekStart),
        verified: true,
      })

      if (Math.random() > 0.5) {
        const friday = new Date(weekStart)
        friday.setDate(weekStart.getDate() + 4)
        certifications.push({
          date: formatDate(friday),
          verified: true,
        })
      }
    }
  }

  return certifications.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
})()

// 동적 Mock 데이터 (매번 다른 결과)
export const generateDynamicMockData = generateMockCertifications

// ============================================
// 기수별 히트맵 Mock 데이터
// ============================================

/** Mock 기수 정보 */
export const MOCK_COHORT: CohortInfo = {
  id: 1,
  name: "1기 또몬스터디",
  startDate: "2024-11-04",
  endDate: "2024-12-01",
}

/** Mock 멤버 목록 (12명) */
export const MOCK_MEMBERS: CohortMember[] = [
  { id: "me", name: "나", isCurrentUser: true },
  { id: "user1", name: "김철수", isCurrentUser: false },
  { id: "user2", name: "이영희", isCurrentUser: false },
  { id: "user3", name: "박민수", isCurrentUser: false },
  { id: "user4", name: "최지은", isCurrentUser: false },
  { id: "user5", name: "정우성", isCurrentUser: false },
  { id: "user6", name: "한지민", isCurrentUser: false },
  { id: "user7", name: "송중기", isCurrentUser: false },
  { id: "user8", name: "전지현", isCurrentUser: false },
  { id: "user9", name: "공유님", isCurrentUser: false },
  { id: "user10", name: "손예진", isCurrentUser: false },
  { id: "user11", name: "현빈님", isCurrentUser: false },
]

/** 사용자별 주차 인증 데이터 생성 (랜덤) */
function generateUserWeeklyData(userId: string): UserWeeklyCount[] {
  const weeklyData: UserWeeklyCount[] = []

  for (let week = 1; week <= 4; week++) {
    // 랜덤 인증 횟수 (0~7)
    // 현재 유저는 더 높은 확률
    const isCurrentUser = userId === "me"
    const baseChance = isCurrentUser ? 0.7 : 0.5

    let count = 0
    if (Math.random() < baseChance) {
      // 최소 1회 이상
      count = Math.floor(Math.random() * 7) + 1
    }

    weeklyData.push({
      weekNumber: week,
      count,
    })
  }

  return weeklyData
}

/** 고정된 Mock 히트맵 데이터 (재현 가능) */
export const MOCK_USER_HEATMAP_DATA: UserHeatmapData[] = [
  // 나 (현재 사용자)
  {
    user: MOCK_MEMBERS[0],
    weeklyData: [
      { weekNumber: 1, count: 5 },
      { weekNumber: 2, count: 7 },
      { weekNumber: 3, count: 3 },
      { weekNumber: 4, count: 1 },
    ],
  },
  // 김철수
  {
    user: MOCK_MEMBERS[1],
    weeklyData: [
      { weekNumber: 1, count: 7 },
      { weekNumber: 2, count: 6 },
      { weekNumber: 3, count: 7 },
      { weekNumber: 4, count: 4 },
    ],
  },
  // 이영희
  {
    user: MOCK_MEMBERS[2],
    weeklyData: [
      { weekNumber: 1, count: 5 },
      { weekNumber: 2, count: 2 },
      { weekNumber: 3, count: 6 },
      { weekNumber: 4, count: 0 },
    ],
  },
  // 박민수
  {
    user: MOCK_MEMBERS[3],
    weeklyData: [
      { weekNumber: 1, count: 3 },
      { weekNumber: 2, count: 0 },
      { weekNumber: 3, count: 2 },
      { weekNumber: 4, count: 1 },
    ],
  },
  // 최지은
  {
    user: MOCK_MEMBERS[4],
    weeklyData: [
      { weekNumber: 1, count: 0 },
      { weekNumber: 2, count: 1 },
      { weekNumber: 3, count: 0 },
      { weekNumber: 4, count: 0 },
    ],
  },
  // 정우성
  {
    user: MOCK_MEMBERS[5],
    weeklyData: [
      { weekNumber: 1, count: 7 },
      { weekNumber: 2, count: 7 },
      { weekNumber: 3, count: 7 },
      { weekNumber: 4, count: 5 },
    ],
  },
  // 한지민
  {
    user: MOCK_MEMBERS[6],
    weeklyData: [
      { weekNumber: 1, count: 4 },
      { weekNumber: 2, count: 5 },
      { weekNumber: 3, count: 3 },
      { weekNumber: 4, count: 2 },
    ],
  },
  // 송중기
  {
    user: MOCK_MEMBERS[7],
    weeklyData: [
      { weekNumber: 1, count: 2 },
      { weekNumber: 2, count: 3 },
      { weekNumber: 3, count: 1 },
      { weekNumber: 4, count: 0 },
    ],
  },
  // 전지현
  {
    user: MOCK_MEMBERS[8],
    weeklyData: [
      { weekNumber: 1, count: 6 },
      { weekNumber: 2, count: 5 },
      { weekNumber: 3, count: 7 },
      { weekNumber: 4, count: 6 },
    ],
  },
  // 공유님
  {
    user: MOCK_MEMBERS[9],
    weeklyData: [
      { weekNumber: 1, count: 1 },
      { weekNumber: 2, count: 2 },
      { weekNumber: 3, count: 0 },
      { weekNumber: 4, count: 1 },
    ],
  },
  // 손예진
  {
    user: MOCK_MEMBERS[10],
    weeklyData: [
      { weekNumber: 1, count: 5 },
      { weekNumber: 2, count: 6 },
      { weekNumber: 3, count: 4 },
      { weekNumber: 4, count: 3 },
    ],
  },
  // 현빈님
  {
    user: MOCK_MEMBERS[11],
    weeklyData: [
      { weekNumber: 1, count: 7 },
      { weekNumber: 2, count: 7 },
      { weekNumber: 3, count: 6 },
      { weekNumber: 4, count: 7 },
    ],
  },
]

/** Mock 기수 히트맵 응답 생성 (페이지네이션 포함) */
export function getMockCohortHeatmapResponse(page: number = 0, pageSize: number = 4): CohortHeatmapResponse {
  const currentUser = MOCK_USER_HEATMAP_DATA.find(d => d.user.isCurrentUser)!
  const otherUsersAll = MOCK_USER_HEATMAP_DATA.filter(d => !d.user.isCurrentUser)

  const totalPages = Math.ceil(otherUsersAll.length / pageSize)
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize
  const otherUsers = otherUsersAll.slice(startIndex, endIndex)

  return {
    cohort: MOCK_COHORT,
    currentUser,
    otherUsers,
    pagination: {
      currentPage: page,
      totalPages,
      hasNext: page < totalPages - 1,
      hasPrev: page > 0,
    },
  }
}
