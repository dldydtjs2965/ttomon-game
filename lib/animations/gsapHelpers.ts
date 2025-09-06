import { gsap } from "gsap"
import type { ElementType, AnimationType } from "../monsters"

export interface AnimationConfig {
  duration: number
  ease: string
  delay?: number
  repeat?: number
  yoyo?: boolean
}

export interface ParticleConfig {
  count: number
  size: { min: number; max: number }
  velocity: { min: number; max: number }
  spread: number
  color: string[]
  opacity: { start: number; end: number }
  scale: { start: number; end: number }
}

// 기본 애니메이션 설정
export const DEFAULT_ANIMATION_CONFIG: Record<AnimationType, AnimationConfig> = {
  slash: { duration: 0.3, ease: "power2.out" },
  impact: { duration: 0.5, ease: "back.out(2)" },
  burst: { duration: 0.6, ease: "power3.out" },
  beam: { duration: 0.8, ease: "power2.inOut" },
  storm: { duration: 1.0, ease: "power2.inOut" },
  explosion: { duration: 1.2, ease: "power3.out" },
  wave: { duration: 0.7, ease: "sine.inOut" },
  sparkle: { duration: 1.5, ease: "power1.inOut", repeat: 2, yoyo: true },
  glow: { duration: 2.0, ease: "power1.inOut", repeat: 1, yoyo: true },
}

// 엘리멘탈 타입별 색상 설정
export const ELEMENT_COLORS: Record<ElementType, string[]> = {
  physical: ["#8B4513", "#CD853F", "#DEB887"],
  fire: ["#FF4500", "#FF6347", "#FF8C00", "#FFD700"],
  water: ["#0080FF", "#4169E1", "#87CEEB", "#B0E0E6"],
  grass: ["#32CD32", "#90EE90", "#7CFC00", "#ADFF2F"],
  ice: ["#87CEEB", "#E0F6FF", "#B0E0E6", "#F0F8FF"],
  light: ["#FFFF00", "#FFFACD", "#F0E68C", "#FFEFD5"],
  electric: ["#FFFF00", "#FFD700", "#FF69B4", "#00BFFF"],
  shadow: ["#2F4F4F", "#696969", "#708090", "#4B0082"],
  wind: ["#E6E6FA", "#F5F5F5", "#DCDCDC", "#D3D3D3"],
  earth: ["#8B4513", "#A0522D", "#CD853F", "#D2691E"],
}

// 파티클 설정
export const PARTICLE_CONFIGS: Record<ElementType, ParticleConfig> = {
  physical: {
    count: 8,
    size: { min: 3, max: 8 },
    velocity: { min: 50, max: 150 },
    spread: 45,
    color: ELEMENT_COLORS.physical,
    opacity: { start: 1, end: 0 },
    scale: { start: 1, end: 0.3 },
  },
  fire: {
    count: 15,
    size: { min: 4, max: 12 },
    velocity: { min: 80, max: 200 },
    spread: 60,
    color: ELEMENT_COLORS.fire,
    opacity: { start: 0.9, end: 0 },
    scale: { start: 1.2, end: 0.2 },
  },
  water: {
    count: 12,
    size: { min: 3, max: 10 },
    velocity: { min: 60, max: 180 },
    spread: 50,
    color: ELEMENT_COLORS.water,
    opacity: { start: 0.8, end: 0 },
    scale: { start: 1, end: 0.4 },
  },
  grass: {
    count: 20,
    size: { min: 2, max: 6 },
    velocity: { min: 40, max: 120 },
    spread: 80,
    color: ELEMENT_COLORS.grass,
    opacity: { start: 0.9, end: 0 },
    scale: { start: 0.8, end: 1.2 },
  },
  ice: {
    count: 10,
    size: { min: 4, max: 8 },
    velocity: { min: 30, max: 100 },
    spread: 40,
    color: ELEMENT_COLORS.ice,
    opacity: { start: 1, end: 0 },
    scale: { start: 1, end: 0.5 },
  },
  light: {
    count: 25,
    size: { min: 2, max: 5 },
    velocity: { min: 100, max: 250 },
    spread: 90,
    color: ELEMENT_COLORS.light,
    opacity: { start: 1, end: 0 },
    scale: { start: 0.5, end: 1.5 },
  },
  electric: {
    count: 18,
    size: { min: 3, max: 7 },
    velocity: { min: 120, max: 300 },
    spread: 70,
    color: ELEMENT_COLORS.electric,
    opacity: { start: 1, end: 0 },
    scale: { start: 1, end: 0.3 },
  },
  shadow: {
    count: 12,
    size: { min: 5, max: 10 },
    velocity: { min: 60, max: 150 },
    spread: 55,
    color: ELEMENT_COLORS.shadow,
    opacity: { start: 0.7, end: 0 },
    scale: { start: 1.3, end: 0.2 },
  },
  wind: {
    count: 16,
    size: { min: 2, max: 6 },
    velocity: { min: 80, max: 220 },
    spread: 85,
    color: ELEMENT_COLORS.wind,
    opacity: { start: 0.6, end: 0 },
    scale: { start: 0.8, end: 1.2 },
  },
  earth: {
    count: 10,
    size: { min: 4, max: 12 },
    velocity: { min: 40, max: 120 },
    spread: 35,
    color: ELEMENT_COLORS.earth,
    opacity: { start: 1, end: 0 },
    scale: { start: 1, end: 0.6 },
  },
}

