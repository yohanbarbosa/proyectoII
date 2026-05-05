import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import type { ReactNode } from 'react'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/Register'
import POSPage from './pages/sales/POSPage'
import StorePage from './pages/store/StorePage'

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
      <Route path="/register" element={<RegisterPage />} />

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
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}