from typing import Dict, Any, List
from app.services.mood_service import MoodService
from app.database.repositories import ChatRepository, MessageRepository

class AnalyticsService:
    def __init__(self):
        self.mood_svc = MoodService()
        self.chat_repo = ChatRepository()
        self.msg_repo = MessageRepository()

    def get_user_dashboard_analytics(self, user_id: str) -> Dict[str, Any]:
        """
        Gathers aggregated statistics on user mood logs and chat sentiment trends.
        """
        # 1. Get manual mood analytics
        mood_analytics = self.mood_svc.get_mood_analytics(user_id)
        
        # 2. Compile message sentiment distribution
        sentiment_counts = {
            "anxiety": 0,
            "depression": 0,
            "stress": 0,
            "loneliness": 0,
            "happiness": 0,
            "anger": 0,
            "neutral": 0
        }
        
        total_intensity_sum = 0
        total_intensity_count = 0
        
        chats = self.chat_repo.get_user_chats(user_id)
        for chat in chats:
            chat_id = chat.get("chat_id")
            messages = self.msg_repo.get_chat_messages(chat_id)
            
            for msg in messages:
                # Only analyze user sentiments
                if msg.get("role") == "user":
                    meta = msg.get("metadata", {})
                    sentiment = meta.get("sentiment")
                    if sentiment in sentiment_counts:
                        sentiment_counts[sentiment] += 1
                        
                    intensity = meta.get("intensity")
                    if intensity is not None:
                        total_intensity_sum += intensity
                        total_intensity_count += 1

        avg_conversational_intensity = 0.0
        if total_intensity_count > 0:
            avg_conversational_intensity = round(total_intensity_sum / total_intensity_count, 2)

        return {
            "mood_analytics": mood_analytics,
            "sentiment_analytics": {
                "sentiment_counts": sentiment_counts,
                "average_chat_intensity": avg_conversational_intensity,
                "total_messages_analyzed": total_intensity_count
            }
        }
