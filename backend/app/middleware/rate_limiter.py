import time
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.config.settings import settings
from app.utils.logger import logger

class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = None):
        super().__init__(app)
        self.rate_limit = requests_per_minute or settings.RATE_LIMIT_PER_MINUTE
        self.client_records = {}  # format: {ip: [timestamps]}

    async def dispatch(self, request: Request, call_next) -> Response:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Exclude docs, redoc, openapi endpoints from rate limiting
        path = request.url.path
        if any(ignored in path for ignored in ["/docs", "/redoc", "/openapi.json", "/favico"]):
            return await call_next(request)

        current_time = time.time()
        
        # Initialize record if new
        if client_ip not in self.client_records:
            self.client_records[client_ip] = []
            
        # Filter out timestamps older than 60 seconds
        self.client_records[client_ip] = [
            t for t in self.client_records[client_ip] if current_time - t < 60
        ]
        
        # Check if rate limit exceeded
        if len(self.client_records[client_ip]) >= self.rate_limit:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Too many requests. Please try again in a minute.",
                    "retry_after": 60 - int(current_time - self.client_records[client_ip][0])
                }
            )
            
        # Record this request
        self.client_records[client_ip].append(current_time)
        
        return await call_next(request)

def setup_rate_limiter(app):
    app.add_middleware(RateLimiterMiddleware)
