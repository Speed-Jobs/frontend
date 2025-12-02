'use client'

import { useState } from 'react'
import { Plus, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanySchedule } from './types'
import { AddScheduleDialog } from './AddScheduleDialog'

interface CompanyScheduleManagerProps {
  schedules: CompanySchedule[]
  onAdd: (schedule: Omit<CompanySchedule, 'id'>) => void
  onRemove: (id: string) => void
  onClearAll: () => void
}

export function CompanyScheduleManager({
  schedules,
  onAdd,
  onRemove,
  onClearAll,
}: CompanyScheduleManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">경쟁사 채용 일정</CardTitle>
          {schedules.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearAll}
              className="text-xs"
            >
              <RotateCcw className="size-3 mr-1" />
              초기화
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => setIsDialogOpen(true)} className="w-full">
          <Plus className="size-4 mr-2" />
          채용 일정 추가
        </Button>

        {/* Existing Schedules */}
        <div className="space-y-2">
          {schedules.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              등록된 일정이 없습니다
            </p>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{schedule.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                      {schedule.type}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(schedule.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {schedule.stages.map((stage) => (
                    <div key={stage.id} className="text-xs text-slate-600">
                      {stage.stage}: {stage.startDate.toLocaleDateString('ko-KR')} ~{' '}
                      {stage.endDate.toLocaleDateString('ko-KR')}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <AddScheduleDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onAdd={onAdd}
        />
      </CardContent>
    </Card>
  )
}

