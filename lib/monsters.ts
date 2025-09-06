export type MonsterRarity = "common" | "rare" | "unique"

export type SkillType = "heal" | "wide_attack" | "strong_attack" | "dodge" | "block"

export type ElementType = "physical" | "fire" | "water" | "grass" | "ice" | "light" | "electric" | "shadow" | "wind" | "earth"

export type AnimationType = "slash" | "impact" | "burst" | "beam" | "storm" | "explosion" | "wave" | "sparkle" | "glow"

export interface Skill {
  id: string
  name: string
  type: SkillType
  damage?: number
  healAmount?: number
  range: number // 1 = single target, 3 = 3x1 line, 9 = all
  cooldown: number
  description: string
  dodgeChance?: number // 회피 스킬의 확률 (0.0-1.0)
  blockReduction?: number // 막기 스킬의 데미지 감소율 (0.0-1.0)
  elementType?: ElementType // 엘리멘탈 타입
  animationType?: AnimationType // 애니메이션 타입
}

export interface Monster {
  id: string
  name: string
  image: string
  type: string
  rarity: MonsterRarity
  hp: number
  maxHp: number
  attack: number
  skills: Skill[] // 단일 스킬에서 4개 스킬 배열로 변경
  skillCooldowns: number[] // 각 스킬별 쿨다운 배열
  dodgeNextAttack?: boolean
  blockNextAttack?: boolean
  dodgeChance?: number // 다음 회피 확률 (0.0-1.0)
  blockReduction?: number // 다음 막기 데미지 감소율 (0.0-1.0)
}

// Predefined skills
export const SKILLS: Record<string, Skill> = {
  // Common skills
  heal_light: {
    id: "heal_light",
    name: "가벼운 치유",
    type: "heal",
    healAmount: 30,
    range: 1,
    cooldown: 3,
    description: "자신의 체력을 30 회복합니다.",
    elementType: "light",
    animationType: "glow",
  },
  flame_burst: {
    id: "flame_burst",
    name: "화염 폭발",
    type: "wide_attack",
    damage: 25,
    range: 3,
    cooldown: 3,
    description: "앞쪽 3칸에 25 데미지를 입힙니다.",
    elementType: "fire",
    animationType: "explosion",
  },
  water_splash: {
    id: "water_splash",
    name: "물 튀기기",
    type: "strong_attack",
    damage: 40,
    range: 1,
    cooldown: 3,
    description: "단일 대상에 40 데미지를 입힙니다.",
    elementType: "water",
    animationType: "wave",
  },
  quick_dodge: {
    id: "quick_dodge",
    name: "빠른 회피",
    type: "dodge",
    range: 1,
    cooldown: 3,
    description: "다음 공격을 50% 확률로 회피합니다.",
    dodgeChance: 0.5,
    elementType: "wind",
    animationType: "sparkle",
  },
  earth_shield: {
    id: "earth_shield",
    name: "대지의 방패",
    type: "block",
    range: 1,
    cooldown: 3,
    description: "다음 공격의 데미지를 50% 감소시킵니다.",
    blockReduction: 0.5,
    elementType: "earth",
    animationType: "glow",
  },

  // Rare skills
  heal_medium: {
    id: "heal_medium",
    name: "중간 치유",
    type: "heal",
    healAmount: 50,
    range: 1,
    cooldown: 3,
    description: "자신의 체력을 50 회복합니다.",
    elementType: "light",
    animationType: "glow",
  },
  lightning_storm: {
    id: "lightning_storm",
    name: "번개 폭풍",
    type: "wide_attack",
    damage: 35,
    range: 9,
    cooldown: 3,
    description: "모든 적에게 35 데미지를 입힙니다.",
    elementType: "electric",
    animationType: "storm",
  },
  ice_spear: {
    id: "ice_spear",
    name: "얼음 창",
    type: "strong_attack",
    damage: 60,
    range: 1,
    cooldown: 3,
    description: "단일 대상에 60 데미지를 입힙니다.",
    elementType: "ice",
    animationType: "beam",
  },
  shadow_step: {
    id: "shadow_step",
    name: "그림자 걸음",
    type: "dodge",
    range: 1,
    cooldown: 3,
    description: "다음 공격을 70% 확률로 회피합니다.",
    dodgeChance: 0.7,
    elementType: "shadow",
    animationType: "sparkle",
  },

  // Unique skills
  divine_heal: {
    id: "divine_heal",
    name: "신성한 치유",
    type: "heal",
    healAmount: 80,
    range: 1,
    cooldown: 3,
    description: "자신의 체력을 80 회복합니다.",
    elementType: "light",
    animationType: "sparkle",
  },
  meteor_strike: {
    id: "meteor_strike",
    name: "유성 낙하",
    type: "wide_attack",
    damage: 50,
    range: 9,
    cooldown: 3,
    description: "모든 적에게 50 데미지를 입힙니다.",
    elementType: "fire",
    animationType: "explosion",
  },
  dragon_claw: {
    id: "dragon_claw",
    name: "용의 발톱",
    type: "strong_attack",
    damage: 85,
    range: 1,
    cooldown: 3,
    description: "단일 대상에 85 데미지를 입힙니다.",
    elementType: "shadow",
    animationType: "slash",
  },
}

