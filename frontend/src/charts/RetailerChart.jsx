import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Async, ChartCard, ChartTooltip } from '../components/ui'
import { COLORS, money, money2 } from '../utils/format'
import { axisStyle, barCursor, gridLines } from './chartStyles'

const shortName = (name) => name.replace('Foot Locker', 'FootLocker').replace("Kohl's", 'Kohls').split(' ')[0]

export default function RetailerChart({ state }) {
  return (
    <ChartCard title="Revenue vs Profit by retailer" subtitle="Top retailers in selected period">
      <Async state={state} empty={(data) => !data.length}>
        {(data) => (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ left: 0, right: 10 }}>
              {gridLines}
              <XAxis dataKey="name" {...axisStyle} interval={0} tickFormatter={shortName} />
              <YAxis {...axisStyle} tickFormatter={(v) => money(v, true)} width={55} />
              <Tooltip content={<ChartTooltip formatter={money2} />} cursor={barCursor} />
              <Legend iconType="circle" />
              <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill={COLORS.profit} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Async>
    </ChartCard>
  )
}
