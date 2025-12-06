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
  // stats removed
}

export interface UserMonsterWithDetails {
  userMonster: DbUserMonster
  monster: DbMonster
  // stats removed
}

// Season System Tables
export interface DbSeason {
  id: number
  created_at: string
  updated_at: string | null
  season_number: number | null
  start_date: string | null // YYYY-MM-DD
  end_date: string | null // YYYY-MM-DD
  week_count: number | null
  is_active: boolean | null
}

// Certification System Tables
export interface DbCertification {
  id: number
  created_at: string
  updated_at: string | null
  season_id: number | null
  user_id: number | null
  week_number: number | null
  content: string | null
  certification_date: string | null // YYYY-MM-DD
}

// Gacha System Tables
export interface DbGachaRate {
  id: number
  created_at: string
  updated_at: string
  rate: number // 0.0 - 1.0
  guaranteed_count: number | null
  rarity: string
}

export interface DbGachaHistory {
  id: number
  created_at: string
  updated_at: string
  user_id: number | null
  monster_id: number | null
  used_points: number | null
  remained_points: number | null
}

// Gacha Result Types
export interface GachaResult {
  monster: DbMonster
  usedPoints: number
  remainedPoints: number
  wasGuaranteed: boolean
  pityCount: number // 천장까지 남은 횟수
}