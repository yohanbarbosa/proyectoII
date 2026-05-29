import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import type { ReactNode } from 'react'
import { useTheme } from './context/ThemeContext'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/Register'
import POSPage from './pages/sales/POSPage'
import StorePage from './pages/store/StorePage'
import Categoria from './pages/categorias/index'
import Cliente from './pages/clientes/index'
import Compra from './pages/compras/index'
import Producto from './pages/productos/index'
import Proveedor from './pages/proveedores/index'
import Venta from './pages/ventas/index'
import Dashboard from './pages/Dashboard'
import DashboardV2 from './pages/DashboardV2'
import Pedidos from './pages/pedidos'






function PrivateRoute({ children }: { children: ReactNode }){
  const { user, loading } = useAuth()

  if (loading) return <p>Cargando...</p>

  if (!user) return <Navigate to="/login" />

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* redirección automática */}
      <Route path="/" element={<Navigate to={user ? "/pos" : "/login"} />} />
      <Route path='/store' element={<StorePage/>}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login" element={<RegisterPage />} />
      <Route path="/categorias" element={<Categoria/>} />
      <Route path="/clientes" element={<Cliente/>} />
      <Route path="/compras" element={<Compra/>} />
      <Route path="/productos" element={<Producto/>} />
      <Route path="/proveedores" element={<Proveedor/>} />
      <Route path="/ventas" element={<Venta/>} />
      <Route path="/dashboard" element={<DashboardV2/>} />
      <Route path="/registrarse" element={<RegisterPage/>} />
      <Route path="/dashboard-version1" element={<Dashboard/>} />
      <Route path="/pedidos" element={<Pedidos/>} />


      <Route
        path="/pos"
        element={
          <PrivateRoute>
            <POSPage />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  const {theme} = useTheme();
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}