import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Loader2, Lock, Mail, ShieldCheck, Sparkles, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

const HIGHLIGHTS = [
  { icon: BarChart3, title: '9,648 sales records', text: 'Adidas US sales 2020-2021 stored in MongoDB.' },
  { icon: Sparkles, title: 'Filters', text: 'Filter by date, region, retailer, category and channel.' },
  { icon: ShieldCheck, title: 'Login', text: 'JWT authentication with hashed passwords.' },
]

export default function Login() {
  const { login, register } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
      nav(location.state?.from || '/', { replace: true })
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  const fillDemo = () => setForm({ ...form, email: 'admin@adidas.com', password: 'Admin@123' })

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hero-bg relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="stripes" aria-hidden />
        <Logo dark />
        <div className="relative max-w-md">
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight">Sales<br />dashboard<span className="text-lime-300">.</span></h1>
          <p className="mt-4 text-lg text-slate-300">Track sales, profit and inventory in one place.</p>
          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"><Icon className="h-5 w-5 text-lime-300" /></span>
                <span><span className="block font-semibold">{title}</span><span className="text-sm text-slate-400">{text}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-slate-500">MERN project</p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-1 text-sm text-slate-500">{mode === 'login' ? 'Sign in to your account.' : 'Enter your details to sign up.'}</p>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
            {[['login', 'Sign in'], ['register', 'Sign up']].map(([m, label]) => (
              <button key={m} type="button" onClick={() => { setMode(m); setError('') }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${mode === m ? 'bg-white text-slate-900 shadow dark:bg-slate-600 dark:text-white' : 'text-slate-500'}`}>{label}</button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'register' && <Field icon={User} label="Full name" value={form.name} onChange={setField('name')} autoComplete="name" required />}
            <Field icon={Mail} label="Email" type="email" value={form.email} onChange={setField('email')} autoComplete="email" required />
            <Field icon={Lock} label="Password" type="password" value={form.password} onChange={setField('password')} minLength={mode === 'register' ? 6 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
            <button className="btn-primary w-full !py-3 !text-base" disabled={busy}>
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>

          {mode === 'login' && (
            <button type="button" onClick={fillDemo} className="mt-4 w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm text-slate-600 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-white dark:hover:text-white">
              Use demo account <span className="font-semibold">admin@adidas.com</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, ...props }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}
      <div className="relative mt-1">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input !py-3 !pl-10 font-normal" {...props} />
      </div>
    </label>
  )
}
