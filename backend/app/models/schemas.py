from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    display_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    email: Optional[str] = None
    uid: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# --- Profile / Preferences Schemas ---
class UserPreferences(BaseModel):
    theme: str = "light"
    notifications_enabled: bool = True
    language: str = "en"
    wellness_interests: List[str] = []

class UserResponse(BaseModel):
    uid: str
    email: EmailStr
    display_name: str
    avatar_url: Optional[str] = None
    preferences: UserPreferences
    created_at: datetime
    updated_at: datetime

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[UserPreferences] = None

# --- Chat Schemas ---
class MessageCreate(BaseModel):
    chat_id: str = ""  # Empty by default - backend will create new chat if needed
    content: str

class MessageResponse(BaseModel):
    message_id: str
    chat_id: str
    role: str
    content: str
    created_at: datetime
    metadata: Dict[str, Any] = {}

class ChatCreate(BaseModel):
    title: Optional[str] = None

class ChatResponse(BaseModel):
    chat_id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    status: str

class ChatResponseWithMessages(ChatResponse):
    messages: List[MessageResponse]

# --- Mood Schemas ---
class MoodCreate(BaseModel):
    mood: str  # happy, sad, anxious, stressed, calm, angry, neutral
    intensity: int = Field(..., ge=1, le=10)
    note: Optional[str] = None

class MoodResponse(BaseModel):
    log_id: str
    user_id: str
    mood: str
    intensity: int
    note: Optional[str] = None
    created_at: datetime

class MoodAnalyticsResponse(BaseModel):
    mood_counts: Dict[str, int]
    average_intensity: float
    history: List[MoodResponse]

# --- Crisis Schemas ---
class CrisisCheckRequest(BaseModel):
    text: str

class CrisisCheckResponse(BaseModel):
    is_crisis: bool
    trigger_words: List[str] = []
    message: Optional[str] = None
    resources: List[Dict[str, str]] = []
