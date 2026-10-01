import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { get, getToken, post, put, setToken } from '../utils/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(() => !!getToken())

  const logout = useCallback(() => { setToken(null); setUser(null) }, [])

  // check the stored token when the app loads
  useEffect(() => {
    if (!getToken()) return
    get('/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => setToken(null))
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [logout])

  const start = (res) => {
    setToken(res.token)
    setUser(res.user)
    return res.user
  }

  const value = useMemo(() => ({
    user, checking, logout,
    login: (email, password) => post('/auth/login', { email, password }).then(start),
    register: (name, email, password) => post('/auth/register', { name, email, password }).then(start),
    updateProfile: (patch) => put('/auth/me', patch).then((res) => {
      setUser(res.user)
      return res.user
    }),
  }), [user, checking, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
