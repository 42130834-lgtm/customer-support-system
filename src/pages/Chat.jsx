import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { isArabic } from '../utils/language.js'
import '../styles/Chat.css'

const suggestions = ['My internet is very slow', 'الانترنت تقيل كتير', 'kef bshuf rasidi?']
const firstMessage = { from: 'bot', text: 'Hi! 👋 Tell me your problem in English, Arabic or Arabizi, typed or spoken.' }

// El browser byfham el sot? (Chrome w Edge eh)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function Chat() {
  const [messages, setMessages] = useState([firstMessage])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [voiceLang, setVoiceLang] = useState('en-US')
  const [recording, setRecording] = useState(false)
  const [lastBotId, setLastBotId] = useState(null) // la el feedback: ayya jawab
  const { logout } = useAuth()

  // useRef la nwasel lal div taba3 el messages w nnazzel la ta7t
  const boxRef = useRef(null)

  useEffect(() => {
    boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [messages, typing, showFeedback])

  // Awwal ma tefta7 el chat, jib el messages el 2adime men el backend
  useEffect(() => {
    apiRequest('/api/chat/history')
      .then((history) => {
        if (history.length > 0) {
          setMessages([firstMessage, ...history])
          setShowSuggestions(false)
        }
      })
      .catch(handleError)
  }, [])

  // Iza el token khalas (401): logout, w App byeb3atak 3al login
  const handleError = (err) => {
    if (err.status === 401) {
      logout()
    } else {
      addMessage('info', err.message)
    }
  }

  const addMessage = (from, msg) => {
    // (old) => ... ya3ne: khod el list el akhira w zid 3le
    setMessages((old) => [...old, { from, text: msg }])
  }

  // async: mneb3at lal backend w mnestanna el jawab
  const send = async (msg) => {
    const clean = msg.trim()
    if (clean === '') return

    setShowSuggestions(false)
    setShowFeedback(false)
    setText('')
    addMessage('user', clean)
    setTyping(true)

    try {
      const reply = await apiRequest('/api/chat', 'POST', { message: clean })
      addMessage('bot', reply.answer)
      setLastBotId(reply.message_id)
      setShowFeedback(!reply.escalate)
    } catch (err) {
      handleError(err)
    }
    setTyping(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(text)
  }

  const answerFeedback = (solved) => {
    setShowFeedback(false)
    // Mnkhabber el backend (iza "No", byefta7 ticket lal operator)
    apiRequest('/api/feedback', 'POST', { message_id: lastBotId, solved }).catch(handleError)
    if (solved) {
      addMessage('info', 'Great, glad it is solved! 🎉')
    } else {
      addMessage('info', 'Sorry about that. An operator will follow up with you.')
    }
  }

  const toggleVoiceLang = () => {
    setVoiceLang(voiceLang === 'en-US' ? 'ar-LB' : 'en-US')
  }

  const startVoice = () => {
    const rec = new SpeechRecognition()
    rec.lang = voiceLang
    rec.onstart = () => setRecording(true)
    rec.onend = () => setRecording(false)
    rec.onerror = () => setRecording(false)
    rec.onresult = (e) => send(e.results[0][0].transcript) // el kalam li 2alo
    rec.start()
  }

  const messageClass = (m) => {
    let cls = m.from === 'info' ? 'msg-info' : 'msg msg-' + m.from
    if (isArabic(m.text)) cls += ' rtl'
    return cls
  }

  return (
    <div className="page-chat">
      <div className="chat">
        <div className="chat-head">
          <div className="avatar">🤖</div>
          <div>
            <b>Support Assistant</b>
            <small>
              <span className="online"></span>Online · English, العربية, Arabizi
            </small>
          </div>
        </div>

        <div className="messages" ref={boxRef}>
          {messages.map((m, i) => (
            <div key={i} className={messageClass(m)}>
              {m.text}
            </div>
          ))}

          {typing && (
            <div className="msg msg-bot typing">
              <span></span><span></span><span></span>
            </div>
          )}

          {showFeedback && (
            <div className="feedback">
              <button className="btn-yes" onClick={() => answerFeedback(true)}>Yes, solved ✅</button>
              <button className="btn-no" onClick={() => answerFeedback(false)}>No ❌</button>
            </div>
          )}
        </div>

        {showSuggestions && (
          <div className="suggest">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <form className="input-bar" onSubmit={handleSubmit}>
          {SpeechRecognition && (
            <button
              type="button"
              className={recording ? 'mic rec' : 'mic'}
              title="Speak"
              onClick={startVoice}
              disabled={recording}
            >
              🎤
            </button>
          )}
          <button type="button" className="lang-btn" title="Voice language" onClick={toggleVoiceLang}>
            {voiceLang === 'en-US' ? 'EN' : 'AR'}
          </button>
          <input
            type="text"
            className="text-input"
            placeholder="Write or speak your problem..."
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="send-btn">Send</button>
        </form>
      </div>
    </div>
  )
}
