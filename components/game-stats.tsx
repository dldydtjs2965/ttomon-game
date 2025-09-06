"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGameStore } from "@/hooks/use-game-store"
import { getAliveMonsters } from "@/lib/game-state"
import { Trophy, Heart, Zap, Users, Clock } from "lucide-react"

export function GameStats() {
  const { playerMonsters, enemyMonsters, turnCount, phase } = useGameStore()

  const playerAlive = getAliveMonsters(playerMonsters)
  const enemyAlive = getAliveMonsters(enemyMonsters)

  const playerTotalHp = playerAlive.reduce((sum, m) => sum + m.hp, 0)
  const playerMaxHp = playerAlive.reduce((sum, m) => sum + m.maxHp, 0)
  const playerHpPercentage = playerMaxHp > 0 ? (playerTotalHp / playerMaxHp) * 100 : 0

  const enemyTotalHp = enemyAlive.reduce((sum, m) => sum + m.hp, 0)
  const enemyMaxHp = enemyAlive.reduce((sum, m) => sum + m.maxHp, 0)
  const enemyHpPercentage = enemyMaxHp > 0 ? (enemyTotalHp / enemyMaxHp) * 100 : 0

  const playerTotalAttack = playerAlive.reduce((sum, m) => sum + m.attack, 0)
  const enemyTotalAttack = enemyAlive.reduce((sum, m) => sum + m.attack, 0)

  if (phase !== "battle") return null

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          배틀 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Turn Counter */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">턴 {turnCount}</span>
          </div>
        </div>

        {/* Team Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player Team */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-600 flex items-center gap-1">
              <Users className="w-4 h-4" />
              아군 팀
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500" />
                  체력
                </span>
                <span>
                  {playerTotalHp}/{playerMaxHp}
                </span>
              </div>
              <Progress value={playerHpPercentage} className="h-2" indicatorClassName="bg-blue-500" />

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" />총 공격력
                </span>
                <span>{playerTotalAttack}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-green-500" />
                  생존
                </span>
                <span>{playerAlive.length}마리</span>
              </div>
            </div>
          </div>

          {/* Enemy Team */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1">
              <Users className="w-4 h-4" />
              적군 팀
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500" />
                  체력
                </span>
                <span>
                  {enemyTotalHp}/{enemyMaxHp}
                </span>
              </div>
              <Progress value={enemyHpPercentage} className="h-2" indicatorClassName="bg-red-500" />

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" />총 공격력
                </span>
                <span>{enemyTotalAttack}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-green-500" />
                  생존
                </span>
                <span>{enemyAlive.length}마리</span>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Advantage Indicator */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">전투 우세</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600">아군</span>
            <Progress
              value={playerTotalHp > enemyTotalHp ? 75 : playerTotalHp === enemyTotalHp ? 50 : 25}
              className="flex-1 h-2"
              indicatorClassName={
                playerTotalHp > enemyTotalHp
                  ? "bg-blue-500"
                  : playerTotalHp === enemyTotalHp
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }
            />
            <span className="text-xs text-red-600">적군</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
