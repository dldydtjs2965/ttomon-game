"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/hooks/use-game-store"
import type { BattleResult } from "@/lib/battle-engine"
import { Scroll, X, Zap, Heart, Shield, Eye } from "lucide-react"

interface BattleLogEntry {
  id: string
  turn: number
  timestamp: Date
  playerResults: BattleResult[]
  enemyResults: BattleResult[]
}

export function BattleLog() {
  const { lastTurnResult, turnCount } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([])

  useEffect(() => {
    if (lastTurnResult) {
      const newEntry: BattleLogEntry = {
        id: `turn-${turnCount}-${Date.now()}`,
        turn: turnCount - 1,
        timestamp: new Date(),
        playerResults: lastTurnResult.playerResults,
        enemyResults: lastTurnResult.enemyResults,
      }
      setBattleLog((prev) => [...prev, newEntry])
    }
  }, [lastTurnResult, turnCount])

  const formatResult = (result: BattleResult, isPlayer: boolean) => {
    const prefix = isPlayer ? "아군" : "적군"

    if (result.healed > 0) {
      return `${prefix}이 ${result.healed} 체력을 회복했습니다.`
    }

    if (result.dodged) {
      return `${prefix}이 공격을 회피했습니다!`
    }

    if (result.blocked) {
      return `${prefix}이 공격을 막아 ${result.damage} 데미지를 받았습니다.`
    }

    if (result.damage > 0) {
      return `${prefix}이 ${result.damage} 데미지를 받았습니다.`
    }

    return `${prefix}의 공격이 빗나갔습니다.`
  }

  const getResultIcon = (result: BattleResult) => {
    if (result.healed > 0) return <Heart className="w-4 h-4 text-green-500" />
    if (result.dodged) return <Eye className="w-4 h-4 text-blue-500" />
    if (result.blocked) return <Shield className="w-4 h-4 text-yellow-500" />
    if (result.damage > 0) return <Zap className="w-4 h-4 text-red-500" />
    return <X className="w-4 h-4 text-gray-500" />
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 z-50">
        <Scroll className="w-4 h-4 mr-2" />
        배틀 로그 ({battleLog.length})
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Scroll className="w-4 h-4" />
            배틀 로그
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 px-3 pb-3">
          {battleLog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Scroll className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">아직 배틀 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {battleLog.map((entry) => (
                <div key={entry.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      턴 {entry.turn}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{entry.timestamp.toLocaleTimeString()}</span>
                  </div>

                  {/* Player Actions */}
                  {entry.playerResults.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-blue-600">아군 행동:</p>
                      {entry.playerResults.map((result, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {getResultIcon(result)}
                          <span>{formatResult(result, true)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enemy Actions */}
                  {entry.enemyResults.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-red-600">적군 행동:</p>
                      {entry.enemyResults.map((result, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {getResultIcon(result)}
                          <span>{formatResult(result, false)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <hr className="border-muted" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
