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



