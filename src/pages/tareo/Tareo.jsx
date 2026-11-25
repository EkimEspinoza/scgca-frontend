// Compone la pantalla Tareo y conecta sus componentes.
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  AccessTime as TareoIcon,
  FactCheck as PendingIcon,
  ListAlt as LoadedIcon,
  Summarize as SummaryIcon,
} from '@mui/icons-material'

import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import PageHeader from '../../components/common/PageHeader'
import TareoFilters from '../../components/tareo/TareoFilters'
import TareoForm from '../../components/tareo/TareoForm'
import TareoImportDialog from '../../components/tareo/TareoImportDialog'
import TareoTable from '../../components/tareo/TareoTable'
import TareoResumenTable from '../../components/tareo/TareoResumenTable'
import { useAuth } from '../../context/useAuth'
import { useEmpresa } from '../../context/useEmpresa'
import { supabase } from '../../lib/supabase'
import { actualizarEstadoMovimientoTareo, actualizarMovimientoTareo, buscarPartesTareoAusentes, contarMovimientosTareo, importarMovimientosTareo, inactivarMovimientosTareo, listarMovimientosTareo, obtenerOpcionesFiltrosTareo, obtenerResumenMensualTareo } from '../../services/tareoService'
import { useTareoSummary } from '../../hooks/useTareoSummary'

