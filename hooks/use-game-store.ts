"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Monster } from "@/lib/monsters"
import type { GameAction } from "@/lib/game-state"
import { performGacha } from "@/lib/monsters"
import { generateEnemyMonster, generateEnemyAction, executeTurn, executeSequentialTurn, executeActionDry, type TurnResult, type ActionExecutionResult } from "@/lib/battle-engine"
import { getAllMonstersWithStats, getCurrentUserMonsters } from "@/lib/supabase/monsters-service"
import { convertAllMonstersToGameFormat, convertUserMonstersToGameMonsters, convertMonsterWithStats, convertUserMonstersToGameMonstersWithDBSkills, convertAllMonstersToGameFormatWithDBSkills } from "@/lib/utils/monster-converter"
import type { MonsterWithStats } from "@/lib/types/database"
import type { DbSkill, DbBuff, GachaResult } from "@/lib/types/database"
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
  gachaRateConfigs: DbGachaRate[] // DB에서 가져온 원본 설정 (guaranteed_count 포함)
  isLoadingGacha: boolean
  gachaError: string | null
  loadGachaData: () => Promise<void>

  // Game state management
  phase: "menu" | "collection" | "monster-select" | "battle" | "result"
  setPhase: (phase: GameStore["phase"]) => void
  resetGame: () => void

  // Battle system - 1vs1
  playerMonster: Monster | null
  enemyMonster: Monster | null
  playerTeam: Monster[]
  currentPlayerIndex: number
  setupBattle: (playerTeam: Monster[]) => void

  // Pokémon Rogue-like stats
  defeatedEnemies: number
  currentWinStreak: number
  bestWinStreak: number

  // Battle state
  playerTurn: boolean
  turnCount: number
  winner: "player" | "enemy" | null
  lastTurnResult: TurnResult | null

  // Simultaneous action selection
  battlePhase: "selection" | "resolution" | "completed"
  playerSelectedAction: (GameAction & { skillIndex?: number }) | null
  enemySelectedAction: (GameAction & { skillIndex?: number }) | null

  // Turn execution state
  isExecutingTurn: boolean
  currentTurnSequence: Array<{
    actor: "player" | "enemy"
    result: ActionExecutionResult | null
  }> | null
  sequenceStep: number

  // Battle actions
  executeBattleTurn: (playerAction: GameAction & { skillIndex?: number }) => TurnResult
  executeSequentialTurn: (playerAction: GameAction & { skillIndex?: number }) => Promise<void>
  executeEnemyTurn: () => Promise<void>
  
  // Animation control
  applyActionResult: (result: ActionExecutionResult, actor: "player" | "enemy") => void

  switchToNextMonster: () => void
  
  // Simultaneous action selection
  selectPlayerAction: (action: GameAction & { skillIndex?: number }) => void
  resolveSimultaneousTurn: () => Promise<void>
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      collection: [],
      phase: "menu",
      playerMonster: null,
      enemyMonster: null,
      playerTeam: [],
      currentPlayerIndex: 0,
      playerTurn: true,
      turnCount: 1,
      winner: null,
      lastTurnResult: null,
      isExecutingTurn: false,
      currentTurnSequence: null,
      sequenceStep: 0,
      battlePhase: "selection",
      playerSelectedAction: null,
      enemySelectedAction: null,
      
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
      gachaRates: { common: 0.7, rare: 0.25, unique: 0.05 }, // 기본값
      gachaRateConfigs: [], // DB 원본 설정
      isLoadingGacha: false,
      gachaError: null,
      
      // Pokémon Rogue-like stats
      defeatedEnemies: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,

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
            gachaRateConfigs: dbGachaRates, // DB 원본 설정 저장
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
          
          // 비로그인 사용자를 위한 데모 컬렉션 생성
          // AuthProvider에서 호출 시 유저 상태를 확인할 수 없으므로
          // 별도 메서드에서 처리
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
          playerMonster: null,
          enemyMonster: null,
          playerTeam: [],
          currentPlayerIndex: 0,
          playerTurn: true,
          turnCount: 1,
          winner: null,
          lastTurnResult: null,
          isExecutingTurn: false,
          currentTurnSequence: null,
          sequenceStep: 0,
          battlePhase: "selection",
          playerSelectedAction: null,
          enemySelectedAction: null,
          // Keep stats persistent across battles - only reset on manual reset
          defeatedEnemies: 0,
          currentWinStreak: 0,
        })
      },

      setupBattle: (playerTeam: Monster[]) => {
        // Create fresh copies with full HP
        const teamCopies = playerTeam.map((monster) => ({
          ...monster,
          hp: monster.maxHp,
          skillCooldowns: [0, 0, 0, 0],
        }))

        const firstMonster = teamCopies[0]
        const enemy = generateEnemyMonster(firstMonster)

        set({
          playerTeam: teamCopies,
          currentPlayerIndex: 0,
          playerMonster: firstMonster,
          enemyMonster: enemy,
          phase: "battle",
          playerTurn: true, // Always start with player selection
          turnCount: 1,
          winner: null,
          lastTurnResult: null,
          isExecutingTurn: false,
          currentTurnSequence: null,
          sequenceStep: 0,
          battlePhase: "selection", // Start in selection phase
          playerSelectedAction: null,
          enemySelectedAction: null,
        })
      },

      applyActionResult: (result: ActionExecutionResult, actor: "player" | "enemy") => {
        const state = get()
        
        // Apply HP changes and clear defense states when attacked
        if (result.hpChanges.target === state.playerMonster) {
          console.log(`[applyActionResult] 플레이어가 공격받음 - 방어 상태 초기화 확인`)
          console.log(`  - Dodge Attempted: ${result.result.dodgeAttempted}, Block Attempted: ${result.result.blockAttempted}`)
          set((s) => ({
            playerMonster: s.playerMonster ? { 
              ...s.playerMonster, 
              hp: result.hpChanges.newHp,
              // 공격받은 몬스터의 방어 상태 초기화 (1회용 효과)
              dodgeNextAttack: result.result.dodgeAttempted ? false : s.playerMonster.dodgeNextAttack,
              blockNextAttack: result.result.blockAttempted ? false : s.playerMonster.blockNextAttack,
              dodgeChance: result.result.dodgeAttempted ? undefined : s.playerMonster.dodgeChance,
              blockReduction: result.result.blockAttempted ? undefined : s.playerMonster.blockReduction,
            } : null
          }))
        } else if (result.hpChanges.target === state.enemyMonster) {
          console.log(`[applyActionResult] 적이 공격받음 - 방어 상태 초기화 확인`)
          console.log(`  - Dodge Attempted: ${result.result.dodgeAttempted}, Block Attempted: ${result.result.blockAttempted}`)
          set((s) => ({
            enemyMonster: s.enemyMonster ? { 
              ...s.enemyMonster, 
              hp: result.hpChanges.newHp,
              // 공격받은 몬스터의 방어 상태 초기화 (1회용 효과)
              dodgeNextAttack: result.result.dodgeAttempted ? false : s.enemyMonster.dodgeNextAttack,
              blockNextAttack: result.result.blockAttempted ? false : s.enemyMonster.blockNextAttack,
              dodgeChance: result.result.dodgeAttempted ? undefined : s.enemyMonster.dodgeChance,
              blockReduction: result.result.blockAttempted ? undefined : s.enemyMonster.blockReduction,
            } : null
          }))
        }

        // Apply cooldown updates
        result.cooldownUpdates.forEach(update => {
          if (update.monster === state.playerMonster) {
            set((s) => ({
              playerMonster: s.playerMonster ? {
                ...s.playerMonster,
                skillCooldowns: s.playerMonster.skillCooldowns.map((cd, idx) => 
                  idx === update.skillIndex ? update.newCooldown : cd
                )
              } : null
            }))
          } else if (update.monster === state.enemyMonster) {
            set((s) => ({
              enemyMonster: s.enemyMonster ? {
                ...s.enemyMonster,
                skillCooldowns: s.enemyMonster.skillCooldowns.map((cd, idx) => 
                  idx === update.skillIndex ? update.newCooldown : cd
                )
              } : null
            }))
          }
        })

        // Apply status effects for dodge/block - 수정된 버전
        // actor 정보를 사용하여 올바른 몬스터 식별
        console.log(`[applyActionResult] 상태 적용 시도: actor=${actor}, attacker=${result.result.attacker.name}, target=${result.result.target.name}`)
        console.log('[applyActionResult] 적용할 상태:')
        console.log('  - Dodge Next Attack:', result.result.attacker.dodgeNextAttack)
        console.log('  - Block Next Attack:', result.result.attacker.blockNextAttack)
        console.log('  - Dodge Chance:', result.result.attacker.dodgeChance)
        console.log('  - Block Reduction:', result.result.attacker.blockReduction)
        
        if (actor === "player" && result.result.attacker.id === state.playerMonster?.id) {
          // 플레이어가 자신에게 사용하는 상태 효과 (dodge/block)
          if (result.result.target.id === result.result.attacker.id) {
            console.log(`[applyActionResult] 플레이어 상태 효과 적용: ${result.result.attacker.name}`)
            set((s) => ({
              playerMonster: s.playerMonster ? {
                ...s.playerMonster,
                dodgeNextAttack: result.result.attacker.dodgeNextAttack || false,
                blockNextAttack: result.result.attacker.blockNextAttack || false,
                dodgeChance: result.result.attacker.dodgeChance,
                blockReduction: result.result.attacker.blockReduction,
              } : null
            }))
            
            // 적용 후 상태 확인
            const updatedState = get()
            console.log('[applyActionResult] 적용 후 플레이어 상태:')
            console.log('  - Dodge Next Attack:', updatedState.playerMonster?.dodgeNextAttack)
            console.log('  - Block Next Attack:', updatedState.playerMonster?.blockNextAttack)
            console.log('  - Dodge Chance:', updatedState.playerMonster?.dodgeChance)
            console.log('  - Block Reduction:', updatedState.playerMonster?.blockReduction)
          }
        } else if (actor === "enemy" && result.result.attacker.id === state.enemyMonster?.id) {
          // 적이 자신에게 사용하는 상태 효과 (dodge/block)
          if (result.result.target.id === result.result.attacker.id) {
            console.log(`[applyActionResult] 적 상태 효과 적용: ${result.result.attacker.name}`)
            set((s) => ({
              enemyMonster: s.enemyMonster ? {
                ...s.enemyMonster,
                dodgeNextAttack: result.result.attacker.dodgeNextAttack || false,
                blockNextAttack: result.result.attacker.blockNextAttack || false,
                dodgeChance: result.result.attacker.dodgeChance,
                blockReduction: result.result.attacker.blockReduction,
              } : null
            }))
          }
        }
      },

      executeSequentialTurn: async (playerAction: GameAction & { skillIndex?: number }) => {
        const state = get()
        
        if (!state.playerMonster || !state.enemyMonster || state.isExecutingTurn || state.winner || !state.playerTurn) {
          return
        }

        set({ isExecutingTurn: true })

        try {
          // Execute only player action during player turn
          const playerResult = executeActionDry(playerAction, state.playerMonster, state.enemyMonster)
          
          if (!playerResult) {
            set({ isExecutingTurn: false })
            return
          }

          const sequence = [{ actor: "player" as const, result: playerResult }]

          set({
            currentTurnSequence: sequence,
            sequenceStep: 0,
          })

          // Wait for animation
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Apply the result
          get().applyActionResult(playerResult, "player")
          
          // Wait for HP animation to complete
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Update cooldowns for both monsters
          const currentState = get()
          if (currentState.playerMonster) {
            set((s) => ({
              playerMonster: s.playerMonster ? {
                ...s.playerMonster,
                skillCooldowns: s.playerMonster.skillCooldowns.map(cd => Math.max(0, cd - 1))
              } : null
            }))
          }
          if (currentState.enemyMonster) {
            set((s) => ({
              enemyMonster: s.enemyMonster ? {
                ...s.enemyMonster,  
                skillCooldowns: s.enemyMonster.skillCooldowns.map(cd => Math.max(0, cd - 1))
              } : null
            }))
          }

          // Check for game over
          const newState = get()
          if (newState.enemyMonster && newState.enemyMonster.hp <= 0) {
            // Enemy defeated
            set({
              winner: "player",
              phase: "result",
              isExecutingTurn: false,
              currentTurnSequence: null,
            })
          } else if (newState.playerMonster && newState.playerMonster.hp <= 0) {
            // Player monster defeated, check if there are more monsters
            const nextIndex = newState.currentPlayerIndex + 1
            if (nextIndex < newState.playerTeam.length) {
              // Switch to next monster
              const nextMonster = newState.playerTeam[nextIndex]
              set({
                currentPlayerIndex: nextIndex,
                playerMonster: nextMonster,
                turnCount: state.turnCount + 1,
                playerTurn: true, // Stay player turn for switching
                isExecutingTurn: false,
                currentTurnSequence: null,
              })
            } else {
              // All player monsters defeated
              set({
                winner: "enemy",
                phase: "result",
                isExecutingTurn: false,
                currentTurnSequence: null,
              })
            }
          } else {
            // Continue to enemy turn
            set({
              turnCount: state.turnCount + 1,
              playerTurn: false, // Switch to enemy turn
              isExecutingTurn: false,
              currentTurnSequence: null,
            })
          }

        } catch (error) {
          console.error("[v0] Error during player turn:", error)
          set({ isExecutingTurn: false, currentTurnSequence: null })
        }
      },

      executeEnemyTurn: async () => {
        const state = get()
        
        if (!state.playerMonster || !state.enemyMonster || state.isExecutingTurn || state.winner || state.playerTurn) {
          return
        }

        set({ isExecutingTurn: true })

        try {
          const enemyAction = generateEnemyAction(state.enemyMonster, state.playerMonster)
          
          // Execute only enemy action
          const enemyResult = executeActionDry(enemyAction, state.enemyMonster, state.playerMonster)
          
          if (!enemyResult) {
            set({ isExecutingTurn: false })
            return
          }

          const sequence = [{ actor: "enemy" as const, result: enemyResult }]

          set({
            currentTurnSequence: sequence,
            sequenceStep: 0,
          })

          // Wait for animation
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Apply the result
          get().applyActionResult(enemyResult, "enemy")
          
          // Wait for HP animation to complete
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Update cooldowns for enemy
          const currentState = get()
          if (currentState.enemyMonster) {
            set((s) => ({
              enemyMonster: s.enemyMonster ? {
                ...s.enemyMonster,  
                skillCooldowns: s.enemyMonster.skillCooldowns.map(cd => Math.max(0, cd - 1))
              } : null
            }))
          }
          if (currentState.playerMonster) {
            set((s) => ({
              playerMonster: s.playerMonster ? {
                ...s.playerMonster,
                skillCooldowns: s.playerMonster.skillCooldowns.map(cd => Math.max(0, cd - 1))
              } : null
            }))
          }

          // Check for game over
          const newState = get()
          if (newState.playerMonster && newState.playerMonster.hp <= 0) {
            // Player monster defeated, check if there are more monsters
            const nextIndex = newState.currentPlayerIndex + 1
            if (nextIndex < newState.playerTeam.length) {
              // Switch to next monster and clear enemy flags
              const nextMonster = newState.playerTeam[nextIndex]
              const clearedEnemyMonster = {
                ...newState.enemyMonster,
                dodgeNextAttack: false,
                blockNextAttack: false,
              }
              set({
                currentPlayerIndex: nextIndex,
                playerMonster: nextMonster,
                enemyMonster: clearedEnemyMonster,
                turnCount: state.turnCount + 1,
                playerTurn: true, // Player turn after switching
                isExecutingTurn: false,
                currentTurnSequence: null,
              })
            } else {
              // All player monsters defeated
              set({
                winner: "enemy",
                phase: "result",
                isExecutingTurn: false,
                currentTurnSequence: null,
              })
            }
          } else if (newState.enemyMonster && newState.enemyMonster.hp <= 0) {
            // Enemy defeated - clear all dodge/block flags
            const clearedPlayerMonster = {
              ...newState.playerMonster,
              dodgeNextAttack: false,
              blockNextAttack: false,
            }
            set({
              winner: "player",
              phase: "result",
              playerMonster: clearedPlayerMonster,
              isExecutingTurn: false,
              currentTurnSequence: null,
            })
          } else {
            // Continue to next turn (switch to player)
            // Clear dodge/block flags at the end of turn to ensure one-turn duration
            const clearedPlayerMonster = {
              ...newState.playerMonster,
              dodgeNextAttack: false,
              blockNextAttack: false,
            }
            const clearedEnemyMonster = {
              ...newState.enemyMonster,
              dodgeNextAttack: false,
              blockNextAttack: false,
            }
            
            set({
              turnCount: state.turnCount + 1,
              playerTurn: true,
              isExecutingTurn: false,
              currentTurnSequence: null,
              playerMonster: clearedPlayerMonster,
              enemyMonster: clearedEnemyMonster,
            })
          }

        } catch (error) {
          console.error("[v0] Error during enemy turn:", error)
          set({ isExecutingTurn: false, currentTurnSequence: null })
        }
      },

      switchToNextMonster: () => {
        const state = get()
        const nextIndex = state.currentPlayerIndex + 1

        if (nextIndex < state.playerTeam.length) {
          const nextMonster = state.playerTeam[nextIndex]
          // Clear enemy dodge/block flags when player switches monsters
          const clearedEnemyMonster = state.enemyMonster ? {
            ...state.enemyMonster,
            dodgeNextAttack: false,
            blockNextAttack: false,
          } : null
          set({
            currentPlayerIndex: nextIndex,
            playerMonster: nextMonster,
            enemyMonster: clearedEnemyMonster,
            playerTurn: true, // 교체 후 플레이어 턴
            battlePhase: "selection", // Reset to selection phase after switching
            playerSelectedAction: null,
            enemySelectedAction: null,
          })
        } else {
          // 모든 몬스터가 쓰러짐 - 패배
          set({
            winner: "enemy",
            phase: "result",
          })
        }
      },

      // Simultaneous action selection functions
      selectPlayerAction: (action: GameAction & { skillIndex?: number }) => {
        const state = get()
        
        console.log('[selectPlayerAction] Received action:', action)
        console.log('[selectPlayerAction] Battle phase:', state.battlePhase)
        
        if (state.battlePhase !== "selection" || state.isExecutingTurn) {
          console.log('[selectPlayerAction] Action blocked - wrong phase or executing')
          return
        }

        set({ playerSelectedAction: action })
        console.log('[selectPlayerAction] Player action set')

        // Generate enemy action automatically after player selects
        if (state.enemyMonster && state.playerMonster) {
          const enemyAction = generateEnemyAction(state.enemyMonster, state.playerMonster)
          console.log('[selectPlayerAction] Generated enemy action:', enemyAction)
          
          set({ 
            enemySelectedAction: enemyAction,
            battlePhase: "resolution" // Move to resolution phase
          })
          
          console.log('[selectPlayerAction] Moving to resolution phase')
          
          // Automatically resolve the turn after both actions are selected
          setTimeout(() => {
            get().resolveSimultaneousTurn()
          }, 1000) // 1 second delay to show both selected actions
        }
      },

      resolveSimultaneousTurn: async () => {
        const state = get()
        
        console.log('[resolveSimultaneousTurn] Starting resolution')
        console.log('[resolveSimultaneousTurn] Player action:', state.playerSelectedAction)
        console.log('[resolveSimultaneousTurn] Enemy action:', state.enemySelectedAction)
        
        if (state.battlePhase !== "resolution" || 
            !state.playerSelectedAction || 
            !state.enemySelectedAction ||
            !state.playerMonster || 
            !state.enemyMonster ||
            state.isExecutingTurn) {
          console.log('[resolveSimultaneousTurn] Resolution blocked - invalid state')
          return
        }

        set({ isExecutingTurn: true })
        console.log('[resolveSimultaneousTurn] Executing turn...')

        try {
          // Determine turn order (player first for now, can be enhanced with speed stats)
          const playerFirst = true // TODO: Implement speed-based turn order

          let sequence: Array<{
            actor: "player" | "enemy"
            result: ActionExecutionResult | null
          }> = []

          if (playerFirst) {
            // Player action first
            const playerResult = executeActionDry(state.playerSelectedAction, state.playerMonster, state.enemyMonster)
            sequence.push({ actor: "player", result: playerResult })
            
            // ✨ 핵심 수정: 플레이어 액션을 먼저 적용하여 회피/막기 상태 업데이트
            if (playerResult) {
              console.log('[resolveSimultaneousTurn] Applying player action result before enemy calculation')
              console.log('[resolveSimultaneousTurn] Player result:', {
                action: state.playerSelectedAction?.type,
                blockNextAttack: playerResult.result.attacker.blockNextAttack,
                dodgeNextAttack: playerResult.result.attacker.dodgeNextAttack
              })
              get().applyActionResult(playerResult, "player")
              
              // Verify state was applied
              const updatedState = get()
              console.log('[resolveSimultaneousTurn] Player state after applying action:')
              console.log('  - Block Next Attack:', updatedState.playerMonster?.blockNextAttack)
              console.log('  - Dodge Next Attack:', updatedState.playerMonster?.dodgeNextAttack)
              console.log('  - Block Reduction:', updatedState.playerMonster?.blockReduction)
              console.log('  - Dodge Chance:', updatedState.playerMonster?.dodgeChance)
            }
            
            // Check if enemy is defeated
            if (playerResult && playerResult.hpChanges.newHp <= 0) {
              set({
                currentTurnSequence: sequence,
                sequenceStep: 0,
                winner: "player",
                phase: "result",
                isExecutingTurn: false,
                battlePhase: "completed",
              })
              return
            }

            // ✨ 적 액션은 플레이어 상태가 업데이트된 후 계산
            const currentState = get() // 업데이트된 상태 가져오기
            console.log('[resolveSimultaneousTurn] Enemy action about to be calculated with updated player state:')
            console.log('  - Enemy Action:', state.enemySelectedAction?.type)
            console.log('  - Player Block State:', currentState.playerMonster?.blockNextAttack)
            console.log('  - Player Dodge State:', currentState.playerMonster?.dodgeNextAttack)
            console.log('  - Player Block Reduction:', currentState.playerMonster?.blockReduction)
            console.log('  - Player Dodge Chance:', currentState.playerMonster?.dodgeChance)
            
            // 핵심 수정: 업데이트된 플레이어 상태를 확실히 사용
            if (!currentState.playerMonster || !currentState.enemyMonster) {
              console.error('[resolveSimultaneousTurn] Missing monster state after player action')
              return
            }
            
            const enemyResult = executeActionDry(
              state.enemySelectedAction, 
              currentState.enemyMonster, 
              currentState.playerMonster // 업데이트된 플레이어 상태 사용
            )
            console.log('[resolveSimultaneousTurn] Enemy action result:')
            console.log('  - Damage:', enemyResult?.result.damage)
            console.log('  - Blocked:', enemyResult?.result.blocked)
            console.log('  - Dodged:', enemyResult?.result.dodged)
            console.log('  - Block Attempted:', enemyResult?.result.blockAttempted)
            console.log('  - Dodge Attempted:', enemyResult?.result.dodgeAttempted)
            sequence.push({ actor: "enemy", result: enemyResult })
          } else {
            // Enemy first logic (similar structure)
            // TODO: Implement enemy-first execution
          }

          set({
            currentTurnSequence: sequence,
            sequenceStep: 0,
          })

          // 첫 번째 액션 트리거를 위해 잠깐 기다린 후 시작
          await new Promise(resolve => setTimeout(resolve, 100))

          // Execute sequence step by step
          for (let i = 0; i < sequence.length; i++) {
            set({ sequenceStep: i }) // 이 라인이 토스트 메시지를 트리거합니다!
            
            const step = sequence[i]
            if (step.result) {
              await new Promise(resolve => setTimeout(resolve, 800)) // Animation delay
              
              // ✨ 플레이어 액션은 이미 적용했으므로 건너뛰기
              if (step.actor === "enemy") {
                get().applyActionResult(step.result, step.actor)
              }
              
              await new Promise(resolve => setTimeout(resolve, 1000)) // HP change delay
            }
          }

          // Update cooldowns for both monsters
          const currentState = get()
          if (currentState.playerMonster) {
            set((s) => ({
              playerMonster: s.playerMonster ? {
                ...s.playerMonster,
                skillCooldowns: s.playerMonster.skillCooldowns.map(cd => Math.max(0, cd - 1))
              } : null
            }))
          }
          if (currentState.enemyMonster) {
            set((s) => ({
              enemyMonster: s.enemyMonster ? {
                ...s.enemyMonster,  
                skillCooldowns: s.enemyMonster.skillCooldowns.map(cd => Math.max(0, cd - 1))
              } : null
            }))
          }

          // Check for game over
          const finalState = get()
          if (finalState.playerMonster && finalState.playerMonster.hp <= 0) {
            // Player monster defeated, check for next monster
            const nextIndex = finalState.currentPlayerIndex + 1
            if (nextIndex < finalState.playerTeam.length) {
              // Switch to next monster
              const nextMonster = finalState.playerTeam[nextIndex]
              set({
                currentPlayerIndex: nextIndex,
                playerMonster: nextMonster,
                turnCount: finalState.turnCount + 1,
                isExecutingTurn: false,
                currentTurnSequence: null,
                battlePhase: "selection",
                playerSelectedAction: null,
                enemySelectedAction: null,
              })
            } else {
              // All player monsters defeated - reset win streak
              const finalState = get()
              console.log('[v0] 모든 몬스터 쓰러짐 - 연승 기록 초기화')
              
              set({
                winner: "enemy",
                phase: "result",
                isExecutingTurn: false,
                currentTurnSequence: null,
                battlePhase: "completed",
                // Reset current win streak but keep best streak
                currentWinStreak: 0,
              })
              
              console.log('[v0] 배틀 종료 - 최종 기록:', {
                처치한_적: finalState.defeatedEnemies,
                연승: finalState.currentWinStreak,
                최고연승: finalState.bestWinStreak
              })
            }
          } else if (finalState.enemyMonster && finalState.enemyMonster.hp <= 0) {
            // Enemy defeated - generate new enemy for continuous battles (Pokémon Rogue-like)
            if (finalState.playerMonster) {
              console.log('[v0] 적 쓰러뜨림 - 새로운 적 생성 (포켓로그 스타일)')
              
              // Update stats
              const newDefeatedCount = finalState.defeatedEnemies + 1
              const newWinStreak = finalState.currentWinStreak + 1
              const newBestStreak = Math.max(newWinStreak, finalState.bestWinStreak)
              
              // Generate new enemy based on current player monster
              const newEnemy = generateEnemyMonster(finalState.playerMonster)
              
              set({
                enemyMonster: newEnemy,
                turnCount: finalState.turnCount + 1,
                isExecutingTurn: false,
                currentTurnSequence: null,
                battlePhase: "selection",
                playerSelectedAction: null,
                enemySelectedAction: null,
                // Update Pokémon Rogue-like stats
                defeatedEnemies: newDefeatedCount,
                currentWinStreak: newWinStreak,
                bestWinStreak: newBestStreak,
                // Clear any status effects from player monster
                playerMonster: finalState.playerMonster ? {
                  ...finalState.playerMonster,
                  dodgeNextAttack: false,
                  blockNextAttack: false,
                  dodgeChance: undefined,
                  blockReduction: undefined
                } : null
              })
              
              console.log('[v0] 새로운 적 생성 완료:', newEnemy.name, `| 연승: ${newWinStreak}회, 총 처치: ${newDefeatedCount}마리`)
            } else {
              // Fallback to victory if no player monster
              set({
                winner: "player",
                phase: "result",
                isExecutingTurn: false,
                currentTurnSequence: null,
                battlePhase: "completed",
              })
            }
          } else {
            // Continue to next turn
            set({
              turnCount: finalState.turnCount + 1,
              isExecutingTurn: false,
              currentTurnSequence: null,
              battlePhase: "selection",
              playerSelectedAction: null,
              enemySelectedAction: null,
            })
          }

        } catch (error) {
          console.error("[v0] Error during simultaneous turn resolution:", error)
          set({ 
            isExecutingTurn: false, 
            currentTurnSequence: null,
            battlePhase: "selection",
            playerSelectedAction: null,
            enemySelectedAction: null,
          })
        }
      },

      executeBattleTurn: (playerAction: GameAction & { skillIndex?: number }) => {
        const state = get()

        if (!state.playerMonster || !state.enemyMonster) {
          throw new Error("Invalid battle state")
        }

        let result: TurnResult

        if (state.playerTurn) {
          // 플레이어 턴: 플레이어 액션 실행
          const enemyAction = generateEnemyAction(state.enemyMonster, state.playerMonster)
          result = executeTurn(playerAction, enemyAction, state.playerMonster, state.enemyMonster)
        } else {
          // 적의 턴: 적의 액션만 실행
          const enemyAction = generateEnemyAction(state.enemyMonster, state.playerMonster)
          const dummyPlayerAction: GameAction = { monsterId: state.playerMonster.id, type: "attack" }
          result = executeTurn(dummyPlayerAction, enemyAction, state.playerMonster, state.enemyMonster)
          // 적의 턴에서는 플레이어 결과를 무시하고 적의 결과만 사용
          result = { ...result, playerResult: null }
        }

        if (state.playerMonster.hp <= 0) {
          const nextIndex = state.currentPlayerIndex + 1
          if (nextIndex < state.playerTeam.length) {
            const nextMonster = state.playerTeam[nextIndex]
            set({
              currentPlayerIndex: nextIndex,
              playerMonster: nextMonster,
              turnCount: state.turnCount + 1,
              playerTurn: true, // 교체 후 플레이어 턴
              lastTurnResult: result,
            })
          } else {
            // 모든 몬스터가 쓰러짐 - 패배
            set({
              turnCount: state.turnCount + 1,
              winner: "enemy",
              phase: "result",
              lastTurnResult: result,
            })
          }
        } else if (state.enemyMonster.hp <= 0) {
          // 적을 쓰러뜨렸을 때 - 승리
          set({
            turnCount: state.turnCount + 1,
            winner: "player",
            phase: "result",
            lastTurnResult: result,
          })
        } else {
          // 둘 다 살아있을 때 - 턴을 교대
          set({
            turnCount: state.turnCount + 1,
            playerTurn: !state.playerTurn, // 턴을 교대로 변경
            lastTurnResult: result,
          })
        }

        return result
      },
    }),
    {
      name: "pokemon-game-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        collection: state.collection,
        bestWinStreak: state.bestWinStreak,
        defeatedEnemies: state.defeatedEnemies,
      }),
    },
  ),
)
