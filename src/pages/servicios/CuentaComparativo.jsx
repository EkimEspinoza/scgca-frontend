// Conecta filtros, tabla y formulario del catálogo Cuenta Comparativo.
import { Alert, Box, Snackbar } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import CuentaComparativoFilters from '../../components/cuentaComparativo/CuentaComparativoFilters'
import CuentaComparativoForm from '../../components/cuentaComparativo/CuentaComparativoForm'
import CuentaComparativoTable from '../../components/cuentaComparativo/CuentaComparativoTable'
import { useCuentaComparativo } from '../../hooks/useCuentaComparativo'

export default function CuentaComparativo() {
  const cuentas = useCuentaComparativo()
  return <CompactModuleTheme>
    <Box className="app-module-flow" sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
      <CuentaComparativoFilters loading={cuentas.loading} totalRegistros={cuentas.totalRegistros} busqueda={cuentas.busqueda} filtroEstado={cuentas.filtroEstado} error={cuentas.error} onExportar={cuentas.handleExportarExcel} onNuevo={cuentas.handleNuevo} onCambioBusqueda={cuentas.handleCambioBusqueda} onCambioEstado={cuentas.handleCambioFiltroEstado} onCerrarError={cuentas.handleCerrarError} />
      <CuentaComparativoTable loading={cuentas.loading} cuentas={cuentas.cuentasPaginadas} totalRegistros={cuentas.totalRegistros} busqueda={cuentas.busqueda} filtroEstado={cuentas.filtroEstado} pagina={cuentas.pagina} registrosPorPagina={cuentas.registrosPorPagina} cambiandoEstado={cuentas.cambiandoEstado} tipoCambioEstado={cuentas.tipoCambioEstado} onEditar={cuentas.handleEditar} onSolicitarCambioEstado={cuentas.handleSolicitarCambioEstado} onChangePagina={cuentas.handleChangePagina} onChangeRegistrosPorPagina={cuentas.handleChangeRegistrosPorPagina} onCerrarConfirmacionEstado={cuentas.handleCerrarConfirmacionEstado} onConfirmarCambioEstado={cuentas.handleConfirmarCambioEstado} />
      <CuentaComparativoForm open={cuentas.dialogOpen} modoEdicion={cuentas.modoEdicion} formulario={cuentas.formulario} tiposCuenta={cuentas.tiposCuenta} erroresFormulario={cuentas.erroresFormulario} guardando={cuentas.guardando} onClose={cuentas.handleCerrarDialog} onChange={cuentas.handleChangeFormulario} onTipoCuentaChange={cuentas.handleTipoCuentaChange} onSubmit={cuentas.handleGuardar} />
      <Snackbar open={Boolean(cuentas.mensaje)} autoHideDuration={3500} onClose={cuentas.handleCerrarMensaje} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={cuentas.handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>{cuentas.mensaje}</Alert></Snackbar>
      <Snackbar open={Boolean(cuentas.error)} autoHideDuration={5000} onClose={cuentas.handleCerrarError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={cuentas.handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>{cuentas.error}</Alert></Snackbar>
    </Box>
  </CompactModuleTheme>
}
