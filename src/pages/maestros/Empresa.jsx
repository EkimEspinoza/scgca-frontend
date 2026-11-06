import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import EmpresaFilters from '../../components/empresa/EmpresaFilters'
import EmpresaForm from '../../components/empresa/EmpresaForm'
import EmpresaTable from '../../components/empresa/EmpresaTable'
import { useAuth } from '../../context/useAuth'
import { useEmpresa } from '../../hooks/useEmpresa'

function Empresas() {
  const { perfil } = useAuth()
  const puedeAdministrar = perfil?.permiso?.nombre === 'ADMIN'
  const empresas = useEmpresa()

  return (
    <CompactModuleTheme>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        <EmpresaFilters
          loading={empresas.loading}
          puedeAdministrar={puedeAdministrar}
          totalRegistros={empresas.totalRegistros}
          busqueda={empresas.busqueda}
          filtroEstado={empresas.filtroEstado}
          error={empresas.error}
          onExportar={empresas.handleExportarExcel}
          onNuevaEmpresa={empresas.handleNuevaEmpresa}
          onCambioBusqueda={empresas.handleCambioBusqueda}
          onCambioEstado={empresas.handleCambioFiltroEstado}
          onCerrarError={empresas.handleCerrarError}
        />

        <EmpresaTable
          loading={empresas.loading}
          puedeAdministrar={puedeAdministrar}
          empresasPaginados={empresas.empresasPaginados}
          totalRegistros={empresas.totalRegistros}
          busqueda={empresas.busqueda}
          filtroEstado={empresas.filtroEstado}
          pagina={empresas.pagina}
          registrosPorPagina={empresas.registrosPorPagina}
          cambiandoEstado={empresas.cambiandoEstado}
          empresaCambioEstado={empresas.empresaCambioEstado}
          onEditar={empresas.handleEditarEmpresa}
          onSolicitarCambioEstado={empresas.handleSolicitarCambioEstado}
          onChangePagina={empresas.handleChangePagina}
          onChangeRegistrosPorPagina={empresas.handleChangeRegistrosPorPagina}
          onCerrarConfirmacionEstado={empresas.handleCerrarConfirmacionEstado}
          onConfirmarCambioEstado={empresas.handleConfirmarCambioEstado}
        />

        <EmpresaForm
          open={empresas.dialogOpen}
          modoEdicion={empresas.modoEdicion}
          formulario={empresas.formulario}
          erroresFormulario={empresas.erroresFormulario}
          guardando={empresas.guardando}
          onClose={empresas.handleCerrarDialog}
          onChange={empresas.handleChangeFormulario}
          onSubmit={empresas.handleGuardar}
        />

        <Snackbar
          open={Boolean(empresas.mensaje)}
          autoHideDuration={3500}
          onClose={empresas.handleCerrarMensaje}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={empresas.handleCerrarMensaje}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {empresas.mensaje}
          </Alert>
        </Snackbar>

        <Snackbar
          open={Boolean(empresas.error)}
          autoHideDuration={5000}
          onClose={empresas.handleCerrarError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={empresas.handleCerrarError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {empresas.error}
          </Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}

export default Empresas
