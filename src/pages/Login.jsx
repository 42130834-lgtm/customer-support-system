import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Login.css'

const empty = { email: '', password: '' }

export default function Login() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [loginError, setLoginError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login } = useAuth()
  const location = useLocation()

  // Iza jeye men el Signup, byeb3atlna { created: true }
  const justCreated = location.state && location.state.created

  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value
    setForm({ ...form, [name]: value })
  }

  const validate = () => {
    const e = {}
    if (!form.email.includes('@') || !form.email.includes('.')) e.email = 'Please enter a valid email.'
    if (form.password === '') e.password = 'Please enter your password.'
    return e
  }

  // async: el login byeb3at lal backend w mnestanna el jawab
  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    setLoginError('')
    if (Object.keys(e).length === 0) {
      setBusy(true)
      const error = await login(form.email, form.password)
      setBusy(false)
      // Iza zabat, ma mna3mel shi: App.jsx byeb3at el user 3al chat (aw el operator 3al tickets)
      if (error) setLoginError(error)
    }
  }

  return (
    <div className="page-login">
      <div className="blob b1"></div>
      <div className="blob b2"></div>

      <div className="ring">
        <div className="inner">
          <form className="panel" onSubmit={handleSubmit} noValidate>
            <h2>Welcome back</h2>
            <p className="hint">Log in to your account</p>

            {justCreated && !loginError && <div className="note ok">Account created! You can log in now.</div>}
            {loginError && <div className="note bad">{loginError}</div>}

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
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'invalid' : ''}
            />
            {errors.password && <span className="error">{errors.password}</span>}

            <button type="submit" className="go" disabled={busy}>
              {busy ? '...' : 'LOG IN'}
            </button>
            <p className="switch">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
