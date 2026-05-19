import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Stats } from "../types/index";
import AppLayout from "../layouts/AppLayout";
import { Loading } from "../components/ui";

const salesData = [
  { month: "Jan", oneTime: 100000, recurring: 60000 },
  { month: "Feb", oneTime: 75000, recurring: 50000 },
  { month: "Mar", oneTime: 90000, recurring: 55000 },
  { month: "Apr", oneTime: 60000, recurring: 25000, active: true },
  { month: "May", oneTime: 110000, recurring: 70000 },
  { month: "Jun", oneTime: 80000, recurring: 45000 },
  { month: "Jul", oneTime: 130000, recurring: 80000 },
  { month: "Aug", oneTime: 95000, recurring: 65000 },
];

const pieData = [
  { name: "Electronics", value: 85000, color: "#6366f1" },
  { name: "Fashion", value: 25000, color: "#f59e0b" },
  { name: "Health & Wellness", value: 10000, color: "#ec4899" },
  { name: "Home & Living", value: 5000, color: "#14b8a6" },
];

const recentActivity = [
  {
    icon: "👤",
    title: "Order #2048",
    sub: "John Doe · 12 Jan 25",
    badge: "New Order",
    badgeColor: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: "⚠️",
    title: "Low Stock Alert",
    sub: "MacBook Air M2 · 10 Jan 25",
    badge: "Low Stock",
    badgeColor: "text-red-600 bg-red-50",
  },
  {
    icon: "🎟️",
    title: 'Promo code "SUMMER20"',
    sub: "Applied 52 times · 8 Jan 25",
    badge: "Campaign",
    badgeColor: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: "🖥️",
    title: "System Update",
    sub: "Version 1.21 · 2 Jan 25",
    badge: "System",
    badgeColor: "text-gray-500 bg-gray-100",
  },
];

const products = [
  {
    name: "iPhone 15 Pro",
    img: "📱",
    color: "#1d4ed8",
    stocks: 6200,
    price: "$999.00",
    sales: 4800,
    earnings: "$4,795,200",
  },
  {
    name: "MacBook Air M2",
    img: "💻",
    color: "#6d28d9",
    stocks: 1020,
    price: "$1,299",
    sales: 3200,
    earnings: "$4,156,800",
  },
  {
    name: "Google Pixel 8",
    img: "📲",
    color: "#047857",
    stocks: 1500,
    price: "$699.00",
    sales: 800,
    earnings: "$559,200",
  },
  {
    name: "Nike Air Max 90",
    img: "👟",
    color: "#b45309",
    stocks: 2400,
    price: "$130.00",
    sales: 1800,
    earnings: "$234,000",
  },
  {
    name: "Galaxy Buds Pro",
    img: "🎧",
    color: "#4b5563",
    stocks: 850,
    price: "$199.00",
    sales: 1000,
    earnings: "$199,000",
  },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-indigo-400">
          ● Ingresos únicos{" "}
          <span className="font-bold text-gray-800">
            ${(payload[0]?.value / 1000).toFixed(0)}K
          </span>
        </p>
        <p className="text-indigo-200 mt-0.5">
          ● Ingresos recurrentes{" "}
          <span className="font-bold text-gray-800">
            ${(payload[1]?.value / 1000).toFixed(0)}K
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const fmtK = (v: number): string =>
  v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`;

const fmtCOP = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(0)}M`;
  }

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }

  return `$${value}`;
};

