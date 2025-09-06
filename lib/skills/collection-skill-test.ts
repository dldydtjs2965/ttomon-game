// Collection Skill Integration Test
// 유저 컬렉션에서 DB 스킬 통합이 제대로 작동하는지 테스트하기 위한 함수들

import { useGameStore } from "@/hooks/use-game-store"

/**
 * 현재 컬렉션의 스킬 정보를 검사합니다
 */
export function inspectCollectionSkills() {
  const { collection, masterSkills, masterBuffs } = useGameStore.getState()
  
  console.log("=== Collection Skill Inspection ===")
  console.log(`총 컬렉션 몬스터: ${collection.length}개`)
  console.log(`마스터 스킬: ${masterSkills.length}개`)
  console.log(`마스터 버프: ${masterBuffs.length}개`)
  
  if (collection.length > 0) {
    const firstMonster = collection[0]
    console.log(`첫 번째 몬스터: ${firstMonster.name}`)
    console.log(`스킬 개수: ${firstMonster.skills.length}개`)
    
    firstMonster.skills.forEach((skill, index) => {
      console.log(`  스킬 ${index + 1}: ${skill.name} (ID: ${skill.id})`)
      console.log(`    타입: ${skill.type}`)
      console.log(`    데미지: ${skill.damage || 'N/A'}`)
      console.log(`    쿨다운: ${skill.cooldown}`)
      console.log(`    설명: ${skill.description}`)
      
      // DB에서 온 스킬인지 확인 (ID가 숫자면 DB 스킬)
      const isDbSkill = !isNaN(Number(skill.id))
      console.log(`    DB 스킬: ${isDbSkill ? 'Yes' : 'No'}`)
    })
    
    return {
      success: true,
      monstersCount: collection.length,
      skillsCount: masterSkills.length,
      buffsCount: masterBuffs.length,
      firstMonsterSkills: firstMonster.skills.length,
      hasDbSkills: firstMonster.skills.some(s => !isNaN(Number(s.id)))
    }
  }
  
  console.log("⚠️ 컬렉션이 비어있습니다")
  return {
    success: false,
    monstersCount: 0,
    skillsCount: masterSkills.length,
    buffsCount: masterBuffs.length,
    firstMonsterSkills: 0,
    hasDbSkills: false
  }
}

/**
 * 스킬 변환 품질을 테스트합니다
 */
export function testSkillConversion() {
  const { collection } = useGameStore.getState()
  
  console.log("=== Skill Conversion Quality Test ===")
  
  if (collection.length === 0) {
    console.log("❌ 테스트할 컬렉션이 없습니다")
    return { success: false, issues: ['No collection available'] }
  }
  
  const issues: string[] = []
  let totalSkills = 0
  let validSkills = 0
  
  for (const monster of collection) {
    console.log(`몬스터 ${monster.name} 검사 중...`)
    
    if (monster.skills.length !== 4) {
      issues.push(`${monster.name}: 스킬 개수가 4개가 아님 (${monster.skills.length}개)`)
    }
    
    for (const skill of monster.skills) {
      totalSkills++
      
      // 필수 속성 검사
      if (!skill.name || skill.name.trim() === '') {
        issues.push(`${monster.name}: 스킬 이름이 비어있음`)
      } else if (!skill.type) {
        issues.push(`${monster.name}: 스킬 타입이 없음 (${skill.name})`)
      } else if (skill.cooldown === undefined || skill.cooldown < 0) {
        issues.push(`${monster.name}: 잘못된 쿨다운 (${skill.name})`)
      } else if (skill.range === undefined || skill.range < 1) {
        issues.push(`${monster.name}: 잘못된 범위 (${skill.name})`)
      } else {
        validSkills++
      }
      
      // DB 스킬인지 확인
      const isDbSkill = !isNaN(Number(skill.id))
      if (isDbSkill) {
        console.log(`  ✅ DB 스킬: ${skill.name} (ID: ${skill.id})`)
      } else {
        console.log(`  ⚠️ 하드코딩 스킬: ${skill.name} (ID: ${skill.id})`)
      }
    }
  }
  
  console.log(`\n=== 테스트 결과 ===`)
  console.log(`총 스킬: ${totalSkills}개`)
  console.log(`유효한 스킬: ${validSkills}개`)
  console.log(`문제: ${issues.length}개`)
  
  if (issues.length > 0) {
    console.log(`\n문제 목록:`)
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`)
    })
  }
  
  const success = issues.length === 0 && totalSkills > 0
  console.log(`\n${success ? '✅ 모든 테스트 통과' : '❌ 문제 발견'}`)
  
  return {
    success,
    totalSkills,
    validSkills,
    issues,
    conversionRate: totalSkills > 0 ? (validSkills / totalSkills) * 100 : 0
  }
}

/**
 * 전체 통합 테스트 실행
 */
export function runCollectionIntegrationTest() {
  console.log("🚀 컬렉션 스킬 통합 테스트 시작\n")
  
  const inspection = inspectCollectionSkills()
  console.log("\n" + "=".repeat(50) + "\n")
  
  const conversion = testSkillConversion()
  console.log("\n" + "=".repeat(50) + "\n")
  
  console.log("📊 최종 결과:")
  console.log(`  컬렉션 몬스터: ${inspection.monstersCount}개`)
  console.log(`  DB 스킬 사용 여부: ${inspection.hasDbSkills ? 'Yes' : 'No'}`)
  console.log(`  스킬 변환 성공률: ${conversion.conversionRate.toFixed(1)}%`)
  console.log(`  발견된 문제: ${conversion.issues.length}개`)
  
  const overallSuccess = inspection.success && conversion.success && inspection.hasDbSkills
  console.log(`\n${overallSuccess ? '🎉 통합 성공!' : '⚠️ 추가 작업 필요'}`)
  
  return {
    inspection,
    conversion,
    overallSuccess
  }
}

// 브라우저 콘솔에서 사용할 수 있도록 전역에 노출
if (typeof window !== 'undefined') {
  (window as any).testCollectionSkills = {
    inspect: inspectCollectionSkills,
    testConversion: testSkillConversion,
    runFull: runCollectionIntegrationTest
  }
  
  console.log("🔧 Collection Skill Test가 로드되었습니다!")
  console.log("사용 방법:")
  console.log("  window.testCollectionSkills.inspect() - 컬렉션 검사")
  console.log("  window.testCollectionSkills.testConversion() - 변환 품질 테스트") 
  console.log("  window.testCollectionSkills.runFull() - 전체 테스트")
}