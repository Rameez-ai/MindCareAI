import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from app.config.settings import settings
from app.models.schemas import UserRegister, UserLogin, Token, UserResponse, ForgotPasswordRequest
from app.database.repositories import UserRepository
from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.utils.logger import logger
from app.utils.sanitizer import sanitize_text

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, user_repo: UserRepository = Depends(UserRepository)):
    # Sanitize inputs
    email = user_data.email.lower().strip()
    display_name = sanitize_text(user_data.display_name)
    
    # Check if user exists
    existing_user = user_repo.get_by_email(email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    # Generate unique ID
    uid = str(uuid.uuid4())
    
    # Hash password
    hashed = hash_password(user_data.password)
    
    # Create user record
    new_user = {
        "uid": uid,
        "email": email,
        "hashed_password": hashed,
        "display_name": display_name,
        "avatar_url": None,
        "preferences": {
            "theme": "light",
            "notifications_enabled": True,
            "language": "en",
            "wellness_interests": []
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    user_repo.create(uid, new_user)
    logger.info(f"Registered user: {email} with UID: {uid}")
    
    # Create JWT
    token_payload = {"uid": uid, "email": email}
    token = create_access_token(token_payload)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, user_repo: UserRepository = Depends(UserRepository)):
    email = login_data.email.lower().strip()
    
    # Fetch user
    user = user_repo.get_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password."
        )
        
    # Verify password
    if not verify_password(login_data.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password."
        )
        
    # Generate JWT
    uid = user["uid"]
    token_payload = {"uid": uid, "email": email}
    token = create_access_token(token_payload)
    
    logger.info(f"User logged in successfully: {email}")
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/logout")
def logout():
    # Client will clear the JWT token locally
    return {"detail": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, user_repo: UserRepository = Depends(UserRepository)):
    email = req.email.lower().strip()
    user = user_repo.get_by_email(email)
    
    # Security best practice: don't reveal if email exists or not
    # However, we log the reset code to backend console for easy developer testing
    if user:
        reset_token = str(uuid.uuid4())
        logger.info(f"PASSWORD RESET REQUESTED FOR {email}. Development simulation reset token: {reset_token}")
        logger.info(f"To reset, make a request with token {reset_token} (Simulated reset route is logged here).")
        
    return {
        "detail": "If the email exists, a password reset code has been sent. Please check your inbox (or backend log terminal in development)."
    }
