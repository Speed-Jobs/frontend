'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar } from './calendar/Calendar'
import { CompanySchedule, UserPin } from './calendar/types'

interface RecruitmentEvent {
  date: string // YYYY-MM-DD 형식
  company: string
  type: '신입공채' | '인턴십' | '공개채용'
  title?: string
}

interface NewRecruitmentCalendarProps {
  events?: RecruitmentEvent[]
  currentMonth?: Date
}

export default function NewRecruitmentCalendar({ 
  events = [], 
  currentMonth = new Date() 
}: NewRecruitmentCalendarProps) {
  const router = useRouter()
  const [viewMonth, setViewMonth] = useState<Date>(currentMonth)
  const [userPins, setUserPins] = useState<UserPin[]>([])

  // 기존 데이터 형식을 새로운 형식으로 변환
  const companySchedules = useMemo<CompanySchedule[]>(() => {
    // 회사별로 그룹화
    const companyMap = new Map<string, RecruitmentEvent[]>()
    
    events.forEach(event => {
      if (!companyMap.has(event.company)) {
        companyMap.set(event.company, [])
      }
      companyMap.get(event.company)!.push(event)
    })

    const schedules: CompanySchedule[] = []
    const colors = ['#1e40af', '#dc2626', '#d97706', '#7c3aed', '#059669', '#0891b2', '#be185d', '#ea580c']
    let colorIndex = 0

    companyMap.forEach((companyEvents, companyName) => {
      const stages = companyEvents.map((event, index) => {
        const eventDate = new Date(event.date)
        // 기본적으로 7일 기간으로 설정 (시작일 = 종료일)
        const startDate = new Date(eventDate)
        const endDate = new Date(eventDate)
        
        return {
          id: `${companyName}-${index}`,
          stage: event.type === '신입공채' ? '서류접수' : event.type === '인턴십' ? '서류접수' : '서류전형',
          startDate,
          endDate,
        }
      })

      schedules.push({
        id: companyName,
        name: companyName,
        color: colors[colorIndex % colors.length],
        type: '신입' as const,
        dataType: 'actual' as const,
        stages,
      })
      colorIndex++
    })

    return schedules
  }, [events])

  const goToPreviousMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    // 날짜 클릭 시 상세 페이지로 이동
    router.push('/dashboard/recruitment-schedule')
  }

  return (
    <div className="w-full h-full flex flex-col group relative">
      <Link 
        href="/dashboard/recruitment-schedule" 
        className="flex-1 flex flex-col relative cursor-pointer"
        onClick={(e) => {
          // 버튼 클릭이 아닌 경우에만 링크 이동
          const target = e.target as HTMLElement
          if (target.closest('button')) {
            e.preventDefault()
          }
        }}
      >
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none z-10 flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-900 border border-gray-200">
            클릭하여 상세 보기 →
          </div>
        </div>
        
        <Calendar
          currentDate={viewMonth}
          companySchedules={companySchedules}
          userPins={userPins}
          allowLinkNavigation={true}
          onPreviousMonth={(e) => {
            e?.stopPropagation()
            e?.preventDefault()
            goToPreviousMonth()
          }}
          onNextMonth={(e) => {
            e?.stopPropagation()
            e?.preventDefault()
            goToNextMonth()
          }}
          onDateClick={(date) => {
            // 날짜 클릭 시 상세 페이지로 이동
            handleDateClick(date)
          }}
        />
      </Link>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            <span className="font-medium">상세 페이지에서 더 많은 기능을 확인하세요!</span>
          </p>
          <div className="text-sm text-gray-500 text-center leading-relaxed space-y-1.5">
            <p>• 경쟁사 채용 일정을 등록하고 달력에서 경쟁 강도를 시각적으로 확인할 수 있습니다</p>
            <p>• 우리 회사의 채용 일정을 시뮬레이션하여 경쟁사와 비교 분석할 수 있습니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}

