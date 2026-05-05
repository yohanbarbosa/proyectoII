import type { CartItem } from '../types'

interface Props {
  cart: CartItem[]
  cartTotal: number
  onUpdateQty: (id: number, qty: number) => void
  onRemove: (id: number) => void
  onCheckout: () => void
  onClose: () => void
}

export default function StoreCartDrawer({ cart, cartTotal, onUpdateQty, onRemove, onCheckout, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <h2 className="text-stone-900 font-black text-lg">Tu carrito</h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.length} {cart.length === 1 ? 'ítem' : 'ítems'}
            </span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors">
            <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-300 gap-4 py-20">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <p className="text-sm font-medium text-stone-400">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.producto.id_producto}
                className="flex gap-3 bg-stone-50 border border-stone-100 rounded-2xl p-3">
                {/* Icon */}
                <div className="w-12 h-12 bg-white border border-stone-200 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-stone-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.3.07-.62.07-.93s-.03-.64-.07-1l2.09-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.36-.07.73-.07 1s.03.64.07 1l-2.09 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.09-1.63z"/>
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 text-xs font-bold leading-snug line-clamp-2">{item.producto.nombre}</p>
                  {item.producto.marca && (
                    <p className="text-stone-400 text-[10px] mt-0.5">{item.producto.marca}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    {/* Qty stepper */}
                    <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg">
                      <button onClick={() => onUpdateQty(item.producto.id_producto, item.cantidad - 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-orange-500 transition-colors text-sm font-bold">−</button>
                      <span className="w-6 text-center text-stone-800 text-xs font-bold">{item.cantidad}</span>
                      <button onClick={() => onUpdateQty(item.producto.id_producto, item.cantidad + 1)}
                        disabled={item.cantidad >= item.producto.stock_actual}
                        className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-orange-500 disabled:opacity-30 transition-colors text-sm font-bold">+</button>
                    </div>
                    <span className="text-orange-600 font-black text-sm">${item.subtotal.toLocaleString('es-CO')}</span>
                  </div>
                </div>

                <button onClick={() => onRemove(item.producto.id_producto)}
                  className="self-start text-stone-300 hover:text-red-400 transition-colors p-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-stone-100 p-5 space-y-4">
            {/* Cache notice */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-emerald-700 text-[10px] font-semibold">Carrito guardado en tu dispositivo</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 text-sm font-medium">Total del pedido</span>
              <span className="text-stone-900 font-black text-2xl">${cartTotal.toLocaleString('es-CO')}</span>
            </div>

            <button onClick={onCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all text-sm
                flex items-center justify-center gap-2 active:scale-95">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Realizar pedido
            </button>
          </div>
        )}
      </div>
    </>
  )
}