import time
import json
import base64
import hmac
import hashlib
from typing import Optional, Dict, Any
from config import Config

try:
    import jwt as pyjwt
    HAS_PYJWT = True
except ImportError:
    HAS_PYJWT = False

class JWTService:
    def __init__(self):
        self.secret = Config.SECRET_KEY or "sschatbox_prod_fallback_secret_key_2026"
        self.algorithm = "HS256"
        self.default_expiry = 7 * 24 * 3600  # 7 days in seconds

    def generate_token(
        self,
        user_id: str,
        email: str,
        name: str,
        role: str = "student",
        expires_in_seconds: Optional[int] = None
    ) -> str:
        """Generates a cryptographically signed HMAC-SHA256 JWT token."""
        expiry = expires_in_seconds if expires_in_seconds is not None else self.default_expiry
        now = int(time.time())
        payload = {
            "sub": str(user_id),
            "email": email.strip().lower(),
            "name": name.strip(),
            "role": role,
            "iat": now,
            "exp": now + expiry
        }

        if HAS_PYJWT:
            return pyjwt.encode(payload, self.secret, algorithm=self.algorithm)

        # Standard-library fallback: base64url encoded header.payload.signature
        header = {"alg": "HS256", "typ": "JWT"}
        def b64url(data: bytes) -> str:
            return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

        encoded_header = b64url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
        encoded_payload = b64url(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
        signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        signature = hmac.new(self.secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
        encoded_signature = b64url(signature)
        return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verifies HMAC-SHA256 signature and checks token expiration."""
        if not token or not isinstance(token, str):
            return None

        # Clean Bearer prefix if mistakenly passed
        if token.lower().startswith("bearer "):
            token = token[7:].strip()

        token = token.strip()
        if not token:
            return None

        if HAS_PYJWT:
            try:
                payload = pyjwt.decode(token, self.secret, algorithms=[self.algorithm])
                return payload
            except Exception:
                return None

        # Standard-library verification
        try:
            parts = token.split(".")
            if len(parts) != 3:
                return None
            encoded_header, encoded_payload, encoded_signature = parts

            def b64url_decode(s: str) -> bytes:
                padding = "=" * (4 - (len(s) % 4)) if len(s) % 4 != 0 else ""
                return base64.urlsafe_b64decode(s + padding)

            signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
            expected_sig = hmac.new(self.secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
            provided_sig = b64url_decode(encoded_signature)

            if not hmac.compare_digest(expected_sig, provided_sig):
                return None

            payload = json.loads(b64url_decode(encoded_payload).decode("utf-8"))
            if int(time.time()) > payload.get("exp", 0):
                return None  # Token expired

            return payload
        except Exception:
            return None

jwt_service = JWTService()
