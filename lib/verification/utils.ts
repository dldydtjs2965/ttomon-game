import type { DailyVerification, WeekSummary, StreakInfo } from "./types"

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * 주어진 날짜가 속한 주의 월요일~일요일 범위를 반환
 */
export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  const day = d.getDay()
  // 일요일(0)이면 -6, 그 외는 1-day
  const diff = day === 0 ? -6 : 1 - day

  const start = new Date(d)
  start.setDate(d.getDate() + diff)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return { start, end }
}

/**
 * 주어진 날짜가 이번 주인지 확인
 */
export function isCurrentWeek(date: Date): boolean {
  const today = new Date()
  const { start: currentStart, end: currentEnd } = getWeekBounds(today)
  const targetDate = new Date(date)

  return targetDate >= currentStart && targetDate <= currentEnd
}

/**
 * 주어진 날짜가 오늘인지 확인
 */
export function isToday(date: Date | string): boolean {
  const today = new Date()
  const targetDate = typeof date === "string" ? new Date(date) : date

  return (
    today.getFullYear() === targetDate.getFullYear() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getDate() === targetDate.getDate()
  )
}

/**
 * 주어진 날짜가 미래인지 확인
 */
export function isFutureDate(date: Date | string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = typeof date === "string" ? new Date(date) : new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  return targetDate > today
}

/**
 * 인증 데이터로부터 주간 요약 생성
 */
export function generateWeeklySummaries(
  verifications: DailyVerification[],
  weeks: number = 12
): WeekSummary[] {
  const summaries: WeekSummary[] = []
  const today = new Date()
  const { start: currentWeekStart } = getWeekBounds(today)

  // 주어진 주 수만큼 반복
  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(weekStart.getDate() - i * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    // 해당 주의 인증 횟수 계산
    const weekVerifications = verifications.filter((v) => {
      const vDate = new Date(v.date)
      return v.verified && vDate >= weekStart && vDate <= weekEnd
    })

    summaries.push({
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      verificationCount: weekVerifications.length,
      isComplete: weekVerifications.length >= 2,
    })
  }

  return summaries
}

/**
 * 주간 요약으로부터 스트릭 정보 계산
 */
export function calculateStreak(summaries: WeekSummary[]): StreakInfo {
  if (summaries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isActive: false,
    }
  }

  // 최신순 정렬 (이번 주가 첫 번째)
  const sorted = [...summaries].sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  )

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // 현재 스트릭 계산 (연속으로 완료된 주)
  for (const week of sorted) {
    if (week.isComplete) {
      currentStreak++
    } else {
      break
    }
  }

  // 최고 스트릭 계산
  for (const week of sorted) {
    if (week.isComplete) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  return {
    currentStreak,
    longestStreak,
    isActive: sorted[0]?.isComplete ?? false,
  }
}

/**
 * 이번 주 인증 횟수 계산
 */
export function getCurrentWeekCount(verifications: DailyVerification[]): number {
  const today = new Date()
  const { start, end } = getWeekBounds(today)

  return verifications.filter((v) => {
    const vDate = new Date(v.date)
    return v.verified && vDate >= start && vDate <= end
  }).length
}

/**
 * 오늘 인증했는지 확인
 */
export function checkTodayVerified(verifications: DailyVerification[]): boolean {
  const todayStr = formatDate(new Date())
  return verifications.some((v) => v.date === todayStr && v.verified)
}

/**
 * 이번 주의 날짜 배열 반환 (월~일)
 */
export function getCurrentWeekDates(): Date[] {
  const { start } = getWeekBounds(new Date())
  const dates: Date[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }

  return dates
}

/**
 * 요일 이름 반환 (한글)
 */
export function getDayName(date: Date): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  return days[date.getDay()]
}

/**
 * 날짜를 한글로 포맷 (ex: "11월 25일")
 */
export function formatDateKorean(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

// ============================================
// 기수별 히트맵 관련 유틸리티
// ============================================

/**
 * 인증 횟수를 색상 농도 레벨로 변환
 * 0회 → 0 (빈색)
 * 1-2회 → 1 (연함)
 * 3-4회 → 2 (중간)
 * 5-7회 → 3 (진함)
 */
export function getIntensityLevel(count: number): 0 | 1 | 2 | 3 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  return 3
}

/**
 * 농도 레벨에 해당하는 CSS 클래스 반환
 */
export function getIntensityClass(level: 0 | 1 | 2 | 3): string {
  const classes: Record<0 | 1 | 2 | 3, string> = {
    0: "bg-muted/30",
    1: "bg-primary/25",
    2: "bg-primary/50",
    3: "bg-primary",
  }
  return classes[level]
}

/**
 * 기수 시작일부터 종료일까지의 주 수 계산
 */
export function getWeeksInCohort(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.ceil(diffDays / 7)
}

/**
 * 날짜 범위를 포맷 (ex: "11/4 ~ 12/1")
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}`
}
