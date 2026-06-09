from datetime import datetime
from typing import Dict, List, Optional, Any
from app.database.firebase_client import get_db

def _safe_sort_key(doc: Dict[str, Any], field: str) -> float:
    val = doc.get(field)
    if val is None:
        return 0.0
    if hasattr(val, "timestamp"):
        try:
            return val.timestamp()
        except Exception:
            pass
    if isinstance(val, (int, float)):
        return float(val)
    return 0.0


def _normalize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert Firestore DatetimeWithNanoseconds to standard datetime objects
    and ensure all expected fields exist with safe defaults."""
    if not doc:
        return doc
    normalized = dict(doc)
    for key, value in normalized.items():
        if hasattr(value, 'isoformat') and not isinstance(value, datetime):
            # Firestore DatetimeWithNanoseconds -> standard datetime
            try:
                normalized[key] = datetime.fromisoformat(value.isoformat())
            except Exception:
                normalized[key] = datetime.utcnow()
        elif isinstance(value, dict):
            normalized[key] = _normalize_doc(value)
    return normalized


class BaseRepository:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self.db = get_db()

    def _get_collection(self):
        return self.db.collection(self.collection_name)

    def get_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        doc = self._get_collection().document(doc_id).get()
        return _normalize_doc(doc.to_dict()) if doc.exists else None

    def create(self, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data["created_at"] = data.get("created_at", datetime.utcnow())
        data["updated_at"] = datetime.utcnow()
        self._get_collection().document(doc_id).set(data)
        return data

    def update(self, doc_id: str, data: Dict[str, Any]) -> bool:
        data["updated_at"] = datetime.utcnow()
        self._get_collection().document(doc_id).update(data)
        return True

    def delete(self, doc_id: str) -> bool:
        self._get_collection().document(doc_id).delete()
        return True


class UserRepository(BaseRepository):
    def __init__(self):
        super().__init__("users")

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        docs = self._get_collection().where("email", "==", email).limit(1).get()
        return _normalize_doc(docs[0].to_dict()) if docs else None


class ChatRepository(BaseRepository):
    def __init__(self):
        super().__init__("chats")

    def get_user_chats(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            docs = self._get_collection().where("user_id", "==", user_id).get()
            results = [_normalize_doc(doc.to_dict()) for doc in docs]
        except Exception:
            # If Firestore query fails (e.g. missing index), return empty list
            results = []
        # Sort in memory to bypass the requirement for composite Firestore indexes
        results.sort(key=lambda x: _safe_sort_key(x, "updated_at"), reverse=True)
        return results


class MessageRepository(BaseRepository):
    def __init__(self):
        super().__init__("messages")

    def get_chat_messages(self, chat_id: str) -> List[Dict[str, Any]]:
        try:
            docs = self._get_collection().where("chat_id", "==", chat_id).get()
            results = [_normalize_doc(doc.to_dict()) for doc in docs]
        except Exception:
            results = []
        # Sort in memory to bypass the requirement for composite Firestore indexes
        results.sort(key=lambda x: _safe_sort_key(x, "created_at"))
        return results

    def create_message(self, message_id: str, chat_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        data = {
            "message_id": message_id,
            "chat_id": chat_id,
            "role": role,
            "content": content,
            "created_at": datetime.utcnow(),
            "metadata": metadata or {}
        }
        return self.create(message_id, data)


class MoodRepository(BaseRepository):
    def __init__(self):
        super().__init__("mood_logs")

    def get_user_moods(self, user_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        try:
            docs = self._get_collection().where("user_id", "==", user_id).get()
            results = [_normalize_doc(doc.to_dict()) for doc in docs]
        except Exception:
            results = []
        # Sort in memory to bypass the requirement for composite Firestore indexes
        results.sort(key=lambda x: _safe_sort_key(x, "created_at"), reverse=True)
        return results[:limit]


class CrisisRepository(BaseRepository):
    def __init__(self):
        super().__init__("emergency_alerts")

    def get_unacknowledged_alerts(self) -> List[Dict[str, Any]]:
        try:
            docs = self._get_collection().where("acknowledged", "==", False).get()
            return [_normalize_doc(doc.to_dict()) for doc in docs]
        except Exception:
            return []
