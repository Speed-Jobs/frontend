'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Calendar } from '@/components/dashboard/calendar/Calendar'
import { CompanySchedule, UserPin } from '@/components/dashboard/calendar/types'
import { CompanyScheduleManager } from '@/components/dashboard/calendar/CompanyScheduleManager'
import { UserPinManager } from '@/components/dashboard/calendar/UserPinManager'
import { InsightPanel } from '@/components/dashboard/calendar/InsightPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronDown, Check } from 'lucide-react'

// 프리셋 색상 목록 (color가 없을 때 자동 할당)
const PRESET_COLORS = [
  '#1e40af',
  '#dc2626',
  '#d97706',
  '#7c3aed',
  '#059669',
  '#0891b2',
  '#be185d',
  '#ea580c',
]

// 회사명 기반 색상 매핑
const COMPANY_COLOR_MAP: Record<string, string> = {
  // 삼성 관련
  '삼성전자': '#1e40af',
  '삼성': '#1e40af',
  '삼성SDS': '#1e40af',
  'SAMSUNG': '#1e40af',
  
  // LG 관련
  'LG전자': '#dc2626',
  'LG': '#dc2626',
  'LGCNS': '#dc2626',
  'LG CNS': '#dc2626',
  
  // 네이버
  '네이버': '#03c75a',
  'NAVER': '#03c75a',
  
  // 카카오
  '카카오': '#fee500',
  'kakao': '#fee500',
  
  // 토스
  '토스': '#0064ff',
  'Toss': '#0064ff',
  
  // 라인
  '라인': '#00c300',
  'LINE': '#00c300',
  
  // SK 관련
  'SK텔레콤': '#d97706',
  'SK': '#d97706',
  'SK AX': '#d97706',
  
  // 한화
  '한화시스템': '#7c3aed',
  '한화': '#7c3aed',
  
  // 우아한형제들
  '우아한형제들': '#059669',
  '배민': '#059669',
  '배달의민족': '#059669',
  
  // 현대
  '현대오토에버': '#0891b2',
  '현대': '#0891b2',
  
  // 기타
  '쿠팡': '#be185d',
  '당근마켓': '#ea580c',
}

// 회사명을 정규화하는 함수 (부분 매칭 지원)
function normalizeCompanyName(companyName: string): string {
  const normalized = companyName.trim()
  
  // 직접 매칭
  if (COMPANY_COLOR_MAP[normalized]) {
    return normalized
  }
  
  // 부분 매칭 (예: "삼성전자"에서 "삼성" 찾기)
  for (const [key, color] of Object.entries(COMPANY_COLOR_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return key
    }
  }
  
  return normalized
}

// 회사명에 맞는 색상 가져오기
function getCompanyColor(companyName: string, providedColor?: string): string {
  // 백엔드에서 color를 제공한 경우 우선 사용
  if (providedColor) {
    return providedColor
  }
  
  // 회사명 기반 색상 매핑
  const normalizedName = normalizeCompanyName(companyName)
  return COMPANY_COLOR_MAP[normalizedName] || PRESET_COLORS[0]
}

// 백엔드 API 응답 타입
interface ApiScheduleStage {
  id: string
  stage: string
  start_date: string
  end_date: string
}

interface ApiCompanySchedule {
  id: string
  company_id?: number
  company_name: string
  company_key?: string
  color?: string
  type: '신입' | '경력'
  data_type?: 'actual' | 'predicted'
  job_role?: string // 직군 정보 (선택적)
  stages: ApiScheduleStage[]
}

interface ApiResponse {
  status: number
  code: string
  message: string
  data: {
    schedules: ApiCompanySchedule[]
  }
}

// 백엔드 응답을 프론트엔드 형식으로 변환하는 함수
function transformApiResponse(apiData: ApiCompanySchedule[]): CompanySchedule[] {
  return apiData.map((schedule, index) => {
    // 회사명에 맞는 색상 할당 (백엔드 color 우선, 없으면 회사명 기반 매핑)
    const color = getCompanyColor(schedule.company_name, schedule.color)
    
    // 같은 id를 가진 스케줄들이 있을 수 있으므로 (예: 같은 회사의 actual과 predicted)
    // data_type과 index를 조합하여 고유한 id 생성
    const uniqueId = schedule.data_type 
      ? `${schedule.id}-${schedule.data_type}-${index}` 
      : `${schedule.id}-${index}`
    
    return {
      id: uniqueId,
      name: schedule.company_name,
      color: color,
      type: schedule.type,
      dataType: schedule.data_type,
      jobRole: schedule.job_role, // 직군 정보 추가
      stages: schedule.stages.map((stage, stageIndex) => ({
        id: `${uniqueId}-${stage.id}-${stageIndex}`,
        stage: stage.stage,
        startDate: new Date(stage.start_date),
        endDate: new Date(stage.end_date),
      })),
    }
  })
}

