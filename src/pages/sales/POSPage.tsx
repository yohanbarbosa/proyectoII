import { useState } from 'react'
import { useSales } from '../../hooks/useSales'
import { useAuth } from '../../hooks/useAuth'
import ProductSearch from './ProductSearch'
import CartPanel from './CartPanel'
import SaleSuccessModal from './SaleSuccessModal'
import type { Venta, CartItem } from '../../types'

export default function POSPage() {
  const { user, signOut } = useAuth()
  const {
    cart, cartTotal, cartCount,
    cliente, setCliente,
    metodoPago, setMetodoPago,
    addToCart, removeFromCart, updateQty, clearCart,
    processSale, loading
  } = useSales()

  const [completedSale, setCompletedSale] = useState<{ venta: Venta; items: CartItem[] } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleCheckout = async () => {
    setErrorMsg('')
    const result = await processSale()
    if (result.success && result.venta) {
      setCompletedSale({ venta: result.venta, items: [...cart] })
      clearCart()
    } else {
      setErrorMsg(result.error ?? 'Error al procesar la venta')
    }
  }

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top nav */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">AutoPartes JDM</h1>
            <p className="text-zinc-500 text-xs">Punto de venta</p>
          </div>
        </div>

        {/* Nav links — extend with router as needed */}
        <nav className="hidden md:flex items-center gap-1">
          {['Ventas', 'Productos', 'Clientes', 'Proveedores', 'Compras', 'Reportes'].map(item => (
            <button key={item}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${item === 'Ventas' ? 'bg-amber-500/15 text-amber-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-xs font-semibold">{user?.email}</p>
            <p className="text-zinc-500 text-xs">Administrador</p>
          </div>
          <button onClick={signOut}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg px-3 py-2 text-xs font-semibold transition-all flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salir
          </button>
        </div>
      </header>

      {/* Error banner */}
      {errorMsg && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 flex items-center justify-between">
          <p className="text-red-400 text-sm">{errorMsg}</p>
          <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main POS layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: product catalog */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-800">
          <ProductSearch onAddToCart={addToCart} />
        </div>

        {/* Right: cart */}
        <div className="w-80 xl:w-96 shrink-0 flex flex-col overflow-hidden">
          <CartPanel
            cart={cart}
            cartTotal={cartTotal}
            cliente={cliente}
            metodoPago={metodoPago}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onSetCliente={setCliente}
            onSetMetodoPago={setMetodoPago}
            onCheckout={handleCheckout}
            loading={loading}
          />
        </div>
      </div>

      {/* Cart badge for mobile (floating) */}
      {cartCount > 0 && (
        <div className="md:hidden fixed bottom-4 right-4 bg-amber-500 text-zinc-950 rounded-full w-14 h-14 flex items-center justify-center shadow-lg font-bold text-lg">
          {cartCount}
        </div>
      )}

      {/* Success modal */}
      {completedSale && (
        <SaleSuccessModal
          venta={completedSale.venta}
          items={completedSale.items}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  )
}
