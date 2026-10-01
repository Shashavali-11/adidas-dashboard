import { Boxes, DollarSign, PackageX, TriangleAlert } from 'lucide-react'
import { Async, Card, KpiCard } from '../components/ui'
import useFetch from '../hooks/useFetch'
import { COLORS, money, money2, num } from '../utils/format'
import { StockBadge } from './Products'

export default function Inventory() {
  const state = useFetch('/inventory')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Inventory</h1>
        <p className="text-sm text-slate-500">Live stock levels. Completed orders reduce stock automatically.</p>
      </div>
      <Async state={state}>
        {(data) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Total SKUs" value={data.summary.totalSkus} icon={Boxes} color={COLORS.revenue} hint="products in catalog" />
              <KpiCard label="Units in stock" value={num(data.summary.totalUnits)} icon={Boxes} color={COLORS.units} hint="across all SKUs" />
              <KpiCard label="Stock value" value={money(data.summary.stockValue, true)} icon={DollarSign} color={COLORS.profit} hint="at retail price" />
              <KpiCard label="Low / Out of stock" value={`${data.summary.low} / ${data.summary.out}`} icon={data.summary.out ? PackageX : TriangleAlert} color={COLORS.alert} hint="need restocking" />
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="th">SKU</th><th className="th">Product</th><th className="th">Category</th><th className="th text-right">Price</th><th className="th">Stock level</th><th className="th">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.items.map((item) => {
                      const stockPercent = Math.min(100, (item.stock / (item.reorderLevel * 6)) * 100)
                      return (
                        <tr key={item.sku} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="td text-slate-400">{item.sku}</td>
                          <td className="td font-semibold">{item.name}<p className="text-xs font-normal text-slate-400">{item.productLine}</p></td>
                          <td className="td">{item.category}</td>
                          <td className="td text-right">{money2(item.price)}</td>
                          <td className="td w-56">
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full" style={{ width: `${stockPercent}%`, background: item.stock === 0 ? COLORS.alert : item.stock <= item.reorderLevel ? COLORS.cost : COLORS.profit }} /></div>
                            <span className="text-xs text-slate-400">{num(item.stock)} units (reorder at {item.reorderLevel})</span>
                          </td>
                          <td className="td"><StockBadge product={item} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </Async>
    </div>
  )
}
