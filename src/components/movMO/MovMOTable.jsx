import { useMemo, useState } from 'react'
import { Edit as EditIcon } from '@mui/icons-material'
import { Box, Card, Chip, IconButton, Skeleton, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material'

const fecha = (value) => value ? new Intl.DateTimeFormat('es-PE').format(new Date(`${value.slice(0, 10)}T00:00:00`)) : '—'
const soles = (value) => value == null || value === '' ? '—' : Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const mensajesValidacion = { SIN_CAMPANA_EN_FECHA: 'No existe una campaña activa para la fecha' }
const motivoValidacion = (error) => {
  const codigo = typeof error === 'string' ? error : error?.codigo ?? error?.code ?? error?.message ?? String(error)
  return mensajesValidacion[codigo] ?? codigo.replaceAll('_', ' ').toLocaleLowerCase('es-PE')
}
const anchosColumnas = [150, 116, 160, 220, 180, 145, 260, 120, 120, 130, 220, 130, 64]
const offsetsFijos = [0, anchosColumnas[0], anchosColumnas[0] + anchosColumnas[1], anchosColumnas[0] + anchosColumnas[1] + anchosColumnas[2]]
const estiloCelda = (ancho) => ({ width: ancho, minWidth: ancho, maxWidth: ancho, boxSizing: 'border-box' })
const estiloFijo = (indice) => ({ ...estiloCelda(anchosColumnas[indice]), position: 'sticky', left: offsetsFijos[indice], zIndex: 3, bgcolor: 'var(--table-sticky-bg)', overflow: 'hidden' })

export default function MovMOTable({ filas, cargando, error, total, pagina, filasPorPagina, onPagina, onFilasPorPagina, onEditar, onCambiarEstado, cambiandoEstadoId, enProceso, pendientes }) {
  const [orden, setOrden] = useState({ campo: 'fec_labor', direccion: 'desc' })
  const columnas = [
    { key: 'empresa', label: 'Empresa', value: (row) => row.empresa?.nombre_comercial || row.empresa?.descripcion || row.id_empresa, width: anchosColumnas[0] },
    { key: 'fec_labor', label: 'Fecha', value: (row) => row.fec_labor, width: anchosColumnas[1] },
    { key: 'tipo_cc', label: 'Tipo de centro de costo', value: (row) => row.centro?.tipo_cc?.des_tip_cc, width: anchosColumnas[2] },
    { key: 'cod_cc', label: 'Centro de costo', value: (row) => row.centro?.desc_cc || row.cod_cc, width: anchosColumnas[3] },
    { key: 'grupo_labor', label: 'Grupo de labor', value: (row) => row.labor?.labor_final?.grupo_labor?.DescripcionLabor, width: anchosColumnas[4] },
    { key: 'cod_labor', label: 'Labor', value: (row) => row.labor?.Lab_SCIRE || row.cod_labor, width: anchosColumnas[5] },
    { key: 'labor_scire', label: 'Labor SCIRE', value: (row) => row.labor_scire, width: anchosColumnas[6] },
    { key: 'imp_labor_sol', label: 'Importe S/', value: (row) => Number(row.imp_labor_sol ?? 0), numeric: true, width: anchosColumnas[7] },
    { key: 'ess_labor_sol', label: 'EsSalud S/', value: (row) => Number(row.ess_labor_sol ?? 0), numeric: true, width: anchosColumnas[8] },
    { key: 'etapa_costo', label: 'Etapa', value: (row) => row.etapa_costo, width: anchosColumnas[9] },
    { key: pendientes ? 'estado_validacion' : 'obs', label: pendientes ? 'Validación' : 'Observación', value: (row) => pendientes ? row.estado_validacion : row.obs, sortable: !pendientes, width: anchosColumnas[10] },
    { key: 'estado', label: 'Estado', value: (row) => Number(row.estado), numeric: true, width: anchosColumnas[11] },
    { key: 'acciones', label: 'Acciones', sortable: false, width: anchosColumnas[12] },
  ]
  const filasOrdenadas = useMemo(() => {
    const columna = columnas.find((item) => item.key === orden.campo)
    if (!columna) return filas
    const factor = orden.direccion === 'asc' ? 1 : -1
    return [...filas].sort((a, b) => {
      const valorA = columna.value(a)
      const valorB = columna.value(b)
      const comparacion = columna.numeric ? valorA - valorB : String(valorA ?? '').localeCompare(String(valorB ?? ''), 'es', { numeric: true, sensitivity: 'base' })
      return comparacion * factor
    })
  }, [filas, orden, pendientes])
  const cambiarOrden = (campo) => setOrden((actual) => ({ campo, direccion: actual.campo === campo && actual.direccion === 'desc' ? 'asc' : 'desc' }))
  const totalAncho = anchosColumnas.reduce((suma, ancho) => suma + ancho, 0)
  return <Card className="tareo-table-card" variant="outlined" sx={{ display: 'flex', flex: '1 1 0%', minHeight: 0, flexDirection: 'column', overflow: 'hidden' }}>
    {error && <Box role="alert" sx={{ p: 1.5, color: 'error.main' }}>{error}</Box>}
    <TableContainer className="app-data-table" sx={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--mui-palette-divider) transparent' }}>
      <Table stickyHeader size="small" className="tareo-table" sx={{ tableLayout: 'fixed', width: totalAncho, minWidth: totalAncho }}>
        <TableHead><TableRow>{columnas.map((column, index) => {
          const sortable = column.sortable !== false
          const active = orden.campo === column.key
          const fijo = index < 4
          return <TableCell key={column.key} className={fijo ? 'tareo-sticky-header-cell' : undefined} sortDirection={sortable && active ? orden.direccion : false} aria-sort={sortable ? (active ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none') : undefined} align={column.numeric ? 'right' : 'left'} sx={{ ...estiloCelda(column.width), whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: fijo ? 12 : 10, bgcolor: 'var(--table-header-bg)', ...(fijo ? { left: offsetsFijos[index] } : {}) }}>
            {sortable ? <TableSortLabel active={active} direction={active ? orden.direccion : 'desc'} onClick={() => cambiarOrden(column.key)}>{column.label}</TableSortLabel> : column.label}
          </TableCell>
        })}</TableRow></TableHead>
        <TableBody>
          {cargando && Array.from({ length: 6 }, (_, i) => <TableRow key={i}>{columnas.map((column) => <TableCell key={column.key} sx={estiloCelda(column.width)}><Skeleton /></TableCell>)}</TableRow>)}
          {!cargando && !error && filas.length === 0 && <TableRow><TableCell colSpan={columnas.length} align="center" sx={{ py: 6 }}><Typography color="text.secondary">{enProceso ? 'No hay registros en proceso.' : pendientes ? 'No hay registros pendientes.' : 'No hay movimientos de mano de obra para mostrar.'}</Typography></TableCell></TableRow>}
          {!cargando && filasOrdenadas.map((fila) => <TableRow hover className="tareo-row-hover" key={fila.id_mov_mo}>
            <TableCell className="tareo-sticky-cell" sx={{ ...estiloFijo(0), whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}><Tooltip title={fila.empresa?.nombre_comercial || fila.empresa?.descripcion || ''}><Typography variant="body2" noWrap>{fila.empresa?.nombre_comercial || fila.empresa?.descripcion || fila.id_empresa || '—'}</Typography></Tooltip></TableCell>
            <TableCell className="tareo-sticky-cell" sx={{ ...estiloFijo(1), whiteSpace: 'nowrap' }}>{fecha(fila.fec_labor)}</TableCell>
            <TableCell className="tareo-sticky-cell" sx={estiloFijo(2)}><Tooltip title={fila.centro?.tipo_cc?.des_tip_cc || ''}><Typography variant="body2" noWrap>{fila.centro?.tipo_cc?.des_tip_cc || '—'}</Typography></Tooltip></TableCell>
            <TableCell className="tareo-sticky-cell" sx={estiloFijo(3)}><Tooltip title={fila.centro?.desc_cc || ''}><Typography variant="body2" noWrap>{fila.centro?.desc_cc || '—'}</Typography></Tooltip></TableCell>
            <TableCell sx={{ ...estiloCelda(anchosColumnas[4]), overflow: 'hidden' }}><Tooltip title={fila.labor?.labor_final?.grupo_labor?.DescripcionLabor || ''}><Typography variant="body2" noWrap>{fila.labor?.labor_final?.grupo_labor?.DescripcionLabor || '—'}</Typography></Tooltip></TableCell>
            <TableCell sx={{ ...estiloCelda(anchosColumnas[5]), overflow: 'hidden' }}><Tooltip title={fila.labor?.Lab_SCIRE || ''}><Typography variant="body2" noWrap>{fila.labor?.Lab_SCIRE || fila.cod_labor || '—'}</Typography></Tooltip></TableCell>
            <TableCell sx={{ ...estiloCelda(anchosColumnas[6]), overflow: 'hidden' }}><Tooltip title={fila.labor_scire || ''}><Typography variant="body2" noWrap>{fila.labor_scire || '—'}</Typography></Tooltip></TableCell>
            <TableCell align="right" sx={{ ...estiloCelda(anchosColumnas[7]), fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{soles(fila.imp_labor_sol)}</TableCell>
            <TableCell align="right" sx={{ ...estiloCelda(anchosColumnas[8]), fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{soles(fila.ess_labor_sol)}</TableCell>
            <TableCell sx={{ ...estiloCelda(anchosColumnas[9]), overflow: 'hidden' }}><Tooltip title={fila.etapa_costo || ''}><Typography variant="body2" noWrap>{fila.etapa_costo || '—'}</Typography></Tooltip></TableCell>
            <TableCell sx={{ ...estiloCelda(anchosColumnas[10]), overflow: 'hidden' }}>{pendientes ? <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{fila.errores_validacion?.length ? fila.errores_validacion.map((error) => <Tooltip key={motivoValidacion(error)} title={motivoValidacion(error)}><Chip size="small" color="warning" variant="outlined" label={motivoValidacion(error)} sx={{ maxWidth: '100%' }} /></Tooltip>) : <Chip size="small" color="warning" variant="outlined" label={fila.estado_validacion || 'Pendiente de revisión'} />}</Box> : <Tooltip title={fila.obs || ''}><Typography variant="body2" noWrap color={fila.obs ? 'warning.main' : 'text.secondary'}>{fila.obs || '—'}</Typography></Tooltip>}</TableCell>
            <TableCell sx={{ ...estiloCelda(anchosColumnas[11]), whiteSpace: 'nowrap' }}><Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}><Switch size="small" checked={Number(fila.estado) === 1} disabled={!onCambiarEstado || cambiandoEstadoId === fila.id_mov_mo} onChange={() => onCambiarEstado?.(fila)} inputProps={{ 'aria-label': `${Number(fila.estado) === 1 ? 'Desactivar' : 'Activar'} movimiento ${fila.id_mov_mo}` }} /><Typography variant="body2" color={Number(fila.estado) === 1 ? 'success.main' : 'text.secondary'}>{Number(fila.estado) === 1 ? 'Activo' : 'Inactivo'}</Typography></Box></TableCell>
            <TableCell align="center" sx={{ ...estiloCelda(anchosColumnas[12]), p: 0.5 }}><Tooltip title={enProceso ? 'Editar centro de costo, labor y etapa' : pendientes ? 'Corregir centro de costo, labor y etapa' : 'Editar centro de costo y etapa de labor'}><span><IconButton size="small" aria-label={`Editar movimiento ${fila.id_mov_mo}`} onClick={() => onEditar?.(fila)} disabled={!onEditar}><EditIcon fontSize="small" /></IconButton></span></Tooltip></TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination component="div" count={total} page={pagina} onPageChange={onPagina} rowsPerPage={filasPorPagina} onRowsPerPageChange={onFilasPorPagina} rowsPerPageOptions={[25, 50, 100]} labelRowsPerPage="Filas por página" labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`} filtrados`} />
  </Card>
}
