"""
El database: SQLite (file wa7ad esmo support.db, bya3mel 7alo).
Kel el SQL bel project hon, bi functions bas.
Ba3den fina nenkol la PostgreSQL bala ma net8ayyar el routes.
"""
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime

DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "support.db"))


@contextmanager
def connect():
    """Byefta7 el database, ba3den bi7faz el ta8yirat w bisakkerha."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # hek kel row metel dict: row["email"]
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def now():
    return datetime.now().isoformat(timespec="seconds")


def create_tables():
    with connect() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT NOT NULL,
            email         TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role          TEXT NOT NULL DEFAULT 'customer',   -- customer / operator / admin
            created_at    TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id),
            sender     TEXT NOT NULL,          -- user / bot / operator
            text       TEXT NOT NULL,
            language   TEXT,                   -- en / ar / arabizi
            escalated  INTEGER NOT NULL DEFAULT 0,
            reply_to   INTEGER REFERENCES messages(id),  -- jawab el bot 3ala ayya message
            solved     INTEGER,                -- NULL = ma jaweb, 1 = eh, 0 = la
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tickets (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            message_id  INTEGER NOT NULL REFERENCES messages(id),  -- el message taba3 el user
            status      TEXT NOT NULL DEFAULT 'open',              -- open / resolved
            solution    TEXT,
            created_at  TEXT NOT NULL,
            resolved_at TEXT
        );
        """)


# ---------------- users ----------------
def create_user(name, email, password_hash):
    with connect() as conn:
        cur = conn.execute(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (name, email, password_hash, now()),
        )
        return cur.lastrowid


def get_user_by_email(email):
    with connect() as conn:
        return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def get_user_by_id(user_id):
    with connect() as conn:
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


# ---------------- messages ----------------
def save_message(user_id, sender, text, language=None, escalated=False, reply_to=None):
    with connect() as conn:
        cur = conn.execute(
            "INSERT INTO messages (user_id, sender, text, language, escalated, reply_to, created_at)"
            " VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, sender, text, language, int(escalated), reply_to, now()),
        )
        return cur.lastrowid


def get_message(message_id):
    with connect() as conn:
        return conn.execute("SELECT * FROM messages WHERE id = ?", (message_id,)).fetchone()


def set_solved(message_id, solved):
    with connect() as conn:
        conn.execute("UPDATE messages SET solved = ? WHERE id = ?", (int(solved), message_id))


def get_history(user_id, limit=50):
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM messages WHERE user_id = ? ORDER BY id DESC LIMIT ?", (user_id, limit)
        ).fetchall()
        return list(reversed(rows))


# ---------------- tickets ----------------
def create_ticket(user_id, message_id):
    with connect() as conn:
        # Ma ne3mel ticket marten la nafs el message
        found = conn.execute("SELECT id FROM tickets WHERE message_id = ?", (message_id,)).fetchone()
        if found:
            return found["id"]
        cur = conn.execute(
            "INSERT INTO tickets (user_id, message_id, created_at) VALUES (?, ?, ?)",
            (user_id, message_id, now()),
        )
        return cur.lastrowid


def get_ticket(ticket_id):
    with connect() as conn:
        return conn.execute("SELECT * FROM tickets WHERE id = ?", (ticket_id,)).fetchone()


def list_tickets(status):
    """El tickets ma3 esm el customer w shu katab (JOIN bayn 3 tables)."""
    with connect() as conn:
        return conn.execute(
            """
            SELECT t.id, t.status, t.solution, t.created_at, t.resolved_at,
                   u.name AS customer_name, u.email AS customer_email,
                   m.text AS message, m.language
            FROM tickets t
            JOIN users u ON u.id = t.user_id
            JOIN messages m ON m.id = t.message_id
            WHERE t.status = ?
            ORDER BY t.id DESC
            """,
            (status,),
        ).fetchall()


def count_tickets():
    with connect() as conn:
        rows = conn.execute("SELECT status, COUNT(*) AS n FROM tickets GROUP BY status").fetchall()
        counts = {"open": 0, "resolved": 0}
        for r in rows:
            counts[r["status"]] = r["n"]
        return counts


def resolve_ticket(ticket_id, solution):
    with connect() as conn:
        conn.execute(
            "UPDATE tickets SET status = 'resolved', solution = ?, resolved_at = ? WHERE id = ?",
            (solution, now(), ticket_id),
        )


def set_role(email, role):
    with connect() as conn:
        cur = conn.execute("UPDATE users SET role = ? WHERE email = ?", (role, email))
        return cur.rowcount
