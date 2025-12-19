# Speed Jobs - AI 기반 채용 인텔리전스 서비스

경쟁사 채용공고를 한눈에 파악하는 AI 기반 채용 인텔리전스 서비스입니다.

## 📋 목차

- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [환경 설정](#환경-설정)
- [백엔드 API 연동](#백엔드-api-연동)
- [개발 가이드](#개발-가이드)
- [문서 가이드](#문서-가이드)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 📁 프로젝트 구조

```
frontend_1/
├── app/                          # Next.js App Router 페이지
│   ├── page.tsx                 # 메인 페이지 (홈)
│   ├── layout.tsx               # 루트 레이아웃
│   ├── globals.css              # 전역 스타일
│   ├── login/                   # 로그인 페이지
│   │   └── page.tsx
│   ├── signup/                  # 회원가입 페이지
│   │   └── page.tsx
│   ├── dashboard/               # 대시보드 페이지
│   │   ├── page.tsx            # 대시보드 메인
│   │   └── jobs/
│   │       └── [id]/
│   │           └── page.tsx    # 공고 상세 페이지
│   ├── jobs/                    # 경쟁사 공고 전체 목록
│   │   └── page.tsx
│   ├── companies/               # 회사별 공고 페이지
│   │   └── page.tsx
│   ├── quality/                 # 공고 품질 평가 페이지
│   │   └── page.tsx
│   ├── mypage/                  # 마이페이지
│   │   └── page.tsx
│   ├── error.tsx                # 에러 페이지
│   └── not-found.tsx            # 404 페이지
├── components/                   # 재사용 가능한 컴포넌트
│   ├── Header.tsx              # 헤더 네비게이션
│   ├── CompanyLogo.tsx         # 회사 로고 컴포넌트
│   ├── JobPostingCard.tsx      # 공고 카드 컴포넌트
│   └── NotificationToast.tsx   # 알림 토스트 컴포넌트
├── contexts/                    # React Context
│   └── AuthContext.tsx         # 인증 컨텍스트
├── hooks/                       # 커스텀 훅
│   └── useJobNotifications.ts  # 공고 알림 훅
├── lib/                         # 유틸리티 및 헬퍼 함수
│   ├── api/                    # API 호출 함수
│   ├── storage/                # 스토리지 관련 유틸리티
│   └── notifications/          # 알림 관련 유틸리티
├── data/                        # 정적 데이터 (목업)
│   ├── jobPostings.json        # 채용공고 목업 데이터
│   └── skaxJobPostings.json    # SK AX 공고 데이터
├── api-specs/                   # API 명세서
│   ├── job-role-statistics-api-guide.md
│   └── recruitment-schedule-api-guide.md
├── public/                      # 정적 파일
│   └── logos/                   # 회사 로고 이미지
│       └── README.md           # 로고 이미지 가이드
├── package.json                 # 프로젝트 의존성 및 스크립트
├── tsconfig.json                # TypeScript 설정
├── tailwind.config.js          # Tailwind CSS 설정
├── next.config.js              # Next.js 설정
├── .env.local                  # 환경 변수 (gitignore에 포함)
└── README.md                    # 프로젝트 문서 (현재 파일)
```

## 🎯 주요 기능

### 1. 메인 페이지 (`/`)
- 경쟁사 회사 로고 무한 스크롤 애니메이션
- 경쟁사 공고 현황 미리보기 (대표 경쟁사 10개 공고)
- 서비스 주요 기능 소개
- 대시보드 및 전체 공고 페이지로 이동 링크

### 2. 대시보드 (`/dashboard`)
- **경쟁사 공고 자동 매칭**
  - 회사별, 고용형태별 필터링
  - 정렬 기능 (최신공고순, 회사이름순, 마감순)
  - 공고 상세 정보 및 AI 기반 직무 매칭 결과 모달
- **트렌드 비교**
  - 일간/주간/월간 트렌드 비교
  - 회사별, 직무별, 기술별 트렌드 차트
- **직군별 통계**
  - Tech/Biz/BizSupporting 카테고리별 직무 분포
  - 인터랙티브 파이 차트 및 산업별 통계
- **스킬별 통계**
  - 인터랙티브 스킬 클라우드
  - 스킬 클릭 시 상세 통계 표시
- **채용 관련 뉴스**
- **AI 분석 리포트 생성**
  - 오른쪽 하단 고정 버튼
  - 리포트 미리보기 모달
  - PDF 다운로드 기능
- 공고 상세 페이지 (`/dashboard/jobs/[id]`)

### 3. 경쟁사 공고 전체 목록 (`/jobs`)
- 모든 경쟁사 공고 목록 조회
- 직무별, 고용형태별 필터링
- 정렬 기능 (최신공고순, 회사이름순, 마감순)
- 공고 상세 페이지로 이동

### 4. 회사별 공고 (`/companies`)
- 회사별 공고 통계 및 상세 정보
- 회사별 공고 목록 조회

### 5. 공고 품질 평가 (`/quality`)
- AI 기반 공고 품질 평가
- 공고 품질 점수 및 개선 사항 제안
- 경쟁사 공고와의 비교 분석

### 6. 마이페이지 (`/mypage`)
- 사용자 정보 관리
- 새로운 공고 알림 관리
- 관심 공고 목록

### 7. 인증 기능
- 로그인 (`/login`)
- 회원가입 (`/signup`)
- 로그아웃

## 🛠 기술 스택

### 핵심 기술
- **프레임워크**: Next.js 14.0.4 (App Router)
- **언어**: TypeScript 5.x
- **UI 라이브러리**: React 18.2.0
- **스타일링**: Tailwind CSS 3.3.0
- **패키지 관리**: npm

### 주요 라이브러리
- **차트**: Recharts 2.10.3
- **PDF 생성**: html2canvas 1.4.1, jsPDF 3.0.3
- **문서 생성**: docx 9.5.1
- **파일 다운로드**: file-saver 2.0.5
- **상태 관리**: React Context API

### 개발 도구
- **ESLint**: 코드 품질 검사
- **TypeScript**: 타입 체크
- **PostCSS**: CSS 처리
- **Autoprefixer**: CSS 벤더 프리픽스 자동 추가

## ⚙️ 환경 설정

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# 백엔드 API Base URL
NEXT_PUBLIC_API_BASE_URL=https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1

# 또는 로컬 개발 환경
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### 데이터 설정

채용공고 데이터는 백엔드 API를 통해 실시간으로 가져오며, 개발/테스트용 목업 데이터는 `data/` 폴더에 저장됩니다.

#### 목업 데이터 구조 (`data/jobPostings.json`):
```json
{
  "id": 1,
  "title": "공고 제목",
  "company": "회사명",
  "location": "근무 위치",
  "employment_type": "고용 형태",
  "experience": "경력 요구사항",
  "crawl_date": "YYYY-MM-DD",
  "posted_date": "YYYY-MM-DD",
  "expired_date": "YYYY-MM-DD",
  "description": "공고 설명",
  "meta_data": {
    "job_category": "직군",
    "tech_stack": ["기술1", "기술2"],
    "salary": "연봉 정보",
    "benefits": ["복리후생1", "복리후생2"]
  }
}
```

## 🔌 백엔드 API 연동

### API Base URL

프로덕션 환경:
```
https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1
```

로컬 개발 환경:
```
http://localhost:8080/api/v1
```

### 주요 API 엔드포인트

#### 대시보드 관련
- `GET /api/v1/dashboard/job-postings-trend` - 채용 공고 수 추이
- `GET /api/v1/dashboard/job-role-statistics` - 직군별 통계
- `GET /api/v1/stat/trends/company` - 회사별 트렌드
- `GET /api/v1/stat/trends/skill` - 스킬별 트렌드

#### 스킬 통계
- `GET /api/v1/stats/keyword/skill` - 스킬 목록
- `GET /api/v1/stats/keyword/skill/{skillId}` - 스킬 상세 통계

#### 채용 일정
- `GET /api/v1/recruitment-schedule/companies` - 회사별 채용 일정
- `GET /api/v1/recruitment-schedule/competition-intensity` - 경쟁 강도 분석

### API 문서

- **Swagger UI**: https://speedjobs-backend.skala25a.project.skala-ai.com/docs
- **ReDoc**: https://speedjobs-backend.skala25a.project.skala-ai.com/redoc

### CORS 설정

백엔드에서 CORS가 올바르게 설정되어 있어야 합니다. 자세한 내용은 `CORS_SETUP_GUIDE.md`를 참조하세요.

### API 호출 예시

```typescript
// lib/api/dashboard.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1'

export async function fetchJobPostingsTrend(timeframe: 'daily' | 'weekly' | 'monthly') {
  const response = await fetch(`${API_BASE_URL}/dashboard/job-postings-trend?timeframe=${timeframe}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    mode: 'cors',
    credentials: 'omit',
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}
```

## 📝 개발 가이드

### 컴포넌트 추가

새로운 컴포넌트는 `components/` 폴더에 추가하세요.

```typescript
// components/NewComponent.tsx
'use client'

export default function NewComponent() {
  return <div>새 컴포넌트</div>
}
```

### 페이지 추가

새로운 페이지는 `app/` 폴더에 추가하세요.

```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return <div>새 페이지</div>
}
```

### 스타일링

- Tailwind CSS 클래스를 사용합니다
- 커스텀 색상은 `tailwind.config.js`에서 정의합니다
  - `sk-red`: 주요 브랜드 색상 (#C91A2A)
- 전역 스타일은 `app/globals.css`에 추가합니다

### 인증 사용

인증 기능은 `AuthContext`를 통해 제공됩니다.

```typescript
import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth()
  
  // 인증 로직 사용
}
```

## 🔧 문제 해결

### 포트 충돌

다른 포트로 실행하려면:
```bash
npm run dev -- -p 3001
```

### 의존성 문제

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 빌드 오류

```bash
# Next.js 캐시 삭제
rm -rf .next
npm run build
```

## 📌 주요 특징

- **실시간 공고 모니터링**: 경쟁사 채용공고를 실시간으로 수집 및 분석
- **AI 기반 분석**: AI를 활용한 공고 품질 평가 및 직무 매칭
- **인터랙티브 대시보드**: 다양한 차트와 통계로 시각화된 데이터 제공
- **정렬 및 필터링**: 다양한 기준으로 공고 검색 및 정렬
- **PDF 리포트**: AI 분석 리포트를 PDF로 다운로드 가능
- **반응형 디자인**: 모바일 및 데스크톱 환경 모두 지원

## 📚 문서 가이드

프로젝트에는 다양한 가이드 문서가 포함되어 있습니다:

### 개발 표준 문서
- **`FRONTEND_DEVELOPMENT_STANDARDS.md`** - 프론트엔드 개발 표준 정의서 (코딩 컨벤션, 컴포넌트 작성 규칙 등)
- **`UI_DEVELOPMENT_STANDARDS.md`** - UI 개발 표준 정의서 (Vite/React 기반)
- **`COLLABORATION_GUIDE.md`** - 협업 가이드 (페이지 추가, 컴포넌트 추가, API 연동 등)

### API 문서
- **`DASHBOARD_API_SPECIFICATION.md`** - 대시보드 API 명세서 (모든 API 엔드포인트 및 형식)
- **`API_SKILL_STATISTICS.md`** - 스킬별 통계 API 연동 가이드
- **`api-specs/job-role-statistics-api-guide.md`** - 직군별 통계 API 사용 가이드
- **`api-specs/recruitment-schedule-api-guide.md`** - 채용 일정 분석 API 가이드
- **`API_COMPARISON.md`** - 백엔드 API vs 대시보드 요구사항 비교 분석

### 설정 및 문제 해결
- **`CORS_SETUP_GUIDE.md`** - CORS 설정 가이드
- **`BACKEND_CORS_UPDATE.md`** - 백엔드 CORS 설정 개선 가이드
- **`SWAGGER_TEST_GUIDE.md`** - Swagger UI를 이용한 API 테스트 가이드

### 리소스 가이드
- **`public/logos/README.md`** - 회사 로고 이미지 가이드

## 🔧 문제 해결

### 포트 충돌

다른 포트로 실행하려면:
```bash
npm run dev -- -p 3001
```

### 의존성 문제

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 빌드 오류

```bash
# Next.js 캐시 삭제
rm -rf .next
npm run build
```

### CORS 에러

백엔드에서 CORS 설정이 올바른지 확인하세요. 자세한 내용은 `CORS_SETUP_GUIDE.md`를 참조하세요.

### API 호출 실패

1. 백엔드 서버가 실행 중인지 확인
2. `.env.local` 파일의 `NEXT_PUBLIC_API_BASE_URL` 확인
3. 브라우저 개발자 도구의 Network 탭에서 요청/응답 확인
4. Swagger UI에서 직접 API 테스트 (`SWAGGER_TEST_GUIDE.md` 참조)

## 📌 주요 특징

- **실시간 공고 모니터링**: 경쟁사 채용공고를 실시간으로 수집 및 분석
- **AI 기반 분석**: AI를 활용한 공고 품질 평가 및 직무 매칭
- **인터랙티브 대시보드**: 다양한 차트와 통계로 시각화된 데이터 제공
- **정렬 및 필터링**: 다양한 기준으로 공고 검색 및 정렬
- **PDF 리포트**: AI 분석 리포트를 PDF로 다운로드 가능
- **반응형 디자인**: 모바일 및 데스크톱 환경 모두 지원
- **백엔드 API 연동**: FastAPI 백엔드와 완전한 통합

## 📄 라이선스

이 프로젝트는 내부 사용을 위한 프로젝트입니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 개발팀에 문의해주세요.
