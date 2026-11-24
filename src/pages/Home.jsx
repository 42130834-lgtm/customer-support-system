import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import "../styles/home.css";

const CONVOS = [
  { label: "English", rtl: false, q: "My internet is very slow", a: "Restart your router, wait 30 seconds, then check your data package. 🔧" },
  { label: "العربية", rtl: true, q: "الانترنت تقيل كتير", a: "أعد تشغيل الراوتر وانتظر 30 ثانية، ثم تأكد من باقة الداتا. 🔧" },
  { label: "Arabizi", rtl: false, q: "el net batii2 ktir", a: "A3ed tashghil l router w estanna 30 sanye, baden etakked mn bakit l data. 🔧" },
];

const STEPS = [
  { title: "Describe it", text: "Type or use the mic. Say it the way you talk, even with slang." },
  { title: "Get a tested fix", text: "The system finds the closest solved problem and answers in your language." },
  { title: "An operator steps in", text: "Not solved? A real operator takes over, and the system learns from it." },
];

const STATS = [
  { big: "3", small: "languages understood" },
  { big: "🎤", small: "voice or text" },
  { big: "24/7", small: "always available" },
  { big: "🧠", small: "learns every day" },
];

// El demo taba3 el telephone: byekteb el so2al, ba3den "typing...", ba3den el jawab
function PhoneDemo() {
  const [current, setCurrent] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing -> thinking -> answer

  useEffect(() => {
    const c = CONVOS[current];
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    setPhase("typing");
    setTyped("");
    for (let n = 1; n <= c.q.length; n++) at(n * 45, () => setTyped(c.q.slice(0, n)));
    const done = c.q.length * 45;
    at(done + 400, () => setPhase("thinking"));
    at(done + 1600, () => setPhase("answer"));
    at(done + 5100, () => setCurrent((i) => (i + 1) % CONVOS.length));

    return () => timers.forEach(clearTimeout); // iza el user kabas chip, nwa22ef el 2adim
  }, [current]);

  const c = CONVOS[current];
  return (
    <div className="phone">
      <div className="phone-top">
        <span className="dot" /> Support Assistant
      </div>
      <div className="screen">
        <div className={"bubble u" + (c.rtl ? " rtl" : "")}>{typed}</div>
        {phase === "thinking" && (
          <div className="bubble b typing">
            <span /><span /><span />
          </div>
        )}
        {phase === "answer" && <div className={"bubble b" + (c.rtl ? " rtl" : "")}>{c.a}</div>}
      </div>
      <div className="chips">
        {CONVOS.map((cv, i) => (
          <button key={cv.label} className={"chip" + (i === current ? " on" : "")} onClick={() => setCurrent(i)}>
            {cv.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="page-home">
      <Nav
        sticky
        links={[
          { to: "/", label: "Home" },
          { to: "/login", label: "Log in" },
          { to: "/signup", label: "Sign up" },
        ]}
      />

      <section className="hero">
        <div className="blob b1" />
        <div className="blob b2" />
        <div>
          <span className="pill">✨ Telecom support, in your own words</span>
          <h1>
            Got a problem? <span>Just say it your way.</span>
          </h1>
          <p className="sub">
            Write or speak in English, Arabic or Lebanese Arabizi. Our assistant understands you and finds a tested
            fix in seconds.
          </p>
          <div className="cta">
            <Link className="btn primary" to="/signup">Get started free</Link>
            <Link className="btn ghost" to="/login">I have an account</Link>
          </div>
        </div>
        <PhoneDemo />
      </section>

      <section className="section">
        <h2>How it works</h2>
        <p className="lead">Three simple steps. No waiting on hold.</p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="card" key={s.title}>
              <div className="num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="stats">
          {STATS.map((s) => (
            <div className="stat" key={s.small}>
              <b>{s.big}</b>
              <small>{s.small}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="cta-band">
        <div className="cta-box">
          <h2>Ready to fix it?</h2>
          <p>Create your account in under a minute.</p>
          <Link className="btn" to="/signup">Sign up now</Link>
        </div>
      </div>

      <footer className="footer">Intelligent Operation and Customer Support System · Senior project</footer>
    </div>
  );
}
