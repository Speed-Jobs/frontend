# 직군별 통계 API 사용 가이드

## 개요

직군별 통계 API는 채용 공고를 직군별로 분류하여 주간/월간 단위로 통계를 제공합니다. 현재 기간과 이전 기간의 데이터를 비교하여 직군별 채용 동향을 분석할 수 있습니다.

## 엔드포인트

```
GET /api/v1/dashboard/job-role-statistics
```

## 요청 파라미터

### 필수 파라미터

| 파라미터 | 타입 | 설명 | 예시 |
|---------|------|------|------|
| `timeframe` | string | 통계 기간 단위 (`weekly` 또는 `monthly`) | `weekly` |
| `category` | string | 직군 카테고리 (`Tech`, `Biz`, `BizSupporting`) | `Tech` |

### 선택 파라미터

| 파라미터 | 타입 | 설명 | 예시 |
|---------|------|------|------|
| `start_date` | string (YYYY-MM-DD) | 현재 기간 시작일 (지정하지 않으면 자동 계산) | `2024-12-01` |
| `end_date` | string (YYYY-MM-DD) | 현재 기간 종료일 (지정하지 않으면 오늘 날짜) | `2024-12-08` |
| `company` | string | 특정 회사 필터링 (선택사항) | `토스` |

## 직군 카테고리별 직군 목록

### Tech 카테고리
- Software Development
- Factory AX Engineering
- Solution Development
- Cloud/Infra Engineering
- Architect
- Project Management
- Quality Management
- AI
- 정보보호

### Biz 카테고리
- Sales
- Domain Expert
- Consulting

### BizSupporting 카테고리
- Biz. Supporting

## 요청 예시

### 주간 Tech 카테고리 통계 조회

```bash
curl -X GET \
  'https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-role-statistics?timeframe=weekly&category=Tech' \
  -H 'accept: application/json'
```

### 월간 Biz 카테고리 통계 조회 (기간 지정)

```bash
curl -X GET \
  'https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-role-statistics?timeframe=monthly&category=Biz&start_date=2024-12-01&end_date=2024-12-08' \
  -H 'accept: application/json'
```

### 특정 회사 필터링

```bash
curl -X GET \
  'https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-role-statistics?timeframe=weekly&category=Tech&company=토스' \
  -H 'accept: application/json'
```

## 응답 예시

### 성공 응답 (200 OK)

```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "직군별 통계 조회 성공",
  "data": {
    "timeframe": "weekly",
    "category": "Tech",
    "current_period": {
      "start_date": "2024-12-01",
      "end_date": "2024-12-08"
    },
    "previous_period": {
      "start_date": "2024-11-24",
      "end_date": "2024-11-30"
    },
    "statistics": [
      {
        "name": "Software Development",
        "value": 45,
        "previousValue": 38,
        "change_rate": 18.4,
        "industries": [
          "Front-end Development",
          "Back-end Development",
          "Mobile Development"
        ]
      },
      {
        "name": "Factory AX Engineering",
        "current_count": 12,
        "previous_count": 15,
        "change_rate": -20.0,
        "industries": [
          "Simulation",
          "기구설계",
          "전장/제어"
        ]
      }
      // ... 더 많은 직군 데이터
    ]
  }
}
```

### 에러 응답 (400 Bad Request)

```json
{
  "status": 400,
  "code": "BAD_REQUEST",
  "message": "잘못된 요청 파라미터입니다.",
  "errors": [
    {
      "field": "timeframe",
      "message": "timeframe은 'weekly' 또는 'monthly'만 가능합니다."
    }
  ]
}
```

## 응답 필드 설명

### JobRoleStatistic 객체

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | string | 직군 이름 |
| `value` | integer | 현재 기간의 채용 공고 수 |
| `previousValue` | integer | 이전 기간의 채용 공고 수 |
| `change_rate` | float (nullable, 선택사항) | 변화율 (백분율). 이전 기간이 0인 경우 null. 프론트엔드에서 계산 가능 |
| `industries` | array[string] | 해당 직군에 속하는 산업/세부 분야 목록 |

### 변화율 계산식

```
change_rate = ((value - previousValue) / previousValue) * 100
```

`previousValue`가 0인 경우 `change_rate`는 `null`로 반환됩니다.

## 기간 자동 계산 규칙

### Weekly (주간)
- **현재 기간**: 오늘로부터 7일 전 ~ 오늘
- **이전 기간**: 7일 전 ~ 14일 전

### Monthly (월간)
- **현재 기간**: 이번 달 1일 ~ 오늘
- **이전 기간**: 지난 달 1일 ~ 지난 달 마지막 날

## 프론트엔드 연동 예시

### TypeScript/React 예시

```typescript
interface JobRoleStatistic {
  name: string;
  value: number;
  previousValue: number;
  change_rate?: number | null;
  industries: string[];
}

interface JobRoleStatisticsResponse {
  status: number;
  code: string;
  message: string;
  data: {
    timeframe: 'weekly' | 'monthly';
    category: 'Tech' | 'Biz' | 'BizSupporting';
    current_period: {
      start_date: string;
      end_date: string;
    };
    previous_period: {
      start_date: string;
      end_date: string;
    };
    statistics: JobRoleStatistic[];
  };
}

async function fetchJobRoleStatistics(
  timeframe: 'weekly' | 'monthly',
  category: 'Tech' | 'Biz' | 'BizSupporting',
  startDate?: string,
  endDate?: string,
  company?: string
): Promise<JobRoleStatisticsResponse> {
  const params = new URLSearchParams({
    timeframe,
    category,
  });
  
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (company) params.append('company', company);
  
  const response = await fetch(
    `https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-role-statistics?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    }
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// 사용 예시
const data = await fetchJobRoleStatistics('weekly', 'Tech');
console.log(data.data.statistics);
```

## 데이터 변환 가이드

프론트엔드에서 사용하는 데이터 형식으로 변환:

```typescript
function transformToFrontendFormat(
  apiData: JobRoleStatisticsResponse
): Array<{
  name: string;
  value: number;
  previousValue: number;
  industries: string[];
}> {
  // API 응답이 이미 프론트엔드 형식과 일치하므로 그대로 반환
  return apiData.data.statistics.map((stat) => ({
    name: stat.name,
    value: stat.value,
    previousValue: stat.previousValue,
    industries: stat.industries,
  }));
}
```

## 주의사항

1. **기간 계산**: `start_date`와 `end_date`를 지정하지 않으면 서버에서 자동으로 계산합니다.
2. **변화율**: `previousValue`가 0인 경우 `change_rate`는 `null`로 반환됩니다. 프론트엔드에서 계산 가능하므로 선택적으로 제공됩니다.
3. **카운트**: 모든 직군이 응답에 포함되며, 공고가 없는 직군은 `value`와 `previousValue`가 모두 0으로 반환됩니다.
4. **이전 기간 데이터 없음**: 이전 기간에 데이터가 모두 0인 경우에도 모든 직군이 응답에 포함되며, 프론트엔드에서 차트 표시 시 적절히 처리합니다.
5. **회사 필터**: `company` 파라미터를 지정하면 해당 회사의 공고만 집계됩니다.
6. **필드명**: API 응답의 필드명(`value`, `previousValue`)이 프론트엔드에서 사용하는 형식과 일치하므로 별도 변환 없이 사용 가능합니다.

## 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|-----------|------|
| `SUCCESS` | 200 | 요청 성공 |
| `BAD_REQUEST` | 400 | 잘못된 요청 파라미터 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |

