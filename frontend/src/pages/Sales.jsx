import { useRef, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import FilterBar from '../components/FilterBar'
import SalesTable from '../components/SalesTable'
import { Card } from '../components/ui'
import { useApp } from '../context/AppContext'
import { download } from '../utils/api'

export default function Sales() {
  const { toast } = useApp()
  const queryRef = useRef({})

  const [exporting, setExporting] = useState(false)
  const exportCsv = async () => {
    setExporting(true)
    try {
      await download('/sales/export', queryRef.current, 'adidas-sales.csv')
      toast('CSV downloaded')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Sales</h1>
          <p className="text-sm text-slate-500">Every invoice in the selected period. Search, sort and export.</p>
        </div>
        <button className="btn-primary" onClick={exportCsv} disabled={exporting}>{exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export CSV</button>
      </div>
      <FilterBar showPeriod={false} />
      <Card className="overflow-hidden">
        <SalesTable onQuery={(q) => { queryRef.current = q }} />
      </Card>
    </div>
  )
}
