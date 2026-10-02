import { useState } from 'react'
import { KeyRound, LogOut, Moon, Save, Sun } from 'lucide-react'
import { Card } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { theme, toggleTheme, meta, toast } = useApp()
  const { user, updateProfile, logout } = useAuth()
  const [form, setForm] = useState({ name: user.name, region: user.region || meta.regions[0] })
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await updateProfile({ ...form, ...(password && { password }) })
      setPassword('')
      toast('Profile saved')
    } catch (err) { toast(err.message, 'error') }
    finally { setBusy(false) }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Profile & settings</h1>
        <p className="text-sm text-slate-500">Your account is stored in MongoDB. The region is used to prefill checkout.</p>
      </div>
      <Card className="p-6">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Full name
            <input className="input mt-1 font-normal" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Email
            <input className="input mt-1 font-normal opacity-60" value={user.email} disabled />
          </label>
          <label className="text-sm font-semibold">Default region
            <select className="input mt-1 font-normal" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>{meta.regions.map((r) => <option key={r}>{r}</option>)}</select>
          </label>
          <label className="text-sm font-semibold">Role
            <input className="input mt-1 font-normal capitalize opacity-60" value={user.role} disabled />
          </label>
          <label className="text-sm font-semibold sm:col-span-2"><span className="flex items-center gap-1"><KeyRound className="h-3.5 w-3.5" /> New password <span className="font-normal text-slate-400">(leave blank to keep current)</span></span>
            <input className="input mt-1 font-normal" type="password" minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <div className="sm:col-span-2"><button className="btn-primary" disabled={busy}><Save className="h-4 w-4" /> Save profile</button></div>
        </form>
      </Card>
      <Card className="flex items-center justify-between p-6">
        <div><h3 className="font-bold">Appearance</h3><p className="text-sm text-slate-500">Currently using {theme} mode.</p></div>
        <button className="btn-ghost" onClick={toggleTheme}>{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Switch to {theme === 'dark' ? 'light' : 'dark'}</button>
      </Card>
      <Card className="flex items-center justify-between p-6">
        <div><h3 className="font-bold">Session</h3><p className="text-sm text-slate-500">Signed in as {user.email}.</p></div>
        <button className="btn-ghost !text-rose-600" onClick={logout}><LogOut className="h-4 w-4" /> Sign out</button>
      </Card>
      <Card className="p-6 text-sm text-slate-500">
        <h3 className="mb-2 font-bold text-slate-900 dark:text-white">Data source</h3>
        Sales data covers {meta.minDate} to {meta.maxDate} across {meta.regions.length} regions and {meta.retailers.length} retailers, loaded from MongoDB via the Express API.
      </Card>
    </div>
  )
}
