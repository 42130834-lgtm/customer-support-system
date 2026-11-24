import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Signup.css'

const empty = { name: '', email: '', password: '' }

export default function Signup() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [signupError, setSignupError] = useState('')
  const [busy, setBusy] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value
    setForm({ ...form, [name]: value })
  }

  const validate = () => {
    const e = {}
    if (form.name.trim() === '') e.name = 'Please enter your name.'
    if (!form.email.includes('@') || !form.email.includes('.')) e.email = 'Please enter a valid email.'
    if (form.password.length < 6) e.password = 'Password should have at least 6 characters.'
    return e
  }

  // async: el signup byeb3at lal backend w mnestanna el jawab
  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    setSignupError('')
    if (Object.keys(e).length === 0) {
      setBusy(true)
      const error = await signup(form.name, form.email, form.password)
      setBusy(false)
      if (error) {
        setSignupError(error)
      } else {
        // Ro7 3al login w 2ello enno el account n3amal
        navigate('/login', { state: { created: true } })
      }
    }
  }

  return (
    <div className="page-signup">
      <div className="blob b1"></div>
      <div className="blob b2"></div>

      <div className="ring">
        <div className="inner">
          <form className="panel" onSubmit={handleSubmit} noValidate>
            <h2>Create account</h2>
            <p className="hint">It takes less than a minute</p>

            {signupError && <div className="note bad">{signupError}</div>}

            <input
              name="name"
              type="text"
              placeholder="Full name"
              aria-label="Full name"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'invalid' : ''}
            />
            {errors.name && <span className="error">{errors.name}</span>}

            <input
              name="email"
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'invalid' : ''}
            />
            {errors.email && <span className="error">{errors.email}</span>}

            <PasswordInput
              name="password"
              placeholder="Password (6+ characters)"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'invalid' : ''}
            />
            {errors.password && <span className="error">{errors.password}</span>}

            <button type="submit" className="go" disabled={busy}>
              {busy ? '...' : 'CREATE ACCOUNT'}
            </button>
            <p className="switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
