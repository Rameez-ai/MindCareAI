from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import MessageCreate, MessageResponse, ChatResponse, ChatResponseWithMessages
from app.services.chat_service import ChatService
from app.auth.dependencies import get_current_user
from app.utils.sanitizer import sanitize_text
from app.utils.logger import logger
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["Chat"])

def _serialize_dt(obj):
    """Recursively convert datetime objects to ISO strings in a dict."""
    if isinstance(obj, dict):
        return {k: _serialize_dt(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize_dt(i) for i in obj]
    if isinstance(obj, datetime) or hasattr(obj, 'isoformat'):
        return obj.isoformat()
    return obj

@router.post("")
async def send_message(
    payload: MessageCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    chat_svc: ChatService = Depends(ChatService)
):
    """Send a message to the AI chatbot and receive an empathetic response."""
    user_id = current_user["uid"]
    chat_id = payload.chat_id.strip() if payload.chat_id else None
    content = sanitize_text(payload.content)
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )
    
    try:
        if not chat_id:
            chat = chat_svc.create_chat(user_id)
            chat_id = chat["chat_id"]
        
        response = await chat_svc.send_message(user_id, chat_id, content)
        return _serialize_dt(response)
    except Exception as e:
        logger.error(f"Error in send_message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process your message. Please try again."
        )

@router.get("/history")
def get_chats(
    current_user: Dict[str, Any] = Depends(get_current_user),
    chat_svc: ChatService = Depends(ChatService)
):
    """Retrieve all active chat sessions for the current user."""
    user_id = current_user["uid"]
    try:
        chats = chat_svc.get_user_chats(user_id)
        return [_serialize_dt(c) for c in chats]
    except Exception as e:
        logger.error(f"Error loading chat history: {e}")
        return []

@router.get("/{chat_id}")
def get_chat_details(
    chat_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    chat_svc: ChatService = Depends(ChatService)
):
    """Fetch details and full conversation history for a specific chat session."""
    user_id = current_user["uid"]
    try:
        chat = chat_svc.get_or_create_chat(user_id, chat_id)
        
        if chat.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this chat session."
            )
            
        messages = chat_svc.get_chat_history(chat_id)
        chat_details = dict(chat)
        chat_details["messages"] = messages
        return _serialize_dt(chat_details)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading chat details: {e}")
        return {"chat_id": chat_id, "user_id": user_id, "title": "Conversation", "messages": [], "created_at": datetime.utcnow().isoformat(), "updated_at": datetime.utcnow().isoformat(), "status": "active"}

@router.delete("/{chat_id}")
def delete_chat_session(
    chat_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    chat_svc: ChatService = Depends(ChatService)
):
    """Delete a chat session and its history."""
    user_id = current_user["uid"]
    try:
        chat = chat_svc.get_or_create_chat(user_id, chat_id)
        
        if chat.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this chat session."
            )
            
        chat_svc.delete_chat(chat_id)
        return {"detail": "Chat session deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat {chat_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete chat session."
        )

