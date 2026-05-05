import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { Producto, Categoria } from '../../types'

interface Props {
  onAddToCart: (producto: Producto) => void
}

export default function ProductSearch({ onAddToCart }: Props) {
  const [query, setQuery] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('categorias').select('*').then(({ data }) => {
      if (data) setCategorias(data)
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      let q = supabase
        .from('productos')
        .select('*, categorias(nombre)')
        .gt('stock_actual', 0)
        .order('nombre')

      if (query.trim()) {
        q = q.or(`nombre.ilike.%${query}%,codigo_barras.eq.${query},marca.ilike.%${query}%`)
      }
      if (categoriaId) q = q.eq('categoria_id', categoriaId)

      const { data } = await q.limit(30)
      setProductos(data ?? [])
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [query, categoriaId])

  // Focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  const stockColor = (p: Producto) => {
    if (p.stock_actual === 0) return 'text-red-400'
    if (p.stock_actual <= p.stock_minimo) return 'text-amber-400'
    return 'text-emerald-400'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-4 border-b border-zinc-800 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, código o marca..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 text-sm
              focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setCategoriaId(null)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${!categoriaId ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id_categoria}
              onClick={() => setCategoriaId(cat.id_categoria === categoriaId ? null : cat.id_categoria)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${categoriaId === cat.id_categoria ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
            <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {productos.map(p => (
              <button
                key={p.id_producto}
                onClick={() => onAddToCart(p)}
                disabled={p.stock_actual === 0}
                className="bg-zinc-800/60 border border-zinc-700/50 hover:border-amber-500/50 hover:bg-zinc-800
                  rounded-xl p-3 text-left transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                {/* Category badge */}
                {p.categorias && (
                  <span className="inline-block text-[10px] font-semibold text-zinc-500 bg-zinc-700/60 rounded-md px-1.5 py-0.5 mb-2">
                    {p.categorias.nombre}
                  </span>
                )}
                <p className="text-white text-sm font-semibold leading-tight line-clamp-2 group-hover:text-amber-400 transition-colors">
                  {p.nombre}
                </p>
                {p.marca && <p className="text-zinc-500 text-xs mt-0.5">{p.marca}</p>}
                <div className="flex items-end justify-between mt-2">
                  <span className="text-amber-400 font-bold text-base">
                    ${p.precio_venta.toLocaleString('es-CO')}
                  </span>
                  <span className={`text-xs font-medium ${stockColor(p)}`}>
                    {p.stock_actual} uds
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
