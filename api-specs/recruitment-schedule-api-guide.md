# 채용 일정 분석 시스템 API 사용 가이드

## 📋 개요

채용 일정 분석 시스템 백엔드 연동을 위한 API 명세서입니다. 이 문서는 Swagger Editor에서 확인할 수 있는 OpenAPI 3.0 형식으로 작성되었습니다.

## 🔗 Swagger Editor에서 확인하기

### 방법 1: 온라인 Swagger Editor 사용

1. [Swagger Editor](https://editor.swagger.io/) 접속
2. File → Import File 메뉴 선택
3. `api-specs/recruitment-schedule-api.yaml` 파일 업로드
4. API 문서 확인 및 테스트

### 방법 2: 로컬에서 확인

```bash
# Swagger UI 설치 (선택사항)
npm install -g swagger-ui-serve

# 또는 Docker 사용
docker run -p 8080:8080 -e SWAGGER_JSON=/api/recruitment-schedule-api.yaml -v $(pwd)/api-specs:/api swaggerapi/swagger-ui
```

## 📚 API 엔드포인트 목록

### 1. 채용 일정 조회

#### 1.1 회사별 채용 일정 조회
```
GET /api/v1/recruitment-schedule/companies
```

**주요 파라미터:**
- `type`: 신입/경력 구분
- `data_type`: actual(실제 공고)/predicted(예측치)/all(전체)
- `start_date`, `end_date`: 날짜 범위 필터링
- `company_ids`: 특정 회사만 조회

**응답 예시:**
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "회사별 채용 일정 조회 성공",
  "data": {
    "schedules": [
      {
        "id": "1",
        "company_id": 3,
        "company_name": "삼성전자",
        "company_key": "samsung",
        "color": "#1e40af",
        "type": "신입",
        "data_type": "actual",
        "stages": [
          {
            "id": "1-1",
            "stage": "서류접수",
            "start_date": "2025-01-01",
            "end_date": "2025-01-07"
          }
        ]
      }
    ]
  }
}
```

#### 1.2 특정 회사 채용 일정 조회
```
GET /api/v1/recruitment-schedule/companies/{companyId}
```

### 2. 경쟁 강도 분석

#### 2.1 날짜별 경쟁 강도 분석
```
GET /api/v1/recruitment-schedule/competition-intensity
```

**주요 파라미터:**
- `start_date`, `end_date`: 분석 기간 (필수)
- `type`: 신입/경력 구분 (선택)

**응답 예시:**
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "경쟁 강도 분석 성공",
  "data": {
    "period": {
      "start_date": "2025-01-01",
      "end_date": "2025-01-31"
    },
    "max_overlaps": 5,
    "daily_intensity": [
      {
        "date": "2025-01-05",
        "overlap_count": 3,
        "companies": [
          {"company_id": 3, "company_name": "삼성전자"},
          {"company_id": 4, "company_name": "LG전자"},
          {"company_id": 5, "company_name": "SK텔레콤"}
        ]
      }
    ]
  }
}
```

### 3. 사용자 일정 관리

#### 3.1 사용자 일정 조회
```
GET /api/v1/recruitment-schedule/user/pins
```
**인증 필요:** Bearer Token

#### 3.2 사용자 일정 추가
```
POST /api/v1/recruitment-schedule/user/pins
```
**인증 필요:** Bearer Token

**요청 본문 예시 (단일 일정):**
```json
{
  "type": "서류 접수",
  "date": "2025-01-05",
  "end_date": "2025-01-12"
}
```

**요청 본문 예시 (여러 일정):**
```json
{
  "pins": [
    {
      "type": "서류 접수",
      "date": "2025-01-05",
      "end_date": "2025-01-12"
    },
    {
      "type": "인적성",
      "date": "2025-01-15",
      "end_date": null
    }
  ]
}
```

#### 3.3 사용자 일정 수정
```
PUT /api/v1/recruitment-schedule/user/pins/{pinId}
```
**인증 필요:** Bearer Token

#### 3.4 사용자 일정 삭제
```
DELETE /api/v1/recruitment-schedule/user/pins/{pinId}
```
**인증 필요:** Bearer Token

#### 3.5 사용자 일정 전체 삭제
```
DELETE /api/v1/recruitment-schedule/user/pins
```
**인증 필요:** Bearer Token

### 4. 인사이트 분석

#### 4.1 채용 일정 인사이트 분석
```
POST /api/v1/recruitment-schedule/insights
```
**인증 필요:** Bearer Token

**요청 본문 예시:**
```json
{
  "user_pins": [
    {
      "type": "서류 접수",
      "date": "2025-01-05",
      "end_date": "2025-01-12"
    },
    {
      "type": "인적성",
      "date": "2025-01-15",
      "end_date": null
    },
    {
      "type": "1차 면접",
      "date": "2025-01-20",
      "end_date": "2025-01-21"
    }
  ],
  "analysis_period": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  }
}
```

