import { create } from 'zustand'
import { 
  getCurrentUserMonsters, 
  getAllMonstersWithStats 
} from '@/lib/supabase/monsters-service'
import { 
  getGachaRates, 
  getPityCount, 
  performGachaWithPity, 
  getUserPoints 
} from '@/lib/supabase/gacha-service'
import type { 
  MonsterWithStats, 
  UserMonsterWithDetails, 
  DbGachaRate 
} from '@/lib/types/database'
import type { Monster } from '@/lib/monsters'

interface GameState {
  // Collection State
  collection: Monster[]
  isLoadingCollection: boolean
  collectionError: string | null
  
  // Gacha State
  userPoints: number
  pityCount: { rare: number; unique: number }
  gachaRates: { common: number; rare: number; unique: number }
  gachaRateConfigs: DbGachaRate[]
  isLoadingGacha: boolean
  gachaError: string | null

  // Actions
  loadCollection: () => Promise<void>
  loadGachaData: () => Promise<void>
  performGachaPullFromDB: () => Promise<Monster | null>
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  collection: [],
  isLoadingCollection: false,
  collectionError: null,
  
  userPoints: 0,
  pityCount: { rare: 0, unique: 0 },
  gachaRates: { common: 0.7, rare: 0.25, unique: 0.05 },
  gachaRateConfigs: [],
  isLoadingGacha: false,
  gachaError: null,

  // Actions
  loadCollection: async () => {
    set({ isLoadingCollection: true, collectionError: null })
    try {
      const userMonsters = await getCurrentUserMonsters()
      
      // Convert DB format to App format
      const monsters: Monster[] = userMonsters.map(um => ({
        id: um.monster.id.toString(), // Convert number ID to string for app compatibility if needed, or keep as number if types allow. 
        // Note: The app uses string IDs in local data but number in DB. 
        // We'll adapt the Monster type in lib/monsters.ts to match DB or vice versa.
        // For now, let's assume we map DB fields to the Monster interface.
        // Checking lib/monsters.ts, Monster.id is string. DbMonster.id is number.
        // We should probably unify this, but for now casting to string.
        name: um.monster.name || 'Unknown',
        image: um.monster.image || '',
        type: um.monster.type || 'normal',
        rarity: (um.monster.rarity as any) || 'common',
      }))

      set({ collection: monsters, isLoadingCollection: false })
    } catch (error) {
      console.error('Failed to load collection:', error)
      set({ 
        collectionError: 'Failed to load collection', 
        isLoadingCollection: false 
      })
    }
  },

  loadGachaData: async () => {
    set({ isLoadingGacha: true, gachaError: null })
    try {
      const [rates, pity, points] = await Promise.all([
        getGachaRates(),
        getPityCount(),
        getUserPoints()
      ])

      // Calculate simple rates for UI
      const commonRate = rates.find(r => r.rarity.toLowerCase() === 'common')?.rate || 0.7
      const rareRate = rates.find(r => r.rarity.toLowerCase() === 'rare')?.rate || 0.25
      const uniqueRate = rates.find(r => r.rarity.toLowerCase() === 'unique')?.rate || 0.05

      set({
        gachaRateConfigs: rates,
        gachaRates: { common: commonRate, rare: rareRate, unique: uniqueRate },
        pityCount: pity,
        userPoints: points,
        isLoadingGacha: false
      })
    } catch (error) {
      console.error('Failed to load gacha data:', error)
      set({ 
        gachaError: 'Failed to load gacha data', 
        isLoadingGacha: false 
      })
    }
  },

  performGachaPullFromDB: async () => {
    set({ isLoadingGacha: true, gachaError: null })
    try {
      const result = await performGachaWithPity()
      
      // Update local state
      const newMonster: Monster = {
        id: result.monster.id.toString(),
        name: result.monster.name || 'Unknown',
        image: result.monster.image || '',
        type: result.monster.type || 'normal',
        rarity: (result.monster.rarity as any) || 'common',
      }

      set(state => ({
        userPoints: result.remainedPoints,
        pityCount: { ...state.pityCount, unique: result.pityCount }, // Update only unique for now as per API return
        collection: [...state.collection, newMonster],
        isLoadingGacha: false
      }))

      return newMonster
    } catch (error) {
      console.error('Gacha failed:', error)
      set({ 
        gachaError: error instanceof Error ? error.message : 'Gacha failed', 
        isLoadingGacha: false 
      })
      return null
    }
  }
}))