function Tareo() {
  const { perfil } = useAuth()
  const { empresaActual, empresas, loading: empresasCargando, error: errorEmpresas } = useEmpresa()
  const [pestana, setPestana] = useState(0)
  const [filas, setFilas] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [centroCostoFiltro, setCentroCostoFiltro] = useState('')
  const [maquinariaFiltro, setMaquinariaFiltro] = useState('')
  const [opcionesFiltros, setOpcionesFiltros] = useState({ centros: [], maquinarias: [] })
  const [opcionesCargando, setOpcionesCargando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const anioInicial = String(new Date().getFullYear())
  const [fechaDesde, setFechaDesde] = useState(`${anioInicial}-01-01`)
  const [fechaHasta, setFechaHasta] = useState(`${anioInicial}-12-31`)
  const [anio, setAnio] = useState(anioInicial)
  const [archivoImportacion, setArchivoImportacion] = useState(null)
  const [resultadoImportacion, setResultadoImportacion] = useState(null)
  const [buscandoAusentes, setBuscandoAusentes] = useState(false)
  const [importando, setImportando] = useState(false)
  const [empresasComplementarias, setEmpresasComplementarias] = useState([])
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(25)
  const [registroEditar, setRegistroEditar] = useState(null)
  const [registroCambioEstado, setRegistroCambioEstado] = useState(null)
  const [errorCambioEstado, setErrorCambioEstado] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState(null)
  const cargarFilasRef = useRef(null)
  const idEmpresa = empresaActual?.id_empresa ?? null
  const { resumen, setResumen, filasResumen, cargandoResumen, cargarResumenMensual } = useTareoSummary({
    pestana, idEmpresa, fechaDesde, fechaHasta, setError,
  })
  const empresasTabla = [...empresas, ...empresasComplementarias]
  const nivelModulo = perfil?.modulos?.find((modulo) => modulo.codigo === 'MOV_TAREO')?.nivel
  const esAdmin = perfil?.permiso?.nombre === 'ADMIN'
  const puedeEditar = esAdmin || nivelModulo === 'WRITER'

  const cargarFilas = useCallback(async () => {
    if (pestana === 3) {
      setFilas([])
      setTotal(0)
      setCargando(false)
      return
    }
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setFilas([])
      setTotal(0)
      setCargando(false)
      return
    }
    setCargando(true)
    setError('')
    try {
      const resultado = await listarMovimientosTareo({
        pendientes: pestana === 2,
        enProceso: pestana === 1,
        idEmpresa,
        fechaDesde,
        fechaHasta,
        busqueda,
        estado: estadoFiltro,
        centroCostoFiltro,
        maquinariaFiltro,
        pagina,
        filasPorPagina,
      })
      setFilas(resultado.filas)
      setTotal(resultado.total)
    } catch (err) {
      console.error('Error cargando la lista de Tareo:', err)
      setError(err?.message || 'No se pudieron cargar los movimientos de Tareo.')
      setFilas([])
      setTotal(0)
    } finally {
      setCargando(false)
    }
  }, [pestana, idEmpresa, fechaDesde, fechaHasta, busqueda, estadoFiltro, centroCostoFiltro, maquinariaFiltro, pagina, filasPorPagina])

  useEffect(() => { void cargarFilas() }, [cargarFilas])

  useEffect(() => {
    let vigente = true
    if (pestana === 3) {
      setOpcionesFiltros({ centros: [], maquinarias: [] })
      setOpcionesCargando(false)
      return () => { vigente = false }
    }
    setOpcionesCargando(true)
    obtenerOpcionesFiltrosTareo({ pendientes: pestana === 2, enProceso: pestana === 1, idEmpresa, fechaDesde, fechaHasta })
      .then((opciones) => { if (vigente) setOpcionesFiltros(opciones) })
      .catch((err) => { if (vigente) setError(err?.message || 'No se pudieron cargar las opciones de filtros.') })
      .finally(() => { if (vigente) setOpcionesCargando(false) })
    return () => { vigente = false }
  }, [pestana, idEmpresa, fechaDesde, fechaHasta])

  useEffect(() => {
    if (opcionesCargando) return
    if (centroCostoFiltro && !opcionesFiltros.centros.some((opcion) => opcion.value === centroCostoFiltro)) {
      setCentroCostoFiltro('')
      setPagina(0)
    }
    if (maquinariaFiltro && !opcionesFiltros.maquinarias.some((opcion) => opcion.value === maquinariaFiltro)) {
      setMaquinariaFiltro('')
      setPagina(0)
    }
  }, [opcionesCargando, opcionesFiltros, centroCostoFiltro, maquinariaFiltro])

  useEffect(() => {
    if (idEmpresa || !filas.length) {
      setEmpresasComplementarias([])
      return undefined
    }

    const empresasConocidas = new Set(empresas.map((empresa) => Number(empresa.id_empresa)))
    const idsFaltantes = [...new Set(filas.map((fila) => Number(fila.id_empresa)).filter((id) => Number.isFinite(id) && !empresasConocidas.has(id)))]
    if (!idsFaltantes.length) {
      setEmpresasComplementarias([])
      return undefined
    }

    let vigente = true
    supabase
      .from('Dim_Empresa')
      .select('id_empresa,nombre_comercial,descripcion')
      .in('id_empresa', idsFaltantes)
      .then(({ data, error: errorEmpresas }) => {
        if (errorEmpresas) throw errorEmpresas
        if (vigente) setEmpresasComplementarias(data ?? [])
      })
      .catch((errorEmpresas) => {
        console.error('No se pudieron resolver los nombres de empresa para Tareo:', errorEmpresas)
        if (vigente) setEmpresasComplementarias([])
      })

    return () => { vigente = false }
  }, [empresas, filas, idEmpresa])

  useEffect(() => {
    cargarFilasRef.current = cargarFilas
  }, [cargarFilas])

  useEffect(() => {
    const filtro = idEmpresa ? { filter: `id_empresa=eq.${Number(idEmpresa)}` } : {}
    const actualizarListas = () => {
      void cargarFilasRef.current?.()
      if (pestana === 3) void cargarResumenMensual()
      contarMovimientosTareo(idEmpresa, fechaDesde, fechaHasta)
        .then(setResumen)
        .catch((err) => console.error('Error actualizando los totales de Tareo:', err))
    }

    const canal = supabase
      .channel(`mov-tareo-${idEmpresa ?? 'todas'}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mov_tareo', ...filtro }, actualizarListas)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mov_tareo', ...filtro }, actualizarListas)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mov_tareo_proceso', ...filtro }, actualizarListas)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mov_tareo_proceso', ...filtro }, actualizarListas)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mov_tareo_proceso', ...filtro }, actualizarListas)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mov_tareo_pendiente', ...filtro }, actualizarListas)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mov_tareo_pendiente', ...filtro }, actualizarListas)
      .subscribe()

    return () => { void supabase.removeChannel(canal) }
  }, [idEmpresa, fechaDesde, fechaHasta, pestana, cargarResumenMensual])

  const cambiarPestana = (_event, valor) => {
    setPestana(valor)
    setPagina(0)
    setCentroCostoFiltro('')
    setMaquinariaFiltro('')
  }

  const cambiarAnio = (valor) => {
    setAnio(valor)
    setPagina(0)
    setFechaDesde(`${valor}-01-01`)
    setFechaHasta(`${valor}-12-31`)
  }

  const cambiarRangoFecha = (lado, valor) => {
    if (lado === 'desde') setFechaDesde(valor)
    else setFechaHasta(valor)
    const fechaBase = lado === 'desde' ? (valor || fechaHasta) : (valor || fechaDesde)
    setAnio(fechaBase ? fechaBase.slice(0, 4) : String(new Date().getFullYear()))
    setPagina(0)
  }

  const cambiarFilasPorPagina = (event) => {
    setFilasPorPagina(Number(event.target.value))
    setPagina(0)
  }

  const exportarExcel = async () => {
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) { setError('El mes inicial no puede ser posterior al mes final.'); return }
    setExportando(true)
    setError('')
    try {
      if (pestana === 3) {
        const filasResumenActualizadas = await obtenerResumenMensualTareo({ idEmpresa, fechaDesde, fechaHasta })
        const { exportarResumenMensualTareoExcel } = await import('../../services/excelService')
        exportarResumenMensualTareoExcel(filasResumenActualizadas)
        return
      }
      const filtros = { pendientes: pestana === 2, enProceso: pestana === 1, idEmpresa, fechaDesde, fechaHasta, busqueda, estado: estadoFiltro, centroCostoFiltro, maquinariaFiltro }
      const lote = 1000
      const primeraPagina = await listarMovimientosTareo({ ...filtros, pagina: 0, filasPorPagina: lote })
      const todasLasFilas = [...primeraPagina.filas]
      const paginas = Math.ceil(primeraPagina.total / lote)
      for (let numeroPagina = 1; numeroPagina < paginas; numeroPagina += 1) {
        const siguiente = await listarMovimientosTareo({ ...filtros, pagina: numeroPagina, filasPorPagina: lote })
        if (!siguiente.filas.length) break
        todasLasFilas.push(...siguiente.filas)
      }
      const empresasPorId = new Map(empresasTabla.map((empresa) => [Number(empresa.id_empresa), empresa]))
      const filasExportables = todasLasFilas.map((fila) => ({ ...fila, empresa: empresasPorId.get(Number(fila.id_empresa)) ?? null }))
      const { exportarMovimientosTareoExcel } = await import('../../services/excelService')
      exportarMovimientosTareoExcel(filasExportables, pestana === 2, pestana === 1 ? 'Mov_Tareo_En_Proceso' : 'Mov_Tareo_Procesados')
    } catch (err) {
      console.error('Error exportando registros de Tareo:', err)
      setError(err?.message || 'No se pudieron exportar los registros a Excel.')
    } finally { setExportando(false) }
  }

  const guardarEdicion = async (valores) => {
    if (!registroEditar) return
    setGuardando(true)
    try {
      await actualizarMovimientoTareo(registroEditar.id_mov_tareo, valores, pestana === 2)
      setRegistroEditar(null)
      await cargarFilas()
      const totales = await contarMovimientosTareo(idEmpresa, fechaDesde, fechaHasta)
      setResumen(totales)
    } finally {
      setGuardando(false)
    }
  }

  const solicitarCambioEstado = (fila) => {
    setErrorCambioEstado('')
    setRegistroCambioEstado(fila)
  }

  const confirmarCambioEstado = async () => {
    if (!registroCambioEstado) return
    const fila = registroCambioEstado
    const estado = Number(fila.estado) === 1 ? 0 : 1
    setCambiandoEstadoId(fila.id_mov_tareo)

    try {
      await actualizarEstadoMovimientoTareo(fila.id_mov_tareo, estado, pestana === 2)
      setFilas((actuales) => actuales.map((item) => item.id_mov_tareo === fila.id_mov_tareo ? { ...item, estado } : item))
      setRegistroCambioEstado(null)
    } catch (err) {
      console.error('Error actualizando el estado del movimiento de Tareo:', err)
      setErrorCambioEstado(err?.message || 'No se pudo actualizar el estado del movimiento.')
    } finally {
      setCambiandoEstadoId(null)
    }
  }

  const buscarAusentes = useCallback(async (empresaId, desde, hasta, partesArchivo) => {
    setBuscandoAusentes(true)
    try {
      return await buscarPartesTareoAusentes(empresaId, desde, hasta, partesArchivo)
    } finally {
      setBuscandoAusentes(false)
    }
  }, [])

  const procesarImportacion = useCallback(async ({ registros, idsParaInactivar, duplicadosConsolidados, motivoAusencia, alProgresar }) => {
    setImportando(true)
    try {
      const totales = await importarMovimientosTareo(registros, alProgresar)
      const inactivados = idsParaInactivar.length ? await inactivarMovimientosTareo(idsParaInactivar, motivoAusencia) : 0
      await cargarFilas()
      const resumenActualizado = await contarMovimientosTareo(idEmpresa, fechaDesde, fechaHasta)
      setResumen(resumenActualizado)
      setResultadoImportacion({ ...totales, duplicadosConsolidados, inactivados })
      setArchivoImportacion(null)
    } finally {
      setImportando(false)
    }
  }, [cargarFilas, fechaDesde, fechaHasta, idEmpresa])

  return (
    <CompactModuleTheme>
      <Box className="app-module-flow tareo-module" sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', minHeight: 0, maxWidth: 1600, width: '100%', mx: 'auto' }}>
        <Box className="tareo-header">
          <PageHeader
            icon={<TareoIcon sx={{ color: 'primary.main' }} />}
            title="Tareo de maquinaria"
            description="Consulta las horas trabajadas por maquinaria en los centros de costo de inversión."
            sx={{ mb: 0, minWidth: 0 }}
          />
          <Box className="tareo-tabs">
            <Tabs value={pestana} onChange={cambiarPestana} aria-label="Listas de Tareo" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
              <Tab icon={<LoadedIcon sx={{ fontSize: 18 }} />} iconPosition="start" aria-label={`Procesados: ${resumen.registros.toLocaleString('es-PE')} según filtros`} label={<Tooltip title="Registros procesados según empresa, año y fechas seleccionadas"><Badge className="tareo-tab-count tareo-tab-count--loaded" badgeContent={resumen.registros.toLocaleString('es-PE')} max={999999}>Procesados</Badge></Tooltip>} />
              <Tab icon={<PendingIcon sx={{ fontSize: 18 }} />} iconPosition="start" aria-label={`En proceso: ${resumen.enProceso.toLocaleString('es-PE')} según filtros`} label={<Tooltip title="Registros válidos esperando que se resuelvan todos los pendientes de la empresa y el año"><Badge className="tareo-tab-count tareo-tab-count--pending-zero" badgeContent={resumen.enProceso.toLocaleString('es-PE')} max={999999}>En proceso</Badge></Tooltip>} />
              <Tab icon={<PendingIcon sx={{ fontSize: 18 }} />} iconPosition="start" aria-label={`Pendientes: ${resumen.pendientes.toLocaleString('es-PE')} según filtros`} label={<Tooltip title="Registros con observaciones según empresa, año y fechas seleccionadas"><Badge className={`tareo-tab-count ${resumen.pendientes > 0 ? 'tareo-tab-count--pending' : 'tareo-tab-count--pending-zero'}`} badgeContent={resumen.pendientes.toLocaleString('es-PE')} max={999999}>Pendientes</Badge></Tooltip>} />
              <Tab icon={<SummaryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Resumen" aria-label="Resumen mensual de registros por empresa" />
            </Tabs>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ minWidth: 0, flexShrink: 0 }}>
          <TareoFilters
            busqueda={busqueda}
            onBusqueda={(valor) => { setBusqueda(valor); setPagina(0) }}
            centroCostoFiltro={centroCostoFiltro}
            onCentroCostoFiltro={(valor) => { setCentroCostoFiltro(valor); setPagina(0) }}
            opcionesCentroCosto={opcionesFiltros.centros}
            maquinariaFiltro={maquinariaFiltro}
            onMaquinariaFiltro={(valor) => { setMaquinariaFiltro(valor); setPagina(0) }}
            opcionesMaquinaria={opcionesFiltros.maquinarias}
            opcionesCargando={opcionesCargando}
            estado={estadoFiltro}
            onEstadoChange={(valor) => { setEstadoFiltro(valor); setPagina(0) }}
            anio={anio}
            onAnioChange={cambiarAnio}
            onCargarArchivo={(file) => { setResultadoImportacion(null); setArchivoImportacion(file) }}
            puedeCargar={esAdmin}
            mostrarCarga={pestana === 1}
            modoResumen={pestana === 3}
            fechaDesde={fechaDesde}
            onFechaDesde={(valor) => cambiarRangoFecha('desde', valor)}
            fechaHasta={fechaHasta}
            onFechaHasta={(valor) => cambiarRangoFecha('hasta', valor)}
            onExportar={exportarExcel}
            exportando={exportando}
            totalExportable={pestana === 3 ? filasResumen.length : total}
          />
        </Box>

        <Snackbar open={Boolean(resultadoImportacion)} autoHideDuration={9000} onClose={() => setResultadoImportacion(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setResultadoImportacion(null)} sx={{ width: '100%' }}>
            Importación finalizada: {resultadoImportacion?.procesados ?? 0} procesados, {resultadoImportacion?.en_proceso ?? 0} en proceso, {resultadoImportacion?.pendientes ?? 0} pendientes, {resultadoImportacion?.ya_existentes ?? 0} ya existentes ignorados, {resultadoImportacion?.duplicadosConsolidados ?? 0} duplicados consolidados y {resultadoImportacion?.inactivados ?? 0} inactivados.
          </Alert>
        </Snackbar>

        {archivoImportacion && <TareoImportDialog
          open
          file={archivoImportacion}
          empresas={empresas}
          empresasCargando={empresasCargando}
          errorEmpresas={errorEmpresas}
          empresaInicial={idEmpresa}
          buscandoAusentes={buscandoAusentes}
          onBuscarAusentes={buscarAusentes}
          onImportar={procesarImportacion}
          onClose={() => { if (!importando) setArchivoImportacion(null) }}
        />}

        {pestana === 3 ? <TareoResumenTable filas={filasResumen} cargando={cargandoResumen} /> : <TareoTable
          filas={filas}
          empresas={empresasTabla}
          mostrarEmpresa={!idEmpresa}
          pendientes={pestana === 2}
          enProceso={pestana === 1}
          cargando={cargando}
          total={total}
          pagina={pagina}
          filasPorPagina={filasPorPagina}
          onCambiarPagina={(_event, valor) => setPagina(valor)}
          onCambiarFilasPorPagina={cambiarFilasPorPagina}
          puedeEditar={puedeEditar && pestana !== 1}
          onEditar={setRegistroEditar}
          onCambiarEstado={solicitarCambioEstado}
          cambiandoEstadoId={cambiandoEstadoId}
        />}
        <Dialog open={Boolean(registroCambioEstado)} onClose={cambiandoEstadoId ? undefined : () => setRegistroCambioEstado(null)} fullWidth maxWidth="xs">
          <DialogTitle>{Number(registroCambioEstado?.estado) === 1 ? 'Desactivar tareo' : 'Activar tareo'}</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Deseas {Number(registroCambioEstado?.estado) === 1 ? 'desactivar' : 'activar'} el tareo {registroCambioEstado?.nro_parte}?
            </Typography>
            {errorCambioEstado && <Alert severity="error" sx={{ mt: 1.5 }}>{errorCambioEstado}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegistroCambioEstado(null)} disabled={Boolean(cambiandoEstadoId)}>Cancelar</Button>
            <Button
              variant="contained"
              color={Number(registroCambioEstado?.estado) === 1 ? 'warning' : 'success'}
              onClick={confirmarCambioEstado}
              disabled={Boolean(cambiandoEstadoId)}
            >
              {cambiandoEstadoId ? 'Guardando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </Dialog>
        <TareoForm
          open={Boolean(registroEditar)}
          registro={registroEditar}
          pendiente={pestana === 2}
          guardando={guardando}
          onClose={() => setRegistroEditar(null)}
          onGuardar={guardarEdicion}
        />
      </Box>
    </CompactModuleTheme>
  )
}

export default Tareo