**응답 예시:**
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "채용 일정 인사이트 분석 성공",
  "data": {
    "insights": [
      {
        "type": "warning",
        "phase": "서류 접수 기간",
        "message": "서류 접수 기간 중 높은 경쟁도 (3개 기업). 지원자 수가 감소할 수 있습니다.",
        "companies": ["삼성전자", "LG전자", "SK텔레콤"]
      },
      {
        "type": "success",
        "phase": "인적성",
        "message": "인적성 검사가 경쟁이 적은 시기에 예정되어 있습니다.",
        "companies": []
      }
    ],
    "summary": {
      "total_duration_days": 16,
      "high_competition_days": 3,
      "optimal_days": 5,
      "risk_level": "medium"
    }
  }
}
```

## 🔐 인증

사용자 일정 관리 및 인사이트 분석 API는 JWT Bearer Token 인증이 필요합니다.

**요청 헤더 예시:**
```
Authorization: Bearer {JWT_TOKEN}
```

## 📝 데이터 형식

### 날짜 형식
- 모든 날짜는 `YYYY-MM-DD` 형식을 사용합니다.
- 예: `2025-01-05`

### 채용 단계 (Stage)
- `서류접수`
- `서류전형`
- `인적성검사`
- `필기시험`
- `1차 면접`
- `2차 면접`
- `3차 면접`
- `최종 면접`
- `합격자 발표`

### 일정 유형 (Pin Type)
- `서류 접수`
- `인적성`
- `1차 면접`
- `2차 면접`
- `3차 면접`

### 인사이트 유형 (Insight Type)
- `warning`: 경고 (높은 경쟁도 등)
- `success`: 성공 (최적의 타이밍 등)
- `info`: 정보 (일반적인 분석 결과)

## 🚀 프론트엔드 연동 예시

### TypeScript/React 예시

```typescript
// lib/api/recruitmentSchedule.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1'

// 회사별 채용 일정 조회
export async function fetchCompanySchedules(params?: {
  type?: '신입' | '경력'
  dataType?: 'actual' | 'predicted' | 'all'
  startDate?: string
  endDate?: string
  companyIds?: string[]
}) {
  const queryParams = new URLSearchParams()
  if (params?.type) queryParams.append('type', params.type)
  if (params?.dataType) queryParams.append('data_type', params.dataType)
  if (params?.startDate) queryParams.append('start_date', params.startDate)
  if (params?.endDate) queryParams.append('end_date', params.endDate)
  if (params?.companyIds) queryParams.append('company_ids', params.companyIds.join(','))

  const response = await fetch(`${API_BASE_URL}/recruitment-schedule/companies?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch company schedules')
  return response.json()
}

// 경쟁 강도 분석
export async function fetchCompetitionIntensity(
  startDate: string,
  endDate: string,
  type?: '신입' | '경력'
) {
  const queryParams = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  })
  if (type) queryParams.append('type', type)

  const response = await fetch(
    `${API_BASE_URL}/recruitment-schedule/competition-intensity?${queryParams}`
  )
  if (!response.ok) throw new Error('Failed to fetch competition intensity')
  return response.json()
}

// 사용자 일정 조회
export async function fetchUserPins(token: string) {
  const response = await fetch(`${API_BASE_URL}/recruitment-schedule/user/pins`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error('Failed to fetch user pins')
  return response.json()
}

// 사용자 일정 추가
export async function createUserPin(
  pin: {
    type: string
    date: string
    endDate?: string | null
  },
  token: string
) {
  const response = await fetch(`${API_BASE_URL}/recruitment-schedule/user/pins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: pin.type,
      date: pin.date,
      end_date: pin.endDate || null,
    }),
  })
  if (!response.ok) throw new Error('Failed to create user pin')
  return response.json()
}

// 인사이트 분석
export async function fetchInsights(
  userPins: Array<{
    type: string
    date: string
    endDate?: string | null
  }>,
  token: string,
  analysisPeriod?: {
    startDate: string
    endDate: string
  }
) {
  const response = await fetch(`${API_BASE_URL}/recruitment-schedule/insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_pins: userPins.map((pin) => ({
        type: pin.type,
        date: pin.date,
        end_date: pin.endDate || null,
      })),
      ...(analysisPeriod && {
        analysis_period: {
          start_date: analysisPeriod.startDate,
          end_date: analysisPeriod.endDate,
        },
      }),
    }),
  })
  if (!response.ok) throw new Error('Failed to fetch insights')
  return response.json()
}
```

## ⚠️ 에러 처리

모든 API는 공통 에러 응답 형식을 따릅니다:

```json
{
  "status": 400,
  "code": "BAD_REQUEST",
  "message": "잘못된 요청 파라미터입니다.",
  "errors": [
    {
      "field": "date",
      "message": "날짜 형식이 올바르지 않습니다."
    }
  ]
}
```

### 주요 HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

## 📌 참고사항

1. **날짜 형식**: 모든 날짜는 `YYYY-MM-DD` 형식을 사용합니다.
2. **타임존**: 서버는 UTC 기준으로 동작하며, 클라이언트에서 적절히 변환해야 합니다.
3. **페이지네이션**: 대량 데이터의 경우 향후 페이지네이션 지원 예정입니다.
4. **캐싱**: 자주 변경되지 않는 데이터(회사 일정 등)는 캐싱을 고려하세요.
5. **CORS**: 백엔드에서 CORS 설정이 필요합니다.

## 🔄 업데이트 이력

- **v1.0.0** (2025-01-XX): 초기 API 명세서 작성

## 📞 문의

API 관련 문의사항이 있으시면 백엔드 팀에 문의해주세요.
















