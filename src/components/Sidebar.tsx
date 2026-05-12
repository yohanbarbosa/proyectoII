import { Icon } from "@iconify/react";
import MenuItems from "./MenuItems";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", icon: "mdi:view-dashboard", label: "Dashboard" },
    { path: "/productos", icon: "mdi:package-variant-closed", label: "Productos" },
    { path: "/ventas", icon: "mdi:attach-money", label: "Ventas" },
    { path: "/clientes", icon: "mdi:account-group-outline", label: "Clientes" },
    { path: "/categorias", icon: "mdi:file-report-outline", label: "Categorías" },
    { path: "/compras", icon: "mdi:cart-sale", label: "Compras" },
    { path: "/proveedores", icon: "mdi:account-supervisor", label: "Proveedor" },

  ];

  return (
    <div
      className="bg-zinc-900 border-r border-zinc-800 w-1/5 h-screen p-4 flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-1">
        <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">AutoPartes Pro</span>
      </div>

      {/* Label sección */}
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-3">
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
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
          >
            <Icon icon={icon} width="18" height="18" />
            <span className="font-semibold text-sm capitalize">{label}</span>
            {isActive(path) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-zinc-950/40" />
            )}
          </li>
        ))}

        {/* MenuItems especial */}
        <li className="text-zinc-400">
          <MenuItems items={["All Orders", "Returns", "Order Tracking"]} />
        </li>
      </ul>

      {/* Footer */}
      <div className="border-t border-zinc-800 pt-4 mt-4">
        <p className="text-zinc-600 text-xs text-center">
          © 2025 AutoPartes Pro
        </p>
      </div>
    </div>
  );
}

export default Sidebar;