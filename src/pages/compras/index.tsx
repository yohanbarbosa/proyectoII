import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { CompraConProveedor, DetalleCompraConProducto, Proveedor, Producto, ItemCompraForm } from '../../types/database'
import {
  Button, Modal, Field, Select, Alert, Loading, Empty,
  Table, Th, Td, Tag, PageHeader, Badge, Input
} from '../../components/ui'

const fmt = (n: number | null) => n == null ? '—' : Number(n).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d: string) => new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })

export default function ComprasModule() {
  const [rows, setRows] = useState<CompraConProveedor[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<number, DetalleCompraConProducto[] | null>>({})
  const [modal, setModal] = useState(false)
  const [proveedorId, setProveedorId] = useState<number | ''>('')
  const [items, setItems] = useState<ItemCompraForm[]>([])
  const [newItem, setNewItem] = useState({ producto_id: '' as number | '', cantidad: 1, precio_compra: '' as number | '' })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
    setProveedorId(''); setItems([]); setNewItem({ producto_id: '', cantidad: 1, precio_compra: '' })
    setError(null); setModal(true)
  }

  const addItem = () => {
    if (!newItem.producto_id || !newItem.precio_compra) { setError('Selecciona producto y precio'); return }
    const prod = productos.find(p => p.id_producto === Number(newItem.producto_id))
    if (!prod) return
    setItems(prev => [...prev, {
      producto_id: Number(newItem.producto_id),
      nombre: prod.nombre,
      cantidad: Number(newItem.cantidad) || 1,
      precio_compra: Number(newItem.precio_compra),
    }])
    setNewItem({ producto_id: '', cantidad: 1, precio_compra: '' })
    setError(null)
  }

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const save = async () => {
    if (!proveedorId) { setError('Selecciona un proveedor'); return }
    if (items.length === 0) { setError('Agrega al menos un ítem'); return }
    const total = items.reduce((a, b) => a + b.cantidad * b.precio_compra, 0)
    const { data: compra, error: e1 } = await supabase.from('compras').insert({ proveedor_id: Number(proveedorId), total }).select().single()
    if (e1 || !compra) { setError(e1?.message || 'Error al crear compra'); return }
    const detalles = items.map(i => ({ compra_id: compra.id_compra, producto_id: i.producto_id, cantidad: i.cantidad, precio_compra: i.precio_compra }))
    const { error: e2 } = await supabase.from('detalle_compra').insert(detalles)
    if (e2) { setError(e2.message); return }
    // update stock
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
    <div>
      <PageHeader
        title="Compras"
        description="Registro de compras a proveedores — actualiza stock automáticamente"
        actions={<Button variant="primary" onClick={openModal}>+ Nueva compra</Button>}
      />
      <div className="px-7 pb-7">
        {error && !modal && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          {loading ? <Loading /> : (
            <Table>
              <thead><tr><Th>#</Th><Th>Proveedor</Th><Th>Fecha</Th><Th>Total</Th><Th>Detalle</Th></tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={5}><Empty icon="⬇" text="Sin compras registradas" /></td></tr>}
                {rows.map(r => (
                  <>
                    <tr key={r.id_compra} className="hover:bg-white/[0.02] cursor-pointer" onClick={() => toggleExpand(r.id_compra)}>
                      <Td><Tag>{r.id_compra}</Tag></Td>
                      <Td className="text-white font-medium">{r.proveedores?.nombre || '—'}</Td>
                      <Td>{fmtDate(r.fecha)}</Td>
                      <Td className="text-amber-400 font-medium">${fmt(r.total)}</Td>
                      <Td><Badge color="blue">{expanded[r.id_compra] !== undefined ? '▲ Cerrar' : '▼ Ver ítems'}</Badge></Td>
                    </tr>
                    {expanded[r.id_compra] !== undefined && (
                      <tr key={`detail-${r.id_compra}`} className="bg-gray-950/50">
                        <td colSpan={5} className="px-6 py-3">
                          {expanded[r.id_compra] === null ? (
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
                                {expanded[r.id_compra]!.map(d => (
                                  <tr key={d.id_detalle} className="text-xs text-gray-400">
                                    <td className="py-1.5 pr-4">{d.productos?.nombre || '—'}</td>
                                    <td className="py-1.5 pr-4">{d.cantidad}</td>
                                    <td className="py-1.5 pr-4">${fmt(d.precio_compra)}</td>
                                    <td className="py-1.5 text-amber-400">${fmt(d.cantidad * d.precio_compra)}</td>
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

      {modal && (
        <Modal title="⬇ Nueva Compra" onClose={() => setModal(false)} wide>
          {error && <Alert type="error" message={error} />}
          <Field label="Proveedor *">
            <Select value={proveedorId} onChange={e => setProveedorId(Number(e.target.value) || '')}>
              <option value="">Seleccionar proveedor</option>
              {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
            </Select>
          </Field>

          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Agregar ítem</div>
            <div className="grid grid-cols-[1fr_80px_110px_auto] gap-2 items-end">
              <Field label="Producto">
                <Select value={newItem.producto_id} onChange={e => {
                  const prod = productos.find(p => p.id_producto === Number(e.target.value))
                  setNewItem(n => ({ ...n, producto_id: Number(e.target.value) || '', precio_compra: prod?.precio_compra || '' }))
                }}>
                  <option value="">Seleccionar...</option>
                  {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
                </Select>
              </Field>
              <Field label="Cant.">
                <Input type="number" min={1} value={newItem.cantidad} onChange={e => setNewItem(n => ({ ...n, cantidad: Number(e.target.value) }))} />
              </Field>
              <Field label="Precio unit.">
                <Input type="number" step="0.01" value={newItem.precio_compra} onChange={e => setNewItem(n => ({ ...n, precio_compra: Number(e.target.value) || '' }))} />
              </Field>
              <Button variant="primary" onClick={addItem} className="mb-0">+ Añadir</Button>
            </div>

            <div className="mt-3 space-y-2">
              {items.length === 0 && <div className="text-xs text-gray-600 py-2">Sin ítems agregados</div>}
              {items.map((it, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-xs">
                  <span className="text-white">{it.nombre}</span>
                  <span className="text-gray-400 mx-3">×{it.cantidad}</span>
                  <span className="text-amber-400">${fmt(it.precio_compra)}</span>
                  <button onClick={() => removeItem(i)} className="ml-3 text-red-500 hover:text-red-400 text-base">×</button>
                </div>
              ))}
              {items.length > 0 && (
                <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-800">
                  <span className="text-xs text-gray-500">Total:</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">${fmt(total)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-800">
            <Button onClick={() => setModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={save}>Registrar Compra</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
