import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { useAuth } from './context/AuthContext'

import CentroCostos from './pages/CentroCostos'
import Usuarios from './pages/Usuarios'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

import MainLayout from './components/common/MainLayout'


function ProtectedRoute({ children }) {
  const {
    user,
    perfil,
    loading,
    esUsuarioActivo,
  } = useAuth()


  /*
   * Mientras se determina la sesión
   * y se carga el perfil.
   */
  if (loading) {
    return (
      <h1>
        Cargando...
      </h1>
    )
  }


  /*
   * No existe sesión de Supabase Auth.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }


  /*
   * Existe sesión en Supabase Auth,
   * pero no existe perfil en SCGCA.
   */
  if (!perfil) {
    return (
      <div>
        <h1>SCGCA</h1>

        <h2>
          Acceso no autorizado
        </h2>

        <p>
          No se encontró un perfil
          asociado a tu usuario.
        </p>
      </div>
    )
  }


  /*
   * El usuario existe en SCGCA,
   * pero todavía no está habilitado.
   */
  if (!esUsuarioActivo) {
    if (
      perfil.estado ===
      'PENDIENTE'
    ) {
      return (
        <div>
          <h1>SCGCA</h1>

          <h2>
            Cuenta pendiente de aprobación
          </h2>

          <p>
            Tu cuenta ha sido
            registrada correctamente,
            pero todavía no ha sido
            activada por un administrador.
          </p>
        </div>
      )
    }


    if (
      perfil.estado ===
      'INACTIVO'
    ) {
      return (
        <div>
          <h1>SCGCA</h1>

          <h2>
            Cuenta inactiva
          </h2>

          <p>
            Tu cuenta se encuentra
            actualmente inactiva.
            Comunícate con un
            administrador.
          </p>
        </div>
      )
    }


    return (
      <div>
        <h1>SCGCA</h1>

        <h2>
          Acceso no autorizado
        </h2>

        <p>
          Tu cuenta no está habilitada
          para acceder al sistema.
        </p>
      </div>
    )
  }


  /*
   * Usuario autenticado,
   * perfil ACTIVO y con permiso.
   */
  return children
}


function App() {
  const {
    logout,
  } = useAuth()


  return (
    <Routes>

      {/* =========================================
          LOGIN
      ========================================== */}
      <Route
        path="/login"
        element={<Login />}
      />


      {/* =========================================
          DASHBOARD
      ========================================== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout
              onLogout={logout}
            >
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================================
          CENTRO DE COSTOS
      ========================================== */}
      <Route
        path="/centro-costos"
        element={
          <ProtectedRoute>
            <MainLayout
              onLogout={logout}
            >
              <CentroCostos />
            </MainLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================================
          USUARIOS
      ========================================== */}
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <MainLayout
              onLogout={logout}
            >
              <Usuarios />
            </MainLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================================
          RUTA PRINCIPAL
      ========================================== */}
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* =========================================
          RUTA NO ENCONTRADA
      ========================================== */}
      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  )
}


export default App