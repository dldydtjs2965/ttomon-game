import { gsap } from "gsap"
import type { ElementType } from "../monsters"

// 하스스톤 스타일 애니메이션 인터페이스
export interface HearthstoneAnimationConfig {
  duration: number
  ease: string
  delay?: number
  stagger?: number
  physics?: {
    gravity?: number
    friction?: number
    bounce?: number
  }
}

// 5단계 공격 시퀀스 설정
export interface AttackSequenceConfig {
  prepare: HearthstoneAnimationConfig
  lunge: HearthstoneAnimationConfig  
  impact: HearthstoneAnimationConfig
  recoil: HearthstoneAnimationConfig
  return: HearthstoneAnimationConfig
}

// 곡선 경로 생성 유틸리티
export function createCurvedPath(
  startX: number,
  startY: number, 
  endX: number,
  endY: number,
  curvature: number = 0.5
): string {
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2 - (curvature * 100)
  
  return `M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`
}

// 하스스톤 스타일 5단계 공격 시퀀스
export const HEARTHSTONE_ATTACK_SEQUENCES: Record<string, AttackSequenceConfig> = {
  melee: {
    prepare: { 
      duration: 0.3, 
      ease: "back.out(2)",
      physics: { gravity: 0 }
    },
    lunge: { 
      duration: 0.4, 
      ease: "power3.inOut",
      physics: { gravity: 0.2 }
    },
    impact: { 
      duration: 0.2, 
      ease: "power4.out",
      physics: { bounce: 0.3 }
    },
    recoil: { 
      duration: 0.25, 
      ease: "elastic.out(1.5, 0.3)",
      physics: { friction: 0.8 }
    },
    return: { 
      duration: 0.5, 
      ease: "back.out(1.7)",
      physics: { gravity: 0 }
    }
  },
  ranged: {
    prepare: { 
      duration: 0.4, 
      ease: "power2.out",
      physics: { gravity: 0 }
    },
    lunge: { 
      duration: 0.2, 
      ease: "power2.in",
      physics: { gravity: 0 }
    },
    impact: { 
      duration: 0.3, 
      ease: "power3.out",
      physics: { bounce: 0.5 }
    },
    recoil: { 
      duration: 0.2, 
      ease: "power2.out",
      physics: { friction: 0.9 }
    },
    return: { 
      duration: 0.4, 
      ease: "power2.inOut",
      physics: { gravity: 0 }
    }
  },
  magic: {
    prepare: { 
      duration: 0.6, 
      ease: "sine.inOut",
      physics: { gravity: 0 }
    },
    lunge: { 
      duration: 0.3, 
      ease: "power1.in",
      physics: { gravity: 0 }
    },
    impact: { 
      duration: 0.4, 
      ease: "power4.out",
      physics: { bounce: 0.4 }
    },
    recoil: { 
      duration: 0.3, 
      ease: "elastic.out(2, 0.2)",
      physics: { friction: 0.7 }
    },
    return: { 
      duration: 0.6, 
      ease: "sine.inOut",
      physics: { gravity: 0 }
    }
  }
}

// 3D 카드 효과 설정
export interface Card3DConfig {
  perspective: number
  rotationX: number
  rotationY: number
  elevation: number
  shadowBlur: number
  shadowOpacity: number
}

export const CARD_3D_EFFECTS: Record<string, Card3DConfig> = {
  idle: {
    perspective: 1000,
    rotationX: 0,
    rotationY: 0, 
    elevation: 0,
    shadowBlur: 10,
    shadowOpacity: 0.3
  },
  hover: {
    perspective: 1000,
    rotationX: -5,
    rotationY: 5,
    elevation: 20,
    shadowBlur: 20,
    shadowOpacity: 0.5
  },
  attack: {
    perspective: 800,
    rotationX: -15,
    rotationY: 10,
    elevation: 30,
    shadowBlur: 30,
    shadowOpacity: 0.7
  },
  damage: {
    perspective: 1200,
    rotationX: 10,
    rotationY: -8,
    elevation: -5,
    shadowBlur: 15,
    shadowOpacity: 0.4
  }
}

