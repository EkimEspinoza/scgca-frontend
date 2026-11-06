import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  LockOpen as ReopenIcon,
  Percent as PercentIcon,
  Save as SaveIcon,
  TaskAlt as CloseIcon,
} from '@mui/icons-material'

import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/useAuth'
import { useEmpresa } from '../../context/useEmpresa'
import { useDistribucionRango } from '../../hooks/useDistribucionRango'
import { obtenerEmpresasDistribucion } from '../../services/distribucionService'
import { validarPorcentajeContable } from '../../components/distribucion/distribucionRules'

function mesActual() {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
}

function mostrarHectareas(valor) {
  const numero = Number(valor)
  return Number.isFinite(numero)
    ? numero.toLocaleString('es-PE', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : '—'
}

function etiquetaMes(mes, opciones = { month: 'long', year: 'numeric' }) {
  const [anio, numeroMes] = mes.split('-').map(Number)
  return new Date(Date.UTC(anio, numeroMes - 1, 1)).toLocaleDateString('es-PE', { ...opciones, timeZone: 'UTC' })
}

function contarMeses(desde, hasta) {
  if (!desde || !hasta || desde > hasta) return 0
  const [anioInicio, mesInicio] = desde.split('-').map(Number)
  const [anioFin, mesFin] = hasta.split('-').map(Number)
  return (anioFin - anioInicio) * 12 + mesFin - mesInicio + 1
}

function Distribucion() {
  const { perfil } = useAuth()
  const { empresaActual } = useEmpresa()
  const esAdmin = perfil?.permiso?.nombre === 'ADMIN'
  const [empresas, setEmpresas] = useState([])
  const [cargandoEmpresas, setCargandoEmpresas] = useState(true)
  const [empresaLocal, setEmpresaLocal] = useState('')
  const [errorEmpresas, setErrorEmpresas] = useState('')
  const [desde, setDesde] = useState(mesActual())
  const [hasta, setHasta] = useState(mesActual())
  const [mesReapertura, setMesReapertura] = useState('')

  useEffect(() => {
    let activo = true
    obtenerEmpresasDistribucion()
      .then((data) => { if (activo) setEmpresas(data) })
      .catch((error) => {
        console.error('Error cargando empresas para Distribución:', error)
        if (activo) setErrorEmpresas(error?.message || 'No se pudieron cargar las empresas autorizadas.')
      })
      .finally(() => { if (activo) setCargandoEmpresas(false) })
    return () => { activo = false }
  }, [])

  useEffect(() => {
    if (!empresaActual && !empresaLocal && empresas.length > 0) {
      setEmpresaLocal(String(empresas[0].id_empresa))
    }
  }, [empresaActual, empresaLocal, empresas])

  const idEmpresa = empresaActual?.id_empresa ?? empresaLocal
  const distribucion = useDistribucionRango(idEmpresa, desde, hasta)
  const nivel = perfil?.modulos?.find((modulo) => modulo.codigo === 'DISTRIBUCION')?.nivel
  const puedeEditar = esAdmin || nivel === 'WRITER'
  const cantidadMesesRango = contarMeses(desde, hasta)
  const mesesRangoValido = Boolean(desde && hasta && desde >= '2017-01' && hasta >= '2017-01' && desde <= hasta && cantidadMesesRango <= 3)

  const centros = useMemo(() => {
    const mapa = new Map()
    distribucion.periodos.forEach((periodo) => periodo.filas.forEach((fila) => {
      const clave = String(fila.cod_cc_pk_dist)
      if (!mapa.has(clave)) mapa.set(clave, {
        cod_cc_pk_dist: fila.cod_cc_pk_dist,
        descripcion_cc: fila.descripcion_cc,
      })
    }))
    return [...mapa.values()].sort((a, b) => Number(a.cod_cc_pk_dist) - Number(b.cod_cc_pk_dist))
  }, [distribucion.periodos])

  const resumenes = useMemo(() => distribucion.periodos.map((periodo) => {
    const validacion = validarPorcentajeContable(periodo.filas)
    const sumaHectareas = periodo.filas.reduce((suma, fila) => suma + Number(fila.num_hec || 0), 0)
    const sumaHectareasDist = periodo.filas.reduce((suma, fila) => suma + Number(fila.porcentaje_hec || 0), 0)
    return { ...periodo, validacion, sumaHectareas, sumaHectareasDist }
  }), [distribucion.periodos])

  const periodosAbiertos = resumenes.filter((periodo) => periodo.estado?.estado !== 'CERRADO')
  const todosValidos = periodosAbiertos.length > 0 && periodosAbiertos.every((periodo) => periodo.validacion.valido)

  const guardarTodos = async () => {
    await distribucion.guardar(periodosAbiertos.map((periodo) => periodo.mes))
  }

  const cerrarMes = async (periodo) => {
    if (!periodo.validacion.valido) return
    await distribucion.guardar([periodo.mes], periodo.mes)
  }

  const confirmarReapertura = async () => {
    const correcto = await distribucion.reabrir(mesReapertura)
    if (correcto) setMesReapertura('')
  }

  return (
    <CompactModuleTheme>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', maxHeight: '100%', minHeight: 0, overflow: 'hidden' }}>
        <PageHeader
          icon={<PercentIcon />}
          title="Distribución por período"
          description="Consulta y actualiza los porcentajes contables y la participación de hectáreas por centro de costo."
        />

        <Paper variant="outlined" sx={{ p: 1, borderRadius: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {!empresaActual && empresas.length > 0 && (
            <TextField select size="small" label="Empresa" value={empresaLocal} onChange={(e) => setEmpresaLocal(e.target.value)} sx={{ minWidth: 240 }}>
              {empresas.map((empresa) => (
                <MenuItem key={empresa.id_empresa} value={String(empresa.id_empresa)}>
                  {empresa.nombre_comercial || empresa.descripcion}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField size="small" type="month" label="Desde" value={desde} onChange={(e) => setDesde(e.target.value)} slotProps={{ htmlInput: { min: '2017-01' } }} InputLabelProps={{ shrink: true }} sx={{ width: 165, '& input::-webkit-calendar-picker-indicator': { filter: 'invert(38%) sepia(66%) saturate(568%) hue-rotate(92deg) brightness(91%) contrast(91%)', opacity: 1, cursor: 'pointer' } }} />
          <TextField size="small" type="month" label="Hasta" value={hasta} onChange={(e) => setHasta(e.target.value)} slotProps={{ htmlInput: { min: '2017-01' } }} InputLabelProps={{ shrink: true }} sx={{ width: 165, '& input::-webkit-calendar-picker-indicator': { filter: 'invert(38%) sepia(66%) saturate(568%) hue-rotate(92deg) brightness(91%) contrast(91%)', opacity: 1, cursor: 'pointer' } }} />
          <Alert severity="info" sx={{ py: 0, ml: 'auto', flex: '1 1 260px', '& .MuiAlert-message': { py: 0.4, fontSize: '0.8rem' } }}>
            {mesesRangoValido
              ? `Se consultarán ${cantidadMesesRango} ${cantidadMesesRango === 1 ? 'mes' : 'meses'}. Las hectáreas consideran campañas operativas al último día de cada mes.`
              : desde < '2017-01' || hasta < '2017-01'
                ? 'El rango debe iniciar en enero de 2017 o después.'
                : desde > hasta
                  ? 'El mes inicial debe ser anterior o igual al mes final.'
                  : 'Para editar, selecciona un rango máximo de 3 meses.'}
          </Alert>
        </Paper>

        {errorEmpresas && <Alert severity="error">{errorEmpresas}</Alert>}
        {cargandoEmpresas && <Alert severity="info">Cargando empresas autorizadas...</Alert>}
        {!cargandoEmpresas && !errorEmpresas && empresas.length === 0 && <Alert severity="warning">No tienes empresas habilitadas para Distribución.</Alert>}
        {distribucion.error && <Alert severity="error">{distribucion.error}</Alert>}
        {distribucion.mensaje && <Alert severity="success">{distribucion.mensaje}</Alert>}

        <Paper variant="outlined" sx={{ p: 0.50, borderRadius: 1, minHeight: 0, flex: '1 1 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(250px, 0.75fr) minmax(320px, 1.25fr)' }, alignItems: 'center', gap: 0.75, px: 0.25, pb: 0.75 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>Distribución por centro de costo</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', lineHeight: 1.2 }}>
                Cada mes debe sumar 100.0000 %. Los centros con porcentaje 0 no participan en el reparto por hectáreas.
              </Typography>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" useFlexGap flexWrap="wrap" justifyContent={{ xs: 'flex-start', lg: 'flex-end' }} spacing={0.5}>
                {resumenes.map((periodo) => {
                  const cerrado = periodo.estado?.estado === 'CERRADO'
                  const valido = periodo.validacion.valido
                  return (
                    <Paper key={periodo.mes} variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 0.45, px: 0.55, py: 0.2, borderRadius: 0.75 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.67rem', whiteSpace: 'nowrap' }}>
                        {etiquetaMes(periodo.mes, { month: 'short', year: '2-digit' })}
                      </Typography>
                      <Tooltip title={periodo.validacion.mensaje || 'Suma contable del mes'}>
                        <Typography variant="caption" color={valido ? 'success.main' : 'error.main'} sx={{ fontSize: '0.67rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {(periodo.validacion.total * 100).toFixed(2)}%
                        </Typography>
                      </Tooltip>
                      <Chip size="small" label={cerrado ? 'Cerrado' : valido ? 'Válido' : 'Error'} color={cerrado || valido ? 'success' : 'error'} sx={{ height: 19, '& .MuiChip-label': { px: 0.65, fontSize: '0.62rem' } }} />
                      {esAdmin && cerrado && (
                        <Tooltip title={`Reabrir ${etiquetaMes(periodo.mes)}`}>
                          <span>
                            <IconButton size="small" color="warning" aria-label={`Reabrir ${periodo.mes}`} onClick={() => setMesReapertura(periodo.mes)} disabled={distribucion.guardando} sx={{ p: 0.25 }}>
                              <ReopenIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      {puedeEditar && !cerrado && (
                        <Tooltip title={valido ? `Guardar y cerrar ${etiquetaMes(periodo.mes)}` : periodo.validacion.mensaje}>
                          <span>
                            <IconButton size="small" color="success" aria-label={`Guardar y cerrar ${periodo.mes}`} onClick={() => void cerrarMes(periodo)} disabled={!valido || distribucion.guardando} sx={{ p: 0.25 }}>
                              <CloseIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Paper>
                  )
                })}
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={() => void guardarTodos()}
                  disabled={!puedeEditar || distribucion.cargando || distribucion.guardando || !todosValidos}
                  sx={{ minHeight: 27, px: 1, fontSize: '0.7rem' }}
                >
                  {distribucion.guardando ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </Stack>
            </Box>
          </Box>

          <TableContainer sx={{ flex: '1 1 auto', minHeight: 0, maxHeight: 'none', overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small" stickyHeader sx={{
              minWidth: Math.max(550, 348 + resumenes.length * 324),
              '& .MuiTableCell-root': { px: 0.45, py: 0.12, fontSize: '0.68rem' },
              '& .MuiTableCell-head': { fontSize: '0.67rem', lineHeight: 1.15 },
            }}>
              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2} sx={{ position: 'sticky', left: 0, zIndex: 5, width: 130, minWidth: 130, maxWidth: 130, bgcolor: 'background.paper' }}>COD_CC_PK_DIST</TableCell>
                  <TableCell rowSpan={2} sx={{ position: 'sticky', left: 130, zIndex: 5, width: 205, minWidth: 205, maxWidth: 205, bgcolor: 'background.paper', boxShadow: '2px 0 3px rgba(0,0,0,0.08)' }}>Centro de costo</TableCell>
                  {resumenes.map((periodo) => (
                    <TableCell key={periodo.mes} align="center" colSpan={3} sx={{ minWidth: 324, bgcolor: 'action.hover', fontWeight: 700, borderLeft: '2px solid', borderRight: '2px solid', borderColor: 'divider' }}>
                      {etiquetaMes(periodo.mes)}{periodo.estado?.estado === 'CERRADO' ? ' · Cerrado' : ''}
                    </TableCell>
                  ))}
                  {resumenes.length === 0 && <TableCell align="center">Selecciona un rango para mostrar los meses</TableCell>}
                </TableRow>
                <TableRow>
                  {resumenes.flatMap((periodo) => [
                    <TableCell key={`${periodo.mes}-num-hec`} align="right" sx={{ minWidth: 100, borderLeft: '2px solid', borderColor: 'divider' }}>Hectáreas</TableCell>,
                    <TableCell key={`${periodo.mes}-porcentaje`} align="right" sx={{ minWidth: 112 }}>Porcentaje</TableCell>,
                    <TableCell key={`${periodo.mes}-porcentaje-hec`} align="right" sx={{ minWidth: 112, borderRight: '2px solid', borderColor: 'divider' }}>Porc. Hec</TableCell>,
                  ])}
                </TableRow>
              </TableHead>
              <TableBody>
                {centros.map((centro) => (
                  <TableRow key={centro.cod_cc_pk_dist} hover>
                    <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, width: 130, minWidth: 130, maxWidth: 130, bgcolor: 'background.paper', 'tr.MuiTableRow-hover:hover &': { bgcolor: 'action.hover' } }}>{centro.cod_cc_pk_dist}</TableCell>
                    <TableCell sx={{ position: 'sticky', left: 130, zIndex: 2, width: 205, minWidth: 205, maxWidth: 205, bgcolor: 'background.paper', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxShadow: '2px 0 3px rgba(0,0,0,0.08)', 'tr.MuiTableRow-hover:hover &': { bgcolor: 'action.hover' } }}>{centro.descripcion_cc || '—'}</TableCell>
                    {resumenes.flatMap((periodo) => {
                      const fila = periodo.filas.find((item) => Number(item.cod_cc_pk_dist) === Number(centro.cod_cc_pk_dist))
                      if (!fila) return [
                        <TableCell key={`${periodo.mes}-${centro.cod_cc_pk_dist}-num-hec`} align="right" sx={{ borderLeft: '2px solid', borderColor: 'divider' }}>—</TableCell>,
                        <TableCell key={`${periodo.mes}-${centro.cod_cc_pk_dist}-pct`} align="right">—</TableCell>,
                        <TableCell key={`${periodo.mes}-${centro.cod_cc_pk_dist}-porcentaje-hec`} align="right" sx={{ borderRight: '2px solid', borderColor: 'divider' }}>—</TableCell>,
                      ]
                      const cerrado = periodo.estado?.estado === 'CERRADO'
                      return [
                        <TableCell key={`${periodo.mes}-${centro.cod_cc_pk_dist}-num-hec`} align="right" sx={{ borderLeft: '2px solid', borderColor: 'divider' }}>
                          {mostrarHectareas(fila.num_hec)}
                        </TableCell>,
                        <TableCell key={`${periodo.mes}-${centro.cod_cc_pk_dist}-pct`} align="right">
                          <TextField
                            size="small"
                            type="text"
                            value={fila.porcentaje_text ?? ''}
                            onChange={(event) => distribucion.cambiarPorcentaje(periodo.mes, centro.cod_cc_pk_dist, event.target.value)}
                            inputProps={{ inputMode: 'decimal', 'aria-label': `Porcentaje ${periodo.mes} centro ${centro.cod_cc_pk_dist}` }}
                            disabled={!puedeEditar || cerrado || distribucion.guardando}
                            sx={{ width: 90, '& .MuiInputBase-root': { height: 21 }, '& input': { px: 0.4, py: 0.1, textAlign: 'right', fontSize: '0.68rem' } }}
                          />
                        </TableCell>,
                        <TableCell key={`${periodo.mes}-${centro.cod_cc_pk_dist}-porcentaje-hec`} align="right" sx={{ borderRight: '2px solid', borderColor: 'divider' }}>
                          {(Number(fila.porcentaje_hec || 0) * 100).toFixed(4)}%
                        </TableCell>,
                      ]
                    })}
                  </TableRow>
                ))}
                {centros.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2 + Math.max(resumenes.length * 3, 1)} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      {distribucion.cargando ? 'Cargando meses y centros de costo…' : 'No hay centros LEVANTE en campaña para el rango seleccionado.'}
                    </TableCell>
                  </TableRow>
                )}
                {centros.length > 0 && (
                  <TableRow sx={{ '& td': { fontWeight: 700, bgcolor: 'action.hover' } }}>
                    <TableCell colSpan={2} sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'action.hover' }}>Totales</TableCell>
                    {resumenes.flatMap((periodo) => [
                      <TableCell key={`${periodo.mes}-total-hectareas`} align="right" sx={{ borderLeft: '2px solid', borderColor: 'divider' }}>
                        {mostrarHectareas(periodo.sumaHectareas)}
                      </TableCell>,
                      <TableCell key={`${periodo.mes}-total-pct`} align="right">
                        {(periodo.filas.reduce((total, fila) => total + Number(fila.porcentaje || 0), 0) * 100).toFixed(4)}%
                      </TableCell>,
                      <TableCell key={`${periodo.mes}-total-porcentaje-hec`} align="right" sx={{ borderRight: '2px solid', borderColor: 'divider' }}>
                        {(periodo.sumaHectareasDist * 100).toFixed(4)}%
                      </TableCell>,
                    ])}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog open={Boolean(mesReapertura)} onClose={() => setMesReapertura('')}>
          <DialogTitle>Reabrir distribución</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Se reabrirá {mesReapertura && etiquetaMes(mesReapertura)} y todos los meses posteriores de esta empresa. Los cierres de otras empresas no cambiarán.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMesReapertura('')} disabled={distribucion.guardando}>Cancelar</Button>
            <Button color="warning" variant="contained" onClick={() => void confirmarReapertura()} disabled={distribucion.guardando}>Confirmar reapertura</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </CompactModuleTheme>
  )
}

export default Distribucion
