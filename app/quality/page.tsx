'use client'

import { useState, useMemo, useEffect } from 'react'
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
 * AI 추천 공고 API 응답 구조 (ImprovedPostingApiResponse)
 * GET /api/v1/evaluation/reports/{post_id} 응답 형식
 */
interface ImprovedPostingApiResponse {
  status: string           // "success" 또는 에러 상태
  improved_posting: string // AI가 개선한 공고 텍스트
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
  const [experienceFilter, setExperienceFilter] = useState<string[]>([])
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string[]>([])
  const [jobRoleInput, setJobRoleInput] = useState('')

  // 경쟁사 공고 필터
  const [selectedCompany, setSelectedCompany] = useState('전체')
  const [selectedJobRole, setSelectedJobRole] = useState('전체')
  const [searchResults, setSearchResults] = useState<JobPosting[]>([])

  // 페이지네이션 상태
  const [ourJobPage, setOurJobPage] = useState(1)
  const [competitorJobPage, setCompetitorJobPage] = useState(1)
  const itemsPerPage = 5

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
  const [improvedPosting, setImprovedPosting] = useState<string | null>(null)
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

  // 우리 회사 공고 필터링
  const filteredOurJobs = useMemo(() => {
    // 필터가 하나도 선택되지 않았으면 빈 배열 반환
    if (experienceFilter.length === 0 && employmentTypeFilter.length === 0 && jobRoleInput === '') {
      return []
    }

    return skaxJobPostingsData.filter((job) => {
      const experienceMatch =
        experienceFilter.length === 0 ||
        experienceFilter.some((filter) => {
          if (filter === '신입') return job.experience.includes('신입')
          if (filter === '경력') return job.experience.includes('경력')
          if (filter === '인턴') return job.experience.includes('인턴')
          if (filter === '무관') return job.experience.includes('무관')
          return false
        })

      const employmentTypeMatch =
        employmentTypeFilter.length === 0 ||
        employmentTypeFilter.some((filter) => {
          if (filter === '정규') return job.employment_type.includes('정규')
          if (filter === '계약') return job.employment_type.includes('계약')
          if (filter === '아르바이트') return job.employment_type.includes('아르바이트')
          if (filter === '기타') return true
          return false
        })

      const jobRoleMatch =
        jobRoleInput === '' ||
        job.title.toLowerCase().includes(jobRoleInput.toLowerCase()) ||
        job.meta_data?.job_category?.toLowerCase().includes(jobRoleInput.toLowerCase())

      return experienceMatch && employmentTypeMatch && jobRoleMatch
    })
  }, [experienceFilter, employmentTypeFilter, jobRoleInput])

