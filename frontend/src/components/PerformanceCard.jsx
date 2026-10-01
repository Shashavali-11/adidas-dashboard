import { CalendarCheck } from 'lucide-react'
import { Card, Change } from './ui'
import { money } from '../utils/format'

export default function PerformanceCard({ state }) {
  const { data } = state

  return (
    <Card className="card-hover hero-bg relative overflow-hidden !border-0 p-5 !text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-100">Latest month {data ? `(${data.month})` : ''}</p>
          {data ? (
            <>
              <p className="mt-1 text-sm text-blue-200">Revenue this month</p>
              <p className="text-xl font-bold">{money(data.current.revenue)}</p>
              <p className="mt-1 text-sm text-blue-200">Profit this month</p>
              <p className="text-xl font-bold">{money(data.current.profit)}</p>
            </>
          ) : <p className="mt-2 text-sm">Loading...</p>}
        </div>
        <div className="rounded-xl bg-white/15 p-2.5"><CalendarCheck className="h-5 w-5" /></div>
      </div>
      {data && (
        <div className="mt-2 flex items-center gap-2">
          <Change value={data.changes.revenue} />
          <span className="text-xs text-blue-200">vs last month</span>
        </div>
      )}
    </Card>
  )
}
