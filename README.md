# Support Assistant – Customer Support System

Support Assistant is a telecom customer-support website. Users create an account, log in, and describe their problem in **English, Arabic or Lebanese Arabizi**, typed or spoken. The assistant finds a tested fix and answers in the same language. If no fix is found, the problem is passed to an operator.

The project has a **React front end** and a **FastAPI back end** with a SQLite database. The back end stores accounts (hashed passwords), all chat messages and the tickets sent to operators.

**Live site:** https://42130834-lgtm.github.io/customer-support-system/

---

## Features

- **Home page** with a hero section, an animated phone demo in 3 languages, "How it works" steps and stats
- **Log in** and **Sign up** pages, with show/hide password and validation messages
- **Protected chat page**: only logged-in users can open it
- **Chat assistant** that detects the language (English, Arabic, Arabizi) and answers in the same one
- **Voice input** with the microphone (English or Arabic), in browsers that support it
- **Quick suggestions** and **"Solved? Yes / No"** feedback after each answer
- **Back end with a database**: accounts with hashed passwords, login tokens, saved chat history and tickets
- **Operator dashboard**: open and resolved tickets, a live conversation with the customer, and Resolve
- **404 page** for links that do not exist
- **Menu button** on small screens
- **Responsive design** for phones, tablets and computers

## Technologies used

| Technology | Why |
|---|---|
| React 18 | Builds the user interface from reusable components |
| React Router 6 | Moves between pages without reloading the site |
| Vite | Runs the project during development and builds it for the web |
| CSS (own stylesheets) | All the design; one CSS file per page in the styles folder |
| Web Speech API | Turns the user's voice into text |
| Context API (useContext) | Shares the logged-in user with every page |
| localStorage | Keeps the login token in the browser |
| FastAPI (Python) | The back end API |
| SQLite | The database |
| JWT | Login tokens |
| GitHub Pages | Hosts the live website |

## How to run it on your computer

You need [Node.js](https://nodejs.org) and [Python 3.10+](https://www.python.org). Use **two terminals**.

**Terminal 1 – back end**

```bash
cd backend
python -m venv venv            # only the first time
venv\Scripts\activate           # Windows (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt   # only the first time
uvicorn main:app --reload
```

The API runs at http://127.0.0.1:8000. Try every endpoint at http://127.0.0.1:8000/docs.

**Terminal 2 – front end**

```bash
npm install        # only the first time
npm run dev
```

Then open http://localhost:5173/customer-support-system/. During development, Vite sends every `/api/...` request to the back end (see `vite.config.js`).

## How to publish it

```bash
npm run deploy
```

This builds the front end and uploads it to the `gh-pages` branch. The live site needs the back end online too: put the back end's link in a file `.env.production` as `VITE_API_URL=https://...` before deploying.

## Making an operator

Sign up normally, then in the `backend` folder (with the venv active):

```bash
python make_operator.py your@email.com
```

Log out and log in again: the menu shows **Tickets**.

## Project structure

```
backend/
  main.py               the API routes (signup, login, me, chat, feedback, history)
  database.py           SQLite database: tables and all SQL queries
  security.py           password hashing and login tokens (JWT)
  knowledge_base.py     known problems, language detection, find_answer()
  make_operator.py      gives a user the operator role
  requirements.txt      Python libraries
src/
  api.js                apiRequest(): every call to the back end goes through here (adds the token)
  components/
    Navbar.jsx          top menu; changes when the user is logged in; menu button on small screens
    Footer.jsx          bottom of every page (not on the chat page)
    PasswordInput.jsx   password field with a show/hide button (used by Log in and Sign up)
  context/
    AuthContext.jsx     the logged-in user and token, shared by the whole site (useContext + localStorage)
  pages/                one file per page
    Home.jsx, Login.jsx, Signup.jsx, Chat.jsx, Operator.jsx, NotFound.jsx
  styles/               CSS files (App.css holds colours, layout and shared animations)
  utils/
    language.js         isArabic(): right-to-left messages
  App.jsx               all the routes of the site
  main.jsx              starting point: router + auth provider
index.html              the single HTML page React runs in
vite.config.js          Vite settings (base path for GitHub Pages, /api proxy)
```

## API

| Method | Path | Login needed | What it does |
|---|---|---|---|
| POST | /api/auth/signup | No | Creates an account (password stored hashed) |
| POST | /api/auth/login | No | Checks email and password, returns a token |
| GET | /api/auth/me | Yes | Returns the logged-in user |
| POST | /api/chat | Yes | Saves the message, returns the answer; no answer → opens a ticket. If the user has an open ticket, the message goes to the operator instead |
| POST | /api/feedback | Yes | "Solved? Yes / No"; No → opens a ticket |
| GET | /api/chat/history?after=ID | Yes | Messages newer than ID (the chat asks every 4 seconds), and whether a ticket is open |
| GET | /api/tickets?status=open | Operator | Open or resolved tickets, with the customer and the message |
| GET | /api/tickets/{id}/messages | Operator | The whole conversation of a ticket |
| POST | /api/tickets/{id}/reply | Operator | Sends a message to the customer's chat |
| POST | /api/tickets/{id}/resolve | Operator | Closes the ticket; the last operator message is saved as the solution |

"Login needed" means the request carries the header `Authorization: Bearer <token>`.

## Database

| Table | Holds |
|---|---|
| users | name, email, password hash, role (customer / operator / admin) |
| messages | every user, bot and operator message, its language, and its ticket (if any) |
| tickets | problems sent to an operator (open / resolved) and the final solution |

## How it works (short)

1. `main.jsx` starts React, wrapped in `BrowserRouter` (pages) and `AuthProvider` (logged-in user).
2. `App.jsx` picks the page from the link. `/chat` opens only for a logged-in user; otherwise it goes to Log in.
3. Log in and Sign up use `useState`, one `handleChange`, and `validate()` before sending anything. Then `AuthContext` calls the back end. After login, the token is kept in localStorage and sent with every request by `api.js`.
4. The chat sends each message to `POST /api/chat`. The back end detects the language (Arabic letters → Arabic; numbers like 3, 7, 2 inside words or words like "ktir" → Arabizi; otherwise English), finds the problem with the most matching keywords, saves both messages, and answers in the same language. No match → a ticket is opened for an operator.
5. When a ticket is open, everything the customer writes goes to the operator instead of the assistant. Operators open `/operator`, pick a ticket, and chat with the customer. Both pages check for new messages every 4 seconds. **Resolve** closes the ticket, saves the operator's last answer as the solution (training data for the model later), and the customer is back with the assistant.
6. Next step: a trained machine-learning model in place of keyword matching (`find_answer` in `knowledge_base.py`).

## Notes

- The database file `backend/support.db` is created on first run and is not uploaded to GitHub.
- Voice input works in Chrome and Edge.

## Author

Your Name – Lebanese International University
