# 대시보드 API 명세서

대시보드에서 사용하는 모든 데이터를 백엔드/모델링에서 받아오기 위한 API 형식을 정리한 문서입니다.

---

## 📋 목차

1. [채용 공고 수 추이](#1-채용-공고-수-추이)
2. [주요 회사별 채용 활동](#2-주요-회사별-채용-활동)
3. [회사별 스킬 다양성](#3-회사별-스킬-다양성)
4. [상위 스킬 분기별 트렌드](#4-상위-스킬-분기별-트렌드)
5. [스킬별 통계](#5-스킬별-통계)
6. [직군별 통계](#6-직군별-통계)
7. [경쟁사 공고 자동 매칭](#7-경쟁사-공고-자동-매칭)
8. [채용뉴스](#8-채용뉴스)

---

## 1. 채용 공고 수 추이

### API 엔드포인트
```
GET /api/v1/job-postings/trend
```

### 요청 파라미터
```typescript
interface TrendParams {
  timeframe: 'daily' | 'weekly' | 'monthly';  // 필수
  startDate?: string;  // YYYY-MM-DD 형식 (선택사항)
  endDate?: string;    // YYYY-MM-DD 형식 (선택사항)
}
```

### 응답 형식

#### 일간 (daily)
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "일간 채용 공고 수 추이 조회 성공",
  "data": {
    "timeframe": "daily",
    "period": {
      "startDate": "2025-11-01",
      "endDate": "2025-11-30"
    },
    "trends": [
      { "day": "11/1", "count": 180 },
      { "day": "11/2", "count": 195 },
      { "day": "11/3", "count": 210 },
      ...
    ]
  }
}
```

#### 주간 (weekly)
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "주간 채용 공고 수 추이 조회 성공",
  "data": {
    "timeframe": "weekly",
    "period": {
      "startDate": "2025-09-01",
      "endDate": "2025-11-30"
    },
    "trends": [
      { "week": "9월 1주", "count": 850 },
      { "week": "9월 2주", "count": 920 },
      { "week": "9월 3주", "count": 1050 },
      ...
    ]
  }
}
```

#### 월간 (monthly)
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "월간 채용 공고 수 추이 조회 성공",
  "data": {
    "timeframe": "monthly",
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-11-30"
    },
    "trends": [
      { "month": "2025-01", "count": 1200 },
      { "month": "2025-02", "count": 1800 },
      { "month": "2025-03", "count": 1500 },
      ...
    ]
  }
}
```

### 필드 설명
- `day`: 일간 데이터의 날짜 (MM/DD 형식)
- `week`: 주간 데이터의 주차 (예: "9월 1주")
- `month`: 월간 데이터의 월 (YYYY-MM 형식)
- `count`: 해당 기간의 채용 공고 수

---

## 2. 주요 회사별 채용 활동

### API 엔드포인트
```
GET /api/v1/companies/recruitment-activity
```

### 요청 파라미터
```typescript
interface RecruitmentActivityParams {
  timeframe: 'daily' | 'weekly' | 'monthly';  // 필수
  companies?: string[];  // 회사 필터 (선택사항, 기본값: 전체)
  startDate?: string;    // YYYY-MM-DD 형식 (선택사항)
  endDate?: string;      // YYYY-MM-DD 형식 (선택사항)
}
```

### 응답 형식

#### 일간 (daily)
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "일간 주요 회사별 채용 활동 조회 성공",
  "data": {
    "timeframe": "daily",
    "companies": ["toss", "line", "hanwha", "kakao", "naver", "samsung", "lg", "sk"],
    "activities": [
      {
        "period": "11/1",
        "toss": 18,
        "line": 14,
        "hanwha": 15,
        "kakao": 17,
        "naver": 19,
        "samsung": 16,
        "lg": 13,
        "sk": 15
      },
      {
        "period": "11/2",
        "toss": 19,
        "line": 15,
        "hanwha": 16,
        "kakao": 18,
        "naver": 20,
        "samsung": 17,
        "lg": 14,
        "sk": 16
      },
      ...
    ]
  }
}
```

#### 주간 (weekly)
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "주간 주요 회사별 채용 활동 조회 성공",
  "data": {
    "timeframe": "weekly",
    "companies": ["toss", "line", "hanwha", "kakao", "naver", "samsung", "lg", "sk"],
    "activities": [
      {
        "period": "9월 1주",
        "toss": 95,
        "line": 65,
        "hanwha": 70,
        "kakao": 85,
        "naver": 100,
        "samsung": 80,
        "lg": 60,
        "sk": 75
      },
      ...
    ]
  }
}
```

#### 월간 (monthly)
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "월간 주요 회사별 채용 활동 조회 성공",
  "data": {
    "timeframe": "monthly",
    "companies": ["toss", "line", "hanwha", "kakao", "naver", "samsung", "lg", "sk"],
    "activities": [
      {
        "period": "2025-01",
        "toss": 120,
        "line": 80,
        "hanwha": 100,
        "kakao": 150,
        "naver": 180,
        "samsung": 140,
        "lg": 90,
        "sk": 110
      },
      ...
    ]
  }
}
```

### 필드 설명
- `period`: 기간 (일간: MM/DD, 주간: "9월 1주", 월간: YYYY-MM)
- 회사 키: `toss`, `line`, `hanwha`, `kakao`, `naver`, `samsung`, `lg`, `sk` (각 회사의 채용 공고 수)

### 회사 키 매핑
- `toss` → 토스
- `line` → 라인
- `hanwha` → 한화
- `kakao` → 카카오
- `naver` → 네이버
- `samsung` → 삼성
- `lg` → LG
- `sk` → SK

---

## 3. 회사별 스킬 다양성

### API 엔드포인트
```
GET /api/v1/companies/skill-diversity
```

### 요청 파라미터
```typescript
interface SkillDiversityParams {
  viewMode: 'all' | 'year';  // 필수: 'all' (전체), 'year' (연도별)
  year?: '2021' | '2022' | '2023' | '2024' | '2025';  // viewMode가 'year'일 때 필수
  companies?: string[];  // 회사 필터 (선택사항)
}
```

### 응답 형식

#### 전체보기 (all)
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "회사별 스킬 다양성 조회 성공 (전체)",
  "data": {
    "viewMode": "all",
    "diversity": [
      { "company": "토스", "skills": 415 },
      { "company": "라인", "skills": 285 },
      { "company": "한화", "skills": 125 },
      { "company": "카카오", "skills": 90 },
      { "company": "네이버", "skills": 75 }
    ]
  }
}
```

#### 연도별 (year)
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "회사별 스킬 다양성 조회 성공 (연도별)",
  "data": {
    "viewMode": "year",
    "year": "2025",
    "diversity": [
      { "company": "토스", "skills": 415 },
      { "company": "라인", "skills": 285 },
      { "company": "한화", "skills": 125 },
      { "company": "카카오", "skills": 90 },
      { "company": "네이버", "skills": 75 }
    ]
  }
}
```

### 필드 설명
- `company`: 회사명 (한글)
- `skills`: 해당 회사가 요구하는 고유 스킬 수

---

## 4. 상위 스킬 분기별 트렌드

### API 엔드포인트
```
GET /api/v1/companies/{company}/skill-trend
```

### 요청 파라미터
```typescript
interface SkillTrendParams {
  company: string;  // 필수: 회사명 (예: "토스", "라인")
  year?: '2021' | '2022' | '2023' | '2024' | '2025';  // 연도 (선택사항, 기본값: 현재 연도)
  viewMode?: 'all' | 'year';  // 전체보기 또는 연도별 (선택사항)
}
```

### 응답 형식
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "상위 스킬 분기별 트렌드 조회 성공",
  "data": {
    "company": "토스",
    "year": "2025",
    "trends": [
      {
        "month": "2025.09",
        "python": 35,
        "sql": 28,
        "java": 25,
        "kubernetes": 20,
        "docker": 18,
        "react": 15,
        "typescript": 14,
        "aws": 12,
        "spring": 16,
        "nodejs": 14
      },
      {
        "month": "2025.10",
        "python": 45,
        "sql": 38,
        "java": 35,
        "kubernetes": 28,
        "docker": 25,
        "react": 22,
        "typescript": 20,
        "aws": 18,
        "spring": 20,
        "nodejs": 18
      }
    ]
  }
}
```

### 필드 설명
- `company`: 회사명
- `year`: 연도
- `month`: 월 (YYYY.MM 형식)
- 각 스킬명: 해당 월에 해당 스킬이 언급된 공고 수
  - `python`, `sql`, `java`, `kubernetes`, `docker`, `react`, `typescript`, `aws`, `spring`, `nodejs` 등

---

## 5. 스킬별 통계

### API 엔드포인트
```
GET /api/v1/skills/statistics
```

### 요청 파라미터
```typescript
interface SkillStatisticsParams {
  startDate?: string;  // YYYY-MM-DD 형식 (선택사항)
  endDate?: string;    // YYYY-MM-DD 형식 (선택사항)
  company?: string[];  // 회사 필터 (선택사항)
  limit?: number;      // 반환할 스킬 개수 (선택사항, 기본값: 20)
}
```

### 응답 형식
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "스킬별 통계 조회 성공",
  "data": {
    "top_skills": [
      { "id": 1, "name": "React" },
      { "id": 2, "name": "Spring" },
      { "id": 3, "name": "Python" }
    ],
    "top_skill_stat": {
      "count": 154,
      "market_share": 62.4,
      "weekly_change_rate": 45.3,
      "monthly_change_rate": 84.8
    }
  }
}
```

**참고**: 현재는 단일 스킬 통계만 반환하는 형식입니다. 여러 스킬의 통계를 한 번에 받으려면 배열 형태로 확장 필요합니다.

### 확장된 형식 (여러 스킬)
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "스킬별 통계 조회 성공",
  "data": [
    {
      "top_skills": [{ "id": 1, "name": "React" }],
      "top_skill_stat": {
        "count": 154,
        "market_share": 62.4,
        "weekly_change_rate": 45.3,
        "monthly_change_rate": 84.8
      },
      "related_skills": ["typescript", "javascript", "nextjs"]  // 선택사항
    },
    {
      "top_skills": [{ "id": 2, "name": "Spring" }],
      "top_skill_stat": {
        "count": 286,
        "market_share": 26.8,
        "weekly_change_rate": 3.5,
        "monthly_change_rate": 5.2
      },
      "related_skills": ["kotlin", "java", "maven", "gradle"]  // 선택사항
    }
  ]
}
```

### 필드 설명
- `top_skills`: 스킬 정보 배열
  - `id`: 스킬 ID
  - `name`: 스킬 이름
- `top_skill_stat`: 스킬 통계
  - `count`: 해당 스킬이 언급된 공고 수
  - `market_share`: 시장 점유율 (%)
  - `weekly_change_rate`: 주간 변화율 (%)
  - `monthly_change_rate`: 월간 변화율 (%)
- `related_skills`: 관련 스킬 목록 (선택사항, 없으면 빈 배열)

---

## 6. 직군별 통계

### API 엔드포인트
```
GET /api/v1/job-roles/statistics
```

### 요청 파라미터
```typescript
interface JobRoleStatisticsParams {
  category: 'Tech' | 'Biz' | 'BizSupporting';  // 필수: 전문가 카테고리
}
```

### 응답 형식
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "직군별 통계 조회 성공",
  "data": {
    "category": "Tech",
    "roles": [
      {
        "name": "Software Development",
        "value": 35,
        "industries": [
          "Front-end Development",
          "Back-end Development",
          "Mobile Development"
        ]
      },
      {
        "name": "Factory AX Engineering",
        "value": 18,
        "industries": [
          "Simulation",
          "기구설계",
          "전장/제어"
        ]
      },
      {
        "name": "Solution Development",
        "value": 22,
        "industries": [
          "ERP_FCM",
          "ERP_SCM",
          "ERP_HCM",
          "ERP_T&E",
          "Biz. Solution"
        ]
      },
      ...
    ]
  }
}
```

### 필드 설명
- `category`: 전문가 카테고리 (`Tech`, `Biz`, `BizSupporting`)
- `name`: 직무명
- `value`: 해당 직무의 공고 수 (또는 비율)
- `industries`: 세부 산업/분야 목록

---

## 7. 경쟁사 공고 자동 매칭

### API 엔드포인트
```
POST /api/v1/jobs/match
```

### 요청 형식
```json
{
  "job_id": 123,
  "tech_stack": ["Kotlin", "Spring Boot", "Redis"],
  "description": "금융 시스템 개발..."
}
```

### 응답 형식
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "경쟁사 공고 자동 매칭 성공",
  "data": {
    "matched_jobs": [
      {
        "title": "핀테크 백엔드 개발자",
        "description": "금융 시스템 개발 경험과 Kotlin/Spring Boot 기술 스택이 정확히 일치합니다.",
        "keywords": ["Kotlin", "Spring Boot", "금융 시스템", "안정성"],
        "similarity": 93
      },
      {
        "title": "백엔드 플랫폼 엔지니어",
        "description": "Kubernetes 기반의 컨테이너 오케스트레이션 및 확장 가능한 시스템 개발 경험이 유사합니다.",
        "keywords": ["Kotlin", "PostgreSQL", "Kubernetes", "확장성"],
        "similarity": 87
      },
      {
        "title": "서버 개발자 (Kotlin/Spring)",
        "description": "Kotlin 기반의 Spring Boot 애플리케이션 개발 및 Redis 캐싱 경험이 일치합니다.",
        "keywords": ["Kotlin", "Spring Boot", "Redis"],
        "similarity": 84
      }
    ]
  }
}
```

### 필드 설명
- `title`: 매칭된 공고 제목
- `description`: 매칭 이유 설명
- `keywords`: 관련 키워드 배열
- `similarity`: 유사도 점수 (0-100)

---

## 8. 채용뉴스

### API 엔드포인트
```
GET /api/v1/news/recruitment
```

### 요청 파라미터
```typescript
interface NewsParams {
  limit?: number;  // 반환할 뉴스 개수 (선택사항, 기본값: 5)
  startDate?: string;  // YYYY-MM-DD 형식 (선택사항)
  endDate?: string;    // YYYY-MM-DD 형식 (선택사항)
}
```

### 응답 형식
```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "채용뉴스 조회 성공",
  "data": {
    "news": [
      {
        "source": "이데일리 - 2025.09.25 - 네이버뉴스",
        "headline": "LG CNS 신학협력 신입사원 채 투트랙으로 AX 인재 확보 박자",
        "snippet": "LG CNS가 클라우드, 스마트팩토리, ERP, 아키텍처 등 다양한 분야의 신입사원을 모집하고 있으며, 5월부터 활동을 시작했습니다.",
        "image": "🏢",
        "published_date": "2025-09-25"
      },
      {
        "source": "EBN - 1주 전",
        "headline": "삼성, 하반기 공채 GSAT 실시 5년간 6만명 채용 통해 미래 대...",
        "snippet": "GSAT(Global Samsung Aptitude Test)가 26일 실시되어 종합적 사고력과 문제 해결 능력을 평가하여 미래 인재를 선발합니다.",
        "image": "👨‍💼",
        "published_date": "2025-09-18"
      },
      ...
    ]
  }
}
```

### 필드 설명
- `source`: 뉴스 출처
- `headline`: 뉴스 헤드라인
- `snippet`: 뉴스 요약
- `image`: 이모지 또는 이미지 URL
- `published_date`: 발행일 (YYYY-MM-DD 형식)

---

## 📌 공통 응답 형식

모든 API는 다음 공통 형식을 따릅니다:

```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "성공 메시지",
  "data": { ... }
}
```

### 에러 응답 형식
```json
{
  "status": 400,
  "code": "ERROR",
  "message": "에러 메시지",
  "data": null
}
```

---

## 🔄 프론트엔드 연동 가이드

### 1. API 호출 함수 예시

```typescript
// lib/api/dashboard.ts
const API_BASE_URL = 'http://172.20.10.2:8080/api/v1'

