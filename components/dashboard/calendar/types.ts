export interface CompanySchedule {
  id: string;
  name: string;
  color: string;
  type: '신입' | '경력';
  dataType?: 'actual' | 'predicted'; // 실제 공고 or 예측치 (신입 공고에만 적용)
  jobRole?: string; // 직군 정보 (경력 공고에만 적용)
  stages: ScheduleStage[];
}

export interface ScheduleStage {
  id: string;
  stage: string;
  startDate: Date;
  endDate: Date;
}

export interface UserPin {
  id: string;
  type: '서류 접수' | '인적성' | '1차 면접' | '2차 면접' | '3차 면접';
  date: Date;
  endDate?: Date; // For range-based stages
  simulationId?: string; // 시뮬레이션 세트 구분을 위한 ID
}

export const PIN_TYPES = [
  { value: '서류 접수', label: '서류 접수', color: 'bg-green-600', icon: 'flag' },
  { value: '인적성', label: '인적성', color: 'bg-blue-600', icon: 'file-pen-line' },
  { value: '1차 면접', label: '1차 면접', color: 'bg-purple-600', icon: 'users' },
  { value: '2차 면접', label: '2차 면접', color: 'bg-pink-600', icon: 'user-check' },
  { value: '3차 면접', label: '3차 면접', color: 'bg-orange-600', icon: 'user-cog' },
] as const;

export const STAGE_TYPES = [
  '서류접수',
  '서류전형',
  '인적성검사',
  '1차 면접',
  '2차 면접',
  '3차 면접',
  '최종 면접',
  '합격자 발표',
] as const;

