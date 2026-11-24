# Support Assistant – Customer Support System

Support Assistant is a telecom customer-support website. Users create an account, log in, and describe their problem in **English, Arabic or Lebanese Arabizi**, typed or spoken. The assistant finds a tested fix and answers in the same language. If no fix is found, the problem is passed to an operator.

This repository holds **Phase 1 (Front-End Development)** of the project. The back end (FastAPI) comes in Phase 2.

**Live site:** https://42130834-lgtm.github.io/customer-support-system/

---

## Features

- **Home page** with a hero section, an animated phone demo in 3 languages, "How it works" steps and stats
- **Log in / Sign up** on one animated page, with show/hide password and validation messages
- **Protected chat page**: only logged-in users can open it
- **Chat assistant** that detects the language (English, Arabic, Arabizi) and answers in the same one
- **Voice input** with the microphone (English or Arabic), in browsers that support it
- **Quick suggestions** and **"Solved? Yes / No"** feedback after each answer
- **Accounts saved in localStorage**, with passwords stored as a SHA-256 hash
- **Responsive design** for phones, tablets and computers

## Technologies used

| Technology | Why |
|---|---|
| React 18 | Builds the user interface from reusable components |
| React Router 6 | Moves between pages without reloading the site |
| Vite | Runs the project during development and builds it for the web |
| CSS (own stylesheets) | All the design; one CSS file per page |
| Web Speech API | Turns the user's voice into text |
| localStorage | Keeps accounts and the login session in the browser |
| GitHub Pages | Hosts the live website |

## How to run it on your computer

You need [Node.js](https://nodejs.org) installed.

```bash
npm install        # download the libraries (only the first time)
npm run dev        # start the site
```

Then open the link shown in the terminal (http://localhost:5173/customer-support-system/).

## How to publish it

```bash
npm run deploy
```

This builds the site into the `dist` folder and uploads it to the `gh-pages` branch, which GitHub Pages shows online.

## Project structure

```
src/
  components/
    Nav.jsx             top menu (links, active page, Log out button)
    RequireAuth.jsx     sends the user to Log in if they are not logged in
  data/
    knowledgeBase.js    known problems, their fixes in 3 languages, and language detection
  pages/                one file per page
    Home.jsx, Auth.jsx (log in + sign up), Chat.jsx
  styles/               CSS files (base.css holds colours, the menu and shared styles)
  api.js                all data actions: signup, login, logout, me, chat
  App.jsx               all the routes of the site
  main.jsx              starting point: router
backend/                FastAPI server for Phase 2 (not used by the live site yet)
index.html              the single HTML page React runs in
vite.config.js          Vite settings (base path for GitHub Pages)
```

## How it works (short)

1. `main.jsx` starts React inside `index.html`, wrapped in `BrowserRouter`.
2. `App.jsx` picks the page to show from the link. `/chat` is wrapped in `RequireAuth`, which checks the session first.
3. Every page talks to `api.js` only. In Phase 1, `api.js` saves accounts in localStorage and gets answers from `data/knowledgeBase.js`.
4. The chat detects the language (Arabic letters → Arabic; numbers like 3, 7, 2 inside words or words like "ktir" → Arabizi; otherwise English), scores each known problem by its keywords, and returns the fix in that language.
5. In Phase 2, only `api.js` changes: each function will call the FastAPI server (`/api/...`) instead. The pages stay the same.

## Notes

- This is a front-end demo: accounts live only in the browser they were created in.
- Voice input works in Chrome and Edge.

## Author

Your Name – Lebanese International University
