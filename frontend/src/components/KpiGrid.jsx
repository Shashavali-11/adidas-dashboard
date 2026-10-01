import { DollarSign, Percent, PiggyBank, Receipt, ShoppingBag, TrendingUp, Wallet } from 'lucide-react'
import { Async, KpiCard } from './ui'
import PerformanceCard from './PerformanceCard'
import { COLORS, money, money2, num } from '../utils/format'

export default function KpiGrid({ kpis, performance, trend }) {
  return (
    <Async state={kpis} retry={() => window.location.reload()}>
      {(data) => {
        const current = data.current
        const changes = data.changes || {}
        const trendData = trend.data || []
        const spark = (getValue) => trendData.map(getValue)

        return (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Revenue" value={money(current.revenue)} change={changes.revenue} spark={spark((row) => row.revenue)} icon={DollarSign} color={COLORS.revenue} />
            <KpiCard label="Total Profit" value={money(current.profit)} change={changes.profit} spark={spark((row) => row.profit)} icon={PiggyBank} color={COLORS.profit} />
            <KpiCard label="Total Cost" value={money(current.cost)} change={changes.cost} invert spark={spark((row) => row.cost)} icon={Wallet} color={COLORS.cost} />
            <KpiCard label="Units Sold" value={num(current.units)} change={changes.units} spark={spark((row) => row.units)} icon={ShoppingBag} color={COLORS.units} />
            <KpiCard label="Number of Orders" value={num(current.orders)} change={changes.orders} spark={spark((row) => row.orders)} icon={Receipt} color="#06b6d4" />
            <KpiCard
              label="Avg Order Value"
              value={money2(current.avgOrderValue)}
              change={changes.avgOrderValue}
              spark={spark((row) => (row.orders ? row.revenue / row.orders : 0))}
              icon={TrendingUp}
              color="#ec4899"
            />
            <KpiCard
              label="Profit Margin"
              value={`${current.profitMargin}%`}
              change={changes.profitMargin}
              changeSuffix=" pts"
              spark={spark((row) => (row.revenue ? (row.profit / row.revenue) * 100 : 0))}
              icon={Percent}
              color="#14b8a6"
            />
            <PerformanceCard state={performance} />
          </div>
        )
      }}
    </Async>
  )
}
