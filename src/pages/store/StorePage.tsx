import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useCustomerCart } from '../../hooks/useCustomerCart'
import StoreProductCard from '../../components/StoreProductCard'
import StoreCartDrawer from '../../components/StoreCartDrawer'
import CheckoutModal from '../../components/CheckoutModal'
import type { Producto, Categoria } from '../../types'

export default function StorePage() {
  const [productos, setProductos]     = useState<Producto[]>([])
  const [categorias, setCategorias]   = useState<Categoria[]>([])
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [query, setQuery]             = useState('')
  const [loading, setLoading]         = useState(true)
  const [cartOpen, setCartOpen]       = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cartBounce, setCartBounce]   = useState(false)
  const prevCount = useRef(0)

  const { cart, cartTotal, cartCount, addToCart, removeFromCart, updateQty, clearCart } = useCustomerCart()

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setCartBounce(true)
      setTimeout(() => setCartBounce(false), 500)
    }
    prevCount.current = cartCount
  }, [cartCount])

  useEffect(() => {
    supabase.from('categorias').select('*').order('nombre').then(({ data }) => {
      if (data) setCategorias(data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(async () => {
      let q = supabase
        .from('productos')
        .select('*, categorias(nombre)')
        .gt('stock_actual', 0)
        .order('nombre')
      if (query.trim()) q = q.or(`nombre.ilike.%${query}%,marca.ilike.%${query}%,codigo_barras.eq.${query}`)
      if (categoriaId)  q = q.eq('categoria_id', categoriaId)
      const { data } = await q.limit(48)
      setProductos(data ?? [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, categoriaId])

  const handleCheckoutSuccess = () => {
    clearCart()
    setCheckoutOpen(false)
    setCartOpen(false)
  }

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">

          {/* Logo — mismo bloque que el admin pero en naranja */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-stone-900 font-bold text-base block leading-none tracking-tight">AutoPartes Pro</span>
              <span className="text-amber-500 text-[10px] font-semibold uppercase tracking-widest">Tienda en línea</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar autopartes, marca, referencia..."
              className="w-full bg-stone-100 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-stone-800 text-sm
                focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100
                transition-all placeholder-stone-400"
            />
          </div>

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className={`relative flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950
              font-bold px-4 py-2.5 rounded-xl transition-all text-sm shrink-0
              ${cartBounce ? 'scale-110' : 'scale-100'}`}
            style={{ transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-900 text-white text-[10px]
                font-bold rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Hero banner ────────────────────────────────────── */}
      <div className="bg-zinc-950 relative overflow-hidden">
        {/* Grid decorativo — mismo del LoginPage */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        {/* Glow ámbar */}
        <div className="absolute top-0 left-1/3 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            Catálogo en línea
          </p>
          <h1 className="text-white font-bold text-3xl sm:text-4xl leading-tight mb-2 tracking-tight">
            Encuentra la autoparte<br />que necesitas
          </h1>
          <p className="text-zinc-400 text-sm max-w-md">
            Agrega los productos al carrito y realiza tu pedido. Sin registro requerido.
          </p>
        </div>
      </div>

      {/* ── Category pills ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[{ id_categoria: null, nombre: 'Todos los productos' }, ...categorias].map(cat => {
            const active = cat.id_categoria === null ? !categoriaId : categoriaId === cat.id_categoria
            return (
              <button
                key={cat.id_categoria ?? 'all'}
                onClick={() => setCategoriaId(cat.id_categoria === categoriaId ? null : cat.id_categoria)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all border
                  ${active
                    ? 'bg-amber-500 text-zinc-950 border-amber-500'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:text-amber-600'}`}
              >
                {cat.nombre}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Products grid ──────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Contador de resultados */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-stone-400 text-xs font-medium">
            {loading
              ? 'Buscando...'
              : `${productos.length} producto${productos.length !== 1 ? 's' : ''} encontrado${productos.length !== 1 ? 's' : ''}`}
          </p>
          {cartCount > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="text-amber-500 text-xs font-semibold hover:text-amber-400 transition-colors"
            >
              Ver carrito ({cartCount} ítems)
            </button>
          )}
        </div>

        {/* Estado: cargando */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-stone-100">
                <div className="h-44 bg-stone-100 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-stone-100 rounded-xl w-3/4" />
                  <div className="h-3 bg-stone-100 rounded-xl w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado: vacío */}
        {!loading && productos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-stone-500 font-semibold text-sm">No encontramos productos</p>
            <p className="text-stone-400 text-xs">Intenta con otro término de búsqueda</p>
          </div>
        )}

        {/* Estado: resultados */}
        {!loading && productos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productos.map(p => {
              const cartItem = cart.find(i => i.producto.id_producto === p.id_producto)
              return (
                <StoreProductCard
                  key={p.id_producto}
                  producto={p}
                  onAdd={() => addToCart(p)}
                  inCart={!!cartItem}
                  cartQty={cartItem?.cantidad ?? 0}
                />
              )
            })}
          </div>
        )}
      </main>

      {/* ── Floating cart (mobile) ─────────────────────────── */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 sm:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 bg-zinc-900 text-white font-semibold
              px-6 py-3.5 rounded-2xl shadow-2xl shadow-zinc-900/40 transition-all active:scale-95"
          >
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span>{cartCount} en carrito</span>
            <span className="bg-amber-500 text-zinc-950 font-bold px-2.5 py-0.5 rounded-lg text-sm">
              ${cartTotal.toLocaleString('es-CO')}
            </span>
          </button>
        </div>
      )}

      {/* ── Drawers y modales ──────────────────────────────── */}
      {cartOpen && (
        <StoreCartDrawer
          cart={cart}
          cartTotal={cartTotal}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
          onClose={() => setCartOpen(false)}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          cartTotal={cartTotal}
          onSuccess={handleCheckoutSuccess}
          onClose={() => { setCheckoutOpen(false); setCartOpen(true) }}
        />
      )}
    </div>
  )
}