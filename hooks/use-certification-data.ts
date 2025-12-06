"use client"

import { useQuery } from "@tanstack/react-query"
import {
  certificationQueryOptions,
} from "@/lib/api/query-options"
import {
  checkTodayCertified,
  getCurrentWeekCount,
} from "@/lib/certification"
import { getMockCohortHeatmapResponse } from "@/lib/certification/mock-data"
import type {
  CertificationData,
  DailyCertification,
  WeekSummary,
  StreakInfo,
  CohortHeatmapResponse,
} from "@/lib/certification"
import { useState, useCallback, useEffect } from "react"

interface UseCertificationDataOptions {
  weeks?: number
  userId?: string
}

interface UseCertificationDataReturn extends CertificationData {
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCertificationData(
  options: UseCertificationDataOptions = {}
): UseCertificationDataReturn {
  const { weeks = 12, userId = "mock-user" } = options

  // 1. 인증 데이터 쿼리
  const {
    data: certifications = [],
    isLoading: isLoadingCertifications,
    error: certificationError,
    refetch: refetchCertifications
  } = useQuery(certificationQueryOptions.list(userId, weeks))

  // 2. 주간 요약 쿼리
  const {
    data: weeklySummaries = [],
    isLoading: isLoadingSummaries,
    error: summaryError,
    refetch: refetchSummaries
  } = useQuery(certificationQueryOptions.summary(userId, weeks))

  // 3. 스트릭 정보 쿼리
  const {
    data: streak = { currentStreak: 0, longestStreak: 0, isActive: false },
    isLoading: isLoadingStreak,
    error: streakError,
    refetch: refetchStreak
  } = useQuery(certificationQueryOptions.streak(userId))

  // 파생 상태 계산
  const todayCertified = checkTodayCertified(certifications)
  const currentWeekCount = getCurrentWeekCount(certifications)

  const handleRefetch = async () => {
    await Promise.all([
      refetchCertifications(),
      refetchSummaries(),
      refetchStreak()
    ])
  }

  const isLoading = isLoadingCertifications || isLoadingSummaries || isLoadingStreak
  const error = (certificationError || summaryError || streakError) as Error | null

  return {
    certifications,
    weeklySummaries,
    streak,
    todayCertified,
    currentWeekCount,
    isLoading,
    error,
    refetch: handleRefetch,
  }
}

// ============================================
// 기수별 히트맵 데이터 훅
// ============================================

interface UseCohortHeatmapOptions {
  pageSize?: number
  initialPage?: number
}

interface UseCohortHeatmapReturn {
  data: CohortHeatmapResponse | null
  isLoading: boolean
  error: Error | null
  currentPage: number
  setPage: (page: number) => void
  refetch: () => Promise<void>
}

export function useCohortHeatmap(
  options: UseCohortHeatmapOptions = {}
): UseCohortHeatmapReturn {
  const { pageSize = 4, initialPage = 0 } = options

  const [data, setData] = useState<CohortHeatmapResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Mock 데이터 사용 (추후 실제 API로 교체)
      // 실제로는 서버에서 페이지네이션 처리
      const response = getMockCohortHeatmapResponse(currentPage, pageSize)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch cohort data"))
      console.error("[CohortHeatmap] Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  return {
    data,
    isLoading,
    error,
    currentPage,
    setPage,
    refetch: fetchData,
  }
}
