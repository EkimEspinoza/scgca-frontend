import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cambiarEstadoPeriodoJornal, guardarPeriodoJornal, obtenerJornales, obtenerTiposJornalParaJornal } from '../services/jornalService'

const formularioInicial = { Inicio: '', Fin: '', Importes: {} }

function agruparPeriodos(rows) {
  const periodos = new Map()
  rows.forEach((row) => {
    const key = `${row.Inicio}|${row.Fin}`
    if (!periodos.has(key)) periodos.set(key, { key, Inicio: row.Inicio, Fin: row.Fin, importes: {}, filas: [] })
    const periodo = periodos.get(key)
    periodo.importes[row.id_Tipo_Jornal] = Number(row.Importe_Soles)
    periodo.filas.push(row)
  })
  return [...periodos.values()].map((periodo) => ({
    ...periodo,
    estado: periodo.filas.every((fila) => Number(fila.estado) === 1) ? 1 : 0,
    incompleto: new Set(periodo.filas.map((fila) => Number(fila.id_Tipo_Jornal))).size !== periodo.filas.length,
  })).sort((a, b) => b.Inicio.localeCompare(a.Inicio))
}

function seSolapan(aInicio, aFin, bInicio, bFin) {
  return aInicio <= bFin && aFin >= bInicio
}

function diaSiguiente(fecha) {
  if (!fecha) return ''
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia + 1)).toISOString().slice(0, 10)
}

