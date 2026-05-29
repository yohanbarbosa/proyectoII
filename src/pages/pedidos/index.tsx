import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import {
  Button, Modal, Field, Input, Textarea, Alert, Loading, Empty,
  Table, Th, Td, Tag, PageHeader, Badge, Select,
} from "../../components/ui";
import AppLayout from "../../layouts/AppLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pedido {
  id_pedido: number;
  numero_pedido: string;
  fecha: string;
  nombre_cliente: string;
  direccion: string;
  ciudad: string | null;
  telefono: string | null;
  notas: string | null;
  estado: EstadoPedido;
  numero_seguimiento: string | null;
  venta_id: number | null;
  ventas?: {
    id_venta: number;
    total: number;
    metodo_pago: string | null;
    detalle_venta: DetalleVenta[];
  } | null;
}

interface DetalleVenta {
  id_detalle: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  productos: { nombre: string; url_img: string | null } | null;
}

type EstadoPedido =
  | "pendiente"
  | "en_proceso"
  | "enviado"
  | "entregado"
  | "cancelado";

// ─── Constants ────────────────────────────────────────────────────────────────

const ESTADOS: { value: EstadoPedido; label: string }[] = [
  { value: "pendiente",   label: "Pendiente"   },
  { value: "en_proceso",  label: "En proceso"  },
  { value: "enviado",     label: "Enviado"     },
  { value: "entregado",   label: "Entregado"   },
  { value: "cancelado",   label: "Cancelado"   },
];

const ESTADO_BADGE: Record<EstadoPedido, { color: string; dot: string }> = {
  pendiente:  { color: "text-amber-400 bg-amber-400/10",   dot: "bg-amber-400"  },
  en_proceso: { color: "text-blue-400 bg-blue-400/10",     dot: "bg-blue-400"   },
  enviado:    { color: "text-indigo-400 bg-indigo-400/10", dot: "bg-indigo-400" },
  entregado:  { color: "text-emerald-400 bg-emerald-400/10", dot: "bg-emerald-400" },
  cancelado:  { color: "text-red-400 bg-red-400/10",       dot: "bg-red-400"    },
};

// Status progression order for the stepper
const ESTADO_STEPS: EstadoPedido[] = [
  "pendiente", "en_proceso", "enviado", "entregado",
];

const fmt = (n: number | null) =>
  n == null ? "—" : Number(n).toLocaleString("es-CO", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });

// ─── Status Badge ─────────────────────────────────────────────────────────────

function EstadoTag({ estado }: { estado: EstadoPedido }) {
  const s = ESTADO_BADGE[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {ESTADOS.find(e => e.value === estado)?.label ?? estado}
    </span>
  );
}

// ─── Status Stepper ───────────────────────────────────────────────────────────

