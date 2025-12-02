'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { CompanySchedule, ScheduleStage } from './types'

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

export function AddScheduleDialog({ open, onClose, onAdd }: AddScheduleDialogProps) {
  const [companyName, setCompanyName] = useState('')
  const [companyType, setCompanyType] = useState<'신입' | '경력'>('신입')
  const [stages, setStages] = useState<Array<{
    stage: string
    startDate: string
    endDate: string
  }>>([
    { stage: '서류접수', startDate: '', endDate: '' },
  ])

  const addStage = () => {
    setStages([...stages, { stage: '', startDate: '', endDate: '' }])
  }

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index))
  }

  const updateStage = (index: number, field: string, value: string) => {
    const newStages = [...stages]
    newStages[index] = { ...newStages[index], [field]: value }
    setStages(newStages)
  }

  const handleSubmit = () => {
    if (!companyName.trim()) return

    const scheduleStages: Omit<ScheduleStage, 'id'>[] = stages
      .filter(s => s.stage && s.startDate && s.endDate)
      .map(s => ({
        stage: s.stage,
        startDate: new Date(s.startDate),
        endDate: new Date(s.endDate),
      }))

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
    setStages([{ stage: '서류접수', startDate: '', endDate: '' }])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>경쟁사 채용 일정 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>회사명</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="예: 네이버"
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
            <div className="flex items-center justify-between">
              <Label>채용 단계</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStage}>
                + 단계 추가
              </Button>
            </div>
            {stages.map((stage, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">단계 {index + 1}</Label>
                  {stages.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStage(index)}
                    >
                      삭제
                    </Button>
                  )}
                </div>
                <Input
                  value={stage.stage}
                  onChange={(e) => updateStage(index, 'stage', e.target.value)}
                  placeholder="예: 서류접수, 필기시험, 1차 면접"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">시작일</Label>
                    <Input
                      type="date"
                      value={stage.startDate}
                      onChange={(e) => updateStage(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">종료일</Label>
                    <Input
                      type="date"
                      value={stage.endDate}
                      onChange={(e) => updateStage(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

