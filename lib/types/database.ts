// Supabase Database Types

export interface DbUserProfile {
  id: number
  created_at: string
  updated_at: string
  name: string | null
  points: number | null
  total_gatcha: number | null
  uid: string
  status: string
  verified_at: string | null
}

export interface DbMonster {
  id: number
  created_at: string
  updated_at: string
  name: string | null
  image: string | null
  type: string | null
  rarity: string | null
}

export interface DbMonsterStats {
  id: number
  created_at: string
  updated_at: string
  monster_id: number | null
  hp: number | null
  mp: number | null
  atk: number | null
  def: number | null
  magic_def: number | null
  spd: number | null
  crit: number | null
  crit_dmg_percent: number | null
}

export interface DbUserMonster {
  id: number
  created_at: string
  updated_at: string
  user_id: number | null
  monster_id: number | null
  total_count: number | null
}

// Joined types for queries
export interface MonsterWithStats {
  monster: DbMonster
  stats: DbMonsterStats | null
}

export interface UserMonsterWithDetails {
  userMonster: DbUserMonster
  monster: DbMonster
  stats: DbMonsterStats | null
}

// Skill and Buff Tables
export interface DbSkill {
  id: number
  created_at: string
  updated_at: string
  name: string | null
  description: string | null
  cooldown: number | null
  target_type: string | null
  damage: number | null
  skill_type: string | null
}

export interface DbBuff {
  id: number
  created_at: string
  updated_at: string
  name: string | null
  description: string | null
  value: number | null
  stat_type: string | null
  remain_turn: number | null
  target_type: string | null
}

// Relationship Tables
export interface DbMonsterSkill {
  monster_id: number
  created_at: string
  updated_at: string
  skill_1: number | null
  skill_2: number | null
  skill_3: number | null
  skill_4: number | null
}

export interface DbSkillBuff {
  id: number
  created_at: string
  updated_at: string
  skill_id: number | null
  buff_id: number | null
  apply_chance: number | null // 0.0 - 1.0
}

// Joined types for skill queries
export interface SkillWithBuffs {
  skill: DbSkill
  buffs: DbBuff[]
}

export interface MonsterWithSkills {
  monster: DbMonster
  stats: DbMonsterStats | null
  skills: DbSkill[]
}