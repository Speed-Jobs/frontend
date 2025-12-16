import { NextRequest, NextResponse } from 'next/server'

const SPRING_API_BASE_URL = 'https://speedjobs-spring.skala25a.project.skala-ai.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 백엔드 로그인 API 호출
    const response = await fetch(`${SPRING_API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok || data.status !== 200) {
      return NextResponse.json(
        { error: data.message || '로그인에 실패했습니다.' },
        { status: response.status }
      )
    }
    
    // 응답 생성
    const nextResponse = NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
    
    // Set-Cookie 헤더가 있으면 전달 (백엔드에서 설정한 쿠키를 클라이언트로 전달)
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      // 쿠키를 클라이언트로 전달하기 위해 헤더 설정
      nextResponse.headers.set('Set-Cookie', setCookieHeader)
    }
    
    return nextResponse
  } catch (error) {
    console.error('로그인 API 프록시 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}

