"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StreakBadge } from "./streak-badge"
import { WeekDayDots } from "./week-day-dots"
import type { Certification, DailyCertification, StreakInfo } from "@/lib/certification"

interface WeeklyProgressCardProps {
  certifications: Certification[]
  currentWeekCount: number
  streak?: StreakInfo
  weekNumber?: number
  seasonName?: string
  className?: string
}

const WEEKLY_GOAL = 2

export function WeeklyProgressCard({
  certifications,
  currentWeekCount,
  streak,
  weekNumber,
  seasonName,
  className,
}: WeeklyProgressCardProps) {
  const progressPercent = Math.min((currentWeekCount / WEEKLY_GOAL) * 100, 100)
  const isComplete = currentWeekCount >= WEEKLY_GOAL

  const getProgressMessage = () => {
    if (isComplete) return "이번 주 목표 달성!"
    if (currentWeekCount === 1) return "1번 더 인증하면 완료!"
    return `${WEEKLY_GOAL}번 인증하세요`
  }

  const getWeekTitle = () => {
    if (seasonName && weekNumber) {
      return `${seasonName} ${weekNumber}주차`
    }
    if (weekNumber) {
      return `${weekNumber}주차`
    }
    return "이번 주"
  }

  // Convert to DailyCertification format for WeekDayDots
  const dailyCertifications: DailyCertification[] = certifications
    .filter(c => c.certificationDate)
    .map(c => ({
      date: c.certificationDate!,
      verified: true
    }))

  const defaultStreak: StreakInfo = {
    currentStreak: 0,
    longestStreak: 0,
    isActive: false
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* 좌측: 주간 진행률 */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {getWeekTitle()} 진행률
                </h3>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isComplete ? "text-primary" : "text-foreground"
                  )}
                >
                  {currentWeekCount}/{WEEKLY_GOAL}
                </span>
              </div>

              <Progress
                value={progressPercent}
                className={cn(
                  "h-2",
                  isComplete && "[&>div]:bg-primary"
                )}
              />

              <p
                className={cn(
                  "text-xs",
                  isComplete ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {getProgressMessage()}
              </p>
            </div>

            {/* 요일별 인증 현황 */}
            <WeekDayDots certifications={dailyCertifications} />
          </div>

          {/* 우측: 스트릭 뱃지 */}
          <StreakBadge
            streak={streak || defaultStreak}
            className="sm:ml-4 sm:w-40"
          />
        </div>
      </CardContent>
    </Card>
  )
}
