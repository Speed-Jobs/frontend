// 구독 및 알림 설정 API 함수

export interface SubscriptionData {
  technologies: number[]
  jobRoles: number[]
  companies: number[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

/**
 * 구독 설정 조회
 */
export async function getSubscriptionSettings(): Promise<SubscriptionData> {
  try {
    const response = await fetch(`${API_BASE_URL}/subscription`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
    })

    if (!response.ok) {
      throw new Error(`구독 설정 조회 실패: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      technologies: data.technologies || [],
      jobRoles: data.jobRoles || [],
      companies: data.companies || [],
    }
  } catch (error) {
    console.error('구독 설정 조회 중 오류:', error)
    throw error
  }
}

/**
 * 구독 설정 저장
 */
export async function saveSubscriptionSettings(
  subscriptionData: SubscriptionData
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
      body: JSON.stringify({
        technologies: subscriptionData.technologies,
        jobRoles: subscriptionData.jobRoles,
        companies: subscriptionData.companies,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `구독 설정 저장 실패: ${response.statusText}`
      )
    }
  } catch (error) {
    console.error('구독 설정 저장 중 오류:', error)
    throw error
  }
}

/**
 * 구독 옵션 목록 조회 (기술, 직군, 회사)
 */
export interface SubscriptionOptions {
  technologies: Array<{ id: number; name: string }>
  jobRoles: Array<{ id: number; name: string }>
  companies: Array<{ id: number; name: string }>
}

export async function getSubscriptionOptions(): Promise<SubscriptionOptions> {
  try {
    const response = await fetch(`${API_BASE_URL}/subscription/options`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`구독 옵션 조회 실패: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      technologies: data.technologies || [],
      jobRoles: data.jobRoles || [],
      companies: data.companies || [],
    }
  } catch (error) {
    console.error('구독 옵션 조회 중 오류:', error)
    throw error
  }
}

/**
 * 주요 기술 스택 목록 조회
 */
export async function getMajorSkills(): Promise<Array<{ id: number; name: string }>> {
  try {
    const SPRING_API_BASE_URL = 'https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1'
    const response = await fetch(`${SPRING_API_BASE_URL}/skills/major`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`기술 스택 조회 실패: ${response.statusText}`)
    }

    const result = await response.json()
    
    // API 응답 형식에 맞게 파싱
    if (result.status === 200 && result.data && result.data.skills) {
      return result.data.skills
    }
    
    throw new Error('기술 스택 데이터 형식이 올바르지 않습니다.')
  } catch (error) {
    console.error('기술 스택 조회 중 오류:', error)
    throw error
  }
}

/**
 * 직군 목록 조회
 */
export async function getPositions(): Promise<Array<{ id: number; name: string }>> {
  try {
    const SPRING_API_BASE_URL = 'https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1'
    const response = await fetch(`${SPRING_API_BASE_URL}/positions`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`직군 조회 실패: ${response.statusText}`)
    }

    const result = await response.json()
    
    // API 응답 형식에 맞게 파싱
    if (result.status === 200 && result.data && result.data.options) {
      return result.data.options
    }
    
    throw new Error('직군 데이터 형식이 올바르지 않습니다.')
  } catch (error) {
    console.error('직군 조회 중 오류:', error)
    throw error
  }
}

/**
 * 경쟁사 목록 조회
 */
export async function getCompetitorCompanies(): Promise<Array<{ id: number; name: string }>> {
  try {
    const SPRING_API_BASE_URL = 'https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1'
    const response = await fetch(`${SPRING_API_BASE_URL}/companies/competitor`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`경쟁사 조회 실패: ${response.statusText}`)
    }

    const result = await response.json()
    
    // API 응답 형식에 맞게 파싱
    if (result.status === 200 && result.data && result.data.companies) {
      return result.data.companies
    }
    
    throw new Error('경쟁사 데이터 형식이 올바르지 않습니다.')
  } catch (error) {
    console.error('경쟁사 조회 중 오류:', error)
    throw error
  }
}





