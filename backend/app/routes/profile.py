from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import UserResponse, ProfileUpdate
from app.database.repositories import UserRepository
from app.auth.dependencies import get_current_user
from app.utils.sanitizer import sanitize_text
from app.utils.helpers import serialize_dt
from app.utils.logger import logger
from typing import Dict, Any

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("")
def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch current user's profile information."""
    return serialize_dt(current_user)

@router.put("")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_repo: UserRepository = Depends(UserRepository)
):
    """Update current user's profile fields and preferences."""
    uid = current_user["uid"]
    update_dict = {}
    
    try:
        if profile_data.display_name is not None:
            update_dict["display_name"] = sanitize_text(profile_data.display_name)
            
        if profile_data.avatar_url is not None:
            update_dict["avatar_url"] = profile_data.avatar_url
            
        if profile_data.preferences is not None:
            # Sanitize preference text fields if any
            pref_dict = profile_data.preferences.dict()
            pref_dict["theme"] = sanitize_text(pref_dict.get("theme", "light"))
            pref_dict["language"] = sanitize_text(pref_dict.get("language", "en"))
            pref_dict["wellness_interests"] = [sanitize_text(i) for i in pref_dict.get("wellness_interests", [])]
            update_dict["preferences"] = pref_dict

        if update_dict:
            user_repo.update(uid, update_dict)
            logger.info(f"Updated profile for user: {uid}")
            # Fetch updated record
            updated_user = user_repo.get_by_id(uid)
            return serialize_dt(updated_user)
            
        return serialize_dt(current_user)
    except Exception as e:
        logger.error(f"Error updating profile for user {uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile."
        )
