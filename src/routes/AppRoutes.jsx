// Define las rutas de navegación de la aplicación.
import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/common/MainLayout'
import { PermissionRoute, ProtectedRoute } from '../components/auth/RouteGuards'
import { useAuth } from '../context/useAuth'
const EtapasCosto = lazy(() => import('../pages/maestros/EtapasCosto'))
const TipoCambio = lazy(() => import('../pages/maestros/TipoCambio'))
const Variedades = lazy(() => import('../pages/maestros/Variedades'))
const TiposMaquinaria = lazy(() => import('../pages/maestros/TiposMaquinaria'))
const TiposCentroCosto = lazy(() => import('../pages/maestros/TiposCentroCosto'))
const Empresa = lazy(() => import('../pages/maestros/Empresa'))
const CentroCostos = lazy(() => import('../pages/maestros/CentroCostos'))
const Login = lazy(() => import('../pages/Login'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const CambiarContrasena = lazy(() => import('../pages/CambiarContrasena'))
const Usuarios = lazy(() => import('../pages/accesos/Usuarios'))
const CatalogoModulos = lazy(() => import('../pages/accesos/CatalogoModulos'))
const PermisosPorModulo = lazy(() => import('../pages/accesos/PermisosPorModulo'))
const Campanas = lazy(() => import('../pages/maestros/Campanas'))
const Comparativos = lazy(() => import('../pages/maestros/Comparativos'))
const Distribucion = lazy(() => import('../pages/procesos/Distribucion'))
const Tareo = lazy(() => import('../pages/tareo/Tareo'))
const GrupoLabor = lazy(() => import('../pages/manoObra/GrupoLabor'))
const LaborFinal = lazy(() => import('../pages/manoObra/LaborFinal'))
const Labor = lazy(() => import('../pages/manoObra/Labor'))
const Jornal = lazy(() => import('../pages/manoObra/Jornal'))
const TipoJornal = lazy(() => import('../pages/manoObra/TipoJornal'))
const TipoCuenta = lazy(() => import('../pages/servicios/TipoCuenta'))
const CuentaComparativo = lazy(() => import('../pages/servicios/CuentaComparativo'))
const Cuenta = lazy(() => import('../pages/servicios/Cuenta'))
const MovMO = lazy(() => import('../pages/manoObra/MovMO'))

export default function AppRoutes() {
  const { logout } = useAuth()
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
          CAMBIAR CONTRASEÑA

          Esta ruta NO utiliza ProtectedRoute.

          Motivo:
          - Un usuario ACTIVO puede cambiar
            su contraseña.
          - Un usuario recién invitado puede
            establecer su contraseña aunque
            esté PENDIENTE.
          - La propia página verifica que
            exista una sesión válida de
            Supabase Auth.
      ========================================== */}

      <Route
        path="/cambiar-contrasena"
        element={
          <CambiarContrasena />
        }
      />


      {/* =========================================
          DASHBOARD
          ADMIN / ALMACEN / CONSULTA
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
          EMPRESAS
          ADMIN / QUERY / WRITER ASIGNADO
      ========================================== */}

      <Route
        path="/distribucion"
        element={
          <ProtectedRoute>
            <PermissionRoute moduleCode="DISTRIBUCION" requiredLevel="QUERY">
              <MainLayout onLogout={logout}>
                <Distribucion />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mov-tareo"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']} moduleCode="MOV_TAREO" requiredLevel="QUERY">
              <MainLayout onLogout={logout}>
                <Tareo />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mov-mo"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <MovMO />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresas"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']} moduleCode="EMPRESAS" requiredLevel="QUERY">
              <MainLayout
                onLogout={logout}
              >
                <Empresa />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />


      {/* =========================================
          VARIEDADES
          ACCESO POR MÓDULO
      ========================================== */}

      <Route
        path="/variedades"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']} moduleCode="VARIEDADES" requiredLevel="QUERY">
              <MainLayout
                onLogout={logout}
              >
                <Variedades/>
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />

       {/* =========================================
          TIPO DE CENTRO DE COSTOS
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/tipos-centro-costo"
        element={
          <ProtectedRoute>
            <PermissionRoute
              requiredPermissions={[
                'ADMIN',
              ]}
              moduleCode="TIPOS_CENTRO_COSTO"
              requiredLevel="QUERY"
            >
              <MainLayout
                onLogout={logout}
              >
                <TiposCentroCosto />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
       {/* =========================================
          TIPO DE MAQUINARIA
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/tipos-maquinaria"
        element={
          <ProtectedRoute>
            <PermissionRoute
              requiredPermissions={[
                'ADMIN',
              ]}
              moduleCode="TIPOS_MAQUINARIA"
              requiredLevel="QUERY"
            >
              <MainLayout
                onLogout={logout}
              >
                <TiposMaquinaria />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />

{/* =========================================
          ETAPA COSTO
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/etapa-costo"
        element={
          <ProtectedRoute>
            <PermissionRoute
              requiredPermissions={[
                'ADMIN',
              ]}
              moduleCode="ETAPAS_COSTO"
              requiredLevel="QUERY"
            >
              <MainLayout
                onLogout={logout}
              >
                <EtapasCosto />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/grupo-labor"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <GrupoLabor />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/labor-final"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <LaborFinal />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tipo-jornal"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <TipoJornal />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tipo-cuenta"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <TipoCuenta />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta-comparativo"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <CuentaComparativo />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <Cuenta />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jornal"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <Jornal />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/labor"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <Labor />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
      {/* =========================================
          ETAPA COSTO
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/tipo-cambio"
        element={
          <ProtectedRoute>
            <PermissionRoute
              requiredPermissions={[
                'ADMIN',
              ]}
              moduleCode="TIPO_CAMBIO"
              requiredLevel="QUERY"
            >
              <MainLayout
                onLogout={logout}
              >
                <TipoCambio />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />
             {/* =========================================
          CAMPAÑAS
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/campanas"
        element={
          <ProtectedRoute>
            <PermissionRoute
              requiredPermissions={[
                'ADMIN',
              ]}
              moduleCode="CAMPANAS"
              requiredLevel="QUERY"
            >
              <MainLayout
                onLogout={logout}
              >
                <Campanas />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />

{/* =========================================
          COMPARATIVO
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/comparativos"
        element={
          <ProtectedRoute>
            <PermissionRoute
              requiredPermissions={[
                'ADMIN',
              ]}
              moduleCode="COMPARATIVOS"
              requiredLevel="QUERY"
            >
              <MainLayout
                onLogout={logout}
              >
                <Comparativos />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />

      {/* =========================================
          CENTRO DE COSTOS
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/centro-costos"
        element={
          <ProtectedRoute>
            <PermissionRoute
              requiredPermissions={[
                'ADMIN',
              ]}
              moduleCode="CENTRO_COSTOS"
              requiredLevel="QUERY"
            >
              <MainLayout
                onLogout={logout}
              >
                <CentroCostos />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />


      {/* =========================================
          USUARIOS
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <PermissionRoute
              requiredPermissions={[
                'ADMIN',
              ]}
            >
              <MainLayout
                onLogout={logout}
              >
                <Usuarios />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/modulos"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <CatalogoModulos />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/permisos"
        element={
          <ProtectedRoute>
            <PermissionRoute requiredPermissions={['ADMIN']}>
              <MainLayout onLogout={logout}>
                <PermisosPorModulo />
              </MainLayout>
            </PermissionRoute>
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
