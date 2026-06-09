import secrets
import string
from datetime import datetime

def generate_random_id(length: int = 20) -> str:
    """Generate a cryptographically secure random alphanumeric string."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def format_datetime(dt: datetime) -> str:
    """Format datetime as ISO string."""
    if not dt:
        return ""
    return dt.isoformat() + "Z"

def serialize_dt(obj):
    """Recursively convert datetime objects to ISO strings in a dict or list."""
    if isinstance(obj, dict):
        return {k: serialize_dt(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [serialize_dt(i) for i in obj]
    if isinstance(obj, datetime) or hasattr(obj, 'isoformat'):
        return obj.isoformat()
    return obj
