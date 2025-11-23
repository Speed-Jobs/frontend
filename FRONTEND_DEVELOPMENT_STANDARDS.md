# Speed Jobs 프론트엔드 개발 표준 정의서

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [코딩 컨벤션](#4-코딩-컨벤션)
5. [컴포넌트 작성 규칙](#5-컴포넌트-작성-규칙)
6. [상태 관리](#6-상태-관리)
7. [API 통신 규칙](#7-api-통신-규칙)
8. [스타일링 규칙](#8-스타일링-규칙)
9. [에러 처리](#9-에러-처리)
10. [파일 명명 규칙](#10-파일-명명-규칙)
11. [Git 워크플로우](#11-git-워크플로우)
12. [코드 리뷰 가이드](#12-코드-리뷰-가이드)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 정보
- **프로젝트명**: Speed Jobs - AI 기반 채용 인텔리전스 서비스
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript 5.x
- **패키지 관리자**: npm

### 1.2 주요 기능
- 경쟁사 채용공고 모니터링 및 분석
- AI 기반 공고 품질 평가
- 대시보드 통계 및 트렌드 분석
- 회사별 공고 조회 및 필터링
- 사용자 인증 및 마이페이지

---

## 2. 기술 스택

### 2.1 핵심 기술
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 14.0.4 | React 프레임워크 (App Router) |
| React | 18.2.0 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안정성 |
| Tailwind CSS | 3.3.0 | 유틸리티 기반 CSS 프레임워크 |

### 2.2 주요 라이브러리
| 라이브러리 | 버전 | 용도 |
|------------|------|------|
| Recharts | 2.10.3 | 차트 및 그래프 |
| html2canvas | 1.4.1 | HTML을 Canvas로 변환 |
| jsPDF | 3.0.3 | PDF 생성 |
| docx | 9.5.1 | Word 문서 생성 |
| file-saver | 2.0.5 | 파일 다운로드 |

### 2.3 개발 도구
- **ESLint**: 코드 품질 검사 (Next.js 기본 설정)
- **TypeScript**: 타입 체크
- **PostCSS**: CSS 처리
- **Autoprefixer**: CSS 벤더 프리픽스 자동 추가

---

## 3. 프로젝트 구조

### 3.1 디렉토리 구조

```
frontend/
├── app/                          # Next.js App Router 페이지
│   ├── page.tsx                 # 메인 페이지 (홈)
│   ├── layout.tsx               # 루트 레이아웃
│   ├── globals.css              # 전역 스타일
│   ├── error.tsx                # 에러 페이지
│   ├── not-found.tsx            # 404 페이지
│   ├── login/                   # 로그인 페이지
│   ├── signup/                  # 회원가입 페이지
│   ├── dashboard/               # 대시보드
│   │   ├── page.tsx            # 대시보드 메인
│   │   └── jobs/
│   │       └── [id]/
│   │           └── page.tsx    # 동적 라우트 (공고 상세)
│   ├── jobs/                    # 경쟁사 공고 전체 목록
│   ├── companies/               # 회사별 공고
│   ├── quality/                 # 공고 품질 평가
│   └── mypage/                  # 마이페이지
├── components/                   # 재사용 가능한 컴포넌트
│   ├── Header.tsx              # 헤더 네비게이션
│   ├── Footer.tsx              # 푸터
│   ├── CompanyLogo.tsx         # 회사 로고 컴포넌트
│   ├── JobPostingCard.tsx      # 공고 카드 컴포넌트
│   └── NotificationToast.tsx   # 알림 토스트 컴포넌트
├── contexts/                    # React Context
│   └── AuthContext.tsx         # 인증 컨텍스트
├── hooks/                       # 커스텀 훅
│   └── useJobNotifications.ts   # 공고 알림 훅
├── lib/                         # 유틸리티 및 헬퍼 함수
│   ├── storage/                # 스토리지 관련 유틸리티
│   └── notifications/           # 알림 관련 유틸리티
├── data/                        # 정적 데이터 (목업)
│   ├── jobPostings.json        # 채용공고 목업 데이터
│   └── skaxJobPostings.json    # SK AX 공고 데이터
├── public/                      # 정적 파일
│   ├── logos/                   # 회사 로고 이미지
│   └── job-postings/            # 공고 이미지
├── k8s/                         # Kubernetes 배포 설정
├── package.json                 # 프로젝트 의존성
├── tsconfig.json                # TypeScript 설정
├── tailwind.config.js           # Tailwind CSS 설정
├── next.config.js              # Next.js 설정
└── README.md                    # 프로젝트 문서
```

### 3.2 디렉토리 규칙

#### 3.2.1 `app/` 디렉토리
- Next.js App Router를 사용한 페이지 라우팅
- 각 폴더는 라우트 경로를 나타냄
- `page.tsx`: 해당 경로의 페이지 컴포넌트
- `layout.tsx`: 해당 경로의 레이아웃 컴포넌트
- `error.tsx`: 에러 바운더리
- `not-found.tsx`: 404 페이지

#### 3.2.2 `components/` 디렉토리
- 재사용 가능한 UI 컴포넌트
- 컴포넌트명은 PascalCase 사용
- 각 컴포넌트는 독립적인 파일로 분리

#### 3.2.3 `contexts/` 디렉토리
- React Context API를 사용한 전역 상태 관리
- 인증, 테마 등 앱 전역에서 사용되는 상태

#### 3.2.4 `hooks/` 디렉토리
- 커스텀 React 훅
- 파일명은 `use`로 시작 (예: `useJobNotifications.ts`)

#### 3.2.5 `lib/` 디렉토리
- 유틸리티 함수 및 헬퍼 함수
- API 클라이언트, 스토리지 유틸리티 등

---

## 4. 코딩 컨벤션

### 4.1 TypeScript 규칙

#### 4.1.1 타입 정의
- 모든 컴포넌트 props는 인터페이스로 정의
- API 응답 타입은 인터페이스로 정의
- 타입은 가능한 한 명시적으로 작성

```typescript
// ✅ 좋은 예
interface JobPostingProps {
  job: JobPosting
  onSelect?: (id: number) => void
}

interface JobPosting {
  id: number
  title: string
  company: string
  posted_date: string
}

// ❌ 나쁜 예
const JobPosting = ({ job, onSelect }: any) => {
  // ...
}
```

#### 4.1.2 타입 가드
- 타입 안정성을 위해 타입 가드 사용

```typescript
function isError(error: unknown): error is Error {
  return error instanceof Error
}
```

### 4.2 React 규칙

#### 4.2.1 컴포넌트 선언
- 함수 컴포넌트 사용 (클래스 컴포넌트 금지)
- 컴포넌트명은 PascalCase
- `export default` 사용

```typescript
// ✅ 좋은 예
export default function JobCard({ job }: JobCardProps) {
  return <div>{job.title}</div>
}

// ❌ 나쁜 예
const JobCard = ({ job }) => {
  return <div>{job.title}</div>
}
```

#### 4.2.2 Hooks 사용 규칙
- Hooks는 컴포넌트 최상위에서만 호출
- 조건문, 반복문 내부에서 호출 금지
- 커스텀 훅은 `use`로 시작하는 이름 사용

```typescript
// ✅ 좋은 예
export default function MyComponent() {
  const [state, setState] = useState('')
  const { user } = useAuth()
  
  useEffect(() => {
    // ...
  }, [])
  
  return <div>{state}</div>
}

// ❌ 나쁜 예
export default function MyComponent() {
  if (condition) {
    const [state, setState] = useState('') // ❌ 조건문 내부
  }
}
```

#### 4.2.3 이벤트 핸들러
- 이벤트 핸들러는 `handle` 접두사 사용
- 인라인 함수보다 별도 함수로 분리 (성능 최적화)

```typescript
// ✅ 좋은 예
const handleClick = () => {
  // ...
}

<button onClick={handleClick}>클릭</button>

// ❌ 나쁜 예 (단순한 경우 제외)
<button onClick={() => { /* 복잡한 로직 */ }}>클릭</button>
```

### 4.3 Next.js 규칙

#### 4.3.1 Server Component vs Client Component
- 기본적으로 Server Component 사용
- 인터랙티브 기능이 필요한 경우에만 `'use client'` 사용

```typescript
// ✅ Server Component (기본)
export default function Page() {
  return <div>Static Content</div>
}

// ✅ Client Component (필요한 경우)
'use client'
export default function InteractiveComponent() {
  const [state, setState] = useState('')
  return <div>{state}</div>
}
```

#### 4.3.2 라우팅
- 파일 시스템 기반 라우팅 사용
- 동적 라우트는 `[param]` 형식 사용

```
app/
├── dashboard/
│   └── jobs/
│       └── [id]/
│           └── page.tsx  # /dashboard/jobs/:id
```

#### 4.3.3 데이터 페칭
- Server Component에서는 직접 데이터 페칭
- Client Component에서는 `useEffect` 또는 커스텀 훅 사용

```typescript
// Server Component
export default async function Page() {
  const data = await fetch('...')
  return <div>{data}</div>
}

// Client Component
'use client'
export default function Page() {
  useEffect(() => {
    fetch('...').then(...)
  }, [])
  return <div>...</div>
}
```

### 4.4 네이밍 규칙

#### 4.4.1 파일명
- 컴포넌트: PascalCase (예: `JobCard.tsx`)
- 유틸리티: camelCase (예: `formatDate.ts`)
- 상수: UPPER_SNAKE_CASE (예: `API_BASE_URL.ts`)

#### 4.4.2 변수명
- camelCase 사용
- 불리언은 `is`, `has`, `should` 접두사 사용
- 이벤트 핸들러는 `handle` 접두사 사용

```typescript
const userName = 'John'
const isAuthenticated = true
const hasPermission = false
const handleSubmit = () => {}
```

#### 4.4.3 컴포넌트명
- PascalCase 사용
- 명확하고 구체적인 이름 사용

```typescript
// ✅ 좋은 예
JobPostingCard
CompanyLogo
NotificationToast

// ❌ 나쁜 예
Card
Logo
Toast
```

---

## 5. 컴포넌트 작성 규칙

### 5.1 컴포넌트 구조

```typescript
'use client' // Client Component인 경우에만

import { useState, useEffect } from 'react'
import type { ComponentProps } from './types'

// 1. 타입 정의
interface ComponentProps {
  // props 타입 정의
}

// 2. 컴포넌트 선언
export default function Component({ prop1, prop2 }: ComponentProps) {
  // 3. 상태 선언
  const [state, setState] = useState('')
  
  // 4. 훅 사용
  useEffect(() => {
    // ...
  }, [])
  
  // 5. 이벤트 핸들러
  const handleClick = () => {
    // ...
  }
  
  // 6. 렌더링
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### 5.2 Props 타입 정의
- 모든 props는 인터페이스로 정의
- 선택적 props는 `?` 사용
- 기본값은 기본 매개변수로 설정

```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export default function Button({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  // ...
}
```

### 5.3 컴포넌트 분리 원칙
- 단일 책임 원칙: 하나의 컴포넌트는 하나의 역할만
- 재사용성: 여러 곳에서 사용되는 UI는 컴포넌트로 분리
- 복잡도 관리: 200줄 이상의 컴포넌트는 분리 고려

---

## 6. 상태 관리

### 6.1 로컬 상태
- 컴포넌트 내부 상태는 `useState` 사용
- 간단한 폼 상태, UI 상태 등

```typescript
const [inputValue, setInputValue] = useState('')
const [isOpen, setIsOpen] = useState(false)
```

### 6.2 전역 상태
- React Context API 사용
- 인증 상태, 테마 등 앱 전역에서 사용되는 상태

```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // ...
}
```

### 6.3 서버 상태
- API 데이터는 `useState` + `useEffect`로 관리
- 로딩 상태와 에러 상태도 함께 관리

```typescript
const [data, setData] = useState<DataType | null>(null)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('...')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }
  fetchData()
}, [])
```

### 6.4 상태 업데이트 패턴
- 불변성 유지: 객체/배열 업데이트 시 새 객체/배열 생성
- 함수형 업데이트: 이전 상태를 기반으로 업데이트할 때 사용

```typescript
// ✅ 좋은 예
setItems([...items, newItem])
setUser({ ...user, name: 'New Name' })
setCount(prev => prev + 1)

// ❌ 나쁜 예
items.push(newItem) // 직접 변경
user.name = 'New Name' // 직접 변경
```

---

## 7. API 통신 규칙

### 7.1 API 호출 패턴

#### 7.1.1 기본 구조
- `fetch` API 사용
- 에러 처리 필수
- 타임아웃 설정 고려

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
    
    const data = await response.json()
    setData(data)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error')
  } finally {
    setIsLoading(false)
  }
}
```

#### 7.1.2 API 엔드포인트 관리
- 프로덕션/개발 환경별 URL 관리
- 환경 변수 사용 권장

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com'
const apiUrl = `${API_BASE_URL}/api/v1/endpoint`
```

### 7.2 요청/응답 타입 정의

```typescript
// 요청 타입
interface ApiRequest {
  param1: string
  param2?: number
}

// 응답 타입
interface ApiResponse {
  status: number
  code: string
  message: string
  data: {
    // 실제 데이터 구조
  }
}

// 사용
const response: ApiResponse = await fetch(apiUrl).then(r => r.json())
```

### 7.3 에러 처리
- HTTP 상태 코드별 처리
- 네트워크 에러 처리
- 사용자 친화적인 에러 메시지 표시

```typescript
if (!response.ok) {
  if (response.status === 404) {
    // 404 에러 처리
    throw new Error('데이터를 찾을 수 없습니다.')
  } else if (response.status === 401) {
    // 인증 에러 처리
    throw new Error('인증이 필요합니다.')
  } else {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}
```

### 7.4 CORS 설정
- API 호출 시 CORS 모드 명시
- `credentials` 옵션 적절히 설정

```typescript
const response = await fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  mode: 'cors',
  credentials: 'omit', // 또는 'include'
})
```

---

## 8. 스타일링 규칙

### 8.1 Tailwind CSS 사용

#### 8.1.1 기본 원칙
- 유틸리티 클래스 우선 사용
- 커스텀 스타일은 `tailwind.config.js`에서 확장
- 인라인 스타일은 최소화

```typescript
// ✅ 좋은 예
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">제목</h2>
</div>

// ❌ 나쁜 예
<div style={{ display: 'flex', padding: '24px' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>제목</h2>
</div>
```

#### 8.1.2 반응형 디자인
- 모바일 퍼스트 접근
- Tailwind의 반응형 브레이크포인트 사용

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>
```

#### 8.1.3 커스텀 색상
- 브랜드 색상은 `tailwind.config.js`에서 정의
- 일관된 색상 사용

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      sk: {
        red: '#C91A2A',
        'red-dark': '#B01A26',
        'red-light': '#D93347',
      },
    },
  },
}
```

### 8.2 CSS 클래스 명명
- Tailwind 유틸리티 클래스 사용
- 커스텀 클래스는 의미 있는 이름 사용

```typescript
// ✅ 좋은 예
className="job-card-container"
className="search-input-wrapper"

// ❌ 나쁜 예
className="div1"
className="wrapper"
```

### 8.3 전역 스타일
- `app/globals.css`에 전역 스타일 정의
- 리셋 CSS, 폰트 설정 등

---

## 9. 에러 처리

### 9.1 에러 바운더리
- Next.js의 `error.tsx` 사용
- 예상치 못한 에러 처리

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>에러가 발생했습니다</h2>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  )
}
```

### 9.2 API 에러 처리
- try-catch로 모든 API 호출 감싸기
- 사용자 친화적인 에러 메시지 표시
- 로깅 (개발 환경)

```typescript
try {
  const response = await fetch(apiUrl)
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `HTTP error! status: ${response.status}`
    try {
      const errorJson = JSON.parse(errorText)
      if (errorJson.detail) {
        errorMessage = errorJson.detail
      }
    } catch {
      if (errorText) {
        errorMessage = errorText
      }
    }
    throw new Error(errorMessage)
  }
} catch (error) {
  console.error('API 호출 실패:', error)
  setError(error instanceof Error ? error.message : '알 수 없는 에러가 발생했습니다.')
}
```

### 9.3 폼 검증
- 클라이언트 사이드 검증 필수
- 명확한 에러 메시지 표시

```typescript
const validateForm = () => {
  if (!email) {
    setError('이메일을 입력해주세요.')
    return false
  }
  if (!email.includes('@')) {
    setError('올바른 이메일 형식이 아닙니다.')
    return false
  }
  return true
}
```

---

## 10. 파일 명명 규칙

### 10.1 컴포넌트 파일
- PascalCase 사용
- 파일명과 컴포넌트명 일치

```
Header.tsx          → export default function Header()
JobPostingCard.tsx  → export default function JobPostingCard()
```

### 10.2 페이지 파일
- `page.tsx` 고정 (Next.js App Router)
- 폴더명으로 라우트 경로 결정

```
app/dashboard/page.tsx        → /dashboard
app/dashboard/jobs/[id]/page.tsx → /dashboard/jobs/:id
```

### 10.3 유틸리티 파일
- camelCase 사용
- 기능을 나타내는 명확한 이름

```
formatDate.ts
apiClient.ts
storageUtils.ts
```

### 10.4 타입 정의 파일
- `types.ts` 또는 `interface.ts` 사용
- 컴포넌트와 같은 폴더에 위치하거나 `types/` 폴더에 분리

```
components/JobCard/types.ts
lib/storage/types.ts
```

---

## 11. Git 워크플로우

### 11.1 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/기능명`: 기능 개발 브랜치
- `fix/버그명`: 버그 수정 브랜치

### 11.2 커밋 메시지 규칙
- 명확하고 간결한 메시지
- 타입 접두사 사용

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 변경
```

예시:
```
feat: 직군별 통계에 시간 필터 추가
fix: 회사 검색 시 공고가 표시되지 않는 문제 수정
refactor: API 호출 로직을 커스텀 훅으로 분리
```

### 11.3 코드 리뷰 전 체크리스트
- [ ] 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] 불필요한 console.log 제거
- [ ] 주석 처리된 코드 제거
- [ ] 테스트 완료

---

## 12. 코드 리뷰 가이드

### 12.1 리뷰 포인트

#### 12.1.1 코드 품질
- 타입 안정성: 모든 변수와 함수에 타입 정의
- 가독성: 명확한 변수명과 함수명
- 재사용성: 중복 코드 제거
- 성능: 불필요한 리렌더링 방지

#### 12.1.2 아키텍처
- 컴포넌트 분리: 적절한 크기와 책임
- 상태 관리: 적절한 위치에 상태 배치
- API 호출: 에러 처리 및 로딩 상태 관리

#### 12.1.3 스타일링
- Tailwind CSS 일관성
- 반응형 디자인
- 접근성 고려

### 12.2 리뷰 코멘트 예시

```typescript
// ✅ 좋은 예
// 명확한 타입 정의와 에러 처리
interface ApiResponse {
  status: string
  data: JobPosting[]
}

const fetchJobs = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error('Failed to fetch')
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// ❌ 개선 필요
// 타입 없음, 에러 처리 부족
const fetchJobs = async () => {
  const response = await fetch(apiUrl)
  return response.json()
}
```

---

## 13. 성능 최적화

### 13.1 React 최적화
- `useMemo`: 계산 비용이 큰 값 메모이제이션
- `useCallback`: 함수 메모이제이션
- `React.memo`: 컴포넌트 메모이제이션

```typescript
// ✅ 좋은 예
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

const handleClick = useCallback(() => {
  // ...
}, [dependencies])

const MemoizedComponent = React.memo(Component)
```

### 13.2 이미지 최적화
- Next.js `Image` 컴포넌트 사용
- 적절한 크기와 포맷 사용

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="로고"
  width={100}
  height={100}
  priority // 중요 이미지인 경우
/>
```

### 13.3 코드 스플리팅
- 동적 import 사용
- 큰 라이브러리는 필요할 때만 로드

```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // 서버 사이드 렌더링 불필요한 경우
})
```

---

## 14. 접근성 (Accessibility)

### 14.1 기본 원칙
- 시맨틱 HTML 사용
- 키보드 네비게이션 지원
- ARIA 속성 적절히 사용
- 색상 대비 비율 준수

```typescript
// ✅ 좋은 예
<button
  onClick={handleClick}
  aria-label="공고 검색"
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  검색
</button>

// ❌ 나쁜 예
<div onClick={handleClick} className="button">
  검색
</div>
```

### 14.2 키보드 접근성
- 모든 인터랙티브 요소는 키보드로 접근 가능
- 포커스 스타일 명확히 표시

---

## 15. 보안

### 15.1 XSS 방지
- 사용자 입력은 항상 이스케이프 처리
- `dangerouslySetInnerHTML` 사용 최소화

### 15.2 인증 정보 관리
- 민감한 정보는 클라이언트에 저장하지 않음
- 토큰은 안전하게 관리 (httpOnly 쿠키 권장)

### 15.3 API 키 관리
- 환경 변수 사용
- `.env.local` 파일은 `.gitignore`에 추가

---

## 16. 테스트 전략

### 16.1 테스트 범위
- 핵심 비즈니스 로직
- 사용자 플로우
- 에러 케이스

### 16.2 테스트 도구 (향후 도입 예정)
- Jest: 단위 테스트
- React Testing Library: 컴포넌트 테스트
- Playwright: E2E 테스트

---

## 17. 배포 프로세스

### 17.1 빌드
```bash
npm run build
```

### 17.2 환경 변수
- `.env.local`: 로컬 개발 환경
- `.env.production`: 프로덕션 환경
- 환경 변수는 `NEXT_PUBLIC_` 접두사 필요

### 17.3 Docker 배포
- `Dockerfile` 사용
- Kubernetes 배포 설정 (`k8s/` 폴더)

---

## 18. 문서화

### 18.1 코드 주석
- 복잡한 로직은 주석으로 설명
- JSDoc 형식 사용 권장

```typescript
/**
 * 공고 데이터를 필터링합니다.
 * @param jobs - 필터링할 공고 배열
 * @param filters - 필터 조건
 * @returns 필터링된 공고 배열
 */
function filterJobs(jobs: JobPosting[], filters: FilterOptions): JobPosting[] {
  // ...
}
```

### 18.2 README 업데이트
- 새로운 기능 추가 시 README 업데이트
- API 변경 사항 문서화

---

## 19. 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Recharts 공식 문서](https://recharts.org)

---

## 20. 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0.0 | 2025-01-XX | 초기 버전 작성 | - |

---

**이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.**

