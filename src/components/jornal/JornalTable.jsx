import { Fragment, useMemo, useState } from 'react'
import { KeyboardArrowDown, KeyboardArrowUp, Edit as EditIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material'
import Pagination from '../common/Pagination'
import StatusChip from '../common/StatusChip'

function formatoImporte(valor) {
  return Number(valor ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatoFecha(fecha) {
  return fecha?.split('-').reverse().join('/') || '—'
}

export default function JornalTable({ loading, periodos, tiposJornal, totalRegistros, busqueda, filtroEstado, pagina, registrosPorPagina, cambiandoEstado, periodoCambioEstado, onEditar, onSolicitarCambioEstado, onChangePagina, onChangeRegistrosPorPagina, onCerrarConfirmacionEstado, onConfirmarCambioEstado }) {
  const [periodoExpandido, setPeriodoExpandido] = useState(null)
  const [orden, setOrden] = useState({ campo: 'Inicio', direccion: 'desc' })
  const filas = useMemo(() => [...periodos].sort((a, b) => {
    const factor = orden.direccion === 'asc' ? 1 : -1
    const valorA = orden.campo === 'cantidad' ? Object.keys(a.importes).length : a[orden.campo]
    const valorB = orden.campo === 'cantidad' ? Object.keys(b.importes).length : b[orden.campo]
    return String(valorA ?? '').localeCompare(String(valorB ?? ''), 'es', { numeric: true }) * factor
  }), [periodos, orden])
  const cambiarOrden = (campo) => setOrden((actual) => ({ campo, direccion: actual.campo === campo && actual.direccion === 'asc' ? 'desc' : 'asc' }))
  const sinResultados = !loading && filas.length === 0
  const columnas = [
    { key: 'expandir', label: '', width: 54, sortable: false },
    { key: 'Inicio', label: 'Periodo', width: '32%' },
    { key: 'cantidad', label: 'Tipos de jornal', width: '30%' },
    { key: 'estado', label: 'Estado', width: '22%', sortable: false },
    { key: 'acciones', label: 'Acciones', width: 120, sortable: false },
  ]

  return <Paper elevation={0} sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}>
    <TableContainer className="app-data-table" sx={{ flex: 1, minHeight: 0, overflow: 'auto', backgroundColor: 'background.paper' }}>
      <Table stickyHeader size="small" aria-label="Periodos de jornal">
        <TableHead><TableRow>
          {columnas.map((columna) => <TableCell key={columna.key} sortDirection={columna.sortable === false ? false : orden.campo === columna.key ? orden.direccion : false} sx={{ bgcolor: 'background.paper', color: 'text.secondary', fontWeight: 600, width: columna.width }}>
            {columna.sortable === false ? columna.label : <TableSortLabel active={orden.campo === columna.key} direction={orden.campo === columna.key ? orden.direccion : 'asc'} onClick={() => cambiarOrden(columna.key)}>{columna.label}</TableSortLabel>}
          </TableCell>)}
        </TableRow></TableHead>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={columnas.length} align="center" sx={{ py: 6, borderBottom: 0 }}><CircularProgress size={28} /></TableCell></TableRow>
            : sinResultados ? <TableRow><TableCell colSpan={columnas.length} align="center" sx={{ py: 6, borderBottom: 0 }}><Typography color="text.secondary">{busqueda.trim() || filtroEstado !== 'todos' ? 'No se encontraron periodos de jornal.' : 'No existen periodos de jornal registrados.'}</Typography></TableCell></TableRow>
              : filas.map((periodo) => {
                const expandido = periodoExpandido === periodo.key
                const cantidadTipos = Object.keys(periodo.importes).length
                const activo = Number(periodo.estado) === 1
                return <Fragment key={periodo.key}>
                  <TableRow key={periodo.key} hover>
                    <TableCell sx={{ width: 54 }}><IconButton size="small" onClick={() => setPeriodoExpandido(expandido ? null : periodo.key)} aria-label={`${expandido ? 'Ocultar' : 'Mostrar'} importes del periodo ${formatoFecha(periodo.Inicio)}`}>{expandido ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{formatoFecha(periodo.Inicio)} – {formatoFecha(periodo.Fin)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{cantidadTipos} {cantidadTipos === 1 ? 'tipo registrado' : 'tipos registrados'}</Typography></TableCell>
                    <TableCell><Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}><Tooltip title={activo ? 'Desactivar todo el periodo' : 'Reactivar todo el periodo'}><span><Switch checked={activo} onChange={() => onSolicitarCambioEstado(periodo)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${activo ? 'Desactivar' : 'Reactivar'} periodo ${formatoFecha(periodo.Inicio)}` }} /></span></Tooltip><StatusChip estado={activo} activoLabel="Activo" inactivoLabel="Inactivo" /></Box></TableCell>
                    <TableCell align="center"><Tooltip title="Editar importes"><IconButton size="small" onClick={() => onEditar(periodo)} aria-label={`Editar importes del periodo ${formatoFecha(periodo.Inicio)}`}><EditIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                  </TableRow>
                  <TableRow key={`${periodo.key}-detalle`}>
                    <TableCell colSpan={columnas.length} sx={{ p: 0, borderBottom: expandido ? undefined : 0, fontSize: '10px', lineHeight: 1.4, '& .MuiTypography-root': { fontSize: 'inherit', lineHeight: 'inherit' } }}>
                      <Collapse in={expandido} timeout="auto" unmountOnExit>
                        <Box sx={{ px: { xs: 1, sm: 5 }, py: 1, bgcolor: 'action.hover' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75 }}>Importes por tipo de jornal</Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 0.75 }}>
                            {tiposJornal.map((tipo) => {
                              const importe = periodo.importes[tipo.Id_Tipo_Jornal]
                              return <Box key={tipo.Id_Tipo_Jornal} sx={{ minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, px: 1, py: 0.625, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                                <Typography variant="body2" color="text.secondary" noWrap title={tipo.Descripcion}>{tipo.Descripcion}</Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{importe === undefined ? '—' : `S/ ${formatoImporte(importe)}`}</Typography>
                              </Box>
                            })}
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              })}
        </TableBody>
      </Table>
    </TableContainer>
    <Pagination total={totalRegistros} pagina={pagina} registrosPorPagina={registrosPorPagina} onPageChange={onChangePagina} onRowsPerPageChange={onChangeRegistrosPorPagina} />
    <Dialog open={Boolean(periodoCambioEstado)} onClose={onCerrarConfirmacionEstado} maxWidth="xs" fullWidth>
      <DialogTitle>{periodoCambioEstado?.nuevoEstado === 1 ? 'Reactivar periodo' : 'Desactivar periodo'}</DialogTitle>
      <DialogContent><Typography>¿Deseas {periodoCambioEstado?.nuevoEstado === 1 ? 'reactivar' : 'desactivar'} todos los tipos de jornal del periodo {formatoFecha(periodoCambioEstado?.Inicio)} a {formatoFecha(periodoCambioEstado?.Fin)}?</Typography></DialogContent>
      <DialogActions><Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>Cancelar</Button><Button variant="contained" color={periodoCambioEstado?.nuevoEstado === 1 ? 'success' : 'warning'} onClick={onConfirmarCambioEstado} disabled={cambiandoEstado} startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}>{cambiandoEstado ? 'Guardando…' : periodoCambioEstado?.nuevoEstado === 1 ? 'Reactivar' : 'Desactivar'}</Button></DialogActions>
    </Dialog>
  </Paper>
}