// Predefined monsters
export const MONSTER_DATA: Monster[] = [
  // Common monsters (7)
  {
    id: "fire_pup",
    name: "파이어 또몬",
    image: "/cute-fire-puppy-pokemon-style.png",
    type: "fire",
    rarity: "common",
    hp: 120,
    maxHp: 120,
    attack: 20,
    skills: [SKILLS.flame_burst, SKILLS.heal_light, SKILLS.quick_dodge, SKILLS.earth_shield],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "water_cat",
    name: "워터 또몬",
    image: "/cute-water-cat-pokemon-style.png",
    type: "water",
    rarity: "common",
    hp: 110,
    maxHp: 110,
    attack: 22,
    skills: [SKILLS.water_splash, SKILLS.heal_light, SKILLS.quick_dodge, SKILLS.earth_shield],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "grass_bunny",
    name: "그래스 또몬",
    image: "/cute-grass-bunny-pokemon-style.png",
    type: "grass",
    rarity: "common",
    hp: 130,
    maxHp: 130,
    attack: 18,
    skills: [SKILLS.heal_light, SKILLS.flame_burst, SKILLS.water_splash, SKILLS.quick_dodge],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "rock_turtle",
    name: "록 또몬",
    image: "/cute-rock-turtle-pokemon-style.png",
    type: "rock",
    rarity: "common",
    hp: 150,
    maxHp: 150,
    attack: 15,
    skills: [SKILLS.earth_shield, SKILLS.heal_light, SKILLS.water_splash, SKILLS.quick_dodge],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "wind_bird",
    name: "윈드 또몬",
    image: "/cute-wind-bird-pokemon-style.png",
    type: "wind",
    rarity: "common",
    hp: 100,
    maxHp: 100,
    attack: 25,
    skills: [SKILLS.quick_dodge, SKILLS.flame_burst, SKILLS.water_splash, SKILLS.heal_light],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "electric_mouse",
    name: "일렉트릭 또몬",
    image: "/cute-electric-mouse-pokemon-style.png",
    type: "electric",
    rarity: "common",
    hp: 105,
    maxHp: 105,
    attack: 24,
    skills: [SKILLS.flame_burst, SKILLS.quick_dodge, SKILLS.heal_light, SKILLS.earth_shield],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "ice_fox",
    name: "아이스 또몬",
    image: "/cute-ice-fox-pokemon-style.png",
    type: "ice",
    rarity: "common",
    hp: 115,
    maxHp: 115,
    attack: 21,
    skills: [SKILLS.water_splash, SKILLS.heal_light, SKILLS.quick_dodge, SKILLS.earth_shield],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },

  // Rare monsters (4)
  {
    id: "flame_wolf",
    name: "플레임 또몬",
    image: "/majestic-flame-wolf-pokemon-style.png",
    type: "fire",
    rarity: "rare",
    hp: 180,
    maxHp: 180,
    attack: 30,
    skills: [SKILLS.lightning_storm, SKILLS.heal_medium, SKILLS.ice_spear, SKILLS.shadow_step],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "crystal_bear",
    name: "크리스탈 또몬",
    image: "/crystal-bear-pokemon-style.png",
    type: "crystal",
    rarity: "rare",
    hp: 200,
    maxHp: 200,
    attack: 25,
    skills: [SKILLS.heal_medium, SKILLS.lightning_storm, SKILLS.ice_spear, SKILLS.shadow_step],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "storm_eagle",
    name: "스톰 또몬",
    image: "/storm-eagle-pokemon-style.png",
    type: "storm",
    rarity: "rare",
    hp: 160,
    maxHp: 160,
    attack: 35,
    skills: [SKILLS.shadow_step, SKILLS.lightning_storm, SKILLS.heal_medium, SKILLS.ice_spear],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "frost_tiger",
    name: "프로스트 또몬",
    image: "/frost-tiger-pokemon-style.png",
    type: "frost",
    rarity: "rare",
    hp: 170,
    maxHp: 170,
    attack: 32,
    skills: [SKILLS.ice_spear, SKILLS.heal_medium, SKILLS.lightning_storm, SKILLS.shadow_step],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },

  // Unique monsters (3)
  {
    id: "shadow_dragon",
    name: "섀도우 또몬",
    image: "/shadow-dragon-pokemon-style-legendary.png",
    type: "shadow",
    rarity: "unique",
    hp: 250,
    maxHp: 250,
    attack: 40,
    skills: [SKILLS.dragon_claw, SKILLS.divine_heal, SKILLS.meteor_strike, SKILLS.shadow_step],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "light_phoenix",
    name: "라이트 또몬",
    image: "/light-phoenix-pokemon-style-legendary.png",
    type: "light",
    rarity: "unique",
    hp: 220,
    maxHp: 220,
    attack: 45,
    skills: [SKILLS.divine_heal, SKILLS.meteor_strike, SKILLS.dragon_claw, SKILLS.lightning_storm],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
  {
    id: "void_leviathan",
    name: "보이드 또몬",
    image: "/void-leviathan-pokemon-style-legendary.png",
    type: "void",
    rarity: "unique",
    hp: 230,
    maxHp: 230,
    attack: 42,
    skills: [SKILLS.meteor_strike, SKILLS.dragon_claw, SKILLS.divine_heal, SKILLS.ice_spear],
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  },
]

// Gacha probabilities
export const GACHA_RATES = {
  common: 0.7, // 70%
  rare: 0.25, // 25%
  unique: 0.05, // 5%
}

// Helper functions
export function getMonstersByRarity(rarity: MonsterRarity): Monster[] {
  return MONSTER_DATA.filter((monster) => monster.rarity === rarity)
}

export function createMonsterInstance(monsterId: string): Monster {
  const template = MONSTER_DATA.find((m) => m.id === monsterId)
  if (!template) throw new Error(`Monster ${monsterId} not found`)

  return {
    ...template,
    hp: template.maxHp,
    skillCooldowns: [0, 0, 0, 0],
    dodgeNextAttack: false,
    blockNextAttack: false,
  }
}

export function performGacha(): Monster {
  const random = Math.random()
  let rarity: MonsterRarity

  if (random < GACHA_RATES.unique) {
    rarity = "unique"
  } else if (random < GACHA_RATES.unique + GACHA_RATES.rare) {
    rarity = "rare"
  } else {
    rarity = "common"
  }

  const monstersOfRarity = getMonstersByRarity(rarity)
  const randomMonster = monstersOfRarity[Math.floor(Math.random() * monstersOfRarity.length)]

  return createMonsterInstance(randomMonster.id)
}
