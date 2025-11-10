// 저장소 인터페이스 및 타입 정의

export interface JobPosting {
  id: number
  title: string
  company: string
  location: string
  employment_type: string
  experience: string
  crawl_date: string
  posted_date: string
  expired_date: string | null
  description: string
  meta_data?: {
    job_category?: string
    salary?: string
    benefits?: string[]
    tech_stack?: string[]
  }
}

export interface JobPostingStorage {
  // 공고 목록 가져오기
  getJobPostings(): Promise<JobPosting[]>
  
  // 공고 저장
  saveJobPostings(jobs: JobPosting[]): Promise<void>
  
  // 특정 공고 존재 여부 확인
  hasJobPosting(jobId: number): Promise<boolean>
  
  // 새로운 공고 추가
  addJobPostings(jobs: JobPosting[]): Promise<void>
  
  // 마지막 체크 시간 가져오기
  getLastCheckTime(): Promise<Date | null>
  
  // 마지막 체크 시간 저장
  saveLastCheckTime(date: Date): Promise<void>
}

