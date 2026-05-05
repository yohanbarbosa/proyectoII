import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CartItem, Cliente } from '../../types'

interface Props {
  cart: CartItem[]
  cartTotal: number
  cliente: Cliente | null
  metodoPago: string
  onUpdateQty: (id: number, qty: number) => void
  onRemove: (id: number) => void
  onSetCliente: (c: Cliente | null) => void
  onSetMetodoPago: (m: string) => void
  onCheckout: () => void
  loading: boolean
}

const METODOS = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'tarjeta_credito', label: 'Tarjeta Crédito', icon: '💳' },
  { value: 'tarjeta_debito', label: 'Tarjeta Débito', icon: '💳' },
  { value: 'nequi', label: 'Nequi', icon: '📱' },
  { value: 'daviplata', label: 'Daviplata', icon: '📱' },
]

export default function CartPanel({
  cart, cartTotal, cliente, metodoPago,
  onUpdateQty, onRemove, onSetCliente, onSetMetodoPago, onCheckout, loading
}: Props) {
  const [clienteQuery, setClienteQuery] = useState('')
  const [clienteResults, setClienteResults] = useState<Cliente[]>([])
  const [searchingCliente, setSearchingCliente] = useState(false)

  const searchCliente = async (q: string) => {
    setClienteQuery(q)
    if (q.length < 2) { setClienteResults([]); return }
    setSearchingCliente(true)
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.%${q}%,telefono.ilike.%${q}%`)
      .limit(5)
    setClienteResults(data ?? [])
    setSearchingCliente(false)
  }

  const selectCliente = (c: Cliente) => {
    onSetCliente(c)
    setClienteQuery(c.nombre)
    setClienteResults([])
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800">
        <h2 className="text-white font-bold text-lg">Carrito de venta</h2>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-600">
            <svg className="w-12 h-12 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm">Agrega productos al carrito</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.producto.id_producto}
              className="bg-zinc-800/70 border border-zinc-700/40 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-tight line-clamp-2">{item.producto.nombre}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">${item.producto.precio_venta.toLocaleString('es-CO')} c/u</p>
                </div>
                <button onClick={() => onRemove(item.producto.id_producto)}
                  className="text-zinc-600 hover:text-red-400 transition-colors p-1 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between mt-2.5">
                {/* Qty control */}
                <div className="flex items-center gap-1 bg-zinc-900 rounded-lg border border-zinc-700">
                  <button
                    onClick={() => onUpdateQty(item.producto.id_producto, item.cantidad - 1)}
                    className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >−</button>
                  <span className="w-8 text-center text-white text-sm font-semibold">{item.cantidad}</span>
                  <button
                    onClick={() => onUpdateQty(item.producto.id_producto, item.cantidad + 1)}
                    disabled={item.cantidad >= item.producto.stock_actual}
                    className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                  >+</button>
                </div>
                <span className="text-amber-400 font-bold text-sm">
                  ${item.subtotal.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom panel */}
      <div className="border-t border-zinc-800 px-4 py-4 space-y-4">
        {/* Client search */}
        <div className="relative">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Cliente (opcional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={clienteQuery}
              onChange={e => searchCliente(e.target.value)}
              placeholder="Buscar cliente por nombre o teléfono"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 text-sm
                focus:outline-none focus:border-amber-500 transition-all"
            />
            {cliente && (
              <button onClick={() => { onSetCliente(null); setClienteQuery('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {clienteResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
              {clienteResults.map(c => (
                <button key={c.id_cliente} onClick={() => selectCliente(c)}
                  className="w-full px-4 py-2.5 text-left hover:bg-zinc-700 transition-colors">
                  <p className="text-white text-sm font-medium">{c.nombre}</p>
                  {c.telefono && <p className="text-zinc-400 text-xs">{c.telefono}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Método de pago
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {METODOS.map(m => (
              <button
                key={m.value}
                onClick={() => onSetMetodoPago(m.value)}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center
                  ${metodoPago === m.value
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
              >
                <span className="block text-base mb-0.5">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-zinc-400 text-sm font-medium">Total</span>
          <span className="text-white text-2xl font-bold tracking-tight">
            ${cartTotal.toLocaleString('es-CO')}
          </span>
        </div>

        {/* Checkout */}
        <button
          onClick={onCheckout}
          disabled={cart.length === 0 || loading}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/30 disabled:cursor-not-allowed
            text-zinc-950 font-bold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando venta...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Confirmar venta · ${cartTotal.toLocaleString('es-CO')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
