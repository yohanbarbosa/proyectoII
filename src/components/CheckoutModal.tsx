import { useState } from "react";
import type { SyntheticEvent } from "react";
import { supabase } from "../lib/supabase";
import type { CartItem } from "../types";

interface Props {
  cart: CartItem[];
  cartTotal: number;
  onSuccess: () => void;
  onClose: () => void;
}

const METODOS = [
  { value: "efectivo", label: "Efectivo", icon: "💵" },
  { value: "transferencia", label: "Transferencia", icon: "🏦" },
  { value: "nequi", label: "Nequi", icon: "📱" },
  { value: "daviplata", label: "Daviplata", icon: "📲" },
  { value: "tarjeta_credito", label: "Tarjeta Crédito", icon: "💳" },
  { value: "tarjeta_debito", label: "Tarjeta Débito", icon: "💳" },
];

export default function CheckoutModal({
  cart,
  cartTotal,
  onSuccess,
  onClose,
}: Props) {
  const [step, setStep] = useState<"info" | "payment" | "processing" | "done">(
    "info",
  );
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [error, setError] = useState("");
  const [ventaId, setVentaId] = useState<number | null>(null);

  const handleCheckout = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setStep("processing");

    try {
      let clienteId: number | null = null;

      // 1. Crear cliente directamente
      if (nombre.trim()) {
        const { data: newCliente, error: clienteError } = await supabase
          .from("clientes")
          .insert({
            nombre,
            telefono: telefono || null,
            email: email || null,
          })
          .select("id_cliente")
          .single();

        if (clienteError) throw clienteError;

        clienteId = newCliente.id_cliente;
      }
      console.log("DEBUG VENTA:", {
        clienteId,
        cartTotal,
        metodoPago,
      });
      // 2. Crear venta
      const { data: venta, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          cliente_id: clienteId,
          total: cartTotal,
          metodo_pago: metodoPago,
        })
        .select("id_venta")
        .single();

      if (ventaError) throw ventaError;

      // 3. Insertar detalle
      const detalles = cart.map((item) => ({
        venta_id: venta.id_venta,
        producto_id: item.producto.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio_venta,
        subtotal: item.subtotal,
      }));

      const { error: detalleError } = await supabase
        .from("detalle_venta")
        .insert(detalles);

      if (detalleError) throw detalleError;

      setVentaId(venta.id_venta);
      setStep("done");
    } catch (err: any) {
      console.error(err);
      setError("Hubo un problema al procesar tu pedido.");
      setStep("payment");
    }
  };

  // ─── Done screen ───────────────────────────────────────────────
  if (step === "done") {
    return (
      <ModalShell onClose={onSuccess}>
        <div className="text-center px-6 py-10">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-10 h-10 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-stone-900 text-2xl font-black mb-2">
            ¡Pedido recibido!
          </h2>
          <p className="text-stone-500 text-sm mb-1">Número de pedido</p>
          <p className="text-orange-500 font-black text-3xl mb-6">#{ventaId}</p>
          <p className="text-stone-500 text-sm mb-8 max-w-xs mx-auto">
            Nos comunicaremos contigo pronto para coordinar la entrega o
            recogida. ¡Gracias por tu compra!
          </p>
          <button
            onClick={onSuccess}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all text-sm"
          >
            Volver a la tienda
          </button>
        </div>
      </ModalShell>
    );
  }

  // ─── Processing screen ─────────────────────────────────────────
  if (step === "processing") {
    return (
      <ModalShell onClose={() => {}}>
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.3.07-.62.07-.93s-.03-.64-.07-1l2.09-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.36-.07.73-.07 1s.03.64.07 1l-2.09 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.09-1.63z" />
              </svg>
            </div>
          </div>
          <p className="text-stone-500 text-sm font-medium">
            Procesando tu pedido...
          </p>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-stone-900 font-black text-xl">
            Finalizar pedido
          </h2>
          <p className="text-stone-400 text-xs mt-0.5">
            {step === "info" ? "Paso 1 de 2 · Tus datos" : "Paso 2 de 2 · Pago"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
        >
          <svg
            className="w-4 h-4 text-stone-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleCheckout}>
        {/* Step 1: customer info */}
        {step === "info" && (
          <div className="px-6 py-5 space-y-4">
            <p className="text-stone-500 text-sm">
              Ingresa tus datos para que podamos contactarte. Todos los campos
              son opcionales, pero nos ayudan a procesar tu pedido.
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Nombre completo
              </label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="¿Cómo te llamamos?"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-sm
                  focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder-stone-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Teléfono / WhatsApp
              </label>
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="3XX XXX XXXX"
                type="tel"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-sm
                  focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder-stone-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                type="email"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-sm
                  focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder-stone-300"
              />
            </div>

            {/* Order summary */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <p className="text-stone-600 text-xs font-bold uppercase tracking-wider mb-3">
                Resumen del pedido
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto mb-3">
                {cart.map((item) => (
                  <div
                    key={item.producto.id_producto}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-stone-600 truncate mr-2">
                      {item.cantidad}× {item.producto.nombre}
                    </span>
                    <span className="text-stone-800 font-semibold shrink-0">
                      ${item.subtotal.toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-orange-200 pt-2.5 flex justify-between">
                <span className="text-stone-700 font-bold text-sm">Total</span>
                <span className="text-orange-600 font-black text-lg">
                  ${cartTotal.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("payment")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all text-sm"
            >
              Continuar al pago →
            </button>
          </div>
        )}

        {/* Step 2: payment */}
        {step === "payment" && (
          <div className="px-6 py-5 space-y-5">
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                Selecciona cómo vas a pagar
              </p>
              <div className="grid grid-cols-2 gap-2">
                {METODOS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMetodoPago(m.value)}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-left transition-all
                      ${
                        metodoPago === m.value
                          ? "border-orange-400 bg-orange-50"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span
                      className={`text-xs font-bold ${metodoPago === m.value ? "text-orange-700" : "text-stone-600"}`}
                    >
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-red-500 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("info")}
                className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold py-3 rounded-2xl transition-all text-sm"
              >
                ← Volver
              </button>
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-1.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Confirmar pedido
              </button>
            </div>
          </div>
        )}
      </form>
    </ModalShell>
  );
}

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
