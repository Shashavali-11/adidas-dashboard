export const money = (n, compact = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(n || 0)
export const money2 = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)
export const num = (n, compact = false) =>
  new Intl.NumberFormat('en-US', { notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 1 : 0 }).format(n || 0)
export const dateStr = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
export const pctStr = (n) => (n == null ? '—' : `${n > 0 ? '+' : ''}${n}%`)

export const COLORS = {
  revenue: '#2563eb', profit: '#10b981', cost: '#f59e0b', units: '#8b5cf6', alert: '#ef4444',
  palette: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#64748b'],
}
export const STATUS_STYLE = {
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Processing: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Returned: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
}
