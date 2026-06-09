from fastapi import APIRouter
from app.routes import auth, profile, chat, mood, analytics, crisis

api_router = APIRouter(prefix="/api/v1")

# Include Authentication Routes
api_router.include_router(auth.router)

# Include Profile Routes
api_router.include_router(profile.router)

# Include Chat Routes
api_router.include_router(chat.router)

# Include Mood Routes
api_router.include_router(mood.router)

# Include Analytics Routes
api_router.include_router(analytics.router)

# Include Crisis Safety Routes
api_router.include_router(crisis.router)
