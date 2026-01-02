from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import httpx
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCORE_SCALE = {
    "structure": 20,
    "technical_depth": 25,
    "impact": 25,
    "clarity": 15,
    "ats": 15
}



@app.get("/")
def home():
    return {"message": "Resume Evaluator API running with REAL AI 🚀"}


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        return {"error": "Please upload a PDF file"}

    text = ""
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

        pages = len(pdf.pages)

    ai = await ai_resume_analysis(text, pages)

    if "subscores" not in ai:
        ai["subscores"] = {}

    return {
        "status": "success",
        "pages_detected": pages,
        "ai_feedback": ai,
        "raw_text": text
    }



async def ai_resume_analysis(text: str, pages: int):
    prompt = f"""
You are a senior hiring manager and resume expert.

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON
- No markdown
- No bullet symbols (•, -, —)
- All arrays MUST contain quoted strings only
- If you cannot comply, return empty arrays

Resume:
{text}

Your JSON format MUST be exactly:

{{
  "overall_score": number 0-100,
  "subscores": {{
      "structure": number 0-20,
      "technical_depth": number 0-25,
      "impact": number 0-25,
      "clarity": number 0-15,
      "ats": number 0-15
  }},
  "summary": "short professional summary of resume quality",
  "strengths": ["at least 3 strengths"],
  "issues": ["at least 5 weaknesses with reasons"],
  "recommendations": ["at least 5 concrete actionable improvements"],
  "bad_bullets": ["identify weak bullets"],
  "improved_bullets": ["rewrite several bullets professionally"],
  "reasoning": "explain why the candidate scored this way"
}}
"""

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            res = await client.post(
                "http://localhost:11434/v1/chat/completions",
                json={
                    "model": "llama3",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert resume evaluator. Output ONLY valid JSON."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                }
            )

        # 🔴 RAW RESPONSE FROM OLLAMA (FULL)
        response_json = res.json()
        print("\n========== FULL OLLAMA RESPONSE ==========\n")
        print(response_json)
        print("\n=========================================\n")

        raw = response_json["choices"][0]["message"]["content"]

        print("\n========== RAW AI TEXT ==========\n")
        print(raw)
        print("\n================================\n")

        # Remove markdown fences if present
        cleaned = repair_json(raw)
        cleaned = fix_unquoted_bullets(cleaned)

        print("\n========== FINAL JSON ATTEMPT ==========\n")
        print(cleaned)
        print("\n=======================================\n")

        print("\n========== CLEANED AI TEXT ==========\n")
        print(cleaned)
        print("\n====================================\n")

        # 🔴 Try parsing JSON with location info
        try:
            data = json.loads(cleaned)
            print("✅ JSON PARSE SUCCESS")

            if "scores" in data and "subscores" not in data:
                data["subscores"] = data.pop("scores")

            # 🔥 Defensive: ensure subscores exist
            if "subscores" not in data:
                data["subscores"] = {}

            return data
        except json.JSONDecodeError as je:
            print("❌ JSON PARSE FAILED")
            print("Error:", je)
            print("Error line:", je.lineno)
            print("Error column:", je.colno)
            print("Around error:")
            lines = cleaned.splitlines()
            start = max(0, je.lineno - 3)
            end = min(len(lines), je.lineno + 3)
            for i in range(start, end):
                print(f"{i+1}: {lines[i]}")
            raise je

    except Exception as e:
        print("\n🚨 AI ERROR CAUGHT 🚨")
        print(str(e))

        return {
            "overall_score": 0,
            "subscores": {},
            "score_scale": SCORE_SCALE,  # ✅ ADD THIS
            "summary": "AI failed to produce valid JSON",
            "strengths": [],
            "issues": ["AI engine returned malformed output"],
            "recommendations": [
                "Try again",
                "Reduce resume length",
                "Simplify formatting"
            ],
            "reasoning": str(e),
            "raw_error": str(e)
        }


def repair_json(raw: str) -> str:
    """
    Attempts to fix common LLM JSON issues including trailing commas.
    """
    import re
    
    cleaned = raw.strip()

    # Remove markdown if present
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    # 🔥 FIX TRAILING COMMAS (the main issue!)
    # Remove commas before closing brackets or braces
    cleaned = re.sub(r',(\s*[}\]])', r'\1', cleaned)
    
    # 🔥 FIX COMMON TYPOS FROM LLAMA3
    cleaned = cleaned.replace('"Estructure"', '"structure"')
    cleaned = cleaned.replace('"Technical_depth"', '"technical_depth"')
    cleaned = cleaned.replace('"Impact"', '"impact"')
    cleaned = cleaned.replace('"Cliquarity"', '"clarity"')
    cleaned = cleaned.replace('"ATS_relevance"', '"ats"')
    cleaned = cleaned.replace('"sory"', '"summary"')
    cleaned = cleaned.replace('"reasoning"', '"summary"')  # Sometimes it uses reasoning instead
    
    # Count braces
    open_braces = cleaned.count("{")
    close_braces = cleaned.count("}")

    # If missing closing braces, append them
    if close_braces < open_braces:
        cleaned += "}" * (open_braces - close_braces)
    
    # Count brackets
    open_brackets = cleaned.count("[")
    close_brackets = cleaned.count("]")
    
    if close_brackets < open_brackets:
        cleaned += "]" * (open_brackets - close_brackets)

    return cleaned

def fix_unquoted_bullets(text: str) -> str:
    import re

    def replacer(match):
        content = match.group(1).strip()
        return f'"{content}"'

    # Fix bullet lines inside arrays
    text = re.sub(
        r'[\n\r]\s*[•\-]\s*(.+)',
        lambda m: '\n    "' + m.group(1).replace('"', '\\"') + '",',
        text
    )

    return text