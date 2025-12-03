'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Calendar } from '@/components/dashboard/calendar/Calendar'
import { CompanySchedule, UserPin } from '@/components/dashboard/calendar/types'
import { CompanyScheduleManager } from '@/components/dashboard/calendar/CompanyScheduleManager'
import { UserPinManager } from '@/components/dashboard/calendar/UserPinManager'
import { InsightPanel } from '@/components/dashboard/calendar/InsightPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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
  return apiData.map((schedule) => {
    // 회사명에 맞는 색상 할당 (백엔드 color 우선, 없으면 회사명 기반 매핑)
    const color = getCompanyColor(schedule.company_name, schedule.color)
    
    return {
      id: schedule.id,
      name: schedule.company_name,
      color: color,
      type: schedule.type,
      dataType: schedule.data_type,
      stages: schedule.stages.map((stage) => ({
        id: stage.id,
        stage: stage.stage,
        startDate: new Date(stage.start_date),
        endDate: new Date(stage.end_date),
      })),
    }
  })
}

export default function RecruitmentSchedulePage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'신입' | '경력'>('신입')
  const [dataFilter, setDataFilter] = useState<'all' | 'actual' | 'predicted'>('all')
  
  // 서버에서 받아온 데이터
  const [serverSchedules, setServerSchedules] = useState<CompanySchedule[]>([])
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true)
  const [schedulesError, setSchedulesError] = useState<string | null>(null)
  
  // API 호출
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoadingSchedules(true)
        setSchedulesError(null)
        
        // 쿼리 파라미터 구성
        const params = new URLSearchParams()
        params.append('type', activeTab)
        if (activeTab === '신입' && dataFilter !== 'all') {
          params.append('data_type', dataFilter)
        }
        
        const apiUrl = `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/recruitment-schedule/companies?${params.toString()}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result: ApiResponse = await response.json()
        
        if (result.status === 200 && result.data && result.data.schedules) {
          const transformedSchedules = transformApiResponse(result.data.schedules)
          setServerSchedules(transformedSchedules)
        } else {
          throw new Error(result.message || '데이터를 불러오는데 실패했습니다.')
        }
      } catch (error: any) {
        setSchedulesError(error.message || '채용 일정 데이터를 불러오는데 실패했습니다.')
        // 에러 발생 시 빈 배열로 설정
        setServerSchedules([])
      } finally {
        setIsLoadingSchedules(false)
      }
    }
    
    fetchSchedules()
  }, [activeTab, dataFilter])
  
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
  
  // API 데이터가 없으면 더미 데이터 사용
  const finalServerSchedules = serverSchedules.length > 0 ? serverSchedules : fallbackSchedules
  
  // 사용자가 직접 추가한 데이터
  const [userSchedules, setUserSchedules] = useState<CompanySchedule[]>([])
  const [userPins, setUserPins] = useState<UserPin[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  // Apply data type filter for 신입 공고
  const finalFilteredSchedules = activeTab === '신입'
    ? filteredSchedules.filter((schedule) => {
        if (dataFilter === 'all') return true
        if (dataFilter === 'actual') return schedule.dataType === 'actual'
        if (dataFilter === 'predicted') return schedule.dataType === 'predicted'
        return true
      })
    : filteredSchedules

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
            {isLoadingSchedules && (
              <p className="text-sm text-gray-500 mt-2">
                데이터를 불러오는 중...
              </p>
            )}
          </div>
        </div>

        {/* 필터링 기능 - 중앙 배치 */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as '신입' | '경력')}>
            <div className="flex justify-center mb-4">
              <TabsList className="inline-flex h-9 w-auto">
                <TabsTrigger value="신입" className="text-sm px-6">
                  신입 공고
                </TabsTrigger>
                <TabsTrigger value="경력" className="text-sm px-6">
                  경력 공고
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {activeTab === '신입' && (
            <div className="flex justify-center gap-2">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as '신입' | '경력')}>
                <TabsContent value="신입" className="mt-0">
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
      <Footer />
    </div>
  )
}

