import type { Venta, CartItem } from '../../types'

interface Props {
  venta: Venta
  items: CartItem[]
  onClose: () => void
}

export default function SaleSuccessModal({ venta, items, onClose }: Props) {
  const fecha = new Date(venta.fecha ?? Date.now()).toLocaleString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const printReceipt = () => window.print()

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Success header */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-5 text-center">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold">¡Venta exitosa!</h2>
          <p className="text-zinc-400 text-sm mt-1">Venta #{venta.id_venta}</p>
        </div>

        {/* Receipt details */}
        <div className="px-6 py-4 space-y-3">
          <div className="text-xs text-zinc-500 text-center">{fecha}</div>

          {/* Items */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map(item => (
              <div key={item.producto.id_producto} className="flex justify-between items-center">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-zinc-300 text-sm truncate">{item.producto.nombre}</p>
                  <p className="text-zinc-500 text-xs">{item.cantidad} × ${item.producto.precio_venta.toLocaleString('es-CO')}</p>
                </div>
                <span className="text-white text-sm font-semibold shrink-0">
                  ${item.subtotal.toLocaleString('es-CO')}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-zinc-700 pt-3 flex justify-between items-center">
            <span className="text-zinc-400 text-sm">Total</span>
            <span className="text-amber-400 font-bold text-xl">${venta.total.toLocaleString('es-CO')}</span>
          </div>

          <div className="flex justify-between text-xs text-zinc-500">
            <span>Pago:</span>
            <span className="capitalize">{venta.metodo_pago.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={printReceipt}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl py-2.5 text-sm transition-all"
          >
            Nueva venta
          </button>
        </div>
      </div>
    </div>
  )
}
