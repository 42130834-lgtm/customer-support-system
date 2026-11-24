import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Navbar.css'

export default function Navbar() {
  const [openLinks, setOpenLinks] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const toggleNavbar = () => setOpenLinks(!openLinks)
  const close = () => setOpenLinks(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" onClick={close}>
          Support Assistant
        </Link>

        <button
          className="menu-btn"
          type="button"
          aria-label="Open menu"
          aria-expanded={openLinks}
          onClick={toggleNavbar}
        >
          {openLinks ? '✕' : '☰'}
        </button>

        {/* NavLink bizid class "active" 3al page li enta fiya */}
        <div className={openLinks ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" end onClick={close}>Home</NavLink>

          {user ? (
            <>
              <NavLink to="/chat" onClick={close}>Chat</NavLink>
              <span className="nav-user">Hi, {user.name}</span>
              <button type="button" className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Log in</NavLink>
              <NavLink to="/signup" onClick={close}>Sign up</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
