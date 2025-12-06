"use client"

import { cn } from "@/lib/utils"
import {
  getCurrentWeekDates,
  getDayName,
  formatDate,
  isToday,
  isFutureDate,
} from "@/lib/certification"
import type { DailyCertification } from "@/lib/certification"

interface WeekDayDotsProps {
  certifications: DailyCertification[]
  className?: string
}

export function WeekDayDots({ certifications, className }: WeekDayDotsProps) {
  const weekDates = getCurrentWeekDates()
  const certifiedDates = new Set(
    certifications.filter((c) => c.verified).map((c) => c.date)
  )

  return (
    <div className={cn("flex gap-2", className)}>
      {weekDates.map((date) => {
        const dateStr = formatDate(date)
        const isCertified = certifiedDates.has(dateStr)
        const isTodayDate = isToday(date)
        const isFuture = isFutureDate(date)

        return (
          <div
            key={dateStr}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-[10px] text-muted-foreground">
              {getDayName(date)}
            </span>
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                // 인증 완료
                isCertified && "bg-primary",
                // 오늘 (미인증)
                !isCertified && isTodayDate && "border-2 border-dashed border-primary/50 bg-primary/10",
                // 미래
                !isCertified && isFuture && "bg-muted/30",
                // 과거 미인증
                !isCertified && !isTodayDate && !isFuture && "bg-muted/50"
              )}
            >
              {isCertified && (
                <svg
                  className="h-3 w-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
