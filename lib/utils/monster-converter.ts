import type { Monster, MonsterRarity, Skill } from "@/lib/monsters"
import { SKILLS } from "@/lib/monsters"
import type { DbMonster, DbMonsterStats, MonsterWithStats, UserMonsterWithDetails } from "@/lib/types/database"
import { getMonsterSkills } from "@/lib/skills/skills-service"
import { convertDbSkillsToGameSkills } from "@/lib/skills/skill-converter"

/**
 * DB에서 몬스터 스킬을 조회합니다 (비동기)
 */
async function getSkillsForMonsterFromDB(monsterId: number): Promise<Skill[]> {
  try {
    const dbSkills = await getMonsterSkills(monsterId)
    if (dbSkills.length > 0) {
      return convertDbSkillsToGameSkills(dbSkills)
    }
  } catch (error) {
    console.warn(`DB에서 몬스터 ${monsterId} 스킬 조회 실패, 폴백 사용:`, error)
  }
  
  // 폴백: 하드코딩된 스킬 매핑
  return getHardcodedSkillsForMonster(monsterId)
}

/**
 * 하드코딩된 스킬 매핑 (폴백용)
 */
function getHardcodedSkillsForMonster(monsterId: number): Skill[] {
  // 몬스터별 스킬 매핑 (기존 MONSTER_DATA와 동일하게 설정)
  const skillMapping: Record<number, string[]> = {
    // Common monsters (ID 1-7로 가정)
    1: ["flame_burst", "heal_light", "quick_dodge", "earth_shield"], // fire_pup
    2: ["water_splash", "heal_light", "quick_dodge", "earth_shield"], // water_cat
    3: ["heal_light", "flame_burst", "water_splash", "quick_dodge"], // grass_bunny
    4: ["earth_shield", "heal_light", "water_splash", "quick_dodge"], // rock_turtle
    5: ["quick_dodge", "flame_burst", "water_splash", "heal_light"], // wind_bird
    6: ["flame_burst", "quick_dodge", "heal_light", "earth_shield"], // electric_mouse
    7: ["water_splash", "heal_light", "quick_dodge", "earth_shield"], // ice_fox
    
    // Rare monsters (ID 8-11로 가정)
    8: ["lightning_storm", "heal_medium", "ice_spear", "shadow_step"], // flame_wolf
    9: ["heal_medium", "lightning_storm", "ice_spear", "shadow_step"], // crystal_bear
    10: ["shadow_step", "lightning_storm", "heal_medium", "ice_spear"], // storm_eagle
    11: ["ice_spear", "heal_medium", "lightning_storm", "shadow_step"], // frost_tiger
    
    // Unique monsters (ID 12-14로 가정)
    12: ["dragon_claw", "divine_heal", "meteor_strike", "shadow_step"], // shadow_dragon
    13: ["divine_heal", "meteor_strike", "dragon_claw", "lightning_storm"], // light_phoenix
    14: ["meteor_strike", "dragon_claw", "divine_heal", "ice_spear"], // void_leviathan
  }
  
  const skillIds = skillMapping[monsterId] || ["flame_burst", "heal_light", "quick_dodge", "earth_shield"]
  return skillIds.map(id => SKILLS[id]).filter(skill => skill !== undefined)
}

/**
 * 동기적 스킬 조회 (즉시 사용, 폴백만 사용)
 */
function getSkillsForMonster(monsterId: number): Skill[] {
  return getHardcodedSkillsForMonster(monsterId)
}

/**
 * DB의 rarity 문자열을 게임의 MonsterRarity 타입으로 변환
 */
function convertRarity(dbRarity: string | null): MonsterRarity {
  const rarityMap: Record<string, MonsterRarity> = {
    "common": "common",
    "일반": "common",
    "rare": "rare",
    "희귀": "rare",
    "unique": "unique",
    "유니크": "unique",
  }
  
  return rarityMap[dbRarity?.toLowerCase() || ""] || "common"
}

/**
 * DB 몬스터 데이터를 게임 Monster 타입으로 변환
 */
