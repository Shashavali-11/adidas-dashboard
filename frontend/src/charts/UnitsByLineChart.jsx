import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Async, ChartCard, ChartTooltip } from '../components/ui'
import { COLORS, num } from '../utils/format'
import { axisStyle, barCursor, gridLines } from './chartStyles'

const shortName = (name) => name.replace(' Footwear', '').replace("Men's", 'M').replace("Women's", 'W')

export default function UnitsByLineChart({ state }) {
  return (
    <ChartCard title="Units sold by product line" subtitle="Total units in selected period">
      <Async state={state} empty={(data) => !data.length}>
        {(data) => (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ left: 0, right: 10 }}>
              {gridLines}
              <XAxis dataKey="name" {...axisStyle} tickFormatter={shortName} interval={0} />
              <YAxis {...axisStyle} tickFormatter={(v) => num(v, true)} width={50} />
              <Tooltip content={<ChartTooltip formatter={(v) => num(v)} />} cursor={barCursor} />
              <Bar dataKey="units" name="Units" radius={[6, 6, 0, 0]}>
                {data.map((item, index) => <Cell key={item.name} fill={COLORS.palette[index % 8]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Async>
    </ChartCard>
  )
}
