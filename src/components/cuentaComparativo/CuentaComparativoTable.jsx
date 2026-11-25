// Presenta filas, estado y paginación de Cuenta Comparativo.
import { Edit as EditIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch, Tooltip, Typography } from '@mui/material'
import DataTable from '../common/DataTable'
import Pagination from '../common/Pagination'
import StatusChip from '../common/StatusChip'

export default function CuentaComparativoTable({ loading, cuentas, totalRegistros, busqueda, filtroEstado, pagina, registrosPorPagina, cambiandoEstado, tipoCambioEstado, onEditar, onSolicitarCambioEstado, onChangePagina, onChangeRegistrosPorPagina, onCerrarConfirmacionEstado, onConfirmarCambioEstado }) {
  const columnas = [
    { key: 'Des_Cuenta_Comparativo', label: 'Cuenta Comparativo', width: '48%' },
    { key: 'tipoCuentaDescripcion', label: 'Tipo de Cuenta', width: '22%' },
    { key: 'estado', label: 'Estado', width: '16%', render: (cuenta) => {
      const activo = Number(cuenta.estado) === 1
      return <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={activo ? 'Desactivar cuenta comparativo' : 'Reactivar cuenta comparativo'}>
          <span><Switch checked={activo} onChange={() => onSolicitarCambioEstado(cuenta)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${activo ? 'Desactivar' : 'Reactivar'} cuenta ${cuenta.Id_Cuenta_Comparativo}` }} /></span>
        </Tooltip>
        <StatusChip estado={activo} activoLabel="Activo" inactivoLabel="Inactivo" />
      </Box>
    } },
    { key: 'acciones', label: 'Acciones', width: '10%', align: 'center', sortable: false, render: (cuenta) => <Tooltip title="Editar Cuenta Comparativo"><IconButton size="small" onClick={() => onEditar(cuenta)} aria-label={`Editar cuenta comparativo ${cuenta.Id_Cuenta_Comparativo}`}><EditIcon fontSize="small" /></IconButton></Tooltip> },
  ]

  return <Paper elevation={0} sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}>
    <DataTable columns={columnas} rows={cuentas} loading={loading} emptyMessage="No existen cuentas comparativo registradas." emptySearchMessage="No se encontraron cuentas comparativo." hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'} getRowKey={(cuenta) => cuenta.Id_Cuenta_Comparativo} />
    <Pagination total={totalRegistros} pagina={pagina} registrosPorPagina={registrosPorPagina} onPageChange={onChangePagina} onRowsPerPageChange={onChangeRegistrosPorPagina} leadingContent={`${totalRegistros} ${totalRegistros === 1 ? 'registro encontrado' : 'registros encontrados'}`} />
    <Dialog open={Boolean(tipoCambioEstado)} onClose={onCerrarConfirmacionEstado} maxWidth="xs" fullWidth>
      <DialogTitle>{tipoCambioEstado?.nuevoEstado === 1 ? 'Reactivar Cuenta Comparativo' : 'Desactivar Cuenta Comparativo'}</DialogTitle>
      <DialogContent><Typography>{tipoCambioEstado?.nuevoEstado === 1 ? `¿Deseas reactivar "${tipoCambioEstado?.Des_Cuenta_Comparativo}"?` : `¿Deseas desactivar "${tipoCambioEstado?.Des_Cuenta_Comparativo}"? El registro se conservará.`}</Typography></DialogContent>
      <DialogActions>
        <Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>Cancelar</Button>
        <Button variant="contained" color={tipoCambioEstado?.nuevoEstado === 1 ? 'success' : 'warning'} onClick={onConfirmarCambioEstado} disabled={cambiandoEstado} startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}>{cambiandoEstado ? 'Guardando…' : tipoCambioEstado?.nuevoEstado === 1 ? 'Reactivar' : 'Desactivar'}</Button>
      </DialogActions>
    </Dialog>
  </Paper>
}
