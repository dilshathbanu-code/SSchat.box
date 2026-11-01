import re
import json
from pathlib import Path
from config import Config

class LanguageService:
    def __init__(self):
        self.glossary = self._load_glossary()

    def _load_glossary(self):
        glossary_file = Config.GLOSSARY_DIR / "educational_terms.json"
        if glossary_file.exists():
            try:
                with open(glossary_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[LanguageService] Error loading glossary: {e}")
        return []

    @staticmethod
    def detect_script(text: str) -> str:
        """
        Detect whether text contains predominantly Tamil, Devanagari (Hindi), or Latin (English) characters.
        """
        if not text:
            return "en"
        tamil_chars = len(re.findall(r'[\u0B80-\u0BFF]', text))
        devanagari_chars = len(re.findall(r'[\u0900-\u097F]', text))
        latin_chars = len(re.findall(r'[a-zA-Z]', text))

        if tamil_chars > devanagari_chars and tamil_chars > latin_chars:
            return "ta"
        elif devanagari_chars > tamil_chars and devanagari_chars > latin_chars:
            return "hi"
        return "en"

    @staticmethod
    def validate_tamil_text(text: str) -> dict:
        """
        Validates Tamil text for script integrity, punctuation, and checks for accidental Romanization.
        """
        if not text:
            return {"is_valid": False, "score": 0.0, "reason": "Empty text"}
        
        # Check Tamil characters presence
        tamil_matches = re.findall(r'[\u0B80-\u0BFF]', text)
        latin_matches = re.findall(r'[a-zA-Z]', text)
        
        # Count words
        words = text.split()
        if not words:
            return {"is_valid": False, "score": 0.0, "reason": "No words detected"}

        ratio_tamil = len(tamil_matches) / max(1, (len(tamil_matches) + len(latin_matches)))
        has_tanglish_intrusion = len(latin_matches) > 15 and ratio_tamil < 0.85

        return {
            "is_valid": len(tamil_matches) > 0,
            "script_score": round(ratio_tamil, 2),
            "tamil_char_count": len(tamil_matches),
            "latin_char_count": len(latin_matches),
            "warning": "Possible English/Tanglish intrusion detected" if has_tanglish_intrusion else None
        }

    @staticmethod
    def validate_hindi_text(text: str) -> dict:
        """
        Validates Hindi text for Devanagari script integrity and matra usage.
        """
        if not text:
            return {"is_valid": False, "score": 0.0, "reason": "Empty text"}

        devanagari_matches = re.findall(r'[\u0900-\u097F]', text)
        latin_matches = re.findall(r'[a-zA-Z]', text)

        ratio_hindi = len(devanagari_matches) / max(1, (len(devanagari_matches) + len(latin_matches)))
        has_hinglish_intrusion = len(latin_matches) > 15 and ratio_hindi < 0.85

        return {
            "is_valid": len(devanagari_matches) > 0,
            "script_score": round(ratio_hindi, 2),
            "devanagari_char_count": len(devanagari_matches),
            "latin_char_count": len(latin_matches),
            "warning": "Possible Romanized Hindi (Hinglish) intrusion detected" if has_hinglish_intrusion else None
        }

    def verify_terms(self, text: str, lang: str) -> list:
        """
        Identifies verified glossary terminology present in the text.
        """
        found_terms = []
        for item in self.glossary:
            target_term = item.get(lang)
            if target_term and target_term.lower() in text.lower():
                found_terms.append({
                    "term": target_term,
                    "term_en": item.get("en"),
                    "term_ta": item.get("ta"),
                    "term_hi": item.get("hi"),
                    "definition": item.get(f"definition_{lang}") or item.get("definition_en")
                })
        return found_terms

language_service = LanguageService()
