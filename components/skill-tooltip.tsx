"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Skill } from "@/lib/monsters"
import { Heart, Zap, Shield, Eye, Swords, Clock } from "lucide-react"

interface SkillTooltipProps {
  skill: Skill
  cooldown?: number
  className?: string
}

export function SkillTooltip({ skill, cooldown = 0, className = "" }: SkillTooltipProps) {
  const getSkillIcon = (type: string) => {
    switch (type) {
      case "heal":
        return <Heart className="w-4 h-4 text-green-500" />
      case "wide_attack":
        return <Zap className="w-4 h-4 text-orange-500" />
      case "strong_attack":
        return <Swords className="w-4 h-4 text-red-500" />
      case "dodge":
        return <Eye className="w-4 h-4 text-blue-500" />
      case "block":
        return <Shield className="w-4 h-4 text-yellow-500" />
      default:
        return <Zap className="w-4 h-4 text-gray-500" />
    }
  }

  const getSkillTypeText = (type: string) => {
    switch (type) {
      case "heal":
        return "치유"
      case "wide_attack":
        return "광역 공격"
      case "strong_attack":
        return "강공격"
      case "dodge":
        return "회피"
      case "block":
        return "방어"
      default:
        return "일반"
    }
  }

  const getRangeText = (range: number) => {
    switch (range) {
      case 1:
        return "단일 대상"
      case 3:
        return "3칸 범위"
      case 9:
        return "전체 범위"
      default:
        return `${range}칸 범위`
    }
  }

  return (
    <Card className={`w-64 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {getSkillIcon(skill.type)}
          {skill.name}
          <Badge variant="secondary" className="text-xs">
            {getSkillTypeText(skill.type)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{skill.description}</p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {skill.damage && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-red-500" />
              <span>데미지: {skill.damage}</span>
            </div>
          )}

          {skill.healAmount && (
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-green-500" />
              <span>회복: {skill.healAmount}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-500" />
            <span>{getRangeText(skill.range)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-500" />
            <span>쿨다운: {skill.cooldown}턴</span>
          </div>
        </div>

        {cooldown > 0 && (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <Clock className="w-3 h-3" />
            <span>남은 쿨다운: {cooldown}턴</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
