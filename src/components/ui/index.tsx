// components/ui/index.tsx
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

/* ── Button ─────────────────────────────────────────────── */
type BtnVariant = 'primary' | 'default' | 'danger'
type BtnSize    = 'sm' | 'md'

const btnBase = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none"

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-amber-500 hover:bg-amber-400 text-zinc-950",
  default: "bg-(--color-button) hover:bg-zinc-700 border border-zinc-700 text-(--color-text-primary) hover:text-white",
  danger:  "bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300",
}

const btnSizes: Record<BtnSize, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
}

export function Button({
  children, onClick, variant = 'default', size = 'md', disabled = false,
}: {
  children: ReactNode; onClick?: () => void
  variant?: BtnVariant; size?: BtnSize; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

/* ── Input ──────────────────────────────────────────────── */
export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-(--color-bg-primary) border border-zinc-700 rounded-xl px-4 py-2.5 text-(--color-text-primary) text-sm
        placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1
        focus:ring-amber-500/50 transition-all ${className}`}
    />
  )
}

/* ── Textarea ───────────────────────────────────────────── */
export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full bg-(--color-bg-secondary) border border-zinc-700 rounded-xl px-4 py-2.5 text-(--color-text-primary) text-sm
        placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1
        focus:ring-amber-500/50 transition-all resize-none ${className}`}
    />
  )
}

/* ── Field ──────────────────────────────────────────────── */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

/* ── Alert ──────────────────────────────────────────────── */
export function Alert({ type, message }: { type: 'error' | 'success'; message: string }) {
  const styles = {
    error:   "bg-red-500/10 border-red-500/30 text-red-400",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  }
  const icons = {
    error:   "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  }
  return (
    <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 mb-4 text-sm ${styles[type]}`}>
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icons[type]} />
      </svg>
      {message}
    </div>
  )
}

/* ── Loading ────────────────────────────────────────────── */
export function Loading() {
  return (
    <div className="flex items-center justify-center py-16 gap-3">
      <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-zinc-500 text-sm">Cargando...</span>
    </div>
  )
}

/* ── Empty ──────────────────────────────────────────────── */
export function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl opacity-20">{icon}</span>
      <p className="text-zinc-500 text-sm">{text}</p>
    </div>
  )
}

/* ── Table / Th / Td ────────────────────────────────────── */
export function Table({ children }: { children: ReactNode }) {
  return (
    <table className="w-full text-sm">{children}</table>
  )
}

export function Th({ children, right }: { children?: ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-(--color-bg-primary)
      ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '', right }: { children: ReactNode; className?: string; right?: boolean }) {
  return (
    <td className={`px-4 py-3 text-(--color-text-primary) ${right ? 'text-right' : ''} ${className}`}>
      {children}
    </td>
  )
}

/* ── Tag ────────────────────────────────────────────────── */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-(--color-bg-secondary) border border-zinc-700 text-zinc-400 text-xs font-semibold px-2 py-0.5 rounded-lg">
      {children}
    </span>
  )
}

/* ── Badge (actualizado con colores) ────────────────────── */
export function Badge({ children, color }: { children: ReactNode; color?: 'red' | 'green' | 'amber' | 'gray' }) {
  const colors = {
    red:   "bg-red-500/10 border-red-500/30 text-red-400",
    green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    gray:  "bg-zinc-800 border-zinc-700 text-zinc-400",
  }
  const style = colors[color ?? 'gray']
  return (
    <span className={`border text-xs font-semibold px-2.5 py-1 rounded-lg ${style}`}>
      {children}
    </span>
  )
}

/* ── PageHeader ─────────────────────────────────────────── */
export function PageHeader({
  title, description, actions,
}: {
  title: string; description?: string; actions?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 mb-6">
      <div>
        <h1 className="text-xl font-bold text-(--color-text-secondary) tracking-tight">{title}</h1>
        {description && <p className="text-zinc-500 text-sm mt-0.5">{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  )
}

/* ── Modal ──────────────────────────────────────────────── */
export function Modal({
  title, children, onClose, wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Card */}
      <div
        className={`relative bg-(--color-bg-primary) border border-zinc-800 rounded-2xl shadow-2xl w-full p-6
          ${wide ? "max-w-3xl" : "max-w-md"}`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700
              text-zinc-400 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}


/* ── Select ─────────────────────────────────────────────── */
import type { SelectHTMLAttributes } from 'react'

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-(--color-bg-secondary) border border-zinc-700 rounded-xl px-4 py-2.5 text-(--color-text-secondary) text-sm
        focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50
        transition-all appearance-none cursor-pointer ${className}`}
    >
      {children}
    </select>
  )
}

