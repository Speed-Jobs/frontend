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

### Docker를 사용한 배포

```bash
# Docker 이미지 빌드
./docker-build.sh

# Docker 이미지 푸시
./docker-push.sh

# 또는 직접 실행
docker build -t speed-jobs-frontend .
docker run -p 3000:3000 speed-jobs-frontend
```

### Kubernetes 배포

```bash
# Kubernetes 배포
kubectl apply -f k8s/deploy.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## 📁 프로젝트 구조

```
frontend_1/
├── app/                          # Next.js App Router 페이지
│   ├── page.tsx                 # 메인 페이지 (홈 - 대시보드로 리다이렉트)
│   ├── layout.tsx               # 루트 레이아웃
│   ├── globals.css              # 전역 스타일
│   ├── error.tsx                # 에러 페이지
│   ├── not-found.tsx            # 404 페이지
│   ├── api/                     # API 라우트 핸들러
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts     # 로그인 API 라우트
│   │   ├── posts/
│   │   │   ├── route.ts         # 공고 목록 API 라우트
│   │   │   └── [id]/
│   │   │       └── route.ts     # 공고 상세 API 라우트
│   │   └── subscriptions/
│   │       └── route.ts         # 구독 API 라우트
│   ├── login/                   # 로그인 페이지
│   │   └── page.tsx
│   ├── signup/                  # 회원가입 페이지
│   │   └── page.tsx
│   ├── dashboard/               # 대시보드 페이지
│   │   ├── layout.tsx           # 대시보드 레이아웃
│   │   ├── page.tsx             # 대시보드 메인
│   │   ├── jobs/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # 공고 상세 페이지
│   │   └── recruitment-schedule/
│   │       └── page.tsx         # 채용 일정 분석 페이지
│   ├── jobs/                    # 경쟁사 공고 전체 목록
│   │   └── page.tsx
│   ├── companies/               # 회사별 공고 페이지
│   │   └── page.tsx
│   ├── quality/                 # 공고 품질 평가 페이지
│   │   └── page.tsx
│   └── mypage/                  # 마이페이지
│       └── page.tsx
├── components/                   # 재사용 가능한 컴포넌트
│   ├── Header.tsx               # 헤더 네비게이션
│   ├── CompanyLogo.tsx          # 회사 로고 컴포넌트
│   ├── NotificationToast.tsx    # 알림 토스트 컴포넌트
│   ├── dashboard/               # 대시보드 전용 컴포넌트
│   │   ├── AIChatbot.tsx        # AI 챗봇 컴포넌트
│   │   ├── CombinedTrendChart.tsx          # 통합 트렌드 차트
│   │   ├── CompanyInsightAnalysis.tsx      # 회사 인사이트 분석
│   │   ├── CompanyInsightView.tsx           # 회사 인사이트 뷰
│   │   ├── CompanyNetworkBubble.tsx         # 회사 네트워크 버블 차트
│   │   ├── CompanyRecruitmentChart.tsx      # 회사 채용 차트
│   │   ├── CompanySkillDiversityChart.tsx   # 회사 스킬 다양성 차트
│   │   ├── DarkDashboardCard.tsx            # 다크 대시보드 카드
│   │   ├── HotJobsList.tsx                  # 인기 공고 목록
│   │   ├── JobDifficultyGauges.tsx          # 직무 난이도 게이지
│   │   ├── JobPostingsTrendChart.tsx         # 채용 공고 트렌드 차트
│   │   ├── JobRoleSkillSetGuide.tsx         # 직군 스킬셋 가이드
│   │   ├── JobRoleStatisticsChart.tsx       # 직군 통계 차트
│   │   ├── NewRecruitmentCalendar.tsx        # 신규 채용 캘린더
│   │   ├── SkillCloud.tsx                    # 스킬 클라우드
│   │   ├── SkillTrendAndCloud.tsx           # 스킬 트렌드 및 클라우드
│   │   ├── SkillTrendChart.tsx               # 스킬 트렌드 차트
│   │   ├── SurgingKeywords.tsx               # 급상승 키워드
│   │   ├── TechStackList.tsx                 # 기술 스택 목록
│   │   └── calendar/                         # 캘린더 관련 컴포넌트
│   │       ├── Calendar.tsx                  # 메인 캘린더 컴포넌트
│   │       ├── CalendarCell.tsx              # 캘린더 셀 컴포넌트
│   │       ├── CompanyScheduleManager.tsx   # 회사 일정 관리자
│   │       ├── UserPinManager.tsx            # 사용자 핀 관리자
│   │       ├── InsightPanel.tsx              # 인사이트 패널
│   │       ├── AddScheduleDialog.tsx         # 일정 추가 다이얼로그
│   │       ├── AddUserScheduleDialog.tsx     # 사용자 일정 추가 다이얼로그
│   │       ├── DateRangePicker.tsx           # 날짜 범위 선택기
│   │       └── types.ts                      # 캘린더 타입 정의
│   ├── mypage/                  # 마이페이지 컴포넌트
│   │   ├── SubscriptionSettings.tsx  # 구독 설정
│   │   └── SubscriptionView.tsx      # 구독 뷰
│   └── ui/                      # UI 기본 컴포넌트 (shadcn/ui)
│       ├── badge.tsx            # 배지 컴포넌트
│       ├── button.tsx           # 버튼 컴포넌트
│       ├── card.tsx             # 카드 컴포넌트
│       ├── checkbox.tsx          # 체크박스 컴포넌트
│       ├── dialog.tsx           # 다이얼로그 컴포넌트
│       ├── input.tsx            # 입력 컴포넌트
│       ├── label.tsx            # 라벨 컴포넌트
│       ├── tabs.tsx            # 탭 컴포넌트
│       ├── tooltip.tsx          # 툴팁 컴포넌트
│       └── utils.ts             # 유틸리티 함수
├── contexts/                    # React Context
│   └── AuthContext.tsx         # 인증 컨텍스트
├── hooks/                       # 커스텀 훅
│   └── useJobNotifications.ts  # 공고 알림 훅
├── lib/                         # 유틸리티 및 헬퍼 함수
│   ├── api/
│   │   └── subscription.ts     # 구독 API 함수
│   ├── storage/                # 스토리지 관련 유틸리티
│   │   ├── factory.ts          # 스토리지 팩토리
│   │   ├── localStorageStorage.ts  # 로컬 스토리지 구현
│   │   ├── types.ts            # 스토리지 타입 정의
│   │   └── debug.ts            # 디버그 유틸리티
│   ├── notifications/          # 알림 관련 유틸리티
│   │   └── browser.ts          # 브라우저 알림
│   └── jobNotification.ts      # 공고 알림 유틸리티
├── data/                        # 정적 데이터 (목업)
│   ├── jobPostings.json        # 채용공고 목업 데이터
│   └── skaxJobPostings.json    # SK AX 공고 데이터
├── api-specs/                   # API 명세서 (YAML)
│   ├── job-role-statistics-api.yaml      # 직군별 통계 API 명세
│   └── skill-trends-and-cloud-api.yaml   # 스킬 트렌드 및 클라우드 API 명세
├── k8s/                         # Kubernetes 배포 설정
│   ├── deploy.yaml             # 배포 설정
│   ├── service.yaml             # 서비스 설정
│   └── ingress.yaml             # 인그레스 설정
├── public/                      # 정적 파일
│   ├── logos/                   # 회사 로고 이미지
│   │   └── README.md           # 로고 이미지 가이드
│   └── job-postings/           # 채용 공고 스크린샷
│       ├── kakao/
│       ├── lg/
│       ├── line/
│       └── toss/
├── dashboard_api_spec.yaml      # 대시보드 API 명세서
├── Dockerfile                   # Docker 이미지 빌드 설정
├── docker-build.sh              # Docker 빌드 스크립트
├── docker-push.sh               # Docker 푸시 스크립트
├── package.json                 # 프로젝트 의존성 및 스크립트
├── tsconfig.json                # TypeScript 설정
├── tailwind.config.js           # Tailwind CSS 설정
├── postcss.config.js            # PostCSS 설정
├── next.config.js               # Next.js 설정
├── next-env.d.ts                # Next.js 타입 정의
├── .env.local                   # 환경 변수 (gitignore에 포함)
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
  - 통합 트렌드 차트 (CombinedTrendChart)
