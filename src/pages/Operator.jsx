import { useEffect, useState } from 'react'
import { apiRequest } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { isArabic } from '../utils/language.js'
import '../styles/Operator.css'

const languageNames = { en: 'English', ar: 'العربية', arabizi: 'Arabizi' }

// "2026-11-24T21:30:05" -> "24/11 21:30"
function formatTime(iso) {
  if (!iso) return ''
  const [date, time] = iso.split('T')
  const [, month, day] = date.split('-')
  return `${day}/${month} ${time.slice(0, 5)}`
}

function TicketCard({ ticket, onResolved }) {
  const [solution, setSolution] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleResolve = async (e) => {
    e.preventDefault()
    if (solution.trim() === '') {
      setError('Please write the solution.')
      return
    }
    setBusy(true)
    try {
      await apiRequest(`/api/tickets/${ticket.id}/resolve`, 'POST', { solution })
      onResolved()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="ticket">
      <div className="ticket-top">
        <span className="ticket-id">#{ticket.id}</span>
        <b>{ticket.customer_name}</b>
        <span className="ticket-email">{ticket.customer_email}</span>
        <span className="ticket-lang">{languageNames[ticket.language] || ticket.language}</span>
        <span className="ticket-time">{formatTime(ticket.created_at)}</span>
      </div>

      <p className={isArabic(ticket.message) ? 'ticket-msg rtl' : 'ticket-msg'}>{ticket.message}</p>

      {ticket.status === 'open' ? (
        <form className="ticket-form" onSubmit={handleResolve}>
          <textarea
            rows="2"
            placeholder="Write the solution for the customer..."
            value={solution}
            onChange={(e) => {
              setSolution(e.target.value)
              setError('')
            }}
          />
          {error && <span className="error">{error}</span>}
          <button type="submit" disabled={busy}>{busy ? '...' : 'Resolve'}</button>
        </form>
      ) : (
        <div className="ticket-solution">
          <span>Solution · {formatTime(ticket.resolved_at)}</span>
          <p className={isArabic(ticket.solution) ? 'rtl' : ''}>{ticket.solution}</p>
        </div>
      )}
    </div>
  )
}

export default function Operator() {
  const [status, setStatus] = useState('open') // ayya tab
  const [tickets, setTickets] = useState([])
  const [counts, setCounts] = useState({ open: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { logout } = useAuth()

  const loadTickets = async () => {
    setLoading(true)
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

  // Kel ma yet8ayyar el tab, jib el tickets men jdid
  useEffect(() => {
    loadTickets()
  }, [status])

  return (
    <div className="page-operator">
      <div className="operator-head">
        <div>
          <h1>Tickets</h1>
          <p>Problems the assistant could not solve, or that the customer said were not solved.</p>
        </div>
        <button type="button" className="refresh-btn" onClick={loadTickets}>↻ Refresh</button>
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
      {loading && <p className="empty">Loading...</p>}
      {!loading && !error && tickets.length === 0 && (
        <p className="empty">{status === 'open' ? 'No open tickets 🎉' : 'No resolved tickets yet.'}</p>
      )}

      <div className="ticket-list">
        {!loading && tickets.map((t) => <TicketCard key={t.id} ticket={t} onResolved={loadTickets} />)}
      </div>
    </div>
  )
}
