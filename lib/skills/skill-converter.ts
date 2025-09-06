import type { DbSkill, DbBuff } from "@/lib/types/database"
import type { Skill, SkillType, ElementType, AnimationType } from "@/lib/monsters"
import { 
  getTargetMapping, 
  getSkillTypeMapping, 
  getBuffCategory,
  type DbTargetType,
  type DbSkillType 
} from "./database-types"

/**
 * DB 스킬을 게임 스킬 형태로 변환합니다
 */
export function convertDbSkillToGameSkill(dbSkill: DbSkill, relatedBuffs: DbBuff[] = []): Skill {
  const targetMapping = getTargetMapping(dbSkill.target_type as DbTargetType)
  const skillTypeMapping = getSkillTypeMapping(dbSkill.skill_type as DbSkillType)
  
  // 기본 스킬 타입 결정
  let gameSkillType: SkillType = 'strong_attack' // 기본값
  
  if (skillTypeMapping) {
    gameSkillType = skillTypeMapping.gameType
  } else {
    // 데미지가 0이거나 없으면 지원 스킬로 분류
    if (!dbSkill.damage || dbSkill.damage <= 0) {
      gameSkillType = 'heal'
    } else if (dbSkill.target_type === 'ALL_ENEMY') {
      gameSkillType = 'wide_attack'
    }
  }
  
  // 버프 분석하여 스킬 타입 세분화
  const hasHealBuff = relatedBuffs.some(buff => 
    buff.stat_type === 'HP' && (buff.value || 0) > 0
  )
  const hasDodgeBuff = relatedBuffs.some(buff => 
    buff.stat_type === 'DODGE' || buff.stat_type === 'SUPER_LUCK'
  )
  const hasDefenseBuff = relatedBuffs.some(buff => 
    buff.stat_type === 'DEF' || buff.stat_type === 'SHIELD' || buff.stat_type === 'PROTECTION'
  )
  
  if (hasHealBuff) gameSkillType = 'heal'
  else if (hasDodgeBuff) gameSkillType = 'dodge'
  else if (hasDefenseBuff) gameSkillType = 'block'
  
  // 엘리멘탈 타입 추론 (스킬 이름 기반)
  const elementType = inferElementType(dbSkill.name || '')
  
  // 애니메이션 타입 추론
  const animationType = inferAnimationType(dbSkill.name || '', gameSkillType)
  
  return {
    id: dbSkill.id.toString(),
    name: dbSkill.name || '알 수 없는 스킬',
    type: gameSkillType,
    damage: dbSkill.damage || undefined,
    healAmount: getHealAmount(relatedBuffs),
    range: targetMapping?.gameRange || 1,
    cooldown: dbSkill.cooldown || 3,
    description: dbSkill.description || '',
    dodgeChance: getDodgeChance(relatedBuffs),
    blockReduction: getBlockReduction(relatedBuffs),
    elementType,
    animationType
  }
}

/**
 * 스킬 이름으로부터 엘리멘탈 타입을 추론합니다
 */
function inferElementType(skillName: string): ElementType {
  const name = skillName.toLowerCase()
  
  if (name.includes('파이어') || name.includes('화염') || name.includes('불')) {
    return 'fire'
  } else if (name.includes('아이스') || name.includes('얼음') || name.includes('빙')) {
    return 'ice'
  } else if (name.includes('아쿠아') || name.includes('워터') || name.includes('물')) {
    return 'water'
  } else if (name.includes('그린') || name.includes('포레스트') || name.includes('민트')) {
    return 'grass'
  } else if (name.includes('라이트') || name.includes('골든') || name.includes('빛')) {
    return 'light'
  } else if (name.includes('다크') || name.includes('섀도우') || name.includes('어둠')) {
    return 'shadow'
  } else if (name.includes('윈드') || name.includes('바람') || name.includes('스톰')) {
    return 'wind'
  } else if (name.includes('어스') || name.includes('대지') || name.includes('땅')) {
    return 'earth'
  } else if (name.includes('일렉') || name.includes('번개') || name.includes('전기')) {
    return 'electric'
  }
  
  return 'physical' // 기본값
}

