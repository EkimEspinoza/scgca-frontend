// Compone la pantalla GrupoLabor y conecta sus componentes.
import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import GrupoLaborFilters from '../../components/grupoLabor/GrupoLaborFilters'
import GrupoLaborForm from '../../components/grupoLabor/GrupoLaborForm'
import GrupoLaborTable from '../../components/grupoLabor/GrupoLaborTable'
import { useGrupoLabor } from '../../hooks/useGrupoLabor'

export default function GrupoLabor() {
  const grupos = useGrupoLabor()

  return (
    <CompactModuleTheme>
      <Box className="app-module-flow" sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
        <GrupoLaborFilters
          loading={grupos.loading}
          totalRegistros={grupos.totalRegistros}
          busqueda={grupos.busqueda}
          filtroEstado={grupos.filtroEstado}
          error={grupos.error}
          onExportar={grupos.handleExportarExcel}
          onNuevo={grupos.handleNuevo}
          onCambioBusqueda={grupos.handleCambioBusqueda}
          onCambioEstado={grupos.handleCambioFiltroEstado}
          onCerrarError={grupos.handleCerrarError}
        />
        <GrupoLaborTable
          loading={grupos.loading}
          grupos={grupos.gruposPaginados}
          totalRegistros={grupos.totalRegistros}
          busqueda={grupos.busqueda}
          filtroEstado={grupos.filtroEstado}
          pagina={grupos.pagina}
          registrosPorPagina={grupos.registrosPorPagina}
          cambiandoEstado={grupos.cambiandoEstado}
          grupoCambioEstado={grupos.grupoCambioEstado}
          onEditar={grupos.handleEditar}
          onSolicitarCambioEstado={grupos.handleSolicitarCambioEstado}
          onChangePagina={grupos.handleChangePagina}
          onChangeRegistrosPorPagina={grupos.handleChangeRegistrosPorPagina}
          onCerrarConfirmacionEstado={grupos.handleCerrarConfirmacionEstado}
          onConfirmarCambioEstado={grupos.handleConfirmarCambioEstado}
        />
        <GrupoLaborForm
          open={grupos.dialogOpen}
          modoEdicion={grupos.modoEdicion}
          formulario={grupos.formulario}
          erroresFormulario={grupos.erroresFormulario}
          guardando={grupos.guardando}
          onClose={grupos.handleCerrarDialog}
          onChange={grupos.handleChangeFormulario}
          onSubmit={grupos.handleGuardar}
        />
        <Snackbar open={Boolean(grupos.mensaje)} autoHideDuration={3500} onClose={grupos.handleCerrarMensaje} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={grupos.handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>{grupos.mensaje}</Alert>
        </Snackbar>
        <Snackbar open={Boolean(grupos.error)} autoHideDuration={5000} onClose={grupos.handleCerrarError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={grupos.handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>{grupos.error}</Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}
