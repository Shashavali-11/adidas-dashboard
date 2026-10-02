import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Moon, RefreshCw, ShoppingCart, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useCart } from '../context/CartContext'
import Notifications from './Notifications'
import UserMenu from './UserMenu'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Header({ onMenu }) {
  const { theme, toggleTheme, refresh, profile, toast } = useApp()
  const { count } = useCart()
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)

  const handleRefresh = () => {
    refresh()
    setSpinning(true)
    setTimeout(() => setSpinning(false), 700)
    toast('Dashboard refreshed')
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/75 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 lg:px-8">
      <button className="btn-ghost !p-2 lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <div className="hidden sm:block">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{getGreeting()}, {profile.name.split(' ')[0]}</p>
        <p className="text-xs text-slate-500">Here's how sales are performing</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="btn-ghost !p-2" aria-label="Refresh data" title="Refresh data" onClick={handleRefresh}>
          <RefreshCw className={`h-5 w-5 ${spinning ? 'animate-spin' : ''}`} />
        </button>
        <button className="btn-ghost !p-2" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle light/dark">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <Notifications />
        <button className="btn-ghost relative !p-2" onClick={() => navigate('/cart')} aria-label="Cart">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{count}</span>
          )}
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
