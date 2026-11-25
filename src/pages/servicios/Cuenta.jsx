// Presenta la consulta de cuentas por empresa y cuenta comparativo.
import { AccountBalanceWalletOutlined, Add, Download, Edit as EditIcon } from '@mui/icons-material'
import { Alert, Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Snackbar, Switch, TextField, Tooltip, Typography } from '@mui/material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import DataTable from '../../components/common/DataTable'
import FiltersToolbar from '../../components/common/FiltersToolbar'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import StatusChip from '../../components/common/StatusChip'
import CuentaForm from '../../components/cuenta/CuentaForm'
import { useCuenta } from '../../hooks/useCuenta'

export default function Cuenta() {
  const cuenta = useCuenta()
  const columnas = [
    { key: 'empresaNombre', label: 'Empresa', width: '16%' },
    { key: 'CUENTA', label: 'Cuenta', width: '10%' },
    { key: 'DESCRIPCION_CUENTA', label: 'Descripción', width: '29%' },
    { key: 'comparativoNombre', label: 'Cuenta Comparativo', width: '25%' },
    { key: 'estado', label: 'Estado', width: '10%', render: (row) => <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Tooltip title={Number(row.estado) === 1 ? 'Desactivar cuenta' : 'Reactivar cuenta'}>
        <span><Switch checked={Number(row.estado) === 1} onChange={() => cuenta.handleSolicitarCambioEstado(row)} disabled={cuenta.cambiandoEstado} size="small" inputProps={{ 'aria-label': `${Number(row.estado) === 1 ? 'Desactivar' : 'Reactivar'} cuenta ${row.CUENTA}` }} /></span>
      </Tooltip>
      <StatusChip estado={Number(row.estado) === 1} activoLabel="Activo" inactivoLabel="Inactivo" />
    </Box> },
    { key: 'acciones', label: 'Acciones', width: '10%', align: 'center', sortable: false, render: (row) => <Tooltip title="Editar cuenta"><IconButton size="small" onClick={() => cuenta.handleEditar(row)} aria-label={`Editar cuenta ${row.CUENTA}`}><EditIcon fontSize="small" /></IconButton></Tooltip> },
  ]

  return <CompactModuleTheme>
    <Box className="app-module-flow" sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
      <PageHeader icon={<AccountBalanceWalletOutlined />} title="Cuenta" description="Consulta y administra las cuentas contables y su clasificación comparativa por empresa." />
      <FiltersToolbar
        disabled={cuenta.loading}
        actions={<>
          <Button className="app-excel-action-button" variant="outlined" color="inherit" startIcon={<Download />} onClick={cuenta.handleExportarExcel} disabled={cuenta.loading || cuenta.exportandoExcel || cuenta.total === 0}>
            {cuenta.exportandoExcel ? 'Exportando…' : 'Exportar Excel'}
          </Button>
          <Button className="app-create-action-button" variant="contained" startIcon={<Add />} onClick={cuenta.handleNuevo} disabled={cuenta.loading}>Nueva Cuenta</Button>
        </>}
      >
        <Box className="app-filters-row cuenta-filters-row">
          <Autocomplete
            options={cuenta.cuentasOpciones}
            value={cuenta.cuentasOpciones.find((item) => String(item.CUENTA_PK) === String(cuenta.cuentaFiltro)) ?? null}
            getOptionLabel={(item) => item ? `${item.CUENTA} · ${item.empresaNombre} · ${item.DESCRIPCION_CUENTA}` : ''}
            isOptionEqualToValue={(option, value) => Number(option.CUENTA_PK) === Number(value.CUENTA_PK)}
            onChange={(_event, value) => cuenta.handleCuentaFiltro(value ? String(value.CUENTA_PK) : 'todos')}
            disabled={cuenta.loading}
            renderInput={(params) => <TextField {...params} label="Cuenta" placeholder="Todas" />}
          />
          <Autocomplete
            options={cuenta.comparativosCatalogo}
            value={cuenta.comparativosCatalogo.find((item) => String(item.Id_Cuenta_Comparativo) === String(cuenta.comparativoFiltro)) ?? null}
            getOptionLabel={(item) => item ? item.Des_Cuenta_Comparativo : ''}
            isOptionEqualToValue={(option, value) => option.Id_Cuenta_Comparativo === value.Id_Cuenta_Comparativo}
            onChange={(_event, value) => cuenta.handleComparativoFiltro(value ? String(value.Id_Cuenta_Comparativo) : 'todos')}
            disabled={cuenta.loading}
            renderInput={(params) => <TextField {...params} label="Cuenta Comparativo" placeholder="Todas" />}
          />
          <TextField select size="small" label="Estado" value={cuenta.estado} onChange={cuenta.handleEstado}>
            <MenuItem value="todos">Todos</MenuItem><MenuItem value="activos">Activo</MenuItem><MenuItem value="inactivos">Inactivo</MenuItem>
          </TextField>
        </Box>
      </FiltersToolbar>
      {cuenta.error && <Box role="alert" sx={{ color: 'error.main', px: 1, py: 0.5 }}>{cuenta.error}</Box>}
      <Box sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 1, backgroundColor: 'background.paper' }}>
        <DataTable columns={columnas} rows={cuenta.cuentas} loading={cuenta.loading} emptyMessage="No existen cuentas registradas." emptySearchMessage="No se encontraron cuentas con esos filtros." hasSearch={cuenta.idEmpresa !== null || cuenta.cuentaFiltro !== 'todos' || cuenta.comparativoFiltro !== 'todos' || cuenta.estado !== 'todos'} getRowKey={(row) => row.ID_CUENTA} />
        <Pagination total={cuenta.total} pagina={cuenta.pagina} registrosPorPagina={cuenta.registrosPorPagina} onPageChange={cuenta.handlePagina} onRowsPerPageChange={cuenta.handleRegistrosPorPagina} opciones={[10, 25, 50, 100]} leadingContent={`${cuenta.total} ${cuenta.total === 1 ? 'registro encontrado' : 'registros encontrados'}`} />
      </Box>
      <CuentaForm open={cuenta.dialogOpen} modoEdicion={cuenta.modoEdicion} formulario={cuenta.formulario} empresas={cuenta.empresasCatalogo} comparativos={cuenta.comparativosCatalogo} erroresFormulario={cuenta.erroresFormulario} guardando={cuenta.guardando} onClose={cuenta.handleCerrarDialog} onChange={cuenta.handleCambioFormulario} onCatalogChange={cuenta.handleCambioCatalogo} onSubmit={cuenta.handleGuardar} />
      <Dialog open={Boolean(cuenta.tipoCambioEstado)} onClose={cuenta.handleCerrarConfirmacionEstado} maxWidth="xs" fullWidth>
        <DialogTitle>{cuenta.tipoCambioEstado?.nuevoEstado === 1 ? 'Reactivar Cuenta' : 'Desactivar Cuenta'}</DialogTitle>
        <DialogContent><Typography>{cuenta.tipoCambioEstado?.nuevoEstado === 1 ? `¿Deseas reactivar la cuenta ${cuenta.tipoCambioEstado?.CUENTA}?` : `¿Deseas desactivar la cuenta ${cuenta.tipoCambioEstado?.CUENTA}? El registro se conservará.`}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={cuenta.handleCerrarConfirmacionEstado} disabled={cuenta.cambiandoEstado}>Cancelar</Button>
          <Button variant="contained" color={cuenta.tipoCambioEstado?.nuevoEstado === 1 ? 'success' : 'warning'} onClick={cuenta.handleConfirmarCambioEstado} disabled={cuenta.cambiandoEstado} startIcon={cuenta.cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}>{cuenta.cambiandoEstado ? 'Guardando…' : cuenta.tipoCambioEstado?.nuevoEstado === 1 ? 'Reactivar' : 'Desactivar'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(cuenta.mensaje)} autoHideDuration={3500} onClose={cuenta.handleCerrarMensaje} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={cuenta.handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>{cuenta.mensaje}</Alert></Snackbar>
      <Snackbar open={Boolean(cuenta.error)} autoHideDuration={5000} onClose={cuenta.handleCerrarError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={cuenta.handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>{cuenta.error}</Alert></Snackbar>
    </Box>
  </CompactModuleTheme>
}
