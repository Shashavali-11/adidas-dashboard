import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Async, ChartCard, ChartTooltip } from '../components/ui'
import { COLORS, money, money2 } from '../utils/format'
import { axisStyle, gridLines } from './chartStyles'

export default function RevenueChart({ state, period }) {
  return (
    <ChartCard className="xl:col-span-2" title="Revenue & Profit over time" subtitle={`Grouped by ${period}`}>
      <Async state={state} empty={(data) => !data.length}>
        {(data) => (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ left: 0, right: 10, top: 5 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.profit} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.profit} stopOpacity={0} />
                </linearGradient>
              </defs>
              {gridLines}
              <XAxis dataKey="label" {...axisStyle} minTickGap={24} />
              <YAxis {...axisStyle} tickFormatter={(v) => money(v, true)} width={55} />
              <Tooltip content={<ChartTooltip formatter={money2} />} />
              <Legend iconType="circle" />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.revenue} strokeWidth={2.5} fill="url(#gRev)" />
              <Area type="monotone" dataKey="profit" name="Profit" stroke={COLORS.profit} strokeWidth={2.5} fill="url(#gPro)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Async>
    </ChartCard>
  )
}
