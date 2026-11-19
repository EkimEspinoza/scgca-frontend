import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import LaborFinalFilters from '../../components/laborFinal/LaborFinalFilters'
import LaborFinalForm from '../../components/laborFinal/LaborFinalForm'
import LaborFinalTable from '../../components/laborFinal/LaborFinalTable'
import { useLaborFinal } from '../../hooks/useLaborFinal'

export default function LaborFinal() {
  const labores = useLaborFinal()

  return (
    <CompactModuleTheme>
      <Box className="app-module-flow" sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
        <LaborFinalFilters
          loading={labores.loading}
          totalRegistros={labores.totalRegistros}
          busqueda={labores.busqueda}
          filtroEstado={labores.filtroEstado}
          error={labores.error}
          onExportar={labores.handleExportarExcel}
          onNuevo={labores.handleNuevo}
          onCambioBusqueda={labores.handleCambioBusqueda}
          onCambioEstado={labores.handleCambioFiltroEstado}
          onCerrarError={labores.handleCerrarError}
        />
        <LaborFinalTable
          loading={labores.loading}
          labores={labores.laboresPaginadas}
          totalRegistros={labores.totalRegistros}
          busqueda={labores.busqueda}
          filtroEstado={labores.filtroEstado}
          pagina={labores.pagina}
          registrosPorPagina={labores.registrosPorPagina}
          cambiandoEstado={labores.cambiandoEstado}
          laborCambioEstado={labores.laborCambioEstado}
          onEditar={labores.handleEditar}
          onSolicitarCambioEstado={labores.handleSolicitarCambioEstado}
          onChangePagina={labores.handleChangePagina}
          onChangeRegistrosPorPagina={labores.handleChangeRegistrosPorPagina}
          onCerrarConfirmacionEstado={labores.handleCerrarConfirmacionEstado}
          onConfirmarCambioEstado={labores.handleConfirmarCambioEstado}
        />
        <LaborFinalForm
          open={labores.dialogOpen}
          modoEdicion={labores.modoEdicion}
          formulario={labores.formulario}
          gruposLabor={labores.gruposLabor}
          tiposJornal={labores.tiposJornal}
          erroresFormulario={labores.erroresFormulario}
          guardando={labores.guardando}
          onClose={labores.handleCerrarDialog}
          onChange={labores.handleChangeFormulario}
          onSubmit={labores.handleGuardar}
        />
        <Snackbar open={Boolean(labores.mensaje)} autoHideDuration={3500} onClose={labores.handleCerrarMensaje} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={labores.handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>{labores.mensaje}</Alert>
        </Snackbar>
        <Snackbar open={Boolean(labores.error)} autoHideDuration={5000} onClose={labores.handleCerrarError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={labores.handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>{labores.error}</Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}