export async function fetchJobPostingsTrend(timeframe: 'daily' | 'weekly' | 'monthly') {
  const response = await fetch(`${API_BASE_URL}/job-postings/trend?timeframe=${timeframe}`)
  if (!response.ok) throw new Error('Failed to fetch job postings trend')
  return response.json()
}

export async function fetchCompanyRecruitmentActivity(
  timeframe: 'daily' | 'weekly' | 'monthly',
  companies?: string[]
) {
  const params = new URLSearchParams({ timeframe })
  if (companies) {
    companies.forEach(c => params.append('companies', c))
  }
  const response = await fetch(`${API_BASE_URL}/companies/recruitment-activity?${params}`)
  if (!response.ok) throw new Error('Failed to fetch recruitment activity')
  return response.json()
}

export async function fetchSkillDiversity(viewMode: 'all' | 'year', year?: string) {
  const params = new URLSearchParams({ viewMode })
  if (year) params.append('year', year)
  const response = await fetch(`${API_BASE_URL}/companies/skill-diversity?${params}`)
  if (!response.ok) throw new Error('Failed to fetch skill diversity')
  return response.json()
}

export async function fetchSkillTrend(company: string, year?: string) {
  const params = new URLSearchParams()
  if (year) params.append('year', year)
  const response = await fetch(`${API_BASE_URL}/companies/${company}/skill-trend?${params}`)
  if (!response.ok) throw new Error('Failed to fetch skill trend')
  return response.json()
}

