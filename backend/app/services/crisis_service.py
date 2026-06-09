import uuid
from datetime import datetime
from typing import Dict, Any, List
from app.database.repositories import CrisisRepository
from app.ai.crisis_detector import detect_crisis
from app.utils.logger import logger

class CrisisService:
    def __init__(self):
        self.crisis_repo = CrisisRepository()

    def check_and_log_crisis(
        self, 
        user_id: str, 
        chat_id: str, 
        message_id: str, 
        text: str
    ) -> Dict[str, Any]:
        """
        Run crisis detection on the text. If a crisis phrase is found,
        log an alert in the database for admin follow-up and return safety resources.
        """
        result = detect_crisis(text)
        
        if result["is_crisis"]:
            alert_id = str(uuid.uuid4())
            alert_data = {
                "alert_id": alert_id,
                "user_id": user_id,
                "chat_id": chat_id,
                "message_id": message_id,
                "trigger_phrases": result["trigger_words"],
                "severity": "critical",
                "acknowledged": False,
                "created_at": datetime.utcnow()
            }
            try:
                self.crisis_repo.create(alert_id, alert_data)
                logger.warning(f"CRISIS ALERT LOGGED: User {user_id} triggered keywords {result['trigger_words']}")
            except Exception as e:
                logger.error(f"Failed to save crisis alert to DB: {e}")
                
        return result

    def get_all_alerts(self) -> List[Dict[str, Any]]:
        return self.crisis_repo.get_unacknowledged_alerts()

    def acknowledge_alert(self, alert_id: str) -> bool:
        return self.crisis_repo.update(alert_id, {"acknowledged": True})
