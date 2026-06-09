import html
import re

def sanitize_text(text: str) -> str:
    """Sanitize string input by escaping HTML tags and stripping potentially dangerous control chars."""
    if not text:
        return ""
    # Strip null bytes
    text = text.replace("\x00", "")
    # Escape HTML characters to prevent XSS
    sanitized = html.escape(text)
    # Remove control characters except tab, newline, carriage return
    sanitized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', sanitized)
    return sanitized.strip()

def sanitize_dict(data: dict) -> dict:
    """Recursively sanitize string values in a dictionary."""
    sanitized = {}
    for k, v in data.items():
        if isinstance(v, str):
            sanitized[k] = sanitize_text(v)
        elif isinstance(v, dict):
            sanitized[k] = sanitize_dict(v)
        elif isinstance(v, list):
            sanitized[k] = [sanitize_text(i) if isinstance(i, str) else (sanitize_dict(i) if isinstance(i, dict) else i) for i in v]
        else:
            sanitized[k] = v
    return sanitized
