# aiResume - Jergus Nadasky

An end-to-end AI-powered resume evaluation web app that analyzes PDF resumes using a locally hosted large language model. The application provides structured scoring, strengths, weaknesses, and actionable feedback across multiple hiring dimensions — all without relying on paid APIs or external AI services.

This project was built to demonstrate:
- Full-stack development (React + FastAPI)
- Local LLM integration (Ollama + Llama 3)
- Clean backend architecture and API design
- Practical AI usage with real-world constraints

## 📌 Features
- Upload a PDF resume via a modern web UI
- Extracts and parses resume content server-side
- Uses Llama 3 (via Ollama) to evaluate resumes across:
  - Structure
  - Technical depth
  - Impact
  - Clarity
  - ATS optimization
- Returns:
  - Overall score (0–100)
  - Category subscores
  - Strengths and weaknesses
  - Concrete improvement recommendations
- All AI inference runs locally on your machine

## 🧱 Tech Stack
### **Frontend**
- React
- Vite
- Tailwind CSS
- Runs on http://localhost:5173

### **Backend**
- Python
- FastAPI
- pdfplumber (PDF text extraction)
- httpx (AI requests)
- Runs on http://localhost:8000

### **AI**
- Ollama
- Llama 3 (local model)
- API served at http://localhost:11434

## 📂 Project Structure

```
backend/
├─ app/
│  ├─ main.py          # FastAPI entry point
│  ├─ ai/              # AI evaluation logic
│  ├─ pdf/             # PDF extraction
│  ├─ core/            # CORS and app config
│  └─ utils/           # JSON repair & scoring helpers
├─ requirements.txt
resume-ui/             # Frontend
├─ src/
├─ package.json
Makefile
```

## ⚙️ Prerequisites

Make sure you have the following installed:
- Node.js (v18+ recommended)
- Python (3.11 or 3.12 recommended)
- pip
- Ollama
- make (or Git Bash on Windows)

## 🧠 Installing Ollama & Llama 3
### 1️⃣ Install Ollama

Download and install Ollama from:
👉 https://ollama.com

Verify installation:
```
ollama --version
```

### 2️⃣ Pull the Llama 3 model

This only needs to be done **once**:
```
ollama pull llama3
```

### 🚀 Running the Application (Local)

## Clone the repo
1. ```
   git clone https://github.com/jergusnadasky/aiResume.git
   ```

2. ```
   cd aiResume
   ```

The app runs as **three services**:

- AI (Ollama)
- Backend (FastAPI)
- Frontend (React)

Each runs in its own terminal.

## 🔹 Terminal 1 — Start AI (Ollama)
```
make ai
```

This starts the Ollama server at:

http://localhost:11434

## 🔹 Terminal 2 — Start Backend
```
make backend
```

FastAPI will run at:

http://localhost:8000


Test it:

http://localhost:8000/

## 🔹 Terminal 3 — Start Frontend
```
make frontend
```

The web app will be available at:

http://localhost:5173

## 🧪 How It Works (High Level)

1. User uploads a PDF resume from the frontend
2. The frontend sends the file to the FastAPI backend
3. The backend:
  - Extracts text using pdfplumber
  - Sends the content to a locally hosted Llama 3 model
4. The AI returns structured JSON feedback
5. The frontend renders scores, insights, and recommendations

No data is stored. No external APIs are used.

## 🎥 Demo & Commentary

📌 YouTube Walkthrough
(https://youtu.be/iFYXSdV_feI)

## 🧠 Design Notes
- All AI inference is local for cost, privacy, and transparency/learning
- The backend is intentionally modularized for readability
- JSON repair logic exists to handle real LLM output edge cases
- This project prioritizes clarity and correctness over hype

## 📌 Future Improvements
- Streaming AI responses
- Better resume parsing (layout awareness)
- Career/Job-specific resume scoring
- Optional cloud deployment path

## 📄 License

This project is for educational and portfolio purposes.
