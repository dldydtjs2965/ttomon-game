"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CohortHeatmapResponse } from "@/lib/certification"
import { formatDateRange } from "@/lib/certification"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UserRow } from "./user-row"

import { Skeleton } from "@/components/ui/skeleton"
import { useCohortHeatmap } from "@/hooks/use-certification-data"

interface CohortHeatmapProps {
  seasonId?: number
  className?: string
}

export function CohortHeatmap({ seasonId, className }: CohortHeatmapProps) {
  const {
    data,
    isLoading,
    error,
    setPage,
  } = useCohortHeatmap({ pageSize: 4, seasonId })

  if (isLoading && !data) {
    return <CohortHeatmapSkeleton className={className} />
  }

  if (error || !data) {
    return null // 에러 상황 처리는 상위 결정을 따르거나 여기서 조용히 실패
  }

  return (
    <CohortHeatmapDisplay
      data={data}
      onPageChange={setPage}
      className={className}
      isLoading={isLoading}
    />
  )
}

interface CohortHeatmapDisplayProps {
  data: CohortHeatmapResponse
  onPageChange?: (page: number) => void
  className?: string
  isLoading?: boolean
}

function CohortHeatmapDisplay({
  data,
  onPageChange,
  className,
  isLoading,
}: CohortHeatmapDisplayProps) {
  const { cohort, currentUser, otherUsers, pagination } = data

  const handlePrevPage = () => {
    if (pagination.hasPrev && onPageChange) {
      onPageChange(pagination.currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination.hasNext && onPageChange) {
      onPageChange(pagination.currentPage + 1)
    }
  }

  // 주차 헤더 생성 (currentUser의 weeklyData 기준)
  const weekHeaders = currentUser.weeklyData.map((w) => `${w.weekNumber}주차`)

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          {cohort.name}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({formatDateRange(cohort.startDate, cohort.endDate)})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 주차 헤더 */}
        <div className="flex items-center gap-3">
          <div className="w-16 md:w-20" /> {/* 이름 공간 */}
          <div className="flex gap-1.5">
            {weekHeaders.map((header) => (
              <div
                key={header}
                className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center text-xs text-muted-foreground"
              >
                {header}
              </div>
            ))}
          </div>
        </div>

        {/* 나의 행 (상단 고정) */}
        <UserRow data={currentUser} isCurrentUser />

        <Separator />

        {/* 다른 사용자 섹션 (페이지네이션) */}
        <div className="space-y-2">
          {/* 페이지네이션 컨트롤 */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevPage}
              disabled={!pagination.hasPrev || isLoading}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">이전 페이지</span>
            </Button>

            <span className="text-xs text-muted-foreground">
              {pagination.currentPage + 1}/{pagination.totalPages} 페이지
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={!pagination.hasNext || isLoading}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">다음 페이지</span>
            </Button>
          </div>

          {/* 사용자 목록 */}
          <div className={cn("space-y-2 transition-opacity duration-200", isLoading && "opacity-50 pointer-events-none")}>
            {otherUsers.map((userData) => (
              <UserRow key={userData.user.id} data={userData} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CohortHeatmapSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* 헤더 */}
          <Skeleton className="h-5 w-48" />

          {/* 주차 헤더 */}
          <div className="flex items-center gap-3">
            <div className="w-16 md:w-20" />
            <div className="flex gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 md:h-12 md:w-12" />
              ))}
            </div>
          </div>

          {/* 나의 행 */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16 md:w-20" />
            <div className="flex gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 md:h-12 md:w-12 rounded-md" />
              ))}
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          {/* 다른 사용자들 */}
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-3">
              <Skeleton className="h-4 w-16 md:w-20" />
              <div className="flex gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 md:h-12 md:w-12 rounded-md" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
