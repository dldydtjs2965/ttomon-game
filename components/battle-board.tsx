"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatedMonsterCard } from "@/components/animated-monster-card"
import { BattleAnimation } from "@/components/battle-animation"
import { TurnTransition } from "@/components/turn-transition"
import { SkillAnimation } from "@/components/skill-animation"
import { BattleLog } from "@/components/battle-log"
import { GameStats } from "@/components/game-stats"
import { SkillTooltip } from "@/components/skill-tooltip"
import { ToastBattleLog } from "@/components/toast-battle-log"
import { BattleStatusPanel } from "@/components/battle-status-panel"
import { useGameStore } from "@/hooks/use-game-store"
import type { Monster } from "@/lib/monsters"
import type { GameAction } from "@/lib/game-state"
import { Swords, Shield, Clock, CheckCircle } from "lucide-react"

export function BattleBoard() {
  const {
    playerMonsters,
    enemyMonsters,
    playerTurn,
    turnCount,
    executeBattleTurn,
    setPlayerActions,
    phase,
    winner,
    lastTurnResult,
  } = useGameStore()

  const [selectedActions, setSelectedActions] = useState<GameAction[]>([])
  const [selectedMonster, setSelectedMonster] = useState<string | null>(null)
  const [hoveredSkill, setHoveredSkill] = useState<Monster | null>(null)
  const [toastMessages, setToastMessages] = useState<string[]>([])

  const [showTurnTransition, setShowTurnTransition] = useState(false)
  const [showBattleAnimation, setShowBattleAnimation] = useState(false)
  const [showSkillAnimation, setShowSkillAnimation] = useState(false)
  const [currentSkill, setCurrentSkill] = useState<Monster["skill"] | null>(null)
  const [animatingMonsters, setAnimatingMonsters] = useState<{
    attacking: string[]
    beingAttacked: string[]
    dodging: string[]
    blocking: string[]
  }>({ attacking: [], beingAttacked: [], dodging: [], blocking: [] })

  useEffect(() => {
    console.log("[BattleBoard] animatingMonsters 상태 변경:", animatingMonsters)
  }, [animatingMonsters])

  // 토스트 메시지 생성 함수
  const generateToastMessage = (result: any): string => {
    const attacker = result.attacker?.name || "Unknown"
    const target = result.target?.name || "Unknown"

    // 회피 관련 메시지
    if (result.dodgeAttempted) {
      if (result.dodged) {
        return `🎯 ${target}이(가) 공격을 성공적으로 회피했습니다!`
      }
      return `❌ ${target}의 회피가 실패했습니다.`
    }

    // 막기 관련 메시지
    if (result.blockAttempted || result.blocked) {
      if (result.blocked) {
        const estimatedOriginal = Math.floor(result.damage / 0.5)
        const reduced = estimatedOriginal - result.damage
        return `🛡️ ${target}이(가) ${reduced} 데미지를 방어했습니다! (${result.damage} 데미지만 받음)`
      }
      return `💥 ${target}의 방어가 실패했습니다.`
    }

    // 힐 메시지
    if (result.healed > 0) {
      return `💚 ${attacker}이(가) ${result.healed} HP를 회복했습니다!`
    }

    // 데미지 메시지
    if (result.damage > 0) {
      return `⚔️ ${attacker}이(가) ${target}에게 ${result.damage} 데미지를 입혔습니다!`
    }

    return `${attacker}의 공격이 빗나갔습니다.`
  }

  useEffect(() => {
    if (phase === "battle") {
      setShowTurnTransition(true)
      setTimeout(() => setShowTurnTransition(false), 2000)
    }
  }, [playerTurn, phase])

  useEffect(() => {
    if (lastTurnResult && (lastTurnResult.playerResults.length > 0 || lastTurnResult.enemyResults.length > 0)) {
      console.log(`[BattleBoard] 배틀 결과 감지, 애니메이션 시작:`, {
        playerResults: lastTurnResult.playerResults.length,
        enemyResults: lastTurnResult.enemyResults.length
      })
      setShowBattleAnimation(true)

      // 토스트 메시지 생성 및 애니메이션 상태 업데이트
      const newToastMessages: string[] = []
      const dodgingMonsters: string[] = []
      const blockingMonsters: string[] = []

      // 플레이어 결과 처리
      lastTurnResult.playerResults.forEach(result => {
        if (result.dodgeAttempted || result.blockAttempted || result.healed > 0 || result.damage > 0) {
          newToastMessages.push(generateToastMessage(result))
        }

        // 회피/막기 애니메이션 상태 추가
        if (result.dodged || result.dodgeAttempted) {
          dodgingMonsters.push(result.target.id)
        }
        if (result.blocked || result.blockAttempted) {
          blockingMonsters.push(result.target.id)
        }
      })

      // 적 결과 처리
      lastTurnResult.enemyResults.forEach(result => {
        if (result.dodgeAttempted || result.blockAttempted || result.healed > 0 || result.damage > 0) {
          newToastMessages.push(generateToastMessage(result))
        }

        // 회피/막기 애니메이션 상태 추가
        if (result.dodged || result.dodgeAttempted) {
          dodgingMonsters.push(result.target.id)
        }
        if (result.blocked || result.blockAttempted) {
          blockingMonsters.push(result.target.id)
        }
      })

      // 애니메이션 상태 업데이트
      if (dodgingMonsters.length > 0 || blockingMonsters.length > 0) {
        setAnimatingMonsters(prev => ({
          ...prev,
          dodging: dodgingMonsters,
          blocking: blockingMonsters
        }))

        // 2초 후 회피/막기 상태 초기화
        setTimeout(() => {
          setAnimatingMonsters(prev => ({
            ...prev,
            dodging: [],
            blocking: []
          }))
        }, 2000)
      }

      if (newToastMessages.length > 0) {
        console.log(`[BattleBoard] 토스트 메시지 생성:`, newToastMessages)
        setToastMessages(prev => [...prev, ...newToastMessages])
      }
    }
  }, [lastTurnResult])

  const handleMonsterClick = (monster: Monster, isPlayer: boolean) => {
    if (!isPlayer || !playerTurn || phase !== "battle" || monster.hp <= 0) return

    if (selectedMonster === monster.id) {
      setSelectedMonster(null)
    } else {
      setSelectedMonster(monster.id)
    }
  }

  const handleActionSelect = (type: "attack" | "skill") => {
    if (!selectedMonster) return

    console.log(`[BattleBoard] 🎯 액션 선택: ${type}, 선택된 몬스터: ${selectedMonster}`)

    if (type === "skill") {
      const monster = [...playerMonsters.flat()].find((m) => m?.id === selectedMonster)
      if (monster) {
        console.log(`[BattleBoard] 스킬 애니메이션 시작: ${monster.skill.name}`)
        setCurrentSkill(monster.skill)
        setShowSkillAnimation(true)
      }
    } else if (type === "attack") {
      // 일반 공격 시 스킬 애니메이션 관련 상태 초기화
      console.log(`[BattleBoard] 일반 공격 - 스킬 애니메이션 비활성화`)
      setCurrentSkill(null)
      setShowSkillAnimation(false)
    }

    const newAction: GameAction = {
      monsterId: selectedMonster,
      type,
    }

    setSelectedActions((prev) => {
      const filtered = prev.filter((a) => a.monsterId !== selectedMonster)
      return [...filtered, newAction]
    })

    setSelectedMonster(null)
  }

  const handleConfirmTurn = () => {
    const attackingMonsters = selectedActions.map((action) => action.monsterId)
    console.log(`[BattleBoard] 턴 확정 - 공격하는 몬스터들:`, attackingMonsters)
    setAnimatingMonsters((prev) => ({ ...prev, attacking: attackingMonsters }))

    setTimeout(() => {
      console.log(`[BattleBoard] 배틀 실행 중...`)
      setPlayerActions(selectedActions)
      executeBattleTurn()
      setSelectedActions([])
      setAnimatingMonsters({ attacking: [], beingAttacked: [], dodging: [], blocking: [] })
      console.log(`[BattleBoard] 배틀 실행 완료, 애니메이션 상태 초기화`)
    }, 1000)
  }

  const getActionForMonster = (monsterId: string) => {
    return selectedActions.find((a) => a.monsterId === monsterId)
  }

  const MonsterCell = ({
    monster,
    x,
    y,
    isPlayer,
  }: { monster: Monster | null; x: number; y: number; isPlayer: boolean }) => {
    if (!monster) {
      return (
        <div className="aspect-square border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
          <span className="text-xs text-muted-foreground">빈 칸</span>
        </div>
      )
    }

    const isSelected = selectedMonster === monster.id
    const hasAction = getActionForMonster(monster.id)
    const isAlive = monster.hp > 0
    const isAttacking = animatingMonsters.attacking.includes(monster.id)
    const isBeingAttacked = animatingMonsters.beingAttacked.includes(monster.id)
    const isDodging = animatingMonsters.dodging.includes(monster.id)
    const isBlocking = animatingMonsters.blocking.includes(monster.id)

    // 로그로 애니메이션 상태 확인
    if (isAttacking || isBeingAttacked || isDodging || isBlocking) {
      console.log(`[BattleBoard] MonsterCell 애니메이션 상태 전달: ${monster.name} - isAttacking: ${isAttacking}, isBeingAttacked: ${isBeingAttacked}, isDodging: ${isDodging}, isBlocking: ${isBlocking}`)
    }

    return (
      <div className="relative">
        <AnimatedMonsterCard
          monster={monster}
          x={x}
          y={y}
          isPlayer={isPlayer}
          onClick={() => handleMonsterClick(monster, isPlayer)}
          selected={isSelected}
          showActions={isPlayer && isAlive && playerTurn}
          disabled={!isAlive}
          isAttacking={isAttacking}
          isBeingAttacked={isBeingAttacked}
          isDead={!isAlive}
          isDodging={isDodging}
          isBlocking={isBlocking}
        />

        {hasAction && (
          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
            <CheckCircle className="w-3 h-3" />
          </Badge>
        )}

        {isPlayer && isAlive && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-1 right-1 h-6 w-6 p-0"
            onMouseEnter={() => setHoveredSkill(monster)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <Shield className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  if (phase === "result") {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">{winner === "player" ? "🎉" : winner === "enemy" ? "😢" : "🤝"}</div>
        <h2 className="text-3xl font-bold">
          {winner === "player" ? "승리!" : winner === "enemy" ? "패배..." : "무승부"}
        </h2>
        <p className="text-muted-foreground">
          {winner === "player"
            ? "축하합니다! 전략적인 배틀에서 승리했습니다!"
            : winner === "enemy"
              ? "아쉽게 패배했습니다. 다시 도전해보세요!"
              : "치열한 접전이었습니다!"}
        </p>
        <Button onClick={() => useGameStore.getState().resetGame()} size="lg">
          다시 하기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <GameStats />

      {/* Battle Status Panel */}
      <BattleStatusPanel
        playerMonsters={playerMonsters.flat().filter(Boolean)}
        enemyMonsters={enemyMonsters.flat().filter(Boolean)}
        currentTurn={playerTurn ? "player" : "enemy"}
      />

      {/* Turn Info */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" />턴 {turnCount}
        </h2>
        <Badge variant={playerTurn ? "default" : "secondary"} className="text-sm">
          {playerTurn ? "당신의 턴" : "적의 턴"}
        </Badge>
      </div>

      {/* Enemy Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-center text-red-600">적 팀</h3>
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {enemyMonsters.map((row, y) =>
            row.map((monster, x) => (
              <MonsterCell key={`enemy-${x}-${y}`} monster={monster} x={x} y={y} isPlayer={false} />
            )),
          )}
        </div>
      </div>

      {/* Player Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-center text-blue-600">내 팀</h3>
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {playerMonsters.map((row, y) =>
            row.map((monster, x) => (
              <MonsterCell key={`player-${x}-${y}`} monster={monster} x={x} y={y} isPlayer={true} />
            )),
          )}
        </div>
      </div>

      {/* Action Selection */}
      {selectedMonster && playerTurn && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4 space-y-3">
            <p className="text-center text-sm font-semibold">행동을 선택하세요:</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => handleActionSelect("attack")}>
                <Swords className="w-4 h-4 mr-2" />
                일반 공격
              </Button>
              <Button
                variant="outline"
                onClick={() => handleActionSelect("skill")}
                disabled={(() => {
                  const monster = [...playerMonsters.flat()].find((m) => m?.id === selectedMonster)
                  return monster ? monster.skillCooldown > 0 : true
                })()}
              >
                <Shield className="w-4 h-4 mr-2" />
                스킬 사용
                {(() => {
                  const monster = [...playerMonsters.flat()].find((m) => m?.id === selectedMonster)
                  return monster && monster.skillCooldown > 0 ? ` (${monster.skillCooldown})` : ""
                })()}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Turn Confirmation */}
      {playerTurn && selectedActions.length > 0 && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4 text-center space-y-3">
            <p className="text-sm">선택된 행동: {selectedActions.length}개</p>
            <div className="flex gap-2 text-xs">
              {selectedActions.map((action, index) => (
                <Badge key={index} variant="secondary">
                  {action.type === "skill" ? "스킬" : "공격"}
                </Badge>
              ))}
            </div>
            <Button onClick={handleConfirmTurn} size="lg" className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />턴 완료
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Skill Tooltip */}
      {hoveredSkill && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <SkillTooltip skill={hoveredSkill.skill} cooldown={hoveredSkill.skillCooldown} />
        </div>
      )}

      {/* Battle Log */}
      <BattleLog />

      {/* Turn Transition Animation */}
      <TurnTransition isVisible={showTurnTransition} isPlayerTurn={playerTurn} turnCount={turnCount} />

      {/* Battle Result Animation */}
      {showBattleAnimation && lastTurnResult && (
        <BattleAnimation
          results={[...lastTurnResult.playerResults, ...lastTurnResult.enemyResults]}
          isPlayerTurn={playerTurn}
          onComplete={() => {
            console.log(`[BattleBoard] BattleAnimation 완료, showBattleAnimation을 false로 설정`)
            setShowBattleAnimation(false)
          }}
        />
      )}

      {/* Skill Animation */}
      {console.log(`[BattleBoard] SkillAnimation 렌더링: skill=${currentSkill?.name}, isVisible=${showSkillAnimation}`)}
      <SkillAnimation
        skill={currentSkill}
        isVisible={showSkillAnimation}
        onComplete={() => {
          console.log(`[BattleBoard] 스킬 애니메이션 완료`)
          setShowSkillAnimation(false)
          setCurrentSkill(null)
        }}
      />

      {/* Toast Battle Log */}
      <ToastBattleLog messages={toastMessages} />
    </div>
  )
}
