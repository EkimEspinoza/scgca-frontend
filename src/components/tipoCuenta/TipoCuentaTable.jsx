// Presenta filas, estado y paginación del catálogo Tipo de Cuenta.
import { Edit as EditIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch, Tooltip, Typography } from '@mui/material'
import DataTable from '../common/DataTable'
import Pagination from '../common/Pagination'
import StatusChip from '../common/StatusChip'

export default function TipoCuentaTable({ loading, tipos, totalRegistros, busqueda, filtroEstado, pagina, registrosPorPagina, cambiandoEstado, tipoCambioEstado, onEditar, onSolicitarCambioEstado, onChangePagina, onChangeRegistrosPorPagina, onCerrarConfirmacionEstado, onConfirmarCambioEstado }) {
  const columnas = [
    { key: 'DESCRIPCION_TIPO_CUENTA', label: 'Descripción', width: '52%' },
    { key: 'estado', label: 'Estado', width: '18%', render: (tipo) => {
      const activo = Number(tipo.estado) === 1
      return <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={activo ? 'Desactivar Tipo de Cuenta' : 'Reactivar Tipo de Cuenta'}>
          <span><Switch checked={activo} onChange={() => onSolicitarCambioEstado(tipo)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${activo ? 'Desactivar' : 'Reactivar'} tipo de cuenta ${tipo.Id_Tipo_Cuenta}` }} /></span>
        </Tooltip>
        <StatusChip estado={activo} activoLabel="Activo" inactivoLabel="Inactivo" />
      </Box>
    } },
    { key: 'acciones', label: 'Acciones', width: '12%', align: 'center', sortable: false, render: (tipo) => <Tooltip title="Editar Tipo de Cuenta"><IconButton size="small" onClick={() => onEditar(tipo)} aria-label={`Editar tipo de cuenta ${tipo.Id_Tipo_Cuenta}`}><EditIcon fontSize="small" /></IconButton></Tooltip> },
  ]

  return <Paper elevation={0} sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}>
    <DataTable columns={columnas} rows={tipos} loading={loading} emptyMessage="No existen tipos de cuenta registrados." emptySearchMessage="No se encontraron tipos de cuenta." hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'} getRowKey={(tipo) => tipo.Id_Tipo_Cuenta} />
    <Pagination total={totalRegistros} pagina={pagina} registrosPorPagina={registrosPorPagina} onPageChange={onChangePagina} onRowsPerPageChange={onChangeRegistrosPorPagina} leadingContent={`${totalRegistros} ${totalRegistros === 1 ? 'registro encontrado' : 'registros encontrados'}`} />
    <Dialog open={Boolean(tipoCambioEstado)} onClose={onCerrarConfirmacionEstado} maxWidth="xs" fullWidth>
      <DialogTitle>{tipoCambioEstado?.nuevoEstado === 1 ? 'Reactivar Tipo de Cuenta' : 'Desactivar Tipo de Cuenta'}</DialogTitle>
      <DialogContent><Typography>{tipoCambioEstado?.nuevoEstado === 1 ? `¿Deseas reactivar "${tipoCambioEstado?.DESCRIPCION_TIPO_CUENTA}"?` : `¿Deseas desactivar "${tipoCambioEstado?.DESCRIPCION_TIPO_CUENTA}"? El registro se conservará.`}</Typography></DialogContent>
      <DialogActions>
        <Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>Cancelar</Button>
        <Button variant="contained" color={tipoCambioEstado?.nuevoEstado === 1 ? 'success' : 'warning'} onClick={onConfirmarCambioEstado} disabled={cambiandoEstado} startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {cambiandoEstado ? 'Guardando…' : tipoCambioEstado?.nuevoEstado === 1 ? 'Reactivar' : 'Desactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  </Paper>
}
