import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert, Box, Card, CardContent, Checkbox, Chip, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, MenuItem, Popover, Select, Skeleton, Table, TableBody, TableCell,
  Switch, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tooltip, Typography, useMediaQuery,
} from '@mui/material'
import { ArrowDownward, ArrowUpward, Edit as EditIcon, InfoOutlined as InfoIcon, ViewColumn } from '@mui/icons-material'
import { obtenerEtapasCosto } from '../../services/etapaCostoService'

const mensajesError = {
  HORA_CERO: 'Horas en cero', CENTRO_COSTO_NO_EXISTE: 'Centro de costo no existe',
  MAQUINARIA_NO_EXISTE: 'Maquinaria no existe', CAMPANA_NO_EXISTE: 'No existe campaña operativa para la fecha',
  CENTRO_COSTO_NO_REGISTRADO: 'Centro de costo no registrado', CODIGO_CENTRO_COSTO_NO_COINCIDE: 'El código del centro no coincide',
  CENTRO_COSTO_INACTIVO: 'Centro de costo inactivo', MAQUINARIA_NO_REGISTRADA: 'Maquinaria no registrada',
  CODIGO_MAQUINARIA_NO_COINCIDE: 'El código de maquinaria no coincide', MAQUINARIA_INACTIVA: 'Maquinaria inactiva',
  SIN_CAMPANA_OPERATIVA: 'No existe campaña operativa para la fecha',
}
const tareoCollator = new Intl.Collator('es-PE', { numeric: true, sensitivity: 'base' })

function fechaCorta(valor) {
  if (!valor) return '—'
  const [anio, mes, dia] = valor.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

function CodigoNombre({ codigo, nombre, codigoPk }) {
  const titulo = `${codigo ?? '—'}${nombre ? ` · ${nombre}` : ''}${codigoPk ? ` · PK ${codigoPk}` : ''}`
  return <Tooltip title={titulo} placement="top-start"><Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, minWidth: 0, whiteSpace: 'nowrap' }}>
    <Typography component="span" variant="caption" color="text.secondary" className="tareo-code" sx={{ flexShrink: 0 }}>{codigo ?? '—'}</Typography>
    <Typography component="span" variant="body2" noWrap sx={{ minWidth: 0 }}>{nombre || ''}</Typography>
  </Box></Tooltip>
}

