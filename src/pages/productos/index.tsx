import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { ProductoConCategoria, Categoria } from '../../types/database'
import {
  Button, Modal, Field, Input, Textarea, Select, Alert, Loading, Empty,
  Table, Th, Td, Tag, PageHeader, Badge
} from '../../components/ui'

const fmt = (n: number | null) => n == null ? '—' : Number(n).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function ProductosModule() {
  const [rows, setRows] = useState<ProductoConCategoria[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<ProductoConCategoria>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('productos').select('*, categorias(nombre)').order('id_producto'),
      supabase.from('categorias').select('*').order('nombre'),
    ])
    setRows((prods as ProductoConCategoria[]) || [])
    setCategorias(cats || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing({ stock_actual: 0, stock_minimo: 0 }); setError(null); setModal(true) }
  const openEdit = (r: ProductoConCategoria) => {
    const { categorias: _cat, ...rest } = r
    setEditing({ ...rest }); setError(null); setModal(true)
  }
  const closeModal = () => { setModal(false); setEditing({}) }

  const notify = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000) }

  const save = async () => {
    if (!editing.nombre?.trim()) { setError('El nombre es requerido'); return }
    if (!editing.precio_compra || !editing.precio_venta) { setError('Los precios son requeridos'); return }
    const payload = {
      nombre: editing.nombre.trim(),
      url_img: editing.url_img || null,
      descripcion: editing.descripcion || null,
      marca: editing.marca || null,
      categoria_id: editing.categoria_id || null,
      precio_compra: Number(editing.precio_compra),
      precio_venta: Number(editing.precio_venta),
      codigo_barras: editing.codigo_barras || null,
      stock_actual: Number(editing.stock_actual) || 0,
      stock_minimo: Number(editing.stock_minimo) || 0,
      ubicacion: editing.ubicacion || null,
    }
    const { error } = editing.id_producto
      ? await supabase.from('productos').update(payload).eq('id_producto', editing.id_producto)
      : await supabase.from('productos').insert(payload)
    if (error) { setError(error.message); return }
    closeModal()
    notify(editing.id_producto ? 'Producto actualizado.' : 'Producto creado.')
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    const { error } = await supabase.from('productos').delete().eq('id_producto', id)
    if (error) { setError(error.message); return }
    notify('Producto eliminado.')
    load()
  }

  const set = <K extends keyof ProductoConCategoria>(k: K, v: ProductoConCategoria[K]) =>
    setEditing(p => ({ ...p, [k]: v }))

  const filtered = rows.filter(r => {
    const q = search.toLowerCase()
    return !q || r.nombre.toLowerCase().includes(q) ||
      (r.marca || '').toLowerCase().includes(q) ||
      (r.codigo_barras || '').toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Inventario con precios, stock y categorías"
        actions={<Button variant="primary" onClick={openNew}>+ Nuevo producto</Button>}
      />
      <div className="px-7 pb-7">
        {error && !modal && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <div className="flex items-center gap-2 mb-4">
          <Input placeholder="Buscar por nombre, marca, código..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
          <Badge color="gray">{filtered.length} productos</Badge>
          <Badge color="red">{rows.filter(r => r.stock_actual <= r.stock_minimo).length} bajo stock</Badge>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          {loading ? <Loading /> : (
            <Table>
              <thead>
                <tr>
                  <Th>#</Th><Th>Nombre</Th><Th>Categoría</Th><Th>Marca</Th>
                  <Th>P. Compra</Th><Th>P. Venta</Th><Th>Stock</Th><Th>Ubicación</Th><Th right>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={9}><Empty icon="⬡" text="Sin productos" /></td></tr>}
                {filtered.map(r => (
                  <tr key={r.id_producto} className="hover:bg-white/[0.02]">
                    <Td><Tag>{r.id_producto}</Tag></Td>
                    <Td className="text-white font-medium max-w-[160px] truncate">{r.nombre}</Td>
                    <Td>{r.categorias ? <Badge color="blue">{r.categorias.nombre}</Badge> : <span className="text-gray-600">—</span>}</Td>
                    <Td>{r.marca || <span className="text-gray-600">—</span>}</Td>
                    <Td className="text-amber-400">${fmt(r.precio_compra)}</Td>
                    <Td className="text-emerald-400">${fmt(r.precio_venta)}</Td>
                    <Td>
                      <Badge color={r.stock_actual <= r.stock_minimo ? 'red' : 'green'}>
                        {r.stock_actual}
                      </Badge>
                    </Td>
                    <Td>{r.ubicacion || <span className="text-gray-600">—</span>}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" onClick={() => openEdit(r)}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => remove(r.id_producto)}>Eliminar</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={`⬡ ${editing.id_producto ? 'Editar' : 'Nuevo'} Producto`} onClose={closeModal} wide>
          {error && <Alert type="error" message={error} />}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *" className="col-span-2">
              <Input value={editing.nombre || ''} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del producto" />
            </Field>
            <Field label="Marca">
              <Input value={editing.marca || ''} onChange={e => set('marca', e.target.value)} />
            </Field>
            <Field label="Categoría">
              <Select value={editing.categoria_id || ''} onChange={e => set('categoria_id', Number(e.target.value) || null as any)}>
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
              </Select>
            </Field>
            <Field label="Precio Compra *">
              <Input type="number" step="0.01" value={editing.precio_compra || ''} onChange={e => set('precio_compra', Number(e.target.value) as any)} />
            </Field>
            <Field label="Precio Venta *">
              <Input type="number" step="0.01" value={editing.precio_venta || ''} onChange={e => set('precio_venta', Number(e.target.value) as any)} />
            </Field>
            <Field label="Stock Actual">
              <Input type="number" value={editing.stock_actual ?? 0} onChange={e => set('stock_actual', Number(e.target.value) as any)} />
            </Field>
            <Field label="Stock Mínimo">
              <Input type="number" value={editing.stock_minimo ?? 0} onChange={e => set('stock_minimo', Number(e.target.value) as any)} />
            </Field>
            <Field label="Código de Barras">
              <Input value={editing.codigo_barras || ''} onChange={e => set('codigo_barras', e.target.value)} />
            </Field>
            <Field label="Ubicación">
              <Input value={editing.ubicacion || ''} onChange={e => set('ubicacion', e.target.value)} placeholder="Ej: A-12" />
            </Field>
            <Field label="URL Imagen" className="col-span-2">
              <Input value={editing.url_img || ''} onChange={e => set('url_img', e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Descripción" className="col-span-2">
              <Textarea value={editing.descripcion || ''} onChange={e => set('descripcion', e.target.value)} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-800">
            <Button onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" onClick={save}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
