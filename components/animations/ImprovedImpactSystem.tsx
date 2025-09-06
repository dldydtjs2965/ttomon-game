"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import type { ElementType, Skill } from "@/lib/monsters"

interface ImprovedImpactSystemProps {
  isActive: boolean
  skill: Skill | null
  attackerPosition: "player" | "enemy"
  targetPosition: "player" | "enemy"
  onAnimationComplete: () => void
}

export function ImprovedImpactSystem({
  isActive,
  skill,
  attackerPosition,
  targetPosition,
  onAnimationComplete
}: ImprovedImpactSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (!isActive || !skill || !containerRef.current) return

    const timeline = gsap.timeline()
    timelineRef.current = timeline

    executeImprovedAttack(timeline, skill, attackerPosition, targetPosition)
    timeline.call(onAnimationComplete)

    return () => {
      timeline.kill()
      cleanupImprovedEffects()
    }
  }, [isActive, skill, attackerPosition, targetPosition, onAnimationComplete])

  const executeImprovedAttack = (
    timeline: GSAPTimeline,
    skill: Skill,
    attacker: "player" | "enemy",
    target: "player" | "enemy"
  ) => {
    const container = containerRef.current!
    const elementType = skill.elementType || "physical"
    
    // 안전한 요소 찾기
    const attackerEl = document.querySelector(`.${attacker}-monster`) as HTMLElement
    const targetEl = document.querySelector(`.${target}-monster`) as HTMLElement
    
    if (!attackerEl || !targetEl) {
      console.warn("Monster elements not found")
      return
    }

    // 컨테이너 경계 설정
    const containerRect = container.getBoundingClientRect()
    const safeZone = {
      left: 50,
      right: containerRect.width - 50,
      top: 50,
      bottom: containerRect.height - 50
    }

    // 임팩트 시퀀스 실행
    executeImpactSequence(timeline, attackerEl, targetEl, elementType, skill, safeZone)
  }

  const executeImpactSequence = (
    timeline: GSAPTimeline,
    attackerEl: HTMLElement,
    targetEl: HTMLElement,
    elementType: ElementType,
    skill: Skill,
    safeZone: any
  ) => {
    const container = containerRef.current!
    const damage = skill.damage || skill.healAmount || 30

    // 1단계: 충전 및 공격 준비 (타겟 방향으로 향하기)
    const attackDirection = getAttackDirection(attackerEl, targetEl)
    
    timeline
      .call(() => createChargingEffect(attackerEl, elementType))
      .to(attackerEl, {
        scale: 1.08, // 스케일 감소
        rotationY: attackDirection.rotationY,
        x: attackDirection.preparationOffset,
        duration: 0.3,
        ease: "back.out(1.7)",
        transformOrigin: "center"
      })
      
    // 2단계: 공격 발사 (0.3초)  
    .add(() => {
      createAttackProjectile(container, attackerEl, targetEl, elementType, safeZone)
    }, "+=0.2")
    
    // 3단계: 임팩트 (0.4초)
    .add(() => {
      createMassiveImpact(container, targetEl, elementType, damage, safeZone)
    }, "+=0.3")
    
    // 4단계: 후폭풍 및 복구 (0.6초)
    .add(() => {
      createShockwaveEffect(container, targetEl, elementType, safeZone)
    }, "-=0.2")
    
    // 5단계: 추가 타격감 효과
    .add(() => {
      createAdditionalImpactEffects(container, targetEl, elementType, safeZone)
    }, "-=0.1")
    .to(attackerEl, {
      scale: 1,
      x: 0,
      y: 0,
      rotation: 0,
      rotationY: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)"
    }, "-=0.3")
  }

  // 충전 효과 - 안전한 범위 내에서
  const createChargingEffect = (attackerEl: HTMLElement, elementType: ElementType) => {
    const colors = getElementColors(elementType)
    
    // 공격자 주위에 에너지 고리 생성 - 더 부드럽고 자연스럽게
    for (let i = 0; i < 2; i++) {
      const ring = document.createElement("div")
      ring.className = "absolute rounded-full pointer-events-none improved-effect"
      ring.style.width = `${50 + i * 25}px`
      ring.style.height = `${50 + i * 25}px`
      ring.style.border = `1px solid ${colors.primary}`
      ring.style.background = `radial-gradient(circle, transparent 60%, ${colors.primary}20 100%)`
      ring.style.boxShadow = `0 0 15px ${colors.primary}, inset 0 0 15px ${colors.primary}30`
      ring.style.opacity = "0"
      ring.style.zIndex = "45"
      
      // 공격자 중심으로 배치
      const rect = attackerEl.getBoundingClientRect()
      const containerRect = containerRef.current!.getBoundingClientRect()
      
      ring.style.left = (rect.left - containerRect.left + rect.width/2 - parseInt(ring.style.width)/2) + "px"
      ring.style.top = (rect.top - containerRect.top + rect.height/2 - parseInt(ring.style.height)/2) + "px"
      
      containerRef.current!.appendChild(ring)
      
      gsap.to(ring, {
        opacity: 0.7,
        scale: 1.5,
        duration: 0.4,
        delay: i * 0.1,
        ease: "power2.out",
        onComplete: () => ring.remove()
      })
    }
    
    // 공격자 글로우 효과
    gsap.to(attackerEl, {
      boxShadow: `0 0 30px ${colors.primary}`,
      duration: 0.3,
      repeat: 1,
      yoyo: true
    })
  }

  // 공격 투사체 - 화면 내 제한
  const createAttackProjectile = (
    container: HTMLElement,
    attackerEl: HTMLElement,
    targetEl: HTMLElement,
    elementType: ElementType,
    safeZone: any
  ) => {
    const colors = getElementColors(elementType)
    const projectile = document.createElement("div")
    
    projectile.className = "absolute pointer-events-none improved-effect"
    projectile.style.width = "20px"
    projectile.style.height = "20px"
    projectile.style.borderRadius = "50%"
    projectile.style.background = `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`
    projectile.style.boxShadow = `0 0 20px ${colors.primary}`
    projectile.style.zIndex = "50"
    
    // 시작 위치 (공격자)
    const attackerRect = attackerEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const startX = Math.max(safeZone.left, Math.min(safeZone.right, attackerRect.left - containerRect.left + attackerRect.width/2))
    const startY = Math.max(safeZone.top, Math.min(safeZone.bottom, attackerRect.top - containerRect.top + attackerRect.height/2))
    
    // 목표 위치 (타겟)
    const targetRect = targetEl.getBoundingClientRect()
    const endX = Math.max(safeZone.left, Math.min(safeZone.right, targetRect.left - containerRect.left + targetRect.width/2))
    const endY = Math.max(safeZone.top, Math.min(safeZone.bottom, targetRect.top - containerRect.top + targetRect.height/2))
    
    projectile.style.left = startX + "px"
    projectile.style.top = startY + "px"
    
    container.appendChild(projectile)
    
    // 투사체 움직임
    gsap.to(projectile, {
      x: endX - startX,
      y: endY - startY,
      scale: 2,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => projectile.remove()
    })
    
    // 투사체 트레일
    gsap.to(projectile, {
      boxShadow: `0 0 40px ${colors.primary}`,
      duration: 0.3
    })
  }

  // 강력한 임팩트 효과
  const createMassiveImpact = (
    container: HTMLElement,
    targetEl: HTMLElement,
    elementType: ElementType,
    damage: number,
    safeZone: any
  ) => {
    const colors = getElementColors(elementType)
    const intensity = damage > 50 ? "high" : damage > 25 ? "medium" : "low"
    
    // 화면 흔들림
    createScreenShake(intensity)
    
    // 임팩트 플래시
    createImpactFlash(colors.primary, intensity)
    
    // 타겟 위치 기준으로 안전한 좌표 계산
    const targetRect = targetEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const centerX = Math.max(safeZone.left, Math.min(safeZone.right, targetRect.left - containerRect.left + targetRect.width/2))
    const centerY = Math.max(safeZone.top, Math.min(safeZone.bottom, targetRect.top - containerRect.top + targetRect.height/2))
    
    // 임팩트 링 효과
    for (let i = 0; i < 5; i++) {
      const ring = document.createElement("div")
      ring.className = "absolute rounded-full border-4 pointer-events-none improved-effect"
      ring.style.borderColor = colors.primary
      ring.style.boxShadow = `0 0 30px ${colors.primary}`
      ring.style.opacity = "0.8"
      ring.style.zIndex = "55"
      
      // 중심점에 배치 (화면 내 제한)
      ring.style.left = centerX + "px"
      ring.style.top = centerY + "px"
      ring.style.transform = "translate(-50%, -50%)"
      
      container.appendChild(ring)
      
      gsap.fromTo(ring, {
        width: "10px",
        height: "10px",
        opacity: 0.8
      }, {
        width: `${100 + i * 30}px`,
        height: `${100 + i * 30}px`,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.05,
        ease: "power2.out",
        onComplete: () => ring.remove()
      })
    }
    
    // 파티클 폭발 - 제한된 범위 내
    createContainedParticles(container, centerX, centerY, elementType, safeZone)
    
    // 타겟 타격 반응 - 스케일 증가 제거
    const knockbackDistance = intensity === "high" ? 25 : intensity === "medium" ? 15 : 8
    const knockbackTimeline = gsap.timeline()
    knockbackTimeline
      .to(targetEl, {
        x: knockbackDistance * (targetEl.classList.contains("player-monster") ? -1 : 1),
        scale: 0.9, // 살짝 줄어들기만
        rotation: 3 * (targetEl.classList.contains("player-monster") ? -1 : 1),
        duration: 0.12,
        ease: "power3.out"
      })
      .to(targetEl, {
        x: 0,
        scale: 1, // 바로 원래 크기로
        rotation: 0,
        duration: 0.25,
        ease: "back.out(1.7)"
      })
  }

  // 제한된 파티클 시스템
  const createContainedParticles = (
    container: HTMLElement,
    centerX: number,
    centerY: number,
    elementType: ElementType,
    safeZone: any
  ) => {
    const colors = getElementColors(elementType)
    const particleCount = 25
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.className = "absolute pointer-events-none improved-effect"
      
      const size = 4 + Math.random() * 6
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.backgroundColor = colors.particles[i % colors.particles.length]
      particle.style.borderRadius = "50%"
      particle.style.boxShadow = `0 0 10px ${colors.primary}`
      particle.style.zIndex = "52"
      
      // 중심점에서 시작
      particle.style.left = centerX + "px"
      particle.style.top = centerY + "px"
      
      container.appendChild(particle)
      
      // 안전한 범위 내에서만 이동
      const angle = (i / particleCount) * Math.PI * 2
      const distance = 50 + Math.random() * 80
      let targetX = centerX + Math.cos(angle) * distance
      let targetY = centerY + Math.sin(angle) * distance
      
      // 경계 제한
      targetX = Math.max(safeZone.left, Math.min(safeZone.right, targetX))
      targetY = Math.max(safeZone.top, Math.min(safeZone.bottom, targetY))
      
      gsap.to(particle, {
        x: targetX - centerX,
        y: targetY - centerY,
        opacity: 0,
        scale: 0,
        rotation: Math.random() * 360,
        duration: 0.8 + Math.random() * 0.4,
        ease: "power2.out",
        onComplete: () => particle.remove()
      })
    }
  }

  // 충격파 효과
  const createShockwaveEffect = (
    container: HTMLElement,
    targetEl: HTMLElement,
    elementType: ElementType,
    safeZone: any
  ) => {
    const colors = getElementColors(elementType)
    
    // 타겟 위치에서 충격파 생성
    const targetRect = targetEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const centerX = Math.max(safeZone.left, Math.min(safeZone.right, targetRect.left - containerRect.left + targetRect.width/2))
    const centerY = Math.max(safeZone.top, Math.min(safeZone.bottom, targetRect.top - containerRect.top + targetRect.height/2))
    
    const shockwave = document.createElement("div")
    shockwave.className = "absolute rounded-full border-2 pointer-events-none improved-effect"
    shockwave.style.borderColor = colors.secondary
    shockwave.style.opacity = "0.6"
    shockwave.style.zIndex = "48"
    shockwave.style.left = centerX + "px"
    shockwave.style.top = centerY + "px"
    shockwave.style.transform = "translate(-50%, -50%)"
    
    container.appendChild(shockwave)
    
    gsap.fromTo(shockwave, {
      width: "20px",
      height: "20px"
    }, {
      width: "300px",
      height: "300px",
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => shockwave.remove()
    })
  }

  // 화면 흔들림 - 더 강력하고 현실적인 셰이크
  const createScreenShake = (intensity: "low" | "medium" | "high") => {
    const screenContainer = document.querySelector('#battle-screen') || 
                           document.querySelector('.battle-container') || 
                           document.querySelector('main') || 
                           document.body
    
    const shakeAmount = intensity === "high" ? 12 : intensity === "medium" ? 8 : 5
    const rotationAmount = intensity === "high" ? 2 : intensity === "medium" ? 1.5 : 1
    const scaleAmount = intensity === "high" ? 0.008 : intensity === "medium" ? 0.005 : 0.003
    const duration = intensity === "high" ? 0.5 : intensity === "medium" ? 0.35 : 0.25
    
    const shakeTimeline = gsap.timeline()
    
    shakeTimeline
      .to(screenContainer, {
        x: `random(-${shakeAmount}, ${shakeAmount})`,
        y: `random(-${shakeAmount/2}, ${shakeAmount/2})`,
        rotation: `random(-${rotationAmount}, ${rotationAmount})`,
        duration: 0.04,
        ease: "none",
        repeat: 15,
        yoyo: true
      })
      .to(screenContainer, {
        scale: 1 + scaleAmount,
        duration: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      }, 0)
      .to(screenContainer, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: duration * 0.4,
        ease: "elastic.out(1, 0.3)",
        clearProps: "all"
      })
  }

  // 임팩트 플래시
  const createImpactFlash = (color: string, intensity: "low" | "medium" | "high") => {
    const flash = document.createElement("div")
    flash.className = "fixed inset-0 pointer-events-none improved-effect"
    flash.style.backgroundColor = color
    flash.style.opacity = "0"
    flash.style.zIndex = "60"
    flash.style.mixBlendMode = "screen"
    
    document.body.appendChild(flash)
    
    const flashOpacity = intensity === "high" ? 0.4 : intensity === "medium" ? 0.25 : 0.15
    
    const flashTimeline = gsap.timeline()
    flashTimeline
      .to(flash, {
        opacity: flashOpacity,
        duration: 0.08
      })
      .to(flash, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => flash.remove()
      })
  }

  // 공격 방향 계산 함수
  const getAttackDirection = (attackerEl: HTMLElement, targetEl: HTMLElement) => {
    const attackerRect = attackerEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()
    
    const attackerCenterX = attackerRect.left + attackerRect.width / 2
    const targetCenterX = targetRect.left + targetRect.width / 2
    
    // 타겟이 오른쪽에 있으면 오른쪽으로, 왼쪽에 있으면 왼쪽으로
    const isTargetOnRight = targetCenterX > attackerCenterX
    
    return {
      rotationY: isTargetOnRight ? 0 : 0, // Y축 회전 제거 (카드 뒤집힘 방지)
      preparationOffset: isTargetOnRight ? 8 : -8, // 타겟 쪽으로 살짝 이동
      direction: isTargetOnRight ? 1 : -1
    }
  }

  // 엘리멘트 색상 가져오기
  const getElementColors = (elementType: ElementType) => {
    const colorMap = {
      fire: {
        primary: "#FF4500",
        secondary: "#FF6347", 
        particles: ["#FF4500", "#FF6347", "#FF8C00", "#FFD700"]
      },
      water: {
        primary: "#4169E1",
        secondary: "#87CEEB",
        particles: ["#4169E1", "#6495ED", "#87CEEB", "#B0E0E6"]
      },
      electric: {
        primary: "#FFD700",
        secondary: "#FFFF00",
        particles: ["#FFD700", "#FFFF00", "#FFA500", "#FF69B4"]
      },
      grass: {
        primary: "#32CD32",
        secondary: "#90EE90",
        particles: ["#32CD32", "#90EE90", "#7CFC00", "#ADFF2F"]
      },
      ice: {
        primary: "#87CEEB",
        secondary: "#E0F6FF",
        particles: ["#87CEEB", "#B0E0E6", "#E0F6FF", "#F0F8FF"]
      },
      light: {
        primary: "#FFFF00",
        secondary: "#FFFACD",
        particles: ["#FFFF00", "#FFFACD", "#F0E68C", "#FFEFD5"]
      },
      shadow: {
        primary: "#4B0082",
        secondary: "#696969",
        particles: ["#2F4F4F", "#696969", "#708090", "#4B0082"]
      },
      wind: {
        primary: "#E6E6FA",
        secondary: "#F5F5F5",
        particles: ["#E6E6FA", "#F5F5F5", "#DCDCDC", "#D3D3D3"]
      },
      earth: {
        primary: "#A0522D",
        secondary: "#CD853F",
        particles: ["#8B4513", "#A0522D", "#CD853F", "#D2691E"]
      },
      physical: {
        primary: "#8B4513",
        secondary: "#CD853F",
        particles: ["#8B4513", "#CD853F", "#DEB887", "#D2691E"]
      }
    }
    
    return colorMap[elementType] || colorMap.physical
  }

  // 추가 타격감 효과
  const createAdditionalImpactEffects = (
    container: HTMLElement,
    targetEl: HTMLElement,
    elementType: ElementType,
    safeZone: any
  ) => {
    const colors = getElementColors(elementType)
    
    // 타겟 위치 계산
    const targetRect = targetEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const centerX = Math.max(safeZone.left, Math.min(safeZone.right, targetRect.left - containerRect.left + targetRect.width/2))
    const centerY = Math.max(safeZone.top, Math.min(safeZone.bottom, targetRect.top - containerRect.top + targetRect.height/2))
    
    // 개선된 에너지 버스트 효과 (번개 대신)
    const burstCount = 6
    for (let i = 0; i < burstCount; i++) {
      const burst = document.createElement("div")
      burst.className = "absolute pointer-events-none improved-effect"
      burst.style.width = "8px"
      burst.style.height = "8px"
      burst.style.borderRadius = "50%"
      burst.style.background = `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`
      burst.style.boxShadow = `0 0 20px ${colors.primary}`
      burst.style.opacity = "1"
      burst.style.zIndex = "56"
      
      const angle = (i / burstCount) * 360
      const distance = 25
      const x = centerX + Math.cos(angle * Math.PI / 180) * distance
      const y = centerY + Math.sin(angle * Math.PI / 180) * distance
      
      burst.style.left = Math.max(safeZone.left, Math.min(safeZone.right - 8, x)) + "px"
      burst.style.top = Math.max(safeZone.top, Math.min(safeZone.bottom - 8, y)) + "px"
      burst.style.transform = "translate(-50%, -50%)"
      
      container.appendChild(burst)
      
      gsap.fromTo(burst, {
        scale: 0,
        opacity: 1
      }, {
        scale: 3,
        opacity: 0,
        duration: 0.4,
        delay: i * 0.03,
        ease: "power2.out",
        onComplete: () => burst.remove()
      })
    }
    
    // 개선된 에너지 웨이브 효과 (크랙 대신)
    const waveCount = 4
    for (let i = 0; i < waveCount; i++) {
      const wave = document.createElement("div")
      wave.className = "absolute pointer-events-none improved-effect"
      wave.style.width = "1px"
      wave.style.height = "1px"
      wave.style.borderRadius = "50%"
      wave.style.background = `radial-gradient(circle, ${colors.primary}, transparent)`
      wave.style.boxShadow = `0 0 15px ${colors.primary}`
      wave.style.opacity = "0.9"
      wave.style.zIndex = "54"
      
      wave.style.left = centerX + "px"
      wave.style.top = centerY + "px"
      wave.style.transform = "translate(-50%, -50%)"
      
      container.appendChild(wave)
      
      gsap.fromTo(wave, {
        width: "1px",
        height: "1px",
        opacity: 0.9
      }, {
        width: `${80 + i * 30}px`,
        height: `${80 + i * 30}px`,
        opacity: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: "power2.out",
        onComplete: () => wave.remove()
      })
    }
    
    // 폭발 스파크 효과
    const sparkCount = 15
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement("div")
      spark.className = "absolute pointer-events-none improved-effect"
      spark.style.width = "6px"
      spark.style.height = "6px"
      spark.style.background = colors.particles[i % colors.particles.length]
      spark.style.borderRadius = "50%"
      spark.style.boxShadow = `0 0 8px ${colors.primary}`
      spark.style.zIndex = "57"
      
      spark.style.left = centerX + "px"
      spark.style.top = centerY + "px"
      
      container.appendChild(spark)
      
      const angle = (i / sparkCount) * 360
      const distance = 80 + Math.random() * 60
      let targetX = centerX + Math.cos(angle * Math.PI / 180) * distance
      let targetY = centerY + Math.sin(angle * Math.PI / 180) * distance
      
      targetX = Math.max(safeZone.left, Math.min(safeZone.right, targetX))
      targetY = Math.max(safeZone.top, Math.min(safeZone.bottom, targetY))
      
      gsap.to(spark, {
        x: targetX - centerX,
        y: targetY - centerY,
        opacity: 0,
        scale: 0,
        duration: 0.8 + Math.random() * 0.4,
        ease: "power3.out",
        onComplete: () => spark.remove()
      })
    }
  }

  // 클린업
  const cleanupImprovedEffects = () => {
    const effects = document.querySelectorAll(".improved-effect")
    effects.forEach(effect => effect.remove())
    gsap.killTweensOf("*")
    
    // 화면 변환 초기화
    const containers = [
      document.querySelector('#battle-screen'),
      document.querySelector('.battle-container'),
      document.querySelector('main'),
      document.body
    ].filter(Boolean)
    
    containers.forEach(container => {
      if (container) {
        gsap.set(container, { clearProps: "all" })
      }
    })
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ display: isActive ? "block" : "none" }}
    />
  )
}