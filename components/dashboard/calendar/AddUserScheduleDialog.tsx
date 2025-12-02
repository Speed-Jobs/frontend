'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { UserPin, PIN_TYPES } from './types'

interface AddUserScheduleDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (pins: Omit<UserPin, 'id'>[]) => void
}

export function AddUserScheduleDialog({ open, onClose, onAdd }: AddUserScheduleDialogProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<UserPin['type']>>(new Set())
  const [dates, setDates] = useState<Record<UserPin['type'], { date: string; endDate?: string }>>({
    '서류 접수': { date: '', endDate: '' },
    '인적성': { date: '', endDate: '' },
    '1차 면접': { date: '', endDate: '' },
    '2차 면접': { date: '', endDate: '' },
    '3차 면접': { date: '', endDate: '' },
  })

  const toggleType = (type: UserPin['type']) => {
    const newSet = new Set(selectedTypes)
    if (newSet.has(type)) {
      newSet.delete(type)
    } else {
      newSet.add(type)
    }
    setSelectedTypes(newSet)
  }

  const updateDate = (type: UserPin['type'], field: 'date' | 'endDate', value: string) => {
    setDates({
      ...dates,
      [type]: {
        ...dates[type],
        [field]: value,
      },
    })
  }

  const handleSubmit = () => {
    const pins: Omit<UserPin, 'id'>[] = Array.from(selectedTypes)
      .filter(type => dates[type].date)
      .map(type => ({
        type,
        date: new Date(dates[type].date),
        endDate: dates[type].endDate ? new Date(dates[type].endDate) : undefined,
      }))

    if (pins.length === 0) return

    onAdd(pins)

    // Reset form
    setSelectedTypes(new Set())
    setDates({
      '서류 접수': { date: '', endDate: '' },
      '인적성': { date: '', endDate: '' },
      '1차 면접': { date: '', endDate: '' },
      '2차 면접': { date: '', endDate: '' },
      '3차 면접': { date: '', endDate: '' },
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>우리 회사 일정 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>일정 단계 선택</Label>
            {PIN_TYPES.map((pinType) => {
              const isSelected = selectedTypes.has(pinType.value)
              return (
                <div key={pinType.value} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleType(pinType.value)}
                    />
                    <Label className="font-normal cursor-pointer">
                      {pinType.label}
                    </Label>
                  </div>
                  {isSelected && (
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">시작일</Label>
                        <Input
                          type="date"
                          value={dates[pinType.value].date}
                          onChange={(e) => updateDate(pinType.value, 'date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">종료일 (선택)</Label>
                        <Input
                          type="date"
                          value={dates[pinType.value].endDate || ''}
                          onChange={(e) => updateDate(pinType.value, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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

