'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CompanySchedule, ScheduleStage } from './types'
import { DateRangePicker } from './DateRangePicker'

interface AddScheduleDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (schedule: Omit<CompanySchedule, 'id'>) => void
}

const PRESET_COLORS = [
  '#1e40af',
  '#dc2626',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#db2777',
]

const STAGE_OPTIONS = [
  { value: '서류접수', label: '서류 접수' },
  { value: '인적성검사', label: '인적성' },
  { value: '1차 면접', label: '1차 면접' },
  { value: '2차 면접', label: '2차 면접' },
  { value: '3차 면접', label: '3차 면접' },
]

type Step = 'company' | 'stages' | 'dates'

export function AddScheduleDialog({ open, onClose, onAdd }: AddScheduleDialogProps) {
  const [step, setStep] = useState<Step>('company')
  const [companyName, setCompanyName] = useState('')
  const [companyType, setCompanyType] = useState<'신입' | '경력'>('신입')
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set(['서류접수']))
  const [stageDates, setStageDates] = useState<Record<string, { startDate: string; endDate: string }>>({})
  const [currentStageIndex, setCurrentStageIndex] = useState(0)

  const toggleStage = (stageValue: string) => {
    const newSelected = new Set(selectedStages)
    if (newSelected.has(stageValue)) {
      newSelected.delete(stageValue)
      // 날짜도 제거
      const newDates = { ...stageDates }
      delete newDates[stageValue]
      setStageDates(newDates)
    } else {
      newSelected.add(stageValue)
    }
    setSelectedStages(newSelected)
  }

  const updateStageDate = (stageValue: string, field: 'startDate' | 'endDate', value: string) => {
    setStageDates({
      ...stageDates,
      [stageValue]: {
        ...stageDates[stageValue],
        [field]: value,
      },
    })
  }

  const handleNext = () => {
    if (step === 'company') {
      if (!companyName.trim()) return
      if (selectedStages.size === 0) return
      setStep('dates')
      setCurrentStageIndex(0)
    }
  }

  const handleBack = () => {
    if (step === 'dates') {
      setStep('company')
    }
  }

  const handleNextStage = () => {
    const selectedArray = Array.from(selectedStages)
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
    if (!companyName.trim()) return
    if (selectedStages.size === 0) return

    const selectedArray = Array.from(selectedStages)
    const scheduleStages: Omit<ScheduleStage, 'id'>[] = selectedArray
      .filter(stageValue => {
        const dates = stageDates[stageValue]
        return dates && dates.startDate && dates.endDate
      })
      .map(stageValue => {
        const dates = stageDates[stageValue]
        const stageOption = STAGE_OPTIONS.find(opt => opt.value === stageValue)
        return {
          stage: stageOption?.label || stageValue,
          startDate: new Date(dates.startDate),
          endDate: new Date(dates.endDate),
        }
      })

    if (scheduleStages.length === 0) return

    onAdd({
      name: companyName,
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
      type: companyType,
      dataType: 'actual',
      stages: scheduleStages,
    })

    // Reset form
    setCompanyName('')
    setCompanyType('신입')
    setSelectedStages(new Set(['서류접수']))
    setStageDates({})
    setCurrentStageIndex(0)
    setStep('company')
    onClose()
  }

  const selectedArray = Array.from(selectedStages)
  const currentStage = selectedArray[currentStageIndex]
  const currentStageDates = currentStage ? stageDates[currentStage] : null
  
  // 현재 단계의 최소 시작일 계산 (이전 단계의 종료일 + 1일)
  const getMinStartDate = (stageIndex: number): string => {
    if (stageIndex === 0) return '' // 첫 번째 단계는 제한 없음
    
    const prevStageValue = selectedArray[stageIndex - 1]
    const prevDates = stageDates[prevStageValue]
    
    if (prevDates && prevDates.endDate) {
      // 이전 단계의 종료일 다음 날
      const prevEndDate = new Date(prevDates.endDate)
      prevEndDate.setDate(prevEndDate.getDate() + 1)
      return prevEndDate.toISOString().split('T')[0]
    }
    
    return ''
  }

  // 현재 단계의 최대 종료일 계산 (다음 단계의 시작일 - 1일)
  const getMaxEndDate = (stageIndex: number): string => {
    if (stageIndex === selectedArray.length - 1) return '' // 마지막 단계는 제한 없음
    
    const nextStageValue = selectedArray[stageIndex + 1]
    const nextDates = stageDates[nextStageValue]
    
    if (nextDates && nextDates.startDate) {
      // 다음 단계의 시작일 이전 날
      const nextStartDate = new Date(nextDates.startDate)
      nextStartDate.setDate(nextStartDate.getDate() - 1)
      return nextStartDate.toISOString().split('T')[0]
    }
    
    return ''
  }

  const minStartDate = getMinStartDate(currentStageIndex)
  const maxEndDate = getMaxEndDate(currentStageIndex)
  
  const allDatesSet = selectedArray.every(stageValue => {
    const dates = stageDates[stageValue]
    return dates && dates.startDate && dates.endDate
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {step === 'company' && '기업 정보 입력'}
              {step === 'dates' && currentStage && `${STAGE_OPTIONS.find(opt => opt.value === currentStage)?.label} 기간 설정 (${currentStageIndex + 1}/${selectedArray.length})`}
            </span>
            {step === 'dates' && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Step 1: Company Info */}
          {step === 'company' && (
            <>
              <div className="space-y-2">
                <Label>기업명</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="예: 삼성전자"
                />
              </div>

              <div className="space-y-2">
                <Label>채용 유형</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={companyType === '신입' ? 'default' : 'outline'}
                    onClick={() => setCompanyType('신입')}
                    className="flex-1"
                  >
                    신입
                  </Button>
                  <Button
                    type="button"
                    variant={companyType === '경력' ? 'default' : 'outline'}
                    onClick={() => setCompanyType('경력')}
                    className="flex-1"
                  >
                    경력
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>전형 단계 선택</Label>
                <p className="text-sm text-gray-600">
                  진행할 전형 단계를 선택하세요
                </p>
                {STAGE_OPTIONS.map((option) => {
                  const isSelected = selectedStages.has(option.value)
                  return (
                    <div
                      key={option.value}
                      onClick={() => toggleStage(option.value)}
                      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#EA002C] bg-[#EA002C]/5'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#EA002C] border-[#EA002C]'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check className="size-3.5 text-white" />}
                        </div>
                        <span className={`text-base font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          {option.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Step 2: Date Selection */}
          {step === 'dates' && currentStage && (
            <div className="space-y-4">
              {minStartDate && (
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-800">
                    ⚠️ 이전 전형 종료일 이후 날짜만 선택 가능합니다. (최소: {new Date(minStartDate).toLocaleDateString('ko-KR')})
                  </p>
                </div>
              )}
              <DateRangePicker
                startDate={currentStageDates?.startDate}
                endDate={currentStageDates?.endDate}
                minDate={minStartDate || undefined}
                maxDate={maxEndDate || undefined}
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
        <div className="flex justify-between pt-4 border-t">
          {step !== 'company' && (
            <Button variant="outline" onClick={handleBack}>
              이전
            </Button>
          )}
          {step === 'company' && <div />}
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
            {step === 'company' && (
              <Button onClick={handleNext} disabled={!companyName.trim() || selectedStages.size === 0}>
                날짜 설정하기
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

