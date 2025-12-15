'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import SubscriptionSettings from '@/components/mypage/SubscriptionSettings'

interface SubscriptionData {
  technologies: number[]
  jobRoles: number[]
  jobSkills: string[]
  companies: number[]
  emailNotification: {
    enabled: boolean
    time: string
  }
}

export default function MyPage() {
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
        // 구독 설정 로드
        const saved = localStorage.getItem('subscriptionSettings')
        if (saved) {
          const data = JSON.parse(saved)
          setSubscriptionData(data)
        }

        // 구독 옵션 로드 (이름 매핑용)
        try {
          const { getSubscriptionOptions } = await import('@/lib/api/subscription')
          const options = await getSubscriptionOptions().catch(() => null)
          if (options) {
            setSubscriptionOptions({
              technologies: options.technologies,
              jobRoles: options.jobRoles,
              companies: options.companies,
            })
          } else {
            // Fallback 데이터 사용
            setSubscriptionOptions({
              technologies: [
                { id: 1, name: 'React' },
                { id: 2, name: 'TypeScript' },
                { id: 3, name: 'Node.js' },
                { id: 4, name: 'Python' },
                { id: 5, name: 'Java' },
                { id: 6, name: 'Spring Boot' },
                { id: 7, name: 'Vue.js' },
                { id: 8, name: 'Next.js' },
                { id: 9, name: 'Docker' },
                { id: 10, name: 'Kubernetes' },
                { id: 11, name: 'AWS' },
                { id: 12, name: 'GraphQL' },
                { id: 13, name: 'AI Engineer' },
                { id: 14, name: 'Machine Learning' },
              ],
              jobRoles: [
                { id: 1, name: 'Software Development' },
                { id: 2, name: 'Factory AX Engineering' },
                { id: 3, name: 'Solution Development' },
                { id: 4, name: 'Cloud/Infra Engineering' },
                { id: 5, name: 'Architect' },
                { id: 6, name: 'Project Management' },
                { id: 7, name: 'Quality Management' },
                { id: 8, name: 'AI' },
                { id: 9, name: '정보보호' },
                { id: 10, name: 'Sales' },
                { id: 11, name: 'Domain Expert' },
                { id: 12, name: 'Consulting' },
                { id: 13, name: 'Biz. Supporting' },
              ],
              companies: [
                { id: 1, name: '네이버' },
                { id: 2, name: '카카오' },
                { id: 3, name: '토스' },
                { id: 4, name: '라인' },
                { id: 5, name: '쿠팡' },
                { id: 6, name: '배달의민족' },
                { id: 7, name: '당근마켓' },
                { id: 8, name: '삼성전자' },
                { id: 9, name: 'LG전자' },
                { id: 10, name: 'SK텔레콤' },
              ],
            })
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

                {/* 직무 */}
                {subscriptionData?.jobSkills && subscriptionData.jobSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">직무</p>
                    <p className="text-gray-900 font-medium text-xs">
                      {subscriptionData.jobSkills.length}개 선택됨
                    </p>
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
                    <p className="text-gray-900 font-medium text-xs">설정되지 않음</p>
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
