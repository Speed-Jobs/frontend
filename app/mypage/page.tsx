'use client'

import { useState, useEffect, useMemo } from 'react'
import Header from '@/components/Header'
import jobPostingsData from '@/data/jobPostings.json'
import { useJobNotifications } from '@/hooks/useJobNotifications'
import { getStorageDebugInfo } from '@/lib/storage/debug'
import NotificationToast from '@/components/NotificationToast'
import SubscriptionSettings from '@/components/mypage/SubscriptionSettings'
import { Database, Briefcase, Bell, RefreshCw, CheckCircle2, AlertCircle, Clock, Settings2 } from 'lucide-react'

export default function MyPage() {
  const [showDebugPanel, setShowDebugPanel] = useState(true)
  const [debugInfo, setDebugInfo] = useState<{
    storedJobsCount: number
    lastCheckTime: Date | null
    hasStoredData: boolean
    error?: string
  } | null>(null)
  const [subscriptionData, setSubscriptionData] = useState<{
    technologies: number[]
    jobRoles: number[]
    jobSkills: string[]
    companies: number[]
    notificationConditions: {
      newJobPosting: boolean
      jobCountIncrease: boolean
      competitorHiring: boolean
    }
    notificationFrequency: 'realtime' | 'daily' | 'weekly'
  } | null>(null)

  // 구독 옵션 데이터 (이름 매핑용)
  const [subscriptionOptions, setSubscriptionOptions] = useState<{
    technologies: Array<{ id: number; name: string }>
    jobRoles: Array<{ id: number; name: string }>
    companies: Array<{ id: number; name: string }>
  } | null>(null)

  // 새로운 공고 알림 시스템
  const allJobPostings = useMemo(() => [...jobPostingsData], [])
  const {
    newJobs,
    hasNewJobs,
    isChecking,
    lastCheckTime,
    checkNow,
    clearNewJobs,
  } = useJobNotifications({
    jobPostings: allJobPostings,
    autoCheck: true,
    checkInterval: 5 * 60 * 1000, // 5분마다 체크
    onNewJobsFound: (newJobs) => {
      console.log(`새로운 공고 ${newJobs.length}개 발견!`)
    },
  })

  // 디버그 정보 로드
  useEffect(() => {
    const loadDebugInfo = async () => {
      const info = await getStorageDebugInfo()
      setDebugInfo(info)
    }
    loadDebugInfo()
  }, [hasNewJobs, lastCheckTime])

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

  // 구독 설정 저장 시 구독 정보 업데이트
  const handleSubscriptionSave = () => {
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


  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* 새로운 공고 알림 토스트 */}
      {hasNewJobs && (
        <NotificationToast newJobs={newJobs} onClose={clearNewJobs} />
      )}

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">알림 설정 및 공고 관리</p>
        </div>

        {/* 구독 및 알림 설정 + 알림 상태 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 구독 및 알림 설정 */}
          <div className="lg:col-span-2">
            <SubscriptionSettings
              onSave={(data) => {
                console.log('구독 설정 저장됨:', data)
                handleSubscriptionSave()
                // 여기서 백엔드 API 호출 가능
              }}
            />
          </div>

          {/* 알림 상태 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 현재 구독 정보 */}
            {subscriptionData && (
              <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">현재 구독</h3>
                <div className="space-y-3 text-sm">
                  {subscriptionData.technologies && subscriptionData.technologies.length > 0 && subscriptionOptions && (
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
                  {subscriptionData.jobRoles && subscriptionData.jobRoles.length > 0 && subscriptionOptions && (
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
                  {subscriptionData.jobSkills && subscriptionData.jobSkills.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">직무</p>
                      <p className="text-gray-900 font-medium text-xs">
                        {subscriptionData.jobSkills.length}개 선택됨
                      </p>
                    </div>
                  )}
                  {subscriptionData.companies && subscriptionData.companies.length > 0 && subscriptionOptions && (
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
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1.5">알림 빈도</p>
                    <p className="text-gray-900 font-medium text-xs">
                      {subscriptionData.notificationFrequency === 'realtime'
                        ? '실시간'
                        : subscriptionData.notificationFrequency === 'daily'
                        ? '하루 1회 요약'
                        : subscriptionData.notificationFrequency === 'weekly'
                        ? '주간 요약'
                        : '실시간'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 알림 상태 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit sticky top-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">알림 상태</h2>
              <p className="text-sm text-gray-500">새로운 채용 공고 알림 현황</p>
            </div>
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
            >
              {showDebugPanel ? '접기' : '상세보기'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 저장된 공고 */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">저장된 공고</p>
              <p className="text-2xl font-semibold text-gray-900">
                {debugInfo?.storedJobsCount ?? '-'}
              </p>
            </div>

            {/* 현재 공고 */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">전체 공고</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allJobPostings.length}
              </p>
            </div>

            {/* 새로운 공고 */}
            <div className={`p-4 rounded-lg border ${
              hasNewJobs 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-sm text-gray-600 mb-2">새로운 공고</p>
              <p className={`text-2xl font-semibold ${hasNewJobs ? 'text-amber-600' : 'text-gray-900'}`}>
                {newJobs.length}개
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="text-sm text-gray-600">
              마지막 확인: {lastCheckTime ? new Date(lastCheckTime).toLocaleString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '없음'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={checkNow}
                disabled={isChecking}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChecking ? '확인 중...' : '지금 확인'}
              </button>
              {hasNewJobs && (
                <button
                  onClick={clearNewJobs}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors"
                >
                  닫기
                </button>
              )}
            </div>
          </div>

          {showDebugPanel && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">상세 정보</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">마지막 체크 시간</span>
                  <span className="text-gray-900">
                    {lastCheckTime ? new Date(lastCheckTime).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '없음'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">저장 상태</span>
                  <span className="text-gray-900">
                    {debugInfo?.hasStoredData ? '정상' : '초기화 필요'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">브라우저 알림</span>
                  <span className="text-gray-900">
                    {typeof window !== 'undefined' && 'Notification' in window
                      ? Notification.permission === 'granted'
                        ? '활성화됨'
                        : Notification.permission === 'denied'
                        ? '거부됨'
                        : '권한 필요'
                      : '지원 안됨'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 새로운 공고 목록 */}
          {hasNewJobs && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                새로운 공고 ({newJobs.length}건)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newJobs.map((job) => (
                  <div
                    key={job.id || `${job.title}-${job.company}`}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{job.company}</p>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                            NEW
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">{job.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.employment_type}</span>
                          {job.meta_data?.job_category && (
                            <>
                              <span>•</span>
                              <span>{job.meta_data.job_category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

