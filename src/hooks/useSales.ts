import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { CartItem, Producto, Cliente, Venta } from '../types'

export function useSales() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [metodoPago, setMetodoPago] = useState<string>('efectivo')
  const [loading, setLoading] = useState(false)

  const cartTotal = cart.reduce((acc, item) => acc + item.subtotal, 0)
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0)

  const addToCart = useCallback((producto: Producto, cantidad = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.producto.id_producto === producto.id_producto)
      if (existing) {
        const newQty = existing.cantidad + cantidad
        if (newQty > producto.stock_actual) return prev
        return prev.map(i =>
          i.producto.id_producto === producto.id_producto
            ? { ...i, cantidad: newQty, subtotal: newQty * producto.precio_venta }
            : i
        )
      }
      if (cantidad > producto.stock_actual) return prev
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
    setCliente(null)
    setMetodoPago('efectivo')
  }, [])

  const processSale = async (): Promise<{ success: boolean; venta?: Venta; error?: string }> => {
    if (cart.length === 0) return { success: false, error: 'El carrito está vacío' }
    setLoading(true)

    try {
      // 1. Create the venta record
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert({
          cliente_id: cliente?.id_cliente ?? null,
          total: cartTotal,
          metodo_pago: metodoPago,
        })
        .select()
        .single()

      if (ventaError) throw ventaError

      // 2. Insert detalle_venta rows
      const detalles = cart.map(item => ({
        venta_id: ventaData.id_venta,
        producto_id: item.producto.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio_venta,
        subtotal: item.subtotal,
      }))

      const { error: detalleError } = await supabase.from('detalle_venta').insert(detalles)
      if (detalleError) throw detalleError

      // 3. Update stock for each product
      for (const item of cart) {
        await supabase
          .from('productos')
          .update({ stock_actual: item.producto.stock_actual - item.cantidad })
          .eq('id_producto', item.producto.id_producto)
      }

      return { success: true, venta: ventaData }
    } catch (err: any) {
      return { success: false, error: err.message ?? 'Error al procesar la venta' }
    } finally {
      setLoading(false)
    }
  }

  return {
    cart, cartTotal, cartCount,
    cliente, setCliente,
    metodoPago, setMetodoPago,
    addToCart, removeFromCart, updateQty, clearCart,
    processSale, loading,
  }
}
