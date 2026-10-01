import { Link } from 'react-router-dom'
import { AlertTriangle, Boxes } from 'lucide-react'
import { Async, Card } from './ui'

const BG = {
  danger: 'bg-red-50 dark:bg-red-500/10',
  success: 'bg-emerald-50 dark:bg-emerald-500/10',
  warning: 'bg-amber-50 dark:bg-amber-500/10',
}

const ICON = {
  danger: 'text-red-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
}

export default function AlertsList({ state }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><Boxes className="h-4 w-4" /> Inventory & sales alerts</h3>
        <Link to="/inventory" className="text-xs font-semibold text-blue-600">Inventory</Link>
      </div>
      <Async state={state} empty={(data) => !data.length}>
        {(data) => (
          <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {data.map((alert, index) => (
              <li key={index} className={`flex gap-3 rounded-xl p-3 text-sm ${BG[alert.type] || BG.warning}`}>
                <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${ICON[alert.type] || ICON.warning}`} />
                <div>
                  <p className="font-semibold">{alert.title}</p>
                  <p className="text-xs text-slate-500">{alert.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Async>
    </Card>
  )
}
