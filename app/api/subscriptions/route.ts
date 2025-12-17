import { NextRequest, NextResponse } from 'next/server'

const SPRING_API_BASE_URL = 'https://speedjobs-spring.skala25a.project.skala-ai.com'

// 구독 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    // 모든 쿠키 가져오기
    const cookies = request.cookies.getAll()
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')
    
    // 백엔드 API 호출
    const response = await fetch(`${SPRING_API_BASE_URL}/subscriptions`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        ...(cookieString && { Cookie: cookieString }),
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || `API error: ${response.status}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // 응답 생성
    const nextResponse = NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
    
    // Set-Cookie 헤더가 있으면 전달
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader)
    }
    
    return nextResponse
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 구독 저장 (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 모든 쿠키 가져오기
    const cookies = request.cookies.getAll()
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')
    
    // 백엔드 API 호출
    const response = await fetch(`${SPRING_API_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        ...(cookieString && { Cookie: cookieString }),
      },
      body: JSON.stringify({
        companyIds: body.companyIds || [],
        skillIds: body.skillIds || [],
        positionIds: body.positionIds || [],
        notificationTypes: body.notificationTypes || [],
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || `API error: ${response.status}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // 응답 생성
    const nextResponse = NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
    
    // Set-Cookie 헤더가 있으면 전달
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader)
    }
    
    return nextResponse
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 구독 취소 (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    // 모든 쿠키 가져오기
    const cookies = request.cookies.getAll()
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ')
    
    // 백엔드 API 호출
    const response = await fetch(`${SPRING_API_BASE_URL}/subscriptions`, {
      method: 'DELETE',
      headers: {
        'Accept': '*/*',
        ...(cookieString && { Cookie: cookieString }),
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || `API error: ${response.status}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // 응답 생성
    const nextResponse = NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
    
    // Set-Cookie 헤더가 있으면 전달
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader)
    }
    
    return nextResponse
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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}

