import { Link } from 'react-router-dom'
import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <p className="footer-logo">Support Assistant</p>
          <p className="footer-text">Telecom support in English, Arabic and Arabizi.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </div>
      <p className="footer-copy">Intelligent Operation and Customer Support System · Senior project</p>
    </footer>
  )
}
