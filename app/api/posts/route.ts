import { NextRequest, NextResponse } from 'next/server'

const SPRING_API_BASE_URL = 'https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1'

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams
    
    // 원본 API URL 구성 - 대시보드 전용 엔드포인트 사용
    const apiUrl = `${SPRING_API_BASE_URL}/dashboard/posts?${searchParams.toString()}`
    
    // 백엔드 API 호출
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
      // 서버 사이드에서는 CORS 제한이 없음
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // CORS 헤더 추가하여 클라이언트에 응답
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('API 프록시 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

