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

export function AddUserScheduleDialog({ open, onClose, onAdd }: AddUserScheduleDialogProps) {
  const [step, setStep] = useState<Step>('stages')
  const [selectedTypes, setSelectedTypes] = useState<Set<UserPin['type']>>(new Set())
  const [stageDates, setStageDates] = useState<Record<UserPin['type'], { startDate: string; endDate: string }>>({})
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
      .filter(type => stageDates[type]?.startDate && stageDates[type]?.endDate)
      .map(type => ({
        type,
        date: new Date(stageDates[type].startDate),
        endDate: stageDates[type].endDate ? new Date(stageDates[type].endDate) : undefined,
      }))

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
  const currentStageDates = currentStage ? stageDates[currentStage] : undefined
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
              <DateRangePicker
                startDate={currentStageDates?.startDate}
                endDate={currentStageDates?.endDate}
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

