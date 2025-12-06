"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { WeeklyProgressCard } from "./weekly-progress-card"
import { CohortHeatmap } from "./cohort-heatmap"
import { useCurrentWeekCertifications } from "@/hooks/use-certification-data"

interface CertificationDashboardProps {
  className?: string
}

export function CertificationDashboard({ className }: CertificationDashboardProps) {
  const {
    certifications,
    count: currentWeekCount,
    weekNumber,
    season,
    isLoading: isLoadingCertification,
    error: certificationError,
  } = useCurrentWeekCertifications()

  const isLoading = isLoadingCertification
  const error = certificationError

  if (isLoading) {
    return <CertificationDashboardSkeleton className={className} />
  }

  if (error) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardContent className="py-6 text-center text-sm text-destructive">
          인증 데이터를 불러오는데 실패했습니다.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 주간 진행률 */}
      <WeeklyProgressCard
        certifications={certifications}
        currentWeekCount={currentWeekCount}
        weekNumber={weekNumber}
        seasonName={season ? `${season.season_number}기` : undefined}
      />

      {/* 기수별 히트맵 */}
      <CohortHeatmap seasonId={season?.id} />
    </div>
  )
}

function CertificationDashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* 주간 진행률 스켈레톤 */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <Skeleton className="h-2 w-3" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton className="h-20 w-full sm:w-40" />
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
