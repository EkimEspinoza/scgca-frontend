import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import ComparativosFilters from '../../components/comparativos/ComparativosFilters'
import ComparativosForm from '../../components/comparativos/ComparativosForm'
import ComparativosTable from '../../components/comparativos/ComparativosTable'
import { useComparativos } from '../../hooks/useComparativos'

function Comparativos() {
  const comparativos = useComparativos()

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
        <ComparativosFilters
          loading={comparativos.loading}
          totalRegistros={comparativos.totalRegistros}
          busqueda={comparativos.busqueda}
          filtroEstado={comparativos.filtroEstado}
          error={comparativos.error}
          onExportar={comparativos.handleExportarExcel}
          onNuevo={comparativos.handleNuevoComparativo}
          onCambioBusqueda={comparativos.handleCambioBusqueda}
          onCambioEstado={comparativos.handleCambioFiltroEstado}
          onCerrarError={comparativos.handleCerrarError}
        />

        <ComparativosTable
          loading={comparativos.loading}
          comparativosPaginados={comparativos.comparativosPaginados}
          totalRegistros={comparativos.totalRegistros}
          busqueda={comparativos.busqueda}
          filtroEstado={comparativos.filtroEstado}
          pagina={comparativos.pagina}
          registrosPorPagina={comparativos.registrosPorPagina}
          cambiandoEstado={comparativos.cambiandoEstado}
          comparativoCambioEstado={comparativos.comparativoCambioEstado}
          onEditar={comparativos.handleEditarComparativo}
          onSolicitarCambioEstado={comparativos.handleSolicitarCambioEstado}
          onChangePagina={comparativos.handleChangePagina}
          onChangeRegistrosPorPagina={comparativos.handleChangeRegistrosPorPagina}
          onCerrarConfirmacionEstado={comparativos.handleCerrarConfirmacionEstado}
          onConfirmarCambioEstado={comparativos.handleConfirmarCambioEstado}
        />

        <ComparativosForm
          open={comparativos.dialogOpen}
          modoEdicion={comparativos.modoEdicion}
          formulario={comparativos.formulario}
          erroresFormulario={comparativos.erroresFormulario}
          guardando={comparativos.guardando}
          onClose={comparativos.handleCerrarDialog}
          onChange={comparativos.handleChangeFormulario}
          onSubmit={comparativos.handleGuardar}
        />

        <Snackbar
          open={Boolean(comparativos.mensaje)}
          autoHideDuration={3500}
          onClose={comparativos.handleCerrarMensaje}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={comparativos.handleCerrarMensaje}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {comparativos.mensaje}
          </Alert>
        </Snackbar>

        <Snackbar
          open={Boolean(comparativos.error)}
          autoHideDuration={5000}
          onClose={comparativos.handleCerrarError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={comparativos.handleCerrarError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {comparativos.error}
          </Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}

export default Comparativos
