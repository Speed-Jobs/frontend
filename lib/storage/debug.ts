// 디버깅 및 테스트 유틸리티

import { createJobStorage } from './factory'
import { JobPosting } from './types'

export async function getStorageDebugInfo() {
  const storage = createJobStorage()
  
  try {
    const storedJobs = await storage.getJobPostings()
    const lastCheckTime = await storage.getLastCheckTime()
    
    return {
      storedJobsCount: storedJobs.length,
      lastCheckTime: lastCheckTime,
      hasStoredData: storedJobs.length > 0,
    }
  } catch (error) {
    console.error('Failed to get storage debug info:', error)
    return {
      storedJobsCount: 0,
      lastCheckTime: null,
      hasStoredData: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function clearStorage() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('jobPostingsSnapshot')
    localStorage.removeItem('jobPostingsLastCheckTime')
    return { success: true }
  } catch (error) {
    console.error('Failed to clear storage:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function simulateNewJobs(currentJobs: JobPosting[], count: number = 1): Promise<JobPosting[]> {
  const storage = createJobStorage()
  
  try {
    // 저장된 공고 가져오기
    const storedJobs = await storage.getJobPostings()
    
    // 현재 공고에서 일부를 제외한 버전을 저장 (새로운 공고처럼 보이게)
    const jobsToKeep = storedJobs.length > count 
      ? storedJobs.slice(0, storedJobs.length - count)
      : []
    
    await storage.saveJobPostings(jobsToKeep)
    
    // 제외된 공고들을 반환 (이것들이 "새로운" 공고로 감지됨)
    return storedJobs.slice(-count)
  } catch (error) {
    console.error('Failed to simulate new jobs:', error)
    return []
  }
}

