import { Link } from 'react-router-dom'
import { Async, Card } from '../components/ui'
import useFetch from '../hooks/useFetch'
import { STATUS_STYLE, dateStr, money2 } from '../utils/format'

export default function Orders() {
  const state = useFetch('/orders', { limit: 50 })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Orders</h1>
        <p className="text-sm text-slate-500">Orders placed through the cart, stored in MongoDB.</p>
      </div>
      <Async state={state} empty={(data) => !data.length}>
        {(data) => (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="th">Order</th><th className="th">Date</th><th className="th">Customer</th><th className="th">Items</th><th className="th text-right">Total</th><th className="th">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="td font-semibold">{order.orderNumber}</td>
                    <td className="td">{dateStr(order.createdAt)}</td>
                    <td className="td">{order.customer.name}<p className="text-xs text-slate-400">{order.customer.email} · {order.customer.region}</p></td>
                    <td className="td text-sm">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</td>
                    <td className="td text-right font-bold">{money2(order.total)}</td>
                    <td className="td"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </Async>
      {state.data && !state.data.length && <p className="text-center text-sm text-slate-500">No orders yet. <Link className="font-semibold text-blue-600" to="/products">Shop the catalog</Link></p>}
    </div>
  )
}
