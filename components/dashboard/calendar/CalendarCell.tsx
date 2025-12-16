'use client'

import React from 'react';
import { CompanySchedule, UserPin } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Flag, FilePenLine, Users, UserCheck, UserCog } from 'lucide-react';

const getPinIcon = (type: UserPin['type']) => {
  const iconMap = {
    '서류 접수': Flag,
    '인적성': FilePenLine,
    '1차 면접': Users,
    '2차 면접': UserCheck,
    '3차 면접': UserCog,
  } as const;
  return iconMap[type] || Flag;
};

const getPinColorClass = (type: UserPin['type']) => {
  const colorMap = {
    '서류 접수': 'text-green-600',
    '인적성': 'text-blue-600',
    '1차 면접': 'text-purple-600',
    '2차 면접': 'text-pink-600',
    '3차 면접': 'text-orange-600',
  } as const;
  return colorMap[type] || 'text-slate-600';
};

export const getPinDisplayLabel = (type: UserPin['type']) => {
  const labelMap = {
    '서류 접수': '서류 접수',
    '인적성': '필기(인적성) 전형',
    '1차 면접': '1차 면접',
    '2차 면접': '2차 면접',
    '3차 면접': '3차 면접',
  } as const;
  return labelMap[type] || type;
};

interface CalendarCellProps {
  day: number | null;
  date: Date | null;
  companySchedules: CompanySchedule[];
  userPins: UserPin[];
  onDateClick: (date: Date) => void;
  allowLinkNavigation?: boolean; // Link 네비게이션 허용 여부
}

