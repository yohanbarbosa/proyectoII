import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { Categoria } from "../../types/index";
import {
  Button,
  Modal,
  Field,
  Input,
  Textarea,
  Alert,
  Loading,
  Empty,
  Table,
  Th,
  Td,
  Tag,
  PageHeader,
  Badge,
} from "../../components/ui";
import AppLayout from "../../layouts/AppLayout";
export default function CategoriasModule() {
  const [rows, setRows] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Categoria>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("id_categoria");
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing({});
    setError(null);
    setModal(true);
  };
  const openEdit = (r: Categoria) => {
    setEditing({ ...r });
    setError(null);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setEditing({});
  };

  const notify = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const save = async () => {
    if (!editing.nombre?.trim()) {
      setError("El nombre es requerido");
      return;
    }
    const payload = {
      nombre: editing.nombre.trim(),
      descripcion: editing.descripcion || null,
    };
    const { error } = editing.id_categoria
      ? await supabase
          .from("categorias")
          .update(payload)
          .eq("id_categoria", editing.id_categoria)
      : await supabase.from("categorias").insert(payload);
    if (error) {
      setError(error.message);
      return;
    }
    closeModal();
    console.log("data : ", payload);
    notify(
      editing.id_categoria ? "Categoría actualizada." : "Categoría creada.",
    );
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("id_categoria", id);
    if (error) {
      setError(error.message);
      return;
    }
    notify("Categoría eliminada.");
    load();
  };

  const filtered = rows.filter(
    (r) =>
      !search ||
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (r.descripcion || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <PageHeader
          title="Categorías"
          description="Clasificación de productos del inventario"
          actions={
            <Button variant="primary" onClick={openNew}>
              + Nueva categoría
            </Button>
          }
        />

        <div className="px-7 pb-7">
          {error && !modal && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          {/* Buscador + contador */}
          <div className="flex items-center gap-3 mb-4">
            <Input
              placeholder="Buscar categorías..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Badge color="gray">{filtered.length} registros</Badge>
          </div>

          {/* Tabla */}
          <div className="bg-(--color-bg-primary) border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            {loading ? (
              <Loading />
            ) : (
              <Table>
                <thead>
                  <tr className="border-b border-zinc-800">
                    <Th>#</Th>
                    <Th>Nombre</Th>
                    <Th>Descripción</Th>
                    <Th right>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <Empty icon="◈" text="Sin categorías registradas" />
                      </td>
                    </tr>
                  )}
                  {filtered.map((r) => (
                    <tr
                      key={r.id_categoria}
                      className="border-b border-zinc-800/50 hover:bg-(--color-bg-hover) transition-colors"
                    >
                      <Td>
                        <Tag>{r.id_categoria}</Tag>
                      </Td>
                      <Td className=" font-semibold">{r.nombre}</Td>
                      <Td>
                        {r.descripcion || (
                          <span className="text-zinc-600">—</span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" onClick={() => openEdit(r)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => remove(r.id_categoria)}
                          >
                            Eliminar
                          </Button>
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
          <Modal
            title={`${editing.id_categoria ? "Editar" : "Nueva"} Categoría`}
            onClose={closeModal}
          >
            {error && <Alert type="error" message={error} />}
            <div className="flex flex-col gap-4">
              <Field label="Nombre *">
                <Input
                  value={editing.nombre || ""}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p, nombre: e.target.value }))
                  }
                  placeholder="Ej: Filtros de aceite"
                />
              </Field>
              <Field label="Descripción">
                <Textarea
                  value={editing.descripcion || ""}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p, descripcion: e.target.value }))
                  }
                  placeholder="Descripción opcional"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
              <Button onClick={closeModal}>Cancelar</Button>
              <Button variant="primary" onClick={save}>
                Guardar
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
