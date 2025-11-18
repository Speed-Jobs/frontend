# 백엔드 API vs 대시보드 요구사항 비교 분석

백엔드 OpenAPI 스펙과 대시보드에서 필요한 API를 비교하여 추가/수정이 필요한 부분을 정리한 문서입니다.

---

## 📊 비교 결과 요약

| 대시보드 요구사항 | 백엔드 API | 상태 | 비고 |
|----------------|-----------|------|------|
| 채용 공고 수 추이 (전체) | ❌ 없음 | **추가 필요** | 전체 공고 수 추이 API 필요 |
| 주요 회사별 채용 활동 (다중 회사) | ⚠️ 부분 지원 | **수정 필요** | 단일 회사만 지원, 다중 회사 비교 필요 |
| 회사별 스킬 다양성 | ❌ 없음 | **추가 필요** | 새 API 필요 |
| 상위 스킬 분기별 트렌드 | ❌ 없음 | **추가 필요** | 새 API 필요 |
| 스킬별 통계 | ✅ 있음 | **형식 수정 필요** | 응답 형식이 다름 |
| 직군별 통계 | ✅ 있음 | **형식 수정 필요** | 응답 형식이 다름 |
| 경쟁사 공고 자동 매칭 | ❌ 없음 | **추가 필요** | 새 API 필요 |
| 채용뉴스 | ❌ 없음 | **추가 필요** | 새 API 필요 |

---

## 1. 채용 공고 수 추이

### 대시보드 요구사항
- **API**: `GET /api/v1/job-postings/trend`
- **기능**: 전체 채용 공고 수의 일간/주간/월간 추이

### 백엔드 현황
- ❌ **없음** - 전체 공고 수 추이 API가 없습니다.
- ✅ `/api/v1/stat/trends/company` - 특정 회사의 트렌드만 지원
- ✅ `/api/v1/stat/trends/role` - 특정 직무의 트렌드만 지원
- ✅ `/api/v1/stat/trends/skill` - 특정 스킬의 트렌드만 지원

### 추가 필요 사항
```yaml
/api/v1/stat/trends/total:
  get:
    tags: [Stats]
    summary: 전체 채용 공고 수 추이
    parameters:
      - name: interval
        required: true
        schema:
          type: string
          enum: [daily, weekly, monthly]
      - name: start_date
        required: true
        schema: { type: string, format: date }
      - name: end_date
        required: true
        schema: { type: string, format: date }
    responses:
      '200':
        description: OK
        content:
          application/json:
            example:
              status: 200
              code: SUCCESS
              message: 전체 채용 공고 수 추이 조회 성공
              data:
                interval: "daily"
                start: { year: 2025, month: 11, day: 1 }
                end: { year: 2025, month: 11, day: 30 }
                points:
                  - { date: { year: 2025, month: 11, day: 1 }, count: 180 }
                  - { date: { year: 2025, month: 11, day: 2 }, count: 195 }
                  ...
```

---

## 2. 주요 회사별 채용 활동

### 대시보드 요구사항
- **API**: `GET /api/v1/companies/recruitment-activity`
- **기능**: 여러 회사를 한 번에 비교 (토스, 라인, 한화, 카카오, 네이버, 삼성, LG, SK)
- **응답 형식**: 각 기간별로 모든 회사의 공고 수를 한 번에 반환

### 백엔드 현황
- ⚠️ `/api/v1/stat/trends/company` - **단일 회사만 지원**
  - `id` 파라미터로 하나의 회사만 조회 가능
  - 여러 회사를 비교하려면 여러 번 호출해야 함

### 수정 필요 사항
```yaml
/api/v1/stat/trends/companies:
  get:
    tags: [Stats]
    summary: 여러 회사 채용 활동 비교
    parameters:
      - name: ids
        required: true
        description: 조회할 회사 id 리스트 (쉼표 구분)
        schema: { type: string, example: "3,4,5,6,7,8,9,10" }
      - name: interval
        required: true
        schema:
          type: string
          enum: [daily, weekly, monthly]
      - name: start_date
        required: true
        schema: { type: string, format: date }
      - name: end_date
        required: true
        schema: { type: string, format: date }
    responses:
      '200':
        description: OK
        content:
          application/json:
            example:
              status: 200
              code: SUCCESS
              message: 회사별 채용 활동 비교 조회 성공
              data:
                interval: "daily"
                start: { year: 2025, month: 11, day: 1 }
                end: { year: 2025, month: 11, day: 30 }
                companies:
                  - { id: 3, name: "토스" }
                  - { id: 4, name: "라인" }
                  ...
                points:
                  - date: { year: 2025, month: 11, day: 1 }
                    counts:
                      - { company_id: 3, count: 18 }
                      - { company_id: 4, count: 14 }
                      ...
                  - date: { year: 2025, month: 11, day: 2 }
                    counts:
                      - { company_id: 3, count: 19 }
                      - { company_id: 4, count: 15 }
                      ...
```

