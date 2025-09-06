"use client"

import { motion } from "framer-motion"
import { MonsterCard } from "@/components/monster-card"
import type { Monster } from "@/lib/monsters"
import { useEffect } from "react"

interface AnimatedMonsterCardProps {
  monster: Monster | null
  x: number
  y: number
  isPlayer: boolean
  onClick?: () => void
  selected?: boolean
  showActions?: boolean
  disabled?: boolean
  isAttacking?: boolean
  isBeingAttacked?: boolean
  isDead?: boolean
  isDodging?: boolean
  isBlocking?: boolean
}

export function AnimatedMonsterCard({
  monster,
  x,
  y,
  isPlayer,
  onClick,
  selected = false,
  showActions = false,
  disabled = false,
  isAttacking = false,
  isBeingAttacked = false,
  isDead = false,
  isDodging = false,
  isBlocking = false,
}: AnimatedMonsterCardProps) {
  useEffect(() => {
    if (monster) {
      console.log(`[AnimatedMonsterCard] 상태 변경 감지: ${monster.name} (${isPlayer ? '플레이어' : '적'}) - isAttacking: ${isAttacking}, isBeingAttacked: ${isBeingAttacked}, isDead: ${isDead}, isDodging: ${isDodging}, isBlocking: ${isBlocking}`)
      
      if (isAttacking) {
        console.log(`[AnimatedMonsterCard] 🗡️ 공격 애니메이션 시작: ${monster.name} (${isPlayer ? '플레이어' : '적'})`)
      }
      if (isBeingAttacked) {
        console.log(`[AnimatedMonsterCard] 💥 피격 애니메이션 시작: ${monster.name} (${isPlayer ? '플레이어' : '적'})`)
      }
      if (isDodging) {
        console.log(`[AnimatedMonsterCard] 🏃 회피 애니메이션 시작: ${monster.name} (${isPlayer ? '플레이어' : '적'})`)
      }
      if (isBlocking) {
        console.log(`[AnimatedMonsterCard] 🛡️ 막기 애니메이션 시작: ${monster.name} (${isPlayer ? '플레이어' : '적'})`)
      }
      if (isDead) {
        console.log(`[AnimatedMonsterCard] 💀 사망 애니메이션 시작: ${monster.name} (${isPlayer ? '플레이어' : '적'})`)
      }
    }
  }, [isAttacking, isBeingAttacked, isDead, isDodging, isBlocking, monster, isPlayer])
  if (!monster) {
    return (
      <motion.div
        className="aspect-square border-2 border-dashed border-muted rounded-lg flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-xs text-muted-foreground">빈 칸</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isDead ? 0.3 : 1,
        scale: isDead ? 0.9 : 1,
        x: isAttacking ? (isPlayer ? -10 : 10) : isDodging ? (isPlayer ? 5 : -5) : 0,
        rotate: isBeingAttacked ? [0, -5, 5, -5, 0] : 0,
      }}
      transition={{
        duration: 0.3,
        rotate: { duration: 0.5, repeat: isBeingAttacked ? 2 : 0 },
        x: { duration: isDodging ? 0.2 : 0.3 }
      }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className="relative"
    >
      <MonsterCard
        monster={monster}
        onClick={onClick}
        selected={selected}
        showActions={showActions}
        compact={true}
        disabled={disabled}
      />


      {/* Damage Effect */}
      {isBeingAttacked && (
        <motion.div
          className="absolute inset-0 bg-red-500 rounded-lg opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.3, repeat: 2 }}
        />
      )}

      {/* Dodge Effect */}
      {isDodging && (
        <motion.div
          className="absolute inset-0 bg-blue-400 rounded-lg opacity-20"
          initial={{ opacity: 0, x: 0 }}
          animate={{ 
            opacity: [0, 0.6, 0],
            x: [0, (isPlayer ? 10 : -10), 0]
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      )}

      {/* Block Effect */}
      {isBlocking && (
        <motion.div
          className="absolute inset-0 bg-yellow-400 rounded-lg opacity-30"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}

      {/* Death Effect */}
      {isDead && (
        <motion.div
          className="absolute inset-0 bg-gray-800 rounded-lg opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  )
}
