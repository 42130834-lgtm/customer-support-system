import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Chat from './pages/Chat.jsx'
import Operator from './pages/Operator.jsx'
import NotFound from './pages/NotFound.jsx'
import { useAuth } from './context/AuthContext.jsx'

export default function App() {
  const { user } = useAuth()
  const location = useLocation()
  const isChat = location.pathname === '/chat'
  const isOperator = user && (user.role === 'operator' || user.role === 'admin')

  // Ba3d el login: el operator byerou7 3al tickets, w el customer 3al chat
  const homeForUser = isOperator ? '/operator' : '/chat'

  return (
    <div className={isChat ? 'app app-chat' : 'app'}>
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Iza el user 3emel login, ma fi da3e yshuf el login w el signup */}
          <Route path="/login" element={user ? <Navigate to={homeForUser} /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to={homeForUser} /> : <Signup />} />

          {/* El chat bas lal user li 3emel login */}
          <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />

          {/* El tickets bas lal operator */}
          <Route path="/operator" element={isOperator ? <Operator /> : <Navigate to={user ? '/chat' : '/login'} />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {/* El chat byekhod kel el shasha, fa ma fi footer */}
      {!isChat && <Footer />}
    </div>
  )
}
