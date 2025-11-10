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
} from 'recharts'

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('Daily')
  const [selectedJobCategory, setSelectedJobCategory] = useState('all')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedExpertCategory, setSelectedExpertCategory] = useState<'Tech' | 'Biz' | 'BizSupporting'>('Tech')
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null)

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

  // 필터링된 공고 목록 (로고가 있는 회사만 + 직무 필터)
  const filteredJobPostings = useMemo(() => {
    return jobPostingsData.filter((job) => {
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

      // 직무 필터링 (job_category 또는 title에서 매칭)
      const jobRoleMatch = selectedJobCategory === 'all' || 
        job.meta_data?.job_category?.includes(selectedJobCategory) ||
        job.title.includes(selectedJobCategory) ||
        // Software Development 매칭
        (selectedJobCategory === 'Software Development' && (
          job.title.includes('개발') || 
          job.title.includes('Developer') ||
          job.title.includes('Engineer') ||
          job.meta_data?.job_category === '개발'
        )) ||
        // Factory AX Engineering 매칭
        (selectedJobCategory === 'Factory AX Engineering' && (
          job.title.includes('Factory') ||
          job.title.includes('AX') ||
          job.title.includes('제조') ||
          job.title.includes('공장') ||
          job.title.includes('Simulation') ||
          job.title.includes('기구설계') ||
          job.title.includes('전장')
        )) ||
        // Solution Development 매칭
        (selectedJobCategory === 'Solution Development' && (
          job.title.includes('Solution') ||
          job.title.includes('ERP') ||
          job.title.includes('시스템') ||
          job.meta_data?.job_category === '기획'
        )) ||
        // Cloud/Infra Engineering 매칭
        (selectedJobCategory === 'Cloud/Infra Engineering' && (
          job.title.includes('Cloud') ||
          job.title.includes('클라우드') ||
          job.title.includes('Infra') ||
          job.title.includes('인프라') ||
          job.title.includes('DevOps') ||
          job.meta_data?.job_category === '인프라'
        )) ||
        // Architect 매칭
        (selectedJobCategory === 'Architect' && (
          job.title.includes('Architect') ||
          job.title.includes('아키텍트') ||
          job.title.includes('설계')
        )) ||
        // Project Management 매칭
        (selectedJobCategory === 'Project Management' && (
          job.title.includes('PM') ||
          job.title.includes('Project') ||
          job.title.includes('프로젝트') ||
          job.title.includes('관리') ||
          job.meta_data?.job_category === '기획'
        )) ||
        // Quality Management 매칭
        (selectedJobCategory === 'Quality Management' && (
          job.title.includes('Quality') ||
          job.title.includes('품질') ||
          job.title.includes('QA') ||
          job.title.includes('테스트')
        )) ||
        // AI 매칭
        (selectedJobCategory === 'AI' && (
          job.title.includes('AI') ||
          job.title.includes('ML') ||
          job.title.includes('Machine Learning') ||
          job.title.includes('머신러닝') ||
          job.title.includes('딥러닝') ||
          job.meta_data?.job_category === 'AI/ML'
        )) ||
        // 정보보호 매칭
        (selectedJobCategory === '정보보호' && (
          job.title.includes('보안') ||
          job.title.includes('Security') ||
          job.title.includes('정보보호') ||
          job.meta_data?.job_category === '보안'
        )) ||
        // Sales 매칭
        (selectedJobCategory === 'Sales' && (
          job.title.includes('Sales') ||
          job.title.includes('영업') ||
          job.title.includes('세일즈') ||
          job.meta_data?.job_category === '마케팅'
        )) ||
        // Domain Expert 매칭
        (selectedJobCategory === 'Domain Expert' && (
          job.title.includes('Expert') ||
          job.title.includes('전문가') ||
          job.title.includes('Consultant') ||
          job.meta_data?.job_category === '기획'
        )) ||
        // Consulting 매칭
        (selectedJobCategory === 'Consulting' && (
          job.title.includes('Consulting') ||
          job.title.includes('컨설팅') ||
          job.title.includes('Advisory')
        )) ||
        // Biz. Supporting 매칭
        (selectedJobCategory === 'Biz. Supporting' && (
          job.title.includes('Strategy') ||
          job.title.includes('전략') ||
          job.title.includes('Planning') ||
          job.title.includes('기획') ||
          job.title.includes('HR') ||
          job.title.includes('인사') ||
          job.meta_data?.job_category === '기획'
        ))

      const employmentTypeMatch =
        selectedEmploymentType === 'all' || job.employment_type === selectedEmploymentType
      
      return jobRoleMatch && employmentTypeMatch
    })
  }, [selectedJobCategory, selectedEmploymentType, companiesWithLogo])

  // 페이지당 5개씩 표시
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredJobPostings.length / itemsPerPage)
  const displayedJobs = filteredJobPostings.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  // 필터 변경 시 첫 페이지로 리셋
  const handleJobCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJobCategory(e.target.value === '모든 직무' ? 'all' : e.target.value)
    setCurrentPage(0)
  }

  const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmploymentType(e.target.value === '모든 고용형태' ? 'all' : e.target.value)
    setCurrentPage(0)
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
            경쟁사 공고
          </h2>
          <div className="flex gap-4 mb-6">
            <select
              value={selectedJobCategory === 'all' ? '모든 직무' : selectedJobCategory}
              onChange={handleJobCategoryChange}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:border-gray-900 transition-colors cursor-pointer shadow-sm"
            >
              {jobRoles.map((role) => (
                <option key={role} value={role === '모든 직무' ? 'all' : role}>
                  {role}
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
                {displayedJobs.map((job) => (
                  <JobPostingCard key={job.id} job={job} showDetail={true} />
                ))}
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

        {/* 타이밍 분석 Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">타이밍 분석</h2>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      직무
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      우리 회사 시작일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      경쟁사 평균 시작일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      시장 대비
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      분석
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      백엔드 개발자
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      2023.10.15
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      2023.10.20
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        빠름 (5일)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      시장보다 5일 빠르게 공고를 시작하여 선제적 채용 전략을 보여줍니다.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      프론트엔드 개발자
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      2023.11.01
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      2023.10.28
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        보통 (4일)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      경쟁사 대비 4일 늦게 시작했으나, 시장 트렌드를 고려한 적절한 타이밍입니다.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      데이터 엔지니어
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      2023.10.25
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      2023.10.30
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        빠름 (5일)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      시장보다 빠르게 공고를 시작하여 우수 인재 확보에 유리한 위치에 있습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>분석 요약:</strong> 우리 회사는 대부분의 직무에서 시장보다 빠르거나 적절한 타이밍에 공고를 발행하고 있어,
                경쟁력 있는 채용 전략을 유지하고 있습니다. 특히 백엔드 및 데이터 엔지니어 직무에서 선제적 공고 발행으로
                우수 인재 확보에 유리한 포지션을 차지하고 있습니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  ) 
}

