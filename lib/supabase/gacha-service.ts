import { createClient } from "@/lib/supabase/client"
import type { 
  DbGachaRate, 
  DbGachaHistory, 
  GachaResult, 
  DbMonster, 
  DbMonsterStats, 
  DbUserMonster,
  MonsterWithStats 
} from "@/lib/types/database"

// 가챠 확률 캐시 (메모리 캐싱)
let gachaRatesCache: DbGachaRate[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시

/**
 * 가챠 확률 정보 조회 (캐싱 적용)
 */
export async function getGachaRates(): Promise<DbGachaRate[]> {
  const now = Date.now()
  
  // 캐시가 유효한 경우 캐시된 데이터 반환
  if (gachaRatesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log("가챠 확률 캐시 사용 중")
    return gachaRatesCache
  }
  
  // 캐시가 없거나 만료된 경우 DB에서 조회
  console.log("가챠 확률 DB 조회 중")
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("gacha_rates")
    .select("*")
    .order("rate", { ascending: false }) // 높은 확률부터 정렬

  if (error) {
    // DB 조회 실패 시 캐시된 데이터가 있으면 반환
    if (gachaRatesCache) {
      console.warn("DB 조회 실패, 캐시된 데이터 사용:", error.message)
      return gachaRatesCache
    }
    throw new Error(`Failed to fetch gacha rates: ${error.message}`)
  }

  // 캐시 업데이트
  gachaRatesCache = data || []
  cacheTimestamp = now
  
  console.log(`가챠 확률 캐시 업데이트 완료: ${gachaRatesCache.length}개`)
  return gachaRatesCache
}

/**
 * 유저의 천장 카운트 조회 (마지막 희귀/유니크 이후 뽑기 횟수)
 */
export async function getPityCount(): Promise<{ rare: number; unique: number }> {
  const supabase = createClient()
  
  try {
    // 현재 유저 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.warn("User not authenticated, returning default pity count")
      return { rare: 0, unique: 0 }
    }

    // 유저 프로필에서 user_id 가져오기
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("uid", user.id)
      .single()

    if (profileError || !profile) {
      console.warn("User profile not found, returning default pity count")
      return { rare: 0, unique: 0 }
    }

    // 가챠 히스토리 조회 (분리된 쿼리 방식으로 관계 쿼리 오류 방지)
    const { data: histories, error: historyError } = await supabase
      .from("gacha_histories")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })

    if (historyError) {
      throw new Error(`Failed to fetch gacha history: ${historyError.message}`)
    }

    if (!histories || histories.length === 0) {
      console.log("No gacha history found, returning default pity count")
      return { rare: 0, unique: 0 }
    }

    // 몬스터 ID 수집
    const monsterIds = [...new Set(histories.map(h => h.monster_id).filter(id => id !== null))]
    
    if (monsterIds.length === 0) {
      console.log("No valid monster IDs in history")
      return { rare: 0, unique: 0 }
    }

    // 몬스터 정보 조회
    const { data: monsters, error: monstersError } = await supabase
      .from("monsters")
      .select("id, rarity")
      .in("id", monsterIds)

    if (monstersError) {
      console.warn("Failed to fetch monster rarities:", monstersError.message)
      return { rare: 0, unique: 0 }
    }

    // 몬스터 ID -> 레어도 매핑
    const monsterRarityMap = new Map<number, string>()
    monsters?.forEach(monster => {
      if (monster.id && monster.rarity) {
        monsterRarityMap.set(monster.id, monster.rarity.toUpperCase())
      }
    })

    // 천장 카운트 계산 (대문자 레어도 기준)
    let rareCount = 0
    let uniqueCount = 0
    
    console.log(`Calculating pity count from ${histories.length} gacha records`)
    
    for (const history of histories) {
      if (!history.monster_id) continue
      
      const rarity = monsterRarityMap.get(history.monster_id)
      if (!rarity) {
        console.warn(`Monster rarity not found for ID ${history.monster_id}`)
        continue
      }

      console.log(`History: Monster ${history.monster_id}, Rarity: ${rarity}`)

      if (rarity === "UNIQUE") {
        console.log("Found UNIQUE monster - resetting both counters")
        break // 유니크를 뽑았으면 둘 다 리셋
      } else if (rarity === "RARE") {
        uniqueCount = rareCount + 1 // 희귀 뽑은 시점까지의 유니크 카운트
        console.log(`Found RARE monster - rare counter reset, unique counter: ${uniqueCount}`)
        break // 희귀를 뽑았으면 희귀 카운트는 리셋
      } else {
        rareCount++
        uniqueCount++
        console.log(`Found COMMON monster - rare: ${rareCount}, unique: ${uniqueCount}`)
      }
    }

    console.log(`Final pity count - rare: ${rareCount}, unique: ${uniqueCount}`)
    return { rare: rareCount, unique: uniqueCount }
  } catch (error) {
    console.error("Error calculating pity count:", error)
    return { rare: 0, unique: 0 }
  }
}

