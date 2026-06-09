import requests
import sys
import json

base_url = "http://127.0.0.1:8000/api/v1"

# 1. Register/Login
try:
    resp = requests.post(f"{base_url}/auth/register", json={
        "email": "test456@test.com",
        "password": "Password123!",
        "display_name": "Test User"
    })
    
    if resp.status_code == 400 and "already exists" in resp.text:
        resp = requests.post(f"{base_url}/auth/login", json={
            "email": "test456@test.com",
            "password": "Password123!"
        })
        
    resp.raise_for_status()
    token = resp.json()["access_token"]
    print("Logged in successfully.")
except Exception as e:
    print(f"Auth error: {e}")
    sys.exit(1)

# 2. Send Message
headers = {"Authorization": f"Bearer {token}"}
try:
    print("Sending message...")
    # Send without chat_id to create a new chat
    resp = requests.post(f"{base_url}/chat", json={
        "content": "I am feeling a bit anxious today.",
        "chat_id": ""
    }, headers=headers)
    
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))
except Exception as e:
    print(f"Message error: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(e.response.text)
