import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.database.repositories import ChatRepository, MessageRepository
from app.ai.llm_client import get_llm_client
from app.ai.sentiment import analyze_sentiment
from app.ai.prompts import MINDCARE_SYSTEM_PROMPT, EMPATHY_RESPONSE_TEMPLATE
from app.ai.rag_pipeline import retrieve_context
from app.services.crisis_service import CrisisService
from app.utils.logger import logger

class ChatService:
    def __init__(self):
        self.chat_repo = ChatRepository()
        self.msg_repo = MessageRepository()
        self.crisis_svc = CrisisService()
        self.llm = get_llm_client()

    def get_or_create_chat(self, user_id: str, chat_id: Optional[str] = None, title: Optional[str] = None) -> Dict[str, Any]:
        """Fetch an existing chat or create a new one."""
        if chat_id:
            chat = self.chat_repo.get_by_id(chat_id)
            if chat and chat.get("user_id") == user_id:
                return chat

        new_id = chat_id or str(uuid.uuid4())
        chat_data = {
            "chat_id": new_id,
            "user_id": user_id,
            "title": title or "New Conversation",
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        self.chat_repo.create(new_id, chat_data)
        logger.info(f"Created new chat session: {new_id} for user {user_id}")
        return chat_data

    def create_chat(self, user_id: str, title: Optional[str] = None) -> Dict[str, Any]:
        """Create a new chat session."""
        return self.get_or_create_chat(user_id, chat_id=None, title=title)

    def get_user_chats(self, user_id: str) -> List[Dict[str, Any]]:
        """List all chats for a user."""
        return self.chat_repo.get_user_chats(user_id)

    def get_chat_history(self, chat_id: str) -> List[Dict[str, Any]]:
        """Fetch all messages for a specific chat."""
        return self.msg_repo.get_chat_messages(chat_id)

    def delete_chat(self, chat_id: str) -> bool:
        """Delete a chat session."""
        return self.chat_repo.delete(chat_id)

    async def send_message(self, user_id: str, chat_id: str, content: str) -> Dict[str, Any]:
        """
        Processes a user message: checks for crisis, analyzes sentiment, 
        queries RAG, invokes LLM, logs to DB, and returns AI response.
        """
        # Ensure chat exists and get the correct chat_id
        chat = self.get_or_create_chat(user_id, chat_id)
        chat_id = chat["chat_id"]  # Use the actual chat_id from the chat object
        
        # 1. Create message IDs
        user_msg_id = str(uuid.uuid4())
        assistant_msg_id = str(uuid.uuid4())
        
        # 2. Check for Crisis
        crisis_result = self.crisis_svc.check_and_log_crisis(user_id, chat_id, user_msg_id, content)
        
        # 3. Analyze Sentiment
        sentiment_result = analyze_sentiment(content)
        
        # Save user message to database
        self.msg_repo.create_message(
            message_id=user_msg_id,
            chat_id=chat_id,
            role="user",
            content=content,
            metadata={
                "sentiment": sentiment_result["dominant_emotion"],
                "sentiment_confidence": sentiment_result["confidence"],
                "emotion_scores": sentiment_result["emotion_scores"],
                "intensity": sentiment_result["intensity"],
                "is_crisis": crisis_result["is_crisis"]
            }
        )
        
        # If crisis was detected, bypass LLM and return the canned warning immediately
        if crisis_result["is_crisis"]:
            response_content = crisis_result["message"]
            response_metadata = {
                "is_crisis": True,
                "resources": crisis_result["resources"],
                "sentiment": "neutral"
            }
            
            self.msg_repo.create_message(
                message_id=assistant_msg_id,
                chat_id=chat_id,
                role="assistant",
                content=response_content,
                metadata=response_metadata
            )
            
            # Update chat title/time
            self.chat_repo.update(chat_id, {"updated_at": datetime.utcnow()})
            
            return {
                "message_id": assistant_msg_id,
                "chat_id": chat_id,
                "role": "assistant",
                "content": response_content,
                "created_at": datetime.utcnow(),
                "metadata": response_metadata
            }

        # 4. If normal message, fetch history for RAG and LLM context window
        history_msgs = self.msg_repo.get_chat_messages(chat_id)
        # Keep only the last 8 messages to stay within token boundaries safely
        recent_history = history_msgs[-8:] if len(history_msgs) > 8 else history_msgs
        
        # Format history as text for prompt
        history_str = ""
        for m in recent_history:
            role = "User" if m["role"] == "user" else "MindCareAI"
            history_str += f"{role}: {m['content']}\n"
            
        # 5. Query RAG context
        rag_context = retrieve_context(content)
        
        # 6. Build the message array for LangChain
        messages = [
            SystemMessage(content=MINDCARE_SYSTEM_PROMPT),
        ]
        
        # Build prompt using context and current message template
        prompt_content = EMPATHY_RESPONSE_TEMPLATE.format(
            sentiment=sentiment_result["dominant_emotion"],
            sentiment_score=sentiment_result["confidence"],
            rag_context=rag_context,
            history=history_str,
            user_message=content
        )
        messages.append(HumanMessage(content=prompt_content))

        # 7. Generate response
        try:
            logger.info(f"Generating LLM response for chat: {chat_id}")
            response = await self.llm.ainvoke(messages)
            response_content = response.content
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            response_content = (
                "I'm here for you, but I'm having a little trouble connecting right now. "
                "Can you please try saying that again? I'm listening."
            )

        # 8. Save assistant response to DB
        assistant_metadata = {
            "sentiment": "neutral",
            "context_retrieved": True
        }
        
        self.msg_repo.create_message(
            message_id=assistant_msg_id,
            chat_id=chat_id,
            role="assistant",
            content=response_content,
            metadata=assistant_metadata
        )
        
        # 9. Update chat's title if it's the first exchange
        chat_updates = {"updated_at": datetime.utcnow()}
        if chat.get("title") == "New Conversation" or not chat.get("title"):
            # Use a brief summary or first few words as title
            summary_title = content[:25] + "..." if len(content) > 25 else content
            chat_updates["title"] = summary_title
            
        self.chat_repo.update(chat_id, chat_updates)

        return {
            "message_id": assistant_msg_id,
            "chat_id": chat_id,
            "role": "assistant",
            "content": response_content,
            "created_at": datetime.utcnow(),
            "metadata": assistant_metadata
        }
