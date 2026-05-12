import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Venta, DetalleVenta } from '../../types/index'
import { Loading, Empty, Table, Th, Td, Tag, PageHeader, Badge } from '../../components/ui'
import AppLayout from '../../layouts/AppLayout'

const fmt     = (n: number | null) => n == null ? '—' : Number(n).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d: string) => new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })

export default function VentasModule() {
  const [rows, setRows]       = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<number, DetalleVenta[] | null>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('ventas')
      .select('*, clientes(nombre)')
      .order('id_venta', { ascending: false })
    setRows((data as Venta[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggleExpand = async (id: number) => {
    if (expanded[id] !== undefined) {
      setExpanded(p => { const n = { ...p }; delete n[id]; return n })
      return
    }
    setExpanded(p => ({ ...p, [id]: null }))
    const { data } = await supabase
      .from('detalle_venta')
      .select('*, productos(nombre)')
      .eq('venta_id', id)
    setExpanded(p => ({ ...p, [id]: (data as DetalleVenta[]) || [] }))
  }

  return (
    <AppLayout>
<div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader
        title="Ventas"
        description="Historial de ventas — módulo de solo lectura"
        actions={
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10
            border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            solo lectura
          </span>
        }
      />

      <div className="px-7 pb-7">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
          {loading ? <Loading /> : (
            <Table>
              <thead>
                <tr className="border-b border-zinc-800">
                  <Th>#</Th>
                  <Th>Cliente</Th>
                  <Th>Fecha</Th>
                  <Th>Total</Th>
                  <Th>Método Pago</Th>
                  <Th>Detalle</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6}><Empty icon="⬆" text="Sin ventas registradas" /></td></tr>
                )}
                {rows.map(r => (
                  <>
                    {/* ── Fila principal ── */}
                    <tr
                      key={r.id_venta}
                      onClick={() => toggleExpand(r.id_venta)}
                      className="border-b border-zinc-800/50 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      <Td><Tag>{r.id_venta}</Tag></Td>

                      <Td className="text-white font-semibold">
                        {r.clientes?.nombre || (
                          <span className="text-zinc-500 font-normal italic">Consumidor final</span>
                        )}
                      </Td>

                      <Td className="text-zinc-400">{fmtDate(r.fecha)}</Td>

                      <Td className="text-emerald-400 font-semibold">${fmt(r.total)}</Td>

                      <Td>
                        {r.metodo_pago
                          ? <Badge color="amber">{r.metodo_pago}</Badge>
                          : <span className="text-zinc-600">—</span>}
                      </Td>

                      <Td>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1
                          rounded-lg border transition-all duration-200
                          ${expanded[r.id_venta] !== undefined
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 group-hover:border-zinc-600 group-hover:text-zinc-300'
                          }`}>
                          {expanded[r.id_venta] !== undefined ? (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                              </svg>
                              Cerrar
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                              Ver ítems
                            </>
                          )}
                        </span>
                      </Td>
                    </tr>

                    {/* ── Fila expandida con detalle ── */}
                    {expanded[r.id_venta] !== undefined && (
                      <tr key={`detail-${r.id_venta}`} className="bg-zinc-950/60 border-b border-zinc-800/50">
                        <td colSpan={6} className="px-6 py-4">
                          {expanded[r.id_venta] === null ? (
                            /* Loading del detalle */
                            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                              <svg className="w-3.5 h-3.5 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Cargando detalle...
                            </div>
                          ) : (
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-zinc-800/50">
                                  {['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal'].map(h => (
                                    <th key={h} className="text-left pb-2 pr-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {expanded[r.id_venta]!.map(d => (
                                  <tr key={d.id_detalle} className="border-b border-zinc-800/30 last:border-0">
                                    <td className="py-2 pr-6 text-sm text-white font-medium">
                                      {d.productos?.nombre || <span className="text-zinc-600">—</span>}
                                    </td>
                                    <td className="py-2 pr-6 text-sm text-zinc-400">{d.cantidad}</td>
                                    <td className="py-2 pr-6 text-sm text-amber-400">${fmt(d.precio_unitario)}</td>
                                    <td className="py-2 text-sm text-emerald-400 font-semibold">
                                      ${fmt(d.subtotal ?? d.cantidad * d.precio_unitario)}
                                    </td>
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
    </AppLayout>
    
  )
}