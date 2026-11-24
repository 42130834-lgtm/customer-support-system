// Kel el requests lal backend betmorr men hon.
//
// - Bel development (npm run dev): '/api/...' byerja3 3al backend (port 8000) b fadl el proxy bel vite.config.js
// - Online: 7ot link el backend b VITE_API_URL (file .env.production)

const API_URL = import.meta.env.VITE_API_URL || ''

// Btraje3 el token taba3 el user li 3emel login (iza fi)
function getToken() {
  try {
    const saved = JSON.parse(localStorage.getItem('support-user'))
    return saved ? saved.token : null
  } catch {
    return null
  }
}

// async / await: el request byekhod wa2t, fa mnestanna el jawab abl ma nkammel
export async function apiRequest(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token

  let response
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    })
  } catch {
    // Ma 2der yousal lal server abadan
    const error = new Error('Cannot reach the server. Is the backend running?')
    error.status = 0
    throw error
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    // FastAPI byeb3at el error b "detail"
    const message = typeof data.detail === 'string' ? data.detail : 'Something went wrong.'
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return data
}
