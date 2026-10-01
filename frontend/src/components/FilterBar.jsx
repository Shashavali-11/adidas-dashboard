import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, CalendarRange, Filter, GitCompare, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'

const PERIODS = ['day', 'week', 'month', 'quarter', 'year']
const DAY = 864e5
const iso = (date) => date.toISOString().slice(0, 10)
const utc = (dateStr) => new Date(`${dateStr}T00:00:00Z`)
const addDays = (date, n) => new Date(date.getTime() + n * DAY)
const fmt = (dateStr) => utc(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

// "today" is the last day in the data so the presets always have results
function buildPresets(end, min) {
  const last = utc(end)
  const year = last.getUTCFullYear()
  const month = last.getUTCMonth()
  // week starts on monday
  const weekStart = addDays(last, -((last.getUTCDay() + 6) % 7))
  const quarterStartMonth = Math.floor(month / 3) * 3
  const clamp = (dateStr) => (dateStr < min ? min : dateStr)
  return [
    { id: 'today', label: 'Today', from: end, to: end },
    { id: 'yesterday', label: 'Yesterday', from: iso(addDays(last, -1)), to: iso(addDays(last, -1)) },
    { id: '7d', label: 'Last 7 days', from: iso(addDays(last, -6)), to: end },
    { id: '30d', label: 'Last 30 days', from: iso(addDays(last, -29)), to: end },
    { id: 'week', label: 'This week', from: iso(weekStart), to: end },
    { id: 'month', label: 'This month', from: iso(new Date(Date.UTC(year, month, 1))), to: end },
    { id: 'lastmonth', label: 'Last month', from: clamp(iso(new Date(Date.UTC(year, month - 1, 1)))), to: iso(new Date(Date.UTC(year, month, 0))) },
    { id: 'quarter', label: 'This quarter', from: iso(new Date(Date.UTC(year, quarterStartMonth, 1))), to: end },
    { id: 'year', label: 'This year', from: `${year}-01-01`, to: end },
    { id: 'all', label: 'All time', from: min, to: end },
  ]
}

const SELECTS = [
  { key: 'region', label: 'Region', list: 'regions' },
  { key: 'retailer', label: 'Retailer', list: 'retailers' },
  { key: 'category', label: 'Category', list: 'categories' },
  { key: 'method', label: 'Channel', list: 'methods' },
]

// top panel with the date presets, custom range and filters
export default function FilterBar({ title, subtitle, showPeriod = true, showDims = true }) {
  const { filters, updateFilters, meta } = useApp()
  const [custom, setCustom] = useState(false)
  const end = meta.dataEnd || meta.maxDate
  const min = meta.minDate
  const presets = useMemo(() => buildPresets(end, min), [end, min])
  if (!filters) return null

  const activePreset = presets.find((preset) => preset.from === filters.from && preset.to === filters.to)
  const isCustom = custom || !activePreset
  const days = Math.round((utc(filters.to) - utc(filters.from)) / DAY) + 1
  const prevTo = iso(addDays(utc(filters.from), -1))
  const prevFrom = iso(addDays(utc(filters.from), -days))
  const activeDims = SELECTS.filter((select) => filters[select.key]).length

  const reset = () => {
    setCustom(false)
    updateFilters({ from: `${end.slice(0, 4)}-01-01`, to: end, period: 'month', region: '', retailer: '', category: '', method: '' })
  }

  return (
    <section className="hero-bg relative overflow-hidden rounded-3xl p-5 text-white shadow-xl sm:p-7">
      <div className="stripes" aria-hidden />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>}
            {subtitle && <p className="mt-1 max-w-xl text-sm text-slate-300">{subtitle}</p>}
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-lime-300"><CalendarDays className="h-3.5 w-3.5" /> Selected period</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-lg font-extrabold">{fmt(filters.from)} <ArrowRight className="h-4 w-4 text-slate-400" /> {fmt(filters.to)}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300"><GitCompare className="h-3.5 w-3.5" /> {days} day{days > 1 ? 's' : ''} · compared with {fmt(prevFrom)} - {fmt(prevTo)}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400"><CalendarRange className="h-3.5 w-3.5" /> Quick range</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button key={preset.id} onClick={() => { setCustom(false); updateFilters({ from: preset.from, to: preset.to }) }}
                className={`chip ${!isCustom && activePreset?.id === preset.id ? 'chip-on' : 'chip-idle'}`}>{preset.label}</button>
            ))}
            <button onClick={() => setCustom(true)} className={`chip ${isCustom ? 'chip-on' : 'chip-idle'}`}><SlidersHorizontal className="h-3.5 w-3.5" /> Custom</button>
          </div>
          {isCustom && (
            <div className="pop mt-3 flex flex-wrap items-center gap-3">
              <input type="date" aria-label="From date" className="glass-input" value={filters.from} min={min} max={filters.to} onChange={(e) => e.target.value && updateFilters({ from: e.target.value })} />
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <input type="date" aria-label="To date" className="glass-input" value={filters.to} min={filters.from} max={meta.maxDate} onChange={(e) => e.target.value && updateFilters({ to: e.target.value })} />
              <span className="text-xs text-slate-400">Data available {fmt(min)} - {fmt(meta.maxDate)}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-4 border-t border-white/10 pt-5">
          {showPeriod && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Group chart by</p>
              <div className="flex rounded-xl bg-black/30 p-1 ring-1 ring-white/10">
                {PERIODS.map((period) => (
                  <button key={period} onClick={() => updateFilters({ period })}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold capitalize transition ${filters.period === period ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'}`}>{period}</button>
                ))}
              </div>
            </div>
          )}
          {showDims && SELECTS.map(({ key, label, list }) => (
            <label key={key} className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
              <select className={`glass-input !w-36 ${filters[key] ? '!border-lime-300/70 !bg-lime-300/15' : ''}`} value={filters[key] || ''} onChange={(e) => updateFilters({ [key]: e.target.value })}>
                <option value="">All</option>
                {(meta[list] || []).map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          ))}
          <button className="chip chip-idle ml-auto !rounded-xl !py-2.5" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
            {activeDims > 0 && <span className="flex items-center gap-1 rounded-full bg-lime-300 px-1.5 text-[10px] text-slate-900"><Filter className="h-2.5 w-2.5" />{activeDims}</span>}
          </button>
        </div>
      </div>
    </section>
  )
}
