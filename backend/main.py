import hashlib
import json
import re
import secrets
from pathlib import Path

from fastapi import Cookie, FastAPI, HTTPException, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

BASE = Path(__file__).parent
USERS_FILE = BASE / "users.json"
DIST = BASE.parent / "dist"  # React build (npm run build)


# ---------- 1. Users (ma7fouzin b file, ma byro7o ba3d el restart) ----------
def load_users():
    if USERS_FILE.exists():
        return json.loads(USERS_FILE.read_text(encoding="utf-8"))
    return {}


def save_users():
    USERS_FILE.write_text(json.dumps(users_db, ensure_ascii=False, indent=2), encoding="utf-8")


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()
    return f"{salt}${h}"


def check_password(password, stored):
    salt, _ = stored.split("$", 1)
    return secrets.compare_digest(hash_password(password, salt), stored)


users_db = load_users()
sessions = {}  # token -> email


# ---------- 2. Session helpers ----------
def current_user(token):
    email = sessions.get(token) if token else None
    if not email or email not in users_db:
        raise HTTPException(status_code=401, detail="Not logged in")
    return users_db[email]


def start_session(response: Response, email):
    token = secrets.token_urlsafe(32)
    sessions[token] = email
    response.set_cookie("token", token, httponly=True, samesite="lax", max_age=60 * 60 * 24 * 7)


# ---------- 3. Auth API ----------
class SignupIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


@app.post("/api/signup")
async def signup(data: SignupIn):
    email = data.email.strip().lower()
    if not data.name.strip() or "@" not in email:
        raise HTTPException(status_code=400, detail="Please fill all fields correctly")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be 6+ characters")
    if email in users_db:
        raise HTTPException(status_code=409, detail="This email is already registered")
    users_db[email] = {"name": data.name.strip(), "email": email, "password": hash_password(data.password)}
    save_users()
    return {"ok": True}


@app.post("/api/login")
async def login(data: LoginIn, response: Response):
    email = data.email.strip().lower()
    user = users_db.get(email)
    if not user or not check_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    start_session(response, email)
    return {"name": user["name"], "email": email}


@app.post("/api/logout")
async def logout(response: Response, token: str | None = Cookie(default=None)):
    sessions.pop(token, None)
    response.delete_cookie("token")
    return {"ok": True}


@app.get("/api/me")
async def me(token: str | None = Cookie(default=None)):
    user = current_user(token)
    return {"name": user["name"], "email": user["email"]}


# ---------- 4. Chat ----------
class ChatIn(BaseModel):
    message: str


KB = [
    {"kw": ["slow", "بطيء", "تقيل", "batii2", "bati2", "batii", "tqil", "t2il", "ثقيل", "بطئ"],
     "en": "Restart your router, wait 30 seconds, then check your data package.",
     "ar": "أعد تشغيل الراوتر وانتظر 30 ثانية، ثم تأكد من باقة الداتا.",
     "arabizi": "A3ed tashghil l router w estanna 30 sanye, baden etakked mn bakit l data."},
    {"kw": ["balance", "رصيد", "rased", "rasid", "رصيدي"],
     "en": "Dial *100# to check your balance.",
     "ar": "اطلب *100# لمعرفة رصيدك.",
     "arabizi": "Utlob *100# la ta3ref rasidak."},
    {"kw": ["signal", "network", "شبكة", "تغطية", "shabake", "ma fi", "no service"],
     "en": "Turn airplane mode on for 10 seconds, then off.",
     "ar": "شغّل وضع الطيران 10 ثواني ثم أطفئه.",
     "arabizi": "Shaghel airplane mode 10 sawene w baden tfiyo."},
]

ARABIZI_WORDS = {"ktir", "shu", "kef", "kif", "mesh", "msh", "bade", "baddi", "ma3", "w", "el", "fi", "bshuf"}


def detect_lang(t):
    if any("؀" <= c <= "ۿ" for c in t):
        return "ar"
    words = re.findall(r"[a-z0-9']+", t.lower())
    for w in words:
        if w in ARABIZI_WORDS:
            return "arabizi"
        # kelme fiya 7rouf + ra2am 2/3/5/7 (batii2, 3am, 7al) - bas mesh "5g" aw "4g"
        if re.search(r"[a-z]", w) and re.search(r"[2357]", w) and not re.fullmatch(r"\d+g", w):
            return "arabizi"
    return "en"


@app.post("/api/chat")
async def api_chat(data: ChatIn, token: str | None = Cookie(default=None)):
    current_user(token)  # lazem ykoun 3emel login
    text = data.message.lower()
    lang = detect_lang(data.message)
    best, best_score = None, 0
    for item in KB:
        score = sum(1 for k in item["kw"] if k.lower() in text)
        if score > best_score:
            best, best_score = item, score
    if best:
        return {"answer": best[lang], "lang": lang, "escalate": False}
    msgs = {"en": "I could not find a solution. An operator will help you.",
            "ar": "لم أجد حلاً. سيساعدك أحد الموظفين.",
            "arabizi": "Ma la2ayt 7al. Operator ra7 ysa3dak."}
    return {"answer": msgs[lang], "lang": lang, "escalate": True}


# ---------- 5. React build (production) ----------
# Bel development, Vite bi khaddem el React 3a port 5173.
# Ba3d "npm run build", FastAPI bi khaddem kel shi men hon.
if DIST.exists():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{path:path}")
    async def spa(path: str):
        file = DIST / path
        if path and file.is_file():
            return FileResponse(file)
        return FileResponse(DIST / "index.html")
