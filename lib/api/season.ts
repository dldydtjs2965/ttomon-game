import { createBrowserSupabase } from "@/lib/supabase/browser"
import type { DbSeason } from "@/lib/types/database"

/**
 * 현재 활성화된 시즌 조회
 */
export async function getActiveSeason(): Promise<DbSeason | null> {
  const supabase = createBrowserSupabase()

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single()

  if (error) {
    console.warn("Active season not found:", error.message)
    return null
  }

  return data as DbSeason
}

/**
 * 시즌 ID로 시즌 정보 조회
 */
export async function getSeasonById(seasonId: number): Promise<DbSeason | null> {
  const supabase = createBrowserSupabase()

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("id", seasonId)
    .single()

  if (error) {
    console.warn("Season not found:", error.message)
    return null
  }

  return data as DbSeason
}

/**
 * 시즌의 현재 주차 계산
 * @param season 시즌 정보
 * @returns 현재 주차 (1부터 시작), 시즌 시작 전이면 0, 종료 후면 week_count
 */
export function getCurrentWeekNumber(season: DbSeason): number {
  if (!season.start_date) return 0

  const startDate = new Date(season.start_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  startDate.setHours(0, 0, 0, 0)

  // 시즌 시작 전
  if (today < startDate) return 0

  // 시즌 종료 후
  if (season.end_date) {
    const endDate = new Date(season.end_date)
    endDate.setHours(0, 0, 0, 0)
    if (today > endDate) return season.week_count ?? 0
  }

  // 현재 주차 계산 (시작일 기준)
  const diffTime = today.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const weekNumber = Math.floor(diffDays / 7) + 1

  // week_count를 초과하지 않도록
  if (season.week_count && weekNumber > season.week_count) {
    return season.week_count
  }

  return weekNumber
}
