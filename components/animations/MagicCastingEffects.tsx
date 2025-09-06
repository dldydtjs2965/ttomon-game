"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import type { ElementType } from "@/lib/monsters"
import { ADVANCED_PARTICLE_CONFIGS } from "@/lib/animations/hearthstoneHelpers"

interface MagicCastingEffectsProps {
  isActive: boolean
  elementType: ElementType
  casterPosition: "player" | "enemy"
  intensity: "low" | "medium" | "high"
  duration?: number
  onComplete?: () => void
}

export function MagicCastingEffects({
  isActive,
  elementType,
  casterPosition,
  intensity = "medium",
  duration = 2.0,
  onComplete
}: MagicCastingEffectsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const timeline = gsap.timeline()
    timelineRef.current = timeline

    // 마법 시전 이펙트 실행
    executeMagicCasting(timeline)

    return () => {
      timeline.kill()
      cleanupMagicEffects()
    }
  }, [isActive, elementType, casterPosition, intensity, duration])

  const executeMagicCasting = (timeline: GSAPTimeline) => {
    const container = containerRef.current!
    const casterElement = document.querySelector(`.${casterPosition}-monster`) as HTMLElement
    
    if (!casterElement) return

    // 1. 마나 크리스탈 생성 및 회전
    createRotatingManaCrystals(timeline, container, casterElement)
    
    // 2. 마법진 생성
    createMagicCircle(timeline, container, casterElement)
    
    // 3. 에너지 집중 효과
    createEnergyConcentration(timeline, container, casterElement)
    
    // 4. 시전 완료 시 콜백
    timeline.call(() => {
      onComplete?.()
    })
  }

  // 회전하는 마나 크리스탈 효과 - 안전한 위치 계산
  const createRotatingManaCrystals = (
    timeline: GSAPTimeline,
    container: HTMLElement,
    casterElement: HTMLElement
  ) => {
    const crystalCount = intensity === "high" ? 8 : intensity === "medium" ? 6 : 4
    const crystals: HTMLElement[] = []
    
    const casterRect = casterElement.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    
    // 안전한 경계 설정
    const safeZone = {
      left: 50,
      right: containerRect.width - 50,
      top: 50,
      bottom: containerRect.height - 50
    }
    
    // 안전한 중심점 계산
    const centerX = Math.max(safeZone.left, Math.min(safeZone.right, 
      casterRect.left - containerRect.left + casterRect.width / 2))
    const centerY = Math.max(safeZone.top, Math.min(safeZone.bottom,
      casterRect.top - containerRect.top + casterRect.height / 2))
    
    // 크리스탈 생성 - 안전한 범위 내에서
    for (let i = 0; i < crystalCount; i++) {
      const crystal = createManaCrystal(elementType, i)
      const radius = 60
      const angle = (i / crystalCount) * Math.PI * 2
      
      // 안전한 위치 계산
      const crystalX = Math.max(safeZone.left, Math.min(safeZone.right, 
        centerX + Math.cos(angle) * radius))
      const crystalY = Math.max(safeZone.top, Math.min(safeZone.bottom,
        centerY + Math.sin(angle) * radius))
      
      crystal.style.left = crystalX + "px"
      crystal.style.top = crystalY + "px"
      
      container.appendChild(crystal)
      crystals.push(crystal)
    }
    
    // 회전 애니메이션
    timeline.to(crystals, {
      rotation: 360,
      duration: duration * 0.8,
      ease: "none",
      stagger: {
        each: 0.1,
        from: "center"
      }
    })
    
    // 크리스탈이 중심으로 수렴하며 사라짐
    timeline.to(crystals, {
      x: centerX,
      y: centerY,
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      stagger: 0.05,
      onComplete: () => {
        crystals.forEach(crystal => crystal.remove())
      }
    }, "-=0.3")
  }

  // 마나 크리스탈 생성
  const createManaCrystal = (elementType: ElementType, index: number): HTMLElement => {
    const crystal = document.createElement("div")
    const size = 12 + (intensity === "high" ? 4 : intensity === "medium" ? 2 : 0)
    const colors = ADVANCED_PARTICLE_CONFIGS[elementType].layers.foreground.colors
    
    crystal.className = "absolute pointer-events-none magic-crystal"
    crystal.style.width = `${size}px`
    crystal.style.height = `${size}px`
    crystal.style.backgroundColor = colors[index % colors.length]
    crystal.style.borderRadius = "2px"
    crystal.style.transform = "rotate(45deg)"
    crystal.style.boxShadow = `0 0 10px ${colors[index % colors.length]}`
    crystal.style.opacity = "0.8"
    crystal.style.zIndex = "45"
    
    // 크리스탈별 고유 펄스 애니메이션
    gsap.to(crystal, {
      scale: 1.3,
      opacity: 1,
      duration: 0.5 + Math.random() * 0.3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: index * 0.1
    })
    
    return crystal
  }

  // 마법진 생성 - 안전한 위치 계산
  const createMagicCircle = (
    timeline: GSAPTimeline,
    container: HTMLElement,
    casterElement: HTMLElement
  ) => {
    const casterRect = casterElement.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    
    // 안전한 경계 설정
    const safeZone = {
      left: 50,
      right: containerRect.width - 50,
      top: 50,
      bottom: containerRect.height - 50
    }
    
    // 안전한 중심점 계산
    const centerX = Math.max(safeZone.left, Math.min(safeZone.right, 
      casterRect.left - containerRect.left + casterRect.width / 2))
    const centerY = Math.max(safeZone.top, Math.min(safeZone.bottom,
      casterRect.top - containerRect.top + casterRect.height / 2))
    
    // 외부 링
    const outerRing = createMagicRing(elementType, 120, 3, "outer")
    outerRing.style.left = centerX + "px"
    outerRing.style.top = centerY + "px"
    container.appendChild(outerRing)
    
    // 내부 링
    const innerRing = createMagicRing(elementType, 80, 2, "inner")
    innerRing.style.left = centerX + "px"
    innerRing.style.top = centerY + "px"
    container.appendChild(innerRing)
    
    // 중앙 코어
    const core = createMagicCore(elementType)
    core.style.left = centerX + "px"
    core.style.top = centerY + "px"
    container.appendChild(core)
    
    // 마법진 등장 애니메이션
    timeline
      .from([outerRing, innerRing], {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: 0.1
      })
      .from(core, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.out(1.7)"
      }, "-=0.2")
      .to(outerRing, {
        rotation: 360,
        duration: duration,
        ease: "none"
      })
      .to(innerRing, {
        rotation: -360,
        duration: duration * 0.8,
        ease: "none"
      }, 0)
      // 마법진 소멸
      .to([outerRing, innerRing, core], {
        scale: 1.5,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          outerRing.remove()
          innerRing.remove()
          core.remove()
        }
      }, "-=0.5")
  }

  // 마법 링 생성
  const createMagicRing = (
    elementType: ElementType,
    diameter: number,
    strokeWidth: number,
    type: string
  ): HTMLElement => {
    const ring = document.createElement("div")
    const color = ADVANCED_PARTICLE_CONFIGS[elementType].layers.middle.colors[0]
    
    ring.className = `absolute pointer-events-none magic-ring magic-ring-${type}`
    ring.style.width = `${diameter}px`
    ring.style.height = `${diameter}px`
    ring.style.border = `${strokeWidth}px solid ${color}`
    ring.style.borderRadius = "50%"
    ring.style.transform = "translate(-50%, -50%)"
    ring.style.boxShadow = `inset 0 0 20px ${color}, 0 0 20px ${color}`
    ring.style.zIndex = "42"
    
    // 마법진 패턴 추가
    if (type === "outer") {
      // 외부 링에 룬 문자 패턴 추가
      for (let i = 0; i < 6; i++) {
        const rune = document.createElement("div")
        rune.className = "absolute w-2 h-2 bg-current rounded-full"
        rune.style.top = "-1px"
        rune.style.left = "50%"
        rune.style.transform = `rotate(${i * 60}deg) translateX(-50%) translateY(-${diameter/2 + 5}px)`
        rune.style.color = color
        ring.appendChild(rune)
      }
    }
    
    return ring
  }

  // 마법진 코어 생성
  const createMagicCore = (elementType: ElementType): HTMLElement => {
    const core = document.createElement("div")
    const colors = ADVANCED_PARTICLE_CONFIGS[elementType].layers.foreground.colors
    
    core.className = "absolute pointer-events-none magic-core"
    core.style.width = "20px"
    core.style.height = "20px"
    core.style.borderRadius = "50%"
    core.style.transform = "translate(-50%, -50%)"
    core.style.background = `radial-gradient(circle, ${colors[0]}, ${colors[1]})`
    core.style.boxShadow = `0 0 30px ${colors[0]}`
    core.style.zIndex = "43"
    
    // 코어 펄스 애니메이션
    gsap.to(core, {
      scale: 1.3,
      duration: 0.8,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    })
    
    return core
  }

  // 에너지 집중 효과 - 안전한 위치 계산
  const createEnergyConcentration = (
    timeline: GSAPTimeline,
    container: HTMLElement,
    casterElement: HTMLElement
  ) => {
    const casterRect = casterElement.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    
    // 안전한 경계 설정
    const safeZone = {
      left: 50,
      right: containerRect.width - 50,
      top: 50,
      bottom: containerRect.height - 50
    }
    
    // 안전한 중심점 계산
    const centerX = Math.max(safeZone.left, Math.min(safeZone.right, 
      casterRect.left - containerRect.left + casterRect.width / 2))
    const centerY = Math.max(safeZone.top, Math.min(safeZone.bottom,
      casterRect.top - containerRect.top + casterRect.height / 2))
    
    // 에너지 파티클들이 중심으로 모이는 효과
    const particleCount = intensity === "high" ? 20 : intensity === "medium" ? 15 : 10
    const energyParticles: HTMLElement[] = []
    
    for (let i = 0; i < particleCount; i++) {
      const particle = createEnergyParticle(elementType)
      
      // 랜덤한 시작 위치 (caster 주변) - 안전한 범위 내에서
      const angle = Math.random() * Math.PI * 2
      const startRadius = 100 + Math.random() * 50
      const startX = Math.max(safeZone.left, Math.min(safeZone.right,
        centerX + Math.cos(angle) * startRadius))
      const startY = Math.max(safeZone.top, Math.min(safeZone.bottom,
        centerY + Math.sin(angle) * startRadius))
      
      particle.style.left = startX + "px"
      particle.style.top = startY + "px"
      
      container.appendChild(particle)
      energyParticles.push(particle)
    }
    
    // 파티클들이 중심으로 수렴
    timeline.to(energyParticles, {
      x: centerX,
      y: centerY,
      scale: 0.5,
      duration: duration * 0.6,
      ease: "power2.inOut",
      stagger: {
        each: 0.05,
        from: "random"
      },
      onComplete: () => {
        energyParticles.forEach(particle => particle.remove())
      }
    }, 0)
  }

  // 에너지 파티클 생성
  const createEnergyParticle = (elementType: ElementType): HTMLElement => {
    const particle = document.createElement("div")
    const size = 4 + Math.random() * 4
    const colors = ADVANCED_PARTICLE_CONFIGS[elementType].layers.middle.colors
    
    particle.className = "absolute pointer-events-none energy-particle"
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    particle.style.borderRadius = "50%"
    particle.style.boxShadow = `0 0 8px ${colors[0]}`
    particle.style.opacity = "0.8"
    particle.style.zIndex = "44"
    
    // 개별 파티클 반짝임
    gsap.to(particle, {
      opacity: 1,
      scale: 1.2,
      duration: 0.3 + Math.random() * 0.4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    })
    
    return particle
  }

  // 효과 클린업
  const cleanupMagicEffects = () => {
    const magicElements = document.querySelectorAll(
      ".magic-crystal, .magic-ring, .magic-core, .energy-particle"
    )
    magicElements.forEach(element => element.remove())
    gsap.killTweensOf("*")
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-45 overflow-hidden"
      style={{ display: isActive ? "block" : "none" }}
    />
  )
}