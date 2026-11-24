import { createContext, useContext, useState } from 'react'
import { apiRequest } from '../api.js'

// El user li 3emel login, moshtarak bayn kel el site.
// El accounts ma7fouzin bel backend (database). Hon mn7ot bas el user w el token taba3o.

const AuthContext = createContext(null)
const USER_KEY = 'support-user'

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser())

  // Btraje3 error message, aw '' iza kel shi mnih
  const signup = async (name, email, password) => {
    try {
      await apiRequest('/api/auth/signup', 'POST', { name, email, password })
      return ''
    } catch (err) {
      return err.message
    }
  }

  const login = async (email, password) => {
    try {
      const data = await apiRequest('/api/auth/login', 'POST', { email, password })
      const loggedIn = { ...data.user, token: data.token }

      // N7ot el token bel localStorage DAGRE (mesh b useEffect):
      // el Chat byetlob men el backend awwal ma yefta7, w lazem yla2e el token jehez
      localStorage.setItem(USER_KEY, JSON.stringify(loggedIn))
      setUser(loggedIn)
      return ''
    } catch (err) {
      return err.message
    }
  }

  const logout = () => {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
