"use client"

import { cn } from "@/lib/utils"
import {
  getCurrentWeekDates,
  getDayName,
  formatDate,
  isToday,
  isFutureDate,
} from "@/lib/verification"
import type { DailyVerification } from "@/lib/verification"

interface WeekDayDotsProps {
  verifications: DailyVerification[]
  className?: string
}

export function WeekDayDots({ verifications, className }: WeekDayDotsProps) {
  const weekDates = getCurrentWeekDates()
  const verifiedDates = new Set(
    verifications.filter((v) => v.verified).map((v) => v.date)
  )

  return (
    <div className={cn("flex gap-2", className)}>
      {weekDates.map((date) => {
        const dateStr = formatDate(date)
        const isVerified = verifiedDates.has(dateStr)
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
                isVerified && "bg-primary",
                // 오늘 (미인증)
                !isVerified && isTodayDate && "border-2 border-dashed border-primary/50 bg-primary/10",
                // 미래
                !isVerified && isFuture && "bg-muted/30",
                // 과거 미인증
                !isVerified && !isTodayDate && !isFuture && "bg-muted/50"
              )}
            >
              {isVerified && (
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
