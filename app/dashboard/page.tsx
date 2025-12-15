'use client'

import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import NotificationToast from '@/components/NotificationToast'
import jobPostingsData from '@/data/jobPostings.json'
import { useJobNotifications } from '@/hooks/useJobNotifications'
import DarkDashboardCard from '@/components/dashboard/DarkDashboardCard'
import CombinedTrendChart from '@/components/dashboard/CombinedTrendChart'
import CompanyInsightView from '@/components/dashboard/CompanyInsightView'

// 무거운 컴포넌트들을 지연 로딩
const CompanyNetworkBubble = lazy(() => import('@/components/dashboard/CompanyNetworkBubble'))
const NewRecruitmentCalendar = lazy(() => import('@/components/dashboard/NewRecruitmentCalendar'))
const HotJobsList = lazy(() => import('@/components/dashboard/HotJobsList'))
const JobRoleSkillSetGuide = lazy(() => import('@/components/dashboard/JobRoleSkillSetGuide'))
const JobRoleStatisticsChart = lazy(() => import('@/components/dashboard/JobRoleStatisticsChart'))
const SkillTrendAndCloud = lazy(() => import('@/components/dashboard/SkillTrendAndCloud'))
const JobDifficultyGauges = lazy(() => import('@/components/dashboard/JobDifficultyGauges'))

// 회사 그룹 정의
const COMPANY_GROUPS: Record<string, string[]> = {
  "toss": ["토스%", "토스뱅크%", "토스증권%", "비바리퍼블리카%", "AICC%"],
  "kakao": ["카카오%"],
  "hanwha": ["한화시스템%", "한화시스템템%", "한화시스템/ICT%", "한화시스템·ICT%"],
  "hyundai autoever": ["현대오토에버%"],
  "woowahan": ["우아한%", "배달의민족", "배민"],
  "coupang": ["쿠팡%", "Coupang%"],
  "line": ["LINE%", "라인%"],
  "naver": ["NAVER%", "네이버%"],
  "lg cns": ["LG_CNS%", "LG CNS%"],
}

// 한글 회사명을 영어 회사명으로 매핑
const COMPANY_NAME_MAP: Record<string, string> = {
  "토스": "Toss",
  "토스뱅크": "Toss",
  "토스증권": "Toss",
  "비바리퍼블리카": "Toss",
  "AICC": "Toss",
  "카카오": "Kakao",
  "한화시스템": "Hanwha Systems",
  "한화시스템템": "Hanwha Systems",
  "현대오토에버": "Hyundai Autoever",
  "우아한형제들": "woowahan",
  "우아한": "woowahan",
  "배달의민족": "woowahan",
  "배민": "woowahan",
  "쿠팡": "Coupang",
  "라인": "LINE",
  "네이버": "NAVER",
  "LG CNS": "LG CNS",
  "LG_CNS": "LG CNS",
}

// COMPANY_GROUPS 키를 영어 회사명으로 매핑
const COMPANY_KEY_TO_NAME: Record<string, string> = {
  "toss": "Toss",
  "kakao": "Kakao",
  "hanwha": "Hanwha Systems",
  "hyundai autoever": "Hyundai Autoever",
  "woowahan": "woowahan",
  "coupang": "Coupang",
  "line": "LINE",
  "naver": "NAVER",
  "lg cns": "LG CNS",
}

// 한글 회사명을 영어 회사명으로 변환하는 함수
const getEnglishCompanyName = (koreanName: string): string => {
  if (!koreanName) return koreanName
  
  // 정확히 일치하는 경우
  if (COMPANY_NAME_MAP[koreanName]) {
    return COMPANY_NAME_MAP[koreanName]
  }
  
  // 부분 일치 확인
  for (const [korean, english] of Object.entries(COMPANY_NAME_MAP)) {
    if (koreanName.includes(korean) || korean.includes(koreanName)) {
      return english
    }
  }
  
  // COMPANY_GROUPS에서 매칭되는 키 찾기
  const normalizeCompanyName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '').replace(/[\/\(\)]/g, '').trim()
  }
  
  const cleanName = normalizeCompanyName(koreanName)
  for (const [key, keywords] of Object.entries(COMPANY_GROUPS)) {
    const matched = keywords.some(keyword => {
      const cleanKeyword = keyword.replace(/%/g, '').toLowerCase().trim()
      return cleanName.includes(cleanKeyword) || cleanKeyword.includes(cleanName)
    })
    if (matched) {
      // COMPANY_KEY_TO_NAME에서 영어 회사명 가져오기
      if (COMPANY_KEY_TO_NAME[key]) {
        return COMPANY_KEY_TO_NAME[key]
      }
      // 없으면 키를 영어 회사명으로 변환 (첫 글자 대문자)
      return key.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }
  }
  
  // 키 자체가 영어 회사명일 수도 있으므로 확인
  const normalizedKey = koreanName.toLowerCase().trim()
  if (COMPANY_KEY_TO_NAME[normalizedKey]) {
    return COMPANY_KEY_TO_NAME[normalizedKey]
  }
  
  // 매칭되지 않으면 원본 반환
  return koreanName
}

// 영어 회사명을 한글 회사명으로 변환하는 함수
const getKoreanCompanyName = (englishName: string): string => {
  if (!englishName) return englishName
  
  const normalizeCompanyName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '').replace(/[\/\(\)]/g, '').trim()
  }
  
  const normalizedEnglish = normalizeCompanyName(englishName)
  
  // COMPANY_NAME_MAP의 역매핑 (영어 -> 한글)
  for (const [korean, english] of Object.entries(COMPANY_NAME_MAP)) {
    const normalizedEnglishMap = normalizeCompanyName(english)
    if (normalizedEnglish === normalizedEnglishMap || normalizedEnglish.includes(normalizedEnglishMap) || normalizedEnglishMap.includes(normalizedEnglish)) {
      // 가장 일반적인 한글 이름 반환 (토스, 카카오 등)
      if (korean === "토스" || korean === "카카오" || korean === "네이버" || korean === "라인" || korean === "쿠팡" || korean === "LG CNS" || korean === "한화시스템" || korean === "현대오토에버" || korean === "우아한형제들") {
        return korean
      }
      return korean
    }
  }
  
  // COMPANY_KEY_TO_NAME의 역매핑
  for (const [key, english] of Object.entries(COMPANY_KEY_TO_NAME)) {
    const normalizedEnglishMap = normalizeCompanyName(english)
    if (normalizedEnglish === normalizedEnglishMap || normalizedEnglish.includes(normalizedEnglishMap) || normalizedEnglishMap.includes(normalizedEnglish)) {
      // COMPANY_GROUPS에서 해당 키의 첫 번째 한글 키워드 반환
      const keywords = COMPANY_GROUPS[key]
      if (keywords && keywords.length > 0) {
        const koreanKeyword = keywords[0].replace(/%/g, '').trim()
        // 가장 일반적인 이름 반환
        if (key === "woowahan") return "우아한형제들"
        if (key === "toss") return "토스"
        if (key === "kakao") return "카카오"
        if (key === "naver") return "네이버"
        if (key === "line") return "라인"
        if (key === "coupang") return "쿠팡"
        if (key === "lg cns") return "LG CNS"
        if (key === "hanwha") return "한화시스템"
        if (key === "hyundai autoever") return "현대오토에버"
        return koreanKeyword
      }
    }
  }
  
  // 매칭되지 않으면 원본 반환
  return englishName
}

// COMPANY_GROUPS를 기반으로 companyKeywords 문자열 생성
const getCompanyKeywords = (): string => {
  const keywords: string[] = []
  Object.values(COMPANY_GROUPS).forEach(group => {
    group.forEach(keyword => {
      // % 기호 제거하고 키워드 추가
      const cleanKeyword = keyword.replace(/%/g, '')
      if (!keywords.includes(cleanKeyword)) {
        keywords.push(cleanKeyword)
      }
    })
  })
  return keywords.join(',')
}

// 회사명을 영어 소문자 키워드로 변환하는 함수
const getCompanyKeyword = (companyName: string): string | null => {
  if (!companyName) return null
  
  const cleanCompanyName = companyName.toLowerCase().trim()
  
  // COMPANY_GROUPS에서 회사명과 매칭되는 키 찾기
  for (const [key, keywords] of Object.entries(COMPANY_GROUPS)) {
    // 키워드 목록에서 회사명과 매칭되는지 확인
    const matched = keywords.some(keyword => {
      const cleanKeyword = keyword.replace(/%/g, '').toLowerCase().trim()
      // 정확히 일치하거나 포함 관계 확인
      return cleanKeyword === cleanCompanyName || 
             cleanCompanyName.includes(cleanKeyword) || 
             cleanKeyword.includes(cleanCompanyName)
    })
    if (matched) {
      return key // 영어 소문자 키 반환
    }
  }
  
  // 직접 매칭되지 않으면 회사명을 소문자로 변환하여 키와 직접 비교
  const normalizedName = cleanCompanyName.replace(/\s+/g, ' ')
  for (const [key] of Object.entries(COMPANY_GROUPS)) {
    const keyNormalized = key.toLowerCase().trim()
    // 키와 회사명이 유사한지 확인
    if (keyNormalized === normalizedName || 
        normalizedName.includes(keyNormalized) || 
        keyNormalized.includes(normalizedName)) {
      return key
    }
  }
  
  return null
}