// GSAP 타임라인 생성 헬퍼
export function createAnimationTimeline(): GSAPTimeline {
  return gsap.timeline()
}

// 기본 애니메이션 유틸리티
export function animateElement(
  element: HTMLElement | string,
  properties: gsap.TweenVars,
  config: Partial<AnimationConfig> = {}
): gsap.core.Tween {
  const finalConfig = {
    ...properties,
    duration: config.duration || 0.5,
    ease: config.ease || "power2.out",
    delay: config.delay || 0,
    repeat: config.repeat,
    yoyo: config.yoyo,
  }
  
  return gsap.to(element, finalConfig)
}

// 파티클 생성 유틸리티
export function createParticle(
  container: HTMLElement,
  config: Partial<ParticleConfig> = {}
): HTMLElement {
  const particle = document.createElement("div")
  const finalConfig = { ...PARTICLE_CONFIGS.physical, ...config }
  
  particle.className = "absolute rounded-full pointer-events-none"
  particle.style.width = `${Math.random() * (finalConfig.size.max - finalConfig.size.min) + finalConfig.size.min}px`
  particle.style.height = particle.style.width
  particle.style.backgroundColor = finalConfig.color[Math.floor(Math.random() * finalConfig.color.length)]
  particle.style.opacity = finalConfig.opacity.start.toString()
  
  container.appendChild(particle)
  return particle
}

// 파티클 애니메이션 유틸리티
export function animateParticles(
  particles: HTMLElement[],
  config: Partial<ParticleConfig> = {},
  animationConfig: Partial<AnimationConfig> = {}
): gsap.core.Timeline {
  const tl = gsap.timeline()
  const finalConfig = { ...PARTICLE_CONFIGS.physical, ...config }
  const finalAnimConfig = { ...DEFAULT_ANIMATION_CONFIG.burst, ...animationConfig }
  
  particles.forEach((particle, i) => {
    const angle = Math.random() * finalConfig.spread - finalConfig.spread / 2
    const velocity = Math.random() * (finalConfig.velocity.max - finalConfig.velocity.min) + finalConfig.velocity.min
    const x = Math.cos(angle * Math.PI / 180) * velocity
    const y = Math.sin(angle * Math.PI / 180) * velocity
    
    // Enhanced physics with gravity and air resistance
    const gravity = 50 + Math.random() * 30 // Slight randomness in gravity
    const airResistance = 0.95 + Math.random() * 0.05 // Air resistance factor
    
    tl.to(particle, {
      x: x * airResistance,
      y: y + gravity, // Add gravity effect
      opacity: finalConfig.opacity.end,
      scale: finalConfig.scale.end,
      rotation: Math.random() * 360, // Random rotation
      duration: finalAnimConfig.duration,
      ease: "power2.out", // More realistic physics easing
      onComplete: () => particle.remove()
    }, i * 0.03) // Reduced stagger for more natural feel
  })
  
  return tl
}

