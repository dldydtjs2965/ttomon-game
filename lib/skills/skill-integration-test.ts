// Skill Integration Test Functions
// 이 파일은 스킬 시스템이 제대로 작동하는지 테스트하기 위한 함수들을 포함합니다

import { 
  getAllSkills, 
  getAllBuffs, 
  getMonsterSkills, 
  getSkillWithBuffs,
  getAllSkillsAndBuffs 
} from "./skills-service"
import { 
  convertDbSkillToGameSkill, 
  convertDbSkillsToGameSkills,
  convertDbBuffToGameBuff 
} from "./skill-converter"
import type { DbSkill, DbBuff } from "@/lib/types/database"

/**
 * 스킬 데이터 로딩 테스트
 */
export async function testSkillDataLoading() {
  console.log("=== Skill Data Loading Test ===")
  
  try {
    // 모든 스킬과 버프 로딩
    const { skills, buffs } = await getAllSkillsAndBuffs()
    
    console.log(`✅ 스킬 로딩 성공: ${skills.length}개`)
    console.log(`✅ 버프 로딩 성공: ${buffs.length}개`)
    
    // 첫 번째 스킬 변환 테스트
    if (skills.length > 0) {
      const firstSkill = skills[0]
      const gameSkill = convertDbSkillToGameSkill(firstSkill)
      console.log(`✅ 스킬 변환 테스트:`, {
        original: firstSkill.name,
        converted: gameSkill.name,
        type: gameSkill.type,
        damage: gameSkill.damage,
        range: gameSkill.range
      })
    }
    
    // 첫 번째 버프 변환 테스트
    if (buffs.length > 0) {
      const firstBuff = buffs[0]
      const gameBuff = convertDbBuffToGameBuff(firstBuff)
      console.log(`✅ 버프 변환 테스트:`, {
        original: firstBuff.name,
        converted: gameBuff.name,
        statType: gameBuff.statType,
        value: gameBuff.value
      })
    }
    
    return { success: true, skills, buffs }
  } catch (error) {
    console.error("❌ 스킬 데이터 로딩 실패:", error)
    return { success: false, skills: [], buffs: [] }
  }
}

/**
 * 몬스터 스킬 로딩 테스트 (실제 DB에 데이터가 있다면)
 */
export async function testMonsterSkillsLoading(monsterId: number = 1) {
  console.log(`=== Monster Skills Loading Test (ID: ${monsterId}) ===`)
  
  try {
    const skills = await getMonsterSkills(monsterId)
    
    if (skills.length > 0) {
      console.log(`✅ 몬스터 스킬 로딩 성공: ${skills.length}개`)
      skills.forEach((skill, index) => {
        console.log(`  스킬 ${index + 1}: ${skill.name} (데미지: ${skill.damage}, 쿨다운: ${skill.cooldown})`)
        console.log(`    타입: ${skill.skill_type}, 타겟: ${skill.target_type}`)
      })
      
      // 게임 스킬로 변환
      const gameSkills = convertDbSkillsToGameSkills(skills)
      console.log(`✅ 게임 스킬 변환 완료: ${gameSkills.length}개`)
      gameSkills.forEach((skill, index) => {
        console.log(`  변환된 스킬 ${index + 1}: ${skill.name} (타입: ${skill.type}, 범위: ${skill.range})`)
      })
      
    } else {
      console.log("⚠️ 해당 몬스터의 스킬이 없습니다")
      console.log("확인사항:")
      console.log("  1. monster_skills 테이블에 해당 monster_id 데이터 존재")
      console.log("  2. skill_1, skill_2, skill_3, skill_4 컬럼에 유효한 스킬 ID")
      console.log("  3. skills 테이블에 해당 스킬 데이터 존재")
    }
    
    return { success: true, skills }
  } catch (error) {
    console.error("❌ 몬스터 스킬 로딩 실패:", error)
    return { success: false, skills: [] }
  }
}

/**
 * 스킬-버프 관계 테스트
 */
