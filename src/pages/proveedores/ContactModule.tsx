import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Button, Modal, Field, Input, Textarea, Alert, Loading, Empty,
  Table, Th, Td, Tag, PageHeader, Badge,
} from '../../components/ui'
import AppLayout from '../../layouts/AppLayout'

interface ContactRecord {
  nombre: string
  telefono: string | null
  email: string | null
  direccion: string | null
  [key: string]: unknown
}

interface ContactModuleProps {
  table: 'proveedores' | 'clientes'
  pk: string
  title: string
  icon: string
  singular: string
}

export function ContactModule({ table, pk, title, icon, singular }: ContactModuleProps) {
  const [rows, setRows]       = useState<ContactRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<Partial<ContactRecord>>({})
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from(table).select('*').order(pk)
    if (error) setError(error.message)
    else setRows((data as ContactRecord[]) || [])
    setLoading(false)
  }, [table, pk])

  useEffect(() => { load() }, [load])

  const openNew  = () => { setEditing({});        setError(null); setModal(true) }
  const openEdit = (r: ContactRecord) => { setEditing({ ...r }); setError(null); setModal(true) }
  const closeModal = () => { setModal(false); setEditing({}) }

  const notify = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000) }

  const save = async () => {
    if (!editing.nombre?.trim()) { setError('El nombre es requerido'); return }
    const payload = {
      nombre:    editing.nombre.trim(),
      telefono:  editing.telefono  || null,
      email:     editing.email     || null,
      direccion: editing.direccion || null,
    }
    const id = editing[pk] as number | undefined
    const { error } = id
      ? await supabase.from(table).update(payload).eq(pk, id)
      : await supabase.from(table).insert(payload)
    if (error) { setError(error.message); return }
    closeModal()
    notify(id ? `${singular} actualizado.` : `${singular} creado.`)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm(`¿Eliminar este ${singular.toLowerCase()}?`)) return
    const { error } = await supabase.from(table).delete().eq(pk, id)
    if (error) { setError(error.message); return }
    notify(`${singular} eliminado.`)
    load()
  }

  const set = (k: keyof ContactRecord, v: string) => setEditing(p => ({ ...p, [k]: v }))

  const filtered = rows.filter(r => {
    const q = search.toLowerCase()
    return !q || r.nombre.toLowerCase().includes(q) ||
      (r.email    || '').toLowerCase().includes(q) ||
      (r.telefono || '').includes(q)
  })

  return (
   <AppLayout>
     <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader
        title={title}
        description={`Gestión de ${title.toLowerCase()} del sistema`}
        actions={
          <Button variant="primary" onClick={openNew}>
            + Nuevo {singular.toLowerCase()}
          </Button>
        }
      />

      <div className="px-7 pb-7">
        {error && !modal && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {/* Buscador + contador */}
        <div className="flex items-center gap-3 mb-4">
          <Input
            placeholder="Buscar por nombre, email, teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Badge>{filtered.length} registros</Badge>
        </div>

        {/* Tabla */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
          {loading ? <Loading /> : (
            <Table>
              <thead>
                <tr className="border-b border-zinc-800">
                  <Th>#</Th>
                  <Th>Nombre</Th>
                  <Th>Teléfono</Th>
                  <Th>Email</Th>
                  <Th>Dirección</Th>
                  <Th right>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <Empty icon={icon} text={`Sin ${title.toLowerCase()} registrados`} />
                    </td>
                  </tr>
                )}
                {filtered.map(r => (
                  <tr
                    key={r[pk] as number}
                    className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <Td><Tag>{r[pk] as number}</Tag></Td>

                    <Td>
                      {/* Avatar inicial + nombre */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 rounded-lg
                          flex items-center justify-center shrink-0">
                          <span className="text-amber-400 text-xs font-bold">
                            {r.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white font-semibold">{r.nombre}</span>
                      </div>
                    </Td>

                    <Td>
                      {r.telefono
                        ? <span className="text-zinc-300">{r.telefono}</span>
                        : <span className="text-zinc-600">—</span>}
                    </Td>

                    <Td>
                      {r.email
                        ? (
                          
                            <a href={`mailto:${r.email}`}
                            className="text-amber-400 hover:text-amber-300 transition-colors text-sm"
                            onClick={e => e.stopPropagation()}
                          >
                            {r.email}
                          </a>
                        )
                        : <span className="text-zinc-600">—</span>}
                    </Td>

                    <Td className="max-w-[180px] truncate">
                      {r.direccion || <span className="text-zinc-600">—</span>}
                    </Td>

                    <Td>
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" onClick={() => openEdit(r)}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => remove(r[pk] as number)}>Eliminar</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          title={`${editing[pk] ? 'Editar' : 'Nuevo'} ${singular}`}
          onClose={closeModal}
        >
          {error && <Alert type="error" message={error} />}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *" className="col-span-2">
              <Input
                value={editing.nombre || ''}
                onChange={e => set('nombre', e.target.value)}
                placeholder={`Nombre del ${singular.toLowerCase()}`}
              />
            </Field>
            <Field label="Teléfono">
              <Input
                value={editing.telefono || ''}
                onChange={e => set('telefono', e.target.value)}
                placeholder="Ej: +57 300 000 0000"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={editing.email || ''}
                onChange={e => set('email', e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </Field>
            <Field label="Dirección" className="col-span-2">
              <Textarea
                value={editing.direccion || ''}
                onChange={e => set('direccion', e.target.value)}
                placeholder="Dirección completa"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
            <Button onClick={closeModal}>Cancelar</Button>
            <Button variant="primary" onClick={save}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
   </AppLayout>
  )
}