"use client"

import { cn } from "@/lib/utils"
import type { UserHeatmapData } from "@/lib/verification"
import { WeekCell } from "./week-cell"

interface UserRowProps {
  data: UserHeatmapData
  isCurrentUser?: boolean
  className?: string
}

export function UserRow({ data, isCurrentUser, className }: UserRowProps) {
  const { user, weeklyData } = data

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        isCurrentUser && "font-medium",
        className
      )}
    >
      {/* 사용자 이름 */}
      <div className="w-16 md:w-20 text-sm truncate">{user.name}</div>

      {/* 주차별 셀 */}
      <div className="flex gap-1.5">
        {weeklyData.map((week) => (
          <WeekCell
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            count={week.count}
            userName={user.name}
          />
        ))}
      </div>
    </div>
  )
}
