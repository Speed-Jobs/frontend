# 회사 로고 이미지

이 폴더에는 각 회사의 로고 이미지를 저장합니다.

## 파일명 규칙

- 파일명은 소문자와 하이픈(-)을 사용합니다.
- 예: `sk-ax.png`, `samsung-sds.png`, `lg-cns.png`
- 확장자는 `.png`를 사용합니다.

## 현재 지원하는 회사

### 우리 회사 (SK AX)
- `sk-ax.png` - SK AX 로고 (필수)

### 대기업 IT/전자
- `samsung-sds.png` - 삼성SDS
- `samsung-electronics.png` - 삼성전자
- `lg-cns.png` - LGCNS
- `lg-electronics.png` - LG전자
- `hyundai-autoever.png` - 현대 오토에버
- `hyundai-motor.png` - 현대자동차
- `hanwha-system.png` - 한화 시스템
- `kt.png` - KT

### 인터넷/IT 기업
- `naver.png` - 네이버
- `kakao.png` - 카카오
- `line.png` - 라인
- `coupang.png` - 쿠팡
- `baemin.png` - 배민 (우아한형제들)
- `toss.png` - 토스
- `daangn.png` - 당근마켓

### 기타
- `kpmg.png` - KPMG
- `service-logo.png` - 서비스 로고 (공통)

## 회사명 매핑 규칙

`CompanyLogo` 컴포넌트는 다음 회사명 변형을 자동으로 인식합니다:

### SK AX
- `SK AX`
- `SK주식회사 C&C`
- `SK 주식회사 C&C`
- `SK C&C`
- `SK주식회사C&C`

### 삼성
- `삼성SDS` → `samsung-sds.png`
- `SAMSUNG` → `samsung-sds.png`
- `삼성전자` → `samsung-electronics.png`
- `삼성` → `samsung-electronics.png`

### LG
- `LGCNS` → `lg-cns.png`
- `LG` → `lg-cns.png`
- `LG전자` → `lg-electronics.png`

### 현대
- `현대 오토에버` → `hyundai-autoever.png`
- `HYUNDAI` → `hyundai-autoever.png`
- `현대자동차` → `hyundai-motor.png`

### 기타 회사
- `한화 시스템` → `hanwha-system.png`
- `KT` → `kt.png`
- `네이버` / `NAVER` → `naver.png`
- `카카오` / `kakao` → `kakao.png`
- `라인` / `LINE` → `line.png`
- `쿠팡` → `coupang.png`
- `배민` → `baemin.png`
- `토스` → `toss.png`
- `KPMG` → `kpmg.png`
- `당근` / `당근마켓` / `Daangn` → `daangn.png`

## 이미지 형식 및 규격

### 권장 사양
- **형식**: PNG (투명 배경 권장) 또는 SVG
- **크기**: 최소 200x200px 이상 권장
- **비율**: 1:1 (정사각형) 권장
- **배경**: 투명 배경 권장
- **해상도**: 72dpi 이상

### 파일 크기
- 각 이미지 파일은 500KB 이하 권장
- 최적화된 이미지 사용 권장

## 사용 방법

### 1. 로고 이미지 추가
1. 로고 이미지 파일을 `public/logos/` 폴더에 추가합니다.
2. 파일명은 위의 규칙에 따라 지정합니다.
3. `CompanyLogo` 컴포넌트가 자동으로 로고를 표시합니다.

### 2. 컴포넌트 사용 예시

```tsx
import CompanyLogo from '@/components/CompanyLogo'

// 기본 사용
<CompanyLogo name="SK AX" />

// 커스텀 클래스 적용
<CompanyLogo name="네이버" className="w-16 h-16" />
```

### 3. 폴백 처리

`CompanyLogo` 컴포넌트는 다음 순서로 이미지를 로드합니다:

1. **로컬 이미지** (`/logos/{회사명}.png`)
2. **외부 폴백 URL** (일부 회사에 대해 설정됨)
3. **텍스트 표시** (이미지가 없을 경우 회사명 표시)

## 데이터 소스

현재 프로젝트에서 사용되는 공고 데이터:

- **우리 회사 공고**: `data/skaxJobPostings.json` (SK AX)
- **경쟁사 공고**: `data/jobPostings.json` (다양한 회사)

## 로고 추가 가이드

### 새로운 회사 로고 추가 시

1. **이미지 파일 준비**
   - 회사 공식 로고 이미지 다운로드
   - 투명 배경 PNG로 변환 (필요시)
   - 적절한 크기로 리사이즈

2. **파일명 지정**
   - 소문자와 하이픈 사용
   - 예: `새로운회사` → `saeleoun-hoesa.png`

3. **CompanyLogo 컴포넌트 업데이트**
   - `components/CompanyLogo.tsx`의 `companyNameMap`에 매핑 추가
   - 필요시 `fallbackUrls`에 외부 URL 추가

4. **테스트**
   - 실제 데이터에서 해당 회사명이 올바르게 표시되는지 확인

## 주의사항

- 로고 이미지는 각 회사의 저작권을 존중해야 합니다.
- 상업적 사용 시 적절한 라이선스를 확인하세요.
- 로고 이미지는 공개적으로 사용 가능한 버전을 사용하세요.

## 업데이트 이력

- **2024년**: 초기 로고 파일 추가
- 최신 업데이트: 프로젝트 최신 상태 반영
