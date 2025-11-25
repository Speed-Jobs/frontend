# UI 개발 표준 정의서

## 3.7. 프로젝트 기술 스택

### 3.7.1. 개발 환경

- **Node.js**: 22.18.0
- **npm**: 10.9.3
- **패키지 관리자**: npm

### 3.7.2. 핵심 기술 스택

- **빌드 도구**: Vite 7.1.12
- **프레임워크**: React 18.3.1
- **React DOM**: 18.3.1 (React와 동일 버전)
- **언어**: TypeScript 5.6.3
- **스타일링**: TailwindCSS 3.4.13
- **라우팅**: React Router DOM 6.28.0

### 3.7.3. 스타일링 관련

- **PostCSS**: 8.4.47
- **AutoPrefixer**: 10.4.20
- **@tailwindcss/postcss**: 1.0.0

### 3.7.4. 개발 서버 및 빌드

- **개발 서버**: Vite 기본 포트 5173
- **개발 서버 실행**: `npm run dev`
- **빌드**: `npm run build`
- **프로덕션 실행**: `npm run preview` (Vite 빌드 후 실행)

### 3.7.5. 코드 품질 도구

- **ESLint**: 코드 품질 검사 및 린팅
- **TypeScript**: 정적 타입 검사

### 3.7.6. 데이터 시각화

- **Recharts**: 2.10.3
  - 차트 라이브러리 (LineChart, BarChart, PieChart 등)
  - React 기반 데이터 시각화

### 3.7.7. 파일 처리 라이브러리

- **html2canvas**: 1.4.1
  - HTML 요소를 Canvas 이미지로 변환
- **jspdf**: 3.0.3
  - PDF 문서 생성
- **file-saver**: 2.0.5
  - 파일 다운로드 기능
- **docx**: 9.5.1
  - Word 문서 생성 및 편집

### 3.7.8. 타입 정의 패키지

- **@types/node**: Node.js 타입 정의
- **@types/react**: React 타입 정의
- **@types/react-dom**: React DOM 타입 정의
- **@types/jspdf**: jspdf 타입 정의

### 3.7.9. 프로젝트 구조

```
프로젝트명/
├── src/                    # 소스 코드 디렉토리
│   ├── app/               # React Router 페이지 디렉토리
│   ├── components/        # 재사용 가능한 컴포넌트
│   ├── hooks/             # 커스텀 React 훅
│   ├── contexts/          # React Context
│   ├── lib/               # 유틸리티 및 라이브러리
│   ├── types/             # TypeScript 타입 정의
│   └── assets/            # 정적 자산 (이미지, 폰트 등)
├── public/                # 정적 파일 (빌드 시 그대로 복사)
├── index.html             # 진입점 HTML 파일
├── vite.config.ts         # Vite 설정 파일
├── tsconfig.json          # TypeScript 설정 파일
├── tailwind.config.js     # TailwindCSS 설정 파일
├── postcss.config.js      # PostCSS 설정 파일
└── package.json           # 프로젝트 의존성 및 스크립트
```

### 3.7.10. 환경 변수 관리

- **환경 변수 파일**: `.env`, `.env.local`, `.env.production`
- **접두사**: `VITE_` (Vite에서 환경 변수 접근 시 필요)
- **사용 예시**: `VITE_API_BASE_URL=http://localhost:8000`

### 3.7.11. 주요 npm 스크립트

```json
{
  "dev": "vite",                    // 개발 서버 실행 (포트 5173)
  "build": "vite build",            // 프로덕션 빌드
  "preview": "vite preview",        // 빌드 결과 미리보기
  "lint": "eslint . --ext ts,tsx"   // 코드 린팅
}
```

### 3.7.12. 브라우저 지원

- 최신 Chrome, Firefox, Safari, Edge
- ES2020+ 지원 브라우저
- 모바일 브라우저 지원

### 3.7.13. 빌드 산출물

- **빌드 디렉토리**: `dist/`
- **정적 파일**: `dist/assets/` (JS, CSS 파일)
- **소스맵**: 프로덕션 빌드 시 생성 (디버깅용)

---

## 3.8. UI 구조

### 3.8.1. 프로젝트 구조

