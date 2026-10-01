import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useClickOutside from '../hooks/useClickOutside'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const initials = user.name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()

  const goToSettings = () => {
    setOpen(false)
    navigate('/settings')
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Account menu">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-lime-300 to-emerald-500 text-sm font-extrabold text-slate-900">{initials}</span>
        <span className="hidden text-left md:block">
          <span className="block text-sm font-semibold leading-tight">{user.name}</span>
          <span className="text-xs capitalize text-slate-500">{user.role}</span>
        </span>
      </button>
      {open && (
        <div className="card pop absolute right-0 z-50 mt-2 w-60 overflow-hidden shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={goToSettings}>
            <Settings className="h-4 w-4" /> Profile & settings
          </button>
          <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" onClick={logout}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
