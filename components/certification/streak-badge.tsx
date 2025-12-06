"use client"

import { Flame, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StreakInfo } from "@/lib/certification"

interface StreakBadgeProps {
  streak: StreakInfo
  className?: string
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const { currentStreak, isActive } = streak

  // 스트릭이 없거나 끊어진 경우
  if (currentStreak === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg bg-muted/50 px-4 py-3",
          className
        )}
      >
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">새로운 시작!</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          이번 주부터 도전해보세요
        </p>
      </div>
    )
  }

  // 활성 스트릭
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Flame
          className={cn(
            "h-5 w-5 text-orange-500",
            isActive && "animate-pulse"
          )}
        />
        <span className="text-lg font-bold text-foreground">
          연속 {currentStreak}주째!
        </span>
      </div>
    </div>
  )
}
