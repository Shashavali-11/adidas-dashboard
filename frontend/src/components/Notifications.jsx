import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Bell, CheckCircle2 } from 'lucide-react'
import useClickOutside from '../hooks/useClickOutside'
import useFetch from '../hooks/useFetch'
import { Spinner } from './ui'

const ICON_COLOR = { danger: 'text-red-500', warning: 'text-amber-500', success: 'text-emerald-500' }

export default function Notifications() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const alerts = useFetch('/dashboard/alerts')
  useClickOutside(ref, () => setOpen(false))

  const list = alerts.data || []

  const openAlert = (alert) => {
    setOpen(false)
    navigate(alert.kind === 'inventory' ? '/inventory' : '/')
  }

  let body
  if (alerts.loading && !alerts.data) {
    body = <Spinner />
  } else if (list.length === 0) {
    body = <p className="p-6 text-center text-sm text-slate-400">All clear - no alerts</p>
  } else {
    body = list.map((alert, index) => {
      const Icon = alert.type === 'success' ? CheckCircle2 : AlertTriangle
      return (
        <button
          key={index}
          onClick={() => openAlert(alert)}
          className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/60"
        >
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${ICON_COLOR[alert.type]}`} />
          <span>
            <span className="block text-sm font-semibold">{alert.title}</span>
            <span className="text-xs text-slate-500">{alert.detail}</span>
          </span>
        </button>
      )
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button className="btn-ghost relative !p-2" onClick={() => setOpen(!open)} aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {list.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{list.length}</span>
        )}
      </button>
      {open && (
        <div className="card pop absolute right-0 z-50 mt-2 w-80 max-w-[85vw] overflow-hidden shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold dark:border-slate-800">Alerts & notifications</div>
          <div className="max-h-80 overflow-y-auto">{body}</div>
        </div>
      )}
    </div>
  )
}
