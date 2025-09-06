"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"

interface AnimatedHealthBarProps {
  currentHp: number
  maxHp: number
  previousHp?: number
  className?: string
  showDamageIndicator?: boolean
  animationDuration?: number
}

export function AnimatedHealthBar({
  currentHp,
  maxHp,
  previousHp,
  className = "",
  showDamageIndicator = true,
  animationDuration = 0.8
}: AnimatedHealthBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const damageRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [displayHp, setDisplayHp] = useState(currentHp)

  // HP 변화 감지 및 애니메이션
  useEffect(() => {
    if (!fillRef.current || previousHp === undefined) {
      setDisplayHp(currentHp)
      return
    }

    const startPercentage = (previousHp / maxHp) * 100
    const endPercentage = (currentHp / maxHp) * 100
    const isHealing = currentHp > previousHp
    const isDamage = currentHp < previousHp

    // HP 바 애니메이션
    animateHealthBar(startPercentage, endPercentage, isHealing, isDamage)
    
    // 숫자 카운터 애니메이션
    animateHpCounter(previousHp, currentHp)
    
    // 데미지/힐링 표시
    if (showDamageIndicator && previousHp !== currentHp) {
      showHpChangeIndicator(currentHp - previousHp)
    }

  }, [currentHp, previousHp, maxHp])

  // HP 바 애니메이션
  const animateHealthBar = (
    startPercent: number, 
    endPercent: number, 
    isHealing: boolean, 
    isDamage: boolean
  ) => {
    if (!fillRef.current || !damageRef.current || !glowRef.current) return

    // 이전 애니메이션 중단하고 데미지 바 초기화
    gsap.killTweensOf([fillRef.current, damageRef.current, glowRef.current])
    gsap.set(damageRef.current, { opacity: 0, width: "0%" })

    const timeline = gsap.timeline()

    if (isDamage) {
      // 데미지 애니메이션: 먼저 데미지 바를 보여주고, 실제 HP를 천천히 감소
      timeline
        .set(damageRef.current, { 
          width: `${startPercent}%`,
          opacity: 1,
          backgroundColor: "#ff6b6b" 
        })
        .to(fillRef.current, {
          width: `${endPercent}%`,
          duration: animationDuration * 0.3,
          ease: "power2.out"
        })
        .to(damageRef.current, {
          width: `${endPercent}%`,
          duration: animationDuration * 0.7,
          ease: "power1.inOut"
        }, "-=0.1")
        .to(damageRef.current, {
          opacity: 0,
          duration: 0.3
        })
        
      // 체력이 낮을 때 위험 글로우 효과
      if (endPercent < 30) {
        timeline.to(glowRef.current, {
          opacity: 0.6,
          scale: 1.05,
          duration: 0.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        }, 0)
      }

    } else if (isHealing) {
      // 힐링 애니메이션: 부드러운 증가와 반짝임 효과
      timeline
        .to(fillRef.current, {
          width: `${endPercent}%`,
          duration: animationDuration,
          ease: "power2.out"
        })
        .to(glowRef.current, {
          opacity: 0.8,
          scale: 1.1,
          duration: 0.3,
          ease: "sine.inOut",
          repeat: 1,
          yoyo: true
        }, 0)
    }

    // HP 바 색상 변화
    updateHealthBarColor(endPercent)
  }

  // HP 숫자 카운터 애니메이션
  const animateHpCounter = (startHp: number, endHp: number) => {
    const counter = { value: startHp }
    
    gsap.to(counter, {
      value: endHp,
      duration: animationDuration,
      ease: "power2.out",
      onUpdate: () => {
        setDisplayHp(Math.round(counter.value))
      }
    })
  }

  // HP 변화 표시기 - 강화된 버전
  const showHpChangeIndicator = (hpChange: number) => {
    if (!barRef.current) return

    // 기존 데미지 표시기들을 선발적으로 제거 (강제 정리)
    const existingIndicators = barRef.current.querySelectorAll('.hp-damage-indicator')
    existingIndicators.forEach(indicator => {
      gsap.killTweensOf(indicator) // GSAP 애니메이션 중단
      indicator.remove() // DOM에서 제거
    })

    const indicator = document.createElement("div")
    const isHealing = hpChange > 0
    
    indicator.className = `hp-damage-indicator absolute font-bold text-sm pointer-events-none z-50 ${
      isHealing ? "text-green-400" : "text-red-400"
    }`
    indicator.textContent = `${isHealing ? "+" : ""}${hpChange}`
    indicator.style.left = "50%"
    indicator.style.top = "-10px"
    indicator.style.transform = "translateX(-50%)"
    indicator.style.opacity = "0"
    
    barRef.current.appendChild(indicator)
    console.log(`[v0] HP 데미지 표시기 생성: ${hpChange}, 기존 표시기 제거: ${existingIndicators.length}개`)
    
    // 표시기 애니메이션
    const timeline = gsap.timeline({
      onComplete: () => {
        console.log(`[v0] HP 데미지 표시기 자동 제거 완료: ${hpChange}`)
        if (indicator.parentNode) {
          indicator.remove()
        }
      }
    })
    timeline
      .to(indicator, {
        opacity: 1,
        y: -20,
        scale: 1.2,
        duration: 0.3,
        ease: "back.out(2)"
      })
      .to(indicator, {
        opacity: 0,
        y: -40,
        duration: 0.5,
        ease: "power2.in"
      }, "+=0.5")
      
    // 비상 안전장치: 3초 후 강제 제거
    setTimeout(() => {
      if (indicator.parentNode) {
        gsap.killTweensOf(indicator)
        indicator.remove()
        console.log(`[v0] HP 데미지 표시기 강제 제거: ${hpChange}`)
      }
    }, 3000)
  }

  // HP 비율에 따른 색상 변화
  const updateHealthBarColor = (percentage: number) => {
    if (!fillRef.current) return

    let color: string
    let glowColor: string

    if (percentage > 60) {
      color = "linear-gradient(90deg, #10b981, #34d399)" // 초록
      glowColor = "#10b981"
    } else if (percentage > 30) {
      color = "linear-gradient(90deg, #f59e0b, #fbbf24)" // 노랑
      glowColor = "#f59e0b"
    } else {
      color = "linear-gradient(90deg, #ef4444, #f87171)" // 빨강
      glowColor = "#ef4444"
    }

    gsap.to(fillRef.current, {
      background: color,
      duration: 0.3,
      ease: "power2.out"
    })

    if (glowRef.current) {
      gsap.set(glowRef.current, {
        boxShadow: `0 0 20px ${glowColor}`
      })
    }
  }

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (barRef.current) {
        // 컴포넌트 언마운트 시 남은 표시기들 제거
        const indicators = barRef.current.querySelectorAll('.hp-damage-indicator')
        indicators.forEach(indicator => {
          gsap.killTweensOf(indicator)
          indicator.remove()
        })
      }
    }
  }, [])

  // HP 비율 계산
  const hpPercentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100))

  return (
    <div ref={barRef} className={`relative ${className}`}>
      {/* HP 바 컨테이너 - 더 크고 명확하게 */}
      <div className="relative h-6 bg-gray-300 rounded-lg overflow-hidden border-2 border-gray-400 shadow-inner">
        {/* 데미지 표시 바 (뒤쪽) */}
        <div
          ref={damageRef}
          className="absolute inset-y-0 left-0 rounded-lg opacity-0 transition-all duration-300"
          style={{
            width: `${hpPercentage}%`,
            background: "linear-gradient(90deg, #ff6b6b, #ff8e8e)"
          }}
        />
        
        {/* 실제 HP 바 */}
        <div
          ref={fillRef}
          className="absolute inset-y-0 left-0 rounded-lg transition-all duration-300"
          style={{
            width: `${hpPercentage}%`,
            background: hpPercentage > 60 
              ? "linear-gradient(90deg, #059669, #10b981, #34d399)"
              : hpPercentage > 30
                ? "linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #dc2626, #ef4444, #f87171)"
          }}
        />
        
        {/* 글로우 효과 */}
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-full opacity-0"
          style={{
            background: "inherit",
            filter: "blur(2px)"
          }}
        />
        
        {/* HP 바 하이라이트 - 더 세밀한 광택 효과 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-lg" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 rounded-t-lg" />
      </div>
      
      {/* HP 텍스트 - 더 크고 명확하게 */}
      <div className="flex justify-between items-center mt-2 text-sm">
        <span className="font-bold text-gray-800">HP</span>
        <span className="font-mono font-semibold">
          <span className={`${
            hpPercentage < 30 ? "text-red-600 animate-pulse font-bold" : hpPercentage < 60 ? "text-yellow-600" : "text-gray-800"
          }`}>
            {displayHp}
          </span>
          <span className="text-gray-600">/{maxHp}</span>
        </span>
      </div>
      
      {/* 위험 상태 경고 - 더 명확한 시각적 피드백 */}
      {hpPercentage < 25 && (
        <div className="absolute -inset-1 rounded-lg bg-red-500/25 animate-pulse pointer-events-none shadow-lg" />
      )}
      
      {/* 크리티컬 상태 펄스 - 더 강한 경고 */}
      {hpPercentage < 15 && (
        <div className="absolute -inset-1 rounded-lg animate-ping bg-red-600/40 pointer-events-none" />
      )}
      
      {/* 극도로 위험한 상태 */}
      {hpPercentage < 5 && (
        <div className="absolute -inset-2 rounded-lg bg-red-700/30 animate-bounce pointer-events-none" />
      )}
    </div>
  )
}