function DashboardV2() {
  const [stats, setStats] = useState<Stats | null>(null);

  const [activeTab, setActiveTab] = useState("Monthly");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prods, cats, provs, clts, compras, ventas] = await Promise.all([
      supabase
        .from("productos")
        .select("id_producto, stock_actual, stock_minimo"),
      supabase.from("categorias").select("id_categoria"),
      supabase.from("proveedores").select("id_proveedor"),
      supabase.from("clientes").select("id_cliente"),
      supabase.from("compras").select("total"),
      supabase.from("ventas").select("total"),
    ]);
    const totalCompras = (compras.data || []).reduce(
      (a, b) => a + (Number(b.total) || 0),
      0,
    );
    const totalVentas = (ventas.data || []).reduce(
      (a, b) => a + (Number(b.total) || 0),
      0,
    );

    setStats({
      productos: (prods.data || []).length,
      categorias: (cats.data || []).length,
      proveedores: (provs.data || []).length,
      clientes: (clts.data || []).length,
      totalCompras,
      totalVentas,
      stockBajo: (prods.data || []).filter(
        (p) => p.stock_actual <= p.stock_minimo,
      ).length,
      utilidad: totalVentas - totalCompras,
    });
  };

  const fmt = (n: number) =>
    n.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const fmtCurrency = (n: number) =>
    "$" +
    n.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <AppLayout>
      <div className="">
        {!stats ? (
          <Loading />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Content */}
            <main className="flex-1 overflow-auto p-6 space-y-5">
              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Productos",
                    value: fmt(stats.productos),
                    icon: "⚙️",
                    iconBg: "bg-indigo-50",
                    iconColor: "text-indigo-500",
                  },
                  {
                    label: "Total ventas",
                    value: fmtCurrency(stats.totalVentas),
                    icon: "💲",
                    iconBg: "bg-blue-50",
                    iconColor: "text-blue-500",
                  },
                  {
                    label: "Total Compras",
                    value: fmtCurrency(stats.totalCompras),
                    icon: "↙",
                    iconBg: "bg-emerald-50",
                    iconColor: "text-emerald-500",
                  },
                  {
                    label: "Gastos totales",
                    value: fmtCurrency(stats.utilidad),
                    icon: "↗",
                    iconBg: "bg-red-50",
                    iconColor: "text-red-400",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-(--color-bg-primary) rounded-2xl p-4 border border-(--color-border) flex items-center gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center ${s.iconColor} text-lg`}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {s.label}
                      </p>
                      <p className="text-lg font-semibold text-(--color-text-primary)">
                        {s.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* grafica sobre ingresos de ventas */}
                <div className="col-span-2 bg-(--color-bg-primary) rounded-2xl p-5 border border-(--color-border)">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-(--color-text-primary)">
                        Ingreso de ventas
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {["Monthly", "Quarterly", "Yearly"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setActiveTab(t)}
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors
                        ${activeTab === t ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                      Ingresos únicos
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-200 inline-block" />
                      Ingresos recurrentes
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={salesData} barGap={4} barCategoryGap="35%">
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                      />
<YAxis
  axisLine={false}
  tickLine={false}
  domain={[0, "dataMax + 100000"]}
  tick={{ fontSize: 11, fill: "#9ca3af" }}
  tickFormatter={fmtCOP}
/>
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(99,102,241,0.04)", radius: 8 }}
                      />
                      <Bar
                        dataKey="oneTime"
                        stackId="a"
                        radius={[0, 0, 0, 0]}
                        maxBarSize={22}
                      >
                        {salesData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.active ? "#6366f1" : "#c7d2fe"}
                          />
                        ))}
                      </Bar>
                      <Bar
                        dataKey="recurring"
                        stackId="a"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={22}
                      >
                        {salesData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.active ? "#a5b4fc" : "#e0e7ff"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Categories */}
                <div className="bg-(--color-bg-primary) rounded-2xl p-5 border border-(--color-border)">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-(--color-text-primary)">
                        Top Categorias
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className="relative w-36 h-36">
                      <PieChart width={144} height={144}>
                        <Pie
                          data={pieData}
                          cx={68}
                          cy={68}
                          innerRadius={44}
                          outerRadius={68}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          strokeWidth={3}
                          stroke="#fff"
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[10px] text-gray-400">Total Sales</p>
                        <p className="text-sm font-bold text-(--color-text-primary)">
                          $125,000
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {pieData.map((cat) => (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-gray-600">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">
                            ${cat.value.toLocaleString()}
                          </span>
                          <span className="font-semibold text-gray-700 w-8 text-right">
                            {Math.round((cat.value / 125000) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Recent Activity */}
                <div className="bg-(--color-bg-primary) rounded-2xl p-5 border border-(--color-border)">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🕐</span>
                      <span className="text-sm font-semibold text-(--color-text-primary)">
                        Actividad reciente
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {recentActivity.map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-base shrink-0">
                          {a.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-(--color-text-primary) truncate">
                            {a.title}
                          </p>
                          <p className="text-[11px] text-gray-400">{a.sub}</p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-1 rounded-lg shrink-0 ${a.badgeColor}`}
                        >
                          {a.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-(--color-bg-primary) rounded-2xl p-5 border border-(--color-border)">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🎯</span>
                      <span className="text-sm font-semibold text-(--color-text-primary)">
                        Top Productos
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 border border-gray-100 rounded-lg px-2 py-1">
                        ⇅ Sort
                      </button>
                      <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 border border-gray-100 rounded-lg px-2 py-1">
                        ⚏ Filter
                      </button>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] text-(--color-text-primary) border-b border-gray-50">
                        {[
                          "Product",
                          "Stocks",
                          "Price",
                          "Sales",
                          "Earnings",
                        ].map((h) => (
                          <th
                            key={h}
                            className={`pb-2 font-semibold ${h === "Product" ? "text-left" : "text-right"}`}
                          >
                            {h}{" "}
                            {h !== "Earnings" && (
                              <span className="text-gray-300">⇅</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((p) => (
                        <tr
                          key={p.name}
                          className="text-xs hover:bg-(--color-bg-hover) transition-colors select-none"
                        >
                          <td className="py-2.5 flex items-center gap-2 min-w-0">
                            <span
                              className="w-6 h-6 rounded-md flex items-center justify-center text-sm"
                              style={{ background: `${p.color}15` }}
                            >
                              {p.img}
                            </span>
                            <span className="font-medium text-(--color-text-primary) truncate max-w-27.5">
                              {p.name}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-gray-500">
                            {p.stocks.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right text-gray-500">
                            {p.price}
                          </td>
                          <td className="py-2.5 text-right text-gray-500">
                            {p.sales.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right font-medium text-(--color-text-secondary)">
                            {p.earnings}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default DashboardV2;
