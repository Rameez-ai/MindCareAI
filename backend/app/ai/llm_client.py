import os
from typing import Any
from app.config.settings import settings
from app.utils.logger import logger

class MockGeminiFlash:
    """Mock LLM response generator for offline development."""
    def __init__(self):
        logger.info("Using Mock Gemini Flash LLM (No API key found or set to mock).")

    def invoke(self, messages) -> Any:
        # Simple response selection based on message content
        # Find the last user message
        user_msg = ""
        for m in reversed(messages):
            if getattr(m, "type", "") == "human" or (isinstance(m, tuple) and m[0] == "human"):
                user_msg = m[1] if isinstance(m, tuple) else m.content
                break
        
        user_clean = user_msg.lower()
        
        # Simple simulated therapeutic logic
        if "anxious" in user_clean or "panic" in user_clean or "worry" in user_clean:
            content = (
                "It makes complete sense that you're feeling anxious right now. Anxiety is a heavy, "
                "overwhelming sensation, but remember that it is a wave that will pass. "
                "Let's take a slow breath together: inhale for 4 seconds, hold for 4, and exhale for 6. "
                "What is one small thing in the room you can focus your eyes on right now?"
            )
        elif "sad" in user_clean or "depressed" in user_clean or "lonely" in user_clean:
            content = (
                "I'm really sorry to hear that you're feeling this way. It sounds like you're carrying a lot "
                "of sadness or isolation right now, and that can feel incredibly heavy. "
                "Please remember that your feelings are valid, and it's okay to not be okay. "
                "I'm here to listen. Would you like to write more about what's on your mind, or would "
                "you prefer to explore a gentle grounding exercise?"
            )
        elif "stress" in user_clean or "overwhelm" in user_clean or "burnout" in user_clean:
            content = (
                "It sounds like you are under an immense amount of pressure, and I want to acknowledge how "
                "exhausting that must be. When we are overwhelmed, our brains tend to look at everything all at once. "
                "Can we try to break it down? What is just *one* small task we can focus on, or is there a way "
                "we can step away and give yourself 5 minutes of rest right now?"
            )
        elif "happy" in user_clean or "good" in user_clean or "excited" in user_clean:
            content = (
                "That is wonderful! I'm so glad to hear that you're feeling good today. Sharing and celebrating "
                "positive moments is a great way to reinforce them. What do you think contributed to this "
                "positive feeling today?"
            )
        else:
            content = (
                "Thank you for sharing that with me. It sounds like there's a lot on your mind. "
                "I'm here to support you in whatever way you need. We can practice a Cognitive Behavioral "
                "Therapy (CBT) technique, do a quick breathing exercise, or simply chat. What feels most "
                "helpful for you in this moment?"
            )
            
        class MockResponse:
            def __init__(self, content):
                self.content = content
        return MockResponse(content)

    async def ainvoke(self, messages) -> Any:
        return self.invoke(messages)


def get_llm_client():
    """
    Initializes and returns the LangChain Google Gemini Flash chat model.
    Falls back to a Mock client if GOOGLE_API_KEY is not set or set to mock.
    """
    api_key = settings.GOOGLE_API_KEY
    
    if not api_key or api_key == "mock-api-key-for-now" or "your-gemini" in api_key:
        return MockGeminiFlash()
        
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        # Set environment variable just in case LangChain expects it there
        os.environ["GOOGLE_API_KEY"] = api_key
        
        chat_model = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            temperature=0.7,
            google_api_key=api_key,
            max_output_tokens=1024,
        )
        logger.info(f"Successfully initialized {settings.GEMINI_MODEL} LLM via LangChain.")
        return chat_model
    except Exception as e:
        logger.error(f"Error initializing LangChain Gemini Flash client: {e}. Falling back to Mock LLM.")
        return MockGeminiFlash()

