# MindCareAI – Local Setup and Configuration Guide

Welcome! MindCareAI is designed to run out-of-the-box using built-in, local **mock database storage** and **simulated AI responses** so you can run the entire frontend and backend immediately. When you are ready, follow this guide to connect your Google Gemini API key and Firebase Cloud database.

---

## 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)

---

## 2. Fast Launch (Zero Configuration Mock Mode)

To run the application locally without any API keys or Firebase accounts:

### Step A: Start the Backend Server
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *Note: The console will output that it is running with Mock Storage and Mock Gemini Flash.*

### Step B: Start the Frontend React Client
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Launch Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the link `http://localhost:5173` in your browser. Register, check-in, and start chatting!

---

## 3. Connecting Real Google Gemini Flash API

To connect the live AI model:
1. Obtain an API Key from the Google AI Studio: [ai.google.dev](https://ai.google.dev/)
2. Open the `backend/.env` file.
3. Replace the placeholder value with your key:
   ```env
   GOOGLE_API_KEY=AIzaSyD-your-actual-api-key-here
   ```
4. Restart your FastAPI backend server. It will now fetch real responses using `gemini-1.5-flash` model.

---

## 4. Connecting Real Firebase Cloud Database

To switch from the local in-memory mock database to Firebase:

### Step A: Setup Firestore and Auth
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and follow steps to create a new project.
3. In the sidebar, go to **Build** → **Authentication** and click **Get Started**. Enable **Email/Password** sign-in provider.
4. Go to **Build** → **Firestore Database** and click **Create database**. Start in **production mode** or **test mode** (select locations near you).

### Step B: Generate Service Account Key
1. Go to **Project Settings** (gear icon in sidebar next to Project Overview) → **Service accounts**.
2. Click **Generate new private key** (Python tab).
3. Download the generated `.json` credentials file.
4. Rename this file to `firebase-credentials.json` and place it in the backend folder under:
   `backend/app/config/firebase-credentials.json`

### Step C: Update env Configurations
1. Open `backend/.env`.
2. Verify `FIREBASE_CREDENTIALS_PATH` points to the correct location:
   ```env
   FIREBASE_CREDENTIALS_PATH=app/config/firebase-credentials.json
   ```
3. Restart the FastAPI server. It will automatically detect this file and connect to Firestore!

---

## 5. Compiling RAG Knowledge Base

Once your dependencies are installed, you can compile the FAISS index from the markdown files:
1. Make sure your virtual environment is active in the `backend` folder.
2. Run the build index script:
   ```bash
   python scripts/build_index.py
   ```
3. This creates `backend/faiss_index/index.faiss` and `chunks.json`. The chatbot will automatically load these files on startup and query them to retrieve CBT guidelines and self-help context during conversations.