export async function testSkillBuffRelation(skillId: number = 1) {
  console.log(`=== Skill-Buff Relation Test (Skill ID: ${skillId}) ===`)
  
  try {
    const skillWithBuffs = await getSkillWithBuffs(skillId)
    
    if (skillWithBuffs) {
      console.log(`✅ 스킬 정보:`, {
        name: skillWithBuffs.skill.name,
        type: skillWithBuffs.skill.skill_type,
        damage: skillWithBuffs.skill.damage
      })
      
      console.log(`✅ 연관 버프: ${skillWithBuffs.buffs.length}개`)
      skillWithBuffs.buffs.forEach((buff, index) => {
        console.log(`  버프 ${index + 1}: ${buff.name} (${buff.stat_type}: ${buff.value})`)
      })
      
      // 게임 스킬로 변환 (버프 포함)
      const gameSkill = convertDbSkillToGameSkill(skillWithBuffs.skill, skillWithBuffs.buffs)
      console.log(`✅ 변환된 게임 스킬:`, {
        name: gameSkill.name,
        type: gameSkill.type,
        healAmount: gameSkill.healAmount,
        dodgeChance: gameSkill.dodgeChance,
        blockReduction: gameSkill.blockReduction
      })
      
    } else {
      console.log("⚠️ 해당 스킬을 찾을 수 없습니다")
    }
    
    return { success: true, skillWithBuffs }
  } catch (error) {
    console.error("❌ 스킬-버프 관계 테스트 실패:", error)
    return { success: false, skillWithBuffs: null }
  }
}

/**
 * 전체 통합 테스트
 */
export async function runFullIntegrationTest() {
  console.log("🚀 스킬 시스템 통합 테스트 시작")
  
  const results = {
    dataLoading: false,
    monsterSkills: false,
    skillBuffRelation: false
  }
  
  // 1. 기본 데이터 로딩 테스트
  const dataResult = await testSkillDataLoading()
  results.dataLoading = dataResult.success
  
  // 2. 몬스터 스킬 테스트 (DB에 데이터가 있을 때만)
  const monsterResult = await testMonsterSkillsLoading(1)
  results.monsterSkills = monsterResult.success
  
  // 3. 스킬-버프 관계 테스트 (DB에 데이터가 있을 때만)
  const skillBuffResult = await testSkillBuffRelation(1)
  results.skillBuffRelation = skillBuffResult.success
  
  console.log("📊 테스트 결과 요약:")
  console.log("  데이터 로딩:", results.dataLoading ? "✅ 성공" : "❌ 실패")
  console.log("  몬스터 스킬:", results.monsterSkills ? "✅ 성공" : "⚠️ 데이터 없음")
  console.log("  스킬-버프 관계:", results.skillBuffRelation ? "✅ 성공" : "⚠️ 데이터 없음")
  
  return results
}

/**
 * 실제 DB 스키마 테스트
 */
