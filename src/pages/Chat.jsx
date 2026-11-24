import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { isArabic } from '../utils/language.js'
import '../styles/Chat.css'

const suggestions = ['My internet is very slow', 'الانترنت تقيل كتير', 'kef bshuf rasidi?']
const firstMessage = { from: 'bot', text: 'Hi! 👋 Tell me your problem in English, Arabic or Arabizi, typed or spoken.' }
const REFRESH_EVERY = 4000 // kel 4 sanye mnes2al el backend iza fi messages jdide

// El browser byfham el sot? (Chrome w Edge eh)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function Chat() {
  const [messages, setMessages] = useState([firstMessage])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [openTicket, setOpenTicket] = useState(false) // 3am yehke ma3 operator?
  const [voiceLang, setVoiceLang] = useState('en-US')
  const [recording, setRecording] = useState(false)
  const [lastBotId, setLastBotId] = useState(null) // la el feedback: ayya jawab
  const { logout } = useAuth()

  // useRef: 2iyam mn7tajon bas ma badna el page t3id render kel ma yet8ayyaro
  const boxRef = useRef(null) // el div taba3 el messages (la nnazzel la ta7t)
  const lastIdRef = useRef(0) // akher message id jebne men el backend
  const sendingRef = useRef(false) // 3am neb3at message halla2?

  useEffect(() => {
    boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [messages, typing, showFeedback])

  const addMessage = (from, msg, id) => {
    // (old) => ... ya3ne: khod el list el akhira w zid 3le
    setMessages((old) => [...old, { from, text: msg, id }])
  }

  const rememberId = (id) => {
    if (id > lastIdRef.current) lastIdRef.current = id
  }

  // Iza el token khalas (401): logout, w App byeb3atak 3al login
  const handleError = (err) => {
    if (err.status === 401) {
      logout()
    } else {
      addMessage('info', err.message)
    }
  }

  // Jib el messages el jdide (men el operator masalan)
  const loadNew = async () => {
    if (sendingRef.current) return
    try {
      const data = await apiRequest('/api/chat/history?after=' + lastIdRef.current)
      if (sendingRef.current) return // ba3atna message wa2t ma kenna nestanna: mnterko lal marra el jeye

      if (data.messages.length > 0) {
        // Ma nzid message marten (iza aslan mawjoude b nafs el id)
        setMessages((old) => [...old, ...data.messages.filter((m) => !old.some((o) => o.id === m.id))])
        data.messages.forEach((m) => rememberId(m.id))
        setShowSuggestions(false)
        if (data.messages.some((m) => m.from !== 'user')) setShowFeedback(false)
      }
      setOpenTicket(data.open_ticket)
    } catch (err) {
      if (err.status === 401) logout()
    }
  }

  // Awwal ma yefta7 el chat: jib kel shi, w ba3den kel 4 sanye shu fi jdid
  useEffect(() => {
    loadNew()
    const timer = setInterval(loadNew, REFRESH_EVERY)
    return () => clearInterval(timer) // lamma nfell men el page, wa22ef
  }, [])

  // async: mneb3at lal backend w mnestanna el jawab
  const send = async (msg) => {
    const clean = msg.trim()
    if (clean === '') return

    sendingRef.current = true
    setShowSuggestions(false)
    setShowFeedback(false)
    setText('')
    addMessage('user', clean) // bala id la ysir 3enna jawab el backend
    setTyping(!openTicket) // iza 3am yehke ma3 operator, ma fi "typing..."

    try {
      const reply = await apiRequest('/api/chat', 'POST', { message: clean })

      // 7ot el id 3al message li ba3atneha
      setMessages((old) => old.map((m) => (m.from === 'user' && !m.id && m.text === clean ? { ...m, id: reply.user_message_id } : m)))
      rememberId(reply.user_message_id)

      if (reply.operator) {
        setOpenTicket(true) // el message ra7 lal operator, byjeweb ba3den
      } else {
        addMessage('bot', reply.answer, reply.message_id)
        rememberId(reply.message_id)
        setLastBotId(reply.message_id)
        setShowFeedback(!reply.escalate)
        if (reply.escalate) setOpenTicket(true)
      }
    } catch (err) {
      handleError(err)
    }
    setTyping(false)
    sendingRef.current = false
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
      addMessage('info', 'Sorry about that. An operator will follow up with you here.')
      setOpenTicket(true)
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
          <div className="avatar">{openTicket ? '👤' : '🤖'}</div>
          <div>
            <b>{openTicket ? 'Operator' : 'Support Assistant'}</b>
            <small>
              <span className="online"></span>
              {openTicket ? 'You are talking to a real person' : 'Online · English, العربية, Arabizi'}
            </small>
          </div>
        </div>

        {openTicket && (
          <div className="operator-banner">
            👤 An operator is handling your problem. Write here and they will answer you.
          </div>
        )}

        <div className="messages" ref={boxRef}>
          {messages.map((m, i) => (
            <div key={m.id || 'local-' + i} className={messageClass(m)}>
              {m.from === 'operator' && <span className="msg-label">👤 Operator</span>}
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
            placeholder={openTicket ? 'Write to the operator...' : 'Write or speak your problem...'}
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