export async function fetchSkillStatistics(params?: {
  startDate?: string
  endDate?: string
  company?: string[]
  limit?: number
}) {
  const queryParams = new URLSearchParams()
  if (params?.startDate) queryParams.append('startDate', params.startDate)
  if (params?.endDate) queryParams.append('endDate', params.endDate)
  if (params?.company) {
    params.company.forEach(c => queryParams.append('company', c))
  }
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  
  const response = await fetch(`${API_BASE_URL}/skills/statistics?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch skill statistics')
  return response.json()
}

export async function fetchJobRoleStatistics(category: 'Tech' | 'Biz' | 'BizSupporting') {
  const response = await fetch(`${API_BASE_URL}/job-roles/statistics?category=${category}`)
  if (!response.ok) throw new Error('Failed to fetch job role statistics')
  return response.json()
}

export async function matchCompetitorJobs(jobId: number, techStack: string[], description: string) {
  const response = await fetch(`${API_BASE_URL}/jobs/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, tech_stack: techStack, description })
  })
  if (!response.ok) throw new Error('Failed to match competitor jobs')
  return response.json()
}

export async function fetchRecruitmentNews(limit?: number) {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  const response = await fetch(`${API_BASE_URL}/news/recruitment?${params}`)
  if (!response.ok) throw new Error('Failed to fetch recruitment news')
  return response.json()
}
```

### 2. 대시보드에서 사용 예시

```typescript
// app/dashboard/page.tsx
import { fetchJobPostingsTrend, fetchCompanyRecruitmentActivity } from '@/lib/api/dashboard'

