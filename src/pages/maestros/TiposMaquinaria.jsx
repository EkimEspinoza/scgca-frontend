import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import TiposMaquinariaFilters from '../../components/tiposMaquinaria/TiposMaquinariaFilters'
import TiposMaquinariaForm from '../../components/tiposMaquinaria/TiposMaquinariaForm'
import TiposMaquinariaTable from '../../components/tiposMaquinaria/TiposMaquinariaTable'
import { useTiposMaquinaria } from '../../hooks/useTiposMaquinaria'

function TiposMaquinaria() {
  const tiposMaquinaria = useTiposMaquinaria()

  return (
    <CompactModuleTheme>
      <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
        <TiposMaquinariaFilters
          loading={tiposMaquinaria.loading}
          totalRegistros={tiposMaquinaria.totalRegistros}
          busqueda={tiposMaquinaria.busqueda}
          filtroEstado={tiposMaquinaria.filtroEstado}
          error={tiposMaquinaria.error}
          onExportar={tiposMaquinaria.handleExportarExcel}
          onNuevo={tiposMaquinaria.handleNuevoTipo}
          onCambioBusqueda={tiposMaquinaria.handleCambioBusqueda}
          onCambioEstado={tiposMaquinaria.handleCambioFiltroEstado}
          onCerrarError={tiposMaquinaria.handleCerrarError}
        />
        <TiposMaquinariaTable
          loading={tiposMaquinaria.loading}
          tiposMaquinariaPaginados={tiposMaquinaria.tiposMaquinariaPaginados}
          totalRegistros={tiposMaquinaria.totalRegistros}
          busqueda={tiposMaquinaria.busqueda}
          filtroEstado={tiposMaquinaria.filtroEstado}
          pagina={tiposMaquinaria.pagina}
          registrosPorPagina={tiposMaquinaria.registrosPorPagina}
          cambiandoEstado={tiposMaquinaria.cambiandoEstado}
          tipoCambioEstado={tiposMaquinaria.tipoCambioEstado}
          onEditar={tiposMaquinaria.handleEditarTipo}
          onSolicitarCambioEstado={tiposMaquinaria.handleSolicitarCambioEstado}
          onChangePagina={tiposMaquinaria.handleChangePagina}
          onChangeRegistrosPorPagina={tiposMaquinaria.handleChangeRegistrosPorPagina}
          onCerrarConfirmacionEstado={tiposMaquinaria.handleCerrarConfirmacionEstado}
          onConfirmarCambioEstado={tiposMaquinaria.handleConfirmarCambioEstado}
        />
        <TiposMaquinariaForm
          open={tiposMaquinaria.dialogOpen}
          modoEdicion={tiposMaquinaria.modoEdicion}
          formulario={tiposMaquinaria.formulario}
          erroresFormulario={tiposMaquinaria.erroresFormulario}
          guardando={tiposMaquinaria.guardando}
          onClose={tiposMaquinaria.handleCerrarDialog}
          onChange={tiposMaquinaria.handleChangeFormulario}
          onSubmit={tiposMaquinaria.handleGuardar}
        />
        <Snackbar open={Boolean(tiposMaquinaria.mensaje)} autoHideDuration={3500} onClose={tiposMaquinaria.handleCerrarMensaje} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={tiposMaquinaria.handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>{tiposMaquinaria.mensaje}</Alert>
        </Snackbar>
        <Snackbar open={Boolean(tiposMaquinaria.error)} autoHideDuration={5000} onClose={tiposMaquinaria.handleCerrarError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={tiposMaquinaria.handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>{tiposMaquinaria.error}</Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}

export default TiposMaquinaria
