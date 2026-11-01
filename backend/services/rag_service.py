import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from config import Config

class RAGService:
    def __init__(self):
        self.textbooks: List[Dict[str, Any]] = []
        self._load_textbooks()

    def _load_textbooks(self):
        """Loads all verified textbook JSON files from the data directory."""
        self.textbooks = []
        textbooks_dir = Config.TEXTBOOKS_DIR
        if not textbooks_dir.exists():
            print(f"[RAGService] Textbooks directory not found: {textbooks_dir}")
            return

        for file_path in textbooks_dir.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self.textbooks.extend(data)
                        print(f"[RAGService] Loaded {len(data)} passages from {file_path.name}")
            except Exception as e:
                print(f"[RAGService] Error loading {file_path.name}: {e}")

    def reload(self):
        """Reloads the textbook database on demand."""
        self._load_textbooks()
        return len(self.textbooks)

    def retrieve_passages(
        self,
        query: str,
        board: Optional[str] = None,
        class_grade: Optional[str] = None,
        subject: Optional[str] = None,
        language: str = "en",
        top_k: int = 3
    ) -> Dict[str, Any]:
        """
        Retrieves relevant verified textbook passages matching the query and curriculum filters.
        Enforces strict board and class isolation to avoid cross-board contamination.
        """
        if not query or not query.strip():
            return {
                "has_sufficient_evidence": False,
                "passages": [],
                "fallback_message": Config.FALLBACK_MESSAGES.get(language, Config.FALLBACK_MESSAGES["en"])
            }

        clean_query = query.strip().lower()
        query_words = set(re.findall(r'[\w\u0B80-\u0BFF\u0900-\u097F]+', clean_query))

        candidates = []

        for item in self.textbooks:
            # 1. Strict Board Filter (if specified and not 'all')
            if board and board != "all":
                item_board = item.get("board", "").lower()
                if item_board != board.lower():
                    continue

            # 2. Strict Class/Grade Filter (if specified and not 'all')
            if class_grade and class_grade != "all":
                item_class = item.get("class_grade", "").lower().replace(" ", "")
                req_class = class_grade.lower().replace(" ", "")
                if item_class != req_class:
                    continue

            # 3. Subject Filter
            if subject and subject != "all":
                item_subject = item.get("subject", "").lower()
                if subject.lower() not in item_subject:
                    continue

            # 4. Multi-language content scoring
            content_en = item.get("content", "").lower()
            content_ta = item.get("content_ta", "").lower()
            content_hi = item.get("content_hi", "").lower()
            title = item.get("title", "").lower()
            chapter_name = item.get("chapter_name", "").lower()
            key_concepts = [k.lower() for k in item.get("key_concepts", [])]
            sample_questions = [q.lower() for q in item.get("sample_questions", [])]

            combined_text = f"{title} {chapter_name} {content_en} {content_ta} {content_hi} {' '.join(key_concepts)} {' '.join(sample_questions)}"
            
            # Calculate match score
            score = 0.0
            
            # Exact concept match
            for concept in key_concepts:
                if concept in clean_query:
                    score += 0.5
                elif clean_query in concept:
                    score += 0.35

            # Sample questions exact/partial match
            for sample_q in sample_questions:
                if clean_query in sample_q or sample_q in clean_query:
                    score += 0.6
                    break

            # Word overlap match
            item_words = set(re.findall(r'[\w\u0B80-\u0BFF\u0900-\u097F]+', combined_text))
            intersection = query_words.intersection(item_words)
            if query_words:
                overlap_ratio = len(intersection) / len(query_words)
                score += overlap_ratio * 0.5

            if score > 0.15:
                candidates.append((score, item))

        # Sort by score descending
        candidates.sort(key=lambda x: x[0], reverse=True)

        if not candidates or candidates[0][0] < 0.25:
            # Evidence insufficient: strictly return required fallback
            return {
                "has_sufficient_evidence": False,
                "highest_score": candidates[0][0] if candidates else 0.0,
                "passages": [],
                "fallback_message": Config.FALLBACK_MESSAGES.get(language, Config.FALLBACK_MESSAGES["en"])
            }

        top_passages = []
        for score, item in candidates[:top_k]:
            passage_copy = dict(item)
            passage_copy["relevance_score"] = round(score, 3)
            # Select appropriate language passage text
            if language == "ta" and item.get("content_ta"):
                passage_copy["display_text"] = item["content_ta"]
            elif language == "hi" and item.get("content_hi"):
                passage_copy["display_text"] = item["content_hi"]
            else:
                passage_copy["display_text"] = item.get("content", "")
            
            top_passages.append(passage_copy)

        return {
            "has_sufficient_evidence": True,
            "highest_score": candidates[0][0],
            "passages": top_passages,
            "fallback_message": None
        }

    def get_all_textbooks_summary(self) -> List[Dict[str, Any]]:
        """Returns metadata list of all available verified textbooks."""
        seen = set()
        catalog = []
        for t in self.textbooks:
            key = (t.get("board"), t.get("class_grade"), t.get("subject"), t.get("chapter_name"))
            if key not in seen:
                seen.add(key)
                catalog.append({
                    "id": t.get("id"),
                    "board": t.get("board"),
                    "board_name": t.get("board_name"),
                    "publisher": t.get("publisher"),
                    "class_grade": t.get("class_grade"),
                    "subject": t.get("subject"),
                    "chapter_number": t.get("chapter_number"),
                    "chapter_name": t.get("chapter_name"),
                    "academic_year": t.get("academic_year"),
                    "official_source_url": t.get("official_source_url"),
                    "verification_status": t.get("verification_status")
                })
        return catalog

rag_service = RAGService()
