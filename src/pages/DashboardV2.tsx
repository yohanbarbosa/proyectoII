import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { supabase } from "../lib/supabase";
import AppLayout from "../layouts/AppLayout";
import { Loading } from "../components/ui";

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface MonthlySale {
  month: string;
  ventas: number;
  compras: number;
}

interface TopProduct {
  nombre: string;
  stock_actual: number;
  precio_venta: number;
  total_vendido: number;
  total_ingresos: number;
}

interface TopCategory {
  nombre: string;
  total: number;
  color: string;
}

interface RecentActivity {
  icon: string;
  title: string;
  sub: string;
  badge: string;
  badgeColor: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_COLORS = ["#6366f1","#f59e0b","#ec4899","#14b8a6","#10b981","#f97316"];

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtCOP = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n}`;

const fmtCurrency = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmt = (n: number) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-(--color-bg-primary) border border-(--color-border) rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-(--color-text-primary) mb-1">{label}</p>
      <p className="text-indigo-400">
        ● Ventas <span className="font-bold text-(--color-text-primary)">{fmtCOP(payload[0]?.value ?? 0)}</span>
      </p>
      <p className="text-emerald-400 mt-0.5">
        ● Compras <span className="font-bold text-(--color-text-primary)">{fmtCOP(payload[1]?.value ?? 0)}</span>
      </p>
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

function DashboardV2() {
  const [stats, setStats]             = useState<Stats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlySale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeTab, setActiveTab]     = useState("Mensual");
  const [loading, setLoading]         = useState(true);

  useEffect(() => { loadAll(); }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadStats(),
      loadMonthlyData(),
      loadTopProducts(),
      loadTopCategories(),
      loadRecentActivity(),
    ]);
    setLoading(false);
  };

  const loadStats = async () => {
    const [prods, cats, provs, clts, compras, ventas] = await Promise.all([
      supabase.from("productos").select("id_producto, stock_actual, stock_minimo"),
      supabase.from("categorias").select("id_categoria"),
      supabase.from("proveedores").select("id_proveedor"),
      supabase.from("clientes").select("id_cliente"),
      supabase.from("compras").select("total"),
      supabase.from("ventas").select("total"),
    ]);

    const totalCompras = (compras.data ?? []).reduce((a, b) => a + (Number(b.total) || 0), 0);
    const totalVentas  = (ventas.data  ?? []).reduce((a, b) => a + (Number(b.total) || 0), 0);

    setStats({
      productos:    (prods.data ?? []).length,
      categorias:   (cats.data  ?? []).length,
      proveedores:  (provs.data ?? []).length,
      clientes:     (clts.data  ?? []).length,
      totalCompras,
      totalVentas,
      stockBajo: (prods.data ?? []).filter(p => p.stock_actual <= p.stock_minimo).length,
      utilidad: totalVentas - totalCompras,
    });
  };

  const loadMonthlyData = async () => {
    const [ventas, compras] = await Promise.all([
      supabase.from("ventas").select("fecha, total"),
      supabase.from("compras").select("fecha, total"),
    ]);

    // Build a map month -> { ventas, compras }
    const map: Record<string, { ventas: number; compras: number }> = {};

    (ventas.data ?? []).forEach(v => {
      const key = new Date(v.fecha).getMonth();
      if (!map[key]) map[key] = { ventas: 0, compras: 0 };
      map[key].ventas += Number(v.total) || 0;
    });

    (compras.data ?? []).forEach(c => {
      const key = new Date(c.fecha).getMonth();
      if (!map[key]) map[key] = { ventas: 0, compras: 0 };
      map[key].compras += Number(c.total) || 0;
    });

    const result: MonthlySale[] = Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([monthIdx, val]) => ({
        month: MONTHS[Number(monthIdx)],
        ventas: val.ventas,
        compras: val.compras,
      }));

    setMonthlyData(result);
  };

  const loadTopProducts = async () => {
    // Join detalle_venta → productos to get top sellers
    const { data } = await supabase
      .from("detalle_venta")
      .select("cantidad, subtotal, producto_id, productos(nombre, stock_actual, precio_venta)");

    if (!data) return;

    const map: Record<number, TopProduct> = {};

    data.forEach((row: any) => {
      const id = row.producto_id;
      if (!map[id]) {
        map[id] = {
          nombre:         row.productos?.nombre ?? "—",
          stock_actual:   row.productos?.stock_actual ?? 0,
          precio_venta:   row.productos?.precio_venta ?? 0,
          total_vendido:  0,
          total_ingresos: 0,
        };
      }
      map[id].total_vendido  += row.cantidad    ?? 0;
      map[id].total_ingresos += Number(row.subtotal) || 0;
    });

    const sorted = Object.values(map)
      .sort((a, b) => b.total_ingresos - a.total_ingresos)
      .slice(0, 5);

    setTopProducts(sorted);
  };

  const loadTopCategories = async () => {
    // detalle_venta → productos → categorias
    const { data } = await supabase
      .from("detalle_venta")
      .select("subtotal, productos(categoria_id, categorias(nombre))");

    if (!data) return;

    const map: Record<string, number> = {};

    data.forEach((row: any) => {
      const nombre = row.productos?.categorias?.nombre ?? "Sin categoría";
      map[nombre] = (map[nombre] ?? 0) + (Number(row.subtotal) || 0);
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);

    const result: TopCategory[] = Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([nombre, value], i) => ({
        nombre,
        total: value,
        color: CATEGORY_COLORS[i] ?? "#6366f1",
      }));

    setTopCategories(result);

    // Store total for percentage calculation
    setTotalCatSales(total);
  };

  const [totalCatSales, setTotalCatSales] = useState(0);

  const loadRecentActivity = async () => {
    const [ventas, stockAlerts] = await Promise.all([
      supabase
        .from("ventas")
        .select("id_venta, fecha, total, clientes(nombre)")
        .order("fecha", { ascending: false })
        .limit(2),
      supabase
        .from("productos")
        .select("nombre, stock_actual, stock_minimo")
        .filter("stock_actual", "lte", "stock_minimo") // raw filter trick
        .limit(2),
    ]);

    const activities: RecentActivity[] = [];

    (ventas.data ?? []).forEach((v: any) => {
      const cliente = v.clientes?.nombre ?? "Cliente general";
      const fecha   = new Date(v.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "2-digit" });
      activities.push({
        icon:       "🧾",
        title:      `Venta #${v.id_venta}`,
        sub:        `${cliente} · ${fecha}`,
        badge:      "Nueva venta",
        badgeColor: "text-indigo-600 bg-indigo-50",
      });
    });

    (stockAlerts.data ?? []).forEach((p: any) => {
      activities.push({
        icon:       "⚠️",
        title:      "Stock bajo",
        sub:        `${p.nombre} · ${p.stock_actual} unidades`,
        badge:      "Stock bajo",
        badgeColor: "text-red-600 bg-red-50",
      });
    });

    setRecentActivity(activities);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const statCards = stats ? [
    { label: "Total Productos",  value: fmt(stats.productos),           icon: "📦", iconBg: "bg-indigo-50",  iconColor: "text-indigo-500" },
    { label: "Total Ventas",     value: fmtCurrency(stats.totalVentas), icon: "💰", iconBg: "bg-blue-50",    iconColor: "text-blue-500"   },
    { label: "Total Compras",    value: fmtCurrency(stats.totalCompras),icon: "🛒", iconBg: "bg-emerald-50", iconColor: "text-emerald-500"},
    { label: "Utilidad",         value: fmtCurrency(stats.utilidad),    icon: stats.utilidad >= 0 ? "📈" : "📉",
      iconBg: stats.utilidad >= 0 ? "bg-green-50" : "bg-red-50",
      iconColor: stats.utilidad >= 0 ? "text-green-500" : "text-red-500" },
  ] : [];

  return (
    <AppLayout>
      <div>
        {loading ? (
          <Loading />
        ) : (
          <main className="flex-1 overflow-auto p-6 space-y-5">

            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-4">
              {statCards.map((s) => (
                <div
                  key={s.label}
                  className="bg-(--color-bg-primary) rounded-2xl p-4 border border-(--color-border) flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center ${s.iconColor} text-lg`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[11px] text-(--color-text-secondary) font-medium">{s.label}</p>
                    <p className="text-lg font-semibold text-(--color-text-primary)">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-4">

              {/* Bar Chart — Ventas vs Compras */}
              <div className="col-span-2 bg-(--color-bg-primary) rounded-2xl p-5 border border-(--color-border)">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-(--color-text-primary)">
                    Ingresos vs Compras
                  </span>
                  <div className="flex gap-1">
                    {["Mensual", "Trimestral", "Anual"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors
                          ${activeTab === t ? "bg-indigo-600 text-white" : "text-(--color-text-secondary) hover:text-(--color-text-primary)"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[11px] text-(--color-text-secondary) flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> Ventas
                  </span>
                  <span className="text-[11px] text-(--color-text-secondary) flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Compras
                  </span>
                </div>
                {monthlyData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-(--color-text-secondary) text-sm">
                    Sin datos aún
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData} barGap={4} barCategoryGap="35%">
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={fmtCOP} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                      <Bar dataKey="ventas"  radius={[6, 6, 0, 0]} maxBarSize={22} fill="#34d399" />
                      <Bar dataKey="compras" radius={[6, 6, 0, 0]} maxBarSize={22} fill="#6366f1"  />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Donut — Top Categorías */}
              <div className="bg-(--color-bg-primary) rounded-2xl p-5 border border-(--color-border)">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-(--color-text-primary)">Top Categorías</span>
                </div>
                {topCategories.length === 0 ? (
                  <div className="flex items-center justify-center h-36 text-(--color-text-secondary) text-sm">
                    Sin datos aún
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="relative w-36 h-36">
                        <PieChart width={144} height={144}>
                          <Pie
                            data={topCategories.map(c => ({ name: c.nombre, value: c.total }))}
                            cx={68} cy={68}
                            innerRadius={44} outerRadius={68}
                            dataKey="value"
                            startAngle={90} endAngle={-270}
                            strokeWidth={3} stroke="transparent"
                          >
                            {topCategories.map((c, i) => <Cell key={i} fill={c.color} />)}
                          </Pie>
                        </PieChart>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-[10px] text-(--color-text-secondary)">Total</p>
                          <p className="text-sm font-bold text-(--color-text-primary)">{fmtCOP(totalCatSales)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {topCategories.map((cat) => (
                        <div key={cat.nombre} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
                            <span className="text-(--color-text-secondary)">{cat.nombre}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-(--color-text-secondary)">{fmtCOP(cat.total)}</span>
                            <span className="font-semibold text-(--color-text-primary) w-8 text-right">
                              {totalCatSales > 0 ? Math.round((cat.total / totalCatSales) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-4">

              {/* Actividad reciente */}
              <div className="bg-(--color-bg-primary) rounded-2xl p-5 border border-(--color-border)">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm">🕐</span>
                  <span className="text-sm font-semibold text-(--color-text-primary)">Actividad reciente</span>
                </div>
                {recentActivity.length === 0 ? (
                  <p className="text-(--color-text-secondary) text-sm text-center py-4">Sin actividad reciente</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-(--color-bg-secondary) flex items-center justify-center text-base shrink-0">
                          {a.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-(--color-text-primary) truncate">{a.title}</p>
                          <p className="text-[11px] text-(--color-text-secondary)">{a.sub}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg shrink-0 ${a.badgeColor}`}>
                          {a.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Productos */}
              <div className="bg-(--color-bg-primary) rounded-2xl p-5 border border-(--color-border)">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span className="text-sm font-semibold text-(--color-text-primary)">Top Productos</span>
                  </div>
                </div>
                {topProducts.length === 0 ? (
                  <p className="text-(--color-text-secondary) text-sm text-center py-4">Sin datos de ventas aún</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] text-(--color-text-secondary) border-b border-(--color-border)">
                        {["Producto", "Stock", "Precio", "Vendidos", "Ingresos"].map((h) => (
                          <th key={h} className={`pb-2 font-semibold ${h === "Producto" ? "text-left" : "text-right"}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--color-border)">
                      {topProducts.map((p) => (
                        <tr key={p.nombre} className="text-xs hover:bg-(--color-bg-hover) transition-colors">
                          <td className="py-2.5">
                            <span className="font-medium text-(--color-text-primary) truncate block max-w-28">{p.nombre}</span>
                          </td>
                          <td className="py-2.5 text-right text-(--color-text-secondary)">{p.stock_actual}</td>
                          <td className="py-2.5 text-right text-(--color-text-secondary)">{fmtCOP(p.precio_venta)}</td>
                          <td className="py-2.5 text-right text-(--color-text-secondary)">{p.total_vendido}</td>
                          <td className="py-2.5 text-right font-semibold text-(--color-text-primary)">{fmtCOP(p.total_ingresos)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </main>
        )}
      </div>
    </AppLayout>
  );
}

export default DashboardV2;