/**
 * 스킬 이름과 타입으로부터 애니메이션 타입을 추론합니다
 */
function inferAnimationType(skillName: string, skillType: SkillType): AnimationType {
  const name = skillName.toLowerCase()
  
  if (name.includes('발톱') || name.includes('클로')) {
    return 'slash'
  } else if (name.includes('폭발') || name.includes('버스트')) {
    return 'explosion'
  } else if (name.includes('빔') || name.includes('브레스')) {
    return 'beam'
  } else if (name.includes('스톰') || name.includes('폭풍')) {
    return 'storm'
  } else if (name.includes('웨이브') || name.includes('파도')) {
    return 'wave'
  } else if (name.includes('스파클') || name.includes('반짝')) {
    return 'sparkle'
  } else if (name.includes('글로우') || name.includes('빛나')) {
    return 'glow'
  }
  
  // 스킬 타입별 기본 애니메이션
  switch (skillType) {
    case 'heal':
      return 'glow'
    case 'wide_attack':
      return 'explosion'
    case 'strong_attack':
      return 'impact'
    case 'dodge':
      return 'sparkle'
    case 'block':
      return 'glow'
    default:
      return 'impact'
  }
}

/**
 * 버프들로부터 치유량을 계산합니다
 */
function getHealAmount(buffs: DbBuff[]): number | undefined {
  const healBuff = buffs.find(buff => 
    buff.stat_type === 'HP' && (buff.value || 0) > 0
  )
  
  return healBuff ? (healBuff.value || 0) : undefined
}

/**
 * 버프들로부터 회피 확률을 계산합니다
 */
function getDodgeChance(buffs: DbBuff[]): number | undefined {
  const dodgeBuff = buffs.find(buff => 
    buff.stat_type === 'DODGE' || buff.stat_type === 'SUPER_LUCK'
  )
  
  if (dodgeBuff && dodgeBuff.value) {
    // 퍼센트 값을 0-1 범위로 변환
    return dodgeBuff.value / 100
  }
  
  return undefined
}

/**
 * 버프들로부터 블록 데미지 감소율을 계산합니다
 */
function getBlockReduction(buffs: DbBuff[]): number | undefined {
  const blockBuff = buffs.find(buff => 
    buff.stat_type === 'DEF' || buff.stat_type === 'SHIELD' || buff.stat_type === 'PROTECTION'
  )
  
  if (blockBuff && blockBuff.value) {
    // 퍼센트 값을 0-1 범위로 변환
    return Math.min(blockBuff.value / 100, 0.9) // 최대 90% 감소
  }
  
  return undefined
}

/**
 * 여러 DB 스킬들을 게임 스킬 배열로 변환합니다
 */
export function convertDbSkillsToGameSkills(
  dbSkills: DbSkill[], 
  skillBuffsMap: Map<number, DbBuff[]> = new Map()
): Skill[] {
  return dbSkills.map(dbSkill => {
    const relatedBuffs = skillBuffsMap.get(dbSkill.id) || []
    return convertDbSkillToGameSkill(dbSkill, relatedBuffs)
  })
}

/**
 * DB 버프 데이터를 게임에서 사용할 수 있는 형태로 변환합니다
 */
export function convertDbBuffToGameBuff(dbBuff: DbBuff) {
  const category = getBuffCategory(dbBuff.stat_type as any)
  
  return {
    id: dbBuff.id.toString(),
    name: dbBuff.name || '알 수 없는 버프',
    description: dbBuff.description || '',
    value: dbBuff.value || 0,
    statType: dbBuff.stat_type || 'HP',
    remainTurn: dbBuff.remain_turn || 1,
    targetType: dbBuff.target_type || 'SELF',
    category: category?.category || 'special',
    isPositive: category?.isPositive !== false
  }
}