import { lazy, Suspense } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material'

import {
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  LockOutlined as LockOutlinedIcon,
  Logout as LogoutIcon,
  PersonOff as PersonOffIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'

import { useAuth } from './context/useAuth'
import MainLayout from './components/common/MainLayout'
import EtapasCosto from './pages/maestros/EtapasCosto'
import TipoCambio from './pages/maestros/TipoCambio'

const Variedades = lazy(() => import('./pages/maestros/Variedades'))
const TiposMaquinaria = lazy(() => import('./pages/maestros/TiposMaquinaria'))
const TiposCentroCosto = lazy(() => import('./pages/maestros/TiposCentroCosto'))
const Empresa = lazy(() => import('./pages/maestros/Empresa'))
const CentroCostos = lazy(() => import('./pages/CentroCostos'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CambiarContrasena = lazy(() => import('./pages/CambiarContrasena'))
const Usuarios = lazy(() => import('./pages/Usuarios'))
const Campanas = lazy(() => import('./pages/Campanas'))
const Comparativos = lazy(() => import('./pages/maestros/Comparativos'))

/*
 * =========================================
 * VISTA DE ESTADO DE CUENTA
 * =========================================
 *
 * Se utiliza para mostrar de manera
 * consistente:
 *
 * - Cuenta pendiente
 * - Cuenta inactiva
 * - Perfil no autorizado
 *
 * Mantiene el estilo visual de SCGCA.
 */
function EstadoCuenta({
  _tipo,
  titulo,
  descripcion,
  detalle,
  icono,
  color = 'primary',
  mostrarCambiarContrasena = false,
}) {
  const navigate = useNavigate()

  const {
    logout,
  } = useAuth()


  const handleCerrarSesion =
    async () => {
      try {
        await logout()
      } catch (error) {
        console.error(
          'Error cerrando sesión:',
          error,
        )
      }
    }


  const handleCambiarContrasena =
    () => {
      navigate(
        '/cambiar-contrasena',
      )
    }


  const configuracionColor = {
    primary: {
      background:
        'rgba(46, 125, 50, 0.10)',
      iconColor:
        'primary.main',
    },

    warning: {
      background:
        'rgba(237, 108, 2, 0.10)',
      iconColor:
        'warning.main',
    },

    error: {
      background:
        'rgba(211, 47, 47, 0.10)',
      iconColor:
        'error.main',
    },

    info: {
      background:
        'rgba(25, 118, 210, 0.10)',
      iconColor:
        'info.main',
    },
  }


  const colorConfig =
    configuracionColor[color] ||
    configuracionColor.primary


  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:
          'background.default',
        p: {
          xs: 2,
          sm: 3,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 540,

          p: {
            xs: 3,
            sm: 4,
          },

          textAlign: 'center',

          border: '1px solid',
          borderColor: 'divider',

          borderRadius: 3,

          boxShadow:
            '0 4px 18px rgba(0, 0, 0, 0.06)',
        }}
      >

        {/* =========================================
            ICONO
        ========================================== */}

        <Box
          sx={{
            width: 76,
            height: 76,

            mx: 'auto',
            mb: 2.5,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            borderRadius: '50%',

            backgroundColor:
              colorConfig.background,

            color:
              colorConfig.iconColor,
          }}
        >
          {icono}
        </Box>


        {/* =========================================
            MARCA
        ========================================== */}

        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            letterSpacing: 0.5,
            mb: 1,
          }}
        >
          SCGCA
        </Typography>


        {/* =========================================
            TÍTULO
        ========================================== */}

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1.5,
          }}
        >
          {titulo}
        </Typography>


        {/* =========================================
            DESCRIPCIÓN
        ========================================== */}

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.6,
            mb: 2.5,
          }}
        >
          {descripcion}
        </Typography>


        {/* =========================================
            DETALLE
        ========================================== */}

        {detalle && (
          <Alert
            severity={
              color === 'error'
                ? 'error'
                : color === 'warning'
                  ? 'warning'
                  : 'info'
            }
            sx={{
              mb: 3,

              textAlign: 'left',

              borderRadius: 1.5,

              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            {detalle}
          </Alert>
        )}


        {/* =========================================
            ACCIONES
        ========================================== */}

        <Box
          sx={{
            display: 'flex',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },

            justifyContent: 'center',

            gap: 1.5,
          }}
        >

          {/* CAMBIAR CONTRASEÑA */}

          {mostrarCambiarContrasena && (
            <Button
              variant="contained"
              startIcon={
                <LockOutlinedIcon />
              }
              onClick={
                handleCambiarContrasena
              }
              sx={{
                minHeight: 42,
                borderRadius: 1.5,
                px: 2.5,
              }}
            >
              Cambiar contraseña
            </Button>
          )}


          {/* CERRAR SESIÓN */}

          <Button
            variant={
              mostrarCambiarContrasena
                ? 'outlined'
                : 'contained'
            }
            color={
              mostrarCambiarContrasena
                ? 'inherit'
                : 'primary'
            }
            startIcon={
              <LogoutIcon />
            }
            onClick={
              handleCerrarSesion
            }
            sx={{
              minHeight: 42,
              borderRadius: 1.5,
              px: 2.5,
            }}
          >
            Cerrar sesión
          </Button>

        </Box>

      </Paper>
    </Box>
  )
}