- **직군별 통계**
  - Tech/Biz/BizSupporting 카테고리별 직무 분포
  - 인터랙티브 파이 차트 및 산업별 통계
  - 직군별 스킬셋 가이드
- **스킬별 통계**
  - 인터랙티브 스킬 클라우드
  - 스킬 트렌드 차트
  - 스킬 클릭 시 상세 통계 표시
- **회사 인사이트 분석**
  - 회사별 네트워크 버블 차트
  - 회사별 채용 차트 및 스킬 다양성 분석
- **인기 공고 목록**
  - 실시간 인기 공고 자동 업데이트
- **직무 난이도 분석**
  - 직무별 난이도 게이지 표시
- **급상승 키워드**
  - 실시간 급상승 키워드 모니터링
- **AI 챗봇**
  - 오른쪽 하단 고정 AI 챗봇
  - 채용 관련 질문 답변
- **채용 일정 분석** (`/dashboard/recruitment-schedule`)
  - 경쟁사 채용 일정 캘린더 뷰
  - 신입/경력 공고 필터링
  - 실제 공고/예측치 필터링
  - 직군별 필터링 (경력 공고)
  - 사용자 일정 시뮬레이션 기능
  - 인사이트 패널 (경쟁 강도 분석)
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
- **로컬 API 명세서**: `api-specs/` 폴더의 YAML 파일들
  - `job-role-statistics-api.yaml` - 직군별 통계 API
  - `skill-trends-and-cloud-api.yaml` - 스킬 트렌드 및 클라우드 API
- **대시보드 API 명세서**: `dashboard_api_spec.yaml`

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

## 📚 문서 가이드

프로젝트에는 다양한 가이드 문서가 포함되어 있습니다:

### API 명세서
- **`dashboard_api_spec.yaml`** - 대시보드 API 명세서 (OpenAPI 3.0 형식)
- **`api-specs/job-role-statistics-api.yaml`** - 직군별 통계 API 명세서
- **`api-specs/skill-trends-and-cloud-api.yaml`** - 스킬 트렌드 및 클라우드 API 명세서

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
- **채용 일정 분석**: 경쟁사 채용 일정 시각화 및 시뮬레이션 기능
- **정렬 및 필터링**: 다양한 기준으로 공고 검색 및 정렬
- **AI 챗봇**: 실시간 채용 관련 질문 답변
- **반응형 디자인**: 모바일 및 데스크톱 환경 모두 지원
- **백엔드 API 연동**: FastAPI 백엔드와 완전한 통합
- **Docker 지원**: Docker를 통한 컨테이너화 및 배포
- **Kubernetes 배포**: K8s 매니페스트 파일 제공

## 📄 라이선스

이 프로젝트는 내부 사용을 위한 프로젝트입니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 개발팀에 문의해주세요.
