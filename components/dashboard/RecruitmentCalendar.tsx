'use client'

import { useState, useMemo } from 'react'

interface RecruitmentEvent {
  date: string // YYYY-MM-DD 형식
  company: string
  type: '신입공채' | '인턴십' | '공개채용'
  title?: string
}

interface RecruitmentCalendarProps {
  events?: RecruitmentEvent[]
  currentMonth?: Date
}

export default function RecruitmentCalendar({ 
  events = [], 
  currentMonth = new Date() 
}: RecruitmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMonth, setViewMonth] = useState<Date>(currentMonth)

  // 달력 데이터 생성
  const calendarData = useMemo(() => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    
    // 해당 월의 첫 번째 날과 마지막 날
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 첫 번째 날의 요일 (0=일요일, 6=토요일)
    const startDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    // 달력 배열 생성
    const days: Array<{ date: Date; isCurrentMonth: boolean; events: RecruitmentEvent[] }> = []
    
    // 이전 달의 마지막 날들 추가
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({ date, isCurrentMonth: false, events: [] })
    }
    
    // 현재 달의 날들 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayEvents = events.filter(e => e.date === dateStr)
      days.push({ date, isCurrentMonth: true, events: dayEvents })
    }
    
    // 다음 달의 첫 날들 추가 (달력이 6줄이 되도록)
    const remainingDays = 42 - days.length // 6주 * 7일 = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, isCurrentMonth: false, events: [] })
    }
    
    return days
  }, [viewMonth, events])

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
  }

  // 다음 달로 이동
  const goToNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
  }

  // 오늘로 이동
  const goToToday = () => {
    const today = new Date()
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  // 선택된 날짜의 이벤트
  const selectedDateEvents = useMemo(() => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }, [selectedDate, events])

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  const getEventColor = (type: string) => {
    switch (type) {
      case '신입공채':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case '인턴십':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case '공개채용':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* 헤더: 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#1a2d47] rounded-lg transition-colors"
        >
          ←
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">
            {viewMonth.getFullYear()}년 {monthNames[viewMonth.getMonth()]}
          </h3>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-[#1a2d47] rounded transition-colors"
          >
            오늘
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#1a2d47] rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      {/* 달력 그리드 */}
      <div className="flex-1 grid grid-cols-7 gap-1 mb-4">
        {/* 요일 헤더 */}
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-2 ${
              index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}

        {/* 날짜 셀 */}
        {calendarData.map((day, index) => {
          const isToday =
            day.date.getDate() === new Date().getDate() &&
            day.date.getMonth() === new Date().getMonth() &&
            day.date.getFullYear() === new Date().getFullYear()
          
          const isSelected =
            day.date.getDate() === selectedDate.getDate() &&
            day.date.getMonth() === selectedDate.getMonth() &&
            day.date.getFullYear() === selectedDate.getFullYear()

          return (
            <button
              key={index}
              onClick={() => {
                if (day.isCurrentMonth) {
                  setSelectedDate(day.date)
                }
              }}
              className={`min-h-[60px] p-1 text-xs rounded transition-colors ${
                !day.isCurrentMonth
                  ? 'text-gray-600 cursor-default'
                  : isSelected
                  ? 'bg-blue-500/30 text-white border-2 border-blue-500'
                  : isToday
                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                  : 'text-gray-300 hover:bg-[#1a2d47] border border-transparent'
              }`}
            >
              <div className="text-left mb-1">{day.date.getDate()}</div>
              <div className="space-y-0.5">
                {day.events.slice(0, 2).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`text-[10px] px-1 py-0.5 rounded border ${getEventColor(event.type)} truncate`}
                    title={`${event.company} - ${event.type}`}
                  >
                    {event.company}
                  </div>
                ))}
                {day.events.length > 2 && (
                  <div className="text-[10px] text-gray-500 px-1">
                    +{day.events.length - 2}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* 선택된 날짜의 상세 이벤트 */}
      {selectedDateEvents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#2a3f5f]">
          <h4 className="text-sm font-semibold text-white mb-2">
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
          </h4>
          <div className="space-y-2 max-h-[120px] overflow-y-auto">
            {selectedDateEvents.map((event, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg border ${getEventColor(event.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{event.company}</div>
                    {event.title && (
                      <div className="text-xs text-gray-400 mt-0.5">{event.title}</div>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-[#0f1e35] text-gray-300">
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