- 프로젝트는 시스템 별로 하나로 생성, 관리된다. 즉, 시스템 별로 하나의 Vite + React 프로젝트가 생성, 관리된다.
- 프로젝트의 UI 구조는 다음과 같으며, `src/app/` 폴더 하위에 페이지 파일들이 위치하며, 화면을 구성하는 파일 구조는 기능별로 디렉토리로 구분된다.

```
프로젝트명/
├── src/
│   ├── app/                    # React Router 페이지 디렉토리
│   │   ├── App.tsx             # 루트 컴포넌트 및 라우터 설정
│   │   ├── pages/              # 페이지 컴포넌트
│   │   │   ├── Home.tsx        # 홈 페이지
│   │   │   ├── Dashboard.tsx   # 대시보드 페이지
│   │   │   ├── Jobs.tsx        # 채용 공고 목록 페이지
│   │   │   └── ...
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── JobPostingCard.tsx
│   │   └── ...
│   ├── hooks/                 # 커스텀 React 훅
│   │   └── useJobNotifications.ts
│   ├── contexts/              # React Context
│   │   └── AuthContext.tsx
│   ├── lib/                   # 유틸리티 및 라이브러리
│   │   ├── api/
│   │   └── ...
│   ├── types/                 # TypeScript 타입 정의
│   │   └── index.ts
│   └── assets/                # 정적 자산
│       ├── images/
│       └── ...
├── public/                    # 정적 파일 (빌드 시 그대로 복사)
│   ├── logos/
│   └── ...
├── index.html                 # 진입점 HTML 파일
├── vite.config.ts             # Vite 설정
├── tsconfig.json              # TypeScript 설정
├── tailwind.config.js         # TailwindCSS 설정
└── postcss.config.js          # PostCSS 설정
```

#### 디렉토리 구조 규칙

- **src/app/**: React Router 기반 라우팅 설정 및 페이지 컴포넌트
  - `App.tsx`: React Router 설정 및 라우트 정의
  - `pages/`: 각 페이지 컴포넌트
  - 동적 라우트는 React Router의 `:id` 파라미터 사용 (예: `/dashboard/jobs/:id`)

- **src/components/**: 재사용 가능한 UI 컴포넌트
  - 파일명은 PascalCase 사용 (예: `Header.tsx`)
  - 각 컴포넌트는 단일 책임 원칙을 따름

- **src/hooks/**: 커스텀 React 훅
  - 파일명은 camelCase로 시작하며 `use` 접두사 사용 (예: `useJobNotifications.ts`)

- **src/lib/**: 유틸리티 함수 및 라이브러리 래퍼
  - API 호출 관련 함수
  - 공통 유틸리티 함수

- **src/types/**: TypeScript 타입 정의
  - 공통 타입은 `index.ts`에 정의
  - 도메인별 타입은 별도 파일로 관리

- **public/**: 정적 파일 (이미지, 폰트 등)
  - 빌드 시 그대로 복사됨
  - `/logos/logo.png` 형태로 접근 가능

### 3.8.2. React Router 구성

- 화면 구조는 다음과 같다.

```
src/app/
├── App.tsx                    # 루트 컴포넌트 및 라우터 설정
│   ├── <Routes>               # 라우트 정의
│   │   ├── <Route path="/" element={<Home />} />
│   │   ├── <Route path="/dashboard" element={<Dashboard />} />
│   │   └── ...
│   └── <Outlet />             # 중첩 라우트 렌더링
└── pages/
    ├── Home.tsx               # 홈 페이지 (/)
    ├── Dashboard.tsx          # 대시보드 페이지 (/dashboard)
    └── ...
```

#### 라우팅 구조

- **React Router DOM**: 클라이언트 사이드 라우팅
  - `BrowserRouter`: HTML5 History API 사용
  - `Routes`, `Route`: 라우트 정의
  - `Link`, `NavLink`: 네비게이션 컴포넌트
  - `useNavigate`, `useParams`: 라우팅 훅

- **중첩 라우트**: 특정 경로 그룹에만 적용되는 레이아웃
  - 예: `/dashboard/*` 경로에 공통 레이아웃 적용

### 3.8.3. 화면 구조

- 일반 웹 브라우저로 구성되는 프레임 구조

```
┌─────────────────────────────────────────┐
│              Header (공통)               │
│  - 로고                                  │
│  - 네비게이션 메뉴                       │
│  - 사용자 정보                           │
├─────────────────────────────────────────┤
│                                         │
│         페이지 컨텐츠 (동적)            │
│                                         │
│  - 각 페이지별 고유 컨텐츠              │
│  - 컴포넌트 조합                         │
│                                         │
├─────────────────────────────────────────┤
│              Footer (공통)               │
│  - 저작권 정보                           │
│  - 링크                                  │
└─────────────────────────────────────────┘
```

#### 페이지 컴포넌트 구조

```typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PageName() {
  const navigate = useNavigate()
  
  // 1. State 선언
  const [state, setState] = useState()
  
  // 2. Hooks (useEffect, useMemo 등)
  useEffect(() => {
    // 초기화 로직
  }, [])
  
  // 3. 이벤트 핸들러
  const handleEvent = () => {
    // 이벤트 처리 로직
  }
  
  // 4. 렌더링
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-8 py-6 max-w-7xl mx-auto">
        {/* 페이지 컨텐츠 */}
      </main>
      <Footer />
    </div>
  )
}
```

### 3.8.4. 데이터 구조

- React에서 사용하는 데이터 구조는 다음과 같이 분류된다:

#### 3.8.4.1. State 관리

- **로컬 State**: `useState` 훅을 사용한 컴포넌트 내부 상태
  ```typescript
  const [count, setCount] = useState<number>(0)
  const [user, setUser] = useState<User | null>(null)
  ```

- **전역 State**: React Context를 사용한 전역 상태 관리
  ```typescript
  // contexts/AuthContext.tsx
  const AuthContext = createContext<AuthContextType | undefined>(undefined)
  ```

- **서버 State**: API에서 가져온 데이터
  ```typescript
  const [data, setData] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  ```

#### 3.8.4.2. API 응답 데이터 구조

- API 응답은 다음과 같은 표준 구조를 따른다:

```typescript
// 성공 응답
interface ApiSuccessResponse<T> {
  status: number          // HTTP 상태 코드 (200)
  code: string            // 응답 코드 ("SUCCESS")
  message: string         // 응답 메시지
  data: T                 // 실제 데이터
}

