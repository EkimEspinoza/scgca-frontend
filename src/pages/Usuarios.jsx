import {
  Alert,
  Box,
  Button,
  Snackbar,
  Typography,
} from '@mui/material'

import {
  Add as AddIcon,
  People as PeopleIcon,
} from '@mui/icons-material'

import { useUsuarios } from '../hooks/useUsuarios'

import UsuariosFilters from '../components/usuarios/UsuariosFilters'
import UsuarioTable from '../components/usuarios/UsuarioTable'
import UsuarioForm from '../components/usuarios/UsuarioForm'

function Usuarios() {
  const {
    usuariosPaginados,
    usuariosFiltrados,

    permisos,
    empresas,

    loading,
    loadingMaestros,
    guardando,
    error,

    filtros,
    pagina,
    filasPorPagina,

    modalAbierto,
    usuarioEditar,

    notificacion,

    handleFiltroChange,
    handleLimpiarFiltros,

    handleCambiarPagina,
    handleCambiarFilasPorPagina,

    handleNuevo,
    handleEditar,
    handleCerrarModal,
    handleGuardar,

    cerrarNotificacion,
  } = useUsuarios()

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          justifyContent:
            'space-between',
          gap: 2,
          mb: 1.5,
          flexShrink: 0,
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <PeopleIcon
              color="primary"
              sx={{
                fontSize: 28,
              }}
            />

            <Typography
              variant="h5"
              fontWeight={700}
            >
              Usuarios
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
            }}
          >
            Administración de usuarios,
            permisos y acceso a empresas.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNuevo}
          disabled={
            loading ||
            loadingMaestros
          }
          sx={{
            minWidth: 190,
            height: 44,
            borderRadius: 1,
            flexShrink: 0,
          }}
        >
          Nuevo usuario
        </Button>
      </Box>

      {/* Filtros */}
      <Box
        sx={{
          mb: 1,
          flexShrink: 0,
        }}
      >
        <UsuariosFilters
          filtros={filtros}
          permisos={permisos}
          empresas={empresas}
          loading={
            loading ||
            loadingMaestros
          }
          onFiltroChange={
            handleFiltroChange
          }
          onLimpiarFiltros={
            handleLimpiarFiltros
          }
        />
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 1,
            flexShrink: 0,
            borderRadius: 1,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Tabla */}
      <Box
        sx={{
          flex: '1 1 0%',
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <UsuarioTable
          usuarios={
            usuariosPaginados
          }
          loading={loading}
          pagina={pagina}
          filasPorPagina={
            filasPorPagina
          }
          total={
            usuariosFiltrados.length
          }
          onCambiarPagina={
            handleCambiarPagina
          }
          onCambiarFilasPorPagina={
            handleCambiarFilasPorPagina
          }
          onEditar={
            handleEditar
          }
        />
      </Box>

      {/* Formulario */}
      <UsuarioForm
        open={modalAbierto}
        usuario={usuarioEditar}
        permisos={permisos}
        empresas={empresas}
        guardando={guardando}
        onClose={
          handleCerrarModal
        }
        onSave={handleGuardar}
      />

      {/* Notificaciones */}
      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={
          cerrarNotificacion
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={
            cerrarNotificacion
          }
          severity={
            notificacion.severity
          }
          variant="filled"
          sx={{
            width: '100%',
          }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Usuarios