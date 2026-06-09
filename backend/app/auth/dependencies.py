from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.auth.jwt_handler import decode_access_token
from app.database.repositories import UserRepository
from typing import Dict, Any

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_repo: UserRepository = Depends(UserRepository)
) -> Dict[str, Any]:
    """Dependency that returns the current authenticated user or raises 401."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    uid = payload.get("uid")
    if uid is None:
        raise credentials_exception
        
    user = user_repo.get_by_id(uid)
    if user is None:
        raise credentials_exception
        
    return user
