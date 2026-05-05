import React from 'react'

// ── Button ──────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
}
export function Button({ variant = 'default', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center gap-1.5 rounded-md font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-2 py-1 text-[11px]', md: 'px-3 py-1.5 text-xs' }
  const variants = {
    default: 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white',
    primary: 'bg-blue-600 border border-blue-600 text-white hover:bg-blue-700',
    danger:  'bg-red-950/30 border border-red-700 text-red-400 hover:bg-red-900/40',
    ghost:   'bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-gray-800',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ── Badge ───────────────────────────────────────────────
interface BadgeProps { children: React.ReactNode; color?: 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'gray' }
export function Badge({ children, color = 'gray' }: BadgeProps) {
  const colors = {
    green:  'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40',
    red:    'bg-red-950/40 text-red-400 border border-red-800/40',
    amber:  'bg-amber-950/40 text-amber-400 border border-amber-800/40',
    blue:   'bg-blue-950/40 text-blue-400 border border-blue-800/40',
    purple: 'bg-purple-950/40 text-purple-400 border border-purple-800/40',
    gray:   'bg-gray-800 text-gray-400 border border-gray-700',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${colors[color]}`}>{children}</span>
}

// ── Modal ───────────────────────────────────────────────
interface ModalProps { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }
export function Modal({ title, onClose, children, wide }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-y-auto max-h-[88vh] ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-sm font-bold text-white font-mono">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Field ───────────────────────────────────────────────
interface FieldProps { label: string; children: React.ReactNode; className?: string }
export function Field({ label, children, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] uppercase tracking-widest text-gray-500">{label}</label>
      {children}
    </div>
  )
}

// ── Input / Textarea / Select ────────────────────────────
const inputBase = 'bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-100 font-mono outline-none focus:border-blue-500 transition-colors w-full placeholder:text-gray-600'
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputBase} {...props} />
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputBase} min-h-[72px] resize-y`} {...props} />
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputBase} cursor-pointer`} {...props}>
      {props.children}
    </select>
  )
}

// ── Alert ────────────────────────────────────────────────
interface AlertProps { type: 'error' | 'success'; message: string }
export function Alert({ type, message }: AlertProps) {
  const styles = {
    error:   'bg-red-950/30 border-red-800/40 text-red-400',
    success: 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400',
  }
  return <div className={`border rounded-md px-4 py-2.5 text-xs font-mono mb-4 ${styles[type]}`}>{message}</div>
}

// ── Loading ──────────────────────────────────────────────
export function Loading() {
  return (
    <div className="flex items-center justify-center py-14 text-gray-500 gap-3 text-xs">
      <div className="w-4 h-4 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
      Cargando...
    </div>
  )
}

// ── Empty ────────────────────────────────────────────────
export function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-14 text-gray-500">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs">{text}</div>
    </div>
  )
}

// ── Table ────────────────────────────────────────────────
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}
export function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-2.5 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800 font-medium ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}
export function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-2.5 border-b border-gray-800/50 text-gray-400 text-xs align-middle ${className}`}>
      {children}
    </td>
  )
}

// ── Tag (ID pill) ────────────────────────────────────────
export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-[10px] text-gray-500 font-mono">{children}</span>
}

// ── Page header ──────────────────────────────────────────
interface PageHeaderProps { title: string; description?: string; actions?: React.ReactNode }
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="px-7 pt-6 pb-4 border-b border-gray-800 mb-6">
      <div className="text-lg font-bold text-white font-mono">{title}</div>
      {description && <div className="text-[11px] text-gray-500 mt-0.5 mb-3">{description}</div>}
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

// ── Read-only banner ─────────────────────────────────────
export function ReadOnlyBanner() {
  return (
    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-md px-4 py-2 text-[11px] text-emerald-500 flex items-center gap-2 mb-4">
      🔒 Módulo de solo lectura — las ventas se registran desde el punto de venta
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────
interface StatCardProps { label: string; value: string | number; sub?: string; valueClass?: string }
export function StatCard({ label, value, sub, valueClass = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">{label}</div>
      <div className={`text-2xl font-bold font-mono ${valueClass}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-600 mt-1">{sub}</div>}
    </div>
  )
}
