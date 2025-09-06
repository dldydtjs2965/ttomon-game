"use client"

import { useState } from "react"
import type { Monster } from "@/lib/monsters"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface TeamStatusDisplayProps {
  monsters: Monster[]
  currentMonsterIndex: number
  position: "player" | "enemy"
  className?: string
}

export function TeamStatusDisplay({
  monsters,
  currentMonsterIndex,
  position,
  className = ""
}: TeamStatusDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!monsters || monsters.length === 0) {
    return null
  }

  const currentMonster = monsters[currentMonsterIndex]
  const remainingMonsters = monsters.filter((_, index) => index !== currentMonsterIndex && monsters[index].hp > 0)
  const faintedCount = monsters.filter(monster => monster.hp <= 0).length

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 간단한 팀 상태 표시 */}
      <Card className={`${position === "player" ? "border-blue-200 bg-blue-50/50" : "border-red-200 bg-red-50/50"} backdrop-blur-sm`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${position === "player" ? "text-blue-700" : "text-red-700"}`}>
                {position === "player" ? "내 팀" : "상대 팀"}
              </span>
              <Badge variant="secondary" className="text-xs">
                {monsters.length - faintedCount}/{monsters.length}
              </Badge>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                position === "player" 
                  ? "text-blue-600 hover:bg-blue-100" 
                  : "text-red-600 hover:bg-red-100"
              }`}
            >
              {isExpanded ? "접기" : "자세히"}
            </button>
          </div>
          
          {/* 몬스터 상태 아이콘들 */}
          <div className="flex items-center gap-1 mt-2">
            {monsters.map((monster, index) => {
              const isCurrent = index === currentMonsterIndex
              const isFainted = monster.hp <= 0
              const hpPercentage = (monster.hp / monster.maxHp) * 100
              
              return (
                <div key={monster.id} className="relative group">
                  <div 
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      isCurrent 
                        ? `${position === "player" ? "border-blue-500 bg-blue-100" : "border-red-500 bg-red-100"} ring-2 ${position === "player" ? "ring-blue-300" : "ring-red-300"}` 
                        : isFainted
                          ? "border-gray-400 bg-gray-200"
                          : `${position === "player" ? "border-blue-300 bg-blue-50" : "border-red-300 bg-red-50"}`
                    }`}
                    style={{
                      background: isFainted 
                        ? "#e5e7eb" 
                        : `conic-gradient(${
                            hpPercentage > 60 ? "#10b981" : hpPercentage > 30 ? "#f59e0b" : "#ef4444"
                          } ${hpPercentage}%, #f3f4f6 ${hpPercentage}%)`
                    }}
                  >
                    {isCurrent && (
                      <div className={`absolute inset-0 rounded-full animate-pulse ${
                        position === "player" ? "bg-blue-400" : "bg-red-400"
                      } opacity-30`} />
                    )}
                    
                    {isFainted && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">×</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 툴팁 */}
                  <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50`}>
                    <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      <div className="font-medium">{monster.name}</div>
                      <div>{monster.hp}/{monster.maxHp} HP</div>
                      {isCurrent && <div className="text-yellow-300">전투 중</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* 확장된 상태 - 상세 정보 */}
      {isExpanded && (
        <Card className={`${position === "player" ? "border-blue-200 bg-blue-50/70" : "border-red-200 bg-red-50/70"} backdrop-blur-sm`}>
          <CardContent className="p-3 space-y-2">
            <h4 className={`text-sm font-medium ${position === "player" ? "text-blue-700" : "text-red-700"}`}>
              팀 상세 정보
            </h4>
            
            {monsters.map((monster, index) => {
              const isCurrent = index === currentMonsterIndex
              const isFainted = monster.hp <= 0
              const hpPercentage = (monster.hp / monster.maxHp) * 100
              
              return (
                <div 
                  key={monster.id} 
                  className={`flex items-center gap-2 p-2 rounded text-xs transition-all ${
                    isCurrent 
                      ? `${position === "player" ? "bg-blue-100 border border-blue-300" : "bg-red-100 border border-red-300"}` 
                      : isFainted
                        ? "bg-gray-100 opacity-60"
                        : "bg-white/50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={monster.image || "/placeholder.svg"}
                      alt={monster.name}
                      className={`w-full h-full object-cover ${isFainted ? "grayscale" : ""}`}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`font-medium truncate ${isFainted ? "text-gray-500" : ""}`}>
                        {monster.name}
                      </span>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          전투중
                        </Badge>
                      )}
                      {isFainted && (
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          기절
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <Progress 
                        value={hpPercentage} 
                        className="h-1 flex-1"
                      />
                      <span className={`text-xs ${isFainted ? "text-gray-400" : "text-gray-600"}`}>
                        {monster.hp}/{monster.maxHp}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {remainingMonsters.length > 0 && (
              <div className={`text-xs ${position === "player" ? "text-blue-600" : "text-red-600"} mt-2`}>
                💪 대기 중인 몬스터: {remainingMonsters.length}마리
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}