export default function Dashboard() {
  const { newJobs, hasNewJobs, clearNewJobs } = useJobNotifications({
    jobPostings: jobPostingsData,
    autoCheck: true,
    checkInterval: 5 * 60 * 1000, // 5분마다 체크
  })
  const ourCompany = 'SK AX'

  // API 상태 관리
  const [jobPostingsTrendTimeframe, setJobPostingsTrendTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly')
  const [jobPostingsTrendApiData, setJobPostingsTrendApiData] = useState<Array<{ period: string; count: number }>>([])
  const [isLoadingJobPostingsTrend, setIsLoadingJobPostingsTrend] = useState(false)
  const [jobPostingsTrendError, setJobPostingsTrendError] = useState<string | null>(null)

  const [companyRecruitmentTimeframe, setCompanyRecruitmentTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly')
  const [companyRecruitmentApiData, setCompanyRecruitmentApiData] = useState<{
    companies: Array<{ id: number; name: string; key: string }>
    activities: Array<{ period: string; counts: Record<string, number> }>
  } | null>(null)
  const [isLoadingCompanyRecruitment, setIsLoadingCompanyRecruitment] = useState(false)
  const [companyRecruitmentError, setCompanyRecruitmentError] = useState<string | null>(null)
  const [selectedRecruitmentCompanies, setSelectedRecruitmentCompanies] = useState<string[]>([])
  const [isManualSelection, setIsManualSelection] = useState(false) // 사용자가 수동으로 선택했는지 추적
  const [isLoadingInsight, setIsLoadingInsight] = useState(false) // 인사이트 로딩 상태
  
  // 중복 요청 방지를 위한 ref
  const fetchingJobPostingsTrendRef = useRef(false)
  const fetchingCompanyRecruitmentRef = useRef(false)
  const lastJobPostingsTrendParamsRef = useRef<string>('')
  const lastCompanyRecruitmentParamsRef = useRef<string>('')
  
  // 캐싱을 위한 ref
  const apiCacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map())
  
  // recruitmentCompanies 이전 값 유지를 위한 ref
  const previousRecruitmentCompaniesRef = useRef<Array<{ id: number; key: string; name: string; englishName: string; color: string }>>([])
  
  // companyRecruitmentChartData 이전 값 유지를 위한 ref
  const previousCompanyRecruitmentChartDataRef = useRef<Array<{ period: string; [key: string]: string | number }>>([])
  const CACHE_DURATION = 30000 // 30초 캐시

  // 공통 유틸리티 함수들
  const getTimeframeParam = (timeframe: 'Daily' | 'Weekly' | 'Monthly'): string => {
    const timeframeMap: Record<string, string> = {
      'Daily': 'daily',
      'Weekly': 'weekly',
      'Monthly': 'monthly'
    }
    return timeframeMap[timeframe] || 'daily'
  }

  // 캐시에서 데이터 가져오기
  const getCachedData = (key: string) => {
    const cached = apiCacheRef.current.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  // 캐시에 데이터 저장
  const setCachedData = (key: string, data: any) => {
    apiCacheRef.current.set(key, { data, timestamp: Date.now() })
  }

  // API 호출 헬퍼 함수 (캐싱 및 타임아웃 포함)
  const fetchJobPostingsTrendApi = async (
    timeframe: string,
    companyKeyword?: string | null,
    includeInsight: boolean = false
  ) => {
    const cacheKey = `job-postings-trend-${timeframe}-${companyKeyword || 'all'}-${includeInsight}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }

    let apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-postings-trend?timeframe=${timeframe}&include_insight=${includeInsight}`
    if (companyKeyword) {
      apiUrl += `&company_keyword=${encodeURIComponent(companyKeyword)}`
    }

    // 타임아웃 설정 (인사이트 포함 시 60초, 그 외 30초)
    const controller = new AbortController()
    const timeoutDuration = includeInsight ? 60000 : 30000
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration)

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 200)}`)
      }

      const result = await response.json()
      if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
        setCachedData(cacheKey, result.data)
        return result.data
      }
      throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        const timeoutMessage = includeInsight 
          ? '인사이트 생성에 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.'
          : '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        throw new Error(timeoutMessage)
      }
      throw error
    }
  }

  // 배치 API 호출 함수 (여러 회사 데이터를 한 번에 가져오기)
  const fetchCompanyRecruitmentBatchApi = async (timeframe: string) => {
    const cacheKey = `company-recruitment-batch-${timeframe}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }

    const companyKeywords = getCompanyKeywords()
    const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/companies/recruitment-activity?timeframe=${timeframe}&company_keywords=${encodeURIComponent(companyKeywords)}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
        setCachedData(cacheKey, result.data)
        return result.data
      }
      throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다.')
      }
      throw error
    }
  }

  // 병렬 요청 제한 함수 (동시에 최대 N개만 실행, 순서 보장)
  const limitConcurrency = async <T,>(
    tasks: (() => Promise<T>)[],
    limit: number
  ): Promise<T[]> => {
    const results: (T | null)[] = new Array(tasks.length).fill(null)
    const executing: Array<{ index: number; promise: Promise<void> }> = []

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const promise = task().then(result => {
        results[i] = result
        const execIndex = executing.findIndex(e => e.index === i)
        if (execIndex !== -1) {
          executing.splice(execIndex, 1)
        }
      })
      executing.push({ index: i, promise })

      if (executing.length >= limit) {
        await Promise.race(executing.map(e => e.promise))
      }
    }

    await Promise.all(executing.map(e => e.promise))
    return results.filter((r): r is T => r !== null)
  }

  // 회사명 변환 헬퍼 함수
  const convertCompanyNames = (companies: any[]) => {
    return companies.map((comp: any) => ({
      ...comp,
      company_name: getEnglishCompanyName(comp.company_name || comp.name)
    }))
  }

  // 트렌드 데이터 포맷팅 함수
  const formatTrendData = (trends: any[]): Array<{ period: string; count: number }> => {
    if (!Array.isArray(trends) || trends.length === 0) {
      return []
    }
    return trends.map(item => ({
      period: item.period,
      count: item.count || 0
    }))
  }

  // 기간 정렬 함수
  const sortPeriods = (periods: string[]): string[] => {
    return [...periods].sort((a, b) => {
      const parsePeriod = (period: string): number => {
        const monthMatch = period.match(/(\d+)월/)
        const weekMatch = period.match(/(\d+)주/)
        if (monthMatch && weekMatch) {
          const month = parseInt(monthMatch[1])
          const week = parseInt(weekMatch[1])
          return month * 100 + week
        }
        return 0
      }
      return parsePeriod(a) - parsePeriod(b)
    })
  }
  
  // 새로운 API 응답 형식에 대한 상태
  const [combinedTrendData, setCombinedTrendData] = useState<{
    trends: Array<{ period: string; count: number }>
    insight: any
    selectedCompany: { 
      company_id: number
      company_name: string
      total_count: number
      trends?: Array<{ period: string; count: number }>
    } | null
    top_companies?: Array<{ company_id?: number; company_name: string; total_count?: number; market_share?: number }>
  } | null>(null)

  // 스킬 트렌드 관련 상태 (기본값: 전체)
  const [selectedSkillCompany, setSelectedSkillCompany] = useState<string>('')
  // 스킬 클라우드용 회사 선택 (스킬 트렌드 회사와 동기화)
  const [selectedSkillCloudCompany, setSelectedSkillCloudCompany] = useState<string>('전체')
  // 스킬 클라우드용 연도 선택 (기본값: 전체)
  const [selectedSkillCloudYear, setSelectedSkillCloudYear] = useState<string>('전체')
  const [skillTrendData, setSkillTrendData] = useState<Array<{
    month: string
    [skill: string]: string | number
  }>>([])
  const [isLoadingSkillTrend, setIsLoadingSkillTrend] = useState(false)
  const [skillTrendError, setSkillTrendError] = useState<string | null>(null)

  // 직군별 통계 상태
  const [selectedExpertCategory, setSelectedExpertCategory] = useState<'Tech' | 'Biz' | 'BizSupporting'>('Tech')
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null)
  const [jobRoleStatisticsViewMode, setJobRoleStatisticsViewMode] = useState<'Weekly' | 'Monthly'>('Weekly')
  const [selectedJobRoleCompanyFilter, setSelectedJobRoleCompanyFilter] = useState<string>('전체') // 직군별 통계 경쟁사 필터
  const [jobRoleStatisticsApiData, setJobRoleStatisticsApiData] = useState<any>(null)
  const [isLoadingJobRoleStatistics, setIsLoadingJobRoleStatistics] = useState(false)
  const [jobRoleStatisticsError, setJobRoleStatisticsError] = useState<string | null>(null)

  // 직무 인재 수급 난이도 지수 API 상태
  const [jobDifficultyApiData, setJobDifficultyApiData] = useState<{
    total_insight: any
    position_insight: any
    industry_insight: any
  } | null>(null)
  const [isLoadingJobDifficulty, setIsLoadingJobDifficulty] = useState(false)
  const [jobDifficultyError, setJobDifficultyError] = useState<string | null>(null)
  const [selectedDifficultyPosition, setSelectedDifficultyPosition] = useState<string>('')
  const [selectedDifficultyIndustry, setSelectedDifficultyIndustry] = useState<string>('')

  // HHI 집중도 분석 API 상태
  const [hhiAnalysisApiData, setHhiAnalysisApiData] = useState<{
    analysis_type: string
    period: { start: string; end: string }
    total_insight: any
    position_insight: any
    industry_insight: any
  } | null>(null)
  const [isLoadingHhiAnalysis, setIsLoadingHhiAnalysis] = useState(false)
  const [hhiAnalysisError, setHhiAnalysisError] = useState<string | null>(null)

  // 경쟁사 최신 공고 API 상태
  const [competitorPostsApiData, setCompetitorPostsApiData] = useState<Array<{
    id?: number
    companyName?: string
    company?: string
    title?: string
    role?: string
    registeredAt?: { year: number; month: number; day: number }
    crawledAt?: { year: number; month: number; day: number }
    postedDate?: string
    employmentType?: string
    [key: string]: any // 추가 필드 지원
  }>>([])
  const [isLoadingCompetitorPosts, setIsLoadingCompetitorPosts] = useState(false)
  const [competitorPostsError, setCompetitorPostsError] = useState<string | null>(null)

  // 직군별 채용 공고 데이터 계산 (직군별 통계의 직군 종류 사용)
  const jobRoleData = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // 날짜 필터링 (더 관대하게 - 최근 30일로 확장)
    const recentJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= lastWeek
      } catch {
        return false
      }
    })

    const previousJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= twoWeeksAgo && postedDate < lastWeek
      } catch {
        return false
      }
    })

    // 최근 공고가 없으면 전체 데이터 사용 (최대 100개)
    const jobsToAnalyze = recentJobs.length > 0 ? recentJobs : jobPostingsData.slice(0, 100)
    const previousJobsToAnalyze = previousJobs.length > 0 ? previousJobs : []

    // 직군별 통계에 사용되는 모든 직군 목록 (SKAX 직무기술서 기준)
    const allRoles = [
      // Tech 전문가
      'Software Development',
      'Factory AX Engineering',
      'Solution Development',
      'Cloud/Infra Engineering',
      'Architect',
      'Project Management',
      'Quality Management',
      'AI',
      '정보보호',
      // Biz 전문가
      'Sales',
      'Domain Expert',
      'Consulting',
      // Biz.Supporting 전문가
      'Biz. Supporting',
    ]

    // 각 직군에 대한 키워드 매핑 (더 포괄적으로)
    const roleKeywords: Record<string, string[]> = {
      'Software Development': ['software', 'development', '개발', '소프트웨어', '프로그래밍', 'programming', 'frontend', 'backend', 'fullstack', '프론트엔드', '백엔드', 'full-stack', 'developer', '개발자', 'react', 'vue', 'angular', 'node', 'java', 'python', 'javascript', 'typescript'],
      'Factory AX Engineering': ['factory', 'ax', 'engineering', '공장', '제조', '시뮬레이션', 'simulation', '기구설계', '전장', '제어', '자동화', 'automation', 'plc', 'scada'],
      'Solution Development': ['solution', '솔루션', 'erp', 'fcm', 'scm', 'hcm', 'biz', '비즈니스', 'sap', 'oracle'],
      'Cloud/Infra Engineering': ['cloud', 'infra', 'infrastructure', '인프라', '클라우드', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'devops', '시스템', '네트워크', 'database', '데이터베이스', 'postgresql', 'mysql', 'mongodb', 'redis'],
      'Architect': ['architect', '아키텍트', '설계', 'architecture', 'system design', '시스템 설계', 'solution architect'],
      'Project Management': ['project', 'management', 'pm', '프로젝트', '관리', '프로젝트 매니저', '프로젝트 관리', 'pmo', 'program manager'],
      'Quality Management': ['quality', 'qa', 'qc', '품질', '테스트', 'test', 'testing', 'qa engineer', 'quality assurance'],
      'AI': ['ai', 'artificial intelligence', '인공지능', 'machine learning', 'ml', '딥러닝', 'deep learning', '데이터', 'data', 'generative ai', '생성형 ai', 'tensorflow', 'pytorch', 'nlp', 'computer vision'],
      '정보보호': ['정보보호', '보안', 'security', 'cybersecurity', 'cyber', '보안 진단', 'compliance', 'governance', 'security engineer'],
      'Sales': ['sales', '영업', '세일즈', '영업사원', 'account', '고객', 'account manager', 'business development'],
      'Domain Expert': ['domain', 'expert', '도메인', '전문가', '금융', '제조', '공공', 'b2c', 'industry expert'],
      'Consulting': ['consulting', '컨설팅', '컨설턴트', 'esg', 'she', 'crm', 'scm', 'consultant'],
      'Biz. Supporting': ['strategy', 'planning', '전략', '기획', 'hr', '인사', '재무', 'financial', 'management', '경영', 'human resources'],
    }

    const roleCounts: Record<string, { recent: number; previous: number }> = {}
    
    // 모든 직군 초기화
    allRoles.forEach(role => {
      roleCounts[role] = { recent: 0, previous: 0 }
    })

    // 최근 공고 카운트
    jobsToAnalyze.forEach(job => {
      const title = (job.title || '').toLowerCase()
      const description = (job.description || '').toLowerCase()
      const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
      const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
      const text = `${title} ${description} ${techStack} ${jobCategory}`

      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].recent++
        }
      })
    })

    // 이전 공고 카운트
    previousJobsToAnalyze.forEach(job => {
      const title = (job.title || '').toLowerCase()
      const description = (job.description || '').toLowerCase()
      const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
      const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
      const text = `${title} ${description} ${techStack} ${jobCategory}`

      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].previous++
        }
      })
    })

    // 13개 직무 모두 표시 (공고가 없는 직군도 0으로 표시)
    return allRoles.map(role => {
      const counts = roleCounts[role] || { recent: 0, previous: 0 }
      return {
        role,
        count: counts.recent,
        change: counts.previous > 0 
          ? Math.round(((counts.recent - counts.previous) / counts.previous) * 100)
          : counts.recent > 0 ? 100 : 0,
      }
    }).sort((a, b) => {
      // 공고 수가 많은 순으로 정렬, 같으면 직무명 순서 유지
      if (b.count !== a.count) {
        return b.count - a.count
      }
      return allRoles.indexOf(a.role) - allRoles.indexOf(b.role)
    })
  }, [])

  // 핵심 기술스택 Top 5
  const techStackData = useMemo(() => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastWeek
    })

    const techCounts: Record<string, number> = {}
    
    recentJobs.forEach(job => {
      job.meta_data?.tech_stack?.forEach(tech => {
        techCounts[tech] = (techCounts[tech] || 0) + 1
      })
    })

    return Object.entries(techCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item, index) => ({ rank: index + 1, ...item }))
  }, [])

  // 이번주 급증 키워드
  const surgingKeywordsData = useMemo(() => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastWeek
    })

    const previousJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= twoWeeksAgo && postedDate < lastWeek
    })

    const keywordCounts: Record<string, { recent: number; previous: number }> = {}
    
    const keywords = ['MLOps', 'Rust', 'MSA 설계', 'Next.js', 'Terraform', 'Kubernetes', 'Docker', 'React', 'Python', 'AWS']

    keywords.forEach(keyword => {
      keywordCounts[keyword] = { recent: 0, previous: 0 }
    })

    recentJobs.forEach(job => {
      const text = `${job.title} ${job.description || ''}`.toLowerCase()
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          keywordCounts[keyword].recent++
        }
      })
    })

    previousJobs.forEach(job => {
      const text = `${job.title} ${job.description || ''}`.toLowerCase()
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          keywordCounts[keyword].previous++
        }
      })
    })

    return Object.entries(keywordCounts)
      .map(([keyword, counts]) => ({
        keyword,
        change: counts.previous > 0
          ? Math.round(((counts.recent - counts.previous) / counts.previous) * 100)
          : counts.recent > 0 ? 1000 : 0,
      }))
      .filter(item => item.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 5)
  }, [])

  // 채용 공채 일정 API 상태
  const [recruitmentScheduleData, setRecruitmentScheduleData] = useState<Array<{
    date: string
    startDate: string
    endDate: string
    company: string
    type: '신입공채' | '인턴십' | '공개채용'
    title?: string
    stage?: string
  }>>([])
  const [isLoadingRecruitmentSchedule, setIsLoadingRecruitmentSchedule] = useState(false)
  const [recruitmentScheduleError, setRecruitmentScheduleError] = useState<string | null>(null)

  // 채용 공채 일정 API 호출
  useEffect(() => {
    const fetchRecruitmentSchedule = async () => {
      try {
        setIsLoadingRecruitmentSchedule(true)
        setRecruitmentScheduleError(null)
        
        const currentYear = new Date().getFullYear()
        const startDate = `${currentYear}-01-01`
        const endDate = `${currentYear}-12-31`
        
        // COMPANY_GROUPS의 모든 회사 키워드 수집
        const companyKeys = Object.keys(COMPANY_GROUPS)
        const companyKeywords = companyKeys.join(',')
        
        const allEvents: Array<{
          date: string
          startDate: string
          endDate: string
          company: string
          type: '신입공채' | '인턴십' | '공개채용'
          title?: string
          stage?: string
        }> = []
        
        // API 응답의 type을 UI 타입으로 변환하는 함수
        // API 응답은 한글("신입", "경력")을 반환하므로 이를 UI 타입으로 변환
        const convertApiTypeToEventType = (apiType: string): '신입공채' | '공개채용' => {
          return apiType === '신입' ? '신입공채' : '공개채용'
        }
        
        // 각 타입(Entry-level/Experienced)에 대해 API 호출 (전체 회사 한 번에 조회)
        // API 스펙에 따르면 type은 영어("Entry-level", "Experienced")를 받습니다.
        // encodeURIComponent를 사용하여 URL 인코딩 문제를 방지합니다.
        const typeMapping = [
          { apiType: 'Entry-level', responseType: '신입' },
          { apiType: 'Experienced', responseType: '경력' }
        ]
        
        for (const { apiType, responseType } of typeMapping) {
          try {
            const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/recruitment-schedule/companies?type=${encodeURIComponent(apiType)}&data_type=actual&start_date=${startDate}&end_date=${endDate}&company_keywords=${encodeURIComponent(companyKeywords)}`
            
            const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              mode: 'cors',
              credentials: 'omit',
            })
            
            if (!response.ok) {
              continue // 해당 타입에 대한 데이터가 없으면 건너뛰기
            }
            
            const result = await response.json()
            
            if (result.status === 200 && result.code === 'SUCCESS' && result.data?.schedules) {
              
              // 각 스케줄의 각 스테이지에 대해 이벤트 생성
              result.data.schedules.forEach((schedule: any) => {
                const scheduleCompanyName = schedule.company_name || ''
                
                if (!schedule.stages || schedule.stages.length === 0) {
                  return
                }
                
                schedule.stages.forEach((stage: any) => {
                  // type 변환: API 응답의 type(한글)을 UI 타입으로 변환
                  const eventType: '신입공채' | '인턴십' | '공개채용' = 
                    convertApiTypeToEventType(schedule.type || responseType)
                  
                  // start_date와 end_date를 모두 사용하여 기간 설정
                  if (stage.start_date && stage.end_date) {
                    allEvents.push({
                      date: stage.start_date, // 호환성을 위해 유지
                      startDate: stage.start_date,
                      endDate: stage.end_date,
                      company: scheduleCompanyName,
                      type: eventType,
                      title: `${scheduleCompanyName} ${stage.stage}`,
                      stage: stage.stage
                    })
                  }
                })
              })
            }
          } catch (error) {
            // 개별 API 호출 실패는 무시하고 계속 진행
            continue
          }
        }
        
        // 날짜순으로 정렬 (startDate 기준)
        allEvents.sort((a, b) => {
          const dateA = new Date(a.startDate).getTime()
          const dateB = new Date(b.startDate).getTime()
          return dateA - dateB
        })
        setRecruitmentScheduleData(allEvents)
      } catch (error) {
        setRecruitmentScheduleError(error instanceof Error ? error.message : '채용 일정 데이터를 불러오는 중 오류가 발생했습니다.')
        setRecruitmentScheduleData([])
      } finally {
        setIsLoadingRecruitmentSchedule(false)
      }
    }
    
    fetchRecruitmentSchedule()
  }, [])

  // API 데이터를 JobDifficultyItem[] 형식으로 변환하는 함수
  const convertApiDataToJobDifficultyItems = useMemo(() => {
    if (!jobDifficultyApiData) return null

    const { total_insight, position_insight, industry_insight } = jobDifficultyApiData

    // interpretation.difficulty를 난이도 지수로 변환
    // "낮음" = 0-33, "보통" = 34-66, "높음" = 67-100
    const convertDifficultyToScore = (difficulty: string | undefined, yoyScore?: number): number => {
      if (difficulty === '낮음') return 25
      if (difficulty === '보통') return 50
      if (difficulty === '높음') return 75
      // difficulty가 없으면 yoyScore 기반으로 계산
      if (yoyScore !== undefined) {
        // yoyScore가 50에서 멀어질수록 난이도 높음
        const distanceFromBaseline = Math.abs(yoyScore - 50)
        return Math.min(100, Math.max(0, distanceFromBaseline * 2))
      }
      return 50 // 기본값
    }

    const result: Array<{
      name: string
      category?: 'Tech' | 'Biz' | 'BizSupporting'
      industries: string[]
      difficulty: number
      similarPostings: number
      competitorRatio: number
      recentGrowthRate: number
      avgHiringDuration: number
      yearOverYearChange: number
      insights: string[]
      yoyScore?: number
      trend?: string
    }> = []

    // 전체 시장 데이터 변환
    if (total_insight) {
      const totalYoY = total_insight.yoy_overheat_score || 0
      const totalDifficulty = convertDifficultyToScore(total_insight.interpretation?.difficulty, totalYoY)
      
      // 작년 대비 변화 계산 (현재 YoY - 50)
      const yearOverYearChange = totalYoY - 50
      
      // API에서 제공하는 인사이트 사용
      const insights: string[] = Array.isArray(total_insight.insights) ? total_insight.insights : []

      result.push({
        name: '전체 시장',
        category: undefined,
        industries: [],
        difficulty: Math.round(totalDifficulty),
        similarPostings: total_insight.total_posts || 0,
        competitorRatio: 0,
        recentGrowthRate: yearOverYearChange,
        avgHiringDuration: 0,
        yearOverYearChange: Math.round(yearOverYearChange * 10) / 10,
        insights,
        yoyScore: totalYoY,
        trend: total_insight.yoy_trend || undefined,
      })
    }

    // 직군별 데이터 변환
    if (position_insight) {
      const positionYoY = position_insight.yoy_overheat_score || 0
      const positionDifficulty = convertDifficultyToScore(position_insight.interpretation?.difficulty, positionYoY)
      const yearOverYearChange = positionYoY - 50
      
      // API에서 제공하는 인사이트 사용
      const insights: string[] = Array.isArray(position_insight.insights) ? position_insight.insights : []

      // 카테고리 분류
      const positionName = position_insight.position_name || ''
      let category: 'Tech' | 'Biz' | 'BizSupporting' | undefined = undefined
      if (['Software Development', 'Factory AX Engineering', 'Solution Development', 'Cloud/Infra Engineering', 'Architect', 'Project Management', 'Quality Management', 'AI', '정보보호'].includes(positionName)) {
        category = 'Tech'
      } else if (['Sales', 'Consulting', 'Domain Expert'].includes(positionName)) {
        category = 'Biz'
      } else if (positionName === 'Biz. Supporting') {
        category = 'BizSupporting'
      }

      // 직군별 직무(Skill set) 매핑 - API의 top_industries 사용
      const industries: string[] = []
      if (position_insight.top_industries && Array.isArray(position_insight.top_industries)) {
        industries.push(...position_insight.top_industries.map((ind: any) => ind.industry_name))
      } else {
        // fallback: 기존 매핑 사용
        const positionIndustries: Record<string, string[]> = {
          'Software Development': ['Front-end Development', 'Back-end Development', 'Mobile Development'],
          'Factory AX Engineering': ['Simulation', '기구설계', '전장/제어'],
          'Solution Development': ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution'],
          'Cloud/Infra Engineering': ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering'],
          'Architect': ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect'],
          'Project Management': ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM'],
          'Quality Management': ['PMO', 'Quality Engineering', 'Offshoring Service Professional'],
          'AI': ['AI/Data Development', 'Generative AI Development', 'Physical AI Development'],
          '정보보호': ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service'],
          'Sales': ['[금융] 제1금융', '[금융] 제2금융', '[공공/Global] 공공', '[공공/Global] Global', '[제조] 대외', '[제조] 대내 Hi-Tech', '[제조] 대내 Process', '[B2C] 통신', '[B2C] 유통/물류/서비스', '[B2C] 미디어/콘텐츠'],
          'Domain Expert': ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인'],
          'Consulting': ['ESG', 'SHE', 'CRM', 'SCM', 'ERP', 'AI'],
          'Biz. Supporting': ['Strategy Planning', 'New Biz. Development', 'Financial Management', 'Human Resource Management', 'Stakeholder Management', 'Governance & Public Management'],
        }
        industries.push(...(positionIndustries[positionName] || []))
      }

      result.push({
        name: positionName,
        category,
        industries,
        difficulty: Math.round(positionDifficulty),
        similarPostings: position_insight.total_posts || 0,
        competitorRatio: 0,
        recentGrowthRate: yearOverYearChange,
        avgHiringDuration: 0,
        yearOverYearChange: Math.round(yearOverYearChange * 10) / 10,
        insights,
        yoyScore: positionYoY,
        trend: position_insight.yoy_trend || undefined,
      })
    }

    // 산업별 데이터 변환 (직군 데이터에 추가 정보로 포함)
    if (industry_insight && position_insight) {
      const industryYoY = industry_insight.yoy_overheat_score || 0
      // interpretation.difficulty 기반으로 난이도 계산
      const industryDifficulty = convertDifficultyToScore(undefined, industryYoY)
      const yearOverYearChange = industryYoY - 50
      
      // API에서 제공하는 인사이트 사용
      const insights: string[] = Array.isArray(industry_insight.insights) ? industry_insight.insights : []

      const positionName = position_insight.position_name || ''
      let category: 'Tech' | 'Biz' | 'BizSupporting' | undefined = undefined
      if (['Software Development', 'Factory AX Engineering', 'Solution Development', 'Cloud/Infra Engineering', 'Architect', 'Project Management', 'Quality Management', 'AI', '정보보호'].includes(positionName)) {
        category = 'Tech'
      } else if (['Sales', 'Consulting', 'Domain Expert'].includes(positionName)) {
        category = 'Biz'
      } else if (positionName === 'Biz. Supporting') {
        category = 'BizSupporting'
      }

      result.push({
        name: `${positionName} - ${industry_insight.industry_name || ''}`,
        category,
        industries: [industry_insight.industry_name || ''],
        difficulty: Math.round(industryDifficulty),
        similarPostings: industry_insight.posts_count || 0,
        competitorRatio: 0,
        recentGrowthRate: yearOverYearChange,
        avgHiringDuration: 0,
        yearOverYearChange: Math.round(yearOverYearChange * 10) / 10,
        insights,
        yoyScore: industryYoY,
        trend: industry_insight.yoy_trend || undefined,
      })
    }
    
    return result.length > 0 ? result : null
  }, [jobDifficultyApiData])

  // 직무 인재 수급 난이도 지수 데이터 (API 우선, 없으면 fallback)
  const jobDifficultyData = useMemo(() => {
    // Fallback 데이터 생성 함수
    const generateFallbackData = () => {
      const now = new Date()
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    
    // 최근 공고 데이터
    const recentJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastMonth
    })

    // 작년 동기 공고 데이터
    const lastYearJobs = jobPostingsData.filter(job => {
      const postedDate = new Date(job.posted_date)
      return postedDate >= lastYear && postedDate < new Date(lastYear.getTime() + 30 * 24 * 60 * 60 * 1000)
    })

    // 직무별 키워드 매핑
    const positionKeywords: Record<string, string[]> = {
      'Software Development': ['software', '개발', 'developer', 'engineer', '프로그래밍'],
      'Factory AX Engineering': ['factory', '제조', 'ax', 'simulation', '기구설계'],
      'Solution Development': ['solution', 'erp', 'scm', 'crm', '솔루션'],
      'Cloud/Infra Engineering': ['cloud', 'infra', 'aws', 'kubernetes', 'docker', '인프라'],
      'Architect': ['architect', '아키텍트', '설계'],
      'Project Management': ['project', 'management', 'pm', '프로젝트', '관리'],
      'Quality Management': ['quality', 'qa', 'qc', '품질', '테스트'],
      'AI': ['ai', 'ml', '인공지능', '머신러닝', '딥러닝'],
      '정보보호': ['정보보호', '보안', 'security', 'cybersecurity'],
      'Sales': ['sales', '영업', '세일즈'],
      'Consulting': ['consulting', '컨설팅', '컨설턴트'],
      'Domain Expert': ['domain', '도메인', '전문가'],
      'Biz. Supporting': ['strategy', 'planning', '전략', '기획', 'hr', '인사'],
    }

    // 직군별 직무(Skill set) 매핑
    const positionIndustries: Record<string, string[]> = {
      'Software Development': ['Front-end Development', 'Back-end Development', 'Mobile Development'],
      'Factory AX Engineering': ['Simulation', '기구설계', '전장/제어'],
      'Solution Development': ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution'],
      'Cloud/Infra Engineering': ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering'],
      'Architect': ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect'],
      'Project Management': ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM'],
      'Quality Management': ['PMO', 'Quality Engineering', 'Offshoring Service Professional'],
      'AI': ['AI/Data Development', 'Generative AI Development', 'Physical AI Development'],
      '정보보호': ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service'],
      'Sales': ['[금융] 제1금융', '[금융] 제2금융', '[공공/Global] 공공', '[공공/Global] Global', '[제조] 대외', '[제조] 대내 Hi-Tech', '[제조] 대내 Process', '[B2C] 통신', '[B2C] 유통/물류/서비스', '[B2C] 미디어/콘텐츠'],
      'Domain Expert': ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인'],
      'Consulting': ['ESG', 'SHE', 'CRM', 'SCM', 'ERP', 'AI'],
      'Biz. Supporting': ['Strategy Planning', 'New Biz. Development', 'Financial Management', 'Human Resource Management', 'Stakeholder Management', 'Governance & Public Management'],
    }

    // 경쟁사 목록
    const competitors = ['네이버', '카카오', '토스', '라인', '우아한형제들', '삼성', 'LG CNS', '한화시스템']

    return Object.entries(positionKeywords).map(([position, keywords]) => {
      // 유사 공고량 계산
      const similarPostings = recentJobs.filter(job => {
        const text = `${job.title} ${job.description || ''}`.toLowerCase()
        return keywords.some(kw => text.includes(kw.toLowerCase()))
      }).length

      // 경쟁사 공고 비중 계산
      const competitorPostings = similarPostings > 0 
        ? recentJobs.filter(job => {
            const text = `${job.title} ${job.description || ''}`.toLowerCase()
            const isSimilar = keywords.some(kw => text.includes(kw.toLowerCase()))
            if (!isSimilar) return false
            const jobCompany = job.company.replace('(주)', '').trim()
            return competitors.some(comp => jobCompany.includes(comp) || comp.includes(jobCompany))
          }).length
        : 0

      const competitorRatio = similarPostings > 0 
        ? (competitorPostings / similarPostings) * 100 
        : 0

      // 작년 동기 대비 증가율
      const lastYearSimilar = lastYearJobs.filter(job => {
        const text = `${job.title} ${job.description || ''}`.toLowerCase()
        return keywords.some(kw => text.includes(kw.toLowerCase()))
      }).length

      const recentGrowthRate = lastYearSimilar > 0
        ? ((similarPostings - lastYearSimilar) / lastYearSimilar) * 100
        : similarPostings > 0 ? 100 : 0

      // 난이도 지수 계산 (0-100)
      // 유사 공고량이 적을수록 어려움 (30점)
      const postingScore = Math.min(30, (1 - Math.min(similarPostings / 50, 1)) * 30)
      
      // 경쟁사 비중이 높을수록 어려움 (30점)
      const competitorScore = (competitorRatio / 100) * 30
      
      // 증가율이 높을수록 어려움 (20점)
      const growthScore = Math.min(20, (recentGrowthRate / 100) * 20)
      
      // 평균 채용 소요기간 (가상 데이터, 20점)
      const avgHiringDuration = 15 + Math.random() * 20 // 15-35일
      const durationScore = Math.min(20, ((avgHiringDuration - 15) / 20) * 20)

      const difficulty = Math.round(postingScore + competitorScore + growthScore + durationScore)

      // 작년 대비 변화 (min-max 스케일링)
      const lastYearDifficulty = difficulty - Math.round(Math.random() * 20 - 10) // ±10 랜덤
      const yearOverYearChange = difficulty - lastYearDifficulty

      // 인사이트 생성
      const insights: string[] = []
      if (similarPostings < 20) {
        insights.push(`시장에서 유사 공고가 ${similarPostings}개로 매우 적어 인재 확보가 어렵습니다.`)
      }
      if (competitorRatio > 60) {
        insights.push(`경쟁사 공고 비중이 ${competitorRatio.toFixed(1)}%로 높아 경쟁이 치열합니다.`)
      }
      if (recentGrowthRate > 30) {
        insights.push(`최근 ${recentGrowthRate.toFixed(1)}% 증가하여 수요가 급증하고 있습니다.`)
      }
      if (avgHiringDuration > 25) {
        insights.push(`평균 채용 소요기간이 ${Math.round(avgHiringDuration)}일로 길어 채용이 지연되고 있습니다.`)
      }
      if (insights.length === 0) {
        insights.push('현재 시장 상황이 비교적 안정적입니다.')
      }

      // 카테고리 분류
      let category: 'Tech' | 'Biz' | 'BizSupporting' | undefined
      if (['Software Development', 'Factory AX Engineering', 'Solution Development', 'Cloud/Infra Engineering', 'Architect', 'Project Management', 'Quality Management', 'AI', '정보보호'].includes(position)) {
        category = 'Tech'
      } else if (['Sales', 'Consulting', 'Domain Expert'].includes(position)) {
        category = 'Biz'
      } else if (position === 'Biz. Supporting') {
        category = 'BizSupporting'
      }

      return {
        name: position,
        category,
        industries: positionIndustries[position] || [],
        difficulty: Math.min(100, Math.max(0, difficulty)),
        similarPostings,
        competitorRatio: Math.round(competitorRatio * 10) / 10,
        recentGrowthRate: Math.round(recentGrowthRate * 10) / 10,
        avgHiringDuration: Math.round(avgHiringDuration),
        yearOverYearChange: Math.round(yearOverYearChange * 10) / 10,
        insights,
      }
    }).sort((a, b) => b.difficulty - a.difficulty)
    }

    // API 데이터가 있고 직군 데이터가 있으면 사용
    if (convertApiDataToJobDifficultyItems && convertApiDataToJobDifficultyItems.length > 0) {
      // API 데이터에 직군이 있는지 확인 (전체 시장만 있는지 체크)
      const hasJobRoles = convertApiDataToJobDifficultyItems.some(item => 
        item.name !== '전체 시장' && !item.name.includes(' - ')
      )
      
      if (hasJobRoles) {
        return convertApiDataToJobDifficultyItems
      } else {
        // API 데이터에 전체 시장만 있으면 fallback 데이터와 병합
        const fallbackData = generateFallbackData()
        // API의 전체 시장 데이터를 유지하고 fallback 직군 데이터 추가
        const apiOverall = convertApiDataToJobDifficultyItems.find(item => item.name === '전체 시장')
        if (apiOverall) {
          return [apiOverall, ...fallbackData]
        }
        return fallbackData
      }
    }

    return generateFallbackData()
  }, [convertApiDataToJobDifficultyItems])

  // 회사별 공고 데이터 (회사별 공고 컴포넌트용)
  const companyJobPostingsData = useMemo(() => {
    const companies = ['네이버', '카카오', '토스', '라인', '우아한형제들', '삼성', 'LG CNS', '한화시스템']
    
    return companies.map(company => {
      const companyJobs = jobPostingsData.filter(job => {
        const jobCompany = job.company.replace('(주)', '').trim()
        return jobCompany.includes(company) || company.includes(jobCompany)
      })
      
      return {
        name: company,
        count: companyJobs.length,
      }
    }).sort((a, b) => b.count - a.count) // 공고 수가 많은 순으로 정렬
  }, [])

  // 회사별 채용 현황 테이블 데이터 (SKAX 직무기술서 기준)
  const companyRecruitmentTableData = useMemo(() => {
    const companies = ['네이버', '카카오', '토스', '라인', '우아한형제들', '삼성', 'LG CNS', '한화시스템']
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // 최근 공고가 없으면 전체 데이터 사용
    const recentJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= lastWeek
      } catch {
        return false
      }
    })

    const previousJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= twoWeeksAgo && postedDate < lastWeek
      } catch {
        return false
      }
    })

    // SKAX 직무기술서 기준 직군 키워드 매핑 (13개 직무)
    const roleKeywords: Record<string, string[]> = {
      'Software Development': ['software', 'development', '개발', '소프트웨어', '프로그래밍', 'programming', 'frontend', 'backend', 'fullstack', '프론트엔드', '백엔드', 'full-stack', 'developer', '개발자', 'react', 'vue', 'angular', 'node', 'java', 'python', 'javascript', 'typescript', 'mobile development'],
      'Factory AX Engineering': ['factory', 'ax', 'engineering', '공장', '제조', '시뮬레이션', 'simulation', '기구설계', '전장', '제어', '자동화', 'automation', 'plc', 'scada', 'mechanical design', 'electrical', 'control'],
      'Solution Development': ['solution', '솔루션', 'erp', 'fcm', 'scm', 'hcm', 'biz', '비즈니스', 'sap', 'oracle', 'erp_fcm', 'erp_scm', 'erp_hcm', 'erp_t&e'],
      'Cloud/Infra Engineering': ['cloud', 'infra', 'infrastructure', '인프라', '클라우드', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'devops', '시스템', '네트워크', 'database', '데이터베이스', 'postgresql', 'mysql', 'mongodb', 'redis', 'system/network', 'middleware', 'data center'],
      'Architect': ['architect', '아키텍트', '설계', 'architecture', 'system design', '시스템 설계', 'solution architect', 'software architect', 'data architect', 'infra architect', 'ai architect', 'automation architect'],
      'Project Management': ['project', 'management', 'pm', '프로젝트', '관리', '프로젝트 매니저', '프로젝트 관리', 'pmo', 'program manager', 'application pm', 'infra pm', 'solution pm', 'ai pm', 'automation pm'],
      'Quality Management': ['quality', 'qa', 'qc', '품질', '테스트', 'test', 'testing', 'qa engineer', 'quality assurance', 'quality engineering', 'offshoring service', 'pmo'],
      'AI': ['ai', 'artificial intelligence', '인공지능', 'machine learning', 'ml', '딥러닝', 'deep learning', '데이터', 'data', 'generative ai', '생성형 ai', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'ai/data development', 'generative ai development', 'physical ai'],
      '정보보호': ['정보보호', '보안', 'security', 'cybersecurity', 'cyber', '보안 진단', 'compliance', 'governance', 'security engineer', '보안 governance', '보안 consulting', '보안 solution'],
      'Sales': ['sales', '영업', '세일즈', '영업사원', 'account', '고객', 'account manager', 'business development', '제1금융', '제2금융', '공공', 'global', '대외', '대내', 'hi-tech', 'process', '통신', '유통', '물류', '서비스', '미디어', '콘텐츠'],
      'Domain Expert': ['domain', 'expert', '도메인', '전문가', '금융', '제조', '공공', 'b2c', 'industry expert', '금융 도메인', '제조 도메인', '공공 도메인', 'b2c 도메인'],
      'Consulting': ['consulting', '컨설팅', '컨설턴트', 'esg', 'she', 'crm', 'scm', 'consultant', 'erp'],
      'Biz. Supporting': ['strategy', 'planning', '전략', '기획', 'hr', '인사', '재무', 'financial', 'management', '경영', 'human resource', 'stakeholder', 'governance', 'public management', 'new biz', 'biz development'],
    }

    return companies.map(company => {
      const companyRecentJobs = recentJobs.length > 0 
        ? recentJobs.filter(job => {
            const jobCompany = job.company.replace('(주)', '').trim()
            return jobCompany.includes(company) || company.includes(jobCompany)
          })
        : jobPostingsData.filter(job => {
            const jobCompany = job.company.replace('(주)', '').trim()
            return jobCompany.includes(company) || company.includes(jobCompany)
          }).slice(0, 50)

      const companyPreviousJobs = previousJobs.filter(job => {
        const jobCompany = job.company.replace('(주)', '').trim()
        return jobCompany.includes(company) || company.includes(jobCompany)
      })

      const counts: Record<string, number> = {
        'Software Development': 0,
        'Factory AX Engineering': 0,
        'Solution Development': 0,
        'Cloud/Infra Engineering': 0,
        'Architect': 0,
        'Project Management': 0,
        'Quality Management': 0,
        'AI': 0,
        '정보보호': 0,
        'Sales': 0,
        'Domain Expert': 0,
        'Consulting': 0,
        'Biz. Supporting': 0,
      }

      companyRecentJobs.forEach(job => {
        const title = (job.title || '').toLowerCase()
        const description = (job.description || '').toLowerCase()
        const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
        const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
        const text = `${title} ${description} ${techStack} ${jobCategory}`

        Object.entries(roleKeywords).forEach(([role, keywords]) => {
          if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
            counts[role]++
          }
        })
      })

      const total = Object.values(counts).reduce((sum, val) => sum + val, 0)
      const previousTotal = companyPreviousJobs.length
      const change = previousTotal > 0 
        ? Math.round(((total - previousTotal) / previousTotal) * 100)
        : total > 0 ? 100 : 0

      const surgingPosition = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

      return {
        company,
        'Software Development': counts['Software Development'],
        'Factory AX Engineering': counts['Factory AX Engineering'],
        'Solution Development': counts['Solution Development'],
        'Cloud/Infra Engineering': counts['Cloud/Infra Engineering'],
        'Architect': counts['Architect'],
        'Project Management': counts['Project Management'],
        'Quality Management': counts['Quality Management'],
        'AI': counts['AI'],
        '정보보호': counts['정보보호'],
        'Sales': counts['Sales'],
        'Domain Expert': counts['Domain Expert'],
        'Consulting': counts['Consulting'],
        'Biz. Supporting': counts['Biz. Supporting'],
        total,
        change,
        surgingPosition: surgingPosition || '-',
      }
    }).sort((a, b) => b.total - a.total)
  }, [])

  // 회사별 채용 점유율
  const companyShareData = useMemo(() => {
    const total = companyRecruitmentTableData.reduce((sum, item) => sum + item.total, 0)
    if (total === 0) return []

    return companyRecruitmentTableData.map(item => ({
      company: item.company,
      share: Math.round((item.total / total) * 100 * 10) / 10,
    })).slice(0, 8)
  }, [companyRecruitmentTableData])

  // 포지션별 성장률 (13개 직무 모두 표시)
  const positionGrowthData = useMemo(() => {
    return jobRoleData.map(item => ({
      position: item.role,
      growth: item.change,
    })).sort((a, b) => {
      // 성장률이 높은 순으로 정렬, 같으면 공고 수가 많은 순
      if (b.growth !== a.growth) {
        return b.growth - a.growth
      }
      const aItem = jobRoleData.find(d => d.role === a.position)
      const bItem = jobRoleData.find(d => d.role === b.position)
      return (bItem?.count || 0) - (aItem?.count || 0)
    })
  }, [jobRoleData])


  // 경쟁사 최신 공고 데이터 변환은 HotJobsList 컴포넌트 내부에서 처리하므로 제거
  // 컴포넌트가 독립적으로 데이터를 불러오도록 변경됨
  const hotJobsData: any[] = []
  


  // timeframe 동기화: jobPostingsTrendTimeframe이 변경되면 companyRecruitmentTimeframe도 동기화
  useEffect(() => {
    if (jobPostingsTrendTimeframe !== companyRecruitmentTimeframe) {
      setCompanyRecruitmentTimeframe(jobPostingsTrendTimeframe)
    }
  }, [jobPostingsTrendTimeframe])

  // 경쟁사 최신 공고 API 호출은 HotJobsList 컴포넌트에서 독립적으로 처리하므로 제거
  // 컴포넌트가 독립적으로 데이터를 불러오도록 변경됨

  // 채용 공고 수 추이 API 호출 (전체 조회 시 전체 추이, 단일 회사 선택 시 해당 회사 추이)
  useEffect(() => {
    const fetchJobPostingsTrend = async () => {
      const timeframeParam = getTimeframeParam(jobPostingsTrendTimeframe)
      const isSingleCompany = selectedRecruitmentCompanies.length === 1
      const selectedCompanyName = isSingleCompany ? selectedRecruitmentCompanies[0] : null
      const companyKeyword = selectedCompanyName 
        ? getCompanyKeyword(getEnglishCompanyName(selectedCompanyName)) || getCompanyKeyword(selectedCompanyName) 
        : null
      const requestKey = `${timeframeParam}-${companyKeyword || 'all'}`
      
      // 중복 요청 방지
      if (fetchingJobPostingsTrendRef.current && lastJobPostingsTrendParamsRef.current === requestKey) {
        return
      }
      
      fetchingJobPostingsTrendRef.current = true
      lastJobPostingsTrendParamsRef.current = requestKey
      
      setJobPostingsTrendError(null)
      
      // 회사 변경 시 그래프 데이터는 유지하고 인사이트만 초기화 (그래프를 즉시 표시하기 위해)
      if (isSingleCompany) {
        const currentInsightCompany = combinedTrendData?.selectedCompany?.company_name
        const englishSelectedCompanyName = selectedCompanyName ? getEnglishCompanyName(selectedCompanyName) : null
        if (englishSelectedCompanyName && currentInsightCompany && englishSelectedCompanyName !== currentInsightCompany) {
          // 그래프 데이터는 유지하고 인사이트만 초기화
          setCombinedTrendData(prev => prev ? { ...prev, insight: null } : null)
          setIsLoadingInsight(false)
        }
      } else {
        // 전체 조회로 변경될 때 인사이트만 초기화 (전체 추이 데이터는 유지)
        if (combinedTrendData?.insight) {
          setCombinedTrendData(prev => prev ? { ...prev, insight: null, selectedCompany: null } : null)
          setIsLoadingInsight(false)
        }
      }
      
      // 이전 그래프 데이터가 있으면 로딩 상태를 false로 설정하여 즉시 표시
      // 데이터가 없을 때만 로딩 상태를 true로 설정
      const hasPreviousData = jobPostingsTrendApiData.length > 0 || companyRecruitmentChartData.length > 0
      if (!hasPreviousData) {
        setIsLoadingJobPostingsTrend(true)
      } else {
        setIsLoadingJobPostingsTrend(false)
      }
      
      try {
        // 차트 데이터 먼저 가져오기 (인사이트 제외)
        // 전체 조회: companyKeyword 없이 전체 추이 데이터
        // 단일 회사: companyKeyword로 해당 회사 추이 데이터
        const data = await fetchJobPostingsTrendApi(timeframeParam, companyKeyword, false)
        const { trends, selected_company, top_companies } = data
        
        // 추이 데이터 포맷팅 및 설정
        let formattedTrendData: Array<{ period: string; count: number }> = []
        
        if (isSingleCompany) {
          if (selected_company?.trends?.length > 0) {
            // 선택된 회사의 추이 데이터를 전체 trends의 period 기준으로 매핑
            if (Array.isArray(trends) && trends.length > 0) {
              const trendsMap = new Map<string, number>()
              selected_company.trends.forEach((item: any) => {
                trendsMap.set(item.period, item.count || 0)
              })
              formattedTrendData = trends.map((item: any) => ({
                period: item.period,
                count: trendsMap.get(item.period) || 0
              }))
            } else {
              formattedTrendData = formatTrendData(selected_company.trends)
            }
          } else if (Array.isArray(trends) && trends.length > 0) {
            // selected_company.trends가 없으면 전체 trends를 사용
            formattedTrendData = formatTrendData(trends)
          } else if (selected_company?.trends?.length > 0) {
            // selected_company.trends가 있으면 그것을 사용
            formattedTrendData = formatTrendData(selected_company.trends)
          } else {
            // selected_company는 있지만 trends가 없는 경우, 빈 배열로라도 설정
            formattedTrendData = []
          }
        } else if (Array.isArray(trends) && trends.length > 0) {
          // 전체 조회 시 전체 추이 데이터 사용
          formattedTrendData = formatTrendData(trends)
        }
        
        // 그래프 데이터를 먼저 설정하여 그래프가 즉시 표시되도록 함
        // 인사이트 로딩과 무관하게 그래프를 먼저 표시
        setIsLoadingJobPostingsTrend(false)
        
        // formattedTrendData 설정 (차트 표시용) - 그래프를 먼저 표시하기 위해 즉시 설정
        // selected_company?.trends가 있으면 그것을 사용하여 그래프 표시
        if (formattedTrendData.length > 0) {
          setJobPostingsTrendApiData(formattedTrendData)
        } else if (isSingleCompany && selected_company?.trends?.length > 0) {
          // formattedTrendData가 비어있지만 selected_company.trends가 있으면 그것을 사용
          setJobPostingsTrendApiData(formatTrendData(selected_company.trends))
        } else {
          // 데이터가 없으면 빈 배열 설정
          setJobPostingsTrendApiData([])
        }
        
        // 차트 데이터 설정
        // formattedTrendData가 있거나, 단일 회사 선택 시 selected_company가 있으면 데이터 설정
        const hasData = formattedTrendData.length > 0 || (isSingleCompany && selected_company) || (!isSingleCompany && trends?.length > 0)
        
        if (hasData) {
          const convertedSelectedCompany = selected_company 
            ? { ...selected_company, company_name: getEnglishCompanyName(selected_company.company_name) }
            : null
          const convertedTopCompanies = top_companies ? convertCompanyNames(top_companies) : []
          
          // 단일 회사 선택 시 trends가 없어도 selected_company.trends를 사용
          let trendsToUse: any[] = []
          if (trends?.length > 0) {
            trendsToUse = trends
          } else if (isSingleCompany && selected_company?.trends?.length > 0) {
            trendsToUse = selected_company.trends.map((t: any) => ({ period: t.period, count: t.count || 0 }))
          } else if (formattedTrendData.length > 0) {
            // formattedTrendData를 trends 형식으로 변환
            trendsToUse = formattedTrendData.map(item => ({ period: item.period, count: item.count }))
          }
          
          setCombinedTrendData(prev => ({
            trends: trendsToUse,
            insight: prev?.insight || null,
            selectedCompany: convertedSelectedCompany ? {
              ...convertedSelectedCompany,
              trends: isSingleCompany && selected_company?.trends ? selected_company.trends : convertedSelectedCompany.trends
            } : prev?.selectedCompany || null,
            top_companies: convertedTopCompanies.length > 0 ? convertedTopCompanies : (prev?.top_companies || [])
          }))
        }
        
        // 인사이트 별도 로딩 (단일 회사 선택 시에만, 백그라운드에서 비동기로)
        if (isSingleCompany && companyKeyword) {
          // selected_company가 없어도 인사이트 로드 시도
          setIsLoadingInsight(true)
          // requestIdleCallback을 사용하여 브라우저가 유휴 상태일 때 로드 (성능 최적화)
          const loadInsight = async () => {
            try {
              const insightData = await fetchJobPostingsTrendApi(timeframeParam, companyKeyword, true)
              if (insightData?.insight) {
                const { insight, selected_company: insightSelectedCompany, top_companies: insightTopCompanies } = insightData
                
                const convertedSelectedCompany = insightSelectedCompany 
                  ? { ...insightSelectedCompany, company_name: getEnglishCompanyName(insightSelectedCompany.company_name) }
                  : null
                const convertedTopCompanies = insightTopCompanies ? convertCompanyNames(insightTopCompanies) : []
                
                setCombinedTrendData(prev => ({
                  trends: prev?.trends || [],
                  insight: insight,
                  selectedCompany: convertedSelectedCompany || prev?.selectedCompany || null,
                  top_companies: convertedTopCompanies.length > 0 ? convertedTopCompanies : (prev?.top_companies || [])
                }))
              }
            } catch (error) {
              // 인사이트 로딩 실패는 무시 (차트는 이미 표시됨)
              // 에러가 발생해도 차트 표시에는 영향 없음
            } finally {
              setIsLoadingInsight(false)
            }
          }
          
          // 초기 렌더링 후 지연 로딩 (성능 최적화)
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as any).requestIdleCallback(loadInsight, { timeout: 3000 })
          } else {
            // requestIdleCallback을 지원하지 않는 경우 setTimeout으로 지연 로드 (더 긴 지연)
            setTimeout(loadInsight, 500)
          }
        } else {
          setIsLoadingInsight(false)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.'
        setJobPostingsTrendError(errorMessage)
        setJobPostingsTrendApiData([])
        setCombinedTrendData(null)
        setIsLoadingJobPostingsTrend(false)
        setIsLoadingInsight(false)
      } finally {
        setIsLoadingJobPostingsTrend(false)
        fetchingJobPostingsTrendRef.current = false
      }
    }
    
    fetchJobPostingsTrend()
  }, [jobPostingsTrendTimeframe, selectedRecruitmentCompanies])

  // 회사별 채용 활동 API 호출 (전체 조회 시 각 회사별로 정확한 데이터 가져오기)
  useEffect(() => {
    const fetchCompanyRecruitment = async () => {
      const timeframeParam = getTimeframeParam(companyRecruitmentTimeframe)
      const requestKey = `${timeframeParam}-${selectedRecruitmentCompanies.length}-${selectedRecruitmentCompanies.join(',')}`
      
      // 중복 요청 방지
      if (fetchingCompanyRecruitmentRef.current && lastCompanyRecruitmentParamsRef.current === requestKey) {
        return
      }
      
      fetchingCompanyRecruitmentRef.current = true
      lastCompanyRecruitmentParamsRef.current = requestKey
      
      setCompanyRecruitmentError(null)
      
      // 이전 그래프 데이터가 있으면 로딩 상태를 false로 설정하여 즉시 표시
      // 데이터가 없을 때만 로딩 상태를 true로 설정
      const hasPreviousData = companyRecruitmentChartData.length > 0 || jobPostingsTrendApiData.length > 0
      if (!hasPreviousData) {
        setIsLoadingCompanyRecruitment(true)
      } else {
        setIsLoadingCompanyRecruitment(false)
      }
      
      try {
        
        // 전체 조회 시 배치 API 사용 (더 빠름)
        if (selectedRecruitmentCompanies.length === 0 || selectedRecruitmentCompanies.length > 1) {
          try {
            // 배치 API로 한 번에 모든 회사 데이터 가져오기
            const batchData = await fetchCompanyRecruitmentBatchApi(timeframeParam)
            
            if (batchData?.companies && batchData?.activities) {
              // 회사명을 한글로 변환
              const companies = batchData.companies.map((company: any) => ({
                ...company,
                name: getKoreanCompanyName(company.name) || company.name
              }))
              
              setCompanyRecruitmentApiData({
                companies,
                activities: batchData.activities
              })
              
              // 초기 선택: 전체 선택 (모든 회사)
              if (selectedRecruitmentCompanies.length === 0 && companies.length > 0) {
                setSelectedRecruitmentCompanies(companies.map((c: any) => c.name))
              }
            } else {
              // 배치 API 실패 시 개별 API 호출로 폴백 (동시 요청 수 제한)
              const companyKeys = Object.keys(COMPANY_GROUPS)
              
              const companyTasks = companyKeys.map((companyKey) => async () => {
                try {
                  const data = await fetchJobPostingsTrendApi(timeframeParam, companyKey, false)
                  if (data?.selected_company) {
                    const koreanName = data.selected_company.company_name || companyKey
                    const englishName = getEnglishCompanyName(koreanName)
                    return {
                      companyKey,
                      companyName: englishName,
                      trends: data.selected_company.trends || [],
                      totalCount: data.selected_company.total_count || 0
                    }
                  }
                  return null
                } catch {
                  return null
                }
              })
              
              // 동시에 최대 3개만 실행 (서버 부하 방지)
              const companyResults = await limitConcurrency(companyTasks, 3)
              const validResults = companyResults.filter((r): r is NonNullable<typeof r> => r !== null)
              
              if (validResults.length > 0) {
                // 모든 회사의 period 수집 및 정렬
                const allPeriodsSet = new Set<string>()
                validResults.forEach(result => {
                  result.trends.forEach((trend: any) => {
                    allPeriodsSet.add(trend.period)
                  })
                })
                const allPeriods = sortPeriods(Array.from(allPeriodsSet))
                
                // 회사 정보 구성
                const companies = validResults.map((result, index) => ({
                  id: index + 1,
                  key: result.companyKey.replace(/\s+/g, '_'),
                  name: result.companyName
                }))
                
                // 각 회사의 trends를 period별로 매핑
                const trendsMap = new Map<string, Map<string, number>>()
                validResults.forEach((result, index) => {
                  const periodMap = new Map<string, number>()
                  result.trends.forEach((trend: any) => {
                    periodMap.set(trend.period, trend.count || 0)
                  })
                  trendsMap.set(companies[index].key, periodMap)
                })
                
                // 활동 데이터 구성
                const activities = allPeriods.map(period => {
                  const counts: Record<string, number> = {}
                  companies.forEach(company => {
                    const periodMap = trendsMap.get(company.key)
                    counts[company.key] = periodMap?.get(period) || 0
                  })
                  return { period, counts }
                })
                
                setCompanyRecruitmentApiData({ companies, activities })
                
                // 초기 선택: 전체 선택 (모든 회사)
                if (selectedRecruitmentCompanies.length === 0 && companies.length > 0) {
                  setSelectedRecruitmentCompanies(companies.map(c => c.name))
                }
              }
            }
          } catch (batchError) {
            // 배치 API 실패 시 개별 API 호출로 폴백
            const companyKeys = Object.keys(COMPANY_GROUPS)
            const companyTasks = companyKeys.map((companyKey) => async () => {
              try {
                const data = await fetchJobPostingsTrendApi(timeframeParam, companyKey, false)
                if (data?.selected_company) {
                  const koreanName = data.selected_company.company_name || companyKey
                  const englishName = getEnglishCompanyName(koreanName)
                  return {
                    companyKey,
                    companyName: englishName,
                    trends: data.selected_company.trends || [],
                    totalCount: data.selected_company.total_count || 0
                  }
                }
                return null
              } catch {
                return null
              }
            })
            
            const companyResults = await limitConcurrency(companyTasks, 3)
            const validResults = companyResults.filter((r): r is NonNullable<typeof r> => r !== null)
            
            if (validResults.length > 0) {
              const allPeriodsSet = new Set<string>()
              validResults.forEach(result => {
                result.trends.forEach((trend: any) => {
                  allPeriodsSet.add(trend.period)
                })
              })
              const allPeriods = sortPeriods(Array.from(allPeriodsSet))
              
              const companies = validResults.map((result, index) => ({
                id: index + 1,
                key: result.companyKey.replace(/\s+/g, '_'),
                name: result.companyName
              }))
              
              const trendsMap = new Map<string, Map<string, number>>()
              validResults.forEach((result, index) => {
                const periodMap = new Map<string, number>()
                result.trends.forEach((trend: any) => {
                  periodMap.set(trend.period, trend.count || 0)
                })
                trendsMap.set(companies[index].key, periodMap)
              })
              
              const activities = allPeriods.map(period => {
                const counts: Record<string, number> = {}
                companies.forEach(company => {
                  const periodMap = trendsMap.get(company.key)
                  counts[company.key] = periodMap?.get(period) || 0
                })
                return { period, counts }
              })
              
              setCompanyRecruitmentApiData({ companies, activities })
              
              if (selectedRecruitmentCompanies.length === 0 && companies.length > 0) {
                setSelectedRecruitmentCompanies(companies.map(c => c.name))
              }
            }
          }
        } else {
          // 단일 회사 선택 시는 fetchJobPostingsTrend에서 처리
          // 그래프를 즉시 표시하기 위해 이전 데이터 유지 (null로 설정하지 않음)
          // setCompanyRecruitmentApiData(null)
        }
      } catch (error) {
        setCompanyRecruitmentError(error instanceof Error ? error.message : '회사별 채용 활동 데이터를 불러오는 중 오류가 발생했습니다.')
        setCompanyRecruitmentApiData(null)
      } finally {
        setIsLoadingCompanyRecruitment(false)
        fetchingCompanyRecruitmentRef.current = false
      }
    }
    
    fetchCompanyRecruitment()
  }, [companyRecruitmentTimeframe, selectedRecruitmentCompanies.length])

  // 회사 목록 구성 (recruitmentCompanies)
  const recruitmentCompanies = useMemo(() => {
    const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#eab308', '#6366f1', '#14b8a6']
    
    // 회사별 고정 색상 정의
    const getCompanyColor = (koreanName: string, englishName: string, defaultColor: string): string => {
      const normalizedKorean = koreanName.toLowerCase().replace(/\s+/g, '').trim()
      const normalizedEnglish = englishName.toLowerCase().replace(/\s+/g, '').trim()
      
      // LG CNS는 하늘색으로 고정
      if (normalizedKorean === 'lgcns' || normalizedKorean === 'lgcns' || 
          normalizedEnglish === 'lgcns' || normalizedEnglish === 'lg cns' ||
          koreanName === 'LG CNS' || englishName === 'LG CNS') {
        return '#0ea5e9' // 하늘색 (Sky-500)
      }
      
      return defaultColor
    }
    
    // 회사 이름 정규화 함수 (중복 체크용)
    const normalizeCompanyName = (name: string): string => {
      return name.toLowerCase().replace(/\s+/g, '').replace(/[\/\(\)]/g, '').trim()
    }
    
    // 회사 key 생성 함수 (normalizeCompanyName 기반)
    const generateCompanyKey = (name: string): string => {
      return normalizeCompanyName(name)
    }
    
    const companyMap = new Map<string, any>() // 정규화된 이름을 key로 사용
    
    // companyRecruitmentApiData의 companies를 우선 사용 (이미 선택된 회사들의 실제 데이터)
    if (companyRecruitmentApiData?.companies && companyRecruitmentApiData.companies.length > 0) {
      companyRecruitmentApiData.companies.forEach((company: { key: string; name: string }, index: number) => {
        // 영어 회사명을 한글로 변환 (드롭다운 표시용)
        const koreanCompanyName = getKoreanCompanyName(company.name)
        const englishCompanyName = getEnglishCompanyName(koreanCompanyName) // API 호출용
        const normalizedName = normalizeCompanyName(englishCompanyName)
        if (!companyMap.has(normalizedName)) {
          const defaultColor = colors[companyMap.size % colors.length]
          companyMap.set(normalizedName, {
            id: company.key || index + 1,
            key: company.key || normalizedName,
            name: koreanCompanyName, // 한글 이름 저장
            englishName: englishCompanyName, // API 호출용 영어 이름
            color: getCompanyColor(koreanCompanyName, englishCompanyName, defaultColor)
          })
        }
      })
    }
    
    // 새로운 API 형식: top_companies 우선, 없으면 competitor_comparison 사용
    if (combinedTrendData?.insight) {
      // 선택된 회사가 있으면 먼저 추가
      if (combinedTrendData.selectedCompany) {
        const selectedComp = combinedTrendData.selectedCompany
        // 영어 회사명을 한글로 변환
        const koreanCompanyName = getKoreanCompanyName(selectedComp.company_name)
        const englishCompanyName = getEnglishCompanyName(koreanCompanyName)
        const normalizedName = normalizeCompanyName(englishCompanyName)
        if (!companyMap.has(normalizedName)) {
          const selectedKey = generateCompanyKey(englishCompanyName)
          const defaultColor = colors[companyMap.size % colors.length]
          companyMap.set(normalizedName, {
            id: selectedComp.company_id || 0,
            key: selectedKey,
            name: koreanCompanyName, // 한글 이름 저장
            englishName: englishCompanyName, // API 호출용 영어 이름
            color: getCompanyColor(koreanCompanyName, englishCompanyName, defaultColor)
          })
        }
      }
      
      // top_companies가 있으면 우선 사용
      if (combinedTrendData.top_companies && Array.isArray(combinedTrendData.top_companies) && combinedTrendData.top_companies.length > 0) {
        combinedTrendData.top_companies.forEach((comp: any, index: number) => {
          const originalName = comp.company_name || comp.name
          // 원본이 한글일 수도 있고 영어일 수도 있으므로, 한글로 변환 시도
          const koreanCompanyName = getKoreanCompanyName(originalName) !== originalName ? getKoreanCompanyName(originalName) : originalName
          const englishCompanyName = getEnglishCompanyName(koreanCompanyName)
          const normalizedName = normalizeCompanyName(englishCompanyName)
          if (!companyMap.has(normalizedName)) {
            const key = generateCompanyKey(englishCompanyName)
            const defaultColor = colors[companyMap.size % colors.length]
            companyMap.set(normalizedName, {
              id: comp.company_id || comp.id || index + 1,
              key: key,
              name: koreanCompanyName, // 한글 이름 저장
              englishName: englishCompanyName, // API 호출용 영어 이름
              color: getCompanyColor(koreanCompanyName, englishCompanyName, defaultColor)
            })
          }
        })
      }
      // competitor_comparison 사용
      else if (combinedTrendData.insight.competitor_comparison && Array.isArray(combinedTrendData.insight.competitor_comparison)) {
        combinedTrendData.insight.competitor_comparison.forEach((comp: any, index: number) => {
          const originalName = comp.company_name
          // 원본이 한글일 수도 있고 영어일 수도 있으므로, 한글로 변환 시도
          const koreanCompanyName = getKoreanCompanyName(originalName) !== originalName ? getKoreanCompanyName(originalName) : originalName
          const englishCompanyName = getEnglishCompanyName(koreanCompanyName)
          const normalizedName = normalizeCompanyName(englishCompanyName)
          if (!companyMap.has(normalizedName)) {
            const key = generateCompanyKey(englishCompanyName)
            const defaultColor = colors[companyMap.size % colors.length]
            companyMap.set(normalizedName, {
              id: comp.company_id || comp.rank || index + 1,
              key: key,
              name: koreanCompanyName, // 한글 이름 저장
              englishName: englishCompanyName, // API 호출용 영어 이름
              color: getCompanyColor(koreanCompanyName, englishCompanyName, defaultColor)
            })
          }
        })
      }
    }
    
    const companies = Array.from(companyMap.values())
    
    if (companies.length > 0) {
      // 이전 값 업데이트
      previousRecruitmentCompaniesRef.current = companies
      return companies
    }
    
    // 데이터가 로딩 중일 때는 이전 값 유지 (그래프를 즉시 표시하기 위해)
    if (previousRecruitmentCompaniesRef.current.length > 0) {
      return previousRecruitmentCompaniesRef.current
    }
    
    // 실제 데이터가 없을 때만 빈 배열 반환
    return []
  }, [companyRecruitmentApiData, combinedTrendData])

  // recruitmentCompanies가 로드되면 초기 선택 설정 (전체 선택) - 사용자가 수동으로 선택하지 않은 경우에만
  useEffect(() => {
    if (recruitmentCompanies.length > 0 && !isManualSelection && selectedRecruitmentCompanies.length === 0) {
      // 초기 로딩 시에만 모든 회사 선택
      const allCompanyNames = recruitmentCompanies.map((c: { name: string }) => c.name)
      setSelectedRecruitmentCompanies(allCompanyNames)
    }
  }, [recruitmentCompanies, isManualSelection])

  // 회사별 채용 활동 차트 데이터 변환
  const companyRecruitmentChartData = useMemo(() => {
    // 회사 이름 정규화 함수 (매칭용)
    const normalizeCompanyName = (name: string): string => {
      return name.toLowerCase().replace(/\s+/g, '').replace(/[\/\(\)]/g, '').trim()
    }
    
    // companyRecruitmentApiData가 있으면 우선 사용 (selected_company.trends 기반 데이터)
    if (companyRecruitmentApiData && companyRecruitmentApiData.activities && companyRecruitmentApiData.activities.length > 0) {
      // recruitmentCompanies가 로드되지 않았으면 companyRecruitmentApiData.companies 사용 (임시)
      // 하지만 recruitmentCompanies가 로드되면 다시 계산되도록 의존성 배열에 포함됨
      const availableCompanies = recruitmentCompanies.length > 0 
        ? recruitmentCompanies 
        : (companyRecruitmentApiData.companies || []).map((c: { name: string; key: string }) => ({
            name: c.name,
            key: c.key || normalizeCompanyName(c.name)
          }))
      
      // "전체" 선택 시: selectedRecruitmentCompanies가 비어있거나 모든 회사가 선택된 경우 availableCompanies의 모든 회사 표시
      const isAllSelected = selectedRecruitmentCompanies.length === 0 || 
        (recruitmentCompanies.length > 0 && selectedRecruitmentCompanies.length === recruitmentCompanies.length)
      
      // "전체" 선택 시 recruitmentCompanies의 모든 회사를 표시, 아니면 selectedRecruitmentCompanies 사용
      const companiesToShow = isAllSelected && recruitmentCompanies.length > 0
        ? recruitmentCompanies.map((c: { name: string }) => c.name)
        : selectedRecruitmentCompanies.length > 0 
          ? selectedRecruitmentCompanies 
          : availableCompanies.map((c: { name: string }) => c.name)
      
      // companyRecruitmentApiData.companies와 recruitmentCompanies를 매핑하는 맵 생성
      const companyKeyMap = new Map<string, string>() // recruitmentCompanies의 key -> companyRecruitmentApiData의 key
      if (recruitmentCompanies.length > 0 && companyRecruitmentApiData.companies) {
        recruitmentCompanies.forEach((recCompany: { name: string; key: string }) => {
          // companyRecruitmentApiData.companies에서 매칭되는 회사 찾기
          const matchedCompany = companyRecruitmentApiData.companies.find((apiCompany: { name: string; key: string }) => {
            // 여러 방법으로 매칭 시도: key 직접 비교, 이름 비교, 정규화된 이름 비교
            if (recCompany.key === apiCompany.key) {
              return true
            }
            
            const apiKoreanName = getKoreanCompanyName(apiCompany.name)
            const recKoreanName = getKoreanCompanyName(recCompany.name)
            if (recKoreanName === apiKoreanName || recCompany.name === apiKoreanName || recCompany.name === apiCompany.name) {
              return true
            }
            
            const normalizedRecName = normalizeCompanyName(recKoreanName)
            const normalizedApiName = normalizeCompanyName(apiKoreanName)
            if (normalizedRecName === normalizedApiName) {
              return true
            }
            
            const recEnglishName = getEnglishCompanyName(recKoreanName)
            const apiEnglishName = getEnglishCompanyName(apiKoreanName)
            const normalizedRecEnglish = normalizeCompanyName(recEnglishName)
            const normalizedApiEnglish = normalizeCompanyName(apiEnglishName)
            if (normalizedRecEnglish === normalizedApiEnglish) {
              return true
            }
            
            return false
          })
          if (matchedCompany) {
            companyKeyMap.set(recCompany.key, matchedCompany.key)
          }
        })
      }
      
      const result = companyRecruitmentApiData.activities.map(activity => {
        const data: { period: string; [key: string]: string | number } = { period: activity.period }
        
        // companiesToShow의 모든 회사에 대해 데이터 설정
        companiesToShow.forEach((companyName: string) => {
          // recruitmentCompanies에서 해당 회사 찾기 (우선)
          let company = recruitmentCompanies.find((c: { name: string; key: string }) => {
            const normalizedSelected = normalizeCompanyName(companyName)
            const normalizedCompany = normalizeCompanyName(c.name)
            return normalizedSelected === normalizedCompany || c.name === companyName
          })
          
          // recruitmentCompanies에서 못 찾으면 availableCompanies에서 찾기
          if (!company) {
            company = availableCompanies.find((c: { name: string; key: string }) => {
              const normalizedSelected = normalizeCompanyName(companyName)
              const normalizedCompany = normalizeCompanyName(c.name)
              return normalizedSelected === normalizedCompany || c.name === companyName
            })
          }
          
          if (company) {
            // companyRecruitmentApiData의 key로 변환 (매핑이 있으면 사용)
            const apiKey = companyKeyMap.get(company.key) || company.key
            
            // activity.counts의 모든 키 확인
            const countsKeys = Object.keys(activity.counts)
            
            // 회사명 매칭을 위한 정규화 함수들
            const normalizeForMatching = (str: string): string => {
              return str.toLowerCase().replace(/\s+/g, '').replace(/[\/\(\)\.\-_]/g, '').trim()
            }
            
            // 매칭 시도할 키 목록 (우선순위 순)
            const possibleKeys = [
              apiKey,
              company.key,
              normalizeCompanyName(company.name),
              normalizeCompanyName(getEnglishCompanyName(company.name)),
              getEnglishCompanyName(company.name),
              getKoreanCompanyName(company.name),
              // activity.counts의 모든 키와 비교하여 매칭되는 키 찾기
              ...countsKeys.filter(key => {
                const normalizedKey = normalizeForMatching(key)
                const normalizedCompanyKey = normalizeForMatching(company.key)
                const normalizedCompanyName = normalizeForMatching(company.name)
                const normalizedEnglishName = normalizeForMatching(getEnglishCompanyName(company.name))
                const normalizedKoreanName = normalizeForMatching(getKoreanCompanyName(company.name))
                
                return normalizedKey === normalizedCompanyKey || 
                       normalizedKey === normalizedCompanyName ||
                       normalizedKey === normalizedEnglishName ||
                       normalizedKey === normalizedKoreanName ||
                       key === company.key ||
                       key === company.name ||
                       key === getEnglishCompanyName(company.name) ||
                       key === getKoreanCompanyName(company.name) ||
                       normalizedKey.includes(normalizedCompanyKey) ||
                       normalizedCompanyKey.includes(normalizedKey) ||
                       normalizedKey.includes(normalizedCompanyName) ||
                       normalizedCompanyName.includes(normalizedKey)
              })
            ]
            
            // 중복 제거
            const uniqueKeys = Array.from(new Set(possibleKeys))
            
            // activity.counts에서 값 찾기
            let value = 0
            for (const key of uniqueKeys) {
              if (activity.counts.hasOwnProperty(key)) {
                value = activity.counts[key]
                if (value > 0 && process.env.NODE_ENV === 'development') {
                  console.log(`키 매칭 성공: ${company.name} (${company.key}) -> ${key} = ${value}`)
                }
                break
              }
            }
            
            // company.key를 키로 사용하여 데이터 저장 (항상 저장하여 차트에서 찾을 수 있도록)
            data[company.key] = value
          }
        })
        
        return data
      })
      
      // 디버깅: 생성된 데이터 확인 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        console.log('companyRecruitmentChartData 생성됨:', result)
        console.log('activity.counts의 키들:', companyRecruitmentApiData.activities[0]?.counts ? Object.keys(companyRecruitmentApiData.activities[0].counts) : [])
        console.log('recruitmentCompanies:', recruitmentCompanies.map((c: { name: string; key: string }) => ({ name: c.name, key: c.key })))
      }
      
      // 이전 값 업데이트
      previousCompanyRecruitmentChartDataRef.current = result
      return result
    }
    
    // 기존 형식: insight.trend_analysis 사용 (fallback)
    if (combinedTrendData?.insight?.trend_analysis) {
      const trendAnalysis = combinedTrendData.insight.trend_analysis
      const competitorComparison = combinedTrendData.insight.competitor_comparison || []
      
      // 선택된 회사들에 대한 데이터만 구성
      if (selectedRecruitmentCompanies.length === 0) return []
      
      return trendAnalysis.map((item: any) => {
        const data: { period: string; [key: string]: string | number } = { 
          period: item.period 
        }
        
        // 회사 이름 정규화 함수 (매칭용)
        const normalizeCompanyName = (name: string): string => {
          return name.toLowerCase().replace(/\s+/g, '').replace(/[\/\(\)]/g, '').trim()
        }
        
        const normalizedSelectedCompanyName = combinedTrendData.selectedCompany?.company_name 
          ? normalizeCompanyName(combinedTrendData.selectedCompany.company_name)
          : null
        
        // 회사 key 생성 함수 (normalizeCompanyName 기반)
        const generateCompanyKey = (name: string): string => {
          return normalizeCompanyName(name)
        }
        
        // 선택된 각 회사의 데이터 추가 (selectedRecruitmentCompanies는 이미 회사 이름)
        selectedRecruitmentCompanies.forEach((companyName: string) => {
          const normalizedCompanyName = normalizeCompanyName(companyName)
          const companyKey = generateCompanyKey(companyName)
          
          // 선택된 회사인 경우
          if (normalizedCompanyName === normalizedSelectedCompanyName) {
            data[companyKey] = Number(item.company_count || 0)
          } else {
            // 다른 회사는 competitor_comparison에서 찾기
            const competitor = competitorComparison.find((c: any) => {
              const competitorEnglishName = getEnglishCompanyName(c.company_name)
              const normalizedCompetitorName = normalizeCompanyName(competitorEnglishName)
              return normalizedCompetitorName === normalizedCompanyName || competitorEnglishName === companyName
            })
            
            if (competitor && item.total_count && competitor.market_share) {
              // 전체 시장에서 해당 회사의 시장 점유율을 기반으로 추정
              const estimatedCount = Math.round((item.total_count * competitor.market_share) / 100)
              data[companyKey] = estimatedCount
            } else {
              data[companyKey] = 0
            }
          }
        })
        
        return data
      })
      
      // 이전 값 업데이트
      previousCompanyRecruitmentChartDataRef.current = trendAnalysis.map((item: any) => {
        const data: { period: string; [key: string]: string | number } = { 
          period: item.period 
        }
        
        // 회사 이름 정규화 함수 (매칭용)
        const normalizeCompanyName = (name: string): string => {
          return name.toLowerCase().replace(/\s+/g, '').replace(/[\/\(\)]/g, '').trim()
        }
        
        const normalizedSelectedCompanyName = combinedTrendData?.selectedCompany?.company_name 
          ? normalizeCompanyName(combinedTrendData.selectedCompany.company_name)
          : null
        
        // 회사 key 생성 함수 (normalizeCompanyName 기반)
        const generateCompanyKey = (name: string): string => {
          return normalizeCompanyName(name)
        }
        
        // 선택된 각 회사의 데이터 추가 (selectedRecruitmentCompanies는 이미 회사 이름)
        selectedRecruitmentCompanies.forEach((companyName: string) => {
          const normalizedCompanyName = normalizeCompanyName(companyName)
          const companyKey = generateCompanyKey(companyName)
          
          // 선택된 회사인 경우
          if (normalizedCompanyName === normalizedSelectedCompanyName) {
            data[companyKey] = Number(item.company_count || 0)
          } else {
            // 다른 회사는 competitor_comparison에서 찾기
            const competitor = competitorComparison.find((c: any) => {
              const competitorEnglishName = getEnglishCompanyName(c.company_name)
              const normalizedCompetitorName = normalizeCompanyName(competitorEnglishName)
              return normalizedCompetitorName === normalizedCompanyName || competitorEnglishName === companyName
            })
            
            if (competitor && item.total_count && competitor.market_share) {
              // 전체 시장에서 해당 회사의 시장 점유율을 기반으로 추정
              const estimatedCount = Math.round((item.total_count * competitor.market_share) / 100)
              data[companyKey] = estimatedCount
            } else {
              data[companyKey] = 0
            }
          }
        })
        
        return data
      })
      
      return previousCompanyRecruitmentChartDataRef.current
    }
    
    // 데이터가 없을 때는 이전 값 유지 (그래프를 즉시 표시하기 위해)
    if (previousCompanyRecruitmentChartDataRef.current.length > 0) {
      return previousCompanyRecruitmentChartDataRef.current
    }
    
    return []
  }, [companyRecruitmentApiData, combinedTrendData, selectedRecruitmentCompanies, recruitmentCompanies])


  // 스킬 트렌드 API 호출 (회사 선택 시, 최근 5년 데이터)
  useEffect(() => {
    // 빈 문자열("")은 "전체"로 처리
    const companyToFetch = selectedSkillCompany === '' ? '전체' : selectedSkillCompany

    const fetchSkillTrend = async () => {
      try {
        setIsLoadingSkillTrend(true)
        setSkillTrendError(null)
        
        const allTrends: Array<{
          month: string
          [skill: string]: string | number
        }> = []

        let firstApiSuccess = false
        let firstApiError: Error | null = null

        // year 파라미터 없이 한 번에 전체 데이터 가져오기 시도 (전체 또는 회사별 모두 지원)
        try {
          let apiUrl: string
          if (companyToFetch === '전체') {
            apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/skill-trends?top_n=13`
          } else {
            apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/companies/${encodeURIComponent(companyToFetch)}/skill-trends?top_n=13`
          }
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors',
            credentials: 'omit',
          })

          if (response.ok) {
            const result = await response.json()
            
            if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
              // yearly_trends 처리 (year 파라미터 없을 때)
              if (result.data.yearly_trends && typeof result.data.yearly_trends === 'object') {
                const yearlyTrends = result.data.yearly_trends
                
                // 각 연도별로 순회
                Object.keys(yearlyTrends).forEach(yearKey => {
                  const yearData = yearlyTrends[yearKey]
                  
                  if (yearData && yearData.counts && typeof yearData.counts === 'object') {
                    // 연도별 데이터를 4개 분기로 나누어 저장 (연도별 집계를 분기별로 분산)
                    const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
                    quarters.forEach(quarter => {
                      const quarterNum = parseInt(quarter.replace('Q', ''))
                      const month = (quarterNum - 1) * 3 + 1
                      const monthStr = `${yearKey}.${String(month).padStart(2, '0')}`
                      
                      // 데이터 객체 생성 (연도별 집계를 분기별로 동일하게 분산)
                      const data: any = { month: monthStr }
                      
                      // counts 객체의 모든 스킬을 데이터에 추가 (연도별 값을 4로 나눔)
                      Object.keys(yearData.counts).forEach(skill => {
                        const yearlyCount = Number(yearData.counts[skill] || 0)
                        // 연도별 집계를 분기별로 분산 (4분기로 나눔)
                        data[skill] = Math.round(yearlyCount / 4)
                      })
                      
                      allTrends.push(data)
                    })
                  }
                })
                
                // yearly_trends로 데이터를 가져왔으면 종료
                firstApiSuccess = true
                setSkillTrendData(allTrends)
                setIsLoadingSkillTrend(false)
                return
              }
            }
          } else {
            // HTTP 에러 응답
            firstApiError = new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
          }
        } catch (err) {
          // 전체 데이터 가져오기 실패 시 연도별로 시도
          firstApiError = err instanceof Error ? err : new Error('네트워크 오류가 발생했습니다.')
        }

        // 연도별로 데이터 가져오기 (현재 연도를 기준으로 최근 5년)
        const currentYear = new Date().getFullYear()
        const years: string[] = []
        for (let i = 4; i >= 0; i--) {
          years.push(String(currentYear - i))
        }
        for (const year of years) {
          try {
            // API 엔드포인트: 전체 선택 시 다른 URL 사용
            let apiUrl: string
            if (companyToFetch === '전체') {
              // 전체 데이터를 가져오는 API (회사 파라미터 없음)
              apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/skill-trends?year=${year}&top_n=13`
            } else {
              // 특정 회사 데이터를 가져오는 API
              apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/companies/${encodeURIComponent(companyToFetch)}/skill-trends?year=${year}&top_n=13`
            }
            
            // 404 에러를 조용히 처리하기 위해 try-catch로 감싸기
            let response: Response | null = null
            try {
              response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit',
              })
            } catch (fetchError) {
              // 네트워크 에러는 조용히 처리 (해당 연도 데이터 없음)
              continue
            }
            
            // fetch 실패 또는 404는 데이터가 없는 경우이므로 정상적으로 처리 (해당 연도 데이터 없음)
            if (!response || response.status === 404) {
              // 해당 연도 데이터가 없음 - 무시하고 다음 연도로 계속 진행
              continue
            }
            
            if (response.ok) {
              const result = await response.json()
              
              if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
                // 새로운 API 형식: quarterly_trends 객체 처리 (year 파라미터 있을 때)
                if (result.data.quarterly_trends && typeof result.data.quarterly_trends === 'object') {
                  const quarterlyTrends = result.data.quarterly_trends
                  
                  // 각 연도별로 순회
                  Object.keys(quarterlyTrends).forEach(yearKey => {
                    const yearData = quarterlyTrends[yearKey]
                    
                    // 각 분기별로 순회 (Q1, Q2, Q3, Q4)
                    const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
                    quarters.forEach(quarter => {
                      const quarterData = yearData[quarter]
                      
                      if (quarterData && quarterData.counts && typeof quarterData.counts === 'object') {
                        // 분기를 월로 변환 (Q1=1월, Q2=4월, Q3=7월, Q4=10월)
                        const quarterNum = parseInt(quarter.replace('Q', ''))
                        const month = (quarterNum - 1) * 3 + 1
                        const monthStr = `${yearKey}.${String(month).padStart(2, '0')}`
                        
                        // 데이터 객체 생성
                        const data: any = { month: monthStr }
                        
                        // counts 객체의 모든 스킬을 데이터에 추가
                        Object.keys(quarterData.counts).forEach(skill => {
                          data[skill] = Number(quarterData.counts[skill] || 0)
                        })
                        
                        allTrends.push(data)
                      }
                    })
                  })
                }
                // 새로운 API 형식: yearly_trends 객체 처리 (year 파라미터 없을 때 - 최근 5개년)
                else if (result.data.yearly_trends && typeof result.data.yearly_trends === 'object') {
                  const yearlyTrends = result.data.yearly_trends
                  
                  // 각 연도별로 순회
                  Object.keys(yearlyTrends).forEach(yearKey => {
                    const yearData = yearlyTrends[yearKey]
                    
                    if (yearData && yearData.counts && typeof yearData.counts === 'object') {
                      // 연도별 데이터를 4개 분기로 나누어 저장 (연도별 집계를 분기별로 분산)
                      const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
                      quarters.forEach(quarter => {
                        const quarterNum = parseInt(quarter.replace('Q', ''))
                        const month = (quarterNum - 1) * 3 + 1
                        const monthStr = `${yearKey}.${String(month).padStart(2, '0')}`
                        
                        // 데이터 객체 생성 (연도별 집계를 분기별로 동일하게 분산)
                        const data: any = { month: monthStr }
                        
                        // counts 객체의 모든 스킬을 데이터에 추가 (연도별 값을 4로 나눔)
                        Object.keys(yearData.counts).forEach(skill => {
                          const yearlyCount = Number(yearData.counts[skill] || 0)
                          // 연도별 집계를 분기별로 분산 (4분기로 나눔)
                          data[skill] = Math.round(yearlyCount / 4)
                        })
                        
                        allTrends.push(data)
                      })
                    }
                  })
                }
                // 기존 API 형식: trends 배열 처리 (하위 호환성 유지)
                else if (result.data.trends && Array.isArray(result.data.trends)) {
                  const { trends } = result.data
                  
                  // 데이터 형식 변환
                  const formattedTrends = trends.map((trend: any) => {
                    const data: any = {}
                    
                    // 형식 1: month가 문자열로 직접 들어있는 경우 ("2025.09")
                    if (trend.month && typeof trend.month === 'string') {
                      data.month = trend.month
                      // 나머지 키들을 스킬로 처리
                      Object.keys(trend).forEach(key => {
                        if (key !== 'month' && key !== 'quarter') {
                          data[key] = Number(trend[key] || 0)
                        }
                      })
                    }
                    // 형식 2: month가 객체인 경우 { year: 2025, month: 9 }
                    else if (trend.month && typeof trend.month === 'object') {
                      const monthYear = trend.month.year || year
                      const monthMonth = String(trend.month.month || '').padStart(2, '0')
                      data.month = `${monthYear}.${monthMonth}`
                      // 나머지 키들을 스킬로 처리
                      Object.keys(trend).forEach(key => {
                        if (key !== 'month' && key !== 'quarter' && key !== 'skills') {
                          data[key] = Number(trend[key] || 0)
                        }
                      })
                    }
                    // 형식 3: quarter와 skills 객체가 있는 경우 (실제 API 응답 형식)
                    if (trend.quarter && trend.skills && typeof trend.skills === 'object') {
                      // quarter를 month로 변환 (예: "2025 Q3" -> "2025.07")
                      const quarterMatch = trend.quarter.match(/(\d{4})\s*Q(\d)/)
                      if (quarterMatch) {
                        const qYear = quarterMatch[1]
                        const quarter = parseInt(quarterMatch[2])
                        const month = (quarter - 1) * 3 + 1 // Q1=1월, Q2=4월, Q3=7월, Q4=10월
                        data.month = `${qYear}.${String(month).padStart(2, '0')}`
                      } else {
                        data.month = `${year}.01`
                      }
                      // skills 객체의 키-값을 직접 사용
                      Object.keys(trend.skills).forEach(skill => {
                        data[skill] = Number(trend.skills[skill] || 0)
                      })
                      return data
                    }
                    // 형식 4: skills가 배열인 경우
                    else if (trend.skills && Array.isArray(trend.skills)) {
                      data.month = `${year}.01` // 기본값
                      trend.skills.forEach((skill: any) => {
                        if (skill.skill && skill.count !== undefined) {
                          data[skill.skill] = Number(skill.count || 0)
                        }
                      })
                    }
                    // 형식 5: 이미 올바른 형식인 경우
                    else {
                      // month 필드가 없으면 기본값 설정
                      if (!data.month) {
                        data.month = `${year}.01`
                      }
                      // 나머지 키들을 스킬로 처리
                      Object.keys(trend).forEach(key => {
                        if (key !== 'month' && key !== 'quarter' && key !== 'skills') {
                          data[key] = Number(trend[key] || 0)
                        }
                      })
                    }
                    
                    return data
                  })
                  
                  allTrends.push(...formattedTrends)
                }
              }
            }
          } catch (yearErr) {
            // 개별 연도 실패는 무시하고 계속 진행
          }
        }

        // 모든 API 호출이 실패했고 데이터가 없는 경우 에러 설정
        if (allTrends.length === 0 && !firstApiSuccess) {
          if (firstApiError) {
            setSkillTrendError(firstApiError.message)
          } else {
            setSkillTrendError('스킬 트렌드 데이터를 가져올 수 없습니다. API 서버를 확인해주세요.')
          }
        } else {
          // 데이터가 있으면 에러 초기화
          setSkillTrendError(null)
        }

        setSkillTrendData(allTrends)
      } catch (err) {
        setSkillTrendError(err instanceof Error ? err.message : '스킬 트렌드를 불러오는 중 오류가 발생했습니다.')
        setSkillTrendData([])
      } finally {
        setIsLoadingSkillTrend(false)
      }
    }

    fetchSkillTrend()
  }, [selectedSkillCompany])

  // 직군별 통계 API 호출
  useEffect(() => {
    const fetchJobRoleStatistics = async () => {
      try {
        setIsLoadingJobRoleStatistics(true)
        setJobRoleStatisticsError(null)
        
        // timeframe 매핑: Weekly -> quarterly_same_period, Monthly -> monthly_same_period
        const timeframe = jobRoleStatisticsViewMode === 'Weekly' ? 'quarterly_same_period' : 'monthly_same_period'
        
        // category 매핑
        const category = selectedExpertCategory
        
        // API 파라미터 구성
        const params = new URLSearchParams()
        params.append('timeframe', timeframe)
        params.append('category', category)
        params.append('include_insights', 'true') // 인사이트 포함 요청
        
        // 경쟁사 필터가 있으면 추가
        if (selectedJobRoleCompanyFilter && selectedJobRoleCompanyFilter !== '전체') {
          params.append('company', selectedJobRoleCompanyFilter)
        }
        
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-role-statistics?${params.toString()}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.status === 200 && result.data) {
          // API 응답 구조: result.data.statistics.statistics (배열)
          // result.data.statistics.current_period, previous_period (기간 정보)
          // result.data.insights (인사이트 정보) - 이 부분에 summary와 job_role_insights가 있음
          
          // insights는 statistics와 독립적으로 존재할 수 있으므로 별도로 확인
          // 여러 경로에서 insights 찾기 (우선순위: result.data.insights > result.data.statistics.insights > result.insights)
          let insightsData = result.data.insights || 
                            result.data.statistics?.insights || 
                            result.insights || 
                            null
          
          // insightsData가 객체인 경우, summary나 job_role_insights가 있는지 확인
          if (insightsData && typeof insightsData === 'object' && insightsData !== null) {
            // summary가 있거나 job_role_insights가 있으면 유지
            const hasSummary = insightsData.summary !== undefined && 
                              insightsData.summary !== null && 
                              String(insightsData.summary).trim().length > 0
            const hasJobRoleInsights = Array.isArray(insightsData.job_role_insights) && 
                                      insightsData.job_role_insights.length > 0
            
            // summary나 job_role_insights가 없으면 null로 처리
            if (!hasSummary && !hasJobRoleInsights) {
              insightsData = null
            }
          }
          
          if (result.data.statistics) {
            // statistics 배열이 비어있어도 기간 정보는 있으므로 데이터로 저장
            const apiData = {
              statistics: result.data.statistics.statistics || [],
              current_period: result.data.statistics.current_period,
              previous_period: result.data.statistics.previous_period,
              insights: insightsData, // insightsData가 null이어도 저장 (나중에 확인 가능하도록)
            }
            setJobRoleStatisticsApiData(apiData)
          } else if (insightsData) {
            // statistics가 없어도 insights가 있으면 저장
            const apiData = {
              statistics: [],
              current_period: null,
              previous_period: null,
              insights: insightsData,
            }
            setJobRoleStatisticsApiData(apiData)
          } else {
            // 데이터 구조가 맞지 않으면 null로 설정
            setJobRoleStatisticsApiData(null)
          }
        } else {
          throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
        }
      } catch (error: any) {
        setJobRoleStatisticsError(error.message || '직군별 통계 데이터를 불러오는데 실패했습니다.')
        setJobRoleStatisticsApiData(null)
      } finally {
        setIsLoadingJobRoleStatistics(false)
      }
    }
    
    fetchJobRoleStatistics()
  }, [jobRoleStatisticsViewMode, selectedExpertCategory, selectedJobRoleCompanyFilter])

  // 직무 인재 수급 난이도 지수 API 호출
  useEffect(() => {
    const fetchJobDifficulty = async () => {
      // 같은 파라미터로 이미 데이터가 있으면 스킵 (초기 로드 제외)
      const hasExistingData = jobDifficultyApiData !== null
      const currentParams = `${selectedDifficultyPosition || ''}-${selectedDifficultyIndustry || ''}`
      
      try {
        setIsLoadingJobDifficulty(true)
        setJobDifficultyError(null)
        
        // 종료일 설정 (오늘 날짜)
        const endDate = new Date()
        const endDateStr = endDate.toISOString().split('T')[0] // YYYY-MM-DD 형식
        
        // API 파라미터 구성
        const params = new URLSearchParams()
        params.append('end_date', endDateStr)
        params.append('include_insights', 'true')
        
        // position_name이 있으면 추가
        if (selectedDifficultyPosition && selectedDifficultyPosition !== '') {
          params.append('position_name', selectedDifficultyPosition)
        }
        
        // industry_name이 있으면 추가 (position_name이 필수)
        if (selectedDifficultyIndustry && selectedDifficultyIndustry !== '' && selectedDifficultyPosition && selectedDifficultyPosition !== '') {
          params.append('industry_name', selectedDifficultyIndustry)
        }
        
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/position-competition/job-talent-difficulty-index?${params.toString()}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
        
        // 404 에러는 API가 아직 구현되지 않았을 수 있으므로 조용히 처리
        if (response.status === 404) {
          setJobDifficultyApiData(null)
          setJobDifficultyError(null) // 404는 에러로 표시하지 않음
          return
        }
        
        // 400 에러는 데이터가 없어서 인사이트를 생성할 수 없는 경우
        if (response.status === 400) {
          setJobDifficultyApiData(null)
          setJobDifficultyError('선택하신 직무의 난이도 지수가 낮아 인사이트를 생성할 수 없습니다. 다른 직무를 선택해주세요.')
          return
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.status === 200 && result.data) {
          setJobDifficultyApiData(result.data)
        } else {
          throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
        }
      } catch (error: any) {
        // 404 에러는 API가 아직 구현되지 않았을 수 있으므로 조용히 처리
        if (error.message?.includes('404') || error.message?.includes('status: 404')) {
          setJobDifficultyApiData(null)
          setJobDifficultyError(null) // 404는 에러로 표시하지 않음
        } else if (error.message?.includes('400')) {
          // 400 에러는 데이터가 없어서 인사이트를 생성할 수 없는 경우
          setJobDifficultyApiData(null)
          setJobDifficultyError('선택하신 직무의 난이도 지수가 낮아 인사이트를 생성할 수 없습니다. 다른 직무를 선택해주세요.')
        } else {
          setJobDifficultyError(error.message || '직무 인재 수급 난이도 지수 데이터를 불러오는데 실패했습니다.')
          setJobDifficultyApiData(null)
        }
      } finally {
        setIsLoadingJobDifficulty(false)
      }
    }
    
    fetchJobDifficulty()
  }, [selectedDifficultyPosition, selectedDifficultyIndustry])

  // HHI 집중도 분석 API 호출
  useEffect(() => {
    const fetchHhiAnalysis = async () => {
      try {
        setIsLoadingHhiAnalysis(true)
        setHhiAnalysisError(null)
        
        // 종료일 설정 (오늘 날짜)
        const endDate = new Date()
        const endDateStr = endDate.toISOString().split('T')[0] // YYYY-MM-DD 형식
        
        // API 파라미터 구성
        const params = new URLSearchParams()
        params.append('end_date', endDateStr)
        params.append('include_insights', 'true')
        
        // position_name이 있으면 추가 (직무 인재 수급 난이도 지수와 동일한 선택값 사용)
        // position_name이 없으면 전체 시장 분석 (total_insight만 반환)
        if (selectedDifficultyPosition && selectedDifficultyPosition !== '') {
          params.append('position_name', selectedDifficultyPosition)
        }
        
        // industry_name이 있으면 추가 (position_name이 필수)
        if (selectedDifficultyIndustry && selectedDifficultyIndustry !== '' && selectedDifficultyPosition && selectedDifficultyPosition !== '') {
          params.append('industry_name', selectedDifficultyIndustry)
        }
        
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/position-competition/job-talent-difficulty-index?${params.toString()}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.status === 200 && result.data) {
          setHhiAnalysisApiData(result.data)
        } else {
          throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
        }
      } catch (error: any) {
        setHhiAnalysisError(error.message || 'HHI 집중도 분석 데이터를 불러오는데 실패했습니다.')
        setHhiAnalysisApiData(null)
      } finally {
        setIsLoadingHhiAnalysis(false)
      }
    }
    
    fetchHhiAnalysis()
  }, [selectedDifficultyPosition, selectedDifficultyIndustry])

  // 기존 로컬 계산 로직 (fallback용)
  const jobRoleStatisticsDataFallback = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    let currentPeriodStart: Date
    let currentPeriodEnd: Date
    let previousPeriodStart: Date
    let previousPeriodEnd: Date
    
    if (jobRoleStatisticsViewMode === 'Weekly') {
      // QoQ (전분기 대비): 현재 분기 vs 이전 분기
      const currentQuarter = Math.floor(now.getMonth() / 3) // 0~3 (1분기~4분기)
      const currentYear = now.getFullYear()
      
      // 현재 분기 시작일과 종료일
      const quarterStartMonth = currentQuarter * 3 // 0, 3, 6, 9
      currentPeriodStart = new Date(currentYear, quarterStartMonth, 1)
      currentPeriodEnd = new Date(now)
      
      // 이전 분기 시작일과 종료일
      let previousQuarter = currentQuarter - 1
      let previousYear = currentYear
      if (previousQuarter < 0) {
        previousQuarter = 3 // 4분기
        previousYear = currentYear - 1
      }
      const previousQuarterStartMonth = previousQuarter * 3
      const previousQuarterEndMonth = previousQuarterStartMonth + 2
      previousPeriodStart = new Date(previousYear, previousQuarterStartMonth, 1)
      previousPeriodEnd = new Date(previousYear, previousQuarterEndMonth + 1, 0) // 해당 월의 마지막 날
    } else {
      // MoM (전월 대비): 이번 달 vs 지난 달
      currentPeriodEnd = new Date(now)
      currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      // 지난달: 지난 달 1일부터 마지막 날까지
      previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    }
    
    // 경쟁사 목록 (필터링용)
    const competitors = ['네이버', '카카오', '토스', '라인', '우아한형제들', '삼성', 'LG CNS', '한화시스템']
    
    // 현재 기간 공고 필터링
    let currentPeriodJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= currentPeriodStart && postedDate <= currentPeriodEnd
      } catch {
        return false
      }
    })
    
    // 경쟁사 필터 적용 (전체가 아닌 경우)
    if (selectedJobRoleCompanyFilter !== '전체') {
      currentPeriodJobs = currentPeriodJobs.filter(job => {
        const jobCompany = (job.company || '').toLowerCase()
        return jobCompany.includes(selectedJobRoleCompanyFilter.toLowerCase()) || 
               selectedJobRoleCompanyFilter.toLowerCase().includes(jobCompany)
      })
    }
    
    // 이전 기간 공고 필터링
    let previousPeriodJobs = jobPostingsData.filter(job => {
      try {
        const postedDate = new Date(job.posted_date)
        postedDate.setHours(0, 0, 0, 0)
        return postedDate >= previousPeriodStart && postedDate <= previousPeriodEnd
      } catch {
        return false
      }
    })
    
    // 경쟁사 필터 적용 (전체가 아닌 경우)
    if (selectedJobRoleCompanyFilter !== '전체') {
      previousPeriodJobs = previousPeriodJobs.filter(job => {
        const jobCompany = (job.company || '').toLowerCase()
        return jobCompany.includes(selectedJobRoleCompanyFilter.toLowerCase()) || 
               selectedJobRoleCompanyFilter.toLowerCase().includes(jobCompany)
      })
    }
    
    // 최근 공고가 없으면 전체 데이터 사용 (최대 100개)
    const jobsToAnalyze = currentPeriodJobs.length > 0 ? currentPeriodJobs : jobPostingsData.slice(0, 100)
    // 이전 기간 공고가 없으면 전체 데이터에서 이전 기간에 해당하는 데이터를 찾거나, 빈 배열 사용
    // 이전 기간 데이터가 없어도 직군별로 0으로 표시되도록 하기 위해 빈 배열 사용
    const previousJobsToAnalyze = previousPeriodJobs.length > 0 ? previousPeriodJobs : []
    
    // 직군별 통계에 사용되는 모든 직군 목록 (SKAX 직무기술서 기준)
    const allRoles = {
      Tech: [
        'Software Development',
        'Factory AX Engineering',
        'Solution Development',
        'Cloud/Infra Engineering',
        'Architect',
        'Project Management',
        'Quality Management',
        'AI',
        '정보보호',
      ],
      Biz: [
        'Sales',
        'Domain Expert',
        'Consulting',
      ],
      BizSupporting: [
        'Biz. Supporting',
      ],
    }
    
    const rolesForCategory = allRoles[selectedExpertCategory] || []
    
    // 각 직군에 대한 키워드 매핑
    const roleKeywords: Record<string, string[]> = {
      'Software Development': ['software', 'development', '개발', '소프트웨어', '프로그래밍', 'programming', 'frontend', 'backend', 'fullstack', '프론트엔드', '백엔드', 'full-stack', 'developer', '개발자', 'react', 'vue', 'angular', 'node', 'java', 'python', 'javascript', 'typescript'],
      'Factory AX Engineering': ['factory', 'ax', 'engineering', '공장', '제조', '시뮬레이션', 'simulation', '기구설계', '전장', '제어', '자동화', 'automation', 'plc', 'scada'],
      'Solution Development': ['solution', '솔루션', 'erp', 'fcm', 'scm', 'hcm', 'biz', '비즈니스', 'sap', 'oracle'],
      'Cloud/Infra Engineering': ['cloud', 'infra', 'infrastructure', '인프라', '클라우드', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'devops', '시스템', '네트워크', 'database', '데이터베이스', 'postgresql', 'mysql', 'mongodb', 'redis'],
      'Architect': ['architect', '아키텍트', '설계', 'architecture', 'system design', '시스템 설계', 'solution architect'],
      'Project Management': ['project', 'management', 'pm', '프로젝트', '관리', '프로젝트 매니저', '프로젝트 관리', 'pmo', 'program manager'],
      'Quality Management': ['quality', 'qa', 'qc', '품질', '테스트', 'test', 'testing', 'qa engineer', 'quality assurance'],
      'AI': ['ai', 'artificial intelligence', '인공지능', 'machine learning', 'ml', '딥러닝', 'deep learning', '데이터', 'data', 'generative ai', '생성형 ai', 'tensorflow', 'pytorch', 'nlp', 'computer vision'],
      '정보보호': ['정보보호', '보안', 'security', 'cybersecurity', 'cyber', '보안 진단', 'compliance', 'governance', 'security engineer'],
      'Sales': ['sales', '영업', '세일즈', '영업사원', 'account', '고객', 'account manager', 'business development', '영업대표', '영업담당', '영업팀', '세일즈매니저', '영업관리', '영업지원', '영업기획', '영업전략', '영업운영', '영업관리자', '영업본부', '영업부서', '영업직', '영업직무', '영업업무', '영업활동', '영업채용', '영업모집'],
      'Domain Expert': ['domain', 'expert', '도메인', '전문가', '금융', '제조', '공공', 'b2c', 'industry expert', '금융전문가', '제조전문가', '공공전문가', '도메인전문가', '업무전문가', '분야전문가', '산업전문가', '영역전문가', '금융도메인', '제조도메인', '공공도메인', 'b2c도메인', '금융분야', '제조분야', '공공분야', 'b2c분야'],
      'Consulting': ['consulting', '컨설팅', '컨설턴트', 'esg', 'she', 'crm', 'scm', 'consultant', '컨설팅사', '컨설팅업체', '컨설팅회사', '컨설팅기업', '컨설팅팀', '컨설팅부서', '컨설팅서비스', '컨설팅업무', 'esg컨설팅', 'she컨설팅', 'crm컨설팅', 'scm컨설팅', 'erp컨설팅', 'ai컨설팅', 'esg컨설턴트', 'she컨설턴트', 'crm컨설턴트', 'scm컨설턴트', 'erp컨설턴트', 'ai컨설턴트'],
      'Biz. Supporting': ['strategy', 'planning', '전략', '기획', 'hr', '인사', '재무', 'financial', 'management', '경영', 'human resources'],
    }
    
    // Industries 매핑
    const roleIndustries: Record<string, string[]> = {
      'Software Development': ['Front-end Development', 'Back-end Development', 'Mobile Development'],
      'Factory AX Engineering': ['Simulation', '기구설계', '전장/제어'],
      'Solution Development': ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution'],
      'Cloud/Infra Engineering': ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering'],
      'Architect': ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect'],
      'Project Management': ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM'],
      'Quality Management': ['PMO', 'Quality Engineering', 'Offshoring Service Professional'],
      'AI': ['AI/Data Development', 'Generative AI Development', 'Physical AI Development'],
      '정보보호': ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service'],
      'Sales': ['[금융] 제1금융', '[금융] 제2금융', '[공공/Global] 공공', '[공공/Global] Global', '[제조] 대외', '[제조] 대내 Hi-Tech', '[제조] 대내 Process', '[B2C] 통신', '[B2C] 유통/물류/서비스', '[B2C] 미디어/콘텐츠'],
      'Domain Expert': ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인'],
      'Consulting': ['ESG', 'SHE', 'CRM', 'SCM', 'ERP', 'AI'],
      'Biz. Supporting': ['Strategy Planning', 'New Biz. Development', 'Financial Management', 'Human Resource Management', 'Stakeholder Management', 'Governance & Public Management'],
    }
    
    const roleCounts: Record<string, { current: number; previous: number }> = {}
    
    // 모든 직군 초기화
    rolesForCategory.forEach(role => {
      roleCounts[role] = { current: 0, previous: 0 }
    })
    
    // 현재 기간 공고 카운트
    jobsToAnalyze.forEach(job => {
      const title = (job.title || '').toLowerCase()
      const description = (job.description || '').toLowerCase()
      const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
      const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
      const text = `${title} ${description} ${techStack} ${jobCategory}`
      
      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (rolesForCategory.includes(role) && keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].current++
        }
      })
    })
    
    // 이전 기간 공고 카운트
    previousJobsToAnalyze.forEach(job => {
      const title = (job.title || '').toLowerCase()
      const description = (job.description || '').toLowerCase()
      const techStack = (job.meta_data?.tech_stack || []).join(' ').toLowerCase()
      const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
      const text = `${title} ${description} ${techStack} ${jobCategory}`
      
      Object.entries(roleKeywords).forEach(([role, keywords]) => {
        if (rolesForCategory.includes(role) && keywords.some(kw => text.includes(kw.toLowerCase()))) {
          roleCounts[role].previous++
        }
      })
    })
    
    // 총합 계산 (퍼센테이지 계산용)
    const currentTotal = Object.values(roleCounts).reduce((sum, counts) => sum + counts.current, 0)
    const previousTotal = Object.values(roleCounts).reduce((sum, counts) => sum + counts.previous, 0)
    
    // 데이터 변환 (모든 직군 포함, 0인 값도 포함)
    const result = rolesForCategory.map(role => {
      const counts = roleCounts[role] || { current: 0, previous: 0 }
      
      // 퍼센테이지 계산
      const currentPercentage = currentTotal > 0 ? (counts.current / currentTotal) * 100 : null
      const previousPercentage = previousTotal > 0 ? (counts.previous / previousTotal) * 100 : null
      
      // 변화율 계산 (이전 값 대비)
      let changeRate: number | null = null
      if (previousTotal > 0 && currentTotal > 0) {
        // 비율의 변화율 계산: ((현재 비율 - 이전 비율) / 이전 비율) * 100
        if (previousPercentage !== null && previousPercentage > 0) {
          changeRate = ((currentPercentage || 0) - previousPercentage) / previousPercentage * 100
        } else if (currentPercentage !== null && currentPercentage > 0) {
          changeRate = 100 // 이전에 없었는데 현재 생긴 경우
        }
      }
      
      const defaultIndustries = (roleIndustries[role] || []).map((name: string) => ({
        name: name,
        current_count: 0,
        previous_count: 0
      }))
      return {
        name: role,
        value: counts.current,
        previousValue: counts.previous,
        currentPercentage: currentPercentage,
        previousPercentage: previousPercentage,
        changeRate: changeRate,
        industries: defaultIndustries,
      }
    })
    
    // 결과가 비어있지 않도록 보장 (최소한 하나의 직군은 있어야 함)
    if (result.length === 0) {
      // 카테고리에 맞는 기본 직군 반환
      const defaultRole = selectedExpertCategory === 'Tech' ? 'Software Development' 
        : selectedExpertCategory === 'Biz' ? 'Sales' 
        : 'Biz. Supporting'
      const defaultIndustries = (roleIndustries[defaultRole] || []).map((name: string) => ({
        name: name,
        current_count: 0,
        previous_count: 0
      }))
      return [{
        name: defaultRole,
        value: 0,
        previousValue: 0,
        currentPercentage: null,
        previousPercentage: null,
        changeRate: null,
        industries: defaultIndustries,
      }]
    }
    
    return result
  }, [selectedExpertCategory, jobRoleStatisticsViewMode, selectedJobRoleCompanyFilter])

  // 직군별 통계 데이터 변환 (API 응답을 컴포넌트 형식으로 변환)
  const jobRoleStatisticsData = useMemo(() => {
    // 직군별 통계에 사용되는 모든 직군 목록 (SKAX 직무기술서 기준)
    const allRoles = {
      Tech: [
        'Software Development',
        'Factory AX Engineering',
        'Solution Development',
        'Cloud/Infra Engineering',
        'Architect',
        'Project Management',
        'Quality Management',
        'AI',
        '정보보호',
      ],
      Biz: [
        'Sales',
        'Domain Expert',
        'Consulting',
      ],
      BizSupporting: [
        'Biz. Supporting',
      ],
    }
    
    const rolesForCategory = allRoles[selectedExpertCategory] || []
    
    // Industries 매핑
    const roleIndustries: Record<string, string[]> = {
      'Software Development': ['Front-end Development', 'Back-end Development', 'Mobile Development'],
      'Factory AX Engineering': ['Simulation', '기구설계', '전장/제어'],
      'Solution Development': ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution'],
      'Cloud/Infra Engineering': ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering'],
      'Architect': ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect'],
      'Project Management': ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM'],
      'Quality Management': ['PMO', 'Quality Engineering', 'Offshoring Service Professional'],
      'AI': ['AI/Data Development', 'Generative AI Development', 'Physical AI Development'],
      '정보보호': ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service'],
      'Sales': ['[금융] 제1금융', '[금융] 제2금융', '[공공/Global] 공공', '[공공/Global] Global', '[제조] 대외', '[제조] 대내 Hi-Tech', '[제조] 대내 Process', '[B2C] 통신', '[B2C] 유통/물류/서비스', '[B2C] 미디어/콘텐츠'],
      'Domain Expert': ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인'],
      'Consulting': ['ESG', 'SHE', 'CRM', 'SCM', 'ERP', 'AI'],
      'Biz. Supporting': ['Strategy Planning', 'New Biz. Development', 'Financial Management', 'Human Resource Management', 'Stakeholder Management', 'Governance & Public Management'],
    }
    
    // API 데이터가 있고 statistics 배열이 있으면 사용
    if (jobRoleStatisticsApiData && Array.isArray(jobRoleStatisticsApiData.statistics)) {
      const statisticsArray = jobRoleStatisticsApiData.statistics
      
      // API 응답에서 받은 데이터를 맵으로 변환 (빠른 조회를 위해)
      const apiDataMap = new Map<string, any>()
      statisticsArray.forEach((stat: any) => {
        // API 응답 구조: stat.name이 직군 이름
        const roleName = stat.name || stat.job_role || ''
        if (roleName) {
          apiDataMap.set(roleName, stat)
        }
      })
      
      // 모든 직군에 대해 데이터 생성 (API에 없는 직군은 0으로 채움)
      const transformedData = rolesForCategory.map((roleName) => {
        const apiStat = apiDataMap.get(roleName)
        if (apiStat) {
          // API 응답 구조에 맞게 필드명 처리
          // API 응답: current_count, previous_count, current_percentage, previous_percentage, change_rate
          const currentCount = apiStat.current_count !== undefined ? apiStat.current_count : 0
          const previousCount = apiStat.previous_count !== undefined ? apiStat.previous_count : 0
          const currentPercentage = apiStat.current_percentage !== undefined ? apiStat.current_percentage : null
          const previousPercentage = apiStat.previous_percentage !== undefined ? apiStat.previous_percentage : null
          const changeRate = apiStat.change_rate !== undefined ? apiStat.change_rate : null
          
          // industries 처리: API 응답 구조는 객체 배열 [{name: string, current_count: number, previous_count: number}]
          let industries: Array<{name: string, current_count: number, previous_count: number}> = []
          if (apiStat.industries && Array.isArray(apiStat.industries)) {
            if (apiStat.industries.length > 0) {
              // 객체 배열인지 확인 (첫 번째 요소가 객체인지)
              if (typeof apiStat.industries[0] === 'object' && apiStat.industries[0] !== null && 'name' in apiStat.industries[0]) {
                // 객체 배열이면 그대로 사용 (current_count, previous_count 포함)
                industries = apiStat.industries.map((ind: any) => ({
                  name: ind.name || '',
                  current_count: ind.current_count !== undefined ? ind.current_count : 0,
                  previous_count: ind.previous_count !== undefined ? ind.previous_count : 0
                })).filter((ind: any) => ind.name)
              } else if (typeof apiStat.industries[0] === 'string') {
                // 문자열 배열이면 객체 배열로 변환 (count는 0으로 설정)
                industries = apiStat.industries.map((name: string) => ({
                  name: name,
                  current_count: 0,
                  previous_count: 0
                })).filter((ind: any) => ind.name)
              }
            }
          }
          
          // industries가 비어있으면 기본 매핑 사용 (count는 0으로 설정)
          if (industries.length === 0) {
            industries = (roleIndustries[roleName] || []).map((name: string) => ({
              name: name,
              current_count: 0,
              previous_count: 0
            }))
          }
          
          return {
            name: roleName,
            value: currentCount,
            previousValue: previousCount,
            currentPercentage: currentPercentage,
            previousPercentage: previousPercentage,
            changeRate: changeRate,
            industries: industries,
          }
        } else {
          // API에 없는 직군은 0으로 채움
          const defaultIndustries = (roleIndustries[roleName] || []).map((name: string) => ({
            name: name,
            current_count: 0,
            previous_count: 0
          }))
          return {
            name: roleName,
            value: 0,
            previousValue: 0,
            currentPercentage: null,
            previousPercentage: null,
            changeRate: null,
            industries: defaultIndustries,
          }
        }
      })
      
      // 변환된 데이터 반환
      return transformedData
    }
    
    // API 데이터가 없으면 빈 배열 반환 (fallback 데이터 사용 안 함)
    return []
  }, [jobRoleStatisticsApiData, selectedExpertCategory])

  // 직군별 통계 기간 정보 (API 응답에서 가져오기, 없으면 로컬 계산)
  const jobRoleStatisticsPeriods = useMemo(() => {
    // API 데이터가 있으면 API에서 기간 정보 사용
    if (jobRoleStatisticsApiData && jobRoleStatisticsApiData.current_period && jobRoleStatisticsApiData.previous_period) {
      try {
        return {
          currentPeriodStart: new Date(jobRoleStatisticsApiData.current_period.start_date),
          currentPeriodEnd: new Date(jobRoleStatisticsApiData.current_period.end_date),
          previousPeriodStart: new Date(jobRoleStatisticsApiData.previous_period.start_date),
          previousPeriodEnd: new Date(jobRoleStatisticsApiData.previous_period.end_date),
        }
      } catch (error) {
        // 날짜 파싱 실패 시 로컬 계산으로 fallback
      }
    }
    
    // API 데이터가 없으면 로컬 계산
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    let currentPeriodStart: Date
    let currentPeriodEnd: Date
    let previousPeriodStart: Date
    let previousPeriodEnd: Date
    
    if (jobRoleStatisticsViewMode === 'Weekly') {
      // QoQ (전분기 대비): 현재 분기 vs 이전 분기
      const currentQuarter = Math.floor(now.getMonth() / 3)
      const currentYear = now.getFullYear()
      const quarterStartMonth = currentQuarter * 3
      currentPeriodStart = new Date(currentYear, quarterStartMonth, 1)
      currentPeriodEnd = new Date(now)
      
      let previousQuarter = currentQuarter - 1
      let previousYear = currentYear
      if (previousQuarter < 0) {
        previousQuarter = 3
        previousYear = currentYear - 1
      }
      const previousQuarterStartMonth = previousQuarter * 3
      const previousQuarterEndMonth = previousQuarterStartMonth + 2
      previousPeriodStart = new Date(previousYear, previousQuarterStartMonth, 1)
      previousPeriodEnd = new Date(previousYear, previousQuarterEndMonth + 1, 0)
    } else {
      // MoM (전월 대비): 이번 달 vs 지난 달
      currentPeriodEnd = new Date(now)
      currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    }
    
    return {
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    }
  }, [jobRoleStatisticsApiData, jobRoleStatisticsViewMode])



  // 스킬별 통계 API 상태
  const [skillsApiData, setSkillsApiData] = useState<Array<{
    name: string
    count: number
    percentage: number
    change: number
    relatedSkills: string[]
  }>>([])
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const [skillsError, setSkillsError] = useState<string | null>(null)

  // 기본 스킬 데이터 (API 실패 시 fallback)
  const defaultSkillsData = [
    { name: 'spring', count: 286, percentage: 26.8, change: 3.5, relatedSkills: ['kotlin', 'java', 'maven', 'gradle'] },
    { name: 'react', count: 245, percentage: 22.9, change: 5.2, relatedSkills: ['typescript', 'javascript', 'nextjs'] },
    { name: 'python', count: 198, percentage: 18.5, change: 2.1, relatedSkills: ['django', 'flask', 'fastapi'] },
    { name: 'typescript', count: 187, percentage: 17.5, change: 4.3, relatedSkills: ['react', 'nodejs', 'angular'] },
    { name: 'aws', count: 156, percentage: 14.6, change: 1.8, relatedSkills: ['ec2', 's3', 'lambda'] },
    { name: 'docker', count: 142, percentage: 13.3, change: 2.7, relatedSkills: ['kubernetes', 'jenkins', 'ci/cd'] },
    { name: 'mysql', count: 128, percentage: 12.0, change: 1.5, relatedSkills: ['postgresql', 'mongodb', 'redis'] },
    { name: 'kubernetes', count: 115, percentage: 10.8, change: 3.2, relatedSkills: ['docker', 'helm', 'istio'] },
    { name: 'redis', count: 98, percentage: 9.2, change: 2.4, relatedSkills: ['cache', 'pub/sub', 'session'] },
    { name: 'kafka', count: 87, percentage: 8.1, change: 1.9, relatedSkills: ['streaming', 'event-driven', 'messaging'] },
    { name: 'nodejs', count: 165, percentage: 15.4, change: 2.8, relatedSkills: ['express', 'nestjs', 'graphql'] },
    { name: 'vue', count: 134, percentage: 12.5, change: 1.6, relatedSkills: ['nuxt', 'vuex', 'pinia'] },
    { name: 'java', count: 178, percentage: 16.7, change: 2.3, relatedSkills: ['spring', 'jpa', 'maven'] },
    { name: 'go', count: 112, percentage: 10.5, change: 3.1, relatedSkills: ['gin', 'gorm', 'microservices'] },
    { name: 'kotlin', count: 145, percentage: 13.6, change: 2.9, relatedSkills: ['spring', 'android', 'coroutines'] },
    { name: 'postgresql', count: 98, percentage: 9.2, change: 1.4, relatedSkills: ['sql', 'database', 'orm'] },
    { name: 'mongodb', count: 76, percentage: 7.1, change: 1.2, relatedSkills: ['nosql', 'database', 'aggregation'] },
    { name: 'elasticsearch', count: 89, percentage: 8.3, change: 2.0, relatedSkills: ['search', 'logstash', 'kibana'] },
    { name: 'graphql', count: 67, percentage: 6.3, change: 1.8, relatedSkills: ['apollo', 'relay', 'api'] },
    { name: 'terraform', count: 92, percentage: 8.6, change: 2.5, relatedSkills: ['iac', 'aws', 'infrastructure'] },
  ].sort((a, b) => b.count - a.count)

  // 스킬 통계 API 호출 (회사 및 연도 필터 적용)
  useEffect(() => {
    const fetchSkillsStatistics = async () => {
      try {
        setIsLoadingSkills(true)
        setSkillsError(null)
        
        const params = new URLSearchParams()
        
        // 연도 필터 추가
        if (selectedSkillCloudYear !== '전체') {
          const startDate = `${selectedSkillCloudYear}-01-01`
          const endDate = `${selectedSkillCloudYear}-12-31`
          params.append('start_date', startDate)
          params.append('end_date', endDate)
        } else {
          // 전체 선택 시 최근 5년 전체 데이터
          const startDate = '2021-01-01'
          const endDate = '2025-12-31'
          params.append('start_date', startDate)
          params.append('end_date', endDate)
        }
        
        // 회사 필터 추가 (스킬 클라우드용) - 빈 값이 아닐 때만 추가
        if (selectedSkillCloudCompany && selectedSkillCloudCompany !== '전체' && selectedSkillCloudCompany.trim() !== '') {
          params.append('company', selectedSkillCloudCompany)
        }
        
        params.append('limit', '13')
        
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/skills/statistics?${params.toString()}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        // 404 에러는 조용히 처리 (API가 존재하지 않을 수 있음)
        if (!response.ok) {
          if (response.status === 404) {
            // 404 에러는 빈 배열 반환 (데이터 없음 표시)
            setSkillsApiData([])
            setIsLoadingSkills(false)
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if ((result.status === 0 || result.status === 200) && result.code === 'SUCCESS' && result.data) {
          const { skills } = result.data
          if (Array.isArray(skills)) {
            // 상위 13개 스킬만 선택하고, 각 스킬의 relatedSkills를 3개로 제한
            const processedSkills = skills
              .sort((a: any, b: any) => b.count - a.count)
              .slice(0, 13)
              .map((skill: any) => {
                // relatedSkills가 배열인 경우 3개로 제한
                if (skill.relatedSkills && Array.isArray(skill.relatedSkills)) {
                  return {
                    ...skill,
                    relatedSkills: skill.relatedSkills.slice(0, 3)
                  }
                }
                // relatedSkills가 객체 배열인 경우 (API 응답 형식)
                if (skill.relatedSkills && Array.isArray(skill.relatedSkills) && skill.relatedSkills.length > 0 && typeof skill.relatedSkills[0] === 'object') {
                  return {
                    ...skill,
                    relatedSkills: skill.relatedSkills.slice(0, 3).map((rs: any) => rs.name || rs)
                  }
                }
                return skill
              })
            setSkillsApiData(processedSkills)
          } else {
            setSkillsApiData([])
          }
        } else {
          setSkillsApiData([])
        }
      } catch (err) {
        setSkillsError(err instanceof Error ? err.message : '스킬 통계를 불러오는 중 오류가 발생했습니다.')
        setSkillsApiData([])
      } finally {
        setIsLoadingSkills(false)
      }
    }

    fetchSkillsStatistics()
  }, [selectedSkillCloudCompany, selectedSkillCloudYear])
  
  // 스킬 트렌드 회사 변경 시 스킬 클라우드 회사도 동기화
  useEffect(() => {
    setSelectedSkillCloudCompany(selectedSkillCompany)
  }, [selectedSkillCompany])

  // 스킬 클라우드에 사용할 데이터 (선택된 회사에 따라 필터링)
  const skillCloudData = useMemo(() => {
    return skillsApiData
  }, [skillsApiData])

  // 현재 시간 표시 (클라이언트에서만 업데이트)
  const [currentTime, setCurrentTime] = useState('')
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const date = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const ampm = parseInt(hours) < 12 ? '오전' : '오후'
      const displayHours = parseInt(hours) % 12 || 12
      
      setCurrentTime(`${year}. ${month}. ${date}. ${ampm} ${displayHours}:${minutes}:${seconds}`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // 에러 바운더리를 위한 에러 상태
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 컴포넌트 마운트 시 에러 체크
  useEffect(() => {
    try {
      // 기본 컴포넌트들이 제대로 로드되는지 확인
      if (!Header) {
        throw new Error('Header 컴포넌트를 불러올 수 없습니다.')
      }
    } catch (error: any) {
      setHasError(true)
      setErrorMessage(error?.message || '알 수 없는 오류가 발생했습니다.')
      console.error('대시보드 초기화 에러:', error)
    }
  }, [])

  // 에러 발생 시 에러 화면 표시
  if (hasError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">대시보드 로딩 오류</h1>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {hasNewJobs && (
        <NotificationToast newJobs={newJobs} onClose={clearNewJobs} />
      )}

      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600">{currentTime || '로딩 중...'} | 실시간 모니터링</p>
          </div>
        </div>

        {/* 메인 3열 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
          {/* 왼쪽 컬럼 (9열) - 채용 일정 시뮬레이션 및 채용 공고 수 추이 */}
          <div className="lg:col-span-9 flex flex-col lg:flex-row gap-6 items-stretch h-full">
            <DarkDashboardCard title="채용 일정 시뮬레이션" className="lg:w-[42%] flex flex-col">
              <div className="flex-1 min-h-0">
                {isLoadingRecruitmentSchedule ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="animate-spin h-8 w-8 text-gray-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm text-gray-600">채용 일정 데이터를 불러오는 중...</p>
                    </div>
                  </div>
                ) : recruitmentScheduleError ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-4">
                      <p className="text-sm text-red-600 mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
                      <p className="text-xs text-gray-500">{recruitmentScheduleError}</p>
                    </div>
                  </div>
                ) : recruitmentScheduleData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-4">
                      <p className="text-sm text-gray-600 mb-2">표시할 채용 일정 데이터가 없습니다.</p>
                      <p className="text-xs text-gray-500">API에서 데이터를 가져오지 못했습니다.</p>
                    </div>
                  </div>
                ) : (
                  <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="text-gray-500">로딩 중...</div></div>}>
                    <NewRecruitmentCalendar events={recruitmentScheduleData} />
                  </Suspense>
                )}
              </div>
            </DarkDashboardCard>

            {/* 통합 차트: 채용 공고 수 추이 + 회사별 채용 활동 */}
            <DarkDashboardCard title="채용 공고 수 추이 및 주요 회사별 채용 활동" className="lg:w-[58%] flex flex-col">
              <div className="mb-4 flex flex-wrap gap-2 items-center flex-shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setJobPostingsTrendTimeframe('Weekly')
                      setCompanyRecruitmentTimeframe('Weekly')
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      jobPostingsTrendTimeframe === 'Weekly'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    주간
                  </button>
                  <button
                    onClick={() => {
                      setJobPostingsTrendTimeframe('Monthly')
                      setCompanyRecruitmentTimeframe('Monthly')
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      jobPostingsTrendTimeframe === 'Monthly'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    월간
                  </button>
                </div>
                <div className="ml-auto items-center">
                  {/* 데이터가 있으면 즉시 표시, 로딩 중이어도 기존 데이터 유지 */}
                  {recruitmentCompanies.length > 0 ? (
                    <select
                      value={selectedRecruitmentCompanies.length === 1 ? selectedRecruitmentCompanies[0] : 'all'}
                      onChange={(e) => {
                        const value = e.target.value
                        setIsManualSelection(true) // 사용자가 수동으로 선택했음을 표시
                        if (value === 'all') {
                          // 전체 선택: 모든 회사 선택
                          setSelectedRecruitmentCompanies(recruitmentCompanies.map((c: { key: string; name: string }) => c.name))
                        } else {
                          // 단일 회사 선택
                          setSelectedRecruitmentCompanies([value])
                        }
                      }}
                      className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent min-w-[150px]"
                    >
                      <option value="all">전체</option>
                      {recruitmentCompanies.map((company: { key: string; name: string }) => (
                        <option key={company.key} value={company.name}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </div>
              <div className="flex-shrink-0" style={{ minHeight: '400px' }}>
                {(() => {
                  // 그래프 데이터가 있으면 즉시 표시 (인사이트 로딩과 무관)
                  // 그래프 데이터가 있으면 로딩 상태를 표시하지 않음
                  const hasGraphData = jobPostingsTrendApiData.length > 0 || companyRecruitmentChartData.length > 0
                  // 그래프 데이터가 없을 때만 로딩 상태 표시 (인사이트 로딩과 무관)
                  const isLoading = !hasGraphData && (isLoadingJobPostingsTrend || isLoadingCompanyRecruitment)
                  
                  return (
                    <CombinedTrendChart
                      jobPostingsTrendData={jobPostingsTrendApiData}
                      companyRecruitmentData={companyRecruitmentChartData}
                      companies={recruitmentCompanies}
                      selectedCompanies={selectedRecruitmentCompanies}
                      timeframe={jobPostingsTrendTimeframe}
                      isLoading={isLoading}
                      error={jobPostingsTrendError || companyRecruitmentError}
                    />
                  )
                })()}
              </div>
              
              {/* 인사이트 표시 */}
              {(() => {
                // 전체 선택인지 확인 (length가 0이거나 모든 회사가 선택된 경우)
                const isAllSelected = selectedRecruitmentCompanies.length === 0 || 
                  (recruitmentCompanies.length > 0 && selectedRecruitmentCompanies.length === recruitmentCompanies.length)
                
                // 전체 선택 시에는 안내 멘트 표시
                if (isAllSelected) {
                  return (
                    <div className="mt-3 pt-3 border-t border-gray-200 pb-0 flex-shrink-0">
                      <div className="bg-blue-50 rounded-lg border border-blue-200 px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-blue-600 text-sm font-medium">
                            💡 회사를 선택하여 회사별 인사이트를 확인하세요
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                
                // 단일 회사 선택 시
                if (selectedRecruitmentCompanies.length === 1) {
                  const selectedCompany = recruitmentCompanies.find((c: { key: string; name: string }) => c.name === selectedRecruitmentCompanies[0])
                  if (!selectedCompany) return null

                  // 인사이트 로딩 상태 확인
                  // 그래프는 먼저 표시하고, 인사이트는 비동기로 로드되도록 함
                  const isInsightLoading = isLoadingInsight

                  // 선택된 회사의 채용 활동 데이터 필터링
                  // 단일 회사 선택 시 jobPostingsTrendApiData에 해당 회사의 데이터가 이미 포함되어 있음
                  let singleCompanyRecruitmentData: Array<{ period: string; count: number }> = []
                  
                  // 우선순위: jobPostingsTrendApiData > selectedCompany.trends > insight.trend_analysis > companyRecruitmentChartData
                  if (jobPostingsTrendApiData && jobPostingsTrendApiData.length > 0) {
                    // jobPostingsTrendApiData는 이미 단일 회사 선택 시 해당 회사의 데이터를 포함함
                    singleCompanyRecruitmentData = jobPostingsTrendApiData
                  } else if (combinedTrendData?.selectedCompany?.trends) {
                    // selected_company.trends 사용
                    singleCompanyRecruitmentData = formatTrendData(combinedTrendData.selectedCompany.trends)
                  } else if (combinedTrendData?.insight?.trend_analysis) {
                    // trend_analysis 사용 (fallback)
                    singleCompanyRecruitmentData = combinedTrendData.insight.trend_analysis.map((item: { period: string; company_count: number }) => ({
                      period: String(item.period),
                      count: item.company_count || 0,
                    }))
                  } else if (companyRecruitmentChartData && companyRecruitmentChartData.length > 0) {
                    // 기존 형식 데이터 사용
                    singleCompanyRecruitmentData = companyRecruitmentChartData.map((item: { period: string; [key: string]: string | number }) => ({
                      period: String(item.period),
                      count: Number(item[selectedCompany.key] || 0),
                    }))
                  }

                  return (
                    <div className="mt-3 pt-3 border-t border-gray-200 pb-0 flex-shrink-0">
                      <CompanyInsightView
                        companyKey={selectedCompany.key}
                        companyName={selectedCompany.name}
                        companyColor={selectedCompany.color}
                        timeframe={jobPostingsTrendTimeframe}
                        recruitmentData={singleCompanyRecruitmentData}
                        totalTrendData={jobPostingsTrendApiData}
                        insightData={combinedTrendData?.insight}
                        isLoading={isInsightLoading}
                        error={jobPostingsTrendError || companyRecruitmentError}
                      />
                    </div>
                  )
                }
                
                return null
              })()}
            </DarkDashboardCard>
          </div>

          {/* 오른쪽 컬럼 (3열) - 경쟁사 최신 공고 */}
          <div className="lg:col-span-3 flex flex-col space-y-6 h-full">
            {(() => {
              // 인사이트가 표시되는지 확인
              const isAllSelected = selectedRecruitmentCompanies.length === 0 || 
                (recruitmentCompanies.length > 0 && selectedRecruitmentCompanies.length === recruitmentCompanies.length)
              const hasInsight = !isAllSelected && selectedRecruitmentCompanies.length === 1 && combinedTrendData?.insight
              
              return (
                <div className={`bg-white rounded-lg border border-gray-200 shadow-lg p-6 flex flex-col ${hasInsight ? 'h-full' : 'min-h-[450px]'}`}>
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900">경쟁사 최신 공고</h2>
                    <Link 
                      href="/jobs"
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      전체 보기
                      <span className="text-xs">→</span>
                    </Link>
                  </div>
                  <div className="text-gray-700 flex-1 min-h-0 overflow-hidden">
                    {/* HotJobsList가 독립적으로 로딩 상태를 처리하므로 즉시 렌더링 */}
                    <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="text-gray-500">로딩 중...</div></div>}>
                      <HotJobsList 
                        itemsPerPage={hasInsight ? 10 : 5}
                        limit={10}
                      />
                    </Suspense>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* 하단 2열 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 직군 비중 변화 분석 */}
          <DarkDashboardCard title={
            <div className="flex items-center justify-between w-full">
              <span>직군 비중 변화 분석</span>
              {isLoadingJobRoleStatistics && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>로딩중</span>
                </div>
              )}
            </div>
          } className="overflow-visible">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setJobRoleStatisticsViewMode('Weekly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobRoleStatisticsViewMode === 'Weekly'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  QoQ (전분기 대비)
                </button>
                <button
                  onClick={() => setJobRoleStatisticsViewMode('Monthly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobRoleStatisticsViewMode === 'Monthly'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  MoM (전월 대비)
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedExpertCategory('Tech')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedExpertCategory === 'Tech'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Tech
                </button>
                <button
                  onClick={() => setSelectedExpertCategory('Biz')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedExpertCategory === 'Biz'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Biz
                </button>
                <button
                  onClick={() => setSelectedExpertCategory('BizSupporting')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedExpertCategory === 'BizSupporting'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Biz Supporting
                </button>
              </div>
            </div>
            <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="text-gray-500">로딩 중...</div></div>}>
              <JobRoleStatisticsChart
                data={jobRoleStatisticsData}
                selectedRole={selectedJobRole}
                onRoleClick={setSelectedJobRole}
                viewMode={jobRoleStatisticsViewMode}
                currentPeriodStart={jobRoleStatisticsPeriods.currentPeriodStart}
                currentPeriodEnd={jobRoleStatisticsPeriods.currentPeriodEnd}
                previousPeriodStart={jobRoleStatisticsPeriods.previousPeriodStart}
                previousPeriodEnd={jobRoleStatisticsPeriods.previousPeriodEnd}
                isLoading={isLoadingJobRoleStatistics}
                error={jobRoleStatisticsError}
                selectedCompanyFilter={selectedJobRoleCompanyFilter}
                onCompanyFilterChange={setSelectedJobRoleCompanyFilter}
                availableCompanies={recruitmentCompanies}
                insights={jobRoleStatisticsApiData?.insights || null}
              />
            </Suspense>
          </DarkDashboardCard>

          <DarkDashboardCard title={
            <div className="flex items-center justify-between w-full">
              <span>직무 인재 수급 난이도 지수</span>
              {isLoadingJobDifficulty && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>로딩중</span>
                </div>
              )}
            </div>
          }>
            {jobDifficultyError && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <div className="text-yellow-800 text-sm">{jobDifficultyError}</div>
              </div>
            )}
            
            {/* 로딩 중에도 컴포넌트 표시 (기존 데이터 유지) */}
            {jobDifficultyData && jobDifficultyData.length > 0 ? (
              <div className="relative">
                <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="text-gray-500">로딩 중...</div></div>}>
                  <JobDifficultyGauges 
                    data={jobDifficultyData}
                    onPositionChange={(position) => setSelectedDifficultyPosition(position)}
                    onIndustryChange={(industry) => setSelectedDifficultyIndustry(industry)}
                  />
                </Suspense>
              </div>
            ) : isLoadingJobDifficulty ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
              </div>
            ) : null}
            
            {/* HHI 집중도 분석 인사이트 */}
            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="text-xl font-bold text-gray-900 mb-6">시장 집중도 분석 인사이트</div>
              
              {isLoadingHhiAnalysis && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">인사이트 생성 중...</div>
                </div>
              )}
              
              {hhiAnalysisError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-800 text-sm">{hhiAnalysisError}</div>
                </div>
              )}
              
              {!isLoadingHhiAnalysis && !hhiAnalysisError && hhiAnalysisApiData && (
                <div className="space-y-6">
                  {/* 분석 기간 */}
                  {hhiAnalysisApiData.period && (
                    <div className="text-sm text-gray-600 mb-4">
                      분석 기간: {hhiAnalysisApiData.period.start} ~ {hhiAnalysisApiData.period.end}
                    </div>
                  )}

                  {/* 분석 카드들을 한 행에 배치 */}
                  {(() => {
                    // 선택된 필터에 따라 그리드 열 수 결정 (반응형)
                    const hasPosition = selectedDifficultyPosition && selectedDifficultyPosition !== ''
                    const hasIndustry = selectedDifficultyIndustry && selectedDifficultyIndustry !== '' && hasPosition
                    
                    let gridCols = 'grid-cols-1' // 모바일: 항상 1열
                    if (hasIndustry) {
                      // 전체 시장 + 직군 + 산업: 모바일 1열, 태블릿 2열, 데스크톱 3열
                      gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    } else if (hasPosition) {
                      // 전체 시장 + 직군: 모바일 1열, 태블릿 2열, 데스크톱 2열
                      gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
                    } else {
                      // 전체 시장만: 모든 화면에서 1열
                      gridCols = 'grid-cols-1'
                    }
                    
                    return (
                      <div className={`grid ${gridCols} gap-4 md:gap-6 items-stretch`}>
                        {/* 전체 시장 인사이트 */}
                        {hhiAnalysisApiData.total_insight && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 md:p-6 min-w-0 flex flex-col h-full overflow-hidden">
                            <div className="mb-3">
                              <div className="text-base md:text-lg font-bold text-gray-900">전체 시장 분석</div>
                            </div>
                          
                          <div className="flex flex-wrap gap-3 md:gap-4 mb-4">
                            {hhiAnalysisApiData.total_insight.total_posts !== undefined && (
                              <div className="text-xs md:text-sm text-gray-700">
                                전체 공고 수: <span className="font-semibold">{hhiAnalysisApiData.total_insight.total_posts.toLocaleString()}개</span>
                              </div>
                            )}
                            {hhiAnalysisApiData.total_insight.hhi !== undefined && (
                              <div className="text-xs md:text-sm text-gray-700">
                                HHI 지수: <span className="font-semibold">{hhiAnalysisApiData.total_insight.hhi.toFixed(4)}</span>
                              </div>
                            )}
                            {hhiAnalysisApiData.total_insight.interpretation && (
                              <>
                                {hhiAnalysisApiData.total_insight.interpretation.level && (
                                  <div className="text-xs md:text-sm text-gray-700">
                                    집중도: <span className="font-semibold">{hhiAnalysisApiData.total_insight.interpretation.level}</span>
                                  </div>
                                )}
                                {hhiAnalysisApiData.total_insight.interpretation.difficulty && (
                                  <div className="text-xs md:text-sm text-gray-700">
                                    난이도: <span className="font-semibold">{hhiAnalysisApiData.total_insight.interpretation.difficulty}</span>
                                  </div>
                                )}
                              </>
                            )}
                            {hhiAnalysisApiData.total_insight.yoy_overheat_score !== undefined && (
                              <div className="text-xs md:text-sm text-gray-700">
                                전년 대비 과열도: <span className="font-semibold">{hhiAnalysisApiData.total_insight.yoy_overheat_score.toFixed(2)}</span>
                                {hhiAnalysisApiData.total_insight.yoy_trend && (
                                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                    hhiAnalysisApiData.total_insight.yoy_trend === '과열' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {hhiAnalysisApiData.total_insight.yoy_trend}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* 주요 인사이트 */}
                          {(() => {
                        const insights = hhiAnalysisApiData.total_insight?.insights
                        
                        if (hhiAnalysisApiData.total_insight && 
                            insights && 
                            Array.isArray(insights) && 
                            insights.length > 0) {
                          return (
                            <div className="space-y-2 mb-4">
                              <div className="text-xs md:text-sm font-semibold text-gray-900 mb-2">주요 인사이트:</div>
                              <ul className="space-y-1.5 md:space-y-2">
                                {insights.map((insight: string, index: number) => (
                                  <li key={index} className="text-xs md:text-sm text-gray-700 flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        } else {
                          return (
                            <div className="text-sm text-gray-500 italic mb-4">인사이트 생성 중...</div>
                          )
                        }
                          })()}

                          {/* 상위 직군 정보 */}
                          {hhiAnalysisApiData.total_insight.top_positions && hhiAnalysisApiData.total_insight.top_positions.length > 0 && (
                            <div className="mt-auto pt-4 md:pt-6 border-t border-blue-200">
                              <div className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3">상위 직군</div>
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                {hhiAnalysisApiData.total_insight.top_positions.slice(0, 5).map((position: any, index: number) => (
                                  <div 
                                    key={position.position_id} 
                                    className="flex items-center gap-2"
                                  >
                                    <span className="text-xs md:text-sm font-medium text-gray-900">
                                      {position.position_name}
                                    </span>
                                    {index < hhiAnalysisApiData.total_insight.top_positions.slice(0, 5).length - 1 && (
                                      <span className="text-gray-400">•</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                    )}

                      {/* 직군별 인사이트 */}
                      {hhiAnalysisApiData.position_insight && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 md:p-6 min-w-0 flex flex-col h-full overflow-hidden">
                          <div className="mb-3">
                            <div className="text-base md:text-lg font-bold text-gray-900">
                              {hhiAnalysisApiData.position_insight.position_name} 직군 분석
                            </div>
                          </div>
                      
                          <div className="flex flex-wrap gap-3 md:gap-4 mb-4">
                            {hhiAnalysisApiData.position_insight.hhi !== undefined && (
                              <div className="text-xs md:text-sm text-gray-700">
                                HHI 지수: <span className="font-semibold">{hhiAnalysisApiData.position_insight.hhi.toFixed(4)}</span>
                              </div>
                            )}
                            {hhiAnalysisApiData.position_insight.interpretation && (
                              <>
                                {hhiAnalysisApiData.position_insight.interpretation.level && (
                                  <div className="text-xs md:text-sm text-gray-700">
                                    집중도: <span className="font-semibold">{hhiAnalysisApiData.position_insight.interpretation.level}</span>
                                  </div>
                                )}
                                {hhiAnalysisApiData.position_insight.interpretation.difficulty && (
                                  <div className="text-xs md:text-sm text-gray-700">
                                    난이도: <span className="font-semibold">{hhiAnalysisApiData.position_insight.interpretation.difficulty}</span>
                                  </div>
                                )}
                              </>
                            )}
                            {hhiAnalysisApiData.position_insight.yoy_overheat_score !== undefined && (
                              <div className="text-xs md:text-sm text-gray-700">
                                전년 대비 과열도: <span className="font-semibold">{hhiAnalysisApiData.position_insight.yoy_overheat_score.toFixed(2)}</span>
                                {hhiAnalysisApiData.position_insight.yoy_trend && (
                                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                    hhiAnalysisApiData.position_insight.yoy_trend === '과열' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {hhiAnalysisApiData.position_insight.yoy_trend}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {hhiAnalysisApiData.position_insight.insights && hhiAnalysisApiData.position_insight.insights.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs md:text-sm font-semibold text-gray-900 mb-2">주요 인사이트:</div>
                              <ul className="space-y-1.5 md:space-y-2">
                                {hhiAnalysisApiData.position_insight.insights.map((insight: string, index: number) => (
                                  <li key={index} className="text-xs md:text-sm text-gray-700 flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                            <div className="text-xs md:text-sm text-gray-500 italic">인사이트 생성 중...</div>
                          )}

                          {/* 상위 산업 정보 */}
                          {hhiAnalysisApiData.position_insight.top_industries && hhiAnalysisApiData.position_insight.top_industries.length > 0 && (
                            <div className="mt-auto pt-4 border-t border-green-200">
                              <div className="text-xs md:text-sm font-semibold text-gray-900 mb-2">상위 산업:</div>
                              <div className="grid grid-cols-1 gap-2">
                                {hhiAnalysisApiData.position_insight.top_industries.map((industry: any) => (
                                  <div key={industry.industry_id} className="bg-white rounded-lg p-2 md:p-3 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs md:text-sm font-medium text-gray-900 truncate">{industry.industry_name}</div>
                                      <div className="text-xs text-gray-600 ml-2">{industry.share_percentage.toFixed(1)}%</div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{industry.count}개 공고</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                    )}

                      {/* 산업별 인사이트 */}
                      {hhiAnalysisApiData.industry_insight && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 md:p-6 min-w-0 flex flex-col h-full overflow-hidden">
                          <div className="mb-3">
                            <div className="text-base md:text-lg font-bold text-gray-900">
                              {hhiAnalysisApiData.industry_insight.industry_name} 산업 분석
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 md:gap-4 mb-4">
                            {hhiAnalysisApiData.industry_insight.posts_count !== undefined && (
                              <div className="text-xs md:text-sm text-gray-700">
                                공고 수: <span className="font-semibold">{hhiAnalysisApiData.industry_insight.posts_count.toLocaleString()}개</span>
                              </div>
                            )}
                            {hhiAnalysisApiData.industry_insight.rank !== undefined && (
                              <div className="text-xs md:text-sm text-gray-700">
                                순위: <span className="font-semibold">{hhiAnalysisApiData.industry_insight.rank}위</span>
                              </div>
                            )}
                            {hhiAnalysisApiData.industry_insight.share_percentage !== undefined && (
                              <div className="text-xs md:text-sm text-gray-700">
                                점유율: <span className="font-semibold">{hhiAnalysisApiData.industry_insight.share_percentage.toFixed(1)}%</span>
                              </div>
                            )}
                            {hhiAnalysisApiData.industry_insight.yoy_overheat_score !== undefined && (
                              <div className="text-xs md:text-sm text-gray-700">
                                전년 대비 과열도: <span className="font-semibold">{hhiAnalysisApiData.industry_insight.yoy_overheat_score.toFixed(2)}</span>
                                {hhiAnalysisApiData.industry_insight.yoy_trend && (
                                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                    hhiAnalysisApiData.industry_insight.yoy_trend === '과열' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {hhiAnalysisApiData.industry_insight.yoy_trend}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {hhiAnalysisApiData.industry_insight.insights && hhiAnalysisApiData.industry_insight.insights.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs md:text-sm font-semibold text-gray-900 mb-2">주요 인사이트:</div>
                              <ul className="space-y-1.5 md:space-y-2">
                                {hhiAnalysisApiData.industry_insight.insights.map((insight: string, index: number) => (
                                  <li key={index} className="text-xs md:text-sm text-gray-700 flex items-start">
                                    <span className="text-purple-600 mr-2">•</span>
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="text-xs md:text-sm text-gray-500 italic">인사이트 생성 중...</div>
                          )}

                          {/* 대안 산업 정보 */}
                          {hhiAnalysisApiData.industry_insight.alternative_industries && hhiAnalysisApiData.industry_insight.alternative_industries.length > 0 && (
                            <div className="mt-auto pt-4 border-t border-purple-200">
                              <div className="text-xs md:text-sm font-semibold text-gray-900 mb-2">대안 산업:</div>
                              <div className="grid grid-cols-1 gap-2">
                                {hhiAnalysisApiData.industry_insight.alternative_industries.map((alt: any) => (
                                  <div key={alt.industry_id} className="bg-white rounded-lg p-2 md:p-3 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs md:text-sm font-medium text-gray-900 truncate">{alt.industry_name}</div>
                                      <div className="text-xs text-gray-600 ml-2">{alt.share_percentage.toFixed(1)}%</div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      유사도: {(alt.skill_similarity * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </DarkDashboardCard>
        </div>


        {/* API 연동 차트 섹션 */}
        <div className="space-y-6">
          {/* 상위 스킬 연도별 트렌드 및 스킬 클라우드 */}
          <DarkDashboardCard title={
            <div className="flex items-center justify-between w-full">
              <span>상위 스킬 연도별 트렌드 및 스킬 클라우드 (최근 5년)</span>
              {(isLoadingSkillTrend || isLoadingSkills) && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>로딩중</span>
                </div>
              )}
            </div>
          }>
            <div className="mb-4 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">스킬 트렌드 회사:</span>
                <select
                  value={selectedSkillCompany}
                  onChange={(e) => {
                    setSelectedSkillCompany(e.target.value)
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">전체</option>
                  {recruitmentCompanies.length === 0 ? (
                    <option value="">회사 로딩 중...</option>
                  ) : (
                    recruitmentCompanies.map((company: { key: string; name: string }) => (
                      <option key={company.key} value={company.name}>{company.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="text-gray-500">로딩 중...</div></div>}>
              <SkillTrendAndCloud
                skillTrendData={skillTrendData}
                skillCloudData={skillCloudData}
                selectedCompany={selectedSkillCompany}
                selectedCloudCompany={selectedSkillCloudCompany}
                selectedYear="2021-2025"
                selectedCloudYear={selectedSkillCloudYear}
                onYearSelect={(year: string) => setSelectedSkillCloudYear(year)}
                isLoadingTrend={isLoadingSkillTrend}
                isLoadingCloud={isLoadingSkills}
                trendError={skillTrendError}
                cloudError={skillsError}
              />
            </Suspense>
          </DarkDashboardCard>

        </div>

        {/* 우리 회사 직무 기술서 보기 - 제일 아래 */}
        <div className="mt-8 mb-6">
          <DarkDashboardCard title="우리 회사 직무 기술서 보기" className="flex flex-col min-h-[450px]">
            <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="text-gray-500">로딩 중...</div></div>}>
              <JobRoleSkillSetGuide />
            </Suspense>
          </DarkDashboardCard>
        </div>
      </div>
    </div>
  )
}

