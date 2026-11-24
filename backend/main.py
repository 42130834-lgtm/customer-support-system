"""
Support Assistant - backend (FastAPI)

Shaghlo:   uvicorn main:app --reload
Jarrbo:    http://127.0.0.1:8000/docs
"""
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import database as db
from knowledge_base import find_answer
from security import check_password, create_token, hash_password, read_token

app = FastAPI(title="Support Assistant API")

# CORS: min mesmo7 yeke el backend men el browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                 # React 3al jihaz (npm run dev)
        "http://127.0.0.1:5173",
        "https://42130834-lgtm.github.io",       # el site 3al GitHub Pages
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bya3mel el tables iza mesh mawjoudin
db.create_tables()


# ---------------- Shu byeb3at el frontend ----------------
class SignupIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class ChatIn(BaseModel):
    message: str


class FeedbackIn(BaseModel):
    message_id: int
    solved: bool


class ResolveIn(BaseModel):
    solution: str


# ---------------- Min 3am yeke? ----------------
def current_user(authorization: str = Header(default="")):
    """Kel route fiha Depends(current_user) lazem el user ykoun 3emel login."""
    token = authorization.removeprefix("Bearer ").strip()
    user_id = read_token(token) if token else None
    user = db.get_user_by_id(user_id) if user_id else None
    if not user:
        raise HTTPException(status_code=401, detail="Please log in again.")
    return user


def current_operator(user=Depends(current_user)):
    """Bas el operator (aw el admin) fi yshuf el tickets."""
    if user["role"] not in ("operator", "admin"):
        raise HTTPException(status_code=403, detail="Operators only.")
    return user


def public_user(user):
    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}


# ---------------- Auth ----------------
@app.post("/api/auth/signup")
def signup(data: SignupIn):
    name = data.name.strip()
    email = data.email.strip().lower()
    if not name:
        raise HTTPException(status_code=400, detail="Please enter your name.")
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email.")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password should have at least 6 characters.")
    if db.get_user_by_email(email):
        raise HTTPException(status_code=409, detail="This email is already registered.")

    db.create_user(name, email, hash_password(data.password))
    return {"ok": True}


@app.post("/api/auth/login")
def login(data: LoginIn):
    user = db.get_user_by_email(data.email.strip().lower())
    if not user or not check_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Wrong email or password.")
    return {"token": create_token(user["id"]), "user": public_user(user)}


@app.get("/api/auth/me")
def me(user=Depends(current_user)):
    return public_user(user)


# ---------------- Chat ----------------
@app.post("/api/chat")
def chat(data: ChatIn, user=Depends(current_user)):
    text = data.message.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty message.")

    reply = find_answer(text)
    user_msg_id = db.save_message(user["id"], "user", text, reply["language"])
    bot_msg_id = db.save_message(
        user["id"], "bot", reply["answer"], reply["language"], reply["escalate"], reply_to=user_msg_id
    )

    # Ma la2a 7al: ticket lal operator
    if reply["escalate"]:
        db.create_ticket(user["id"], user_msg_id)

    return {"answer": reply["answer"], "escalate": reply["escalate"], "message_id": bot_msg_id}


@app.post("/api/feedback")
def feedback(data: FeedbackIn, user=Depends(current_user)):
    msg = db.get_message(data.message_id)
    if not msg or msg["user_id"] != user["id"] or msg["sender"] != "bot":
        raise HTTPException(status_code=404, detail="Message not found.")

    db.set_solved(msg["id"], data.solved)

    # El 7al ma zabat: ticket lal operator 3al message taba3 el user
    if not data.solved:
        db.create_ticket(user["id"], msg["reply_to"])
    return {"ok": True}


@app.get("/api/chat/history")
def history(user=Depends(current_user)):
    return [
        {"id": m["id"], "from": m["sender"], "text": m["text"], "escalated": bool(m["escalated"])}
        for m in db.get_history(user["id"])
    ]


# ---------------- Operator ----------------
@app.get("/api/tickets")
def tickets(status: str = "open", operator=Depends(current_operator)):
    if status not in ("open", "resolved"):
        raise HTTPException(status_code=400, detail="Status must be open or resolved.")
    return {"counts": db.count_tickets(), "tickets": [dict(t) for t in db.list_tickets(status)]}


@app.post("/api/tickets/{ticket_id}/resolve")
def resolve(ticket_id: int, data: ResolveIn, operator=Depends(current_operator)):
    ticket = db.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    if ticket["status"] == "resolved":
        raise HTTPException(status_code=400, detail="This ticket is already resolved.")
    solution = data.solution.strip()
    if not solution:
        raise HTTPException(status_code=400, detail="Please write the solution.")

    db.resolve_ticket(ticket_id, solution)
    # El jawab byetla3 lal customer bel chat taba3o
    db.save_message(ticket["user_id"], "operator", solution, reply_to=ticket["message_id"])
    return {"ok": True}
