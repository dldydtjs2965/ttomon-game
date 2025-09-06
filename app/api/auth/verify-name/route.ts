import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: '이름은 2글자 이상 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // user_profiles 테이블에서 해당 이름이 존재하는지 확인
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, name, status')
      .eq('name', name.trim())
      .eq('status', 'PENDING') // PENDING 상태인 프로필만 조회
      .limit(1)

    if (profileError) {
      console.error('Profile query error:', profileError)
      return NextResponse.json(
        { error: '데이터베이스 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: '등록되지 않은 이름입니다. 관리자에게 문의해주세요.' },
        { status: 404 }
      )
    }

    // 인증 성공
    const profile = profiles[0]
    
    return NextResponse.json({ 
      success: true,
      message: '실명 인증이 완료되었습니다.',
      profileId: profile.id,
      name: profile.name
    })
  } catch (error) {
    console.error('Name verification error:', error)
    return NextResponse.json(
      { error: '실명 인증 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}