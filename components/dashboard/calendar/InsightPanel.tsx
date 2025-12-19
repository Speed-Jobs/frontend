'use client'

import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CompanySchedule, UserPin } from './types'
import { getPinDisplayLabel } from './CalendarCell'

const getPhaseDisplayLabel = (phase: string) => {
  const labelMap: Record<string, string> = {
    '서류 접수 기간': '서류 접수',
    '인적성': '필기(인적성) 전형',
    '1차 면접': '1차 면접',
    '2차 면접': '2차 면접',
    '3차 면접': '3차 면접',
  }
  return labelMap[phase] || phase
}

interface InsightPanelProps {
  companySchedules: CompanySchedule[]
  userPins: UserPin[]
  currentDate: Date
}

export function InsightPanel({
  companySchedules,
  userPins,
}: InsightPanelProps) {
  const insights = generateInsights(companySchedules, userPins)

  if (insights.length === 0) return null

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="size-5 text-blue-600" />
          전략적 인사이트
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex gap-3 p-3 bg-white rounded-lg border border-slate-200"
          >
            <div className="flex-shrink-0 mt-0.5">
              {insight.type === 'warning' && (
                <AlertCircle className="size-5 text-amber-600" />
              )}
              {insight.type === 'success' && (
                <CheckCircle className="size-5 text-green-600" />
              )}
              {insight.type === 'info' && (
                <TrendingUp className="size-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={
                    insight.type === 'warning'
                      ? 'destructive'
                      : insight.type === 'success'
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {getPhaseDisplayLabel(insight.phase)}
                </Badge>
              </div>
              <p className="text-sm text-slate-700">{insight.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface Insight {
  type: 'warning' | 'success' | 'info'
  phase: string
  message: string
  companies?: string[]
}

function generateInsights(
  companySchedules: CompanySchedule[],
  userPins: UserPin[]
): Insight[] {
  const insights: Insight[] = []

  if (userPins.length === 0) return insights

  // Group pins by type
  const postingPin = userPins.find((p) => p.type === '서류 접수')
  const aptitudePin = userPins.find((p) => p.type === '인적성')
  const interview1Pin = userPins.find((p) => p.type === '1차 면접')
  const interview2Pin = userPins.find((p) => p.type === '2차 면접')
  const interview3Pin = userPins.find((p) => p.type === '3차 면접')

  // Analyze posting period
  if (postingPin) {
    const postingStart = postingPin.date
    const postingEnd = postingPin.endDate || postingPin.date
    
    const overlappingCompanies = companySchedules.filter((schedule) => {
      return schedule.stages.some((stage) => {
        return (
          (postingStart >= stage.startDate && postingStart <= stage.endDate) ||
          (postingEnd >= stage.startDate && postingEnd <= stage.endDate) ||
          (postingStart <= stage.startDate && postingEnd >= stage.endDate)
        )
      })
    })

    if (overlappingCompanies.length >= 3) {
      insights.push({
        type: 'warning',
        phase: '서류 접수 기간',
        message: `서류 접수 기간 중 높은 경쟁도 (${overlappingCompanies.length}개 기업). 지원자 수가 감소할 수 있습니다. 접수 기간 연장 또는 채용 브랜딩 강화를 고려하세요.`,
        companies: overlappingCompanies.map((c) => c.name),
      })
    } else if (overlappingCompanies.length === 0) {
      insights.push({
        type: 'success',
        phase: '서류 접수 기간',
        message:
          '서류 접수 기간 중 경쟁사가 없습니다! 우수 인재를 유치할 수 있는 최적의 시기입니다.',
      })
    } else {
      insights.push({
        type: 'info',
        phase: '서류 접수 기간',
        message: `서류 접수 기간 중 보통 수준의 경쟁 (${overlappingCompanies.length}개 기업). 정상적인 지원자 유입이 예상됩니다.`,
        companies: overlappingCompanies.map((c) => c.name),
      })
    }
  }

  // Analyze aptitude test
  if (aptitudePin) {
    const overlappingCompanies = companySchedules.filter((schedule) =>
      schedule.stages.some(
        (stage) =>
          aptitudePin.date >= stage.startDate &&
          aptitudePin.date <= stage.endDate
      )
    )

    if (overlappingCompanies.length >= 2) {
      insights.push({
        type: 'warning',
        phase: '인적성',
        message:
          '인적성 검사일이 여러 기업과 겹칩니다. 지원자들의 일정 충돌이나 선택 상황이 발생할 수 있습니다.',
        companies: overlappingCompanies.map((c) => c.name),
      })
    } else if (overlappingCompanies.length === 0) {
      insights.push({
        type: 'success',
        phase: '인적성',
        message:
          '인적성 검사가 경쟁이 적은 시기에 예정되어 있습니다. 지원자 참여율이 높을 것으로 예상됩니다.',
      })
    }
  }

  // Analyze interviews
  if (interview1Pin) {
    const overlappingCompanies = companySchedules.filter((schedule) =>
      schedule.stages.some(
        (stage) =>
          interview1Pin.date >= stage.startDate &&
          interview1Pin.date <= stage.endDate
      )
    )

    if (overlappingCompanies.length >= 3) {
      insights.push({
        type: 'warning',
        phase: '1차 면접',
        message:
          '1차 면접 기간 중 높은 경쟁이 예상됩니다. 우수 지원자는 복수 합격 가능성이 높으니 신속한 의사결정을 권장합니다.',
        companies: overlappingCompanies.map((c) => c.name),
      })
    }
  }

  if (interview2Pin) {
    const overlappingCompanies = companySchedules.filter((schedule) =>
      schedule.stages.some(
        (stage) =>
          interview2Pin.date >= stage.startDate &&
          interview2Pin.date <= stage.endDate
      )
    )

    if (overlappingCompanies.length === 0) {
      insights.push({
        type: 'success',
        phase: '2차 면접',
        message:
          '2차 면접 단계에 경쟁사가 없습니다. 우수 지원자를 확보할 수 있는 최적의 기회입니다.',
      })
    } else if (overlappingCompanies.length >= 2) {
      insights.push({
        type: 'info',
        phase: '2차 면접',
        message:
          '2차 면접 중 일부 경쟁이 있습니다. 경쟁력 있는 제안과 빠른 의사결정을 준비하세요.',
        companies: overlappingCompanies.map((c) => c.name),
      })
    }
  }

  // Overall timeline analysis
  const allPinDates = userPins.map((p) => p.date)
  if (allPinDates.length >= 2) {
    const minDate = new Date(Math.min(...allPinDates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...allPinDates.map((d) => d.getTime())))
    const durationDays = Math.ceil(
      (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (durationDays < 14) {
      insights.push({
        type: 'info',
        phase: '전체 일정',
        message: `채용 프로세스가 ${durationDays}일 소요됩니다. 빠른 일정으로 경쟁사보다 먼저 지원자를 확보할 수 있습니다.`,
      })
    } else if (durationDays > 30) {
      insights.push({
        type: 'warning',
        phase: '전체 일정',
        message: `채용 프로세스가 ${durationDays}일 소요됩니다. 긴 일정으로 인해 지원자가 더 빠른 경쟁사로 이탈할 가능성을 고려하세요.`,
      })
    }
  }

  return insights
}

