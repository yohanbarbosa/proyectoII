// ─── Database Types ───────────────────────────────────────────────

export interface Categoria {
  id_categoria: number
  nombre: string
  descripcion?: string
}

export interface Producto {
  id_producto: number
  nombre: string
  descripcion?: string
  marca?: string
  categoria_id?: number
  precio_compra: number
  precio_venta: number
  codigo_barras?: string
  stock_actual: number
  stock_minimo: number
  ubicacion?: string
  categorias?: Categoria
}

export interface Cliente {
  id_cliente: number
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
}

export interface DetalleVenta {
  id_detalle?: number
  venta_id?: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  producto?: Producto
}

export interface Venta {
  id_venta?: number
  cliente_id?: number | null
  fecha?: string
  total: number
  metodo_pago: string
  clientes?: Cliente
  detalle_venta?: DetalleVenta[]
}

// ─── Cart Types ───────────────────────────────────────────────────

export interface CartItem {
  producto: Producto
  cantidad: number
  subtotal: number
}

// ─── Auth Types ───────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  role?: string
}