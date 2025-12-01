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
        return 'bg-blue-500/20 text-blue-700 border-blue-500/50'
      case '인턴십':
        return 'bg-green-500/20 text-green-700 border-green-500/50'
      case '공개채용':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/50'
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/50'
    }
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* 헤더: 월 네비게이션 */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <button
          onClick={goToPreviousMonth}
          className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          ←
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-gray-900">
            {viewMonth.getFullYear()}년 {monthNames[viewMonth.getMonth()]}
          </h3>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
          >
            오늘
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0" style={{ gridTemplateRows: 'auto repeat(6, minmax(0, 1fr))' }}>
        {/* 요일 헤더 */}
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-1.5 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
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
              className={`h-full min-h-[50px] p-1 text-xs rounded transition-colors flex flex-col ${
                !day.isCurrentMonth
                  ? 'text-gray-400 cursor-default'
                  : isSelected
                  ? 'bg-gray-100 text-gray-900 border-2 border-gray-900'
                  : isToday
                  ? 'bg-gray-50 text-gray-800 border border-gray-300'
                  : 'text-gray-800 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="text-left mb-0.5 font-medium flex-shrink-0">{day.date.getDate()}</div>
              <div className="space-y-0.5 flex flex-col flex-1 min-h-0 overflow-hidden">
                {day.events.slice(0, 2).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`text-[8px] px-1 py-0.5 rounded border ${getEventColor(event.type)} truncate flex-shrink-0`}
                    title={`${event.company} - ${event.type}`}
                  >
                    {event.company}
                  </div>
                ))}
                {day.events.length > 2 && (
                  <div className="text-[8px] text-gray-500 px-1 flex-shrink-0">
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
        <div className="mt-2 pt-2 border-t border-gray-200 flex-shrink-0">
          <h4 className="text-xs font-semibold text-gray-900 mb-1.5">
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
          </h4>
          <div className="space-y-1.5 max-h-[80px] overflow-y-auto">
            {selectedDateEvents.map((event, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg border ${getEventColor(event.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{event.company}</div>
                    {event.title && (
                      <div className="text-xs text-gray-500 mt-0.5">{event.title}</div>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
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

