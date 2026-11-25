// Presenta la tabla de Campana.
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { useMemo, useState } from 'react'
import StatusChip from '../common/StatusChip'

const campanaCollator = new Intl.Collator('es-PE', { numeric: true, sensitivity: 'base' })

function formatearFecha(fecha) {
  if (!fecha) return ''
  const partes = fecha.split('-')
  if (partes.length !== 3) return fecha
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

// Devuelve el color de acento asociado a la empresa.
const obtenerColorEmpresa = (nombreComercial) => {
  const nombre = (nombreComercial || '').toUpperCase()
  if (nombre.includes('RANCHO')) return '#1976D2'
  if (nombre.includes('MOCHE') || nombre.includes('SAMNSA')) return '#2E7D32'
  if (nombre.includes('MCR')) return '#9C27B0'
  if (nombre.includes('CANTERA')) return '#ED6C02'
  return '#BDBDBD'
}

function mostrarValor(valor) {
  return valor || '-'
}

function CampanaTable({
  campanas = [],
  loading = false,
  eliminando = false,
  emptyMessage = 'No existen campañas registradas.',
  emptySearchMessage = 'No se encontraron campañas para la búsqueda.',
  hasSearch = false,
  cambiandoEstado = false,
  cambiandoCierre = false,
  onCambiarEstado,
  onCambiarCierre,
  onEditar,
}) {
  const [orden, setOrden] = useState({ campo: 'periodo', direccion: 'desc' })
  const camposOrden = {
    empresa: (campana) => campana.empresa?.nombre_comercial,
    id: (campana) => campana.id_campana_emp,
    centro: (campana) => campana.centro_costo?.desc_cc,
    periodo: (campana) => campana.fecha_inicio,
    hectareas: (campana) => campana.hectareas,
    estado: (campana) => campana.estado,
    cierre: (campana) => campana.cierre_camp,
  }

  const campanasOrdenadas = useMemo(() => {
    const obtenerValor = camposOrden[orden.campo]
    const factor = orden.direccion === 'asc' ? 1 : -1
    return [...campanas].sort((a, b) => {
      const valorA = obtenerValor(a)
      const valorB = obtenerValor(b)
      const comparacion = orden.campo === 'hectareas' || orden.campo === 'id'
        ? Number(valorA ?? 0) - Number(valorB ?? 0)
        : orden.campo === 'estado' || orden.campo === 'cierre'
          ? Number(Boolean(valorA)) - Number(Boolean(valorB))
          : campanaCollator.compare(String(valorA ?? ''), String(valorB ?? ''))
      return comparacion * factor
    })
  }, [campanas, orden])

  const cambiarOrden = (campo) => setOrden((actual) => ({
    campo,
    direccion: actual.campo === campo && actual.direccion === 'asc' ? 'desc' : 'asc',
  }))

  const encabezadoOrdenable = (texto, campo, align = 'left') => {
    const activo = orden.campo === campo
    return (
      <TableCell
        align={align}
        sortDirection={activo ? orden.direccion : false}
        aria-sort={activo ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'}
        sx={{ width: campo === 'empresa' ? '13%' : campo === 'id' ? '10%' : campo === 'centro' ? '22%' : campo === 'periodo' ? '15%' : '10%', fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 1.25 }}
      >
        <Tooltip title="Ordenar ascendente o descendente" enterDelay={500}>
          <TableSortLabel
            active={activo}
            direction={activo ? orden.direccion : 'asc'}
            onClick={() => cambiarOrden(campo)}
            aria-label={`Ordenar por ${texto}${activo ? `, ${orden.direccion === 'asc' ? 'ascendente' : 'descendente'}` : ''}`}
          >
            {texto}
          </TableSortLabel>
        </Tooltip>
      </TableCell>
    )
  }

  return (
    <TableContainer
      className="app-data-table"
      sx={{ width: '100%', height: 'auto', flex: '1 1 0%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'auto', backgroundColor: 'background.paper' }}
    >
      {/* Las tarjetas se muestran en pantallas pequeñas. */}
      <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', gap: 0.75, flex: '1 1 0%', minHeight: 0, overflowY: 'auto', p: 0.75 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={28} /></Box>
        ) : campanas.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>{hasSearch ? emptySearchMessage : emptyMessage}</Typography>
        ) : campanasOrdenadas.map((campana) => (
          <Paper key={campana.id_campana} variant="outlined" sx={{ p: 1.25, borderRadius: 1.25, borderLeft: `3px solid ${obtenerColorEmpresa(campana.empresa?.nombre_comercial)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3, overflowWrap: 'anywhere' }}>{mostrarValor(campana.nombre_campana)}</Typography>
                <Typography variant="caption" color="text.secondary">ID {campana.id_campana_emp}</Typography>
              </Box>
              <Tooltip title="Editar campaña" arrow>
                <span><IconButton size="small" disabled={eliminando} onClick={() => onEditar(campana)} aria-label={`Editar campaña ${campana.id_campana_emp}`}><EditIcon fontSize="small" /></IconButton></span>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75, mt: 0.75 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title={campana.estado ? 'Desactivar campaña' : 'Reactivar campaña'}>
                  <span><Switch checked={Boolean(campana.estado)} onChange={() => onCambiarEstado(campana)} disabled={eliminando || cambiandoEstado} size="small" inputProps={{ 'aria-label': `${campana.estado ? 'Desactivar' : 'Reactivar'} campaña ${campana.id_campana_emp}` }} /></span>
                </Tooltip>
                <Typography variant="body2" color={campana.estado ? 'success.dark' : 'text.secondary'} fontWeight={600}>{campana.estado ? 'Activa' : 'Inactiva'}</Typography>
              </Box>
              <StatusChip estado={campana.cierre_camp} cerrado={campana.cierre_camp} activoLabel="Cerrada" inactivoLabel="Abierta" />
            </Box>
            <Divider sx={{ my: 0.75 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 1.25, rowGap: 0.75 }}>
              {[
                ['Empresa', campana.empresa?.nombre_comercial],
                ['Centro de costo', campana.centro_costo?.desc_cc],
                ['Periodo', `${formatearFecha(campana.fecha_inicio)} → ${formatearFecha(campana.fecha_fin)}`],
                ['Hectáreas', Number(campana.hectareas ?? 0).toFixed(4)],
              ].map(([etiqueta, valor]) => (
                <Box key={etiqueta} sx={{ minWidth: 0 }}>
                  <Typography component="div" variant="caption" color="text.secondary">{etiqueta}</Typography>
                  <Typography component="div" variant="body2" title={valor || ''} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mostrarValor(valor)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      <Table stickyHeader size="small" sx={{ width: '100%', display: { xs: 'none', lg: 'table' }, tableLayout: 'fixed', flex: '0 0 auto', minHeight: 0, '& .MuiTableHead-root .MuiTableCell-root': { fontSize: '12px', px: 1, py: 0.6 } }}>
        <TableHead>
          <TableRow>
            {encabezadoOrdenable('Empresa', 'empresa')}
            {encabezadoOrdenable('ID Campaña', 'id', 'center')}
            {encabezadoOrdenable('Nombre de Centro de Costo', 'centro')}
            {encabezadoOrdenable('Periodo', 'periodo')}
            {encabezadoOrdenable('Hectáreas', 'hectareas', 'right')}
            {encabezadoOrdenable('Estado', 'estado', 'center')}
            {encabezadoOrdenable('Cierre', 'cierre', 'center')}
            <TableCell align="center" sx={{ width: '10%', fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 1.25 }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
          ) : campanas.length === 0 ? (
            <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><Typography variant="body2" color="text.secondary">{hasSearch ? emptySearchMessage : emptyMessage}</Typography></TableCell></TableRow>
          ) : campanasOrdenadas.map((campana) => {
            const colorEmpresa = obtenerColorEmpresa(campana.empresa?.nombre_comercial)
            return (
              <TableRow
                key={campana.id_campana}
                hover
                sx={{
                  '&:hover': { backgroundColor: '#F8FAF9' },
                  '& td': { borderBottom: '1px solid #E8ECEA' },
                  '&:last-child td': { borderBottom: 'none' },
                  '&&& td:first-of-type': { borderLeft: `4px solid ${colorEmpresa}` },
                }}
              >
                <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={campana.empresa?.nombre_comercial}>{mostrarValor(campana.empresa?.nombre_comercial)}</Typography>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{campana.id_campana_emp}</TableCell>
                <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={campana.centro_costo?.desc_cc}>{mostrarValor(campana.centro_costo?.desc_cc)}</Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatearFecha(campana.fecha_inicio)}{' → '}{formatearFecha(campana.fecha_fin)}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mostrarValor(Number(campana.hectareas ?? 0).toFixed(4))}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title={campana.cierre_camp ? 'Reabrir campaña' : 'Cerrar campaña'}>
                      <span><Switch checked={Boolean(campana.estado)} onChange={() => onCambiarEstado(campana)} disabled={eliminando || cambiandoEstado} size="small" inputProps={{ 'aria-label': `${campana.estado ? 'Desactivar' : 'Reactivar'} campaña ${campana.id_campana_emp}` }} /></span>
                    </Tooltip>
                    <Typography variant="body2" color={campana.estado ? 'success.dark' : 'text.secondary'} fontWeight={600}>{campana.estado ? 'Activa' : 'Inactiva'}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title={campana.cierre_camp ? 'Reabrir campaña' : 'Cerrar campaña'}>
                      <span><Switch checked={Boolean(campana.cierre_camp)} onChange={() => onCambiarCierre(campana)} disabled={eliminando || cambiandoEstado} size="small" inputProps={{ 'aria-label': `${campana.cierre_camp ? 'Reabrir' : 'Cerrar'} campaña ${campana.id_campana_emp}` }} /></span>
                    </Tooltip>
                    <Typography variant="body2" color={campana.cierre_camp ? 'error.main' : 'text.secondary'} fontWeight={600}>{campana.cierre_camp ? 'Cerrada' : 'Abierta'}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center" className="app-table-action-cell">
                  <Tooltip title="Editar campaña" arrow>
                    <IconButton size="small" disabled={eliminando} onClick={() => onEditar(campana)} aria-label="Editar campaña"><EditIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default CampanaTable
