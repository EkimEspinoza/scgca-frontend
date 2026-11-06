import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import VariedadesFilters from '../../components/variedades/VariedadesFilters'
import VariedadesForm from '../../components/variedades/VariedadesForm'
import VariedadesTable from '../../components/variedades/VariedadesTable'
import { useVariedades } from '../../hooks/useVariedades'

function Variedades() {
  const variedades = useVariedades()

  return (
    <CompactModuleTheme>
      <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
        <VariedadesFilters
          puedeAdministrar={variedades.puedeAdministrar}
          loading={variedades.loading}
          totalRegistros={variedades.totalRegistros}
          busqueda={variedades.busqueda}
          filtroEstado={variedades.filtroEstado}
          error={variedades.error}
          onExportar={variedades.handleExportarExcel}
          onNuevaVariedad={variedades.handleNuevaVariedad}
          onCambioBusqueda={variedades.handleCambioBusqueda}
          onCambioEstado={variedades.handleCambioFiltroEstado}
          onCerrarError={variedades.handleCerrarError}
        />
        <VariedadesTable
          puedeAdministrar={variedades.puedeAdministrar}
          loading={variedades.loading}
          variedadesPaginadas={variedades.variedadesPaginadas}
          totalRegistros={variedades.totalRegistros}
          busqueda={variedades.busqueda}
          filtroEstado={variedades.filtroEstado}
          pagina={variedades.pagina}
          registrosPorPagina={variedades.registrosPorPagina}
          cambiandoEstado={variedades.cambiandoEstado}
          variedadCambioEstado={variedades.variedadCambioEstado}
          onEditar={variedades.handleEditarVariedad}
          onSolicitarCambioEstado={variedades.handleSolicitarCambioEstado}
          onChangePagina={variedades.handleChangePagina}
          onChangeRegistrosPorPagina={variedades.handleChangeRegistrosPorPagina}
          onCerrarConfirmacionEstado={variedades.handleCerrarConfirmacionEstado}
          onConfirmarCambioEstado={variedades.handleConfirmarCambioEstado}
        />
        <VariedadesForm
          open={variedades.puedeAdministrar && variedades.dialogOpen}
          modoEdicion={variedades.modoEdicion}
          formulario={variedades.formulario}
          erroresFormulario={variedades.erroresFormulario}
          guardando={variedades.guardando}
          onClose={variedades.handleCerrarDialog}
          onChange={variedades.handleChangeFormulario}
          onSubmit={variedades.handleGuardar}
        />
        <Snackbar open={Boolean(variedades.mensaje)} autoHideDuration={3500} onClose={variedades.handleCerrarMensaje} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={variedades.handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>{variedades.mensaje}</Alert>
        </Snackbar>
        <Snackbar open={Boolean(variedades.error)} autoHideDuration={5000} onClose={variedades.handleCerrarError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={variedades.handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>{variedades.error}</Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}

export default Variedades
