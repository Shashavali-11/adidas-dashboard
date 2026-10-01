import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Async, ChartCard, ChartTooltip } from '../components/ui'
import { COLORS, money, money2 } from '../utils/format'

const CHANNEL_COLORS = [COLORS.units, COLORS.cost, COLORS.revenue]

export default function ChannelChart({ state }) {
  return (
    <ChartCard title="Sales by channel" subtitle="In-store, Online & Outlet">
      <Async state={state} empty={(data) => !data.length}>
        {(data) => (
          <>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={data} dataKey="revenue" nameKey="name" outerRadius={90} innerRadius={45} stroke="none" label={({ share }) => `${share}%`} labelLine={false}>
                  {data.map((item, index) => <Cell key={item.name} fill={CHANNEL_COLORS[index % 3]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip formatter={money2} />} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5 text-sm">
              {data.map((item) => (
                <div key={item.name} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-semibold">{money(item.revenue, true)} · {item.margin}% margin</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Async>
    </ChartCard>
  )
}
