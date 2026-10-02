import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import useFetch from '../hooks/useFetch'
import { Async, Pagination } from './ui'
import { STATUS_STYLE, dateStr, money2, num } from '../utils/format'

// compact version is used on the dashboard, the full one on the Sales page
export default function SalesTable({ compact = false, limit = 10, params = {}, onQuery }) {
  const { filters } = useApp()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ key: 'invoiceDate', order: 'desc' })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { from, to, region, retailer, category, method } = filters
  const query = { from, to, region, retailer, category, method, search: debouncedSearch, status, sort: sort.key, order: sort.order, ...params }

  useEffect(() => { setPage(1) }, [from, to, region, retailer, category, method, debouncedSearch, status])
  useEffect(() => { onQuery?.(query) }) // eslint-disable-line react-hooks/exhaustive-deps

  const state = useFetch('/sales', { ...query, page, limit })

  const toggleSort = (key) => {
    setSort((current) => {
      if (current.key !== key) return { key, order: 'desc' }
      return { key, order: current.order === 'asc' ? 'desc' : 'asc' }
    })
  }

  const SortIcon = ({ field }) => {
    if (compact) return null
    if (sort.key !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return sort.order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  const SortHead = ({ field, children, right }) => (
    <th
      className={`th ${right ? 'text-right' : ''} ${compact ? '' : 'cursor-pointer select-none hover:text-slate-800 dark:hover:text-white'}`}
      onClick={compact ? undefined : () => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </span>
    </th>
  )

  return (
    <div>
      {!compact && (
        <div className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input !pl-9" placeholder="Search product, retailer, city, invoice..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input !w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {Object.keys(STATUS_STYLE).map((name) => <option key={name}>{name}</option>)}
          </select>
        </div>
      )}
      <Async state={state} empty={(data) => !data.items.length}>
        {(data) => (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <SortHead field="productName">Product</SortHead>
                    <SortHead field="invoiceDate">Date</SortHead>
                    {!compact && <SortHead field="retailer">Retailer</SortHead>}
                    {!compact && <SortHead field="region">Region</SortHead>}
                    <SortHead field="unitsSold" right>Qty</SortHead>
                    <SortHead field="totalSales" right>Revenue</SortHead>
                    <SortHead field="operatingProfit" right>Profit</SortHead>
                    <SortHead field="status">Status</SortHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.items.map((sale) => (
                    <tr key={sale._id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="td"><p className="font-semibold">{sale.productName}</p><p className="text-xs text-slate-400">{sale.orderNumber}</p></td>
                      <td className="td whitespace-nowrap">{dateStr(sale.invoiceDate)}</td>
                      {!compact && <td className="td">{sale.retailer}<p className="text-xs text-slate-400">{sale.salesMethod}</p></td>}
                      {!compact && <td className="td">{sale.region}<p className="text-xs text-slate-400">{sale.city}, {sale.state}</p></td>}
                      <td className="td text-right">{num(sale.unitsSold)}</td>
                      <td className="td text-right font-semibold">{money2(sale.totalSales)}</td>
                      <td className="td text-right font-semibold text-emerald-600">{money2(sale.operatingProfit)}</td>
                      <td className="td"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[sale.status] || ''}`}>{sale.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!compact && <Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onChange={setPage} />}
          </>
        )}
      </Async>
    </div>
  )
}
