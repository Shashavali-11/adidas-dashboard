import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('adi-cart')) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem('adi-cart', JSON.stringify(items))
    } catch {
      // ignore storage errors
    }
  }, [items])

  // returns { ok, message } so the caller can show a toast
  const add = (product, qty = 1) => {
    if (product.stock <= 0) return { ok: false, message: `${product.name} is out of stock` }
    const existing = items.find((item) => item.sku === product.sku)
    const current = existing ? existing.quantity : 0
    const next = Math.min(current + qty, product.stock)
    if (next === current) return { ok: false, message: `Only ${product.stock} in stock` }
    const line = { sku: product.sku, name: product.name, price: product.price, stock: product.stock, color: product.color, category: product.category, quantity: next }
    setItems(existing ? items.map((item) => (item.sku === product.sku ? line : item)) : [...items, line])
    return { ok: true, message: `${product.name} added to cart` }
  }
  const setQty = (sku, qty) => setItems((list) => list.map((item) => (item.sku === sku ? { ...item, quantity: Math.max(1, Math.min(Number(qty) || 1, item.stock)) } : item)))
  const remove = (sku) => setItems((list) => list.filter((item) => item.sku !== sku))
  const clear = () => setItems([])

  const value = useMemo(() => ({
    items, add, setQty, remove, clear,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: +items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  }), [items]) // eslint-disable-line react-hooks/exhaustive-deps

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
