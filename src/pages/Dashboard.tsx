import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {  Loading } from "../components/ui";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

const fmt = (n: number) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtCurrency = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Stats {
  productos: number;
  categorias: number;
  proveedores: number;
  clientes: number;
  totalCompras: number;
  totalVentas: number;
  stockBajo: number;
  utilidad: number;
}

const MODULES = [
  { id: "categorias",  label: "Categorías",  icon: "mdi:file-report-outline",       desc: "Clasificación de productos",  url: "/categorias" },
  { id: "productos",   label: "Productos",   icon: "mdi:package-variant-closed",     desc: "Inventario y precios",         url: "/productos" },
  { id: "proveedores", label: "Proveedores", icon: "mdi:truck-outline",              desc: "Gestión de proveedores",       url: "/proveedores" },
  { id: "clientes",    label: "Clientes",    icon: "mdi:account-group-outline",      desc: "Base de clientes",             url: "/clientes" },
  { id: "compras",     label: "Compras",     icon: "mdi:cart-arrow-down",            desc: "Compras con detalle",          url: "/compras" },
  { id: "ventas",      label: "Ventas",      icon: "mdi:chart-line",                 desc: "Historial de ventas",          url: "/ventas", readonly: true },
];

const STAT_CARDS = (stats: Stats) => [
  { label: "Productos",      value: fmt(stats.productos),             sub: "en catálogo",       icon: "mdi:package-variant-closed",  valueClass: "text-white" },
  { label: "Categorías",     value: fmt(stats.categorias),            sub: "registradas",       icon: "mdi:file-report-outline",     valueClass: "text-white" },
  { label: "Proveedores",    value: fmt(stats.proveedores),           sub: "activos",           icon: "mdi:truck-outline",           valueClass: "text-white" },
  { label: "Clientes",       value: fmt(stats.clientes),              sub: "registrados",       icon: "mdi:account-group-outline",   valueClass: "text-white" },
  { label: "Total Compras",  value: fmtCurrency(stats.totalCompras),  sub: "acumulado",         icon: "mdi:cart-arrow-down",         valueClass: "text-amber-400" },
  { label: "Total Ventas",   value: fmtCurrency(stats.totalVentas),   sub: "acumulado",         icon: "mdi:chart-line",              valueClass: "text-emerald-400" },
  { label: "Utilidad Bruta", value: fmtCurrency(stats.utilidad),      sub: "ventas − compras",  icon: "mdi:cash-multiple",           valueClass: stats.utilidad >= 0 ? "text-emerald-400" : "text-red-400" },
  { label: "Bajo Stock",     value: fmt(stats.stockBajo),             sub: "productos en alerta", icon: "mdi:alert-outline",         valueClass: stats.stockBajo > 0 ? "text-red-400" : "text-emerald-400" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [prods, cats, provs, clts, compras, ventas] = await Promise.all([
        supabase.from("productos").select("id_producto, stock_actual, stock_minimo"),
        supabase.from("categorias").select("id_categoria"),
        supabase.from("proveedores").select("id_proveedor"),
        supabase.from("clientes").select("id_cliente"),
        supabase.from("compras").select("total"),
        supabase.from("ventas").select("total"),
      ]);
      const totalCompras = (compras.data || []).reduce((a, b) => a + (Number(b.total) || 0), 0);
      const totalVentas  = (ventas.data  || []).reduce((a, b) => a + (Number(b.total) || 0), 0);
      setStats({
        productos:    (prods.data || []).length,
        categorias:   (cats.data  || []).length,
        proveedores:  (provs.data || []).length,
        clientes:     (clts.data  || []).length,
        totalCompras,
        totalVentas,
        stockBajo: (prods.data || []).filter(p => p.stock_actual <= p.stock_minimo).length,
        utilidad: totalVentas - totalCompras,
      });
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="px-7 pb-7" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {!stats ? (
          <Loading />
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {STAT_CARDS(stats).map(({ label, value, sub, icon, valueClass }) => (
                <div
                  key={label}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-lg"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {label}
                    </span>
                    <div className="w-7 h-7 bg-zinc-800 rounded-lg flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  {/* Value */}
                  <div>
                    <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
                    {sub && <p className="text-zinc-500 text-xs mt-0.5">{sub}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Módulos ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
                Módulos del sistema
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigate(m.url)}
                    className="flex items-start gap-3 p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                      hover:border-amber-500/40 rounded-xl text-left transition-all duration-200 group"
                  >
                    {/* Icono */}
                    <div className="w-8 h-8 bg-zinc-900 group-hover:bg-amber-500/10 border border-zinc-700
                      group-hover:border-amber-500/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200">
                      <svg className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {m.label}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">{m.desc}</p>
                      {m.readonly && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10
                          border border-emerald-500/20 px-1.5 py-0.5 rounded-md mt-1.5 inline-block">
                          solo lectura
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}