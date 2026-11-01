import time
import uuid
from typing import Dict, Any, Optional
from werkzeug.security import generate_password_hash, check_password_hash
from services.db_service import db_service
from services.jwt_service import jwt_service

class UserDictProxy:
    """Provides dictionary-like backward compatibility for tests and legacy access."""
    def __contains__(self, email: str) -> bool:
        return db_service.get_user_by_email(email) is not None

    def __getitem__(self, email: str) -> Dict[str, Any]:
        u = db_service.get_user_by_email(email)
        if not u:
            raise KeyError(email)
        return u

    def __setitem__(self, email: str, user_dict: Dict[str, Any]):
        existing = db_service.get_user_by_email(email)
        if existing:
            db_service.update_user_profile(existing["id"], user_dict)
        else:
            db_service.create_user(
                email=email,
                password_hash=user_dict.get("password_hash", generate_password_hash("Student@123")),
                name=user_dict.get("name", "Student"),
                board=user_dict.get("board", "tn_state_board"),
                class_grade=user_dict.get("class_grade", "Class 10"),
                preferred_lang=user_dict.get("preferred_language", "en"),
                role=user_dict.get("role", "student")
            )

    def __delitem__(self, email: str):
        u = db_service.get_user_by_email(email)
        if u:
            with db_service._get_connection() as conn:
                conn.execute("DELETE FROM users WHERE id = ?", (u["id"],))
                conn.commit()

    def get(self, email: str, default=None):
        u = db_service.get_user_by_email(email)
        return u if u is not None else default

    def values(self):
        with db_service._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users")
            return [dict(r) for r in cursor.fetchall()]

    def __len__(self) -> int:
        return db_service.get_total_users_count()


class AuthService:
    def __init__(self):
        self.users = UserDictProxy()
        self._ensure_demo_user()

    def _ensure_demo_user(self):
        """Ensures the demo evaluator student account is available."""
        demo_email = "student@sschatbox.edu"
        existing = db_service.get_user_by_email(demo_email)
        if not existing:
            db_service.create_user(
                email=demo_email,
                password_hash=generate_password_hash("Student@123"),
                name="BCA Demo Student",
                board="tn_state_board",
                class_grade="Class 10",
                preferred_lang="ta",
                role="student"
            )

    def register(
        self,
        email: str,
        password: str,
        name: str,
        board: str = "tn_state_board",
        class_grade: str = "Class 10",
        preferred_lang: str = "en"
    ) -> Dict[str, Any]:
        email = email.strip().lower()
        if not email or "@" not in email:
            return {"success": False, "message": "Invalid email address format."}
        if len(password) < 6:
            return {"success": False, "message": "Password must be at least 6 characters long."}

        existing = db_service.get_user_by_email(email)
        if existing:
            return {"success": False, "message": "An account with this email already exists."}

        hashed = generate_password_hash(password)
        new_user = db_service.create_user(
            email=email,
            password_hash=hashed,
            name=name.strip() or "Student",
            board=board,
            class_grade=class_grade,
            preferred_lang=preferred_lang,
            role="student"
        )

        token = jwt_service.generate_token(
            user_id=new_user["id"],
            email=new_user["email"],
            name=new_user["name"],
            role=new_user["role"]
        )

        return {
            "success": True,
            "message": "Student registration successful.",
            "token": token,
            "user": {
                "id": new_user["id"],
                "email": new_user["email"],
                "name": new_user["name"],
                "board": new_user["board"],
                "class_grade": new_user["class_grade"],
                "preferred_language": new_user["preferred_language"]
            }
        }

    def login(self, email: str, password: str) -> Dict[str, Any]:
        email = email.strip().lower()
        user = db_service.get_user_by_email(email)
        if not user:
            return {"success": False, "message": "Incorrect email or password."}

        if not check_password_hash(user["password_hash"], password):
            return {"success": False, "message": "Incorrect email or password."}

        token = jwt_service.generate_token(
            user_id=user["id"],
            email=user["email"],
            name=user.get("name", "Student"),
            role=user.get("role", "student")
        )

        return {
            "success": True,
            "message": "Login successful.",
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user.get("name", "Student"),
                "board": user.get("board", "tn_state_board"),
                "class_grade": user.get("class_grade", "Class 10"),
                "preferred_language": user.get("preferred_language", "en")
            }
        }

    def get_user_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Resolves authenticated student from JWT token."""
        if not token:
            return None

        # Verify JWT token
        payload = jwt_service.verify_token(token)
        if payload and "sub" in payload:
            user = db_service.get_user_by_id(payload["sub"])
            if user:
                return {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user.get("name"),
                    "board": user.get("board"),
                    "class_grade": user.get("class_grade"),
                    "preferred_language": user.get("preferred_language")
                }

        # Fallback for legacy format token_{uid}_{ts} during rolling upgrades
        if token.startswith("token_"):
            parts = token.split("_")
            if len(parts) >= 2:
                uid = parts[1]
                user = db_service.get_user_by_id(uid)
                if user:
                    return {
                        "id": user["id"],
                        "email": user["email"],
                        "name": user.get("name"),
                        "board": user.get("board"),
                        "class_grade": user.get("class_grade"),
                        "preferred_language": user.get("preferred_language")
                    }

        return None

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Updates student curriculum preferences or name."""
        user = db_service.get_user_by_id(user_id)
        if not user:
            return {"success": False, "message": "User not found."}

        cleaned_updates = {}
        if "name" in updates and updates["name"].strip():
            cleaned_updates["name"] = updates["name"].strip()
        if "board" in updates and updates["board"].strip():
            cleaned_updates["board"] = updates["board"].strip()
        if "class_grade" in updates and updates["class_grade"].strip():
            cleaned_updates["class_grade"] = updates["class_grade"].strip()
        if "preferred_language" in updates and updates["preferred_language"].strip():
            cleaned_updates["preferred_language"] = updates["preferred_language"].strip()

        updated = db_service.update_user_profile(user_id, cleaned_updates)
        return {
            "success": True,
            "message": "Profile updated successfully.",
            "user": {
                "id": updated["id"],
                "email": updated["email"],
                "name": updated["name"],
                "board": updated["board"],
                "class_grade": updated["class_grade"],
                "preferred_language": updated["preferred_language"]
            }
        }

    def change_password(self, user_id: str, old_password: str, new_password: str) -> Dict[str, Any]:
        """Changes student password with current password verification."""
        user = db_service.get_user_by_id(user_id)
        if not user:
            return {"success": False, "message": "User not found."}

        if not check_password_hash(user["password_hash"], old_password):
            return {"success": False, "message": "Current password is incorrect."}

        if len(new_password) < 6:
            return {"success": False, "message": "New password must be at least 6 characters long."}

        new_hash = generate_password_hash(new_password)
        db_service.update_user_profile(user_id, {"password_hash": new_hash})
        return {"success": True, "message": "Password changed successfully."}

auth_service = AuthService()
