from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import MoodCreate, MoodResponse
from app.services.mood_service import MoodService
from app.auth.dependencies import get_current_user
from app.utils.sanitizer import sanitize_text
from app.utils.helpers import serialize_dt
from app.utils.logger import logger
from typing import List, Dict, Any

router = APIRouter(prefix="/mood", tags=["Mood Tracking"])

@router.post("/add")
def log_user_mood(
    payload: MoodCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    mood_svc: MoodService = Depends(MoodService)
):
    """Log a manual daily mood check-in with intensity (1-10) and optional notes."""
    user_id = current_user["uid"]
    payload.mood = sanitize_text(payload.mood)
    if payload.note:
        payload.note = sanitize_text(payload.note)
        
    try:
        response = mood_svc.log_mood(user_id, payload)
        return serialize_dt(response)
    except Exception as e:
        logger.error(f"Error logging mood for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log mood."
        )

@router.get("/history")
def get_mood_history(
    limit: int = 30,
    current_user: Dict[str, Any] = Depends(get_current_user),
    mood_svc: MoodService = Depends(MoodService)
):
    """Retrieve the recent manual mood log history for the current user."""
    user_id = current_user["uid"]
    try:
        history = mood_svc.get_mood_history(user_id, limit)
        return serialize_dt(history)
    except Exception as e:
        logger.error(f"Error fetching mood history for user {user_id}: {e}")
        return []
