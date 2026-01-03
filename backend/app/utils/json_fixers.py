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