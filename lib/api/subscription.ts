// 구독 및 알림 설정 API 함수

export interface SubscriptionData {
  technologies: number[]
  jobRoles: number[]
  companies: number[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

/**
 * 구독 설정 조회
 * @param options 옵션 목록 (이름을 ID로 변환하기 위해 필요)
 */
export async function getSubscriptionSettings(
  options?: SubscriptionOptions
): Promise<SubscriptionData> {
  try {
    // Next.js API Route를 통해 프록시 호출 (CORS 문제 해결)
    const response = await fetch('/api/subscriptions', {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 401) {
        throw new Error(errorData.message || '로그인이 필요한 서비스입니다.')
      }
      throw new Error(errorData.message || `구독 설정 조회 실패: ${response.statusText}`)
    }

    const result = await response.json()
    
    // API 응답 형식에 맞게 파싱
    if (result.status === 200 && result.data) {
      const data = result.data
      
      // 이름 배열을 ID 배열로 변환하는 헬퍼 함수
      const convertNamesToIds = (
        names: string[],
        optionList: Array<{ id: number; name: string }>
      ): number[] => {
        if (!names || !Array.isArray(names) || names.length === 0) {
          return []
        }
        if (!optionList || optionList.length === 0) {
          return []
        }
        return names
          .map((name) => optionList.find((item) => item.name === name)?.id)
          .filter((id): id is number => id !== undefined)
      }
      
      // 이름 배열이 있는 경우 ID로 변환
      if (data.skillNames || data.positionNames || data.companyNames) {
        const technologies = options?.technologies
          ? convertNamesToIds(data.skillNames || [], options.technologies)
          : []
        const jobRoles = options?.jobRoles
          ? convertNamesToIds(data.positionNames || [], options.jobRoles)
          : []
        const companies = options?.companies
          ? convertNamesToIds(data.companyNames || [], options.companies)
          : []
        
        return {
          technologies,
          jobRoles,
          companies,
        }
      }
      
      // 기존 형식 지원 (ID 배열이 직접 오는 경우)
      return {
        technologies: data.skillIds || data.technologies || [],
        jobRoles: data.positionIds || data.jobRoles || [],
        companies: data.companyIds || data.companies || [],
      }
    }
    
    // 응답 형식이 다른 경우 직접 파싱 시도
    return {
      technologies: result.skillIds || result.technologies || [],
      jobRoles: result.positionIds || result.jobRoles || [],
      companies: result.companyIds || result.companies || [],
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
): Promise<{ message: string }> {
  try {
    // Next.js API Route를 통해 프록시 호출 (CORS 문제 해결)
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
      body: JSON.stringify({
        companyIds: subscriptionData.companies,
        skillIds: subscriptionData.technologies,
        positionIds: subscriptionData.jobRoles,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(result.message || '로그인이 필요한 서비스입니다.')
      }
      throw new Error(
        result.message || `구독 설정 저장 실패: ${response.statusText}`
      )
    }

    // API 응답 형식 확인
    if (result.status === 200 && result.code === 'OK') {
      return {
        message: result.message || '구독 설정이 저장되었습니다.',
      }
    }

    throw new Error(result.message || '구독 설정 저장에 실패했습니다.')
  } catch (error) {
    console.error('구독 설정 저장 중 오류:', error)
    throw error
  }
}

/**
 * 구독 취소
 */
export async function deleteSubscriptionSettings(): Promise<void> {
  try {
    // Next.js API Route를 통해 프록시 호출 (CORS 문제 해결)
    const response = await fetch('/api/subscriptions', {
      method: 'DELETE',
      headers: {
        'accept': '*/*',
      },
      credentials: 'include', // 쿠키 포함
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 401) {
        throw new Error(errorData.message || '로그인이 필요한 서비스입니다.')
      }
      throw new Error(
        errorData.message || `구독 취소 실패: ${response.statusText}`
      )
    }
  } catch (error) {
    console.error('구독 취소 중 오류:', error)
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





