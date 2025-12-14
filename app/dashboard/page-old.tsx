'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
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
  const [jobPostingsTrendTimeframe, setJobPostingsTrendTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily')
  const [companyRecruitmentTimeframe, setCompanyRecruitmentTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily')
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
  const [skillDiversityViewMode, setSkillDiversityViewMode] = useState<'all' | 'year'>('all')
  const [selectedYear, setSelectedYear] = useState<'2021' | '2022' | '2023' | '2024' | '2025'>('2025')
  const [skillStatisticsViewMode, setSkillStatisticsViewMode] = useState<'all' | 'year'>('all') // 스킬별 통계 시간 필터
  const [selectedSkillStatisticsYear, setSelectedSkillStatisticsYear] = useState<'2021' | '2022' | '2023' | '2024' | '2025'>('2025') // 스킬별 통계 연도 선택
  const [jobRoleStatisticsViewMode, setJobRoleStatisticsViewMode] = useState<'Weekly' | 'Monthly'>('Weekly') // 직군별 통계 시간 필터
  const [selectedJobRoleCompany, setSelectedJobRoleCompany] = useState<string | null>(null) // 직군별 통계 회사 필터 (null이면 전체)
  const [selectedJobRoleMonth, setSelectedJobRoleMonth] = useState<string>('') // 직군별 통계 월 필터 (YYYY-MM 형식)
  const [selectedSidebarJobRole, setSelectedSidebarJobRole] = useState<string | null>(null) // 사이드바에서 선택된 직군 (공고 필터링용)
  const [selectedSurgePosition, setSelectedSurgePosition] = useState<string | null>(null) // 선택된 급증 포지션
  const [positionSurgeTimeframe, setPositionSurgeTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily') // 포지션별 채용 급증 시간 필터
  const [sidebarJobRoleTimeframe, setSidebarJobRoleTimeframe] = useState<'Weekly' | 'Monthly'>('Weekly') // 직군별 공고 시간 필터
  
  // 직군별 통계용 회사 목록
  const jobRoleCompanies = [
    { key: 'toss', name: '토스' },
    { key: 'line', name: '라인' },
    { key: 'hanwha', name: '한화 시스템' },
    { key: 'kakao', name: '카카오' },
    { key: 'naver', name: '네이버' },
    { key: 'samsung', name: '삼성 SDS' },
    { key: 'lg', name: 'LG CNS' },
    { key: 'sk', name: 'SK AX' },
  ]
  const [selectedRecruitmentCompanies, setSelectedRecruitmentCompanies] = useState<string[]>([])
  const isRecruitmentCompaniesInitialized = useRef(false) // 초기화 여부 추적
  
  // 회사별 채용 활동 API 데이터 상태
  const [companyRecruitmentApiData, setCompanyRecruitmentApiData] = useState<{
    companies: Array<{ id: number; name: string; key: string }>
    activities: Array<{ period: string; counts: Record<string, number> }>
  } | null>(null)
  const [isLoadingCompanyRecruitment, setIsLoadingCompanyRecruitment] = useState(false)
  const [companyRecruitmentError, setCompanyRecruitmentError] = useState<string | null>(null)
  
  // 채용 공고 수 추이 API 데이터 상태
  const [jobPostingsTrendApiData, setJobPostingsTrendApiData] = useState<Array<{ period: string; count: number }>>([])
  const [isLoadingJobPostingsTrend, setIsLoadingJobPostingsTrend] = useState(false)
  const [jobPostingsTrendError, setJobPostingsTrendError] = useState<string | null>(null)
  
  // 회사별 스킬 다양성 API 데이터 상태
  const [companySkillDiversityApiData, setCompanySkillDiversityApiData] = useState<Array<{ company: string; skills: number }>>([])
  const [isLoadingSkillDiversity, setIsLoadingSkillDiversity] = useState(false)
  const [skillDiversityError, setSkillDiversityError] = useState<string | null>(null)
  
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
  
  // 전체 AI 분석 상태 (말풍선 방식)
  const [showGlobalAnalysis, setShowGlobalAnalysis] = useState(false)
  const [globalAnalysisContent, setGlobalAnalysisContent] = useState('')
  const [isGeneratingGlobalAnalysis, setIsGeneratingGlobalAnalysis] = useState(false)

  // 백엔드에서 받은 회사 목록
  const [apiCompanies, setApiCompanies] = useState<Array<{ id: number; name: string }>>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const [companiesError, setCompaniesError] = useState<string | null>(null)

  // 기본 스킬 데이터 (백엔드 API 실패 시 fallback)
  const defaultSkillsData = [
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
  ].sort((a, b) => b.count - a.count)

  // 스킬 통계 관련 상태
  const [skillsData, setSkillsData] = useState<Array<{
    name: string
    count: number
    percentage: number
    change: number
    relatedSkills: string[]
  }>>(defaultSkillsData) // 초기값으로 기본 데이터 사용
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const [skillsError, setSkillsError] = useState<string | null>(null)

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

  // 스킬 통계 API 호출
  useEffect(() => {
    const fetchSkillsStatistics = async () => {
      try {
        setIsLoadingSkills(true)
        setSkillsError(null)
        
        // 백엔드 API 엔드포인트
        // GET /api/v1/dashboard/skills/statistics?start_date={start_date}&end_date={end_date}
        const apiUrl = 'https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/skills/statistics'
        
        // 쿼리 파라미터 구성
        const params = new URLSearchParams()
        
        // 전체보기/연도별에 따른 날짜 범위 계산
        let startDate: Date | null = null
        let endDate: Date | null = null
        
        if (skillStatisticsViewMode === 'year' && selectedSkillStatisticsYear) {
          // 연도별: 선택된 연도의 1월 1일부터 12월 31일까지
          const year = parseInt(selectedSkillStatisticsYear)
          startDate = new Date(year, 0, 1) // 1월 1일
          endDate = new Date(year, 11, 31) // 12월 31일
          
          params.append('start_date', startDate.toISOString().split('T')[0])
          params.append('end_date', endDate.toISOString().split('T')[0])
        } else {
          // 전체보기: 날짜 파라미터 없이 호출 (또는 매우 넓은 범위)
          // 백엔드가 날짜 파라미터 없이 전체 데이터를 반환한다고 가정
        }
        
        const fullUrl = `${apiUrl}?${params.toString()}`
        console.log('=== 스킬 통계 API 호출 ===')
        console.log('호출 URL:', fullUrl)
        console.log('view_mode:', skillStatisticsViewMode)
        if (startDate && endDate) {
          console.log('start_date:', startDate.toISOString().split('T')[0])
          console.log('end_date:', endDate.toISOString().split('T')[0])
        } else {
          console.log('전체보기 모드: 날짜 파라미터 없음')
        }
        
        const response = await fetch(fullUrl, {
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
        
        const result = await response.json()
        console.log('백엔드에서 받은 스킬 통계 데이터:', result)
        
        // 백엔드 응답 형식에 맞춰 데이터 변환
        if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
          // 백엔드에서 여러 스킬의 통계를 배열로 제공한다고 가정
          // 각 스킬마다 {top_skills: [{id, name}], top_skill_stat: {...}} 형태
          if (Array.isArray(result.data)) {
            // 배열 형태로 여러 스킬 통계를 받는 경우
            const transformedData = result.data.map((item: any) => {
              const skillName = item.top_skills?.[0]?.name?.toLowerCase() || 'unknown'
              const stat = item.top_skill_stat || {}
              
              return {
                name: skillName,
                count: stat.count || 0,
                percentage: stat.market_share || 0,
                change: stat.weekly_change_rate || stat.monthly_change_rate || 0,
                relatedSkills: [] // 백엔드에서 제공하지 않으면 빈 배열
              }
            }).sort((a: any, b: any) => b.count - a.count)
            
            setSkillsData(transformedData)
          } else if (result.data.top_skills && Array.isArray(result.data.top_skills)) {
            // 단일 응답에서 여러 스킬을 받는 경우
            // top_skills 배열과 각각의 통계가 매핑되어 있다고 가정
            // 실제 백엔드 구조에 맞게 수정 필요
            const transformedData = result.data.top_skills.map((skill: any, index: number) => {
              // 각 스킬의 통계를 가져오는 로직 (백엔드 구조에 따라 수정 필요)
              const stat = result.data.top_skill_stat || {}
              
              return {
                name: skill.name?.toLowerCase() || 'unknown',
                count: stat.count || 0,
                percentage: stat.market_share || 0,
                change: stat.weekly_change_rate || stat.monthly_change_rate || 0,
                relatedSkills: []
              }
            }).sort((a: any, b: any) => b.count - a.count)
            
            setSkillsData(transformedData)
          } else if (result.data.top_skill_stat) {
            // 단일 스킬 통계인 경우
            const skillStat = result.data.top_skill_stat
            const skillName = result.data.top_skills?.[0]?.name?.toLowerCase() || 'unknown'
            
            const transformedData = [{
              name: skillName,
              count: skillStat.count || 0,
              percentage: skillStat.market_share || 0,
              change: skillStat.weekly_change_rate || skillStat.monthly_change_rate || 0,
              relatedSkills: []
            }]
            
            setSkillsData(transformedData)
          } else {
            // 기본 데이터 사용
            setSkillsData(defaultSkillsData)
          }
        } else {
          console.warn('스킬 통계 데이터 형식이 올바르지 않습니다.')
          setSkillsData(defaultSkillsData)
        }
      } catch (err) {
        console.error('=== 스킬 통계 API 호출 에러 ===')
        console.error('에러:', err)
        setSkillsError(err instanceof Error ? err.message : '스킬 통계를 불러오는 중 오류가 발생했습니다.')
        // 에러 발생 시 기본 데이터 사용
        setSkillsData(defaultSkillsData)
      } finally {
        setIsLoadingSkills(false)
      }
    }

    fetchSkillsStatistics()
  }, [skillStatisticsViewMode, selectedSkillStatisticsYear])

  // 회사별 스킬 다양성 API 호출
  useEffect(() => {
    const fetchSkillDiversity = async () => {
      try {
        setIsLoadingSkillDiversity(true)
        setSkillDiversityError(null)
        
        // view_mode와 year 파라미터 구성
        const params = new URLSearchParams()
        params.append('view_mode', skillDiversityViewMode)
        if (skillDiversityViewMode === 'year' && selectedYear) {
          params.append('year', selectedYear)
        }
        
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/skills/diversity?${params.toString()}`
        console.log('=== 회사별 스킬 다양성 API 호출 ===')
        console.log('호출 URL:', apiUrl)
        console.log('view_mode:', skillDiversityViewMode, 'year:', selectedYear)
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('HTTP 에러 발생! 상태 코드:', response.status)
          console.error('에러 응답 내용:', errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('백엔드에서 받은 회사별 스킬 다양성 데이터:', result)
        
        // 백엔드 응답 형식에 맞춰 데이터 변환
        // 응답 형식: { status: 200, code: "SUCCESS", message: "...", data: {...} }
        let data: any = result.data
        
        // data가 문자열인 경우 JSON 파싱 시도
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data)
            console.log('파싱된 data:', data)
          } catch (parseError) {
            console.error('data JSON 파싱 실패:', parseError)
            throw new Error('응답 데이터 형식이 올바르지 않습니다.')
          }
        }
        
        // status가 0이거나 200이고 code가 SUCCESS인 경우 성공으로 처리
        if ((result.status === 0 || result.status === 200) && result.code === 'SUCCESS' && data) {
          const { diversity } = data
          
          if (Array.isArray(diversity)) {
            // API 응답 형식: [{ company: "토스", skills: 438 }, ...]
            // 현재 코드 형식과 동일하므로 그대로 사용
            console.log('변환된 회사별 스킬 다양성 데이터:', diversity)
            setCompanySkillDiversityApiData(diversity)
          } else {
            console.warn('회사별 스킬 다양성 데이터 형식이 올바르지 않습니다. diversity가 배열이 아닙니다.')
            console.warn('받은 data:', data)
            setCompanySkillDiversityApiData([])
          }
        } else {
          console.warn('회사별 스킬 다양성 응답 형식이 올바르지 않습니다.')
          console.warn('status:', result.status, 'code:', result.code, 'data:', result.data)
          setCompanySkillDiversityApiData([])
        }
      } catch (err) {
        console.error('=== 회사별 스킬 다양성 API 호출 에러 ===')
        console.error('에러:', err)
        setSkillDiversityError(err instanceof Error ? err.message : '회사별 스킬 다양성을 불러오는 중 오류가 발생했습니다.')
        setCompanySkillDiversityApiData([])
      } finally {
        setIsLoadingSkillDiversity(false)
      }
    }

    fetchSkillDiversity()
  }, [skillDiversityViewMode, selectedYear])

  // 회사별 채용 활동 API 호출
  useEffect(() => {
    const fetchCompanyRecruitment = async () => {
      try {
        setIsLoadingCompanyRecruitment(true)
        setCompanyRecruitmentError(null)
        
        // timeframe에 따른 파라미터 설정
        const timeframeMap: Record<string, string> = {
          'Daily': 'daily',
          'Weekly': 'weekly',
          'Monthly': 'monthly'
        }
        const timeframeParam = timeframeMap[companyRecruitmentTimeframe] || 'daily'
        
        // 회사 키워드 (기본값: 토스,한화,라인,네이버,카카오,LG,현대오토에버,우아한)
        const companyKeywords = '토스,한화,라인,네이버,카카오,LG,현대오토에버,우아한'
        
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/companies/recruitment-activity?timeframe=${timeframeParam}&company_keywords=${encodeURIComponent(companyKeywords)}`
        console.log('=== 회사별 채용 활동 API 호출 ===')
        console.log('호출 URL:', apiUrl)
        console.log('timeframe:', companyRecruitmentTimeframe)
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('HTTP 에러 발생! 상태 코드:', response.status)
          console.error('에러 응답 내용:', errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('백엔드에서 받은 회사별 채용 활동 데이터:', result)
        
        // 백엔드 응답 형식에 맞춰 데이터 저장
        if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
          setCompanyRecruitmentApiData({
            companies: result.data.companies || [],
            activities: result.data.activities || []
          })
        } else {
          console.warn('회사별 채용 활동 응답 형식이 올바르지 않습니다.')
          console.warn('status:', result.status, 'code:', result.code, 'data:', result.data)
          setCompanyRecruitmentApiData(null)
        }
      } catch (err) {
        console.error('=== 회사별 채용 활동 API 호출 에러 ===')
        console.error('에러:', err)
        setCompanyRecruitmentError(err instanceof Error ? err.message : '회사별 채용 활동을 불러오는 중 오류가 발생했습니다.')
        setCompanyRecruitmentApiData(null)
      } finally {
        setIsLoadingCompanyRecruitment(false)
      }
    }

    fetchCompanyRecruitment()
  }, [companyRecruitmentTimeframe])

  // API 데이터가 로드되면 초기 선택 회사 목록 설정
  useEffect(() => {
    if (companyRecruitmentApiData && companyRecruitmentApiData.companies.length > 0 && !isRecruitmentCompaniesInitialized.current) {
      // API에서 받은 모든 회사의 key를 초기 선택 목록으로 설정
      const allCompanyKeys = companyRecruitmentApiData.companies.map(c => c.key)
      setSelectedRecruitmentCompanies(allCompanyKeys)
      isRecruitmentCompaniesInitialized.current = true
    }
  }, [companyRecruitmentApiData])

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

  // 직군명과 공고 매칭을 위한 키워드 매핑
  const jobRoleKeywords: Record<string, string[]> = {
    'Software Development': ['개발', 'developer', 'development', '프로그래머', '프로그래밍', '소프트웨어', 'software', '백엔드', 'backend', '프론트엔드', 'frontend', '풀스택', 'fullstack'],
    'Factory AX Engineering': ['factory', 'ax', 'engineering', '공장', '제조', '시뮬레이션', 'simulation', '기구설계', '전장', '제어'],
    'Solution Development': ['solution', '솔루션', 'erp', 'fcm', 'scm', 'hcm'],
    'Cloud/Infra Engineering': ['cloud', 'infra', 'infrastructure', '클라우드', '인프라', '시스템', 'system', 'network', '네트워크', '데이터베이스', 'database', 'db'],
    'Architect': ['architect', '아키텍트', '아키텍처', 'architecture', '설계'],
    'Project Management': ['project', 'pm', '프로젝트', '관리', 'management', '프로젝트매니저'],
    'Quality Management': ['quality', 'qa', 'qc', '품질', '테스트', 'test', 'testing', 'qa엔지니어'],
    'AI': ['ai', 'artificial intelligence', '인공지능', '머신러닝', 'machine learning', 'ml', '딥러닝', 'deep learning', 'nlp', '자연어처리', '데이터사이언스', 'data science'],
    '정보보호': ['보안', 'security', '정보보호', 'cyber', '사이버', '보안관리'],
    'Sales': ['sales', '영업', '세일즈', '영업사원'],
    'Domain Expert': ['domain', '도메인', '전문가', 'expert', '컨설턴트', 'consultant'],
    'Consulting': ['consulting', '컨설팅', '컨설턴트', 'consultant'],
    'Biz. Supporting': ['biz', 'business', '비즈니스', '기획', 'planning', '전략', 'strategy', 'hr', '인사', '재무', 'finance']
  }

  // 경쟁사 공고 자동 매칭용 필터링 (사이드바 직군 필터 제외)
  const filteredJobPostingsForMatching = useMemo(() => {
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
          return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
        case 'company':
          const companyA = a.company.replace('(주)', '').trim()
          const companyB = b.company.replace('(주)', '').trim()
          return companyA.localeCompare(companyB, 'ko')
        case 'deadline':
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

  // 필터링된 공고 목록 (로고가 있는 회사만 + 회사 필터 + 직군 필터 + 시간 필터)
  const filteredJobPostings = useMemo(() => {
    // 시간 필터에 따른 기간 설정 (직군별 공고용)
    const now = new Date()
    let timeFilterStart: Date | null = null
    
    if (selectedSidebarJobRole) {
      switch (sidebarJobRoleTimeframe) {
        case 'Weekly':
          timeFilterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 최근 7일
          break
        case 'Monthly':
          timeFilterStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 최근 30일
          break
      }
    }
    
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
      
      // 직군 필터링 (사이드바에서 선택된 직군) - 개선된 매칭 로직
      if (selectedSidebarJobRole) {
        const jobCategory = (job.meta_data?.job_category || '').toLowerCase()
        const jobDescription = (job.description || '').toLowerCase()
        const jobTitle = (job.title || '').toLowerCase()
        const techStack = (job.meta_data?.tech_stack || []).map(tech => tech.toLowerCase())
        
        // 직군명의 키워드 목록 가져오기
        const keywords = jobRoleKeywords[selectedSidebarJobRole] || [selectedSidebarJobRole.toLowerCase()]
        
        // 키워드 중 하나라도 매칭되면 통과
        const roleMatch = keywords.some(keyword => {
          const keywordLower = keyword.toLowerCase()
          return jobCategory.includes(keywordLower) ||
                 jobDescription.includes(keywordLower) ||
                 jobTitle.includes(keywordLower) ||
                 techStack.some(tech => tech.includes(keywordLower) || keywordLower.includes(tech))
        })
        
        // 추가로 직군명 자체도 확인
        const roleNameLower = selectedSidebarJobRole.toLowerCase()
        const directMatch = 
          jobCategory.includes(roleNameLower) ||
          jobDescription.includes(roleNameLower) ||
          jobTitle.includes(roleNameLower)
        
        if (!roleMatch && !directMatch) return false
        
        // 시간 필터 적용 (직군이 선택된 경우만)
        if (timeFilterStart) {
          const postedDate = new Date(job.posted_date)
          if (postedDate < timeFilterStart) return false
        }
      }
      
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
  }, [selectedCompanies, selectedEmploymentType, companiesWithLogo, sortBy, selectedSidebarJobRole, selectedExpertCategory, sidebarJobRoleTimeframe])

  // 페이지당 5개씩 표시
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredJobPostingsForMatching.length / itemsPerPage)
  const displayedJobs = filteredJobPostingsForMatching.slice(
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

  // 전체 AI 분석 생성 함수
  const generateGlobalAnalysis = async () => {
    setShowGlobalAnalysis(true)
    
    // 이미 생성된 내용이 있으면 다시 생성하지 않음
    if (globalAnalysisContent) {
      return
    }
    
    setIsGeneratingGlobalAnalysis(true)
    
    // 시뮬레이션: 실제로는 API 호출
    setTimeout(() => {
      const trendPeriod = jobPostingsTrendTimeframe === 'Daily' ? '일간' : jobPostingsTrendTimeframe === 'Weekly' ? '주간' : '월간'
      const companyRecruitmentPeriod = companyRecruitmentTimeframe === 'Daily' ? '일간' : companyRecruitmentTimeframe === 'Weekly' ? '주간' : '월간'
      const topSkills = skillsDataToUse.slice(0, 5).map(s => s.name).join(', ')
      const selectedCompanies = selectedRecruitmentCompanies.length > 0 ? selectedRecruitmentCompanies.join(', ') : '전체 회사'
      
      const analysisContent = `## 전체 대시보드 종합 분석

### 1. 채용 공고 수 추이 (${trendPeriod})
**현재 트렌드:**
- ${trendPeriod} 기준으로 채용 공고 수가 지속적으로 증가하고 있습니다.
- 최근 3개월간 평균 증가율이 높아지고 있어 시장이 활발합니다.

### 2. 주요 회사별 채용 활동 (${companyRecruitmentPeriod})
**분석 대상 회사:** ${selectedCompanies}
**주요 인사이트:**
- 대형 IT 기업들의 지속적인 채용 확대가 두드러집니다.
- 스타트업의 성장세에 따른 인력 충원이 활발합니다.

### 3. 스킬별 통계
**상위 인기 스킬:** ${topSkills}
**시장 동향:**
- 프론트엔드와 백엔드 기술 스택이 균형있게 요구되고 있습니다.
- 클라우드 및 DevOps 관련 스킬의 중요성이 증가하고 있습니다.

### 4. 종합 추천사항
1. 상위 인기 스킬들을 우선적으로 학습하세요.
2. 지속적인 트렌드 모니터링으로 시장 변화에 대응하세요.
3. 관심 있는 회사의 채용 활동을 주기적으로 확인하세요.`
      
      setIsGeneratingGlobalAnalysis(false)
      setGlobalAnalysisContent(analysisContent)
    }, 2000)
  }
  
  // 전체 AI 분석 말풍선 컴포넌트
  const GlobalAnalysisBubble = () => {
    if (!showGlobalAnalysis) return null
    
    return (
      <>
        {/* 배경 오버레이 */}
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowGlobalAnalysis(false)}
        />
        <div className="fixed top-24 right-8 z-50 w-96 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-200 p-6 relative">
          {/* 말풍선 꼬리 */}
          <div className="absolute -top-3 right-8 w-6 h-6 bg-white border-l-2 border-t-2 border-blue-200 transform rotate-45"></div>
          
          {/* 닫기 버튼 */}
          <button
            onClick={() => setShowGlobalAnalysis(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            {isGeneratingGlobalAnalysis ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600">AI 분석을 생성하는 중...</p>
                </div>
              </div>
            ) : globalAnalysisContent ? (
              <div className="space-y-3">
                <div className="flex items-center justify-end mb-2">
                  <button
                    onClick={() => {
                      const element = document.createElement('a')
                      const blob = new Blob([globalAnalysisContent], { type: 'text/plain' })
                      element.href = URL.createObjectURL(blob)
                      element.download = `AI_분석_전체_${new Date().toISOString().split('T')[0]}.txt`
                      element.click()
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-xs font-medium border border-gray-200"
                  >
                    텍스트로 저장
                  </button>
                </div>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                  {globalAnalysisContent.split('\n').map((line, index) => {
                    if (line.startsWith('##')) {
                      return <h4 key={index} className="text-base font-bold text-gray-900 mt-4 mb-2">{line.replace('##', '').trim()}</h4>
                    } else if (line.startsWith('###')) {
                      return <h5 key={index} className="text-sm font-bold text-gray-800 mt-3 mb-1.5">{line.replace('###', '').trim()}</h5>
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
      </div>
      </>
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

  // 당사 회사명 (SK AX로 가정)
  const ourCompany = 'SK AX'
  
  // 포지션별 채용 급증 분석
  const positionSurgeAnalysis = useMemo(() => {
    // 시간 필터에 따른 기간 설정
    const now = new Date()
    let recentPeriod: Date
    let previousPeriod: Date
    
    switch (positionSurgeTimeframe) {
      case 'Daily':
        recentPeriod = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 최근 1일
        previousPeriod = new Date(recentPeriod.getTime() - 1 * 24 * 60 * 60 * 1000) // 이전 1일
        break
      case 'Weekly':
        recentPeriod = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 최근 7일
        previousPeriod = new Date(recentPeriod.getTime() - 7 * 24 * 60 * 60 * 1000) // 이전 7일
        break
      case 'Monthly':
        recentPeriod = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 최근 30일
        previousPeriod = new Date(recentPeriod.getTime() - 30 * 24 * 60 * 60 * 1000) // 이전 30일
        break
    }
    
    const positionCounts: Record<string, {
      recent: number
      previous: number
      companies: Set<string>
      ourCompanyCount: number
      total: number
    }> = {}
    
    jobPostingsData.forEach(job => {
      const postedDate = new Date(job.posted_date)
      const jobCategory = job.meta_data?.job_category || '기타'
      const jobTitle = job.title || ''
      
      // 포지션명 결정 (카테고리 우선, 없으면 제목에서 추출)
      let position = jobCategory
      if (jobCategory === '기타' || !jobCategory) {
        // 제목에서 포지션 추출 시도
        const titleLower = jobTitle.toLowerCase()
        if (titleLower.includes('개발') || titleLower.includes('developer')) {
          if (titleLower.includes('백엔드') || titleLower.includes('backend')) position = '백엔드 개발'
          else if (titleLower.includes('프론트') || titleLower.includes('frontend')) position = '프론트엔드 개발'
          else if (titleLower.includes('ai') || titleLower.includes('인공지능')) position = 'AI/ML'
          else position = '개발'
        } else if (titleLower.includes('ai') || titleLower.includes('인공지능') || titleLower.includes('ml')) {
          position = 'AI/ML'
        } else if (titleLower.includes('인프라') || titleLower.includes('infra') || titleLower.includes('cloud')) {
          position = '인프라/클라우드'
        } else if (titleLower.includes('아키텍트') || titleLower.includes('architect')) {
          position = '아키텍트'
        } else if (titleLower.includes('pm') || titleLower.includes('프로젝트') || titleLower.includes('product manager')) {
          position = '프로젝트 관리'
        } else if (titleLower.includes('데이터') || titleLower.includes('data')) {
          position = '데이터'
        } else if (titleLower.includes('디자인') || titleLower.includes('designer') || titleLower.includes('ui') || titleLower.includes('ux')) {
          position = 'UI/UX 디자인'
        } else if (titleLower.includes('qa') || titleLower.includes('품질') || titleLower.includes('quality')) {
          position = 'QA/품질관리'
        } else if (titleLower.includes('영업') || titleLower.includes('sales')) {
          position = '영업'
        } else if (titleLower.includes('기획') || titleLower.includes('planning')) {
          position = '기획'
        }
      }
      
      if (!positionCounts[position]) {
        positionCounts[position] = {
          recent: 0,
          previous: 0,
          companies: new Set(),
          ourCompanyCount: 0,
          total: 0
        }
      }
      
      const companyName = job.company.replace('(주)', '').trim()
      positionCounts[position].companies.add(companyName)
      positionCounts[position].total++
      
      // 당사 공고인지 확인
      if (companyName.includes(ourCompany) || ourCompany.includes(companyName)) {
        positionCounts[position].ourCompanyCount++
      }
      
      // 기간별 집계
      if (postedDate >= recentPeriod) {
        positionCounts[position].recent++
      } else if (postedDate >= previousPeriod) {
        positionCounts[position].previous++
      }
    })
    
    // 모든 포지션을 분석 (조건 완화: 증가율 20% 이상 또는 최근 2건 이상)
    const surges: Array<{
      position: string
      recent: number
      previous: number
      growthRate: number
      companies: string[]
      isOurPosition: boolean
      ourCompanyCount: number
      total: number
    }> = []
    
    Object.entries(positionCounts).forEach(([position, data]) => {
      // 최소 2건 이상의 공고가 있어야 표시
      if (data.total < 2) return
      
      let growthRate = 0
      if (data.previous > 0) {
        growthRate = ((data.recent - data.previous) / data.previous) * 100
      } else if (data.recent > 0) {
        growthRate = Infinity // 신규 급증
      }
      
      // 모든 포지션 표시 (최소 1건 이상)
      surges.push({
        position,
        recent: data.recent,
        previous: data.previous,
        growthRate: growthRate === Infinity ? Infinity : Math.round(growthRate),
        companies: Array.from(data.companies),
        isOurPosition: data.ourCompanyCount > 0,
        ourCompanyCount: data.ourCompanyCount,
        total: data.total
      })
    })
    
    // 증가율 순으로 정렬 (신규 급증 > 높은 증가율 > 최근 공고 수)
    return surges.sort((a, b) => {
      // 신규 급증 우선
      if (a.growthRate === Infinity && b.growthRate !== Infinity) return -1
      if (a.growthRate !== Infinity && b.growthRate === Infinity) return 1
      // 증가율이 같으면 최근 공고 수로 정렬
      if (a.growthRate === b.growthRate) {
        return b.recent - a.recent
      }
      return b.growthRate - a.growthRate
    })
  }, [positionSurgeTimeframe])
  
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

  // 백엔드에서 받은 데이터가 없으면 기본 데이터 사용
  const skillsDataToUse = skillsData.length > 0 ? skillsData : defaultSkillsData

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
    const maxCount = skillsDataToUse[0]?.count || 1
    
    // 모든 스킬의 크기 계산
    for (let i = 0; i < skillsDataToUse.length; i++) {
      const size = getSkillSize(skillsDataToUse[i].count, i, maxCount)
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
    for (let index = 1; index < skillsDataToUse.length; index++) {
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
    const maxCount = skillsDataToUse[0]?.count || 1
    const skillCount = Math.min(13, skillsDataToUse.length)  // 13개 (중앙 1 + 내부원 6 + 외부원 6)
    
    const skills: Array<{
      x: number, 
      y: number, 
      size: {pixelWidth: number, pixelHeight: number}
    }> = []
    
    for (let index = 0; index < skillCount; index++) {
      const size = getSkillSize(skillsDataToUse[index].count, index, maxCount)
      
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
  const selectedSkillData = skillsDataToUse.find(s => s.name === selectedSkill) || skillsDataToUse[0]

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

  // 주간 채용 공고 수 추이 데이터 (최근 12주)
  const weeklyJobPostingsData = [
    { week: '9월 1주', count: 850 },
    { week: '9월 2주', count: 920 },
    { week: '9월 3주', count: 1050 },
    { week: '9월 4주', count: 1380 },
    { week: '10월 1주', count: 1420 },
    { week: '10월 2주', count: 1580 },
    { week: '10월 3주', count: 1450 },
    { week: '10월 4주', count: 1350 },
    { week: '11월 1주', count: 1280 },
    { week: '11월 2주', count: 1320 },
    { week: '11월 3주', count: 1300 },
    { week: '11월 4주', count: 1300 },
  ]

  // 일간 채용 공고 수 추이 데이터 (최근 30일)
  const dailyJobPostingsData = [
    { day: '11/1', count: 180 },
    { day: '11/2', count: 195 },
    { day: '11/3', count: 210 },
    { day: '11/4', count: 185 },
    { day: '11/5', count: 200 },
    { day: '11/6', count: 175 },
    { day: '11/7', count: 190 },
    { day: '11/8', count: 205 },
    { day: '11/9', count: 220 },
    { day: '11/10', count: 195 },
    { day: '11/11', count: 210 },
    { day: '11/12', count: 225 },
    { day: '11/13', count: 200 },
    { day: '11/14', count: 215 },
    { day: '11/15', count: 230 },
    { day: '11/16', count: 205 },
    { day: '11/17', count: 220 },
    { day: '11/18', count: 235 },
    { day: '11/19', count: 210 },
    { day: '11/20', count: 225 },
    { day: '11/21', count: 240 },
    { day: '11/22', count: 215 },
    { day: '11/23', count: 230 },
    { day: '11/24', count: 245 },
    { day: '11/25', count: 220 },
    { day: '11/26', count: 235 },
    { day: '11/27', count: 250 },
    { day: '11/28', count: 225 },
    { day: '11/29', count: 240 },
    { day: '11/30', count: 255 },
  ]

  // API에서 채용 공고 수 추이 데이터 가져오기
  useEffect(() => {
    const fetchJobPostingsTrend = async () => {
      setIsLoadingJobPostingsTrend(true)
      setJobPostingsTrendError(null)
      
      try {
        // API endpoint에 timeframe 파라미터 전달
        // Swagger UI 테스트: https://speedjobs-backend.skala25a.project.skala-ai.com/docs 에서 확인 가능
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-postings-trend?timeframe=${jobPostingsTrendTimeframe.toLowerCase()}`
        console.log('=== 채용 공고 수 추이 API 호출 ===')
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
        console.log('응답 OK:', response.ok)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('백엔드에서 받은 채용 공고 수 추이 데이터:', result)
        console.log('응답 타입:', typeof result)
        console.log('result.data 타입:', typeof result.data)
        console.log('result.data가 배열인가?', Array.isArray(result.data))
        
        // API 응답 형식 확인 및 데이터 추출
        let data: Array<{ period: string; count: number }> = []
        
        // 공통 응답 형식: { status, code, message, data }
        if (result.status === 200 && result.code === 'SUCCESS' && result.data) {
          if (Array.isArray(result.data)) {
            data = result.data
          } 
          // data가 객체이고 내부에 배열이 있는 경우 (예: { trends: [...] })
          else if (typeof result.data === 'object' && result.data !== null) {
            // 가능한 필드명들 확인
            const possibleArrayFields = ['trends', 'data', 'items', 'results', 'list']
            for (const field of possibleArrayFields) {
              if (Array.isArray(result.data[field])) {
                console.log(`데이터를 ${field} 필드에서 찾았습니다.`)
                data = result.data[field]
                break
              }
            }
            
            // 배열 필드를 찾지 못한 경우, 객체의 모든 값 중 배열인 것을 찾기
            if (data.length === 0) {
              const values = Object.values(result.data)
              for (const value of values) {
                if (Array.isArray(value)) {
                  console.log('객체 내부에서 배열을 찾았습니다:', value)
                  data = value as Array<{ period: string; count: number }>
                  break
                }
              }
            }
            
            if (data.length === 0) {
              console.error('응답 data 객체 구조:', result.data)
              console.error('객체의 키들:', Object.keys(result.data))
              throw new Error(`Invalid data format: data is an object but no array found. Keys: ${Object.keys(result.data).join(', ')}`)
            }
          } else {
            console.warn('응답 data가 배열도 객체도 아닙니다:', result.data)
            throw new Error(`Invalid data format: data is not an array or object. Type: ${typeof result.data}`)
          }
        } 
        // 직접 배열 형식: [{ period: "2025-11-01", count: 180 }, ...]
        else if (Array.isArray(result)) {
          data = result
        } 
        else {
          console.error('예상하지 못한 응답 형식:', result)
          console.error('응답의 키들:', Object.keys(result))
          throw new Error(`Invalid data format: expected array or {status, code, data}, got ${typeof result}. Keys: ${Object.keys(result).join(', ')}`)
        }
        
        // period 형식을 화면 표시용으로 변환
        const formattedData = data.map(item => {
          const date = new Date(item.period)
          let formattedPeriod = item.period
          
          if (jobPostingsTrendTimeframe === 'Daily') {
            // 일간: "11/1" 형식으로 변환
            const month = date.getMonth() + 1
            const day = date.getDate()
            formattedPeriod = `${month}/${day}`
          } else if (jobPostingsTrendTimeframe === 'Weekly') {
            // 주간: API에서 주차 정보를 제공하면 그대로 사용, 아니면 period 그대로 사용
            formattedPeriod = item.period
          } else {
            // 월간: "2025-11" 형식으로 변환
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            formattedPeriod = `${year}-${month}`
          }
          
          return {
            period: formattedPeriod,
            count: item.count
          }
        })
        
        console.log('변환된 데이터:', formattedData)
        setJobPostingsTrendApiData(formattedData)
      } catch (error) {
        console.error('Error fetching job postings trend:', error)
        setJobPostingsTrendError(error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.')
        // 에러 발생 시 빈 배열로 설정하여 fallback 데이터 사용
        setJobPostingsTrendApiData([])
      } finally {
        setIsLoadingJobPostingsTrend(false)
      }
    }
    
    fetchJobPostingsTrend()
  }, [jobPostingsTrendTimeframe])

  // timeframe에 따른 채용 공고 수 추이 데이터 선택
  // API 데이터가 있으면 사용하고, 없으면 fallback 데이터 사용
  const jobPostingsTrendData = useMemo(() => {
    // API 데이터가 있으면 사용
    if (jobPostingsTrendApiData.length > 0) {
      return jobPostingsTrendApiData
    }
    
    // Fallback 데이터 사용
    if (jobPostingsTrendTimeframe === 'Daily') {
      return dailyJobPostingsData.map(item => ({ period: item.day, count: item.count }))
    } else if (jobPostingsTrendTimeframe === 'Weekly') {
      return weeklyJobPostingsData.map(item => ({ period: item.week, count: item.count }))
    } else {
      return monthlyJobPostingsData.map(item => ({ period: item.month, count: item.count }))
    }
  }, [jobPostingsTrendTimeframe, jobPostingsTrendApiData])

  // timeframe에 따른 차트 제목
  const trendChartTitle = useMemo(() => {
    if (jobPostingsTrendTimeframe === 'Daily') {
      return '일간 채용 공고 수 추이'
    } else if (jobPostingsTrendTimeframe === 'Weekly') {
      return '주간 채용 공고 수 추이'
    } else {
      return '월간 채용 공고 수 추이'
    }
  }, [jobPostingsTrendTimeframe])

  // timeframe에 따른 Y축 최대값
  const trendYAxisMax = useMemo(() => {
    if (jobPostingsTrendTimeframe === 'Daily') {
      return 300
    } else if (jobPostingsTrendTimeframe === 'Weekly') {
      return 2000
    } else {
      return 7000
    }
  }, [jobPostingsTrendTimeframe])

  // 주요 회사별 채용 활동 데이터 - 월간 (8개 경쟁사 - saramin 제외)
  const companyRecruitmentDataMonthly = [
    { period: '2025-01', toss: 120, line: 80, hanwha: 100, kakao: 150, naver: 180, samsung: 140, lg: 90, sk: 110 },
    { period: '2025-02', toss: 180, line: 120, hanwha: 150, kakao: 200, naver: 240, samsung: 190, lg: 130, sk: 160 },
    { period: '2025-03', toss: 150, line: 100, hanwha: 130, kakao: 180, naver: 220, samsung: 170, lg: 110, sk: 140 },
    { period: '2025-04', toss: 220, line: 160, hanwha: 190, kakao: 260, naver: 300, samsung: 240, lg: 180, sk: 200 },
    { period: '2025-05', toss: 280, line: 220, hanwha: 250, kakao: 320, naver: 380, samsung: 300, lg: 240, sk: 260 },
    { period: '2025-06', toss: 240, line: 200, hanwha: 220, kakao: 280, naver: 340, samsung: 260, lg: 200, sk: 230 },
    { period: '2025-07', toss: 320, line: 260, hanwha: 290, kakao: 360, naver: 420, samsung: 340, lg: 280, sk: 300 },
    { period: '2025-08', toss: 380, line: 320, hanwha: 350, kakao: 420, naver: 480, samsung: 400, lg: 340, sk: 360 },
    { period: '2025-09', toss: 450, line: 380, hanwha: 400, kakao: 480, naver: 560, samsung: 450, lg: 390, sk: 410 },
    { period: '2025-10', toss: 680, line: 520, hanwha: 580, kakao: 720, naver: 850, samsung: 680, lg: 600, sk: 640 },
    { period: '2025-11', toss: 620, line: 480, hanwha: 540, kakao: 680, naver: 800, samsung: 620, lg: 550, sk: 580 },
  ]

  // 주요 회사별 채용 활동 데이터 - 주간 (최근 12주)
  const companyRecruitmentDataWeekly = [
    { period: '9월 1주', toss: 95, line: 65, hanwha: 70, kakao: 85, naver: 100, samsung: 80, lg: 60, sk: 75 },
    { period: '9월 2주', toss: 105, line: 75, hanwha: 80, kakao: 95, naver: 110, samsung: 90, lg: 70, sk: 85 },
    { period: '9월 3주', toss: 115, line: 85, hanwha: 90, kakao: 105, naver: 120, samsung: 100, lg: 80, sk: 95 },
    { period: '9월 4주', toss: 135, line: 105, hanwha: 110, kakao: 125, naver: 140, samsung: 120, lg: 100, sk: 115 },
    { period: '10월 1주', toss: 140, line: 110, hanwha: 115, kakao: 130, naver: 145, samsung: 125, lg: 105, sk: 120 },
    { period: '10월 2주', toss: 155, line: 125, hanwha: 130, kakao: 145, naver: 160, samsung: 140, lg: 120, sk: 135 },
    { period: '10월 3주', toss: 145, line: 115, hanwha: 120, kakao: 135, naver: 150, samsung: 130, lg: 110, sk: 125 },
    { period: '10월 4주', toss: 135, line: 105, hanwha: 110, kakao: 125, naver: 140, samsung: 120, lg: 100, sk: 115 },
    { period: '11월 1주', toss: 130, line: 100, hanwha: 105, kakao: 120, naver: 135, samsung: 115, lg: 95, sk: 110 },
    { period: '11월 2주', toss: 135, line: 105, hanwha: 110, kakao: 125, naver: 140, samsung: 120, lg: 100, sk: 115 },
    { period: '11월 3주', toss: 130, line: 100, hanwha: 105, kakao: 120, naver: 135, samsung: 115, lg: 95, sk: 110 },
    { period: '11월 4주', toss: 130, line: 100, hanwha: 105, kakao: 120, naver: 135, samsung: 115, lg: 95, sk: 110 },
  ]

  // 주요 회사별 채용 활동 데이터 - 일간 (최근 30일)
  const companyRecruitmentDataDaily = [
    { period: '11/1', toss: 18, line: 14, hanwha: 15, kakao: 17, naver: 19, samsung: 16, lg: 13, sk: 15 },
    { period: '11/2', toss: 19, line: 15, hanwha: 16, kakao: 18, naver: 20, samsung: 17, lg: 14, sk: 16 },
    { period: '11/3', toss: 21, line: 16, hanwha: 17, kakao: 19, naver: 21, samsung: 18, lg: 15, sk: 17 },
    { period: '11/4', toss: 18, line: 14, hanwha: 15, kakao: 17, naver: 19, samsung: 16, lg: 13, sk: 15 },
    { period: '11/5', toss: 20, line: 15, hanwha: 16, kakao: 18, naver: 20, samsung: 17, lg: 14, sk: 16 },
    { period: '11/6', toss: 17, line: 13, hanwha: 14, kakao: 16, naver: 18, samsung: 15, lg: 12, sk: 14 },
    { period: '11/7', toss: 19, line: 15, hanwha: 16, kakao: 18, naver: 20, samsung: 17, lg: 14, sk: 16 },
    { period: '11/8', toss: 20, line: 16, hanwha: 17, kakao: 19, naver: 21, samsung: 18, lg: 15, sk: 17 },
    { period: '11/9', toss: 22, line: 17, hanwha: 18, kakao: 20, naver: 22, samsung: 19, lg: 16, sk: 18 },
    { period: '11/10', toss: 19, line: 15, hanwha: 16, kakao: 18, naver: 20, samsung: 17, lg: 14, sk: 16 },
    { period: '11/11', toss: 21, line: 16, hanwha: 17, kakao: 19, naver: 21, samsung: 18, lg: 15, sk: 17 },
    { period: '11/12', toss: 22, line: 17, hanwha: 18, kakao: 20, naver: 22, samsung: 19, lg: 16, sk: 18 },
    { period: '11/13', toss: 20, line: 15, hanwha: 16, kakao: 18, naver: 20, samsung: 17, lg: 14, sk: 16 },
    { period: '11/14', toss: 21, line: 16, hanwha: 17, kakao: 19, naver: 21, samsung: 18, lg: 15, sk: 17 },
    { period: '11/15', toss: 23, line: 18, hanwha: 19, kakao: 21, naver: 23, samsung: 20, lg: 17, sk: 19 },
    { period: '11/16', toss: 20, line: 15, hanwha: 16, kakao: 18, naver: 20, samsung: 17, lg: 14, sk: 16 },
    { period: '11/17', toss: 22, line: 17, hanwha: 18, kakao: 20, naver: 22, samsung: 19, lg: 16, sk: 18 },
    { period: '11/18', toss: 23, line: 18, hanwha: 19, kakao: 21, naver: 23, samsung: 20, lg: 17, sk: 19 },
    { period: '11/19', toss: 21, line: 16, hanwha: 17, kakao: 19, naver: 21, samsung: 18, lg: 15, sk: 17 },
    { period: '11/20', toss: 22, line: 17, hanwha: 18, kakao: 20, naver: 22, samsung: 19, lg: 16, sk: 18 },
    { period: '11/21', toss: 24, line: 19, hanwha: 20, kakao: 22, naver: 24, samsung: 21, lg: 18, sk: 20 },
    { period: '11/22', toss: 21, line: 16, hanwha: 17, kakao: 19, naver: 21, samsung: 18, lg: 15, sk: 17 },
    { period: '11/23', toss: 23, line: 18, hanwha: 19, kakao: 21, naver: 23, samsung: 20, lg: 17, sk: 19 },
    { period: '11/24', toss: 24, line: 19, hanwha: 20, kakao: 22, naver: 24, samsung: 21, lg: 18, sk: 20 },
    { period: '11/25', toss: 22, line: 17, hanwha: 18, kakao: 20, naver: 22, samsung: 19, lg: 16, sk: 18 },
    { period: '11/26', toss: 23, line: 18, hanwha: 19, kakao: 21, naver: 23, samsung: 20, lg: 17, sk: 19 },
    { period: '11/27', toss: 25, line: 20, hanwha: 21, kakao: 23, naver: 25, samsung: 22, lg: 19, sk: 21 },
    { period: '11/28', toss: 22, line: 17, hanwha: 18, kakao: 20, naver: 22, samsung: 19, lg: 16, sk: 18 },
    { period: '11/29', toss: 24, line: 19, hanwha: 20, kakao: 22, naver: 24, samsung: 21, lg: 18, sk: 20 },
    { period: '11/30', toss: 25, line: 20, hanwha: 21, kakao: 23, naver: 25, samsung: 22, lg: 19, sk: 21 },
  ]

  // API 응답 데이터를 차트 형식으로 변환
  const transformApiDataToChartFormat = useCallback((
    activities: Array<{ period: string; counts: Record<string, number> }>,
    companies: Array<{ id: number; name: string; key: string }>
  ) => {
    // 회사 이름을 key로 매핑하는 맵 생성
    const nameToKeyMap: Record<string, string> = {}
    companies.forEach(company => {
      // 정확한 이름 매핑
      nameToKeyMap[company.name] = company.key
      
      // 다양한 이름 변형도 매핑
      if (company.name === 'LG_CNS') {
        nameToKeyMap['lg_cns'] = company.key
        nameToKeyMap['LG_CNS'] = company.key
      }
      if (company.name === '네이버') {
        nameToKeyMap['네이버'] = company.key
      }
      if (company.name === '토스') {
        nameToKeyMap['토스'] = company.key
      }
      if (company.name === '한화시스템') {
        nameToKeyMap['한화시스템'] = company.key
        nameToKeyMap['한화 시스템'] = company.key
      }
      if (company.name === '현대오토에버') {
        nameToKeyMap['현대오토에버'] = company.key
      }
      if (company.name === '카카오') {
        nameToKeyMap['카카오'] = company.key
      }
      if (company.name === 'LINE') {
        nameToKeyMap['LINE'] = company.key
        nameToKeyMap['line'] = company.key
        nameToKeyMap['라인'] = company.key
      }
      if (company.name === '우아한형제들') {
        nameToKeyMap['우아한형제들'] = company.key
        nameToKeyMap['우아한'] = company.key
      }
    })

    // 모든 회사의 key 목록
    const allCompanyKeys = companies.map(c => c.key)

    // activities를 차트 형식으로 변환
    return activities.map(activity => {
      const chartData: Record<string, any> = {
        period: activity.period
      }

      // 모든 회사에 대해 초기값 0 설정
      allCompanyKeys.forEach(key => {
        chartData[key] = 0
      })

      // counts 객체의 값을 차트 데이터에 매핑
      Object.entries(activity.counts).forEach(([companyName, count]) => {
        // 회사 이름을 key로 변환
        const companyKey = nameToKeyMap[companyName] || companyName.toLowerCase().replace(/\s+/g, '_')
        if (allCompanyKeys.includes(companyKey)) {
          chartData[companyKey] = count
        }
      })

      return chartData
    })
  }, [])

  // timeframe에 따른 회사별 채용 활동 데이터 선택
  const companyRecruitmentData = useMemo(() => {
    // API 데이터가 있고 에러가 없으면 API 데이터 사용
    if (companyRecruitmentApiData && !companyRecruitmentError) {
      const transformedData = transformApiDataToChartFormat(
        companyRecruitmentApiData.activities,
        companyRecruitmentApiData.companies
      )
      // period 기준으로 정렬 (날짜 순서)
      return transformedData.sort((a, b) => {
        // period 형식을 파싱하는 함수
        const parsePeriod = (period: string): number => {
          // "MM/DD" 형식 (일간)
          if (period.includes('/') && period.split('/').length === 2) {
            const [month, day] = period.split('/').map(Number)
            const currentYear = new Date().getFullYear()
            return new Date(currentYear, month - 1, day).getTime()
          }
          // "YYYY-MM" 형식 (월간)
          if (period.match(/^\d{4}-\d{2}$/)) {
            return new Date(period + '-01').getTime()
          }
          // "N월 N주" 형식 (주간) - 예: "11월 1주", "10월 4주"
          const weekMatch = period.match(/(\d+)월\s*(\d+)주/)
          if (weekMatch) {
            const month = parseInt(weekMatch[1])
            const week = parseInt(weekMatch[2])
            const currentYear = new Date().getFullYear()
            // 주차를 대략적인 날짜로 변환 (첫 주의 첫 날 기준)
            const firstDayOfMonth = new Date(currentYear, month - 1, 1)
            const dayOfWeek = firstDayOfMonth.getDay()
            const firstMonday = firstDayOfMonth.getDate() + (1 - dayOfWeek + 7) % 7
            const targetDate = new Date(currentYear, month - 1, firstMonday + (week - 1) * 7)
            return targetDate.getTime()
          }
          // 기타 형식은 문자열 비교
          return period.localeCompare(b.period)
        }
        return parsePeriod(a.period) - parsePeriod(b.period)
      })
    }

    // API 데이터가 없으면 기본 데이터 사용
    if (companyRecruitmentTimeframe === 'Daily') {
      return companyRecruitmentDataDaily
    } else if (companyRecruitmentTimeframe === 'Weekly') {
      return companyRecruitmentDataWeekly
    } else {
      return companyRecruitmentDataMonthly
    }
  }, [companyRecruitmentTimeframe, companyRecruitmentApiData, companyRecruitmentError, transformApiDataToChartFormat])

  // timeframe에 따른 회사별 채용 활동 차트 제목
  const companyRecruitmentTitle = useMemo(() => {
    if (companyRecruitmentTimeframe === 'Daily') {
      return '일간 주요 회사별 채용 활동'
    } else if (companyRecruitmentTimeframe === 'Weekly') {
      return '주간 주요 회사별 채용 활동'
    } else {
      return '월간 주요 회사별 채용 활동'
    }
  }, [companyRecruitmentTimeframe])

  // timeframe에 따른 회사별 채용 활동 Y축 최대값 (동적 계산)
  const companyRecruitmentYAxisMax = useMemo(() => {
    // API 데이터가 있으면 데이터 기반으로 계산
    if (companyRecruitmentData && companyRecruitmentData.length > 0) {
      let maxValue = 0
      companyRecruitmentData.forEach(item => {
        Object.values(item).forEach(value => {
          if (typeof value === 'number' && value > maxValue) {
            maxValue = value
          }
        })
      })
      // 최대값의 1.2배로 설정 (여유 공간)
      return Math.ceil(maxValue * 1.2)
    }
    
    // 기본값
    if (companyRecruitmentTimeframe === 'Daily') {
      return 30
    } else if (companyRecruitmentTimeframe === 'Weekly') {
      return 200
    } else {
      return 1200
    }
  }, [companyRecruitmentTimeframe, companyRecruitmentData])

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

  // 회사별 채용 활동 회사 목록 (API 데이터가 있으면 사용, 없으면 기본 데이터 사용)
  const recruitmentCompanies = useMemo(() => {
    if (companyRecruitmentApiData && companyRecruitmentApiData.companies.length > 0) {
      // API에서 받은 회사 목록을 사용
      return companyRecruitmentApiData.companies.map(company => {
        // 회사 key에 따라 색상 매핑
        const colorMap: Record<string, string> = {
          'toss': companyColors.toss,
          'line': companyColors.line,
          'hanwha': companyColors.hanwha,
          'kakao': companyColors.kakao,
          'naver': companyColors.naver,
          'samsung': companyColors.samsung,
          'lg': companyColors.lg,
          'hyundai_autoever': '#f59e0b', // amber
          'woowahan': '#84cc16', // lime
        }
        return {
          key: company.key,
          name: company.name,
          color: colorMap[company.key] || '#6b7280' // 기본 회색
        }
      })
    }
    // 기본 회사 목록
    return [
      { key: 'toss', name: '토스', color: companyColors.toss },
      { key: 'line', name: '라인', color: companyColors.line },
      { key: 'hanwha', name: '한화 시스템', color: companyColors.hanwha },
      { key: 'kakao', name: '카카오', color: companyColors.kakao },
      { key: 'naver', name: '네이버', color: companyColors.naver },
      { key: 'samsung', name: '삼성 SDS', color: companyColors.samsung },
      { key: 'lg', name: 'LG CNS', color: companyColors.lg },
      { key: 'sk', name: 'SK AX', color: companyColors.sk },
    ]
  }, [companyRecruitmentApiData])

  // 회사 이름을 key로 매핑하는 함수
  const getCompanyKeyFromName = useCallback((companyName: string, companies: Array<{ id: number; name: string; key: string }>): string | null => {
    // 정확한 이름 매칭
    const exactMatch = companies.find(c => c.name === companyName)
    if (exactMatch) return exactMatch.key
    
    // 부분 매칭 (대소문자 무시)
    const partialMatch = companies.find(c => 
      c.name.toLowerCase().includes(companyName.toLowerCase()) ||
      companyName.toLowerCase().includes(c.name.toLowerCase())
    )
    if (partialMatch) return partialMatch.key
    
    // 특수 케이스 매핑
    const nameMapping: Record<string, string> = {
      '네이버': 'naver',
      'lg_cns': 'lg',
      'LG_CNS': 'lg',
      '토스': 'toss',
      '한화시스템': 'hanwha',
      '한화 시스템': 'hanwha',
      '현대오토에버': 'hyundai_autoever',
      '카카오': 'kakao',
      'line': 'line',
      'LINE': 'line',
      '라인': 'line',
      '우아한형제들': 'woowahan',
      '우아한': 'woowahan',
    }
    
    return nameMapping[companyName] || null
  }, [])

  // hex 색상을 rgba로 변환하는 헬퍼 함수
  const hexToRgba = useCallback((hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }, [])

  // 회사 선택 함수
  // 처음에는 모든 회사가 선택되어 있고, 첫 클릭 시 해당 회사만 선택
  // 이후에는 토글 방식으로 동작
  const toggleRecruitmentCompany = (companyKey: string) => {
    setSelectedRecruitmentCompanies(prev => {
      const allCompanyKeys = recruitmentCompanies.map(c => c.key)
      const isAllSelected = prev.length === allCompanyKeys.length && 
                            allCompanyKeys.every(key => prev.includes(key))
      
      // 처음 상태 (모든 회사 선택)에서 클릭하면 해당 회사만 선택
      if (isAllSelected) {
        return [companyKey]
      }
      
      // 이후에는 토글 방식
      if (prev.includes(companyKey)) {
        // 이미 선택된 회사를 클릭하면 선택 해제
        return prev.filter(c => c !== companyKey)
      } else {
        // 선택되지 않은 회사를 클릭하면 선택 추가
        return [...prev, companyKey]
      }
    })
  }

  // 회사별 스킬 다양성 데이터 - 전체보기 (누적)
  const companySkillDiversityDataAll = [
    { company: '토스', skills: 415 },
    { company: '라인', skills: 285 },
    { company: '한화', skills: 125 },
    { company: '카카오', skills: 90 },
    { company: '네이버', skills: 75 },
  ]

  // 회사별 스킬 다양성 데이터 - 연도별
  const companySkillDiversityDataByYear: Record<string, Array<{ company: string; skills: number }>> = {
    '2021': [
      { company: '토스', skills: 85 },
      { company: '라인', skills: 60 },
      { company: '한화', skills: 28 },
      { company: '카카오', skills: 20 },
      { company: '네이버', skills: 16 },
    ],
    '2022': [
      { company: '토스', skills: 130 },
      { company: '라인', skills: 90 },
      { company: '한화', skills: 42 },
      { company: '카카오', skills: 30 },
      { company: '네이버', skills: 24 },
    ],
    '2023': [
      { company: '토스', skills: 180 },
      { company: '라인', skills: 120 },
      { company: '한화', skills: 55 },
      { company: '카카오', skills: 40 },
      { company: '네이버', skills: 32 },
    ],
    '2024': [
      { company: '토스', skills: 320 },
      { company: '라인', skills: 220 },
      { company: '한화', skills: 95 },
      { company: '카카오', skills: 70 },
      { company: '네이버', skills: 58 },
    ],
    '2025': [
      { company: '토스', skills: 415 },
      { company: '라인', skills: 285 },
      { company: '한화', skills: 125 },
      { company: '카카오', skills: 90 },
      { company: '네이버', skills: 75 },
    ],
  }

  // 선택된 모드에 따른 회사별 스킬 다양성 데이터
  // API 데이터가 있으면 사용하고, 없으면 기본 데이터 사용 (fallback)
  const companySkillDiversityData = useMemo(() => {
    // API 데이터가 있고 에러가 없으면 API 데이터 사용
    if (companySkillDiversityApiData.length > 0 && !skillDiversityError) {
      return companySkillDiversityApiData
    }
    
    // API 데이터가 없으면 기본 데이터 사용
    if (skillDiversityViewMode === 'all') {
      return companySkillDiversityDataAll
    } else {
      return companySkillDiversityDataByYear[selectedYear] || companySkillDiversityDataAll
    }
  }, [skillDiversityViewMode, selectedYear, companySkillDiversityApiData, skillDiversityError])

  // 선택된 모드에 따른 Y축 최대값 (데이터 기반으로 동적 계산)
  const skillDiversityYAxisMax = useMemo(() => {
    if (companySkillDiversityData.length === 0) {
      // 기본값
      if (skillDiversityViewMode === 'all') {
        return 450
      } else if (selectedYear === '2021') {
        return 100
      } else if (selectedYear === '2022') {
        return 150
      } else if (selectedYear === '2023') {
        return 200
      } else if (selectedYear === '2024') {
        return 350
      } else {
        return 450
      }
    }
    
    // 데이터에서 최대값 찾기
    const maxSkills = Math.max(...companySkillDiversityData.map(item => item.skills))
    
    // 최대값의 1.2배로 설정 (여유 공간)
    const calculatedMax = Math.ceil(maxSkills * 1.2)
    
    // 최소값 보장
    if (skillDiversityViewMode === 'all') {
      return Math.max(calculatedMax, 450)
    } else if (selectedYear === '2021') {
      return Math.max(calculatedMax, 100)
    } else if (selectedYear === '2022') {
      return Math.max(calculatedMax, 150)
    } else if (selectedYear === '2023') {
      return Math.max(calculatedMax, 200)
    } else if (selectedYear === '2024') {
      return Math.max(calculatedMax, 350)
    } else {
      return Math.max(calculatedMax, 450)
    }
  }, [skillDiversityViewMode, selectedYear, companySkillDiversityData])

  // 회사별 상위 스킬 분기별 트렌드 데이터 - 연도별
  const companySkillTrendDataByYear: Record<string, Record<string, Array<{ month: string; python: number; sql: number; java: number; kubernetes: number; docker: number; react: number; typescript: number; aws: number; spring: number; nodejs: number }>>> = {
    '2021': {
      '토스': [
        { month: '2021.09', python: 5, sql: 4, java: 3, kubernetes: 1, docker: 2, react: 2, typescript: 1, aws: 1, spring: 2, nodejs: 2 },
        { month: '2021.10', python: 6, sql: 5, java: 4, kubernetes: 2, docker: 3, react: 3, typescript: 2, aws: 2, spring: 3, nodejs: 3 },
      ],
      '라인': [
        { month: '2021.09', python: 4, sql: 3, java: 2, kubernetes: 1, docker: 2, react: 1, typescript: 1, aws: 1, spring: 2, nodejs: 1 },
        { month: '2021.10', python: 5, sql: 4, java: 3, kubernetes: 1, docker: 2, react: 2, typescript: 1, aws: 1, spring: 2, nodejs: 2 },
      ],
      '한화': [
        { month: '2021.09', python: 2, sql: 2, java: 2, kubernetes: 0, docker: 1, react: 1, typescript: 0, aws: 0, spring: 1, nodejs: 1 },
        { month: '2021.10', python: 3, sql: 3, java: 2, kubernetes: 1, docker: 1, react: 1, typescript: 1, aws: 1, spring: 2, nodejs: 1 },
      ],
      '카카오': [
        { month: '2021.09', python: 3, sql: 2, java: 2, kubernetes: 1, docker: 1, react: 1, typescript: 1, aws: 1, spring: 1, nodejs: 1 },
        { month: '2021.10', python: 4, sql: 3, java: 3, kubernetes: 1, docker: 2, react: 2, typescript: 1, aws: 1, spring: 2, nodejs: 2 },
      ],
      '네이버': [
        { month: '2021.09', python: 3, sql: 2, java: 2, kubernetes: 0, docker: 1, react: 1, typescript: 1, aws: 1, spring: 1, nodejs: 1 },
        { month: '2021.10', python: 4, sql: 3, java: 2, kubernetes: 1, docker: 1, react: 1, typescript: 1, aws: 1, spring: 2, nodejs: 1 },
      ],
    },
    '2022': {
      '토스': [
        { month: '2022.09', python: 8, sql: 6, java: 5, kubernetes: 2, docker: 4, react: 3, typescript: 2, aws: 2, spring: 4, nodejs: 3 },
        { month: '2022.10', python: 10, sql: 8, java: 7, kubernetes: 3, docker: 5, react: 4, typescript: 3, aws: 3, spring: 5, nodejs: 4 },
      ],
      '라인': [
        { month: '2022.09', python: 6, sql: 5, java: 4, kubernetes: 2, docker: 3, react: 2, typescript: 2, aws: 2, spring: 3, nodejs: 2 },
        { month: '2022.10', python: 8, sql: 6, java: 5, kubernetes: 3, docker: 4, react: 3, typescript: 3, aws: 2, spring: 4, nodejs: 3 },
      ],
      '한화': [
        { month: '2022.09', python: 4, sql: 3, java: 3, kubernetes: 1, docker: 2, react: 1, typescript: 1, aws: 1, spring: 2, nodejs: 1 },
        { month: '2022.10', python: 5, sql: 4, java: 4, kubernetes: 1, docker: 2, react: 2, typescript: 1, aws: 1, spring: 3, nodejs: 2 },
      ],
      '카카오': [
        { month: '2022.09', python: 5, sql: 4, java: 3, kubernetes: 1, docker: 2, react: 2, typescript: 1, aws: 1, spring: 2, nodejs: 2 },
        { month: '2022.10', python: 6, sql: 5, java: 4, kubernetes: 2, docker: 3, react: 3, typescript: 2, aws: 2, spring: 3, nodejs: 3 },
      ],
      '네이버': [
        { month: '2022.09', python: 5, sql: 4, java: 3, kubernetes: 1, docker: 2, react: 2, typescript: 1, aws: 1, spring: 2, nodejs: 2 },
        { month: '2022.10', python: 6, sql: 5, java: 4, kubernetes: 2, docker: 2, react: 2, typescript: 2, aws: 1, spring: 3, nodejs: 2 },
      ],
    },
    '2023': {
      '토스': [
        { month: '2023.09', python: 15, sql: 12, java: 10, kubernetes: 5, docker: 8, react: 6, typescript: 5, aws: 4, spring: 7, nodejs: 6 },
        { month: '2023.10', python: 18, sql: 15, java: 12, kubernetes: 7, docker: 10, react: 8, typescript: 7, aws: 6, spring: 9, nodejs: 8 },
      ],
      '라인': [
        { month: '2023.09', python: 12, sql: 10, java: 8, kubernetes: 4, docker: 6, react: 5, typescript: 4, aws: 3, spring: 6, nodejs: 5 },
        { month: '2023.10', python: 15, sql: 12, java: 10, kubernetes: 6, docker: 8, react: 7, typescript: 6, aws: 5, spring: 8, nodejs: 7 },
      ],
      '한화': [
        { month: '2023.09', python: 8, sql: 7, java: 6, kubernetes: 2, docker: 4, react: 3, typescript: 2, aws: 2, spring: 4, nodejs: 3 },
        { month: '2023.10', python: 10, sql: 9, java: 8, kubernetes: 3, docker: 5, react: 4, typescript: 3, aws: 3, spring: 5, nodejs: 4 },
      ],
      '카카오': [
        { month: '2023.09', python: 10, sql: 8, java: 7, kubernetes: 3, docker: 5, react: 4, typescript: 3, aws: 3, spring: 5, nodejs: 4 },
        { month: '2023.10', python: 12, sql: 10, java: 9, kubernetes: 4, docker: 6, react: 5, typescript: 4, aws: 4, spring: 6, nodejs: 5 },
      ],
      '네이버': [
        { month: '2023.09', python: 9, sql: 7, java: 6, kubernetes: 2, docker: 4, react: 3, typescript: 2, aws: 2, spring: 4, nodejs: 3 },
        { month: '2023.10', python: 11, sql: 9, java: 8, kubernetes: 3, docker: 5, react: 4, typescript: 3, aws: 3, spring: 5, nodejs: 4 },
      ],
    },
    '2024': {
      '토스': [
        { month: '2024.09', python: 35, sql: 28, java: 25, kubernetes: 20, docker: 18, react: 15, typescript: 14, aws: 12, spring: 16, nodejs: 14 },
        { month: '2024.10', python: 45, sql: 38, java: 35, kubernetes: 28, docker: 25, react: 22, typescript: 20, aws: 18, spring: 20, nodejs: 18 },
      ],
      '라인': [
        { month: '2024.09', python: 30, sql: 24, java: 22, kubernetes: 18, docker: 16, react: 13, typescript: 12, aws: 10, spring: 14, nodejs: 12 },
        { month: '2024.10', python: 40, sql: 32, java: 30, kubernetes: 24, docker: 22, react: 19, typescript: 17, aws: 15, spring: 18, nodejs: 16 },
      ],
      '한화': [
        { month: '2024.09', python: 20, sql: 18, java: 16, kubernetes: 12, docker: 10, react: 8, typescript: 7, aws: 6, spring: 9, nodejs: 8 },
        { month: '2024.10', python: 28, sql: 24, java: 22, kubernetes: 18, docker: 15, react: 12, typescript: 11, aws: 9, spring: 12, nodejs: 11 },
      ],
      '카카오': [
        { month: '2024.09', python: 25, sql: 20, java: 18, kubernetes: 14, docker: 12, react: 10, typescript: 9, aws: 8, spring: 11, nodejs: 10 },
        { month: '2024.10', python: 35, sql: 28, java: 26, kubernetes: 20, docker: 18, react: 15, typescript: 14, aws: 12, spring: 15, nodejs: 14 },
      ],
      '네이버': [
        { month: '2024.09', python: 24, sql: 19, java: 17, kubernetes: 13, docker: 11, react: 9, typescript: 8, aws: 7, spring: 10, nodejs: 9 },
        { month: '2024.10', python: 32, sql: 26, java: 24, kubernetes: 18, docker: 16, react: 13, typescript: 12, aws: 10, spring: 13, nodejs: 12 },
      ],
    },
    '2025': {
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
    },
  }

  // 현재 분기와 이전 분기 계산 함수
  const getCurrentAndPreviousQuarters = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-12
    
    // 현재 분기 계산 (1분기: 1-3월, 2분기: 4-6월, 3분기: 7-9월, 4분기: 10-12월)
    const currentQuarter = Math.ceil(currentMonth / 3)
    
    // 현재 분기의 월들
    const currentQuarterMonths: number[] = []
    for (let i = (currentQuarter - 1) * 3 + 1; i <= currentQuarter * 3; i++) {
      currentQuarterMonths.push(i)
    }
    
    // 이전 분기 계산
    let previousQuarter = currentQuarter - 1
    let previousYear = currentYear
    if (previousQuarter === 0) {
      previousQuarter = 4
      previousYear = currentYear - 1
    }
    
    // 이전 분기의 월들
    const previousQuarterMonths: number[] = []
    for (let i = (previousQuarter - 1) * 3 + 1; i <= previousQuarter * 3; i++) {
      previousQuarterMonths.push(i)
    }
    
    return {
      currentYear,
      currentQuarterMonths,
      previousYear,
      previousQuarterMonths
    }
  }

  // 월을 분기로 변환하는 함수
  const getQuarterFromMonth = (year: number, month: number): string => {
    const quarter = Math.ceil(month / 3)
    return `${year} Q${quarter}`
  }

  // 전체보기 모드일 때 최근 5년 스킬별 스태킹 데이터
  const companySkillTrendDataAll = useMemo(() => {
    if (!selectedCompanyForSkills || skillDiversityViewMode !== 'all') return null
    
    const years = ['2021', '2022', '2023', '2024', '2025']
    const result: Array<{
      year: string;
      python: number;
      sql: number;
      java: number;
      kubernetes: number;
      docker: number;
      react: number;
      typescript: number;
      aws: number;
      spring: number;
      nodejs: number;
    }> = []
    
    years.forEach(year => {
      const yearData = companySkillTrendDataByYear[year]?.[selectedCompanyForSkills] || []
      if (yearData.length === 0) return
      
      // 해당 연도의 모든 월 데이터 합계
      const aggregated = yearData.reduce((acc, item) => ({
        year,
        python: acc.python + item.python,
        sql: acc.sql + item.sql,
        java: acc.java + item.java,
        kubernetes: acc.kubernetes + item.kubernetes,
        docker: acc.docker + item.docker,
        react: acc.react + item.react,
        typescript: acc.typescript + item.typescript,
        aws: acc.aws + item.aws,
        spring: acc.spring + item.spring,
        nodejs: acc.nodejs + item.nodejs,
      }), {
        year,
        python: 0,
        sql: 0,
        java: 0,
        kubernetes: 0,
        docker: 0,
        react: 0,
        typescript: 0,
        aws: 0,
        spring: 0,
        nodejs: 0,
      })
      
      result.push(aggregated)
    })
    
    return result.length > 0 ? result : null
  }, [selectedCompanyForSkills, skillDiversityViewMode])

  // 선택된 모드와 연도에 따른 회사별 상위 스킬 분기별 트렌드 데이터 (연도별 모드용)
  const companySkillTrendData = useMemo(() => {
    if (!selectedCompanyForSkills || skillDiversityViewMode === 'all') return null
    
    // 현재 분기와 이전 분기 정보 가져오기
    const { currentYear, currentQuarterMonths, previousYear, previousQuarterMonths } = getCurrentAndPreviousQuarters()
    const targetYear = parseInt(selectedYear)
    
    // 현재 연도와 이전 연도 데이터 가져오기
    const currentYearData = companySkillTrendDataByYear[targetYear.toString()]?.[selectedCompanyForSkills] || []
    const previousYearData = (previousYear !== targetYear) 
      ? companySkillTrendDataByYear[previousYear.toString()]?.[selectedCompanyForSkills] || []
      : []
    
    // 모든 데이터 합치기
    const allData = [...currentYearData, ...previousYearData]
    
    if (allData.length === 0) return null
    
    // 현재 분기와 이전 분기의 월 데이터만 필터링
    const filteredData = allData.filter(item => {
      const [year, month] = item.month.split('.').map(Number)
      
      // 현재 연도의 현재 분기 월들
      if (year === targetYear && currentQuarterMonths.includes(month)) {
        return true
      }
      
      // 이전 연도의 이전 분기 월들 (연도가 바뀐 경우)
      if (year === previousYear && previousQuarterMonths.includes(month)) {
        return true
      }
      
      // 같은 연도의 이전 분기 월들
      if (year === targetYear && previousYear === targetYear && previousQuarterMonths.includes(month)) {
        return true
      }
      
      return false
    })
    
    // 월 순서대로 정렬
    filteredData.sort((a, b) => {
      const [yearA, monthA] = a.month.split('.').map(Number)
      const [yearB, monthB] = b.month.split('.').map(Number)
      if (yearA !== yearB) return yearA - yearB
      return monthA - monthB
    })
    
    // 분기별로 집계
    const quarterMap = new Map<string, {
      quarter: string;
      python: number;
      sql: number;
      java: number;
      kubernetes: number;
      docker: number;
      react: number;
      typescript: number;
      aws: number;
      spring: number;
      nodejs: number;
      count: number; // 해당 분기의 월 개수
    }>()
    
    filteredData.forEach(item => {
      const [year, month] = item.month.split('.').map(Number)
      const quarter = getQuarterFromMonth(year, month)
      
      if (!quarterMap.has(quarter)) {
        quarterMap.set(quarter, {
          quarter,
          python: 0,
          sql: 0,
          java: 0,
          kubernetes: 0,
          docker: 0,
          react: 0,
          typescript: 0,
          aws: 0,
          spring: 0,
          nodejs: 0,
          count: 0
        })
      }
      
      const quarterData = quarterMap.get(quarter)!
      quarterData.python += item.python
      quarterData.sql += item.sql
      quarterData.java += item.java
      quarterData.kubernetes += item.kubernetes
      quarterData.docker += item.docker
      quarterData.react += item.react
      quarterData.typescript += item.typescript
      quarterData.aws += item.aws
      quarterData.spring += item.spring
      quarterData.nodejs += item.nodejs
      quarterData.count += 1
    })
    
    // 분기별 평균 계산 (또는 합계 유지 - 여기서는 합계로 유지)
    const quarterDataArray = Array.from(quarterMap.values()).map(item => {
      const { count, ...rest } = item
      return rest
    })
    
    // 분기 순서대로 정렬
    quarterDataArray.sort((a, b) => {
      const [yearA, quarterA] = a.quarter.split(' Q').map(Number)
      const [yearB, quarterB] = b.quarter.split(' Q').map(Number)
      if (yearA !== yearB) return yearA - yearB
      return quarterA - quarterB
    })
    
    return quarterDataArray.length > 0 ? quarterDataArray : null
  }, [selectedCompanyForSkills, skillDiversityViewMode, selectedYear])

  // 선택된 연도에 따른 스킬 트렌드 Y축 최대값
  const skillTrendYAxisMax = useMemo(() => {
    if (skillDiversityViewMode === 'all') {
      // 전체보기 모드: 최근 5년 합계이므로 더 큰 값 필요
      return 500
    } else if (selectedYear === '2021') {
      return 10
    } else if (selectedYear === '2022') {
      return 12
    } else if (selectedYear === '2023') {
      return 20
    } else if (selectedYear === '2024') {
      return 50
    } else {
      return 90
    }
  }, [skillDiversityViewMode, selectedYear])

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
        {/* 전체 AI 분석 버튼 */}
        <div className="flex justify-end mb-6">
          <button
            onClick={generateGlobalAnalysis}
            disabled={isGeneratingGlobalAnalysis}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              showGlobalAnalysis && globalAnalysisContent
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 분석
          </button>
        </div>
        
        {/* AI 분석 말풍선 */}
        <GlobalAnalysisBubble />
        
        {/* 메인 레이아웃: 왼쪽 통계 1열 + 오른쪽 사이드바 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* 왼쪽 통계 영역 (3열) */}
          <div className="lg:col-span-3 space-y-6">
            {/* 상단 그래프 섹션 - 1열로 변경 */}
            <div className="space-y-6">
          {/* 채용 공고 수 추이 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{trendChartTitle}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setJobPostingsTrendTimeframe('Daily')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobPostingsTrendTimeframe === 'Daily'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  일간
                </button>
                <button
                  onClick={() => setJobPostingsTrendTimeframe('Weekly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobPostingsTrendTimeframe === 'Weekly'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  주간
                </button>
                <button
                  onClick={() => setJobPostingsTrendTimeframe('Monthly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    jobPostingsTrendTimeframe === 'Monthly'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  월간
                </button>
              </div>
            </div>
            {isLoadingJobPostingsTrend ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
              </div>
            ) : jobPostingsTrendError ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-red-500 text-sm">{jobPostingsTrendError}</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={jobPostingsTrendData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    domain={[0, trendYAxisMax]}
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
            )}
          </section>

          {/* 주요 회사별 채용 활동 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">{companyRecruitmentTitle}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCompanyRecruitmentTimeframe('Daily')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      companyRecruitmentTimeframe === 'Daily'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    일간
                  </button>
                  <button
                    onClick={() => setCompanyRecruitmentTimeframe('Weekly')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      companyRecruitmentTimeframe === 'Weekly'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    주간
                  </button>
                  <button
                    onClick={() => setCompanyRecruitmentTimeframe('Monthly')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      companyRecruitmentTimeframe === 'Monthly'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    월간
                  </button>
                </div>
              </div>
              {/* 회사 선택 텍스트 */}
              <div className="flex flex-wrap gap-4 items-center">
                {recruitmentCompanies.map((company) => {
                  const isSelected = selectedRecruitmentCompanies.includes(company.key)
                  return (
                    <button
                      key={company.key}
                      onClick={() => toggleRecruitmentCompany(company.key)}
                      className={`text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'text-gray-900 font-semibold'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {company.name}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* 로딩 및 에러 상태 표시 */}
            {isLoadingCompanyRecruitment && (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
              </div>
            )}
            {companyRecruitmentError && !isLoadingCompanyRecruitment && (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-red-500 text-sm">
                  {companyRecruitmentError}
                  <br />
                  <span className="text-gray-400">기본 데이터를 표시합니다.</span>
                </div>
              </div>
            )}
            {!isLoadingCompanyRecruitment && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={companyRecruitmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  domain={[0, companyRecruitmentYAxisMax]}
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
                  formatter={(value: string) => {
                    const company = recruitmentCompanies.find(c => c.key === value)
                    return company ? company.name : value
                  }}
                />
                {recruitmentCompanies.map((company) => {
                  if (selectedRecruitmentCompanies.includes(company.key)) {
                    return (
                      <Line 
                        key={company.key}
                        type="monotone" 
                        dataKey={company.key} 
                        stroke={company.color} 
                        strokeWidth={2} 
                        dot={false}
                        name={company.name}
                      />
                    )
                  }
                  return null
                })}
              </LineChart>
            </ResponsiveContainer>
            )}
          </section>
            </div>

            {/* 회사별 스킬 다양성 및 분기별 트렌드 - 1열로 변경 */}
            <div className="space-y-6">
          {/* 회사별 스킬 다양성 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">회사별 스킬 다양성</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">전체보기</span>
                <button
                  onClick={() => setSkillDiversityViewMode(skillDiversityViewMode === 'all' ? 'year' : 'all')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                    skillDiversityViewMode === 'year' ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      skillDiversityViewMode === 'year' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">연도별</span>
                {skillDiversityViewMode === 'year' && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value as '2021' | '2022' | '2023' | '2024' | '2025')}
                    className="ml-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                )}
              </div>
              {/* 로딩 및 에러 상태 표시 */}
              {isLoadingSkillDiversity && (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-gray-500">데이터를 불러오는 중...</div>
                </div>
              )}
              {skillDiversityError && !isLoadingSkillDiversity && (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-red-500 text-sm">
                    {skillDiversityError}
                    <br />
                    <span className="text-gray-400">기본 데이터를 표시합니다.</span>
                  </div>
                </div>
              )}
            </div>
            {!isLoadingSkillDiversity && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companySkillDiversityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  domain={[0, skillDiversityYAxisMax]}
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
            )}
          </section>

          {/* 선택된 회사의 상위 스킬 분기별 트렌드 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedCompanyForSkills 
                ? skillDiversityViewMode === 'all' 
                  ? `${selectedCompanyForSkills} 상위 스킬 연도별 트렌드 (최근 5년)`
                  : `${selectedCompanyForSkills} 상위 스킬 분기별 트렌드`
                : '회사를 선택하세요'}
            </h2>
            {selectedCompanyForSkills ? (
              skillDiversityViewMode === 'all' && companySkillTrendDataAll ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={companySkillTrendDataAll}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="year" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      domain={[0, skillTrendYAxisMax]}
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
                    <Bar dataKey="python" stackId="1" fill={skillColors.python} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sql" stackId="1" fill={skillColors.sql} />
                    <Bar dataKey="java" stackId="1" fill={skillColors.java} />
                    <Bar dataKey="kubernetes" stackId="1" fill={skillColors.kubernetes} />
                    <Bar dataKey="docker" stackId="1" fill={skillColors.docker} />
                    <Bar dataKey="react" stackId="1" fill={skillColors.react} />
                    <Bar dataKey="typescript" stackId="1" fill={skillColors.typescript} />
                    <Bar dataKey="aws" stackId="1" fill={skillColors.aws} />
                    <Bar dataKey="spring" stackId="1" fill={skillColors.spring} />
                    <Bar dataKey="nodejs" stackId="1" fill={skillColors.nodejs} radius={[0, 0, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : skillDiversityViewMode === 'year' && companySkillTrendData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={companySkillTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="quarter" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      domain={[0, skillTrendYAxisMax]}
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
                  <p className="text-sm">데이터를 불러오는 중...</p>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p className="text-sm">왼쪽 그래프에서 회사를 클릭하여 상세 정보를 확인하세요</p>
              </div>
            )}
          </section>
            </div>

            {/* 스킬별 통계와 직군별 통계 - 1열로 변경 */}
            <div className="space-y-6">
          {/* 스킬별 통계 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                스킬별 통계
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">전체보기</span>
                <button
                  onClick={() => setSkillStatisticsViewMode(skillStatisticsViewMode === 'all' ? 'year' : 'all')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                    skillStatisticsViewMode === 'year' ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      skillStatisticsViewMode === 'year' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">연도별</span>
                {skillStatisticsViewMode === 'year' && (
                  <select
                    value={selectedSkillStatisticsYear}
                    onChange={(e) => setSelectedSkillStatisticsYear(e.target.value as '2021' | '2022' | '2023' | '2024' | '2025')}
                    className="ml-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                )}
              </div>
            </div>
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
                    
                    const selectedIndex = skillsDataToUse.slice(0, 13).findIndex(s => s.name === selectedSkill)
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
                  {skillsDataToUse.slice(0, 13).map((skill, index) => {
                    const maxCount = skillsDataToUse[0]?.count || 1
                    const size = getSkillSize(skill.count, index, maxCount)
                    const finalPosition = getFinalSkillPosition(index)
                    const isMain = index === 0
                    const isSelected = selectedSkill === skill.name
                    
                    // 선택된 스킬이 있을 때만 blur 처리 로직 적용
                    let shouldBlur = false
                    let shouldHide = false
                    
                    if (selectedSkill) {
                      const selectedSkillData = skillsDataToUse.find(s => s.name === selectedSkill)
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
                    
                    const selectedIndex = skillsDataToUse.slice(0, 13).findIndex(s => s.name === selectedSkill)
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
                      
                      // 관련 스킬이 화면에 보이는 스킬들(skillsDataToUse.slice(0, 13))에 있는지 확인
                      const visibleSkills = skillsDataToUse.slice(0, 13)
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
                      {selectedSkillData.relatedSkills && selectedSkillData.relatedSkills.length > 0 ? (
                        selectedSkillData.relatedSkills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">관련 스킬 데이터가 없습니다</span>
                      )}
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
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setJobRoleStatisticsViewMode('Weekly')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      jobRoleStatisticsViewMode === 'Weekly'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    주간
                  </button>
                  <button
                    onClick={() => setJobRoleStatisticsViewMode('Monthly')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      jobRoleStatisticsViewMode === 'Monthly'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    월간
                  </button>
                </div>
              </div>
            </div>
            
            {/* 회사 필터 */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => setSelectedJobRoleCompany(null)}
                  className={`text-sm font-medium transition-all duration-200 cursor-pointer ${
                    selectedJobRoleCompany === null
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  전체
                </button>
                {jobRoleCompanies.map((company) => {
                  const isSelected = selectedJobRoleCompany === company.name
                  return (
                    <button
                      key={company.key}
                      onClick={() => setSelectedJobRoleCompany(isSelected ? null : company.name)}
                      className={`text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'text-gray-900 font-semibold'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {company.name}
                    </button>
                  )
                })}
              </div>
            </div>
            
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
          </div>

          {/* 오른쪽 사이드바 (1열) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* 포지션별 채용 급증 순위 */}
              {positionSurgeAnalysis.length > 0 && (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">포지션별 채용 급증</h2>
                  </div>
                  
                  {/* 시간 필터 버튼 */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setPositionSurgeTimeframe('Daily')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        positionSurgeTimeframe === 'Daily'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      일간
                    </button>
                    <button
                      onClick={() => setPositionSurgeTimeframe('Weekly')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        positionSurgeTimeframe === 'Weekly'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      주간
                    </button>
                    <button
                      onClick={() => setPositionSurgeTimeframe('Monthly')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        positionSurgeTimeframe === 'Monthly'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      월간
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {positionSurgeAnalysis.slice(0, 10).map((surge, index) => {
                      const rank = index + 1
                      const isNew = surge.previous === 0
                      const growthDisplay = surge.growthRate === Infinity 
                        ? '신규' 
                        : `+${surge.growthRate}%`
                      
                      const isSelected = selectedSurgePosition === surge.position
                      
                      return (
                        <div key={index}>
                          <div
                            onClick={() => setSelectedSurgePosition(isSelected ? null : surge.position)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer text-sm ${
                              isSelected
                                ? surge.isOurPosition
                                  ? 'bg-red-100 border-red-300 shadow-md'
                                  : 'bg-blue-100 border-blue-300 shadow-md'
                                : surge.isOurPosition
                                  ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:shadow-md'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {/* 순위 번호 */}
                              <div className={`text-base font-bold min-w-[24px] text-center flex-shrink-0 ${
                                rank <= 4 ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                {rank}
                              </div>
                              
                              {/* 포지션명 */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-sm font-semibold truncate ${
                                    surge.isOurPosition ? 'text-red-700' : 'text-gray-900'
                                  }`}>
                                    {surge.position}
                                  </span>
                                  {surge.isOurPosition && (
                                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded flex-shrink-0">
                                      당사
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                  <span>{surge.recent}건</span>
                                  {isNew ? (
                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                                      New
                                    </span>
                                  ) : (
                                    <span className="text-orange-600 font-bold">{growthDisplay}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 선택된 포지션의 상세 정보 */}
                          {isSelected && (
                            <div className={`mt-2 p-3 rounded-lg border-2 text-sm ${
                              surge.isOurPosition
                                ? 'bg-red-50 border-red-300'
                                : 'bg-blue-50 border-blue-300'
                            }`}>
                              <div className="mb-2">
                                <h3 className="text-xs font-bold text-gray-900 mb-2">
                                  {surge.position} 상세 정보
                                </h3>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div className="bg-white p-2 rounded border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-0.5">최근</p>
                                    <p className="text-base font-bold text-gray-900">{surge.recent}건</p>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-0.5">이전</p>
                                    <p className="text-base font-bold text-gray-900">{surge.previous}건</p>
                                  </div>
                                </div>
                                
                                {surge.isOurPosition && (
                                  <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-xs">
                                    <p className="font-bold text-red-700 mb-0.5">
                                      ⚠️ 당사 포지션
                                    </p>
                                    <p className="text-gray-700">
                                      당사 공고: {surge.ourCompanyCount}건 → <span className="font-bold text-red-600">주력 필요</span>
                                    </p>
                                  </div>
                                )}
                                
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">관련 회사:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {surge.companies.slice(0, 5).map((company, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs text-gray-700"
                                      >
                                        {company}
                                      </span>
                                    ))}
                                    {surge.companies.length > 5 && (
                                      <span className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs text-gray-500">
                                        +{surge.companies.length - 5}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* 해당 포지션의 공고 목록 */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-1">관련 공고:</p>
                                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                    {jobPostingsData
                                      .filter(job => {
                                        const jobCategory = job.meta_data?.job_category || '기타'
                                        const jobTitle = job.title || ''
                                        const titleLower = jobTitle.toLowerCase()
                                        
                                        if (jobCategory === surge.position) return true
                                        if (surge.position === '개발' && (titleLower.includes('개발') || titleLower.includes('developer'))) return true
                                        if (surge.position === '백엔드 개발' && (titleLower.includes('백엔드') || titleLower.includes('backend'))) return true
                                        if (surge.position === '프론트엔드 개발' && (titleLower.includes('프론트') || titleLower.includes('frontend'))) return true
                                        if (surge.position === 'AI/ML' && (titleLower.includes('ai') || titleLower.includes('인공지능') || titleLower.includes('ml'))) return true
                                        if (surge.position === '인프라/클라우드' && (titleLower.includes('인프라') || titleLower.includes('infra') || titleLower.includes('cloud'))) return true
                                        if (surge.position === '아키텍트' && (titleLower.includes('아키텍트') || titleLower.includes('architect'))) return true
                                        if (surge.position === '프로젝트 관리' && (titleLower.includes('pm') || titleLower.includes('프로젝트') || titleLower.includes('product manager'))) return true
                                        if (surge.position === '데이터' && (titleLower.includes('데이터') || titleLower.includes('data'))) return true
                                        if (surge.position === 'UI/UX 디자인' && (titleLower.includes('디자인') || titleLower.includes('designer') || titleLower.includes('ui') || titleLower.includes('ux'))) return true
                                        if (surge.position === 'QA/품질관리' && (titleLower.includes('qa') || titleLower.includes('품질') || titleLower.includes('quality'))) return true
                                        if (surge.position === '영업' && (titleLower.includes('영업') || titleLower.includes('sales'))) return true
                                        if (surge.position === '기획' && (titleLower.includes('기획') || titleLower.includes('planning'))) return true
                                        return false
                                      })
                                      .slice(0, 5)
                                      .map((job) => {
                                        const companyName = job.company.replace('(주)', '').trim()
                                        const formatDate = (dateString: string) => {
                                          const date = new Date(dateString)
                                          return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
                                        }
                                        
                                        return (
                                          <div
                                            key={job.id}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              window.open(`/jobs/${job.id}`, '_blank')
                                            }}
                                            className="p-2 bg-white border border-gray-200 rounded hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                                          >
                                            <h4 className="text-xs font-semibold text-gray-900 mb-0.5 line-clamp-1">
                                              {job.title || '공고 제목 없음'}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                              <span>{companyName}</span>
                                              <span>•</span>
                                              <span>{formatDate(job.posted_date)}</span>
                                            </div>
                                          </div>
                                        )
                                      })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
              
              {/* 직군 선택 카드 */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">직군별 공고</h2>
                </div>
                
                {/* 시간 필터 버튼 */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSidebarJobRoleTimeframe('Weekly')}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      sidebarJobRoleTimeframe === 'Weekly'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    주간
                  </button>
                  <button
                    onClick={() => setSidebarJobRoleTimeframe('Monthly')}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      sidebarJobRoleTimeframe === 'Monthly'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    월간
                  </button>
                </div>
                
                {/* 전문가 카테고리 탭 */}
                <div className="flex flex-col gap-2 mb-4">
                  <button
                    onClick={() => {
                      setSelectedExpertCategory('Tech')
                      setSelectedSidebarJobRole(null)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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
                      setSelectedSidebarJobRole(null)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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
                      setSelectedSidebarJobRole(null)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedExpertCategory === 'BizSupporting'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Biz.Supporting 전문가
                  </button>
                </div>

                {/* 직군 목록 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">직군 선택</h3>
                  {currentJobRoles.map((role) => (
                    <button
                      key={role.name}
                      onClick={() => setSelectedSidebarJobRole(selectedSidebarJobRole === role.name ? null : role.name)}
                      className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                        selectedSidebarJobRole === role.name
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{role.name}</span>
                        <span className={`text-xs ${
                          selectedSidebarJobRole === role.name ? 'text-gray-300' : 'text-gray-400'
                        }`}>
                          {role.value}건
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* 선택된 직군의 공고 목록 */}
              {selectedSidebarJobRole && (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedSidebarJobRole} 공고
                    </h2>
                    <button
                      onClick={() => setSelectedSidebarJobRole(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredJobPostings.length > 0 ? (
                      filteredJobPostings.slice(0, 10).map((job) => {
                        const companyName = job.company.replace('(주)', '').trim()
                        const formatDate = (dateString: string) => {
                          const date = new Date(dateString)
                          return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
                        }
                        
                        return (
                          <div
                            key={job.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                            onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                {job.title || '공고 제목 없음'}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <span>{companyName}</span>
                              <span>•</span>
                              <span>{formatDate(job.posted_date)}</span>
                            </div>
                            {job.meta_data?.tech_stack && job.meta_data.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.meta_data.tech_stack.slice(0, 3).map((tech, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        선택한 직군에 해당하는 공고가 없습니다.
                      </div>
                    )}
                  </div>
                  
                  {filteredJobPostings.length > 10 && (
                    <div className="mt-4 text-center">
                      <Link
                        href="/jobs"
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                      >
                        더보기 ({filteredJobPostings.length}개) →
                      </Link>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>

        {/* 경쟁사 공고 자동 매칭 섹션 (전체 너비) */}
        <div className="mb-8">
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  경쟁사 공고 자동 매칭
                </h2>
              </div>
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
              <span className="text-gray-900 font-bold">{filteredJobPostingsForMatching.length}개</span>의 공고를 확인할 수 있어요.
            </p>
            {filteredJobPostingsForMatching.length > itemsPerPage && (
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
          
          {filteredJobPostingsForMatching.length > 0 ? (
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
              {filteredJobPostingsForMatching.length > itemsPerPage && (
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

      </div>

      {/* AI 분석 리포트 버튼 - 오른쪽 아래 고정 */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => {
            setShowReportModal(true)
          }}
          className="group relative bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-4 flex items-center gap-3 font-semibold"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-base">AI 분석 리포트</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>


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

              {/* AI 분석 리포트 내용 - 그래프와 요약 */}
              <div className="space-y-8">
                {/* 1. 채용 공고 수 추이 */}
                <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">1. 채용 공고 수 추이 ({jobPostingsTrendTimeframe === 'Daily' ? '일간' : jobPostingsTrendTimeframe === 'Weekly' ? '주간' : '월간'})</h3>
                  <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={jobPostingsTrendData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="period" 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          domain={[0, trendYAxisMax]}
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
                          fillOpacity={1} 
                          fill="url(#colorCount)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="prose max-w-none">
                    <div className="space-y-2 text-base leading-relaxed text-gray-700">
                      <p>
                        {jobPostingsTrendTimeframe === 'Daily' ? '일간' : jobPostingsTrendTimeframe === 'Weekly' ? '주간' : '월간'} 기준으로 채용 공고 수가 지속적으로 증가하는 추세를 보이고 있습니다.
                        최근 3개월간 평균 증가율이 높아지고 있어 시장이 활발합니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. 주요 회사별 채용 활동 */}
                <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">2. 주요 회사별 채용 활동 ({companyRecruitmentTimeframe === 'Daily' ? '일간' : companyRecruitmentTimeframe === 'Weekly' ? '주간' : '월간'})</h3>
                  <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={companyRecruitmentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="period" 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          domain={[0, companyRecruitmentYAxisMax]}
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
                          formatter={(value: string) => {
                            const company = recruitmentCompanies.find(c => c.key === value)
                            return company ? company.name : value
                          }}
                        />
                        {recruitmentCompanies.map((company) => {
                          if (selectedRecruitmentCompanies.includes(company.key)) {
                            return (
                              <Line 
                                key={company.key}
                                type="monotone" 
                                dataKey={company.key} 
                                stroke={company.color} 
                                strokeWidth={2} 
                                dot={false}
                                name={company.name}
                              />
                            )
                          }
                          return null
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="prose max-w-none">
                    <div className="space-y-2 text-base leading-relaxed text-gray-700">
                      <p>
                        대형 IT 기업들의 지속적인 채용 확대가 두드러지며, 스타트업의 성장세에 따른 인력 충원이 활발합니다.
                        {selectedRecruitmentCompanies.length > 0 && selectedRecruitmentCompanies.length < 8 && (
                          <> 선택된 회사({selectedRecruitmentCompanies.map(c => recruitmentCompanies.find(comp => comp.key === c)?.name).join(', ')})의 채용 활동이 특히 활발합니다.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. 회사별 스킬 다양성 */}
                <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">3. 회사별 스킬 다양성</h3>
                  <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={companySkillDiversityData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          type="number" 
                          domain={[0, skillDiversityYAxisMax]}
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
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="prose max-w-none">
                    <div className="space-y-2 text-base leading-relaxed text-gray-700">
                      <p>
                        각 회사별로 요구하는 기술 스택의 다양성을 보여주며, {companySkillDiversityData.length > 0 && companySkillDiversityData[0] && (
                          <><strong>{companySkillDiversityData[0].company}</strong>이 가장 많은 고유 스킬을 요구하고 있습니다.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. 상위 스킬 분기별 트렌드 */}
                {selectedCompanyForSkills && companySkillTrendData && (
                  <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">4. {selectedCompanyForSkills} 상위 스킬 분기별 트렌드</h3>
                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={companySkillTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="quarter" 
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            domain={[0, skillTrendYAxisMax]}
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
                    </div>
                    <div className="prose max-w-none">
                      <div className="space-y-2 text-base leading-relaxed text-gray-700">
                        <p>
                          {selectedCompanyForSkills}의 주요 기술 스택 트렌드를 분기별로 분석한 결과, 최신 기술 스택에 대한 수요가 지속적으로 증가하고 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. 스킬별 통계 */}
                <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">5. 스킬별 통계</h3>
                  <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 border border-gray-200 rounded-xl shadow-md mb-4 relative">
                    {/* 배경 장식 */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden rounded-xl">
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-900 rounded-full blur-2xl"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gray-900 rounded-full blur-2xl"></div>
                    </div>
                    
                    {/* 헤더 */}
                    <div className="relative mb-4 z-10">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">스킬 클라우드</h4>
                      <p className="text-sm text-gray-500">인기 스킬을 시각화한 클라우드</p>
                    </div>
                    
                    {/* 스킬 클라우드 */}
                    <div 
                      className="relative w-full flex items-center justify-center overflow-visible"
                      style={{ 
                        height: '500px',
                        maxWidth: '100%',
                        margin: '0 auto',
                        padding: '20px',
                        borderRadius: '0.75rem',
                      }}
                    >
                      {/* 메인 스킬들 */}
                      {skillsDataToUse.slice(0, 13).map((skill, index) => {
                        const maxCount = skillsDataToUse[0]?.count || 1
                        const size = getSkillSize(skill.count, index, maxCount)
                        const finalPosition = getFinalSkillPosition(index)
                        const isMain = index === 0
                        
                        return (
                          <div
                            key={skill.name}
                            className={`absolute ${size.padding} ${size.height} rounded-full flex items-center justify-center ${size.text} font-bold whitespace-nowrap ${
                              isMain
                                ? 'bg-gray-900 text-white shadow-2xl border-2 border-gray-700/30'
                                : 'bg-white text-gray-700 border-2 border-gray-200 shadow-lg'
                            }`}
                            style={{
                              left: `calc(50% + ${finalPosition.x}px)`,
                              top: `calc(50% + ${finalPosition.y}px)`,
                              transform: `translate(-50%, -50%)`,
                              minWidth: size.width,
                            }}
                          >
                            {skill.name}
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* 스킬 통계 요약 */}
                    <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 z-10">
                      {skillsDataToUse.slice(0, 4).map((skill, index) => (
                        <div key={skill.name} className="bg-white p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-900 capitalize">{skill.name}</span>
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                          </div>
                          <div className="text-xl font-bold text-gray-900 mb-0.5">{skill.count}</div>
                          <div className="text-xs text-gray-600">
                            {skill.percentage.toFixed(1)}% · {skill.change > 0 ? '+' : ''}{skill.change.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <div className="space-y-2 text-base leading-relaxed text-gray-700">
                      <p>
                        상위 인기 스킬: {skillsDataToUse.slice(0, 5).map(s => s.name).join(', ')} 등이 높은 수요를 보이고 있습니다.
                        프론트엔드와 백엔드 기술 스택이 균형있게 요구되며, 클라우드 및 DevOps 관련 스킬의 중요성이 증가하고 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 6. 직군별 통계 */}
                <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">6. 직군별 통계 ({selectedExpertCategory === 'Tech' ? 'Tech 전문가' : selectedExpertCategory === 'Biz' ? 'Biz 전문가' : 'Biz.Supporting 전문가'})</h3>
                  <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-4">
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
                        >
                          {currentJobRoles.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={pieColors[index % pieColors.length]}
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
                  <div className="prose max-w-none">
                    <div className="space-y-2 text-base leading-relaxed text-gray-700">
                      <p>
                        {selectedExpertCategory === 'Tech' ? '기술' : selectedExpertCategory === 'Biz' ? '비즈니스' : '비즈니스 지원'} 분야에서 다양한 직무가 활발하게 채용되고 있습니다.
                        주요 직무: {currentJobRoles.slice(0, 5).map(role => `${role.name}(${role.value}건)`).join(', ')} 등이 높은 비율을 차지하고 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 7. 경쟁사 공고 자동 매칭 */}
                <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">7. 경쟁사 공고 자동 매칭</h3>
                  <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedCompanies.length > 0 ? `선택된 회사: ${selectedCompanies.join(', ')}` : '전체 회사'} · 
                        총 <strong className="text-gray-900">{filteredJobPostings.length}개</strong>의 공고
                      </p>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredJobPostings.slice(0, 5).map((job) => {
                        const companyName = typeof job.company === 'string' ? job.company : '알 수 없음'
                        return (
                          <div key={job.id} className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 mb-1">{companyName}</p>
                                <p className="text-sm text-gray-700 mb-1">{job.title || '공고 제목 없음'}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {job.employment_type && (
                                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">{job.employment_type}</span>
                                  )}
                                  {job.expired_date && (
                                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                                      마감: {new Date(job.expired_date).toLocaleDateString('ko-KR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {filteredJobPostings.length > 5 && (
                      <p className="text-sm text-gray-500 mt-3 text-center">
                        외 {filteredJobPostings.length - 5}개의 공고가 더 있습니다.
                      </p>
                    )}
                  </div>
                  <div className="prose max-w-none">
                    <div className="space-y-2 text-base leading-relaxed text-gray-700">
                      <p>
                        경쟁사 공고 자동 매칭을 통해 총 {filteredJobPostings.length}개의 공고를 확인할 수 있습니다.
                        {selectedCompanies.length > 0 && (
                          <> 선택된 회사({selectedCompanies.join(', ')})의 공고가 활발하게 발행되고 있습니다.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 8. 채용뉴스 */}
                {newsItems && newsItems.length > 0 && (
                  <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">8. 채용뉴스</h3>
                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-4">
                      <div className="space-y-3">
                        {newsItems.slice(0, 5).map((news, index) => (
                          <div key={index} className="bg-gradient-to-r from-gray-50 to-white p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                                {news.image}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-1">{news.source}</p>
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                  {news.headline}
                                </h3>
                                <p className="text-xs text-gray-600">{news.snippet}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <div className="space-y-2 text-base leading-relaxed text-gray-700">
                        <p>
                          최신 채용 관련 뉴스 {newsItems.length}건을 확인할 수 있습니다. 채용 시장의 최신 동향과 트렌드를 파악하는 데 도움이 됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. 종합 요약 */}
                <div className="pdf-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">9. 종합 요약</h3>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="prose max-w-none">
                      <div className="space-y-3 text-base leading-relaxed text-gray-700">
                        <p>
                          전체 대시보드 데이터를 종합 분석한 결과, 채용 시장이 활발하게 움직이고 있으며 특히 IT 분야에서 높은 수요를 보이고 있습니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>
                            <strong>채용 공고 수</strong>: {jobPostingsTrendTimeframe === 'Daily' ? '일간' : jobPostingsTrendTimeframe === 'Weekly' ? '주간' : '월간'} 기준으로 지속적인 증가 추세
                          </li>
                          <li>
                            <strong>주요 회사 채용 활동</strong>: 대형 IT 기업들의 지속적인 채용 확대
                          </li>
                          <li>
                            <strong>기술 스택</strong>: 프론트엔드와 백엔드 기술 스택이 균형있게 요구되며, 클라우드 및 DevOps 관련 스킬의 중요성 증가
                          </li>
                        </ul>
                        <p className="mt-4">
                          <strong>추천사항:</strong> 상위 인기 스킬들을 우선적으로 학습하고, 지속적인 트렌드 모니터링으로 시장 변화에 대응하는 것이 중요합니다.
                        </p>
                      </div>
                    </div>
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

