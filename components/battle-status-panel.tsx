"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Monster } from "@/lib/monsters"
import { Eye, Shield, Clock, Zap } from "lucide-react"

interface BattleStatusPanelProps {
  playerMonsters: Monster[]
  enemyMonsters: Monster[]
  currentTurn: "player" | "enemy"
}

export function BattleStatusPanel({
  playerMonsters,
  enemyMonsters,
  currentTurn
}: BattleStatusPanelProps) {
  const getActiveBuffs = (monster: Monster) => {
    const buffs = []

    if (monster.dodgeNextAttack) {
      buffs.push({
        type: "dodge",
        name: "회피 준비",
        chance: monster.dodgeChance || 50,
        icon: <Eye className="w-3 h-3" />,
        color: "bg-blue-100 text-blue-800 border-blue-200"
      })
    }

    if (monster.blockNextAttack) {
      buffs.push({
        type: "block",
        name: "방어 준비",
        reduction: (monster.blockReduction || 0.5) * 100,
        icon: <Shield className="w-3 h-3" />,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      })
    }

    return buffs
  }

  const renderMonsterStatus = (monsters: Monster[], title: string, isPlayer: boolean) => {
    const aliveMonsters = monsters.filter(m => m && m.hp > 0)

    if (aliveMonsters.length === 0) return null

    return (
      <div className="space-y-2">
        <h4 className={`text-sm font-semibold ${isPlayer ? 'text-blue-600' : 'text-red-600'}`}>
          {title}
        </h4>
        {aliveMonsters.map(monster => {
          const buffs = getActiveBuffs(monster)
          const activeCooldowns = monster.skillCooldowns?.filter(cd => cd > 0) || []

          if (buffs.length === 0 && activeCooldowns.length === 0) return null

          return (
            <div key={monster.id} className="space-y-1">
              <p className="text-xs font-medium text-gray-700">{monster.name}</p>

              {/* Active Buffs */}
              {buffs.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {buffs.map((buff, index) => (
                    <Badge
                      key={`${monster.id}-buff-${index}`}
                      variant="outline"
                      className={`text-xs px-2 py-1 ${buff.color}`}
                    >
                      {buff.icon}
                      <span className="ml-1">
                        {buff.name}
                        {buff.type === "dodge" && ` (${buff.chance}%)`}
                        {buff.type === "block" && ` (${buff.reduction}%↓)`}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Active Cooldowns */}
              {activeCooldowns.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {monster.skillCooldowns?.map((cd, skillIndex) => {
                    if (cd === 0) return null
                    const skill = monster.skills?.[skillIndex]
                    if (!skill) return null

                    return (
                      <Badge
                        key={`${monster.id}-cd-${skillIndex}`}
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {skill.name} ({cd})
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const playerBuffs = playerMonsters.flatMap(m => m ? getActiveBuffs(m) : [])
  const enemyBuffs = enemyMonsters.flatMap(m => m ? getActiveBuffs(m) : [])
  const hasAnyStatus = playerBuffs.length > 0 || enemyBuffs.length > 0

  // 아무 상태도 없으면 패널을 표시하지 않음
  if (!hasAnyStatus) return null

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            배틀 상태
          </h3>
          <Badge variant="outline" className={`text-xs ${currentTurn === "player" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
            }`}>
            {currentTurn === "player" ? "플레이어 턴" : "적 턴"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderMonsterStatus(playerMonsters, "내 팀", true)}
          {renderMonsterStatus(enemyMonsters, "적 팀", false)}
        </div>
      </CardContent>
    </Card>
  )
}