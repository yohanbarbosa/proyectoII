import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { VentaConCliente, DetalleVentaConProducto } from '../../types/database'
import {
  Loading, Empty, Table, Th, Td, Tag, PageHeader, Badge, ReadOnlyBanner
} from '../../components/ui'

const fmt = (n: number | null) => n == null ? '—' : Number(n).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d: string) => new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })

export default function VentasModule() {
  const [rows, setRows] = useState<VentaConCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<number, DetalleVentaConProducto[] | null>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('ventas').select('*, clientes(nombre)').order('id_venta', { ascending: false })
    setRows((data as VentaConCliente[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggleExpand = async (id: number) => {
    if (expanded[id] !== undefined) {
      setExpanded(p => { const n = { ...p }; delete n[id]; return n })
      return
    }
    setExpanded(p => ({ ...p, [id]: null }))
    const { data } = await supabase.from('detalle_venta').select('*, productos(nombre)').eq('venta_id', id)
    setExpanded(p => ({ ...p, [id]: (data as DetalleVentaConProducto[]) || [] }))
  }

  return (
    <div>
      <PageHeader title="Ventas" description="Historial de ventas — módulo de solo lectura" />
      <div className="px-7 pb-7">
        <ReadOnlyBanner />
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          {loading ? <Loading /> : (
            <Table>
              <thead><tr>
                <Th>#</Th><Th>Cliente</Th><Th>Fecha</Th><Th>Total</Th><Th>Método Pago</Th><Th>Detalle</Th>
              </tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={6}><Empty icon="⬆" text="Sin ventas registradas" /></td></tr>}
                {rows.map(r => (
                  <>
                    <tr key={r.id_venta} className="hover:bg-white/[0.02] cursor-pointer" onClick={() => toggleExpand(r.id_venta)}>
                      <Td><Tag>{r.id_venta}</Tag></Td>
                      <Td className="text-white font-medium">{r.clientes?.nombre || <span className="text-gray-500">Consumidor final</span>}</Td>
                      <Td>{fmtDate(r.fecha)}</Td>
                      <Td className="text-emerald-400 font-medium">${fmt(r.total)}</Td>
                      <Td>{r.metodo_pago ? <Badge color="purple">{r.metodo_pago}</Badge> : <span className="text-gray-600">—</span>}</Td>
                      <Td><Badge color="blue">{expanded[r.id_venta] !== undefined ? '▲ Cerrar' : '▼ Ver ítems'}</Badge></Td>
                    </tr>
                    {expanded[r.id_venta] !== undefined && (
                      <tr key={`detail-${r.id_venta}`} className="bg-gray-950/50">
                        <td colSpan={6} className="px-6 py-3">
                          {expanded[r.id_venta] === null ? (
                            <div className="flex items-center gap-2 text-gray-500 text-xs"><div className="w-3 h-3 border border-gray-600 border-t-blue-500 rounded-full animate-spin" />Cargando...</div>
                          ) : (
                            <table className="w-full">
                              <thead><tr className="text-[10px] uppercase tracking-widest text-gray-600">
                                <th className="text-left py-1.5 pr-4">Producto</th>
                                <th className="text-left py-1.5 pr-4">Cantidad</th>
                                <th className="text-left py-1.5 pr-4">Precio Unit.</th>
                                <th className="text-left py-1.5">Subtotal</th>
                              </tr></thead>
                              <tbody>
                                {expanded[r.id_venta]!.map(d => (
                                  <tr key={d.id_detalle} className="text-xs text-gray-400">
                                    <td className="py-1.5 pr-4">{d.productos?.nombre || '—'}</td>
                                    <td className="py-1.5 pr-4">{d.cantidad}</td>
                                    <td className="py-1.5 pr-4">${fmt(d.precio_unitario)}</td>
                                    <td className="py-1.5 text-emerald-400">${fmt(d.subtotal ?? d.cantidad * d.precio_unitario)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
