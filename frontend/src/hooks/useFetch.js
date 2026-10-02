import { useEffect, useState } from 'react'
import { get } from '../utils/api'
import { useApp } from '../context/AppContext'

// Fetches when the path or params change, or when refresh is pressed.
// Retries once if the request fails.
export default function useFetch(path, params, enabled = true) {
  const { refreshTick } = useApp()
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const key = JSON.stringify([path, params, refreshTick, enabled])

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const run = (attempt) => {
      get(path, params, controller.signal)
        .then((data) => setState({ data, loading: false, error: null }))
        .catch((error) => {
          if (error.name === 'AbortError') return
          if (attempt < 1) {
            setTimeout(() => {
              if (!controller.signal.aborted) run(attempt + 1)
            }, 700)
            return
          }
          setState({ data: null, loading: false, error: error.message })
        })
    }
    run(0)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
