import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import TipoJornalFilters from '../../components/tipoJornal/TipoJornalFilters'
import TipoJornalForm from '../../components/tipoJornal/TipoJornalForm'
import TipoJornalTable from '../../components/tipoJornal/TipoJornalTable'
import { useTipoJornal } from '../../hooks/useTipoJornal'

export default function TipoJornal() {
  const tipos = useTipoJornal()

  return <CompactModuleTheme>
    <Box className="app-module-flow" sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
      <TipoJornalFilters
        loading={tipos.loading}
        totalRegistros={tipos.totalRegistros}
        busqueda={tipos.busqueda}
        filtroEstado={tipos.filtroEstado}
        error={tipos.error}
        onExportar={tipos.handleExportarExcel}
        onNuevo={tipos.handleNuevo}
        onCambioBusqueda={tipos.handleCambioBusqueda}
        onCambioEstado={tipos.handleCambioFiltroEstado}
        onCerrarError={tipos.handleCerrarError}
      />
      <TipoJornalTable
        loading={tipos.loading}
        tipos={tipos.tiposPaginados}
        totalRegistros={tipos.totalRegistros}
        busqueda={tipos.busqueda}
        filtroEstado={tipos.filtroEstado}
        pagina={tipos.pagina}
        registrosPorPagina={tipos.registrosPorPagina}
        cambiandoEstado={tipos.cambiandoEstado}
        tipoCambioEstado={tipos.tipoCambioEstado}
        onEditar={tipos.handleEditar}
        onSolicitarCambioEstado={tipos.handleSolicitarCambioEstado}
        onChangePagina={tipos.handleChangePagina}
        onChangeRegistrosPorPagina={tipos.handleChangeRegistrosPorPagina}
        onCerrarConfirmacionEstado={tipos.handleCerrarConfirmacionEstado}
        onConfirmarCambioEstado={tipos.handleConfirmarCambioEstado}
      />
      <TipoJornalForm
        open={tipos.dialogOpen}
        modoEdicion={tipos.modoEdicion}
        formulario={tipos.formulario}
        erroresFormulario={tipos.erroresFormulario}
        guardando={tipos.guardando}
        onClose={tipos.handleCerrarDialog}
        onChange={tipos.handleChangeFormulario}
        onSubmit={tipos.handleGuardar}
      />
      <Snackbar open={Boolean(tipos.mensaje)} autoHideDuration={3500} onClose={tipos.handleCerrarMensaje} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={tipos.handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>{tipos.mensaje}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(tipos.error)} autoHideDuration={5000} onClose={tipos.handleCerrarError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={tipos.handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>{tipos.error}</Alert>
      </Snackbar>
    </Box>
  </CompactModuleTheme>
}
