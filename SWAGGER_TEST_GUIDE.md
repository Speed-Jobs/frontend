# Swagger UI를 이용한 API 테스트 가이드

## 📋 목차
1. [Swagger UI 접근 방법](#swagger-ui-접근-방법)
2. [API 테스트 방법](#api-테스트-방법)
3. [채용 공고 수 추이 API 테스트](#채용-공고-수-추이-api-테스트)
4. [주의사항](#주의사항)

---

## 🔗 Swagger UI 접근 방법

FastAPI는 기본적으로 Swagger UI를 제공합니다. 백엔드 서버가 실행 중일 때 다음 URL로 접근할 수 있습니다:

### Swagger UI URL (배포 서버)
```
https://speedjobs-backend.skala25a.project.skala-ai.com/docs
```

### 로컬 개발 서버 (선택사항)
```
http://172.20.10.2:8080/docs
```
또는
```
http://localhost:8080/docs
```

### ReDoc (대안 문서)
```
https://speedjobs-backend.skala25a.project.skala-ai.com/redoc
```

---

## 🧪 API 테스트 방법

### 1. Swagger UI 열기
1. 브라우저에서 `https://speedjobs-backend.skala25a.project.skala-ai.com/docs` 접속
2. Swagger UI 인터페이스가 표시됩니다

### 2. API 엔드포인트 찾기
- 왼쪽 사이드바에서 `/api/v1/dashboard/job-postings-trend` 엔드포인트를 찾습니다
- 엔드포인트를 클릭하면 상세 정보가 펼쳐집니다

### 3. 파라미터 입력
- **timeframe** 파라미터를 입력합니다:
  - `daily` (일간)
  - `weekly` (주간)
  - `monthly` (월간)

### 4. "Try it out" 버튼 클릭
- 엔드포인트 상세 화면에서 "Try it out" 버튼을 클릭합니다
- 파라미터 입력 필드가 활성화됩니다

### 5. Execute 버튼 클릭
- 파라미터를 입력한 후 "Execute" 버튼을 클릭합니다
- API 응답이 화면 하단에 표시됩니다

---

## 📊 채용 공고 수 추이 API 테스트

### 엔드포인트
```
GET /api/v1/dashboard/job-postings-trend
```

### 쿼리 파라미터
| 파라미터 | 타입 | 필수 | 설명 | 예시 |
|---------|------|------|------|------|
| timeframe | string | Yes | 기간 타입 | `daily`, `weekly`, `monthly` |

### 요청 예시
```
GET https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-postings-trend?timeframe=daily
```

### 응답 형식
```json
[
  {
    "period": "2025-11-01",
    "count": 180
  },
  {
    "period": "2025-11-02",
    "count": 195
  },
  ...
]
```

### Swagger UI에서 테스트하는 단계

1. **Swagger UI 접속**
   ```
   https://speedjobs-backend.skala25a.project.skala-ai.com/docs
   ```

2. **엔드포인트 찾기**
   - `/api/v1/dashboard/job-postings-trend` 클릭

3. **"Try it out" 클릭**

4. **파라미터 입력**
   - `timeframe` 필드에 `daily`, `weekly`, 또는 `monthly` 입력

5. **"Execute" 클릭**

6. **응답 확인**
   - **Response Code**: 200 (성공 시)
   - **Response Body**: JSON 배열 형식의 데이터 확인

---

## 🔍 응답 데이터 확인

### 성공 응답 (200)
```json
[
  {
    "period": "2025-11-01",
    "count": 180
  },
  {
    "period": "2025-11-02",
    "count": 195
  }
]
```

### 에러 응답 (400/500)
```json
{
  "detail": "에러 메시지"
}
```

---

## ⚠️ 주의사항

### 1. CORS 설정
- 프론트엔드에서 API를 호출할 때 CORS 에러가 발생할 수 있습니다
- 백엔드에서 CORS 설정이 올바르게 되어 있는지 확인하세요

### 2. 백엔드 서버 실행 확인
- 배포된 서버는 항상 실행 중입니다
- 서버 상태 확인:
  ```bash
  # 배포 서버 상태 확인
  curl https://speedjobs-backend.skala25a.project.skala-ai.com/docs
  ```

### 3. 네트워크 연결
- `https://speedjobs-backend.skala25a.project.skala-ai.com`이 접근 가능한지 확인하세요
- HTTPS 연결이 필요합니다

### 4. API Base URL
- 프론트엔드 코드에서 API 호출 시 올바른 base URL을 사용하는지 확인하세요
- 현재 설정: `https://speedjobs-backend.skala25a.project.skala-ai.com`

---

## 🛠️ 문제 해결

### Swagger UI가 열리지 않는 경우
1. 백엔드 서버가 실행 중인지 확인
2. 포트 번호가 올바른지 확인 (8080)
3. 네트워크 연결 확인

### API 호출이 실패하는 경우
1. Swagger UI에서 직접 테스트하여 백엔드 문제인지 확인
2. 브라우저 개발자 도구의 Network 탭에서 요청/응답 확인
3. CORS 설정 확인

### CORS 에러가 발생하는 경우
백엔드에서 CORS 헤더를 올바르게 설정해야 합니다. 자세한 내용은 `CORS_SETUP_GUIDE.md` 파일을 참조하세요.

**빠른 해결 방법:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 응답 데이터 형식이 다른 경우
- FastAPI 백엔드에서 응답 형식을 확인하세요
- 프론트엔드 코드의 데이터 파싱 로직을 확인하세요

---

## 📝 추가 리소스

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Swagger UI 문서](https://swagger.io/tools/swagger-ui/)
- [CORS 설정 가이드](https://fastapi.tiangolo.com/tutorial/cors/)

