"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "@/hooks/use-game-store"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { HearthstoneButton } from "@/components/ui/hearthstone-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ToastBattleLog } from "@/components/toast-battle-log"
import { Hearthstone3DCard } from "@/components/animations/Hearthstone3DCard"
import { MagicCastingEffects } from "@/components/animations/MagicCastingEffects"
import { AnimatedHealthBar } from "@/components/animations/AnimatedHealthBar"
import { ImprovedImpactSystem } from "@/components/animations/ImprovedImpactSystem"
import { MonsterSwitchAnimation } from "@/components/animations/MonsterSwitchAnimation"
import { TeamStatusDisplay } from "@/components/TeamStatusDisplay"
import type { GameAction } from "@/lib/game-state"
import type { Skill } from "@/lib/monsters"
import { getSkillAnimationInfo, getNormalAttackAnimationInfo } from "@/lib/animations/animationMappings"

export function PokemonBattle() {
  const { 
    playerMonster, 
    enemyMonster, 
    playerTeam,
    currentPlayerIndex,
    playerTurn, 
    turnCount, 
    winner, 
    lastTurnResult, 
    executeBattleTurn, 
    executeSequentialTurn,
    executeEnemyTurn,
    isExecutingTurn,
    currentTurnSequence,
    sequenceStep,
    battlePhase,
    playerSelectedAction,
    enemySelectedAction,
    selectPlayerAction,
    setPhase,
    // Pokémon Rogue-like stats
    defeatedEnemies,
    currentWinStreak,
    bestWinStreak
  } = useGameStore()

  const [battleLog, setBattleLog] = useState<string[]>([])
  const [showSkillMenu, setShowSkillMenu] = useState(false)
  
  // 핵심 애니메이션 상태
  const [currentAnimationSkill, setCurrentAnimationSkill] = useState<Skill | null>(null)
  const [animationAttacker, setAnimationAttacker] = useState<"player" | "enemy">("player")
  const [animationTarget, setAnimationTarget] = useState<"player" | "enemy">("enemy")
  const [isImpactAnimationActive, setIsImpactAnimationActive] = useState(false)
  const [isMagicCastingActive, setIsMagicCastingActive] = useState(false)
  
  // 몬스터 교체 애니메이션 상태
  const [isSwitchingMonster, setIsSwitchingMonster] = useState(false)
  const [previousPlayerMonster, setPreviousPlayerMonster] = useState<Monster | null>(null)
  const [playerPreviousHp, setPlayerPreviousHp] = useState(playerMonster?.hp || 0)
  const [enemyPreviousHp, setEnemyPreviousHp] = useState(enemyMonster?.hp || 0)
  
  // 카드 상태 추적
  const [playerCardState, setPlayerCardState] = useState<{
    isAttacking: boolean
    isDamaged: boolean
    isDead: boolean
  }>({
    isAttacking: false,
    isDamaged: false,
    isDead: false
  })
  
  const [enemyCardState, setEnemyCardState] = useState<{
    isAttacking: boolean
    isDamaged: boolean
    isDead: boolean
  }>({
    isAttacking: false,
    isDamaged: false,
    isDead: false
  })

  // 배틀 애니메이션 트리거
  const triggerBattleAnimation = (
    skill: Skill | null,
    attacker: "player" | "enemy",
    target: "player" | "enemy"
  ) => {
    if (!skill) return
    
    // 공격자 카드 상태 업데이트
    if (attacker === "player") {
      setPlayerCardState(prev => ({ ...prev, isAttacking: true }))
    } else {
      setEnemyCardState(prev => ({ ...prev, isAttacking: true }))
    }
    
    setCurrentAnimationSkill(skill)
    setAnimationAttacker(attacker)
    setAnimationTarget(target)
    
    // 마법 타입이면 시전 효과 먼저 실행
    const elementType = skill.elementType || "physical"
    if (["fire", "water", "electric", "light", "shadow", "wind"].includes(elementType)) {
      setIsMagicCastingActive(true)
      
      // 시전 완료 후 메인 애니메이션 실행
      setTimeout(() => {
        setIsMagicCastingActive(false)
        executeImpactAnimation(skill, attacker, target)
      }, 1500)
    } else {
      executeImpactAnimation(skill, attacker, target)
    }
  }

  const executeImpactAnimation = (
    skill: Skill,
    attacker: "player" | "enemy",
    target: "player" | "enemy"
  ) => {
    setIsImpactAnimationActive(true)
  }

  // 임팩트 애니메이션 완료 콜백
  const handleImpactAnimationComplete = () => {
    setIsImpactAnimationActive(false)
    setCurrentAnimationSkill(null)
    
    // 카드 상태 초기화
    setPlayerCardState(prev => ({ ...prev, isAttacking: false }))
    setEnemyCardState(prev => ({ ...prev, isAttacking: false }))
  }

  // 마법 시전 완료 콜백
  const handleMagicCastingComplete = () => {
    setIsMagicCastingActive(false)
  }

  // No longer needed - enemy actions are handled automatically in simultaneous selection

  // 턴 완료 시 모든 카드 상태 초기화 - 강화된 버전
  useEffect(() => {
    if (battlePhase === "selection" && !isExecutingTurn) {
      // 새로운 턴이 시작될 때 카드 상태 초기화
      console.log('[v0] 턴 시작 - 카드 상태 초기화')
      setPlayerCardState(prev => ({
        ...prev,
        isAttacking: false,
        isDamaged: false
      }))
      setEnemyCardState(prev => ({
        ...prev,
        isAttacking: false,
        isDamaged: false
      }))
      
      // HP 데미지 표시기 강제 정리 (비상 안전장치)
      const cleanupDamageIndicators = () => {
        document.querySelectorAll('.hp-damage-indicator').forEach(indicator => {
          if (indicator.parentNode) {
            gsap.killTweensOf(indicator)
            indicator.remove()
          }
        })
      }
      
      // 약간 닦려서 실행하여 애니메이션이 끝난 후 정리
      setTimeout(cleanupDamageIndicators, 100)
    }
  }, [battlePhase, isExecutingTurn])

  // 회피/막기 상태 모니터링 및 자동 정리
  useEffect(() => {
    // 턴이 변경되거나 battlePhase가 selection으로 변경될 때 
    // 회피/막기 상태가 남아있는지 확인하고 로그 출력
    if (battlePhase === "selection" && !isExecutingTurn) {
      if (playerMonster?.dodgeNextAttack || playerMonster?.blockNextAttack) {
        console.log("[v0] 플레이어 회피/막기 상태가 남아있음:", {
          dodge: playerMonster.dodgeNextAttack,
          block: playerMonster.blockNextAttack,
          turn: turnCount
        })
      }
      if (enemyMonster?.dodgeNextAttack || enemyMonster?.blockNextAttack) {
        console.log("[v0] 적 회피/막기 상태가 남아있음:", {
          dodge: enemyMonster.dodgeNextAttack,
          block: enemyMonster.blockNextAttack,
          turn: turnCount
        })
      }
    }
  }, [turnCount, battlePhase, isExecutingTurn, playerMonster?.dodgeNextAttack, playerMonster?.blockNextAttack, enemyMonster?.dodgeNextAttack, enemyMonster?.blockNextAttack])

  // HP 변화 추적 - 개선된 버전
  useEffect(() => {
    if (playerMonster && playerMonster.hp !== playerPreviousHp) {
      if (playerMonster.hp < playerPreviousHp) {
        // 플레이어가 데미지를 받음
        setPlayerCardState(prev => ({ ...prev, isDamaged: true }))
        // 자동 해제 타이머 - 강화된 버전
        console.log(`[v0] 플레이어 데미지 상태 설정: 이전HP(${playerPreviousHp}) -> 현재HP(${playerMonster.hp})`)
        const timer = setTimeout(() => {
          setPlayerCardState(prev => ({ ...prev, isDamaged: false }))
          console.log('[v0] 플레이어 데미지 상태 자동 해제')
        }, 2000) // 2초로 연장
        
        return () => clearTimeout(timer)
      }
      
      if (playerMonster.hp <= 0) {
        setPlayerCardState(prev => ({ ...prev, isDead: true }))
        // 몬스터가 쓰러졌을 때 교체 애니메이션 트리거
        if (playerTeam && currentPlayerIndex + 1 < playerTeam.length) {
          setPreviousPlayerMonster(playerMonster)
          setIsSwitchingMonster(true)
        }
      }
      
      setPlayerPreviousHp(playerMonster.hp)
    }
  }, [playerMonster?.hp, playerPreviousHp, playerTeam, currentPlayerIndex])

  useEffect(() => {
    if (enemyMonster && enemyMonster.hp !== enemyPreviousHp) {
      if (enemyMonster.hp < enemyPreviousHp) {
        // 적이 데미지를 받음
        setEnemyCardState(prev => ({ ...prev, isDamaged: true }))
        // 자동 해제 타이머 - 강화된 버전
        console.log(`[v0] 적 데미지 상태 설정: 이전HP(${enemyPreviousHp}) -> 현재HP(${enemyMonster.hp})`)
        const timer = setTimeout(() => {
          setEnemyCardState(prev => ({ ...prev, isDamaged: false }))
          console.log('[v0] 적 데미지 상태 자동 해제')
        }, 2000) // 2초로 연장
        
        return () => clearTimeout(timer)
      }
      
      if (enemyMonster.hp <= 0) {
        setEnemyCardState(prev => ({ ...prev, isDead: true }))
      }
      
      setEnemyPreviousHp(enemyMonster.hp)
    }
  }, [enemyMonster?.hp, enemyPreviousHp])

  // 몬스터 교체 감지
  useEffect(() => {
    if (playerMonster && previousPlayerMonster && playerMonster.id !== previousPlayerMonster.id) {
      console.log('[v0] 몬스터 교체 감지:', previousPlayerMonster.name, '->', playerMonster.name)
      setPreviousPlayerMonster(playerMonster)
    }
  }, [playerMonster?.id, previousPlayerMonster])

  // 몬스터 교체 애니메이션 완료 핸들러
  const handleSwitchAnimationComplete = () => {
    console.log('[v0] 몬스터 교체 애니메이션 완료')
    setIsSwitchingMonster(false)
    setPreviousPlayerMonster(null)
    setPlayerCardState({ isAttacking: false, isDamaged: false, isDead: false })
  }

  // Handle turn sequence animations
  useEffect(() => {
    if (currentTurnSequence && sequenceStep < currentTurnSequence.length) {
      const currentStep = currentTurnSequence[sequenceStep]
      
      if (currentStep.result) {
        const { actor, result } = currentStep
        const actionResult = result.result
        
        // Trigger appropriate GSAP animation based on action
        const targetPosition = actor === "player" ? "enemy" : "player"
        
        if (actionResult.healed > 0) {
          // 힐링 스킬 - GSAP 애니메이션 사용
          const healSkill: Skill = {
            id: "heal_skill",
            name: "치유",
            type: "heal",
            healAmount: actionResult.healed,
            range: 1,
            cooldown: 0,
            description: "치유 스킬",
            elementType: "light",
            animationType: "glow"
          }
          triggerBattleAnimation(healSkill, actor, actor)
          
        } else if (actionResult.dodged) {
          // 회피 성공 - 애니메이션 생략 (카드 상태로 표시)
          
        } else if (actionResult.blocked) {
          // 막기 성공 - 애니메이션 생략 (카드 상태로 표시)
          
        } else if (actionResult.dodgeAttempted && !actionResult.dodged) {
          // 회피 실패 - 데미지 애니메이션만 실행
          
        } else if (actionResult.damage > 0) {
          // 공격 데미지 - 임팩트 애니메이션 사용
          
          // 현재 실행된 액션에서 스킬 정보 추출
          const currentAction = currentTurnSequence?.[sequenceStep]
          let attackSkill: Skill | null = null
          
          if (currentAction?.actor === "player" && playerSelectedAction?.type === "skill" && playerSelectedAction.skillIndex !== undefined) {
            attackSkill = playerMonster.skills[playerSelectedAction.skillIndex]
          } else if (currentAction?.actor === "enemy" && enemySelectedAction?.type === "skill" && enemySelectedAction.skillIndex !== undefined) {
            attackSkill = enemyMonster.skills[enemySelectedAction.skillIndex]
          } else {
            // 일반 공격인 경우 가상의 스킬 생성
            const attacker = actor === "player" ? playerMonster : enemyMonster
            const animInfo = getNormalAttackAnimationInfo(attacker)
            attackSkill = {
              id: "normal_attack",
              name: "일반 공격",
              type: "strong_attack",
              damage: actionResult.damage,
              range: 1,
              cooldown: 0,
              description: "일반 공격",
              elementType: animInfo.elementType,
              animationType: animInfo.animationType
            }
          }
          
          if (attackSkill) {
            // 배틀 애니메이션 사용
            triggerBattleAnimation(attackSkill, actor, targetPosition)
          }
        }

        // Add to battle log
        const newLogs: string[] = []
        const { attacker, target, damage, healed, dodged, blocked, dodgeAttempted, blockAttempted } = actionResult
        
        // Check if this is a dodge/block action (self-targeted with no damage/heal)
        if (attacker === target && damage === 0 && healed === 0) {
          if (attacker.dodgeNextAttack) {
            newLogs.push(`🏃 ${attacker.name}이(가) 회피 자세를 취했습니다! (다음 공격 회피 시도)`)
          } else if (attacker.blockNextAttack) {
            newLogs.push(`🛡️ ${attacker.name}이(가) 방어 자세를 취했습니다! (받는 데미지 감소)`)
          }
        } else if (healed > 0) {
          newLogs.push(`💚 ${attacker.name}이(가) ${healed} HP를 회복했습니다!`)
        } else if (dodged) {
          newLogs.push(`✨ ${target.name}이(가) 공격을 완벽하게 회피했습니다!`)
        } else if (blocked) {
          const originalDamage = Math.floor(damage / (1 - (target.blockReduction || 0.5)))
          const reducedAmount = originalDamage - damage
          newLogs.push(`🛡️ ${target.name}이(가) 공격을 막아 ${reducedAmount} 데미지를 차단했습니다! (${damage} 데미지만 받음)`)
        } else if (dodgeAttempted && !dodged) {
          newLogs.push(`💨 ${target.name}이(가) 회피를 시도했지만 실패하여 ${damage} 데미지를 받았습니다!`)
        } else if (blockAttempted && !blocked) {
          // This shouldn't happen since blocked is always true when blockAttempted is true
          newLogs.push(`⚔️ ${target.name}이(가) 방어했지만 ${damage} 데미지를 받았습니다!`)
        } else if (damage > 0) {
          newLogs.push(`⚔️ ${attacker.name}이(가) ${target.name}에게 ${damage} 데미지를 입혔습니다!`)
        }

        if (newLogs.length > 0) {
          setBattleLog((prev) => [...prev, ...newLogs])
        }
      }
    }
  }, [currentTurnSequence, sequenceStep])

  const handleAction = async (actionType: "attack" | "skill" | "defend" | "dodge", skillIndex?: number) => {
    if (battlePhase !== "selection" || winner || isExecutingTurn) return

    const action: GameAction = {
      monsterId: playerMonster.id,
      type: actionType === "defend" ? "block" : actionType, // Convert defend to block for consistency
      skillIndex,
    }

    // 🔍 버튼 클릭 로그 추가
    console.log(`[Button Clicked] ${actionType}${skillIndex !== undefined ? ` (skill ${skillIndex})` : ''}`)
    console.log('[Action Created]', action)

    setShowSkillMenu(false)
    
    // Use the new simultaneous action selection
    selectPlayerAction(action)
  }

  const handleBackToMenu = () => {
    setBattleLog([])
    setPhase("menu")
  }

  if (!playerMonster || !enemyMonster) {
    return <div>배틀을 준비 중입니다...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200 p-4">
      <ToastBattleLog messages={battleLog} />
      
      {/* 디버그: 배틀 로그 상태 확인 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-md">
          <div>Battle Phase: {battlePhase}</div>
          <div>Turn: {turnCount}</div>
          <div>Log Count: {battleLog.length}</div>
          <div>Latest: {battleLog[battleLog.length - 1] || 'None'}</div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">또몬 배틀</h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="bg-white/70 backdrop-blur px-3 py-1 rounded-full border">
              <span className="text-purple-600">턴 {turnCount}</span>
            </div>
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 backdrop-blur px-3 py-1 rounded-full border border-yellow-200">
              <span className="text-orange-700">연승 {currentWinStreak}회</span>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 backdrop-blur px-3 py-1 rounded-full border border-green-200">
              <span className="text-emerald-700">처치 {defeatedEnemies}마리</span>
            </div>
            {bestWinStreak > 0 && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 backdrop-blur px-3 py-1 rounded-full border border-purple-200">
                <span className="text-purple-700">최고 {bestWinStreak}연승</span>
              </div>
            )}
          </div>
        </div>

        {/* 팀 상태 표시 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <TeamStatusDisplay
            monsters={[enemyMonster]} // 적은 단일 몬스터
            currentMonsterIndex={0}
            position="enemy"
            className="md:order-1"
          />
          <TeamStatusDisplay
            monsters={playerTeam}
            currentMonsterIndex={currentPlayerIndex}
            position="player"
            className="md:order-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* 적 카드 - 하스스톤 스타일 3D 카드 */}
          <Hearthstone3DCard
            monster={enemyMonster}
            position="enemy"
            isAttacking={enemyCardState.isAttacking}
            isDamaged={enemyCardState.isDamaged}
            isDead={enemyCardState.isDead}
            isDodging={enemyMonster.dodgeNextAttack || false}
            isBlocking={enemyMonster.blockNextAttack || false}
            className="border-red-200 bg-red-50"
          >
            <CardHeader>
              <CardTitle className="text-red-700 text-center">야생 또몬</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="relative">
                <img
                  src={enemyMonster.image || "/placeholder.svg"}
                  alt={enemyMonster.name}
                  className="w-32 h-32 mx-auto rounded-lg object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">{enemyMonster.name}</h3>
                <Badge variant="secondary">{enemyMonster.rarity}</Badge>
              </div>
              <div className="space-y-2">
                <AnimatedHealthBar
                  currentHp={enemyMonster.hp}
                  maxHp={enemyMonster.maxHp}
                  previousHp={enemyPreviousHp}
                  showDamageIndicator={true}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>공격력: {enemyMonster.attack}</p>
                <div className="space-y-1">
                  {enemyMonster.skillCooldowns?.map((cooldown, index) => (
                    <p key={index} className="text-xs">
                      스킬 {index + 1}: {cooldown > 0 ? `${cooldown}턴 대기` : "사용 가능"}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Hearthstone3DCard>

          {/* 플레이어 카드 - 하스스톤 스타일 3D 카드 */}
          <Hearthstone3DCard
            monster={playerMonster}
            position="player"
            isAttacking={playerCardState.isAttacking}
            isDamaged={playerCardState.isDamaged}
            isDead={playerCardState.isDead}
            isDodging={playerMonster.dodgeNextAttack || false}
            isBlocking={playerMonster.blockNextAttack || false}
            className="border-blue-200 bg-blue-50"
          >
            <CardHeader>
              <CardTitle className="text-blue-700 text-center">내 또몬</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="relative">
                <img
                  src={playerMonster.image || "/placeholder.svg"}
                  alt={playerMonster.name}
                  className="w-32 h-32 mx-auto rounded-lg object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">{playerMonster.name}</h3>
                <Badge variant="secondary">{playerMonster.rarity}</Badge>
              </div>
              <div className="space-y-2">
                <AnimatedHealthBar
                  currentHp={playerMonster.hp}
                  maxHp={playerMonster.maxHp}
                  previousHp={playerPreviousHp}
                  showDamageIndicator={true}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>공격력: {playerMonster.attack}</p>
                <div className="space-y-1">
                  {playerMonster.skillCooldowns?.map((cooldown, index) => (
                    <p key={index} className="text-xs">
                      스킬 {index + 1}: {cooldown > 0 ? `${cooldown}턴 대기` : "사용 가능"}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Hearthstone3DCard>
          
          {/* 몬스터 교체 애니메이션 */}
          <MonsterSwitchAnimation
            isActive={isSwitchingMonster}
            outgoingMonster={previousPlayerMonster || undefined}
            incomingMonster={playerMonster || undefined}
            position="player"
            onAnimationComplete={handleSwitchAnimationComplete}
          />
        </div>

        {!winner && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isExecutingTurn 
                  ? "턴 실행 중..." 
                  : battlePhase === "selection"
                    ? playerSelectedAction 
                      ? "상대방 행동 선택 중..." 
                      : "당신의 행동을 선택하세요"
                    : battlePhase === "resolution"
                      ? "행동 결과 처리 중..."
                      : "턴 진행 중"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {battlePhase === "selection" && !playerSelectedAction && !isExecutingTurn ? (
                <div className="space-y-4">
                  {!showSkillMenu ? (
                    <div className="grid grid-cols-2 gap-4">
                      <HearthstoneButton onClick={() => handleAction("attack")} variant="outline" size="lg" className="h-16" glowColor="#FF6B6B">
                        <div className="text-center">
                          <div className="font-bold">일반 공격</div>
                          <div className="text-xs text-gray-500">기본 데미지</div>
                        </div>
                      </HearthstoneButton>
                      <HearthstoneButton onClick={() => handleAction("defend")} variant="outline" size="lg" className="h-16" glowColor="#4ECDC4">
                        <div className="text-center">
                          <div className="font-bold">막기</div>
                          <div className="text-xs text-gray-500">받는 피해 감소</div>
                        </div>
                      </HearthstoneButton>
                      <HearthstoneButton onClick={() => handleAction("dodge")} variant="outline" size="lg" className="h-16" glowColor="#45B7D1">
                        <div className="text-center">
                          <div className="font-bold">회피</div>
                          <div className="text-xs text-gray-500">일정 확률로 회피</div>
                        </div>
                      </HearthstoneButton>
                      <HearthstoneButton onClick={() => setShowSkillMenu(true)} variant="default" size="lg" className="h-16" glowColor="#FFD700">
                        <div className="text-center">
                          <div className="font-bold">스킬 사용</div>
                          <div className="text-xs text-gray-300">고유 스킬 선택</div>
                        </div>
                      </HearthstoneButton>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">스킬 선택</h3>
                        <HearthstoneButton onClick={() => setShowSkillMenu(false)} variant="ghost" size="sm" glowColor="#95A5A6">
                          뒤로가기
                        </HearthstoneButton>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {playerMonster.skills?.map((skill, index) => {
                          const cooldown = playerMonster.skillCooldowns?.[index] || 0
                          return (
                            <HearthstoneButton
                              key={index}
                              onClick={() => handleAction("skill", index)}
                              disabled={cooldown > 0}
                              variant="outline"
                              size="lg"
                              className="h-16 justify-start"
                              glowColor={
                                skill.elementType === "fire" ? "#FF6347" :
                                skill.elementType === "water" ? "#4169E1" :
                                skill.elementType === "electric" ? "#FFD700" :
                                skill.elementType === "grass" ? "#32CD32" :
                                skill.elementType === "ice" ? "#87CEEB" :
                                skill.elementType === "light" ? "#FFFF00" :
                                skill.elementType === "shadow" ? "#4B0082" :
                                "#FFD700"
                              }
                            >
                              <div className="text-left">
                                <div className="font-bold">{skill.name}</div>
                                <div className="text-xs text-gray-500">
                                  {cooldown > 0
                                    ? `재사용 대기시간 ${cooldown}턴`
                                    : `재사용 대기시간 ${skill.cooldown}턴`}
                                </div>
                                <div className="text-xs text-gray-400">{skill.description}</div>
                              </div>
                            </HearthstoneButton>
                          )
                        }) || <div className="text-center text-gray-500 py-4">스킬 정보를 불러오는 중...</div>}
                      </div>
                    </div>
                  )}
                </div>
              ) : playerSelectedAction && battlePhase === "selection" ? (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-800">선택된 행동</p>
                    <p className="text-blue-700">
                      {playerSelectedAction.type === "attack" 
                        ? "일반 공격" 
                        : playerSelectedAction.type === "skill"
                          ? playerMonster.skills?.[playerSelectedAction.skillIndex!]?.name || "스킬"
                          : playerSelectedAction.type === "block"
                            ? "막기"
                            : playerSelectedAction.type === "dodge"
                              ? "회피"
                              : playerSelectedAction.type
                      }
                    </p>
                  </div>
                  <p className="text-gray-600">적이 행동을 선택 중입니다...</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : battlePhase === "resolution" ? (
                <div className="text-center space-y-4">
                  {playerSelectedAction && enemySelectedAction && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-800 text-sm">플레이어</p>
                        <p className="text-blue-700 text-sm">
                          {playerSelectedAction.type === "attack" 
                            ? "일반 공격" 
                            : playerSelectedAction.type === "skill"
                              ? playerMonster.skills?.[playerSelectedAction.skillIndex!]?.name || "스킬"
                              : playerSelectedAction.type === "block"
                                ? "막기"
                                : playerSelectedAction.type === "dodge"
                                  ? "회피"
                                  : playerSelectedAction.type
                          }
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="font-semibold text-red-800 text-sm">야생 또몬</p>
                        <p className="text-red-700 text-sm">
                          {enemySelectedAction.type === "attack" 
                            ? "일반 공격" 
                            : enemySelectedAction.type === "skill"
                              ? enemyMonster.skills?.[enemySelectedAction.skillIndex!]?.name || "스킬"
                              : enemySelectedAction.type === "block"
                                ? "막기"
                                : enemySelectedAction.type === "dodge"
                                  ? "회피"
                                  : enemySelectedAction.type
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="text-gray-600">행동 결과를 처리합니다...</p>
                </div>
              ) : isExecutingTurn ? (
                <div className="text-center space-y-2">
                  <p className="text-gray-600">턴을 처리하고 있습니다...</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  {currentTurnSequence && sequenceStep < currentTurnSequence.length && (
                    <p className="text-sm text-muted-foreground">
                      {currentTurnSequence[sequenceStep]?.actor === "player" 
                        ? "플레이어 액션 처리 중..." 
                        : "적 액션 처리 중..."}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-600">잠깐만 기다려주세요...</p>
              )}
            </CardContent>
          </Card>
        )}

        {winner && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-center text-yellow-800">배틀 종료!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-xl font-bold">
                {winner === "player" ? "승리!" : winner === "enemy" ? "패배..." : "무승부"}
              </p>
              <HearthstoneButton onClick={handleBackToMenu} size="lg" glowColor="#27AE60">
                메뉴로 돌아가기
              </HearthstoneButton>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 메인 배틀 임팩트 애니메이션 */}
      <ImprovedImpactSystem
        isActive={isImpactAnimationActive}
        skill={currentAnimationSkill}
        attackerPosition={animationAttacker}
        targetPosition={animationTarget}
        onAnimationComplete={handleImpactAnimationComplete}
      />

      {/* 마법 시전 이펙트 */}
      <MagicCastingEffects
        isActive={isMagicCastingActive}
        elementType={currentAnimationSkill?.elementType || "physical"}
        casterPosition={animationAttacker}
        intensity="medium"
        duration={1.5}
        onComplete={handleMagicCastingComplete}
      />

    </div>
  )
}
