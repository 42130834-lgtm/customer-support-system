import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import { api } from "../api.js";
import "../styles/auth.css";

function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input {...props} type={show ? "text" : "password"} />
      <button type="button" className="eye" title={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.pathname === "/signup" ? "signup" : "login";

  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", password: "" });
  const [note, setNote] = useState(null); // { type: "ok" | "bad", text, for: mode }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Support Assistant - " + (mode === "signup" ? "Sign up" : "Log in");
  }, [mode]);

  // Iza fet 3al login w huwe aslan logged in, ro7 3al chat
  useEffect(() => {
    api.me().then(() => navigate("/chat", { replace: true })).catch(() => {});
  }, [navigate]);

  async function onLogin(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.login(login.email, login.password);
      navigate("/chat");
    } catch (err) {
      setNote({ type: "bad", text: err.message, for: "login" });
    } finally {
      setBusy(false);
    }
  }

  async function onSignup(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.signup(signup.name, signup.email, signup.password);
      setLogin({ email: signup.email, password: "" }); // n7ot el email jehez bel login
      setSignup({ name: "", email: "", password: "" });
      setNote({ type: "ok", text: "Account created! You can log in now.", for: "login" });
      navigate("/login", { replace: true });
    } catch (err) {
      setNote({ type: "bad", text: err.message, for: "signup" });
    } finally {
      setBusy(false);
    }
  }

  const noteFor = (m) => note && note.for === m && <div className={"note " + note.type}>{note.text}</div>;

  return (
    <div className="page-auth">
      <Nav
        links={[
          { to: "/", label: "Home" },
          { to: "/login", label: "Log in" },
          { to: "/signup", label: "Sign up" },
        ]}
      />

      <div className="stage">
        <div className="blob b1" />
        <div className="blob b2" />

        <div className={"ring" + (mode === "signup" ? " signup-mode" : "")}>
          <div className="inner">
            {/* LOGIN */}
            <form className="panel panel-login" onSubmit={onLogin} {...(mode !== "login" && { inert: "" })}>
              <h2>Welcome back</h2>
              <p className="hint">Log in to your account</p>
              {noteFor("login")}
              <input
                type="email"
                placeholder="Email address"
                required
                value={login.email}
                onChange={(e) => setLogin({ ...login, email: e.target.value })}
              />
              <PasswordInput
                placeholder="Password"
                required
                value={login.password}
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
              />
              <button type="submit" className="go" disabled={busy}>
                {busy ? "..." : "LOG IN"}
              </button>
              <p className="switch">
                Don't have an account?{" "}
                <a href="/signup" onClick={(e) => { e.preventDefault(); navigate("/signup", { replace: true }); }}>
                  Sign up
                </a>
              </p>
            </form>

            {/* SIGNUP */}
            <form className="panel panel-signup" onSubmit={onSignup} {...(mode !== "signup" && { inert: "" })}>
              <h2>Create account</h2>
              <p className="hint">It takes less than a minute</p>
              {noteFor("signup")}
              <input
                type="text"
                placeholder="Full name"
                required
                value={signup.name}
                onChange={(e) => setSignup({ ...signup, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email address"
                required
                value={signup.email}
                onChange={(e) => setSignup({ ...signup, email: e.target.value })}
              />
              <PasswordInput
                placeholder="Password (6+ characters)"
                minLength={6}
                required
                value={signup.password}
                onChange={(e) => setSignup({ ...signup, password: e.target.value })}
              />
              <button type="submit" className="go" disabled={busy}>
                {busy ? "..." : "CREATE ACCOUNT"}
              </button>
              <p className="switch">
                Already have an account?{" "}
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login", { replace: true }); }}>
                  Log in
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
