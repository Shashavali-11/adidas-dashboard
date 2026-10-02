import { NavLink } from 'react-router-dom'
import { Boxes, ClipboardList, LayoutDashboard, Settings, ShoppingBag, ShoppingCart, Table2, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import Logo from './Logo'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sales', label: 'Sales', icon: Table2 },
  { to: '/products', label: 'Products', icon: ShoppingBag },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const ACTIVE_LINK = 'bg-lime-300 text-slate-900 shadow-[0_8px_24px_-8px_rgba(190,242,100,.55)]'
const IDLE_LINK = 'text-slate-400 hover:bg-white/5 hover:text-white'

export default function Sidebar({ open, onClose }) {
  const { count } = useCart()

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden bg-slate-950 p-5 text-slate-300 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="stripes !right-[-120px] !opacity-[.05]" aria-hidden />
        <div className="relative mb-8 flex items-center justify-between">
          <Logo />
          <button className="text-slate-400 lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="relative flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${isActive ? ACTIVE_LINK : IDLE_LINK}`}
            >
              <Icon className="h-5 w-5 transition group-hover:scale-110" /> {label}
              {label === 'Cart' && count > 0 && <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">{count}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="relative rounded-2xl bg-gradient-to-br from-white/10 to-white/[.02] p-4 ring-1 ring-white/10">
          <p className="text-sm font-bold text-white">Sales data</p>
          <p className="mt-1 text-xs text-slate-400">Adidas US sales, 2020-2021.</p>
        </div>
      </aside>
    </>
  )
}
