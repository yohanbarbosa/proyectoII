import { useState } from 'react'
import type { Producto } from '../types'

interface Props {
  producto: Producto
  onAdd: (p: Producto) => void
  inCart: boolean
  cartQty: number
}

export default function StoreProductCard({ producto, onAdd, inCart, cartQty }: Props) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (producto.stock_actual === 0) return
    onAdd(producto)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const sinStock = producto.stock_actual === 0

  return (
    <div className={`group relative flex flex-col bg-white border rounded-2xl overflow-hidden transition-all duration-300
      hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200/80
      ${sinStock ? 'opacity-60' : 'border-stone-200 hover:border-orange-300'}`}>

      {/* Image area / placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center overflow-hidden">
        {/* Decorative gear pattern */}
        <svg className="w-20 h-20 text-stone-300 group-hover:text-orange-200 transition-colors duration-500
          group-hover:rotate-12 transform transition-transform" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.3.07-.62.07-.93s-.03-.64-.07-1l2.09-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.36-.07.73-.07 1s.03.64.07 1l-2.09 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.09-1.63z"/>
        </svg>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {producto.categorias && (
            <span className="bg-white/90 backdrop-blur-sm text-stone-600 text-[10px] font-bold uppercase tracking-wider
              px-2 py-1 rounded-lg shadow-sm">
              {producto.categorias.nombre}
            </span>
          )}
          {sinStock && (
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg">
              Sin stock
            </span>
          )}
        </div>

        {/* Cart qty indicator */}
        {inCart && (
          <div className="absolute top-2.5 right-2.5 w-7 h-7 bg-orange-500 text-white rounded-full
            flex items-center justify-center text-xs font-bold shadow-md">
            {cartQty}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {producto.marca && (
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">{producto.marca}</p>
        )}
        <h3 className="text-stone-800 font-bold text-sm leading-snug line-clamp-2 flex-1 mb-3">
          {producto.nombre}
        </h3>
        {producto.codigo_barras && (
          <p className="text-stone-400 text-[10px] font-mono mb-3">REF: {producto.codigo_barras}</p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            <p className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold">Precio</p>
            <p className="text-stone-900 font-black text-xl tracking-tight">
              ${producto.precio_venta.toLocaleString('es-CO')}
            </p>
          </div>

          <button
            onClick={handleAdd}
            disabled={sinStock}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300
              ${added
                ? 'bg-emerald-500 text-white scale-95'
                : sinStock
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 active:scale-95'
              }`}
          >
            {added ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                ¡Listo!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}