function EtapaChip({ etapa, etapasCatalogo }) {
  const valor = String(etapa ?? '').trim()
  if (!valor) return <Typography component="span" sx={{ color: 'var(--text-muted)' }}>—</Typography>

  const codigo = Number(valor)
  const etapaPorCodigo = Number.isInteger(codigo)
    ? etapasCatalogo.find((item) => Number(item.cod_etapa) === codigo)
    : null
  const etapaPorNombre = etapasCatalogo.find((item) => item.etapa_costo?.trim().toLocaleLowerCase('es-PE') === valor.toLocaleLowerCase('es-PE'))
  const etiqueta = etapaPorCodigo?.etapa_costo ?? etapaPorNombre?.etapa_costo ?? valor
  const colors = { borderColor: 'divider', bgcolor: 'action.hover', color: 'text.secondary' }

  return <Tooltip title={etiqueta} placement="top"><Chip size="small" variant="outlined" label={etiqueta} sx={{ height: 24, maxWidth: 200, fontWeight: 500, ...colors, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} /></Tooltip>
}
function Observacion({ fila, pendientes }) {
  if (pendientes) return <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{(fila.errores_validacion ?? []).map((error) => <Chip key={error} size="small" color="warning" variant="outlined" label={mensajesError[error] ?? error} />)}</Box>
  const texto = fila.observacion?.trim()
  return texto ? <Tooltip title={texto}><Typography variant="body2" noWrap sx={{ maxWidth: 230, color: 'warning.main', fontWeight: 500 }}>{texto}</Typography></Tooltip> : <Typography className="tareo-observation-empty" component="span">—</Typography>
}

function Campo({ etiqueta, children }) {
  return <Box sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary" display="block">{etiqueta}</Typography>{children}</Box>
}

function EstadoTareo({ estado, nroParte, onChange, cambiando }) {
  const activo = Number(estado) === 1
  return <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <Switch checked={activo} onChange={onChange} disabled={!onChange || cambiando} color="success" size="small" inputProps={{ 'aria-label': `${activo ? 'Desactivar' : 'Activar'} tareo ${nroParte}` }} />
    <Typography variant="body2" color={activo ? 'success.main' : 'text.secondary'}>{activo ? 'Activo' : 'Inactivo'}</Typography>
  </Box>
}

export default function TareoTable({ filas, empresas = [], mostrarEmpresa = false, pendientes, enProceso = false, cargando, total, pagina, filasPorPagina, onCambiarPagina, onCambiarFilasPorPagina, puedeEditar, onEditar, onCambiarEstado, cambiandoEstadoId }) {
  const mobile = useMediaQuery('(max-width: 767.95px)')
  const tablet = useMediaQuery('(min-width: 768px) and (max-width: 1199.95px)')
  const [detalle, setDetalle] = useState(null)
  const [columnasAnchor, setColumnasAnchor] = useState(null)
  const [columnasManuales, setColumnasManuales] = useState({})
  const [etapasCatalogo, setEtapasCatalogo] = useState([])
  const etapasCatalogoSolicitado = useRef(false)
  const [orden, setOrden] = useState({ campo: 'fecha', direccion: 'desc' })
  useEffect(() => {
    const hayEtapas = filas.some((fila) => String(fila.etapa_tareo ?? '').trim())
    if (!hayEtapas || etapasCatalogoSolicitado.current) return

    etapasCatalogoSolicitado.current = true
    obtenerEtapasCosto()
      .then(setEtapasCatalogo)
      .catch((error) => {
        console.error('Error resolviendo etapas de Tareo con el catálogo de costos:', error)
        etapasCatalogoSolicitado.current = false
      })
  }, [filas])
  const puedeEditarFila = puedeEditar && !enProceso
  const tieneAcciones = puedeEditarFila || tablet
  const etapaTieneDatos = filas.some((fila) => String(fila.etapa_tareo ?? '').trim())
  const observacionTieneDatos = filas.some((fila) => pendientes
    ? (fila.errores_validacion ?? []).length > 0
    : Boolean(fila.observacion?.trim()))
  const mostrarEtapa = columnasManuales.etapa ?? etapaTieneDatos
  const mostrarObservacion = columnasManuales.observacion ?? observacionTieneDatos
  const columnas = 6 + Number(mostrarEtapa) + Number(mostrarObservacion) + Number(tieneAcciones) + Number(mostrarEmpresa)
  const nombreEmpresa = (idEmpresa) => {
    const empresa = empresas.find((item) => Number(item.id_empresa) === Number(idEmpresa))
    return empresa?.nombre_comercial?.trim() || empresa?.descripcion?.trim() || empresa?.razon_social?.trim() || 'Empresa sin nombre'
  }
  const filasOrdenadas = useMemo(() => {
    const propiedad = { fecha: 'fecha_tareo', parte: 'nro_parte', centro: 'cod_cc', maquinaria: 'cod_cc_maq', horas: 'hora' }[orden.campo]
    const signo = orden.direccion === 'asc' ? 1 : -1
    return [...filas].sort((a, b) => {
      const comparacion = orden.campo === 'horas'
        ? Number(a[propiedad] ?? 0) - Number(b[propiedad] ?? 0)
        : tareoCollator.compare(String(a[propiedad] ?? ''), String(b[propiedad] ?? ''))
      return comparacion * signo
    })
  }, [filas, orden])

  const cambiarOrden = (campo) => setOrden((actual) => ({
    campo,
    direccion: actual.campo === campo && actual.direccion === 'asc' ? 'desc' : 'asc',
  }))
  const encabezadoOrdenable = (texto, campo, sx = {}) => {
    const activo = orden.campo === campo
    const sort = activo ? orden.direccion : false
    const ariaSort = activo ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'
    const stickyHeader = sx.position === 'sticky'
    return <TableCell className={stickyHeader ? 'tareo-sticky-header-cell' : undefined} sortDirection={sort} aria-sort={ariaSort} sx={stickyHeader ? { ...sx, top: 0, zIndex: 10 } : sx}><Tooltip title="Ordena los registros visibles de esta página"><TableSortLabel active={activo} direction={activo ? orden.direccion : 'asc'} onClick={() => cambiarOrden(campo)} aria-label={`Ordenar por ${texto}${activo ? `, ${orden.direccion === 'asc' ? 'ascendente' : 'descendente'}` : ''}`}>
      {texto}
    </TableSortLabel></Tooltip></TableCell>
  }

  return <Card className="tareo-table-card" variant="outlined" sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 0%', minHeight: 0, overflow: 'hidden' }}>
    <Box className="tareo-columns-toolbar">
      <Tooltip title="Mostrar u ocultar columnas">
        <IconButton aria-label="Seleccionar columnas de la tabla" onClick={(event) => setColumnasAnchor(event.currentTarget)} size="small">
          <ViewColumn fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover open={Boolean(columnasAnchor)} anchorEl={columnasAnchor} onClose={() => setColumnasAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <FormGroup sx={{ p: 1.25 }} aria-label="Columnas visibles">
          <FormControlLabel control={<Checkbox checked={mostrarEtapa} onChange={(event) => setColumnasManuales((actual) => ({ ...actual, etapa: event.target.checked }))} />} label="Etapa" />
          <FormControlLabel control={<Checkbox checked={mostrarObservacion} onChange={(event) => setColumnasManuales((actual) => ({ ...actual, observacion: event.target.checked }))} />} label={pendientes ? 'Validación' : 'Observación'} />
        </FormGroup>
      </Popover>
    </Box>
    <TableContainer className="app-data-table" sx={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', overflowX: mobile ? 'hidden' : 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--mui-palette-divider) transparent' }}>
      {mobile ? <Box role="list" aria-label="Movimientos de tareo" sx={{ p: 1, display: 'grid', gap: 1 }}>
        <Box role="group" aria-label="Ordenar movimientos" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel id="tareo-sort-label">Ordenar por</InputLabel>
            <Select labelId="tareo-sort-label" label="Ordenar por" value={orden.campo} onChange={(event) => setOrden((actual) => ({ ...actual, campo: event.target.value }))}>
              <MenuItem value="fecha">Fecha</MenuItem><MenuItem value="parte">Nro. parte</MenuItem><MenuItem value="centro">Centro de costo</MenuItem><MenuItem value="maquinaria">Maquinaria</MenuItem><MenuItem value="horas">Horas</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={orden.direccion === 'asc' ? 'Orden ascendente' : 'Orden descendente'}><IconButton aria-label={orden.direccion === 'asc' ? 'Cambiar a orden descendente' : 'Cambiar a orden ascendente'} onClick={() => setOrden((actual) => ({ ...actual, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' }))} sx={{ minWidth: 44, minHeight: 44, color: 'text.secondary' }}>{orden.direccion === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}</IconButton></Tooltip>
        </Box>
        {cargando && Array.from({ length: 5 }, (_, i) => <Card key={i} variant="outlined"><CardContent sx={{ p: '12px !important' }}><Skeleton width="45%" /><Skeleton /><Skeleton width="70%" /></CardContent></Card>)}
        {!cargando && filas.length === 0 && <Alert severity="info">No hay movimientos para mostrar con estos filtros.</Alert>}
        {!cargando && filas.map((fila) => <Card className="tareo-record-card" role="listitem" key={fila.id_mov_tareo} variant="outlined" sx={{ '&:hover': { borderColor: 'divider', bgcolor: 'action.hover' } }}>
          <CardContent sx={{ p: '12px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
              <Box sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary">Nro. parte</Typography><Typography component="span" className="tareo-code tareo-code--primary" noWrap>{fila.nro_parte}</Typography></Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}><Typography variant="caption" color="text.secondary">Horas</Typography><Typography fontWeight={700} fontVariant="tabular-nums">{Number(fila.hora).toFixed(2)}</Typography></Box>
              {puedeEditarFila && <Tooltip title={pendientes ? 'Resolver observación' : 'Actualizar registro'}><IconButton aria-label={`${pendientes ? 'Resolver observación de' : 'Actualizar'} ${fila.nro_parte}`} onClick={() => onEditar(fila)} sx={{ minWidth: 44, minHeight: 44 }}><EditIcon /></IconButton></Tooltip>}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {mostrarEmpresa && <Campo etiqueta="Empresa"><Typography variant="body2" noWrap>{nombreEmpresa(fila.id_empresa)}</Typography></Campo>}
              <Campo etiqueta="Fecha"><Typography variant="body2">{fechaCorta(fila.fecha_tareo)}</Typography></Campo>
              <Campo etiqueta="Estado"><EstadoTareo estado={fila.estado} nroParte={fila.nro_parte} onChange={puedeEditarFila ? () => onCambiarEstado(fila) : undefined} cambiando={cambiandoEstadoId === fila.id_mov_tareo} /></Campo>
              {mostrarEtapa && <Campo etiqueta="Etapa"><EtapaChip etapa={fila.etapa_tareo} etapasCatalogo={etapasCatalogo} /></Campo>}
              <Campo etiqueta="Centro de costo"><CodigoNombre codigo={fila.cod_cc} nombre={fila.centro_operativo?.desc_cc} codigoPk={fila.cod_cc_pk} /></Campo>
              <Campo etiqueta="Maquinaria"><CodigoNombre codigo={fila.cod_cc_maq} nombre={fila.maquinaria?.desc_cc} codigoPk={fila.cod_cc_pk_maq} /></Campo>
              {mostrarObservacion && <Box sx={{ gridColumn: '1 / -1' }}><Campo etiqueta={pendientes ? 'Validación' : 'Observación'}><Observacion fila={fila} pendientes={pendientes} /></Campo></Box>}
            </Box>
          </CardContent>
        </Card>)}
      </Box> : <Table className="tareo-table" stickyHeader size="small" aria-label="Movimientos de tareo" sx={{ minWidth: { xs: 1090, lg: 0 } }}>
        <TableHead><TableRow>
          {mostrarEmpresa && <TableCell className="tareo-sticky-header-cell" sx={{ width: 120, minWidth: 120, maxWidth: 120, position: 'sticky', top: 0, left: 0, zIndex: 10, bgcolor: 'var(--table-header-bg)', whiteSpace: 'nowrap' }}>Empresa</TableCell>}
          {encabezadoOrdenable('Fecha', 'fecha', { width: 88, position: 'sticky', left: mostrarEmpresa ? 120 : 0, zIndex: 5, bgcolor: 'var(--table-header-bg)', whiteSpace: 'nowrap' })}
          {encabezadoOrdenable('Nro. parte', 'parte', { width: 100, position: 'sticky', left: (mostrarEmpresa ? 120 : 0) + 88, zIndex: 5, bgcolor: 'var(--table-header-bg)', whiteSpace: 'nowrap' })}
          {encabezadoOrdenable('Centro de costo', 'centro', { minWidth: 190, width: 190, maxWidth: 190, position: 'sticky', left: (mostrarEmpresa ? 120 : 0) + 88 + 100, zIndex: 5, bgcolor: 'var(--table-header-bg)' })}
          {encabezadoOrdenable('Maquinaria', 'maquinaria', { minWidth: 250, width: 250, maxWidth: 250 })}
          {encabezadoOrdenable('Horas', 'horas', { width: 66, whiteSpace: 'nowrap', textAlign: 'right', borderRight: 1, borderColor: 'divider' })}
          <TableCell sx={{ width: 100, whiteSpace: 'nowrap' }}>Estado</TableCell>
          {mostrarEtapa && <TableCell sx={{ width: 130, maxWidth: 170, pl: 3 }}>Etapa</TableCell>}
          {mostrarObservacion && <TableCell sx={{ width: 140, display: { sm: 'none', lg: 'table-cell' } }}>{pendientes ? 'Validación' : 'Observación'}</TableCell>}
          {tieneAcciones && <TableCell className="tareo-sticky-cell tareo-sticky-header-cell" align="center" sx={{ width: tablet ? 96 : 60, position: 'sticky', top: 0, right: 0, zIndex: 10, bgcolor: 'var(--table-header-bg)' }}>Acciones</TableCell>}
        </TableRow></TableHead>
        <TableBody>
          {cargando && Array.from({ length: 6 }, (_, index) => <TableRow key={`skeleton-${index}`}>{Array.from({ length: columnas }, (_, cell) => <TableCell key={cell}><Skeleton /></TableCell>)}</TableRow>)}
          {!cargando && filas.length === 0 && <TableRow><TableCell colSpan={columnas} align="center" sx={{ py: 5 }}><Typography color="text.secondary">No hay movimientos para mostrar con estos filtros.</Typography></TableCell></TableRow>}
          {!cargando && filasOrdenadas.map((fila) => <Fragment key={fila.id_mov_tareo}>
            <TableRow hover className="tareo-row-hover">
              {mostrarEmpresa && <TableCell className="tareo-sticky-cell" sx={{ width: 120, minWidth: 120, maxWidth: 120, position: 'sticky', left: 0, zIndex: 2, bgcolor: 'var(--tareo-sticky-cell-bg, var(--table-sticky-bg))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><Tooltip title={nombreEmpresa(fila.id_empresa)}><Typography variant="body2" noWrap>{nombreEmpresa(fila.id_empresa)}</Typography></Tooltip></TableCell>}
              <TableCell className="tareo-sticky-cell" sx={{ position: 'sticky', left: mostrarEmpresa ? 120 : 0, zIndex: 2, bgcolor: 'var(--tareo-sticky-cell-bg, var(--table-sticky-bg))', whiteSpace: 'nowrap' }}>{fechaCorta(fila.fecha_tareo)}</TableCell>
              <TableCell className="tareo-sticky-cell" sx={{ width: 100, minWidth: 100, maxWidth: 100, position: 'sticky', left: (mostrarEmpresa ? 120 : 0) + 88, zIndex: 3, bgcolor: 'var(--tareo-sticky-cell-bg, var(--table-sticky-bg))', whiteSpace: 'nowrap', overflow: 'hidden' }}><Typography component="span" className="tareo-code tareo-code--primary" noWrap>{fila.nro_parte}</Typography></TableCell>
              <TableCell className="tareo-sticky-cell" sx={{ minWidth: 190, width: 190, maxWidth: 190, position: 'sticky', left: (mostrarEmpresa ? 120 : 0) + 88 + 100, zIndex: 4, bgcolor: 'var(--tareo-sticky-cell-bg, var(--table-sticky-bg))', overflow: 'hidden' }}><CodigoNombre codigo={fila.cod_cc} nombre={fila.centro_operativo?.desc_cc} codigoPk={fila.cod_cc_pk} /></TableCell>
              <TableCell sx={{ width: 80, minWidth: 64, maxWidth: 80, overflow: 'hidden' }}><CodigoNombre codigo={fila.cod_cc_maq} nombre={fila.maquinaria?.desc_cc} codigoPk={fila.cod_cc_pk_maq} /></TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', borderRight: 1, borderColor: 'divider' }}>{Number(fila.hora).toFixed(2)}</TableCell>
              <TableCell><EstadoTareo estado={fila.estado} nroParte={fila.nro_parte} onChange={puedeEditarFila ? () => onCambiarEstado(fila) : undefined} cambiando={cambiandoEstadoId === fila.id_mov_tareo} /></TableCell>
              {mostrarEtapa && <TableCell sx={{ pl: 3, maxWidth: 200 }}><EtapaChip etapa={fila.etapa_tareo} etapasCatalogo={etapasCatalogo} /></TableCell>}
              {mostrarObservacion && <TableCell sx={{ display: { sm: 'none', lg: 'table-cell' } }}><Observacion fila={fila} pendientes={pendientes} /></TableCell>}
              {tieneAcciones && <TableCell className="tareo-sticky-cell" align="center" sx={{ position: 'sticky', right: 0, zIndex: 2, bgcolor: 'var(--tareo-sticky-cell-bg, var(--table-sticky-bg))', p: 0, width: tablet ? 96 : 60, '& .tareo-row-actions': { position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' } }}>
                <Box className="tareo-row-actions">
                  {tablet && <Tooltip title="Ver observación"><IconButton aria-label={`Ver detalle de ${fila.nro_parte}`} onClick={() => setDetalle(detalle === fila.id_mov_tareo ? null : fila.id_mov_tareo)} sx={{ minWidth: 44, minHeight: 44 }}><InfoIcon fontSize="small" /></IconButton></Tooltip>}
              {puedeEditarFila && <Tooltip title={pendientes ? 'Resolver observación' : 'Actualizar registro'}><IconButton aria-label={`${pendientes ? 'Resolver observación de' : 'Actualizar'} ${fila.nro_parte}`} onClick={() => onEditar(fila)} sx={{ minWidth: 44, minHeight: 44 }}><EditIcon fontSize="small" /></IconButton></Tooltip>}
                </Box>
              </TableCell>}
            </TableRow>
            {tablet && mostrarObservacion && detalle === fila.id_mov_tareo && <TableRow><TableCell colSpan={columnas}><Typography variant="caption" color="text.secondary">{pendientes ? 'Validación' : 'Observación'}</Typography><Observacion fila={fila} pendientes={pendientes} /></TableCell></TableRow>}
          </Fragment>)}
        </TableBody>
      </Table>}
    </TableContainer>
    <TablePagination component="div" count={total} page={pagina} onPageChange={onCambiarPagina} rowsPerPage={filasPorPagina} onRowsPerPageChange={onCambiarFilasPorPagina} rowsPerPageOptions={[25, 50, 100]} labelRowsPerPage={mobile ? 'Filas' : 'Filas por página'} labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`} filtrados`} sx={{ flex: '0 0 auto', minHeight: 48, borderTop: 1, borderColor: 'divider', '& .MuiTablePagination-toolbar': { minHeight: 48, px: { xs: 0.5, sm: 1.5 }, flexWrap: { xs: 'wrap', sm: 'nowrap' }, justifyContent: { xs: 'center', sm: 'flex-end' } } }} />
  </Card>
}
