"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { Skill } from "@/lib/monsters"
import { Heart, Zap, Shield, Eye, Swords } from "lucide-react"

interface SkillAnimationProps {
  skill: Skill | null
  isVisible: boolean
  onComplete: () => void
}

export function SkillAnimation({ skill, isVisible, onComplete }: SkillAnimationProps) {
  if (!skill) {
    console.log(`[SkillAnimation] 스킬이 없어서 렌더링 안함`)
    return null
  }

  if (isVisible) {
    console.log(`[SkillAnimation] 스킬 애니메이션 표시: ${skill.name} (${skill.type})`)
  }

  if (!skill) return null

  const getSkillIcon = (type: string) => {
    switch (type) {
      case "heal":
        return <Heart className="w-12 h-12 text-green-500" />
      case "wide_attack":
        return <Zap className="w-12 h-12 text-orange-500" />
      case "strong_attack":
        return <Swords className="w-12 h-12 text-red-500" />
      case "dodge":
        return <Eye className="w-12 h-12 text-blue-500" />
      case "block":
        return <Shield className="w-12 h-12 text-yellow-500" />
      default:
        return <Zap className="w-12 h-12 text-gray-500" />
    }
  }

  const getSkillColor = (type: string) => {
    switch (type) {
      case "heal":
        return "from-green-500/20 to-green-500/5"
      case "wide_attack":
        return "from-orange-500/20 to-orange-500/5"
      case "strong_attack":
        return "from-red-500/20 to-red-500/5"
      case "dodge":
        return "from-blue-500/20 to-blue-500/5"
      case "block":
        return "from-yellow-500/20 to-yellow-500/5"
      default:
        return "from-gray-500/20 to-gray-500/5"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            setTimeout(onComplete, 1000)
          }}
        >
          <motion.div
            className={`absolute inset-0 bg-gradient-radial ${getSkillColor(skill.type)}`}
            initial={{ scale: 0 }}
            animate={{ scale: 3 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          <motion.div
            className="relative z-10 text-center space-y-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              {getSkillIcon(skill.type)}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">{skill.name}</h3>
              <p className="text-white/80 drop-shadow-lg">{skill.description}</p>
            </motion.div>
          </motion.div>

          {/* Particle Effects */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 8) * 200,
                y: Math.sin((i * Math.PI * 2) / 8) * 200,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
