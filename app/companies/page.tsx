'use client'

import { useState, useMemo, useEffect } from 'react'
import Header from '@/components/Header'
import CompanyLogo from '@/components/CompanyLogo'
import jobPostingsData from '@/data/jobPostings.json'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedJobRole, setSelectedJobRole] = useState('전체')
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; date: string } | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [imageGalleryPage, setImageGalleryPage] = useState(1)
  const imagesPerPage = 2 // 갤러리에서 한 페이지에 표시할 이미지 수

  // AI 챗봇 상태
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, jobs?: any[] }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatbotLoading, setIsChatbotLoading] = useState(false)

  // 공고 리스트 필터링 상태
  const [jobListFilter, setJobListFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'name' | 'date-asc' | 'date-desc'>('date-desc')


  // 회사별 공고 통계 계산
  const companyStats = useMemo(() => {
    const companyMap = new Map<string, { count: number; jobs: any[]; oldestDate: Date; newestDate: Date }>()
    const now = new Date()

    jobPostingsData.forEach((job) => {
      const postedDate = new Date(job.posted_date)

      // 직무 필터 적용
      if (selectedJobRole !== '전체') {
        const title = job.title.toLowerCase()
        const normalizedJobRole = selectedJobRole.toLowerCase()
        const jobCategory = job.meta_data?.job_category?.toLowerCase() || ''
        
        let jobRoleMatch = false
        
        // 1. 제목에 직무명이 직접 포함되어 있는지 확인 (대소문자 무시)
        if (title.includes(normalizedJobRole) || job.title.includes(selectedJobRole)) {
          jobRoleMatch = true
        }
        // 2. job_category와 직무명 매칭
        else if (jobCategory && (
          jobCategory.includes(normalizedJobRole) ||
          normalizedJobRole.includes(jobCategory)
        )) {
          jobRoleMatch = true
        }
        // 3. 각 직무별 세부 매칭 로직
        else if (selectedJobRole === 'Software Development') {
          jobRoleMatch = 
            title.includes('개발') || 
            title.includes('developer') ||
            title.includes('engineer') ||
            jobCategory === '개발' ||
            jobCategory.includes('software') ||
            jobCategory.includes('development')
        }
        else if (selectedJobRole === 'Factory AX Engineering') {
          jobRoleMatch = 
            title.includes('factory') ||
            title.includes('ax') ||
            title.includes('제조') ||
            title.includes('공장') ||
            title.includes('simulation') ||
            title.includes('기구설계') ||
            title.includes('전장') ||
            jobCategory.includes('factory')
        }
        else if (selectedJobRole === 'Solution Development') {
          jobRoleMatch = 
            title.includes('solution') ||
            title.includes('erp') ||
            title.includes('시스템') ||
            jobCategory === '기획' ||
            jobCategory.includes('solution')
        }
        else if (selectedJobRole === 'Cloud/Infra Engineering') {
          jobRoleMatch = 
            title.includes('cloud') ||
            title.includes('클라우드') ||
            title.includes('infra') ||
            title.includes('인프라') ||
            title.includes('devops') ||
            jobCategory === '인프라' ||
            jobCategory.includes('cloud') ||
            jobCategory.includes('infra')
        }
        else if (selectedJobRole === 'Architect') {
          jobRoleMatch = 
            title.includes('architect') ||
            title.includes('아키텍트') ||
            title.includes('설계') ||
            jobCategory.includes('architect')
        }
        else if (selectedJobRole === 'Project Management') {
          jobRoleMatch = 
            title.includes('pm') ||
            title.includes('project') ||
            title.includes('프로젝트') ||
            title.includes('관리') ||
            jobCategory === '기획' ||
            jobCategory.includes('project') ||
            jobCategory.includes('management')
        }
        else if (selectedJobRole === 'Quality Management') {
          jobRoleMatch = 
            title.includes('quality') ||
            title.includes('품질') ||
            title.includes('qa') ||
            title.includes('테스트') ||
            jobCategory.includes('quality')
        }
        else if (selectedJobRole === 'AI') {
          jobRoleMatch = 
            title.includes('ai') ||
            title.includes('ml') ||
            title.includes('머신러닝') ||
            title.includes('인공지능') ||
            jobCategory === 'ai/ml' ||
            jobCategory.includes('ai')
        }
        else if (selectedJobRole === '정보보호') {
          jobRoleMatch = 
            title.includes('보안') ||
            title.includes('security') ||
            title.includes('정보보호') ||
            jobCategory === '보안' ||
            jobCategory.includes('보안')
        }
        else if (selectedJobRole === 'Sales') {
          jobRoleMatch = 
            title.includes('sales') ||
            title.includes('영업') ||
            title.includes('세일즈') ||
            jobCategory === '마케팅' ||
            jobCategory.includes('sales')
        }
        else if (selectedJobRole === 'Domain Expert') {
          jobRoleMatch = 
            title.includes('domain') ||
            title.includes('도메인') ||
            title.includes('전문가') ||
            jobCategory === '기획' ||
            jobCategory.includes('domain') ||
            jobCategory.includes('expert')
        }
        else if (selectedJobRole === 'Consulting') {
          jobRoleMatch = 
            title.includes('consulting') ||
            title.includes('컨설팅') ||
            title.includes('esg') ||
            title.includes('crm') ||
            title.includes('scm') ||
            jobCategory.includes('consulting')
        }
        else if (selectedJobRole === 'Biz. Supporting') {
          jobRoleMatch = 
            title.includes('supporting') ||
            title.includes('지원') ||
            title.includes('strategy') ||
            title.includes('전략') ||
            jobCategory === '기획' ||
            jobCategory.includes('supporting') ||
            jobCategory.includes('biz')
        }
        
        if (!jobRoleMatch) {
          return
        }
      }

      const companyName = job.company.replace('(주)', '').trim()
      const existing = companyMap.get(companyName) || {
        count: 0,
        jobs: [],
        oldestDate: postedDate,
        newestDate: postedDate,
      }

      companyMap.set(companyName, {
        count: existing.count + 1,
        jobs: [...existing.jobs, job],
        oldestDate: postedDate < existing.oldestDate ? postedDate : existing.oldestDate,
        newestDate: postedDate > existing.newestDate ? postedDate : existing.newestDate,
      })
    })

    const total = Array.from(companyMap.values()).reduce((sum, data) => sum + data.count, 0)
    const now30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return Array.from(companyMap.entries())
      .map(([company, data]) => {
        const recentJobs = data.jobs.filter(
          (job) => new Date(job.posted_date).getTime() >= now30DaysAgo.getTime()
        ).length

        // 증감률 계산 (간단한 예시 - 실제로는 전월 대비 계산 필요)
        const oldJobs = data.jobs.filter(
          (job) => new Date(job.posted_date).getTime() < now30DaysAgo.getTime()
        ).length
        const trend = oldJobs > 0 ? ((recentJobs - oldJobs) / oldJobs) * 100 : 0

        return {
          company,
          count: data.count,
          percentage: (data.count / total) * 100,
          trend,
          recentJobs,
          oldestDate: data.oldestDate,
          newestDate: data.newestDate,
          jobs: data.jobs,
        }
      })
  }, [selectedJobRole])

  // 선택된 회사의 공고 목록 (필터링 및 정렬 적용)
  const selectedCompanyJobs = useMemo(() => {
    if (!selectedCompany) return []
    const companyStat = companyStats.find((stat) => stat.company === selectedCompany)
    if (!companyStat) return []
    
    // 필터링
    let filtered = companyStat.jobs
    if (jobListFilter.trim()) {
      const filterLower = jobListFilter.toLowerCase()
      filtered = filtered.filter((job) => 
        job.title.toLowerCase().includes(filterLower) ||
        new Date(job.posted_date).toLocaleDateString('ko-KR').includes(filterLower)
      )
    }
    
    // 정렬
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'name') {
        return a.title.localeCompare(b.title, 'ko')
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
  }, [selectedCompany, companyStats, jobListFilter, sortOrder])

  // 검색 핸들러
  const handleSearch = () => {
    if (!searchQuery.trim()) return
    
    const filtered = companyStats.filter((stat) => 
      stat.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    if (filtered.length > 0) {
      setSelectedCompany(filtered[0].company)
      setImageGalleryPage(1)
    } else {
      alert('검색 결과가 없습니다.')
    }
  }

  // AI 챗봇 메시지 전송 핸들러
  const handleChatbotSend = async () => {
    if (!chatInput.trim() || isChatbotLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsChatbotLoading(true)

    // 공고 검색 로직
    const searchKeywords = userMessage.toLowerCase()
    const matchedJobs: any[] = []

    // 전체 공고 데이터에서 검색
    jobPostingsData.forEach((job) => {
      const titleMatch = job.title.toLowerCase().includes(searchKeywords)
      const descriptionMatch = job.description.toLowerCase().includes(searchKeywords)
      const companyMatch = job.company.toLowerCase().includes(searchKeywords)
      const techStackMatch = job.meta_data?.tech_stack?.some((tech: string) => 
        tech.toLowerCase().includes(searchKeywords)
      ) || false

      if (titleMatch || descriptionMatch || companyMatch || techStackMatch) {
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
      assistantMessage = `죄송합니다. "${userMessage}"와 관련된 공고를 찾지 못했습니다. 다른 키워드로 검색해보시겠어요?\n\n예: "React 개발자", "카카오", "백엔드", "Python" 등`
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">옛날 공고 검색</h1>
          <p className="text-gray-600">회사명과 직무를 검색하여 과거 공고 이미지를 확인하세요</p>
        </div>

        {/* 검색 섹션 */}
        <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm mb-8">
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

            {/* 직무 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">직무</label>
              <select
                value={selectedJobRole}
                onChange={(e) => {
                  setSelectedJobRole(e.target.value)
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-base"
              >
                <option value="전체">전체 직무</option>
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

            {/* 검색 버튼 */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
              >
                공고 검색
              </button>
            </div>
          </div>

          {/* 검색 결과 요약 */}
          {selectedCompany && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                    <CompanyLogo name={selectedCompany} className="w-full h-full" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCompany}
                      {selectedJobRole !== '전체' && (
                        <span className="text-gray-600 font-normal ml-2">· {selectedJobRole}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedCompanyJobs.length}개의 공고 이미지를 확인할 수 있습니다
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCompany(null)
                    setSearchQuery('')
                    setSelectedJobRole('전체')
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
          {!selectedCompany ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">회사명과 직무를 검색하세요</h3>
              <p className="text-gray-600 text-sm">
                위 검색창에 회사명을 입력하고 직무를 선택한 후 검색 버튼을 클릭하면<br />
                해당 회사의 공고 목록을 확인할 수 있습니다.
              </p>
            </div>
          ) : selectedCompanyJobs.length > 0 ? (
            <>
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
                      <CompanyLogo name={selectedCompany} className="w-full h-full" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedCompany}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        총 {selectedCompanyJobs.length}개의 공고
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCompany(null)
                      setSearchQuery('')
                      setSelectedJobRole('전체')
                      setSelectedJobDetail(null)
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    초기화
                  </button>
                </div>
                
                {/* 필터 및 정렬 */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={jobListFilter}
                      onChange={(e) => setJobListFilter(e.target.value)}
                      placeholder="공고 이름 또는 수집일로 검색..."
                      className="w-full px-4 py-2 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'name' | 'date-asc' | 'date-desc')}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="date-desc">최신순</option>
                    <option value="date-asc">오래된순</option>
                    <option value="name">이름순</option>
                  </select>
                </div>
              </div>
              
              {/* 파일 탐색기 스타일 리스트 */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* 헤더 */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 grid grid-cols-[40px_1fr_100px_140px] gap-4 text-sm font-semibold text-gray-700">
                  <div></div>
                  <div>공고 이름</div>
                  <div className="text-center">고용 형태</div>
                  <div className="text-center">수집일</div>
                </div>
                
                {/* 리스트 아이템 */}
                <div className="divide-y divide-gray-200">
                  {selectedCompanyJobs.length > 0 ? (
                    selectedCompanyJobs.map((job, index) => {
                      return (
                        <div
                          key={job.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors grid grid-cols-[40px_1fr_100px_140px] gap-4 items-center group"
                          onClick={() => setSelectedJobDetail(job)}
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
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">공고가 없습니다</h3>
              <p className="text-gray-600 text-sm">
                {selectedCompany}의 {selectedJobRole !== '전체' ? selectedJobRole + ' ' : ''}공고가 없습니다.
              </p>
            </div>
          )}
        </div>
        
        {/* 공고 상세 정보 모달 */}
        {selectedJobDetail && (() => {
          // 회사명을 파일명으로 변환하는 매핑
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
          const jobIndex = selectedCompanyJobs.findIndex(job => job.id === selectedJobDetail.id)
          const imageId = jobIndex >= 0 ? jobIndex + 1 : 1
          const imagePath = `/job-postings/${companySlug}/${imageId}.png`
          
          return (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedJobDetail(null)}
            >
              <div 
                className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">공고 상세 정보</h2>
                  <button
                    onClick={() => setSelectedJobDetail(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 공고 이미지 */}
                    <div className="space-y-4">
                      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 relative">
                        <img
                          src={imagePath}
                          alt={selectedJobDetail.title}
                          className="w-full h-full object-contain"
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
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm">
                        마감일: {new Date(selectedJobDetail.expired_date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* 기술 스택 */}
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

                {/* 공고 내용 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">공고 내용</h4>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                      {selectedJobDetail.description}
                    </pre>
                  </div>
                </div>

                {/* 복리후생 */}
                {selectedJobDetail.meta_data?.benefits && selectedJobDetail.meta_data.benefits.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">복리후생</h4>
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

                      {/* 급여 정보 */}
                      {selectedJobDetail.meta_data?.salary && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">급여</h4>
                          <p className="text-gray-700">{selectedJobDetail.meta_data.salary}</p>
                        </div>
                      )}
                    </div>
                  </div>
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
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
        >
          {showChatbot ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </button>

        {/* AI 챗봇 패널 */}
        {showChatbot && (
          <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border-2 border-gray-200 flex flex-col z-50">
            {/* 챗봇 헤더 */}
            <div className="bg-blue-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">공고 검색 AI Agent</h3>
                  <p className="text-xs text-blue-100">공고를 검색해드립니다</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatbot(false)}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 채팅 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
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
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors"
                      >
                        React 개발자
                      </button>
                      <button
                        onClick={() => {
                          setChatInput('카카오')
                          setTimeout(() => handleChatbotSend(), 100)
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors"
                      >
                        카카오
                      </button>
                      <button
                        onClick={() => {
                          setChatInput('백엔드')
                          setTimeout(() => handleChatbotSend(), 100)
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors"
                      >
                        백엔드
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                chatMessages.map((message, idx) => (
                  <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'} rounded-lg p-3`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.jobs && message.jobs.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.jobs.map((job, jobIdx) => (
                            <div
                              key={jobIdx}
                              onClick={() => setSelectedJobDetail(job)}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <p className="text-xs font-semibold text-gray-900 mb-1">{job.title}</p>
                              <p className="text-xs text-gray-600">{job.company}</p>
                              {job.meta_data?.tech_stack && job.meta_data.tech_stack.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {job.meta_data.tech_stack.slice(0, 3).map((tech: string, techIdx: number) => (
                                    <span key={techIdx} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isChatbotLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
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
            <div className="border-t border-gray-200 p-4 bg-white rounded-b-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleChatbotSend()
                    }
                  }}
                  placeholder="공고를 검색해보세요..."
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  disabled={isChatbotLoading}
                />
                <button
                  onClick={handleChatbotSend}
                  disabled={!chatInput.trim() || isChatbotLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

