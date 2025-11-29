"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Monster } from "@/lib/monsters"
import { performGacha } from "@/lib/monsters"
import { getAllMonstersWithStats, getCurrentUserMonsters } from "@/lib/supabase/monsters-service"
import { convertAllMonstersToGameFormat, convertUserMonstersToGameMonsters, convertMonsterWithStats, convertUserMonstersToGameMonstersWithDBSkills, convertAllMonstersToGameFormatWithDBSkills } from "@/lib/utils/monster-converter"
import type { MonsterWithStats } from "@/lib/types/database"
import type { DbSkill, DbBuff, DbGachaRate } from "@/lib/types/database"
import { getAllSkillsAndBuffs } from "@/lib/skills/skills-service"
import { performGachaWithPity, getPityCount, getUserPoints, getGachaRates } from "@/lib/supabase/gacha-service"

interface GameStore {
  // Collection management
  collection: Monster[]
  addToCollection: (monster: Monster) => void
  removeFromCollection: (monsterId: string) => void
  
  // Supabase integration
  isLoadingCollection: boolean
  collectionError: string | null
  masterMonsters: MonsterWithStats[]
  loadMonstersFromSupabase: () => Promise<void>
  loadUserMonsters: () => Promise<void>
  loadDemoCollection: () => void
  
  // Skill system
  masterSkills: DbSkill[]
  masterBuffs: DbBuff[]
  isLoadingSkills: boolean
  skillsError: string | null
  loadSkillsFromSupabase: () => Promise<void>

  // Gacha system
  performGachaPull: () => Monster
  performGachaPullFromDB: () => Promise<Monster>
  
  // Gacha state
  userPoints: number
  pityCount: { rare: number; unique: number }
  gachaRates: { common: number; rare: number; unique: number }
  gachaRateConfigs: DbGachaRate[]
  isLoadingGacha: boolean
  gachaError: string | null
  loadGachaData: () => Promise<void>

  // Game state management
  phase: "menu" | "collection" | "gacha"
  setPhase: (phase: GameStore["phase"]) => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      collection: [],
      phase: "menu",
      
      // Supabase integration
      isLoadingCollection: false,
      collectionError: null,
      masterMonsters: [],
      
      // Skill system
      masterSkills: [],
      masterBuffs: [],
      isLoadingSkills: false,
      skillsError: null,
      
      // Gacha system
      userPoints: 0,
      pityCount: { rare: 0, unique: 0 },
      gachaRates: { common: 0.7, rare: 0.25, unique: 0.05 },
      gachaRateConfigs: [],
      isLoadingGacha: false,
      gachaError: null,

      addToCollection: (monster: Monster) => {
        set((state) => ({
          collection: [...state.collection, { ...monster, id: `${monster.id}_${Date.now()}` }],
        }))
      },

      removeFromCollection: (monsterId: string) => {
        set((state) => ({
          collection: state.collection.filter((monster) => monster.id !== monsterId),
        }))
      },

      performGachaPull: () => {
        const newMonster = performGacha()
        get().addToCollection(newMonster)
        return newMonster
      },

      performGachaPullFromDB: async () => {
        set({ isLoadingGacha: true, gachaError: null })
        
        try {
          const gachaResult = await performGachaWithPity()
          
          // DB 몬스터를 게임 몬스터로 변환
          const gameMonster = convertMonsterWithStats({
            monster: gachaResult.monster,
            stats: gachaResult.stats
          })
          
          // 컬렉션에 추가
          get().addToCollection(gameMonster)
          
          // 가챠 상태 업데이트
          set({
            userPoints: gachaResult.remainedPoints,
            pityCount: { rare: gachaResult.pityCount, unique: gachaResult.pityCount },
            isLoadingGacha: false
          })
          
          console.log(`가챠 성공: ${gachaResult.monster.name} (천장: ${gachaResult.wasGuaranteed ? '적용' : '미적용'})`)
          
          return gameMonster
        } catch (error) {
          console.error('가챠 실패:', error)
          set({
            isLoadingGacha: false,
            gachaError: error instanceof Error ? error.message : 'Failed to perform gacha'
          })
          throw error
        }
      },
      
