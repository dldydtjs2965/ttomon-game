// Buff System Types for Game Integration

import type { DbStatType, DbTargetType } from "./database-types"

// Game Buff Interface
export interface GameBuff {
  id: string
  name: string
  description: string
  value: number
  statType: DbStatType
  remainTurn: number
  targetType: DbTargetType
  category: BuffCategory
  isPositive: boolean
  icon?: string
  color?: string
}

// Buff Categories
export type BuffCategory = 'combat' | 'healing' | 'debuff' | 'special'

// Buff Effects for Battle System
export interface BuffEffect {
  type: 'stat_modifier' | 'heal_over_time' | 'damage_over_time' | 'status_effect'
  statModifiers?: {
    hp?: number
    attack?: number
    defense?: number
    speed?: number
    magicAttack?: number
    magicDefense?: number
    criticalRate?: number
    dodgeRate?: number
    accuracy?: number
  }
  healPerTurn?: number
  damagePerTurn?: number
  statusEffects?: {
    freeze?: boolean
    stun?: boolean
    charm?: boolean
    shield?: number
    cleanse?: boolean
  }
}

// Active Buff (applied to monsters in battle)
export interface ActiveBuff extends GameBuff {
  appliedTurn: number
  sourceSkillId: string
  targetMonsterId: string
  effect: BuffEffect
}

// Buff Application Rules
export interface BuffApplicationRule {
  stackable: boolean
  maxStacks: number
  overrideRule: 'replace' | 'highest' | 'lowest' | 'stack'
  conflictsWith?: DbStatType[]
}

// Predefined buff application rules
export const BUFF_APPLICATION_RULES: Record<DbStatType, BuffApplicationRule> = {
  ATK: { stackable: true, maxStacks: 3, overrideRule: 'stack' },
  DEF: { stackable: true, maxStacks: 3, overrideRule: 'stack' },
  HP: { stackable: false, maxStacks: 1, overrideRule: 'replace' },
  MAGIC_ATK: { stackable: true, maxStacks: 3, overrideRule: 'stack' },
  MAGIC_DEF: { stackable: true, maxStacks: 3, overrideRule: 'stack' },
  SPD: { stackable: true, maxStacks: 2, overrideRule: 'stack' },
  DODGE: { stackable: false, maxStacks: 1, overrideRule: 'highest' },
  ACCURACY: { stackable: false, maxStacks: 1, overrideRule: 'highest' },
  SHIELD: { stackable: false, maxStacks: 1, overrideRule: 'highest' },
  FREEZE: { stackable: false, maxStacks: 1, overrideRule: 'replace', conflictsWith: ['STUN', 'CHARM'] },
  CHARM: { stackable: false, maxStacks: 1, overrideRule: 'replace', conflictsWith: ['FREEZE', 'STUN'] },
  STUN: { stackable: false, maxStacks: 1, overrideRule: 'replace', conflictsWith: ['FREEZE', 'CHARM'] },
  LUCK: { stackable: true, maxStacks: 2, overrideRule: 'stack' },
  CLEANSE: { stackable: false, maxStacks: 1, overrideRule: 'replace' },
  PROTECTION: { stackable: false, maxStacks: 1, overrideRule: 'highest' },
  ALL_STATS: { stackable: true, maxStacks: 2, overrideRule: 'stack' },
  CRIT: { stackable: true, maxStacks: 3, overrideRule: 'stack' },
  SUPER_LUCK: { stackable: false, maxStacks: 1, overrideRule: 'highest' }
}

// Buff Duration Types
export type BuffDurationType = 'turns' | 'battle' | 'permanent'

// Buff Trigger Types
export type BuffTriggerType = 'immediate' | 'turn_start' | 'turn_end' | 'on_damage' | 'on_heal'

// Extended Buff with Trigger Information
export interface TriggeredBuff extends GameBuff {
  durationType: BuffDurationType
  triggerType: BuffTriggerType
  triggerCondition?: string
}

// Buff Manager Interface for Battle System
export interface BuffManager {
  activeBuffs: Map<string, ActiveBuff[]> // monsterId -> buffs
  applyBuff(buff: GameBuff, targetId: string, sourceSkillId: string): boolean
  removeBuff(buffId: string, targetId: string): boolean
  updateBuffs(monsterId: string, trigger: BuffTriggerType): void
  getActiveBuffs(monsterId: string): ActiveBuff[]
  clearAllBuffs(monsterId: string): void
  calculateStatModifiers(monsterId: string): BuffEffect['statModifiers']
}

// Utility functions for buff management
export function createBuffEffect(buff: GameBuff): BuffEffect {
  const effect: BuffEffect = {
    type: 'stat_modifier',
    statModifiers: {}
  }

  switch (buff.statType) {
    case 'HP':
      if (buff.remainTurn > 1) {
        effect.type = buff.value > 0 ? 'heal_over_time' : 'damage_over_time'
        effect.healPerTurn = Math.abs(buff.value)
        effect.damagePerTurn = buff.value < 0 ? Math.abs(buff.value) : undefined
      } else {
        effect.statModifiers!.hp = buff.value
      }
      break
    case 'ATK':
      effect.statModifiers!.attack = buff.value
      break
    case 'DEF':
      effect.statModifiers!.defense = buff.value
      break
    case 'SPD':
      effect.statModifiers!.speed = buff.value
      break
    case 'MAGIC_ATK':
      effect.statModifiers!.magicAttack = buff.value
      break
    case 'MAGIC_DEF':
      effect.statModifiers!.magicDefense = buff.value
      break
    case 'CRIT':
      effect.statModifiers!.criticalRate = buff.value
      break
    case 'DODGE':
    case 'SUPER_LUCK':
      effect.statModifiers!.dodgeRate = buff.value
      break
    case 'ACCURACY':
      effect.statModifiers!.accuracy = buff.value
      break
    case 'FREEZE':
    case 'STUN':
    case 'CHARM':
      effect.type = 'status_effect'
      effect.statusEffects = {
        freeze: buff.statType === 'FREEZE',
        stun: buff.statType === 'STUN',
        charm: buff.statType === 'CHARM'
      }
      break
    case 'SHIELD':
    case 'PROTECTION':
      effect.type = 'status_effect'
      effect.statusEffects = { shield: buff.value }
      break
    case 'CLEANSE':
      effect.type = 'status_effect'
      effect.statusEffects = { cleanse: true }
      break
    case 'ALL_STATS':
      effect.statModifiers = {
        attack: buff.value,
        defense: buff.value,
        speed: buff.value,
        magicAttack: buff.value,
        magicDefense: buff.value
      }
      break
  }

  return effect
}

export function getBuffApplicationRule(statType: DbStatType): BuffApplicationRule {
  return BUFF_APPLICATION_RULES[statType] || {
    stackable: false,
    maxStacks: 1,
    overrideRule: 'replace'
  }
}