// 에러 응답
interface ApiErrorResponse {
  status: number          // HTTP 상태 코드 (400, 404, 500 등)
  code: string            // 에러 코드
  message: string         // 에러 메시지
  detail?: string         // 상세 에러 정보 (선택사항)
}
```

#### 3.8.4.3. 데이터 타입 정의

- TypeScript 인터페이스를 사용하여 데이터 타입을 명시적으로 정의

```typescript
// 예: 채용 공고 데이터 타입
interface JobPosting {
  id: number
  title: string
  company: string
  location: string
  employment_type: string
  experience: string
  crawl_date: string
  posted_date: string
  expired_date: string | null
  description: string
  meta_data?: {
    job_category?: string
    salary?: string
    benefits?: string[]
    tech_stack?: string[]
  }
}
```

## 3.9. UI 개발 표준

### 3.9.1. React/Vite 개발 표준

#### 컴포넌트 개발 규칙

1. **컴포넌트 파일명**
   - PascalCase 사용 (예: `JobPostingCard.tsx`)
   - 파일명과 컴포넌트명 일치

2. **컴포넌트 구조**
   ```typescript
   import { useState } from 'react'
   import type { ComponentProps } from '@/types'
   
   interface ComponentNameProps {
     // Props 타입 정의
   }
   
   export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
     // 컴포넌트 로직
     return (
       // JSX
     )
   }
   ```

3. **Props 타입 정의**
   - 모든 Props는 TypeScript 인터페이스로 정의
   - 필수 Props와 선택 Props 명시 (`?` 사용)

4. **State 관리**
   - 로컬 State는 `useState` 사용
   - 복잡한 State는 `useReducer` 고려
   - 전역 State는 Context API 사용

5. **이벤트 핸들러**
   - 핸들러 함수명은 `handle` 접두사 사용 (예: `handleClick`, `handleSubmit`)
   - 비동기 함수는 `async/await` 사용

6. **스타일링**
   - Tailwind CSS 사용
   - 클래스명은 공백으로 구분
   - 반응형 디자인: `sm:`, `md:`, `lg:`, `xl:` 접두사 사용

#### API 호출 표준

1. **API 호출 패턴**
   ```typescript
   const fetchData = async () => {
     try {
       setIsLoading(true)
       setError(null)
       
       const response = await fetch(apiUrl, {
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
       
       const result = await response.json()
       
       if (result.status === 200 && result.code === 'SUCCESS') {
         setData(result.data)
       } else {
         throw new Error(result.message || '데이터를 가져오는데 실패했습니다.')
       }
     } catch (error) {
       console.error('API 호출 에러:', error)
       setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
     } finally {
       setIsLoading(false)
     }
   }
   ```

2. **에러 처리**
   - 모든 API 호출은 try-catch로 감싸기
   - 사용자에게 명확한 에러 메시지 표시
   - 콘솔에 상세 에러 로그 출력

3. **로딩 상태 관리**
   - API 호출 시 로딩 상태 표시
   - `isLoading` state로 UI 제어

#### 파일 구조 표준

1. **페이지 파일 (src/app/pages/*.tsx)**
   - 각 페이지는 독립적인 파일로 관리
   - React Router의 동적 라우트는 `:param` 사용

2. **컴포넌트 파일 (src/components/*.tsx)**
   - 재사용 가능한 컴포넌트만 components 폴더에 위치
   - 페이지 전용 컴포넌트는 해당 페이지 폴더 내부에 위치 가능

3. **타입 정의**
   - 공통 타입은 별도 파일로 관리 (예: `src/types/index.ts`)
   - 컴포넌트 전용 타입은 해당 파일 내부에 정의

#### 네이밍 규칙

1. **변수명**: camelCase (예: `userName`, `isLoading`)
2. **함수명**: camelCase (예: `handleClick`, `fetchData`)
3. **컴포넌트명**: PascalCase (예: `JobPostingCard`)
4. **상수명**: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
5. **파일명**: 
   - 컴포넌트: PascalCase (예: `Header.tsx`)
   - 유틸리티: camelCase (예: `formatDate.ts`)
   - 훅: camelCase with `use` prefix (예: `useJobNotifications.ts`)

### 3.9.2. UI 컴포넌트 라이브러리

- UI 구성에 필요한 컴포넌트는 다음과 같이 사용한다:

#### 3.9.2.1. 기본 컴포넌트

- **Header**: 공통 헤더 컴포넌트 (`src/components/Header.tsx`)
- **Footer**: 공통 푸터 컴포넌트 (`src/components/Footer.tsx`)
- **JobPostingCard**: 채용 공고 카드 컴포넌트 (`src/components/JobPostingCard.tsx`)

#### 3.9.2.2. 차트 라이브러리

- **Recharts**: 데이터 시각화를 위한 차트 라이브러리
  ```typescript
  import { LineChart, Line, BarChart, Bar, PieChart, Pie } from 'recharts'
  ```

#### 3.9.2.3. 스타일링

- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
  - 반응형 디자인 지원
  - 커스텀 색상 및 스타일 정의 가능

#### 3.9.2.4. 폼 처리

- HTML5 기본 폼 요소 사용
- React의 제어 컴포넌트 패턴 사용
- 유효성 검사는 클라이언트 사이드에서 처리

#### 3.9.2.5. 파일 처리

- **html2canvas**: HTML을 이미지로 변환
- **jspdf**: PDF 생성
- **file-saver**: 파일 다운로드
- **docx**: Word 문서 생성

### 3.9.3. 코드 품질 표준

#### TypeScript 사용

- 모든 파일은 TypeScript로 작성
- 타입 정의는 명시적으로 작성
- `any` 타입 사용 지양

#### 에러 처리

- 모든 비동기 작업은 에러 처리 포함
- 사용자 친화적인 에러 메시지 제공
- 개발 환경에서는 상세 에러 로그 출력

#### 성능 최적화

- `useMemo`, `useCallback`을 적절히 사용하여 불필요한 리렌더링 방지
- 이미지 최적화 (Vite의 자동 최적화 활용)
- 코드 스플리팅 (Vite의 자동 코드 스플리팅 활용)
- 동적 import 사용 (`React.lazy`, `Suspense`)

#### 접근성 (Accessibility)

- 시맨틱 HTML 태그 사용
- 키보드 네비게이션 지원
- ARIA 속성 적절히 사용

### 3.9.4. 버전 관리

- Git을 사용한 버전 관리
- 브랜치 전략: Git Flow 또는 GitHub Flow
- 커밋 메시지: 명확하고 간결하게 작성

---

**문서 버전**: 1.0  
**최종 수정일**: 2024년  
**작성자**: 개발팀
