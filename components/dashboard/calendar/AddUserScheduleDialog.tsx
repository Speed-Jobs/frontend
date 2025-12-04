'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserPin, PIN_TYPES } from './types'
import { DateRangePicker } from './DateRangePicker'

interface AddUserScheduleDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (pins: Omit<UserPin, 'id'>[]) => void
}

type Step = 'stages' | 'dates'

// 전형 순서 정의
const STAGE_ORDER: UserPin['type'][] = ['서류 접수', '인적성', '1차 면접', '2차 면접', '3차 면접']

// 이전 전형 찾기
const getPreviousStage = (currentStage: UserPin['type'], selectedTypes: Set<UserPin['type']>): UserPin['type'] | null => {
  const currentIndex = STAGE_ORDER.indexOf(currentStage)
  if (currentIndex <= 0) return null
  
  // 현재 전형보다 앞선 전형들 중 선택된 것 찾기
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (selectedTypes.has(STAGE_ORDER[i])) {
      return STAGE_ORDER[i]
    }
  }
  return null
}

export function AddUserScheduleDialog({ open, onClose, onAdd }: AddUserScheduleDialogProps) {
  const [step, setStep] = useState<Step>('stages')
  const [selectedTypes, setSelectedTypes] = useState<Set<UserPin['type']>>(new Set())
  const [stageDates, setStageDates] = useState<Partial<Record<UserPin['type'], { startDate: string; endDate: string }>>>({})
  const [currentStageIndex, setCurrentStageIndex] = useState(0)

  const toggleType = (type: UserPin['type']) => {
    const newSet = new Set(selectedTypes)
    if (newSet.has(type)) {
      newSet.delete(type)
      // 날짜도 제거
      const newDates = { ...stageDates }
      delete newDates[type]
      setStageDates(newDates)
    } else {
      newSet.add(type)
    }
    setSelectedTypes(newSet)
  }

  const updateStageDate = (type: UserPin['type'], field: 'startDate' | 'endDate', value: string) => {
    setStageDates({
      ...stageDates,
      [type]: {
        ...stageDates[type],
        [field]: value,
      },
    })
  }

  const handleNext = () => {
    if (step === 'stages') {
      if (selectedTypes.size === 0) return
      setStep('dates')
      setCurrentStageIndex(0)
    }
  }

  const handleBack = () => {
    if (step === 'dates') {
      setStep('stages')
    }
  }

  const handleNextStage = () => {
    const selectedArray = Array.from(selectedTypes)
    if (currentStageIndex < selectedArray.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1)
      // 다음 전형으로 이동할 때 날짜 초기화는 하지 않음 (사용자가 선택한 날짜 유지)
    }
  }

  const handlePrevStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(currentStageIndex - 1)
    }
  }

  const handleSubmit = () => {
    const selectedArray = Array.from(selectedTypes)
    const pins: Omit<UserPin, 'id'>[] = selectedArray
      .filter(type => {
        const dates = stageDates[type]
        return dates?.startDate && dates?.endDate
      })
      .map(type => {
        const dates = stageDates[type]!
        return {
          type,
          date: new Date(dates.startDate),
          endDate: dates.endDate ? new Date(dates.endDate) : undefined,
        }
      })

    if (pins.length === 0) return

    onAdd(pins)

    // Reset form
    setStep('stages')
    setSelectedTypes(new Set())
    setStageDates({})
    setCurrentStageIndex(0)
    onClose()
  }

  const selectedArray = Array.from(selectedTypes)
  const currentStage = selectedArray[currentStageIndex]
  
  // 이전 전형의 종료일 계산 (최소 시작일)
  const getMinDate = (): string | undefined => {
    if (!currentStage) return undefined
    
    const previousStage = getPreviousStage(currentStage, selectedTypes)
    if (!previousStage) return undefined
    
    const previousDates = stageDates[previousStage]
    if (!previousDates || !previousDates.endDate) return undefined
    
    // 이전 전형 종료일의 다음 날
    const endDate = new Date(previousDates.endDate)
    endDate.setDate(endDate.getDate() + 1)
    const year = endDate.getFullYear()
    const month = String(endDate.getMonth() + 1).padStart(2, '0')
    const day = String(endDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const minDate = getMinDate()
  
  // 현재 전형의 날짜가 minDate보다 이전이면 초기화
  const currentStageDates = (() => {
    if (!currentStage) return undefined
    const dates = stageDates[currentStage]
    if (!dates) return undefined
    
    // minDate보다 이전인 날짜는 무시
    if (minDate && dates.startDate && dates.startDate < minDate) {
      return undefined
    }
    if (minDate && dates.endDate && dates.endDate < minDate) {
      return undefined
    }
    
    return dates
  })()
  
  const allDatesSet = selectedArray.every(type => {
    const dates = stageDates[type]
    return dates && dates.startDate && dates.endDate
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'stages' && '우리 회사 일정 시뮬레이션'}
            {step === 'dates' && currentStage && `${PIN_TYPES.find(opt => opt.value === currentStage)?.label} 설정 (${currentStageIndex + 1}/${selectedArray.length})`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Stage Selection */}
          {step === 'stages' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                앞서 단계를 선택한 후 달력에 날짜를 클릭하세요
              </p>
              <div className="space-y-2">
                {PIN_TYPES.map((pinType) => {
                  const isSelected = selectedTypes.has(pinType.value)
                  return (
                    <div
                      key={pinType.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => toggleType(pinType.value)}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="size-3.5 text-white" />}
                      </div>
                      <span className={`text-base font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {pinType.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Step 2: Date Selection */}
          {step === 'dates' && currentStage && (
            <div className="space-y-4">
              {minDate && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-medium mb-1">⚠️ 날짜 제한</p>
                  <p className="text-xs">
                    이 전형은 이전 전형 종료일 다음 날부터 선택할 수 있습니다.
                    {(() => {
                      const prevStage = getPreviousStage(currentStage, selectedTypes)
                      const prevDates = prevStage ? stageDates[prevStage] : null
                      if (prevDates && prevDates.endDate) {
                        const endDate = new Date(prevDates.endDate)
                        const minStartDate = new Date(endDate)
                        minStartDate.setDate(minStartDate.getDate() + 1)
                        return ` (최소 시작일: ${minStartDate.getFullYear()}. ${minStartDate.getMonth() + 1}. ${minStartDate.getDate()}.)`
                      }
                      return ''
                    })()}
                  </p>
                </div>
              )}
              <DateRangePicker
                startDate={currentStageDates?.startDate}
                endDate={currentStageDates?.endDate}
                minDate={minDate}
                stageType={currentStage}
                onChange={(startDate, endDate) => {
                  setStageDates({
                    ...stageDates,
                    [currentStage]: {
                      startDate,
                      endDate,
                    },
                  })
                }}
                onReset={() => {
                  const newDates = { ...stageDates }
                  delete newDates[currentStage]
                  setStageDates(newDates)
                }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          {step === 'dates' && (
            <Button variant="outline" onClick={handlePrevStage} disabled={currentStageIndex === 0}>
              이전
            </Button>
          )}
          {step === 'stages' && <div />}
          <div className="flex gap-2 ml-auto">
            {step === 'dates' && currentStageIndex < selectedArray.length - 1 && (
              <Button onClick={handleNextStage} disabled={!currentStageDates?.startDate || !currentStageDates?.endDate}>
                다음 전형 &gt;
              </Button>
            )}
            {step === 'dates' && currentStageIndex === selectedArray.length - 1 && (
              <Button onClick={handleSubmit} disabled={!allDatesSet}>
                완료
              </Button>
            )}
            {step === 'stages' && (
              <Button onClick={handleNext} disabled={selectedTypes.size === 0}>
                날짜 설정하기
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

