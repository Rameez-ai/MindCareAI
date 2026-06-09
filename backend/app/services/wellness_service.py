from typing import List, Dict, Any

WELLNESS_CATALOG = {
    "anxiety": [
        {
            "id": "box_breathing",
            "title": "Box Breathing Exercise",
            "category": "Breathing",
            "duration": "4 mins",
            "steps": [
                "Find a comfortable seated position.",
                "Inhale slowly through your nose for 4 seconds.",
                "Hold your breath for 4 seconds.",
                "Exhale completely through your mouth for 4 seconds.",
                "Hold your lungs empty for 4 seconds.",
                "Repeat this cycle 4 times."
            ],
            "description": "A simple technique used by athletes and Navy SEALs to reduce stress and calm the nervous system."
        },
        {
            "id": "five_sensory_grounding",
            "title": "5-4-3-2-1 Grounding Method",
            "category": "Mindfulness",
            "duration": "5 mins",
            "steps": [
                "Name 5 things you can SEE around you.",
                "Name 4 things you can TOUCH (e.g., your desk, clothes).",
                "Name 3 things you can HEAR (e.g., hum of a fan, traffic).",
                "Name 2 things you can SMELL (or like the smell of).",
                "Name 1 thing you can TASTE (or your current mouthfeel)."
            ],
            "description": "Helps shift your focus away from anxious thoughts and back into your physical body."
        }
    ],
    "depression": [
        {
            "id": "behavioral_activation",
            "title": "Small Step Activation",
            "category": "Activity",
            "duration": "10 mins",
            "steps": [
                "Choose one tiny task that takes under 5 minutes (e.g., wash a cup, open a window, stretch).",
                "Do it right now without thinking about the outcome.",
                "Congratulate yourself for taking action, no matter how small."
            ],
            "description": "Combats inertia and low motivation by starting with the smallest possible action."
        },
        {
            "id": "self_compassion_journaling",
            "title": "Self-Compassion Writing",
            "category": "Journaling",
            "duration": "10 mins",
            "steps": [
                "Write down a self-critical thought you had today.",
                "Rewrite it as if a warm, loving friend were speaking to you.",
                "Focus on validating your struggle rather than fixing it."
            ],
            "description": "Reduces self-blame and builds emotional resilience during low moods."
        }
    ],
    "stress": [
        {
            "id": "progressive_muscle_relaxation",
            "title": "Progressive Muscle Relaxation (PMR)",
            "category": "Relaxation",
            "duration": "8 mins",
            "steps": [
                "Tense the muscles in your feet as hard as you can for 5 seconds.",
                "Release suddenly and feel the tension flow out.",
                "Move up your body: calves, thighs, stomach, hands, shoulders, and face.",
                "Tense and release each muscle group one by one."
            ],
            "description": "Relieves physical tension built up from chronic stress."
        }
    ],
    "loneliness": [
        {
            "id": "micro_connection",
            "title": "Reach Out to One Person",
            "category": "Connection",
            "duration": "5 mins",
            "steps": [
                "Pick a friend, family member, or colleague.",
                "Send a brief text message: 'Hey, was just thinking of you, hope you are having a good day!'",
                "Focus on the act of giving connection rather than expecting a quick reply."
            ],
            "description": "Helps bridge the gap of isolation through low-pressure outreach."
        }
    ],
    "happiness": [
        {
            "id": "gratitude_listing",
            "title": "Three Good Things",
            "category": "Gratitude",
            "duration": "5 mins",
            "steps": [
                "Write down three specific things that went well today, no matter how small.",
                "Explain why they went well or how they made you feel.",
                "Take a moment to absorb the positive feelings."
            ],
            "description": "Trains your brain to notice and appreciate positive details in daily life."
        }
    ],
    "anger": [
        {
            "id": "cool_down",
            "title": "Sensory Reset",
            "category": "Physical",
            "duration": "2 mins",
            "steps": [
                "Go to the bathroom and splash cold water on your face.",
                "Hold your hands under cold running water for 30 seconds.",
                "Slowly breathe out twice as long as you breathe in."
            ],
            "description": "Uses physiological triggers to calm down the fight-or-flight response."
        }
    ],
    "neutral": [
        {
            "id": "body_scan",
            "title": "Body Scan Meditation",
            "category": "Meditation",
            "duration": "5 mins",
            "steps": [
                "Close your eyes and bring attention to your toes.",
                "Observe any sensations (cold, warm, tight, relaxed) without judging them.",
                "Slowly move your focus upward to your ankles, shins, knees, hips, chest, shoulders, and head."
            ],
            "description": "Increases mindfulness and somatic awareness."
        }
    ]
}

class WellnessService:
    def get_suggestions_by_emotion(self, emotion: str) -> List[Dict[str, Any]]:
        """Retrieve suggestions matched to a specific emotion, fallback to neutral."""
        emotion_key = emotion.lower()
        if emotion_key not in WELLNESS_CATALOG:
            emotion_key = "neutral"
        return WELLNESS_CATALOG[emotion_key]

    def get_all_suggestions(self) -> Dict[str, List[Dict[str, Any]]]:
        return WELLNESS_CATALOG