/**
 * 몬스터 목록에서 랜덤 선택 (레어도별)
 * 분리된 쿼리 방식으로 관계 쿼리 오류 방지
 */
async function selectRandomMonsterByRarity(rarity: string): Promise<MonsterWithStats | null> {
  const supabase = createClient()
  
  try {
    // 1. 해당 레어도의 몬스터 조회 (대문자 레어도 기준)
    const { data: monsters, error: monstersError } = await supabase
      .from("monsters")
      .select("*")
      .eq("rarity", rarity.toUpperCase())

    if (monstersError) {
      throw new Error(`Failed to fetch monsters by rarity: ${monstersError.message}`)
    }

    if (!monsters || monsters.length === 0) {
      console.warn(`No monsters found for rarity: ${rarity}`)
      return null
    }

    // 2. 랜덤 몬스터 선택
    const randomIndex = Math.floor(Math.random() * monsters.length)
    const selectedMonster = monsters[randomIndex]
    
    console.log(`Selected monster: ${selectedMonster.name} (ID: ${selectedMonster.id}) from ${monsters.length} ${rarity} monsters`)
    
    // 3. 선택된 몬스터의 스탯 조회
    const { data: stats, error: statsError } = await supabase
      .from("monster_stats")
      .select("*")
      .eq("monster_id", selectedMonster.id)
      .maybeSingle()

    if (statsError && statsError.code !== "PGRST116") {
      // PGRST116: no rows found - 스탯이 없어도 계속 진행
      console.warn(`Failed to fetch stats for monster ${selectedMonster.id}:`, statsError.message)
    }
    
    return {
      monster: selectedMonster,
      stats: stats || null
    }
  } catch (error) {
    console.error(`Error selecting monster by rarity ${rarity}:`, error)
    throw error
  }
}

/**
 * 천장 시스템이 적용된 가챠 수행
 */
