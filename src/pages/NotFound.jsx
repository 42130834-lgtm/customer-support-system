import { Link } from 'react-router-dom'
import '../styles/NotFound.css'

export default function NotFound() {
  return (
    <div className="page-notfound">
      <p className="big-404">404</p>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn">Back to home</Link>
    </div>
  )
}
