"""
El passwords w el tokens.
- Ma mnekhzon el password metel ma huwe: mnekhzon hash (PBKDF2, bteji ma3 Python).
- Ba3d el login, el user byekhod token (JWT). Byeb3ato ma3 kel request bel header:
      Authorization: Bearer <token>
"""
import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt

# Bel server el 7a2i2i, 7ot SECRET_KEY b environment variable (mesh bel code)
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-secret-key-change-it-on-the-real-server")
TOKEN_DAYS = 7


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
    return f"{salt}${digest}"


def check_password(password, stored_hash):
    salt = stored_hash.split("$", 1)[0]
    return secrets.compare_digest(hash_password(password, salt), stored_hash)


def create_token(user_id):
    expires = datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": expires}, SECRET_KEY, algorithm="HS256")


def read_token(token):
    """Btraje3 el user_id, aw None iza el token 8alat aw khalas."""
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return int(data["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
