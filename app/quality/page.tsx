'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
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

export default function QualityPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedOurJob, setSelectedOurJob] = useState<JobPosting | null>(null)
  const [selectedCompetitorJob, setSelectedCompetitorJob] = useState<JobPosting | null>(null)
  const [ourJobImage, setOurJobImage] = useState<File | null>(null)
  const [competitorJobImage, setCompetitorJobImage] = useState<File | null>(null)

  // 우리 회사 공고 필터
  const [experienceFilter, setExperienceFilter] = useState<string[]>([])
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string[]>([])
  const [jobRoleInput, setJobRoleInput] = useState('')

  // 경쟁사 공고 필터
  const [selectedCompany, setSelectedCompany] = useState('전체')
  const [selectedJobRole, setSelectedJobRole] = useState('전체')
  const [searchResults, setSearchResults] = useState<JobPosting[]>([])

  // 회사 목록 (중복 제거)
  const companies = Array.from(new Set(jobPostingsData.map((job) => job.company.replace('(주)', '').trim())))

  // 직무 목록
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

  // 우리 회사 공고 필터링
  const filteredOurJobs = useMemo(() => {
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
  }

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

  const handleNextStep = () => {
    if (canProceedToNextStep() && currentStep < 3) {
      setCurrentStep(currentStep + 1)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">공고 품질 평가</h1>

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
            onClick={() => setCurrentStep(2)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              currentStep === 2
                ? 'bg-gray-100 text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={!canProceedToNextStep() || currentStep < 2}
          >
            공고 품질 및 평가 결과
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              currentStep === 3
                ? 'bg-gray-100 text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={!canProceedToNextStep() || currentStep < 3}
          >
            AI 추천 공고
          </button>
        </div>

        {/* Step 1: 공고 선택하기 */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* 우리 회사 공고 섹션 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">우리 회사 공고</h2>
              <div className="grid grid-cols-2 gap-8">
                {/* 왼쪽: 필터 및 업로드 */}
                <div className="space-y-6">
                  {/* 구분 필터 */}
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

                  {/* 이미지 업로드 */}
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
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          파일 선택
                        </button>
                        {ourJobImage && (
                          <p className="mt-2 text-xs text-gray-500">{ourJobImage.name}</p>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 우리 회사 공고 목록 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">공고 목록</h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredOurJobs.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">공고가 없습니다.</p>
                    ) : (
                      filteredOurJobs.map((job) => (
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
                    ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 경쟁사 공고 섹션 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">경쟁사 공고</h2>
              <div className="space-y-6">
                {/* 검색 필터 */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">회사 선택</label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-900 transition-colors cursor-pointer shadow-sm"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-900 transition-colors cursor-pointer shadow-sm"
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
                    onClick={handleCompetitorSearch}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    공고 검색
                  </button>
                </div>

                {/* 검색 결과 */}
                {searchResults.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">검색 결과</h3>
                    <div className="space-y-3">
                      {searchResults.map((job) => (
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
                          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">{job.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                              <div className="flex flex-wrap gap-2">
                                {job.meta_data?.tech_stack?.map((tech, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">{job.posted_date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    경쟁사 공고 이미지 업로드
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-sk-red transition-colors">
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
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        파일 선택
                      </button>
                      {competitorJobImage && (
                        <p className="mt-2 text-xs text-gray-500">{competitorJobImage.name}</p>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </section>

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
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">우리</span>
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
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">경쟁</span>
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

            {/* 상단 설명 텍스트 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-700 leading-relaxed">
                AI가 두 공고를 가독성, 구체성, 매력도 기준으로 분석하여 비교했습니다.
                문장 구조, 전문 용어, 맥락, 핵심 키워드를 종합적으로 고려하여 각 항목별 상세 평가와 점수를 제공합니다.
              </p>
            </div>

            {/* 가독성 분석 */}
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">우리 회사 공고</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">82</span>
                      <span className="text-lg text-gray-500">/100</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* 1. 사전 정보 안내 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">1. 사전 정보 안내</h4>
                        <span className="text-xs font-medium text-gray-600">25/30</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">지원자에게 필요한 정보가 명확하게 안내되어 있습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. 명확한 문장 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">2. 명확한 문장</h4>
                        <span className="text-xs font-medium text-gray-600">28/30</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">문장이 간결하고 명확하게 작성되어 있습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. 문단 구성 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">3. 문단 구성</h4>
                        <span className="text-xs font-medium text-gray-600">29/40</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">문단이 너무 길어 가독성이 떨어집니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 경쟁사 공고 평가 */}
                <div className="border-2 border-blue-500 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">경쟁사 공고</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">85</span>
                      <span className="text-lg text-gray-500">/100</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* 1. 사전 정보 안내 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">1. 사전 정보 안내</h4>
                        <span className="text-xs font-medium text-gray-600">27/30</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2, 3].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">지원자에게 필요한 정보가 명확하게 안내되어 있습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. 명확한 문장 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">2. 명확한 문장</h4>
                        <span className="text-xs font-medium text-gray-600">30/30</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2, 3].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">문장이 간결하고 명확하게 작성되어 있습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. 문단 구성 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">3. 문단 구성</h4>
                        <span className="text-xs font-medium text-gray-600">28/40</span>
                      </div>
                      <div className="space-y-1">
                        {[1].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">일부 문단이 길어 가독성을 개선할 여지가 있습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 구체성 분석 */}
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">우리 회사 공고</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">76</span>
                      <span className="text-lg text-gray-500">/100</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* 1. 담당 업무 구체성 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">1. 담당 업무 구체성</h4>
                        <span className="text-xs font-medium text-gray-600">22/30</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">담당 업무에 대한 설명이 부족하여 지원자가 업무 내용을 파악하기 어렵습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. 필요 역량 및 경험 구체성 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">2. 필요 역량 및 경험 구체성</h4>
                        <span className="text-xs font-medium text-gray-600">18/25</span>
                      </div>
                      <div className="space-y-1">
                        {[1].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">필요 역량에 대한 설명이 부족하여 지원자가 업무 내용을 파악하기 어렵습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. 직무 관련 기술 구체성 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">3. 직무 관련 기술 구체성</h4>
                        <span className="text-xs font-medium text-gray-600">23/30</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">직무 관련 기술에 대한 설명이 구체적입니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. 보상 정책 상세도 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">4. 보상 정책 상세도</h4>
                        <span className="text-xs font-medium text-gray-600">13/15</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">보상 정책에 대한 설명이 구체적입니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 경쟁사 공고 평가 */}
                <div className="border-2 border-blue-500 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">경쟁사 공고</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">80</span>
                      <span className="text-lg text-gray-500">/100</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* 1. 담당 업무 구체성 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">1. 담당 업무 구체성</h4>
                        <span className="text-xs font-medium text-gray-600">26/30</span>
                      </div>
                      <div className="space-y-1">
                        {[1].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">담당 업무에 대한 설명이 상세하고 구체적입니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. 필요 역량 및 경험 구체성 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">2. 필요 역량 및 경험 구체성</h4>
                        <span className="text-xs font-medium text-gray-600">20/25</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">필요 역량에 대한 설명이 구체적입니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. 직무 관련 기술 구체성 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">3. 직무 관련 기술 구체성</h4>
                        <span className="text-xs font-medium text-gray-600">25/30</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2, 3].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">직무 관련 기술에 대한 설명이 구체적입니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. 보상 정책 상세도 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">4. 보상 정책 상세도</h4>
                        <span className="text-xs font-medium text-gray-600">9/15</span>
                      </div>
                      <div className="space-y-1">
                        {[1].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">보상 정책에 대한 설명이 부족합니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 매력도 분석 */}
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">우리 회사 공고</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-orange-500">68</span>
                      <span className="text-lg text-gray-500">/100</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* 1. 매력적인 콘텐츠 여부 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">1. 매력적인 콘텐츠 여부</h4>
                        <span className="text-xs font-medium text-gray-600">38/50</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">매력적인 콘텐츠가 부족하여 지원자의 흥미를 유발하기 어렵습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. 매력적인 콘텐츠 활용도 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">2. 매력적인 콘텐츠 활용도</h4>
                        <span className="text-xs font-medium text-gray-600">30/50</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">매력적인 콘텐츠 활용도가 낮아 지원자의 흥미를 유발하기 어렵습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 경쟁사 공고 평가 */}
                <div className="border-2 border-blue-500 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">경쟁사 공고</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-orange-500">72</span>
                      <span className="text-lg text-gray-500">/100</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* 1. 매력적인 콘텐츠 여부 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">1. 매력적인 콘텐츠 여부</h4>
                        <span className="text-xs font-medium text-gray-600">42/50</span>
                      </div>
                      <div className="space-y-1">
                        {[1, 2, 3].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">현직자 인터뷰, 비전 제시 등 매력적인 콘텐츠가 포함되어 있습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. 매력적인 콘텐츠 활용도 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">2. 매력적인 콘텐츠 활용도</h4>
                        <span className="text-xs font-medium text-gray-600">30/50</span>
                      </div>
                      <div className="space-y-1">
                        {[1].map((idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-gray-700">매력적인 콘텐츠 활용도가 낮아 지원자의 흥미를 유발하기 어렵습니다.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 하단 설명 텍스트 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-700 leading-relaxed">
                AI 분석이 완료되었습니다. 가독성, 구체성, 매력도 기준으로 평가되었으며,
                각 항목별 점수와 상세 기준을 확인하시고, AI 추천 공고 및 유사한 우수 공고를 참고하세요.
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
                  AI 추천 공고 →
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

                {/* 공고 내용 */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-8 space-y-8">
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
    </div>
  )
}
