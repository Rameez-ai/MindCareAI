from fastapi import APIRouter, Depends
from app.models.schemas import CrisisCheckRequest, CrisisCheckResponse
from app.services.crisis_service import CrisisService
from app.auth.dependencies import get_current_user
from app.utils.sanitizer import sanitize_text
from typing import Dict, Any

router = APIRouter(prefix="/crisis-check", tags=["Crisis Safety"])

@router.post("", response_model=CrisisCheckResponse)
def check_text_for_crisis(
    payload: CrisisCheckRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    crisis_svc: CrisisService = Depends(CrisisService)
):
    """
    Perform a safety scan on text to check if it contains self-harm,
    suicide, or distress triggers. Returns helpline info if triggered.
    """
    cleaned_text = sanitize_text(payload.text)
    # Perform check (we pass placeholder message/chat IDs since this is a manual check)
    result = crisis_svc.check_and_log_crisis(
        user_id=current_user["uid"],
        chat_id="manual_scan",
        message_id="manual_scan",
        text=cleaned_text
    )
    return result
