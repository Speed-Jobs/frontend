# Speed Jobs - AI 기반 채용 인텔리전스 서비스

경쟁사 채용공고를 한눈에 파악하는 AI 기반 채용 인텔리전스 서비스입니다.

## 📋 목차

- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [환경 설정](#환경-설정)
- [개발 가이드](#개발-가이드)

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
├── data/                        # 정적 데이터
│   ├── jobPostings.json        # 채용공고 목업 데이터
│   └── skaxJobPostings.json    # SK AX 공고 데이터
├── public/                      # 정적 파일
│   └── logos/                   # 회사 로고 이미지
│       └── README.md           # 로고 이미지 가이드
├── package.json                 # 프로젝트 의존성 및 스크립트
├── tsconfig.json                # TypeScript 설정
├── tailwind.config.js          # Tailwind CSS 설정
├── next.config.js              # Next.js 설정
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

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **UI 라이브러리**: React 18
- **스타일링**: Tailwind CSS
- **차트**: Recharts
- **PDF 생성**: html2canvas, jsPDF
- **상태 관리**: React Context API
- **패키지 관리**: npm

## ⚙️ 환경 설정

### 데이터 설정

채용공고 데이터는 `data/jobPostings.json` 파일에 저장됩니다.

JSON 구조:
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

## 📄 라이선스

이 프로젝트는 내부 사용을 위한 프로젝트입니다.
