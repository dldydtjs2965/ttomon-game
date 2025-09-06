"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import type { Monster } from "@/lib/monsters"
import { CARD_3D_EFFECTS, GLOW_EFFECTS, type Card3DConfig } from "@/lib/animations/hearthstoneHelpers"

interface Hearthstone3DCardProps {
  monster: Monster
  position: "player" | "enemy"
  isAttacking?: boolean
  isDamaged?: boolean
  isDead?: boolean
  isDodging?: boolean
  isBlocking?: boolean
  children: React.ReactNode
  className?: string
}

export function Hearthstone3DCard({
  monster,
  position,
  isAttacking = false,
  isDamaged = false,
  isDead = false,
  isDodging = false,
  isBlocking = false,
  children,
  className = ""
}: Hearthstone3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const animationRef = useRef<gsap.core.Timeline | null>(null) // 애니메이션 추적

  // 3D 효과 초기화
  useEffect(() => {
    if (!cardRef.current) return

    // 기본 3D 변환 설정
    gsap.set(cardRef.current, {
      transformStyle: "preserve-3d",
      transformPerspective: 1000
    })
  }, [])

  // 상태에 따른 3D 효과 적용
  useEffect(() => {
    if (!cardRef.current) return

    // 기존 애니메이션 정리
    if (animationRef.current) {
      animationRef.current.kill()
      animationRef.current = null
    }

    let targetConfig: Card3DConfig

    if (isDead) {
      // 죽음 애니메이션
      targetConfig = {
        perspective: 1200,
        rotationX: 90,
        rotationY: -15,
        elevation: -20,
        shadowBlur: 5,
        shadowOpacity: 0.2
      }
      animateDeathEffect()
    } else if (isDodging) {
      // 회피 자세
      targetConfig = {
        perspective: 1000,
        rotationX: 5,
        rotationY: 15,
        elevation: 15,
        shadowBlur: 15,
        shadowOpacity: 0.4
      }
      animateDodgeEffect()
    } else if (isBlocking) {
      // 막기 자세
      targetConfig = {
        perspective: 1000,
        rotationX: -5,
        rotationY: -10,
        elevation: 10,
        shadowBlur: 12,
        shadowOpacity: 0.5
      }
      animateBlockEffect()
    } else if (isAttacking) {
      targetConfig = CARD_3D_EFFECTS.attack
      animateAttackGlow()
    } else if (isDamaged) {
      targetConfig = CARD_3D_EFFECTS.damage
      animateDamageEffect()
    } else if (isHovered) {
      targetConfig = CARD_3D_EFFECTS.hover
    } else {
      targetConfig = CARD_3D_EFFECTS.idle
      // 기본 상태로 돌아갈 때 박스 섀도우 초기화
      if (cardRef.current) {
        gsap.set(cardRef.current, { boxShadow: "none" })
      }
    }

    apply3DEffect(targetConfig)

    // 컴포넌트 언마운트 시 애니메이션 정리
    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [isAttacking, isDamaged, isDead, isDodging, isBlocking, isHovered])

  // 마우스 움직임에 따른 3D 효과
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isDead) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    // 마우스 위치를 -1 ~ 1 범위로 정규화
    const normalizedX = mouseX / (rect.width / 2)
    const normalizedY = mouseY / (rect.height / 2)
    
    setMousePosition({ x: normalizedX, y: normalizedY })

    if (isHovered) {
      // 마우스에 따른 동적 회전
      const rotationX = -normalizedY * 15
      const rotationY = normalizedX * 15
      
      gsap.to(cardRef.current, {
        rotationX,
        rotationY,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }

  // 3D 효과 적용
  const apply3DEffect = (config: Card3DConfig) => {
    if (!cardRef.current) return

    gsap.to(cardRef.current, {
      rotationX: config.rotationX,
      rotationY: config.rotationY,
      z: config.elevation,
      duration: 0.6,
      ease: "power3.out",
      transformOrigin: "center center"
    })

    // 그림자 효과
    gsap.to(cardRef.current, {
      filter: `drop-shadow(0px ${config.elevation * 0.5}px ${config.shadowBlur}px rgba(0,0,0,${config.shadowOpacity}))`,
      duration: 0.6,
      ease: "power3.out"
    })
  }

  // 공격 시 글로우 애니메이션
  const animateAttackGlow = () => {
    if (!cardRef.current) return

    const glowConfig = GLOW_EFFECTS.charging
    
    gsap.to(cardRef.current, {
      boxShadow: `0 0 ${glowConfig.spreadRadius}px ${glowConfig.color}`,
      duration: glowConfig.pulseSpeed,
      ease: "sine.inOut",
      repeat: 2,
      yoyo: true
    })
  }

  // 데미지 받을 시 효과
  const animateDamageEffect = () => {
    if (!cardRef.current) return

    // 빨간색 글로우와 흔들림
    const damageTimeline = gsap.timeline()
    
    damageTimeline
      .to(cardRef.current, {
        boxShadow: "0 0 20px rgba(255, 0, 0, 0.8)",
        duration: 0.1
      })
      .to(cardRef.current, {
        x: -5,
        duration: 0.1
      })
      .to(cardRef.current, {
        x: 5,
        duration: 0.1
      })
      .to(cardRef.current, {
        x: 0,
        boxShadow: "none",
        duration: 0.2
      })
  }

  // 회피 자세 효과
  const animateDodgeEffect = () => {
    if (!cardRef.current) return

    animationRef.current = gsap.timeline({ repeat: -1 })
    
    // 파란색 글로우와 좌우 흔들림으로 민첩함 표현
    animationRef.current
      .to(cardRef.current, {
        boxShadow: "0 0 25px rgba(0, 150, 255, 0.8)",
        x: -3,
        duration: 0.3,
        ease: "power2.inOut"
      })
      .to(cardRef.current, {
        boxShadow: "0 0 30px rgba(0, 150, 255, 1.0)",
        x: 3,
        duration: 0.3,
        ease: "power2.inOut"
      })
      .to(cardRef.current, {
        boxShadow: "0 0 25px rgba(0, 150, 255, 0.8)",
        x: 0,
        duration: 0.3,
        ease: "power2.inOut"
      })
  }

  // 막기 자세 효과
  const animateBlockEffect = () => {
    if (!cardRef.current) return

    animationRef.current = gsap.timeline({ repeat: -1 })
    
    // 황금색 글로우와 안정적인 펄스로 방어력 표현
    animationRef.current
      .to(cardRef.current, {
        boxShadow: "0 0 20px rgba(255, 215, 0, 0.6)",
        scale: 1.02,
        duration: 0.8,
        ease: "sine.inOut"
      })
      .to(cardRef.current, {
        boxShadow: "0 0 30px rgba(255, 215, 0, 1.0)",
        scale: 1.05,
        duration: 0.8,
        ease: "sine.inOut"
      })
      .to(cardRef.current, {
        boxShadow: "0 0 20px rgba(255, 215, 0, 0.6)",
        scale: 1.02,
        duration: 0.8,
        ease: "sine.inOut"
      })
  }

  // 죽음 애니메이션
  const animateDeathEffect = () => {
    if (!cardRef.current) return

    const deathTimeline = gsap.timeline()

    // 회색 파티클 효과 추가
    createDeathParticles()

    deathTimeline
      .to(cardRef.current, {
        rotationZ: -15,
        scale: 0.9,
        opacity: 0.3,
        filter: "grayscale(100%) brightness(0.5)",
        duration: 0.8,
        ease: "power2.out"
      })
      .to(cardRef.current, {
        rotationX: 90,
        y: 20,
        duration: 0.6,
        ease: "power2.in"
      }, "-=0.4")
  }

  // 죽음 시 파티클 효과 - 카드 내부로 제한
  const createDeathParticles = () => {
    if (!cardRef.current) return

    const particleCount = 8 // 파티클 수 감소
    const cardContainer = cardRef.current

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.className = "absolute pointer-events-none death-particle"
      particle.style.width = "3px"
      particle.style.height = "3px"
      particle.style.backgroundColor = "#999999"
      particle.style.borderRadius = "50%"
      particle.style.opacity = "0.7"
      particle.style.zIndex = "40"
      
      // 카드 내부에 파티클 배치
      const randomX = Math.random() * 80 + 10 // 10%-90% 범위
      const randomY = Math.random() * 80 + 10
      particle.style.left = randomX + "%"
      particle.style.top = randomY + "%"
      
      // 카드 컨테이너에 직접 추가 (document.body 대신)
      cardContainer.appendChild(particle)
      
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 30, // 이동 거리 감소
        y: Math.random() * -20 + 10,
        opacity: 0,
        scale: Math.random() * 0.3 + 0.2,
        duration: 0.8 + Math.random() * 0.4,
        delay: i * 0.08,
        ease: "power2.out",
        onComplete: () => particle.remove()
      })
    }
  }

  // 마우스 리브 처리 개선
  const handleMouseLeave = () => {
    setIsHovered(false)
    if (cardRef.current) {
      // 호버 상태 초기화
      gsap.to(cardRef.current, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "transform"
      })
    }
  }

  return (
    <div
      ref={cardRef}
      className={`hearthstone-3d-card transition-all duration-300 ${className} ${position}-monster overflow-hidden relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        transformStyle: "preserve-3d",
        // 글래스모피즘 효과 - 경계 내부로 제한
        backdropFilter: "blur(10px)",
        background: isHovered 
          ? "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        // 박스 섀도우를 카드 경계 내부로 제한
        boxShadow: isHovered
          ? "inset 0 0 20px rgba(255,255,255,0.3), inset 0 0 40px rgba(0,150,255,0.1)"
          : "inset 0 0 10px rgba(255,255,255,0.2)"
      }}
    >
      {/* 카드 내부 컨텐츠 */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 호버 시 샤인 효과 */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
          style={{
            background: `linear-gradient(${Math.atan2(mousePosition.y, mousePosition.x) * 180 / Math.PI + 90}deg, 
              transparent 40%, 
              rgba(255,255,255,0.3) 50%, 
              transparent 60%)`,
            animation: "shine 2s infinite"
          }}
        />
      )}

      {/* HP가 낮을 때 위험 표시 */}
      {monster.hp < monster.maxHp * 0.3 && !isDead && (
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-pulse" />
      )}

      {/* 회피/막기 상태 아이콘 */}
      {isDodging && (
        <div className="absolute top-2 right-2 z-20 group">
          <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center animate-bounce shadow-lg">
            <span className="text-sm font-bold">🏃</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
          
          {/* 툴팁 */}
          <div className="absolute top-10 right-0 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            회피 준비 ({Math.round((monster.dodgeChance || 0.5) * 100)}% 확률)
          </div>
        </div>
      )}

      {isBlocking && (
        <div className="absolute top-2 right-2 z-20 group">
          <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-sm font-bold">🛡️</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
          
          {/* 툴팁 */}
          <div className="absolute top-10 right-0 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            방어 준비 ({Math.round((monster.blockReduction || 0.5) * 100)}% 감소)
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        .hearthstone-3d-card {
          border-radius: 12px;
          position: relative;
        }
        
        .hearthstone-3d-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, 
            rgba(255,255,255,0.1) 0%, 
            transparent 50%, 
            rgba(255,255,255,0.05) 100%);
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}