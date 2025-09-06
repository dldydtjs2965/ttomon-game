import { createClient } from "@/lib/supabase/client"
import type {
  DbSkill,
  DbBuff,
  DbMonsterSkill,
  DbSkillBuff,
  SkillWithBuffs,
  MonsterWithSkills
} from "@/lib/types/database"

/**
 * 모든 스킬 마스터 데이터를 가져옵니다
 */
export async function getAllSkills(): Promise<DbSkill[]> {
  const supabase = createClient()
  
  try {
    const { data: skills, error } = await supabase
      .from("skills")
      .select("*")
      .order("id")
    
    if (error) {
      console.error("Error fetching skills:", error)
      throw error
    }
    
    return skills || []
  } catch (error) {
    console.error("Failed to fetch skills:", error)
    return []
  }
}

/**
 * 모든 버프 마스터 데이터를 가져옵니다
 */
export async function getAllBuffs(): Promise<DbBuff[]> {
  const supabase = createClient()
  
  try {
    const { data: buffs, error } = await supabase
      .from("buffs")
      .select("*")
      .order("id")
    
    if (error) {
      console.error("Error fetching buffs:", error)
      throw error
    }
    
    return buffs || []
  } catch (error) {
    console.error("Failed to fetch buffs:", error)
    return []
  }
}

/**
 * 특정 몬스터의 스킬들을 가져옵니다 (4개 스킬)
 */
export async function getMonsterSkills(monsterId: number): Promise<DbSkill[]> {
  const supabase = createClient()
  
  try {
    // monster_skills 테이블에서 해당 몬스터의 스킬 ID들 조회
    const { data: monsterSkill, error: monsterSkillError } = await supabase
      .from("monster_skills")
      .select("skill_1, skill_2, skill_3, skill_4")
      .eq("monster_id", monsterId)
      .maybeSingle()
    
    if (monsterSkillError) {
      console.error("Error fetching monster skills:", monsterSkillError)
      throw monsterSkillError
    }
    
    if (!monsterSkill) {
      console.log(`No skills found for monster ${monsterId}`)
      return []
    }
    
    // null이 아닌 스킬 ID들 수집 (순서 유지)
    const skillIds: number[] = []
    if (monsterSkill.skill_1) skillIds.push(monsterSkill.skill_1)
    if (monsterSkill.skill_2) skillIds.push(monsterSkill.skill_2)
    if (monsterSkill.skill_3) skillIds.push(monsterSkill.skill_3)
    if (monsterSkill.skill_4) skillIds.push(monsterSkill.skill_4)
    
    if (skillIds.length === 0) {
      return []
    }
    
    // 스킬 ID들로 실제 스킬 데이터 조회
    const { data: skills, error: skillsError } = await supabase
      .from("skills")
      .select("*")
      .in("id", skillIds)
    
    if (skillsError) {
      console.error("Error fetching skills data:", skillsError)
      throw skillsError
    }
    
    // 원래 순서대로 정렬 (skill_1, skill_2, skill_3, skill_4 순서)
    const orderedSkills: DbSkill[] = []
    const skillMap = new Map(skills?.map(s => [s.id, s]) || [])
    
    if (monsterSkill.skill_1) {
      const skill = skillMap.get(monsterSkill.skill_1)
      if (skill) orderedSkills.push(skill)
    }
    if (monsterSkill.skill_2) {
      const skill = skillMap.get(monsterSkill.skill_2)
      if (skill) orderedSkills.push(skill)
    }
    if (monsterSkill.skill_3) {
      const skill = skillMap.get(monsterSkill.skill_3)
      if (skill) orderedSkills.push(skill)
    }
    if (monsterSkill.skill_4) {
      const skill = skillMap.get(monsterSkill.skill_4)
      if (skill) orderedSkills.push(skill)
    }
    
    return orderedSkills
  } catch (error) {
    console.error("Failed to fetch monster skills:", error)
    return []
  }
}

/**
 * 특정 스킬이 적용하는 버프들을 가져옵니다
 */
export async function getSkillBuffs(skillId: number): Promise<DbBuff[]> {
  const supabase = createClient()
  
  try {
    // skill_buffs 관계 테이블을 통해 버프 조회
    const { data: skillBuffs, error: relationError } = await supabase
      .from("skill_buffs")
      .select("buff_id, apply_chance")
      .eq("skill_id", skillId)
    
    if (relationError) {
      console.error("Error fetching skill buffs relation:", relationError)
      throw relationError
    }
    
    if (!skillBuffs || skillBuffs.length === 0) {
      return []
    }
    
    // 버프 ID들로 실제 버프 데이터 조회
    const buffIds = skillBuffs
      .map(sb => sb.buff_id)
      .filter((id): id is number => id !== null)
    
    const { data: buffs, error: buffsError } = await supabase
      .from("buffs")
      .select("*")
      .in("id", buffIds)
    
    if (buffsError) {
      console.error("Error fetching buffs data:", buffsError)
      throw buffsError
    }
    
    return buffs || []
  } catch (error) {
    console.error("Failed to fetch skill buffs:", error)
    return []
  }
}

/**
 * 스킬과 연관된 버프들을 함께 조회합니다
 */
export async function getSkillWithBuffs(skillId: number): Promise<SkillWithBuffs | null> {
  const supabase = createClient()
  
  try {
    // 스킬 데이터 조회
    const { data: skill, error: skillError } = await supabase
      .from("skills")
      .select("*")
      .eq("id", skillId)
      .single()
    
    if (skillError) {
      console.error("Error fetching skill:", skillError)
      return null
    }
    
    // 연관된 버프들 조회
    const buffs = await getSkillBuffs(skillId)
    
    return {
      skill,
      buffs
    }
  } catch (error) {
    console.error("Failed to fetch skill with buffs:", error)
    return null
  }
}

/**
 * 몬스터와 해당 몬스터의 스킬들을 함께 조회합니다
 */
export async function getMonsterWithSkills(monsterId: number): Promise<MonsterWithSkills | null> {
  const supabase = createClient()
  
  try {
    // 몬스터 기본 정보 조회
    const { data: monster, error: monsterError } = await supabase
      .from("monsters")
      .select("*")
      .eq("id", monsterId)
      .single()
    
    if (monsterError) {
      console.error("Error fetching monster:", monsterError)
      return null
    }
    
    // 몬스터 스탯 조회
    const { data: stats, error: statsError } = await supabase
      .from("monster_stats")
      .select("*")
      .eq("monster_id", monsterId)
      .maybeSingle()
    
    if (statsError) {
      console.error("Error fetching monster stats:", statsError)
    }
    
    // 몬스터 스킬들 조회
    const skills = await getMonsterSkills(monsterId)
    
    return {
      monster,
      stats: stats || null,
      skills
    }
  } catch (error) {
    console.error("Failed to fetch monster with skills:", error)
    return null
  }
}

/**
 * 모든 스킬과 버프 마스터 데이터를 함께 조회합니다 (초기 로딩용)
 */
export async function getAllSkillsAndBuffs(): Promise<{
  skills: DbSkill[]
  buffs: DbBuff[]
}> {
  try {
    const [skills, buffs] = await Promise.all([
      getAllSkills(),
      getAllBuffs()
    ])
    
    return { skills, buffs }
  } catch (error) {
    console.error("Failed to fetch skills and buffs:", error)
    return { skills: [], buffs: [] }
  }
}