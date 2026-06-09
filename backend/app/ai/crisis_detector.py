import re
from typing import Dict, List, Any

# Standard crisis phrases and keyword patterns
CRISIS_PATTERNS = [
    r"\b(suicid(e|al)|kill\s+myself|end\s+my\s+life|want\s+to\s+die|no\s+reason\s+to\s+live)\b",
    r"\b(self[\s-]*harm|cut\s+myself|hurt\s+myself|harm\s+myself)\b",
    r"\b(hang\s+myself|take\s+my\s+own\s+life|better\s+off\s+dead|jump\s+off\s+a\s+bridge)\b",
    r"\b(overdose\s+on\s+pills|swallow\s+pills\s+to\s+die)\b"
]

CRISIS_RESOURCES = [
    {"name": "National Suicide Prevention Lifeline", "contact": "988", "description": "Call or Text 988 (Available 24/7, English & Spanish)"},
    {"name": "Crisis Text Line", "contact": "Text HOME to 741741", "description": "Free, 24/7 crisis support via text"},
    {"name": "Emergency Services", "contact": "911", "description": "Call 911 immediately if you are in physical danger"},
    {"name": "International Crisis Hotlines", "contact": "https://findahelpline.com/", "description": "Global directory of hotlines and support services"}
]

CRISIS_RESPONSE_MESSAGE = (
    "I hear how much pain you're in, and I want you to know you don't have to carry this alone. "
    "Because your safety is my priority, I strongly encourage you to connect with a crisis counselor. "
    "They are free, confidential, and available 24/7. "
    "Please reach out to one of the resources below:"
)

def detect_crisis(text: str) -> Dict[str, Any]:
    """
    Scans text for phrases indicating crisis, self-harm, or suicidal ideation.
    Returns a dictionary indicating if a crisis was detected and relevant info.
    """
    if not text:
        return {"is_crisis": False, "trigger_words": []}

    text_clean = text.lower().strip()
    matched_words = []

    for pattern in CRISIS_PATTERNS:
        matches = re.findall(pattern, text_clean)
        if matches:
            # Flatten matched tuples if regex contains groups
            for m in matches:
                if isinstance(m, tuple):
                    matched_words.extend([x for x in m if x])
                else:
                    matched_words.append(m)

    is_crisis = len(matched_words) > 0

    return {
        "is_crisis": is_crisis,
        "trigger_words": list(set(matched_words)),
        "message": CRISIS_RESPONSE_MESSAGE if is_crisis else None,
        "resources": CRISIS_RESOURCES if is_crisis else []
    }
