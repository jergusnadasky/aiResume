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
You are a senior hiring manager and resume expert evaluating a resume.

CRITICAL SCORING RULES:
- overall_score MUST equal the sum of all subscores (structure + technical_depth + impact + clarity + ats)
- Maximum possible score is 100 (20+25+25+15+15)
- Evaluate each category independently based on resume quality
- Be fair but critical - give credit where due, but identify real weaknesses

CRITICAL OUTPUT RULES:
- Output ONLY valid JSON
- No markdown code blocks
- No bullet symbols (•, -, —) in arrays
- All arrays MUST contain quoted strings only
- If you cannot comply, return empty arrays

Evaluate this resume:
{text}

Scoring Guide:
- Structure (0-20): Organization, sections, formatting, readability
- Technical Depth (0-25): Technical skills, technologies, complexity of work
- Impact (0-25): Quantifiable achievements, results, accomplishments
- Clarity (0-15): Clear communication, concise writing, easy to understand
- ATS Optimization (0-15): Keywords, formatting, ATS-friendly structure

Your JSON format MUST be exactly:

{{
  "overall_score": <SUM OF ALL SUBSCORES - must equal structure + technical_depth + impact + clarity + ats>,
  "subscores": {{
      "structure": number 0-20,
      "technical_depth": number 0-25,
      "impact": number 0-25,
      "clarity": number 0-15,
      "ats": number 0-15
  }},
  "summary": "short professional summary (2-3 sentences) of overall resume quality",
  "strengths": ["at least 3 specific strengths from the resume"],
  "issues": ["at least 5 specific weaknesses or areas for improvement with brief explanations"],
  "recommendations": ["at least 5 concrete, actionable improvements the candidate can make"],
  "bad_bullets": ["identify 2-3 weak bullet points that need improvement"],
  "improved_bullets": ["provide improved versions of the bad bullets with better impact and clarity"],
  "reasoning": "explain the overall score and key factors that influenced your evaluation (2-3 sentences)",
  "feedback_by_category": {{
    "structure": {{
      "strengths": ["strengths related to structure"],
      "issues": ["issues related to structure"],
      "recommendations": ["recommendations for improving structure"]
    }},
    "technical_depth": {{
      "strengths": ["strengths related to technical depth"],
      "issues": ["issues related to technical depth"],
      "recommendations": ["recommendations for improving technical depth"]
    }},
    "impact": {{
      "strengths": ["strengths related to impact/achievements"],
      "issues": ["issues related to impact/achievements"],
      "recommendations": ["recommendations for improving impact"]
    }},
    "clarity": {{
      "strengths": ["strengths related to clarity"],
      "issues": ["issues related to clarity"],
      "recommendations": ["recommendations for improving clarity"]
    }},
    "ats": {{
      "strengths": ["strengths related to ATS optimization"],
      "issues": ["issues related to ATS optimization"],
      "recommendations": ["recommendations for improving ATS optimization"]
    }}
  }}
}}

IMPORTANT: Each category in feedback_by_category should have at least 1 item in each array (strengths, issues, recommendations). If a category has no relevant feedback, use an empty array [].
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

            # 🎯 CRITICAL FIX: Calculate overall_score from subscores if it doesn't match
            if data.get("subscores"):
                calculated_score = sum(
                    data["subscores"].get(key, 0) 
                    for key in ["structure", "technical_depth", "impact", "clarity", "ats"]
                )
                reported_score = data.get("overall_score", 0)
                
                if calculated_score != reported_score:
                    print(f"⚠️  Score mismatch detected: Reported={reported_score}, Calculated={calculated_score}")
                    print(f"   Updating overall_score to {calculated_score} (sum of subscores)")
                    data["overall_score"] = calculated_score
                else:
                    print(f"✅ Score validation passed: {calculated_score}")

            # 🔧 Normalize array fields to ensure they contain only strings
            array_fields = ["strengths", "issues", "recommendations", "bad_bullets", "improved_bullets"]
            
            # Also normalize categorized feedback if it exists
            if "feedback_by_category" in data and isinstance(data["feedback_by_category"], dict):
                for category, feedback in data["feedback_by_category"].items():
                    if isinstance(feedback, dict):
                        for feedback_type in ["strengths", "issues", "recommendations"]:
                            if feedback_type in feedback and isinstance(feedback[feedback_type], list):
                                normalized = []
                                for item in feedback[feedback_type]:
                                    if isinstance(item, str):
                                        normalized.append(item)
                                    elif isinstance(item, dict):
                                        text = (item.get("improved_bullet") or 
                                               item.get("bad_bullet") or 
                                               item.get("text") or 
                                               item.get("content") or 
                                               item.get("message") or
                                               str(item))
                                        if text:
                                            normalized.append(str(text))
                                    else:
                                        normalized.append(str(item) if item else "")
                                feedback[feedback_type] = normalized
            
            for field in array_fields:
                if field in data and isinstance(data[field], list):
                    original_items = data[field]
                    normalized = []
                    for item in original_items:
                        if isinstance(item, str):
                            normalized.append(item)
                        elif isinstance(item, dict):
                            # Try to extract string from common object keys
                            text = (item.get("improved_bullet") or 
                                   item.get("bad_bullet") or 
                                   item.get("text") or 
                                   item.get("content") or 
                                   item.get("message") or
                                   str(item))
                            if text:
                                normalized.append(str(text))
                        else:
                            normalized.append(str(item) if item else "")
                    
                    # Log if normalization changed anything
                    if len(normalized) != len(original_items) or any(not isinstance(orig, str) for orig in original_items):
                        print(f"⚠️  Normalized {field} array: {len(original_items)} → {len(normalized)} items (converted objects to strings)")
                    
                    data[field] = normalized

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