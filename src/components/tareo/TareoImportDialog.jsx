import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, InputLabel, LinearProgress, MenuItem, Select, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material'
import { obtenerEmpresas } from '../../services/empresaService'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function nombreEmpresa(empresa) {
  return empresa?.nombre_comercial?.trim() || ''
}

function mostrarFecha(fecha) {
  return fecha ? new Date(`${fecha}T00:00:00`).toLocaleDateString('es-PE') : '—'
}

export default function TareoImportDialog({ open, file, empresas = [], empresasCargando = false, errorEmpresas, empresaInicial, buscandoAusentes, onBuscarAusentes, onImportar, onClose }) {
  const [errorLectura, setErrorLectura] = useState('')
  const [empresasAlternativas, setEmpresasAlternativas] = useState([])
  const [cargandoEmpresasAlternativas, setCargandoEmpresasAlternativas] = useState(false)
  const [errorEmpresasAlternativas, setErrorEmpresasAlternativas] = useState(null)
  const consultaEmpresasRef = useRef('')
  const [moduloImportacion, setModuloImportacion] = useState(null)
  const [fuente, setFuente] = useState(null)
  const [empresaId, setEmpresaId] = useState(empresaInicial ? String(empresaInicial) : '')
  const [anio, setAnio] = useState('')
  const [mesCorte, setMesCorte] = useState('')
  const [revisionAusentes, setRevisionAusentes] = useState(null)
  const [seleccion, setSeleccion] = useState({ clave: '', ids: new Set() })
  const [reintentosRevision, setReintentosRevision] = useState(0)
  const [errorImportacion, setErrorImportacion] = useState('')
  const [progreso, setProgreso] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const idsEmpresasArchivo = useMemo(() => [...new Set([
    ...(fuente?.registros ?? []).map((row) => Number(row.id_empresa)),
    ...(fuente?.errores ?? []).map((row) => Number(row.id_empresa)),
  ].filter((id) => Number.isSafeInteger(id) && id > 0))].sort((a, b) => a - b), [fuente])
  const catalogoEmpresas = useMemo(() => [...new Map(
    [...empresas, ...empresasAlternativas].map((empresa) => [Number(empresa.id_empresa), empresa]),
  ).values()], [empresas, empresasAlternativas])
  const cargandoCatalogoEmpresas = cargandoEmpresasAlternativas || (empresasCargando && !catalogoEmpresas.length)
  const errorCatalogoEmpresas = errorEmpresasAlternativas || errorEmpresas
  const empresasArchivo = useMemo(() => idsEmpresasArchivo
    .map((id) => catalogoEmpresas.find((item) => Number(item.id_empresa) === id))
    .filter(Boolean), [catalogoEmpresas, idsEmpresasArchivo])
  const idsEmpresasNoEncontradas = idsEmpresasArchivo.filter((id) => !catalogoEmpresas.some((item) => Number(item.id_empresa) === id))
  const empresaSeleccionada = catalogoEmpresas.find((item) => Number(item.id_empresa) === Number(empresaId))
  const empresaEnCatalogo = Boolean(empresaSeleccionada?.nombre_comercial?.trim())
  const nombreEmpresaSeleccionada = empresaSeleccionada?.nombre_comercial?.trim() || ''
  const registrosEmpresa = useMemo(() => (fuente?.registros ?? []).filter((row) => Number(row.id_empresa) === Number(empresaId)), [fuente, empresaId])
  const erroresSinEmpresa = (fuente?.errores ?? []).filter((row) => row.id_empresa == null)
  const filasEmpresa = registrosEmpresa.reduce((total, row) => total + (row.filas_origen?.length ?? 1), 0)
  const duplicadosEmpresa = Math.max(0, filasEmpresa - registrosEmpresa.length)
  const registrosOtrasEmpresas = (fuente?.registros ?? []).filter((row) => Number(row.id_empresa) !== Number(empresaId)).length

  useEffect(() => {
    if (!open || !idsEmpresasArchivo.length) return undefined
    const claveConsulta = idsEmpresasArchivo.join(',')
    if (consultaEmpresasRef.current === claveConsulta) return undefined
    const faltanEmpresas = idsEmpresasArchivo.some((id) => !catalogoEmpresas.some((empresa) => Number(empresa.id_empresa) === id))
    if (!faltanEmpresas) return undefined

    let vigente = true
    consultaEmpresasRef.current = claveConsulta
    setCargandoEmpresasAlternativas(true)
    setErrorEmpresasAlternativas(null)
    obtenerEmpresas()
      .then((data) => { if (vigente) setEmpresasAlternativas(data) })
      .catch((error) => { if (vigente) setErrorEmpresasAlternativas(error) })
      .finally(() => { if (vigente) setCargandoEmpresasAlternativas(false) })
    return () => { vigente = false }
  }, [open, idsEmpresasArchivo, catalogoEmpresas])

  useEffect(() => {
    if (!open || !file) return undefined
    let vigente = true
    import('../../services/tareoImportService').then(async (modulo) => {
      const resultado = await modulo.leerArchivoTareo(file)
      return { modulo, resultado }
    }).then(({ modulo, resultado }) => {
      if (!vigente) return
      setModuloImportacion(modulo)
      setFuente(resultado)
      const idsEmpresas = [...new Set([
        ...resultado.registros.map((row) => Number(row.id_empresa)),
        ...resultado.errores.map((row) => Number(row.id_empresa)),
      ].filter((id) => Number.isSafeInteger(id) && id > 0))]
      if (idsEmpresas.length === 1) setEmpresaId(String(idsEmpresas[0]))
      else if (empresaInicial && idsEmpresas.includes(Number(empresaInicial))) setEmpresaId(String(empresaInicial))
      else setEmpresaId('')
      const anios = [...new Set(resultado.registros.map((row) => row.fecha_tareo.slice(0, 4)))].sort()
      if (anios.length) setAnio(anios.at(-1))
      const meses = resultado.registros.map((row) => Number(row.fecha_tareo.slice(5, 7)))
      if (meses.length) setMesCorte(String(Math.max(...meses)))
    }).catch((error) => {
      if (vigente) setErrorLectura(error?.message || 'No se pudo leer el archivo Excel.')
    })
    return () => { vigente = false }
  }, [open, file])

  const aniosDisponibles = useMemo(() => [...new Set((fuente?.registros ?? []).map((row) => row.fecha_tareo.slice(0, 4)))].sort(), [fuente])
  const periodo = useMemo(() => {
    if (!fuente || !moduloImportacion || !empresaId || !anio || !mesCorte) return null
    return moduloImportacion.aplicarEmpresaYPeriodoTareo(fuente, empresaId, anio, mesCorte)
  }, [fuente, moduloImportacion, empresaId, anio, mesCorte])

  const fechaDesdeRevision = periodo?.fechaDesde
  const fechaHastaRevision = periodo?.fechaHasta
  const partesArchivo = useMemo(() => periodo?.registros.map((row) => row.nro_parte) ?? [], [periodo])
  const claveRevision = periodo && empresaId ? `${empresaId}|${fechaDesdeRevision}|${fechaHastaRevision}|${partesArchivo.join('|')}` : ''
  const revisionActual = revisionAusentes?.clave === claveRevision ? revisionAusentes : null
  const ausentes = revisionActual?.filas ?? []
  const errorRevisionAusentes = revisionActual?.error ?? ''
  const seleccionados = seleccion.clave === claveRevision ? seleccion.ids : new Set()
  const leyendo = Boolean(open && file && !fuente && !errorLectura)

  useEffect(() => {
    if (!open || !periodo || !empresaEnCatalogo || periodo.errores.length || !periodo.registros.length) return undefined
    let vigente = true
    onBuscarAusentes(Number(empresaId), fechaDesdeRevision, fechaHastaRevision, partesArchivo)
      .then((filas) => { if (vigente) setRevisionAusentes({ clave: claveRevision, filas, error: '' }) })
      .catch((error) => { if (vigente) setRevisionAusentes({ clave: claveRevision, filas: [], error: error?.message || 'No se pudieron revisar los números de parte ya cargados.' }) })
    return () => { vigente = false }
  }, [open, empresaId, empresaEnCatalogo, periodo, fechaDesdeRevision, fechaHastaRevision, partesArchivo, claveRevision, onBuscarAusentes, reintentosRevision])

  const errorFilas = periodo?.errores ?? []
  const listo = Boolean(periodo && periodo.registros.length && empresaEnCatalogo && revisionActual && !errorFilas.length && !errorRevisionAusentes && !buscandoAusentes && !leyendo)

  const cambiarSeleccionAusente = (id) => {
    setSeleccion((actual) => {
      const actuales = actual.clave === claveRevision ? actual.ids : new Set()
      const siguiente = new Set(actuales)
      if (siguiente.has(id)) siguiente.delete(id)
      else siguiente.add(id)
      return { clave: claveRevision, ids: siguiente }
    })
  }

  const seleccionarTodos = () => {
    setSeleccion((actual) => ({
      clave: claveRevision,
      ids: (actual.clave === claveRevision ? actual.ids : new Set()).size === ausentes.length ? new Set() : new Set(ausentes.map((row) => row.id_mov_tareo)),
    }))
  }

  const confirmar = async () => {
    if (!listo) return
    setGuardando(true)
    setErrorImportacion('')
    setProgreso(null)
    try {
      await onImportar({
        idEmpresa: Number(empresaId),
        registros: periodo.registros,
        idsParaInactivar: [...seleccionados],
        duplicadosConsolidados: duplicadosEmpresa,
        motivoAusencia: `No aparece en el archivo acumulado ${file?.name?.slice(0, 160) || 'de Tareo'} (revisado hasta ${periodo.fechaHasta}).`,
        alProgresar: setProgreso,
      })
    } catch (error) {
      setErrorImportacion(error?.message || 'No se pudo completar la importación.')
    } finally {
      setGuardando(false)
      setProgreso(null)
    }
  }

  return (
    <Dialog open={open} onClose={guardando ? undefined : onClose} fullWidth maxWidth="md" aria-labelledby="tareo-import-title">
      <DialogTitle id="tareo-import-title">Importar Tareo desde Excel</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary" noWrap title={file?.name}>{file?.name}</Typography>
          {leyendo && <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={18} /><Typography variant="body2">Leyendo el archivo…</Typography></Stack>}
          {errorLectura && <Alert severity="error">{errorLectura}</Alert>}

          {fuente && !leyendo && !errorLectura && <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.4fr 0.8fr 1fr' }, gap: 1.25 }}>
              <FormControl size="small" fullWidth disabled={cargandoCatalogoEmpresas || !empresasArchivo.length}>
                <InputLabel id="tareo-import-company">Empresa</InputLabel>
                <Select labelId="tareo-import-company" label="Empresa" value={empresasArchivo.some((empresa) => String(empresa.id_empresa) === String(empresaId)) ? empresaId : ''} onChange={(event) => setEmpresaId(event.target.value)}>
                  {!empresaId && <MenuItem value="" disabled>Selecciona una empresa del archivo</MenuItem>}
                  {cargandoCatalogoEmpresas && <MenuItem value="" disabled>Cargando empresas…</MenuItem>}
                  {empresasArchivo.map((empresa) => <MenuItem key={empresa.id_empresa} value={String(empresa.id_empresa)} disabled={cargandoCatalogoEmpresas || !empresa.nombre_comercial?.trim()}>{nombreEmpresa(empresa)}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="tareo-import-year">Año</InputLabel>
                <Select labelId="tareo-import-year" label="Año" value={anio} onChange={(event) => setAnio(event.target.value)}>
                  {aniosDisponibles.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="tareo-import-cutoff">Cargar hasta</InputLabel>
                <Select labelId="tareo-import-cutoff" label="Cargar hasta" value={mesCorte} onChange={(event) => setMesCorte(event.target.value)}>
                  {MESES.map((mes, index) => <MenuItem key={mes} value={String(index + 1)}>{mes}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            {!empresaId && <Alert severity="warning">Selecciona la empresa del archivo para revisar sus permisos y evitar mezclar empresas.</Alert>}
            {cargandoCatalogoEmpresas && <Alert severity="info">Cargando empresas disponibles…</Alert>}
            {!cargandoCatalogoEmpresas && !catalogoEmpresas.length && <Alert severity="error">{errorCatalogoEmpresas?.message || 'No hay empresas activas disponibles para tu usuario; verifica su acceso y vuelve a intentarlo.'}</Alert>}
            {!cargandoCatalogoEmpresas && empresaId && !empresaEnCatalogo && <Alert severity="error">El ID_EMPRESA {empresaId} del archivo no corresponde a una empresa activa del catálogo.</Alert>}
            {!cargandoCatalogoEmpresas && idsEmpresasNoEncontradas.length > 0 && <Alert severity="warning">No se encontraron en el catálogo los ID_EMPRESA: {idsEmpresasNoEncontradas.join(', ')}. Esas filas no aparecerán como opciones de empresa.</Alert>}
            {!empresaId && erroresSinEmpresa.length > 0 && <Alert severity="error">Hay filas con ID_EMPRESA vacío o inválido. Corrige el identificador para determinar a qué empresa pertenece cada fila.</Alert>}
            {fuente && <Alert severity="info">
              {fuente.filasArchivo.toLocaleString('es-PE')} filas leídas; {empresaId && empresaEnCatalogo ? `${registrosEmpresa.length.toLocaleString('es-PE')} partes únicas de ${nombreEmpresaSeleccionada}` : `${fuente.registros.length.toLocaleString('es-PE')} partes únicas en el archivo`}; {duplicadosEmpresa.toLocaleString('es-PE')} duplicados de la empresa seleccionada se sumarán por horas.
              {empresaId && empresaEnCatalogo && idsEmpresasArchivo.length > 1 && ` Esta carga incluirá solo ${nombreEmpresaSeleccionada}; ${registrosOtrasEmpresas.toLocaleString('es-PE')} partes de las otras empresas se omitirán y podrás cargarlas seleccionándolas después.`}
              {periodo && ` Periodo comparado: enero a ${MESES[Number(mesCorte) - 1] ?? ''} de ${anio}.`}
              {' '}El archivo debe incluir el acumulado desde enero hasta el mes de corte.
            </Alert>}

            {errorFilas.length > 0 && <Alert severity="error">
              Se encontraron {errorFilas.length} observaciones de formato o periodo. Corrige el Excel antes de continuar.
              <Box component="ul" sx={{ my: 0.75, pl: 2.5, maxHeight: 150, overflow: 'auto' }}>
                {errorFilas.slice(0, 50).map((error, index) => <li key={`${error.fila}-${index}`}><Typography variant="caption">Fila {error.fila}, {error.nro_parte}: {error.motivo}</Typography></li>)}
              </Box>
              {errorFilas.length > 50 && <Typography variant="caption">Se muestran las primeras 50 observaciones.</Typography>}
            </Alert>}

            {periodo && !errorFilas.length && <>
              {buscandoAusentes && <Stack spacing={0.75}><LinearProgress /><Typography variant="caption" color="text.secondary">Comparando con registros activos de la empresa en el periodo…</Typography></Stack>}
              {!buscandoAusentes && !errorRevisionAusentes && <Alert severity={ausentes.length ? 'warning' : 'success'}>
                {ausentes.length
                  ? `${ausentes.length} registros procesados no aparecen en este nuevo archivo. Selecciona los que confirmas retirar; se conservarán en el historial.`
                  : 'No se detectaron registros procesados activos ausentes en el periodo cargado.'}
              </Alert>}
              {errorRevisionAusentes && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setReintentosRevision((valor) => valor + 1)}>Reintentar</Button>}>{errorRevisionAusentes}</Alert>}
              {ausentes.length > 0 && <>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2">Registros ausentes</Typography>
                  <Button size="small" onClick={seleccionarTodos}>{seleccionados.size === ausentes.length ? 'Quitar selección' : 'Seleccionar todos'}</Button>
                </Stack>
                <TableContainer sx={{ maxHeight: 220, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Table size="small" stickyHeader>
                    <TableHead><TableRow>
                      <TableCell padding="checkbox"><Checkbox checked={seleccionados.size === ausentes.length} indeterminate={seleccionados.size > 0 && seleccionados.size < ausentes.length} onChange={seleccionarTodos} inputProps={{ 'aria-label': 'Seleccionar todos los registros ausentes' }} /></TableCell>
                      <TableCell>Nro. parte</TableCell><TableCell>Fecha</TableCell>
                    </TableRow></TableHead>
                    <TableBody>{ausentes.slice(0, 500).map((row) => <TableRow key={row.id_mov_tareo} hover>
                      <TableCell padding="checkbox"><Checkbox checked={seleccionados.has(row.id_mov_tareo)} onChange={() => cambiarSeleccionAusente(row.id_mov_tareo)} inputProps={{ 'aria-label': `Retirar tareo ${row.nro_parte}` }} /></TableCell>
                      <TableCell>{row.nro_parte}</TableCell><TableCell>{mostrarFecha(row.fecha_tareo)}</TableCell>
                    </TableRow>)}</TableBody>
                  </Table>
                </TableContainer>
                {ausentes.length > 500 && <Typography variant="caption" color="text.secondary">Se listan los primeros 500 ausentes para revisión; la selección masiva incluye todos.</Typography>}
              </>}
            </>}
          </>}

          {errorImportacion && <Alert severity="error">{errorImportacion}</Alert>}
          {guardando && progreso && <Box><LinearProgress variant="determinate" value={(progreso.loteActual / progreso.lotesTotales) * 100} /><Typography variant="caption">Procesando lote {progreso.loteActual} de {progreso.lotesTotales}…</Typography></Box>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button variant="contained" onClick={confirmar} disabled={!listo || guardando}>
          {guardando ? 'Importando…' : `Importar ${periodo?.registros.length.toLocaleString('es-PE') ?? 0} registros`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
