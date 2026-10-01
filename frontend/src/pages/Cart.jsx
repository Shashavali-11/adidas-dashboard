import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Card } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useCart } from '../context/CartContext'
import { post } from '../utils/api'
import { money2 } from '../utils/format'
import { ProductImage } from './Products'

export default function Cart() {
  const { items, setQty, remove, clear, total, count } = useCart()
  const { profile, meta, toast, refresh } = useApp()
  const [form, setForm] = useState({ name: profile.name, email: profile.email, region: profile.region || meta.regions[0], address: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const checkout = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const order = await post('/orders', { customer: form, items: items.map((item) => ({ sku: item.sku, quantity: item.quantity })) })
      setDone(order)
      clear()
      refresh()
      toast('Order placed successfully')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Card className="mx-auto mt-6 max-w-xl p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h1 className="mt-3 text-2xl font-extrabold">Order confirmed!</h1>
        <p className="mt-1 text-slate-500">Order <b>{done.orderNumber}</b> has been saved. Stock was updated and the sale now appears in your analytics.</p>
        <div className="my-5 divide-y divide-slate-100 rounded-xl border border-slate-100 text-left text-sm dark:divide-slate-800 dark:border-slate-800">
          {done.items.map((i) => <div key={i.sku} className="flex justify-between p-3"><span>{i.name} × {i.quantity}</span><b>{money2(i.subtotal)}</b></div>)}
          <div className="flex justify-between p-3 text-base"><b>Total</b><b>{money2(done.total)}</b></div>
        </div>
        <div className="flex justify-center gap-3"><Link to="/orders" className="btn-ghost">View orders</Link><Link to="/products" className="btn-primary">Continue shopping</Link></div>
      </Card>
    )
  }

  if (!items.length) {
    return (
      <Card className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-3 p-12 text-center">
        <ShoppingCart className="h-12 w-12 text-slate-300" />
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="text-sm text-slate-500">Add products from the catalog to place an order.</p>
        <Link to="/products" className="btn-primary">Browse products</Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Shopping cart</h1>
          <p className="text-sm text-slate-500">{count} item{count > 1 ? 's' : ''} in your cart</p>
        </div>
        <button className="btn-ghost text-red-600" onClick={clear}><Trash2 className="h-4 w-4" /> Clear cart</button>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="divide-y divide-slate-100 dark:divide-slate-800 xl:col-span-2">
          {items.map((i) => (
            <div key={i.sku} className="flex flex-wrap items-center gap-4 p-4">
              <ProductImage product={i} className="h-20 w-20 shrink-0" />
              <div className="min-w-40 flex-1">
                <p className="font-bold">{i.name}</p>
                <p className="text-xs text-slate-400">{i.sku} · {money2(i.price)} each · {i.stock} in stock</p>
              </div>
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                <button className="p-2 disabled:opacity-40" disabled={i.quantity <= 1} onClick={() => setQty(i.sku, i.quantity - 1)} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                <input type="number" min="1" max={i.stock} value={i.quantity} onChange={(e) => setQty(i.sku, e.target.value)} className="w-12 bg-transparent text-center text-sm font-semibold outline-none" />
                <button className="p-2 disabled:opacity-40" disabled={i.quantity >= i.stock} onClick={() => setQty(i.sku, i.quantity + 1)} aria-label="Increase"><Plus className="h-4 w-4" /></button>
              </div>
              <p className="w-24 text-right font-bold">{money2(i.price * i.quantity)}</p>
              <button onClick={() => remove(i.sku)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" aria-label={`Remove ${i.name}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </Card>

        <Card className="h-fit p-5">
          <h3 className="font-bold">Order summary</h3>
          <div className="mt-3 space-y-1 text-sm">
            {items.map((i) => <div key={i.sku} className="flex justify-between text-slate-500"><span>{i.name} × {i.quantity}</span><span>{money2(i.price * i.quantity)}</span></div>)}
          </div>
          <div className="my-3 flex justify-between border-t border-slate-100 pt-3 text-lg font-extrabold dark:border-slate-800"><span>Total</span><span>{money2(total)}</span></div>
          <form onSubmit={checkout} className="space-y-3">
            <input className="input" required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <select className="input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>{meta.regions.map((r) => <option key={r}>{r}</option>)}</select>
            <input className="input" placeholder="Shipping address (optional)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10">{error}</p>}
            <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? 'Placing order...' : `Place order · ${money2(total)}`}</button>
          </form>
        </Card>
      </div>
    </div>
  )
}
