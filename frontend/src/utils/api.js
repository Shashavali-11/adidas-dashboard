export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const TOKEN_KEY = 'adi-token'
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // storage not available
  }
}

export const qs = (params = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value != null) searchParams.set(key, value)
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  let res
  try { res = await fetch(`${API}${path}`, { ...options, headers: { ...authHeaders(), ...options.headers } }) }
  catch { throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.') }
  if (res.status === 401 && getToken() && !path.startsWith('/auth/login')) {
    // token expired, AuthContext listens for this and logs the user out
    window.dispatchEvent(new Event('auth:expired'))
  }
  if (options.raw && res.ok) return res
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

const json = (method) => (path, body) =>
  request(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

export const get = (path, params, signal) => request(`${path}${qs(params)}`, { signal })
export const post = json('POST')
export const put = json('PUT')

// a plain <a href> can't send the auth header, so fetch the file and download the blob
export async function download(path, params, filename) {
  const res = await request(`${path}${qs(params)}`, { raw: true })
  const url = URL.createObjectURL(await res.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
