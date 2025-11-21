# 백엔드 CORS 설정 개선 가이드

## 현재 설정 확인

현재 백엔드 코드에서 CORS가 이미 설정되어 있습니다:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## ⚠️ 보안 개선 권장사항

프로덕션 환경에서는 `allow_origins=["*"]`를 사용하는 것이 보안상 위험할 수 있습니다. 특정 오리진만 허용하도록 수정하는 것을 권장합니다.

### 개선된 코드

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Speedjobs Backend API",
    description="채용공고 평가 및 분석 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 환경에 따라 다른 CORS 설정
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

if ENVIRONMENT == "development":
    # 개발 환경: 모든 오리진 허용
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # 프로덕션 환경: 특정 오리진만 허용
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://speedjobs-frontend.skala25a.project.skala-ai.com",
            "http://localhost:3000",  # 로컬 개발용
            "http://127.0.0.1:3000",  # 로컬 개발용
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "X-Requested-With",
        ],
    )
```

## 현재 설정으로도 작동합니다

현재 설정(`allow_origins=["*"]`)으로도 프론트엔드에서 API 호출이 가능합니다. CORS 에러가 발생하지 않는다면 현재 설정을 유지해도 됩니다.

## CORS 에러가 발생하는 경우

만약 CORS 에러가 발생한다면:

1. **미들웨어 순서 확인**: `app.add_middleware()`가 라우터 등록 전에 호출되는지 확인
2. **헤더 확인**: 브라우저 개발자 도구에서 응답 헤더 확인
3. **OPTIONS 요청 처리**: FastAPI는 자동으로 처리하지만, 수동으로 처리하는 경우 확인

## 추가 확인 사항

현재 코드에서 CORS 미들웨어가 라우터 등록 전에 설정되어 있으므로 올바르게 작동할 것입니다:

```python
# ✅ 올바른 순서
app.add_middleware(CORSMiddleware, ...)  # 먼저 설정
app.include_router(...)  # 그 다음 라우터 등록
```

## 테스트 방법

브라우저 개발자 도구(F12) → Network 탭에서:
1. API 요청 클릭
2. Response Headers 확인:
   - `Access-Control-Allow-Origin: *` (또는 특정 오리진)
   - `Access-Control-Allow-Methods: *`
   - `Access-Control-Allow-Headers: *`

이 헤더들이 있으면 CORS가 올바르게 설정된 것입니다.