function StatusStepper({ current }: { current: EstadoPedido }) {
  const isCancelled = current === "cancelado";
  const currentIdx  = ESTADO_STEPS.indexOf(current);

  return (
    <div className="w-full">
      {isCancelled ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-400/10 border border-red-400/20">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-sm font-semibold text-red-400">Pedido cancelado</span>
        </div>
      ) : (
        <div className="flex items-center gap-0">
          {ESTADO_STEPS.map((step, i) => {
            const done    = i <= currentIdx;
            const active  = i === currentIdx;
            const s       = ESTADO_BADGE[step];
            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                {/* Circle */}
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 transition-colors
                  ${done ? `border-transparent ${s.dot}` : "border-zinc-700 bg-zinc-800"}`}
                >
                  {done && !active && (
                    <svg className="w-4 h-4 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {active && (
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-950" />
                  )}
                </div>
                {/* Label below */}
                <div className="absolute mt-10 ml-0 hidden" />
                {/* Connector line */}
                {i < ESTADO_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-colors
                    ${i < currentIdx ? "bg-emerald-500" : "bg-zinc-700"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Step labels */}
      {!isCancelled && (
        <div className="flex mt-2">
          {ESTADO_STEPS.map((step, i) => {
            const done   = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={step} className={`flex-1 last:flex-none text-[10px] font-medium
                ${active ? "text-white" : done ? "text-zinc-400" : "text-zinc-600"}`}
              >
                {ESTADOS.find(e => e.value === step)?.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function PedidoDetailModal({
  pedido,
  onClose,
  onSaved,
}: {
  pedido: Pedido;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [estado, setEstado]               = useState<EstadoPedido>(pedido.estado);
  const [seguimiento, setSeguimiento]     = useState(pedido.numero_seguimiento ?? "");
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [success, setSuccess]             = useState<string | null>(null);

  const detalles = pedido.ventas?.detalle_venta ?? [];
  const total    = pedido.ventas?.total ?? null;

  const save = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("pedidos")
      .update({
        estado,
        numero_seguimiento: seguimiento.trim() || null,
      })
      .eq("id_pedido", pedido.id_pedido);

    if (error) { setError(error.message); setSaving(false); return; }
    setSuccess("Pedido actualizado.");
    setTimeout(() => { onSaved(); onClose(); }, 800);
    setSaving(false);
  };

  return (
    <Modal title={`Pedido ${pedido.numero_pedido}`} onClose={onClose} wide>
      {error   && <Alert type="error"   message={error}   />}
      {success && <Alert type="success" message={success} />}

      <div className="flex gap-6">

        {/* LEFT ── order info + items */}
        <div className="flex-1 min-w-0 space-y-5 overflow-y-auto max-h-[65vh] pr-1">

          {/* Status stepper */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Estado del pedido
            </p>
            <StatusStepper current={estado} />
          </div>

          {/* Customer info */}
          <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Datos del cliente
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-zinc-500 text-xs">Nombre</p>
                <p className="text-white font-medium">{pedido.nombre_cliente}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Teléfono</p>
                <p className="text-white font-medium">{pedido.telefono ?? "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-zinc-500 text-xs">Dirección</p>
                <p className="text-white font-medium">{pedido.direccion}{pedido.ciudad ? `, ${pedido.ciudad}` : ""}</p>
              </div>
              {pedido.notas && (
                <div className="col-span-2">
                  <p className="text-zinc-500 text-xs">Notas</p>
                  <p className="text-zinc-300 text-xs leading-relaxed">{pedido.notas}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items ordered */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Productos del pedido
            </p>
            {detalles.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-3">Sin venta vinculada</p>
            ) : (
              <div className="space-y-2">
                {detalles.map((d) => (
                  <div key={d.id_detalle}
                    className="flex items-center gap-3 py-2 border-b border-zinc-700/50 last:border-0"
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-zinc-700 shrink-0 overflow-hidden flex items-center justify-center">
                      {d.productos?.url_img ? (
                        <img src={d.productos.url_img} alt={d.productos.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {d.productos?.nombre ?? "Producto eliminado"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {d.cantidad} × ${fmt(d.precio_unitario)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-400 shrink-0">
                      ${fmt(d.subtotal)}
                    </p>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-500">
                    Método de pago: {pedido.ventas?.metodo_pago ?? "—"}
                  </span>
                  <span className="text-base font-bold text-white">
                    Total: <span className="text-emerald-400">${fmt(total)}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-zinc-800 self-stretch shrink-0" />

        {/* RIGHT ── editable fields */}
        <div className="w-56 shrink-0 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Gestión
            </p>

            {/* Order meta */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Nº pedido</span>
                <Tag>{pedido.numero_pedido}</Tag>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Fecha</span>
                <span className="text-zinc-300">{fmtDate(pedido.fecha)}</span>
              </div>
              {pedido.venta_id && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Venta</span>
                  <Tag>#{pedido.venta_id}</Tag>
                </div>
              )}
            </div>

            <Field label="Estado">
              <Select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoPedido)}
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </Select>
            </Field>

            <Field label="Nº de seguimiento" >
              <Input
                value={seguimiento}
                onChange={(e) => setSeguimiento(e.target.value)}
                placeholder="Ej: TK-928374651"
              />
            </Field>

            {seguimiento && (
              <div className="mt-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">
                  Seguimiento activo
                </p>
                <p className="text-xs text-indigo-300 font-mono break-all">{seguimiento}</p>
              </div>
            )}
          </div>

          {/* Push save to bottom */}
          <div className="mt-auto pt-4 border-t border-zinc-800">
            <Button
              variant="primary"
              onClick={save}
          
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────

export default function PedidosModule() {
  const [rows, setRows]           = useState<Pedido[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoPedido | "">("");
  const [selected, setSelected]   = useState<Pedido | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        *,
        ventas (
          id_venta,
          total,
          metodo_pago,
          detalle_venta (
            id_detalle,
            cantidad,
            precio_unitario,
            subtotal,
            productos ( nombre, url_img )
          )
        )
      `)
      .order("fecha", { ascending: false });

    if (error) setError(error.message);
    setRows((data as Pedido[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.numero_pedido.toLowerCase().includes(q)
      || r.nombre_cliente.toLowerCase().includes(q)
      || (r.ciudad ?? "").toLowerCase().includes(q)
      || (r.numero_seguimiento ?? "").toLowerCase().includes(q);
    const matchEstado = !filterEstado || r.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  // Counts per status for the summary bar
  const counts = ESTADOS.reduce((acc, e) => {
    acc[e.value] = rows.filter(r => r.estado === e.value).length;
    return acc;
  }, {} as Record<EstadoPedido, number>);

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <PageHeader
          title="Pedidos"
          description="Gestión de pedidos, seguimiento y estados"
        />

        <div className="px-7 pb-7 space-y-4">
          {error   && <Alert type="error"   message={error}   />}
          {success && <Alert type="success" message={success} />}

          {/* Summary bar */}
          <div className="grid grid-cols-5 gap-3">
            {ESTADOS.map((e) => {
              const s = ESTADO_BADGE[e.value];
              return (
                <button
                  key={e.value}
                  onClick={() => setFilterEstado(filterEstado === e.value ? "" : e.value)}
                  className={`rounded-xl p-3 border text-left transition-all
                    ${filterEstado === e.value
                      ? `${s.color} border-current`
                      : "bg-(--color-bg-primary) border-zinc-800 hover:border-zinc-600"}`}
                >
                  <p className="text-lg font-bold text-(--color-text-secondary)">{counts[e.value]}</p>
                  <p className={`text-xs font-medium ${filterEstado === e.value ? "" : "text-zinc-500"}`}>
                    {e.label}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="Buscar por número, cliente, ciudad, seguimiento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as EstadoPedido | "")}
              className="w-40"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </Select>
            <Badge>{filtered.length} pedidos</Badge>
          </div>

          {/* Table */}
          <div className="bg-(--color-bg-primary) border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-y-auto max-h-[calc(100vh-340px)]">
              {loading ? <Loading /> : (
                <Table>
                  <thead className="sticky top-0 z-10 bg-zinc-900">
                    <tr className="border-b border-zinc-800">
                      <Th>Nº Pedido</Th>
                      <Th>Fecha</Th>
                      <Th>Cliente</Th>
                      <Th>Ciudad</Th>
                      <Th>Seguimiento</Th>
                      <Th>Venta</Th>
                      <Th>Estado</Th>
                      <Th right>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          <Empty icon="📦" text="Sin pedidos registrados" />
                        </td>
                      </tr>
                    )}
                    {filtered.map((r) => (
                      <tr
                        key={r.id_pedido}
                        className="border-b border-zinc-800/50 hover:bg-(--color-bg-hover) transition-colors cursor-pointer"
                        onClick={() => setSelected(r)}
                      >
                        <Td>
                          <Tag>{r.numero_pedido}</Tag>
                        </Td>
                        <Td className="text-zinc-400 text-xs">
                          {fmtDate(r.fecha)}
                        </Td>
                        <Td className="text-white font-medium max-w-35 truncate">
                          {r.nombre_cliente}
                        </Td>
                        <Td className="text-zinc-400">
                          {r.ciudad ?? "—"}
                        </Td>
                        <Td>
                          {r.numero_seguimiento ? (
                            <span className="font-mono text-indigo-400 text-xs">
                              {r.numero_seguimiento}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </Td>
                        <Td>
                          {r.venta_id
                            ? <Tag>#{r.venta_id}</Tag>
                            : <span className="text-zinc-600">—</span>}
                        </Td>
                        <Td>
                          <EstadoTag estado={r.estado} />
                        </Td>
                        <Td>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setSelected(r); }}
                            >
                              Ver detalle
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
        </div>

        {/* Detail modal */}
        {selected && (
          <PedidoDetailModal
            pedido={selected}
            onClose={() => setSelected(null)}
            onSaved={() => { load(); notify("Pedido actualizado."); }}
          />
        )}
      </div>
    </AppLayout>
  );
}