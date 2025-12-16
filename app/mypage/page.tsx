'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import SubscriptionSettings from '@/components/mypage/SubscriptionSettings'
import SubscriptionView from '@/components/mypage/SubscriptionView'
import { useAuth } from '@/contexts/AuthContext'

interface SubscriptionData {
  technologies: number[]
  jobRoles: number[]
  companies: number[]
  emailNotification: {
    enabled: boolean
    time: string
  }
}

export default function MyPage() {
  const { user } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [subscriptionOptions, setSubscriptionOptions] = useState<{
    technologies: Array<{ id: number; name: string }>
    jobRoles: Array<{ id: number; name: string }>
    companies: Array<{ id: number; name: string }>
  } | null>(null)

  // 구독 설정 저장 시 콜백
  const handleSubscriptionSave = async () => {
    // 구독 설정이 저장되었을 때 구독 정보를 API에서 다시 조회
    try {
      const { 
        getSubscriptionSettings 
      } = await import('@/lib/api/subscription')
      
      // 옵션 목록이 필요하므로 현재 상태 사용
      if (subscriptionOptions) {
        const subscriptionDataFromApi = await getSubscriptionSettings(subscriptionOptions)
        
        // 기술 목록이 로드되었고 API에서 가져온 기술 ID가 있으면 유효한 ID만 필터링
        let validTechIds = subscriptionDataFromApi.technologies || []
        if (subscriptionOptions.technologies.length > 0 && Array.isArray(subscriptionDataFromApi.technologies)) {
          validTechIds = subscriptionDataFromApi.technologies.filter((id: number) => 
            subscriptionOptions.technologies.some(tech => tech.id === id)
          )
        }

        // 직군 목록이 로드되었고 API에서 가져온 직군 ID가 있으면 유효한 ID만 필터링
        let validJobRoleIds = subscriptionDataFromApi.jobRoles || []
        if (subscriptionOptions.jobRoles.length > 0 && Array.isArray(subscriptionDataFromApi.jobRoles)) {
          validJobRoleIds = subscriptionDataFromApi.jobRoles.filter((id: number) => 
            subscriptionOptions.jobRoles.some(role => role.id === id)
          )
        }

        // 경쟁사 목록이 로드되었고 API에서 가져온 경쟁사 ID가 있으면 유효한 ID만 필터링
        let validCompanyIds = subscriptionDataFromApi.companies || []
        if (subscriptionOptions.companies.length > 0 && Array.isArray(subscriptionDataFromApi.companies)) {
          validCompanyIds = subscriptionDataFromApi.companies.filter((id: number) => 
            subscriptionOptions.companies.some(company => company.id === id)
          )
        }

        // API에서 가져온 구독 데이터 설정
        const apiData = {
          technologies: validTechIds,
          jobRoles: validJobRoleIds,
          companies: validCompanyIds,
          emailNotification: {
            enabled: false,
            time: '09:00',
          },
        }
        
        // localStorage에도 저장 (백업용)
        localStorage.setItem('subscriptionSettings', JSON.stringify(apiData))
        setSubscriptionData(apiData)
      } else {
        // 옵션 목록이 아직 로드되지 않은 경우 localStorage에서 읽기
        setTimeout(() => {
          const saved = localStorage.getItem('subscriptionSettings')
          if (saved) {
            try {
              const data = JSON.parse(saved)
              setSubscriptionData(data)
            } catch (error) {
              console.warn('구독 정보 업데이트 실패:', error)
            }
          }
        }, 100)
      }
    } catch (error) {
      console.warn('구독 조회 실패, localStorage에서 읽기:', error)
      // API 호출 실패 시 localStorage에서 읽기
      setTimeout(() => {
        const saved = localStorage.getItem('subscriptionSettings')
        if (saved) {
          try {
            const data = JSON.parse(saved)
            setSubscriptionData(data)
          } catch (error) {
            console.warn('구독 정보 업데이트 실패:', error)
          }
        }
      }, 100)
    }
  }

  // 구독 정보 및 옵션 로드
  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        // 구독 옵션 로드 (이름 매핑용)
        try {
          const { 
            getMajorSkills, 
            getPositions, 
            getCompetitorCompanies,
            getSubscriptionSettings 
          } = await import('@/lib/api/subscription')
          
          // 기술 스택 목록을 새로운 API로 가져오기
          let technologies: Array<{ id: number; name: string }> = []
          try {
            technologies = await getMajorSkills()
          } catch (error) {
            console.warn('기술 스택 API 호출 실패:', error)
          }

          // 직군 목록을 새로운 API로 가져오기
          let jobRoles: Array<{ id: number; name: string }> = []
          try {
            jobRoles = await getPositions()
          } catch (error) {
            console.warn('직군 API 호출 실패:', error)
          }

          // 경쟁사 목록을 새로운 API로 가져오기
          let companies: Array<{ id: number; name: string }> = []
          try {
            companies = await getCompetitorCompanies()
          } catch (error) {
            console.warn('경쟁사 API 호출 실패:', error)
          }

          // API에서 가져온 데이터만 사용
          setSubscriptionOptions({
            technologies,
            jobRoles,
            companies,
          })

          // 구독 설정을 API에서 가져오기
          try {
            // 옵션 목록이 로드된 후 구독 설정 조회 (이름을 ID로 변환하기 위해 필요)
            const subscriptionOptionsForApi = {
              technologies,
              jobRoles,
              companies,
            }
            const subscriptionDataFromApi = await getSubscriptionSettings(subscriptionOptionsForApi)
            
            // 기술 목록이 로드되었고 API에서 가져온 기술 ID가 있으면 유효한 ID만 필터링
            let validTechIds = subscriptionDataFromApi.technologies || []
            if (technologies.length > 0 && Array.isArray(subscriptionDataFromApi.technologies)) {
              validTechIds = subscriptionDataFromApi.technologies.filter((id: number) => 
                technologies.some(tech => tech.id === id)
              )
            }

            // 직군 목록이 로드되었고 API에서 가져온 직군 ID가 있으면 유효한 ID만 필터링
            let validJobRoleIds = subscriptionDataFromApi.jobRoles || []
            if (jobRoles.length > 0 && Array.isArray(subscriptionDataFromApi.jobRoles)) {
              validJobRoleIds = subscriptionDataFromApi.jobRoles.filter((id: number) => 
                jobRoles.some(role => role.id === id)
              )
            }

            // 경쟁사 목록이 로드되었고 API에서 가져온 경쟁사 ID가 있으면 유효한 ID만 필터링
            let validCompanyIds = subscriptionDataFromApi.companies || []
            if (companies.length > 0 && Array.isArray(subscriptionDataFromApi.companies)) {
              validCompanyIds = subscriptionDataFromApi.companies.filter((id: number) => 
                companies.some(company => company.id === id)
              )
            }

            // API에서 가져온 구독 데이터 설정
            const apiData = {
              technologies: validTechIds,
              jobRoles: validJobRoleIds,
              companies: validCompanyIds,
              emailNotification: {
                enabled: false,
                time: '09:00',
              },
            }
            
            // localStorage에도 저장 (백업용)
            localStorage.setItem('subscriptionSettings', JSON.stringify(apiData))
            setSubscriptionData(apiData)
          } catch (error: any) {
            console.warn('구독 설정 API 호출 실패:', error)
            
            // API 호출 실패 시 localStorage에서 로드 시도
            const saved = localStorage.getItem('subscriptionSettings')
            if (saved) {
              try {
                const data = JSON.parse(saved)
                
                // 기술 목록이 로드되었고 저장된 기술 ID가 있으면 유효한 ID만 필터링
                let validTechIds = data.technologies || []
                if (technologies.length > 0 && Array.isArray(data.technologies)) {
                  validTechIds = data.technologies.filter((id: number) => 
                    technologies.some(tech => tech.id === id)
                  )
                }

                // 직군 목록이 로드되었고 저장된 직군 ID가 있으면 유효한 ID만 필터링
                let validJobRoleIds = data.jobRoles || []
                if (jobRoles.length > 0 && Array.isArray(data.jobRoles)) {
                  validJobRoleIds = data.jobRoles.filter((id: number) => 
                    jobRoles.some(role => role.id === id)
                  )
                }

                // 경쟁사 목록이 로드되었고 저장된 경쟁사 ID가 있으면 유효한 ID만 필터링
                let validCompanyIds = data.companies || []
                if (companies.length > 0 && Array.isArray(data.companies)) {
                  validCompanyIds = data.companies.filter((id: number) => 
                    companies.some(company => company.id === id)
                  )
                }
                
                // 유효하지 않은 ID가 있으면 localStorage 업데이트
                if (validTechIds.length !== (data.technologies || []).length ||
                    validJobRoleIds.length !== (data.jobRoles || []).length ||
                    validCompanyIds.length !== (data.companies || []).length) {
                  const updatedData = {
                    ...data,
                    technologies: validTechIds,
                    jobRoles: validJobRoleIds,
                    companies: validCompanyIds,
                  }
                  localStorage.setItem('subscriptionSettings', JSON.stringify(updatedData))
                  setSubscriptionData(updatedData)
                } else {
                  setSubscriptionData(data)
                }
              } catch (parseError) {
                console.warn('저장된 설정 로드 실패:', parseError)
              }
            }
          }
        } catch (error) {
          console.warn('구독 옵션 로드 실패:', error)
        }
      } catch (error) {
        console.warn('구독 정보 로드 실패:', error)
      }
    }
    loadSubscriptionData()

    // localStorage 변경 감지 (같은 탭에서의 변경)
    const interval = setInterval(() => {
      const saved = localStorage.getItem('subscriptionSettings')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setSubscriptionData(data)
        } catch (error) {
          // 무시
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">구독 및 알림 설정</p>
        </div>

        {/* 구독 및 알림 설정 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 구독 설정 */}
          <div className="lg:col-span-2">
            <SubscriptionSettings
              onSave={(data) => {
                console.log('구독 설정 저장됨:', data)
                handleSubscriptionSave()
                // 여기서 백엔드 API 호출 가능
              }}
            />
          </div>

          {/* 현재 구독 정보 */}
          <div className="lg:col-span-1">
            <SubscriptionView
              subscriptionOptions={subscriptionOptions}
              subscriptionData={subscriptionData}
              onDataUpdate={(data) => {
                setSubscriptionData(data)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
