# CORS 설정 가이드

## 📋 개요

프론트엔드에서 백엔드 API를 호출할 때 CORS(Cross-Origin Resource Sharing) 에러가 발생할 수 있습니다. 백엔드에서 올바른 CORS 헤더를 설정해야 합니다.

---

## 🔧 FastAPI CORS 설정

### 기본 설정

FastAPI에서 CORS를 설정하려면 `CORSMiddleware`를 사용합니다:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js 개발 서버
        "https://speedjobs-frontend.skala25a.project.skala-ai.com",  # 배포된 프론트엔드
        "http://172.20.10.2:3000",  # 로컬 네트워크
    ],
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)
```

### 상세 설정 예시

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # 개발 환경
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://172.20.10.2:3000",
        
        # 프로덕션 환경
        "https://speedjobs-frontend.skala25a.project.skala-ai.com",
    ],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
        "PATCH",
    ],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    expose_headers=[
        "Content-Length",
        "Content-Type",
    ],
    max_age=3600,  # preflight 요청 캐시 시간 (초)
)
```

---

## 📝 필요한 CORS 헤더

백엔드에서 다음 헤더들을 설정해야 합니다:

### 1. Access-Control-Allow-Origin
어떤 오리진에서 요청을 허용할지 지정합니다.

```
Access-Control-Allow-Origin: https://speedjobs-frontend.skala25a.project.skala-ai.com
```

또는 모든 오리진 허용 (개발 환경에서만 사용):

```
Access-Control-Allow-Origin: *
```

### 2. Access-Control-Allow-Methods
어떤 HTTP 메서드를 허용할지 지정합니다.

```
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 3. Access-Control-Allow-Headers
어떤 헤더를 허용할지 지정합니다.

```
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Origin, X-Requested-With
```

### 4. Access-Control-Allow-Credentials
쿠키나 인증 정보를 포함한 요청을 허용할지 지정합니다.

```
Access-Control-Allow-Credentials: true
```

### 5. Access-Control-Max-Age
preflight 요청의 캐시 시간을 지정합니다.

```
Access-Control-Max-Age: 3600
```

---

## 🔍 Preflight 요청 처리

브라우저는 복잡한 요청 전에 OPTIONS 메서드로 preflight 요청을 보냅니다. 백엔드에서 이를 처리해야 합니다:

### FastAPI 자동 처리

FastAPI의 `CORSMiddleware`는 자동으로 OPTIONS 요청을 처리합니다. 별도로 처리할 필요가 없습니다.

### 수동 처리 예시 (필요한 경우)

```python
from fastapi import FastAPI, Request
from fastapi.responses import Response

app = FastAPI()

@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """OPTIONS 요청 처리"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "3600",
        }
    )
```

---

## 🛠️ 환경별 설정

### 개발 환경

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 환경 변수에 따라 다른 설정 적용
if os.getenv("ENVIRONMENT") == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 개발 환경에서는 모든 오리진 허용
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # 프로덕션 환경
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://speedjobs-frontend.skala25a.project.skala-ai.com",
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type", "Authorization"],
    )
```

---

## ✅ 확인 방법

### 1. 브라우저 개발자 도구 확인

1. 브라우저에서 F12를 눌러 개발자 도구 열기
2. Network 탭 선택
3. API 요청 클릭
4. Response Headers에서 CORS 관련 헤더 확인:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

### 2. curl로 테스트

```bash
# OPTIONS 요청 테스트 (preflight)
curl -X OPTIONS \
  -H "Origin: https://speedjobs-frontend.skala25a.project.skala-ai.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-postings-trend

# 실제 GET 요청 테스트
curl -X GET \
  -H "Origin: https://speedjobs-frontend.skala25a.project.skala-ai.com" \
  -v \
  https://speedjobs-backend.skala25a.project.skala-ai.com/api/v1/dashboard/job-postings-trend?timeframe=daily
```

---

## 🐛 일반적인 CORS 에러 및 해결 방법

### 에러 1: "No 'Access-Control-Allow-Origin' header"
**원인**: 백엔드에서 `Access-Control-Allow-Origin` 헤더를 설정하지 않음

**해결**: `CORSMiddleware`에 `allow_origins` 설정 추가

### 에러 2: "Credentials flag is 'true', but 'Access-Control-Allow-Credentials' header is ''"
**원인**: `credentials: 'include'`를 사용했지만 백엔드에서 `allow_credentials=True`를 설정하지 않음

**해결**: `CORSMiddleware`에 `allow_credentials=True` 추가

### 에러 3: "Method PUT is not allowed by Access-Control-Allow-Methods"
**원인**: 백엔드에서 해당 HTTP 메서드를 허용하지 않음

**해결**: `allow_methods`에 필요한 메서드 추가

### 에러 4: "Request header field authorization is not allowed"
**원인**: 백엔드에서 해당 헤더를 허용하지 않음

**해결**: `allow_headers`에 필요한 헤더 추가

---

## 📚 참고 자료

- [FastAPI CORS 공식 문서](https://fastapi.tiangolo.com/tutorial/cors/)
- [MDN CORS 가이드](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CORS 에러 해결 가이드](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors)

---

## 🔐 보안 고려사항

### 프로덕션 환경

1. **특정 오리진만 허용**
   ```python
   allow_origins=[
       "https://speedjobs-frontend.skala25a.project.skala-ai.com",
   ]
   ```

2. **와일드카드 사용 금지**
   - `allow_origins=["*"]`는 프로덕션에서 사용하지 마세요
   - 보안 위험이 있습니다

3. **필요한 메서드만 허용**
   ```python
   allow_methods=["GET", "POST"],  # 필요한 메서드만
   ```

4. **필요한 헤더만 허용**
   ```python
   allow_headers=["Content-Type", "Authorization"],  # 필요한 헤더만
   ```

---

## 📞 문제 해결

CORS 에러가 계속 발생하는 경우:

1. 브라우저 개발자 도구의 Network 탭에서 요청/응답 헤더 확인
2. 백엔드 로그에서 OPTIONS 요청이 제대로 처리되는지 확인
3. 백엔드 코드에서 `CORSMiddleware`가 올바르게 설정되었는지 확인
4. 프론트엔드에서 요청하는 URL이 `allow_origins`에 포함되어 있는지 확인

