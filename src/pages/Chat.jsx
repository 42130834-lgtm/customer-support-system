import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import { api } from "../api.js";
import "../styles/chat.css";

const SUGGESTIONS = ["My internet is very slow", "الانترنت تقيل كتير", "kef bshuf rasidi?"];
const isArabic = (t) => /[؀-ۿ]/.test(t);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

let nextId = 1;
const msg = (text, kind) => ({ id: nextId++, text, kind }); // kind: user | bot | small | typing | feedback

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    msg("Hi! 👋 Tell me your problem in English, Arabic or Arabizi, typed or spoken.", "bot"),
  ]);
  const [input, setInput] = useState("");
  const [showSuggest, setShowSuggest] = useState(true);
  const [recLang, setRecLang] = useState("en-US");
  const [recording, setRecording] = useState(false);
  const boxRef = useRef(null);
  const recRef = useRef(null);

  // scroll la ta7t kel ma yeje message jdid
  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  // wa22ef el mic iza tla3na men el page
  useEffect(() => () => recRef.current?.abort(), []);

  const add = (...items) => setMessages((m) => [...m.filter((x) => x.kind !== "feedback"), ...items]);

  async function send(raw) {
    const text = (raw ?? input).trim();
    if (!text) return;
    setShowSuggest(false);
    setInput("");
    const typing = msg("", "typing");
    add(msg(text, "user"), typing);

    try {
      const [d] = await Promise.all([api.chat(text), sleep(700)]);
      setMessages((m) => [
        ...m.filter((x) => x.id !== typing.id),
        msg(d.answer, "bot"),
        ...(d.escalate ? [] : [msg("", "feedback")]),
      ]);
    } catch (err) {
      if (err.status === 401) return navigate("/login", { replace: true });
      setMessages((m) => [...m.filter((x) => x.id !== typing.id), msg("Connection problem, please try again.", "small")]);
    }
  }

  function solved(ok) {
    add(msg(ok ? "Great, glad it is solved! 🎉" : "Sorry about that. An operator will follow up with you.", "small"));
  }

  function toggleMic() {
    if (recRef.current) {
      recRef.current.stop();
      return;
    }
    const rec = new SR();
    let transcript = "";
    rec.lang = recLang;
    rec.onstart = () => setRecording(true);
    rec.onresult = (e) => {
      transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    rec.onend = () => {
      setRecording(false);
      recRef.current = null;
      if (transcript.trim()) send(transcript);
    };
    rec.onerror = () => {
      setRecording(false);
      recRef.current = null;
    };
    recRef.current = rec;
    rec.start();
  }

  async function logout() {
    await api.logout().catch(() => {});
    navigate("/login", { replace: true });
  }

  return (
    <div className="page-chat">
      <Nav links={[{ to: "/chat", label: "Chat" }]} right={[{ label: "Log out", onClick: logout }]} />

      <div className="wrap">
        <div className="chat">
          <div className="chat-head">
            <div className="avatar">🤖</div>
            <div>
              <b>Support Assistant</b>
              <small>
                <span className="online" />
                Online · English, العربية, Arabizi
              </small>
            </div>
          </div>

          <div className="messages" ref={boxRef}>
            {messages.map((m) => {
              if (m.kind === "typing")
                return (
                  <div key={m.id} className="msg msg-bot typing">
                    <span /><span /><span />
                  </div>
                );
              if (m.kind === "feedback")
                return (
                  <div key={m.id} className="feedback">
                    <button className="btn-yes" onClick={() => solved(true)}>Yes, solved ✅</button>
                    <button className="btn-no" onClick={() => solved(false)}>No ❌</button>
                  </div>
                );
              const cls = { user: "msg msg-user", bot: "msg msg-bot", small: "msg-bot-small" }[m.kind];
              return (
                <div key={m.id} className={cls + (isArabic(m.text) ? " rtl" : "")}>
                  {m.text}
                </div>
              );
            })}
          </div>

          {showSuggest && (
            <div className="suggest">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <form
            className="input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            {SR && (
              <button type="button" className={"mic" + (recording ? " rec" : "")} title="Speak" onClick={toggleMic}>
                🎤
              </button>
            )}
            <button
              type="button"
              className="lang-btn"
              title="Voice language"
              onClick={() => setRecLang(recLang === "en-US" ? "ar-LB" : "en-US")}
            >
              {recLang === "en-US" ? "EN" : "AR"}
            </button>
            <input
              type="text"
              className="text-input"
              placeholder="Write or speak your problem..."
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="send-btn">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
