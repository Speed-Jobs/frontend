'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import SubscriptionSettings from '@/components/mypage/SubscriptionSettings'
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
  const handleSubscriptionSave = () => {
    // 구독 설정이 저장되었을 때 구독 정보 업데이트
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
            const subscriptionDataFromApi = await getSubscriptionSettings()
            
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
            <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">현재 구독</h3>
              <div className="space-y-4 text-sm">
                {/* 기술 */}
                {subscriptionData?.technologies && subscriptionData.technologies.length > 0 && subscriptionOptions && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">기술</p>
                    <div className="flex flex-wrap gap-1.5">
                      {subscriptionData.technologies.slice(0, 3).map((id) => {
                        const tech = subscriptionOptions.technologies.find((t) => t.id === id)
                        return tech ? (
                          <span
                            key={id}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {tech.name}
                          </span>
                        ) : null
                      })}
                      {subscriptionData.technologies.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{subscriptionData.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 직군 */}
                {subscriptionData?.jobRoles && subscriptionData.jobRoles.length > 0 && subscriptionOptions && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">직군</p>
                    <div className="flex flex-wrap gap-1.5">
                      {subscriptionData.jobRoles.slice(0, 2).map((id) => {
                        const role = subscriptionOptions.jobRoles.find((r) => r.id === id)
                        return role ? (
                          <span
                            key={id}
                            className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                          >
                            {role.name}
                          </span>
                        ) : null
                      })}
                      {subscriptionData.jobRoles.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{subscriptionData.jobRoles.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 경쟁사 */}
                {subscriptionData?.companies && subscriptionData.companies.length > 0 && subscriptionOptions && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">경쟁사</p>
                    <div className="flex flex-wrap gap-1.5">
                      {subscriptionData.companies.slice(0, 2).map((id) => {
                        const company = subscriptionOptions.companies.find((c) => c.id === id)
                        return company ? (
                          <span
                            key={id}
                            className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs"
                          >
                            {company.name}
                          </span>
                        ) : null
                      })}
                      {subscriptionData.companies.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{subscriptionData.companies.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 이메일 알림 정보 */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1.5">이메일 알림</p>
                  {subscriptionData?.emailNotification ? (
                    <div className="space-y-1">
                      {user?.email && (
                        <p className="text-gray-900 font-medium text-xs mb-1 break-all">
                          {user.email}
                        </p>
                      )}
                      <p className="text-gray-900 font-medium text-xs">
                        {subscriptionData.emailNotification.enabled
                          ? `매일 ${subscriptionData.emailNotification.time}에 알림`
                          : '비활성화'}
                      </p>
                      {subscriptionData.emailNotification.enabled && (
                        <p className="text-xs text-gray-500">
                          새로운 채용 공고가 등록되면 이메일로 알림을 받습니다.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {user?.email && (
                        <p className="text-gray-900 font-medium text-xs break-all">
                          {user.email}
                        </p>
                      )}
                      <p className="text-gray-900 font-medium text-xs">설정되지 않음</p>
                    </div>
                  )}
                </div>

                {/* 구독 정보가 없을 때 */}
                {(!subscriptionData || 
                  (subscriptionData.technologies.length === 0 && 
                   subscriptionData.jobRoles.length === 0 && 
                   subscriptionData.companies.length === 0)) && (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">구독 설정을 완료해주세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
