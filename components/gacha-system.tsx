"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useGameStore } from "@/hooks/use-game-store"
import type { Monster } from "@/lib/monsters"
import { Sparkles, Gift, Coins, Target } from "lucide-react"

export function GachaSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [pulledMonster, setPulledMonster] = useState<Monster | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // DB 연동 가챠 사용
  const {
    performGachaPullFromDB,
    userPoints,
    pityCount,
    gachaRates,
    gachaRateConfigs,
    isLoadingGacha,
    gachaError,
    loadGachaData
  } = useGameStore()
  
  // 컴포넌트 마운트 시 가챠 데이터 로딩
  useEffect(() => {
    loadGachaData()
  }, [])

  const handleGachaPull = async () => {
    if (userPoints < 30) {
      alert("포인트가 부족합니다!")
      return
    }

    setIsAnimating(true)

    // Simulate gacha animation delay
    setTimeout(async () => {
      try {
        const monster = await performGachaPullFromDB()
        console.log("[v0] Pulled monster:", monster)

        if (monster && monster.name) {
          setPulledMonster(monster)
          setIsOpen(true)
        } else {
          console.error("[v0] Invalid monster pulled:", monster)
          setPulledMonster(null)
        }
      } catch (error) {
        console.error("[v0] Error during gacha pull:", error)
        setPulledMonster(null)
        alert("가챠 실패: " + (error instanceof Error ? error.message : "알 수 없는 오류"))
      }

      setIsAnimating(false)
    }, 2000)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500"
      case "rare":
        return "bg-blue-500"
      case "unique":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
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

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            몬스터 뽑기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 포인트 및 천장 정보 */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{userPoints.toLocaleString()} P</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-purple-500" />
                {(() => {
                  const uniqueConfig = gachaRateConfigs.find(r => r.rarity.toUpperCase() === "UNIQUE")
                  if (uniqueConfig?.guaranteed_count) {
                    const remaining = Math.max(0, uniqueConfig.guaranteed_count - pityCount.unique)
                    return <span className="text-sm font-medium">천장 {remaining}</span>
                  } else {
                    return <span className="text-sm font-medium text-gray-400">천장 없음</span>
                  }
                })()}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              새로운 몬스터를 뽑아보세요! (30P)
            </p>
            
            <div className="flex justify-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                일반 {(gachaRates.common * 100).toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                희귀 {(gachaRates.rare * 100).toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                유니크 {(gachaRates.unique * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <Button 
            onClick={handleGachaPull} 
            disabled={isAnimating || isLoadingGacha || userPoints < 30} 
            className="w-full" 
            size="lg"
          >
            {isAnimating ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                뽑는 중...
              </div>
            ) : userPoints < 30 ? (
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                포인트 부족
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                몬스터 뽑기 (30P)
              </div>
            )}
          </Button>
          
          {gachaError && (
            <p className="text-red-500 text-sm text-center">{gachaError}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">새로운 몬스터 획득!</DialogTitle>
          </DialogHeader>

          {pulledMonster && pulledMonster.name ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-b from-primary/20 to-background rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={pulledMonster.image || "/placeholder.svg"}
                    alt={pulledMonster.name || "Unknown Monster"}
                    className="w-32 h-32 object-contain animate-bounce"
                  />
                </div>
                <Badge className={`absolute top-2 right-2 ${getRarityColor(pulledMonster.rarity)} text-white`}>
                  {getRarityText(pulledMonster.rarity)}
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{pulledMonster.name}</h3>
                <div className="flex justify-center gap-4 text-sm">
                  <span>체력: {pulledMonster.hp || pulledMonster.maxHp || 0}</span>
                  <span>공격력: {pulledMonster.attack || 0}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  스킬: {pulledMonster.skills?.[0]?.name || pulledMonster.skill?.name || "없음"}
                </p>
              </div>

              <Button onClick={() => setIsOpen(false)} className="w-full">
                확인
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-red-500">몬스터 데이터를 불러오는데 실패했습니다.</p>
              <Button onClick={() => setIsOpen(false)} className="w-full">
                확인
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
