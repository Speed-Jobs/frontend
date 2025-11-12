'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import JobPostingCard from '@/components/JobPostingCard'
import NotificationToast from '@/components/NotificationToast'
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
} from 'recharts'

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('Daily')
  const [selectedCompany, setSelectedCompany] = useState('전체')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedExpertCategory, setSelectedExpertCategory] = useState<'Tech' | 'Biz' | 'BizSupporting'>('Tech')
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'latest' | 'company' | 'deadline'>('latest')
  
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

  // 회사 목록 (중복 제거, 전체 옵션 포함)
  const companies = Array.from(new Set(jobPostingsData.map((job) => job.company.replace('(주)', '').trim())))

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

  const employmentTypes = ['모든 고용형태', '정규직', '계약직', '인턴', '프리랜서', '파트타임']

  // 필터링된 공고 목록 (로고가 있는 회사만 + 회사 필터)
  const filteredJobPostings = useMemo(() => {
    const filtered = jobPostingsData.filter((job) => {
      // 회사 필터링
      if (selectedCompany !== '전체') {
        const normalizedJobCompany = job.company.replace('(주)', '').trim().toLowerCase()
        const normalizedSelectedCompany = selectedCompany.toLowerCase()
        const companyMatch =
          normalizedJobCompany.includes(normalizedSelectedCompany) ||
          normalizedSelectedCompany.includes(normalizedJobCompany)
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
  }, [selectedCompany, selectedEmploymentType, companiesWithLogo, sortBy])

  // 페이지당 5개씩 표시
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredJobPostings.length / itemsPerPage)
  const displayedJobs = filteredJobPostings.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  // 필터 변경 시 첫 페이지로 리셋
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompany(e.target.value)
    setCurrentPage(0)
  }

  const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmploymentType(e.target.value === '모든 고용형태' ? 'all' : e.target.value)
    setCurrentPage(0)
  }

  const handleSortChange = (sortType: 'latest' | 'company' | 'deadline') => {
    setSortBy(sortType)
    setCurrentPage(0)
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
        width: 'w-36', 
        height: 'h-16', 
        text: 'text-lg', 
        padding: 'px-8 py-3', 
        radius: 80,
        pixelWidth: 144,
        pixelHeight: 64
      }
    }
    
    // count에 따라 크기 결정
    if (count >= maxCount * 0.8) {
      return { width: 'w-32', height: 'h-14', text: 'text-base', padding: 'px-7 py-3', radius: 70, pixelWidth: 128, pixelHeight: 56 }
    } else if (count >= maxCount * 0.6) {
      return { width: 'w-28', height: 'h-12', text: 'text-sm', padding: 'px-6 py-2', radius: 64, pixelWidth: 112, pixelHeight: 48 }
    } else if (count >= maxCount * 0.4) {
      return { width: 'w-24', height: 'h-10', text: 'text-xs', padding: 'px-5 py-2', radius: 56, pixelWidth: 96, pixelHeight: 40 }
    } else if (count >= maxCount * 0.25) {
      return { width: 'w-20', height: 'h-9', text: 'text-xs', padding: 'px-4 py-1.5', radius: 48, pixelWidth: 80, pixelHeight: 36 }
    } else {
      return { width: 'w-18', height: 'h-8', text: 'text-xs', padding: 'px-3 py-1', radius: 40, pixelWidth: 72, pixelHeight: 32 }
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
    
    // 레이어별 기본 설정 (경계 안전하게 유지하기 위해 반지름 축소)
    const layers = [
      { baseRadius: 120, count: 5 },   // 첫 번째 레이어: 5개
      { baseRadius: 180, count: 7 },   // 두 번째 레이어: 7개
      { baseRadius: 230, count: 8 },   // 세 번째 레이어: 8개
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
          
          // 사각형 영역 기반 겹침 체크
          if (checkRectOverlap(
            x, y, currentSize.pixelWidth, currentSize.pixelHeight,
            prevPos.x, prevPos.y, prevSize.pixelWidth, prevSize.pixelHeight,
            15 // 여유 공간
          )) {
            hasOverlap = true
            break
          }
        }
        
        if (!hasOverlap) {
          // 컨테이너 경계 확인
          const maxRadius = 240
          const maxX = 290 - currentSize.pixelWidth / 2
          const maxY = 290 - currentSize.pixelHeight / 2
          
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
        
        for (let testRadius = layer.baseRadius; testRadius <= 240; testRadius += 10) {
          for (let testAngle = 0; testAngle < Math.PI * 2; testAngle += Math.PI / 12) {
            const testX = Math.cos(testAngle) * testRadius
            const testY = Math.sin(testAngle) * testRadius
            
            const maxX = 290 - currentSize.pixelWidth / 2
            const maxY = 290 - currentSize.pixelHeight / 2
            
            if (Math.abs(testX) <= maxX && Math.abs(testY) <= maxY) {
              // 겹침 개수 계산
              let overlapCount = 0
              for (let i = 0; i < index; i++) {
                const prevPos = positions[i]
                const prevSize = sizes[i]
                if (checkRectOverlap(
                  testX, testY, currentSize.pixelWidth, currentSize.pixelHeight,
                  prevPos.x, prevPos.y, prevSize.pixelWidth, prevSize.pixelHeight,
                  10
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

  // 개별 스킬 위치 가져오기
  const getSkillPosition = (index: number) => {
    return skillPositions[index] || { x: 0, y: 0 }
  }

  // 선택된 스킬의 데이터
  const selectedSkillData = skillsData.find(s => s.name === selectedSkill) || skillsData[0]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* 새로운 공고 알림 토스트 */}
      {hasNewJobs && (
        <NotificationToast newJobs={newJobs} onClose={clearNewJobs} />
      )}

      <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* Competitor Job Postings Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            경쟁사 공고 자동 매칭
          </h2>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <select
              value={selectedCompany}
              onChange={handleCompanyChange}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-900 transition-colors cursor-pointer shadow-sm"
            >
              <option value="전체">전체 회사</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <select
              value={selectedEmploymentType === 'all' ? '모든 고용형태' : selectedEmploymentType}
              onChange={handleEmploymentTypeChange}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-900 transition-colors cursor-pointer shadow-sm"
            >
              {employmentTypes.map((type) => (
                <option key={type} value={type === '모든 고용형태' ? 'all' : type}>
                  {type}
                </option>
              ))}
            </select>
            
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
          <div className="flex items-center justify-between mb-6">
            <p className="text-base text-gray-700 font-medium">
              <span className="text-gray-900 font-bold">{filteredJobPostings.length}개</span>의 공고를 확인할 수 있어요.
            </p>
            {filteredJobPostings.length > itemsPerPage && (
              <Link
                href="/jobs"
                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                더보기 →
              </Link>
            )}
          </div>
          
          {filteredJobPostings.length > 0 ? (
            <div className="relative">
              {/* 슬라이드 컨테이너 */}
              <div className="space-y-4 overflow-hidden">
                {displayedJobs.map((job) => {
                  const isExpanded = expandedJobId === job.id
                  const matchedJobs = matchedJobsMap[job.id] || []
                  
                  return (
                    <div key={job.id} className="space-y-0">
                      <JobPostingCard 
                        job={job} 
                        showDetail={true}
                        onClick={() => handleJobClick(job)}
                        isExpanded={isExpanded}
                      />
                      
                      {/* 드롭다운 상세 내용 */}
                      {isExpanded && (
                        <div className="mt-0 bg-gray-50 border-x-2 border-b-2 border-gray-200 rounded-b-xl overflow-hidden">
                          <div className="p-6 space-y-6">
                            {/* 공고 상세 정보 */}
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">회사명</p>
                                <p className="text-lg font-semibold text-gray-900">{job.company}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">직무</p>
                                <p className="text-lg font-semibold text-gray-900">{job.meta_data?.job_category || '개발'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">공고 설명</p>
                                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{job.description || '공고 설명이 없습니다.'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-2">요구 기술</p>
                                <div className="flex flex-wrap gap-2">
                                  {job.meta_data?.tech_stack?.map((tech: string, idx: number) => (
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

                            {/* 매칭 결과 섹션 */}
                            {matchedJobs.length > 0 && (
                              <div className="pt-4 border-t border-gray-200">
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

                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <svg
                                    className="w-6 h-6 text-pink-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  매칭된 직무 <span className="text-gray-900">{matchedJobs.length}개</span>
                                </h3>
                                <div className="space-y-4">
                                  {matchedJobs.map((matched, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-6 border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-all duration-300"
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-lg font-bold text-gray-900">{matched.title}</h4>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 whitespace-nowrap">
                                          {matched.similarity}% 일치
                                        </span>
                                      </div>
                                      <p className="text-gray-700 mb-3 text-sm">{matched.description}</p>
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

        {/* Trend Comparison Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            트렌드 비교
          </h2>
          
          {/* 기간 탭 (일간, 주간, 월간) */}
          <div className="flex gap-2 mb-6">
            {['Daily', 'Weekly', 'Monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeframe(tab)}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                  timeframe === tab
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'Daily' ? '일간' : tab === 'Weekly' ? '주간' : '월간'}
              </button>
            ))}
          </div>

          {/* 트렌드 차트 그리드 (회사별, 직업별, 기술별) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 회사별 트렌드 */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                회사별 트렌드 ({timeframe === 'Daily' ? '일간' : timeframe === 'Weekly' ? '주간' : '월간'})
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyTrendData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    domain={[0, 'dataMax + 50']}
                    tick={{ fill: '#6b7280', fontSize: 10 }} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{ fill: '#6b7280', fontSize: 10 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      color: '#1f2937',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}건`, '']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#6b7280" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 직업별 트렌드 */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                직업별 트렌드 ({timeframe === 'Daily' ? '일간' : timeframe === 'Weekly' ? '주간' : '월간'})
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobTrendData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    domain={[0, 'dataMax + 50']}
                    tick={{ fill: '#6b7280', fontSize: 10 }} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{ fill: '#6b7280', fontSize: 10 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      color: '#1f2937',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}건`, '']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#6b7280" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 기술별 트렌드 */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                기술별 트렌드 ({timeframe === 'Daily' ? '일간' : timeframe === 'Weekly' ? '주간' : '월간'})
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={techTrendData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    domain={[0, 'dataMax + 50']}
                    tick={{ fill: '#6b7280', fontSize: 10 }} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{ fill: '#6b7280', fontSize: 10 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      color: '#1f2937',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}건`, '']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#6b7280" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Job Statistics Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            직군별 통계
          </h2>
          
          {/* 전문가 카테고리 탭 */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
                setSelectedExpertCategory('Tech')
                setSelectedJobRole(null)
              }}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                selectedExpertCategory === 'Tech'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tech 전문가
            </button>
            <button
              onClick={() => {
                setSelectedExpertCategory('Biz')
                setSelectedJobRole(null)
              }}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                selectedExpertCategory === 'Biz'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Biz 전문가
            </button>
            <button
              onClick={() => {
                setSelectedExpertCategory('BizSupporting')
                setSelectedJobRole(null)
              }}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                selectedExpertCategory === 'BizSupporting'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Biz.Supporting 전문가
            </button>
          </div>

          <div className="space-y-6">
            {/* 직무 원그래프 */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">직무</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentJobRoles}
                    cx="50%"
                    cy="50%"
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
                      color: '#1f2937' 
                    }}
                    formatter={(value: number, name: string) => [
                      `${value}건`,
                      name
                    ]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Industry 테이블 (직무 선택 시 아래에 표시) */}
            {selectedJobRole && (
              <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
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

        {/* Recruitment Related News Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            채용 관련 뉴스
          </h2>
          <div className="space-y-4">
            {newsItems.map((news, index) => (
              <div
                key={index}
                className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex items-start gap-4"
              >
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2">{news.source}</p>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {news.headline}
                  </h3>
                  <p className="text-sm text-gray-600">{news.snippet}</p>
                </div>
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                  {news.image}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skill Statistics Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            스킬별 통계
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-12 border border-gray-200 rounded-2xl shadow-lg relative overflow-hidden" style={{ overflow: 'hidden' }}>
              {/* 배경 장식 */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-900 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gray-900 rounded-full blur-3xl"></div>
              </div>
              
              {/* 헤더 */}
              <div className="relative mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">스킬 클라우드</h3>
                <p className="text-sm text-gray-500">스킬을 클릭하면 상세 정보를 확인할 수 있습니다</p>
              </div>
              
              <div className="relative h-[580px] flex items-center justify-center overflow-hidden" style={{ overflow: 'hidden' }}>
                {skillsData.map((skill, index) => {
                  const maxCount = skillsData[0]?.count || 1
                  const size = getSkillSize(skill.count, index, maxCount)
                  const position = getSkillPosition(index)
                  const isMain = index === 0
                  const isSelected = selectedSkill === skill.name
                  
                  return (
                    <button
                      key={skill.name}
                      onClick={() => setSelectedSkill(skill.name)}
                      className={`absolute ${size.padding} ${size.height} rounded-full flex items-center justify-center ${size.text} font-bold transition-all duration-500 cursor-pointer whitespace-nowrap ${
                        isMain ? 'z-30' : 'z-10'
                      } ${
                        index % 3 === 0 ? 'animate-float-1' : index % 3 === 1 ? 'animate-float-2' : 'animate-float-3'
                      } ${
                        isMain
                          ? 'bg-gray-900 text-white shadow-2xl hover:shadow-gray-900/50 hover:scale-110 border-2 border-gray-700/30'
                          : isSelected
                          ? 'bg-gray-600 text-white shadow-xl hover:scale-110 border-2 border-gray-700'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-400 hover:scale-105 shadow-lg'
                      }`}
                      style={{
                        left: `calc(50% - 40px + ${position.x}px)`,
                        top: `calc(50% + ${position.y}px)`,
                        transform: `translate(-50%, -50%)`,
                        animationDelay: `${index * 0.1}s`,
                        minWidth: size.width,
                      }}
                    >
                      {skill.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="bg-white p-8 border border-gray-200 rounded-2xl shadow-lg">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white uppercase">
                    {selectedSkillData.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                  {selectedSkillData.name}
                </h3>
                <p className="text-sm text-gray-500">스킬 상세 정보</p>
              </div>
              
              <div className="space-y-6">
                {/* 통계 카드들 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                      총 공고 수
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {selectedSkillData.count}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">건</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                      비율
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {selectedSkillData.percentage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">%</p>
                  </div>
                </div>

                {/* 변화율 */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">전월 대비 변화</p>
                      <p className="text-2xl font-bold text-green-700">
                        +{selectedSkillData.change}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 관련 스킬 */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-700">관련 스킬</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkillData.relatedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
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
      </div>

      {/* AI 분석 리포트 생성 버튼 - 오른쪽 아래 고정 */}
      <button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-8 right-8 px-6 py-4 bg-sk-red hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        AI 분석 리포트 생성
      </button>

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

    </div>
  ) 
}

