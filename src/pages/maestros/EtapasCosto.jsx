import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import EtapasCostoFilters from '../../components/etapaCosto/EtapasCostoFilters'
import EtapasCostoForm from '../../components/etapaCosto/EtapasCostoForm'
import EtapasCostoTable from '../../components/etapaCosto/EtapasCostoTable'
import { useEtapasCosto } from '../../hooks/useEtapasCosto'

function EtapasCosto() {
  const etapas = useEtapasCosto()

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
        <EtapasCostoFilters
          loading={etapas.loading}
          totalRegistros={etapas.totalRegistros}
          busqueda={etapas.busqueda}
          filtroEstado={etapas.filtroEstado}
          error={etapas.error}
          onExportar={etapas.handleExportarExcel}
          onNuevaEtapa={etapas.handleNuevaEtapa}
          onCambioBusqueda={etapas.handleCambioBusqueda}
          onCambioEstado={etapas.handleCambioFiltroEstado}
          onCerrarError={etapas.handleCerrarError}
        />

        <EtapasCostoTable
          loading={etapas.loading}
          etapasPaginadas={etapas.etapasPaginadas}
          totalRegistros={etapas.totalRegistros}
          busqueda={etapas.busqueda}
          filtroEstado={etapas.filtroEstado}
          pagina={etapas.pagina}
          registrosPorPagina={etapas.registrosPorPagina}
          cambiandoEstado={etapas.cambiandoEstado}
          etapaCambioEstado={etapas.etapaCambioEstado}
          onEditar={etapas.handleEditarEtapa}
          onSolicitarCambioEstado={etapas.handleSolicitarCambioEstado}
          onChangePagina={etapas.handleChangePagina}
          onChangeRegistrosPorPagina={etapas.handleChangeRegistrosPorPagina}
          onCerrarConfirmacionEstado={etapas.handleCerrarConfirmacionEstado}
          onConfirmarCambioEstado={etapas.handleConfirmarCambioEstado}
        />

        <EtapasCostoForm
          open={etapas.dialogOpen}
          modoEdicion={etapas.modoEdicion}
          formulario={etapas.formulario}
          erroresFormulario={etapas.erroresFormulario}
          guardando={etapas.guardando}
          onClose={etapas.handleCerrarDialog}
          onChange={etapas.handleChangeFormulario}
          onSubmit={etapas.handleGuardar}
        />

        <Snackbar
          open={Boolean(etapas.mensaje)}
          autoHideDuration={3500}
          onClose={etapas.handleCerrarMensaje}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={etapas.handleCerrarMensaje}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {etapas.mensaje}
          </Alert>
        </Snackbar>

        <Snackbar
          open={Boolean(etapas.error)}
          autoHideDuration={5000}
          onClose={etapas.handleCerrarError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={etapas.handleCerrarError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {etapas.error}
          </Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}

export default EtapasCosto
