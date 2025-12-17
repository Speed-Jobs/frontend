'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import CompanyLogo from '@/components/CompanyLogo'
import jobPostingsData from '@/data/jobPostings.json'
import skaxJobPostingsData from '@/data/skaxJobPostings.json'

interface JobPosting {
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

// API 응답 타입 정의
interface ApiPostContent {
  id: number
  title: string
  company: string
  employmentType: string
  crawledAt: {
    year: number
    month: number
    day: number
  }
}

interface ApiPostsResponse {
  status: number
  code: string
  message: string
  data: {
    page: number
    size: number
    totalPages: number
    content: ApiPostContent[]
  }
}

// ================================================================================
// EvaluationResponse 데이터 구조 타입 정의
// ================================================================================
// API 엔드포인트: GET /api/v1/evaluation/compare
// 응답 형식: Dict[str, EvaluationResponse]
//   - "sk_ax": SK AX 채용공고 평가 결과
//   - "competitor": 경쟁사 채용공고 평가 결과
// ================================================================================

/**
 * 공통 평가 결과 구조 (BaseEvaluationResult)
 * 모든 하위 평가 결과는 다음 4개 필드를 공통으로 포함합니다.
 */
interface BaseEvaluationResult {
  original_text: string     // 평가 대상 원문 텍스트
  keywords: string[]         // 추출된 키워드 리스트
  keyword_count: number     // 키워드 개수
  reasoning: string          // LLM의 판단 근거 및 상세 설명
}

/**
 * 가독성 평가 모듈 결과 (ReadabilityModuleResult)
 * 채용공고의 읽기 쉬움과 명확성을 평가하는 3개의 하위 평가로 구성:
 * - jargon: 사내 전문 용어 빈도수
 * - consistency: 문단 일관성
 * - grammar: 문법 정확성
 */
interface ReadabilityModuleResult {
  jargon: BaseEvaluationResult        // 사내 전문 용어 빈도수
  consistency: BaseEvaluationResult   // 문단 일관성
  grammar: BaseEvaluationResult       // 문법 정확성
}

/**
 * 구체성 평가 모듈 결과 (SpecificityModuleResult)
 * 채용공고 내용의 구체성과 명확성을 평가하는 4개의 하위 평가로 구성:
 * - responsibility: 담당 업무 구체성
 * - qualification: 자격요건 구체성
 * - keyword_relevance: 직군 키워드 적합성
 * - required_fields: 필수 항목 포함 여부
 */
interface SpecificityModuleResult {
  responsibility: BaseEvaluationResult      // 담당 업무 구체성
  qualification: BaseEvaluationResult        // 자격요건 구체성
  keyword_relevance: BaseEvaluationResult    // 직군 키워드 적합성
  required_fields: BaseEvaluationResult      // 필수 항목 포함 여부
}

/**
 * 매력도 평가 모듈 결과 (AttractivenessModuleResult)
 * 채용공고의 매력을 높이는 특별 콘텐츠를 평가하는 2개의 하위 평가로 구성:
 * - content_count: 특별 콘텐츠 포함 여부
 * - content_quality: 특별 콘텐츠 충실도
 */
interface AttractivenessModuleResult {
  content_count: BaseEvaluationResult    // 특별 콘텐츠 포함 여부
  content_quality: BaseEvaluationResult  // 특별 콘텐츠 충실도
}

/**
 * 평가 응답 구조 (EvaluationResponse)
 * 3개의 모듈 평가 결과로 구성됩니다:
 * - readability: 가독성 평가
 * - specificity: 구체성 평가
 * - attractiveness: 매력도 평가
 */
interface EvaluationResponse {
  readability: ReadabilityModuleResult      // 가독성 평가
  specificity: SpecificityModuleResult      // 구체성 평가
  attractiveness: AttractivenessModuleResult // 매력도 평가
}

/**
 * API 응답 구조 (EvaluationApiResponse)
 * GET /api/v1/evaluation/compare 응답 형식
 */
interface EvaluationApiResponse {
  sk_ax: EvaluationResponse      // SK AX 채용공고 평가 결과
  competitor: EvaluationResponse // 경쟁사 채용공고 평가 결과
}

/**
 * AI 추천 공고 데이터 구조 (ImprovedPostingData)
 * GET /api/v1/evaluation/reports/{post_id} 응답의 data 필드
 */
interface ImprovedPostingData {
  additional_info: string
  application_method: string
  benefits: string
  company_introduction: string
  company_name: string
  deadline: string
  development_culture: string
  employment_type: string
  growth_opportunities: string
  main_responsibilities: string
  position: string
  preferred_qualifications: string
  project_introduction: string
  recruitment_process: string
  required_qualifications: string
  team_introduction: string
  tech_stack: string[]
  tools: string[]
  work_conditions: string
  work_location: string
}

/**
 * AI 추천 공고 API 응답 구조 (ImprovedPostingApiResponse)
 * GET /api/v1/evaluation/reports/{post_id} 응답 형식
 */
interface ImprovedPostingApiResponse {
  status: string              // "success" 또는 에러 상태
  message: string              // 응답 메시지
  data: ImprovedPostingData    // AI가 개선한 공고 데이터
}

export default function QualityPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedOurJob, setSelectedOurJob] = useState<JobPosting | null>(null)
  const [selectedCompetitorJob, setSelectedCompetitorJob] = useState<JobPosting | null>(null)
  const [ourJobImage, setOurJobImage] = useState<File | null>(null)
  const [competitorJobImage, setCompetitorJobImage] = useState<File | null>(null)
  const [showOurJobImageUpload, setShowOurJobImageUpload] = useState(false)
  const [showCompetitorJobImageUpload, setShowCompetitorJobImageUpload] = useState(false)

  // 우리 회사 공고 필터
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string[]>([])
  const [jobRoleInput, setJobRoleInput] = useState('')

  // 우리 회사 공고 API 상태
  const [ourCompanyJobs, setOurCompanyJobs] = useState<JobPosting[]>([])
  const [isLoadingOurJobs, setIsLoadingOurJobs] = useState(false)
  const [ourJobsError, setOurJobsError] = useState<string | null>(null)

  // 경쟁사 공고 필터
  const [selectedCompany, setSelectedCompany] = useState('전체')
  const [selectedJobRole, setSelectedJobRole] = useState('전체')
  const [searchResults, setSearchResults] = useState<JobPosting[]>([])
  const [isLoadingCompetitorJobs, setIsLoadingCompetitorJobs] = useState(false)
  const [competitorJobsError, setCompetitorJobsError] = useState<string | null>(null)

  // 페이지네이션 상태
  const [ourJobPage, setOurJobPage] = useState(1) // UI는 1부터 시작
  const [competitorJobPage, setCompetitorJobPage] = useState(1)
  const displayItemsPerPage = 5 // UI에 표시할 공고 개수
  const apiPageSize = 20 // API에서 한 번에 가져올 공고 개수

  // 공고 상세 모달 상태
  const [showJobDetailModal, setShowJobDetailModal] = useState(false)
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobPosting | null>(null)
  const [selectedJobType, setSelectedJobType] = useState<'our' | 'competitor'>('our')

  // 상세 평가 결과 모달 상태
  const [selectedDetailItem, setSelectedDetailItem] = useState<{
    category: string // 'readability' | 'specificity' | 'attractiveness'
    item: string // 'jargon', 'consistency', 'grammar' 등
    company: 'our' | 'competitor'
  } | null>(null)

  // 평가 결과 상태
  const [evaluationData, setEvaluationData] = useState<EvaluationApiResponse | null>(null)
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)
  const [evaluationCompleted, setEvaluationCompleted] = useState(false) // 평가 완료 여부

  // AI 추천 공고 상태
  const [improvedPosting, setImprovedPosting] = useState<ImprovedPostingData | null>(null)
  const [isLoadingImprovedPosting, setIsLoadingImprovedPosting] = useState(false)
  const [improvedPostingError, setImprovedPostingError] = useState<string | null>(null)

  // 회사 목록 (중복 제거)
  const companies = Array.from(new Set(jobPostingsData.map((job) => job.company.replace('(주)', '').trim())))

  // 직무 목록 (13개 직무 기준)
  const jobRoles: string[] = [
    '전체',
    'Software Development',
    'Factory AX Engineering',
    'Solution Development',
    'Cloud/Infra Engineering',
    'Architect',
    'Project Management',
    'Quality Management',
    'AI',
    '정보보호',
    'Sales',
    'Domain Expert',
    'Consulting',
    'Biz. Supporting',
  ]

  // API 응답을 JobPosting 형식으로 변환
  const transformApiPostToJobPosting = (apiPost: ApiPostContent): JobPosting => {
    const crawlDate = `${apiPost.crawledAt.year}-${String(apiPost.crawledAt.month).padStart(2, '0')}-${String(apiPost.crawledAt.day).padStart(2, '0')}`
    
    return {
      id: apiPost.id,
      title: apiPost.title,
      company: apiPost.company,
      location: '',
      employment_type: apiPost.employmentType,
      experience: '', // API에서 제공하지 않음
      crawl_date: crawlDate,
      posted_date: crawlDate,
      expired_date: null,
      description: '',
      meta_data: {
        job_category: undefined,
        salary: undefined,
        benefits: undefined,
        tech_stack: undefined,
      },
    }
  }

  // 우리 회사 공고 API 호출
  const fetchOurCompanyJobs = useCallback(async (page: number = 0) => {
    try {
      setIsLoadingOurJobs(true)
      setOurJobsError(null)

      // 우리 회사 이름 목록
      const companyNames = [
        'SK(주) AX',
        'SK주식회사(AX)',
        'SK AX (Beijing)co.,Ltd'
      ]

      // 쿼리 파라미터 구성
      const params = new URLSearchParams()
      params.append('sort', 'POST_AT')
      params.append('isAscending', 'false')
      companyNames.forEach(name => {
        params.append('companyNames', name)
      })
      params.append('page', page.toString())
      params.append('size', apiPageSize.toString())

      // 직무 필터 (postTitle로 검색)
      if (jobRoleInput.trim() !== '') {
        params.append('postTitle', jobRoleInput.trim())
      }

      const apiUrl = `https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/posts?${params.toString()}`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiPostsResponse = await response.json()

      if (result.status === 200 && result.data) {
        // API 응답을 JobPosting 형식으로 변환
        const transformedJobs = result.data.content.map(transformApiPostToJobPosting)
        
        // 클라이언트 사이드 필터링 (고용형태)
        let filteredJobs = transformedJobs

        // 고용형태 필터링
        if (employmentTypeFilter.length > 0) {
          filteredJobs = filteredJobs.filter((job) => {
            return employmentTypeFilter.some((filter) => {
              if (filter === '정규') return job.employment_type.includes('정규')
              if (filter === '계약') return job.employment_type.includes('계약')
              if (filter === '아르바이트') return job.employment_type.includes('아르바이트')
              if (filter === '기타') return true
              return false
            })
          })
        }

        setOurCompanyJobs(filteredJobs)
      } else {
        throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      setOurJobsError(error.message || '우리 회사 공고를 불러오는데 실패했습니다.')
      setOurCompanyJobs([])
    } finally {
      setIsLoadingOurJobs(false)
    }
  }, [employmentTypeFilter, jobRoleInput, apiPageSize])

  // 필터 변경 시 자동 검색 제거 - "공고 검색" 버튼을 눌러야만 검색됨
  // useEffect 제거됨 - 이제 버튼 클릭 시에만 검색됩니다

  // 우리 회사 공고 페이지네이션 데이터 (클라이언트 사이드에서 5개씩 표시)
  const ourJobTotalPages = Math.ceil(ourCompanyJobs.length / displayItemsPerPage)
  const ourJobPaginatedData = ourCompanyJobs.slice(
    (ourJobPage - 1) * displayItemsPerPage,
    ourJobPage * displayItemsPerPage
  )

  // 경쟁사 공고 API 호출
  const fetchCompetitorJobs = useCallback(async (page: number = 0) => {
    try {
      setIsLoadingCompetitorJobs(true)
      setCompetitorJobsError(null)

      // 쿼리 파라미터 구성
      const params = new URLSearchParams()
      params.append('sort', 'POST_AT')
      params.append('isAscending', 'false')
      params.append('page', page.toString())
      params.append('size', apiPageSize.toString())

      // 회사명 필터 (전체가 아닌 경우)
      if (selectedCompany && selectedCompany !== '전체') {
        params.append('companyNames', selectedCompany)
      }

      // 직군 필터 (전체가 아닌 경우)
      if (selectedJobRole && selectedJobRole !== '전체') {
        params.append('positionName', selectedJobRole)
      }

      const apiUrl = `https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/posts?${params.toString()}`
      
      console.log('경쟁사 공고 API 호출:', apiUrl) // 디버깅용
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiPostsResponse = await response.json()

      if (result.status === 200 && result.data) {
        // API 응답을 JobPosting 형식으로 변환
        const transformedJobs = result.data.content.map(transformApiPostToJobPosting)
        setSearchResults(transformedJobs)
      } else {
        throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      setCompetitorJobsError(error.message || '경쟁사 공고를 불러오는데 실패했습니다.')
      setSearchResults([])
    } finally {
      setIsLoadingCompetitorJobs(false)
    }
  }, [selectedCompany, selectedJobRole, apiPageSize])

  // 경쟁사 공고 검색 (버튼 클릭 시 호출)
  const handleCompetitorSearch = () => {
    setCompetitorJobPage(1) // 검색 시 첫 페이지로
    fetchCompetitorJobs(0)
  }

  // Step 3로 이동했을 때 평가 상태 확인 및 AI 추천 공고 가져오기
  useEffect(() => {
    if (currentStep === 3 && selectedOurJob && (selectedCompetitorJob || competitorJobImage)) {
      // 평가가 완료되지 않았다면 평가 API 호출 (자동으로 AI 추천 공고도 가져오기)
      if (!evaluationCompleted || !evaluationData || evaluationError) {
        fetchEvaluationData(true) // autoFetchImprovedPosting = true
      } else {
        // 평가가 완료되어 있고, AI 추천 공고가 없거나 에러가 있으면 다시 가져오기
        if (!isLoadingImprovedPosting && (!improvedPosting || improvedPostingError)) {
          // 이전 에러 초기화
          if (improvedPostingError) {
            setImprovedPostingError(null)
          }
          fetchImprovedPosting(selectedOurJob.id)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, selectedOurJob, selectedCompetitorJob, competitorJobImage, evaluationCompleted, evaluationData, evaluationError])

  // 평가 완료 후 AI 추천 공고 자동 가져오기 (평가가 새로 완료되었을 때)
  useEffect(() => {
    if (currentStep === 3 && evaluationCompleted && evaluationData && !evaluationError && selectedOurJob && !isLoadingImprovedPosting && !improvedPosting && !improvedPostingError) {
      fetchImprovedPosting(selectedOurJob.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationCompleted, evaluationData, evaluationError])

  // Step 3에서 평가 완료 후 AI 추천 공고 재시도
  const handleRetryImprovedPosting = async () => {
    if (selectedOurJob) {
      // 먼저 평가가 완료되었는지 확인
      if (!evaluationCompleted || !evaluationData || evaluationError) {
        // 평가가 완료되지 않았다면 평가를 먼저 실행 (자동으로 AI 추천 공고도 가져오기)
        await fetchEvaluationData(true)
      } else {
        // 평가가 완료되었다면 바로 AI 추천 공고 가져오기
        await fetchImprovedPosting(selectedOurJob.id)
      }
    }
  }

  // 경쟁사 공고 페이지네이션
  const competitorJobTotalPages = Math.ceil(searchResults.length / displayItemsPerPage)
  const competitorJobPaginatedData = searchResults.slice(
    (competitorJobPage - 1) * displayItemsPerPage,
    competitorJobPage * displayItemsPerPage
  )

  // 필터 토글 함수
  const toggleFilter = (filterArray: string[], setFilterArray: (filters: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilterArray(filterArray.filter((f) => f !== value))
    } else {
      setFilterArray([...filterArray, value])
    }
  }

  // 이미지 업로드 핸들러
  const handleOurJobImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOurJobImage(e.target.files[0])
      setSelectedOurJob(null) // 이미지 업로드 시 선택된 공고 해제
    }
  }

  const handleCompetitorJobImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCompetitorJobImage(e.target.files[0])
      setSelectedCompetitorJob(null) // 이미지 업로드 시 선택된 공고 해제
    }
  }

  // 다음 단계로 이동 가능한지 확인
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return (selectedOurJob !== null || ourJobImage !== null) && (selectedCompetitorJob !== null || competitorJobImage !== null)
    }
    return true
  }

  /**
   * 평가 API 호출 함수
   * GET /api/v1/evaluation/compare 엔드포인트를 호출하여
   * SK AX 공고와 경쟁사 공고의 평가 결과를 가져옵니다.
   * 
   * 응답 형식: {
   *   "sk_ax": EvaluationResponse,
   *   "competitor": EvaluationResponse
   * }
   */
  const fetchEvaluationData = async (autoFetchImprovedPosting = false) => {
    if (!selectedOurJob && !ourJobImage) return
    if (!selectedCompetitorJob && !competitorJobImage) return

    try {
      setIsLoadingEvaluation(true)
      setEvaluationError(null)

      // API 엔드포인트
      // GET /api/v1/evaluation/compare?sk_ax_post={id}&competitor_post={id}
      const apiUrl = 'https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/evaluation/compare'
      
      // 쿼리 파라미터 구성
      const params = new URLSearchParams()
      if (selectedOurJob) {
        params.append('sk_ax_post', selectedOurJob.id.toString())
      }
      if (selectedCompetitorJob) {
        params.append('competitor_post', selectedCompetitorJob.id.toString())
      }

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 응답 데이터 파싱 및 타입 검증
      const data: EvaluationApiResponse = await response.json()
      
      // 데이터 구조 검증
      if (!data.sk_ax || !data.competitor) {
        throw new Error('응답 데이터 구조가 올바르지 않습니다.')
      }
      
      setEvaluationData(data)
      setEvaluationCompleted(true) // 평가 완료 표시
      setEvaluationError(null) // 성공 시 에러 초기화

      // 평가 완료 후 자동으로 AI 추천 공고 가져오기
      if (autoFetchImprovedPosting && selectedOurJob && !improvedPosting && !improvedPostingError) {
        await fetchImprovedPosting(selectedOurJob.id)
      }
    } catch (error) {
      setEvaluationError(error instanceof Error ? error.message : '평가 데이터를 가져오는데 실패했습니다.')
      setEvaluationCompleted(false) // 평가 실패 표시
    } finally {
      setIsLoadingEvaluation(false)
    }
  }

  /**
   * AI 추천 공고 API 호출 함수
   * POST /api/v1/evaluation/reports/{post_id} 엔드포인트를 호출하여
   * 선택된 공고의 AI 개선 버전을 가져옵니다.
   * 
   * 응답 형식: {
   *   "status": "success",
   *   "message": "...",
   *   "data": {
   *     "position": "...",
   *     "company_name": "...",
   *     ...
   *   }
   * }
   */
  const fetchImprovedPosting = async (postId: number) => {
    try {
      setIsLoadingImprovedPosting(true)
      setImprovedPostingError(null)

      // API 엔드포인트
      // POST /api/v1/evaluation/reports/{post_id}
      const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/evaluation/reports/${postId}`

      // POST 메서드로 요청 (body는 빈 객체 또는 빈 문자열)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({}), // 빈 객체를 JSON으로 전송
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        // 404 에러인 경우 평가 데이터가 없는 것으로 판단
        if (response.status === 404) {
          // 사용자 친화적인 메시지로 통일
          throw new Error('EVALUATION_NOT_FOUND')
        }
        // 500 에러인 경우 서버 오류
        if (response.status === 500) {
          throw new Error('SERVER_ERROR')
        }
        // 기타 에러
        const errorText = await response.text().catch(() => '')
        let errorMessage = 'UNKNOWN_ERROR'
        try {
          const errorJson = JSON.parse(errorText)
          // 기술적인 에러 메시지가 포함되어 있는지 확인
          if (errorJson.detail && (errorJson.detail.includes('디렉토리') || errorJson.detail.includes('data/report'))) {
            errorMessage = 'EVALUATION_NOT_FOUND'
          } else if (errorJson.message && (errorJson.message.includes('디렉토리') || errorJson.message.includes('data/report'))) {
            errorMessage = 'EVALUATION_NOT_FOUND'
          } else if (errorJson.detail) {
            // 기술적인 메시지가 아닌 경우에만 사용
            errorMessage = errorJson.detail
          } else if (errorJson.message) {
            errorMessage = errorJson.message
          }
        } catch {
          // 텍스트에 기술적인 내용이 포함되어 있으면 평가 데이터 없음으로 처리
          if (errorText && (errorText.includes('디렉토리') || errorText.includes('data/report'))) {
            errorMessage = 'EVALUATION_NOT_FOUND'
          }
        }
        throw new Error(errorMessage)
      }

      // 응답 데이터 파싱 및 타입 검증
      const result: ImprovedPostingApiResponse = await response.json()
      
      // 데이터 구조 검증
      if (result.status !== 'success' || !result.data) {
        throw new Error(result.message || '응답 데이터 구조가 올바르지 않습니다.')
      }
      
      // improved_posting 데이터 저장
      setImprovedPosting(result.data)
    } catch (error) {
      // 사용자 친화적인 에러 메시지로 변환
      let userFriendlyMessage = 'AI 추천 공고를 가져오는데 실패했습니다.'
      if (error instanceof Error) {
        if (error.message === 'EVALUATION_NOT_FOUND') {
          userFriendlyMessage = '평가가 완료되지 않았습니다. 먼저 평가를 완료해주세요.'
        } else if (error.message === 'SERVER_ERROR') {
          userFriendlyMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else if (error.message.includes('디렉토리') || error.message.includes('data/report')) {
          userFriendlyMessage = '평가가 완료되지 않았습니다. 먼저 평가를 완료해주세요.'
        } else if (error.message !== 'UNKNOWN_ERROR') {
          // 기술적인 메시지가 아닌 경우에만 사용
          userFriendlyMessage = error.message
        }
      }
      setImprovedPostingError(userFriendlyMessage)
    } finally {
      setIsLoadingImprovedPosting(false)
    }
  }

  const handleNextStep = async () => {
    if (canProceedToNextStep() && currentStep < 3) {
      // Step 2로 이동할 때 평가 데이터 가져오기
      if (currentStep === 1) {
        // 먼저 Step 2로 이동하여 로딩 UI 표시
        setCurrentStep(currentStep + 1)
        // 그 다음 평가 데이터 가져오기
        await fetchEvaluationData()
      }
      // Step 3로 이동할 때 AI 추천 공고 가져오기
      else if (currentStep === 2) {
        // Step 3로 이동
        setCurrentStep(currentStep + 1)
        // 이전 에러 초기화
        if (improvedPostingError) {
          setImprovedPostingError(null)
        }
        // 평가가 완료되지 않았다면 먼저 평가 API 호출 (자동으로 AI 추천 공고도 가져오기)
        if (!evaluationCompleted || !evaluationData || evaluationError) {
          await fetchEvaluationData(true) // autoFetchImprovedPosting = true
        } else {
          // 평가가 이미 완료되었다면 바로 AI 추천 공고 가져오기
          if (selectedOurJob) {
            await fetchImprovedPosting(selectedOurJob.id)
          }
        }
      }
      // Step 3 이상으로는 바로 이동
      else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // AI 개선 공고 텍스트 파싱 함수
  const parseImprovedPosting = (text: string) => {
    const lines = text.split('\n')
    
    // 제목 추출 (첫 번째 줄 또는 [채용 공고] 다음 줄)
    let title = ''
    let company = ''
    let currentSection = ''
    const sections: Record<string, string[]> = {}
    
    // 섹션 키워드 매핑 (유연한 매칭을 위해 패턴 사용)
    const sectionPatterns = [
      { pattern: /^📃|^⚡|^✅/, key: 'intro' }, // 소개 섹션 (📃, ⚡, ✅)
      { pattern: /^🚀.*합류하실.*팀.*소개/, key: '🚀 합류하실 팀을 소개해요' },
      { pattern: /^💻.*합류하시면.*함께.*할.*업무/, key: '💻 합류하시면 함께 할 업무예요' },
      { pattern: /^🔍.*이런.*분과.*함께.*하고.*싶어요/, key: '🔍 이런 분과 함께 하고 싶어요' },
      { pattern: /^🔍.*이런.*분이라면.*더욱.*좋아요/, key: '🔍 이런 분이라면 더욱 좋아요' },
      { pattern: /^⌛.*이렇게.*합류해요|^⏳.*이렇게.*합류해요/, key: '⏳ 이렇게 합류해요' },
      { pattern: /^📍.*만나게.*될.*근무지/, key: '📍 만나게 될 근무지는 여기예요' },
      { pattern: /^📣.*동료.*한.*마디/, key: '📣 동료의 한 마디' },
      { pattern: /^📌.*참고해.*주세요/, key: '📌 참고해 주세요' },
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 빈 줄은 건너뛰기
      if (!line) {
        // 빈 줄이지만 현재 섹션이 있으면 빈 줄 추가 (형식 유지)
        if (currentSection && currentSection !== 'intro') {
          sections[currentSection].push('')
        }
        continue
      }
      
      // 제목 추출 - [M&C], [Tech] 등으로 시작하는 줄
      if (line.match(/^\[(M&C|Tech|채용 공고)\]/)) {
        title = line.replace(/^\[(M&C|Tech|채용 공고)\]\s*/, '').trim()
        continue
      }
      
      // 제목이 없고 이모지로 시작하지 않는 첫 번째 줄을 제목으로
      if (!title && !line.match(/^[📃⚡✅🚀💻🔍⏳⌛📍📣📌]/)) {
        title = line
        continue
      }
      
      // 섹션 시작 감지 (패턴 매칭)
      const matchedPattern = sectionPatterns.find(({ pattern }) => pattern.test(line))
      if (matchedPattern) {
        currentSection = matchedPattern.key
        if (!sections[currentSection]) {
          sections[currentSection] = []
        }
        // 섹션 헤더는 제외하고 내용만 저장
        continue
      }
      
      // 현재 섹션에 내용 추가
      if (currentSection) {
        sections[currentSection].push(line)
      } else {
        // 섹션이 지정되지 않은 경우 intro 섹션에 추가
        if (!sections['intro']) {
          sections['intro'] = []
        }
        sections['intro'].push(line)
      }
    }
    
    // 회사명은 제목에서 추출하거나 기본값 사용
    if (!company && selectedOurJob) {
      company = selectedOurJob.company
    }
    
    return { title, company, sections }
  }

  // PDF 다운로드 함수
  const handleDownloadPDF = async () => {
    try {
      // 동적 import로 html2canvas와 jspdf 사용
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      const element = document.getElementById('job-posting-content')
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = selectedOurJob
        ? `${selectedOurJob.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_개선안.pdf`
        : '공고_개선안.pdf'
      pdf.save(fileName)
    } catch (error) {
      alert('PDF 다운로드 중 오류가 발생했습니다. html2canvas와 jspdf 패키지가 설치되어 있는지 확인해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-8">공고 품질 평가</h1> */}

        {/* Step 탭 */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setCurrentStep(1)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            공고 선택하기
          </button>
          <button
            onClick={() => {
              if (!canProceedToNextStep()) {
                alert('먼저 공고를 선택해주세요!')
                return
              }
              if (currentStep < 2) {
                return
              }
              setCurrentStep(2)
            }}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
              currentStep === 2
                ? 'bg-gray-100 text-gray-900 border-b-2 border-gray-900'
                : !canProceedToNextStep() || currentStep < 2
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 cursor-pointer'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            공고 품질 및 평가 결과
          </button>
          <button
            onClick={() => {
              if (!canProceedToNextStep()) {
                alert('먼저 공고를 선택해주세요!')
                return
              }
              if (currentStep < 3) {
                return
              }
              setCurrentStep(3)
            }}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              currentStep === 3
                ? 'bg-gray-100 text-gray-900 border-b-2 border-gray-900'
                : !canProceedToNextStep() || currentStep < 3
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 cursor-pointer'
            }`}
          >
            AI 추천 수정사항
          </button>
        </div>

        {/* Step 1: 공고 선택하기 */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* 우리 회사 공고와 경쟁사 공고를 좌우로 배치 */}
            <div className="grid grid-cols-2 gap-8 items-stretch">
              {/* 왼쪽: 우리 회사 공고 섹션 */}
              <section className="flex flex-col h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">우리 회사 공고</h2>
                <div className="flex flex-col flex-1">
                  {/* 필터 영역 */}
                  <div className="space-y-4 flex-shrink-0 flex flex-col">
                    {/* 필터 초기화 버튼 */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setEmploymentTypeFilter([])
                          setJobRoleInput('')
                          setOurCompanyJobs([])
                          setOurJobPage(1)
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        필터 초기화
                      </button>
                    </div>
                    {/* 유형 필터 */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3">유형</label>
                      <div className="flex flex-wrap gap-2">
                        {['정규', '계약', '아르바이트', '기타'].map((option) => (
                          <button
                            key={option}
                            onClick={() => toggleFilter(employmentTypeFilter, setEmploymentTypeFilter, option)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              employmentTypeFilter.includes(option)
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 직무 입력 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">직무</label>
                      <input
                        type="text"
                        value={jobRoleInput}
                        onChange={(e) => setJobRoleInput(e.target.value)}
                        placeholder="기획, 개발, 마케팅"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* 오른쪽: 경쟁사 공고 섹션 */}
              <section className="flex flex-col h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">경쟁사 공고</h2>
                <div className="flex flex-col flex-1">
                  {/* 필터 영역 */}
                  <div className="space-y-4 flex-shrink-0 flex flex-col">
                    {/* 필터 초기화 버튼 */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedCompany('전체')
                          setSelectedJobRole('전체')
                          setSearchResults([])
                          setCompetitorJobPage(1)
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        필터 초기화
                      </button>
                    </div>
                    {/* 선택 필터 영역 */}
                    <div className="space-y-4">
                      {/* 회사 선택 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">회사 선택</label>
                        <select
                          value={selectedCompany}
                          onChange={(e) => setSelectedCompany(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
                        >
                          <option value="전체">전체</option>
                          {companies.map((company) => (
                            <option key={company} value={company}>
                              {company}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 직군 선택 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">직군 선택</label>
                        <select
                          value={selectedJobRole}
                          onChange={(e) => setSelectedJobRole(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
                        >
                          {jobRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* 공고 검색 버튼 영역 - 같은 행에 배치 */}
            <div className="grid grid-cols-2 gap-8">
              {/* 우리 회사 공고 검색 버튼 */}
              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => {
                      // 필터가 하나라도 선택되었거나 직무 입력이 있으면 API 호출
                      if (employmentTypeFilter.length > 0 || jobRoleInput.trim() !== '') {
                        setOurJobPage(1) // 검색 시 첫 페이지로
                        fetchOurCompanyJobs(0)
                      } else {
                        alert('필터를 선택하거나 직무를 입력해주세요.')
                      }
                      // 공고 목록으로 스크롤 이동
                      document.getElementById('our-job-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    disabled={isLoadingOurJobs}
                    className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingOurJobs ? '검색 중...' : '공고 검색'}
                  </button>
                </div>

                {/* 직접 업로드하기 버튼 (이미지 업로드가 표시되지 않을 때만) */}
                {!showOurJobImageUpload && (
                  <div>
                    <button
                      onClick={() => setShowOurJobImageUpload(true)}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      직접 업로드하기
                    </button>
                  </div>
                )}

                {/* 이미지 업로드 (조건부 표시) */}
                {showOurJobImageUpload && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      우리 회사 공고 이미지 업로드
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        id="our-job-image"
                        accept="image/*"
                        onChange={handleOurJobImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="our-job-image" className="cursor-pointer">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm text-gray-600 mb-2">
                          공고 이미지를 업로드하거나 공고를 선택하세요
                        </p>
                        <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                          파일 선택
                        </button>
                        {ourJobImage && (
                          <p className="mt-2 text-xs text-gray-500">{ourJobImage.name}</p>
                        )}
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 경쟁사 공고 검색 버튼 */}
              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => {
                      handleCompetitorSearch()
                      // 공고 목록으로 스크롤 이동
                      document.getElementById('competitor-job-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    disabled={isLoadingCompetitorJobs}
                    className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingCompetitorJobs ? '검색 중...' : '공고 검색'}
                  </button>
                </div>

                {/* 직접 업로드하기 버튼 (이미지 업로드가 표시되지 않을 때만) */}
                {!showCompetitorJobImageUpload && (
                  <div>
                    <button
                      onClick={() => setShowCompetitorJobImageUpload(true)}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      직접 업로드하기
                    </button>
                  </div>
                )}

                {/* 이미지 업로드 (조건부 표시) */}
                {showCompetitorJobImageUpload && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      경쟁사 공고 이미지 업로드
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        id="competitor-job-image"
                        accept="image/*"
                        onChange={handleCompetitorJobImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="competitor-job-image" className="cursor-pointer">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm text-gray-600 mb-2">
                          공고 이미지를 업로드하거나 공고를 선택하세요
                        </p>
                        <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                          파일 선택
                        </button>
                        {competitorJobImage && (
                          <p className="mt-2 text-xs text-gray-500">{competitorJobImage.name}</p>
                        )}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 공고 목록 영역 */}
            <div className="grid grid-cols-2 gap-8">
              {/* 우리 회사 공고 목록 */}
              <div id="our-job-list" className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">공고 목록</h3>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                    {isLoadingOurJobs ? (
                      <div className="text-center text-gray-500 py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mx-auto mb-2"></div>
                        <p>공고를 불러오는 중...</p>
                      </div>
                    ) : ourJobsError ? (
                      <p className="text-center text-red-500 py-8">{ourJobsError}</p>
                    ) : ourCompanyJobs.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        {employmentTypeFilter.length === 0 && jobRoleInput === ''
                          ? '필터를 선택하거나 직무를 입력한 후 공고 검색 버튼을 클릭하세요.'
                          : '공고가 없습니다.'}
                      </p>
                    ) : (
                      <>
                        {ourJobPaginatedData.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => {
                          setSelectedOurJob(job)
                          setOurJobImage(null)
                          setSelectedJobForDetail(job)
                          setSelectedJobType('our')
                          setShowJobDetailModal(true)
                        }}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all min-h-[120px] flex flex-col ${
                          selectedOurJob?.id === job.id
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 flex-1">{job.title}</h4>
                          <div className="flex flex-wrap gap-1 justify-end flex-shrink-0">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs whitespace-nowrap">
                              {job.experience || '경력 무관'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs whitespace-nowrap">
                              {job.employment_type}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                        <p className="text-xs text-gray-500 mt-auto">
                          {formatDate(job.posted_date)} ~ {job.expired_date ? formatDate(job.expired_date) : '상시채용'}
                        </p>
                      </div>
                        ))}
                        {/* 페이지네이션 */}
                        {ourJobTotalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setOurJobPage(prev => Math.max(1, prev - 1))}
                              disabled={ourJobPage === 1 || isLoadingOurJobs}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                ourJobPage === 1 || isLoadingOurJobs
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              이전
                            </button>
                            <span className="px-4 py-1.5 text-sm text-gray-700">
                              {ourJobPage} / {ourJobTotalPages}
                            </span>
                            <button
                              onClick={() => setOurJobPage(prev => Math.min(ourJobTotalPages, prev + 1))}
                              disabled={ourJobPage >= ourJobTotalPages || isLoadingOurJobs}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                ourJobPage >= ourJobTotalPages || isLoadingOurJobs
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              다음
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    </div>
                  </div>

              {/* 경쟁사 공고 목록 */}
              <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">공고 목록</h3>
                    <div className="space-y-3 flex-1 overflow-y-auto" id="competitor-job-list">
                    {isLoadingCompetitorJobs ? (
                      <div className="flex items-center justify-center py-8">
                        <p>공고를 불러오는 중...</p>
                      </div>
                    ) : competitorJobsError ? (
                      <p className="text-center text-red-500 py-8">{competitorJobsError}</p>
                    ) : searchResults.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        {selectedCompany === '전체' && selectedJobRole === '전체'
                          ? '회사와 직군을 선택한 후 검색 버튼을 클릭하세요.'
                          : '공고가 없습니다.'}
                      </p>
                    ) : (
                      <>
                        {competitorJobPaginatedData.map((job) => (
                        <div
                          key={job.id}
                          onClick={() => {
                            setSelectedCompetitorJob(job)
                            setCompetitorJobImage(null)
                            setSelectedJobForDetail(job)
                            setSelectedJobType('competitor')
                            setShowJobDetailModal(true)
                          }}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all min-h-[120px] flex flex-col ${
                            selectedCompetitorJob?.id === job.id
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                          }`}
                        >
                          <h4 className="font-bold text-gray-900 mb-1">{job.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {job.meta_data?.tech_stack?.map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-auto">
                            {formatDate(job.posted_date)}
                          </p>
                        </div>
                        ))}
                        {/* 페이지네이션 */}
                        {competitorJobTotalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setCompetitorJobPage(prev => Math.max(1, prev - 1))}
                              disabled={competitorJobPage === 1 || isLoadingCompetitorJobs}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                competitorJobPage === 1 || isLoadingCompetitorJobs
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              이전
                            </button>
                            <span className="px-4 py-1.5 text-sm text-gray-700">
                              {competitorJobPage} / {competitorJobTotalPages}
                            </span>
                            <button
                              onClick={() => setCompetitorJobPage(prev => Math.min(competitorJobTotalPages, prev + 1))}
                              disabled={competitorJobPage === competitorJobTotalPages || isLoadingCompetitorJobs}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                competitorJobPage === competitorJobTotalPages || isLoadingCompetitorJobs
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              다음
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    </div>
                  </div>
            </div>

            {/* 다음 단계 버튼 */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleNextStep}
                disabled={!canProceedToNextStep() || isLoadingEvaluation}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  canProceedToNextStep() && !isLoadingEvaluation
                    ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoadingEvaluation ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>평가 중...</span>
                  </>
                ) : (
                  <>
                    다음 단계 →
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 공고 품질 및 평가 결과 */}
        {currentStep === 2 && (
          <div className="space-y-8">
            {/* 선택된 공고 정보 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 우리 회사 공고 */}
              <div className="bg-white border-2 border-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                    <CompanyLogo name="SK AX" className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">우리 회사 공고</h3>
                </div>
                {selectedOurJob ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedOurJob.title}</h4>
                    <p className="text-sm text-gray-600">{selectedOurJob.company}</p>
                  </div>
                ) : ourJobImage ? (
                  <div>
                    <p className="text-sm text-gray-600">이미지 업로드: {ourJobImage.name}</p>
                  </div>
                ) : null}
              </div>

              {/* 경쟁사 공고 */}
              <div className="bg-white border-2 border-blue-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                    {selectedCompetitorJob ? (
                      <CompanyLogo name={selectedCompetitorJob.company.replace('(주)', '').trim()} className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">경쟁</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">경쟁사 공고</h3>
                </div>
                {selectedCompetitorJob ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedCompetitorJob.title}</h4>
                    <p className="text-sm text-gray-600">{selectedCompetitorJob.company}</p>
                  </div>
                ) : competitorJobImage ? (
                  <div>
                    <p className="text-sm text-gray-600">이미지 업로드: {competitorJobImage.name}</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* 로딩 및 에러 상태 */}
            {isLoadingEvaluation && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <svg className="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div>
                    <p className="text-blue-700 font-semibold text-xl mb-2">공고 품질을 평가중입니다</p>
                    <p className="text-blue-600 text-sm">AI가 두 공고를 분석하고 있습니다. 잠시만 기다려주세요.</p>
                  </div>
                </div>
              </div>
            )}

            {evaluationError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <p className="text-red-700">에러: {evaluationError}</p>
              </div>
            )}

            {/* 로딩 중이 아닐 때만 평가 결과 표시 */}
            {!isLoadingEvaluation && (
              <>
                {/* 상단 설명 텍스트 */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">
                    AI가 두 공고를 가독성, 구체성, 매력도 기준으로 분석하여 비교했습니다.
                    문장 구조, 전문 용어, 맥락, 핵심 키워드를 종합적으로 고려하여 각 항목별 상세 평가 결과를 제공합니다.
                  </p>
                </div>

                {/* 가독성 분석 */}
                {evaluationData && (
              <section className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">가독성 분석</h3>
                  </div>
                </div>

                {/* 비교 그리드 */}
                <div className="grid grid-cols-2 gap-6">
                  {/* 우리 회사 공고 평가 */}
                  <div className="border-2 border-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                        <CompanyLogo name="SK AX" className="w-full h-full" />
                      </div>
                      <span className="font-semibold text-gray-900">우리 회사 공고</span>
                    </div>

                    <div className="space-y-4">
                      {/* 1. 사내 전문 용어 빈도수 (jargon) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'readability', item: 'jargon', company: 'our' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">1. 사내 전문 용어 빈도수</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.sk_ax.readability.jargon.keyword_count}개 발견
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.sk_ax.readability.jargon.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 2. 문단 일관성 (consistency) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'readability', item: 'consistency', company: 'our' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">2. 문단 일관성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.sk_ax.readability.consistency.keyword_count}개 발견
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.sk_ax.readability.consistency.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 3. 문법 정확성 (grammar) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'readability', item: 'grammar', company: 'our' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">3. 문법 정확성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.sk_ax.readability.grammar.keyword_count}개 발견
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.sk_ax.readability.grammar.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 경쟁사 공고 평가 */}
                  <div className="border-2 border-blue-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                        {selectedCompetitorJob ? (
                          <CompanyLogo name={selectedCompetitorJob.company.replace('(주)', '').trim()} className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">경쟁</span>
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">경쟁사 공고</span>
                    </div>
                    <div className="space-y-4">
                      {/* 1. 사내 전문 용어 빈도수 (jargon) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'readability', item: 'jargon', company: 'competitor' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">1. 사내 전문 용어 빈도수</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.competitor.readability.jargon.keyword_count}개 발견
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.competitor.readability.jargon.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 2. 문단 일관성 (consistency) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'readability', item: 'consistency', company: 'competitor' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">2. 문단 일관성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.competitor.readability.consistency.keyword_count}개 발견
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.competitor.readability.consistency.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 3. 문법 정확성 (grammar) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'readability', item: 'grammar', company: 'competitor' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">3. 문법 정확성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.competitor.readability.grammar.keyword_count}개 발견
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.competitor.readability.grammar.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 구체성 분석 */}
            {evaluationData && (
              <section className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">구체성 분석</h3>
                  </div>
                </div>

                {/* 비교 그리드 */}
                <div className="grid grid-cols-2 gap-6">
                  {/* 우리 회사 공고 평가 */}
                  <div className="border-2 border-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                        <CompanyLogo name="SK AX" className="w-full h-full" />
                      </div>
                      <span className="font-semibold text-gray-900">우리 회사 공고</span>
                    </div>
                    <div className="space-y-4">
                      {/* 1. 담당 업무 구체성 (responsibility) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'specificity', item: 'responsibility', company: 'our' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">1. 담당 업무 구체성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.sk_ax.specificity.responsibility.keyword_count}개 키워드
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.sk_ax.specificity.responsibility.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 2. 자격요건 구체성 (qualification) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'specificity', item: 'qualification', company: 'our' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">2. 자격요건 구체성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.sk_ax.specificity.qualification.keyword_count}개 키워드
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.sk_ax.specificity.qualification.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 3. 직군 키워드 적합성 (keyword_relevance) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'specificity', item: 'keyword_relevance', company: 'our' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">3. 직군 키워드 적합성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.sk_ax.specificity.keyword_relevance.keyword_count}개 키워드
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.sk_ax.specificity.keyword_relevance.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 4. 필수 항목 포함 여부 (required_fields) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'specificity', item: 'required_fields', company: 'our' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">4. 필수 항목 포함 여부</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.sk_ax.specificity.required_fields.keyword_count}개 항목
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.sk_ax.specificity.required_fields.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 경쟁사 공고 평가 */}
                  <div className="border-2 border-blue-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                        {selectedCompetitorJob ? (
                          <CompanyLogo name={selectedCompetitorJob.company.replace('(주)', '').trim()} className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">경쟁</span>
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">경쟁사 공고</span>
                    </div>
                    <div className="space-y-4">
                      {/* 1. 담당 업무 구체성 (responsibility) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'specificity', item: 'responsibility', company: 'competitor' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">1. 담당 업무 구체성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.competitor.specificity.responsibility.keyword_count}개 키워드
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.competitor.specificity.responsibility.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 2. 자격요건 구체성 (qualification) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'specificity', item: 'qualification', company: 'competitor' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">2. 자격요건 구체성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.competitor.specificity.qualification.keyword_count}개 키워드
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.competitor.specificity.qualification.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 3. 직군 키워드 적합성 (keyword_relevance) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'specificity', item: 'keyword_relevance', company: 'competitor' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">3. 직군 키워드 적합성</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.competitor.specificity.keyword_relevance.keyword_count}개 키워드
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.competitor.specificity.keyword_relevance.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 4. 필수 항목 포함 여부 (required_fields) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'specificity', item: 'required_fields', company: 'competitor' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">4. 필수 항목 포함 여부</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.competitor.specificity.required_fields.keyword_count}개 항목
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.competitor.specificity.required_fields.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 매력도 분석 */}
            {evaluationData && (
              <section className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">매력도 분석</h3>
                  </div>
                </div>

                {/* 비교 그리드 */}
                <div className="grid grid-cols-2 gap-6">
                  {/* 우리 회사 공고 평가 */}
                  <div className="border-2 border-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                        <CompanyLogo name="SK AX" className="w-full h-full" />
                      </div>
                      <span className="font-semibold text-gray-900">우리 회사 공고</span>
                    </div>
                    <div className="space-y-4">
                      {/* 1. 특별 콘텐츠 포함 여부 (content_count) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'attractiveness', item: 'content_count', company: 'our' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">1. 특별 콘텐츠 포함 여부</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.sk_ax.attractiveness.content_count.keyword_count}개 유형
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.sk_ax.attractiveness.content_count.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 2. 특별 콘텐츠 충실도 (content_quality) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'attractiveness', item: 'content_quality', company: 'our' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">2. 특별 콘텐츠 충실도</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.sk_ax.attractiveness.content_quality.keyword_count}개 키워드
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.sk_ax.attractiveness.content_quality.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 경쟁사 공고 평가 */}
                  <div className="border-2 border-blue-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                        {selectedCompetitorJob ? (
                          <CompanyLogo name={selectedCompetitorJob.company.replace('(주)', '').trim()} className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">경쟁</span>
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">경쟁사 공고</span>
                    </div>
                    <div className="space-y-4">
                      {/* 1. 특별 콘텐츠 포함 여부 (content_count) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'attractiveness', item: 'content_count', company: 'competitor' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">1. 특별 콘텐츠 포함 여부</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.competitor.attractiveness.content_count.keyword_count}개 유형
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.competitor.attractiveness.content_count.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>

                      {/* 2. 특별 콘텐츠 충실도 (content_quality) */}
                      <div 
                        onClick={() => setSelectedDetailItem({ category: 'attractiveness', item: 'content_quality', company: 'competitor' })}
                        className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">2. 특별 콘텐츠 충실도</h4>
                            <span className="text-xs font-medium text-gray-600">
                              {evaluationData.competitor.attractiveness.content_quality.keyword_count}개 키워드
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">상세 보기 →</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {evaluationData.competitor.attractiveness.content_quality.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
                )}

                {/* 하단 설명 텍스트 */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">
                    AI 분석이 완료되었습니다. 가독성, 구체성, 매력도 기준으로 평가되었으며,
                    각 항목별 상세 평가 결과를 확인하시고, AI 추천 공고 및 유사한 우수 공고를 참고하세요.
                    공고 품질 향상을 위한 자동화된 지원입니다.
                  </p>
                </div>
              </>
            )}

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                ← 이전 단계
              </button>
              <div className="flex gap-4">
                <button
                  className="px-6 py-3 bg-gray-200 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                  disabled
                >
                  이전 공고
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  AI 추천 수정사항 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: AI 추천 공고 */}
        {currentStep === 3 && (
          <>
            {selectedOurJob ? (
              <div className="space-y-8" id="job-posting-content">
                {/* 상단 설명 텍스트 */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">
                    분석 결과를 바탕으로 AI가 작성 스타일과 내용 구체성 측면에서 개선 가능한 예시를 제공하며,
                    유사 분야의 우수 공고를 참고하여 제안합니다. 아래 제안 사항을 참고하여 공고를 더욱 매력적으로 만들어보세요.
                  </p>
                </div>

                {/* 평가 상태 확인 - AI 추천 공고가 없을 때만 표시 */}
                {currentStep === 3 && (!evaluationCompleted || evaluationError) && !isLoadingEvaluation && !improvedPosting && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-yellow-900 mb-2">평가가 완료되지 않았습니다</h3>
                        <p className="text-yellow-800 mb-4">
                          AI 추천 공고를 보려면 먼저 평가를 완료해야 합니다.
                          {evaluationError && (
                            <span className="block mt-2 text-sm text-yellow-700">{evaluationError}</span>
                          )}
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => fetchEvaluationData(true)}
                            disabled={isLoadingEvaluation}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            {isLoadingEvaluation ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>평가 중...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>지금 평가하기</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Step 2로 돌아가기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 로딩 상태 */}
                {isLoadingImprovedPosting && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-blue-700 font-medium">AI 추천 공고를 생성하는 중...</p>
                    </div>
                  </div>
                )}

                {/* 에러 상태 - AI 추천 공고가 없을 때만 표시 */}
                {improvedPostingError && !isLoadingImprovedPosting && !improvedPosting && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900 mb-2">AI 추천 공고를 불러올 수 없습니다</h3>
                        <p className="text-red-700 mb-4">
                          {improvedPostingError.includes('평가가 완료되지 않았습니다') || improvedPostingError.includes('평가 데이터') ? (
                            <>
                              평가가 완료되지 않았습니다. 먼저 평가를 완료해주세요.
                              <br />
                              <span className="text-sm text-red-600 mt-2 block">평가가 완료되면 AI 추천 공고를 확인할 수 있습니다.</span>
                            </>
                          ) : improvedPostingError.includes('서버') ? (
                            <>
                              서버에 일시적인 문제가 발생했습니다.
                              <br />
                              <span className="text-sm text-red-600 mt-2 block">잠시 후 다시 시도해주세요.</span>
                            </>
                          ) : (
                            improvedPostingError
                          )}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {(improvedPostingError.includes('평가가 완료되지 않았습니다') || improvedPostingError.includes('평가 데이터')) && (
                            <>
                              <button
                                onClick={handleRetryImprovedPosting}
                                disabled={isLoadingEvaluation || isLoadingImprovedPosting}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                              >
                                {isLoadingEvaluation || isLoadingImprovedPosting ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>처리 중...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>평가 후 다시 시도</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setCurrentStep(2)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                              >
                                Step 2로 돌아가기
                              </button>
                            </>
                          )}
                          {!improvedPostingError.includes('평가가 완료되지 않았습니다') && !improvedPostingError.includes('평가 데이터') && (
                            <button
                              onClick={handleRetryImprovedPosting}
                              disabled={isLoadingImprovedPosting}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              {isLoadingImprovedPosting ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>처리 중...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  <span>다시 시도</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI 개선된 공고 내용 */}
                {improvedPosting && (
                  <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 border-2 border-green-400 rounded-2xl shadow-xl overflow-hidden">
                    {/* 헤더 섹션 */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold mb-1">
                            {improvedPosting.position || selectedOurJob?.title || '공고 제목'}
                          </h2>
                          <p className="text-green-100 text-lg">
                            {improvedPosting.company_name || selectedOurJob?.company || '회사명'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>AI가 평가 결과를 바탕으로 개선한 공고입니다</span>
                      </div>
                    </div>

                    {/* 주요 정보 요약 카드 */}
                    <div className="px-8 py-6 bg-white border-b border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {improvedPosting.employment_type && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">고용 형태</div>
                              <div className="text-sm font-semibold text-gray-900">{improvedPosting.employment_type}</div>
                            </div>
                          </div>
                        )}
                        {improvedPosting.work_location && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">근무지</div>
                              <div className="text-sm font-semibold text-gray-900">{improvedPosting.work_location}</div>
                            </div>
                          </div>
                        )}
                        {improvedPosting.deadline && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">마감일</div>
                              <div className="text-sm font-semibold text-gray-900">{improvedPosting.deadline}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 기술 스택 & 도구 - 상단 강조 */}
                    {(improvedPosting.tech_stack?.length > 0 || improvedPosting.tools?.length > 0) && (
                      <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {improvedPosting.tech_stack && improvedPosting.tech_stack.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                기술 스택
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {improvedPosting.tech_stack.map((tech, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-600 transition-colors"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {improvedPosting.tools && improvedPosting.tools.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                사용 도구
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {improvedPosting.tools.map((tool, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-purple-600 transition-colors"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 상세 내용 섹션 */}
                    <div className="px-8 py-6 space-y-6">

                      {/* 회사 소개 */}
                      {improvedPosting.company_introduction && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">회사 소개</h3>
                          </div>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {improvedPosting.company_introduction}
                          </div>
                        </div>
                      )}

                      {/* 팀 소개 */}
                      {improvedPosting.team_introduction && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">합류하실 팀을 소개해요</h3>
                          </div>
                          <div className="pl-4 border-l-4 border-green-500 text-gray-700 leading-relaxed whitespace-pre-line">
                            {improvedPosting.team_introduction}
                          </div>
                        </div>
                      )}

                      {/* 프로젝트 소개 */}
                      {improvedPosting.project_introduction && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">프로젝트 소개</h3>
                          </div>
                          <div className="pl-4 border-l-4 border-purple-500 text-gray-700 leading-relaxed whitespace-pre-line">
                            {improvedPosting.project_introduction}
                          </div>
                        </div>
                      )}

                      {/* 주요 업무 */}
                      {improvedPosting.main_responsibilities && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">합류하시면 함께 할 업무예요</h3>
                          </div>
                          <div className="pl-4 border-l-4 border-orange-500">
                            <div className="space-y-2">
                              {improvedPosting.main_responsibilities.split('\n').map((item, idx) => {
                                const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                if (!cleanItem) return null
                                return (
                                  <div key={idx} className="flex items-start gap-3">
                                    <span className="text-orange-500 mt-1 font-bold">•</span>
                                    <span className="text-gray-700 leading-relaxed">{cleanItem}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 자격요건 & 우대사항 그리드 */}
                      {(improvedPosting.required_qualifications || improvedPosting.preferred_qualifications) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 자격요건 */}
                          {improvedPosting.required_qualifications && (
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">이런 분과 함께 하고 싶어요</h3>
                              </div>
                              <div className="pl-4 border-l-4 border-blue-500">
                                <div className="space-y-2">
                                  {improvedPosting.required_qualifications.split('\n').map((item, idx) => {
                                    const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                    if (!cleanItem) return null
                                    return (
                                      <div key={idx} className="flex items-start gap-3">
                                        <span className="text-blue-500 mt-1 font-bold">•</span>
                                        <span className="text-gray-700 leading-relaxed">{cleanItem}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 우대사항 */}
                          {improvedPosting.preferred_qualifications && (
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">이런 분이라면 더욱 좋아요</h3>
                              </div>
                              <div className="pl-4 border-l-4 border-yellow-500">
                                <div className="space-y-2">
                                  {improvedPosting.preferred_qualifications.split('\n').map((item, idx) => {
                                    const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                    if (!cleanItem) return null
                                    return (
                                      <div key={idx} className="flex items-start gap-3">
                                        <span className="text-yellow-500 mt-1 font-bold">•</span>
                                        <span className="text-gray-700 leading-relaxed">{cleanItem}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}


                      {/* 개발 문화 & 성장 기회 그리드 */}
                      {(improvedPosting.development_culture || improvedPosting.growth_opportunities) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 개발 문화 */}
                          {improvedPosting.development_culture && (
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">개발 문화</h3>
                              </div>
                              <div className="pl-4 border-l-4 border-indigo-500">
                                <div className="space-y-2">
                                  {improvedPosting.development_culture.split('\n').map((item, idx) => {
                                    const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                    if (!cleanItem) return null
                                    return (
                                      <div key={idx} className="flex items-start gap-3">
                                        <span className="text-indigo-500 mt-1 font-bold">•</span>
                                        <span className="text-gray-700 leading-relaxed">{cleanItem}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 성장 기회 */}
                          {improvedPosting.growth_opportunities && (
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">성장 기회</h3>
                              </div>
                              <div className="pl-4 border-l-4 border-teal-500">
                                <div className="space-y-2">
                                  {improvedPosting.growth_opportunities.split('\n').map((item, idx) => {
                                    const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                    if (!cleanItem) return null
                                    return (
                                      <div key={idx} className="flex items-start gap-3">
                                        <span className="text-teal-500 mt-1 font-bold">•</span>
                                        <span className="text-gray-700 leading-relaxed">{cleanItem}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 근무 조건 & 복리후생 그리드 */}
                      {(improvedPosting.work_conditions || improvedPosting.benefits) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 근무 조건 */}
                          {improvedPosting.work_conditions && (
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">근무 조건</h3>
                              </div>
                              <div className="pl-4 border-l-4 border-gray-400 text-gray-700 leading-relaxed whitespace-pre-line">
                                {improvedPosting.work_conditions}
                              </div>
                            </div>
                          )}

                          {/* 복리후생 */}
                          {improvedPosting.benefits && (
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">복리후생</h3>
                              </div>
                              <div className="pl-4 border-l-4 border-pink-500">
                                <div className="space-y-2">
                                  {improvedPosting.benefits.split('\n').map((item, idx) => {
                                    const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                    if (!cleanItem) return null
                                    return (
                                      <div key={idx} className="flex items-start gap-3">
                                        <span className="text-pink-500 mt-1 font-bold">•</span>
                                        <span className="text-gray-700 leading-relaxed">{cleanItem}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 채용 절차 & 지원 방법 그리드 */}
                      {(improvedPosting.recruitment_process || improvedPosting.application_method) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 채용 절차 */}
                          {improvedPosting.recruitment_process && (
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">이렇게 합류해요</h3>
                              </div>
                              <div className="pl-4 border-l-4 border-cyan-500 text-gray-700 leading-relaxed whitespace-pre-line">
                                {improvedPosting.recruitment_process}
                              </div>
                            </div>
                          )}

                          {/* 지원 방법 */}
                          {improvedPosting.application_method && (
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">지원 방법</h3>
                              </div>
                              <div className="pl-4 border-l-4 border-emerald-500 text-gray-700 leading-relaxed">
                                {improvedPosting.application_method}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 추가 정보 */}
                      {improvedPosting.additional_info && (
                        <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">참고해 주세요</h3>
                          </div>
                          <div className="pl-4 border-l-4 border-yellow-500 text-gray-700 leading-relaxed whitespace-pre-line">
                            {improvedPosting.additional_info}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* PDF 다운로드 버튼 */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    ← 이전 단계
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF로 저장
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-6">먼저 Step 1에서 우리 회사 공고를 선택해주세요.</p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  공고 선택하러 가기
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 상세 평가 결과 모달 */}
      {selectedDetailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDetailItem(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {(() => {
                  const itemNames: Record<string, Record<string, string>> = {
                    'readability': {
                      'jargon': '사내 전문 용어 빈도수',
                      'consistency': '문단 일관성',
                      'grammar': '문법 정확성'
                    },
                    'specificity': {
                      'responsibility': '담당 업무 구체성',
                      'qualification': '자격요건 구체성',
                      'keyword_relevance': '직군 키워드 적합성',
                      'required_fields': '필수 항목 포함 여부'
                    },
                    'attractiveness': {
                      'content_count': '특별 콘텐츠 포함 여부',
                      'content_quality': '특별 콘텐츠 충실도'
                    }
                  }
                  return itemNames[selectedDetailItem.category]?.[selectedDetailItem.item] || selectedDetailItem.item
                })()} - 상세 평가 결과
              </h2>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {evaluationData && (() => {
                const getEvaluationResult = () => {
                  const data = selectedDetailItem.company === 'our' ? evaluationData.sk_ax : evaluationData.competitor
                  if (selectedDetailItem.category === 'readability') {
                    if (selectedDetailItem.item === 'jargon') return data.readability.jargon
                    if (selectedDetailItem.item === 'consistency') return data.readability.consistency
                    if (selectedDetailItem.item === 'grammar') return data.readability.grammar
                  }
                  if (selectedDetailItem.category === 'specificity') {
                    if (selectedDetailItem.item === 'responsibility') return data.specificity.responsibility
                    if (selectedDetailItem.item === 'qualification') return data.specificity.qualification
                    if (selectedDetailItem.item === 'keyword_relevance') return data.specificity.keyword_relevance
                    if (selectedDetailItem.item === 'required_fields') return data.specificity.required_fields
                  }
                  if (selectedDetailItem.category === 'attractiveness') {
                    if (selectedDetailItem.item === 'content_count') return data.attractiveness.content_count
                    if (selectedDetailItem.item === 'content_quality') return data.attractiveness.content_quality
                  }
                  return null
                }
                const result = getEvaluationResult()
                if (!result) return null

                const getItemName = () => {
                  const itemNames: Record<string, Record<string, string>> = {
                    'readability': {
                      'jargon': '사내 전문 용어 빈도수',
                      'consistency': '문단 일관성',
                      'grammar': '문법 정확성'
                    },
                    'specificity': {
                      'responsibility': '담당 업무 구체성',
                      'qualification': '자격요건 구체성',
                      'keyword_relevance': '직군 키워드 적합성',
                      'required_fields': '필수 항목 포함 여부'
                    },
                    'attractiveness': {
                      'content_count': '특별 콘텐츠 포함 여부',
                      'content_quality': '특별 콘텐츠 충실도'
                    }
                  }
                  return itemNames[selectedDetailItem.category]?.[selectedDetailItem.item] || selectedDetailItem.item
                }

                return (
                  <>
                    {/* 평가 항목 정보 */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                          selectedDetailItem.company === 'our' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          {selectedDetailItem.company === 'our' ? '우리 회사 공고' : '경쟁사 공고'}
                        </span>
                        <span className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300">
                          {selectedDetailItem.category === 'readability' && '가독성 분석'}
                          {selectedDetailItem.category === 'specificity' && '구체성 분석'}
                          {selectedDetailItem.category === 'attractiveness' && '매력도 분석'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {getItemName()}
                      </h3>
                    </div>

                    {/* 평가 근거 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        <h4 className="text-lg font-bold text-gray-900">
                          평가 근거
                        </h4>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {result.reasoning}
                        </p>
                      </div>
                    </div>

                    {/* 원문 텍스트 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                        <h4 className="text-lg font-bold text-gray-900">
                          원문 텍스트
                        </h4>
                      </div>
                      <div className="bg-gray-50 border border-gray-300 rounded-lg p-5 max-h-60 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {result.original_text || (selectedDetailItem.company === 'our' && selectedOurJob 
                            ? selectedOurJob.description.substring(0, 500) + '...'
                            : selectedDetailItem.company === 'competitor' && selectedCompetitorJob
                            ? selectedCompetitorJob.description.substring(0, 500) + '...'
                            : '원문 텍스트가 없습니다.')}
                        </p>
                      </div>
                    </div>

                    {/* 키워드 정보 */}
                    {result.keywords && result.keywords.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                            <h4 className="text-lg font-bold text-gray-900">
                              발견된 키워드
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                            <span className="text-2xl font-bold text-purple-600">{result.keyword_count || result.keywords.length}</span>
                            <span className="text-sm text-purple-700 font-medium">개</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.map((keyword: string, idx: number) => (
                            <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-lg text-sm font-medium border border-purple-200 hover:shadow-md transition-shadow">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 공고 상세 모달 */}
      {showJobDetailModal && selectedJobForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">공고 상세 정보</h2>
              <button
                onClick={() => {
                  setShowJobDetailModal(false)
                  setSelectedJobForDetail(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 제목 및 회사 */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedJobForDetail.title}</h3>
                  <p className="text-lg text-gray-600">{selectedJobForDetail.company}</p>
                </div>

                {/* 기본 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">고용형태</label>
                    <p className="text-gray-900">{selectedJobForDetail.employment_type || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">경력</label>
                    <p className="text-gray-900">{selectedJobForDetail.experience || '경력 무관'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">지역</label>
                    <p className="text-gray-900">{selectedJobForDetail.location || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">공고 등록일</label>
                    <p className="text-gray-900">{formatDate(selectedJobForDetail.posted_date)}</p>
                  </div>
                  {selectedJobForDetail.expired_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">마감일</label>
                      <p className="text-gray-900">{formatDate(selectedJobForDetail.expired_date)}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">크롤링 일자</label>
                    <p className="text-gray-900">{formatDate(selectedJobForDetail.crawl_date)}</p>
                  </div>
                </div>

                {/* 기술 스택 */}
                {selectedJobForDetail.meta_data?.tech_stack && selectedJobForDetail.meta_data.tech_stack.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">기술 스택</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedJobForDetail.meta_data.tech_stack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 급여 정보 */}
                {selectedJobForDetail.meta_data?.salary && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">급여</label>
                    <p className="text-gray-900">{selectedJobForDetail.meta_data.salary}</p>
                  </div>
                )}

                {/* 복리후생 */}
                {selectedJobForDetail.meta_data?.benefits && selectedJobForDetail.meta_data.benefits.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">복리후생</label>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedJobForDetail.meta_data.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-gray-900">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 직무 카테고리 */}
                {selectedJobForDetail.meta_data?.job_category && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">직무 카테고리</label>
                    <p className="text-gray-900">{selectedJobForDetail.meta_data.job_category}</p>
                  </div>
                )}

                {/* 공고 설명 */}
                {selectedJobForDetail.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">공고 설명</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedJobForDetail.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowJobDetailModal(false)
                  setSelectedJobForDetail(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                닫기
              </button>
              {selectedJobType === 'our' && (
                <button
                  onClick={() => {
                    setSelectedOurJob(selectedJobForDetail)
                    setShowJobDetailModal(false)
                    setSelectedJobForDetail(null)
                  }}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  이 공고 선택
                </button>
              )}
              {selectedJobType === 'competitor' && (
                <button
                  onClick={() => {
                    setSelectedCompetitorJob(selectedJobForDetail)
                    setShowJobDetailModal(false)
                    setSelectedJobForDetail(null)
                  }}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  이 공고 선택
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
