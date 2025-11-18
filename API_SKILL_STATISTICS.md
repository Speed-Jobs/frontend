# 스킬별 통계 백엔드 API 연동 가이드

## 📋 API 엔드포인트

```
GET /api/skills/statistics
```

## 📦 요청 파라미터 (선택사항)

```typescript
interface SkillStatisticsParams {
  startDate?: string;      // YYYY-MM-DD 형식, 필터링 시작일
  endDate?: string;        // YYYY-MM-DD 형식, 필터링 종료일
  company?: string[];      // 회사 필터 (배열)
  limit?: number;          // 반환할 스킬 개수 (기본값: 20)
}
```

## 📥 응답 데이터 형식

### 기본 응답 구조

```typescript
interface SkillStatisticsResponse {
  skills: SkillData[];
  totalCount: number;      // 전체 공고 수
  period: {
    startDate: string;      // 분석 기간 시작일
    endDate: string;        // 분석 기간 종료일
  };
  generatedAt: string;     // 데이터 생성 시각 (ISO 8601)
}
```

### SkillData 인터페이스

```typescript
interface SkillData {
  name: string;                    // 스킬 이름 (소문자, 예: 'spring', 'react', 'python')
  count: number;                   // 해당 스킬이 언급된 공고 수
  percentage: number;              // 전체 공고 대비 비율 (%)
  change: number;                  // 이전 기간 대비 변화율 (%)
  relatedSkills: string[];         // 관련 스킬 목록 (배열)
}
```

## 📊 필드 상세 설명

### 1. `name` (string, 필수)
- **설명**: 스킬 이름
- **형식**: 소문자, 하이픈(-) 사용 가능
- **예시**: `'spring'`, `'react'`, `'nodejs'`, `'aws'`
- **용도**: 스킬 클라우드에서 표시되는 이름

### 2. `count` (number, 필수)
- **설명**: 해당 스킬이 언급된 공고의 총 개수
- **형식**: 정수 (0 이상)
- **예시**: `286`, `245`, `198`
- **용도**: 
  - 스킬 클라우드에서 버튼 크기 계산
  - 정렬 기준 (count 내림차순)
  - 통계 표시

### 3. `percentage` (number, 필수)
- **설명**: 전체 공고 수 대비 해당 스킬이 언급된 비율
- **형식**: 소수점 1자리 (예: 26.8)
- **범위**: 0 ~ 100
- **계산식**: `(count / totalCount) * 100`
- **예시**: `26.8`, `22.9`, `18.5`
- **용도**: 리포트 및 통계 표시

### 4. `change` (number, 필수)
- **설명**: 이전 기간 대비 변화율
- **형식**: 소수점 1자리, 양수는 증가, 음수는 감소
- **예시**: `3.5` (3.5% 증가), `-2.1` (2.1% 감소)
- **계산식**: `((현재기간_count - 이전기간_count) / 이전기간_count) * 100`
- **용도**: 트렌드 표시 (증가/감소 화살표)

### 5. `relatedSkills` (string[], 필수)
- **설명**: 해당 스킬과 함께 자주 언급되는 관련 스킬 목록
- **형식**: 문자열 배열
- **길이**: 보통 3~5개 권장
- **예시**: `['kotlin', 'java', 'maven', 'gradle']`
- **용도**: 
  - 스킬 클릭 시 관련 스킬 표시
  - 가지치기 형태의 연결선 그리기
  - 스킬 간 관계 시각화

## 📝 예시 응답

### JSON 응답 예시

```json
{
  "skills": [
    {
      "name": "spring",
      "count": 286,
      "percentage": 26.8,
      "change": 3.5,
      "relatedSkills": ["kotlin", "java", "maven", "gradle"]
    },
    {
      "name": "react",
      "count": 245,
      "percentage": 22.9,
      "change": 5.2,
      "relatedSkills": ["typescript", "javascript", "nextjs"]
    },
    {
      "name": "python",
      "count": 198,
      "percentage": 18.5,
      "change": 2.1,
      "relatedSkills": ["django", "flask", "fastapi"]
    },
    {
      "name": "typescript",
      "count": 187,
      "percentage": 17.5,
      "change": 4.3,
      "relatedSkills": ["react", "nodejs", "angular"]
    },
    {
      "name": "aws",
      "count": 156,
      "percentage": 14.6,
      "change": 1.8,
      "relatedSkills": ["ec2", "s3", "lambda"]
    }
  ],
  "totalCount": 1068,
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "generatedAt": "2025-01-15T10:30:00Z"
}
```

## 🔄 프론트엔드 연동 코드 예시

### 1. API 호출 함수

