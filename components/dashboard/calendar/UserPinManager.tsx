'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPin } from './types'
import { AddUserScheduleDialog } from './AddUserScheduleDialog'

interface UserPinManagerProps {
  pins: UserPin[]
  onAdd: (pins: Omit<UserPin, 'id'>[]) => void
  onRemove: (id: string) => void
  onClearAll: () => void
}

export function UserPinManager({ pins, onAdd, onRemove, onClearAll }: UserPinManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">우리 회사 일정 시뮬레이션</CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          일정을 설정하고 경쟁사와 비교한 인사이트를 확인하세요
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => setIsDialogOpen(true)} className="w-full">
          <Plus className="size-4 mr-2" />
          일정 시뮬레이션 시작
        </Button>

        <div className="border-t border-slate-200 pt-4 space-y-2">
          {pins.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              추가된 일정이 없습니다
            </p>
          ) : (
            <div className="bg-slate-50 rounded-lg border border-slate-200">
              {/* Header with title and delete button */}
              <div className="flex items-center justify-between p-3 border-b border-slate-200">
                <div className="text-sm font-medium text-slate-900">우리 채용 일정</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="h-8 w-8 p-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
              
              {/* Pin list */}
              <div className="p-3 space-y-2">
                {pins.map((pin) => (
                  <div key={pin.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-slate-700 font-medium">{pin.type}</div>
                      <div className="text-xs text-slate-500">
                        {pin.endDate && pin.endDate.toDateString() !== pin.date.toDateString()
                          ? `${pin.date.toLocaleDateString('ko-KR')} ~ ${pin.endDate.toLocaleDateString('ko-KR')}`
                          : pin.date.toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AddUserScheduleDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onAdd={onAdd}
        />
      </CardContent>
    </Card>
  )
}