export function useJornal() {
  const [jornales, setJornales] = useState([])
  const [tiposJornal, setTiposJornal] = useState([])
  const [tiposFormulario, setTiposFormulario] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [pagina, setPagina] = useState(0)
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null)
  const [periodoCambioEstado, setPeriodoCambioEstado] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const cargaInicial = useRef(false)

  const cargarJornales = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [rows, tipos] = await Promise.all([obtenerJornales(), obtenerTiposJornalParaJornal()])
      setJornales(agruparPeriodos(rows))
      setTiposJornal(tipos)
    } catch (err) {
      console.error('Error cargando jornales:', err)
      setError(err?.message || 'No se pudieron cargar los jornales.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicial.current) return
    cargaInicial.current = true
    cargarJornales()
  }, [cargarJornales])

  const periodosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return jornales.filter((periodo) => {
      const textoPeriodo = [periodo.Inicio, periodo.Fin, ...Object.entries(periodo.importes).flatMap(([id, valor]) => {
        const tipo = tiposJornal.find((item) => Number(item.Id_Tipo_Jornal) === Number(id))
        return [tipo?.Descripcion, String(valor)]
      })].join(' ').toLocaleLowerCase('es')
      const coincideBusqueda = !texto || textoPeriodo.includes(texto)
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && periodo.estado === 1)
        || (filtroEstado === 'inactivos' && periodo.estado !== 1)
      return coincideBusqueda && coincideEstado
    })
  }, [jornales, tiposJornal, busqueda, filtroEstado])

  const periodosPaginados = useMemo(() => periodosFiltrados.slice(pagina * registrosPorPagina, (pagina + 1) * registrosPorPagina), [periodosFiltrados, pagina, registrosPorPagina])
  const handleCambioBusqueda = (event) => { setBusqueda(event.target.value.toLocaleUpperCase('es')); setPagina(0) }
  const handleCambioFiltroEstado = (value) => { setFiltroEstado(value); setPagina(0) }
  const handleChangePagina = (_event, nuevaPagina) => setPagina(nuevaPagina)
  const handleChangeRegistrosPorPagina = (event) => { setRegistrosPorPagina(Number(event.target.value)); setPagina(0) }

  const handleExportarExcel = async () => {
    try {
      const { exportarJornalesExcel } = await import('../services/excelService')
      exportarJornalesExcel(periodosFiltrados, tiposJornal)
    } catch (err) {
      setError(err?.message || 'No se pudieron exportar los jornales.')
    }
  }

  const handleNuevo = () => {
    const tiposActivos = tiposJornal.filter((tipo) => Number(tipo.estado) === 1)
    if (tiposActivos.length === 0) {
      setError('No hay tipos de jornal activos para crear un periodo.')
      return
    }
    setModoEdicion(false)
    setPeriodoSeleccionado(null)
    setTiposFormulario(tiposActivos)
    const ultimaFechaFin = jornales.reduce((ultima, periodo) => periodo.Fin > ultima ? periodo.Fin : ultima, '')
    setFormulario({ Inicio: diaSiguiente(ultimaFechaFin), Fin: '', Importes: Object.fromEntries(tiposActivos.map((tipo) => [tipo.Id_Tipo_Jornal, ''])) })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditar = (periodo) => {
    const ids = new Set(Object.keys(periodo.importes).map(Number))
    const tipos = tiposJornal.filter((tipo) => ids.has(Number(tipo.Id_Tipo_Jornal)))
    setModoEdicion(true)
    setPeriodoSeleccionado(periodo)
    setTiposFormulario(tipos)
    setFormulario({ Inicio: periodo.Inicio, Fin: periodo.Fin, Importes: { ...periodo.importes } })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setPeriodoSeleccionado(null)
    setFormulario({ ...formularioInicial, Importes: {} })
    setErroresFormulario({})
  }

  const handleChangeFormulario = (name, value) => {
    if (name.startsWith('Importes.')) {
      const id = name.split('.')[1]
      setFormulario((actual) => ({ ...actual, Importes: { ...actual.Importes, [id]: value } }))
      setErroresFormulario((actual) => ({ ...actual, [name]: '' }))
      return
    }
    setFormulario((actual) => ({ ...actual, [name]: value }))
    setErroresFormulario((actual) => ({ ...actual, [name]: '' }))
  }

  const handleGuardar = async () => {
    const errores = {}
    if (!formulario.Inicio) errores.Inicio = 'Selecciona la fecha inicial.'
    if (!formulario.Fin) errores.Fin = 'Selecciona la fecha final.'
    if (formulario.Inicio && formulario.Fin && formulario.Fin < formulario.Inicio) errores.Fin = 'La fecha final debe ser posterior a la inicial.'
    tiposFormulario.forEach((tipo) => {
      const importe = formulario.Importes[tipo.Id_Tipo_Jornal]
      if (importe === '' || importe === undefined || !Number.isFinite(Number(importe)) || Number(importe) < 0) {
        errores[`Importes.${tipo.Id_Tipo_Jornal}`] = 'Ingresa un importe igual o mayor a 0.'
      }
    })
    if (formulario.Inicio && formulario.Fin) {
      const otrosPeriodos = jornales.filter((periodo) => periodo.key !== periodoSeleccionado?.key)
      const solapado = otrosPeriodos.some((periodo) => seSolapan(formulario.Inicio, formulario.Fin, periodo.Inicio, periodo.Fin))
      if (solapado) errores.Fin = 'Las fechas se solapan con otro periodo registrado.'
    }
    setErroresFormulario(errores)
    if (Object.keys(errores).length) return

    try {
      setGuardando(true)
      setError('')
      await guardarPeriodoJornal({
        inicio: formulario.Inicio,
        fin: formulario.Fin,
        importes: formulario.Importes,
        tipos: tiposFormulario,
        modoEdicion,
        estado: periodoSeleccionado?.estado ?? 1,
        periodoOriginal: modoEdicion ? { inicio: periodoSeleccionado.Inicio, fin: periodoSeleccionado.Fin } : undefined,
      })
      setMensaje(modoEdicion ? 'Periodo de jornal actualizado.' : 'Periodo de jornal creado para todos los tipos activos.')
      setDialogOpen(false)
      await cargarJornales()
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el periodo de jornal.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarCambioEstado = (periodo) => setPeriodoCambioEstado({ ...periodo, nuevoEstado: periodo.estado === 1 ? 0 : 1 })
  const handleCerrarConfirmacionEstado = () => { if (!cambiandoEstado) setPeriodoCambioEstado(null) }

  const handleConfirmarCambioEstado = async () => {
    if (!periodoCambioEstado) return
    try {
      setCambiandoEstado(true)
      setError('')
      await cambiarEstadoPeriodoJornal(periodoCambioEstado.Inicio, periodoCambioEstado.Fin, periodoCambioEstado.nuevoEstado)
      setJornales((actuales) => actuales.map((periodo) => periodo.key === periodoCambioEstado.key
        ? { ...periodo, estado: periodoCambioEstado.nuevoEstado }
        : periodo))
      setMensaje(periodoCambioEstado.nuevoEstado === 1 ? 'Periodo de jornal reactivado.' : 'Periodo de jornal desactivado.')
      setPeriodoCambioEstado(null)
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar el estado del periodo.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    periodosFiltrados, periodosPaginados, tiposJornal, tiposFormulario,
    totalRegistros: periodosFiltrados.length, loading, guardando, cambiandoEstado, error, mensaje, busqueda, filtroEstado,
    pagina, registrosPorPagina, dialogOpen, modoEdicion, formulario, erroresFormulario, periodoCambioEstado,
    handleCambioBusqueda, handleCambioFiltroEstado, handleChangePagina, handleChangeRegistrosPorPagina,
    handleExportarExcel, handleNuevo, handleEditar, handleCerrarDialog, handleChangeFormulario, handleGuardar,
    handleSolicitarCambioEstado, handleCerrarConfirmacionEstado, handleConfirmarCambioEstado,
    handleCerrarMensaje: () => setMensaje(''), handleCerrarError: () => setError(''),
  }
}
