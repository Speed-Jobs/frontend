'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarCell } from './CalendarCell';
import { CompanySchedule, UserPin } from './types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CalendarProps {
  currentDate: Date;
  companySchedules: CompanySchedule[];
  userPins: UserPin[];
  onPreviousMonth: (e?: React.MouseEvent) => void;
  onNextMonth: (e?: React.MouseEvent) => void;
  onDateClick: (date: Date) => void;
  allowLinkNavigation?: boolean; // Link 네비게이션 허용 여부
}

export function Calendar({
  currentDate,
  companySchedules,
  userPins,
  onPreviousMonth,
  onNextMonth,
  onDateClick,
  allowLinkNavigation = false,
}: CalendarProps) {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 날짜를 YYYY-MM-DD 형식으로 정규화하여 시간 부분 제거
  const normalizeDateForComparison = (d: Date): Date => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Calculate max overlaps for legend
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  let maxOverlaps = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const normalizedDate = normalizeDateForComparison(date);
    
    const overlapsOnDay = companySchedules.filter((schedule) =>
      schedule.stages.some((stage) => {
        const normalizedStartDate = normalizeDateForComparison(stage.startDate);
        const normalizedEndDate = normalizeDateForComparison(stage.endDate);
        // 종료일은 하루 끝까지 포함하도록 설정
        normalizedEndDate.setHours(23, 59, 59, 999);
        return normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate;
      })
    ).length;
    maxOverlaps = Math.max(maxOverlaps, overlapsOnDay);
  }

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // 필요한 주 수 계산 (요일 헤더 제외)
  const totalCells = days.length;
  const weeksNeeded = Math.ceil(totalCells / 7);

  return (
    <Card className="bg-white h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-1 flex-shrink-0 px-3 pt-3">
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation()
          onPreviousMonth(e)
        }}>
          <ChevronLeft className="size-3" />
        </Button>
        <h2 className="text-sm font-semibold text-gray-900">
          {currentDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
          })}
        </h2>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation()
          onNextMonth(e)
        }}>
          <ChevronRight className="size-3" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col px-3 pb-2">
        {/* Competition Intensity Legend */}
        <div className="mb-1.5 flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-200 flex-shrink-0">
          <span className="text-[10px] text-slate-600">경쟁 강도:</span>
          <div className="flex items-center gap-1.5 flex-1 max-w-md">
            <span className="text-[9px] text-slate-500">낮음</span>
            <div className="flex-1 h-3 rounded-lg border border-slate-300 overflow-hidden">
              <div
                className="h-full w-full"
                style={{
                  background: (() => {
                    const baseOpacity = 0.15;
                    const incrementPerOverlap = 0.08;
                    const maxOpacity = Math.min(
                      baseOpacity + (maxOverlaps - 1) * incrementPerOverlap,
                      0.9
                    );
                    return `linear-gradient(to right, rgba(255, 255, 255, 1), rgba(234, 0, 44, ${maxOpacity}))`;
                  })(),
                }}
              />
            </div>
            <span className="text-[9px] text-slate-500">높음</span>
          </div>
          <span className="text-[9px] text-slate-600">
            (최대 <span className="font-medium text-red-600">{maxOverlaps}개사</span> 동시)
          </span>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 h-full" style={{ gridTemplateRows: `20px repeat(${weeksNeeded}, 1fr)` }}>
            {weekDays.map((day) => (
              <div
                key={day}
                className="bg-slate-100 p-0.5 text-center text-[10px] text-slate-600 flex-shrink-0"
              >
                {day}
              </div>
            ))}
            {days.map((day, index) => (
              <CalendarCell
                key={index}
                day={day}
                date={
                  day
                    ? new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                      )
                    : null
                }
                companySchedules={companySchedules}
                userPins={userPins}
                onDateClick={onDateClick}
                allowLinkNavigation={allowLinkNavigation}
              />
            ))}
          </div>
        </div>

        {/* Legend Below Calendar */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 flex-shrink-0 mt-1.5">
          <div className="text-[9px] text-slate-500 mb-0.5">우리 일정 색상</div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            <div className="flex items-center gap-1">
              <div className="bg-green-500 rounded-full h-2.5 w-5"></div>
              <span className="text-[9px] text-slate-700">서류 접수</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="bg-blue-500 rounded-full h-2.5 w-5"></div>
              <span className="text-[9px] text-slate-700">필기(인적성) 전형</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="bg-purple-500 rounded-full h-2.5 w-5"></div>
              <span className="text-[9px] text-slate-700">1차 면접</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="bg-pink-500 rounded-full h-2.5 w-5"></div>
              <span className="text-[9px] text-slate-700">2차 면접</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="bg-orange-500 rounded-full h-2.5 w-5"></div>
              <span className="text-[9px] text-slate-700">3차 면접</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

