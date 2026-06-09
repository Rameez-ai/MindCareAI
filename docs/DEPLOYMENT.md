# 🚀 MindCareAI — Cloud Deployment Guide

This guide provides step-by-step instructions on how to deploy the **MindCareAI** project in a production cloud environment:
1. **Backend (FastAPI)** deployed on **Hugging Face Spaces** (Docker-based).
2. **Frontend (React/Vite)** deployed on **Vercel** (Serverless).

---

## 🎨 Deployment Architecture

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│        Vercel Frontend          │           │       Hugging Face Space        │
│    (React / Vite Web App)       │ ───────>  │    (FastAPI RAG Docker API)     │
│  https://mindcare.vercel.app    │           │  https://[name]-[space].hf.space│
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## 📦 Part 1: Deploying the FastAPI Backend to Hugging Face Spaces

Hugging Face Spaces allows you to run containerized Docker applications for free, which is perfect for Python APIs running heavy frameworks like `sentence-transformers` and `FAISS` vector libraries.

### Step 1: Create a Hugging Face Account & Space
1. Sign in or sign up at [Hugging Face](https://huggingface.co/).
2. Click on your profile picture in the top-right corner and select **New Space** (or go directly to [huggingface.co/new-space](https://huggingface.co/new-space)).
3. Fill out the form:
    *   **Space name:** `MindCareAI-API` (or any name you choose)
    *   **License:** `mit` (or choose another)
    *   **SDK (Template):** Select **Docker** (Crucial: do not choose Python/Gradio/Streamlit).
    *   **Docker Template:** Select **Blank**.
    *   **Space Hardware:** Choose **Cpu basic (Free)**.
    *   **Visibility:** **Public** (so your frontend can fetch from it).
4. Click **Create Space**.

### Step 2: Configure Environment Variables (Secrets)
Before pushing code, configure your sensitive credentials:
1. In your newly created Space, click on the **Settings** tab.
2. Scroll down to **Variables and secrets**.
3. Under **Variables** (public configurations), add:
    *   `FIREBASE_CREDENTIALS_PATH` = `app/config/firebase-credentials.json` (if using Firestore).
4. Under **Secrets** (private/hidden tokens), click **New secret** and add:
    *   `GOOGLE_API_KEY` = *[Your actual Google Gemini API Key from Google AI Studio]*
5. If you are using Firebase Firestore database, create a secret:
    *   `FIREBASE_CREDENTIALS_JSON` = *[Paste the entire raw text content of your `firebase-credentials.json` key]*
    > **Note:** The backend code checks if `FIREBASE_CREDENTIALS_JSON` environment variable exists. If present, it will write it dynamically to the disk path, eliminating the need to commit your credential JSON file to GitHub!

### Step 3: Push the Backend to Hugging Face
To push only the backend code to Hugging Face, you can run these git commands in your local `backend` directory, or link it to your GitHub repository using Hugging Face's Github integration.

**Option A: Direct Git Push to Hugging Face Space**
1. Copy the Git URL of your Space (available under the `Use Git` instructions of your new Space, e.g., `https://huggingface.co/spaces/YourUsername/MindCareAI-API`).
2. Open your terminal in the **`backend`** folder:
    ```bash
    cd backend
    git init
    git add .
    git commit -m "Deploy FastAPI Backend"
    git remote add hf https://huggingface.co/spaces/YourUsername/MindCareAI-API
    git push -f hf master:main
    ```
3. Wait for the build to compile. Hugging Face will read the `Dockerfile` and compile the containers. Once done, the logs will show `Running`.

**Option B: GitHub Action Sync (Recommended)**
You can also sync your GitHub repository directly to your Hugging Face Space using a GitHub Action workflow. We will explain how to set this up once the main repo is pushed.

### Step 4: Verify the API
Your API endpoint will be available at:
`https://[your-username]-[your-space-name].hf.space` (e.g., `https://rameez-mindcareai-api.hf.space`)

Verify it by hitting the health status endpoint in your browser:
`https://[your-username]-[your-space-name].hf.space/api/health`

---

## ⚡ Part 2: Deploying the React/Vite Frontend to Vercel

Vercel provides blazing-fast serverless hosting for modern static websites and SPAs.

### Step 1: Create a Vercel Project
1. Log in to [Vercel](https://vercel.com/) (using your GitHub account makes imports seamless).
2. Click **Add New** → **Project**.
3. Under **Import Git Repository**, choose your GitHub repository `Rameez-ai/MindCareAI` (which we will push in the next step).
4. Click **Import**.

### Step 2: Configure Project Settings
In the import page, edit these settings:
1. **Framework Preset:** Select **Vite** (Vercel usually auto-detects this).
2. **Root Directory:** Change this to **`frontend`** (Click `Edit`, navigate to the `frontend` folder, and click `Select`).
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### Step 3: Configure Environment Variables
Expand the **Environment Variables** accordion and add:
*   `VITE_API_URL` = `https://[your-username]-[your-space-name].hf.space` (the base API URL of your deployed Hugging Face Space backend).

### Step 4: Add CORS & SPA Routing Rules
To prevent React Router routing refresh issues (which cause 404 errors on refreshing child pages like `/chat` or `/dashboard`), Vercel requires a routing configuration.
We have pre-configured this or you can add a `vercel.json` file inside the `frontend` folder with the following contents:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
*Note: Make sure this file is committed and pushed.*

### Step 5: Deploy
1. Click **Deploy**.
2. Within a minute, your Vite SPA will be live on a custom Vercel subdomain (e.g., `https://mindcareai.vercel.app`).
3. Try registering a user and testing out the chatbot connected to the live Hugging Face backend API!

---

## ⚙️ Handling Local SQLite/Vector DB Compilation during Build
Because Hugging Face Space containers compile fresh, they will need the compiled vector RAG database.
Our backend automatically checks if `backend/faiss_index/index.faiss` exists. If it does not, on startup it will automatically trigger `python scripts/build_index.py` to compile the FAISS index from the `knowledge_base` folder. This means you do not need to worry about committing compiled bin indexes!
