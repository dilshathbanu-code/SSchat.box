import sqlite3
import json
import time
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from config import Config

class DatabaseService:
    def __init__(self):
        self.db_path = Config.DATA_DIR / "sschatbox.db"
        self._init_sqlite()
        self._migrate_existing_json_data()

    def _get_connection(self) -> sqlite3.Connection:
        """Returns a thread-safe connection with dictionary-like row factories."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(self.db_path), timeout=30.0, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        # Optimize for multi-client concurrent operations
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA busy_timeout = 5000;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        return conn

    def _init_sqlite(self):
        """Initializes tables if they do not exist."""
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # 1. Users Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    board TEXT NOT NULL DEFAULT 'tn_state_board',
                    class_grade TEXT NOT NULL DEFAULT 'Class 10',
                    preferred_language TEXT NOT NULL DEFAULT 'en',
                    role TEXT NOT NULL DEFAULT 'student',
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL
                );
            """)

            # 2. Chat Messages Table (Isolated per student or guest session)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    session_id TEXT NOT NULL,
                    query TEXT NOT NULL,
                    board TEXT NOT NULL,
                    class_grade TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    language TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    explanation TEXT,
                    example TEXT,
                    citations_json TEXT,
                    has_sufficient_evidence INTEGER NOT NULL DEFAULT 1,
                    verification_status TEXT,
                    ai_engine TEXT,
                    created_at REAL NOT NULL
                );
            """)

            # 3. Saved Notes Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS saved_notes (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    citation_json TEXT,
                    created_at REAL NOT NULL
                );
            """)

            # 4. Quiz Submissions Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS quiz_submissions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    session_id TEXT,
                    score INTEGER NOT NULL,
                    total_questions INTEGER NOT NULL,
                    details_json TEXT,
                    created_at REAL NOT NULL
                );
            """)

            # Indexes for fast concurrent queries
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_session_id ON chat_messages(session_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_notes_user_id ON saved_notes(user_id);")
            conn.commit()

    def _migrate_existing_json_data(self):
        """Safely imports legacy users.json and chat_history.json into the relational database."""
        users_file = Config.USER_STORE_PATH
        if users_file.exists():
            try:
                with open(users_file, "r", encoding="utf-8") as f:
                    legacy_users = json.load(f)
                with self._get_connection() as conn:
                    cursor = conn.cursor()
                    for email, u in legacy_users.items():
                        cursor.execute("SELECT id FROM users WHERE email = ?", (email.lower(),))
                        if not cursor.fetchone():
                            uid = u.get("id") or str(uuid.uuid4())
                            now = u.get("created_at") or time.time()
                            cursor.execute("""
                                INSERT INTO users (id, email, name, password_hash, board, class_grade, preferred_language, role, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                uid,
                                email.lower(),
                                u.get("name", "Student"),
                                u.get("password_hash", ""),
                                u.get("board", "tn_state_board"),
                                u.get("class_grade", "Class 10"),
                                u.get("preferred_language", "en"),
                                u.get("role", "student"),
                                now,
                                now
                            ))
                    conn.commit()
            except Exception as e:
                print(f"[DatabaseService] Note: Could not migrate legacy users: {e}")

        # Migrate legacy chat history if chat_messages table is empty
        history_file = Config.HISTORY_STORE_PATH
        if history_file.exists():
            try:
                with self._get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute("SELECT COUNT(*) as count FROM chat_messages")
                    count = cursor.fetchone()["count"]
                    if count == 0:
                        with open(history_file, "r", encoding="utf-8") as f:
                            legacy_chats = json.load(f)
                        for item in legacy_chats:
                            msg_id = str(uuid.uuid4())
                            citations_str = json.dumps(item.get("citations", []), ensure_ascii=False)
                            cursor.execute("""
                                INSERT INTO chat_messages (
                                    id, user_id, session_id, query, board, class_grade, subject, language,
                                    answer, explanation, example, citations_json, has_sufficient_evidence,
                                    verification_status, ai_engine, created_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                msg_id,
                                None,
                                "legacy_preloaded_session",
                                item.get("query", ""),
                                item.get("board", "tn_state_board"),
                                item.get("class_grade", "Class 10"),
                                item.get("subject", "Science"),
                                item.get("language", "en"),
                                item.get("answer", ""),
                                item.get("explanation", ""),
                                item.get("example", ""),
                                citations_str,
                                1 if item.get("has_sufficient_evidence") else 0,
                                "Verified Curriculum Grounded",
                                "SSchat.box Verified RAG Engine",
                                item.get("timestamp", time.time())
                            ))
                        conn.commit()
            except Exception as e:
                print(f"[DatabaseService] Note: Could not migrate legacy history: {e}")

    # --- User Management Operations ---

    def create_user(
        self,
        email: str,
        password_hash: str,
        name: str,
        board: str = "tn_state_board",
        class_grade: str = "Class 10",
        preferred_lang: str = "en",
        role: str = "student"
    ) -> Dict[str, Any]:
        """Creates a new student account in the database."""
        email = email.strip().lower()
        now = time.time()
        user_id = str(uuid.uuid4())

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (id, email, name, password_hash, board, class_grade, preferred_language, role, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                email,
                name.strip() or "Student",
                password_hash,
                board,
                class_grade,
                preferred_lang,
                role,
                now,
                now
            ))
            conn.commit()

        return self.get_user_by_id(user_id)

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Finds user by email address."""
        if not email:
            return None
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
            row = cursor.fetchone()
            if row:
                return dict(row)
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Finds user by ID."""
        if not user_id:
            return None
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (str(user_id),))
            row = cursor.fetchone()
            if row:
                return dict(row)
        return None

    def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates student profile fields."""
        allowed_fields = ["name", "board", "class_grade", "preferred_language", "password_hash"]
        set_clauses = []
        values = []

        for field in allowed_fields:
            if field in updates:
                set_clauses.append(f"{field} = ?")
                values.append(updates[field])

        if not set_clauses:
            return self.get_user_by_id(user_id)

        set_clauses.append("updated_at = ?")
        values.append(time.time())
        values.append(str(user_id))

        query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, tuple(values))
            conn.commit()

        return self.get_user_by_id(user_id)

    def get_total_users_count(self) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM users")
            return cursor.fetchone()["count"]

    # --- Student-Isolated Chat Operations ---

    def add_chat_message(
        self,
        user_id: Optional[str],
        session_id: str,
        query: str,
        board: str,
        class_grade: str,
        subject: str,
        language: str,
        answer: str,
        explanation: Optional[str] = None,
        example: Optional[str] = None,
        citations: Optional[List[Dict[str, Any]]] = None,
        has_sufficient_evidence: bool = True,
        verification_status: Optional[str] = None,
        ai_engine: Optional[str] = None
    ) -> Dict[str, Any]:
        """Saves a student question & verified answer with strict user/session isolation."""
        msg_id = str(uuid.uuid4())
        now = time.time()
        citations_json = json.dumps(citations or [], ensure_ascii=False)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO chat_messages (
                    id, user_id, session_id, query, board, class_grade, subject, language,
                    answer, explanation, example, citations_json, has_sufficient_evidence,
                    verification_status, ai_engine, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                msg_id,
                str(user_id) if user_id else None,
                str(session_id),
                query,
                board,
                class_grade,
                subject,
                language,
                answer,
                explanation or "",
                example or "",
                citations_json,
                1 if has_sufficient_evidence else 0,
                verification_status or "Verified Authentic Curriculum",
                ai_engine or "SSchat.box Verified Local RAG Engine",
                now
            ))
            conn.commit()

        return {
            "id": msg_id,
            "user_id": user_id,
            "session_id": session_id,
            "query": query,
            "board": board,
            "class_grade": class_grade,
            "subject": subject,
            "language": language,
            "answer": answer,
            "explanation": explanation,
            "example": example,
            "citations": citations or [],
            "has_sufficient_evidence": has_sufficient_evidence,
            "verification_status": verification_status,
            "ai_engine": ai_engine,
            "timestamp": now
        }

    def get_chat_history(
        self,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Retrieves user-isolated chat history.
        - If user_id is provided, returns ONLY that authenticated student's history.
        - If user_id is None and session_id is provided, returns ONLY that specific browser session's history.
        - If neither is provided, returns empty list to prevent data leakage.
        """
        if not user_id and not session_id:
            return []

        with self._get_connection() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("""
                    SELECT * FROM chat_messages
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?
                """, (str(user_id), limit, offset))
            else:
                cursor.execute("""
                    SELECT * FROM chat_messages
                    WHERE user_id IS NULL AND session_id = ?
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?
                """, (str(session_id), limit, offset))

            rows = cursor.fetchall()
            results = []
            for r in rows:
                citations = []
                if r["citations_json"]:
                    try:
                        citations = json.loads(r["citations_json"])
                    except Exception:
                        citations = []

                results.append({
                    "id": r["id"],
                    "query": r["query"],
                    "board": r["board"],
                    "class_grade": r["class_grade"],
                    "subject": r["subject"],
                    "language": r["language"],
                    "answer": r["answer"],
                    "explanation": r["explanation"],
                    "example": r["example"],
                    "citations": citations,
                    "has_sufficient_evidence": bool(r["has_sufficient_evidence"]),
                    "verification_status": r["verification_status"],
                    "ai_engine": r["ai_engine"],
                    "timestamp": r["created_at"]
                })
            return results

    def clear_chat_history(self, user_id: Optional[str] = None, session_id: Optional[str] = None) -> int:
        """Clears chat history ONLY for the requesting student or guest session."""
        if not user_id and not session_id:
            return 0

        with self._get_connection() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("DELETE FROM chat_messages WHERE user_id = ?", (str(user_id),))
            else:
                cursor.execute("DELETE FROM chat_messages WHERE user_id IS NULL AND session_id = ?", (str(session_id),))
            deleted_count = cursor.rowcount
            conn.commit()
            return deleted_count

    def get_total_messages_count(self) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM chat_messages")
            return cursor.fetchone()["count"]

    # --- Saved Notes Operations ---

    def save_note(self, user_id: str, title: str, content: str, citation: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        note_id = str(uuid.uuid4())
        now = time.time()
        citation_str = json.dumps(citation or {}, ensure_ascii=False)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO saved_notes (id, user_id, title, content, citation_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (note_id, str(user_id), title, content, citation_str, now))
            conn.commit()

        return {
            "id": note_id,
            "user_id": user_id,
            "title": title,
            "content": content,
            "citation": citation or {},
            "created_at": now
        }

    def get_user_notes(self, user_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM saved_notes WHERE user_id = ? ORDER BY created_at DESC", (str(user_id),))
            rows = cursor.fetchall()
            notes = []
            for r in rows:
                citation = {}
                if r["citation_json"]:
                    try:
                        citation = json.loads(r["citation_json"])
                    except Exception:
                        pass
                notes.append({
                    "id": r["id"],
                    "title": r["title"],
                    "content": r["content"],
                    "citation": citation,
                    "created_at": r["created_at"]
                })
            return notes

    def delete_note(self, note_id: str, user_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM saved_notes WHERE id = ? AND user_id = ?", (str(note_id), str(user_id)))
            conn.commit()
            return cursor.rowcount > 0

db_service = DatabaseService()
