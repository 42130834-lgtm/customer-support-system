import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { isArabic } from '../utils/language.js'
import '../styles/Operator.css'

const languageNames = { en: 'English', ar: 'العربية', arabizi: 'Arabizi' }
const REFRESH_EVERY = 4000 // kel 4 sanye mnjib el jdid

// "2026-11-24T21:30:05" -> "24/11 21:30"
function formatTime(iso) {
  if (!iso) return ''
  const [date, time] = iso.split('T')
  const [, month, day] = date.split('-')
  return `${day}/${month} ${time.slice(0, 5)}`
}

// El mo7adase taba3 ticket wa7ad (3al yamin)
function Conversation({ ticketId, onChanged }) {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('open')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const boxRef = useRef(null)

  const load = async () => {
    try {
      const data = await apiRequest(`/api/tickets/${ticketId}/messages`)
      setMessages(data.messages)
      setStatus(data.status)
    } catch (err) {
      setError(err.message)
    }
  }

  // Kel ma tna22e ticket tene: jib el mo7adase, w ba3den kel 4 sanye
  useEffect(() => {
    setMessages([])
    setText('')
    setError('')
    load()
    const timer = setInterval(load, REFRESH_EVERY)
    return () => clearInterval(timer)
  }, [ticketId])

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [messages])

  const sendReply = async (e) => {
    e.preventDefault()
    if (text.trim() === '') return
    setBusy(true)
    try {
      await apiRequest(`/api/tickets/${ticketId}/reply`, 'POST', { text })
      setText('')
      setError('')
      await load()
      onChanged()
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  const resolve = async () => {
    setBusy(true)
    try {
      // Iza fi message maktoube w ma n3atet, btrou7 ma3 el Resolve
      await apiRequest(`/api/tickets/${ticketId}/resolve`, 'POST', { solution: text })
      setText('')
      setError('')
      await load()
      onChanged()
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  const bubbleClass = (m) => {
    let cls = 'bubble bubble-' + m.from
    if (isArabic(m.text)) cls += ' rtl'
    return cls
  }

  const senderName = { user: 'Customer', bot: 'Assistant', operator: 'You' }

  return (
    <div className="conversation">
      <div className="conv-messages" ref={boxRef}>
        {messages.map((m) => (
          <div key={m.id} className={bubbleClass(m)}>
            <span className="bubble-who">
              {senderName[m.from]} · {formatTime(m.created_at)}
            </span>
            {m.text}
          </div>
        ))}
      </div>

      {error && <div className="note bad">{error}</div>}

      {status === 'open' ? (
        <form className="reply-form" onSubmit={sendReply}>
          <textarea
            rows="2"
            placeholder="Write to the customer..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="reply-buttons">
            <button type="button" className="resolve-btn" onClick={resolve} disabled={busy}>
              ✓ Resolve
            </button>
            <button type="submit" className="send-btn" disabled={busy}>
              {busy ? '...' : 'Send'}
            </button>
          </div>
        </form>
      ) : (
        <p className="closed-note">✓ This ticket is resolved.</p>
      )}
    </div>
  )
}

export default function Operator() {
  const [status, setStatus] = useState('open') // ayya tab
  const [tickets, setTickets] = useState([])
  const [counts, setCounts] = useState({ open: 0, resolved: 0 })
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { logout } = useAuth()

  const loadTickets = async () => {
    try {
      const data = await apiRequest('/api/tickets?status=' + status)
      setTickets(data.tickets)
      setCounts(data.counts)
      setError('')
    } catch (err) {
      if (err.status === 401) logout()
      setError(err.message)
    }
    setLoading(false)
  }

  // Kel ma yet8ayyar el tab: jib el tickets, w ba3den kel 4 sanye
  useEffect(() => {
    setLoading(true)
    setSelectedId(null)
    loadTickets()
    const timer = setInterval(loadTickets, REFRESH_EVERY)
    return () => clearInterval(timer)
  }, [status])

  return (
    <div className="page-operator">
      <div className="operator-head">
        <h1>Tickets</h1>
        <p>Problems the assistant could not solve. Talk with the customer, then resolve the ticket.</p>
      </div>

      <div className="tabs">
        <button className={status === 'open' ? 'tab on' : 'tab'} onClick={() => setStatus('open')}>
          Open <span>{counts.open}</span>
        </button>
        <button className={status === 'resolved' ? 'tab on' : 'tab'} onClick={() => setStatus('resolved')}>
          Resolved <span>{counts.resolved}</span>
        </button>
      </div>

      {error && <div className="note bad">{error}</div>}

      <div className="operator-layout">
        {/* 3al shmel: list el tickets */}
        <div className="ticket-list">
          {loading && <p className="empty">Loading...</p>}
          {!loading && tickets.length === 0 && (
            <p className="empty">{status === 'open' ? 'No open tickets 🎉' : 'No resolved tickets yet.'}</p>
          )}
          {!loading &&
            tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                className={t.id === selectedId ? 'ticket selected' : 'ticket'}
                onClick={() => setSelectedId(t.id)}
              >
                <div className="ticket-top">
                  <b>{t.customer_name}</b>
                  {t.status === 'open' && t.last_from === 'user' && <span className="waiting">Waiting</span>}
                  <span className="ticket-time">{formatTime(t.created_at)}</span>
                </div>
                <p className={isArabic(t.message) ? 'ticket-msg rtl' : 'ticket-msg'}>{t.message}</p>
                <div className="ticket-bottom">
                  <span className="ticket-lang">{languageNames[t.language] || t.language}</span>
                  <span>#{t.id} · {t.message_count} messages</span>
                </div>
              </button>
            ))}
        </div>

        {/* 3al yamin: el mo7adase */}
        <div className="conversation-panel">
          {selectedId ? (
            <Conversation ticketId={selectedId} onChanged={loadTickets} />
          ) : (
            <p className="empty">Choose a ticket to see the conversation.</p>
          )}
        </div>
      </div>
    </div>
  )
}
