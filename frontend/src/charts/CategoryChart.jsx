import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Async, ChartCard, ChartTooltip } from '../components/ui'
import { COLORS, money, money2 } from '../utils/format'

export default function CategoryChart({ state }) {
  return (
    <ChartCard title="Sales by category" subtitle="Share of revenue">
      <Async state={state} empty={(data) => !data.length}>
        {(data) => (
          <>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={data} dataKey="revenue" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3} stroke="none">
                  {data.map((item, index) => <Cell key={item.name} fill={COLORS.palette[index]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip formatter={money2} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: COLORS.palette[index] }} />
                    {item.name}
                  </span>
                  <span className="font-semibold">
                    {money(item.revenue, true)} <span className="font-normal text-slate-400">({item.share}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Async>
    </ChartCard>
  )
}
