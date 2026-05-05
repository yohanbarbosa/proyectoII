import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useCustomerCart } from '../../hooks/useCustomerCart'
import StoreProductCard from '../../components/StoreProductCard'
import StoreCartDrawer from '../../components/StoreCartDrawer'
import CheckoutModal from '../../components/CheckoutModal'
import type { Producto, Categoria } from '../../types'

export default function StorePage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)
  const prevCount = useRef(0)

  const { cart, cartTotal, cartCount, addToCart, removeFromCart, updateQty, clearCart } = useCustomerCart()

  // Bounce animation on cart add
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setCartBounce(true)
      setTimeout(() => setCartBounce(false), 500)
    }
    prevCount.current = cartCount
  }, [cartCount])

  // Load categories
  useEffect(() => {
    supabase.from('categorias').select('*').order('nombre').then(({ data }) => {
      if (data) setCategorias(data)
    })
  }, [])

  // Load products with debounce
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(async () => {
      let q = supabase
        .from('productos')
        .select('*, categorias(nombre)')
        .gt('stock_actual', 0)
        .order('nombre')

      if (query.trim()) {
        q = q.or(`nombre.ilike.%${query}%,marca.ilike.%${query}%,codigo_barras.eq.${query}`)
      }
      if (categoriaId) q = q.eq('categoria_id', categoriaId)

      const { data } = await q.limit(48)
      setProductos(data ?? [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, categoriaId])

  const handleAdd = (p: Producto) => {
    addToCart(p)
  }

  const handleCheckoutSuccess = () => {
    clearCart()
    setCheckoutOpen(false)
    setCartOpen(false)
  }

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* Google font */}
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.3.07-.62.07-.93s-.03-.64-.07-1l2.09-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.36-.07.73-.07 1s.03.64.07 1l-2.09 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.09-1.63z"/>
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-stone-900 font-black text-base block leading-none">AutoPartes</span>
              <span className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">Pro Store</span>
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
                focus:outline-none focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all placeholder-stone-400"
            />
          </div>

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className={`relative flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold
              px-4 py-2.5 rounded-xl transition-all text-sm shrink-0
              ${cartBounce ? 'scale-110' : 'scale-100'}`}
            style={{ transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-stone-900 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #f97316 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative">
          <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Catálogo en línea</p>
          <h1 className="text-white font-black text-3xl sm:text-4xl leading-tight mb-2">
            Encuentra la autoparte<br />que necesitas
          </h1>
          <p className="text-stone-400 text-sm max-w-md">
            Agrega los productos que quieres al carrito y realiza tu pedido. Sin registro requerido.
          </p>
        </div>
      </div>

      {/* ── Category pills ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setCategoriaId(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border
              ${!categoriaId
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-500'}`}
          >
            Todos los productos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id_categoria}
              onClick={() => setCategoriaId(cat.id_categoria === categoriaId ? null : cat.id_categoria)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border
                ${categoriaId === cat.id_categoria
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-500'}`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products grid ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-stone-400 text-xs font-medium">
            {loading ? 'Buscando...' : `${productos.length} producto${productos.length !== 1 ? 's' : ''} encontrado${productos.length !== 1 ? 's' : ''}`}
          </p>
          {cartCount > 0 && (
            <button onClick={() => setCartOpen(true)}
              className="text-orange-500 text-xs font-bold hover:underline">
              Ver carrito ({cartCount} ítems)
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-stone-100">
                <div className="h-44 bg-stone-100 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-300">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-stone-400 font-semibold">No encontramos productos</p>
            <p className="text-stone-300 text-sm mt-1">Intenta con otro término de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productos.map(p => {
              const cartItem = cart.find(i => i.producto.id_producto === p.id_producto)
              return (
                <StoreProductCard
                  key={p.id_producto}
                  producto={p}
                  onAdd={handleAdd}
                  inCart={!!cartItem}
                  cartQty={cartItem?.cantidad ?? 0}
                />
              )
            })}
          </div>
        )}
      </main>

      {/* ── Floating cart button (mobile) ── */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 sm:hidden">
          <button onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 bg-stone-900 text-white font-bold px-6 py-3.5 rounded-full shadow-2xl shadow-stone-900/30 transition-all active:scale-95">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span>{cartCount} en carrito</span>
            <span className="bg-orange-500 px-2.5 py-0.5 rounded-full text-sm font-black">
              ${cartTotal.toLocaleString('es-CO')}
            </span>
          </button>
        </div>
      )}

      {/* ── Cart drawer ── */}
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

      {/* ── Checkout modal ── */}
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