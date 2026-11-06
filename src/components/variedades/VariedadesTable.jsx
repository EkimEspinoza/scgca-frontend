import { Edit } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch, Tooltip, Typography } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import DataTable from '../common/DataTable'
import Pagination from '../common/Pagination'
import StatusChip from '../common/StatusChip'

export default function VariedadesTable({ puedeAdministrar, loading, variedadesPaginadas, totalRegistros, busqueda, filtroEstado, pagina, registrosPorPagina, cambiandoEstado, variedadCambioEstado, onEditar, onSolicitarCambioEstado, onChangePagina, onChangeRegistrosPorPagina, onCerrarConfirmacionEstado, onConfirmarCambioEstado }) {
  const esVistaMovil = useMediaQuery('(max-width:760px)')
  const columnas = [
    {
      key: 'descripcion', label: 'Variedad', width: '60%',
      cellSx: { position: 'relative', pl: 1.5, '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: 'primary.main' } },
      render: (variedad) => <Box sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>{variedad.descripcion}</Typography></Box>,
    },
    {
      key: 'estado', label: 'Estado', width: '20%',
      render: (variedad) => <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        {puedeAdministrar && <Tooltip title={variedad.estado ? 'Desactivar variedad' : 'Reactivar variedad'}><span><Switch checked={Boolean(variedad.estado)} onChange={() => onSolicitarCambioEstado(variedad)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${variedad.estado ? 'Desactivar' : 'Reactivar'} ${variedad.descripcion}` }} /></span></Tooltip>}
        <StatusChip estado={variedad.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
      </Box>,
    },
    ...(puedeAdministrar ? [{
      key: 'acciones', label: 'Acciones', width: '20%', align: 'center',
      render: (variedad) => <IconButton size="small" aria-label={`Editar ${variedad.descripcion}`} onClick={() => onEditar(variedad)} sx={{ p: 0.5, '&:hover': { backgroundColor: 'action.hover' } }}><Edit fontSize="small" /></IconButton>,
    }] : []),
  ]

  return (
    <Paper elevation={0} sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: esVistaMovil ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}>
      {esVistaMovil ? (
        <Box component="ul" aria-label="Lista de variedades" sx={{ listStyle: 'none', m: 0, p: 0, flex: '0 1 auto', maxHeight: 420, overflowY: 'auto' }}>
          {loading ? <Box component="li" sx={{ display: 'grid', placeItems: 'center', py: 6 }}><CircularProgress size={28} /></Box>
            : variedadesPaginadas.length === 0 ? <Box component="li" sx={{ p: 3 }}><Typography color="text.secondary" align="center">{Boolean(busqueda.trim()) || filtroEstado !== 'todos' ? 'No se encontraron variedades.' : 'No existen variedades registradas.'}</Typography></Box>
              : variedadesPaginadas.map((variedad) => <Box component="li" key={variedad.id_variedad} sx={{ display: 'grid', gridTemplateColumns: puedeAdministrar ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)', columnGap: 1, alignItems: 'center', px: 1.5, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                <Box sx={{ minWidth: 0 }}><Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{variedad.descripcion}</Typography><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                  {puedeAdministrar && <Tooltip title={variedad.estado ? 'Desactivar variedad' : 'Reactivar variedad'}><span><Switch checked={Boolean(variedad.estado)} onChange={() => onSolicitarCambioEstado(variedad)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${variedad.estado ? 'Desactivar' : 'Reactivar'} ${variedad.descripcion}` }} /></span></Tooltip>}
                  <StatusChip estado={variedad.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
                </Box></Box>
                {puedeAdministrar && <IconButton aria-label={`Editar ${variedad.descripcion}`} onClick={() => onEditar(variedad)} sx={{ minWidth: 44, minHeight: 44 }}><Edit fontSize="small" /></IconButton>}
              </Box>)}
        </Box>
      ) : <DataTable columns={columnas} rows={variedadesPaginadas} loading={loading} emptyMessage="No existen variedades registradas." emptySearchMessage="No se encontraron variedades." hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'} getRowKey={(variedad) => variedad.id_variedad} />}
      <Pagination total={totalRegistros} pagina={pagina} registrosPorPagina={registrosPorPagina} onPageChange={onChangePagina} onRowsPerPageChange={onChangeRegistrosPorPagina} />
      {puedeAdministrar && <Dialog open={Boolean(variedadCambioEstado)} onClose={onCerrarConfirmacionEstado} maxWidth="xs" fullWidth>
        <DialogTitle>{variedadCambioEstado?.nuevoEstado ? 'Reactivar variedad' : 'Desactivar variedad'}</DialogTitle>
        <DialogContent><Typography>{variedadCambioEstado?.nuevoEstado ? `¿Deseas reactivar "${variedadCambioEstado?.descripcion}"?` : `¿Deseas desactivar "${variedadCambioEstado?.descripcion}"? El registro se conservará en la base de datos.`}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>Cancelar</Button>
          <Button variant="contained" color={variedadCambioEstado?.nuevoEstado ? 'success' : 'warning'} onClick={onConfirmarCambioEstado} disabled={cambiandoEstado} startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}>{cambiandoEstado ? 'Guardando...' : variedadCambioEstado?.nuevoEstado ? 'Reactivar' : 'Desactivar'}</Button>
        </DialogActions>
      </Dialog>}
    </Paper>
  )
}
