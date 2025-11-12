'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import CompanyLogo from '@/components/CompanyLogo'
import jobPostingsData from '@/data/jobPostings.json'

export default function JobsPage() {
  const router = useRouter()
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [companySearchQuery, setCompanySearchQuery] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all')
  const [sortBy, setSortBy] = useState<'latest' | 'company' | 'deadline'>('latest')

  // 로고가 있는 회사 목록 (CompanyLogo의 companyNameMap 기반 + 실제 데이터의 회사명)
  const companiesWithLogo = [
    '삼성SDS', 'SAMSUNG', '삼성전자', '삼성', 'LGCNS', 'LG', 'LG전자',
    '현대 오토에버', 'HYUNDAI', '현대자동차', '현대',
    '한화 시스템', '한화',
    'KT',
    '네이버', 'NAVER',
    '카카오', 'kakao',
    '라인', 'LINE',
    '쿠팡', 'Coupang',
    '배민', 'Baemin',
    '토스', 'Toss',
    'KPMG',
    '당근마켓', '당근', 'Daangn'
  ]

  // 회사 목록 (중복 제거, 전체 옵션 포함)
  const companies = useMemo(() => 
    Array.from(new Set(jobPostingsData.map((job) => job.company.replace('(주)', '').trim())))
  , [])

  const employmentTypes = ['고용형태', '정규직', '계약직', '인턴', '프리랜서', '파트타임']

  // 필터링된 회사 목록 (검색어 기반)
  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery) return companies
    const query = companySearchQuery.toLowerCase()
    return companies.filter(company => 
      company.toLowerCase().includes(query)
    )
  }, [companySearchQuery, companies])

  // 회사 토글 핸들러
  const handleCompanyToggle = (company: string) => {
    setSelectedCompanies(prev => 
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    )
  }

  // 전체 선택/해제 핸들러
  const handleSelectAllCompanies = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([])
    } else {
      setSelectedCompanies([...filteredCompanies])
    }
  }

  // 회사 제거 핸들러
  const handleRemoveCompany = (company: string) => {
    setSelectedCompanies(prev => prev.filter(c => c !== company))
  }

  // 필터링된 공고 목록 (로고가 있는 회사만 + 회사 필터)
  const filteredJobPostings = useMemo(() => {
    const filtered = jobPostingsData.filter((job) => {
      // 회사 필터링 (다중 선택)
      if (selectedCompanies.length > 0) {
        const normalizedJobCompany = job.company.replace('(주)', '').trim().toLowerCase()
        const companyMatch = selectedCompanies.some(selectedCompany => {
          const normalizedSelectedCompany = selectedCompany.toLowerCase()
          return normalizedJobCompany.includes(normalizedSelectedCompany) ||
                 normalizedSelectedCompany.includes(normalizedJobCompany)
        })
        if (!companyMatch) return false
      }

      // 로고가 있는 회사만 필터링 (더 유연한 매칭)
      const companyName = job.company.replace('(주)', '').trim().toLowerCase()
      const normalizedCompanyName = companyName.replace(/\s+/g, '')
      const hasLogo = companiesWithLogo.some(company => {
        const normalizedLogoCompany = company.toLowerCase().replace(/\s+/g, '')
        return companyName.includes(normalizedLogoCompany) || 
               normalizedLogoCompany.includes(companyName) ||
               normalizedCompanyName.includes(normalizedLogoCompany) ||
               normalizedLogoCompany.includes(normalizedCompanyName) ||
               // 부분 매칭 (예: "삼성전자"와 "삼성" 매칭)
               companyName.startsWith(normalizedLogoCompany) ||
               normalizedLogoCompany.startsWith(companyName)
      })
      if (!hasLogo) return false

      const employmentTypeMatch =
        selectedEmploymentType === 'all' || job.employment_type === selectedEmploymentType
      
      return employmentTypeMatch
    })

    // 정렬 적용
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          // 최신공고순: posted_date 기준 내림차순
          return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
        case 'company':
          // 회사이름순: company 기준 오름차순
          const companyA = a.company.replace('(주)', '').trim()
          const companyB = b.company.replace('(주)', '').trim()
          return companyA.localeCompare(companyB, 'ko')
        case 'deadline':
          // 마감순: expired_date 기준 오름차순 (null은 맨 뒤로)
          if (!a.expired_date && !b.expired_date) return 0
          if (!a.expired_date) return 1
          if (!b.expired_date) return -1
          return new Date(a.expired_date).getTime() - new Date(b.expired_date).getTime()
        default:
          return 0
      }
    })

    return sorted
  }, [selectedCompanies, selectedEmploymentType, companiesWithLogo, sortBy])

  const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmploymentType(e.target.value === '고용형태' ? 'all' : e.target.value)
  }

  return ( 
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-8 py-8 max-w-[95%] mx-auto relative">
        {/* 이전으로 버튼 - 아이콘만 원형 버튼 */}
        <button
          onClick={() => router.back()}
          className="absolute left-0 top-8 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-300 group"
          aria-label="이전으로"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="mb-10 ml-5">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            경쟁사 공고 전체 목록
          </h1>
          <p className="text-gray-600">
            실시간으로 업데이트되는 모든 채용 공고를 확인하세요
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="space-y-3 mb-6">
          {/* 첫 번째 줄: 검색창과 필터 */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* 회사 멀티 셀렉트 */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="회사 검색..."
                  value={companySearchQuery}
                  onChange={(e) => {
                    setCompanySearchQuery(e.target.value)
                    setShowCompanyDropdown(true)
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all shadow-sm hover:shadow-md w-64"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* 드롭다운 메뉴 */}
              {showCompanyDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowCompanyDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                      <button
                        onClick={handleSelectAllCompanies}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {selectedCompanies.length === filteredCompanies.length ? '전체 해제' : '전체 선택'}
                      </button>
                    </div>
                    <div className="p-2">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company) => {
                          const isSelected = selectedCompanies.includes(company)
                          return (
                            <label
                              key={company}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCompanyToggle(company)}
                                className="w-4 h-4 text-sk-red focus:ring-sk-red focus:ring-2 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700 flex-1">{company}</span>
                            </label>
                          )
                        })
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                          검색 결과가 없습니다
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedEmploymentType === 'all' ? '고용형태' : selectedEmploymentType}
                onChange={handleEmploymentTypeChange}
                className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all cursor-pointer shadow-sm hover:shadow-md text-left appearance-none"
                style={{ textAlign: 'left', textAlignLast: 'left' }}
              >
                {employmentTypes.map((type) => (
                  <option key={type} value={type === '고용형태' ? 'all' : type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* 정렬 라디오 버튼 */}
            <div className="ml-auto inline-flex items-center gap-1">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="sortBy"
                  value="latest"
                  checked={sortBy === 'latest'}
                  onChange={() => setSortBy('latest')}
                  className="w-4 h-4 text-sk-red focus:ring-sk-red focus:ring-2 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">최신공고순</span>
              </label>
              <div className="w-px h-6 bg-gray-300"></div>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="sortBy"
                  value="company"
                  checked={sortBy === 'company'}
                  onChange={() => setSortBy('company')}
                  className="w-4 h-4 text-sk-red focus:ring-sk-red focus:ring-2 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">회사이름순</span>
              </label>
              <div className="w-px h-6 bg-gray-300"></div>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="sortBy"
                  value="deadline"
                  checked={sortBy === 'deadline'}
                  onChange={() => setSortBy('deadline')}
                  className="w-4 h-4 text-sk-red focus:ring-sk-red focus:ring-2 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">마감순</span>
              </label>
            </div>
          </div>

          {/* 두 번째 줄: 선택된 회사 태그 */}
          {selectedCompanies.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center pt-2">
              {selectedCompanies.map((company) => (
                <span
                  key={company}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sk-red/10 text-sk-red rounded-xl text-sm font-medium border border-sk-red/20 shadow-sm hover:shadow-md transition-all"
                >
                  {company}
                  <button
                    onClick={() => handleRemoveCompany(company)}
                    className="hover:bg-sk-red/20 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-base text-gray-700 font-medium">
            <span className="text-gray-900 font-bold">{filteredJobPostings.length}개</span>의 공고를 확인할 수 있어요.
          </p>
        </div>

        {/* Job Posting List */}
        <div className="space-y-3">
          {filteredJobPostings.length > 0 ? (
            filteredJobPostings.map((job) => {
              // 마감일까지 남은 일수 계산
              const getDaysUntilExpiry = (expiredDate: string | null): string => {
                if (!expiredDate) return '상시채용'
                const today = new Date()
                const expiry = new Date(expiredDate)
                const diffTime = expiry.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                
                if (diffDays < 0) return '마감'
                if (diffDays === 0) return '오늘 마감'
                return `${diffDays}일 남음`
              }
              
              const deadline = getDaysUntilExpiry(job.expired_date)
              const companyName = job.company.replace('(주)', '').trim()
              
              // 날짜 포맷팅
              const formatDate = (dateString: string) => {
                const date = new Date(dateString)
                return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
              }
              
              const startDate = formatDate(job.posted_date)
              const endDate = job.expired_date ? formatDate(job.expired_date) : '상시채용'
              
              // 공고명 생성 (다양한 형식으로 구성)
              const getJobPostingTitle = () => {
                const postedDate = new Date(job.posted_date)
                const year = postedDate.getFullYear()
                const month = postedDate.getMonth() + 1
                const half = month <= 6 ? '상반기' : '하반기'
                
                // 경력 정보 파싱
                const experience = job.experience || ''
                const isNewbie = experience.includes('신입') || experience === '신입'
                const isExperienced = experience.includes('경력')
                
                // 직군명 추출 (괄호 안 내용 포함)
                const jobTitle = job.title || ''
                const jobCategoryName = job.meta_data?.job_category || ''
                
                // 괄호 안의 세부 직군명 추출 (예: "백엔드 개발자 (Python/Django)" -> "Python/Django")
                const detailMatch = jobTitle.match(/\(([^)]+)\)/)
                const detailCategory = detailMatch ? detailMatch[1] : null
                
                // 다양한 템플릿 배열
                const templates: string[] = []
                
                // 템플릿 1: "YYYY년 하반기 신입구성원(직군) 채용"
                if (isNewbie && detailCategory) {
                  templates.push(`${year}년 ${half} 신입구성원(${detailCategory}) 채용`)
                }
                
                // 템플릿 2: "YYYY년 하반기 신입/경력 채용"
                if (isNewbie || isExperienced) {
                  if (isNewbie && isExperienced) {
                    templates.push(`${year}년 ${half} 신입/경력 채용`)
                  } else if (isNewbie) {
                    templates.push(`${year}년 ${half} 신입 채용`)
                  } else {
                    templates.push(`${year}년 ${half} 경력 채용`)
                  }
                }
                
                // 템플릿 3: "YYYY년 하반기 공개채용"
                templates.push(`${year}년 ${half} 공개채용`)
                
                // 템플릿 4: "YYYY년 하반기 정규직 채용"
                if (job.employment_type === '정규직') {
                  templates.push(`${year}년 ${half} 정규직 채용`)
                }
                
                // 템플릿 5: "YYYY년 하반기 [직군명] 채용"
                if (jobCategoryName && jobCategoryName !== '개발') {
                  templates.push(`${year}년 ${half} ${jobCategoryName} 채용`)
                }
                
                // 템플릿 6: "YYYY년 하반기 신입구성원 채용"
                if (isNewbie) {
                  templates.push(`${year}년 ${half} 신입구성원 채용`)
                }
                
                // 템플릿 7: "YYYY년 하반기 상시채용"
                if (!job.expired_date) {
                  templates.push(`${year}년 ${half} 상시채용`)
                }
                
                // job.id를 기반으로 일관된 템플릿 선택 (같은 공고는 항상 같은 형식)
                const templateIndex = job.id % templates.length
                return templates[templateIndex] || `${year}년 ${half} 공개채용`
              }
              
              const jobPostingTitle = getJobPostingTitle()
              
              // 직군명 추출 (job.title에서 괄호 앞 부분만 추출)
              const getJobCategory = () => {
                if (job.title) {
                  // 괄호가 있으면 괄호 앞 부분만 추출
                  const match = job.title.match(/^([^(]+)/)
                  if (match) {
                    return match[1].trim()
                  }
                  return job.title.trim()
                }
                // job.title이 없으면 job_category를 기반으로 매핑
                const category = job.meta_data?.job_category || '개발'
                const categoryMap: Record<string, string> = {
                  'AI/ML': 'ML Engineer',
                  '개발': 'Developer',
                  '데이터': 'Data Engineer',
                  '인프라': 'Infrastructure Engineer',
                  '보안': 'Security Engineer',
                  '기획': 'Product Manager',
                  '디자인': 'Designer',
                  '마케팅': 'Marketing'
                }
                return categoryMap[category] || category
              }
              
              const jobCategory = getJobCategory()
              
              return (
                <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                  <div className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    {/* 기업사진 */}
                    <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0 overflow-hidden">
                      <CompanyLogo name={companyName} className="w-full h-full p-2" />
                    </div>
                    
                    {/* 메인 정보 영역 */}
                    <div className="flex-1 min-w-0">
                      {/* 기업명 */}
                      <div className="mb-2">
                        <p className="text-sm font-semibold text-gray-900">{companyName}</p>
                      </div>
                      
                      {/* 공고명 */}
                      <div className="mb-2">
                        <h4 className="font-bold text-gray-900 text-xl truncate">
                          {jobPostingTitle}
                        </h4>
                      </div>
                      
                      {/* 직군명 */}
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {jobCategory}
                        </p>
                      </div>
                      
                      {/* 날짜, 고용형태 */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">기간:</span>
                          <span className="text-sm font-medium text-gray-700">{startDate} ~ {endDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">고용형태:</span>
                          <span className="text-sm font-medium text-gray-700">{job.employment_type}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 마감일까지 남은 일수 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`w-28 px-4 py-2 text-sm font-semibold rounded-lg border whitespace-nowrap text-center ${
                        deadline === '마감' || deadline === '오늘 마감'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : deadline === '상시채용'
                          ? 'bg-gray-50 text-gray-700 border-gray-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {deadline}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                선택한 조건에 맞는 공고가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

