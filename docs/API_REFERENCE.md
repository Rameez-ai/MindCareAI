# MindCareAI – Backend API Reference Manual

All endpoints are prefix versioned under `/api/v1`. Protected routes require a header: `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication Module

### Register User
* **Endpoint**: `/api/v1/auth/register`
* **Method**: `POST`
* **Auth Required**: No
* **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "display_name": "Alex Smith"
  }
  ```
* **Response Payload (201 Created)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
  ```

### Login User
* **Endpoint**: `/api/v1/auth/login`
* **Method**: `POST`
* **Auth Required**: No
* **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
* **Response Payload (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
  ```

---

## 2. Profile Module

### Fetch User Profile
* **Endpoint**: `/api/v1/profile`
* **Method**: `GET`
* **Auth Required**: Yes
* **Response Payload (200 OK)**:
  ```json
  {
    "uid": "a1b2c3d4...",
    "email": "user@example.com",
    "display_name": "Alex Smith",
    "avatar_url": null,
    "preferences": {
      "theme": "light",
      "notifications_enabled": true,
      "language": "en",
      "wellness_interests": ["Mindfulness & Meditation"]
    },
    "created_at": "2026-06-02T12:00:00Z",
    "updated_at": "2026-06-02T12:00:00Z"
  }
  ```

### Update User Profile
* **Endpoint**: `/api/v1/profile`
* **Method**: `PUT`
* **Auth Required**: Yes
* **Request Payload**:
  ```json
  {
    "display_name": "Alex J. Smith",
    "preferences": {
      "theme": "dark",
      "notifications_enabled": true,
      "language": "en",
      "wellness_interests": ["CBT", "Anxiety Management"]
    }
  }
  ```
* **Response Payload (200 OK)**: Returns updated User Profile object.

---

## 3. Empathy Chat Module

### Send Message
* **Endpoint**: `/api/v1/chat`
* **Method**: `POST`
* **Auth Required**: Yes
* **Request Payload**:
  ```json
  {
    "chat_id": "optional-chat-uuid-if-exists-or-blank",
    "content": "I'm feeling really stressed today about my tests."
  }
  ```
* **Response Payload (200 OK)**:
  ```json
  {
    "message_id": "msg-uuid-abc",
    "chat_id": "chat-uuid-123",
    "role": "assistant",
    "content": "I hear how much stress this test is causing you, and that makes complete sense...",
    "created_at": "2026-06-02T12:05:00Z",
    "metadata": {
      "sentiment": "stress",
      "context_retrieved": true
    }
  }
  ```

### Fetch Chat List
* **Endpoint**: `/api/v1/chat/history`
* **Method**: `GET`
* **Auth Required**: Yes
* **Response Payload (200 OK)**:
  ```json
  [
    {
      "chat_id": "chat-uuid-123",
      "user_id": "user-uid-999",
      "title": "Stressed about tests...",
      "created_at": "2026-06-02T12:00:00Z",
      "updated_at": "2026-06-02T12:05:00Z",
      "status": "active"
    }
  ]
  ```

---

## 4. Mood Tracker Module

### Log Mood Check-in
* **Endpoint**: `/api/v1/mood/add`
* **Method**: `POST`
* **Auth Required**: Yes
* **Request Payload**:
  ```json
  {
    "mood": "anxious",
    "intensity": 7,
    "note": "Final exam is tomorrow morning"
  }
  ```
* **Response Payload (201 Created)**:
  ```json
  {
    "log_id": "log-uuid-xyz",
    "user_id": "user-uid-999",
    "mood": "anxious",
    "intensity": 7,
    "note": "Final exam is tomorrow morning",
    "created_at": "2026-06-02T12:10:00Z"
  }
  ```

---

## 5. Analytics Module

### Get Integrated Analytics Dashboard
* **Endpoint**: `/api/v1/analytics`
* **Method**: `GET`
* **Auth Required**: Yes
* **Response Payload (200 OK)**:
  ```json
  {
    "mood_analytics": {
      "mood_counts": {
        "anxious": 3,
        "calm": 1
      },
      "average_intensity": 6.5,
      "history": [...]
    },
    "sentiment_analytics": {
      "sentiment_counts": {
        "anxiety": 2,
        "depression": 0,
        "stress": 5,
        "loneliness": 0,
        "happiness": 1,
        "anger": 0,
        "neutral": 2
      },
      "average_chat_intensity": 5.4,
      "total_messages_analyzed": 10
    }
  }
  ```
