from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.config.settings import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        # Apply secure HTTP headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

def setup_security_middleware(app: FastAPI):
    # CORS — use regex to allow wildcard subdomains for deployed frontends
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_origin_regex=r"https://.*\.(vercel\.app|hf\.space)",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # Custom Security Headers
    app.add_middleware(SecurityHeadersMiddleware)