// 고급 파티클 시스템 설정
export interface AdvancedParticleConfig {
  layers: {
    background: ParticleLayerConfig
    middle: ParticleLayerConfig
    foreground: ParticleLayerConfig
  }
  physics: {
    gravity: number
    wind: number
    turbulence: number
  }
}

export interface ParticleLayerConfig {
  count: number
  size: { min: number; max: number }
  opacity: { start: number; end: number }
  velocity: { min: number; max: number }
  spread: number
  colors: string[]
  shape: 'circle' | 'square' | 'star' | 'diamond' | 'custom'
  blend: 'normal' | 'multiply' | 'screen' | 'overlay'
}

// 엘리멘트별 고급 파티클 설정
export const ADVANCED_PARTICLE_CONFIGS: Record<ElementType, AdvancedParticleConfig> = {
  fire: {
    layers: {
      background: {
        count: 8,
        size: { min: 20, max: 40 },
        opacity: { start: 0.3, end: 0 },
        velocity: { min: 20, max: 40 },
        spread: 60,
        colors: ["#FF6B00", "#FF8E53", "#FFB366"],
        shape: 'circle',
        blend: 'screen'
      },
      middle: {
        count: 15,
        size: { min: 8, max: 16 },
        opacity: { start: 0.8, end: 0 },
        velocity: { min: 60, max: 120 },
        spread: 80,
        colors: ["#FF4500", "#FF6347", "#FF8C00"],
        shape: 'circle',
        blend: 'normal'
      },
      foreground: {
        count: 25,
        size: { min: 2, max: 6 },
        opacity: { start: 1, end: 0 },
        velocity: { min: 100, max: 200 },
        spread: 90,
        colors: ["#FFD700", "#FFA500", "#FF7F50"],
        shape: 'star',
        blend: 'screen'
      }
    },
    physics: {
      gravity: 30,
      wind: 0,
      turbulence: 0.1
    }
  },
  water: {
    layers: {
      background: {
        count: 6,
        size: { min: 15, max: 30 },
        opacity: { start: 0.4, end: 0 },
        velocity: { min: 15, max: 30 },
        spread: 50,
        colors: ["#87CEEB", "#B0E0E6", "#E0F6FF"],
        shape: 'circle',
        blend: 'multiply'
      },
      middle: {
        count: 12,
        size: { min: 6, max: 12 },
        opacity: { start: 0.7, end: 0 },
        velocity: { min: 40, max: 80 },
        spread: 70,
        colors: ["#4169E1", "#6495ED", "#87CEEB"],
        shape: 'circle',
        blend: 'normal'
      },
      foreground: {
        count: 20,
        size: { min: 3, max: 8 },
        opacity: { start: 0.9, end: 0 },
        velocity: { min: 80, max: 160 },
        spread: 60,
        colors: ["#0080FF", "#1E90FF", "#00BFFF"],
        shape: 'diamond',
        blend: 'screen'
      }
    },
    physics: {
      gravity: 40,
      wind: 0,
      turbulence: 0.05
    }
  },
  electric: {
    layers: {
      background: {
        count: 4,
        size: { min: 30, max: 60 },
        opacity: { start: 0.2, end: 0 },
        velocity: { min: 10, max: 20 },
        spread: 40,
        colors: ["#E6E6FA", "#F0F8FF", "#F5F5DC"],
        shape: 'circle',
        blend: 'screen'
      },
      middle: {
        count: 10,
        size: { min: 8, max: 20 },
        opacity: { start: 0.9, end: 0 },
        velocity: { min: 100, max: 200 },
        spread: 120,
        colors: ["#FFD700", "#FFFF00", "#FFF8DC"],
        shape: 'star',
        blend: 'screen'
      },
      foreground: {
        count: 30,
        size: { min: 1, max: 4 },
        opacity: { start: 1, end: 0 },
        velocity: { min: 200, max: 400 },
        spread: 180,
        colors: ["#FFFFFF", "#E0E0E0", "#F8F8FF"],
        shape: 'circle',
        blend: 'screen'
      }
    },
    physics: {
      gravity: 10,
      wind: 0,
      turbulence: 0.3
    }
  },
  // 다른 엘리멘트들은 간단히 물리 타입을 복사하여 변형
  physical: {
    layers: {
      background: {
        count: 5,
        size: { min: 12, max: 24 },
        opacity: { start: 0.4, end: 0 },
        velocity: { min: 20, max: 40 },
        spread: 45,
        colors: ["#CD853F", "#DEB887", "#F5DEB3"],
        shape: 'circle',
        blend: 'normal'
      },
      middle: {
        count: 8,
        size: { min: 6, max: 12 },
        opacity: { start: 0.8, end: 0 },
        velocity: { min: 50, max: 100 },
        spread: 60,
        colors: ["#8B4513", "#A0522D", "#CD853F"],
        shape: 'circle',
        blend: 'normal'
      },
      foreground: {
        count: 15,
        size: { min: 3, max: 6 },
        opacity: { start: 1, end: 0 },
        velocity: { min: 80, max: 160 },
        spread: 45,
        colors: ["#654321", "#8B4513", "#A0522D"],
        shape: 'circle',
        blend: 'multiply'
      }
    },
    physics: {
      gravity: 50,
      wind: 0,
      turbulence: 0.02
    }
  },
  grass: {
    layers: {
      background: {
        count: 12,
        size: { min: 8, max: 16 },
        opacity: { start: 0.5, end: 0 },
        velocity: { min: 15, max: 35 },
        spread: 80,
        colors: ["#90EE90", "#98FB98", "#F0FFF0"],
        shape: 'circle',
        blend: 'multiply'
      },
      middle: {
        count: 20,
        size: { min: 4, max: 10 },
        opacity: { start: 0.8, end: 0 },
        velocity: { min: 30, max: 70 },
        spread: 100,
        colors: ["#32CD32", "#7CFC00", "#ADFF2F"],
        shape: 'circle',
        blend: 'normal'
      },
      foreground: {
        count: 25,
        size: { min: 2, max: 5 },
        opacity: { start: 0.9, end: 0 },
        velocity: { min: 60, max: 120 },
        spread: 90,
        colors: ["#228B22", "#32CD32", "#00FF00"],
        shape: 'diamond',
        blend: 'screen'
      }
    },
    physics: {
      gravity: 25,
      wind: 15,
      turbulence: 0.1
    }
  },
  ice: {
    layers: {
      background: {
        count: 6,
        size: { min: 16, max: 32 },
        opacity: { start: 0.3, end: 0 },
        velocity: { min: 10, max: 25 },
        spread: 40,
        colors: ["#F0F8FF", "#E6E6FA", "#F5F5F5"],
        shape: 'diamond',
        blend: 'screen'
      },
      middle: {
        count: 10,
        size: { min: 8, max: 16 },
        opacity: { start: 0.7, end: 0 },
        velocity: { min: 25, max: 60 },
        spread: 50,
        colors: ["#87CEEB", "#B0E0E6", "#E0F6FF"],
        shape: 'diamond',
        blend: 'normal'
      },
      foreground: {
        count: 20,
        size: { min: 3, max: 8 },
        opacity: { start: 1, end: 0 },
        velocity: { min: 40, max: 100 },
        spread: 45,
        colors: ["#FFFFFF", "#F0F8FF", "#E6E6FA"],
        shape: 'star',
        blend: 'screen'
      }
    },
    physics: {
      gravity: 35,
      wind: -5,
      turbulence: 0.05
    }
  },
  light: {
    layers: {
      background: {
        count: 8,
        size: { min: 20, max: 40 },
        opacity: { start: 0.2, end: 0 },
        velocity: { min: 15, max: 30 },
        spread: 90,
        colors: ["#FFFACD", "#F0E68C", "#FFEFD5"],
        shape: 'circle',
        blend: 'screen'
      },
      middle: {
        count: 15,
        size: { min: 8, max: 20 },
        opacity: { start: 0.6, end: 0 },
        velocity: { min: 60, max: 120 },
        spread: 100,
        colors: ["#FFD700", "#FFFF00", "#FFF8DC"],
        shape: 'star',
        blend: 'screen'
      },
      foreground: {
        count: 30,
        size: { min: 2, max: 6 },
        opacity: { start: 1, end: 0 },
        velocity: { min: 100, max: 250 },
        spread: 120,
        colors: ["#FFFFFF", "#FFFFE0", "#F5F5DC"],
        shape: 'circle',
        blend: 'screen'
      }
    },
    physics: {
      gravity: 15,
      wind: 0,
      turbulence: 0.2
    }
  },
  shadow: {
    layers: {
      background: {
        count: 6,
        size: { min: 20, max: 40 },
        opacity: { start: 0.6, end: 0 },
        velocity: { min: 10, max: 25 },
        spread: 55,
        colors: ["#708090", "#696969", "#778899"],
        shape: 'circle',
        blend: 'multiply'
      },
      middle: {
        count: 12,
        size: { min: 8, max: 16 },
        opacity: { start: 0.8, end: 0 },
        velocity: { min: 40, max: 80 },
        spread: 70,
        colors: ["#2F4F4F", "#4B0082", "#483D8B"],
        shape: 'circle',
        blend: 'normal'
      },
      foreground: {
        count: 18,
        size: { min: 4, max: 10 },
        opacity: { start: 0.9, end: 0 },
        velocity: { min: 70, max: 140 },
        spread: 60,
        colors: ["#191970", "#000080", "#4B0082"],
        shape: 'diamond',
        blend: 'multiply'
      }
    },
    physics: {
      gravity: 25,
      wind: 0,
      turbulence: 0.15
    }
  },
  wind: {
    layers: {
      background: {
        count: 10,
        size: { min: 12, max: 24 },
        opacity: { start: 0.3, end: 0 },
        velocity: { min: 20, max: 50 },
        spread: 85,
        colors: ["#F5F5F5", "#E6E6FA", "#F0F8FF"],
        shape: 'circle',
        blend: 'screen'
      },
      middle: {
        count: 16,
        size: { min: 6, max: 12 },
        opacity: { start: 0.5, end: 0 },
        velocity: { min: 60, max: 120 },
        spread: 100,
        colors: ["#E6E6FA", "#DCDCDC", "#D3D3D3"],
        shape: 'circle',
        blend: 'normal'
      },
      foreground: {
        count: 25,
        size: { min: 2, max: 6 },
        opacity: { start: 0.8, end: 0 },
        velocity: { min: 100, max: 220 },
        spread: 120,
        colors: ["#FFFFFF", "#F8F8FF", "#E6E6FA"],
        shape: 'circle',
        blend: 'screen'
      }
    },
    physics: {
      gravity: 5,
      wind: 50,
      turbulence: 0.3
    }
  },
  earth: {
    layers: {
      background: {
        count: 8,
        size: { min: 16, max: 32 },
        opacity: { start: 0.5, end: 0 },
        velocity: { min: 15, max: 35 },
        spread: 35,
        colors: ["#D2691E", "#CD853F", "#DEB887"],
        shape: 'circle',
        blend: 'normal'
      },
      middle: {
        count: 12,
        size: { min: 8, max: 16 },
        opacity: { start: 0.8, end: 0 },
        velocity: { min: 30, max: 70 },
        spread: 50,
        colors: ["#8B4513", "#A0522D", "#CD853F"],
        shape: 'circle',
        blend: 'multiply'
      },
      foreground: {
        count: 16,
        size: { min: 4, max: 12 },
        opacity: { start: 1, end: 0 },
        velocity: { min: 50, max: 120 },
        spread: 40,
        colors: ["#654321", "#8B4513", "#A0522D"],
        shape: 'diamond',
        blend: 'normal'
      }
    },
    physics: {
      gravity: 60,
      wind: 0,
      turbulence: 0.02
    }
  }
}