/*
 * =========================================
 * PROTECCIÓN DE AUTENTICACIÓN
 * =========================================
 *
 * Verifica:
 *
 * 1. Sesión de Supabase Auth.
 * 2. Perfil existente en SCGCA.
 * 3. Usuario ACTIVO.
 *
 * No controla permisos específicos
 * de cada módulo.
 */
function ProtectedRoute({
  children,
}) {
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            'background.default',
        }}
      >
        <Typography
          color="text.secondary"
        >
          Cargando...
        </Typography>
      </Box>
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
      <EstadoCuenta
        tipo="SIN_PERFIL"
        titulo="Acceso no autorizado"
        descripcion="No podemos habilitar tu acceso al sistema porque no se encontró un perfil asociado a tu cuenta."
        detalle="Si consideras que esto es un error, comunícate con el administrador del sistema."
        color="error"
        icono={
          <PersonOffIcon
            sx={{
              fontSize: 38,
            }}
          />
        }
      />
    )
  }


  /*
   * El usuario existe en SCGCA,
   * pero todavía no está habilitado.
   */
  if (!esUsuarioActivo) {

    /*
     * CUENTA PENDIENTE
     */
    if (
      perfil.estado ===
      'PENDIENTE'
    ) {
      return (
        <EstadoCuenta
          tipo="PENDIENTE"
          titulo="Cuenta pendiente de aprobación"
          descripcion="Tu cuenta ha sido registrada correctamente, pero todavía está pendiente de activación."
          detalle="Un administrador debe revisar y activar tu cuenta antes de que puedas acceder a los módulos del sistema."
          color="warning"
          icono={
            <ScheduleIcon
              sx={{
                fontSize: 38,
              }}
            />
          }
          mostrarCambiarContrasena
        />
      )
    }


    /*
     * CUENTA INACTIVA
     */
    if (
      perfil.estado ===
      'INACTIVO'
    ) {
      return (
        <EstadoCuenta
          tipo="INACTIVO"
          titulo="Cuenta inactiva"
          descripcion="Tu cuenta se encuentra actualmente inactiva y no tienes acceso a los módulos del sistema."
          detalle="Comunícate con un administrador para solicitar la revisión o activación de tu cuenta."
          color="error"
          icono={
            <BlockIcon
              sx={{
                fontSize: 38,
              }}
            />
          }
        />
      )
    }


    /*
     * ESTADO NO RECONOCIDO
     */
    return (
      <EstadoCuenta
        tipo="NO_AUTORIZADO"
        titulo="Acceso no autorizado"
        descripcion="Tu cuenta no está habilitada para acceder al sistema."
        detalle="Comunícate con un administrador para verificar el estado de tu cuenta."
        color="error"
        icono={
          <LockOutlinedIcon
            sx={{
              fontSize: 38,
            }}
          />
        }
      />
    )
  }


  /*
   * Usuario autenticado,
   * perfil ACTIVO.
   */
  return children
}


