"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CohortHeatmapResponse } from "@/lib/certification"
import { formatDateRange } from "@/lib/certification"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UserRow } from "./user-row"

interface CohortHeatmapProps {
  data: CohortHeatmapResponse
  onPageChange?: (page: number) => void
  className?: string
}

export function CohortHeatmap({
  data,
  onPageChange,
  className,
}: CohortHeatmapProps) {
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
              disabled={!pagination.hasPrev}
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
              disabled={!pagination.hasNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">다음 페이지</span>
            </Button>
          </div>

          {/* 사용자 목록 */}
          <div className="space-y-2">
            {otherUsers.map((userData) => (
              <UserRow key={userData.user.id} data={userData} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
