// Compone la pantalla Jornal y conecta sus componentes.
import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import JornalFilters from '../../components/jornal/JornalFilters'
import JornalForm from '../../components/jornal/JornalForm'
import JornalTable from '../../components/jornal/JornalTable'
import { useJornal } from '../../hooks/useJornal'

export default function Jornal() {
  const jornal = useJornal()

  return (
    <CompactModuleTheme>
      <Box className="app-module-flow" sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
        <JornalFilters loading={jornal.loading} totalRegistros={jornal.totalRegistros} busqueda={jornal.busqueda} filtroEstado={jornal.filtroEstado} error={jornal.error} onExportar={jornal.handleExportarExcel} onNuevo={jornal.handleNuevo} onCambioBusqueda={jornal.handleCambioBusqueda} onCambioEstado={jornal.handleCambioFiltroEstado} onCerrarError={jornal.handleCerrarError} />
        <JornalTable loading={jornal.loading} periodos={jornal.periodosPaginados} tiposJornal={jornal.tiposJornal} totalRegistros={jornal.totalRegistros} busqueda={jornal.busqueda} filtroEstado={jornal.filtroEstado} pagina={jornal.pagina} registrosPorPagina={jornal.registrosPorPagina} cambiandoEstado={jornal.cambiandoEstado} periodoCambioEstado={jornal.periodoCambioEstado} onEditar={jornal.handleEditar} onSolicitarCambioEstado={jornal.handleSolicitarCambioEstado} onChangePagina={jornal.handleChangePagina} onChangeRegistrosPorPagina={jornal.handleChangeRegistrosPorPagina} onCerrarConfirmacionEstado={jornal.handleCerrarConfirmacionEstado} onConfirmarCambioEstado={jornal.handleConfirmarCambioEstado} />
        <JornalForm open={jornal.dialogOpen} modoEdicion={jornal.modoEdicion} formulario={jornal.formulario} tiposJornal={jornal.tiposFormulario} erroresFormulario={jornal.erroresFormulario} guardando={jornal.guardando} onClose={jornal.handleCerrarDialog} onChange={jornal.handleChangeFormulario} onSubmit={jornal.handleGuardar} />
        <Snackbar open={Boolean(jornal.mensaje)} autoHideDuration={3500} onClose={jornal.handleCerrarMensaje} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={jornal.handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>{jornal.mensaje}</Alert>
        </Snackbar>
        <Snackbar open={Boolean(jornal.error)} autoHideDuration={5000} onClose={jornal.handleCerrarError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={jornal.handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>{jornal.error}</Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}
