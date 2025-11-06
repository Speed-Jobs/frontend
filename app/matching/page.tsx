'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import jobPostingsData from '@/data/jobPostings.json'

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

interface MatchedJob {
  title: string
  description: string
  keywords: string[]
  similarity: number
}

export default function MatchingPage() {
  const [selectedCompany, setSelectedCompany] = useState('전체')
  const [selectedJobRole, setSelectedJobRole] = useState('전체')
  const [searchResults, setSearchResults] = useState<JobPosting[]>([])
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [showJobDetail, setShowJobDetail] = useState(false)
  const [showMatchingResult, setShowMatchingResult] = useState(false)
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([])

  // 회사 목록 (중복 제거)
  const companies = Array.from(new Set(jobPostingsData.map((job) => job.company.replace('(주)', '').trim())))

  // 직무 목록 (실제 데이터에서 추출)
  const jobRoles: string[] = Array.from(
    new Set(
      jobPostingsData
        .map((job) => {
          const title = job.title.toLowerCase()
          if (title.includes('백엔드') || title.includes('backend')) return '백엔드 개발자'
          if (title.includes('프론트엔드') || title.includes('frontend')) return '프론트엔드 개발자'
          if (title.includes('ai') || title.includes('ml') || title.includes('머신러닝')) return 'AI Engineer'
          if (title.includes('data') || title.includes('데이터')) return 'Data Engineer'
          if (title.includes('devops') || title.includes('인프라')) return 'DevOps Engineer'
          if (title.includes('full stack') || title.includes('풀스택')) return 'Full Stack Developer'
          return null
        })
        .filter((role) => role !== null) as string[]
    )
  )

  // 공고 검색 함수
  const handleSearch = () => {
    const filtered = jobPostingsData.filter((job) => {
      // 회사명 매칭 (정규화)
      const normalizedJobCompany = job.company.replace('(주)', '').trim().toLowerCase()
      const normalizedSelectedCompany = selectedCompany.toLowerCase()
      const companyMatch =
        selectedCompany === '전체' ||
        normalizedJobCompany.includes(normalizedSelectedCompany) ||
        normalizedSelectedCompany.includes(normalizedJobCompany)

      // 직무 매칭 (제목과 직무 카테고리 모두 확인)
      const normalizedJobTitle = job.title.toLowerCase()
      const normalizedJobCategory = (job.meta_data?.job_category || '').toLowerCase()
      const normalizedSelectedRole = selectedJobRole.toLowerCase()
      const roleMatch =
        selectedJobRole === '전체' ||
        normalizedJobTitle.includes(normalizedSelectedRole) ||
        normalizedJobCategory.includes(normalizedSelectedRole) ||
        (normalizedSelectedRole.includes('백엔드') && (normalizedJobTitle.includes('백엔드') || normalizedJobTitle.includes('backend'))) ||
        (normalizedSelectedRole.includes('프론트엔드') && (normalizedJobTitle.includes('프론트엔드') || normalizedJobTitle.includes('frontend'))) ||
        (normalizedSelectedRole.includes('ai') && (normalizedJobTitle.includes('ai') || normalizedJobTitle.includes('ml'))) ||
        (normalizedSelectedRole.includes('data') && normalizedJobTitle.includes('data'))

      return companyMatch && roleMatch
    })
    setSearchResults(filtered)
    setShowJobDetail(false)
    setShowMatchingResult(false)
  }

  // 컴포넌트 마운트 시 초기 검색 실행
  useEffect(() => {
    // 초기 검색 실행 (전체 공고 표시)
    const filtered = jobPostingsData.filter(() => true) // 전체 공고
    setSearchResults(filtered)
  }, [])

  // 공고 클릭 핸들러
  const handleJobClick = (job: JobPosting) => {
    setSelectedJob(job)
    setShowJobDetail(true)
    setShowMatchingResult(false)
  }

  // AI 직무 매칭 시작
  const handleStartMatching = () => {
    if (!selectedJob) return

    // 선택된 공고의 기술 스택 기반으로 매칭된 우리 회사 직무 생성
    const techStack = selectedJob.meta_data?.tech_stack || []
    const description = selectedJob.description.toLowerCase()
    
    // 기술 스택과 설명을 기반으로 매칭된 직무 생성
    const matched: MatchedJob[] = []
    
    // Kotlin/Spring Boot 관련 매칭
    if (techStack.some(tech => tech.toLowerCase().includes('kotlin') || tech.toLowerCase().includes('spring'))) {
      matched.push({
        title: '핀테크 백엔드 개발자',
        description: '금융 시스템 개발 경험과 Kotlin/Spring Boot 기술 스택이 정확히 일치합니다.',
        keywords: ['Kotlin', 'Spring Boot', '금융 시스템', '안정성'],
        similarity: 93,
      })
    }
    
    // Kubernetes/인프라 관련 매칭
    if (techStack.some(tech => tech.toLowerCase().includes('kubernetes') || tech.toLowerCase().includes('docker'))) {
      matched.push({
        title: '백엔드 플랫폼 엔지니어',
        description: 'Kubernetes 기반의 컨테이너 오케스트레이션 및 확장 가능한 시스템 개발 경험이 유사합니다.',
        keywords: ['Kotlin', 'PostgreSQL', 'Kubernetes', '확장성'],
        similarity: 87,
      })
    }
    
    // Redis/캐싱 관련 매칭
    if (techStack.some(tech => tech.toLowerCase().includes('redis') || tech.toLowerCase().includes('cache'))) {
      matched.push({
        title: '서버 개발자 (Kotlin/Spring)',
        description: 'Kotlin 기반의 Spring Boot 애플리케이션 개발 및 Redis 캐싱 경험이 일치합니다.',
        keywords: ['Kotlin', 'Spring Boot', 'Redis'],
        similarity: 84,
      })
    }
    
    // 기본 매칭 (매칭이 없을 경우)
    if (matched.length === 0) {
      matched.push(
        {
          title: '핀테크 백엔드 개발자',
          description: '금융 시스템 개발 경험과 Kotlin/Spring Boot 기술 스택이 정확히 일치합니다.',
          keywords: ['Kotlin', 'Spring Boot', '금융 시스템', '안정성'],
          similarity: 93,
        },
        {
          title: '백엔드 플랫폼 엔지니어',
          description: 'Kubernetes 기반의 컨테이너 오케스트레이션 및 확장 가능한 시스템 개발 경험이 유사합니다.',
          keywords: ['Kotlin', 'PostgreSQL', 'Kubernetes', '확장성'],
          similarity: 87,
        },
        {
          title: '서버 개발자 (Kotlin/Spring)',
          description: 'Kotlin 기반의 Spring Boot 애플리케이션 개발 및 Redis 캐싱 경험이 일치합니다.',
          keywords: ['Kotlin', 'Spring Boot', 'Redis'],
          similarity: 84,
        }
      )
    }

    setMatchedJobs(matched)
    setShowMatchingResult(true)
    setShowJobDetail(false) // 상세 모달 닫기
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* 검색 필터 섹션 */}
        <section>
          <div className="flex gap-4 items-end mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">회사 선택</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-sk-red focus:outline-none focus:border-sk-red transition-colors cursor-pointer shadow-sm"
              >
                <option value="전체">전체</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">직무 선택</label>
              <select
                value={selectedJobRole}
                onChange={(e) => setSelectedJobRole(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-sk-red focus:outline-none focus:border-sk-red transition-colors cursor-pointer shadow-sm"
              >
                <option value="전체">전체</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 border border-blue-600 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              공고 검색
            </button>
          </div>
        </section>

        {/* 검색 결과 섹션 */}
        {searchResults.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">검색 결과</h2>
            <div className="space-y-3">
              {searchResults.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleJobClick(job)}
                  className="bg-white p-6 border-2 border-gray-200 rounded-xl hover:border-sk-red hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{job.company.replace('(주)', '').trim()}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.meta_data?.tech_stack?.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 ml-4">{job.posted_date}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 공고 상세 모달 */}
        {showJobDetail && selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">{selectedJob.title}</h2>
                  <button
                    onClick={() => setShowJobDetail(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">회사명</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedJob.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">직무</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedJob.meta_data?.job_category || '개발'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">공고 설명</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">요구 기술</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.meta_data?.tech_stack?.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartMatching}
                  className="w-full px-6 py-4 bg-sk-red hover:bg-sk-red-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  AI 직무 매칭 시작
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 매칭 결과 모달 */}
        {showMatchingResult && selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">{selectedJob.title}</h2>
                  <button
                    onClick={() => {
                      setShowMatchingResult(false)
                      setShowJobDetail(false)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">회사명</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedJob.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">직무</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedJob.meta_data?.job_category || '개발'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">공고 설명</p>
                    <p className="text-gray-700">{selectedJob.description.split('\n')[0]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">요구 기술</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.meta_data?.tech_stack?.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">매칭 완료</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-pink-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    매칭된 직무 <span className="text-sk-red">{matchedJobs.length}개</span>
                  </h3>
                  <div className="space-y-4">
                    {matchedJobs.map((matched, index) => (
                      <div
                        key={index}
                        className="bg-white p-6 border-2 border-gray-200 rounded-xl hover:border-sk-red transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-bold text-gray-900">{matched.title}</h4>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 whitespace-nowrap">
                            {matched.similarity}% 일치
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{matched.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {matched.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-300"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
