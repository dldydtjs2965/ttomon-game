import type { ElementType, AnimationType, Skill, Monster } from "../monsters"

// 몬스터 타입별 기본 애니메이션 매핑
export const MONSTER_TYPE_ANIMATION_MAP: Record<string, { element: ElementType; animation: AnimationType }> = {
  fire: { element: "fire", animation: "explosion" },
  water: { element: "water", animation: "wave" },
  grass: { element: "grass", animation: "burst" },
  rock: { element: "earth", animation: "impact" },
  wind: { element: "wind", animation: "storm" },
  electric: { element: "electric", animation: "storm" },
  ice: { element: "ice", animation: "beam" },
  crystal: { element: "ice", animation: "sparkle" },
  storm: { element: "electric", animation: "storm" },
  frost: { element: "ice", animation: "burst" },
  shadow: { element: "shadow", animation: "slash" },
  light: { element: "light", animation: "beam" },
  void: { element: "shadow", animation: "explosion" },
}

// 스킬 ID별 특수 애니메이션 매핑
export const SKILL_ANIMATION_OVERRIDES: Record<string, { element: ElementType; animation: AnimationType }> = {
  // Common skills
  flame_burst: { element: "fire", animation: "explosion" },
  water_splash: { element: "water", animation: "wave" },
  quick_dodge: { element: "wind", animation: "sparkle" },
  earth_shield: { element: "earth", animation: "glow" },
  
  // Rare skills
  lightning_storm: { element: "electric", animation: "storm" },
  ice_spear: { element: "ice", animation: "beam" },
  shadow_step: { element: "shadow", animation: "sparkle" },
  
  // Unique skills
  divine_heal: { element: "light", animation: "sparkle" },
  meteor_strike: { element: "fire", animation: "explosion" },
  dragon_claw: { element: "shadow", animation: "slash" },
}

// 공격 타입별 기본 애니메이션
export const ATTACK_TYPE_DEFAULTS: Record<string, AnimationType> = {
  strong_attack: "impact",
  wide_attack: "burst", 
  heal: "glow",
  dodge: "sparkle",
  block: "glow",
}

// 애니메이션 강도 계산
export function calculateAnimationIntensity(damage: number, healAmount?: number): "low" | "medium" | "high" {
  const value = damage || healAmount || 0
  
  if (value <= 30) return "low"
  if (value <= 60) return "medium"
  return "high"
}

// 스킬에서 애니메이션 정보 추출
export function getSkillAnimationInfo(skill: Skill, monster?: Monster): {
  elementType: ElementType
  animationType: AnimationType
  intensity: "low" | "medium" | "high"
} {
  let elementType: ElementType = "physical"
  let animationType: AnimationType = "impact"

  // 1순위: 스킬에 직접 정의된 애니메이션
  if (skill.elementType && skill.animationType) {
    elementType = skill.elementType
    animationType = skill.animationType
  }
  // 2순위: 스킬 ID별 오버라이드
  else if (SKILL_ANIMATION_OVERRIDES[skill.id]) {
    const override = SKILL_ANIMATION_OVERRIDES[skill.id]
    elementType = override.element
    animationType = override.animation
  }
  // 3순위: 몬스터 타입 기반
  else if (monster && MONSTER_TYPE_ANIMATION_MAP[monster.type]) {
    const monsterDefault = MONSTER_TYPE_ANIMATION_MAP[monster.type]
    elementType = monsterDefault.element
    animationType = monsterDefault.animation
  }
  // 4순위: 스킬 타입 기본값
  else if (ATTACK_TYPE_DEFAULTS[skill.type]) {
    animationType = ATTACK_TYPE_DEFAULTS[skill.type]
    
    // 몬스터 타입에서 엘리멘트만 추출
    if (monster && MONSTER_TYPE_ANIMATION_MAP[monster.type]) {
      elementType = MONSTER_TYPE_ANIMATION_MAP[monster.type].element
    }
  }

  const intensity = calculateAnimationIntensity(skill.damage || 0, skill.healAmount)

  return { elementType, animationType, intensity }
}

// 일반 공격 애니메이션 정보
export function getNormalAttackAnimationInfo(monster: Monster): {
  elementType: ElementType
  animationType: AnimationType
  intensity: "low" | "medium" | "high"
} {
  let elementType: ElementType = "physical"
  let animationType: AnimationType = "slash"

  if (MONSTER_TYPE_ANIMATION_MAP[monster.type]) {
    const monsterMapping = MONSTER_TYPE_ANIMATION_MAP[monster.type]
    elementType = monsterMapping.element
    
    // 일반 공격은 보통 물리적 공격이므로 적절한 애니메이션 선택
    switch (monsterMapping.element) {
      case "fire":
      case "electric":
        animationType = "impact"
        break
      case "water":
      case "ice":
        animationType = "slash"
        break
      case "grass":
      case "earth":
        animationType = "impact"
        break
      case "wind":
        animationType = "slash"
        break
      case "shadow":
        animationType = "slash"
        break
      case "light":
        animationType = "impact"
        break
      default:
        animationType = "slash"
    }
  }

  const intensity = calculateAnimationIntensity(monster.attack)

  return { elementType, animationType, intensity }
}

