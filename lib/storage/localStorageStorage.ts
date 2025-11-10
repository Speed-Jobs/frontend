// localStorage 기반 저장소 구현

import { JobPosting, JobPostingStorage } from './types'

export class LocalStorageJobStorage implements JobPostingStorage {
  private jobPostingsKey = 'jobPostingsSnapshot'
  private lastCheckTimeKey = 'jobPostingsLastCheckTime'

  async getJobPostings(): Promise<JobPosting[]> {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.jobPostingsKey)
      if (!stored) return []
      return JSON.parse(stored)
    } catch (error) {
      console.error('Failed to get job postings from localStorage:', error)
      return []
    }
  }

  async saveJobPostings(jobs: JobPosting[]): Promise<void> {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.jobPostingsKey, JSON.stringify(jobs))
    } catch (error) {
      console.error('Failed to save job postings to localStorage:', error)
      // localStorage 용량 초과 시 최근 N개만 저장
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        const recentJobs = jobs.slice(-1000) // 최근 1000개만 저장
        localStorage.setItem(this.jobPostingsKey, JSON.stringify(recentJobs))
      }
    }
  }

  async hasJobPosting(jobId: number): Promise<boolean> {
    const jobs = await this.getJobPostings()
    return jobs.some(job => job.id === jobId)
  }

  async addJobPostings(jobs: JobPosting[]): Promise<void> {
    const existing = await this.getJobPostings()
    const existingIds = new Set(existing.map(job => job.id))
    const newJobs = jobs.filter(job => !existingIds.has(job.id))
    
    if (newJobs.length > 0) {
      await this.saveJobPostings([...existing, ...newJobs])
    }
  }

  async getLastCheckTime(): Promise<Date | null> {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(this.lastCheckTimeKey)
      if (!stored) return null
      return new Date(stored)
    } catch (error) {
      console.error('Failed to get last check time from localStorage:', error)
      return null
    }
  }

  async saveLastCheckTime(date: Date): Promise<void> {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.lastCheckTimeKey, date.toISOString())
    } catch (error) {
      console.error('Failed to save last check time to localStorage:', error)
    }
  }
}

