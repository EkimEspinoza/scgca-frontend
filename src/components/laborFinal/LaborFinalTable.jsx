import { Edit as EditIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch, Tooltip, Typography } from '@mui/material'
import DataTable from '../common/DataTable'
import Pagination from '../common/Pagination'
import StatusChip from '../common/StatusChip'

export default function LaborFinalTable({ loading, labores, totalRegistros, busqueda, filtroEstado, pagina, registrosPorPagina, cambiandoEstado, laborCambioEstado, onEditar, onSolicitarCambioEstado, onChangePagina, onChangeRegistrosPorPagina, onCerrarConfirmacionEstado, onConfirmarCambioEstado }) {
  const columnas = [
    { key: 'Id_Lab_Fin', label: 'Código', width: '12%', render: (labor) => labor.Id_Lab_Fin },
    { key: 'DESCRIPCION', label: 'Descripción', width: '38%', render: (labor) => labor.DESCRIPCION },
    { key: 'grupoLabor', label: 'Grupo de labor', width: '23%', sortValue: (labor) => labor.grupoLabor?.DescripcionLabor, render: (labor) => labor.grupoLabor?.DescripcionLabor ?? `Grupo ${labor.Id_Grupo_Labor}` },
    { key: 'id_Tipo_Jornal', label: 'Tipo de jornal', width: '12%', sortValue: (labor) => labor.tipoJornal?.Descripcion, render: (labor) => labor.tipoJornal?.Descripcion ?? `Código ${labor.id_Tipo_Jornal}` },
    {
      key: 'estado', label: 'Estado', width: '15%', render: (labor) => {
        const activo = Number(labor.estado) === 1
        return <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={activo ? 'Desactivar Labor Final' : 'Reactivar Labor Final'}>
            <span><Switch checked={activo} onChange={() => onSolicitarCambioEstado(labor)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${activo ? 'Desactivar' : 'Reactivar'} labor ${labor.Id_Lab_Fin}` }} /></span>
          </Tooltip>
          <StatusChip estado={activo} activoLabel="Activo" inactivoLabel="Inactivo" />
        </Box>
      },
    },
    { key: 'acciones', label: 'Acciones', width: '10%', align: 'center', sortable: false, render: (labor) => <Tooltip title="Editar Labor Final"><IconButton size="small" onClick={() => onEditar(labor)} aria-label={`Editar labor ${labor.Id_Lab_Fin}`}><EditIcon fontSize="small" /></IconButton></Tooltip> },
  ]

  return <Paper elevation={0} sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}>
    <DataTable columns={columnas} rows={labores} loading={loading} emptyMessage="No existen labores finales registradas." emptySearchMessage="No se encontraron labores finales." hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'} getRowKey={(labor) => labor.Id_Lab_Fin} />
    <Pagination total={totalRegistros} pagina={pagina} registrosPorPagina={registrosPorPagina} onPageChange={onChangePagina} onRowsPerPageChange={onChangeRegistrosPorPagina} />
    <Dialog open={Boolean(laborCambioEstado)} onClose={onCerrarConfirmacionEstado} maxWidth="xs" fullWidth>
      <DialogTitle>{laborCambioEstado?.nuevoEstado === 1 ? 'Reactivar Labor Final' : 'Desactivar Labor Final'}</DialogTitle>
      <DialogContent><Typography>{laborCambioEstado?.nuevoEstado === 1
        ? `¿Deseas reactivar "${laborCambioEstado?.DESCRIPCION}"?`
        : `¿Deseas desactivar "${laborCambioEstado?.DESCRIPCION}"? El registro se conservará.`}</Typography></DialogContent>
      <DialogActions>
        <Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>Cancelar</Button>
        <Button variant="contained" color={laborCambioEstado?.nuevoEstado === 1 ? 'success' : 'warning'} onClick={onConfirmarCambioEstado} disabled={cambiandoEstado} startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {cambiandoEstado ? 'Guardando…' : laborCambioEstado?.nuevoEstado === 1 ? 'Reactivar' : 'Desactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  </Paper>
}
