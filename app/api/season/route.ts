import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/season
 *
 * Query Parameters:
 * - active: "true"이면 현재 활성화된 시즌 조회
 * - id: 특정 시즌 ID로 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const active = searchParams.get('active')
    const id = searchParams.get('id')

    const supabase = await createServerSupabase()

    // 활성 시즌 조회
    if (active === 'true') {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single()

      if (error) {
        return NextResponse.json(
          { error: '활성화된 시즌을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      return NextResponse.json({ season: data })
    }

    // ID로 시즌 조회
    if (id) {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', parseInt(id, 10))
        .single()

      if (error) {
        return NextResponse.json(
          { error: '시즌을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      return NextResponse.json({ season: data })
    }

    // 전체 시즌 목록 조회
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('season_number', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: '시즌 목록을 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ seasons: data ?? [] })
  } catch (error) {
    console.error('Season API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
