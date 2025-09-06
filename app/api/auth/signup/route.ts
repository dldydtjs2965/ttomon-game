import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, profileId } = await request.json()

    if (!userId || !profileId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 서비스 클라이언트로 RLS 우회하여 업데이트
    const supabase = createServiceClient()
    
    console.log('Updating profile with service key:', { userId, profileId })
    
    const { data, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        uid: userId,
        status: 'ACTIVE',
        verified_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()

    console.log('Update result:', { data, error: updateError })

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: '프로필 업데이트에 실패했습니다.', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}