/*
 * =========================================
 * VISTA DE ACCESO RESTRINGIDO
 * =========================================
 *
 * El usuario está autenticado y ACTIVO,
 * pero no tiene el permiso requerido
 * para acceder al módulo.
 */
function AccesoRestringido() {
  const navigate =
    useNavigate()


  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor:
          'background.default',

        p: {
          xs: 2,
          sm: 3,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 540,

          p: {
            xs: 3,
            sm: 4,
          },

          textAlign: 'center',

          border: '1px solid',
          borderColor: 'divider',

          borderRadius: 3,

          boxShadow:
            '0 4px 18px rgba(0, 0, 0, 0.06)',
        }}
      >

        {/* =========================================
            ICONO
        ========================================== */}

        <Box
          sx={{
            width: 76,
            height: 76,

            mx: 'auto',
            mb: 2.5,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            borderRadius: '50%',

            backgroundColor:
              'rgba(237, 108, 2, 0.10)',

            color:
              'warning.main',
          }}
        >
          <LockOutlinedIcon
            sx={{
              fontSize: 38,
            }}
          />
        </Box>


        {/* =========================================
            MARCA
        ========================================== */}

        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            letterSpacing: 0.5,
            mb: 1,
          }}
        >
          SCGCA
        </Typography>


        {/* =========================================
            TÍTULO
        ========================================== */}

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1.5,
          }}
        >
          Acceso restringido
        </Typography>


        {/* =========================================
            DESCRIPCIÓN
        ========================================== */}

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.6,
            mb: 2.5,
          }}
        >
          Tu cuenta está activa,
          pero no cuenta con los
          permisos necesarios para
          acceder a este módulo.
        </Typography>


        {/* =========================================
            ALERTA
        ========================================== */}

        <Alert
          severity="info"
          sx={{
            mb: 3,
            textAlign: 'left',
            borderRadius: 1.5,
          }}
        >
          Si necesitas acceso a este
          módulo, solicita al
          administrador que revise los
          permisos asignados a tu
          cuenta.
        </Alert>


        {/* =========================================
            ACCIÓN
        ========================================== */}

        <Button
          variant="contained"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate('/dashboard')
          }
          sx={{
            minHeight: 42,
            minWidth: 190,
            borderRadius: 1.5,
            px: 2.5,
          }}
        >
          Volver al Dashboard
        </Button>

      </Paper>
    </Box>
  )
}


/*
 * =========================================
 * PROTECCIÓN POR PERMISO
 * =========================================
 *
 * requiredPermissions:
 *
 * ['ADMIN']
 *
 * significa que solamente un usuario
 * cuyo permiso sea ADMIN puede acceder.
 */
function PermissionRoute({
  children,
  requiredPermissions = [],
}) {
  const {
    perfil,
  } = useAuth()


  const permiso =
    perfil?.permiso?.nombre


  const tienePermiso =
    requiredPermissions.length ===
      0 ||
    requiredPermissions.includes(
      permiso,
    )


  if (!tienePermiso) {
    return (
      <AccesoRestringido />
    )
  }


  return children
}


/*
 * =========================================
 * APP
 * =========================================
 */
function App() {
  const {
    logout,
  } = useAuth()


  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.default',
          }}
        >
          <Typography color="text.secondary">
            Cargando página...
          </Typography>
        </Box>
      }
    >
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
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/empresas"
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
                <Empresa />
              </MainLayout>
            </PermissionRoute>
          </ProtectedRoute>
        }
      />


      {/* =========================================
          VARIEDADES
          SOLO ADMIN
      ========================================== */}

      <Route
        path="/variedades"
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
    </Suspense>
  )
}


export default App