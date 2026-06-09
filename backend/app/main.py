from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from app.config.settings import settings
from app.middleware.security import setup_security_middleware
from app.middleware.rate_limiter import setup_rate_limiter
from app.middleware.error_handler import setup_error_handler
from app.api.router import api_router
from app.utils.logger import logger
from app.database.firebase_client import is_mock

app = FastAPI(
    title=settings.APP_NAME,
    description="MindCareAI - Production-Quality Mental Health Support Chatbot Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up middlewares
setup_security_middleware(app)
setup_rate_limiter(app)
setup_error_handler(app)

# Include central router
app.include_router(api_router)

@app.on_event("startup")
def startup_event():
    logger.info("==================================================")
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENV} mode")
    logger.info(f"Host: {settings.HOST} | Port: {settings.PORT}")
    logger.info(f"Database Mode: {'Mock Storage (No credentials)' if is_mock else 'Firebase Cloud Firestore'}")
    logger.info("==================================================")

@app.get("/", include_in_schema=False)
def root():
    """Redirect root to API docs (also satisfies HF Spaces health probe)."""
    return RedirectResponse(url="/docs")

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.ENV,
        "database_mock": is_mock
    }
