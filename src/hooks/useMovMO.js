// Gestiona estado y acciones de useMovMO.
import { useCallback, useEffect, useState } from 'react'
import { useEmpresa } from '../context/useEmpresa'
import {
  actualizarEstadoMovimientoMO,
  actualizarMovimientoMO,
  contarMovimientosMO,
  crearMovimientoMO,
  listarMovimientosMO,
  obtenerOpcionesFiltrosMO,
  obtenerResumenMensualMO,
  revalidarPendientesMO,
} from '../services/movMOService'

export function useMovMO() {
  const { empresaActual } = useEmpresa()
  const idEmpresa = empresaActual?.id_empresa ?? null
  const anioActual = String(new Date().getFullYear())
  const [pestana, setPestana] = useState(0)
  const [resumen, setResumen] = useState({ procesados: 0, enProceso: 0, pendientes: 0 })
  const [filas, setFilas] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busquedaScire, setBusquedaScire] = useState('')
  const [busquedaFinal, setBusquedaFinal] = useState('')
  const [busquedaScireAplicada, setBusquedaScireAplicada] = useState('')
  const [busquedaFinalAplicada, setBusquedaFinalAplicada] = useState('')
  const [estado, setEstado] = useState('')
  const [tipoCentroId, setTipoCentroId] = useState('')
  const [centroCostoPk, setCentroCostoPk] = useState('')
  const [grupoLaborId, setGrupoLaborId] = useState('')
  const [opcionesFiltros, setOpcionesFiltros] = useState({ centros: [], tipos: [], grupos: [] })
  const [cargandoOpciones, setCargandoOpciones] = useState(false)
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
  const [revalidandoPendientes, setRevalidandoPendientes] = useState(false)
  const [resultadoRevalidacion, setResultadoRevalidacion] = useState('')

  const cargar = useCallback(async () => {
    if (fechaDesde > fechaHasta) {
      setFilas([])
      setTotal(0)
      setCargando(false)
      return
    }
    setCargando(true)
    setError('')
    try {
      const [listado, totales] = await Promise.all([
        pestana === 3
          ? obtenerResumenMensualMO({ idEmpresa, fechaDesde, fechaHasta, estado })
          : listarMovimientosMO({ pestana, pagina, filasPorPagina, idEmpresa, fechaDesde, fechaHasta, busquedaScire: busquedaScireAplicada, busquedaFinal: busquedaFinalAplicada, estado, tipoCentroId, centroCostoPk, grupoLaborId }),
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
    } finally {
      setCargando(false)
    }
  }, [pestana, pagina, filasPorPagina, idEmpresa, fechaDesde, fechaHasta, busquedaScireAplicada, busquedaFinalAplicada, estado, tipoCentroId, centroCostoPk, grupoLaborId])

  useEffect(() => { void cargar() }, [cargar])

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaScireAplicada(busquedaScire.trim())
      setBusquedaFinalAplicada(busquedaFinal.trim())
    }, 400)
    return () => clearTimeout(temporizador)
  }, [busquedaScire, busquedaFinal])

  useEffect(() => {
    let activo = true
    if (pestana === 3) {
      setOpcionesFiltros({ centros: [], tipos: [], grupos: [] })
      setCargandoOpciones(false)
      return () => { activo = false }
    }
    setCargandoOpciones(true)
    obtenerOpcionesFiltrosMO({ pestana, idEmpresa, fechaDesde, fechaHasta })
      .then((opciones) => { if (activo) setOpcionesFiltros(opciones) })
      .catch((err) => { if (activo) setError(err?.message || 'No se pudieron cargar las opciones de filtros.') })
      .finally(() => { if (activo) setCargandoOpciones(false) })
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
    setBusquedaScire('')
    setBusquedaFinal('')
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
    if (valor === 3) {
      setBusquedaScire('')
      setBusquedaFinal('')
    }
  }
  const cambiarFilasPorPagina = (event) => {
    setFilasPorPagina(Number(event.target.value))
    setPagina(0)
  }

  const exportarExcel = async () => {
    if (fechaDesde > fechaHasta) { setError('El mes inicial no puede ser posterior al mes final.'); return }
    setExportandoExcel(true)
    setError('')
    try {
      if (pestana === 3) {
        const datos = await obtenerResumenMensualMO({ idEmpresa, fechaDesde, fechaHasta, estado })
        const { exportarResumenMensualMOExcel } = await import('../services/excelService')
        exportarResumenMensualMOExcel(datos)
      } else {
        const filtros = { pestana, idEmpresa, fechaDesde, fechaHasta, busquedaScire: busquedaScireAplicada, busquedaFinal: busquedaFinalAplicada, estado, tipoCentroId, centroCostoPk, grupoLaborId }
        const lote = 1000
        const primeraPagina = await listarMovimientosMO({ ...filtros, pagina: 0, filasPorPagina: lote })
        const todasLasFilas = [...primeraPagina.filas]
        const paginas = Math.ceil(primeraPagina.total / lote)
        for (let numeroPagina = 1; numeroPagina < paginas; numeroPagina += 1) {
          const siguiente = await listarMovimientosMO({ ...filtros, pagina: numeroPagina, filasPorPagina: lote })
          if (!siguiente.filas.length) break
          todasLasFilas.push(...siguiente.filas)
        }
        const { exportarMovimientosMOExcel } = await import('../services/excelService')
        exportarMovimientosMOExcel(todasLasFilas, pestana === 2)
      }
    } catch (err) {
      console.error('Error exportando movimientos de Mano de Obra:', err)
      setError(err?.message || 'No se pudieron exportar los registros a Excel.')
    } finally { setExportandoExcel(false) }
  }

  const revalidarPendientes = async () => {
    if (fechaDesde > fechaHasta) { setError('El mes inicial no puede ser posterior al mes final.'); return }
    setRevalidandoPendientes(true)
    setError('')
    setResultadoRevalidacion('')
    try {
      const resultado = await revalidarPendientesMO({ idEmpresa, fechaDesde, fechaHasta })
      setResultadoRevalidacion(`Revisión completada: ${Number(resultado.revisados ?? 0).toLocaleString('es-PE')} revisados, ${Number(resultado.procesados ?? 0).toLocaleString('es-PE')} pasaron a procesados y ${Number(resultado.pendientes ?? 0).toLocaleString('es-PE')} continúan pendientes.`)
      await cargar()
    } catch (err) {
      console.error('Error revalidando pendientes de Mano de Obra:', err)
      setError(err?.message || 'No se pudieron revalidar los pendientes de Mano de Obra.')
    } finally { setRevalidandoPendientes(false) }
  }

  return {
    pestana, resumen, filas, total, cargando, error, setError,
    busquedaScire, setBusquedaScire, busquedaFinal, setBusquedaFinal,
    estado, setEstado, tipoCentroId, setTipoCentroId,
    centroCostoPk, setCentroCostoPk, grupoLaborId, setGrupoLaborId,
    opcionesFiltros, cargandoOpciones, anio, fechaDesde, fechaHasta,
    pagina, setPagina, filasPorPagina, registroEditar, setRegistroEditar,
    nuevoRegistroOpen, setNuevoRegistroOpen, guardando, registroCambioEstado,
    setRegistroCambioEstado, cambiandoEstadoId, exportandoExcel,
    revalidandoPendientes, resultadoRevalidacion, setResultadoRevalidacion,
    idEmpresa, cambiarAnio, cambiarFecha, limpiarFiltros, cambiarPestana,
    cambiarFilasPorPagina, guardarEdicion, confirmarCambioEstado,
    exportarExcel, revalidarPendientes, cargar,
  }
}

export default useMovMO