// 에너지 웨이브 효과 설정
export interface EnergyWaveConfig {
  count: number
  maxRadius: number
  strokeWidth: number
  color: string
  opacity: { start: number; end: number }
  duration: number
  delay: number
}

export const ENERGY_WAVE_CONFIGS: Record<ElementType, EnergyWaveConfig> = {
  fire: {
    count: 3,
    maxRadius: 150,
    strokeWidth: 4,
    color: "#FF4500",
    opacity: { start: 0.8, end: 0 },
    duration: 0.8,
    delay: 0.1
  },
  water: {
    count: 2,
    maxRadius: 120,
    strokeWidth: 6,
    color: "#4169E1",
    opacity: { start: 0.7, end: 0 },
    duration: 1.0,
    delay: 0.15
  },
  electric: {
    count: 4,
    maxRadius: 180,
    strokeWidth: 2,
    color: "#FFD700",
    opacity: { start: 1.0, end: 0 },
    duration: 0.6,
    delay: 0.05
  },
  // 기타 엘리멘트들은 기본값 사용
  physical: {
    count: 2,
    maxRadius: 100,
    strokeWidth: 3,
    color: "#8B4513",
    opacity: { start: 0.6, end: 0 },
    duration: 0.7,
    delay: 0.2
  },
  grass: {
    count: 3,
    maxRadius: 140,
    strokeWidth: 5,
    color: "#32CD32",
    opacity: { start: 0.7, end: 0 },
    duration: 0.9,
    delay: 0.12
  },
  ice: {
    count: 2,
    maxRadius: 110,
    strokeWidth: 4,
    color: "#87CEEB",
    opacity: { start: 0.8, end: 0 },
    duration: 1.1,
    delay: 0.18
  },
  light: {
    count: 4,
    maxRadius: 160,
    strokeWidth: 3,
    color: "#FFD700",
    opacity: { start: 0.9, end: 0 },
    duration: 0.8,
    delay: 0.08
  },
  shadow: {
    count: 2,
    maxRadius: 130,
    strokeWidth: 5,
    color: "#4B0082",
    opacity: { start: 0.7, end: 0 },
    duration: 1.0,
    delay: 0.15
  },
  wind: {
    count: 3,
    maxRadius: 170,
    strokeWidth: 2,
    color: "#E6E6FA",
    opacity: { start: 0.5, end: 0 },
    duration: 0.9,
    delay: 0.1
  },
  earth: {
    count: 2,
    maxRadius: 120,
    strokeWidth: 6,
    color: "#A0522D",
    opacity: { start: 0.8, end: 0 },
    duration: 1.2,
    delay: 0.2
  }
}

// 물리 기반 움직임 유틸리티
export function calculateKnockbackTrajectory(
  impactForce: number,
  angle: number,
  mass: number = 1
): { distance: number; duration: number; easing: string } {
  const distance = (impactForce / mass) * 20 // 기본 거리 계산
  const duration = Math.max(0.3, distance / 100) // 거리에 비례한 지속시간
  
  return {
    distance: Math.min(distance, 100), // 최대 100px
    duration: Math.min(duration, 1.0), // 최대 1초
    easing: "power2.out"
  }
}

// 글로우 효과 설정
export interface GlowEffectConfig {
  color: string
  intensity: number
  pulseSpeed: number
  spreadRadius: number
}

export const GLOW_EFFECTS: Record<string, GlowEffectConfig> = {
  prepare: {
    color: "#FFD700",
    intensity: 0.6,
    pulseSpeed: 1.5,
    spreadRadius: 20
  },
  charging: {
    color: "#00BFFF",
    intensity: 0.8,
    pulseSpeed: 2.0,
    spreadRadius: 25
  },
  critical: {
    color: "#FF4500",
    intensity: 1.0,
    pulseSpeed: 3.0,
    spreadRadius: 30
  }
}