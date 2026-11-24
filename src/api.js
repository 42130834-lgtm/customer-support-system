// =====================================================================
// FRONTEND-ONLY VERSION
// Halla2 ma fi backend, fa kel shi byeshte8el bel browser:
//   - el users ma7fouzin bel localStorage
//   - el chat byedwar bel knowledge base (src/data/knowledgeBase.js)
//
// Lamma ne3mel el backend (folder backend/), mnebaddel hayda el file bas:
// kel function betsir fetch("/api/..."). El pages ma bteteghayar.
// =====================================================================
import { findAnswer } from "./data/knowledgeBase.js";

const USERS_KEY = "css_users";
const SESSION_KEY = "css_session";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage msakkar (private mode) - ma fina na3mel shi */
  }
}

// Ma mnekhzon el password metel ma huwe - mn7ot el hash (SHA-256)
async function hash(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function currentUser() {
  const email = read(SESSION_KEY, null);
  const user = email && read(USERS_KEY, {})[email];
  if (!user) fail("Not logged in", 401);
  return user;
}

export const api = {
  async signup(name, email, password) {
    await sleep(300);
    email = email.trim().toLowerCase();
    if (!name.trim() || !email.includes("@")) fail("Please fill all fields correctly", 400);
    if (password.length < 6) fail("Password must be 6+ characters", 400);
    const users = read(USERS_KEY, {});
    if (users[email]) fail("This email is already registered", 409);
    users[email] = { name: name.trim(), email, password: await hash(email + ":" + password) };
    write(USERS_KEY, users);
    return { ok: true };
  },

  async login(email, password) {
    await sleep(300);
    email = email.trim().toLowerCase();
    const user = read(USERS_KEY, {})[email];
    if (!user || user.password !== (await hash(email + ":" + password))) fail("Wrong email or password", 401);
    write(SESSION_KEY, email);
    return { name: user.name, email };
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
    return { ok: true };
  },

  async me() {
    const user = currentUser();
    return { name: user.name, email: user.email };
  },

  async chat(message) {
    currentUser(); // lazem ykoun 3emel login
    return findAnswer(message);
  },
};
