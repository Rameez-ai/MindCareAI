from fastapi import APIRouter, Depends, HTTPException, status
from app.services.analytics_service import AnalyticsService
from app.auth.dependencies import get_current_user
from app.utils.helpers import serialize_dt
from app.utils.logger import logger
from typing import Dict, Any

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_user_analytics(
    current_user: Dict[str, Any] = Depends(get_current_user),
    analytics_svc: AnalyticsService = Depends(AnalyticsService)
):
    """Retrieve combined mood history counts and conversational sentiment trends."""
    user_id = current_user["uid"]
    try:
        data = analytics_svc.get_user_dashboard_analytics(user_id)
        return serialize_dt(data)
    except Exception as e:
        logger.error(f"Error fetching analytics for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load analytics dashboard data."
        )
