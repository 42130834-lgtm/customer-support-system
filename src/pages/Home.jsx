import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isArabic } from '../utils/language.js'
import '../styles/Home.css'

// El amthile li bi farjiyon el telephone
const examples = [
  { label: 'English', question: 'My internet is very slow', answer: 'Restart your router, wait 30 seconds, then check your data package. 🔧' },
  { label: 'العربية', question: 'الانترنت تقيل كتير', answer: 'أعد تشغيل الراوتر وانتظر 30 ثانية، ثم تأكد من باقة الداتا. 🔧' },
  { label: 'Arabizi', question: 'el net batii2 ktir', answer: 'A3ed tashghil l router w estanna 30 sanye, baden etakked mn bakit l data. 🔧' },
]

const steps = [
  { title: 'Describe it', text: 'Type or use the mic. Say it the way you talk, even with slang.' },
  { title: 'Get a tested fix', text: 'The system finds the closest solved problem and answers in your language.' },
  { title: 'An operator steps in', text: 'Not solved? A real operator takes over, and the system learns from it.' },
]

const stats = [
  { big: '3', small: 'languages understood' },
  { big: '🎤', small: 'voice or text' },
  { big: '24/7', small: 'always available' },
  { big: '🧠', small: 'learns every day' },
]

function PhoneDemo() {
  const [current, setCurrent] = useState(0) // ayya mathal
  const [letters, setLetters] = useState(0) // kam 7arf ktabna men el so2al
  const [showAnswer, setShowAnswer] = useState(false)

  const example = examples[current]
  const doneTyping = letters === example.question.length

  const choose = (index) => {
    setCurrent(index)
    setLetters(0)
    setShowAnswer(false)
  }

  // Kel marra byet8ayyar shi, mnestanna shway w mna3mel el khatwe el jeye
  useEffect(() => {
    let timer
    if (!doneTyping) {
      timer = setTimeout(() => setLetters(letters + 1), 45) // 7arf jdid
    } else if (!showAnswer) {
      timer = setTimeout(() => setShowAnswer(true), 1200) // "typing..." ba3den el jawab
    } else {
      timer = setTimeout(() => choose((current + 1) % examples.length), 3500) // el mathal el jeye
    }
    return () => clearTimeout(timer)
  }, [letters, showAnswer, current])

  const rtl = isArabic(example.question) ? ' rtl' : ''

  return (
    <div className="phone">
      <div className="phone-top">
        <span className="dot"></span> Support Assistant
      </div>
      <div className="screen">
        <div className={'bubble u' + rtl}>{example.question.slice(0, letters)}</div>
        {doneTyping && !showAnswer && (
          <div className="bubble b typing">
            <span></span><span></span><span></span>
          </div>
        )}
        {showAnswer && <div className={'bubble b' + rtl}>{example.answer}</div>}
      </div>
      <div className="chips">
        {examples.map((ex, i) => (
          <button key={ex.label} className={i === current ? 'chip on' : 'chip'} onClick={() => choose(i)}>
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="page-home">
      <section className="hero">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
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
          {steps.map((step, i) => (
            <div className="card" key={step.title}>
              <div className="num">{i + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="stats">
          {stats.map((s) => (
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
    </div>
  )
}
