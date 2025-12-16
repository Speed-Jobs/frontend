'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import CompanyLogo from '@/components/CompanyLogo'
import { Send, X, Minimize2, Maximize2, Bot } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'

// API 응답 타입 정의
interface ApiJobPosting {
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
    content: ApiJobPosting[]
  }
}

// 공고 상세 정보 API 응답 타입
interface ApiJobDetailResponse {
  status: number
  code: string
  message: string
  data: {
    id: number
    title: string
    role: string
    experience: string
    employmentType: string
    daysLeft: number
    postedAt: {
      year: number
      month: number
      day: number
      hour: number
      minute: number
      second: number
    }
    closeAt: {
      year: number
      month: number
      day: number
      hour: number
      minute: number
      second: number
    }
    applyUrl: string
    screenShotUrl: string
    skills: string[]
    metaData: {
      '공통 요건'?: string
      '직무분야'?: string
      '우대사항'?: string[]
      '전형절차'?: string
      [key: string]: any
    }
    company: {
      id: number
      name: string
      location: string
    }
  }
}

// API 응답을 기존 형식으로 변환
function transformApiJobToLocalFormat(apiJob: ApiJobPosting, companyName?: string): any {
  const crawledDate = new Date(apiJob.crawledAt.year, apiJob.crawledAt.month - 1, apiJob.crawledAt.day)
  
  return {
    id: apiJob.id.toString(),
    title: apiJob.title,
    company: apiJob.company || companyName || '알 수 없음',
    employment_type: apiJob.employmentType,
    posted_date: crawledDate.toISOString(),
    location: '',
    experience: '',
    description: '',
    meta_data: {
      tech_stack: [],
      job_category: '',
      benefits: [],
    },
  }
}

interface CompanyStats {
  company: string
  count: number
  percentage: number
  trend: number // 전월 대비 증감률
  recentJobs: number // 최근 30일 공고 수
  oldestDate: Date
  newestDate: Date
  jobs: any[]
}

