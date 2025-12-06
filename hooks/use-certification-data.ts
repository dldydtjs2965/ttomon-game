"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchCertifications, fetchCertificationsByWeek } from "@/lib/api/certification"
import { getActiveSeason, getCurrentWeekNumber } from "@/lib/api/season"
import { getCurrentUserProfile } from "@/lib/api/user"
import { getMockCohortHeatmapResponse } from "@/lib/certification/mock-data"
import type {
  Certification,
  CohortHeatmapResponse,
} from "@/lib/certification"
import type { DbSeason } from "@/lib/types/database"
import { useState, useCallback, useEffect } from "react"

// ============================================
// 현재 시즌 정보 훅
// ============================================

interface UseCurrentSeasonReturn {
  season: DbSeason | null
  currentWeekNumber: number
  isLoading: boolean
  error: Error | null
}

export function useCurrentSeason(): UseCurrentSeasonReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['season', 'active'],
    queryFn: getActiveSeason,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  })

  const currentWeekNumber = data ? getCurrentWeekNumber(data) : 0

  return {
    season: data ?? null,
    currentWeekNumber,
    isLoading,
    error: error as Error | null,
  }
}

// ============================================
// 주차별 인증 데이터 훅
// ============================================

interface UseCertificationsByWeekOptions {
  weekNumber?: number
  seasonId?: number
}

interface UseCertificationsByWeekReturn {
  certifications: Certification[]
  count: number
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCertificationsByWeek(
  options: UseCertificationsByWeekOptions = {}
): UseCertificationsByWeekReturn {
  const { weekNumber, seasonId } = options
  const { user } = useAuth()

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
  } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: getCurrentUserProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const userId = userProfile?.id?.toString()

  const {
    data: certifications = [],
    isLoading: isLoadingCertifications,
    error,
    refetch,
  } = useQuery({
    queryKey: ['certifications', userId, weekNumber, seasonId],
    queryFn: async () => {
      if (!userId) return []
      if (weekNumber !== undefined) {
        return await fetchCertificationsByWeek(userId, weekNumber, seasonId)
      }
      return await fetchCertifications(userId, seasonId)
    },
    enabled: !!userId,
  })

  const handleRefetch = async () => {
    await refetch()
  }

  return {
    certifications,
    count: certifications.length,
    isLoading: isLoadingProfile || isLoadingCertifications,
    error: error as Error | null,
    refetch: handleRefetch,
  }
}

// ============================================
// 현재 주차 인증 데이터 훅 (편의용)
// ============================================

interface UseCurrentWeekCertificationsReturn {
  certifications: Certification[]
  count: number
  weekNumber: number
  season: DbSeason | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCurrentWeekCertifications(): UseCurrentWeekCertificationsReturn {
  const { season, currentWeekNumber, isLoading: isLoadingSeason } = useCurrentSeason()

  const {
    certifications,
    count,
    isLoading: isLoadingCertifications,
    error,
    refetch,
  } = useCertificationsByWeek({
    weekNumber: currentWeekNumber,
    seasonId: season?.id,
  })

  return {
    certifications,
    count,
    weekNumber: currentWeekNumber,
    season,
    isLoading: isLoadingSeason || isLoadingCertifications,
    error,
    refetch,
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

      // TODO: 실제 API로 교체
      // 현재는 Mock 데이터 사용
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
