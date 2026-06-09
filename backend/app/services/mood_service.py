import uuid
from datetime import datetime
from typing import Dict, List, Any
from app.database.repositories import MoodRepository
from app.models.schemas import MoodCreate

class MoodService:
    def __init__(self):
        self.mood_repo = MoodRepository()

    def log_mood(self, user_id: str, mood_data: MoodCreate) -> Dict[str, Any]:
        """Log a new manual mood entry for a user."""
        log_id = str(uuid.uuid4())
        data = {
            "log_id": log_id,
            "user_id": user_id,
            "mood": mood_data.mood.lower().strip(),
            "intensity": mood_data.intensity,
            "note": mood_data.note,
            "created_at": datetime.utcnow()
        }
        return self.mood_repo.create(log_id, data)

    def get_mood_history(self, user_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        """Fetch mood logging history for a user."""
        return self.mood_repo.get_user_moods(user_id, limit)

    def get_mood_analytics(self, user_id: str) -> Dict[str, Any]:
        """Calculate aggregated mood analytics for a user."""
        history = self.get_mood_history(user_id, limit=50)
        
        if not history:
            return {
                "mood_counts": {},
                "average_intensity": 0.0,
                "history": []
            }
            
        # Count moods and compute average intensity
        counts = {}
        total_intensity = 0
        
        for entry in history:
            m = entry.get("mood", "neutral")
            counts[m] = counts.get(m, 0) + 1
            total_intensity += entry.get("intensity", 5)
            
        avg_intensity = round(total_intensity / len(history), 2)
        
        return {
            "mood_counts": counts,
            "average_intensity": avg_intensity,
            "history": history
        }
