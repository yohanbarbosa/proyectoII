import { useState, useEffect, useCallback } from 'react'
import type { Producto, CartItem } from '../types'

const CART_KEY = 'autopartes_cart_v1'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  } catch {
    console.warn('No se pudo guardar el carrito en caché')
  }
}

export function useCustomerCart() {
  const [cart, setCart] = useState<CartItem[]>(loadCart)

  // Sync to localStorage on every change
  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const cartTotal = cart.reduce((acc, i) => acc + i.subtotal, 0)
  const cartCount = cart.reduce((acc, i) => acc + i.cantidad, 0)

  const addToCart = useCallback((producto: Producto, cantidad = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.producto.id_producto === producto.id_producto)
      if (existing) {
        const newQty = Math.min(existing.cantidad + cantidad, producto.stock_actual)
        return prev.map(i =>
          i.producto.id_producto === producto.id_producto
            ? { ...i, cantidad: newQty, subtotal: newQty * producto.precio_venta }
            : i
        )
      }
      return [...prev, { producto, cantidad, subtotal: cantidad * producto.precio_venta }]
    })
  }, [])

  const removeFromCart = useCallback((productoId: number) => {
    setCart(prev => prev.filter(i => i.producto.id_producto !== productoId))
  }, [])

  const updateQty = useCallback((productoId: number, cantidad: number) => {
    setCart(prev => {
      if (cantidad <= 0) return prev.filter(i => i.producto.id_producto !== productoId)
      return prev.map(i =>
        i.producto.id_producto === productoId
          ? { ...i, cantidad, subtotal: cantidad * i.producto.precio_venta }
          : i
      )
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    localStorage.removeItem(CART_KEY)
  }, [])

  return { cart, cartTotal, cartCount, addToCart, removeFromCart, updateQty, clearCart }
}