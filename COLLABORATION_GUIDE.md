# Speed Jobs 협업 가이드

## 📋 목차

1. [시작하기 전에](#1-시작하기-전에)
2. [새로운 페이지 추가하기](#2-새로운-페이지-추가하기)
3. [기존 페이지 수정하기](#3-기존-페이지-수정하기)
4. [컴포넌트 추가하기](#4-컴포넌트-추가하기)
5. [API 연동하기](#5-api-연동하기)
6. [스타일링 가이드](#6-스타일링-가이드)
7. [작업 전 체크리스트](#7-작업-전-체크리스트)
8. [작업 후 체크리스트](#8-작업-후-체크리스트)

---

## 1. 시작하기 전에

### 1.1 필수 확인 사항
- [ ] 최신 `main` 브랜치에서 작업 시작
- [ ] `npm install` 실행하여 의존성 설치 완료
- [ ] `npm run dev` 실행하여 개발 서버 정상 작동 확인
- [ ] 프로젝트 구조 파악 (`README.md` 참고)

### 1.2 브랜치 생성
```bash
# 기능 개발
git checkout -b feature/페이지명-기능명

# 버그 수정
git checkout -b fix/버그명

# 예시
git checkout -b feature/analytics-통계-페이지
git checkout -b fix/dashboard-차트-오류
```

---

## 2. 새로운 페이지 추가하기

### 2.1 페이지 추가 절차

#### Step 1: 디렉토리 구조 확인
```
app/
├── page.tsx              # 메인 페이지 (/)
├── dashboard/
│   └── page.tsx         # 대시보드 (/dashboard)
├── companies/
│   └── page.tsx         # 회사별 공고 (/companies)
└── [새로운-페이지]/      # 여기에 추가
    └── page.tsx
```

#### Step 2: 페이지 파일 생성
1. `app/` 폴더 아래에 새 폴더 생성 (예: `app/analytics/`)
2. 폴더 안에 `page.tsx` 파일 생성

```typescript
// app/analytics/page.tsx
'use client' // 인터랙티브 기능이 필요한 경우에만

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          분석 페이지
        </h1>
        
        {/* 페이지 내용 */}
      </div>
      
      <Footer />
    </div>
  )
}
```

#### Step 3: 네비게이션에 추가 (필요한 경우)
```typescript
// components/Header.tsx
const navItems = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/quality', label: '공고품질 평가' },
  { href: '/companies', label: '회사별 공고' },
  { href: '/analytics', label: '분석', icon: '📊' }, // 새로 추가
]
```

### 2.2 동적 라우트 페이지 추가

#### 예시: `/analytics/[id]` 페이지
```
app/
└── analytics/
    ├── page.tsx          # /analytics
    └── [id]/
        └── page.tsx      # /analytics/:id
```

```typescript
// app/analytics/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'

export default function AnalyticsDetailPage() {
  const params = useParams()
  const id = params.id as string
  
  return (
    <div>
      <h1>분석 상세: {id}</h1>
    </div>
  )
}
```

### 2.3 페이지 추가 체크리스트
- [ ] `app/` 폴더 아래 올바른 위치에 폴더 생성
- [ ] `page.tsx` 파일 생성
- [ ] 기본 레이아웃 구조 적용 (Header, Footer)
- [ ] 페이지 제목 및 메타데이터 설정
- [ ] 네비게이션에 추가 (필요한 경우)
- [ ] 라우트 경로 확인 (`/새로운-경로`)

---

## 3. 기존 페이지 수정하기

### 3.1 수정 전 확인 사항
- [ ] 어떤 페이지를 수정하는지 명확히 파악
- [ ] 수정 범위 확인 (전체 페이지 vs 특정 섹션)
- [ ] 기존 기능에 영향이 없는지 확인

### 3.2 페이지 파일 위치 찾기
```
app/
├── page.tsx              # 메인 페이지
├── dashboard/
│   └── page.tsx         # 대시보드
├── companies/
│   └── page.tsx         # 회사별 공고
├── quality/
│   └── page.tsx         # 공고 품질 평가
└── jobs/
    └── page.tsx         # 경쟁사 공고 목록
```

### 3.3 수정 시 주의사항

#### ✅ 좋은 예
```typescript
// 기존 코드 구조 유지
export default function Dashboard() {
  // 기존 상태 변수들
  const [timeframe, setTimeframe] = useState('Daily')
  
  // 새 기능 추가 (기존 코드 아래에)
  const [newFeature, setNewFeature] = useState('')
  
  // 기존 useEffect들
  useEffect(() => {
    // ...
  }, [])
  
  // 새 useEffect 추가
  useEffect(() => {
    // 새 기능 로직
  }, [newFeature])
  
  return (
    <div>
      {/* 기존 JSX */}
      {/* 새 기능 JSX 추가 */}
    </div>
  )
}
```

#### ❌ 나쁜 예
- 기존 코드를 대폭 수정
- 다른 개발자가 작성한 코드를 임의로 변경
- 불필요한 리팩토링

### 3.4 수정 체크리스트
- [ ] 수정할 파일 위치 확인
- [ ] 기존 코드 구조 파악
- [ ] 수정 범위 최소화
- [ ] 기존 기능 동작 확인
- [ ] 새 기능 테스트

---

## 4. 컴포넌트 추가하기

### 4.1 재사용 가능한 컴포넌트 추가

#### Step 1: 컴포넌트 파일 생성
```typescript
// components/NewComponent.tsx
'use client' // 상태나 이벤트 핸들러가 있는 경우

interface NewComponentProps {
  title: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export default function NewComponent({ 
  title, 
  onClick, 
  variant = 'primary' 
}: NewComponentProps) {
  return (
    <div className={`p-4 rounded-lg ${
      variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
    }`}>
      <h3 className="text-white font-semibold">{title}</h3>
      {onClick && (
        <button onClick={onClick} className="mt-2 px-4 py-2 bg-white rounded">
          클릭
        </button>
      )}
    </div>
  )
}
```

#### Step 2: 컴포넌트 사용
```typescript
// app/어떤페이지/page.tsx
import NewComponent from '@/components/NewComponent'

export default function SomePage() {
  return (
    <div>
      <NewComponent 
        title="제목" 
        variant="primary"
        onClick={() => console.log('클릭')}
      />
    </div>
  )
}
```

### 4.2 컴포넌트 추가 체크리스트
- [ ] `components/` 폴더에 파일 생성
- [ ] 컴포넌트명은 PascalCase 사용
- [ ] Props 타입 인터페이스 정의
- [ ] Tailwind CSS로 스타일링
- [ ] 필요한 경우 `'use client'` 추가

---

## 5. API 연동하기

### 5.1 API 호출 패턴

#### Step 1: 상태 변수 추가
```typescript
const [data, setData] = useState<DataType | null>(null)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

#### Step 2: API 호출 함수 작성
```typescript
const fetchData = async () => {
  try {
    setIsLoading(true)
    setError(null)
    
    const apiUrl = 'https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/endpoint'
    
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
    setData(result.data)
  } catch (err) {
    console.error('API 호출 실패:', err)
    setError(err instanceof Error ? err.message : '알 수 없는 에러')
  } finally {
    setIsLoading(false)
  }
}
```

#### Step 3: useEffect에서 호출
```typescript
useEffect(() => {
  fetchData()
}, []) // 의존성 배열에 필요한 값 추가
```

### 5.2 API 연동 체크리스트
- [ ] API 엔드포인트 URL 확인
- [ ] 요청 메서드 확인 (GET, POST, PUT, DELETE)
- [ ] 요청 파라미터 확인 (쿼리, body)
- [ ] 응답 데이터 타입 정의
- [ ] 에러 처리 구현
- [ ] 로딩 상태 관리
- [ ] CORS 설정 확인

---

## 6. 스타일링 가이드

### 6.1 Tailwind CSS 사용 규칙

#### 기본 클래스 순서
1. 레이아웃 (flex, grid, block)
2. 크기 (w-, h-, p-, m-)
3. 색상 (bg-, text-, border-)
4. 타이포그래피 (text-, font-)
5. 효과 (rounded, shadow, hover:)

```typescript
// ✅ 좋은 예
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg">
  <h2 className="text-xl font-bold text-gray-900">제목</h2>
</div>
```

### 6.2 반응형 디자인
```typescript
// 모바일 퍼스트
<div className="
  grid 
  grid-cols-1           // 모바일: 1열
  md:grid-cols-2        // 태블릿: 2열
  lg:grid-cols-3        // 데스크톱: 3열
  gap-4
">
```

### 6.3 커스텀 색상 사용
```typescript
// tailwind.config.js에 정의된 색상 사용
<div className="bg-sk-red text-white">
  SK 브랜드 색상
</div>
```

---

## 7. 작업 전 체크리스트

### 7.1 브랜치 및 환경 설정
- [ ] 최신 `main` 브랜치에서 시작
- [ ] 작업용 브랜치 생성 (`feature/` 또는 `fix/`)
- [ ] `npm install` 실행
- [ ] `npm run dev` 실행하여 정상 작동 확인

### 7.2 작업 범위 확인
- [ ] 작업할 기능/페이지 명확히 파악
- [ ] 관련 파일 위치 확인
- [ ] 기존 코드 구조 이해
- [ ] 필요한 API 엔드포인트 확인

### 7.3 설계 확인
- [ ] UI/UX 디자인 확인 (있는 경우)
- [ ] 데이터 구조 설계
- [ ] 컴포넌트 분리 계획

---

## 8. 작업 후 체크리스트

### 8.1 코드 품질
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 경고 없음 (`npm run lint`)
- [ ] 불필요한 `console.log` 제거
- [ ] 주석 처리된 코드 제거
- [ ] 변수명/함수명 명확함

### 8.2 기능 테스트
- [ ] 새로 추가한 기능 정상 작동
- [ ] 기존 기능 영향 없음
- [ ] 에러 케이스 처리 확인
- [ ] 로딩 상태 표시 확인
- [ ] 반응형 디자인 확인 (모바일/태블릿/데스크톱)

### 8.3 커밋 전 확인
- [ ] 변경된 파일만 커밋
- [ ] `.env.local`, `node_modules` 등 불필요한 파일 제외
- [ ] 의미 있는 커밋 메시지 작성

### 8.4 커밋 메시지 예시
```
feat: 분석 페이지 추가

- 통계 차트 컴포넌트 추가
- API 연동 완료
- 반응형 디자인 적용

fix: 대시보드 차트 오류 수정

- 데이터가 없을 때 에러 발생하던 문제 해결
- 기본값 처리 추가

refactor: API 호출 로직을 커스텀 훅으로 분리

- useAnalyticsData 훅 생성
- 코드 재사용성 향상
```

---

## 9. 자주 하는 작업 가이드

### 9.1 새로운 필터 추가하기

#### 예시: 대시보드에 "기술 스택" 필터 추가

```typescript
// 1. 상태 변수 추가
const [selectedTechStack, setSelectedTechStack] = useState<string[]>([])

// 2. 필터 UI 추가
<div className="flex gap-2">
  {techStacks.map(tech => (
    <button
      key={tech}
      onClick={() => toggleTechStack(tech)}
      className={`px-3 py-1 rounded ${
        selectedTechStack.includes(tech)
          ? 'bg-black text-white'
          : 'bg-gray-100'
      }`}
    >
      {tech}
    </button>
  ))}
</div>

// 3. 필터링 로직 추가
const filteredData = useMemo(() => {
  return data.filter(item => {
    if (selectedTechStack.length > 0) {
      return selectedTechStack.some(tech => 
        item.tech_stack?.includes(tech)
      )
    }
    return true
  })
}, [data, selectedTechStack])
```

### 9.2 새로운 차트 추가하기

```typescript
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <XAxis dataKey="period" />
    <YAxis />
    <Line type="monotone" dataKey="value" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

### 9.3 모달 추가하기

```typescript
const [isModalOpen, setIsModalOpen] = useState(false)

{isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">모달 제목</h2>
        <button
          onClick={() => setIsModalOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      {/* 모달 내용 */}
    </div>
  </div>
)}
```

---

## 10. 문제 해결 가이드

### 10.1 자주 발생하는 문제

#### 문제 1: 페이지가 표시되지 않음
**원인**: 파일명이나 폴더 구조 오류
**해결**:
- `app/` 폴더 아래에 올바른 경로로 폴더 생성 확인
- `page.tsx` 파일명 정확히 확인
- 브라우저 새로고침

#### 문제 2: API 호출이 안 됨
**원인**: CORS 에러 또는 URL 오류
**해결**:
- 브라우저 콘솔에서 에러 확인
- API URL 정확히 확인
- `mode: 'cors'` 설정 확인

#### 문제 3: 스타일이 적용되지 않음
**원인**: Tailwind 클래스 오타 또는 빌드 문제
**해결**:
- 클래스명 정확히 확인
- 개발 서버 재시작
- `tailwind.config.js`에 경로 추가 확인

#### 문제 4: 타입 에러 발생
**원인**: 타입 정의 누락 또는 불일치
**해결**:
- 관련 인터페이스 정의 확인
- `any` 타입 사용 최소화
- 타입 단언(`as`) 적절히 사용

---

## 11. 코드 리뷰 요청 전 확인

### 11.1 필수 확인 사항
- [ ] 코드가 정상 작동함
- [ ] 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] 불필요한 코드 제거
- [ ] 주석 추가 (복잡한 로직)
- [ ] 커밋 메시지 작성

### 11.2 PR(Pull Request) 작성 시
- 제목: 명확한 작업 내용
- 설명: 변경 사항, 테스트 방법, 스크린샷(필요한 경우)

예시:
```
## 변경 사항
- 분석 페이지 추가
- 통계 차트 컴포넌트 구현
- API 연동 완료

## 테스트 방법
1. /analytics 페이지 접속
2. 차트가 정상적으로 표시되는지 확인
3. 필터 기능 동작 확인

## 스크린샷
[스크린샷 첨부]
```

---

## 12. 협업 시 주의사항

### 12.1 코드 작성 시
- ✅ 기존 코드 스타일 유지
- ✅ 명확한 변수명/함수명 사용
- ✅ 주석 추가 (복잡한 로직)
- ❌ 다른 사람의 코드를 임의로 수정하지 않기
- ❌ 불필요한 리팩토링 하지 않기

### 12.2 커밋 시
- ✅ 작은 단위로 자주 커밋
- ✅ 의미 있는 커밋 메시지 작성
- ✅ 관련 없는 변경사항은 별도 커밋
- ❌ 큰 변경사항을 한 번에 커밋하지 않기

### 12.3 리뷰 시
- ✅ 건설적인 피드백 제공
- ✅ 코드 개선 제안
- ❌ 비판적인 톤 사용하지 않기

---

## 13. 빠른 참조

### 13.1 파일 생성 위치

| 작업 | 위치 | 예시 |
|------|------|------|
| 새 페이지 | `app/페이지명/page.tsx` | `app/analytics/page.tsx` |
| 새 컴포넌트 | `components/컴포넌트명.tsx` | `components/Chart.tsx` |
| 새 훅 | `hooks/use훅명.ts` | `hooks/useAnalytics.ts` |
| 새 유틸리티 | `lib/유틸명.ts` | `lib/formatDate.ts` |

### 13.2 자주 사용하는 패턴

#### 상태 관리
```typescript
const [state, setState] = useState<Type>(initialValue)
```

#### API 호출
```typescript
useEffect(() => {
  fetchData()
}, [dependencies])
```

#### 필터링
```typescript
const filtered = useMemo(() => {
  return data.filter(item => condition)
}, [data, condition])
```

#### 이벤트 핸들러
```typescript
const handleClick = () => {
  // 로직
}
```

---

## 14. 문의 및 도움

### 14.1 문제 발생 시
1. 브라우저 콘솔 확인
2. 터미널 에러 메시지 확인
3. 관련 문서 확인 (`README.md`, `FRONTEND_DEVELOPMENT_STANDARDS.md`)
4. 팀원에게 문의

### 14.2 유용한 명령어
```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

---

**이 가이드를 따라 작업하면 팀원들과 원활하게 협업할 수 있습니다!**


