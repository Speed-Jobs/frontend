'use client'

import { useState, useEffect, useMemo } from 'react'
import Header from '@/components/Header'
import jobPostingsData from '@/data/jobPostings.json'
import { useJobNotifications } from '@/hooks/useJobNotifications'
import { getStorageDebugInfo, clearStorage, simulateNewJobs } from '@/lib/storage/debug'
import NotificationToast from '@/components/NotificationToast'

export default function MyPage() {
  const [showDebugPanel, setShowDebugPanel] = useState(true)
  const [debugInfo, setDebugInfo] = useState<{
    storedJobsCount: number
    lastCheckTime: Date | null
    hasStoredData: boolean
    error?: string
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

  // localStorage 초기화 핸들러
  const handleClearStorage = async () => {
    if (confirm('저장된 공고 데이터를 초기화하시겠습니까? 이렇게 하면 다음 체크 시 모든 공고가 새로운 공고로 표시됩니다.')) {
      await clearStorage()
      const info = await getStorageDebugInfo()
      setDebugInfo(info)
      // 초기화 후 즉시 체크
      setTimeout(() => {
        checkNow()
      }, 500)
    }
  }

  // 테스트: 새로운 공고 시뮬레이션
  const handleSimulateNewJobs = async () => {
    const simulated = await simulateNewJobs(allJobPostings, 2)
    if (simulated.length > 0) {
      alert(`테스트: ${simulated.length}개의 공고를 새로운 공고로 시뮬레이션했습니다. 이제 "지금 확인" 버튼을 클릭하세요.`)
      const info = await getStorageDebugInfo()
      setDebugInfo(info)
    }
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

        {/* 알림 시스템 상태 및 테스트 패널 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">알림 시스템 상태</h2>
              <p className="text-sm text-gray-600">새로운 공고 알림 설정 및 관리</p>
            </div>
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {showDebugPanel ? '접기' : '펼치기'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">저장된 공고</p>
              <p className="text-2xl font-bold text-gray-900">
                {debugInfo?.storedJobsCount ?? '로딩 중...'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">현재 공고</p>
              <p className="text-2xl font-bold text-gray-900">
                {allJobPostings.length}
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${hasNewJobs ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-sm text-gray-600 mb-1">새로운 공고</p>
              <p className={`text-2xl font-bold ${hasNewJobs ? 'text-yellow-600' : 'text-gray-900'}`}>
                {newJobs.length}개
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={checkNow}
              disabled={isChecking}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isChecking ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  확인 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  지금 확인
                </>
              )}
            </button>
            {hasNewJobs && (
              <button
                onClick={clearNewJobs}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-300"
              >
                알림 닫기
              </button>
            )}
          </div>

          {showDebugPanel && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">시스템 정보</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">마지막 체크 시간:</span>
                    <span className="font-medium text-gray-900">
                      {lastCheckTime ? new Date(lastCheckTime).toLocaleString('ko-KR') : '아직 없음'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">저장 상태:</span>
                    <span className="font-medium">
                      {debugInfo?.hasStoredData ? '✅ 초기화됨' : '⚠️ 아직 초기화 안됨 (첫 방문)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">브라우저 알림 권한:</span>
                    <span className="font-medium">
                      {typeof window !== 'undefined' && 'Notification' in window 
                        ? (Notification.permission === 'granted' ? '✅ 허용됨' : Notification.permission === 'denied' ? '❌ 거부됨' : '⚠️ 요청 필요')
                        : '❌ 지원 안됨'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">테스트 도구</h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearStorage}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    저장 데이터 초기화
                  </button>
                  <button
                    onClick={handleSimulateNewJobs}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    새 공고 시뮬레이션
                  </button>
                </div>
                <div className="mt-3 text-xs text-gray-500 bg-gray-100 p-3 rounded">
                  <p className="font-semibold mb-2">테스트 방법:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>"저장 데이터 초기화" 버튼 클릭 → 페이지 새로고침 → 모든 공고가 새로운 공고로 표시됨</li>
                    <li>"새 공고 시뮬레이션" 버튼 클릭 → "지금 확인" 버튼 클릭 → 새로운 공고 알림 표시</li>
                    <li>브라우저 개발자 도구(F12) → Console 탭에서 로그 확인</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* 새로운 공고 목록 */}
          {hasNewJobs && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">새로운 공고 목록</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newJobs.map((job) => (
                  <div
                    key={job.id || `${job.title}-${job.company}`}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{job.company}</p>
                        <p className="text-sm text-gray-700 mb-2">{job.title}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
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
                      <span className="ml-4 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                        NEW
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