      loadGachaData: async () => {
        set({ isLoadingGacha: true, gachaError: null })
        
        try {
          const [points, pityCount, dbGachaRates] = await Promise.all([
            getUserPoints(),
            getPityCount(),
            getGachaRates()
          ])
          
          // DB 가챠 확률을 객체로 변환
          const gachaRates = { common: 0.7, rare: 0.25, unique: 0.05 } // 기본값
          
          dbGachaRates.forEach(rate => {
            const rarity = rate.rarity.toUpperCase()
            if (rarity === "COMMON") {
              gachaRates.common = rate.rate
            } else if (rarity === "RARE") {
              gachaRates.rare = rate.rate
            } else if (rarity === "UNIQUE") {
              gachaRates.unique = rate.rate
            }
          })
          
          set({
            userPoints: points,
            pityCount: pityCount,
            gachaRates: gachaRates,
            gachaRateConfigs: dbGachaRates,
            isLoadingGacha: false
          })
          
          console.log(`가챠 데이터 로딩 완료:`)
          console.log(`  - 포인트: ${points}`)
          console.log(`  - 천장 카운트: rare ${pityCount.rare}, unique ${pityCount.unique}`)
          console.log(`  - 확률: 일반 ${(gachaRates.common * 100).toFixed(1)}%, 희귀 ${(gachaRates.rare * 100).toFixed(1)}%, 유니크 ${(gachaRates.unique * 100).toFixed(1)}%`)
        } catch (error) {
          console.error('가챠 데이터 로딩 실패:', error)
          set({
            isLoadingGacha: false,
            gachaError: 'Failed to load gacha data'
          })
        }
      },
      
      loadSkillsFromSupabase: async () => {
        set({ isLoadingSkills: true, skillsError: null })
        
        try {
          const { skills, buffs } = await getAllSkillsAndBuffs()
          
          set({ 
            masterSkills: skills,
            masterBuffs: buffs,
            isLoadingSkills: false
          })
          
          console.log(`Loaded ${skills.length} skills and ${buffs.length} buffs from Supabase`)
        } catch (error) {
          console.error('Failed to load skills from Supabase:', error)
          set({ 
            isLoadingSkills: false,
            skillsError: 'Failed to load skill data.'
          })
        }
      },

      loadMonstersFromSupabase: async () => {
        set({ isLoadingCollection: true, collectionError: null })
        
        try {
          // 먼저 스킬 데이터 로딩
          await get().loadSkillsFromSupabase()
          
          const monstersWithStats = await getAllMonstersWithStats()
          
          if (monstersWithStats.length === 0) {
            console.warn('No monsters found in database, using local data')
            set({ 
              isLoadingCollection: false,
              masterMonsters: []
            })
            return
          }
          
          // 마스터 데이터 저장
          set({ 
            masterMonsters: monstersWithStats,
            isLoadingCollection: false
          })
          
          console.log(`Loaded ${monstersWithStats.length} monsters from Supabase`)
          
        } catch (error) {
          console.error('Failed to load monsters from Supabase:', error)
          set({ 
            isLoadingCollection: false,
            collectionError: 'Failed to load monsters. Using local data.'
          })
        }
      },
      
