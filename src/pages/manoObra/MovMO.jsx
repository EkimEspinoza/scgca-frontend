import { useCallback, useEffect, useState } from 'react'
import { Alert, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, Typography } from '@mui/material'
import { FactCheck, ListAlt, PendingActions, Person, Summarize } from '@mui/icons-material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import PageHeader from '../../components/common/PageHeader'
import MovMOFilters from '../../components/movMO/MovMOFilters'
import MovMOTable from '../../components/movMO/MovMOTable'
import MovMOForm from '../../components/movMO/MovMOForm'
import MovMOResumenTable from '../../components/movMO/MovMOResumenTable'
import { useEmpresa } from '../../context/useEmpresa'
import { actualizarEstadoMovimientoMO, actualizarMovimientoMO, contarMovimientosMO, crearMovimientoMO, listarMovimientosMO, obtenerOpcionesFiltrosMO, obtenerResumenMensualMO } from '../../services/movMOService'

export default function MovMO() {
  const { empresaActual } = useEmpresa()
  const [pestana, setPestana] = useState(0)
  const [resumen, setResumen] = useState({ procesados: 0, enProceso: 0, pendientes: 0 })
  const [filas, setFilas] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [tipoCentroId, setTipoCentroId] = useState('')
  const [centroCostoPk, setCentroCostoPk] = useState('')
  const [grupoLaborId, setGrupoLaborId] = useState('')
  const [opcionesFiltros, setOpcionesFiltros] = useState({ centros: [], tipos: [], grupos: [] })
  const [cargandoOpciones, setCargandoOpciones] = useState(false)
  const anioActual = String(new Date().getFullYear())
  const [anio, setAnio] = useState(anioActual)
  const [fechaDesde, setFechaDesde] = useState(`${anioActual}-01-01`)
  const [fechaHasta, setFechaHasta] = useState(`${anioActual}-12-31`)
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(25)
  const [registroEditar, setRegistroEditar] = useState(null)
  const [nuevoRegistroOpen, setNuevoRegistroOpen] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [registroCambioEstado, setRegistroCambioEstado] = useState(null)
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState(null)
  const [exportandoExcel, setExportandoExcel] = useState(false)
  const idEmpresa = empresaActual?.id_empresa ?? null

  const cargar = useCallback(async () => {
    if (fechaDesde > fechaHasta) { setFilas([]); setTotal(0); setCargando(false); return }
    setCargando(true)
    setError('')
    try {
      const [listado, totales] = await Promise.all([
        pestana === 3
          ? obtenerResumenMensualMO({ idEmpresa, fechaDesde, fechaHasta, estado })
          : listarMovimientosMO({ pestana, pagina, filasPorPagina, idEmpresa, fechaDesde, fechaHasta, busqueda, estado, tipoCentroId, centroCostoPk, grupoLaborId }),
        contarMovimientosMO({ idEmpresa, fechaDesde, fechaHasta }),
      ])
      setFilas(pestana === 3 ? listado : listado.filas)
      setTotal(pestana === 3 ? listado.length : listado.total)
      setResumen(totales)
    } catch (err) {
      console.error('Error cargando movimientos de Mano de Obra:', err)
      setError(err?.message || 'No se pudieron cargar los movimientos de Mano de Obra.')
      setFilas([])
      setTotal(0)
    } finally { setCargando(false) }
  }, [pestana, pagina, filasPorPagina, idEmpresa, fechaDesde, fechaHasta, busqueda, estado, tipoCentroId, centroCostoPk, grupoLaborId])

  useEffect(() => { void cargar() }, [cargar])

  useEffect(() => {
    let activo = true
    if (pestana === 3) {
      setOpcionesFiltros({ centros: [], tipos: [], grupos: [] })
      setCargandoOpciones(false)
      return () => { activo = false }
    }
    setCargandoOpciones(true)
    obtenerOpcionesFiltrosMO({ pestana, idEmpresa, fechaDesde, fechaHasta }).then((opciones) => { if (activo) setOpcionesFiltros(opciones) }).catch((err) => { if (activo) setError(err?.message || 'No se pudieron cargar las opciones de filtros.') }).finally(() => { if (activo) setCargandoOpciones(false) })
    return () => { activo = false }
  }, [pestana, idEmpresa, fechaDesde, fechaHasta])

  useEffect(() => {
    if (cargandoOpciones) return
    if (tipoCentroId && !opcionesFiltros.tipos.some((opcion) => String(opcion.id_tip_cc) === String(tipoCentroId))) {
      setTipoCentroId('')
      setCentroCostoPk('')
      setPagina(0)
    }
    if (centroCostoPk && !opcionesFiltros.centros.some((opcion) => String(opcion.cod_cc_pk) === String(centroCostoPk))) {
      setCentroCostoPk('')
      setPagina(0)
    }
    if (grupoLaborId && !opcionesFiltros.grupos.some((opcion) => String(opcion.Id_Grupo_Labor) === String(grupoLaborId))) {
      setGrupoLaborId('')
      setPagina(0)
    }
  }, [cargandoOpciones, opcionesFiltros, tipoCentroId, centroCostoPk, grupoLaborId])

  const guardarEdicion = async (datos) => {
    setGuardando(true)
    try {
      if (nuevoRegistroOpen) await crearMovimientoMO(datos)
      else await actualizarMovimientoMO({ pestana, idMovimiento: registroEditar.id_mov_mo, datos })
      setRegistroEditar(null)
      setNuevoRegistroOpen(false)
      await cargar()
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar el movimiento de Mano de Obra.')
      throw err
    } finally { setGuardando(false) }
  }
  const confirmarCambioEstado = async () => {
    if (!registroCambioEstado) return
    const fila = registroCambioEstado
    const nuevoEstado = Number(fila.estado) === 1 ? 0 : 1
    setCambiandoEstadoId(fila.id_mov_mo)
    try {
      await actualizarEstadoMovimientoMO({ pestana, idMovimiento: fila.id_mov_mo, estado: nuevoEstado })
      setRegistroCambioEstado(null)
      await cargar()
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar el estado del movimiento.')
    } finally { setCambiandoEstadoId(null) }
  }
  const cambiarAnio = (valor) => {
    setAnio(valor)
    setFechaDesde(`${valor}-01-01`)
    setFechaHasta(`${valor}-12-31`)
    setPagina(0)
  }
  const cambiarFecha = (lado, valor) => {
    if (lado === 'desde') setFechaDesde(valor)
    else setFechaHasta(valor)
    if (valor) setAnio(valor.slice(0, 4))
    setPagina(0)
  }
  const limpiarFiltros = () => {
    setBusqueda('')
    setEstado('')
    setTipoCentroId('')
    setCentroCostoPk('')
    setGrupoLaborId('')
    cambiarAnio(anioActual)
  }
  const cambiarPestana = (_event, valor) => {
    setPestana(valor)
    setPagina(0)
    setTipoCentroId('')
    setCentroCostoPk('')
    setGrupoLaborId('')
    if (valor === 3) setBusqueda('')
  }
  const cambiarFilasPorPagina = (event) => { setFilasPorPagina(Number(event.target.value)); setPagina(0) }
  const exportarExcel = async () => {
    if (fechaDesde > fechaHasta) { setError('El mes inicial no puede ser posterior al mes final.'); return }
    setExportandoExcel(true)
    setError('')
    try {
      if (pestana === 3) {
        const datos = await obtenerResumenMensualMO({ idEmpresa, fechaDesde, fechaHasta, estado })
        const { exportarResumenMensualMOExcel } = await import('../../services/excelService')
        exportarResumenMensualMOExcel(datos)
      } else {
        const filtros = { pestana, idEmpresa, fechaDesde, fechaHasta, busqueda, estado, tipoCentroId, centroCostoPk, grupoLaborId }
        const lote = 1000
        const primeraPagina = await listarMovimientosMO({ ...filtros, pagina: 0, filasPorPagina: lote })
        const todasLasFilas = [...primeraPagina.filas]
        const paginas = Math.ceil(primeraPagina.total / lote)
        for (let numeroPagina = 1; numeroPagina < paginas; numeroPagina += 1) {
          const siguiente = await listarMovimientosMO({ ...filtros, pagina: numeroPagina, filasPorPagina: lote })
          if (!siguiente.filas.length) break
          todasLasFilas.push(...siguiente.filas)
        }
        const { exportarMovimientosMOExcel } = await import('../../services/excelService')
        exportarMovimientosMOExcel(todasLasFilas, pestana === 2)
      }
    } catch (err) {
      console.error('Error exportando movimientos de Mano de Obra:', err)
      setError(err?.message || 'No se pudieron exportar los registros a Excel.')
    } finally { setExportandoExcel(false) }
  }
  const pestanas = [
    { label: 'Procesados', count: resumen.procesados, icon: <ListAlt fontSize="small" /> },
    { label: 'En proceso', count: resumen.enProceso, icon: <FactCheck fontSize="small" /> },
    { label: 'Pendientes', count: resumen.pendientes, icon: <PendingActions fontSize="small" /> },
    { label: 'Resumen', icon: <Summarize fontSize="small" /> },
  ]

  return <CompactModuleTheme>
    <Box className="app-module-flow tareo-module" sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) auto' }, alignItems: 'start', gap: 2, minWidth: 0 }}>
        <PageHeader icon={<Person fontSize="small" />} title="Movimiento de Mano de Obra" description="Consulta y administra los movimientos de mano de obra procesados, en proceso y pendientes." sx={{ mb: 0, minWidth: 0 }} />
        <Box sx={{ width: 'fit-content', maxWidth: '100%', justifySelf: { xs: 'start', md: 'end' }, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={pestana} onChange={cambiarPestana} aria-label="Estado de movimientos de Mano de Obra" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            {pestanas.map((item, index) => <Tab key={item.label} icon={item.icon} iconPosition="start" label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{item.label}{item.count != null && <Badge color={index === pestana ? 'primary' : 'default'} badgeContent={Number(item.count).toLocaleString('es-PE')} max={Number.MAX_SAFE_INTEGER} sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none', px: 1, minWidth: 24, borderRadius: 5, fontWeight: 600 } }} />}</Box>} />)}
          </Tabs>
        </Box>
      </Box>
      <MovMOFilters
        anio={anio} onAnio={cambiarAnio} estado={estado} onEstado={(valor) => { setEstado(valor); setPagina(0) }}
        busqueda={busqueda} onBusqueda={(valor) => { setBusqueda(valor); setPagina(0) }}
        fechaDesde={fechaDesde} onFechaDesde={(valor) => cambiarFecha('desde', valor)}
        fechaHasta={fechaHasta} onFechaHasta={(valor) => cambiarFecha('hasta', valor)}
        onLimpiar={limpiarFiltros} tipoCentroId={tipoCentroId} onTipoCentro={(valor) => { setTipoCentroId(valor); setCentroCostoPk(''); setPagina(0) }} tiposCentro={opcionesFiltros.tipos}
        centroCostoPk={centroCostoPk} onCentroCosto={(valor) => { setCentroCostoPk(valor); setPagina(0) }} centrosCosto={opcionesFiltros.centros}
        grupoLaborId={grupoLaborId} onGrupoLabor={(valor) => { setGrupoLaborId(valor); setPagina(0) }} gruposLabor={opcionesFiltros.grupos} opcionesCargando={cargandoOpciones}
        mostrarImportar={pestana === 1} mostrarExportar={pestana !== 1} exportando={exportandoExcel} totalExportable={total} onExportar={exportarExcel}
        mostrarNuevo={pestana === 0} onNuevo={() => setNuevoRegistroOpen(true)}
        mostrarBusqueda={pestana !== 3} mostrarFiltrosCatalogo={pestana !== 3} />
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {pestana === 3
        ? <MovMOResumenTable filas={filas} cargando={cargando} error="" />
        : <MovMOTable
          filas={filas} cargando={cargando} error="" total={total} pagina={pagina} filasPorPagina={filasPorPagina}
          onPagina={(_event, value) => setPagina(value)} onFilasPorPagina={cambiarFilasPorPagina}
          enProceso={pestana === 1} pendientes={pestana === 2} onEditar={setRegistroEditar} onCambiarEstado={setRegistroCambioEstado} cambiandoEstadoId={cambiandoEstadoId} />}
      <MovMOForm open={Boolean(registroEditar) || nuevoRegistroOpen} registro={registroEditar} modoNuevo={nuevoRegistroOpen} soloAjustesProcesado={pestana === 0} empresaInicial={idEmpresa} fechaInicial={fechaDesde} guardando={guardando} onClose={() => { setRegistroEditar(null); setNuevoRegistroOpen(false) }} onGuardar={guardarEdicion} />
      <Dialog open={Boolean(registroCambioEstado)} onClose={cambiandoEstadoId ? undefined : () => setRegistroCambioEstado(null)} fullWidth maxWidth="xs">
        <DialogTitle>{Number(registroCambioEstado?.estado) === 1 ? 'Desactivar movimiento' : 'Activar movimiento'}</DialogTitle>
        <DialogContent><Typography>¿Deseas {Number(registroCambioEstado?.estado) === 1 ? 'desactivar' : 'activar'} este registro de Mano de Obra?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistroCambioEstado(null)} disabled={Boolean(cambiandoEstadoId)}>Cancelar</Button>
          <Button variant="contained" color={Number(registroCambioEstado?.estado) === 1 ? 'warning' : 'success'} onClick={confirmarCambioEstado} disabled={Boolean(cambiandoEstadoId)}>{cambiandoEstadoId ? 'Guardando…' : 'Confirmar'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  </CompactModuleTheme>
}