// Enhanced particle creation for elemental effects
export function createElementalParticles(
  container: HTMLElement,
  elementType: ElementType,
  count: number = 15,
  intensity: "low" | "medium" | "high" = "medium"
): HTMLElement[] {
  const config = PARTICLE_CONFIGS[elementType]
  const particles: HTMLElement[] = []
  const intensityMultiplier = { low: 0.7, medium: 1.0, high: 1.3 }[intensity]
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div")
    const size = (Math.random() * (config.size.max - config.size.min) + config.size.min) * intensityMultiplier
    
    particle.className = "absolute pointer-events-none animation-particle"
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.backgroundColor = config.color[Math.floor(Math.random() * config.color.length)]
    particle.style.opacity = config.opacity.start.toString()
    particle.style.position = "absolute"
    particle.style.left = "50%"
    particle.style.top = "50%"
    particle.style.transform = "translate(-50%, -50%)"
    
    // Element-specific styling
    switch (elementType) {
      case "fire":
        particle.style.borderRadius = "50%"
        particle.style.boxShadow = `0 0 ${size/2}px ${config.color[0]}`
        particle.style.filter = "blur(0.5px)"
        break
      case "water":
        particle.style.borderRadius = "50%"
        particle.style.boxShadow = `0 0 ${size/3}px ${config.color[0]}`
        break
      case "ice":
        particle.style.borderRadius = "20%"
        particle.style.boxShadow = `0 0 ${size/2}px rgba(255,255,255,0.8)`
        particle.style.transform += " rotate(45deg)"
        break
      case "electric":
        particle.style.borderRadius = "0"
        particle.style.background = `linear-gradient(45deg, ${config.color[0]}, ${config.color[1]})`
        particle.style.boxShadow = `0 0 ${size}px ${config.color[0]}`
        break
      case "grass":
        particle.style.borderRadius = "50% 0"
        particle.style.transform += ` rotate(${Math.random() * 360}deg)`
        break
      case "shadow":
        particle.style.borderRadius = "50%"
        particle.style.filter = "blur(1px)"
        particle.style.background = `radial-gradient(circle, ${config.color[0]}, transparent)`
        break
      case "light":
        particle.style.borderRadius = "50%"
        particle.style.background = `radial-gradient(circle, ${config.color[0]}, transparent)`
        particle.style.boxShadow = `0 0 ${size}px ${config.color[0]}`
        break
      default:
        particle.style.borderRadius = "50%"
    }
    
    container.appendChild(particle)
    particles.push(particle)
  }
  
  return particles
}

// 화면 효과 (플래시, 셰이크 등)
export function createScreenEffect(type: "flash" | "shake" | "zoom"): gsap.core.Timeline {
  const tl = gsap.timeline()
  
  switch (type) {
    case "flash":
      const flash = document.createElement("div")
      flash.className = "fixed inset-0 bg-white pointer-events-none z-50"
      flash.style.opacity = "0"
      document.body.appendChild(flash)
      
      tl.to(flash, { opacity: 0.7, duration: 0.1 })
        .to(flash, { opacity: 0, duration: 0.3, onComplete: () => flash.remove() })
      break
      
    case "shake":
      tl.to("body", { x: -5, duration: 0.1 })
        .to("body", { x: 5, duration: 0.1 })
        .to("body", { x: -3, duration: 0.1 })
        .to("body", { x: 0, duration: 0.1 })
      break
      
    case "zoom":
      tl.to("body", { scale: 1.02, duration: 0.2, ease: "power2.out" })
        .to("body", { scale: 1, duration: 0.3, ease: "power2.out" })
      break
  }
  
  return tl
}

// Enhanced cleanup utility with performance optimization
export function cleanupAnimations(selector: string = ".animation-particle") {
  const particles = document.querySelectorAll(selector)
  particles.forEach(particle => particle.remove())
  gsap.killTweensOf("*")
  
  // Clear any remaining GSAP context
  gsap.set("*", { clearProps: "all" })
}

// Performance optimization utility
export function optimizeAnimationPerformance() {
  // Enable hardware acceleration for better performance
  gsap.set("body", { 
    transform: "translateZ(0)",
    backfaceVisibility: "hidden",
    perspective: "1000px"
  })
  
  // Set animation refresh rate
  gsap.ticker.fps(60)
}

// Animation intensity calculator for performance scaling
export function getOptimalParticleCount(
  baseCount: number, 
  intensity: "low" | "medium" | "high" = "medium"
): number {
  const performanceMultiplier = getPerformanceMultiplier()
  const intensityMultiplier = { low: 0.7, medium: 1.0, high: 1.3 }[intensity]
  
  return Math.round(baseCount * intensityMultiplier * performanceMultiplier)
}

// Performance detection utility
export function getPerformanceMultiplier(): number {
  // Simple performance detection based on user agent and memory
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
  
  if (isMobile || isLowEnd) {
    return 0.6 // Reduce particle count for lower-end devices
  }
  
  return 1.0 // Full particle count for desktop/high-end devices
}