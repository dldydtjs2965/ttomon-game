"use client"

import { cn } from "@/lib/utils"
import { getIntensityLevel } from "@/lib/verification"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface WeekCellProps {
  weekNumber: number
  count: number
  userName?: string
  className?: string
}

export function WeekCell({
  weekNumber,
  count,
  userName,
  className,
}: WeekCellProps) {
  const intensityLevel = getIntensityLevel(count)

  const getCountText = () => {
    if (count === 0) return "인증 없음"
    return `${count}회 인증`
  }

  const ariaLabel = userName
    ? `${userName}님 ${weekNumber}주차: ${getCountText()}`
    : `${weekNumber}주차: ${getCountText()}`

  // opacity 값을 변수로 정의
  const opacityMap: Record<0 | 1 | 2 | 3, number> = {
    0: 0.15,  // 빈색
    1: 0.35,  // 연함
    2: 0.6,   // 중간
    3: 1,     // 진함
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "h-10 w-10 md:h-12 md:w-12 rounded-md transition-all cursor-default",
            intensityLevel === 0 ? "bg-muted" : "bg-primary",
            className
          )}
          style={{
            opacity: opacityMap[intensityLevel],
          }}
          aria-label={ariaLabel}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>{getCountText()}</p>
      </TooltipContent>
    </Tooltip>
  )
}
