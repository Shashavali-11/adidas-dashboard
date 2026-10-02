import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { get } from '../utils/api'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [theme, setTheme] = useState(() => load('adi-theme', 'light'))
  const [meta, setMeta] = useState(null)
  const [metaError, setMetaError] = useState(null)
  const [filters, setFilters] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    save('adi-theme', theme)
  }, [theme])

  const loadMeta = useCallback(() => {
    setMetaError(null)
    get('/meta')
      .then((data) => {
        setMeta(data)
        const end = data.dataEnd || data.maxDate || ''
        setFilters({ from: end ? `${end.slice(0, 4)}-01-01` : '', to: end, period: 'month', region: '', retailer: '', category: '', method: '' })
      })
      .catch((err) => setMetaError(err.message))
  }, [])
  // load meta once a user is signed in, clear it on logout
  useEffect(() => {
    if (user) loadMeta()
    else { setMeta(null); setFilters(null) }
  }, [user?.id, loadMeta]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilters = useCallback((patch) => setFilters((current) => ({ ...current, ...patch })), [])
  const refresh = useCallback(() => setRefreshTick((tick) => tick + 1), [])
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, message, type }])
    setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 3500)
  }, [])

  const value = useMemo(() => ({
    theme, toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    profile: user || { name: '', email: '', role: '', region: 'West' },
    meta, metaError, retryMeta: loadMeta, filters, updateFilters, refreshTick, refresh, toast, toasts,
  }), [theme, user, meta, metaError, loadMeta, filters, updateFilters, refreshTick, refresh, toast, toasts])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