```typescript
// lib/api/skills.ts
interface SkillStatisticsParams {
  startDate?: string;
  endDate?: string;
  company?: string[];
  limit?: number;
}

export async function fetchSkillStatistics(
  params?: SkillStatisticsParams
): Promise<SkillStatisticsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.company) {
    params.company.forEach(c => queryParams.append('company', c));
  }
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const response = await fetch(
    `/api/skills/statistics?${queryParams.toString()}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch skill statistics');
  }
  
  return response.json();
}
```

### 2. 대시보드에서 사용

```typescript
// app/dashboard/page.tsx
import { useState, useEffect } from 'react';
import { fetchSkillStatistics } from '@/lib/api/skills';

export default function Dashboard() {
  const [skillsData, setSkillsData] = useState<SkillData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsLoading(true);
        const response = await fetchSkillStatistics({
          limit: 20, // 상위 20개 스킬만 가져오기
        });
        
        // count 기준 내림차순 정렬 (백엔드에서 정렬해도 되지만 프론트에서도 정렬)
        const sortedSkills = response.skills.sort((a, b) => b.count - a.count);
        setSkillsData(sortedSkills);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // 에러 발생 시 기본 데이터 사용 (선택사항)
        // setSkillsData(defaultSkillsData);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, []);

  // 기존 코드에서 skillsData 사용
  // ...
}
```

### 3. 에러 처리 및 로딩 상태

```typescript
{isLoading ? (
  <div className="flex items-center justify-center h-[500px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
) : error ? (
  <div className="flex items-center justify-center h-[500px] text-red-500">
    <p>데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
  </div>
) : (
  // 기존 스킬 클라우드 렌더링 코드
)}
```

## 📌 백엔드 구현 시 주의사항

### 1. 데이터 정렬
- 응답 데이터는 `count` 기준 내림차순으로 정렬되어야 합니다.
- 또는 프론트엔드에서 정렬할 수도 있습니다.

### 2. 관련 스킬 추천 알고리즘
- 같은 공고에서 함께 언급된 빈도 기반
- 또는 코사인 유사도 등 머신러닝 기반 추천
- 최소 3개, 최대 5개 권장

### 3. 변화율 계산
- 이전 기간과 비교하여 계산
- 예: 이전 달 대비, 이전 분기 대비 등
- 첫 데이터인 경우 `change: 0` 또는 `null` 처리

### 4. 성능 최적화
- 캐싱 전략 고려 (데이터가 자주 변경되지 않는 경우)
- 페이지네이션 또는 limit 파라미터 활용
- 인덱싱 최적화 (스킬 이름, 공고 날짜 등)

### 5. 데이터 일관성
- 스킬 이름은 소문자로 통일 (예: 'React' → 'react')
- 동의어 처리 (예: 'Node.js'와 'nodejs' 통일)
- 오타 및 변형 처리 (예: 'kubernetes'와 'k8s')

## 🔍 추가 고려사항

### 실시간 업데이트 (선택사항)

```typescript
// 주기적으로 데이터 갱신
useEffect(() => {
  const interval = setInterval(() => {
    fetchSkillStatistics().then(response => {
      setSkillsData(response.skills.sort((a, b) => b.count - a.count));
    });
  }, 5 * 60 * 1000); // 5분마다 갱신

  return () => clearInterval(interval);
}, []);
```

### 필터링 연동

```typescript
// 회사 필터 변경 시 스킬 통계도 업데이트
useEffect(() => {
  if (selectedCompanies.length > 0) {
    fetchSkillStatistics({
      company: selectedCompanies,
      limit: 20,
    }).then(response => {
      setSkillsData(response.skills.sort((a, b) => b.count - a.count));
    });
  }
}, [selectedCompanies]);
```

## 📊 데이터 검증

백엔드에서 반환하는 데이터가 다음 조건을 만족해야 합니다:

1. ✅ `skills` 배열이 존재하고 비어있지 않음
2. ✅ 각 스킬 객체에 필수 필드가 모두 존재
3. ✅ `count`는 0 이상의 정수
4. ✅ `percentage`는 0~100 사이의 숫자
5. ✅ `relatedSkills`는 배열이며 각 요소는 문자열
6. ✅ `name`은 중복되지 않음
7. ✅ 데이터는 `count` 기준 내림차순 정렬 (권장)

## 🎯 요약

백엔드에서 제공해야 할 최소 데이터 형식:

```typescript
{
  skills: [
    {
      name: string,           // 스킬 이름
      count: number,          // 공고 수
      percentage: number,     // 비율 (%)
      change: number,         // 변화율 (%)
      relatedSkills: string[] // 관련 스킬 배열
    }
  ]
}
```

이 형식으로 데이터를 제공하면 프론트엔드에서 바로 사용할 수 있습니다.

