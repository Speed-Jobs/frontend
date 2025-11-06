# Speed Jobs - AI 기반 채용 인텔리전스 서비스

경쟁사 채용공고를 한눈에 파악하는 AI 기반 채용 인텔리전스 서비스입니다.

## 📋 목차

- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [환경 설정](#환경-설정)

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
│   ├── dashboard/               # 대시보드 페이지
│   │   ├── page.tsx            # 대시보드 메인
│   │   └── jobs/
│   │       └── [id]/
│   │           └── page.tsx    # 공고 상세 페이지
│   ├── analysis/                # 분석 리포트 페이지
│   │   └── page.tsx
│   ├── matching/                # 자동 매칭 페이지
│   │   └── page.tsx
│   └── quality/                 # 공고 품질 평가 페이지
│       └── page.tsx
├── components/                   # 재사용 가능한 컴포넌트
│   ├── Header.tsx              # 헤더 네비게이션
│   ├── CompanyLogo.tsx         # 회사 로고 컴포넌트
│   └── JobPostingCard.tsx      # 공고 카드 컴포넌트
├── data/                        # 정적 데이터
│   └── jobPostings.json        # 채용공고 목업 데이터
├── public/                      # 정적 파일
│   └── logos/                   # 회사 로고 이미지
│       ├── samsung-sds.png
│       ├── lg-cns.png
│       ├── hyundai-autoever.png
│       ├── hanwha-system.png
│       ├── kt.png
│       ├── naver.png
│       ├── kakao.png
│       ├── line.png
│       ├── coupang.png
│       ├── baemin.png
│       ├── toss.png
│       ├── kpmg.png
│       └── README.md           # 로고 이미지 가이드
├── package.json                 # 프로젝트 의존성 및 스크립트
├── tsconfig.json                # TypeScript 설정
├── tailwind.config.js          # Tailwind CSS 설정
├── next.config.js              # Next.js 설정
└── README.md                    # 프로젝트 문서 (현재 파일)
```

## 🎯 주요 기능

### 1. 메인 페이지 (`/`)
- 경쟁사 회사 로고 애니메이션
- 경쟁사 공고 현황 (필터링 기능)
- 직군 및 고용형태별 필터

### 2. 대시보드 (`/dashboard`)
- 경쟁사 공고 목록 및 필터링
- 트렌드 비교 차트
- 스킬별 통계 (인터랙티브 스킬 클라우드)
- 채용 관련 뉴스
- 공고 상세 페이지 (`/dashboard/jobs/[id]`)

### 3. 분석 리포트 (`/analysis`)
- 공고 발행 통계
- 트렌드 분석 (라인/바 차트)
- 직무별 분석
- 기업별 분석
- 지원자 분석

### 4. 자동 매칭 (`/matching`)
- 회사 및 직무별 공고 검색
- 공고 상세 정보 모달
- AI 기반 직무 매칭 결과

### 5. 공고 품질 평가 (`/quality`)
- AI 기반 공고 품질 평가 기능

## 🛠 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **UI 라이브러리**: React 18
- **스타일링**: Tailwind CSS
- **차트**: Recharts
- **패키지 관리**: npm

## ⚙️ 환경 설정

### 회사 로고 이미지 설정

회사 로고 이미지는 `public/logos/` 폴더에 PNG 형식으로 저장해야 합니다.

필요한 로고 파일:
- `samsung-sds.png` - 삼성SDS
- `lg-cns.png` - LGCNS
- `hyundai-autoever.png` - 현대 오토에버
- `hanwha-system.png` - 한화 시스템
- `kt.png` - KT
- `naver.png` - 네이버
- `kakao.png` - 카카오
- `line.png` - 라인
- `coupang.png` - 쿠팡
- `baemin.png` - 배민
- `toss.png` - 토스
- `kpmg.png` - KPMG

자세한 내용은 `public/logos/README.md`를 참고하세요.

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
- 전역 스타일은 `app/globals.css`에 추가합니다

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

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.