**또는 기존 API 확장:**
```yaml
/api/v1/stat/trends/company:
  get:
    # 기존 파라미터에 추가
    parameters:
      - name: ids
        required: false
        description: 여러 회사 id (쉼표 구분). id와 함께 사용 불가
        schema: { type: string, example: "3,4,5" }
    # ids가 제공되면 다중 회사 응답 형식으로 반환
```

---

## 3. 회사별 스킬 다양성

### 대시보드 요구사항
- **API**: `GET /api/v1/companies/skill-diversity`
- **기능**: 회사별로 요구하는 고유 스킬 수 (전체보기/연도별)

### 백엔드 현황
- ❌ **없음**

### 추가 필요 사항
```yaml
/api/v1/stats/companies/skill-diversity:
  get:
    tags: [Stats]
    summary: 회사별 스킬 다양성 통계
    parameters:
      - name: view_mode
        required: true
        description: 전체보기 또는 연도별
        schema:
          type: string
          enum: [all, year]
      - name: year
        required: false
        description: view_mode가 year일 때 필수
        schema:
          type: integer
          example: 2025
      - name: company_ids
        required: false
        description: 특정 회사만 조회 (쉼표 구분)
        schema: { type: string, example: "3,4,5" }
    responses:
      '200':
        description: OK
        content:
          application/json:
            example:
              status: 200
              code: SUCCESS
              message: 회사별 스킬 다양성 조회 성공
              data:
                view_mode: "all"
                year: null
                diversity:
                  - { company: { id: 3, name: "토스" }, unique_skills_count: 415 }
                  - { company: { id: 4, name: "라인" }, unique_skills_count: 285 }
                  - { company: { id: 5, name: "한화" }, unique_skills_count: 125 }
                  ...
```

---

## 4. 상위 스킬 분기별 트렌드

### 대시보드 요구사항
- **API**: `GET /api/v1/companies/{company}/skill-trend`
- **기능**: 특정 회사의 상위 스킬들이 월별로 어떻게 변하는지 추이

### 백엔드 현황
- ❌ **없음**
- ✅ `/api/v1/stat/trends/skill` - 특정 스킬의 트렌드는 있지만, 회사별 스킬 트렌드는 없음

### 추가 필요 사항
```yaml
/api/v1/stats/companies/{companyId}/skill-trends:
  get:
    tags: [Stats]
    summary: 회사별 상위 스킬 분기별 트렌드
    parameters:
      - name: companyId
        required: true
        schema: { type: integer }
      - name: year
        required: false
        description: 연도 (기본값: 현재 연도)
        schema: { type: integer, example: 2025 }
      - name: top_n
        required: false
        description: 상위 N개 스킬 (기본값: 10)
        schema: { type: integer, default: 10 }
    responses:
      '200':
        description: OK
        content:
          application/json:
            example:
              status: 200
              code: SUCCESS
              message: 회사별 스킬 트렌드 조회 성공
              data:
                company: { id: 3, name: "토스" }
                year: 2025
                trends:
                  - month: { year: 2025, month: 9 }
                    skills:
                      - { skill: "python", count: 35 }
                      - { skill: "sql", count: 28 }
                      - { skill: "java", count: 25 }
                      - { skill: "kubernetes", count: 20 }
                      ...
                  - month: { year: 2025, month: 10 }
                    skills:
                      - { skill: "python", count: 45 }
                      - { skill: "sql", count: 38 }
                      ...
```

---

## 5. 스킬별 통계

### 대시보드 요구사항
- **API**: `GET /api/v1/skills/statistics`
- **응답 형식**: 
  ```json
  {
    "top_skills": [{ "id": 1, "name": "React" }],
    "top_skill_stat": {
      "count": 154,
      "market_share": 62.4,
      "weekly_change_rate": 45.3,
      "monthly_change_rate": 84.8
    }
  }
  ```

