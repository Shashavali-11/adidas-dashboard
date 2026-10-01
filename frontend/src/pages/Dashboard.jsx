import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AlertsList from '../components/AlertsList'
import FilterBar from '../components/FilterBar'
import Highlights from '../components/Highlights'
import KpiGrid from '../components/KpiGrid'
import SalesTable from '../components/SalesTable'
import { Card } from '../components/ui'
import CategoryChart from '../charts/CategoryChart'
import ChannelChart from '../charts/ChannelChart'
import RegionChart from '../charts/RegionChart'
import RetailerChart from '../charts/RetailerChart'
import RevenueChart from '../charts/RevenueChart'
import TopProducts from '../charts/TopProducts'
import UnitsByLineChart from '../charts/UnitsByLineChart'
import { useApp } from '../context/AppContext'
import useDashboardParams from '../hooks/useDashboardParams'
import useFetch from '../hooks/useFetch'

const DAY_MS = 864e5

// the sparklines use their own grouping so a short range still draws a line
function sparkPeriodFor(from, to) {
  const days = Math.round((new Date(to) - new Date(from)) / DAY_MS) + 1
  if (days <= 45) return 'day'
  if (days <= 210) return 'week'
  return 'month'
}

export default function Dashboard() {
  const { filters } = useApp()
  const params = useDashboardParams()

  const kpis = useFetch('/dashboard/kpis', params)
  const performance = useFetch('/dashboard/performance', { region: params.region, retailer: params.retailer, category: params.category })
  const trend = useFetch('/dashboard/trend', { ...params, period: filters.period })
  const sparkTrend = useFetch('/dashboard/trend', { ...params, period: sparkPeriodFor(params.from, params.to) })
  const categories = useFetch('/dashboard/breakdown/category', params)
  const lines = useFetch('/dashboard/breakdown/line', params)
  const regions = useFetch('/dashboard/breakdown/region', params)
  const retailers = useFetch('/dashboard/breakdown/retailer', params)
  const methods = useFetch('/dashboard/breakdown/method', params)
  const topProducts = useFetch('/dashboard/top-products', { ...params, limit: 6 })
  const alerts = useFetch('/dashboard/alerts')

  return (
    <div className="space-y-6">
      <FilterBar title="Sales Overview" subtitle="Revenue, profit and performance across regions, retailers and products." />

      <KpiGrid kpis={kpis} performance={performance} trend={sparkTrend} />

      <Highlights regions={regions.data} retailers={retailers.data} lines={lines.data} top={topProducts.data} />

      <div className="grid gap-4 xl:grid-cols-3">
        <RevenueChart state={trend} period={filters.period} />
        <CategoryChart state={categories} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <UnitsByLineChart state={lines} />
        <RetailerChart state={retailers} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <RegionChart state={regions} />
        <ChannelChart state={methods} />
        <TopProducts state={topProducts} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <AlertsList state={alerts} />
        <Card className="overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent sales</h3>
            <Link to="/sales" className="flex items-center gap-1 text-xs font-semibold text-blue-600">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <SalesTable compact limit={7} />
        </Card>
      </div>
    </div>
  )
}
