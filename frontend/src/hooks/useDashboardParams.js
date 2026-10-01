import { useApp } from '../context/AppContext'

export default function useDashboardParams() {
  const { filters } = useApp()
  const { from, to, region, retailer, category, method } = filters
  return { from, to, region, retailer, category, method }
}
