import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import TiposCentroCostoFilters from '../../components/tiposCentroCosto/TiposCentroCostoFilters'
import TiposCentroCostoForm from '../../components/tiposCentroCosto/TiposCentroCostoForm'
import TiposCentroCostoTable from '../../components/tiposCentroCosto/TiposCentroCostoTable'
import { useTiposCentroCosto } from '../../hooks/useTiposCentroCosto'

function TiposCentroCosto() {
  const tiposCentroCosto = useTiposCentroCosto()

  return (
    <CompactModuleTheme>
      <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
        <TiposCentroCostoFilters
          loading={tiposCentroCosto.loading}
          totalRegistros={tiposCentroCosto.totalRegistros}
          busqueda={tiposCentroCosto.busqueda}
          filtroEstado={tiposCentroCosto.filtroEstado}
          error={tiposCentroCosto.error}
          onExportar={tiposCentroCosto.handleExportarExcel}
          onNuevo={tiposCentroCosto.handleNuevoTipoCentroCosto}
          onCambioBusqueda={tiposCentroCosto.handleCambioBusqueda}
          onCambioEstado={tiposCentroCosto.handleCambioFiltroEstado}
          onCerrarError={tiposCentroCosto.handleCerrarError}
        />
        <TiposCentroCostoTable
          loading={tiposCentroCosto.loading}
          tiposPaginados={tiposCentroCosto.tiposPaginados}
          totalRegistros={tiposCentroCosto.totalRegistros}
          busqueda={tiposCentroCosto.busqueda}
          filtroEstado={tiposCentroCosto.filtroEstado}
          pagina={tiposCentroCosto.pagina}
          registrosPorPagina={tiposCentroCosto.registrosPorPagina}
          cambiandoEstado={tiposCentroCosto.cambiandoEstado}
          tipoCambioEstado={tiposCentroCosto.tipoCambioEstado}
          onEditar={tiposCentroCosto.handleEditar}
          onSolicitarCambioEstado={tiposCentroCosto.handleSolicitarCambioEstado}
          onChangePagina={tiposCentroCosto.handleChangePagina}
          onChangeRegistrosPorPagina={tiposCentroCosto.handleChangeRegistrosPorPagina}
          onCerrarConfirmacionEstado={tiposCentroCosto.handleCerrarConfirmacionEstado}
          onConfirmarCambioEstado={tiposCentroCosto.handleConfirmarCambioEstado}
        />
        <TiposCentroCostoForm
          open={tiposCentroCosto.dialogOpen}
          modoEdicion={tiposCentroCosto.modoEdicion}
          formulario={tiposCentroCosto.formulario}
          erroresFormulario={tiposCentroCosto.erroresFormulario}
          guardando={tiposCentroCosto.guardando}
          onClose={tiposCentroCosto.handleCerrarDialog}
          onChange={tiposCentroCosto.handleChangeFormulario}
          onSubmit={tiposCentroCosto.handleGuardar}
        />
        <Snackbar open={Boolean(tiposCentroCosto.mensaje)} autoHideDuration={3500} onClose={tiposCentroCosto.handleCerrarMensaje} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={tiposCentroCosto.handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>{tiposCentroCosto.mensaje}</Alert>
        </Snackbar>
        <Snackbar open={Boolean(tiposCentroCosto.error)} autoHideDuration={5000} onClose={tiposCentroCosto.handleCerrarError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={tiposCentroCosto.handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>{tiposCentroCosto.error}</Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}

export default TiposCentroCosto