// 상호작용에 따른 애니메이션 수정
export function getElementalInteraction(
  attackerElement: ElementType,
  targetMonster?: Monster
): {
  effectiveness: "weak" | "normal" | "strong"
  modifiedElement?: ElementType
} {
  if (!targetMonster) {
    return { effectiveness: "normal" }
  }

  const targetMapping = MONSTER_TYPE_ANIMATION_MAP[targetMonster.type]
  if (!targetMapping) {
    return { effectiveness: "normal" }
  }

  const targetElement = targetMapping.element

  // 상성 체크
  const effectiveness = getTypeEffectiveness(attackerElement, targetElement)
  
  return { effectiveness }
}

// 타입 상성 계산
function getTypeEffectiveness(attacker: ElementType, target: ElementType): "weak" | "normal" | "strong" {
  const effectiveness: Record<ElementType, Record<ElementType, "weak" | "normal" | "strong">> = {
    fire: {
      fire: "weak",
      water: "weak", 
      grass: "strong",
      ice: "strong",
      electric: "normal",
      earth: "normal",
      wind: "normal",
      light: "normal",
      shadow: "normal",
      physical: "normal"
    },
    water: {
      fire: "strong",
      water: "weak",
      grass: "weak",
      ice: "normal",
      electric: "weak",
      earth: "strong",
      wind: "normal",
      light: "normal",
      shadow: "normal",
      physical: "normal"
    },
    grass: {
      fire: "weak",
      water: "strong",
      grass: "weak",
      ice: "weak",
      electric: "normal",
      earth: "strong",
      wind: "weak",
      light: "normal",
      shadow: "normal",
      physical: "normal"
    },
    ice: {
      fire: "weak",
      water: "normal",
      grass: "strong",
      ice: "weak",
      electric: "normal",
      earth: "normal",
      wind: "normal",
      light: "normal",
      shadow: "normal",
      physical: "normal"
    },
    electric: {
      fire: "normal",
      water: "strong",
      grass: "normal",
      ice: "normal",
      electric: "weak",
      earth: "weak",
      wind: "strong",
      light: "normal",
      shadow: "normal",
      physical: "normal"
    },
    earth: {
      fire: "strong",
      water: "weak",
      grass: "weak",
      ice: "normal",
      electric: "strong",
      earth: "normal",
      wind: "normal",
      light: "normal",
      shadow: "normal",
      physical: "normal"
    },
    wind: {
      fire: "normal",
      water: "normal",
      grass: "strong",
      ice: "normal",
      electric: "weak",
      earth: "normal",
      wind: "weak",
      light: "normal",
      shadow: "normal",
      physical: "normal"
    },
    light: {
      fire: "normal",
      water: "normal",
      grass: "normal",
      ice: "normal",
      electric: "normal",
      earth: "normal",
      wind: "normal",
      light: "weak",
      shadow: "strong",
      physical: "normal"
    },
    shadow: {
      fire: "normal",
      water: "normal",
      grass: "normal",
      ice: "normal",
      electric: "normal",
      earth: "normal",
      wind: "normal",
      light: "weak",
      shadow: "weak",
      physical: "normal"
    },
    physical: {
      fire: "normal",
      water: "normal",
      grass: "normal",
      ice: "normal",
      electric: "normal",
      earth: "normal",
      wind: "normal",
      light: "normal",
      shadow: "normal",
      physical: "normal"
    }
  }

  return effectiveness[attacker]?.[target] || "normal"
}

// 애니메이션 지속시간 계산
export function getAnimationDuration(animationType: AnimationType, intensity: "low" | "medium" | "high"): number {
  const baseDurations: Record<AnimationType, number> = {
    slash: 0.3,
    impact: 0.5,
    burst: 0.6,
    beam: 0.8,
    storm: 1.0,
    explosion: 1.2,
    wave: 0.7,
    sparkle: 1.5,
    glow: 2.0,
  }

  const intensityMultiplier = {
    low: 0.8,
    medium: 1.0,
    high: 1.2
  }

  return baseDurations[animationType] * intensityMultiplier[intensity]
}