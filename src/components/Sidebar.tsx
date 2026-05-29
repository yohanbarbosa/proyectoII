import { Icon } from "@iconify/react";
import MenuItems from "./MenuItems";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import type { Theme } from "../context/ThemeContext";

const themes: { id: Theme; label: string; icon: string }[] = [
  { id: "dark",  label: "Dark",  icon: "mdi:moon-waning-crescent" },
  { id: "light", label: "Light", icon: "mdi:white-balance-sunny" },
  { id: "amber", label: "Amber", icon: "mdi:palette-outline" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard",   icon: "mdi:view-dashboard",         label: "Dashboard" },
    { path: "/productos",   icon: "mdi:package-variant-closed", label: "Productos" },
    { path: "/ventas",      icon: "mdi:attach-money",           label: "Ventas" },
    { path: "/clientes",    icon: "mdi:account-group-outline",  label: "Clientes" },
    { path: "/categorias",  icon: "mdi:file-report-outline",    label: "Categorías" },
    { path: "/compras",     icon: "mdi:cart-sale",              label: "Compras" },
    { path: "/proveedores", icon: "mdi:account-supervisor",     label: "Proveedor" },
    { path: "/pedidos", icon: "mdi:account-supervisor",     label: "Pedidos" },

  ];

  return (
    <div
      className="bg-(--color-bg-primary) border-r border-(--color-border)
                 w-1/5 h-screen p-4 flex flex-col transition-colors duration-300"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-1">
        <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight text-amber-500">AutoPartes Pro</span>
      </div>

      {/* Label sección */}
      <p className="text-(--color-text-secondary) text-xs font-semibold uppercase tracking-wider px-3 mb-3">
        Navegación
      </p>

      {/* Nav items */}
      <ul className="space-y-1 flex-1">
        {navItems.map(({ path, icon, label }) => (
          <li
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
              ${isActive(path)
                ? "bg-amber-500 text-zinc-950"
                : "text-(--color-text-secondary) hover:bg-(--color-bg-hover) hover:text-(--color-text-primary)"
              }`}
          >
            <Icon icon={icon} width="18" height="18" />
            <span className="font-semibold text-sm capitalize">{label}</span>
            {isActive(path) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-zinc-950/40" />
            )}
          </li>
        ))}


      </ul>

      {/* Footer */}
      <div className="border-t border-(--color-border) pt-4 mt-4 space-y-3">
        {/* Theme switcher */}
        <div>
          <p className="text-(--color-text-secondary) text-xs font-semibold uppercase tracking-wider px-1 mb-2">
            Tema
          </p>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all duration-200
                  border-(--color-border) bg-(--color-bg-secondary)
                  hover:bg-(--color-bg-hover)
                  ${theme === t.id ? "ring-2 ring-amber-500" : ""}`}
              >
                <Icon
                  icon={t.icon}
                  width="16"
                  height="16"
                  className="text-(--color-text-secondary)"
                />
                <span className="text-[10px] font-semibold text-(--color-text-secondary)">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-(--color-text-secondary) text-xs text-center">
          © 2025 AutoPartes JDM
        </p>
      </div>
    </div>
  );
}

export default Sidebar;