export default function CompaniesPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedJobRole, setSelectedJobRole] = useState('전체')
  
  // URL 쿼리 파라미터에서 회사명 읽기
  useEffect(() => {
    const companyParam = searchParams.get('company')
    if (companyParam) {
      setSelectedCompany(decodeURIComponent(companyParam))
    }
  }, [searchParams])
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; date: string } | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [imageGalleryPage, setImageGalleryPage] = useState(1)
  const imagesPerPage = 2 // 갤러리에서 한 페이지에 표시할 이미지 수

  // AI 챗봇 상태
  const [showChatbot, setShowChatbot] = useState(false)
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, jobs?: any[] }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatbotLoading, setIsChatbotLoading] = useState(false)
  const [chatbotPosition, setChatbotPosition] = useState<{ x: number; y: number } | null>(null)
  const [isChatbotDragging, setIsChatbotDragging] = useState(false)
  const [chatbotDragOffset, setChatbotDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const chatbotRef = useRef<HTMLDivElement>(null)

  // 공고 리스트 필터링 상태
  const [jobListFilter, setJobListFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'company-name' | 'job-name'>('date-desc')
  const [selectedJobYear, setSelectedJobYear] = useState<string>('') // 년 필터
  const [selectedJobMonth, setSelectedJobMonth] = useState<string>('') // 월 필터

  // API 관련 상태
  const [apiJobs, setApiJobs] = useState<any[]>([])
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 20

  // API 호출 함수
  const fetchJobPostings = useCallback(async () => {
    try {
      setIsLoadingApi(true)
      setApiError(null)

      const params = new URLSearchParams()
      
      // 정렬 설정
      params.append('sort', 'POST_AT')
      params.append('isAscending', sortOrder === 'date-asc' ? 'true' : 'false')
      
      // 회사명 필터
      if (selectedCompany || searchQuery.trim()) {
        const companyName = selectedCompany || searchQuery.trim()
        // 회사명을 소문자로 변환 (API는 소문자로 받는 것으로 보임)
        params.append('companyNames', companyName.toLowerCase())
      }
      
      // 연도 필터
      if (selectedJobYear) {
        params.append('year', selectedJobYear)
      }
      
      // 월 필터 (API는 1-12 형식을 받음)
      if (selectedJobMonth) {
        const monthNum = parseInt(selectedJobMonth, 10)
        if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
          params.append('month', monthNum.toString())
        }
      }
      
      // 공고 제목 검색 (부분 일치)
      if (jobListFilter.trim()) {
        params.append('postTitle', jobListFilter.trim())
      }
      
      // 포지션명 필터 (정확히 일치) - 직군 필터 사용
      if (selectedJobRole !== '전체') {
        params.append('positionName', selectedJobRole)
      }
      
      // 페이지네이션
      params.append('page', currentPage.toString())
      params.append('size', pageSize.toString())

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
        // API 응답을 기존 형식으로 변환 (API 응답의 company 필드가 우선 사용됨)
        const transformedJobs = result.data.content.map((job) => 
          transformApiJobToLocalFormat(job)
        )
        
        setApiJobs(transformedJobs)
        setTotalPages(result.data.totalPages)
        setTotalItems(result.data.content.length)
      } else {
        throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      setApiError(error.message || '공고 데이터를 불러오는데 실패했습니다.')
      setApiJobs([])
      console.error('API 호출 에러:', error)
    } finally {
      setIsLoadingApi(false)
    }
  }, [selectedCompany, searchQuery, selectedJobYear, selectedJobMonth, jobListFilter, selectedJobRole, sortOrder, currentPage])

  // API 호출 트리거 (필터 또는 페이지 변경 시)
  useEffect(() => {
    const hasFilters = selectedCompany || searchQuery.trim() || selectedJobYear || selectedJobMonth || jobListFilter.trim() || selectedJobRole !== '전체'
    
    if (hasFilters) {
      fetchJobPostings()
    } else {
      // 필터가 없으면 API 데이터 초기화
      setApiJobs([])
      setTotalPages(0)
      setTotalItems(0)
    }
  }, [selectedCompany, searchQuery, selectedJobYear, selectedJobMonth, jobListFilter, selectedJobRole, sortOrder, currentPage])

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    const hasFilters = selectedCompany || searchQuery.trim() || selectedJobYear || selectedJobMonth || jobListFilter.trim() || selectedJobRole !== '전체'
    if (hasFilters && currentPage !== 0) {
      setCurrentPage(0)
    }
  }, [selectedCompany, searchQuery, selectedJobYear, selectedJobMonth, jobListFilter, selectedJobRole, sortOrder])


  // 회사별 공고 통계 계산 (API 데이터만 사용)
  const companyStats = useMemo(() => {
    // API 데이터만 사용하므로 빈 배열 반환
    return []
  }, [])

  // 전체 공고 목록 (필터링 및 정렬 적용) - API 데이터만 사용
  const filteredJobs = useMemo(() => {
    // API 데이터만 사용 (로컬 데이터 제거)
    if (apiJobs.length > 0) {
      // API 데이터는 이미 필터링되어 있으므로 정렬만 적용
      const sorted = [...apiJobs].sort((a, b) => {
      if (sortOrder === 'job-name') {
        return a.title.localeCompare(b.title, 'ko')
      } else if (sortOrder === 'company-name') {
        const companyA = a.company.replace('(주)', '').trim()
        const companyB = b.company.replace('(주)', '').trim()
        return companyA.localeCompare(companyB, 'ko')
      } else if (sortOrder === 'date-asc') {
        const dateA = new Date(a.posted_date).getTime()
        const dateB = new Date(b.posted_date).getTime()
        return dateA - dateB
      } else { // date-desc
        const dateA = new Date(a.posted_date).getTime()
        const dateB = new Date(b.posted_date).getTime()
        return dateB - dateA
      }
    })
    return sorted
    }
    
    // API 데이터가 없으면 빈 배열 반환
    return []
  }, [apiJobs, sortOrder])

  // 선택된 회사의 공고 목록 (하위 호환성을 위해 유지)
  const selectedCompanyJobs = filteredJobs

  // 검색 핸들러 (회사명 검색 시에만 사용, 필터는 실시간 적용)
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // 검색어가 없으면 선택된 회사 해제
      setSelectedCompany(null)
      return
    }
    
    // 검색어를 회사명으로 설정 (API 호출 트리거)
    setSelectedCompany(searchQuery.trim())
  }

  // AI 챗봇 메시지 전송 핸들러
  const handleChatbotSend = async () => {
    if (!chatInput.trim() || isChatbotLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsChatbotLoading(true)

    // API 데이터에서 검색
    const searchKeywords = userMessage.toLowerCase()
    const matchedJobs: any[] = []

    // 현재 로드된 API 데이터에서 검색
    apiJobs.forEach((job) => {
      const titleMatch = job.title.toLowerCase().includes(searchKeywords)
      const companyMatch = job.company.toLowerCase().includes(searchKeywords)
      const techStackMatch = job.meta_data?.tech_stack?.some((tech: string) => 
        tech.toLowerCase().includes(searchKeywords)
      ) || false

      if (titleMatch || companyMatch || techStackMatch) {
        matchedJobs.push(job)
      }
    })

    // 최대 5개까지만 표시
    const topJobs = matchedJobs.slice(0, 5)

    // AI 응답 생성
    let assistantMessage = ''
    if (topJobs.length > 0) {
      assistantMessage = `검색 결과 ${matchedJobs.length}개의 공고를 찾았습니다. 관련 공고 ${topJobs.length}개를 추천드립니다:`
    } else {
      assistantMessage = `죄송합니다. "${userMessage}"와 관련된 공고를 찾지 못했습니다. 다른 키워드로 검색해보시겠어요?\n\n예: "React 개발자", "카카오", "백엔드", "Python" 등\n\n또는 상단 검색창에서 필터를 설정하여 공고를 검색해보세요.`
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMessage,
        jobs: topJobs.length > 0 ? topJobs : undefined
      }])
      setIsChatbotLoading(false)
    }, 500)
  }

  // 선택된 공고 상세 정보 상태
  const [selectedJobDetail, setSelectedJobDetail] = useState<any>(null)
  const [isLoadingJobDetail, setIsLoadingJobDetail] = useState(false)
  const [jobDetailError, setJobDetailError] = useState<string | null>(null)

  // 공고 상세 정보 API 호출 함수
  const fetchJobDetail = useCallback(async (jobId: string | number, fallbackJob?: any) => {
    try {
      setIsLoadingJobDetail(true)
      setJobDetailError(null)
      
      // 먼저 모달을 열어서 로딩 상태를 표시
      if (fallbackJob) {
        setSelectedJobDetail(fallbackJob)
      }

      const apiUrl = `https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/posts/${jobId}`
      
      console.log('공고 상세 정보 API 호출:', apiUrl)
      
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

      const result: ApiJobDetailResponse = await response.json()
      console.log('공고 상세 정보 API 응답:', result)

      if (result.status === 200 && result.data) {
        // API 응답을 기존 형식으로 변환
        const postedDate = result.data.postedAt ? new Date(
          result.data.postedAt.year,
          result.data.postedAt.month - 1,
          result.data.postedAt.day,
          result.data.postedAt.hour || 0,
          result.data.postedAt.minute || 0,
          result.data.postedAt.second || 0
        ) : new Date()
        
        const closeDate = result.data.closeAt ? new Date(
          result.data.closeAt.year,
          result.data.closeAt.month - 1,
          result.data.closeAt.day,
          result.data.closeAt.hour || 0,
          result.data.closeAt.minute || 0,
          result.data.closeAt.second || 0
        ) : null

        const transformedDetail = {
          id: result.data.id.toString(),
          title: result.data.title,
          company: result.data.company?.name || '알 수 없음',
          location: result.data.company?.location || '',
          employment_type: result.data.employmentType || '알 수 없음',
          experience: result.data.experience || '알 수 없음',
          role: result.data.role || '',
          posted_date: postedDate.toISOString(),
          expired_date: closeDate ? closeDate.toISOString() : undefined,
          daysLeft: result.data.daysLeft,
          applyUrl: result.data.applyUrl,
          screenShotUrl: result.data.screenShotUrl,
          description: result.data.metaData?.['공통 요건'] || result.data.metaData?.['직무분야'] || '',
          meta_data: {
            tech_stack: result.data.skills || [],
            job_category: result.data.metaData?.['직무분야'] || result.data.role || '',
            benefits: result.data.metaData?.['우대사항'] || [],
            commonRequirements: result.data.metaData?.['공통 요건'],
            process: result.data.metaData?.['전형절차'],
            ...(result.data.metaData || {}),
          },
        }

        setSelectedJobDetail(transformedDetail)
        setJobDetailError(null)
      } else {
        throw new Error(result.message || '공고 상세 정보를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('공고 상세 정보 API 호출 에러:', error)
      setJobDetailError(error.message || '공고 상세 정보를 불러오는데 실패했습니다.')
      // 에러 발생 시에도 모달은 유지 (fallbackJob이 있으면)
      if (!fallbackJob) {
        // fallbackJob이 없으면 모달 닫기
        setSelectedJobDetail(null)
      }
    } finally {
      setIsLoadingJobDetail(false)
    }
  }, [])

  // 챗봇 드래그 핸들러
  const handleChatbotMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (chatbotRef.current) {
      const rect = chatbotRef.current.getBoundingClientRect()
      setChatbotDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsChatbotDragging(true)
    }
  }

  // 챗봇 드래그 중
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isChatbotDragging && chatbotRef.current) {
        const newX = e.clientX - chatbotDragOffset.x
        const newY = e.clientY - chatbotDragOffset.y
        
        // 화면 경계 체크
        const maxX = window.innerWidth - chatbotRef.current.offsetWidth
        const maxY = window.innerHeight - chatbotRef.current.offsetHeight
        
        const boundedX = Math.max(0, Math.min(newX, maxX))
        const boundedY = Math.max(0, Math.min(newY, maxY))
        
        setChatbotPosition({ x: boundedX, y: boundedY })
      }
    }

    const handleMouseUp = () => {
      setIsChatbotDragging(false)
    }

    if (isChatbotDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isChatbotDragging, chatbotDragOffset])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">공고 이력</h1>
          <p className="text-gray-600">다양한 필터를 사용하여 과거 공고를 검색하고 확인하세요</p>
        </div>

        {/* 검색 섹션 */}
        <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm mb-8">
          <div className="space-y-6">
            {/* 첫 번째 행: 회사명, 직무, 공고 이름 검색 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 회사명 검색 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">회사명</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch()
                      }
                    }}
                    placeholder="예: 토스, 카카오, 네이버"
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-base"
                  />
                  <svg
                    className="w-6 h-6 text-gray-400 absolute left-4 top-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* 직군 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">직군</label>
                <div className="relative">
                  <select
                    value={selectedJobRole}
                    onChange={(e) => {
                      setSelectedJobRole(e.target.value)
                    }}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-base appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'left 0.75rem center',
                      paddingLeft: '2.5rem'
                    }}
                  >
                  <option value="전체">전체 직군</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Factory AX Engineering">Factory AX Engineering</option>
                  <option value="Solution Development">Solution Development</option>
                  <option value="Cloud/Infra Engineering">Cloud/Infra Engineering</option>
                  <option value="Architect">Architect</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Quality Management">Quality Management</option>
                  <option value="AI">AI</option>
                  <option value="정보보호">정보보호</option>
                  <option value="Sales">Sales</option>
                  <option value="Domain Expert">Domain Expert</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Biz. Supporting">Biz. Supporting</option>
                </select>
                </div>
              </div>

              {/* 공고 이름 검색 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">공고 이름</label>
                <div className="relative">
                  <input
                    type="text"
                    value={jobListFilter}
                    onChange={(e) => setJobListFilter(e.target.value)}
                    placeholder="공고 이름으로 검색..."
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-base"
                  />
                  <svg
                    className="w-6 h-6 text-gray-400 absolute left-4 top-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 두 번째 행: 기간 필터, 정렬 옵션, 검색 버튼 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 기간 필터 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">기간 필터</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedJobYear}
                    onChange={(e) => {
                      setSelectedJobYear(e.target.value)
                      if (!e.target.value) {
                        setSelectedJobMonth('')
                      }
                    }}
                    className="flex-1 px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-base bg-white text-gray-700 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'left 0.75rem center',
                      paddingLeft: '2.5rem'
                    }}
                  >
                    <option value="">전체 연도</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                  <select
                    value={selectedJobMonth}
                    onChange={(e) => setSelectedJobMonth(e.target.value)}
                    disabled={!selectedJobYear}
                    className="flex-1 px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-base bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'left 0.75rem center',
                      paddingLeft: '2.5rem'
                    }}
                  >
                    <option value="">전체 월</option>
                    <option value="1">1월</option>
                    <option value="2">2월</option>
                    <option value="3">3월</option>
                    <option value="4">4월</option>
                    <option value="5">5월</option>
                    <option value="6">6월</option>
                    <option value="7">7월</option>
                    <option value="8">8월</option>
                    <option value="9">9월</option>
                    <option value="10">10월</option>
                    <option value="11">11월</option>
                    <option value="12">12월</option>
                  </select>
                </div>
              </div>

              {/* 정렬 옵션 */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">정렬</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'date-desc' | 'date-asc' | 'company-name' | 'job-name')}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-base appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'left 0.75rem center',
                    paddingLeft: '2.5rem'
                  }}
                >
                  <option value="date-desc">최신순</option>
                  <option value="date-asc">오래된순</option>
                  <option value="company-name">회사 이름순</option>
                  <option value="job-name">공고이름순</option>
                </select>
              </div>

              {/* 검색 버튼 */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-base"
                >
                  공고 검색
                </button>
              </div>
            </div>
          </div>

          {/* 검색 결과 요약 */}
          {(selectedCompany || searchQuery.trim() || selectedJobRole !== '전체') && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedCompany && (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                      <CompanyLogo name={selectedCompany} className="w-full h-full" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCompany || '전체 회사'}
                      {selectedJobRole !== '전체' && (
                        <span className="text-gray-600 font-normal ml-2">· {selectedJobRole}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isLoadingApi ? '로딩 중...' : `${apiJobs.length > 0 ? totalItems : filteredJobs.length}개의 공고를 확인할 수 있습니다`}
                      {apiJobs.length > 0 && totalPages > 1 && ` (페이지 ${currentPage + 1}/${totalPages})`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCompany(null)
                    setSearchQuery('')
                    setSelectedJobRole('전체')
                    setJobListFilter('')
                    setSelectedJobYear('')
                    setSelectedJobMonth('')
                    setSortOrder('date-desc')
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 검색 안내 및 공고 목록 */}
        <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm">
          {/* 로딩 상태 */}
          {isLoadingApi && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900 mb-4"></div>
              <p className="text-gray-600">공고를 불러오는 중...</p>
            </div>
          )}

          {/* 에러 메시지 */}
          {apiError && !isLoadingApi && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">⚠️ {apiError}</p>
            </div>
          )}

          {/* 공고 목록 */}
          {!isLoadingApi && filteredJobs.length > 0 ? (
            <>
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {selectedCompany && (
                      <>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                          <CompanyLogo name={selectedCompany} className="w-full h-full" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{selectedCompany}</h2>
                          <p className="text-sm text-gray-600 mt-1">
                            총 {apiJobs.length > 0 ? `${totalItems}개 (현재 페이지: ${apiJobs.length}개)` : filteredJobs.length}개의 공고
                            {apiJobs.length > 0 && totalPages > 1 && ` · 페이지 ${currentPage + 1}/${totalPages}`}
                          </p>
                        </div>
                      </>
                    )}
                    {!selectedCompany && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">전체 공고</h2>
                        <p className="text-sm text-gray-600 mt-1">
                          총 {apiJobs.length > 0 ? `${totalItems}개 (현재 페이지: ${apiJobs.length}개)` : filteredJobs.length}개의 공고
                          {apiJobs.length > 0 && totalPages > 1 && ` · 페이지 ${currentPage + 1}/${totalPages}`}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCompany(null)
                      setSearchQuery('')
                      setSelectedJobRole('전체')
                      setSelectedJobDetail(null)
                      setJobListFilter('')
                      setSelectedJobYear('')
                      setSelectedJobMonth('')
                      setSortOrder('date-desc')
                      setCurrentPage(0)
                      setApiJobs([])
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    초기화
                  </button>
                </div>
                
              </div>
              
              {/* 파일 탐색기 스타일 리스트 */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* 헤더 */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 grid grid-cols-[40px_1fr_120px_100px_140px] gap-4 text-sm font-semibold text-gray-700">
                  <div></div>
                  <div>공고 이름</div>
                  <div>회사명</div>
                  <div className="text-center">고용 형태</div>
                  <div className="text-center">수집일</div>
                </div>
                
                {/* 리스트 아이템 */}
                <div className="divide-y divide-gray-200">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => {
                      return (
                        <div
                          key={job.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors grid grid-cols-[40px_1fr_120px_100px_140px] gap-4 items-center group"
                          onClick={() => {
                            // API에서 상세 정보 가져오기
                            if (job.id) {
                              // 숫자 ID인 경우 API 호출
                              const jobId = typeof job.id === 'string' ? parseInt(job.id, 10) : job.id
                              if (!isNaN(jobId) && jobId > 0) {
                                fetchJobDetail(jobId, job) // fallback으로 현재 job 전달
                              } else {
                                // ID가 유효하지 않으면 로컬 데이터 사용
                                setSelectedJobDetail(job)
                              }
                            } else {
                              // 로컬 데이터인 경우 기존 방식 사용
                              setSelectedJobDetail(job)
                            }
                          }}
                        >
                          {/* 파일 아이콘 */}
                          <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          
                          {/* 공고 이름 */}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </p>
                          </div>
                          
                          {/* 회사명 */}
                          <div className="min-w-0">
                            <p className="text-sm text-gray-600 truncate">
                              {job.company.replace('(주)', '').trim()}
                            </p>
                          </div>
                          
                          {/* 고용 형태 */}
                          <div className="text-sm text-gray-600 text-center">
                            {job.employment_type}
                          </div>
                          
                          {/* 수집일 (크롤링 날짜) */}
                          <div className="text-sm text-gray-600 text-center">
                            {(() => {
                              const date = new Date(job.posted_date)
                              const year = date.getFullYear()
                              const month = String(date.getMonth() + 1).padStart(2, '0')
                              const day = String(date.getDate()).padStart(2, '0')
                              return `${year}. ${month}. ${day}.`
                            })()}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      검색 결과가 없습니다.
                    </div>
                  )}
                </div>
              </div>

              {/* 페이지네이션 */}
              {apiJobs.length > 0 && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                  >
                    처음
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    이전
                  </Button>
                  
                  {/* 페이지 번호 표시 */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i
                      } else if (currentPage < 3) {
                        pageNum = i
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="min-w-[40px]"
                        >
                          {pageNum + 1}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    다음
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    마지막
                  </Button>
                </div>
              )}
            </>
          ) : !isLoadingApi ? (
            // 로딩이 완료되었고 공고가 없을 때만 표시
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">공고가 없습니다</h3>
              <p className="text-gray-600 text-sm">
                {selectedCompany ? `${selectedCompany}의 ` : ''}{selectedJobRole !== '전체' ? selectedJobRole + ' ' : ''}공고가 없습니다.
              </p>
            </div>
          ) : null}
        </div>
        
        {/* 공고 상세 정보 모달 */}
        {selectedJobDetail && (() => {
          // API에서 가져온 이미지 URL 생성
          let imagePath = ''
          const jobId = selectedJobDetail.id
          
          // API에서 가져온 공고인 경우 (ID가 숫자이고 API 응답에 screenShotUrl이 있음)
          if (jobId && !isNaN(Number(jobId)) && selectedJobDetail.screenShotUrl) {
            // 스크린샷 API 엔드포인트 사용
            imagePath = `https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/posts/${jobId}/screenshot?width=800&useWebp=false`
          } else if (jobId && !isNaN(Number(jobId))) {
            // API에서 가져온 공고지만 screenShotUrl이 없는 경우에도 API 엔드포인트 시도
            imagePath = `https://speedjobs-spring.skala25a.project.skala-ai.com/api/v1/posts/${jobId}/screenshot?width=800&useWebp=false`
          } else {
            // 기존 방식: 회사명을 파일명으로 변환하는 매핑
          const companyNameMap: Record<string, string> = {
            '토스': 'toss',
            '(주)토스': 'toss',
            '카카오': 'kakao',
            '(주)카카오': 'kakao',
            '네이버': 'naver',
            '(주)네이버': 'naver',
            'LG전자': 'lg',
            '(주)LG전자': 'lg',
            'LG': 'lg',
            'LGCNS': 'lg',
            '라인': 'line',
            '(주)라인': 'line',
            'LINE': 'line',
            '당근마켓': 'daangn',
            '(주)당근마켓': 'daangn',
            '삼성전자': 'samsung-electronics',
            '(주)삼성전자': 'samsung-electronics',
            '삼성SDS': 'samsung-sds',
            '현대자동차': 'hyundai-motor',
            '(주)현대자동차': 'hyundai-motor',
            '현대 오토에버': 'hyundai-autoever',
            '쿠팡': 'coupang',
            '배민': 'baemin',
            '한화 시스템': 'hanwha-system',
            'KT': 'kt',
            'KPMG': 'kpmg',
              'SK주식회사(AX)': 'skax',
              'SK': 'skax',
          }
          
          const normalizedCompany = selectedJobDetail.company.replace('(주)', '').trim()
          let companySlug = companyNameMap[selectedJobDetail.company] || companyNameMap[normalizedCompany]
          
          if (!companySlug) {
            companySlug = normalizedCompany
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
          }
          
          // 공고의 인덱스 찾기
          const jobIndex = filteredJobs.findIndex(job => job.id === selectedJobDetail.id)
          const imageId = jobIndex >= 0 ? jobIndex + 1 : 1
            imagePath = `/job-postings/${companySlug}/${imageId}.png`
          }
          
          return (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setSelectedJobDetail(null)
                setJobDetailError(null)
              }}
            >
              <div 
                className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">공고 상세 정보</h2>
                  <div className="flex items-center gap-2">
                    {isLoadingJobDetail && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-gray-900"></div>
                    )}
                  <button
                      onClick={() => {
                        setSelectedJobDetail(null)
                        setJobDetailError(null)
                      }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* 에러 메시지 */}
                  {jobDetailError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">⚠️ {jobDetailError}</p>
                    </div>
                  )}
                  
                  {/* 로딩 상태 */}
                  {isLoadingJobDetail && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900 mb-4"></div>
                      <p className="text-gray-600">공고 상세 정보를 불러오는 중...</p>
                    </div>
                  )}
                  
                  {!isLoadingJobDetail && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 공고 이미지 */}
                    <div className="space-y-4">
                      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 relative">
                        <img
                          src={imagePath}
                          alt={selectedJobDetail.title}
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const placeholder = target.parentElement?.querySelector('.image-placeholder')
                            if (placeholder) {
                              (placeholder as HTMLElement).style.display = 'flex'
                            }
                          }}
                        />
                        {/* 플레이스홀더 */}
                        <div className="image-placeholder hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                          <svg className="w-16 h-16 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-400">이미지 없음</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedImage({
                            src: imagePath,
                            title: selectedJobDetail.title,
                            date: selectedJobDetail.posted_date
                          })
                          setImageZoom(1)
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        이미지 확대 보기
                      </button>
                    </div>
                    
                    {/* 공고 정보 */}
                    <div className="space-y-6">
                {/* 공고 제목 및 기본 정보 */}
                <div className="border-b-2 border-gray-200 pb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{selectedJobDetail.title}</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                      <CompanyLogo name={selectedJobDetail.company} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{selectedJobDetail.company}</p>
                      <p className="text-sm text-gray-600">{selectedJobDetail.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {selectedJobDetail.employment_type}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {selectedJobDetail.experience}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      등록일: {new Date(selectedJobDetail.posted_date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {selectedJobDetail.expired_date && (
                      <span className={`px-3 py-1 rounded-lg text-sm ${
                        selectedJobDetail.daysLeft !== undefined && selectedJobDetail.daysLeft < 0
                          ? 'bg-gray-100 text-gray-500'
                          : selectedJobDetail.daysLeft !== undefined && selectedJobDetail.daysLeft <= 7
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        마감일: {new Date(selectedJobDetail.expired_date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {selectedJobDetail.daysLeft !== undefined && (
                          <span className="ml-2">
                            ({selectedJobDetail.daysLeft >= 0 ? `D-${selectedJobDetail.daysLeft}` : '마감됨'})
                          </span>
                        )}
                      </span>
                    )}
                    {selectedJobDetail.role && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                        {selectedJobDetail.role}
                      </span>
                    )}
                  </div>
                  
                  {/* 지원하기 버튼 */}
                  {selectedJobDetail.applyUrl && (
                    <div className="mt-4">
                      <a
                        href={selectedJobDetail.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        지원하기
                      </a>
                    </div>
                  )}
                </div>

                {/* 기술 스택 (Skills) */}
                {selectedJobDetail.meta_data?.tech_stack && selectedJobDetail.meta_data.tech_stack.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">기술 스택</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJobDetail.meta_data.tech_stack.map((tech: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 공통 요건 */}
                {selectedJobDetail.meta_data?.commonRequirements && (
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">공통 요건</h4>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedJobDetail.meta_data.commonRequirements}
                      </p>
                  </div>
                </div>
                )}

                {/* 직무분야 */}
                {selectedJobDetail.meta_data?.job_category && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">직무분야</h4>
                    <p className="text-gray-700">{selectedJobDetail.meta_data.job_category}</p>
                  </div>
                )}

                {/* 우대사항 */}
                {selectedJobDetail.meta_data?.benefits && selectedJobDetail.meta_data.benefits.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">우대사항</h4>
                    <ul className="space-y-2">
                      {selectedJobDetail.meta_data.benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 전형절차 */}
                {selectedJobDetail.meta_data?.process && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">전형절차</h4>
                    <div className="relative">
                      {/* 프로세스 단계 파싱 및 표시 */}
                      {(() => {
                        const processText = selectedJobDetail.meta_data.process
                        // ">" 또는 "→" 또는 ">" 기호로 단계 구분
                        const steps = processText
                          .split(/>|→|>/)
                          .map((step: string) => step.trim())
                          .filter((step: string) => step.length > 0)
                        
                        if (steps.length === 0) {
                          // 구분자가 없으면 원본 텍스트 표시
                          return (
                            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {processText}
                              </p>
                            </div>
                          )
                        }
                        
                        return (
                          <div className="space-y-3">
                            {steps.map((step: string, index: number) => (
                              <div key={index} className="flex items-center gap-3">
                                {/* 단계 번호 */}
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                                  {index + 1}
                                </div>
                                
                                {/* 단계 내용 */}
                                <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-4 py-3">
                                  <p className="text-sm font-medium text-gray-900">{step}</p>
                                </div>
                                
                                {/* 화살표 (마지막 단계 제외) */}
                                {index < steps.length - 1 && (
                                  <div className="flex-shrink-0 text-blue-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* 공고 내용 (기존 description이 있는 경우) */}
                {selectedJobDetail.description && !selectedJobDetail.meta_data?.commonRequirements && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">공고 내용</h4>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                        {selectedJobDetail.description}
                      </pre>
                    </div>
                  </div>
                )}

                      {/* 급여 정보 */}
                      {selectedJobDetail.meta_data?.salary && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">급여</h4>
                          <p className="text-gray-700">{selectedJobDetail.meta_data.salary}</p>
                        </div>
                      )}

                      {/* metaData의 나머지 필드들 동적 표시 */}
                      {selectedJobDetail.meta_data && (() => {
                        // 이미 표시된 필드들 제외 (영어 키와 한글 키 모두 포함)
                        const displayedFields = [
                          'tech_stack',
                          'commonRequirements',
                          'job_category',
                          'benefits',
                          'process',
                          'salary',
                          '공통 요건',
                          '직무분야',
                          '우대사항',
                          '전형절차'
                        ]
                        
                        // 나머지 필드들 찾기
                        const remainingFields = Object.entries(selectedJobDetail.meta_data)
                          .filter(([key, value]) => {
                            // 이미 표시된 필드 제외
                            if (displayedFields.includes(key)) return false
                            
                            // null, undefined, 빈 문자열 제외
                            if (value === null || value === undefined || value === '') return false
                            
                            // 배열인 경우: 길이가 0보다 큰 경우만 포함
                            if (Array.isArray(value)) {
                              return value.length > 0
                            }
                            
                            // 문자열인 경우: 공백 제거 후 길이가 0보다 큰 경우만 포함
                            if (typeof value === 'string') {
                              return value.trim().length > 0
                            }
                            
                            // 기타 타입도 포함
                            return true
                          })
                        
                        console.log('metaData remainingFields:', remainingFields)
                        
                        if (remainingFields.length === 0) return null
                        
                        return (
                          <>
                            {remainingFields.map(([key, value]) => {
                              // 배열인 경우
                              if (Array.isArray(value) && value.length > 0) {
                                return (
                                  <div key={key}>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">{key}</h4>
                                    <ul className="space-y-2">
                                      {value.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <span className="text-blue-500 mt-1">•</span>
                                          <span className="text-gray-700">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              }
                              
                              // 문자열인 경우
                              if (typeof value === 'string' && value.trim()) {
                                return (
                                  <div key={key}>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">{key}</h4>
                                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {value}
                                      </p>
                                    </div>
                                  </div>
                                )
                              }
                              
                              // 숫자나 기타 타입인 경우
                              return (
                                <div key={key}>
                                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{key}</h4>
                                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {String(value)}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        
        {/* 이미지 확대 모달 */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
            onClick={() => {
              setSelectedImage(null)
              setImageZoom(1)
            }}
          >
            <div 
              className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedImage.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedImage.date ? new Date(selectedImage.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* 줌 컨트롤 */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setImageZoom(prev => Math.max(0.5, prev - 0.25))
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
                      title="축소"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setImageZoom(prev => Math.min(3, prev + 0.25))
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
                      title="확대"
                    >
                      +
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setImageZoom(1)
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors ml-1"
                      title="원본 크기"
                    >
                      리셋
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImage(null)
                      setImageZoom(1)
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* 이미지 */}
              <div 
                className="relative overflow-auto bg-gray-50" 
                style={{ maxHeight: 'calc(90vh - 80px)' }}
              >
                <div className="flex items-center justify-center p-6" style={{ minHeight: '100%' }}>
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    className="object-contain"
                    crossOrigin="anonymous"
                    style={{ 
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      transform: `scale(${imageZoom})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s ease-out',
                      display: 'block'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const placeholder = target.parentElement?.parentElement?.querySelector('.image-placeholder')
                      if (placeholder) {
                        (placeholder as HTMLElement).style.display = 'flex'
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      setImageZoom(prev => prev === 1 ? 2 : 1)
                    }}
                  />
                </div>
                {/* 플레이스홀더 */}
                <div className="image-placeholder hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                  <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400 text-lg">이미지를 불러올 수 없습니다</p>
                  <p className="text-gray-300 text-sm mt-2">{selectedImage.src}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI 챗봇 버튼 */}
        {!showChatbot && (
          <button
            onClick={() => setShowChatbot(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-[9999]"
            aria-label="챗봇 열기"
          >
            <Bot className="w-6 h-6" />
          </button>
        )}

        {/* AI 챗봇 패널 */}
        {showChatbot && (() => {
          const chatbotStyle: React.CSSProperties = chatbotPosition
            ? {
                left: `${chatbotPosition.x}px`,
                top: `${chatbotPosition.y}px`,
                right: 'auto',
                bottom: 'auto',
                transition: isChatbotDragging ? 'none' : 'all 0.3s'
              }
            : {
                right: '1.5rem',
                bottom: '6rem'
              }

          return (
            <div
              ref={chatbotRef}
              className={`fixed w-96 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-[9999] ${
                isChatbotMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-3rem)]'
              } ${isChatbotDragging ? 'cursor-move' : ''}`}
              style={chatbotStyle}
            >
              {/* 챗봇 헤더 */}
              <div
                className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-move select-none"
                onMouseDown={handleChatbotMouseDown}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">공고 검색 AI Agent</h3>
                    <p className="text-xs text-gray-500">공고를 검색해드립니다</p>
                  </div>
                </div>
                <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsChatbotMinimized(!isChatbotMinimized)}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    aria-label={isChatbotMinimized ? '최대화' : '최소화'}
                  >
                    {isChatbotMinimized ? (
                      <Maximize2 className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Minimize2 className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowChatbot(false)}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    aria-label="닫기"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* 메시지 영역 */}
              {!isChatbotMinimized && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-gray-600 text-sm mb-2">안녕하세요! 공고 검색 AI Agent입니다.</p>
                        <p className="text-gray-500 text-xs">원하는 공고를 검색해보세요.</p>
                        <div className="mt-4 space-y-2">
                          <p className="text-xs text-gray-500 font-semibold">예시 질문:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button
                              onClick={() => {
                                setChatInput('React 개발자')
                                setTimeout(() => handleChatbotSend(), 100)
                              }}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                            >
                              React 개발자
                            </button>
                            <button
                              onClick={() => {
                                setChatInput('카카오')
                                setTimeout(() => handleChatbotSend(), 100)
                              }}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                            >
                              카카오
                            </button>
                            <button
                              onClick={() => {
                                setChatInput('백엔드')
                                setTimeout(() => handleChatbotSend(), 100)
                              }}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                            >
                              백엔드
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((message, idx) => (
                        <div
                          key={idx}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div
                              className={`rounded-lg p-3 ${
                                message.role === 'user'
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              {message.jobs && message.jobs.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {message.jobs.map((job, jobIdx) => (
                                    <Card
                                      key={jobIdx}
                                      className="p-3 hover:bg-gray-50 cursor-pointer transition-all border border-gray-200 hover:border-gray-300 hover:shadow-md"
                                      onClick={() => {
                                        // API에서 상세 정보 가져오기
                                        if (job.id) {
                                          // 숫자 ID인 경우 API 호출
                                          const jobId = typeof job.id === 'string' ? parseInt(job.id, 10) : job.id
                                          if (!isNaN(jobId) && jobId > 0) {
                                            fetchJobDetail(jobId, job) // fallback으로 현재 job 전달
                                          } else {
                                            // ID가 유효하지 않으면 로컬 데이터 사용
                                            setSelectedJobDetail(job)
                                          }
                                        } else {
                                          // 로컬 데이터인 경우 기존 방식 사용
                                          setSelectedJobDetail(job)
                                        }
                                      }}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                            {job.title}
                                          </h4>
                                          <p className="text-xs text-gray-600 mb-2">{job.company}</p>
                                          {job.meta_data?.tech_stack && job.meta_data.tech_stack.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {job.meta_data.tech_stack.slice(0, 3).map((tech: string, techIdx: number) => (
                                                <span key={techIdx} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                                  {tech}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {isChatbotLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 입력 영역 */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleChatbotSend()
                          }
                        }}
                        placeholder="공고를 검색해보세요..."
                        className="flex-1 text-sm"
                        disabled={isChatbotLoading}
                      />
                      <Button
                        onClick={handleChatbotSend}
                        disabled={!chatInput.trim() || isChatbotLoading}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
          </div>
          )
        })()}
      </div>
    </div>
  )
}

