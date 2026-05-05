import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StatCard, Loading } from '../components/ui'
import { useNavigate } from 'react-router-dom'

const fmt = (n: number) => n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fmtCurrency = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface Stats {
  productos: number
  categorias: number
  proveedores: number
  clientes: number
  totalCompras: number
  totalVentas: number
  stockBajo: number
  utilidad: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [prods, cats, provs, clts, compras, ventas] = await Promise.all([
        supabase.from('productos').select('id_producto, stock_actual, stock_minimo'),
        supabase.from('categorias').select('id_categoria'),
        supabase.from('proveedores').select('id_proveedor'),
        supabase.from('clientes').select('id_cliente'),
        supabase.from('compras').select('total'),
        supabase.from('ventas').select('total'),
      ])
      const totalCompras = (compras.data || []).reduce((a, b) => a + (Number(b.total) || 0), 0)
      const totalVentas = (ventas.data || []).reduce((a, b) => a + (Number(b.total) || 0), 0)
      setStats({
        productos: (prods.data || []).length,
        categorias: (cats.data || []).length,
        proveedores: (provs.data || []).length,
        clientes: (clts.data || []).length,
        totalCompras,
        totalVentas,
        stockBajo: (prods.data || []).filter(p => p.stock_actual <= p.stock_minimo).length,
        utilidad: totalVentas - totalCompras,
      })
    }
    load()
  }, [])

  const MODULES = [
    { id: 'categorias', label: 'Categorías', icon: '◈', desc: 'Clasificación de productos', url:"/categorias" },
    { id: 'productos', label: 'Productos', icon: '⬡', desc: 'Inventario y precios', url:"/productos" },
    { id: 'proveedores', label: 'Proveedores', icon: '◉', desc: 'Gestión de proveedores', url:"/proveedores" },
    { id: 'clientes', label: 'Clientes', icon: '◎', desc: 'Base de clientes', url:"/clientes" },
    { id: 'compras', label: 'Compras', icon: '⬇', desc: 'Compras con detalle' , url:"/compras"},
    { id: 'ventas', label: 'Ventas', icon: '⬆', desc: 'Historial (solo lectura)', url:"/ventas", readonly: true },
  ]

  return (
    <div>
      <div className="px-7 pt-6 pb-4 border-b border-gray-800 mb-6">
        <div className="text-lg font-bold text-white font-mono">Dashboard</div>
        <div className="text-[11px] text-gray-500 mt-0.5">Resumen general del sistema de inventario</div>
      </div>
      <div className="px-7 pb-7">
        {!stats ? <Loading /> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard label="Productos" value={fmt(stats.productos)} sub="en catálogo" />
              <StatCard label="Categorías" value={fmt(stats.categorias)} />
              <StatCard label="Proveedores" value={fmt(stats.proveedores)} />
              <StatCard label="Clientes" value={fmt(stats.clientes)} />
              <StatCard label="Total Compras" value={fmtCurrency(stats.totalCompras)} valueClass="text-amber-400 text-base" />
              <StatCard label="Total Ventas" value={fmtCurrency(stats.totalVentas)} valueClass="text-emerald-400 text-base" />
              <StatCard label="Utilidad Bruta" value={fmtCurrency(stats.utilidad)} valueClass={`text-base ${stats.utilidad >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
              <StatCard label="Bajo Stock" value={fmt(stats.stockBajo)} valueClass={stats.stockBajo > 0 ? 'text-red-400' : 'text-emerald-400'} sub="productos en alerta" />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">Módulos del sistema</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {MODULES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => navigate(m.url)}
                    className="flex items-start gap-3 p-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg text-left transition-all group"
                  >
                    <span className="text-xl mt-0.5">{m.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-blue-400 transition-colors">{m.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
                      {m.readonly && <span className="text-[9px] text-emerald-500 bg-emerald-950/40 px-1.5 py-0.5 rounded mt-1 inline-block">solo lectura</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
