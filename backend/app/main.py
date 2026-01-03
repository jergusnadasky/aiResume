from fastapi import FastAPI, UploadFile, File

from app.ai.resume_ai import ai_resume_analysis
from app.pdf.extractor import extract_text_and_pages
from app.core.cors import setup_cors

app = FastAPI()

setup_cors(app)

@app.get("/")
def home():
    return {"message": "Resume Evaluator API running with REAL AI 🚀"}


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        return {"error": "Please upload a PDF file"}

    text, pages = extract_text_and_pages(file.file)

    ai = await ai_resume_analysis(text, pages)

    if "subscores" not in ai:
        ai["subscores"] = {}

    return {
        "status": "success",
        "pages_detected": pages,
        "ai_feedback": ai,
        "raw_text": text
    }
