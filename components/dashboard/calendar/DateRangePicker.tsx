'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  minDate?: string
  maxDate?: string
  onChange: (startDate: string, endDate: string) => void
  onReset?: () => void
}

export function DateRangePicker({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
  onReset,
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = startDate ? new Date(startDate) : new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })
  const [selectingStart, setSelectingStart] = useState(true)
  const [tempStartDate, setTempStartDate] = useState<string | null>(startDate || null)
  const [tempEndDate, setTempEndDate] = useState<string | null>(endDate || null)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: (Date | null)[] = []
  
  // 이전 달의 빈 칸
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  
  // 현재 달의 날짜
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  const isDateDisabled = (date: Date): boolean => {
    if (minDate) {
      const min = new Date(minDate)
      min.setHours(0, 0, 0, 0)
      if (date < min) return true
    }
    if (maxDate) {
      const max = new Date(maxDate)
      max.setHours(23, 59, 59, 999)
      if (date > max) return true
    }
    return false
  }

  // 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 문제 방지)
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isDateInRange = (date: Date): boolean => {
    if (!tempStartDate || !tempEndDate) return false
    const dateStr = formatDateToString(date)
    return dateStr >= tempStartDate && dateStr <= tempEndDate
  }

  const isStartDate = (date: Date): boolean => {
    if (!tempStartDate) return false
    const dateStr = formatDateToString(date)
    return dateStr === tempStartDate
  }

  const isEndDate = (date: Date): boolean => {
    if (!tempEndDate) return false
    const dateStr = formatDateToString(date)
    return dateStr === tempEndDate
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return

    const dateStr = formatDateToString(date)

    if (selectingStart || !tempStartDate) {
      // 시작일 선택
      setTempStartDate(dateStr)
      setTempEndDate(null)
      setSelectingStart(false)
    } else {
      // 종료일 선택
      const start = new Date(tempStartDate!)
      const clicked = new Date(date)
      
      if (clicked < start) {
        // 시작일보다 이전 날짜를 클릭하면 시작일로 설정
        setTempStartDate(dateStr)
        setTempEndDate(null)
        setSelectingStart(false)
      } else {
        // 종료일로 설정
        setTempEndDate(dateStr)
        onChange(tempStartDate!, dateStr)
      }
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleReset = () => {
    setTempStartDate(null)
    setTempEndDate(null)
    setSelectingStart(true)
    if (onReset) {
      onReset()
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
  }

  return (
    <div className="space-y-4">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {year}년 {month + 1}월
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const isDisabled = isDateDisabled(date)
          const inRange = isDateInRange(date)
          const isStart = isStartDate(date)
          const isEnd = isEndDate(date)
          const dateStr = date.toISOString().split('T')[0]

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${isDisabled 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'hover:bg-gray-100 cursor-pointer'
                }
                ${isStart || isEnd
                  ? 'bg-[#EA002C] text-white'
                  : inRange
                  ? 'bg-pink-100 text-gray-900'
                  : 'bg-white text-gray-900'
                }
                ${isStart ? 'relative' : ''}
                ${isEnd ? 'relative' : ''}
              `}
            >
              {isStart && (
                <span className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
              {isEnd && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EA002C] rounded-full" />
              )}
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* 선택된 기간 표시 */}
      {(tempStartDate || tempEndDate) && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              선택된 기간: {tempStartDate ? formatDate(tempStartDate) : ''} ~ {tempEndDate ? formatDate(tempEndDate) : ''}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              다시 정하기
            </Button>
          </div>
        </div>
      )}

      {/* 범례 */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#EA002C] rounded relative">
              <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
            </div>
            <span>시작일</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-100 rounded" />
            <span>기간 내</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#EA002C] rounded relative">
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#EA002C] rounded-full" />
            </div>
            <span>종료일</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300">
              <span className="text-gray-400">×</span>
            </div>
            <span>선택 불가</span>
          </div>
        </div>
      </div>
    </div>
  )
}

