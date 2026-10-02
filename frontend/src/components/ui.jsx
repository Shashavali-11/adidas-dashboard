import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, Loader2, TrendingDown, TrendingUp, X } from 'lucide-react'
import { useEffect } from 'react'
import { pctStr } from '../utils/format'

export const Card = ({ className = '', children, ...rest }) => <div className={`card ${className}`} {...rest}>{children}</div>

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" /> {label}
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">{message || 'Something went wrong.'}</p>
      {onRetry && <button className="btn-ghost" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function Empty({ text = 'No data for the selected filters' }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-slate-400">
      <Inbox className="h-8 w-8" /> <p className="text-sm">{text}</p>
    </div>
  )
}

// shows a spinner, error or empty message depending on the fetch state
export function Async({ state, empty, children, retry }) {
  if (state.loading && !state.data) return <Spinner />
  if (state.error) return <ErrorBox message={state.error} onRetry={retry} />
  if (empty && empty(state.data)) return <Empty />
  return <div className={state.loading ? 'opacity-60 transition-opacity' : 'fade-in'}>{children(state.data)}</div>
}

export function ChartCard({ title, subtitle, action, children, className = '' }) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

export function Change({ value, suffix = '%', invert = false }) {
  if (value == null) return <span className="text-xs text-slate-400">no prior data</span>
  const up = value >= 0
  const good = invert ? !up : up
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${good ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
      <Icon className="h-3 w-3" />{suffix === '%' ? pctStr(value) : `${value > 0 ? '+' : ''}${value}${suffix}`}
    </span>
  )
}

export function Sparkline({ data = [], color = '#3b82f6', id }) {
  if (data.length < 2) return <div className="h-10" />
  const width = 120
  const height = 40
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((value, index) => [
    (index / (data.length - 1)) * width,
    height - 4 - ((value - min) / range) * (height - 8),
  ])
  const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const gid = `sp-${id}`
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".35" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function KpiCard({ label, value, change, changeSuffix, invert, icon: Icon, color, hint, spark }) {
  const id = label.replace(/[^a-z0-9]/gi, '')
  return (
    <Card className="card-hover group relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1.5 text-[clamp(1.2rem,1.9vw,1.65rem)] font-extrabold leading-none whitespace-nowrap tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="rounded-xl p-2.5 text-white shadow-lg transition group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 8px 18px -6px ${color}99` }}><Icon className="h-5 w-5" /></div>
      </div>
      {spark && <div className="-mx-1 mt-3"><Sparkline data={spark} color={color} id={id} /></div>}
      <div className="mt-2 flex items-center gap-2">
        <Change value={change} suffix={changeSuffix} invert={invert} />
        <span className="text-xs text-slate-400">{hint || 'vs previous period'}</span>
      </div>
    </Card>
  )
}

export function Pagination({ page, pages, total, limit, onChange }) {
  const from = total ? (page - 1) * limit + 1 : 0
  const to = Math.min(page * limit, total)
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-800">
      <span>Showing {from}-{to} of {total.toLocaleString()}</span>
      <div className="flex items-center gap-1">
        <button className="btn-ghost !px-2 !py-1" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        <span className="px-2">Page {page} / {pages}</span>
        <button className="btn-ghost !px-2 !py-1" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`card fade-in max-h-[90vh] w-full overflow-y-auto ${wide ? 'max-w-3xl' : 'max-w-lg'}`} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {label != null && <p className="mb-1 font-semibold text-slate-900 dark:text-white">{label}</p>}
      {payload.map((item) => (
        <p key={item.dataKey + item.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ background: item.color || item.payload?.fill }} />
          {item.name}: <b>{formatter ? formatter(item.value, item.dataKey) : item.value}</b>
        </p>
      ))}
    </div>
  )
}

export function Toasts({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`fade-in rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-slate-900 dark:bg-emerald-600'}`}>{toast.message}</div>
      ))}
    </div>
  )
}
