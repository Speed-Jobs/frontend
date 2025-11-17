'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import JobPostingCard from '@/components/JobPostingCard'
import NotificationToast from '@/components/NotificationToast'
import CompanyLogo from '@/components/CompanyLogo'
import jobPostingsData from '@/data/jobPostings.json'
import { useJobNotifications } from '@/hooks/useJobNotifications'
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('Daily')
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [companySearchQuery, setCompanySearchQuery] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [expandedRelatedSkills, setExpandedRelatedSkills] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedExpertCategory, setSelectedExpertCategory] = useState<'Tech' | 'Biz' | 'BizSupporting'>('Tech')
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'latest' | 'company' | 'deadline'>('latest')
  const [selectedCompanyForSkills, setSelectedCompanyForSkills] = useState<string | null>('토스')
  
  // 자동매칭 관련 상태
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null)
  const [matchedJobsMap, setMatchedJobsMap] = useState<Record<number, Array<{
    title: string
    description: string
    keywords: string[]
    similarity: number
  }>>>({})

  // AI 분석 리포트 관련 상태
  const [showReportModal, setShowReportModal] = useState(false)
  
  // 광고 패널 열고 닫기 상태
  const [showAdPanels, setShowAdPanels] = useState(false)
  
  // 섹션별 AI 분석 상태 (dropdown 방식)
  const [openAnalysisSections, setOpenAnalysisSections] = useState<Record<string, boolean>>({})
  const [sectionAnalysisContent, setSectionAnalysisContent] = useState<Record<string, string>>({})
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState<Record<string, boolean>>({})

  // 백엔드에서 받은 회사 목록
  const [apiCompanies, setApiCompanies] = useState<Array<{ id: number; name: string }>>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const [companiesError, setCompaniesError] = useState<string | null>(null)

  // 회사 목록 API 호출
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true)
        setCompaniesError(null)
        
        const apiUrl = 'http://172.20.10.2:8080/api/v1/companies/filter'
        console.log('=== 회사 목록 API 호출 ===')
        console.log('호출 URL:', apiUrl)
        console.log('호출 시각:', new Date().toISOString())
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        console.log('응답 상태:', response.status)
        console.log('응답 URL:', response.url)
        console.log('응답 헤더:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('HTTP 에러 발생! 상태 코드:', response.status)
          console.error('에러 응답 내용:', errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('백엔드에서 받은 회사 목록:', result)
        
        if (result.data && result.data.companies && Array.isArray(result.data.companies)) {
          console.log('회사 목록 데이터:', result.data.companies)
          console.log(`✓ 백엔드 API에서 ${result.data.companies.length}개의 회사를 불러왔습니다.`)
          setApiCompanies(result.data.companies)
        } else {
          console.warn('회사 목록 데이터 형식이 올바르지 않습니다.')
          setApiCompanies([])
        }
      } catch (err) {
        console.error('=== 회사 목록 API 호출 에러 ===')
        console.error('에러 타입:', err instanceof Error ? err.constructor.name : typeof err)
        console.error('에러 메시지:', err instanceof Error ? err.message : String(err))
        console.error('에러 스택:', err instanceof Error ? err.stack : 'N/A')
        
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          console.error('CORS 또는 네트워크 에러로 보입니다.')
          console.error('백엔드에서 다음 CORS 헤더를 설정해야 합니다:')
          console.error('- Access-Control-Allow-Origin: * (또는 프론트엔드 도메인)')
          console.error('- Access-Control-Allow-Methods: GET, POST, OPTIONS')
          console.error('- Access-Control-Allow-Headers: Content-Type, Accept')
          setCompaniesError('CORS 또는 네트워크 연결 오류가 발생했습니다. 백엔드 CORS 설정을 확인해주세요.')
        } else {
          setCompaniesError(err instanceof Error ? err.message : '회사 목록을 불러오는 중 오류가 발생했습니다.')
        }
        setApiCompanies([])
      } finally {
        setIsLoadingCompanies(false)
      }
    }

    fetchCompanies()
  }, [])

  // 새로운 공고 알림 시스템 (알림만 처리, UI는 마이페이지에서 관리)
  const allJobPostings = useMemo(() => [...jobPostingsData], [])
  const {
    newJobs,
    hasNewJobs,
    clearNewJobs,
  } = useJobNotifications({
    jobPostings: allJobPostings,
    autoCheck: true,
    checkInterval: 5 * 60 * 1000, // 5분마다 체크
    onNewJobsFound: (newJobs) => {
      console.log(`새로운 공고 ${newJobs.length}개 발견!`)
    },
  })

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

  // 회사 목록 (백엔드 데이터가 있으면 사용, 없으면 기본 데이터 사용)
  const companies = useMemo(() => {
    if (apiCompanies.length > 0) {
      // 백엔드에서 받은 회사 이름만 추출
      return apiCompanies.map(company => company.name)
    }
    // 기본 데이터에서 회사 목록 추출 (중복 제거)
    return Array.from(new Set(jobPostingsData.map((job) => job.company.replace('(주)', '').trim())))
  }, [apiCompanies])

  // 직군별 통계의 직무 목록
  const jobRoles = [
    '모든 직무',
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
    'Biz. Supporting'
  ]

  const employmentTypes = ['고용형태', '정규직', '계약직', '인턴', '프리랜서', '파트타임']

  // 필터링된 회사 목록 (검색어 기반)
  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery) return companies
    const query = companySearchQuery.toLowerCase()
    return companies.filter(company => 
      company.toLowerCase().includes(query)
    )
  }, [companySearchQuery, companies])

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

  // 페이지당 5개씩 표시
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredJobPostings.length / itemsPerPage)
  const displayedJobs = filteredJobPostings.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  // 회사 선택/해제 핸들러
  const handleCompanyToggle = (company: string) => {
    setSelectedCompanies(prev => {
      if (prev.includes(company)) {
        return prev.filter(c => c !== company)
      } else {
        return [...prev, company]
      }
    })
    setCurrentPage(0)
  }

  // 모든 회사 선택/해제
  const handleSelectAllCompanies = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([])
    } else {
      setSelectedCompanies([...companies])
    }
    setCurrentPage(0)
  }

  // 회사 제거 핸들러
  const handleRemoveCompany = (company: string) => {
    setSelectedCompanies(prev => prev.filter(c => c !== company))
    setCurrentPage(0)
  }

  const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmploymentType(e.target.value === '고용형태' ? 'all' : e.target.value)
    setCurrentPage(0)
  }

  const handleSortChange = (sortType: 'latest' | 'company' | 'deadline') => {
    setSortBy(sortType)
    setCurrentPage(0)
  }

  // 섹션별 AI 분석 글 생성 함수 (dropdown 방식)
  const generateSectionAnalysis = async (section: string) => {
    // 이미 열려있으면 닫기, 닫혀있으면 열기
    const isCurrentlyOpen = openAnalysisSections[section]
    setOpenAnalysisSections(prev => ({ ...prev, [section]: !isCurrentlyOpen }))
    
    // 이미 생성된 내용이 있으면 다시 생성하지 않음
    if (sectionAnalysisContent[section]) {
      return
    }
    
    setIsGeneratingAnalysis(prev => ({ ...prev, [section]: true }))
    
    // 시뮬레이션: 실제로는 API 호출
    setTimeout(() => {
      let analysisContent = ''
      
      switch (section) {
        case 'jobMatching':
          analysisContent = `## 경쟁사 공고 자동 매칭 분석

현재 필터링된 공고는 총 **${filteredJobPostings.length}개**입니다.

**주요 인사이트:**
- ${selectedCompanies.length > 0 ? `선택된 회사: ${selectedCompanies.join(', ')}` : '전체 회사 대상'}
- ${selectedEmploymentType !== 'all' ? `고용형태: ${selectedEmploymentType}` : '모든 고용형태'}
- 정렬 기준: ${sortBy === 'latest' ? '최신순' : sortBy === 'company' ? '회사명순' : '마감순'}

**추천 사항:**
1. 관심 있는 회사의 공고를 우선적으로 확인하세요.
2. 마감일이 임박한 공고부터 지원을 고려해보세요.
3. 매칭된 직무 정보를 참고하여 지원 전략을 수립하세요.`
          break
          
        case 'news':
          analysisContent = `## 채용 관련 뉴스 분석

현재 표시된 뉴스는 최신 채용 트렌드와 시장 동향을 반영합니다.

**주요 트렌드:**
- IT 업계의 지속적인 성장으로 인한 인력 수요 증가
- 원격 근무와 하이브리드 근무 형태의 확산
- 신입 개발자 채용 시 실무 경험 중시 경향

**시사점:**
1. 기술 스택의 다양화로 인해 다양한 기술을 학습하는 것이 중요합니다.
2. 포트폴리오와 프로젝트 경험이 채용에 큰 영향을 미칩니다.
3. 지속적인 학습과 기술 업데이트가 필수적입니다.`
          break
          
        case 'trend':
          const trendPeriod = timeframe === 'Daily' ? '일간' : timeframe === 'Weekly' ? '주간' : '월간'
          analysisContent = `## 트렌드 비교 분석 (${trendPeriod})

**회사별 트렌드:**
- 대형 IT 기업들의 지속적인 채용 확대
- 스타트업의 성장세에 따른 인력 충원
- 금융권의 디지털 전환으로 인한 IT 인력 수요 증가

**직업별 트렌드:**
- 백엔드 개발자와 프론트엔드 개발자 수요가 가장 높음
- 클라우드 엔지니어와 DevOps 인력에 대한 관심 증가
- AI/ML 엔지니어의 수요가 지속적으로 증가 중

**기술별 트렌드:**
- React, Spring, Python 등이 가장 많이 요구됨
- 클라우드 기술(AWS, Azure)에 대한 수요 증가
- 마이크로서비스 아키텍처 관련 기술 선호도 상승`
          break
          
        case 'jobStats':
          const categoryName = selectedExpertCategory === 'Tech' ? 'Tech 전문가' : selectedExpertCategory === 'Biz' ? 'Biz 전문가' : 'Biz.Supporting 전문가'
          const selectedRole = selectedJobRole || '전체'
          analysisContent = `## 직군별 통계 분석

**현재 선택 카테고리:** ${categoryName}
**선택된 직무:** ${selectedRole}

**주요 통계:**
- ${selectedExpertCategory === 'Tech' ? 'Tech 전문가 분야에서 Software Development가 가장 많은 비중을 차지합니다.' : selectedExpertCategory === 'Biz' ? 'Biz 전문가 분야에서 Sales와 Consulting이 주요 직무입니다.' : 'Biz.Supporting 분야에서 다양한 지원 직무가 분포되어 있습니다.'}

**인사이트:**
1. 각 직무별로 요구되는 기술 스택과 경력 수준이 다릅니다.
2. Industry별 분포를 확인하여 관심 있는 산업 분야를 파악하세요.
3. 직무별 상세 통계를 통해 지원 전략을 수립할 수 있습니다.`
          break
          
        case 'skillStats':
          const topSkills = skillsData.slice(0, 5).map(s => s.name).join(', ')
          const selectedSkillInfo = selectedSkill ? skillsData.find(s => s.name === selectedSkill) : null
          analysisContent = `## 스킬별 통계 분석

**상위 인기 스킬:** ${topSkills}

${selectedSkillInfo ? `**선택된 스킬: ${selectedSkillInfo.name}**
- 총 공고 수: ${selectedSkillInfo.count}건
- 비율: ${selectedSkillInfo.percentage}%
- 전월 대비 변화: ${selectedSkillInfo.change > 0 ? '+' : ''}${selectedSkillInfo.change}%
- 관련 스킬: ${selectedSkillInfo.relatedSkills.join(', ')}` : ''}

**시장 동향:**
- ${skillsData[0].name}이 가장 높은 수요를 보이고 있습니다.
- 프론트엔드와 백엔드 기술 스택이 균형있게 요구되고 있습니다.
- 클라우드 및 DevOps 관련 스킬의 중요성이 증가하고 있습니다.

**학습 권장사항:**
1. 상위 인기 스킬들을 우선적으로 학습하세요.
2. 관련 스킬들을 함께 학습하면 시너지 효과가 있습니다.
3. 지속적인 트렌드 모니터링으로 시장 변화에 대응하세요.`
          break
          
        default:
          analysisContent = '분석 내용을 생성하는 중입니다...'
      }
      
      setIsGeneratingAnalysis(prev => ({ ...prev, [section]: false }))
      setSectionAnalysisContent(prev => ({ ...prev, [section]: analysisContent }))
    }, 1500)
  }
  
  // AI 분석 dropdown 컴포넌트
  const AnalysisDropdown = ({ section, title }: { section: string, title: string }) => {
    const isOpen = openAnalysisSections[section] || false
    const content = sectionAnalysisContent[section] || ''
    const isGenerating = isGeneratingAnalysis[section] || false
    
    if (!isOpen) return null
    
    return (
      <div className="mt-4 mb-4 border-t border-gray-200 pt-4 pb-2">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">AI 분석을 생성하는 중...</p>
              </div>
            </div>
          ) : content ? (
            <div className="space-y-3">
              <div className="flex items-center justify-end mb-2">
                <button
                  onClick={() => {
                    const element = document.createElement('a')
                    const blob = new Blob([content], { type: 'text/plain' })
                    element.href = URL.createObjectURL(blob)
                    element.download = `AI_분석_${section}_${new Date().toISOString().split('T')[0]}.txt`
                    element.click()
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-xs font-medium border border-gray-200"
                >
                  텍스트로 저장
                </button>
              </div>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                {content.split('\n').map((line, index) => {
                  if (line.startsWith('##')) {
                    return <h4 key={index} className="text-base font-bold text-gray-900 mt-4 mb-2">{line.replace('##', '').trim()}</h4>
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={index} className="font-semibold text-gray-900 mb-1.5">{line.replace(/\*\*/g, '')}</p>
                  } else if (line.startsWith('-')) {
                    return <li key={index} className="ml-4 mb-1">{line.replace('-', '').trim()}</li>
                  } else if (line.match(/^\d+\./)) {
                    return <p key={index} className="ml-4 mb-1.5">{line}</p>
                  } else if (line.trim() === '') {
                    return <br key={index} />
                  } else {
                    return <p key={index} className="mb-1.5">{line}</p>
                  }
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  // 공고 클릭 핸들러 - 드롭다운 토글 및 매칭 실행
  const handleJobClick = (job: any) => {
    const isExpanded = expandedJobId === job.id
    
    if (isExpanded) {
      // 닫기
      setExpandedJobId(null)
    } else {
      // 열기
      setExpandedJobId(job.id)
      
      // 이미 매칭 결과가 있으면 재사용, 없으면 새로 생성
      if (!matchedJobsMap[job.id]) {
        const techStack = job.meta_data?.tech_stack || []
        const description = job.description?.toLowerCase() || ''
        
        // 기술 스택과 설명을 기반으로 매칭된 직무 생성
        const matched: Array<{
          title: string
          description: string
          keywords: string[]
          similarity: number
        }> = []
        
        // Kotlin/Spring Boot 관련 매칭
        if (techStack.some((tech: string) => tech.toLowerCase().includes('kotlin') || tech.toLowerCase().includes('spring'))) {
          matched.push({
            title: '핀테크 백엔드 개발자',
            description: '금융 시스템 개발 경험과 Kotlin/Spring Boot 기술 스택이 정확히 일치합니다.',
            keywords: ['Kotlin', 'Spring Boot', '금융 시스템', '안정성'],
            similarity: 93,
          })
        }
        
        // Kubernetes/인프라 관련 매칭
        if (techStack.some((tech: string) => tech.toLowerCase().includes('kubernetes') || tech.toLowerCase().includes('docker'))) {
          matched.push({
            title: '백엔드 플랫폼 엔지니어',
            description: 'Kubernetes 기반의 컨테이너 오케스트레이션 및 확장 가능한 시스템 개발 경험이 유사합니다.',
            keywords: ['Kotlin', 'PostgreSQL', 'Kubernetes', '확장성'],
            similarity: 87,
          })
        }
        
        // Redis/캐싱 관련 매칭
        if (techStack.some((tech: string) => tech.toLowerCase().includes('redis') || tech.toLowerCase().includes('cache'))) {
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

        setMatchedJobsMap(prev => ({ ...prev, [job.id]: matched }))
      }
    }
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }


  // 트렌드 데이터 구조
  const trendDataByCategory = {
    Company: {
      Daily: [
        { name: 'SK AX', value: 45 },
        { name: '삼성전자', value: 38 },
        { name: 'LG CNS', value: 32 },
        { name: '네이버', value: 28 },
        { name: '카카오', value: 25 },
      ],
      Weekly: [
        { name: 'SK AX', value: 320 },
        { name: '삼성전자', value: 280 },
        { name: 'LG CNS', value: 240 },
        { name: '네이버', value: 210 },
        { name: '카카오', value: 190 },
      ],
      Monthly: [
        { name: 'SK AX', value: 1350 },
        { name: '삼성전자', value: 1200 },
        { name: 'LG CNS', value: 1050 },
        { name: '네이버', value: 950 },
        { name: '카카오', value: 850 },
      ],
    },
    Job: {
      Daily: [
        { name: 'Software Development', value: 42 },
        { name: 'Factory AX Engineering', value: 28 },
        { name: 'Solution Development', value: 35 },
        { name: 'Cloud/Infra Engineering', value: 22 },
        { name: 'Architect', value: 18 },
        { name: 'Project Management', value: 15 },
        { name: 'Quality Management', value: 12 },
        { name: 'AI', value: 30 },
        { name: '정보보호', value: 10 },
        { name: 'Sales', value: 38 },
        { name: 'Domain Expert', value: 25 },
        { name: 'Consulting', value: 32 },
        { name: 'Biz. Supporting', value: 20 },
      ],
      Weekly: [
        { name: 'Software Development', value: 290 },
        { name: 'Factory AX Engineering', value: 195 },
        { name: 'Solution Development', value: 245 },
        { name: 'Cloud/Infra Engineering', value: 155 },
        { name: 'Architect', value: 125 },
        { name: 'Project Management', value: 105 },
        { name: 'Quality Management', value: 85 },
        { name: 'AI', value: 210 },
        { name: '정보보호', value: 70 },
        { name: 'Sales', value: 265 },
        { name: 'Domain Expert', value: 175 },
        { name: 'Consulting', value: 225 },
        { name: 'Biz. Supporting', value: 140 },
      ],
      Monthly: [
        { name: 'Software Development', value: 1250 },
        { name: 'Factory AX Engineering', value: 840 },
        { name: 'Solution Development', value: 1050 },
        { name: 'Cloud/Infra Engineering', value: 670 },
        { name: 'Architect', value: 540 },
        { name: 'Project Management', value: 450 },
        { name: 'Quality Management', value: 365 },
        { name: 'AI', value: 900 },
        { name: '정보보호', value: 300 },
        { name: 'Sales', value: 1140 },
        { name: 'Domain Expert', value: 750 },
        { name: 'Consulting', value: 970 },
        { name: 'Biz. Supporting', value: 600 },
      ],
    },
    Tech: {
      Daily: [
        { name: 'Spring', value: 55 },
        { name: 'React', value: 48 },
        { name: 'Python', value: 42 },
        { name: 'AWS', value: 38 },
        { name: 'Docker', value: 32 },
      ],
      Weekly: [
        { name: 'Spring', value: 385 },
        { name: 'React', value: 336 },
        { name: 'Python', value: 294 },
        { name: 'AWS', value: 266 },
        { name: 'Docker', value: 224 },
      ],
      Monthly: [
        { name: 'Spring', value: 1650 },
        { name: 'React', value: 1440 },
        { name: 'Python', value: 1260 },
        { name: 'AWS', value: 1140 },
        { name: 'Docker', value: 960 },
      ],
    },
  }

  // 현재 선택된 기간의 트렌드 데이터 (모든 카테고리)
  const currentTimeframe = timeframe as keyof typeof trendDataByCategory.Company
  const companyTrendData = trendDataByCategory.Company[currentTimeframe]
  const jobTrendData = trendDataByCategory.Job[currentTimeframe]
  const techTrendData = trendDataByCategory.Tech[currentTimeframe]

  // 직군별 통계 데이터 구조
  const jobRoleData = {
    Tech: [
      { name: 'Software Development', value: 35, industries: ['Front-end Development', 'Back-end Development', 'Mobile Development'] },
      { name: 'Factory AX Engineering', value: 18, industries: ['Simulation', '기구설계', '전장/제어'] },
      { name: 'Solution Development', value: 22, industries: ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution'] },
      { name: 'Cloud/Infra Engineering', value: 15, industries: ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering'] },
      { name: 'Architect', value: 12, industries: ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect'] },
      { name: 'Project Management', value: 10, industries: ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM'] },
      { name: 'Quality Management', value: 8, industries: ['PMO', 'Quality Engineering', 'Offshoring Service Professional'] },
      { name: 'AI', value: 20, industries: ['AI/Data Development', 'Generative AI Development', 'Physical AI Development'] },
      { name: '정보보호', value: 6, industries: ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service'] },
    ],
    Biz: [
      { name: 'Sales', value: 40, industries: ['[금융] 제1금융', '[금융] 제2금융', '[공공/Global] 공공', '[공공/Global] Global', '[제조] 대외', '[제조] 대내 Hi-Tech', '[제조] 대내 Process', '[B2C] 통신', '[B2C] 유통/물류/서비스', '[B2C] 미디어/콘텐츠'] },
      { name: 'Domain Expert', value: 25, industries: ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인'] },
      { name: 'Consulting', value: 35, industries: ['ESG', 'SHE', 'CRM', 'SCM', 'ERP', 'AI'] },
    ],
    BizSupporting: [
      { name: 'Biz. Supporting', value: 100, industries: ['Strategy Planning', 'New Biz. Development', 'Financial Management', 'Human Resource Management', 'Stakeholder Management', 'Governance & Public Management'] },
    ],
  }

  // 현재 선택된 전문가 카테고리의 직무 데이터
  const currentJobRoles = jobRoleData[selectedExpertCategory]
  
  // 원그래프 색상 팔레트
  const pieColors = ['#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6', '#374151', '#1F2937', '#111827']

  // Industry별 샘플 데이터 (고정값)
  const industrySampleData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {}
    Object.keys(jobRoleData).forEach(category => {
      data[category] = {}
      jobRoleData[category as keyof typeof jobRoleData].forEach(role => {
        role.industries.forEach(industry => {
          // 고정된 랜덤 시드 사용
          const seed = `${category}-${role.name}-${industry}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          data[category][`${role.name}-${industry}`] = (seed % 50) + 10
        })
      })
    })
    return data
  }, [])


  const newsItems = [
    {
      source: '이데일리 - 2025.09.25 - 네이버뉴스',
      headline:
        'LG CNS 신학협력 신입사원 채 투트랙으로 AX 인재 확보 박자',
      snippet:
        'LG CNS가 클라우드, 스마트팩토리, ERP, 아키텍처 등 다양한 분야의 신입사원을 모집하고 있으며, 5월부터 활동을 시작했습니다.',
      image: '🏢',
    },
    {
      source: 'EBN - 1주 전',
      headline: '삼성, 하반기 공채 GSAT 실시 5년간 6만명 채용 통해 미래 대...',
      snippet:
        'GSAT(Global Samsung Aptitude Test)가 26일 실시되어 종합적 사고력과 문제 해결 능력을 평가하여 미래 인재를 선발합니다.',
      image: '👨‍💼',
    },
    {
      source: '조선비즈 - 2025.09.24',
      headline: '네이버, AI 인재 대규모 채용... 생성형 AI 분야 집중 투자',
      snippet:
        '네이버가 생성형 AI 분야의 핵심 인재를 대규모로 채용하며, AI 기술 경쟁력을 강화하고 있습니다.',
      image: '🤖',
    },
    {
      source: '매일경제 - 2025.09.23',
      headline: '카카오, 클라우드 엔지니어 200명 긴급 채용 발표',
      snippet:
        '카카오가 클라우드 인프라 확장을 위해 엔지니어를 대규모로 채용하며, 서비스 안정성 강화에 나섭니다.',
      image: '☁️',
    },
    {
      source: '한국경제 - 2025.09.22',
      headline: 'SK하이닉스, 반도체 설계 인재 확보 박차... 연봉 상향 조정',
      snippet:
        'SK하이닉스가 반도체 설계 분야의 우수 인재를 확보하기 위해 채용 조건을 개선하고 있습니다.',
      image: '💻',
    },
    {
      source: '아시아경제 - 2025.09.21',
      headline: '현대자동차, 소프트웨어 개발자 500명 채용 계획 발표',
      snippet:
        '현대자동차가 전기차 및 자율주행 기술 개발을 위해 소프트웨어 개발자를 대규모로 채용합니다.',
      image: '🚗',
    },
  ]

  // 스킬셋 데이터 (인기순으로 정렬, count는 공고 수) - 더 다양하게 추가
  const skillsData = [
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
  ].sort((a, b) => b.count - a.count) // 인기순 정렬

  // Tailwind 클래스를 픽셀 값으로 변환
  const getPixelWidth = (widthClass: string): number => {
    const widthMap: Record<string, number> = {
      'w-36': 144,
      'w-32': 128,
      'w-28': 112,
      'w-24': 96,
      'w-20': 80,
      'w-18': 72,
    }
    return widthMap[widthClass] || 72
  }

  const getPixelHeight = (heightClass: string): number => {
    const heightMap: Record<string, number> = {
      'h-16': 64,
      'h-14': 56,
      'h-12': 48,
      'h-10': 40,
      'h-9': 36,
      'h-8': 32,
    }
    return heightMap[heightClass] || 32
  }

  // 스킬 크기 계산 (count 값에 비례하여 크기 조정)
  const getSkillSize = (count: number, index: number, maxCount: number) => {
    // count에 비례한 크기 계산 (0.3 ~ 1.0 범위)
    const sizeRatio = 0.3 + (count / maxCount) * 0.7
    
    // 크기 단계별로 분류하되, count에 비례하여 조정
    if (index === 0) {
      // 가장 인기 있는 스킬 (최대 크기)
      return { 
        width: 'w-32', 
        height: 'h-14', 
        text: 'text-base', 
        padding: 'px-8 py-3', 
        radius: 70,
        pixelWidth: 128,
        pixelHeight: 56
      }
    }
    
    // count에 따라 크기 결정
    if (count >= maxCount * 0.8) {
      return { width: 'w-28', height: 'h-12', text: 'text-sm', padding: 'px-7 py-3', radius: 60, pixelWidth: 112, pixelHeight: 48 }
    } else if (count >= maxCount * 0.6) {
      return { width: 'w-24', height: 'h-10', text: 'text-sm', padding: 'px-6 py-2', radius: 52, pixelWidth: 96, pixelHeight: 40 }
    } else if (count >= maxCount * 0.4) {
      return { width: 'w-20', height: 'h-9', text: 'text-xs', padding: 'px-5 py-2', radius: 44, pixelWidth: 80, pixelHeight: 36 }
    } else if (count >= maxCount * 0.25) {
      return { width: 'w-18', height: 'h-8', text: 'text-xs', padding: 'px-4 py-1.5', radius: 38, pixelWidth: 72, pixelHeight: 32 }
    } else {
      return { width: 'w-16', height: 'h-7', text: 'text-xs', padding: 'px-3 py-1', radius: 32, pixelWidth: 64, pixelHeight: 28 }
    }
  }

  // 사각형 영역 기반 겹침 체크
  const checkRectOverlap = (
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number,
    padding: number = 10
  ): boolean => {
    // 각 사각형의 경계 (중심 기준)
    const left1 = x1 - w1 / 2 - padding
    const right1 = x1 + w1 / 2 + padding
    const top1 = y1 - h1 / 2 - padding
    const bottom1 = y1 + h1 / 2 + padding

    const left2 = x2 - w2 / 2 - padding
    const right2 = x2 + w2 / 2 + padding
    const top2 = y2 - h2 / 2 - padding
    const bottom2 = y2 + h2 / 2 + padding

    // 겹침 체크
    return !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2)
  }

  // 겹침 방지를 위한 정확한 위치 계산
  const calculateSkillPositions = () => {
    const positions: Array<{ x: number; y: number }> = []
    const sizes: Array<{ pixelWidth: number; pixelHeight: number }> = []
    const maxCount = skillsData[0]?.count || 1
    
    // 모든 스킬의 크기 계산
    for (let i = 0; i < skillsData.length; i++) {
      const size = getSkillSize(skillsData[i].count, i, maxCount)
      sizes.push({ pixelWidth: size.pixelWidth, pixelHeight: size.pixelHeight })
    }
    
    // 중앙 스킬 (index 0)
    positions[0] = { x: 0, y: 0 }
    
    // 레이어별 기본 설정 (4단계로 확장)
    const layers = [
      { baseRadius: 160, count: 5 },
      { baseRadius: 250, count: 6 },
      { baseRadius: 340, count: 7 },
      { baseRadius: 420, count: 8 },
    ]
    
    // 각 스킬의 위치 계산
    for (let index = 1; index < skillsData.length; index++) {
      let currentIndex = index - 1
      let layerIndex = 0
      let layerStartIndex = 0
      
      // 현재 스킬이 어느 레이어에 속하는지 찾기
      for (let i = 0; i < layers.length; i++) {
        if (currentIndex < layerStartIndex + layers[i].count) {
          layerIndex = i
          break
        }
        layerStartIndex += layers[i].count
      }
      
      const layer = layers[layerIndex]
      const positionInLayer = currentIndex - layerStartIndex
      const angleStep = (360 / layer.count) * (Math.PI / 180)
      let baseAngle = positionInLayer * angleStep
      
      const currentSize = sizes[index]
      let radius = layer.baseRadius
      let attempts = 0
      const maxAttempts = 100 // 시도 횟수 증가
      let foundPosition = false
      
      // 겹침 방지: 이전 스킬들과 충분한 거리 확보
      while (attempts < maxAttempts && !foundPosition) {
        // 각도와 반지름을 다양하게 시도
        const angleVariation = (attempts % 10) * 0.1
        const radiusVariation = Math.floor(attempts / 10) * 5
        const testAngle = baseAngle + angleVariation * angleStep
        const testRadius = radius + radiusVariation
        
        const x = Math.cos(testAngle) * testRadius
        const y = Math.sin(testAngle) * testRadius
        
        // 이전 스킬들과의 겹침 체크
        let hasOverlap = false
        for (let i = 0; i < index; i++) {
          const prevPos = positions[i]
          const prevSize = sizes[i]
          
          // 사각형 영역 기반 겹침 체크 (여유 공간 증가)
          if (checkRectOverlap(
            x, y, currentSize.pixelWidth, currentSize.pixelHeight,
            prevPos.x, prevPos.y, prevSize.pixelWidth, prevSize.pixelHeight,
            35 // 여유 공간 증가 (15 → 25)
          )) {
            hasOverlap = true
            break
          }
        }
        
        if (!hasOverlap) {
          // 컨테이너 경계 확인 (더 넓은 공간 활용, 좌우로 더 넓게)
          const maxRadius = 320
          const maxX = 350 - currentSize.pixelWidth / 2  // 좌우로 더 넓게
          const maxY = 280 - currentSize.pixelHeight / 2
          
          if (Math.abs(x) <= maxX && Math.abs(y) <= maxY && testRadius <= maxRadius) {
            positions[index] = { x: Math.round(x), y: Math.round(y) }
            foundPosition = true
            break
          }
        }
        
        attempts++
      }
      
      // 최대 시도 횟수 초과 시 강제 배치 (경계 내에만, 겹침 최소화)
      if (!foundPosition) {
        // 가능한 위치를 찾기 위해 더 넓은 범위 탐색
        let bestPosition: { x: number; y: number } | null = null
        let minOverlaps = Infinity
        
        for (let testRadius = layer.baseRadius; testRadius <= 400; testRadius += 10) {
          for (let testAngle = 0; testAngle < Math.PI * 2; testAngle += Math.PI / 12) {
            const testX = Math.cos(testAngle) * testRadius
            const testY = Math.sin(testAngle) * testRadius
            
            const maxX = 500 - currentSize.pixelWidth / 2  // 좌우로 더 넓게
            const maxY = 350 - currentSize.pixelHeight / 2
            
            if (Math.abs(testX) <= maxX && Math.abs(testY) <= maxY) {
              // 겹침 개수 계산
              let overlapCount = 0
              for (let i = 0; i < index; i++) {
                const prevPos = positions[i]
                const prevSize = sizes[i]
                if (checkRectOverlap(
                  testX, testY, currentSize.pixelWidth, currentSize.pixelHeight,
                  prevPos.x, prevPos.y, prevSize.pixelWidth, prevSize.pixelHeight,
                  25  // 여유 공간 증가 (10 → 25)
                )) {
                  overlapCount++
                }
              }
              
              if (overlapCount < minOverlaps) {
                minOverlaps = overlapCount
                bestPosition = { x: Math.round(testX), y: Math.round(testY) }
              }
            }
          }
        }
        
        positions[index] = bestPosition || { x: 0, y: 0 }
      }
    }
    
    return positions
  }

  // 모든 위치를 한 번에 계산
  const skillPositions = calculateSkillPositions()

  // 사각형 겹침 체크 함수
  const checkRectOverlapFinal = (
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number,
    padding: number = 0
  ): boolean => {
    const left1 = x1 - w1 / 2 - padding
    const right1 = x1 + w1 / 2 + padding
    const top1 = y1 - h1 / 2 - padding
    const bottom1 = y1 + h1 / 2 + padding
    
    const left2 = x2 - w2 / 2 - padding
    const right2 = x2 + w2 / 2 + padding
    const top2 = y2 - h2 / 2 - padding
    const bottom2 = y2 + h2 / 2 + padding
    
    return !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2)
  }

  // 스킬들의 실제 렌더링 위치 계산 (2개 원형 배치 - 겹침 없음 보장)
  const finalSkillPositions = useMemo(() => {
    const maxCount = skillsData[0]?.count || 1
    const skillCount = Math.min(13, skillsData.length)  // 13개 (중앙 1 + 내부원 6 + 외부원 6)
    
    const skills: Array<{
      x: number, 
      y: number, 
      size: {pixelWidth: number, pixelHeight: number}
    }> = []
    
    for (let index = 0; index < skillCount; index++) {
      const size = getSkillSize(skillsData[index].count, index, maxCount)
      
      if (index === 0) {
        // 중앙
        skills.push({ x: 0, y: 0, size })
      } else if (index <= 6) {
        // 내부 원 (6개)
        const angle = ((index - 1) / 6) * Math.PI * 2 - Math.PI / 2
        const radius = 120
        skills.push({ 
          x: Math.cos(angle) * radius, 
          y: Math.sin(angle) * radius, 
          size 
        })
      } else {
        // 외부 원 (6개)
        const angle = ((index - 7) / 6) * Math.PI * 2 - Math.PI / 2 + Math.PI / 6
        const radius = 200
        skills.push({ 
          x: Math.cos(angle) * radius, 
          y: Math.sin(angle) * radius, 
          size 
        })
      }
    }
    
    return skills
  }, [])

  // 개별 스킬 위치 가져오기
  const getSkillPosition = (index: number) => {
    return skillPositions[index] || { x: 0, y: 0 }
  }
  
  // 최종 조정된 스킬 위치 가져오기
  const getFinalSkillPosition = (index: number) => {
    const pos = finalSkillPositions[index]
    return pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 }
  }

  // 선택된 스킬의 데이터
  const selectedSkillData = skillsData.find(s => s.name === selectedSkill) || skillsData[0]

  // 월별 채용 공고 수 추이 데이터
  const monthlyJobPostingsData = [
    { month: '2025-01', count: 1200 },
    { month: '2025-02', count: 1800 },
    { month: '2025-03', count: 1500 },
    { month: '2025-04', count: 2200 },
    { month: '2025-05', count: 2800 },
    { month: '2025-06', count: 2400 },
    { month: '2025-07', count: 3200 },
    { month: '2025-08', count: 3800 },
    { month: '2025-09', count: 4200 },
    { month: '2025-10', count: 5800 },
    { month: '2025-11', count: 5200 },
  ]

  // 주요 회사별 채용 활동 데이터 (8개 경쟁사 - saramin 제외)
  const companyRecruitmentData = [
    { month: '2025-01', toss: 120, line: 80, hanwha: 100, kakao: 150, naver: 180, samsung: 140, lg: 90, sk: 110 },
    { month: '2025-02', toss: 180, line: 120, hanwha: 150, kakao: 200, naver: 240, samsung: 190, lg: 130, sk: 160 },
    { month: '2025-03', toss: 150, line: 100, hanwha: 130, kakao: 180, naver: 220, samsung: 170, lg: 110, sk: 140 },
    { month: '2025-04', toss: 220, line: 160, hanwha: 190, kakao: 260, naver: 300, samsung: 240, lg: 180, sk: 200 },
    { month: '2025-05', toss: 280, line: 220, hanwha: 250, kakao: 320, naver: 380, samsung: 300, lg: 240, sk: 260 },
    { month: '2025-06', toss: 240, line: 200, hanwha: 220, kakao: 280, naver: 340, samsung: 260, lg: 200, sk: 230 },
    { month: '2025-07', toss: 320, line: 260, hanwha: 290, kakao: 360, naver: 420, samsung: 340, lg: 280, sk: 300 },
    { month: '2025-08', toss: 380, line: 320, hanwha: 350, kakao: 420, naver: 480, samsung: 400, lg: 340, sk: 360 },
    { month: '2025-09', toss: 450, line: 380, hanwha: 400, kakao: 480, naver: 560, samsung: 450, lg: 390, sk: 410 },
    { month: '2025-10', toss: 680, line: 520, hanwha: 580, kakao: 720, naver: 850, samsung: 680, lg: 600, sk: 640 },
    { month: '2025-11', toss: 620, line: 480, hanwha: 540, kakao: 680, naver: 800, samsung: 620, lg: 550, sk: 580 },
  ]

  const companyColors = {
    saramin: '#3b82f6', // blue
    toss: '#f97316', // orange
    line: '#10b981', // green
    hanwha: '#ef4444', // red
    kakao: '#8b5cf6', // purple
    naver: '#06b6d4', // cyan
    samsung: '#6366f1', // indigo
    lg: '#ec4899', // pink
    sk: '#14b8a6', // teal
  }

  // 회사별 스킬 다양성 데이터
  const companySkillDiversityData = [
    { company: '토스', skills: 415 },
    { company: '라인', skills: 285 },
    { company: '한화', skills: 125 },
    { company: '카카오', skills: 90 },
    { company: '네이버', skills: 75 },
  ]

  // 회사별 상위 스킬 분기별 트렌드 데이터
  const companySkillTrendData: Record<string, Array<{ month: string; python: number; sql: number; java: number; kubernetes: number; docker: number; react: number; typescript: number; aws: number; spring: number; nodejs: number }>> = {
    '토스': [
      { month: '2025.09', python: 2, sql: 3, java: 2, kubernetes: 0, docker: 1, react: 1, typescript: 1, aws: 0, spring: 1, nodejs: 1 },
      { month: '2025.10', python: 87, sql: 65, java: 60, kubernetes: 54, docker: 44, react: 38, typescript: 35, aws: 32, spring: 28, nodejs: 25 },
    ],
    '라인': [
      { month: '2025.09', python: 1, sql: 2, java: 2, kubernetes: 0, docker: 1, react: 1, typescript: 1, aws: 0, spring: 1, nodejs: 1 },
      { month: '2025.10', python: 75, sql: 55, java: 50, kubernetes: 45, docker: 38, react: 32, typescript: 30, aws: 28, spring: 25, nodejs: 22 },
    ],
    '한화': [
      { month: '2025.09', python: 1, sql: 2, java: 2, kubernetes: 0, docker: 1, react: 1, typescript: 1, aws: 0, spring: 1, nodejs: 1 },
      { month: '2025.10', python: 65, sql: 48, java: 45, kubernetes: 38, docker: 32, react: 28, typescript: 25, aws: 22, spring: 20, nodejs: 18 },
    ],
    '카카오': [
      { month: '2025.09', python: 1, sql: 2, java: 2, kubernetes: 0, docker: 1, react: 1, typescript: 1, aws: 0, spring: 1, nodejs: 1 },
      { month: '2025.10', python: 70, sql: 52, java: 48, kubernetes: 42, docker: 35, react: 30, typescript: 28, aws: 25, spring: 22, nodejs: 20 },
    ],
    '네이버': [
      { month: '2025.09', python: 1, sql: 2, java: 2, kubernetes: 0, docker: 1, react: 1, typescript: 1, aws: 0, spring: 1, nodejs: 1 },
      { month: '2025.10', python: 68, sql: 50, java: 46, kubernetes: 40, docker: 33, react: 29, typescript: 26, aws: 24, spring: 21, nodejs: 19 },
    ],
  }

  const skillColors = {
    python: '#3b82f6', // light blue
    sql: '#f97316', // orange
    java: '#10b981', // green
    kubernetes: '#eab308', // yellow
    docker: '#8b5cf6', // purple
    react: '#06b6d4', // cyan
    typescript: '#6366f1', // indigo
    aws: '#ec4899', // pink
    spring: '#14b8a6', // teal
    nodejs: '#f59e0b', // amber
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* 새로운 공고 알림 토스트 */}
      {hasNewJobs && (
        <NotificationToast newJobs={newJobs} onClose={clearNewJobs} />
      )}

      <div className="px-8 py-6 max-w-[95%] mx-auto">
        {/* 상단 그래프 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 월별 채용 공고 수 추이 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">월별 채용 공고 수 추이</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyJobPostingsData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  domain={[0, 7000]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    color: '#1f2937',
                    fontSize: '13px'
                  }}
                  formatter={(value: number) => [`${value}건`, '공고 수']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          {/* 주요 회사별 채용 활동 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">주요 회사별 채용 활동</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={companyRecruitmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  domain={[0, 1200]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    color: '#1f2937',
                    fontSize: '13px'
                  }}
                  formatter={(value: number, name: string) => [`${value}건`, name]}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="line"
                />
                <Line type="monotone" dataKey="toss" stroke={companyColors.toss} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="line" stroke={companyColors.line} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="hanwha" stroke={companyColors.hanwha} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="kakao" stroke={companyColors.kakao} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="naver" stroke={companyColors.naver} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="samsung" stroke={companyColors.samsung} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="lg" stroke={companyColors.lg} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sk" stroke={companyColors.sk} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* 회사별 스킬 다양성 및 분기별 트렌드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 회사별 스킬 다양성 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">회사별 스킬 다양성</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companySkillDiversityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  domain={[0, 450]}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  dataKey="company" 
                  type="category" 
                  width={80}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    color: '#1f2937',
                    fontSize: '13px'
                  }}
                  formatter={(value: number) => [`${value}개`, '고유 스킬 수']}
                />
                <Bar 
                  dataKey="skills" 
                  fill="#93c5fd"
                  radius={[0, 4, 4, 0]}
                  onClick={(data: any) => {
                    setSelectedCompanyForSkills(data.company)
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* 선택된 회사의 상위 스킬 분기별 트렌드 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedCompanyForSkills ? `${selectedCompanyForSkills} 상위 스킬 분기별 트렌드` : '회사를 선택하세요'}
            </h2>
            {selectedCompanyForSkills && companySkillTrendData[selectedCompanyForSkills] ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companySkillTrendData[selectedCompanyForSkills]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    domain={[0, 90]}
                    label={{ value: '스킬 언급 횟수', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      color: '#1f2937',
                      fontSize: '13px'
                    }}
                    formatter={(value: number, name: string) => [`${value}회`, name]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="square"
                  />
                  <Bar dataKey="python" fill={skillColors.python} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sql" fill={skillColors.sql} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="java" fill={skillColors.java} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kubernetes" fill={skillColors.kubernetes} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="docker" fill={skillColors.docker} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="react" fill={skillColors.react} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="typescript" fill={skillColors.typescript} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aws" fill={skillColors.aws} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spring" fill={skillColors.spring} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nodejs" fill={skillColors.nodejs} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p className="text-sm">왼쪽 그래프에서 회사를 클릭하여 상세 정보를 확인하세요</p>
              </div>
            )}
          </section>
        </div>

        {/* 첫 번째 줄: 스킬별 통계와 직군별 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 스킬별 통계 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                스킬별 통계
              </h2>
              <button
                onClick={() => generateSectionAnalysis('skillStats')}
                disabled={isGeneratingAnalysis['skillStats']}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  openAnalysisSections['skillStats'] 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI 분석
                <svg className={`w-3 h-3 transition-transform ${openAnalysisSections['skillStats'] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <AnalysisDropdown section="skillStats" title="스킬별 통계 분석" />
            <div className="flex flex-col gap-4">
                {/* 스킬 클라우드 - 컴팩트 버전 */}
                <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow relative flex flex-col overflow-visible">
                {/* 배경 장식 */}
                <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden rounded-xl">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-900 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gray-900 rounded-full blur-2xl"></div>
                </div>
                
                {/* 헤더 */}
                <div className="relative mb-2 z-10 flex-shrink-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">스킬 클라우드</h3>
                  <p className="text-xs text-gray-500">스킬을 클릭하면 상세 정보를 확인할 수 있습니다</p>
                </div>
                
                <div 
                  className={`relative w-full flex items-center justify-center overflow-visible transition-all duration-300 ${
                    selectedSkill ? 'bg-gray-50/50' : ''
                  }`}
                  style={{ 
                    height: '500px',
                    maxWidth: '100%',
                    margin: '0 auto',
                    padding: '20px',
                    borderRadius: '0.75rem',
                  }}
                >
                  {/* 배경 오버레이 - 선택된 스킬이 있을 때만 표시 */}
                  {selectedSkill && (
                    <div
                      className="absolute inset-0 z-0"
                      onClick={() => {
                        setSelectedSkill(null)
                        setExpandedRelatedSkills(new Set())
                      }}
                    />
                  )}
                  
                  {/* SVG를 사용한 가지치기 선 그리기 */}
                  {selectedSkill && (() => {
                    const selectedSkillData = skillsData.find(s => s.name === selectedSkill)
                    if (!selectedSkillData) return null
                    
                    const selectedIndex = skillsData.slice(0, 13).findIndex(s => s.name === selectedSkill)
                    if (selectedIndex === -1) return null
                    
                    const selectedPosition = getFinalSkillPosition(selectedIndex)
                    const radius = 130 // 관련 스킬까지의 거리
                    
                    // SVG 좌표 (컨테이너 중심 250, 250 기준)
                    const containerCenterX = 250
                    const containerCenterY = 250
                    const selectedX = containerCenterX + selectedPosition.x
                    const selectedY = containerCenterY + selectedPosition.y
                    
                    return (
                      <svg 
                        className="absolute inset-0 pointer-events-none z-5"
                        style={{ width: '100%', height: '100%' }}
                        viewBox="0 0 500 500"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        {selectedSkillData.relatedSkills.map((relatedSkillName, idx) => {
                          // go나 kotlin 같은 상단 스킬의 경우 가지치기 방향 조정
                          const isTopSkill = selectedSkill === 'go' || selectedSkill === 'kotlin'
                          const baseAngle = (idx / selectedSkillData.relatedSkills.length) * Math.PI * 2 - Math.PI / 2
                          
                          // 상단 스킬의 경우 각도를 아래쪽으로 조정 (위쪽으로 가지치기가 나가지 않도록)
                          const adjustedAngle = isTopSkill && selectedPosition.y < -30
                            ? baseAngle + Math.PI / 4 // 45도 아래로 회전
                            : baseAngle
                          
                          const relatedX = Math.cos(adjustedAngle) * radius
                          const relatedY = Math.sin(adjustedAngle) * radius
                          
                          const lineEndX = selectedX + relatedX
                          const lineEndY = selectedY + relatedY
                          
                          return (
                            <line
                              key={relatedSkillName}
                              x1={selectedX}
                              y1={selectedY}
                              x2={lineEndX}
                              y2={lineEndY}
                              stroke="#9CA3AF"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                              opacity="0.5"
                            />
                          )
                        })}
                      </svg>
                    )
                  })()}
                  
                  {/* 메인 스킬들 */}
                  {skillsData.slice(0, 13).map((skill, index) => {
                    const maxCount = skillsData[0]?.count || 1
                    const size = getSkillSize(skill.count, index, maxCount)
                    const finalPosition = getFinalSkillPosition(index)
                    const isMain = index === 0
                    const isSelected = selectedSkill === skill.name
                    
                    // 선택된 스킬이 있을 때만 blur 처리 로직 적용
                    let shouldBlur = false
                    let shouldHide = false
                    
                    if (selectedSkill) {
                      const selectedSkillData = skillsData.find(s => s.name === selectedSkill)
                      if (selectedSkillData) {
                        // 선택된 스킬의 관련 스킬 목록
                        const relatedSkillsSet = new Set(selectedSkillData.relatedSkills)
                        
                        // 현재 스킬이 선택된 스킬이면 표시
                        if (isSelected) {
                          shouldBlur = false
                          shouldHide = false
                        } 
                        // 현재 스킬이 관련 스킬이면 숨김 (가지치기 형태로만 표시)
                        else if (relatedSkillsSet.has(skill.name)) {
                          shouldBlur = false
                          shouldHide = true
                        }
                        // 관련 스킬이 아니면 blur 처리
                        else {
                          shouldBlur = true
                          shouldHide = false
                        }
                      }
                    }
                    
                    const finalX = finalPosition.x
                    const finalY = finalPosition.y
                    
                    // 관련 스킬은 숨김 (가지치기 형태로만 표시)
                    if (shouldHide) {
                      return null
                    }
                    
                    return (
                      <button
                        key={skill.name}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (selectedSkill === skill.name) {
                            // 같은 스킬을 다시 클릭하면 선택 해제
                            setSelectedSkill(null)
                            setExpandedRelatedSkills(new Set())
                          } else {
                            setSelectedSkill(skill.name)
                            setExpandedRelatedSkills(new Set([skill.name]))
                          }
                        }}
                        className={`absolute ${size.padding} ${size.height} rounded-full flex items-center justify-center ${size.text} font-bold cursor-pointer whitespace-nowrap transition-all duration-300 ${
                          isMain ? 'z-30' : 'z-10'
                        } ${
                          isMain && !shouldBlur
                            ? 'bg-gray-900 text-white shadow-2xl hover:shadow-gray-900/50 hover:scale-110 border-2 border-gray-700/30'
                            : isSelected
                            ? 'bg-gray-600 text-white shadow-xl hover:scale-110 border-2 border-gray-700 z-30'
                            : shouldBlur
                            ? 'bg-white text-gray-700 border-2 border-gray-200 shadow-lg opacity-20 blur-md pointer-events-none'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-400 hover:scale-105 shadow-lg'
                        }`}
                        style={{
                          left: `calc(50% + ${finalX}px)`,
                          top: `calc(50% + ${finalY}px)`,
                          transform: `translate(-50%, -50%)`,
                          transition: 'all 0.3s ease',
                          minWidth: size.width,
                          filter: shouldBlur ? 'blur(6px)' : 'none',
                          pointerEvents: shouldBlur ? 'none' : 'auto',
                        }}
                      >
                        {skill.name}
                      </button>
                    )
                  })}
                  
                  {/* 관련 스킬들을 가지치기 형태로 표시 */}
                  {selectedSkill && (() => {
                    const selectedSkillData = skillsData.find(s => s.name === selectedSkill)
                    if (!selectedSkillData) return null
                    
                    const selectedIndex = skillsData.slice(0, 13).findIndex(s => s.name === selectedSkill)
                    if (selectedIndex === -1) return null
                    
                    const selectedPosition = getFinalSkillPosition(selectedIndex)
                    const radius = 130
                    
                    return selectedSkillData.relatedSkills.map((relatedSkillName, idx) => {
                      // go나 kotlin 같은 상단 스킬의 경우 가지치기 방향 조정
                      const isTopSkill = selectedSkill === 'go' || selectedSkill === 'kotlin'
                      const baseAngle = (idx / selectedSkillData.relatedSkills.length) * Math.PI * 2 - Math.PI / 2
                      
                      // 상단 스킬의 경우 각도를 아래쪽으로 조정 (위쪽으로 가지치기가 나가지 않도록)
                      const adjustedAngle = isTopSkill && selectedPosition.y < -30
                        ? baseAngle + Math.PI / 4 // 45도 아래로 회전
                        : baseAngle
                      
                      const relatedX = Math.cos(adjustedAngle) * radius
                      const relatedY = Math.sin(adjustedAngle) * radius
                      
                      // 관련 스킬이 화면에 보이는 스킬들(skillsData.slice(0, 13))에 있는지 확인
                      const visibleSkills = skillsData.slice(0, 13)
                      const relatedSkillData = visibleSkills.find(s => s.name === relatedSkillName)
                      const isRelatedSkillInData = !!relatedSkillData
                      
                      // 화면에 보이는 스킬의 경우 더 큰 크기로 표시
                      const buttonSize = isRelatedSkillInData 
                        ? 'px-4 py-2 h-8 text-sm' 
                        : 'px-3 py-1.5 h-7 text-xs'
                      
                      return (
                        <button
                          key={relatedSkillName}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isRelatedSkillInData) {
                              setSelectedSkill(relatedSkillName)
                              setExpandedRelatedSkills(prev => new Set([...Array.from(prev), relatedSkillName]))
                            }
                          }}
                          className={`absolute ${buttonSize} rounded-full flex items-center justify-center font-semibold cursor-pointer whitespace-nowrap z-40 transition-all duration-300 ${
                            isRelatedSkillInData
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200 hover:scale-110 shadow-md'
                              : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200 hover:scale-105 shadow-sm'
                          }`}
                          style={{
                            left: `calc(50% + ${selectedPosition.x + relatedX}px)`,
                            top: `calc(50% + ${selectedPosition.y + relatedY}px)`,
                            transform: `translate(-50%, -50%) scale(0)`,
                            opacity: 0,
                            animation: `fadeInScale 0.3s ease forwards`,
                            animationDelay: `${idx * 0.05}s`,
                          }}
                        >
                          {relatedSkillName}
                        </button>
                      )
                    })
                  })()}
                </div>
              </div>
              
              {/* 스킬 상세 정보 */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-4 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow w-full flex flex-col">
                <div className="mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl mb-2 shadow-lg">
                    <span className="text-lg font-bold text-white uppercase">
                      {selectedSkillData.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 capitalize">
                    {selectedSkillData.name}
                  </h3>
                  <p className="text-xs text-gray-500">스킬 상세 정보</p>
                </div>
                
                <div className="space-y-3 flex-1">
                  {/* 통계 카드들 - 가로로 배치 */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        총 공고 수
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedSkillData.count}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">건</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        비율
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedSkillData.percentage}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">%</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                      <p className="text-xs font-medium text-gray-600 mb-1">전월 대비 변화</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-green-700">
                          +{selectedSkillData.change}%
                        </p>
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 관련 스킬 */}
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <p className="text-xs font-semibold text-gray-700">관련 스킬</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedSkillData.relatedSkills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* 직군별 통계 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                직군별 통계
              </h2>
              <button
                onClick={() => generateSectionAnalysis('jobStats')}
                disabled={isGeneratingAnalysis['jobStats']}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  openAnalysisSections['jobStats'] 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI 분석
                <svg className={`w-3 h-3 transition-transform ${openAnalysisSections['jobStats'] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <AnalysisDropdown section="jobStats" title="직군별 통계 분석" />
            
            {/* 전문가 카테고리 탭 */}
            <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setSelectedExpertCategory('Tech')
                setSelectedJobRole(null)
              }}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                selectedExpertCategory === 'Tech'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              Tech 전문가
            </button>
            <button
              onClick={() => {
                setSelectedExpertCategory('Biz')
                setSelectedJobRole(null)
              }}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                selectedExpertCategory === 'Biz'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              Biz 전문가
            </button>
            <button
              onClick={() => {
                setSelectedExpertCategory('BizSupporting')
                setSelectedJobRole(null)
              }}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                selectedExpertCategory === 'BizSupporting'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              Biz.Supporting 전문가
            </button>
          </div>

          <div className="space-y-4">
            {/* 직무 원그래프 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">직무</h3>
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={currentJobRoles}
                    cx="50%"
                    cy="42%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={100}
                    innerRadius={40}
                    fill="#6b7280"
                    dataKey="value"
                    onClick={(data: any) => {
                      setSelectedJobRole(data.name)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {currentJobRoles.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={pieColors[index % pieColors.length]}
                        stroke={selectedJobRole === entry.name ? '#111827' : '#fff'}
                        strokeWidth={selectedJobRole === entry.name ? 3 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      color: '#1f2937',
                      fontSize: '13px'
                    }}
                    formatter={(value: number, name: string) => [
                      `${value}건`,
                      name
                    ]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={80}
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{value}</span>}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Industry 테이블 (직무 선택 시 아래에 표시) */}
            {selectedJobRole && (
              <div className="bg-gradient-to-br from-gray-50 to-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  {selectedJobRole} - Industry
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Industry
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Chart
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        const selectedRole = currentJobRoles.find(role => role.name === selectedJobRole)
                        if (!selectedRole) return null
                        
                        const industryCounts = selectedRole.industries.map(industry => {
                          const key = `${selectedJobRole}-${industry}`
                          return industrySampleData[selectedExpertCategory]?.[key] || 10
                        })
                        const total = industryCounts.reduce((sum, count) => sum + count, 0)
                        
                        return selectedRole.industries.map((industry, index) => {
                          const count = industryCounts[index]
                          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {industry}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {count}건
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {percentage}%
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gray-700 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${percentage}%`
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          </section>
        </div>

        {/* 두 번째 줄: 경쟁사 공고 자동 매칭과 채용 관련 뉴스 */}
        <div className="relative mb-8">
          {/* 경쟁사 공고 자동 매칭 */}
          <div className="flex flex-col pr-80">
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  경쟁사 공고 자동 매칭
                </h2>
                <button
                  onClick={() => generateSectionAnalysis('jobMatching')}
                  disabled={isGeneratingAnalysis['jobMatching']}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    openAnalysisSections['jobMatching'] 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI 분석
                  <svg className={`w-3 h-3 transition-transform ${openAnalysisSections['jobMatching'] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <AnalysisDropdown section="jobMatching" title="경쟁사 공고 자동 매칭 분석" />
          <div className="space-y-2 mb-3">
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
                          {selectedCompanies.length === companies.length ? '전체 해제' : '전체 선택'}
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
                    onChange={() => handleSortChange('latest')}
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
                    onChange={() => handleSortChange('company')}
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
                    onChange={() => handleSortChange('deadline')}
                    className="w-4 h-4 text-sk-red focus:ring-sk-red focus:ring-2 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">마감순</span>
                </label>
              </div>
            </div>

            {/* 두 번째 줄: 선택된 회사 태그 */}
            {selectedCompanies.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center pt-3">
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
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-700 font-medium">
              <span className="text-gray-900 font-bold">{filteredJobPostings.length}개</span>의 공고를 확인할 수 있어요.
            </p>
            {filteredJobPostings.length > itemsPerPage && (
              <Link
                href="/jobs"
                prefetch={false}
                className="px-3 py-1.5 text-gray-700 hover:text-gray-900 text-sm font-semibold transition-colors duration-300 flex items-center gap-1"
              >
                더보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          
          {filteredJobPostings.length > 0 ? (
            <div className="relative flex-1 flex flex-col min-h-0">
              {/* 슬라이드 컨테이너 */}
              <div className="space-y-4 overflow-y-auto flex-1 pb-0">
                {displayedJobs.map((job) => {
                  const isExpanded = expandedJobId === job.id
                  const matchedJobs = matchedJobsMap[job.id] || []
                  
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
                    <div key={job.id} className="space-y-0">
                      <div 
                        onClick={() => handleJobClick(job)}
                        className={`flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all duration-300 cursor-pointer group ${isExpanded ? 'rounded-b-none' : ''}`}
                      >
                        {/* 기업사진 */}
                        <div className="bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0 overflow-hidden" style={{ width: '72px', height: '72px' }}>
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
                            <h4 className="font-bold text-gray-900 text-lg truncate">
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
                        
                        {/* 마감일까지 남은 일수와 드롭다운 화살표 */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`w-24 px-3 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap text-center ${
                            deadline === '마감' || deadline === '오늘 마감'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : deadline === '상시채용'
                              ? 'bg-gray-50 text-gray-700 border-gray-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {deadline}
                          </span>
                          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* 드롭다운 상세 내용 */}
                      {isExpanded && (
                        <div className="mt-0 bg-gradient-to-br from-gray-50 to-white border-x-2 border-b-2 border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
                          <div className="p-5 space-y-4">
                            {/* 공고 상세 정보 */}
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-600 mb-0.5">회사명</p>
                                <p className="text-base font-semibold text-gray-900">{job.company}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-0.5">직무</p>
                                <p className="text-base font-semibold text-gray-900">{job.meta_data?.job_category || '개발'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-0.5">공고 설명</p>
                                <p className="text-gray-700 whitespace-pre-wrap text-xs leading-relaxed">{job.description || '공고 설명이 없습니다.'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1.5">요구 기술</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {job.meta_data?.tech_stack?.map((tech: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* 매칭 결과 섹션 */}
                            {matchedJobs.length > 0 && (
                              <div className="pt-4 border-t border-gray-300">
                                <div className="mb-3 flex items-center gap-2">
                                  <div className="px-4 py-1.5 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 shadow-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-xs font-semibold">매칭 완료</span>
                                  </div>
                                </div>

                                <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                                  <svg
                                    className="w-5 h-5 text-pink-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  매칭된 직무 <span className="text-gray-900">{matchedJobs.length}개</span>
                                </h3>
                                <div className="space-y-3">
                                  {matchedJobs.map((matched, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-md transition-all duration-300"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-bold text-gray-900">{matched.title}</h4>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-semibold border border-green-200 whitespace-nowrap">
                                          {matched.similarity}% 일치
                                        </span>
                                      </div>
                                      <p className="text-gray-700 mb-2 text-xs">{matched.description}</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {matched.keywords.map((keyword, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-300"
                                          >
                                            {keyword}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 좌우 네비게이션 버튼 */}
              {filteredJobPostings.length > itemsPerPage && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      currentPage === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 shadow-sm'
                    }`}
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {currentPage + 1} / {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      currentPage >= totalPages - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 shadow-sm'
                    }`}
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">선택한 조건에 맞는 공고가 없습니다.</p>
            </div>
          )}
            </section>
          </div>

          {/* 채용 관련 뉴스 - 오른쪽 고정 팝업 */}
          <div className="absolute top-0 right-0 w-72 h-full">
            <section className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  채용 뉴스
                </h2>
                <button
                  onClick={() => generateSectionAnalysis('news')}
                  disabled={isGeneratingAnalysis['news']}
                  className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    openAnalysisSections['news'] 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI
                </button>
              </div>
              <AnalysisDropdown section="news" title="채용 관련 뉴스 분석" />
              <div className="space-y-2 mt-3">
                {newsItems.map((news, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-white p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        {news.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1 truncate">{news.source}</p>
                        <h3 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {news.headline}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{news.snippet}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

      </div>

      {/* 빠른 이동 메뉴 - 오른쪽 아래 고정 */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
        {/* 메뉴 패널 (열고 닫기) */}
        {showAdPanels && (
          <div className="flex flex-col gap-2 w-56 animate-in fade-in slide-in-from-bottom-2">
            {/* 공고품질 평가 */}
            <Link
              href="/quality"
              prefetch={false}
              onClick={(e) => {
                setShowAdPanels(false)
                // 즉시 네비게이션을 위해 기본 동작 유지
              }}
              className="w-full bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              <div className="p-4 flex flex-col items-center text-center">
                <p className="text-black font-bold text-base mb-1">공고 품질 평가</p>
                <p className="text-gray-600 text-xs">AI 기반 품질 분석 →</p>
              </div>
            </Link>
            
            {/* 회사별 공고 */}
            <Link
              href="/companies"
              prefetch={false}
              onClick={(e) => {
                setShowAdPanels(false)
                // 즉시 네비게이션을 위해 기본 동작 유지
              }}
              className="w-full bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              <div className="p-4 flex flex-col items-center text-center">
                <p className="text-black font-bold text-base mb-1">회사별 공고</p>
                <p className="text-gray-600 text-xs">경쟁사 분석 보기 →</p>
              </div>
            </Link>
            
            {/* AI 분석 리포트 생성 */}
            <button
              onClick={() => {
                setShowAdPanels(false)
                setShowReportModal(true)
              }}
              className="w-full bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              <div className="p-4 flex flex-col items-center text-center">
                <p className="text-black font-bold text-base mb-1">AI 분석 리포트</p>
                <p className="text-gray-600 text-xs">리포트 생성하기 →</p>
              </div>
            </button>
          </div>
        )}
        
        {/* 토글 버튼 (화살표만) */}
        <button
          onClick={() => setShowAdPanels(!showAdPanels)}
          className={`w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
            showAdPanels ? 'bg-gray-900' : ''
          }`}
        >
          <svg className={`w-6 h-6 transition-transform ${showAdPanels ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* 메뉴 외부 클릭 시 닫기 */}
      {showAdPanels && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowAdPanels(false)}
        />
      )}


      {/* AI 분석 리포트 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto my-8">
            <div id="ai-report-content" className="p-8 space-y-8">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-3xl font-bold text-gray-900">AI 분석 리포트</h2>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const html2canvas = (await import('html2canvas')).default
                        const jsPDF = (await import('jspdf')).default

                        const element = document.getElementById('ai-report-content')
                        if (!element) {
                          alert('리포트 컨텐츠를 찾을 수 없습니다.')
                          return
                        }

                        await new Promise(resolve => setTimeout(resolve, 500))
                        
                        const pdf = new jsPDF('p', 'mm', 'a4')
                        const pdfWidth = 210
                        const pdfHeight = 297
                        const margin = 15
                        const contentWidth = pdfWidth - margin * 2
                        const contentHeight = pdfHeight - margin * 2

                        const canvas = await html2canvas(element, {
                          scale: 2,
                          useCORS: true,
                          allowTaint: false,
                          logging: false,
                          backgroundColor: '#ffffff',
                        })

                        if (!canvas || canvas.width === 0 || canvas.height === 0) {
                          alert('캔버스 생성에 실패했습니다.')
                          return
                        }

                        const imgData = canvas.toDataURL('image/png', 1.0)
                        const imgWidth = canvas.width
                        const imgHeight = canvas.height
                        
                        if (!imgData || imgData === 'data:,') {
                          alert('이미지 데이터 생성에 실패했습니다.')
                          return
                        }
                        
                        const imgWidthInPdf = contentWidth
                        const imgHeightInPdf = (imgHeight * imgWidthInPdf) / imgWidth

                        const totalPages = Math.ceil(imgHeightInPdf / contentHeight)
                        
                        for (let i = 0; i < totalPages; i++) {
                          if (i > 0) {
                            pdf.addPage()
                          }
                          
                          const sourceY = (imgHeight / totalPages) * i
                          const sourceHeight = imgHeight / totalPages
                          const pageImgHeight = imgHeightInPdf / totalPages
                          
                          const pageCanvas = document.createElement('canvas')
                          pageCanvas.width = imgWidth
                          pageCanvas.height = sourceHeight
                          const pageCtx = pageCanvas.getContext('2d')
                          
                          if (pageCtx) {
                            const img = new Image()
                            img.src = imgData
                            
                            await new Promise<void>((resolve) => {
                              img.onload = () => {
                                try {
                                  pageCtx.drawImage(
                                    img,
                                    0, sourceY, imgWidth, sourceHeight,
                                    0, 0, imgWidth, sourceHeight
                                  )
                                  const pageImgData = pageCanvas.toDataURL('image/png', 1.0)
                                  if (pageImgData && pageImgData !== 'data:,') {
                                    pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidthInPdf, pageImgHeight)
                                  }
                                } catch (e) {
                                  console.error('이미지 그리기 오류:', e)
                                }
                                resolve()
                              }
                              img.onerror = () => {
                                console.error('이미지 로드 실패')
                                resolve()
                              }
                              setTimeout(() => resolve(), 5000)
                            })
                          }
                        }

                        pdf.save('AI_분석_리포트.pdf')
                      } catch (error) {
                        console.error('PDF 생성 중 오류:', error)
                        alert(`PDF 다운로드 중 오류가 발생했습니다: ${error}`)
                      }
                    }}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF 다운로드
                  </button>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>

              {/* 1. 공고 발행 통계 */}
              <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">1. 공고 발행 통계</h3>
                <p className="text-gray-600 mb-6">회사별 공고 수</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {companyTrendData.slice(0, 5).map((company, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 shadow-md"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{company.name}</h4>
                            <p className="text-sm text-gray-500">공고 발행 수</p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold text-gray-900">{company.value}</span>
                          <span className="text-lg text-gray-600">건</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="prose max-w-none">
                  <div className="space-y-3 text-base leading-relaxed text-gray-700">
                    <p>
                      분석 기간 동안 총 <strong>{companyTrendData.reduce((sum, c) => sum + c.value, 0)}건</strong>의 공고가 발행되었습니다.
                      주요 기업별 공고 발행 현황은 다음과 같습니다:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      {companyTrendData.slice(0, 5).map((company, index) => (
                        <li key={index}>
                          <strong>{company.name}</strong>: {company.value}건
                        </li>
                      ))}
                    </ul>
                    <p>
                      {timeframe === 'Daily' ? '일간' : timeframe === 'Weekly' ? '주간' : '월간'} 트렌드를 분석한 결과,
                      공고 발행 수는 지속적으로 증가하는 추세를 보이고 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. 트렌드 분석 */}
              <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">2. 트렌드 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* 회사별 트렌드 */}
                  <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      회사별 트렌드
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={companyTrendData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="value" fill="#6b7280" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 직무별 트렌드 */}
                  <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      직무별 트렌드
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={jobTrendData.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#6b7280', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="value" fill="#C91A2A" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <div className="space-y-3 text-base leading-relaxed text-gray-700">
                    <p>
                      공고 트렌드를 분석한 결과, {timeframe === 'Daily' ? '일별' : timeframe === 'Weekly' ? '주별' : '월별'}로 지속적인 증가 추세를 보이고 있습니다.
                      특히 주요 IT 기업들의 채용 공고가 활발하게 발행되고 있으며, 이는 IT 업계의 인력 수요가 크게 증가하고 있음을 시사합니다.
                    </p>
                    <p>
                      직무별 트렌드에서도 동일한 패턴이 관찰되며, Software Development와 AI 분야에서 특히 높은 수요를 보이고 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. 직무별 분석 */}
              <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. 직무별 분석</h3>
                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={currentJobRoles.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {currentJobRoles.slice(0, 8).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="prose max-w-none">
                  <div className="space-y-3 text-base leading-relaxed text-gray-700">
                    <p>
                      직무별 분석 결과, {selectedExpertCategory === 'Tech' ? '기술' : selectedExpertCategory === 'Biz' ? '비즈니스' : '비즈니스 지원'} 분야에서
                      다양한 직무가 활발하게 채용되고 있습니다.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      {currentJobRoles.slice(0, 5).map((role, index) => (
                        <li key={index}>
                          <strong>{role.name}</strong>: {role.value}%의 비율을 차지하고 있습니다.
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 4. 비교 분석 */}
              <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">4. 비교 분석</h3>
                <div className="prose max-w-none">
                  <div className="space-y-3 text-base leading-relaxed text-gray-700">
                    <p>
                      우리 회사(SK AX)의 포지셔닝을 경쟁사와 비교한 결과:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>공고 발행 수</strong>: 경쟁사 대비 중간 수준으로, 시장 점유율 확보를 위한 전략적 접근이 필요합니다.
                      </li>
                      <li>
                        <strong>기술 스택</strong>: 최신 기술 트렌드를 잘 반영하고 있으며, 특히 클라우드 및 AI/ML 분야에서 강점을 보이고 있습니다.
                      </li>
                      <li>
                        <strong>직무 분포</strong>: 다양한 직무 영역에서 균형잡힌 채용 전략을 수립하고 있어 경쟁력 있는 포지셔닝을 유지하고 있습니다.
                      </li>
                    </ul>
                    <p>
                      전반적으로 우리 회사는 기술 혁신과 시장 트렌드에 대한 이해도가 높으며,
                      경쟁사 대비 차별화된 채용 전략을 수립할 수 있는 기반을 갖추고 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  ) 
}

