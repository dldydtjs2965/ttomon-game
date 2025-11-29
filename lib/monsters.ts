export type MonsterRarity = "common" | "rare" | "unique"

export interface Monster {
  id: string
  name: string
  image: string
  type: string
  rarity: MonsterRarity
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
  },
  {
    id: "water_cat",
    name: "워터 또몬",
    image: "/cute-water-cat-pokemon-style.png",
    type: "water",
    rarity: "common",
  },
  {
    id: "grass_bunny",
    name: "그래스 또몬",
    image: "/cute-grass-bunny-pokemon-style.png",
    type: "grass",
    rarity: "common",
  },
  {
    id: "rock_turtle",
    name: "록 또몬",
    image: "/cute-rock-turtle-pokemon-style.png",
    type: "rock",
    rarity: "common",
  },
  {
    id: "wind_bird",
    name: "윈드 또몬",
    image: "/cute-wind-bird-pokemon-style.png",
    type: "wind",
    rarity: "common",
  },
  {
    id: "electric_mouse",
    name: "일렉트릭 또몬",
    image: "/cute-electric-mouse-pokemon-style.png",
    type: "electric",
    rarity: "common",
  },
  {
    id: "ice_fox",
    name: "아이스 또몬",
    image: "/cute-ice-fox-pokemon-style.png",
    type: "ice",
    rarity: "common",
  },

  // Rare monsters (4)
  {
    id: "flame_wolf",
    name: "플레임 또몬",
    image: "/majestic-flame-wolf-pokemon-style.png",
    type: "fire",
    rarity: "rare",
  },
  {
    id: "crystal_bear",
    name: "크리스탈 또몬",
    image: "/crystal-bear-pokemon-style.png",
    type: "crystal",
    rarity: "rare",
  },
  {
    id: "storm_eagle",
    name: "스톰 또몬",
    image: "/storm-eagle-pokemon-style.png",
    type: "storm",
    rarity: "rare",
  },
  {
    id: "frost_tiger",
    name: "프로스트 또몬",
    image: "/frost-tiger-pokemon-style.png",
    type: "frost",
    rarity: "rare",
  },

  // Unique monsters (3)
  {
    id: "shadow_dragon",
    name: "섀도우 또몬",
    image: "/shadow-dragon-pokemon-style-legendary.png",
    type: "shadow",
    rarity: "unique",
  },
  {
    id: "light_phoenix",
    name: "라이트 또몬",
    image: "/light-phoenix-pokemon-style-legendary.png",
    type: "light",
    rarity: "unique",
  },
  {
    id: "void_leviathan",
    name: "보이드 또몬",
    image: "/void-leviathan-pokemon-style-legendary.png",
    type: "void",
    rarity: "unique",
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

