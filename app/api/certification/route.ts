import { createServerSupabase } from '@/lib/supabase/server'
import console from 'console'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/certification
 *
 * Query Parameters:
 * - userId: 유저 ID (필수)
 * - weekNumber: 주차 번호 (선택, 없으면 전체 조회)
 * - seasonId: 시즌 ID (선택)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const weekNumber = searchParams.get('weekNumber')
    const seasonId = searchParams.get('seasonId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId는 필수입니다.' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    let query = supabase
      .from('certifications')
      .select('*')
      .eq('user_id', userId)
      .order('certification_date', { ascending: false })

    // 주차 필터
    if (weekNumber) {
      query = query.eq('week_number', parseInt(weekNumber, 10))
    }

    // 시즌 필터
    if (seasonId) {
      query = query.eq('season_id', parseInt(seasonId, 10))
    }

    const { data, error } = await query

    if (error) {
      console.error('Certification fetch error:', error)
      return NextResponse.json(
        { error: '인증 데이터를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      certifications: data ?? [],
      count: data?.length ?? 0,
    })
  } catch (error) {
    console.error('Certification API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
