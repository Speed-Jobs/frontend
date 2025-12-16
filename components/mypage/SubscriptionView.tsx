'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSubscriptionSettings, type SubscriptionOptions } from '@/lib/api/subscription'

interface SubscriptionViewProps {
  subscriptionOptions: SubscriptionOptions | null
  subscriptionData: {
    technologies: number[]
    jobRoles: number[]
    companies: number[]
    emailNotification?: {
      enabled: boolean
      time: string
    }
  } | null
  onDataUpdate: (data: {
    technologies: number[]
    jobRoles: number[]
    companies: number[]
    emailNotification: {
      enabled: boolean
      time: string
    }
  }) => void
}

export default function SubscriptionView({
  subscriptionOptions,
  subscriptionData,
  onDataUpdate,
}: SubscriptionViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 구독 정보 조회
  const handleRefresh = async () => {
    if (!subscriptionOptions) {
      setError('옵션 목록이 로드되지 않았습니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const subscriptionDataFromApi = await getSubscriptionSettings(subscriptionOptions)

      // 기술 목록이 로드되었고 API에서 가져온 기술 ID가 있으면 유효한 ID만 필터링
      let validTechIds = subscriptionDataFromApi.technologies || []
      if (subscriptionOptions.technologies.length > 0 && Array.isArray(subscriptionDataFromApi.technologies)) {
        validTechIds = subscriptionDataFromApi.technologies.filter((id: number) =>
          subscriptionOptions.technologies.some((tech) => tech.id === id)
        )
      }

      // 직군 목록이 로드되었고 API에서 가져온 직군 ID가 있으면 유효한 ID만 필터링
      let validJobRoleIds = subscriptionDataFromApi.jobRoles || []
      if (subscriptionOptions.jobRoles.length > 0 && Array.isArray(subscriptionDataFromApi.jobRoles)) {
        validJobRoleIds = subscriptionDataFromApi.jobRoles.filter((id: number) =>
          subscriptionOptions.jobRoles.some((role) => role.id === id)
        )
      }

      // 경쟁사 목록이 로드되었고 API에서 가져온 경쟁사 ID가 있으면 유효한 ID만 필터링
      let validCompanyIds = subscriptionDataFromApi.companies || []
      if (subscriptionOptions.companies.length > 0 && Array.isArray(subscriptionDataFromApi.companies)) {
        validCompanyIds = subscriptionDataFromApi.companies.filter((id: number) =>
          subscriptionOptions.companies.some((company) => company.id === id)
        )
      }

      // API에서 가져온 구독 데이터 설정
      const apiData = {
        technologies: validTechIds,
        jobRoles: validJobRoleIds,
        companies: validCompanyIds,
        emailNotification: subscriptionData?.emailNotification || {
          enabled: false,
          time: '09:00',
        },
      }

      // localStorage에도 저장 (백업용)
      localStorage.setItem('subscriptionSettings', JSON.stringify(apiData))
      onDataUpdate(apiData)
    } catch (error: any) {
      console.error('구독 조회 실패:', error)
      setError(error.message || '구독 정보를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">현재 구독</h3>
        <Button
          onClick={handleRefresh}
          disabled={isLoading || !subscriptionOptions}
          variant="default"
          size="sm"
          className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
              조회 중...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 mr-1.5" />
              구독 조회
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs">
          {error}
        </div>
      )}

      <div className="space-y-4 text-sm">
        {/* 기술 */}
        {subscriptionData?.technologies && subscriptionData.technologies.length > 0 && subscriptionOptions && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">기술</p>
            <div className="flex flex-wrap gap-1.5">
              {subscriptionData.technologies.slice(0, 3).map((id) => {
                const tech = subscriptionOptions.technologies.find((t) => t.id === id)
                return tech ? (
                  <span key={id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
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
                  <span key={id} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
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
                  <span key={id} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
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
  )
}

