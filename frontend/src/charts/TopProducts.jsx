import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Async, ChartCard } from '../components/ui'
import { money, num } from '../utils/format'

export default function TopProducts({ state }) {
  const link = (
    <Link to="/products" className="flex items-center gap-1 text-xs font-semibold text-blue-600">
      All products <ArrowRight className="h-3 w-3" />
    </Link>
  )

  return (
    <ChartCard title="Top-selling products" subtitle="By units sold" action={link}>
      <Async state={state} empty={(data) => !data.length}>
        {(data) => {
          const maxUnits = data[0].units
          return (
            <ol className="space-y-4">
              {data.map((product, index) => (
                <li key={product.sku}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs dark:bg-slate-800">{index + 1}</span>
                      {product.name}
                    </span>
                    <span className="text-slate-500">{num(product.units)} units</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500" style={{ width: `${(product.units / maxUnits) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{money(product.revenue, true)} revenue · {money(product.profit, true)} profit</p>
                </li>
              ))}
            </ol>
          )
        }}
      </Async>
    </ChartCard>
  )
}
