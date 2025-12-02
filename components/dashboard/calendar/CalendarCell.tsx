'use client'

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

  // Get all company-stage combinations on this date
  const companyStagesOnThisDate: Array<{
    company: CompanySchedule;
    stage: { stage: string; startDate: Date; endDate: Date };
  }> = [];

  companySchedules.forEach((company) => {
    company.stages.forEach((stage) => {
      if (date >= stage.startDate && date <= stage.endDate) {
        companyStagesOnThisDate.push({ company, stage });
      }
    });
  });

  // Count unique companies with active stages on this date
  const uniqueCompaniesWithActiveStages = new Set(
    companyStagesOnThisDate.map((cs) => cs.company.id)
  );
  const overlapCount = uniqueCompaniesWithActiveStages.size;

  // Check if this date is within any user pin range
  const userPinRangesOnThisDate: UserPin[] = [];
  userPins.forEach((pin) => {
    if (pin.endDate) {
      const startDate = new Date(pin.date);
      const endDate = new Date(pin.endDate);
      if (date >= startDate && date <= endDate) {
        userPinRangesOnThisDate.push(pin);
      }
    }
  });

  const allPinsOnThisDate = [...userPinRangesOnThisDate];

  const hasOverlap = overlapCount > 0;

  // Calculate opacity based on overlap (more overlaps = darker)
  const getBackgroundStyle = () => {
    if (overlapCount === 0) return { backgroundColor: 'white' };
    
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
      '인적성': { color: 'bg-blue-500', text: '인적성', textColor: 'text-white' },
      '1차 면접': { color: 'bg-purple-500', text: '1차', textColor: 'text-white' },
      '2차 면접': { color: 'bg-pink-500', text: '2차', textColor: 'text-white' },
      '3차 면접': { color: 'bg-orange-500', text: '3차', textColor: 'text-white' },
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

              {/* Long bars for user ranges */}
              {userBadges.length > 0 && (
                <div className="absolute left-0 right-0 top-3 flex flex-col z-20">
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

                  return Object.entries(byStage).map(([stageName, companyStages]) => (
                    <div key={stageName} className="mb-2 last:mb-0">
                      <div className="text-xs text-slate-500 mb-1">{stageName}</div>
                      {companyStages.map((cs, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm ml-2">
                          <span>
                            {cs.company.name}
                            {cs.company.dataType === 'predicted' && (
                              <span className="text-xs text-slate-400 ml-1">(예측)</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            )}

            {allPinsOnThisDate.length > 0 && (
              <div className={companyStagesOnThisDate.length > 0 ? "border-t border-slate-200 pt-2" : ""}>
                <div className="text-xs text-slate-400 mb-1">우리 일정:</div>
                {allPinsOnThisDate.map((pin) => {
                  const Icon = getPinIcon(pin.type);
                  const colorClass = getPinColorClass(pin.type);
                  return (
                    <div key={pin.id} className="flex items-center gap-2 text-sm">
                      <Icon className={`size-3 ${colorClass}`} />
                      <span>{pin.type}</span>
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