export function CalendarCell({
  day,
  date,
  companySchedules,
  userPins,
  onDateClick,
  allowLinkNavigation = false,
}: CalendarCellProps) {
  if (!day || !date) {
    return <div className="border border-slate-100 bg-white" style={{ aspectRatio: '1' }} />;
  }

  // 날짜를 YYYY-MM-DD 형식으로 정규화하여 시간 부분 제거
  const normalizeDateForComparison = (d: Date): Date => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // 회사명 정규화 함수 (중복 제거용)
  const normalizeCompanyName = (name: string): string => {
    return name
      .trim()
      .toLowerCase()
      .replace(/[/·\s\-_]/g, '') // 슬래시, 중간점, 공백, 하이픈, 언더스코어 제거
      .replace(/ict/g, '') // ICT 제거
  }

  // Get all company-stage combinations on this date
  const companyStagesOnThisDate: Array<{
    company: CompanySchedule;
    stage: { stage: string; startDate: Date; endDate: Date };
  }> = [];

  const normalizedCurrentDate = normalizeDateForComparison(date);
  
  // 회사명별로 이미 추가된 스테이지 추적 (중복 방지)
  const addedCompanyStages = new Map<string, Set<string>>();
  
  companySchedules.forEach((company) => {
    const normalizedCompanyName = normalizeCompanyName(company.name);
    
    company.stages.forEach((stage) => {
      const normalizedStartDate = normalizeDateForComparison(stage.startDate);
      const normalizedEndDate = normalizeDateForComparison(stage.endDate);
      // 종료일은 하루 끝까지 포함하도록 설정
      normalizedEndDate.setHours(23, 59, 59, 999);
      
      if (normalizedCurrentDate >= normalizedStartDate && normalizedCurrentDate <= normalizedEndDate) {
        // 스테이지 키 생성 (회사명-스테이지명-날짜범위)
        const stageKey = `${stage.stage}-${stage.startDate.toISOString().split('T')[0]}-${stage.endDate.toISOString().split('T')[0]}`;
        
        // 같은 회사의 같은 스테이지가 이미 추가되지 않았는지 확인
        if (!addedCompanyStages.has(normalizedCompanyName)) {
          addedCompanyStages.set(normalizedCompanyName, new Set());
        }
        
        const companyStages = addedCompanyStages.get(normalizedCompanyName)!;
        if (!companyStages.has(stageKey)) {
          companyStages.add(stageKey);
          companyStagesOnThisDate.push({ company, stage });
        }
      }
    });
  });

  // Count unique companies with active stages on this date
  const uniqueCompaniesWithActiveStages = new Set(
    companyStagesOnThisDate.map((cs) => cs.company.id)
  );
  const overlapCount = uniqueCompaniesWithActiveStages.size;
  
  // Get unique company names (for display)
  const uniqueCompanyNames = Array.from(
    new Set(companyStagesOnThisDate.map((cs) => cs.company.name))
  );
  
  // 최대 3개까지 표시할 회사명
  const displayCompanyNames = uniqueCompanyNames.slice(0, 3);
  const remainingCompanyCount = uniqueCompanyNames.length - 3;

  // 각 경쟁사의 전체 채용 일정 범위 계산 (첫 전형 시작일부터 마지막 전형 종료일까지)
  // 주의: 이 함수는 더 이상 배경색 결정에 사용되지 않으며, 참고용으로만 유지됩니다.
  const getCompanyTotalScheduleRanges = () => {
    const ranges: Array<{ start: Date; end: Date }> = [];
    
    companySchedules.forEach((company) => {
      if (company.stages.length === 0) return;
      
      // 모든 전형의 시작일과 종료일 수집
      const allDates = company.stages.flatMap(stage => [
        normalizeDateForComparison(stage.startDate),
        normalizeDateForComparison(stage.endDate)
      ]);
      
      const minStart = new Date(Math.min(...allDates.map(d => d.getTime())));
      const maxEnd = new Date(Math.max(...allDates.map(d => d.getTime())));
      
      minStart.setHours(0, 0, 0, 0);
      maxEnd.setHours(23, 59, 59, 999);
      
      ranges.push({ start: minStart, end: maxEnd });
    });
    
    return ranges;
  };

  const companyTotalScheduleRanges = getCompanyTotalScheduleRanges();
  // 더 이상 사용하지 않음: 실제 진행 중인 스테이지가 있는 경우에만 색칠
  // const isInAnyCompanyTotalSchedule = companyTotalScheduleRanges.some(range => 
  //   normalizedCurrentDate >= range.start && normalizedCurrentDate <= range.end
  // );

  // Check if this date is within any user pin range
  const userPinRangesOnThisDate: UserPin[] = [];
  userPins.forEach((pin) => {
    if (pin.endDate) {
      const startDate = normalizeDateForComparison(new Date(pin.date));
      const endDate = normalizeDateForComparison(new Date(pin.endDate));
      // 종료일은 하루 끝까지 포함하도록 설정
      endDate.setHours(23, 59, 59, 999);
      if (normalizedCurrentDate >= startDate && normalizedCurrentDate <= endDate) {
        userPinRangesOnThisDate.push(pin);
      }
    }
  });

  const allPinsOnThisDate = [...userPinRangesOnThisDate];

  // 전체 채용 일정 기간 계산 (모든 전형의 시작일부터 마지막 전형의 종료일까지)
  const getTotalScheduleRange = () => {
    if (userPins.length === 0) return null;
    
    const dates = userPins.map(pin => {
      const start = normalizeDateForComparison(new Date(pin.date));
      const end = pin.endDate ? normalizeDateForComparison(new Date(pin.endDate)) : normalizeDateForComparison(new Date(pin.date));
      return { start, end };
    });
    
    const minStart = new Date(Math.min(...dates.map(d => d.start.getTime())));
    const maxEnd = new Date(Math.max(...dates.map(d => d.end.getTime())));
    
    // 시간 부분 제거
    minStart.setHours(0, 0, 0, 0);
    maxEnd.setHours(23, 59, 59, 999); // 종료일은 하루 끝까지 포함
    
    return { start: minStart, end: maxEnd };
  };

  const totalScheduleRange = getTotalScheduleRange();
  const isInTotalScheduleRange = totalScheduleRange && 
    normalizedCurrentDate >= totalScheduleRange.start && 
    normalizedCurrentDate <= totalScheduleRange.end;

  const hasOverlap = overlapCount > 0;

  // Calculate opacity based on overlap (more overlaps = darker)
  const getBackgroundStyle = () => {
    // 실제 진행 중인 스테이지가 있는 경우에만 색칠
    if (overlapCount === 0) {
      return { backgroundColor: 'white' };
    }
    
    // 경쟁 강도 배경색 계산
    const baseOpacity = 0.15;
    const incrementPerOverlap = 0.08;
    const opacity = Math.min(baseOpacity + (overlapCount - 1) * incrementPerOverlap, 0.9);
    
    return {
      backgroundColor: `rgba(234, 0, 44, ${opacity})`, // SK Red
    };
  };

  // Get badge info for user pin ranges
  const getUserBadges = () => {
    if (userPinRangesOnThisDate.length === 0) return [];

    const badgeConfig = {
      '서류 접수': { color: 'bg-green-500', text: '서류 접수', textColor: 'text-white' },
      '인적성': { color: 'bg-blue-500', text: '필기(인적성) 전형', textColor: 'text-white' },
      '1차 면접': { color: 'bg-purple-500', text: '1차 면접', textColor: 'text-white' },
      '2차 면접': { color: 'bg-pink-500', text: '2차 면접', textColor: 'text-white' },
      '3차 면접': { color: 'bg-orange-500', text: '3차 면접', textColor: 'text-white' },
    };

    return userPinRangesOnThisDate.map((pin) => {
      const startDate = new Date(pin.date);
      const endDate = pin.endDate ? new Date(pin.endDate) : new Date(pin.date);
      
      // Determine if this is start, middle, or end of range
      const isStart = date.toDateString() === startDate.toDateString();
      const isEnd = date.toDateString() === endDate.toDateString();
      
      return {
        ...badgeConfig[pin.type],
        type: pin.type,
        isStart,
        isEnd,
      };
    });
  };

  const userBadges = getUserBadges();

  const isToday =
    date.toDateString() === new Date().toDateString();

  const handleClick = (e: React.MouseEvent) => {
    // Link 네비게이션이 허용된 경우 preventDefault를 하지 않음
    if (!allowLinkNavigation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (date) {
      onDateClick(date);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`border p-0.5 transition-all hover:border-blue-400 hover:shadow-md cursor-pointer relative ${
              isToday 
                ? 'border-blue-500 border-2' 
                : 'border-slate-200'
            }`}
            style={{ ...getBackgroundStyle(), aspectRatio: '1' }}
            onClick={handleClick}
          >
            <div className="flex flex-col h-full relative z-10">
              <div
                className={`text-[10px] ${
                  hasOverlap ? 'text-slate-900' : 'text-slate-600'
                }`}
              >
                {day}
              </div>

              {/* 회사명 표시 (최대 3개) */}
              {displayCompanyNames.length > 0 && (
                <div className="flex-1 flex flex-col justify-start pt-0.5 gap-0.5 min-h-0 overflow-hidden">
                  {displayCompanyNames.map((companyName, idx) => (
                    <div
                      key={idx}
                      className="text-[8px] text-slate-700 leading-tight px-0.5 font-medium"
                      style={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.1',
                      }}
                      title={companyName}
                    >
                      {companyName}
                    </div>
                  ))}
                  {remainingCompanyCount > 0 && (
                    <div className="text-[7px] text-slate-500 px-0.5 font-medium">
                      +{remainingCompanyCount}개
                    </div>
                  )}
                </div>
              )}

              {/* Long bars for user ranges */}
              {userBadges.length > 0 && (
                <div className="absolute left-0 right-0 top-5 flex flex-col z-20">
                  {userBadges.map((badge, index) => {
                    const roundedClass = badge.isStart && badge.isEnd 
                      ? 'rounded-full px-2' 
                      : badge.isStart 
                      ? 'rounded-l-full pl-2' 
                      : badge.isEnd 
                      ? 'rounded-r-full pr-2' 
                      : '';
                    
                    // Extend beyond borders to connect cells seamlessly
                    const positionStyle: React.CSSProperties = {};
                    if (!badge.isStart) {
                      positionStyle.marginLeft = '-1px';
                      positionStyle.paddingLeft = '1px';
                    }
                    if (!badge.isEnd) {
                      positionStyle.marginRight = '-1px';
                      positionStyle.paddingRight = '1px';
                    }
                    
                    return (
                      <div
                        key={index}
                        className={`${badge.color} ${badge.textColor} ${roundedClass} h-2.5 flex items-center text-[8px] text-left leading-tight`}
                        style={positionStyle}
                      >
                        {badge.isStart ? badge.text : ''}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            {companyStagesOnThisDate.length > 0 && (
              <div>
                {(() => {
                  // Group by stage type
                  const byStage: Record<
                    string,
                    Array<{
                      company: CompanySchedule;
                      stage: { stage: string; startDate: Date; endDate: Date };
                    }>
                  > = {};
                  companyStagesOnThisDate.forEach((cs) => {
                    if (!byStage[cs.stage.stage]) {
                      byStage[cs.stage.stage] = [];
                    }
                    byStage[cs.stage.stage].push(cs);
                  });

                  return Object.entries(byStage).map(([stageName, companyStages]) => {
                    // 회사명 정규화 함수 (중복 제거용)
                    const normalizeCompanyName = (name: string): string => {
                      return name
                        .trim()
                        .toLowerCase()
                        .replace(/[/·\s\-_]/g, '') // 슬래시, 중간점, 공백, 하이픈, 언더스코어 제거
                        .replace(/ict/g, '') // ICT 제거
                    }
                    
                    // 같은 회사명을 가진 항목들을 중복 제거
                    // 정규화된 회사명을 키로 사용하여 같은 회사는 한 번만 표시
                    const uniqueCompanies = new Map<string, { company: CompanySchedule; stage: { stage: string; startDate: Date; endDate: Date } }>()
                    
                    companyStages.forEach((cs) => {
                      // 정규화된 회사명을 키로 사용
                      const normalizedName = normalizeCompanyName(cs.company.name)
                      
                      // 같은 회사가 이미 있으면, predicted를 우선 표시하거나 첫 번째 것을 유지
                      if (!uniqueCompanies.has(normalizedName)) {
                        uniqueCompanies.set(normalizedName, cs)
                      } else {
                        const existing = uniqueCompanies.get(normalizedName)!
                        // predicted가 있으면 predicted를 우선 표시
                        if (cs.company.dataType === 'predicted' && existing.company.dataType !== 'predicted') {
                          uniqueCompanies.set(normalizedName, cs)
                        }
                        // 둘 다 predicted이거나 둘 다 actual이면 첫 번째 것을 유지 (이미 추가된 것)
                      }
                    })
                    
                    // 회사명으로 정렬하여 일관된 순서 유지
                    const sortedCompanies = Array.from(uniqueCompanies.values()).sort((a, b) => 
                      a.company.name.localeCompare(b.company.name, 'ko')
                    )
                    
                    return (
                      <div key={stageName} className="mb-2 last:mb-0">
                        <div className="text-xs text-slate-500 mb-1">{stageName}</div>
                        {sortedCompanies.map((cs, idx) => (
                          <div key={`${cs.company.id}-${cs.stage.stage}-${cs.stage.startDate.getTime()}-${cs.stage.endDate.getTime()}-${idx}`} className="flex items-center gap-2 text-sm ml-2">
                            <span>
                              {cs.company.name}
                              {cs.company.dataType === 'predicted' && (
                                <span className="text-xs text-slate-400 ml-1">(예측)</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  });
                })()}
              </div>
            )}

            {allPinsOnThisDate.length > 0 && (
              <div className={companyStagesOnThisDate.length > 0 ? "border-t border-slate-200 pt-2" : ""}>
                <div className="text-xs text-slate-400 mb-1">우리 일정:</div>
                {allPinsOnThisDate.map((pin) => {
                  const Icon = getPinIcon(pin.type);
                  const colorClass = getPinColorClass(pin.type);
                  const displayLabel = getPinDisplayLabel(pin.type);
                  return (
                    <div key={pin.id} className="flex items-center gap-2 text-sm">
                      <Icon className={`size-3 ${colorClass}`} />
                      <span>{displayLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {companyStagesOnThisDate.length === 0 && allPinsOnThisDate.length === 0 && (
              <div className="text-sm text-slate-500">일정이 없습니다</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

