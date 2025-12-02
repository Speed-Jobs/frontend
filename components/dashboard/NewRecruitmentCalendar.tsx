'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
    // 날짜 클릭 시 처리 (필요시 구현)
  }

  return (
    <div className="w-full h-full flex flex-col group relative">
      <Link 
        href="/dashboard/recruitment-schedule" 
        className="absolute inset-0 z-10 bg-transparent group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center"
        onClick={(e) => {
          // 버튼 클릭이 아닌 경우에만 링크 이동
          const target = e.target as HTMLElement
          if (target.closest('button')) {
            e.preventDefault()
          }
        }}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-900 pointer-events-none">
          클릭하여 상세 보기
        </div>
      </Link>
      <Calendar
        currentDate={viewMonth}
        companySchedules={companySchedules}
        userPins={userPins}
        onPreviousMonth={(e) => {
          e?.stopPropagation()
          goToPreviousMonth()
        }}
        onNextMonth={(e) => {
          e?.stopPropagation()
          goToNextMonth()
        }}
        onDateClick={handleDateClick}
      />
    </div>
  )
}

