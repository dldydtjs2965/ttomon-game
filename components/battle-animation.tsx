"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { BattleResult } from "@/lib/battle-engine"
import { Heart, Zap, Shield, Eye, X } from "lucide-react"

interface BattleAnimationProps {
  results: BattleResult[]
  isPlayerTurn: boolean
  onComplete: () => void
}

interface FloatingText {
  id: string
  text: string
  color: string
  icon: React.ReactNode
  position: { x: number; y: number }
}

export function BattleAnimation({ results, isPlayerTurn, onComplete }: BattleAnimationProps) {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [currentIndex, setCurrent] = useState(0)

  useEffect(() => {
    if (results.length === 0) {
      console.log(`[BattleAnimation] 결과가 없어서 애니메이션 스킵`)
      onComplete()
      return
    }

    console.log(`[BattleAnimation] 배틀 애니메이션 시작 - 결과 개수: ${results.length}`)
    
    // Reset floating texts at start
    setFloatingTexts([])

    const animateResults = async () => {
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        console.log(`[BattleAnimation] 결과 ${i + 1}/${results.length} 애니메이션 시작:`, {
          damage: result.damage,
          healed: result.healed,
          dodged: result.dodged,
          blocked: result.blocked,
          position: result.targetPosition
        })

        // Create floating text for each result
        const floatingText: FloatingText = {
          id: `${Date.now()}-${i}-${Math.random()}`, // More unique ID
          text: getResultText(result),
          color: getResultColor(result),
          icon: getResultIcon(result),
          position: {
            x: result.targetPosition.x * 120 + 60, // Approximate grid position
            y: result.targetPosition.y * 120 + 60,
          },
        }

        setFloatingTexts((prev) => [...prev, floatingText])
        setCurrent(i)

        // Wait for animation
        await new Promise((resolve) => setTimeout(resolve, 1000))

        console.log(`[BattleAnimation] 결과 ${i + 1} 애니메이션 완료, 텍스트 제거 중`)
        
        // Remove floating text immediately after animation
        setFloatingTexts((prev) => prev.filter((text) => text.id !== floatingText.id))
        
        // Small delay between animations
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Complete animation and clear all remaining texts
      console.log(`[BattleAnimation] 모든 애니메이션 완료, 정리 중`)
      setFloatingTexts([])
      setTimeout(onComplete, 300)
    }

    animateResults()
  }, [results, onComplete])

  const getResultText = (result: BattleResult): string => {
    if (result.healed > 0) return `+${result.healed}`
    
    // 회피 관련 메시지
    if (result.dodgeAttempted) {
      if (result.dodged) {
        return "회피 성공!" 
      } else {
        return "회피 실패!"
      }
    }
    
    // 막기 관련 메시지 (원래 데미지 추정)
    if (result.blockAttempted || result.blocked) {
      if (result.blocked && result.damage > 0) {
        // 막기로 감소된 데미지 표시 (원래 데미지는 대략 2배로 추정)
        const estimatedOriginalDamage = Math.floor(result.damage / 0.5)
        const reducedAmount = estimatedOriginalDamage - result.damage
        return `방어! -${reducedAmount}`
      } else if (result.blocked && result.damage === 0) {
        return "완전 방어!"
      } else {
        return "방어 실패!"
      }
    }
    
    // 일반 회피 (스킬 없이)
    if (result.dodged && !result.dodgeAttempted) return "회피!"
    
    // 일반 막기 (스킬 없이)  
    if (result.blocked && !result.blockAttempted) {
      const estimatedOriginalDamage = Math.floor(result.damage / 0.6)
      const reducedAmount = estimatedOriginalDamage - result.damage
      return `방어 -${reducedAmount}`
    }
    
    if (result.damage > 0) return `-${result.damage}`
    return "빗나감"
  }

  const getResultColor = (result: BattleResult): string => {
    if (result.healed > 0) return "text-green-500"
    
    // 회피 관련 색상
    if (result.dodgeAttempted) {
      if (result.dodged) {
        return "text-green-400" // 성공 - 밝은 초록
      } else {
        return "text-red-400" // 실패 - 밝은 빨강  
      }
    }
    
    // 막기 관련 색상
    if (result.blockAttempted || result.blocked) {
      if (result.blocked) {
        return "text-yellow-400" // 성공 - 밝은 노랑
      } else {
        return "text-orange-500" // 실패 - 주황
      }
    }
    
    // 일반 회피/막기
    if (result.dodged) return "text-blue-500"
    if (result.blocked) return "text-yellow-500"
    
    if (result.damage > 0) return "text-red-500"
    return "text-gray-500"
  }

  const getResultIcon = (result: BattleResult): React.ReactNode => {
    if (result.healed > 0) return <Heart className="w-4 h-4" />
    
    // 회피 관련 아이콘
    if (result.dodgeAttempted) {
      if (result.dodged) {
        return <Eye className="w-4 h-4" /> // 성공 - 눈
      } else {
        return <X className="w-4 h-4" /> // 실패 - X
      }
    }
    
    // 막기 관련 아이콘
    if (result.blockAttempted || result.blocked) {
      if (result.blocked) {
        return <Shield className="w-4 h-4" /> // 성공 - 방패
      } else {
        return <X className="w-4 h-4" /> // 실패 - X
      }
    }
    
    // 일반 회피/막기
    if (result.dodged) return <Eye className="w-4 h-4" />
    if (result.blocked) return <Shield className="w-4 h-4" />
    
    if (result.damage > 0) return <Zap className="w-4 h-4" />
    return <X className="w-4 h-4" />
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {floatingTexts.map((text) => (
          <motion.div
            key={text.id}
            initial={{
              opacity: 0,
              scale: 0.5,
              x: text.position.x,
              y: text.position.y,
            }}
            animate={{
              opacity: 1,
              scale: 1.2,
              y: text.position.y - 50,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: text.position.y - 100,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute flex items-center gap-1 font-bold text-lg ${text.color} drop-shadow-lg`}
          >
            {text.icon}
            {text.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
