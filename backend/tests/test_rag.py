import pytest
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from services.rag_service import rag_service
from services.ai_service import ai_service
from config import Config

def test_textbooks_loaded():
    assert len(rag_service.textbooks) > 0, "Textbook database should have indexed passages"

def test_rag_retrieval_tn_newton():
    res = rag_service.retrieve_passages(
        query="Newton's first law of motion and inertia",
        board="tn_state_board",
        class_grade="Class 10",
        subject="Science",
        language="en"
    )
    assert res["has_sufficient_evidence"] is True
    assert len(res["passages"]) > 0
    top = res["passages"][0]
    assert "Inertia" in top["title"]
    assert top["board"] == "tn_state_board"
    assert top["page_start"] == 2

def test_rag_retrieval_tamil_query():
    res = rag_service.retrieve_passages(
        query="நிலைமம் என்றால் என்ன?",
        board="tn_state_board",
        class_grade="Class 10",
        subject="Science",
        language="ta"
    )
    assert res["has_sufficient_evidence"] is True
    assert len(res["passages"]) > 0
    top = res["passages"][0]
    assert "content_ta" in top

def test_rag_retrieval_hindi_ncert():
    res = rag_service.retrieve_passages(
        query="रासायनिक समीकरण को संतुलित करना क्यों आवश्यक है?",
        board="ncert",
        class_grade="Class 10",
        subject="Science",
        language="hi"
    )
    assert res["has_sufficient_evidence"] is True
    assert len(res["passages"]) > 0
    top = res["passages"][0]
    assert top["board"] == "ncert"

def test_early_childhood_lkg():
    res = rag_service.retrieve_passages(
        query="What are Tamil Uyir Ezhuthukkal?",
        board="early_learning",
        class_grade="LKG",
        subject="Foundational Literacy & Phonics",
        language="ta"
    )
    assert res["has_sufficient_evidence"] is True
    assert len(res["passages"]) > 0

def test_insufficient_evidence_fallback():
    # An out-of-syllabus query that cannot be grounded in Class 10 school textbooks
    res = ai_service.generate_answer(
        query="How to construct a quantum teleportation circuit using Shor's algorithm?",
        board="tn_state_board",
        class_grade="Class 10",
        subject="Science",
        response_language="ta"
    )
    assert res["has_sufficient_evidence"] is False
    # Exact Tamil fallback string from prompt
    assert res["answer"] == Config.FALLBACK_MESSAGES["ta"]

    res_en = ai_service.generate_answer(
        query="How to construct a quantum teleportation circuit using Shor's algorithm?",
        board="tn_state_board",
        class_grade="Class 10",
        subject="Science",
        response_language="en"
    )
    assert res_en["has_sufficient_evidence"] is False
    assert res_en["answer"] == Config.FALLBACK_MESSAGES["en"]

def test_followup_question_resolution():
    history = [
        {"query": "Newton's second law of motion", "answer": "F = ma"}
    ]
    # Follow up with pronoun "What is its SI unit?"
    res = ai_service.generate_answer(
        query="What is its SI unit?",
        board="tn_state_board",
        class_grade="Class 10",
        subject="Science",
        response_language="en",
        history=history
    )
    assert res["has_sufficient_evidence"] is True
    assert "Newton" in res["answer"]
    assert res["citations"][0]["chapter_number"] == 1

if __name__ == "__main__":
    pytest.main(["-v", __file__])