      loadDemoCollection: async () => {
        const state = get()
        const { masterMonsters, masterSkills } = state
        
        if (masterMonsters.length === 0) {
          console.warn('No master monsters available for demo')
          return
        }
        
        set({ isLoadingCollection: true })
        
        try {
          // 스킬 데이터가 없으면 로딩
          if (masterSkills.length === 0) {
            await get().loadSkillsFromSupabase()
          }
          
          // 데모용 몬스터 선택 (각 레어도별로 하나씩 + 추가)
          const selectedMasterMonsters: MonsterWithStats[] = []
          
          // Common 몬스터 2개
          const commonMonsters = masterMonsters.filter(m => 
            m.monster.rarity === 'common' || m.monster.rarity === '일반'
          )
          if (commonMonsters.length > 0) {
            selectedMasterMonsters.push(...commonMonsters.slice(0, 2))
          }
          
          // Rare 몬스터 1개
          const rareMonsters = masterMonsters.filter(m => 
            m.monster.rarity === 'rare' || m.monster.rarity === '희귀'
          )
          if (rareMonsters.length > 0) {
            selectedMasterMonsters.push(rareMonsters[0])
          }
          
          // Unique 몬스터 1개
          const uniqueMonsters = masterMonsters.filter(m => 
            m.monster.rarity === 'unique' || m.monster.rarity === '유니크'
          )
          if (uniqueMonsters.length > 0) {
            selectedMasterMonsters.push(uniqueMonsters[0])
          }
          
          // 최소 3개가 되도록 보장
          if (selectedMasterMonsters.length < 3 && masterMonsters.length >= 3) {
            const additionalNeeded = 3 - selectedMasterMonsters.length
            selectedMasterMonsters.push(...masterMonsters.slice(0, additionalNeeded))
          }
          
          // DB 스킬과 함께 변환 시도
          try {
            const demoMonsters = await convertAllMonstersToGameFormatWithDBSkills(selectedMasterMonsters)
            
            set({ 
              collection: demoMonsters,
              isLoadingCollection: false
            })
            
            console.log(`Created demo collection with ${demoMonsters.length} monsters (with DB skills)`)
          } catch (skillError) {
            console.warn('Failed to load demo with DB skills, using fallback:', skillError)
            // 폴백: 기존 변환 방식
            const demoMonsters = convertAllMonstersToGameFormat(selectedMasterMonsters)
            
            set({ 
              collection: demoMonsters,
              isLoadingCollection: false
            })
            
            console.log(`Created demo collection with ${demoMonsters.length} monsters (fallback skills)`)
          }
        } catch (error) {
          console.error('Failed to load demo collection:', error)
          // 최종 폴백: 하드코딩된 스킬 사용
          const demoMonsters = convertAllMonstersToGameFormat(masterMonsters.slice(0, 4))
          
          set({ 
            collection: demoMonsters,
            isLoadingCollection: false
          })
          
          console.log(`Created demo collection with ${demoMonsters.length} monsters (emergency fallback)`)
        }
      },
      
      loadUserMonsters: async () => {
        set({ isLoadingCollection: true, collectionError: null })
        
        try {
          // 먼저 스킬 데이터가 로드되었는지 확인 후 필요시 로딩
          const state = get()
          if (state.masterSkills.length === 0) {
            await get().loadSkillsFromSupabase()
          }
          
          // 현재 인증된 사용자의 몬스터 조회
          const userMonsters = await getCurrentUserMonsters()
          
          if (userMonsters.length === 0) {
            console.log('User has no monsters yet')
            set({ 
              isLoadingCollection: false,
              collection: []
            })
            return
          }
          
          // DB 데이터를 게임 형식으로 변환 (DB 스킬 포함)
          try {
            const gameMonsters = await convertUserMonstersToGameMonstersWithDBSkills(userMonsters)
            
            set({ 
              collection: gameMonsters,
              isLoadingCollection: false
            })
            
            console.log(`Loaded ${gameMonsters.length} monsters for user with DB skills`)
          } catch (skillError) {
            console.warn('Failed to load with DB skills, using fallback:', skillError)
            // 폴백: 기존 변환 방식 사용
            const gameMonsters = convertUserMonstersToGameMonsters(userMonsters)
            
            set({ 
              collection: gameMonsters,
              isLoadingCollection: false
            })
            
            console.log(`Loaded ${gameMonsters.length} monsters for user with fallback skills`)
          }
        } catch (error) {
          console.error('Failed to load user monsters:', error)
          set({ 
            isLoadingCollection: false,
            collectionError: 'Failed to load your monsters.'
          })
        }
      },

      setPhase: (phase) => {
        set({ phase })
      },

      resetGame: () => {
        set({
          phase: "menu",
        })
      },
    }),
    {
      name: "pokemon-game-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        collection: state.collection,
      }),
    },
  ),
)
