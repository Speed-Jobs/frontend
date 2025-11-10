// 새로운 공고 알림 훅

import { useEffect, useState, useCallback } from 'react'
import { JobPosting } from '@/lib/storage/types'
import { checkForNewJobPostings, initializeJobStorage } from '@/lib/jobNotification'
import { requestNotificationPermission } from '@/lib/notifications/browser'

interface UseJobNotificationsOptions {
  jobPostings: JobPosting[]
  autoCheck?: boolean // 자동 체크 여부
  checkInterval?: number // 체크 간격 (ms), 기본값: 5분
  onNewJobsFound?: (newJobs: JobPosting[]) => void // 새로운 공고 발견 시 콜백
}

interface UseJobNotificationsReturn {
  newJobs: JobPosting[]
  hasNewJobs: boolean
  isChecking: boolean
  lastCheckTime: Date | null
  checkNow: () => Promise<void> // 수동 체크
  clearNewJobs: () => void // 새 공고 알림 제거
}

export function useJobNotifications(
  options: UseJobNotificationsOptions
): UseJobNotificationsReturn {
  const {
    jobPostings,
    autoCheck = true,
    checkInterval = 5 * 60 * 1000, // 5분
    onNewJobsFound,
  } = options

  const [newJobs, setNewJobs] = useState<JobPosting[]>([])
  const [hasNewJobs, setHasNewJobs] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null)

  // 알림 권한 요청
  useEffect(() => {
    if (typeof window !== 'undefined') {
      requestNotificationPermission()
    }
  }, [])

  // 초기화
  useEffect(() => {
    if (jobPostings.length > 0) {
      initializeJobStorage(jobPostings)
    }
  }, []) // 최초 1회만 실행

  // 공고 체크 함수
  const checkNow = useCallback(async () => {
    if (jobPostings.length === 0 || isChecking) return

    setIsChecking(true)
    try {
      const result = await checkForNewJobPostings(jobPostings)
      
      setNewJobs(result.newJobs)
      setHasNewJobs(result.hasNewJobs)
      setLastCheckTime(new Date())

      if (result.hasNewJobs && onNewJobsFound) {
        onNewJobsFound(result.newJobs)
      }
    } catch (error) {
      console.error('Failed to check for new jobs:', error)
    } finally {
      setIsChecking(false)
    }
  }, [jobPostings, isChecking, onNewJobsFound])

  // 자동 체크
  useEffect(() => {
    if (!autoCheck || jobPostings.length === 0) return

    // 첫 체크는 약간의 지연 후 실행
    const initialTimeout = setTimeout(() => {
      checkNow()
    }, 2000)

    // 주기적 체크
    const interval = setInterval(() => {
      checkNow()
    }, checkInterval)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [autoCheck, checkInterval, jobPostings, checkNow])

  // 새 공고 알림 제거
  const clearNewJobs = useCallback(() => {
    setNewJobs([])
    setHasNewJobs(false)
  }, [])

  return {
    newJobs,
    hasNewJobs,
    isChecking,
    lastCheckTime,
    checkNow,
    clearNewJobs,
  }
}

