import { Crown, MapPin, Store, TrendingDown } from 'lucide-react'
import { COLORS, money, num } from '../utils/format'

const first = (list) => (list && list.length ? list[0] : null)

const lowestRevenue = (list) => {
  if (!list || list.length < 2) return null
  return [...list].sort((a, b) => a.revenue - b.revenue)[0]
}

export default function Highlights({ regions, retailers, lines, top }) {
  const items = [
    {
      label: 'Best region',
      icon: MapPin,
      color: COLORS.revenue,
      row: first(regions),
      detail: (row) => `${money(row.revenue, true)} revenue · ${row.margin}% margin`,
    },
    {
      label: 'Best retailer',
      icon: Store,
      color: COLORS.profit,
      row: first(retailers),
      detail: (row) => `${money(row.revenue, true)} revenue · ${num(row.units, true)} units`,
    },
    {
      label: 'Best selling product',
      icon: Crown,
      color: COLORS.cost,
      row: first(top),
      detail: (row) => `${num(row.units)} units · ${money(row.revenue, true)}`,
    },
    {
      label: 'Lowest performing line',
      icon: TrendingDown,
      color: COLORS.alert,
      row: lowestRevenue(lines),
      detail: (row) => `${money(row.revenue, true)} revenue · ${row.margin}% margin`,
    },
  ]

  if (!items.some((item) => item.row)) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, icon: Icon, color, row, detail }) => row && (
        <div key={label} className="card card-hover flex items-center gap-4 p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${color}1f`, color }}>
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="truncate font-extrabold text-slate-900 dark:text-white">{row.name}</p>
            <p className="truncate text-xs text-slate-500">{detail(row)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