useEffect(() => {
  const loadData = async () => {
    try {
      // 채용 공고 수 추이
      const trendResponse = await fetchJobPostingsTrend('daily')
      if (trendResponse.status === 200 && trendResponse.data) {
        setDailyJobPostingsData(trendResponse.data.trends)
      }
      
      // 회사별 채용 활동
      const activityResponse = await fetchCompanyRecruitmentActivity('daily')
      if (activityResponse.status === 200 && activityResponse.data) {
        setCompanyRecruitmentDataDaily(activityResponse.data.activities)
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error)
      // 기본 데이터 사용
    }
  }
  
  loadData()
}, [])
```

---

## 📝 참고사항

1. **날짜 형식**: 모든 날짜는 `YYYY-MM-DD` 형식을 사용합니다.
2. **에러 처리**: API 호출 실패 시 기본 더미 데이터를 사용하도록 구현되어 있습니다.
3. **캐싱**: 자주 변경되지 않는 데이터는 캐싱을 고려하세요.
4. **페이지네이션**: 대량 데이터의 경우 페이지네이션을 고려하세요.
5. **CORS**: 백엔드에서 CORS 설정이 필요합니다.

---

## 🎯 우선순위

1. **높음**: 채용 공고 수 추이, 주요 회사별 채용 활동, 스킬별 통계
2. **중간**: 회사별 스킬 다양성, 상위 스킬 분기별 트렌드, 직군별 통계
3. **낮음**: 경쟁사 공고 자동 매칭, 채용뉴스

