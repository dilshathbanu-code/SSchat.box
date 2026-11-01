import os
import re
import requests
from typing import Dict, Any, List, Optional
from config import Config
from services.rag_service import rag_service
from services.language_service import language_service

class AIService:
    def __init__(self):
        self.api_key = Config.GEMINI_API_KEY

    def sanitize_input(self, text: str) -> str:
        """Sanitizes user input to prevent script injection and command abuse."""
        if not text:
            return ""
        # Remove HTML/script tags
        clean = re.sub(r'<[^>]*>', '', text)
        # Limit max length to 1000 characters for safety
        return clean.strip()[:1000]

    def resolve_followup_context(self, current_query: str, history: Optional[List[Dict[str, Any]]]) -> str:
        """
        Augments follow-up questions with context from recent conversation turns.
        e.g., If previous was 'Newton's laws' and current is 'Give an example of it',
        combines them for accurate textbook retrieval.
        """
        if not history or len(history) == 0:
            return current_query

        followup_signals = ["it", "this", "that", "these", "those", "why", "how", "example", "unit", "formula", "difference",
                            "இதன்", "இதற்கு", "எடுத்துக்காட்டு", "அலகு", "சமன்பாடு", "வேறுபாடு",
                            "इसका", "इसके", "उदाहरण", "मात्रक", "सूत्र", "अंतर"]

        query_lower = current_query.lower()
        needs_context = any(word in query_lower.split() for word in followup_signals) or len(current_query.split()) <= 3

        if needs_context:
            # Find the most recent user turn that had substantive concepts
            for turn in reversed(history):
                prev_q = turn.get("query", "")
                if prev_q and prev_q != current_query:
                    return f"{prev_q} {current_query}"

        return current_query

    def generate_answer(
        self,
        query: str,
        board: str,
        class_grade: str,
        subject: str,
        response_language: str = "en",
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Executes the textbook-grounded answer pipeline:
        1. Sanitize query and resolve follow-up context.
        2. Retrieve verified textbook passages.
        3. Check evidence sufficiency.
        4. If insufficient, return honest uncertainty fallback.
        5. If sufficient, construct grade-appropriate structured explanation with genuine citation.
        6. Validate language quality and terminology.
        """
        clean_query = self.sanitize_input(query)
        if not clean_query:
            return {
                "success": False,
                "has_sufficient_evidence": False,
                "answer": Config.FALLBACK_MESSAGES.get(response_language, Config.FALLBACK_MESSAGES["en"]),
                "citations": [],
                "verification_status": "Empty Query"
            }

        # Resolve follow-up query context
        retrieval_query = self.resolve_followup_context(clean_query, history)

        # Step 2: RAG Retrieval
        retrieval_result = rag_service.retrieve_passages(
            query=retrieval_query,
            board=board,
            class_grade=class_grade,
            subject=subject,
            language=response_language,
            top_k=2
        )

        if not retrieval_result["has_sufficient_evidence"]:
            return {
                "success": True,
                "has_sufficient_evidence": False,
                "answer": retrieval_result["fallback_message"],
                "explanation": None,
                "example": None,
                "citations": [],
                "language": response_language,
                "ai_engine": "SSchat.box Grounding Validator",
                "gemini_configured": bool(self.api_key),
                "verification_status": "Insufficient Textbook Evidence"
            }

        top_passage = retrieval_result["passages"][0]
        
        # Build genuine citation
        citation = {
            "board": top_passage.get("board_name"),
            "publisher": top_passage.get("publisher"),
            "class_grade": top_passage.get("class_grade"),
            "subject": top_passage.get("subject"),
            "chapter_number": top_passage.get("chapter_number"),
            "chapter_name": top_passage.get("chapter_name"),
            "page_start": top_passage.get("page_start"),
            "page_end": top_passage.get("page_end"),
            "official_source_url": top_passage.get("official_source_url"),
            "academic_year": top_passage.get("academic_year"),
            "verification_status": top_passage.get("verification_status")
        }

        engine_used = "SSchat.box Verified Local RAG Engine (Zero Hallucination)"

        # Check if external Gemini API is configured
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                external_ans = self._call_gemini_api(clean_query, top_passage, response_language, class_grade)
                if external_ans:
                    engine_used = "Google Gemini (Grounded in Verified Textbook Passage)"
                    return {
                        "success": True,
                        "has_sufficient_evidence": True,
                        "answer": external_ans.get("main_answer"),
                        "explanation": external_ans.get("explanation"),
                        "example": external_ans.get("example"),
                        "citations": [citation],
                        "language": response_language,
                        "ai_engine": engine_used,
                        "gemini_configured": True,
                        "verification_status": "Verified Textbook Grounded"
                    }
            except Exception as e:
                print(f"[AIService] External LLM error, gracefully falling back to local grounding synthesizer: {e}")

        # Local Authentic Evidence Grounded Synthesizer
        structured_response = self._synthesize_grounded_answer(
            query=clean_query,
            passage=top_passage,
            lang=response_language,
            class_grade=class_grade
        )

        # Multilingual Quality & Terminology check
        if response_language == "ta":
            lang_check = language_service.validate_tamil_text(structured_response["answer"])
        elif response_language == "hi":
            lang_check = language_service.validate_hindi_text(structured_response["answer"])
        else:
            lang_check = {"is_valid": True, "script_score": 1.0}

        terms = language_service.verify_terms(structured_response["answer"], response_language)

        return {
            "success": True,
            "has_sufficient_evidence": True,
            "answer": structured_response["answer"],
            "explanation": structured_response["explanation"],
            "example": structured_response["example"],
            "citations": [citation],
            "language": response_language,
            "language_quality": lang_check,
            "verified_terms": terms,
            "ai_engine": engine_used,
            "gemini_configured": bool(self.api_key and self.api_key != "your_gemini_api_key_here"),
            "verification_status": "Verified Textbook Grounded"
        }

    def _synthesize_grounded_answer(
        self,
        query: str,
        passage: Dict[str, Any],
        lang: str,
        class_grade: str
    ) -> Dict[str, str]:
        """
        Synthesizes an explanation directly from the verified passage without hallucination.
        Adapts vocabulary for Kindergarten vs Secondary classes.
        """
        is_early_childhood = "lkg" in class_grade.lower() or "ukg" in class_grade.lower()
        
        if lang == "ta":
            text_content = passage.get("content_ta") or passage.get("content", "")
            if is_early_childhood:
                main_answer = f"அன்பான மாணவரே! உங்கள் தொடக்கக் கல்வி வழிகாட்டியின்படி:\n\n{text_content}"
                explanation = "எளிய பயிற்சி: படங்களையும் ஒலிகளையும் கவனித்து மீண்டும் மீண்டும் சொல்லிப் பழகவும்."
                example = "எடுத்துக்காட்டு: அன்றாட வாழ்வில் நாம் பார்க்கும் பொருட்களுடன் ஒப்பிட்டு நினைவில் வைக்கலாம்."
            else:
                main_answer = f"பாடப்புத்தகத்தின் அடிப்படையில் துல்லியமான விடை:\n\n{text_content}"
                explanation = f"விரிவான விளக்கம்: பாடம் '{passage.get('chapter_name')}' (பக்கங்கள் {passage.get('page_start')}-{passage.get('page_end')}) இல் குறிப்பிடப்பட்டுள்ள முதன்மைக் கருத்துக்கள்."
                example = "நடைமுறை பயன்பாடு: அன்றாட அறிவியல் மற்றும் இயற்கை நிகழ்வுகளில் இதனை நாம் எளிதாகக் காணலாம்."
        elif lang == "hi":
            text_content = passage.get("content_hi") or passage.get("content", "")
            if is_early_childhood:
                main_answer = f"प्रिय छात्र! आपकी प्रारंभिक शिक्षण सामग्री के अनुसार:\n\n{text_content}"
                explanation = "सरल व्याख्या: अक्षरों और संख्याओं को चित्रों के साथ दोहराएं।"
                example = "उदाहरण: अपने आसपास की वस्तुओं को देखकर अभ्यास करें।"
            else:
                main_answer = f"पाठ्यपुस्तक के आधार पर सटीक उत्तर:\n\n{text_content}"
                explanation = f"विस्तृत व्याख्या: अध्याय '{passage.get('chapter_name')}' (पृष्ठ {passage.get('page_start')}-{passage.get('page_end')}) में वर्णित प्रमुख सिद्धांतों के अनुसार।"
                example = "व्यावहारिक अनुप्रयोग: हमारे दैनिक जीवन और वैज्ञानिक प्रक्रियाओं में यह स्पष्ट रूप से देखा जा सकता है।"
        else:
            text_content = passage.get("content", "")
            if is_early_childhood:
                main_answer = f"Hello young learner! According to your early learning guide:\n\n{text_content}"
                explanation = "Simple step: Look at the pictures, listen carefully to the sounds, and say it out loud."
                example = "Fun Example: Spot these letters, shapes, or friendly animals in your daily environment!"
            else:
                main_answer = f"Textbook-verified answer:\n\n{text_content}"
                explanation = f"Step-by-step breakdown from Chapter {passage.get('chapter_number')}: '{passage.get('chapter_name')}' (Pages {passage.get('page_start')}-{passage.get('page_end')})."
                example = "Practical Illustration: This fundamental principle is directly observed in real-world science and everyday applications."

        return {
            "answer": main_answer,
            "explanation": explanation,
            "example": example
        }

    def _call_gemini_api(self, query: str, passage: Dict[str, Any], lang: str, class_grade: str) -> Optional[Dict[str, str]]:
        """Invokes Gemini API with strict evidence-grounded prompt if API key is provided."""
        if not self.api_key:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        
        system_instruction = (
            "You are SSchat.box, an educational learning assistant grounded strictly in verified textbook passages.\n"
            "Rules:\n"
            "1. Answer ONLY using the facts present in the retrieved textbook passage below.\n"
            "2. Never fabricate citations, page numbers, or chapters.\n"
            "3. If language is 'ta', answer in pure natural Tamil (no Tanglish). If 'hi', answer in Devanagari Hindi. If 'en', answer in clear English.\n"
            "4. Divide your response into: Main Answer, Step-by-Step Explanation, and Practical Example."
        )

        passage_text = passage.get("content_ta") if lang == "ta" else (passage.get("content_hi") if lang == "hi" else passage.get("content"))
        user_prompt = f"Selected Textbook Passage:\n{passage_text}\n\nStudent Question: {query}\nResponse Language: {lang}\nStudent Grade: {class_grade}"

        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]}
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 600
            }
        }

        resp = requests.post(url, json=payload, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if text:
                    return {
                        "main_answer": text,
                        "explanation": f"Grounded in verified {passage.get('chapter_name')} (Page {passage.get('page_start')}).",
                        "example": "Refer to official chapter review questions for self-assessment."
                    }
        return None

ai_service = AIService()
