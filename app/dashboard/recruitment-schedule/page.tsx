'use client'

import { useState, useMemo } from 'react'
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

export default function RecruitmentSchedulePage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'신입' | '경력'>('신입')
  const [dataFilter, setDataFilter] = useState<'all' | 'actual' | 'predicted'>('all')
  
  // 서버에서 받아온 데이터 (초기 데이터)
  const [serverSchedules] = useState<CompanySchedule[]>([
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
  ])
  
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
  const filteredSchedules = [...serverSchedules, ...userSchedules].filter(
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
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

                <TabsContent value="신입" className="mt-0">
                  {/* 데이터 필터 버튼 */}
                  <div className="flex justify-center gap-2 mb-4">
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

          <div className="space-y-6">
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

