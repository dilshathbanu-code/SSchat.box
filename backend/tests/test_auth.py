import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from services.auth_service import auth_service

def test_student_registration_and_login():
    test_email = "test_student_unique@sschatbox.edu"
    test_pass = "SecurePass123!"

    # Clean existing if present
    if test_email in auth_service.users:
        del auth_service.users[test_email]

    # Test registration
    reg_res = auth_service.register(
        email=test_email,
        password=test_pass,
        name="Test Final Year BCA Student",
        board="tn_state_board",
        class_grade="Class 10",
        preferred_lang="ta"
    )
    assert reg_res["success"] is True
    assert "token" in reg_res

    # Test login with correct password
    login_res = auth_service.login(email=test_email, password=test_pass)
    assert login_res["success"] is True
    assert login_res["user"]["email"] == test_email

    # Test login with wrong password
    wrong_login = auth_service.login(email=test_email, password="WrongPassword")
    assert wrong_login["success"] is False

    # Test session resolution
    user = auth_service.get_user_by_token(login_res["token"])
    assert user is not None
    assert user["email"] == test_email

if __name__ == "__main__":
    pytest.main(["-v", __file__])
