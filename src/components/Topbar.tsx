import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (email: string) =>
    email?.slice(0, 2).toUpperCase() ?? "AP";

  return (
    <header
      className="bg-(--color-bg-primary) border-b border-r border-(--color-border) px-6 py-3 flex items-center justify-between shrink-0"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Lado izquierdo: título de página o bienvenida */}
      <div>
        <p className=" text-(--color-text-primary) font-bold text-sm tracking-tight">
          Panel de gestión
        </p>
        <p className="text-zinc-500 text-xs">Sistema de Gestión Comercial</p>
      </div>

      {/* Lado derecho: usuario + botón salir */}
      <div className="flex items-center gap-3">
        {/* Info usuario */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="text-(--color-text-primary) text-xs font-semibold">{user?.email}</p>
            <p className="text-zinc-500 text-xs">Administrador</p>
          </div>

          {/* Avatar con iniciales */}
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-zinc-950 text-xs font-bold">
              {getInitials(user?.email ?? "")}
            </span>
          </div>
        </div>

        {/* Separador */}
        <div className="w-px h-6 bg-zinc-800 hidden sm:block" />

        {/* Botón salir */}
        <button
          onClick={logout}
          className="cursor-pointer bg-(--color-button) hover:bg-red-500/10 hover:border-red-500/30 border border-zinc-700
            text-(--color-text-secondary) hover:text-red-400 rounded-xl px-3 py-2 text-xs font-semibold
            transition-all duration-200 flex items-center gap-1.5"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Salir
        </button>
      </div>
    </header>
  );
}

export default Topbar;
