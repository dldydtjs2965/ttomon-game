"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGameStore } from "@/hooks/use-game-store"
import type { Monster } from "@/lib/monsters"
import { Heart, Zap, Shield, Package } from "lucide-react"

interface PetCollectionProps {
  onSelectMonsters?: (monsters: Monster[]) => void
  selectionMode?: boolean
  maxSelection?: number
}

export function PetCollection({ onSelectMonsters, selectionMode = false, maxSelection = 3 }: PetCollectionProps) {
  const collection = useGameStore((state) => state.collection)
  const isLoadingCollection = useGameStore((state) => state.isLoadingCollection)
  const collectionError = useGameStore((state) => state.collectionError)
  const [selectedMonsters, setSelectedMonsters] = useState<Monster[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "일반":
        return "bg-gray-500"
      case "희귀":
        return "bg-blue-500"
      case "유니크":
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

  const handleMonsterSelect = (monster: Monster) => {
    if (!selectionMode) return

    const isSelected = selectedMonsters.some((m) => m.id === monster.id)

    if (isSelected) {
      setSelectedMonsters((prev) => prev.filter((m) => m.id !== monster.id))
    } else if (selectedMonsters.length < maxSelection) {
      if (maxSelection === 1) {
        setSelectedMonsters([monster])
      } else {
        setSelectedMonsters((prev) => [...prev, monster])
      }
    }
  }

  const handleConfirmSelection = () => {
    if (onSelectMonsters) {
      onSelectMonsters(selectedMonsters)
    }
    setIsOpen(false)
    setSelectedMonsters([])
  }

  const MonsterCard = ({ monster }: { monster: Monster }) => {
    if (!monster || typeof monster !== "object") {
      console.error("[v0] Invalid monster object:", monster)
      return null
    }

    if (!monster.name || !monster.skills || !Array.isArray(monster.skills)) {
      console.error("[v0] Invalid monster data:", monster)
      return (
        <Card className="cursor-not-allowed opacity-50">
          <CardContent className="p-3">
            <div className="text-center text-red-500 text-sm">데이터 오류</div>
          </CardContent>
        </Card>
      )
    }

    const isSelected = selectedMonsters.some((m) => m?.id === monster.id)
    const firstSkill = monster.skills[0]

    return (
      <Card
        className={`cursor-pointer transition-all hover:scale-105 ${
          selectionMode
            ? isSelected
              ? "ring-2 ring-primary bg-primary/10"
              : "hover:ring-1 hover:ring-primary/50"
            : "hover:shadow-lg"
        }`}
        onClick={() => handleMonsterSelect(monster)}
      >
        <CardContent className="p-3">
          <div className="relative">
            <div className="w-full h-24 bg-gradient-to-b from-primary/20 to-background rounded-lg flex items-center justify-center overflow-hidden mb-2">
              <img src={monster.image || "/placeholder.svg"} alt={monster.name} className="w-16 h-16 object-contain" />
            </div>
            <Badge className={`absolute top-1 right-1 text-xs ${getRarityColor(monster.rarity)} text-white`}>
              {getRarityText(monster.rarity)}
            </Badge>
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-sm truncate">{monster.name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {monster.hp || monster.maxHp || 0}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {monster.attack || 0}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Shield className="w-3 h-3" />
              <span className="truncate">{firstSkill?.name || "스킬 없음"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const validCollection = collection.filter(
    (monster) =>
      monster && typeof monster === "object" && monster.name && monster.skills && Array.isArray(monster.skills),
  )

  if (selectionMode) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full bg-transparent">
            <Package className="w-4 h-4 mr-2" />
            {maxSelection === 1 ? "또몬 선택" : `또몬 선택 (${validCollection.length}마리)`}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {maxSelection === 1
                ? `배틀 또몬 선택 ${selectedMonsters.length > 0 ? `(${selectedMonsters[0]?.name || "알 수 없음"})` : ""}`
                : `배틀 또몬 선택 (${selectedMonsters.length}/${maxSelection})`}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-96">
            {isLoadingCollection ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-muted-foreground">몬스터 불러오는 중...</p>
              </div>
            ) : collectionError ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-red-500">{collectionError}</p>
                <p className="text-sm mt-2">로컬 데이터를 사용합니다.</p>
              </div>
            ) : validCollection.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>보유한 또몬이 없습니다.</p>
                <p className="text-sm">먼저 또몬을 뽑아보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-1">
                {validCollection.map((monster) => (
                  <MonsterCard key={monster.id} monster={monster} />
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              취소
            </Button>
            <Button onClick={handleConfirmSelection} disabled={selectedMonsters.length === 0} className="flex-1">
              {maxSelection === 1 ? "선택 완료" : `선택 완료 (${selectedMonsters.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          또몬 컬렉션 ({validCollection.length}마리)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {isLoadingCollection ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-muted-foreground">몬스터 불러오는 중...</p>
            </div>
          ) : collectionError ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-red-500">{collectionError}</p>
              <p className="text-sm mt-2">로컬 데이터를 사용합니다.</p>
            </div>
          ) : validCollection.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>보유한 또몬이 없습니다.</p>
              <p className="text-sm">먼저 또몬을 뽑아보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {validCollection.map((monster) => (
                <MonsterCard key={monster.id} monster={monster} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
