// Database and Game System Mapping Types for Skills

// Database Target Types (from CSV data)
export type DbTargetType = 'SELF' | 'ALLY' | 'ENEMY' | 'ALL_ENEMY' | 'ALL_ALLY'

// Database Skill Types (from CSV data)
export type DbSkillType = 'PHYSICAL' | 'MAGIC' | 'SUPPORT'

// Database Stat Types (from buffs CSV data)
export type DbStatType = 
  | 'ATK' 
  | 'DEF' 
  | 'HP' 
  | 'MAGIC_ATK' 
  | 'MAGIC_DEF' 
  | 'SPD' 
  | 'DODGE' 
  | 'ACCURACY' 
  | 'SHIELD' 
  | 'FREEZE' 
  | 'CHARM' 
  | 'STUN' 
  | 'LUCK' 
  | 'CLEANSE' 
  | 'PROTECTION' 
  | 'ALL_STATS' 
  | 'CRIT' 
  | 'SUPER_LUCK'

// Mapping from DB to Game Systems
export interface SkillTargetMapping {
  dbType: DbTargetType
  gameRange: number // 1 = single, 3 = line, 9 = all
  gameTarget: 'self' | 'ally' | 'enemy' | 'all'
}

export const TARGET_TYPE_MAPPINGS: SkillTargetMapping[] = [
  { dbType: 'SELF', gameRange: 1, gameTarget: 'self' },
  { dbType: 'ALLY', gameRange: 1, gameTarget: 'ally' },
  { dbType: 'ENEMY', gameRange: 1, gameTarget: 'enemy' },
  { dbType: 'ALL_ENEMY', gameRange: 9, gameTarget: 'enemy' },
  { dbType: 'ALL_ALLY', gameRange: 9, gameTarget: 'ally' },
]

export interface SkillTypeMapping {
  dbType: DbSkillType
  gameType: 'heal' | 'wide_attack' | 'strong_attack' | 'dodge' | 'block'
}

export const SKILL_TYPE_MAPPINGS: SkillTypeMapping[] = [
  { dbType: 'PHYSICAL', gameType: 'strong_attack' },
  { dbType: 'MAGIC', gameType: 'wide_attack' },
  { dbType: 'SUPPORT', gameType: 'heal' }, // Default for support skills
]

// Buff Effect Categories
export interface BuffCategory {
  statType: DbStatType
  category: 'combat' | 'healing' | 'debuff' | 'special'
  isPositive: boolean
}

export const BUFF_CATEGORIES: BuffCategory[] = [
  { statType: 'ATK', category: 'combat', isPositive: true },
  { statType: 'DEF', category: 'combat', isPositive: true },
  { statType: 'HP', category: 'healing', isPositive: true },
  { statType: 'MAGIC_ATK', category: 'combat', isPositive: true },
  { statType: 'MAGIC_DEF', category: 'combat', isPositive: true },
  { statType: 'SPD', category: 'combat', isPositive: true },
  { statType: 'DODGE', category: 'special', isPositive: true },
  { statType: 'ACCURACY', category: 'combat', isPositive: true },
  { statType: 'SHIELD', category: 'special', isPositive: true },
  { statType: 'FREEZE', category: 'debuff', isPositive: false },
  { statType: 'CHARM', category: 'debuff', isPositive: false },
  { statType: 'STUN', category: 'debuff', isPositive: false },
  { statType: 'LUCK', category: 'special', isPositive: true },
  { statType: 'CLEANSE', category: 'special', isPositive: true },
  { statType: 'PROTECTION', category: 'special', isPositive: true },
  { statType: 'ALL_STATS', category: 'combat', isPositive: true },
  { statType: 'CRIT', category: 'combat', isPositive: true },
  { statType: 'SUPER_LUCK', category: 'special', isPositive: true },
]

// Helper functions for type conversion
export function getTargetMapping(dbType: DbTargetType): SkillTargetMapping | null {
  return TARGET_TYPE_MAPPINGS.find(mapping => mapping.dbType === dbType) || null
}

export function getSkillTypeMapping(dbType: DbSkillType): SkillTypeMapping | null {
  return SKILL_TYPE_MAPPINGS.find(mapping => mapping.dbType === dbType) || null
}

export function getBuffCategory(statType: DbStatType): BuffCategory | null {
  return BUFF_CATEGORIES.find(category => category.statType === statType) || null
}