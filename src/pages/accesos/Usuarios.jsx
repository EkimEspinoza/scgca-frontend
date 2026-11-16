import {
  Alert,
  Box,
  Button,
  Snackbar,
} from '@mui/material'

import {
  Add as AddIcon,
  People as PeopleIcon,
} from '@mui/icons-material'

import { useUsuarios } from '../../hooks/useUsuarios'

import UsuariosFilters from '../../components/usuarios/UsuariosFilters'
import UsuarioTable from '../../components/usuarios/UsuarioTable'
import UsuarioForm from '../../components/usuarios/UsuarioForm'
import PageHeader from '../../components/common/PageHeader'

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
      className="app-module-flow"
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
          flexShrink: 0,
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >
        <PageHeader
          icon={<PeopleIcon />}
          title="Usuarios"
          description="Administración de usuarios, permisos y acceso a empresas."
          sx={{ mb: 0, flex: 1 }}
        />

      </Box>

      {/* Filtros */}
      <Box
        sx={{
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
          actions={<Button className="app-create-action-button" variant="contained" startIcon={<AddIcon />} onClick={handleNuevo} disabled={loading || loadingMaestros}>Nuevo usuario</Button>}
        />
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
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
