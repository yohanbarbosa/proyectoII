import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../lib/supabase";
import type { Producto, Categoria } from "../../types/index";
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
  Select,
} from "../../components/ui";
import AppLayout from "../../layouts/AppLayout";

const fmt = (n: number | null) =>
  n == null
    ? "—"
    : Number(n).toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

// ─── Image Upload Field ───────────────────────────────────────────────────────

interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
}

function ImageField({ value, onChange }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>(value || "");

  // Keep preview in sync when editing an existing product
  useEffect(() => {
    setPreviewSrc(value || "");
  }, [value]);

  const handleFile = async (file: File) => {
    // Instant local preview while uploading
    const localUrl = URL.createObjectURL(file);
    setPreviewSrc(localUrl);
    setUploadError(null);
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `productos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes") // ← change to your bucket name
      .upload(fileName, file, { upsert: true });

    if (error) {
      setUploadError("Error al subir la imagen. Verifica el bucket.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("imagenes").getPublicUrl(fileName);
    onChange(data.publicUrl);
    setPreviewSrc(data.publicUrl);
    setUploading(false);
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreviewSrc(url);
    setUploadError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const clearImage = () => {
    onChange("");
    setPreviewSrc("");
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="col-span-2 space-y-3">
      {/* Preview area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !previewSrc && inputRef.current?.click()}
        className={`relative w-full h-48 rounded-xl border-2 border-dashed
          border-(--color-border) bg-(--color-bg-secondary)
          flex items-center justify-center overflow-hidden transition-colors
          ${!previewSrc ? "cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/5" : ""}`}
      >
        {previewSrc ? (
          <>
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full object-contain p-2"
              onError={() => setPreviewSrc("")}
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-white text-xs font-medium">
                  Subiendo...
                </span>
              </div>
            )}
            {!uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-600
                           text-white rounded-full flex items-center justify-center
                           text-sm font-bold transition-colors"
              >
                ✕
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
            <span className="text-3xl">🖼️</span>
            <p className="text-sm font-medium text-(--color-text-secondary)">
              Arrastra una imagen o{" "}
              <span className="text-indigo-400">haz clic</span>
            </p>
            <p className="text-xs text-(--color-text-secondary)">
              PNG, JPG, WEBP · máx 5 MB
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-red-500 font-medium">{uploadError}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-(--color-border)" />
        <span className="text-xs text-(--color-text-secondary)">
          o pega una URL
        </span>
        <div className="flex-1 h-px bg-(--color-border)" />
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <Input
          value={value || ""}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="flex-1"
        />
        {value && <Button onClick={clearImage}>Limpiar</Button>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductosModule() {
  const [rows, setRows] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Producto>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase
        .from("productos")
        .select("*, categorias(nombre)")
        .order("id_producto"),
      supabase.from("categorias").select("*").order("nombre"),
    ]);
    setRows((prods as Producto[]) || []);
    setCategorias(cats || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing({ stock_actual: 0, stock_minimo: 0 });
    setError(null);
    setModal(true);
  };
  const openEdit = (r: Producto) => {
    const { categorias: _cat, ...rest } = r;
    setEditing({ ...rest });
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
    if (!editing.precio_compra || !editing.precio_venta) {
      setError("Los precios son requeridos");
      return;
    }

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
    };

    const { error } = editing.id_producto
      ? await supabase
          .from("productos")
          .update(payload)
          .eq("id_producto", editing.id_producto)
      : await supabase.from("productos").insert(payload);

    if (error) {
      setError(error.message);
      return;
    }
    closeModal();
    notify(editing.id_producto ? "Producto actualizado." : "Producto creado.");
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id_producto", id);
    if (error) {
      setError(error.message);
      return;
    }
    notify("Producto eliminado.");
    load();
  };

  const set = <K extends keyof Producto>(k: K, v: Producto[K]) =>
    setEditing((p) => ({ ...p, [k]: v }));

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.nombre.toLowerCase().includes(q) ||
      (r.marca || "").toLowerCase().includes(q) ||
      (r.codigo_barras || "").toLowerCase().includes(q)
    );
  });

  const bajosDeStock = rows.filter(
    (r) => r.stock_actual <= r.stock_minimo,
  ).length;

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <PageHeader
          title="Productos"
          description="Inventario con precios, stock y categorías"
          actions={
            <Button variant="primary" onClick={openNew}>
              + Nuevo producto
            </Button>
          }
        />

        <div className="px-7 pb-7">
          {error && !modal && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <div className="flex items-center gap-3 mb-4">
            <Input
              placeholder="Buscar por nombre, marca, código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Badge>{filtered.length} productos</Badge>
            {bajosDeStock > 0 && (
              <Badge color="red">{bajosDeStock} bajo stock</Badge>
            )}
          </div>

          <div className="bg-(--color-bg-primary) border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            {loading ? (
              <Loading />
            ) : (
              <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                <Table>
                  <thead className="sticky top-0 z-10 bg-(--color-bg-primary)">
                    <tr className="border-b border-zinc-800">
                      <Th>#</Th>
                      <Th>Imagen</Th>
                      <Th>Nombre</Th>
                      <Th>Categoría</Th>
                      <Th>Marca</Th>
                      <Th>P. Compra</Th>
                      <Th>P. Venta</Th>
                      <Th>Stock</Th>
                      <Th>Ubicación</Th>
                      <Th right>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={10}>
                          <Empty icon="⬡" text="Sin productos registrados" />
                        </td>
                      </tr>
                    )}
                    {filtered.map((r) => (
                      <tr
                        key={r.id_producto}
                        className="border-b border-zinc-800/50 hover:bg-(--color-bg-hover) transition-colors"
                      >
                        <Td>
                          <Tag>{r.id_producto}</Tag>
                        </Td>
                        <Td>
                          {r.url_img ? (
                            <img
                              src={r.url_img}
                              alt={r.nombre}
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600 text-lg">
                              📦
                            </div>
                          )}
                        </Td>
                        <Td className="text-white font-semibold max-w-[160px] truncate">
                          {r.nombre}
                        </Td>
                        <Td>
                          {r.categorias ? (
                            <Badge color="amber">{r.categorias.nombre}</Badge>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </Td>
                        <Td>
                          {r.marca || <span className="text-zinc-600">—</span>}
                        </Td>
                        <Td className="text-amber-400 font-semibold">
                          ${fmt(r.precio_compra)}
                        </Td>
                        <Td className="text-emerald-400 font-semibold">
                          ${fmt(r.precio_venta)}
                        </Td>
                        <Td>
                          <Badge
                            color={
                              r.stock_actual <= r.stock_minimo ? "red" : "green"
                            }
                          >
                            {r.stock_actual}
                          </Badge>
                        </Td>
                        <Td>
                          {r.ubicacion || (
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
                              onClick={() => remove(r.id_producto)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {modal && (
          <Modal
            title={`${editing.id_producto ? "Editar" : "Nuevo"} Producto`}
            onClose={closeModal}
            wide
          >
            {error && <Alert type="error" message={error} />}

            {/* Two-column layout: fields left, image right */}
            <div className="flex gap-6 min-h-0">
              {/* LEFT — form fields, scrollable */}
              <div className="min-w-0 flex-1 overflow-y-auto max-h-[60vh] pr-2 space-y-4">
                <Field label="Nombre *">
                  <Input
                    value={editing.nombre || ""}
                    onChange={(e) => set("nombre", e.target.value)}
                    placeholder="Nombre del producto"
                  />
                </Field>
                <Field label="Marca">
                  <Input
                    value={editing.marca || ""}
                    onChange={(e) => set("marca", e.target.value)}
                    placeholder="Ej: Bosch"
                  />
                </Field>
                <Field label="Categoría">
                  <Select
                    value={editing.categoria_id || ""}
                    onChange={(e) =>
                      set(
                        "categoria_id",
                        Number(e.target.value) || (null as any),
                      )
                    }
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Precio Compra *">
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.precio_compra || ""}
                    onChange={(e) =>
                      set("precio_compra", Number(e.target.value) as any)
                    }
                  />
                </Field>
                <Field label="Precio Venta *">
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.precio_venta || ""}
                    onChange={(e) =>
                      set("precio_venta", Number(e.target.value) as any)
                    }
                  />
                </Field>
                <Field label="Stock Actual">
                  <Input
                    type="number"
                    value={editing.stock_actual ?? 0}
                    onChange={(e) =>
                      set("stock_actual", Number(e.target.value) as any)
                    }
                  />
                </Field>
                <Field label="Stock Mínimo">
                  <Input
                    type="number"
                    value={editing.stock_minimo ?? 0}
                    onChange={(e) =>
                      set("stock_minimo", Number(e.target.value) as any)
                    }
                  />
                </Field>
                <Field label="Código de Barras">
                  <Input
                    value={editing.codigo_barras || ""}
                    onChange={(e) => set("codigo_barras", e.target.value)}
                  />
                </Field>
                <Field label="Ubicación">
                  <Input
                    value={editing.ubicacion || ""}
                    onChange={(e) => set("ubicacion", e.target.value)}
                    placeholder="Ej: A-12"
                  />
                </Field>
                <Field label="Descripción">
                  <Textarea
                    value={editing.descripcion || ""}
                    onChange={(e) => set("descripcion", e.target.value)}
                  />
                </Field>
              </div>

              {/* Divider */}
              <div className="w-px bg-zinc-800 self-stretch shrink-0" />

              {/* RIGHT — image, fixed width */}
              <div className="w-56 shrink-0 flex flex-col gap-3">
                <p className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider">
                  Imagen del producto
                </p>
                <ImageField
                  value={editing.url_img || ""}
                  onChange={(url) => set("url_img", url)}
                />
              </div>
            </div>

            {/* Footer — always visible */}
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
