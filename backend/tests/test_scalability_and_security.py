import pytest
import sys
import json
import time
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app import create_app
from services.auth_service import auth_service
from services.db_service import db_service
from services.jwt_service import jwt_service

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_check_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["database"]["status"] == "connected"
    assert data["rag_engine"]["indexed_textbook_passages"] > 0

def test_jwt_generation_and_tampering():
    token = jwt_service.generate_token(
        user_id="test_uid_999",
        email="student99@sschatbox.edu",
        name="Student 99"
    )
    assert token is not None
    # Valid verification
    payload = jwt_service.verify_token(token)
    assert payload is not None
    assert payload["sub"] == "test_uid_999"
    assert payload["email"] == "student99@sschatbox.edu"

    # Tampered token verification must fail
    tampered = token[:-4] + "abcd"
    assert jwt_service.verify_token(tampered) is None

    # Expired token verification must fail
    expired_token = jwt_service.generate_token(
        user_id="test_uid_expired",
        email="expired@sschatbox.edu",
        name="Expired Student",
        expires_in_seconds=-10
    )
    assert jwt_service.verify_token(expired_token) is None

def test_multi_student_chat_isolation(client):
    """
    Critical requirement: Two different students accessing the website must have
    completely isolated chat sessions. Student A must NEVER see Student B's chat history.
    """
    email_a = "student_alpha@sschatbox.edu"
    email_b = "student_beta@sschatbox.edu"

    # Clean previous if existing
    if email_a in auth_service.users:
        del auth_service.users[email_a]
    if email_b in auth_service.users:
        del auth_service.users[email_b]

    # Register Student A
    reg_a = auth_service.register(email=email_a, password="PasswordA123!", name="Alpha Student")
    token_a = reg_a["token"]

    # Register Student B
    reg_b = auth_service.register(email=email_b, password="PasswordB123!", name="Beta Student")
    token_b = reg_b["token"]

    # Student A asks a question
    res_a = client.post(
        "/api/chat/ask",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "query": "Newton's first law of motion",
            "board": "tn_state_board",
            "class_grade": "Class 10",
            "subject": "Science",
            "language": "en"
        }
    )
    assert res_a.status_code == 200

    # Student B asks a completely different question
    res_b = client.post(
        "/api/chat/ask",
        headers={"Authorization": f"Bearer {token_b}"},
        json={
            "query": "Photosynthesis process and xylem",
            "board": "tn_state_board",
            "class_grade": "Class 10",
            "subject": "Science",
            "language": "en"
        }
    )
    assert res_b.status_code == 200

    # Fetch history for Student A
    hist_a_res = client.get("/api/chat/history", headers={"Authorization": f"Bearer {token_a}"})
    assert hist_a_res.status_code == 200
    hist_a = hist_a_res.get_json()["history"]
    queries_a = [item["query"] for item in hist_a]
    assert "Newton's first law of motion" in queries_a
    assert "Photosynthesis process and xylem" not in queries_a, "SECURITY LEAK: Student A saw Student B's chat!"

    # Fetch history for Student B
    hist_b_res = client.get("/api/chat/history", headers={"Authorization": f"Bearer {token_b}"})
    assert hist_b_res.status_code == 200
    hist_b = hist_b_res.get_json()["history"]
    queries_b = [item["query"] for item in hist_b]
    assert "Photosynthesis process and xylem" in queries_b
    assert "Newton's first law of motion" not in queries_b, "SECURITY LEAK: Student B saw Student A's chat!"

def test_guest_session_isolation(client):
    """
    Two guest students using different browsers/devices (different session_ids)
    must also have isolated sessions.
    """
    sess_1 = "browser_session_guest_111"
    sess_2 = "browser_session_guest_222"

    # Guest 1 asks a question
    client.post(
        "/api/chat/ask",
        json={
            "query": "Guest One Newton query",
            "session_id": sess_1,
            "board": "tn_state_board",
            "class_grade": "Class 10",
            "subject": "Science",
            "language": "en"
        }
    )

    # Guest 2 asks a question
    client.post(
        "/api/chat/ask",
        json={
            "query": "Guest Two Photosynthesis query",
            "session_id": sess_2,
            "board": "tn_state_board",
            "class_grade": "Class 10",
            "subject": "Science",
            "language": "en"
        }
    )

    # Guest 1 checks history
    res_1 = client.get(f"/api/chat/history?session_id={sess_1}")
    hist_1 = [h["query"] for h in res_1.get_json()["history"]]
    assert "Guest One Newton query" in hist_1
    assert "Guest Two Photosynthesis query" not in hist_1

    # Guest 2 checks history
    res_2 = client.get(f"/api/chat/history?session_id={sess_2}")
    hist_2 = [h["query"] for h in res_2.get_json()["history"]]
    assert "Guest Two Photosynthesis query" in hist_2
    assert "Guest One Newton query" not in hist_2

def test_user_profile_update(client):
    email = "profile_test@sschatbox.edu"
    if email in auth_service.users:
        del auth_service.users[email]

    reg = auth_service.register(email=email, password="Password123!", name="Initial Name")
    token = reg["token"]

    # Update profile
    update_res = client.put(
        "/api/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Updated Name",
            "class_grade": "Class 12",
            "preferred_language": "ta"
        }
    )
    assert update_res.status_code == 200
    user = update_res.get_json()["user"]
    assert user["name"] == "Updated Name"
    assert user["class_grade"] == "Class 12"
    assert user["preferred_language"] == "ta"

def test_clear_chat_history(client):
    email = "clear_test@sschatbox.edu"
    if email in auth_service.users:
        del auth_service.users[email]

    reg = auth_service.register(email=email, password="Password123!", name="Clear Student")
    token = reg["token"]

    client.post(
        "/api/chat/ask",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "query": "Temporary question to be cleared",
            "board": "tn_state_board",
            "class_grade": "Class 10",
            "subject": "Science",
            "language": "en"
        }
    )

    # Verify history exists
    h1 = client.get("/api/chat/history", headers={"Authorization": f"Bearer {token}"}).get_json()["history"]
    assert len(h1) > 0

    # Clear history
    clear_res = client.post("/api/chat/clear", headers={"Authorization": f"Bearer {token}"})
    assert clear_res.status_code == 200
    assert clear_res.get_json()["deleted_count"] >= 1

    # Verify history is now empty
    h2 = client.get("/api/chat/history", headers={"Authorization": f"Bearer {token}"}).get_json()["history"]
    assert len(h2) == 0

if __name__ == "__main__":
    pytest.main(["-v", __file__])
