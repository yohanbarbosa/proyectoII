import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { CompraConProveedor, DetalleCompraConProducto, Proveedor, Producto, ItemCompraForm } from '../../types/database'
import {
  Button, Modal, Field, Select, Alert, Loading, Empty,
  Table, Th, Td, Tag, PageHeader, Badge, Input
} from '../../components/ui'
import AppLayout from '../../layouts/AppLayout'

const fmt     = (n: number | null) => n == null ? '—' : Number(n).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d: string) => new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })

export default function ComprasModule() {
  const [rows, setRows]             = useState<CompraConProveedor[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos]   = useState<Producto[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<Record<number, DetalleCompraConProducto[] | null>>({})
  const [modal, setModal]           = useState(false)
  const [proveedorId, setProveedorId] = useState<number | ''>('')
  const [items, setItems]           = useState<ItemCompraForm[]>([])
  const [newItem, setNewItem]       = useState({ producto_id: '' as number | '', cantidad: 1, precio_compra: '' as number | '' })
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: compras }, { data: provs }, { data: prods }] = await Promise.all([
      supabase.from('compras').select('*, proveedores(nombre)').order('id_compra', { ascending: false }),
      supabase.from('proveedores').select('*').order('nombre'),
      supabase.from('productos').select('*').order('nombre'),
    ])
    setRows((compras as CompraConProveedor[]) || [])
    setProveedores(provs || [])
    setProductos(prods || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const notify = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 4000) }

  const toggleExpand = async (id: number) => {
    if (expanded[id] !== undefined) {
      setExpanded(p => { const n = { ...p }; delete n[id]; return n })
      return
    }
    setExpanded(p => ({ ...p, [id]: null }))
    const { data } = await supabase.from('detalle_compra').select('*, productos(nombre)').eq('compra_id', id)
    setExpanded(p => ({ ...p, [id]: (data as DetalleCompraConProducto[]) || [] }))
  }

  const openModal = () => {
    setProveedorId(''); setItems([])
    setNewItem({ producto_id: '', cantidad: 1, precio_compra: '' })
    setError(null); setModal(true)
  }

  const addItem = () => {
    if (!newItem.producto_id || !newItem.precio_compra) { setError('Selecciona producto y precio'); return }
    const prod = productos.find(p => p.id_producto === Number(newItem.producto_id))
    if (!prod) return
    setItems(prev => [...prev, {
      producto_id:  Number(newItem.producto_id),
      nombre:       prod.nombre,
      cantidad:     Number(newItem.cantidad) || 1,
      precio_compra: Number(newItem.precio_compra),
    }])
    setNewItem({ producto_id: '', cantidad: 1, precio_compra: '' })
    setError(null)
  }

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const save = async () => {
    if (!proveedorId)      { setError('Selecciona un proveedor'); return }
    if (items.length === 0) { setError('Agrega al menos un ítem'); return }
    const total = items.reduce((a, b) => a + b.cantidad * b.precio_compra, 0)
    const { data: compra, error: e1 } = await supabase
      .from('compras').insert({ proveedor_id: Number(proveedorId), total }).select().single()
    if (e1 || !compra) { setError(e1?.message || 'Error al crear compra'); return }
    const detalles = items.map(i => ({
      compra_id: compra.id_compra, producto_id: i.producto_id,
      cantidad: i.cantidad, precio_compra: i.precio_compra,
    }))
    const { error: e2 } = await supabase.from('detalle_compra').insert(detalles)
    if (e2) { setError(e2.message); return }
    for (const item of items) {
      const { data: prod } = await supabase.from('productos').select('stock_actual').eq('id_producto', item.producto_id).single()
      await supabase.from('productos').update({ stock_actual: (prod?.stock_actual || 0) + item.cantidad }).eq('id_producto', item.producto_id)
    }
    setModal(false)
    notify('Compra registrada y stock actualizado.')
    load()
  }

  const total = items.reduce((a, b) => a + b.cantidad * b.precio_compra, 0)

  return (
  <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader
        title="Compras"
        description="Registro de compras a proveedores — actualiza stock automáticamente"
        actions={<Button variant="primary" onClick={openModal}>+ Nueva compra</Button>}
      />

      <div className="px-7 pb-7">
        {error && !modal && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {/* ── Tabla principal ── */}
        <div className="bg-(--color-bg-primary) border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
          {loading ? <Loading /> : (
            <Table>
              <thead>
                <tr className="border-b border-zinc-800">
                  <Th>#</Th>
                  <Th>Proveedor</Th>
                  <Th>Fecha</Th>
                  <Th>Total</Th>
                  <Th>Detalle</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={5}><Empty icon="⬇" text="Sin compras registradas" /></td></tr>
                )}
                {rows.map(r => (
                  <>
                    {/* ── Fila principal ── */}
                    <tr
                      key={r.id_compra}
                      onClick={() => toggleExpand(r.id_compra)}
                      className="border-b border-zinc-800/50 hover:bg-(--color-bg-hover) cursor-pointer transition-colors group"
                    >
                      <Td><Tag>{r.id_compra}</Tag></Td>

                      <Td className="font-semibold">
                        {r.proveedores?.nombre || <span className="text-zinc-600">—</span>}
                      </Td>

                      <Td className="text-zinc-400">{fmtDate(r.fecha)}</Td>

                      <Td className="text-amber-400 font-semibold">${fmt(r.total)}</Td>

                      <Td>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1
                          rounded-lg border transition-all duration-200
                          ${expanded[r.id_compra] !== undefined
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 group-hover:border-zinc-600 group-hover:text-zinc-300'
                          }`}>
                          {expanded[r.id_compra] !== undefined ? (
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

                    {/* ── Fila expandida ── */}
                    {expanded[r.id_compra] !== undefined && (
                      <tr key={`detail-${r.id_compra}`} className="bg-(--color-bg-secondary) border-b border-zinc-800/50">
                        <td colSpan={5} className="px-6 py-4">
                          {expanded[r.id_compra] === null ? (
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
                                {expanded[r.id_compra]!.map(d => (
                                  <tr key={d.id_detalle} className="border-b border-zinc-800/30 last:border-0">
                                    <td className="py-2 pr-6 text-sm text-(--color-text-primary) font-medium">
                                      {d.productos?.nombre || <span className="text-(--color-text-secondary)">—</span>}
                                    </td>
                                    <td className="py-2 pr-6 text-sm text-zinc-400">{d.cantidad}</td>
                                    <td className="py-2 pr-6 text-sm text-amber-400">${fmt(d.precio_compra)}</td>
                                    <td className="py-2 text-sm text-emerald-400 font-semibold">
                                      ${fmt(d.cantidad * d.precio_compra)}
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

      {/* ── Modal nueva compra ── */}
      {modal && (
        <Modal title="Nueva Compra" onClose={() => setModal(false)} wide>
          {error && <Alert type="error" message={error} />}

          {/* Proveedor */}
          <Field label="Proveedor *">
            <Select value={proveedorId} onChange={e => setProveedorId(Number(e.target.value) || '')}>
              <option value="">Seleccionar proveedor</option>
              {proveedores.map(p => (
                <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>
              ))}
            </Select>
          </Field>

          {/* Agregar ítem */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
              Agregar ítem
            </p>
            <div className="grid grid-cols-[1fr_80px_110px_auto] gap-2 items-end">
              <Field label="Producto">
                <Select
                  value={newItem.producto_id}
                  onChange={e => {
                    const prod = productos.find(p => p.id_producto === Number(e.target.value))
                    setNewItem(n => ({ ...n, producto_id: Number(e.target.value) || '', precio_compra: prod?.precio_compra || '' }))
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {productos.map(p => (
                    <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Cant.">
                <Input
                  type="number" min={1}
                  value={newItem.cantidad}
                  onChange={e => setNewItem(n => ({ ...n, cantidad: Number(e.target.value) }))}
                />
              </Field>
              <Field label="Precio unit.">
                <Input
                  type="number" step="0.01"
                  value={newItem.precio_compra}
                  onChange={e => setNewItem(n => ({ ...n, precio_compra: Number(e.target.value) || '' }))}
                />
              </Field>
              <Button variant="primary" onClick={addItem}>+ Añadir</Button>
            </div>
          </div>

          {/* Lista de ítems */}
          <div className="mt-4 space-y-2">
            {items.length === 0 ? (
              <div className="flex items-center justify-center py-6 rounded-xl border border-dashed border-zinc-700">
                <p className="text-xs text-zinc-600">Sin ítems agregados</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 pb-1">
                  {['Producto', 'Cant.', 'Precio', ''].map(h => (
                    <span key={h} className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{h}</span>
                  ))}
                </div>

                {items.map((it, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center
                      bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5"
                  >
                    <span className="text-white text-sm font-medium truncate">{it.nombre}</span>
                    <span className="text-zinc-400 text-xs">×{it.cantidad}</span>
                    <span className="text-amber-400 text-xs font-semibold">${fmt(it.precio_compra)}</span>
                    <button
                      onClick={() => removeItem(i)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg
                        bg-red-500/10 hover:bg-red-500/20 border border-red-500/20
                        text-red-400 hover:text-red-300 transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 px-3 border-t border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total compra</span>
                  <span className="text-xl font-bold text-emerald-400">${fmt(total)}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
            <Button onClick={() => setModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={save}>Registrar Compra</Button>
          </div>
        </Modal>
      )}
    </div>
  </AppLayout>
  )
}