### 백엔드 현황
- ✅ `/api/v1/stats/keyword/skill` - 스킬 목록 조회
- ✅ `/api/v1/stats/keyword/skill/{skillId}` - 특정 스킬 상세 통계

### 차이점 및 수정 필요 사항

#### 5.1 스킬 목록 API (`/api/v1/stats/keyword/skill`)
**백엔드 응답:**
```json
{
  "top_skills": [
    { "id": 1, "skill": "kotlin", "count": 132, "ratio": 12.4 },
    { "id": 2, "skill": "spring", "count": 286, "ratio": 26.8 }
  ]
}
```

**대시보드 요구사항:**
- `skill` → `name`으로 변경 필요
- `ratio` → `percentage`로 변경 필요 (또는 그대로 사용)
- `change` (변화율) 필드 추가 필요

**수정 제안:**
```json
{
  "top_skills": [
    {
      "id": 1,
      "name": "kotlin",  // skill → name
      "count": 132,
      "percentage": 12.4,  // ratio → percentage (또는 ratio 유지)
      "change": 3.5,  // 추가 필요: 이전 기간 대비 변화율
      "related_skills": ["spring", "java", "maven"]  // 선택사항
    }
  ]
}
```

#### 5.2 스킬 상세 통계 API (`/api/v1/stats/keyword/skill/{skillId}`)
**백엔드 응답:**
```json
{
  "count": 132,
  "ratio": 12.4,
  "change_7d_pct": 18.5,
  "change_30d_pct": 24.1,
  "related_skills": ["spring", "mysql", "redis"]
}
```

**대시보드 요구사항:**
- `ratio` → `market_share`로 변경 필요
- `change_7d_pct` → `weekly_change_rate`로 변경 필요
- `change_30d_pct` → `monthly_change_rate`로 변경 필요

**수정 제안:**
```json
{
  "count": 132,
  "market_share": 12.4,  // ratio → market_share
  "weekly_change_rate": 18.5,  // change_7d_pct → weekly_change_rate
  "monthly_change_rate": 24.1,  // change_30d_pct → monthly_change_rate
  "related_skills": ["spring", "mysql", "redis"]  // 이미 있음 ✅
}
```

---

## 6. 직군별 통계

### 대시보드 요구사항
- **API**: `GET /api/v1/job-roles/statistics`
- **응답 형식**: Tech/Biz/BizSupporting 카테고리별 직무 통계

### 백엔드 현황
- ✅ `/api/v1/stats/roles` - 직군별 통계
- ✅ `/api/v1/stats/roles/{roleId}` - 세부 직군 통계

### 차이점 및 수정 필요 사항

#### 6.1 직군 목록 API (`/api/v1/stats/roles`)
**백엔드 응답:**
```json
{
  "roles": [
    { "id": 1, "name": "backend", "count": 72, "ratio": 28.5 },
    { "id": 2, "name": "data", "count": 38, "ratio": 15.0 }
  ]
}
```

**대시보드 요구사항:**
- 카테고리별로 분리 필요 (`Tech`, `Biz`, `BizSupporting`)
- `industries` 필드 추가 필요

**수정 제안:**
```json
{
  "category": "Tech",  // 추가 필요
  "roles": [
    {
      "id": 1,
      "name": "Software Development",  // backend → Software Development
      "value": 72,  // count → value (또는 count 유지)
      "ratio": 28.5,
      "industries": [  // 추가 필요
        "Front-end Development",
        "Back-end Development",
        "Mobile Development"
      ]
    }
  ]
}
```

**또는 카테고리 파라미터 추가:**
```yaml
/api/v1/stats/roles:
  get:
    parameters:
      - name: category
        required: false
        description: 카테고리 필터
        schema:
          type: string
          enum: [Tech, Biz, BizSupporting]
```

---

## 7. 경쟁사 공고 자동 매칭

### 대시보드 요구사항
- **API**: `POST /api/v1/jobs/match`
- **기능**: 기술 스택 기반으로 유사한 경쟁사 공고 찾기

### 백엔드 현황
- ❌ **없음**