  // 우리 회사 공고 페이지네이션
  const ourJobTotalPages = Math.ceil(filteredOurJobs.length / itemsPerPage)
  const ourJobPaginatedData = filteredOurJobs.slice(
    (ourJobPage - 1) * itemsPerPage,
    ourJobPage * itemsPerPage
  )

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    setOurJobPage(1)
  }, [experienceFilter, employmentTypeFilter, jobRoleInput])

  // 경쟁사 공고 검색
  const handleCompetitorSearch = () => {
    const filtered = jobPostingsData.filter((job) => {
      const normalizedJobCompany = job.company.replace('(주)', '').trim().toLowerCase()
      const normalizedSelectedCompany = selectedCompany.toLowerCase()
      const companyMatch =
        selectedCompany === '전체' ||
        normalizedJobCompany.includes(normalizedSelectedCompany) ||
        normalizedSelectedCompany.includes(normalizedJobCompany)

      const normalizedJobTitle = job.title.toLowerCase()
      const normalizedSelectedRole = selectedJobRole.toLowerCase()
      const roleMatch =
        selectedJobRole === '전체' ||
        normalizedJobTitle.includes(normalizedSelectedRole) ||
        job.meta_data?.job_category?.toLowerCase().includes(normalizedSelectedRole)

      return companyMatch && roleMatch
    })
    setSearchResults(filtered)
    setCompetitorJobPage(1) // 검색 시 페이지 초기화
  }

  // 경쟁사 공고 페이지네이션
  const competitorJobTotalPages = Math.ceil(searchResults.length / itemsPerPage)
  const competitorJobPaginatedData = searchResults.slice(
    (competitorJobPage - 1) * itemsPerPage,
    competitorJobPage * itemsPerPage
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
  const fetchEvaluationData = async () => {
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
    } catch (error) {
      console.error('평가 데이터 가져오기 실패:', error)
      setEvaluationError(error instanceof Error ? error.message : '평가 데이터를 가져오는데 실패했습니다.')
      setEvaluationCompleted(false) // 평가 실패 표시
    } finally {
      setIsLoadingEvaluation(false)
    }
  }

  /**
   * AI 추천 공고 API 호출 함수
   * GET /api/v1/evaluation/reports/{post_id} 엔드포인트를 호출하여
   * 선택된 공고의 AI 개선 버전을 가져옵니다.
   * 
   * 응답 형식: {
   *   "status": "success",
   *   "improved_posting": "..."
   * }
   */
  const fetchImprovedPosting = async (postId: number) => {
    try {
      setIsLoadingImprovedPosting(true)
      setImprovedPostingError(null)

      // API 엔드포인트
      // POST /api/v1/evaluation/reports/{post_id}
      // body는 빈 문자열로 전송
      const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/evaluation/reports/${postId}`

      // POST 메서드로 요청 (body는 빈 문자열)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: '',
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        // 404 에러인 경우 평가 데이터가 없는 것으로 판단
        if (response.status === 404) {
          const errorText = await response.text().catch(() => '')
          let errorMessage = '평가 데이터를 찾을 수 없습니다.'
          try {
            const errorJson = JSON.parse(errorText)
            if (errorJson.detail) {
              errorMessage = errorJson.detail
            }
          } catch {
            if (errorText) {
              errorMessage = errorText
            }
          }
          // 더 명확한 에러 메시지
          throw new Error(`${errorMessage}\n\n해결 방법:\n1. Step 2로 돌아가서 평가를 완료해주세요.\n2. 평가가 완료되면 Step 3에서 AI 추천 공고를 확인할 수 있습니다.`)
        }
        // 405 에러인 경우 더 자세한 정보 제공
        if (response.status === 405) {
          const errorText = await response.text()
          console.error('405 Method Not Allowed:', {
            url: apiUrl,
            method: 'POST',
            status: response.status,
            statusText: response.statusText,
            response: errorText,
          })
          throw new Error(`HTTP 405: 서버가 POST 메서드를 허용하지 않습니다. API 엔드포인트를 확인해주세요. (URL: ${apiUrl})`)
        }
        const errorText = await response.text().catch(() => '')
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText || response.statusText}`)
      }

      // 응답 데이터 파싱 및 타입 검증
      const data: ImprovedPostingApiResponse = await response.json()
      
      // 데이터 구조 검증
      if (data.status !== 'success' || !data.improved_posting) {
        throw new Error('응답 데이터 구조가 올바르지 않습니다.')
      }
      
      setImprovedPosting(data.improved_posting)
    } catch (error) {
      console.error('AI 추천 공고 가져오기 실패:', error)
      setImprovedPostingError(error instanceof Error ? error.message : 'AI 추천 공고를 가져오는데 실패했습니다.')
    } finally {
      setIsLoadingImprovedPosting(false)
    }
  }

  const handleNextStep = async () => {
    if (canProceedToNextStep() && currentStep < 3) {
      // Step 2로 이동할 때 평가 데이터 가져오기
      if (currentStep === 1) {
        await fetchEvaluationData()
        // 평가 완료 후 Step 2로 이동 (에러가 있어도 Step 2에서 표시)
        setCurrentStep(currentStep + 1)
      }
      // Step 3로 이동할 때 AI 추천 공고 가져오기
      else if (currentStep === 2) {
        // 평가가 완료되었는지 확인
        if (!evaluationCompleted || !evaluationData || evaluationError) {
          alert('먼저 Step 2에서 평가를 완료해주세요.\n\n평가가 완료되지 않으면 AI 추천 공고를 생성할 수 없습니다.\n평가 결과가 표시되는지 확인해주세요.')
          return
        }
        // Step 3로 이동하고, Step 3에서 AI 추천 공고 로드
        setCurrentStep(currentStep + 1)
        // Step 3로 이동한 후 AI 추천 공고 가져오기
        if (selectedOurJob) {
          await fetchImprovedPosting(selectedOurJob.id)
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
      { pattern: /^🚀.*합류하실.*팀.*소개/, key: '🚀 합류하실 팀을 소개해요' },
      { pattern: /^💻.*합류하시면.*함께.*할.*업무/, key: '💻 합류하시면 함께 할 업무예요' },
      { pattern: /^🔍.*이런.*분과.*함께.*하고.*싶어요/, key: '🔍 이런 분과 함께 하고 싶어요' },
      { pattern: /^🔍.*이런.*분이라면.*더욱.*좋아요/, key: '🔍 이런 분이라면 더욱 좋아요' },
      { pattern: /^⏳.*이렇게.*합류해요/, key: '⏳ 이렇게 합류해요' },
      { pattern: /^📍.*만나게.*될.*근무지/, key: '📍 만나게 될 근무지는 여기예요' },
      { pattern: /^📣.*동료.*한.*마디/, key: '📣 동료의 한 마디' },
      { pattern: /^📌.*참고해.*주세요/, key: '📌 참고해 주세요' },
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 빈 줄은 건너뛰기
      if (!line) continue
      
      // 제목 추출 - [M&C], [Tech] 등으로 시작하는 줄
      if (line.match(/^\[(M&C|Tech|채용 공고)\]/)) {
        title = line.replace(/^\[(M&C|Tech|채용 공고)\]\s*/, '').trim()
        continue
      }
      
      // 제목이 없고 이모지로 시작하지 않는 첫 번째 줄을 제목으로
      if (!title && !line.match(/^[📃⚡✅🚀💻🔍⏳📍📣📌]/)) {
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
        continue
      }
      
      // 현재 섹션에 내용 추가
      if (currentSection) {
        sections[currentSection].push(line)
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
      console.error('PDF 생성 중 오류:', error)
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
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              currentStep === 2
                ? 'bg-gray-100 text-gray-900 border-b-2 border-gray-900'
                : !canProceedToNextStep() || currentStep < 2
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 cursor-pointer'
            }`}
          >
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
                    {/* 구분 필터 */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">구분</label>
                          <button
                            onClick={() => setExperienceFilter([])}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            초기화
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['신입', '경력', '인턴', '무관'].map((option) => (
                            <button
                              key={option}
                              onClick={() => toggleFilter(experienceFilter, setExperienceFilter, option)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                experienceFilter.includes(option)
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 유형 필터 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">유형</label>
                        <button
                          onClick={() => setEmploymentTypeFilter([])}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          초기화
                        </button>
                      </div>
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

                      {/* 직무 선택 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">직무 선택</label>
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
                      // 필터가 이미 적용되어 있으므로 단순히 포커스를 공고 목록으로 이동
                      document.getElementById('our-job-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    공고 검색
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
                    onClick={handleCompetitorSearch}
                    className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    공고 검색
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
                    {filteredOurJobs.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        {experienceFilter.length === 0 && employmentTypeFilter.length === 0 && jobRoleInput === ''
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
                        }}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedOurJob?.id === job.id
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                        }`}
                      >
                        <h4 className="font-bold text-gray-900 mb-1">{job.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {job.experience}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {job.employment_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(job.posted_date)} ~ {job.expired_date ? formatDate(job.expired_date) : '상시채용'}
                        </p>
                      </div>
                        ))}
                        {/* 페이지네이션 */}
                        {ourJobTotalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setOurJobPage(prev => Math.max(1, prev - 1))}
                              disabled={ourJobPage === 1}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                ourJobPage === 1
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
                              disabled={ourJobPage === ourJobTotalPages}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                ourJobPage === ourJobTotalPages
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
                    <div className="space-y-3 flex-1 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">회사와 직무를 선택한 후 검색 버튼을 클릭하세요.</p>
                    ) : (
                      <>
                        {competitorJobPaginatedData.map((job) => (
                        <div
                          key={job.id}
                          onClick={() => {
                            setSelectedCompetitorJob(job)
                            setCompetitorJobImage(null)
                          }}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
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
                          <p className="text-xs text-gray-500">
                            {formatDate(job.posted_date)}
                          </p>
                        </div>
                        ))}
                        {/* 페이지네이션 */}
                        {competitorJobTotalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setCompetitorJobPage(prev => Math.max(1, prev - 1))}
                              disabled={competitorJobPage === 1}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                competitorJobPage === 1
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
                              disabled={competitorJobPage === competitorJobTotalPages}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                competitorJobPage === competitorJobTotalPages
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
                disabled={!canProceedToNextStep()}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  canProceedToNextStep()
                    ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                다음 단계 →
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
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                <p className="text-blue-700">평가 데이터를 불러오는 중...</p>
              </div>
            )}

            {evaluationError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <p className="text-red-700">에러: {evaluationError}</p>
              </div>
            )}

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

                {/* 로딩 및 에러 상태 */}
                {isLoadingImprovedPosting && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                    <p className="text-blue-700">AI 추천 공고를 생성하는 중...</p>
                  </div>
                )}

                {improvedPostingError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900 mb-2">AI 추천 공고를 불러올 수 없습니다</h3>
                        <p className="text-red-700 whitespace-pre-line mb-4">{improvedPostingError}</p>
                        {improvedPostingError.includes('평가 데이터를 찾을 수 없습니다') && (
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Step 2로 돌아가서 평가 완료하기
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI 개선된 공고 내용 */}
                {improvedPosting && (() => {
                  const parsed = parseImprovedPosting(improvedPosting)
                  return (
                    <div className="bg-white border-2 border-green-500 rounded-xl p-8 space-y-8">
                      <div className="mb-6 pb-4 border-b-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold">
                            AI 개선 버전
                          </span>
                          <span className="text-sm text-gray-600">
                            평가 결과를 바탕으로 개선된 공고입니다
                          </span>
                        </div>
                      </div>
                      
                      {/* 공고 제목 */}
                      <div className="border-b-2 border-gray-200 pb-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {parsed.title || selectedOurJob?.title || '공고 제목'}
                        </h2>
                        <p className="text-lg text-gray-600">
                          {parsed.company || selectedOurJob?.company || '회사명'}
                        </p>
                      </div>

                      {/* 합류하실 팀을 소개해요 */}
                      {parsed.sections['🚀 합류하실 팀을 소개해요'] && (
                        <section className="space-y-6">
                          <h3 className="text-2xl font-bold text-gray-900">합류하실 팀을 소개해요</h3>
                          <div className="pl-4 border-l-4 border-gray-900">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {parsed.sections['🚀 합류하실 팀을 소개해요'].join('\n')}
                            </p>
                          </div>
                        </section>
                      )}

                      {/* 합류하시면 함께 할 업무예요 */}
                      {(parsed.sections['💻 합류하시면 함께 할 업무예요'] || parsed.sections['💻 합류하시면 함께 할 업무에요']) && (
                        <section className="space-y-6 pt-6 border-t-2 border-gray-200">
                          <h3 className="text-2xl font-bold text-gray-900">합류하시면 함께 할 업무예요</h3>
                          <div className="pl-4 border-l-4 border-gray-300">
                            <ul className="space-y-2 text-gray-700">
                              {(parsed.sections['💻 합류하시면 함께 할 업무예요'] || parsed.sections['💻 합류하시면 함께 할 업무에요'] || []).map((item, idx) => {
                                // 항목이 ':' 또는 '-'로 시작하는 경우 처리
                                const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                if (!cleanItem) return null
                                // 괄호로 묶인 설명이 있으면 별도로 표시
                                const hasParenthesis = cleanItem.includes('(') && cleanItem.includes(')')
                                if (hasParenthesis) {
                                  const parts = cleanItem.split(/(\([^)]+\))/)
                                  return (
                                    <li key={idx} className="flex flex-col items-start gap-1">
                                      <div className="flex items-start gap-2">
                                        <span className="text-gray-900 mt-1">•</span>
                                        <span>{parts[0].trim()}</span>
                                      </div>
                                      {parts[1] && (
                                        <div className="ml-6 text-sm text-gray-600 italic">
                                          {parts[1]}
                                        </div>
                                      )}
                                    </li>
                                  )
                                }
                                return (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-gray-900 mt-1">•</span>
                                    <span>{cleanItem}</span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        </section>
                      )}

                      {/* 이런 분과 함께 하고 싶어요 */}
                      {(parsed.sections['🔍 이런 분과 함께 하고 싶어요'] || parsed.sections['🔍 이런 분과 함께하고 싶어요']) && (
                        <section className="space-y-6 pt-6 border-t-2 border-gray-200">
                          <h3 className="text-2xl font-bold text-gray-900">이런 분과 함께 하고 싶어요</h3>
                          <div className="pl-4 border-l-4 border-gray-300">
                            <ul className="space-y-2 text-gray-700">
                              {(parsed.sections['🔍 이런 분과 함께 하고 싶어요'] || parsed.sections['🔍 이런 분과 함께하고 싶어요'] || []).map((item, idx) => {
                                const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                if (!cleanItem) return null
                                return (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-gray-900 mt-1">•</span>
                                    <span>{cleanItem}</span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        </section>
                      )}

                      {/* 이런 분이라면 더욱 좋아요 */}
                      {parsed.sections['🔍 이런 분이라면 더욱 좋아요'] && (
                        <section className="space-y-6 pt-6 border-t-2 border-gray-200">
                          <h3 className="text-2xl font-bold text-gray-900">이런 분이라면 더욱 좋아요</h3>
                          <div className="pl-4 border-l-4 border-gray-300">
                            <ul className="space-y-2 text-gray-700">
                              {parsed.sections['🔍 이런 분이라면 더욱 좋아요'].map((item, idx) => {
                                const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                if (!cleanItem) return null
                                return (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-gray-900 mt-1">•</span>
                                    <span>{cleanItem}</span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        </section>
                      )}

                      {/* 이렇게 합류해요 */}
                      {parsed.sections['⏳ 이렇게 합류해요'] && (
                        <section className="space-y-6 pt-6 border-t-2 border-gray-200">
                          <h3 className="text-2xl font-bold text-gray-900">이렇게 합류해요</h3>
                          <div className="pl-4 border-l-4 border-gray-300">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {parsed.sections['⏳ 이렇게 합류해요'].join('\n')}
                            </p>
                          </div>
                        </section>
                      )}

                      {/* 만나게 될 근무지는 여기예요 */}
                      {parsed.sections['📍 만나게 될 근무지는 여기예요'] && (
                        <section className="space-y-6 pt-6 border-t-2 border-gray-200">
                          <h3 className="text-2xl font-bold text-gray-900">만나게 될 근무지는 여기예요</h3>
                          <div className="pl-4 border-l-4 border-gray-300">
                            <p className="text-gray-700 leading-relaxed">
                              {parsed.sections['📍 만나게 될 근무지는 여기예요'].join('\n')}
                            </p>
                          </div>
                        </section>
                      )}

                      {/* 동료의 한 마디 */}
                      {parsed.sections['📣 동료의 한 마디'] && (
                        <section className="space-y-6 pt-6 border-t-2 border-gray-200">
                          <h3 className="text-2xl font-bold text-gray-900">동료의 한 마디</h3>
                          <div className="pl-4 border-l-4 border-gray-300">
                            <div className="space-y-4 text-gray-700">
                              {parsed.sections['📣 동료의 한 마디'].map((item, idx) => (
                                <p key={idx} className="leading-relaxed whitespace-pre-line">
                                  {item}
                                </p>
                              ))}
                            </div>
                          </div>
                        </section>
                      )}

                      {/* 참고해 주세요 */}
                      {parsed.sections['📌 참고해 주세요'] && (
                        <section className="space-y-6 pt-6 border-t-2 border-gray-200">
                          <h3 className="text-2xl font-bold text-gray-900">참고해 주세요</h3>
                          <div className="pl-4 border-l-4 border-gray-300">
                            <ul className="space-y-2 text-gray-700">
                              {parsed.sections['📌 참고해 주세요'].map((item, idx) => {
                                const cleanItem = item.replace(/^[-•]\s*/, '').trim()
                                if (!cleanItem) return null
                                return (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-gray-900 mt-1">•</span>
                                    <span>{cleanItem}</span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        </section>
                      )}
                    </div>
                  )
                })()}

                {/* 원본 공고 내용 (비교용 또는 기본 표시) */}
                {(!isLoadingImprovedPosting && !improvedPostingError) && (
                  <div className={`bg-white border-2 rounded-xl p-8 space-y-8 ${improvedPosting ? 'border-gray-300' : 'border-gray-200'}`}>
                    {improvedPosting && (
                      <div className="mb-6 pb-4 border-b-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm font-semibold">
                            원본 공고
                          </span>
                          <span className="text-sm text-gray-600">
                            비교를 위한 원본 공고입니다
                          </span>
                        </div>
                      </div>
                    )}
                    {/* 공고 제목 */}
                    <div className="border-b-2 border-gray-200 pb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedOurJob.title}</h2>
                      <p className="text-lg text-gray-600">{selectedOurJob.company}</p>
                    </div>

                  {/* 섹션 1: 이런 일을 합니다 */} 
                  <section className="space-y-6">
                    <div className="flex items-start gap-3 flex-wrap">
                      <h3 className="text-2xl font-bold text-gray-900">이런 일을 합니다</h3>
                      <div className="relative flex items-start gap-2">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <div className="bg-blue-500 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
                          <p>AI 개선 제안: 문단 구성 점수가 낮습니다. 문단을 더 짧게 나누어 가독성을 개선하세요.</p>
                        </div>
                      </div>
                    </div>

                    {/* 조직 소개 */}
                    <div className="pl-4 border-l-4 border-gray-900">
                      <h4 className="font-semibold text-gray-900 mb-3">조직 소개</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-gray-900 mt-1">•</span>
                          <span>SAP ERP, S/4HANA 등 엔터프라이즈 솔루션을 활용한 비즈니스 혁신</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-900 mt-1">•</span>
                          <span>자유롭고 효율적인 업무 환경, 지속적인 학습과 성장을 추구하는 문화</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-900 mt-1">•</span>
                          <span>AI First 전략을 통한 디지털 혁신</span>
                        </li>
                      </ul>
                    </div>

                    {/* 업무 환경 및 문화 */}
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="font-semibold text-gray-900 mb-3">업무 환경 및 문화</h4>
                      <p className="text-gray-700 leading-relaxed">
                        자유롭고 효율적인 업무 환경에서 지속적인 학습과 성장을 추구합니다.
                        팀원 간의 협업과 소통을 중시하며, 새로운 기술과 방법론에 대한 실험을 장려합니다.
                      </p>
                    </div>

                    {/* 담당 업무 */}
                    <div className="pl-4 border-l-4 border-gray-300">
                      <div className="flex items-start gap-2 mb-3 flex-wrap">
                        <h4 className="font-semibold text-gray-900">담당 업무</h4>
                        <div className="relative flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          <div className="bg-blue-500 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
                            <p>AI 개선 제안: 담당 업무 구체성 점수가 낮습니다. 각 업무 항목을 더 상세하게 설명하세요.</p>
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2 text-gray-700">
                        {selectedOurJob.description.split('\n\n')[0]?.split('\n').filter(line => line.trim().startsWith('-')).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gray-900 mt-1">•</span>
                            <span>{item.replace(/^-\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                      {selectedOurJob.meta_data?.tech_stack && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedOurJob.meta_data.tech_stack.map((tech, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* 섹션 2: 이런 분과 함께 하고 싶습니다 */}
                  <section className="space-y-6 pt-6 border-t-2 border-gray-200">
                    <div className="flex items-start gap-3 flex-wrap">
                      <h3 className="text-2xl font-bold text-gray-900">이런 분과 함께 하고 싶습니다</h3>
                      <div className="relative flex items-start gap-2">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <div className="bg-blue-500 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
                          <p>AI 개선 제안: 필요 역량 구체성 점수가 낮습니다. 각 역량에 대한 상세한 설명을 추가하세요.</p>
                        </div>
                      </div>
                    </div>

                    {/* 필요 역량 및 경험 */}
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="font-semibold text-gray-900 mb-3">필요 역량 및 경험</h4>
                      <ul className="space-y-2 text-gray-700">
                        {selectedOurJob.description.split('\n\n')[1]?.split('\n').filter(line => line.trim().startsWith('-')).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gray-900 mt-1">•</span>
                            <span>{item.replace(/^-\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* 섹션 3: 이런 경험이 있다면 더 환영합니다 */}
                  <section className="space-y-6 pt-6 border-t-2 border-gray-200">
                    <div className="flex items-start gap-3 flex-wrap">
                      <h3 className="text-2xl font-bold text-gray-900">이런 경험이 있다면 더 환영합니다</h3>
                      <div className="relative flex items-start gap-2">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <div className="bg-blue-500 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
                          <p>AI 개선 제안: 매력적인 콘텐츠가 부족합니다. 현직자 인터뷰나 회사 비전을 추가하세요.</p>
                        </div>
                      </div>
                    </div>

                    {/* 우대사항 */}
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="font-semibold text-gray-900 mb-3">우대사항</h4>
                      <ul className="space-y-2 text-gray-700">
                        {selectedOurJob.description.split('\n\n')[2]?.split('\n').filter(line => line.trim().startsWith('-')).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gray-900 mt-1">•</span>
                            <span>{item.replace(/^-\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 복리후생 */}
                    {selectedOurJob.meta_data?.benefits && selectedOurJob.meta_data.benefits.length > 0 && (
                      <div className="pl-4 border-l-4 border-gray-300">
                        <h4 className="font-semibold text-gray-900 mb-3">복리후생</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedOurJob.meta_data.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-gray-700">
                              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
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
              {/* 평가 항목 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    selectedDetailItem.company === 'our' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {selectedDetailItem.company === 'our' ? '우리 회사 공고' : '경쟁사 공고'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedDetailItem.category === 'readability' && '가독성 분석'}
                    {selectedDetailItem.category === 'specificity' && '구체성 분석'}
                    {selectedDetailItem.category === 'attractiveness' && '매력도 분석'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
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
                  })()}
                </h3>
              </div>

              {/* 점수 명확한 이유 제시 */}
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

                return (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900 border-b-2 border-gray-200 pb-2">
                        평가 근거
                      </h4>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {result.reasoning}
                        </p>
                      </div>
                    </div>

                    {/* 원문 텍스트 */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900 border-b-2 border-gray-200 pb-2">
                        원문 텍스트
                      </h4>
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {result.original_text || (selectedDetailItem.company === 'our' && selectedOurJob 
                            ? selectedOurJob.description.substring(0, 500) + '...'
                            : selectedDetailItem.company === 'competitor' && selectedCompetitorJob
                            ? selectedCompetitorJob.description.substring(0, 500) + '...'
                            : '원문 텍스트가 없습니다.')}
                        </p>
                      </div>
                    </div>

                    {/* 발견된 키워드 */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900 border-b-2 border-gray-200 pb-2">
                        발견된 키워드
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords && result.keywords.length > 0 ? (
                          result.keywords.map((keyword: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">키워드가 없습니다.</span>
                        )}
                      </div>
                    </div>

                    {/* 키워드 개수 */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900 border-b-2 border-gray-200 pb-2">
                        키워드 개수
                      </h4>
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl font-bold text-blue-600">
                            {result.keyword_count}
                          </div>
                          <span className="text-lg text-gray-600">개</span>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
