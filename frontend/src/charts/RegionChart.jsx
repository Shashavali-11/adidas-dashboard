import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Async, ChartCard, ChartTooltip } from '../components/ui'
import { COLORS, money, money2, num } from '../utils/format'
import { axisStyle, barCursor, gridLinesVertical } from './chartStyles'

export default function RegionChart({ state }) {
  return (
    <ChartCard title="Regional sales summary" subtitle="Revenue and margin by region">
      <Async state={state} empty={(data) => !data.length}>
        {(data) => (
          <>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
                {gridLinesVertical}
                <XAxis type="number" {...axisStyle} tickFormatter={(v) => money(v, true)} />
                <YAxis type="category" dataKey="name" {...axisStyle} width={75} />
                <Tooltip content={<ChartTooltip formatter={money2} />} cursor={barCursor} />
                <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[0, 6, 6, 0]} />
                <Bar dataKey="profit" name="Profit" fill={COLORS.profit} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400">
                  <th className="py-1 text-left font-medium">Region</th>
                  <th className="text-right font-medium">Units</th>
                  <th className="text-right font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {data.map((region) => (
                  <tr key={region.name} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-1.5 font-medium">{region.name}</td>
                    <td className="text-right">{num(region.units)}</td>
                    <td className="text-right">{region.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Async>
    </ChartCard>
  )
}