### 추가 필요 사항
```yaml
/api/v1/posts/match:
  post:
    tags: [Posts]
    summary: 경쟁사 공고 자동 매칭
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [tech_stack]
            properties:
              job_id:
                type: integer
                description: 자사 공고 ID (선택사항)
              tech_stack:
                type: array
                items: { type: string }
                example: ["Kotlin", "Spring Boot", "Redis"]
              description:
                type: string
                description: 공고 설명 (선택사항)
    responses:
      '200':
        description: OK
        content:
          application/json:
            example:
              status: 200
              code: SUCCESS
              message: 경쟁사 공고 자동 매칭 성공
              data:
                matched_jobs:
                  - id: 87
                    company: { id: 1, name: "토스" }
                    title: "핀테크 백엔드 개발자"
                    description: "금융 시스템 개발 경험과 Kotlin/Spring Boot 기술 스택이 정확히 일치합니다."
                    keywords: ["Kotlin", "Spring Boot", "금융 시스템", "안정성"]
                    similarity: 93
                  ...
```

---

## 8. 채용뉴스

### 대시보드 요구사항
- **API**: `GET /api/v1/news/recruitment`
- **기능**: 최신 채용 관련 뉴스 조회

### 백엔드 현황
- ❌ **없음**

### 추가 필요 사항
```yaml
/api/v1/news/recruitment:
  get:
    tags: [News]
    summary: 채용 관련 뉴스 조회
    parameters:
      - name: limit
        required: false
        description: 반환할 뉴스 개수
        schema: { type: integer, default: 5, maximum: 50 }
      - name: start_date
        required: false
        schema: { type: string, format: date }
      - name: end_date
        required: false
        schema: { type: string, format: date }
    responses:
      '200':
        description: OK
        content:
          application/json:
            example:
              status: 200
              code: SUCCESS
              message: 채용뉴스 조회 성공
              data:
                news:
                  - source: "이데일리 - 2025.09.25 - 네이버뉴스"
                    headline: "LG CNS 신학협력 신입사원 채 투트랙으로 AX 인재 확보 박자"
                    snippet: "LG CNS가 클라우드, 스마트팩토리, ERP, 아키텍처 등 다양한 분야의 신입사원을 모집하고 있으며..."
                    image: "🏢"
                    published_date: { year: 2025, month: 9, day: 25 }
                  ...
```

---

## 📝 필드명 통일 제안

백엔드와 프론트엔드 간 필드명을 통일하기 위한 제안:

| 백엔드 필드명 | 프론트엔드 요구사항 | 제안 |
|-------------|------------------|------|
| `skill` | `name` | `name`로 통일 (더 명확함) |
| `ratio` | `percentage` / `market_share` | `ratio` 유지 또는 `percentage`로 통일 |
| `change_7d_pct` | `weekly_change_rate` | `weekly_change_rate`로 통일 |
| `change_30d_pct` | `monthly_change_rate` | `monthly_change_rate`로 통일 |
| `count` | `count` | `count` 유지 ✅ |
| `name` (직무) | `name` | `name` 유지 ✅ |

---

## 🎯 우선순위별 작업 계획

### 높음 (필수)
1. ✅ **전체 채용 공고 수 추이 API** (`/api/v1/stat/trends/total`)
2. ✅ **다중 회사 채용 활동 비교 API** (`/api/v1/stat/trends/companies`)
3. ✅ **스킬별 통계 필드명 수정** (`skill` → `name`, `ratio` → `market_share` 등)

### 중간 (권장)
4. ✅ **회사별 스킬 다양성 API** (`/api/v1/stats/companies/skill-diversity`)
5. ✅ **회사별 스킬 트렌드 API** (`/api/v1/stats/companies/{companyId}/skill-trends`)
6. ✅ **직군별 통계 카테고리 분리** (Tech/Biz/BizSupporting)

### 낮음 (선택)
7. ✅ **경쟁사 공고 자동 매칭 API** (`/api/v1/posts/match`)
8. ✅ **채용뉴스 API** (`/api/v1/news/recruitment`)

---

## 📌 참고사항

1. **날짜 형식**: 백엔드는 `{ year, month, day }` 객체 형식을 사용하지만, 프론트엔드는 `YYYY-MM-DD` 문자열도 지원해야 할 수 있습니다.

2. **기간 파라미터**: 백엔드는 `span` (week/month)을 사용하지만, 프론트엔드는 `timeframe` (daily/weekly/monthly)을 사용합니다. 통일 필요.

3. **회사 ID vs 이름**: 백엔드는 회사 ID를 사용하지만, 프론트엔드는 회사 이름도 필요할 수 있습니다. 응답에 둘 다 포함 권장.

4. **페이지네이션**: 백엔드의 `/api/v1/posts`는 페이지네이션을 지원하지만, 통계 API들은 페이지네이션이 없습니다. 필요시 추가 고려.