export function convertToGameMonster(
  dbMonster: DbMonster,
  dbStats: DbMonsterStats | null,
  instanceId?: string
): Monster {
  // 기본 스탯 값 설정 (스탯이 없는 경우를 대비)
  const defaultStats = {
    hp: 100,
    atk: 20,
    def: 10,
    magic_def: 10,
    spd: 10,
    crit: 5,
    crit_dmg_percent: 150
  }
  
  const stats = dbStats || defaultStats
  const hp = stats.hp || defaultStats.hp
  const attack = stats.atk || defaultStats.atk
  
  return {
    id: instanceId || `${dbMonster.id}_${Date.now()}`,
    name: dbMonster.name || "Unknown Monster",
    image: dbMonster.image || "/default-monster.png",
    type: dbMonster.type || "normal",
    rarity: convertRarity(dbMonster.rarity),
    hp: hp,
    maxHp: hp,
    attack: attack,
    skills: getSkillsForMonster(dbMonster.id),
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  }
}

/**
 * MonsterWithStats를 게임 Monster 타입으로 변환
 */
export function convertMonsterWithStats(data: MonsterWithStats): Monster {
  return convertToGameMonster(data.monster, data.stats)
}

/**
 * UserMonsterWithDetails를 게임 Monster 배열로 변환
 * total_count를 고려하여 여러 인스턴스를 생성할 수 있습니다
 */
export function convertUserMonstersToGameMonsters(
  userMonsters: UserMonsterWithDetails[]
): Monster[] {
  const monsters: Monster[] = []
  
  for (const data of userMonsters) {
    const count = data.userMonster.total_count || 1
    
    // total_count만큼 몬스터 인스턴스 생성
    for (let i = 0; i < count; i++) {
      const instanceId = `${data.monster.id}_user_${data.userMonster.id}_${i}`
      monsters.push(convertToGameMonster(data.monster, data.stats, instanceId))
    }
  }
  
  return monsters
}

/**
 * 마스터 몬스터 데이터를 게임 Monster 배열로 변환 (컬렉션 미리보기용)
 */
export function convertAllMonstersToGameFormat(
  monstersWithStats: MonsterWithStats[]
): Monster[] {
  return monstersWithStats.map(data => convertMonsterWithStats(data))
}

/**
 * DB 몬스터 데이터를 게임 Monster 타입으로 변환 (비동기, DB 스킬 포함)
 */
export async function convertToGameMonsterWithDBSkills(
  dbMonster: DbMonster,
  dbStats: DbMonsterStats | null,
  instanceId?: string
): Promise<Monster> {
  // 기본 스탯 값 설정 (스탯이 없는 경우를 대비)
  const defaultStats = {
    hp: 100,
    atk: 20,
    def: 10,
    magic_def: 10,
    spd: 10,
    crit: 5,
    crit_dmg_percent: 150
  }
  
  const stats = dbStats || defaultStats
  const hp = stats.hp || defaultStats.hp
  const attack = stats.atk || defaultStats.atk
  
  // DB에서 스킬 조회 (비동기)
  const skills = await getSkillsForMonsterFromDB(dbMonster.id)
  
  return {
    id: instanceId || `${dbMonster.id}_${Date.now()}`,
    name: dbMonster.name || "Unknown Monster",
    image: dbMonster.image || "/default-monster.png",
    type: dbMonster.type || "normal",
    rarity: convertRarity(dbMonster.rarity),
    hp: hp,
    maxHp: hp,
    attack: attack,
    skills: skills,
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  }
}

/**
 * UserMonsterWithDetails를 게임 Monster 배열로 변환 (비동기, DB 스킬 포함)
 */
export async function convertUserMonstersToGameMonstersWithDBSkills(
  userMonsters: UserMonsterWithDetails[]
): Promise<Monster[]> {
  const monsters: Monster[] = []
  
  for (const data of userMonsters) {
    const count = data.userMonster.total_count || 1
    
    // total_count만큼 몬스터 인스턴스 생성
    for (let i = 0; i < count; i++) {
      const instanceId = `${data.monster.id}_user_${data.userMonster.id}_${i}`
      const monster = await convertToGameMonsterWithDBSkills(data.monster, data.stats, instanceId)
      monsters.push(monster)
    }
  }
  
  return monsters
}

/**
 * 마스터 몬스터 데이터를 게임 Monster 배열로 변환 (비동기, DB 스킬 포함)
 */
export async function convertAllMonstersToGameFormatWithDBSkills(
  monstersWithStats: MonsterWithStats[]
): Promise<Monster[]> {
  const monsters: Monster[] = []
  
  for (const data of monstersWithStats) {
    const monster = await convertToGameMonsterWithDBSkills(data.monster, data.stats)
    monsters.push(monster)
  }
  
  return monsters
}