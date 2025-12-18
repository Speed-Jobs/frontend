import { NextRequest, NextResponse } from 'next/server'

const SPRING_API_BASE_URL = 'https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id
    const searchParams = request.nextUrl.searchParams
    
    // 쿼리 파라미터 구성 (width, useWebp)
    const width = searchParams.get('width') || '800'
    const useWebp = searchParams.get('useWebp') || 'false'
    
    // 원본 API URL 구성
    const apiUrl = `${SPRING_API_BASE_URL}/posts/${jobId}/screenshot?width=${width}&useWebp=${useWebp}`
    
    // 백엔드 API 호출
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      )
    }
    
    // 이미지 데이터 가져오기
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    // 이미지 응답 반환
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
      },
    })
  } catch (error) {
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

