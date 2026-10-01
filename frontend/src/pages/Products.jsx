import { useEffect, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Minus, Plus, Search, ShoppingCart } from 'lucide-react'
import FilterBar from '../components/FilterBar'
import { Async, Card, ChartTooltip, Modal, Pagination } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useCart } from '../context/CartContext'
import useFetch from '../hooks/useFetch'
import { COLORS, money, money2, num } from '../utils/format'

export function StockBadge({ product }) {
  let label
  let style
  if (product.stock === 0) {
    label = 'Out of stock'
    style = 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
  } else if (product.stock <= product.reorderLevel) {
    label = `Low stock · ${product.stock}`
    style = 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
  } else {
    label = `In stock · ${product.stock}`
    style = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
  }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{label}</span>
}

const SWATCH = { 'Core Black': '#111827', 'Cloud White': '#e2e8f0', 'Team Navy': '#1e3a8a', 'Solar Red': '#dc2626', 'Semi Lucid Blue': '#60a5fa', 'Grey Three': '#9ca3af' }
export function ProductImage({ product, className = 'h-36' }) {
  const color = SWATCH[product.color] || '#334155'
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`} style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
      <svg viewBox="0 0 64 64" className="h-16 w-16 text-white/80"><path d="M6 46l12-22 8 14 10-20 8 16 10-18" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-800">{product.category}</span>
    </div>
  )
}

export default function Products() {
  const { filters, toast } = useApp()
  const cart = useCart()
  const [form, setForm] = useState({ search: '', category: '', gender: '', stock: '', sort: 'units', order: 'desc' })
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(form.search), 300)
    return () => clearTimeout(timer)
  }, [form.search])
  useEffect(() => setPage(1), [debounced, form.category, form.gender, form.stock, form.sort, form.order, filters.from, filters.to])

  const state = useFetch('/products', { ...form, search: debounced, from: filters.from, to: filters.to, page, limit: 8 })
  const updateForm = (patch) => setForm((current) => ({ ...current, ...patch }))
  const addToCart = (product, qty = 1) => {
    const result = cart.add(product, qty)
    toast(result.message, result.ok ? 'success' : 'error')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Products</h1>
        <p className="text-sm text-slate-500">Catalog with sales performance for the selected period. Add items to your cart.</p>
      </div>
      <FilterBar showPeriod={false} showDims={false} />
      <Card className="flex flex-wrap gap-3 p-4">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input !pl-9" placeholder="Search products..." value={form.search} onChange={(e) => updateForm({ search: e.target.value })} />
        </div>
        <select className="input !w-36" value={form.category} onChange={(e) => updateForm({ category: e.target.value })}><option value="">All categories</option><option>Footwear</option><option>Apparel</option></select>
        <select className="input !w-32" value={form.gender} onChange={(e) => updateForm({ gender: e.target.value })}><option value="">All genders</option><option>Men</option><option>Women</option></select>
        <select className="input !w-36" value={form.stock} onChange={(e) => updateForm({ stock: e.target.value })}><option value="">Any stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
        <select className="input !w-44" value={`${form.sort}:${form.order}`} onChange={(e) => { const [sort, order] = e.target.value.split(':'); updateForm({ sort, order }) }}>
          <option value="units:desc">Best selling</option><option value="revenue:desc">Highest revenue</option><option value="profit:desc">Highest profit</option>
          <option value="price:asc">Price: low to high</option><option value="price:desc">Price: high to low</option><option value="stock:asc">Stock: low to high</option><option value="name:asc">Name A-Z</option>
        </select>
      </Card>

      <Async state={state} empty={(data) => !data.items.length}>
        {(data) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {data.items.map((product) => (
                <Card key={product.sku} className="card-hover flex flex-col p-4">
                  <button onClick={() => setSelected(product.sku)} className="text-left"><ProductImage product={product} /></button>
                  <div className="mt-3 flex-1">
                    <p className="text-xs text-slate-400">{product.productLine}</p>
                    <button onClick={() => setSelected(product.sku)} className="text-left text-base font-bold text-slate-900 hover:text-blue-600 dark:text-white">{product.name}</button>
                    <div className="mt-1 flex items-center justify-between"><span className="text-lg font-extrabold">{money2(product.price)}</span><StockBadge product={product} /></div>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800"><dt className="text-slate-400">Units</dt><dd className="font-bold">{num(product.units, true)}</dd></div>
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800"><dt className="text-slate-400">Revenue</dt><dd className="font-bold">{money(product.revenue, true)}</dd></div>
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800"><dt className="text-slate-400">Profit</dt><dd className="font-bold text-emerald-600">{money(product.profit, true)}</dd></div>
                    </dl>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="btn-ghost flex-1" onClick={() => setSelected(product.sku)}>Details</button>
                    <button className="btn-primary flex-1" disabled={product.stock === 0} onClick={() => addToCart(product)}><ShoppingCart className="h-4 w-4" /> {product.stock === 0 ? 'Sold out' : 'Add'}</button>
                  </div>
                </Card>
              ))}
            </div>
            <Card><Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onChange={setPage} /></Card>
          </>
        )}
      </Async>

      <ProductModal sku={selected} onClose={() => setSelected(null)} onAdd={addToCart} />
    </div>
  )
}

function ProductModal({ sku, onClose, onAdd }) {
  const { filters } = useApp()
  const state = useFetch(`/products/${sku}`, { from: filters.from, to: filters.to }, !!sku)
  const [qty, setQty] = useState(1)
  useEffect(() => setQty(1), [sku])
  const detail = state.data
  return (
    <Modal open={!!sku} onClose={onClose} title={detail ? detail.product.name : 'Product details'} wide>
      <Async state={state}>
        {(data) => (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <ProductImage product={data.product} className="h-48" />
              <div>
                <p className="text-xs text-slate-400">{data.product.sku} · {data.product.productLine}</p>
                <p className="mt-1 text-3xl font-extrabold">{money2(data.product.price)}</p>
                <div className="mt-2"><StockBadge product={data.product} /></div>
                <p className="mt-3 text-sm text-slate-500">{data.product.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                    <button className="p-2" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                    <button className="p-2" onClick={() => setQty(Math.min(data.product.stock, qty + 1))} aria-label="Increase"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button className="btn-primary flex-1" disabled={data.product.stock === 0} onClick={() => onAdd(data.product, qty)}><ShoppingCart className="h-4 w-4" /> Add to cart</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[['Revenue', money(data.metrics.revenue)], ['Profit', money(data.metrics.profit)], ['Units sold', num(data.metrics.units)], ['Margin', `${data.metrics.margin}%`]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-400">{k}</p><p className="text-lg font-bold">{v}</p></div>
              ))}
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Sales history (monthly)</h4>
              {data.history.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
                    <XAxis dataKey="label" fontSize={11} stroke="none" minTickGap={20} />
                    <YAxis fontSize={11} stroke="none" tickFormatter={(v) => money(v, true)} width={50} />
                    <Tooltip content={<ChartTooltip formatter={money2} />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.revenue} fill={COLORS.revenue} fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="profit" name="Profit" stroke={COLORS.profit} fill={COLORS.profit} fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-slate-400">No sales in the selected date range.</p>}
            </div>
            {data.regions.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Revenue by region</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={data.regions} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" fontSize={11} stroke="none" width={70} />
                    <Tooltip content={<ChartTooltip formatter={money2} />} cursor={{ fill: '#94a3b822' }} />
                    <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </Async>
    </Modal>
  )
}
