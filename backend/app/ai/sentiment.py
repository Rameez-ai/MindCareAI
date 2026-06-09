import re
from typing import Dict, Any

# Emotion Lexicon mapping
LEXICON = {
    "anxiety": [
        "anxious", "worry", "worried", "panic", "fear", "scared", "dread", "nervous", "shaking", 
        "heart racing", "uneasy", "frightened", "paralyzed", "apprehensive", "paranoia"
    ],
    "depression": [
        "sad", "depressed", "hopeless", "crying", "empty", "worthless", "meaningless", "lonely", 
        "alone", "numb", "darkness", "grief", "heavy", "exhausted", "give up", "miserable", "despair"
    ],
    "stress": [
        "stressed", "overwhelmed", "pressure", "burnout", "can't cope", "too much", "deadline", 
        "busy", "anxious", "frustrated", "tired", "insomnia", "sleepless", "wired", "tense"
    ],
    "loneliness": [
        "lonely", "alone", "isolated", "no one", "ignored", "forgotten", "disconnected", 
        "no friends", "left out", "abandoned", "single", "solitary"
    ],
    "happiness": [
        "happy", "good", "great", "glad", "joy", "excited", "peaceful", "calm", "relaxed", 
        "wonderful", "blessed", "cheerful", "proud", "hopeful", "motivated"
    ],
    "anger": [
        "angry", "mad", "pissed", "furious", "hate", "annoyed", "irritated", "rage", "spite", 
        "resentment", "frustrated", "screaming"
    ]
}

INTENSIFIERS = [
    "very", "extremely", "so", "really", "incredibly", "terribly", "completely", "totally",
    "absolutely", "heavily", "super", "highly", "badly"
]

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyzes emotional indicators in user text and returns classifications and scores.
    """
    if not text:
        return {
            "dominant_emotion": "neutral",
            "confidence": 1.0,
            "emotion_scores": {
                "anxiety": 0.0,
                "depression": 0.0,
                "stress": 0.0,
                "loneliness": 0.0,
                "happiness": 0.0,
                "anger": 0.0,
                "neutral": 1.0
            },
            "intensity": 0.0
        }

    text_clean = text.lower().strip()
    words = re.findall(r"\b\w+\b", text_clean)
    
    # Calculate base raw hits
    scores = {
        "anxiety": 0.0,
        "depression": 0.0,
        "stress": 0.0,
        "loneliness": 0.0,
        "happiness": 0.0,
        "anger": 0.0
    }

    # Context window scanning for intensifiers
    for i, word in enumerate(words):
        multiplier = 1.0
        # Check if preceded by an intensifier
        if i > 0 and words[i - 1] in INTENSIFIERS:
            multiplier = 1.8
            
        for emotion, keywords in LEXICON.items():
            for kw in keywords:
                if " " in kw:
                    # Multi-word phrase check
                    if kw in text_clean:
                        scores[emotion] += 2.0 * multiplier
                else:
                    if word == kw:
                        scores[emotion] += 1.0 * multiplier

    # Add general intensifiers and punctuation to intensity
    intensity_score = 0.0
    # exclamation count
    intensity_score += min(text.count("!") * 0.25, 1.0)
    # capital letters ratio (shouting)
    capitals = sum(1 for c in text if c.isupper())
    if len(text) > 5 and capitals / len(text) > 0.3:
        intensity_score += 1.0
        
    for w in words:
        if w in INTENSIFIERS:
            intensity_score += 0.2

    # Normalize scores
    total_score = sum(scores.values())
    
    # Emotional intensity mapped 0 to 10
    final_intensity = min(max(round((total_score * 2.0 + intensity_score) * 1.5, 1), 1.0), 10.0) if total_score > 0 else 1.0

    if total_score == 0:
        return {
            "dominant_emotion": "neutral",
            "confidence": 0.8,
            "emotion_scores": {
                "anxiety": 0.0,
                "depression": 0.0,
                "stress": 0.0,
                "loneliness": 0.0,
                "happiness": 0.0,
                "anger": 0.0,
                "neutral": 1.0
            },
            "intensity": 1.0
        }

    # Softmax/percentage-like scaling
    normalized_scores = {}
    for k, v in scores.items():
        normalized_scores[k] = round(v / total_score, 2)
    normalized_scores["neutral"] = 0.0

    dominant = max(scores, key=scores.get)
    confidence = normalized_scores[dominant]

    # Re-scale to ensure all add up to 1.0
    return {
        "dominant_emotion": dominant,
        "confidence": confidence,
        "emotion_scores": normalized_scores,
        "intensity": final_intensity
    }
