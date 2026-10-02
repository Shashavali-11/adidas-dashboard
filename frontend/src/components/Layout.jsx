import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from './Header'
import Sidebar from './Sidebar'
import { ErrorBox, Spinner, Toasts } from './ui'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { toasts, meta, metaError, retryMeta } = useApp()

  let content
  if (metaError) {
    content = <div className="card"><ErrorBox message={metaError} onRetry={retryMeta} /></div>
  } else if (!meta) {
    content = <div className="card p-10"><Spinner label="Connecting to the database..." /></div>
  } else {
    content = <Outlet />
  }

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-[1600px] p-4 lg:p-8">{content}</main>
      </div>
      <Toasts toasts={toasts} />
    </div>
  )
}
