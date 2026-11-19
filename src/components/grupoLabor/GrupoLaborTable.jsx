import { Edit as EditIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch, Tooltip, Typography } from '@mui/material'
import DataTable from '../common/DataTable'
import Pagination from '../common/Pagination'
import StatusChip from '../common/StatusChip'

export default function GrupoLaborTable({ loading, grupos, totalRegistros, busqueda, filtroEstado, pagina, registrosPorPagina, cambiandoEstado, grupoCambioEstado, onEditar, onSolicitarCambioEstado, onChangePagina, onChangeRegistrosPorPagina, onCerrarConfirmacionEstado, onConfirmarCambioEstado }) {
  const columnas = [
    { key: 'Id_Grupo_Labor', label: 'Código', width: '14%', render: (grupo) => grupo.Id_Grupo_Labor },
    { key: 'DescripcionLabor', label: 'Descripción', width: '48%', render: (grupo) => grupo.DescripcionLabor },
    { key: 'TIPO_GRUPO', label: 'Tipo de grupo', width: '18%', render: (grupo) => grupo.TIPO_GRUPO },
    {
      key: 'estado', label: 'Estado', width: '15%', render: (grupo) => {
        const activo = Number(grupo.estado) === 1
        return <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={activo ? 'Desactivar Grupo Labor' : 'Reactivar Grupo Labor'}>
            <span><Switch checked={activo} onChange={() => onSolicitarCambioEstado(grupo)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${activo ? 'Desactivar' : 'Reactivar'} grupo ${grupo.Id_Grupo_Labor}` }} /></span>
          </Tooltip>
          <StatusChip estado={activo} activoLabel="Activo" inactivoLabel="Inactivo" />
        </Box>
      },
    },
    { key: 'acciones', label: 'Acciones', width: '12%', align: 'center', sortable: false, render: (grupo) => <Tooltip title="Editar Grupo Labor"><IconButton size="small" onClick={() => onEditar(grupo)} aria-label={`Editar grupo ${grupo.Id_Grupo_Labor}`}><EditIcon fontSize="small" /></IconButton></Tooltip> },
  ]

  return <Paper elevation={0} sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}>
    <DataTable columns={columnas} rows={grupos} loading={loading} emptyMessage="No existen grupos de labor registrados." emptySearchMessage="No se encontraron grupos de labor." hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'} getRowKey={(grupo) => grupo.Id_Grupo_Labor} />
    <Pagination total={totalRegistros} pagina={pagina} registrosPorPagina={registrosPorPagina} onPageChange={onChangePagina} onRowsPerPageChange={onChangeRegistrosPorPagina} />
    <Dialog open={Boolean(grupoCambioEstado)} onClose={onCerrarConfirmacionEstado} maxWidth="xs" fullWidth>
      <DialogTitle>{grupoCambioEstado?.nuevoEstado === 1 ? 'Reactivar Grupo Labor' : 'Desactivar Grupo Labor'}</DialogTitle>
      <DialogContent><Typography>{grupoCambioEstado?.nuevoEstado === 1
        ? `¿Deseas reactivar "${grupoCambioEstado?.DescripcionLabor}"?`
        : `¿Deseas desactivar "${grupoCambioEstado?.DescripcionLabor}"? El registro se conservará.`}</Typography></DialogContent>
      <DialogActions>
        <Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>Cancelar</Button>
        <Button variant="contained" color={grupoCambioEstado?.nuevoEstado === 1 ? 'success' : 'warning'} onClick={onConfirmarCambioEstado} disabled={cambiandoEstado} startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {cambiandoEstado ? 'Guardando…' : grupoCambioEstado?.nuevoEstado === 1 ? 'Reactivar' : 'Desactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  </Paper>
}