// 직군 목록 (SKAX 직무기술서 기준)
const JOB_ROLES = [
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

export default function RecruitmentSchedulePage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'신입' | '경력'>('신입')
  const [dataFilter, setDataFilter] = useState<'all' | 'actual' | 'predicted'>('all')
  const [selectedJobRoles, setSelectedJobRoles] = useState<string[]>([]) // 기본값: 전체 해제
  const [isJobRoleDropdownOpen, setIsJobRoleDropdownOpen] = useState(false)
  
  // 서버에서 받아온 데이터
  const [serverSchedules, setServerSchedules] = useState<CompanySchedule[]>([])
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true)
  const [schedulesError, setSchedulesError] = useState<string | null>(null)
  
  // Debouncing을 위한 ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 중복 요청 방지를 위한 ref
  const fetchingRef = useRef(false)
  const lastRequestParamsRef = useRef<string>('')
  
  // API 호출 (debouncing 및 중복 요청 방지 적용)
  useEffect(() => {
    // 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // 쿼리 파라미터 구성 (요청 키 생성용)
    const typeMapping: Record<'신입' | '경력', string> = {
      '신입': 'Entry-level',
      '경력': 'Experienced'
    }
    
    const params = new URLSearchParams()
    params.append('type', typeMapping[activeTab])
    
    // 날짜 범위를 매우 넓게 설정하여 API의 모든 데이터 요청
    // 과거 데이터와 미래 예측 데이터를 모두 포함하기 위해 넓은 범위 사용
    params.append('start_date', '2000-01-01')
    params.append('end_date', '2100-12-31')
    
    // 신입 공고일 때 data_type 파라미터 전달
    if (activeTab === '신입') {
      if (dataFilter === 'all') {
        // 'all'일 때는 data_type=all을 사용하여 한 번에 가져오기
        params.append('data_type', 'all')
      } else {
        // 'actual' 또는 'predicted'일 때는 해당 값 사용
        params.append('data_type', dataFilter)
      }
    }
    // 경력 공고일 때 직군 필터 추가
    if (activeTab === '경력' && selectedJobRoles.length > 0) {
      params.append('job_role', selectedJobRoles.join(','))
    }
    
    const requestKey = params.toString()
    
    // Debouncing: 300ms 후에 API 호출
    debounceTimerRef.current = setTimeout(async () => {
      // 중복 요청 방지: 동일한 파라미터로 이미 요청이 진행 중이면 스킵
      if (fetchingRef.current && lastRequestParamsRef.current === requestKey) {
        return
      }
      
      fetchingRef.current = true
      lastRequestParamsRef.current = requestKey
      
      try {
        setIsLoadingSchedules(true)
        setSchedulesError(null)
        
        const allSchedules: ApiCompanySchedule[] = []
        
        // API 호출 (params에 이미 data_type이 포함되어 있음)
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/recruitment-schedule/companies?${params.toString()}`
        
        // 디버깅: API URL 로깅
        console.log('채용 일정 API 호출:', apiUrl)
        console.log('파라미터:', {
          type: params.get('type'),
          data_type: params.get('data_type'),
          start_date: params.get('start_date'),
          end_date: params.get('end_date'),
          job_role: params.get('job_role'),
        })
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result: ApiResponse = await response.json()
        
        if (result.status === 200 && result.code === 'SUCCESS' && result.data && result.data.schedules) {
          console.log(`API 응답 성공: ${result.data.schedules.length}개 스케줄`)
          // 각 스케줄의 data_type 확인
          result.data.schedules.forEach((schedule: ApiCompanySchedule) => {
            console.log(`  - ${schedule.company_name}: data_type=${schedule.data_type || 'N/A'}, stages=${schedule.stages.length}개`)
            schedule.stages.forEach((stage) => {
              console.log(`    - ${stage.stage}: ${stage.start_date} ~ ${stage.end_date}`)
            })
          })
          allSchedules.push(...result.data.schedules)
        } else {
          console.warn('⚠️ API 응답 형식 오류:', result)
          throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
        }
        
        if (allSchedules.length > 0) {
          const transformedSchedules = transformApiResponse(allSchedules)
          console.log('변환된 스케줄:', transformedSchedules.length, '개')
          transformedSchedules.forEach((schedule) => {
            console.log(`  - ${schedule.name}: dataType=${schedule.dataType || 'N/A'}, stages=${schedule.stages.length}개`)
            schedule.stages.forEach((stage) => {
              console.log(`    - ${stage.stage}: ${stage.startDate.toISOString().split('T')[0]} ~ ${stage.endDate.toISOString().split('T')[0]}`)
            })
          })
          setServerSchedules(transformedSchedules)
        } else {
          // 데이터가 없어도 빈 배열로 설정 (에러 아님)
          console.warn('⚠️ 불러온 스케줄이 없습니다. API 응답:', result)
          setServerSchedules([])
        }
      } catch (error: any) {
        setSchedulesError(error.message || '채용 일정 데이터를 불러오는데 실패했습니다.')
        // 에러 발생 시 빈 배열로 설정
        setServerSchedules([])
      } finally {
        setIsLoadingSchedules(false)
        fetchingRef.current = false
      }
    }, 300)
    
    // Cleanup 함수: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [activeTab, dataFilter, selectedJobRoles.join(',')])
  
  // 더미 데이터 (API 실패 시 fallback)
  const fallbackSchedules: CompanySchedule[] = [
    {
      id: 'server-1',
      name: '삼성전자',
      color: '#1e40af',
      type: '신입',
      dataType: 'actual',
      stages: [
        {
          id: 'server-1-1',
          stage: '서류접수',
          startDate: new Date(2025, 0, 1),
          endDate: new Date(2025, 0, 7),
        },
        {
          id: 'server-1-2',
          stage: '필기시험',
          startDate: new Date(2025, 0, 10),
          endDate: new Date(2025, 0, 10),
        },
        {
          id: 'server-1-3',
          stage: '1차 면접',
          startDate: new Date(2025, 0, 13),
          endDate: new Date(2025, 0, 14),
        },
      ],
    },
    {
      id: 'server-2',
      name: 'LG전자',
      color: '#dc2626',
      type: '신입',
      dataType: 'actual',
      stages: [
        {
          id: 'server-2-1',
          stage: '서류접수',
          startDate: new Date(2025, 0, 5),
          endDate: new Date(2025, 0, 12),
        },
        {
          id: 'server-2-2',
          stage: '1차 면접',
          startDate: new Date(2025, 0, 15),
          endDate: new Date(2025, 0, 16),
        },
      ],
    },
    {
      id: 'server-3',
      name: 'SK텔레콤',
      color: '#d97706',
      type: '신입',
      dataType: 'actual',
      stages: [
        {
          id: 'server-3-1',
          stage: '서류접수',
          startDate: new Date(2025, 0, 3),
          endDate: new Date(2025, 0, 10),
        },
        {
          id: 'server-3-2',
          stage: '인적성검사',
          startDate: new Date(2025, 0, 12),
          endDate: new Date(2025, 0, 12),
        },
        {
          id: 'server-3-3',
          stage: '1차 면접',
          startDate: new Date(2025, 0, 17),
          endDate: new Date(2025, 0, 18),
        },
      ],
    },
  ]
  
  // API 데이터가 없으면 더미 데이터 사용 (하지만 예측치 필터일 때는 fallback 사용 안 함)
  const finalServerSchedules = serverSchedules.length > 0 
    ? serverSchedules 
    : (dataFilter === 'predicted' ? [] : fallbackSchedules) // 예측치 필터일 때는 빈 배열 사용
  
  // 사용자가 직접 추가한 데이터
  const [userSchedules, setUserSchedules] = useState<CompanySchedule[]>([])
  // localStorage에서 시뮬레이션 데이터 불러오기
  const loadUserPinsFromStorage = (): UserPin[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('recruitment-schedule-user-pins')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Date 객체 복원
        return parsed.map((pin: any) => ({
          ...pin,
          date: new Date(pin.date),
          endDate: pin.endDate ? new Date(pin.endDate) : undefined,
        }))
      }
    } catch (error) {
    }
    return []
  }

  const [userPins, setUserPins] = useState<UserPin[]>(loadUserPinsFromStorage)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // userPins가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('recruitment-schedule-user-pins', JSON.stringify(userPins))
      } catch (error) {
      }
    }
  }, [userPins])

  const addCompanySchedule = (schedule: Omit<CompanySchedule, 'id'>) => {
    const newSchedule = {
      ...schedule,
      id: Date.now().toString(),
      stages: schedule.stages.map((stage, index) => ({
        ...stage,
        id: `${Date.now()}-${index}`,
      })),
    }
    setUserSchedules([...userSchedules, newSchedule])
  }

  const removeCompanySchedule = (id: string) => {
    setUserSchedules(userSchedules.filter((s) => s.id !== id))
  }

  const clearAllCompanySchedules = () => {
    setUserSchedules([])
  }

  const addUserPin = (pin: Omit<UserPin, 'id'>) => {
    setUserPins([...userPins, { ...pin, id: Date.now().toString() }])
  }

  const addUserPins = (pins: Omit<UserPin, 'id'>[]) => {
    const newPins = pins.map((pin, index) => ({
      ...pin,
      id: `${Date.now()}-${index}`,
    }))
    setUserPins([...userPins, ...newPins])
  }

  const removeUserPin = (id: string) => {
    setUserPins(userPins.filter((p) => p.id !== id))
  }

  const clearAllUserPins = () => {
    setUserPins([])
  }

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    )
  }

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    )
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  // Filter schedules by active tab
  const filteredSchedules = [...finalServerSchedules, ...userSchedules].filter(
    (schedule) => schedule.type === activeTab
  )

  // Apply filters based on active tab
  const finalFilteredSchedules = useMemo(() => {
    let result = filteredSchedules

    // 신입 공고: data_type 필터 적용
    if (activeTab === '신입') {
      console.log('필터링 전:', result.length, '개 스케줄')
      console.log('현재 필터:', dataFilter)
      result.forEach((schedule) => {
        console.log(`  - ${schedule.name}: dataType=${schedule.dataType || 'N/A'}`)
      })
      
      result = result.filter((schedule) => {
        // 전체 보기: actual과 predicted 모두 표시 (dataType이 없는 경우도 포함)
        if (dataFilter === 'all') {
          return true // 모든 데이터 표시
        }
        if (dataFilter === 'actual') {
          const matches = schedule.dataType === 'actual'
          if (!matches) {
            console.log(`  필터링됨: ${schedule.name} (dataType=${schedule.dataType}, 필터=actual)`)
          }
          return matches
        }
        // 예측치만 표시
        if (dataFilter === 'predicted') {
          // dataType이 정확히 'predicted'인지 확인 (문자열 비교)
          const matches = schedule.dataType === 'predicted'
          console.log(`  체크: ${schedule.name}, dataType="${schedule.dataType}", 타입=${typeof schedule.dataType}, 매칭=${matches}`)
          if (!matches) {
            console.log(`  ❌ 필터링됨: ${schedule.name} (dataType=${schedule.dataType}, 필터=predicted)`)
          } else {
            console.log(`  ✅ 표시됨: ${schedule.name} (dataType=${schedule.dataType})`)
          }
          return matches
        }
        return true
      })
      console.log('필터링 후:', result.length, '개 스케줄')
    }
    
    // 경력 공고: 직군 필터 적용 (선택된 직군만 표시)
    if (activeTab === '경력' && selectedJobRoles.length > 0) {
      result = result.filter((schedule) => {
        // jobRole이 없으면 표시하지 않음 (선택된 직군만 표시)
        if (!schedule.jobRole) return false
        // 선택된 직군 목록에 포함되어 있으면 표시
        return selectedJobRoles.includes(schedule.jobRole)
      })
    }

    return result
  }, [filteredSchedules, activeTab, dataFilter, selectedJobRoles])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            대시보드로 돌아가기
          </Button>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">채용 일정 분석 시스템</h1>
            <p className="text-gray-600">
              경쟁사 채용 일정을 시각화하고 최적의 채용 전략을 수립하세요
            </p>
            {schedulesError && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ {schedulesError}
              </p>
            )}
          </div>
        </div>

        {/* 필터링 기능 - 중앙 배치 */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as '신입' | '경력')}>
              <TabsList className="inline-flex h-9 w-auto">
                <TabsTrigger value="신입" className="text-sm px-6">
                  신입 공고
                </TabsTrigger>
                <TabsTrigger value="경력" className="text-sm px-6">
                  경력 공고
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === '신입' && (
            <div className="flex justify-center gap-2 flex-wrap">
              <Button
                variant={dataFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDataFilter('all')}
              >
                전체 보기
              </Button>
              <Button
                variant={dataFilter === 'actual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDataFilter('actual')}
              >
                실제 공고만
              </Button>
              <Button
                variant={dataFilter === 'predicted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDataFilter('predicted')}
              >
                예측치만
              </Button>
            </div>
          )}

          {activeTab === '경력' && (
            <div className="flex flex-row items-center gap-3 justify-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">직군 필터</label>
              <div className="relative w-[250px]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsJobRoleDropdownOpen(!isJobRoleDropdownOpen)}
                  className="w-full justify-between text-sm"
                >
                  <span>
                    {selectedJobRoles.length === 0 
                      ? '직군을 선택하세요' 
                      : selectedJobRoles.length === JOB_ROLES.length
                      ? '전체 직군'
                      : `${selectedJobRoles.length}개 직군 선택됨`}
                  </span>
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isJobRoleDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                {isJobRoleDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsJobRoleDropdownOpen(false)}
                    />
                    <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (selectedJobRoles.length === JOB_ROLES.length) {
                              setSelectedJobRoles([])
                            } else {
                              setSelectedJobRoles([...JOB_ROLES])
                            }
                          }}
                          className="w-full text-xs justify-start"
                        >
                          {selectedJobRoles.length === JOB_ROLES.length ? '전체 해제' : '전체 선택'}
                        </Button>
                      </div>
                      <div className="p-1">
                        {JOB_ROLES.map((role) => {
                          const isSelected = selectedJobRoles.includes(role)
                          return (
                            <div
                              key={role}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedJobRoles(selectedJobRoles.filter(r => r !== role))
                                } else {
                                  setSelectedJobRoles([...selectedJobRoles, role])
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded text-sm"
                            >
                              <div className={`flex items-center justify-center w-4 h-4 border-2 rounded ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-600' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className={isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}>
                                {role}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 relative">
            {isLoadingSchedules && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">데이터를 불러오는 중...</p>
                    <p className="text-sm text-gray-600 mt-1">잠시만 기다려주세요</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as '신입' | '경력')}>
                <TabsContent value="신입" className="mt-0">
                  {(() => {
                    console.log('📅 Calendar에 전달되는 데이터:', finalFilteredSchedules.length, '개')
                    finalFilteredSchedules.forEach((schedule) => {
                      console.log(`  - ${schedule.name}: dataType=${schedule.dataType || 'N/A'}, stages=${schedule.stages.length}개`)
                    })
                    return null
                  })()}
                  <Calendar
                    currentDate={currentDate}
                    companySchedules={finalFilteredSchedules}
                    userPins={userPins}
                    onPreviousMonth={goToPreviousMonth}
                    onNextMonth={goToNextMonth}
                    onDateClick={handleDateClick}
                  />
                </TabsContent>

                <TabsContent value="경력" className="mt-0">
                  <Calendar
                    currentDate={currentDate}
                    companySchedules={filteredSchedules}
                    userPins={userPins}
                    onPreviousMonth={goToPreviousMonth}
                    onNextMonth={goToNextMonth}
                    onDateClick={handleDateClick}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {userPins.length > 0 && (
              <InsightPanel
                companySchedules={finalFilteredSchedules}
                userPins={userPins}
                currentDate={currentDate}
              />
            )}
          </div>

          <div className="space-y-6 pt-[130px]">
            <CompanyScheduleManager
              schedules={userSchedules.filter((s) => s.type === activeTab)}
              onAdd={addCompanySchedule}
              onRemove={removeCompanySchedule}
              onClearAll={clearAllCompanySchedules}
            />

            <UserPinManager
              pins={userPins}
              onAdd={addUserPins}
              onRemove={removeUserPin}
              onClearAll={clearAllUserPins}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