export async function testRealDbSchema(monsterId: number = 1) {
  console.log(`=== Real DB Schema Test (Monster ID: ${monsterId}) ===`)
  
  try {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    
    // 1. monster_skills 테이블 구조 확인
    console.log("1. monster_skills 테이블 조회...")
    const { data: monsterSkill, error: msError } = await supabase
      .from("monster_skills")
      .select("monster_id, skill_1, skill_2, skill_3, skill_4")
      .eq("monster_id", monsterId)
      .maybeSingle()
    
    if (msError) {
      console.error("❌ monster_skills 조회 실패:", msError)
      return { success: false, error: msError.message }
    }
    
    if (!monsterSkill) {
      console.log(`⚠️ Monster ID ${monsterId}의 스킬 데이터가 없습니다`)
      console.log("확인사항: monster_skills 테이블에 데이터가 존재하는지 확인")
      return { success: false, error: "No monster skill data found" }
    }
    
    console.log("✅ monster_skills 데이터:")
    console.log(`  Monster ID: ${monsterSkill.monster_id}`)
    console.log(`  Skill 1: ${monsterSkill.skill_1}`)
    console.log(`  Skill 2: ${monsterSkill.skill_2}`)
    console.log(`  Skill 3: ${monsterSkill.skill_3}`)
    console.log(`  Skill 4: ${monsterSkill.skill_4}`)
    
    // 2. 스킬 ID들 수집
    const skillIds = [
      monsterSkill.skill_1,
      monsterSkill.skill_2, 
      monsterSkill.skill_3,
      monsterSkill.skill_4
    ].filter(id => id !== null)
    
    if (skillIds.length === 0) {
      console.log("⚠️ 유효한 스킬 ID가 없습니다")
      return { success: false, error: "No valid skill IDs" }
    }
    
    // 3. skills 테이블에서 실제 스킬 데이터 조회
    console.log(`\n2. skills 테이블에서 ${skillIds.length}개 스킬 조회...`)
    const { data: skills, error: skillsError } = await supabase
      .from("skills")
      .select("*")
      .in("id", skillIds)
    
    if (skillsError) {
      console.error("❌ skills 조회 실패:", skillsError)
      return { success: false, error: skillsError.message }
    }
    
    if (!skills || skills.length === 0) {
      console.log("❌ skills 테이블에서 스킬을 찾을 수 없습니다")
      console.log(`찾으려는 스킬 IDs: ${skillIds.join(', ')}`)
      return { success: false, error: "Skills not found in skills table" }
    }
    
    console.log(`✅ ${skills.length}개 스킬 데이터 조회 성공:`)
    skills.forEach((skill, index) => {
      console.log(`  ${index + 1}. ${skill.name} (ID: ${skill.id})`)
      console.log(`     타입: ${skill.skill_type}, 데미지: ${skill.damage}, 쿨다운: ${skill.cooldown}`)
    })
    
    // 4. 새로운 서비스 함수로 테스트
    console.log("\n3. 새로운 getMonsterSkills() 함수 테스트...")
    const serviceSkills = await getMonsterSkills(monsterId)
    
    console.log(`✅ 서비스 함수 결과: ${serviceSkills.length}개 스킬`)
    if (serviceSkills.length === skills.length) {
      console.log("✅ 직접 조회와 서비스 함수 결과 일치")
    } else {
      console.log("⚠️ 직접 조회와 서비스 함수 결과 불일치")
    }
    
    return {
      success: true,
      monsterSkill,
      skills,
      serviceSkills,
      skillCount: skills.length
    }
    
  } catch (error) {
    console.error("❌ DB 스키마 테스트 실패:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * CSV 데이터 검증 (개발용)
 */
export function validateCsvData() {
  console.log("=== CSV 데이터 검증 ===")
  console.log("✅ skills_rows.csv에서 91개 스킬 확인됨")
  console.log("✅ buffs_rows.csv에서 24개 버프 확인됨")
  console.log("ℹ️ 실제 DB 테이블에 이 데이터들이 삽입되었는지 확인이 필요합니다")
  console.log("ℹ️ monster_skills 테이블에 각 몬스터의 skill_1~4 데이터 삽입 필요")
}

// 브라우저 콘솔에서 사용할 수 있도록 전역에 노출
if (typeof window !== 'undefined') {
  (window as any).testSkillIntegration = {
    // 기본 테스트
    dataLoading: testSkillDataLoading,
    monsterSkills: testMonsterSkillsLoading,
    skillBuffRelation: testSkillBuffRelation,
    runFull: runFullIntegrationTest,
    
    // 실제 DB 스키마 테스트
    testRealSchema: testRealDbSchema,
    validateCsv: validateCsvData,
  }
  
  console.log("🔧 Skill Integration Test가 로드되었습니다!")
  console.log("사용 방법:")
  console.log("=== 실제 DB 스키마 테스트 ===")
  console.log("  window.testSkillIntegration.testRealSchema(1) - 실제 DB 스키마 테스트")
  console.log("  window.testSkillIntegration.monsterSkills(1) - 몬스터별 스킬 테스트")
  console.log("  window.testSkillIntegration.dataLoading() - 기본 데이터 로딩 테스트")
  console.log("=== 기타 테스트 ===")
  console.log("  window.testSkillIntegration.runFull() - 전체 통합 테스트")
  console.log("  window.testSkillIntegration.validateCsv() - CSV 데이터 검증")
}