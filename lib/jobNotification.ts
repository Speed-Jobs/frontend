// 공고 비교 및 알림 로직

import { JobPosting, JobPostingStorage } from './storage/types'
import { createJobStorage } from './storage/factory'
import { sendNewJobNotifications } from './notifications/browser'

// 공고 고유성 판단 (ID가 있으면 ID 사용, 없으면 제목+회사+날짜 조합)
function getJobUniqueKey(job: JobPosting): string {
  if (job.id) {
    return `id:${job.id}`
  }
  return `key:${job.title}|${job.company}|${job.posted_date}`
}

// 새로운 공고 찾기
export function findNewJobPostings(
  currentJobs: JobPosting[],
  storedJobs: JobPosting[]
): JobPosting[] {
  const storedKeys = new Set(
    storedJobs.map(job => getJobUniqueKey(job))
  )

  return currentJobs.filter(job => {
    const key = getJobUniqueKey(job)
    return !storedKeys.has(key)
  })
}

// 공고 비교 및 알림 발송
export async function checkForNewJobPostings(
  currentJobs: JobPosting[],
  storage?: JobPostingStorage
): Promise<{
  newJobs: JobPosting[]
  hasNewJobs: boolean
}> {
  const jobStorage = storage || createJobStorage()
  
  try {
    // 저장된 공고 가져오기
    const storedJobs = await jobStorage.getJobPostings()
    
    // 새로운 공고 찾기
    const newJobs = findNewJobPostings(currentJobs, storedJobs)
    
    // 새로운 공고가 있으면
    if (newJobs.length > 0) {
      // 알림 발송
      await sendNewJobNotifications(newJobs)
      
      // 저장소 업데이트
      await jobStorage.saveJobPostings(currentJobs)
      await jobStorage.saveLastCheckTime(new Date())
    } else {
      // 마지막 체크 시간만 업데이트
      await jobStorage.saveLastCheckTime(new Date())
    }
    
    return {
      newJobs,
      hasNewJobs: newJobs.length > 0,
    }
  } catch (error) {
    console.error('Failed to check for new job postings:', error)
    return {
      newJobs: [],
      hasNewJobs: false,
    }
  }
}

// 초기화: 현재 공고를 저장소에 저장 (첫 실행 시)
export async function initializeJobStorage(
  currentJobs: JobPosting[],
  storage?: JobPostingStorage
): Promise<void> {
  const jobStorage = storage || createJobStorage()
  
  try {
    const storedJobs = await jobStorage.getJobPostings()
    
    // 저장된 공고가 없으면 초기화
    if (storedJobs.length === 0) {
      await jobStorage.saveJobPostings(currentJobs)
      await jobStorage.saveLastCheckTime(new Date())
    }
  } catch (error) {
    console.error('Failed to initialize job storage:', error)
  }
}

