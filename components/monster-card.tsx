"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Monster } from "@/lib/monsters"
import { Heart, Zap, Shield, Clock, Star } from "lucide-react"

interface MonsterCardProps {
  monster: Monster
  onClick?: () => void
  selected?: boolean
  showActions?: boolean
  compact?: boolean
  disabled?: boolean
}

export function MonsterCard({
  monster,
  onClick,
  selected = false,
  showActions = false,
  compact = false,
  disabled = false,
}: MonsterCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-slate-500"
      case "rare":
        return "bg-blue-500"
      case "unique":
        return "bg-purple-500"
      default:
        return "bg-slate-500"
    }
  }

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "일반"
      case "rare":
        return "희귀"
      case "unique":
        return "유니크"
      default:
        return "일반"
    }
  }

  const hpPercentage = (monster.hp / monster.maxHp) * 100
  const isAlive = monster.hp > 0
  const isLowHp = hpPercentage <= 30

  return (
    <Card
      className={`
        transition-all duration-200 hover:scale-105 cursor-pointer
        ${selected ? "ring-2 ring-primary bg-primary/10" : "hover:shadow-lg"}
        ${!isAlive ? "opacity-50 grayscale" : ""}
        ${disabled ? "cursor-not-allowed opacity-60" : ""}
        ${compact ? "h-32" : "h-auto"}
      `}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className={`p-3 h-full flex flex-col ${compact ? "gap-1" : "gap-2"}`}>
        {/* Monster Image & Rarity */}
        <div className="relative flex-shrink-0">
          <div
            className={`
            ${compact ? "h-16" : "h-24"} 
            bg-gradient-to-b from-primary/20 to-background rounded-lg 
            flex items-center justify-center overflow-hidden
          `}
          >
            <img
              src={monster.image || "/placeholder.svg"}
              alt={monster.name}
              className={`${compact ? "w-12 h-12" : "w-16 h-16"} object-contain`}
            />
          </div>
          <Badge className={`absolute top-1 right-1 text-xs ${getRarityColor(monster.rarity)} text-white`}>
            {getRarityText(monster.rarity)}
          </Badge>

          {monster.rarity === "unique" && (
            <div className="absolute -top-1 -right-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          )}
        </div>

        {/* Monster Info */}
        <div className="flex-1 space-y-1">
          <h4 className={`font-semibold truncate ${compact ? "text-sm" : "text-base"}`}>{monster.name}</h4>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <span className={isLowHp ? "text-red-500 font-semibold" : ""}>
                  {monster.hp}/{monster.maxHp}
                </span>
              </div>
              {!compact && <span className="text-muted-foreground">{Math.round(hpPercentage)}%</span>}
            </div>
            <Progress
              value={hpPercentage}
              className="h-2"
              indicatorClassName={isLowHp ? "bg-red-500" : "bg-green-500"}
            />
          </div>

          {/* Stats */}
          <div className={`flex items-center gap-3 text-xs ${compact ? "justify-between" : ""}`}>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span>{monster.attack}</span>
            </div>

            {monster.skillCooldown > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{monster.skillCooldown}</span>
              </div>
            )}
          </div>

          {/* Skill Info */}
          {!compact && (
            <div className="flex items-center gap-1 text-xs">
              <Shield className="w-3 h-3 text-blue-500" />
              <span className="truncate">{monster.skill.name}</span>
            </div>
          )}
        </div>

        {/* Action Indicators */}
        {showActions && (
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              공격 가능
            </Badge>
            {monster.skillCooldown === 0 && (
              <Badge variant="secondary" className="text-xs">
                스킬 준비
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
