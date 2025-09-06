"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import type { Monster } from "@/lib/monsters"

interface MonsterSwitchAnimationProps {
  isActive: boolean
  outgoingMonster?: Monster
  incomingMonster?: Monster
  position: "player" | "enemy"
  onAnimationComplete?: () => void
}

export function MonsterSwitchAnimation({
  isActive,
  outgoingMonster,
  incomingMonster,
  position,
  onAnimationComplete
}: MonsterSwitchAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!isActive || !outgoingMonster || !incomingMonster || !containerRef.current) return

    // 이전 애니메이션 정리
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    const container = containerRef.current

    // 포켓볼 이펙트 생성
    const pokeball = document.createElement("div")
    pokeball.className = "absolute w-12 h-12 rounded-full bg-gradient-to-b from-red-500 to-white border-4 border-black z-50"
    pokeball.style.left = "50%"
    pokeball.style.top = "50%"
    pokeball.style.transform = "translate(-50%, -50%)"
    
    // 포켓볼 내부 디테일
    const pokeballInner = document.createElement("div")
    pokeballInner.className = "absolute inset-0 rounded-full"
    pokeballInner.style.background = "linear-gradient(to bottom, #dc2626 0%, #dc2626 45%, #000000 45%, #000000 55%, #ffffff 55%)"
    
    const pokeballCenter = document.createElement("div")
    pokeballCenter.className = "absolute w-4 h-4 bg-white rounded-full border-2 border-black"
    pokeballCenter.style.left = "50%"
    pokeballCenter.style.top = "50%"
    pokeballCenter.style.transform = "translate(-50%, -50%)"
    
    pokeball.appendChild(pokeballInner)
    pokeball.appendChild(pokeballCenter)
    container.appendChild(pokeball)

    // 애니메이션 타임라인 생성
    timelineRef.current = gsap.timeline({
      onComplete: () => {
        pokeball.remove()
        onAnimationComplete?.()
      }
    })

    const direction = position === "player" ? 1 : -1

    timelineRef.current
      // 포켓볼 등장 - 화면 밖에서 날아옴
      .fromTo(pokeball, {
        x: -200 * direction,
        y: -100,
        rotation: 0,
        scale: 0.5,
        opacity: 0
      }, {
        x: 0,
        y: 0,
        rotation: 720 * direction,
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(1.7)"
      })
      
      // 포켓볼 회전 및 빛나는 효과
      .to(pokeball, {
        scale: 1.2,
        rotation: "+=360",
        duration: 0.4,
        ease: "power2.inOut"
      })
      
      // 몬스터 교체 순간 - 빛 번쩍임
      .to(container, {
        background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)",
        duration: 0.1,
        yoyo: true,
        repeat: 1
      }, "-=0.2")
      
      // 포켓볼이 열리는 애니메이션
      .to(pokeball, {
        scale: 1.5,
        rotation: "+=180",
        opacity: 0.8,
        duration: 0.3,
        ease: "power2.out"
      })
      
      // 파티클 이펙트 추가
      .call(() => {
        createSwitchParticles()
      })
      
      // 포켓볼 사라짐
      .to(pokeball, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      })

    // 파티클 생성 함수
    const createSwitchParticles = () => {
      const particleCount = 12
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div")
        particle.className = "absolute w-2 h-2 rounded-full pointer-events-none"
        particle.style.background = "radial-gradient(circle, #fbbf24, #f59e0b)"
        particle.style.left = "50%"
        particle.style.top = "50%"
        particle.style.zIndex = "45"
        
        container.appendChild(particle)
        
        const angle = (i / particleCount) * Math.PI * 2
        const distance = 60 + Math.random() * 40
        const endX = Math.cos(angle) * distance
        const endY = Math.sin(angle) * distance
        
        gsap.to(particle, {
          x: endX,
          y: endY,
          opacity: 0,
          scale: Math.random() * 0.5 + 0.5,
          duration: 0.8 + Math.random() * 0.4,
          ease: "power2.out",
          onComplete: () => particle.remove()
        })
      }
    }

  }, [isActive, outgoingMonster, incomingMonster, position, onAnimationComplete])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [])

  if (!isActive) return null

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-40"
      style={{ 
        background: "transparent"
      }}
    >
      {/* 추가적인 시각 효과를 위한 오버레이 */}
      <div className="absolute inset-0 bg-gradient-radial from-yellow-200/20 via-transparent to-transparent animate-pulse" />
    </div>
  )
}