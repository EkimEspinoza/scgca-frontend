import { Edit as EditIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch, Tooltip, Typography } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import DataTable from '../common/DataTable'
import Pagination from '../common/Pagination'
import StatusChip from '../common/StatusChip'

export default function TiposMaquinariaTable({ loading, tiposMaquinariaPaginados, totalRegistros, busqueda, filtroEstado, pagina, registrosPorPagina, cambiandoEstado, tipoCambioEstado, onEditar, onSolicitarCambioEstado, onChangePagina, onChangeRegistrosPorPagina, onCerrarConfirmacionEstado, onConfirmarCambioEstado }) {
  const esVistaMovil = useMediaQuery('(max-width:760px)')
  const columnas = [
    {
      key: 'des_tipo_maquinaria', label: 'Tipo de Maquinaria', width: '60%',
      cellSx: { position: 'relative', pl: 1.5, '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: 'primary.main' } },
      render: (tipo) => <Box sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>{tipo.des_tipo_maquinaria}</Typography></Box>,
    },
    {
      key: 'estado', label: 'Estado', width: '20%',
      render: (tipo) => <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={tipo.estado ? 'Desactivar tipo de maquinaria' : 'Reactivar tipo de maquinaria'}><span><Switch checked={Boolean(tipo.estado)} onChange={() => onSolicitarCambioEstado(tipo)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${tipo.estado ? 'Desactivar' : 'Reactivar'} ${tipo.des_tipo_maquinaria}` }} /></span></Tooltip>
        <StatusChip estado={tipo.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
      </Box>,
    },
    {
      key: 'acciones', label: 'Acciones', width: '20%', align: 'center',
      render: (tipo) => <IconButton size="small" aria-label={`Editar ${tipo.des_tipo_maquinaria}`} onClick={() => onEditar(tipo)} sx={{ p: 0.5, '&:hover': { backgroundColor: 'action.hover' } }}><EditIcon fontSize="small" /></IconButton>,
    },
  ]

  return (
    <Paper elevation={0} sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: esVistaMovil ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}>
      {esVistaMovil ? (
        <Box component="ul" aria-label="Lista de tipos de maquinaria" sx={{ listStyle: 'none', m: 0, p: 0, flex: '0 1 auto', maxHeight: 420, overflowY: 'auto' }}>
          {loading ? <Box component="li" sx={{ display: 'grid', placeItems: 'center', py: 6 }}><CircularProgress size={28} /></Box>
            : tiposMaquinariaPaginados.length === 0 ? <Box component="li" sx={{ p: 3 }}><Typography color="text.secondary" align="center">{Boolean(busqueda.trim()) || filtroEstado !== 'todos' ? 'No se encontraron tipos de maquinaria.' : 'No existen tipos de maquinaria registrados.'}</Typography></Box>
              : tiposMaquinariaPaginados.map((tipo) => <Box component="li" key={tipo.id_tipo_maq} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', columnGap: 1, alignItems: 'center', px: 1.5, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                <Box sx={{ minWidth: 0 }}><Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{tipo.des_tipo_maquinaria}</Typography><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}><Tooltip title={tipo.estado ? 'Desactivar tipo de maquinaria' : 'Reactivar tipo de maquinaria'}><span><Switch checked={Boolean(tipo.estado)} onChange={() => onSolicitarCambioEstado(tipo)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${tipo.estado ? 'Desactivar' : 'Reactivar'} ${tipo.des_tipo_maquinaria}` }} /></span></Tooltip><StatusChip estado={tipo.estado} activoLabel="Activo" inactivoLabel="Inactivo" /></Box></Box>
                <IconButton aria-label={`Editar ${tipo.des_tipo_maquinaria}`} onClick={() => onEditar(tipo)} sx={{ minWidth: 44, minHeight: 44 }}><EditIcon fontSize="small" /></IconButton>
              </Box>)}
        </Box>
      ) : <DataTable columns={columnas} rows={tiposMaquinariaPaginados} loading={loading} emptyMessage="No existen tipos de maquinaria registrados." emptySearchMessage="No se encontraron tipos de maquinaria." hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'} getRowKey={(tipo) => tipo.id_tipo_maq} />}
      <Pagination total={totalRegistros} pagina={pagina} registrosPorPagina={registrosPorPagina} onPageChange={onChangePagina} onRowsPerPageChange={onChangeRegistrosPorPagina} />
      <Dialog open={Boolean(tipoCambioEstado)} onClose={onCerrarConfirmacionEstado} maxWidth="xs" fullWidth>
        <DialogTitle>{tipoCambioEstado?.nuevoEstado ? 'Reactivar tipo de maquinaria' : 'Desactivar tipo de maquinaria'}</DialogTitle>
        <DialogContent><Typography>{tipoCambioEstado?.nuevoEstado ? `¿Deseas reactivar "${tipoCambioEstado?.des_tipo_maquinaria}"?` : `¿Deseas desactivar "${tipoCambioEstado?.des_tipo_maquinaria}"? El registro se conservará en la base de datos.`}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>Cancelar</Button>
          <Button variant="contained" color={tipoCambioEstado?.nuevoEstado ? 'success' : 'warning'} onClick={onConfirmarCambioEstado} disabled={cambiandoEstado} startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}>{cambiandoEstado ? 'Guardando...' : tipoCambioEstado?.nuevoEstado ? 'Reactivar' : 'Desactivar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