export async function performGachaWithPity(): Promise<GachaResult> {
  const supabase = createClient()
  
  try {
    // 1. 현재 유저 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error("User not authenticated")
    }

    // 2. 유저 프로필 가져오기
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("uid", user.id)
      .single()

    if (profileError || !profile) {
      throw new Error("User profile not found")
    }

    // 3. 가챠 확률 정보 가져오기
    const gachaRates = await getGachaRates()
    if (gachaRates.length === 0) {
      throw new Error("No gacha rates configured")
    }

    // 4. 현재 천장 카운트 확인
    const pityCount = await getPityCount()
    
    // 5. 천장 적용 로직
    let selectedRarity = "common"
    let wasGuaranteed = false
    
    // 천장 체크 (unique 우선) - 대문자 레어도 기준
    const uniqueRate = gachaRates.find(r => r.rarity.toUpperCase() === "UNIQUE")
    const rareRate = gachaRates.find(r => r.rarity.toUpperCase() === "RARE")
    
    if (uniqueRate?.guaranteed_count && pityCount.unique >= uniqueRate.guaranteed_count) {
      selectedRarity = uniqueRate.rarity
      wasGuaranteed = true
    } else if (rareRate?.guaranteed_count && pityCount.rare >= rareRate.guaranteed_count) {
      selectedRarity = rareRate.rarity
      wasGuaranteed = true
    } else {
      // 일반 확률 뽑기
      const random = Math.random()
      let cumulative = 0
      
      for (const rate of gachaRates) {
        cumulative += rate.rate
        if (random <= cumulative) {
          selectedRarity = rate.rarity
          break
        }
      }
    }

    // 6. 선택된 레어도에서 몬스터 뽑기
    const selectedMonster = await selectRandomMonsterByRarity(selectedRarity)
    if (!selectedMonster) {
      throw new Error(`No monsters found for rarity: ${selectedRarity}`)
    }

    // 7. 포인트 차감 (30포인트)
    const gachaCost = 30
    if (profile.points < gachaCost) {
      throw new Error("Insufficient points")
    }

    const remainedPoints = profile.points - gachaCost

    // 8. 유저 포인트 업데이트
    await supabase
      .from("user_profiles")
      .update({ points: remainedPoints })
      .eq("id", profile.id)

    // 9. 가챠 히스토리 기록
    await supabase
      .from("gacha_histories")
      .insert({
        user_id: profile.id,
        monster_id: selectedMonster.monster.id,
        used_points: gachaCost,
        remained_points: remainedPoints
      })

    // 10. 유저 몬스터 업데이트
    await updateUserMonster(profile.id, selectedMonster.monster.id)

    // 11. 천장 카운트 재계산 (대문자 레어도 기준)
    const selectedRarityUpper = selectedRarity.toUpperCase()
    const newPityCount = wasGuaranteed 
      ? { rare: 0, unique: 0 } // 천장 뽑기면 리셋
      : selectedRarityUpper === "UNIQUE"
        ? { rare: 0, unique: 0 } // 유니크 뽑으면 리셋
        : selectedRarityUpper === "RARE"
          ? { rare: 0, unique: pityCount.unique + 1 } // 희귀 뽑으면 희귀만 리셋
          : { rare: pityCount.rare + 1, unique: pityCount.unique + 1 } // 일반이면 둘 다 증가

    return {
      monster: selectedMonster.monster,
      stats: selectedMonster.stats,
      usedPoints: gachaCost,
      remainedPoints,
      wasGuaranteed,
      pityCount: newPityCount.unique // UI에는 유니크 천장 카운트 표시
    }

  } catch (error) {
    console.error("Error performing gacha:", error)
    throw error
  }
}

/**
 * 유저 몬스터 업데이트 또는 추가
 */
async function updateUserMonster(userId: number, monsterId: number): Promise<void> {
  const supabase = createClient()
  
  // 기존 유저 몬스터 확인
  const { data: existing, error: selectError } = await supabase
    .from("user_monsters")
    .select("*")
    .eq("user_id", userId)
    .eq("monster_id", monsterId)
    .single()

  if (selectError && selectError.code !== "PGRST116") {
    throw new Error(`Failed to check existing monster: ${selectError.message}`)
  }

  if (existing) {
    // 기존 몬스터 카운트 증가
    const { error: updateError } = await supabase
      .from("user_monsters")
      .update({ total_count: (existing.total_count || 0) + 1 })
      .eq("id", existing.id)

    if (updateError) {
      throw new Error(`Failed to update monster count: ${updateError.message}`)
    }
  } else {
    // 새로운 몬스터 추가
    const { error: insertError } = await supabase
      .from("user_monsters")
      .insert({
        user_id: userId,
        monster_id: monsterId,
        total_count: 1
      })

    if (insertError) {
      throw new Error(`Failed to add new monster: ${insertError.message}`)
    }
  }
}

/**
 * 유저의 현재 포인트 조회
 */
export async function getUserPoints(): Promise<number> {
  const supabase = createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return 0
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("points")
      .eq("uid", user.id)
      .single()

    if (profileError || !profile) {
      return 0
    }

    return profile.points || 0
  } catch (error) {
    console.error("Error fetching user points:", error)
    return 0
  }
}

/**
 * 가챠 확률 캐시 초기화 (관리자 기능)
 */
export function clearGachaRatesCache(): void {
  gachaRatesCache = null
  cacheTimestamp = 0
  console.log("가챠 확률 캐시 초기화 완료")
}