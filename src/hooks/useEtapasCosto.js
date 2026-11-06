import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  actualizarEtapaCosto,
  cambiarEstadoEtapaCosto,
  crearEtapaCosto,
  obtenerEtapasCosto,
} from '../services/etapaCostoService'

const formularioInicial = { etapa_costo: '', estado: true }

export function useEtapasCosto() {
  const [etapas, setEtapas] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [pagina, setPagina] = useState(0)
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [etapaSeleccionada, setEtapaSeleccionada] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [etapaCambioEstado, setEtapaCambioEstado] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const cargaInicialIniciada = useRef(false)

  const cargarEtapas = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await obtenerEtapasCosto()
      setEtapas(data ?? [])
    } catch (err) {
      console.error('Error cargando etapas de costo:', err)
      setError(err?.message || 'No se pudieron cargar las etapas de costo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicialIniciada.current) return
    cargaInicialIniciada.current = true
    cargarEtapas()
  }, [cargarEtapas])

  const etapasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return etapas.filter((etapa) => {
      const coincideTexto = String(etapa.cod_etapa ?? '').toLocaleLowerCase('es').includes(texto)
        || etapa.etapa_costo?.toLocaleLowerCase('es').includes(texto)
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && Boolean(etapa.estado))
        || (filtroEstado === 'inactivos' && !Boolean(etapa.estado))
      return coincideTexto && coincideEstado
    })
  }, [etapas, busqueda, filtroEstado])

  const etapasPaginadas = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return etapasFiltradas.slice(inicio, inicio + registrosPorPagina)
  }, [etapasFiltradas, pagina, registrosPorPagina])

  const handleCambioBusqueda = (event) => {
    setBusqueda(event.target.value)
    setPagina(0)
  }

  const handleCambioFiltroEstado = (value) => {
    setFiltroEstado(value)
    setPagina(0)
  }

  const handleChangePagina = (_event, nuevaPagina) => setPagina(nuevaPagina)

  const handleChangeRegistrosPorPagina = (event) => {
    setRegistrosPorPagina(parseInt(event.target.value, 10))
    setPagina(0)
  }

  const handleExportarExcel = async () => {
    try {
      const { exportarEtapasCostoExcel } = await import('../services/excelService')
      exportarEtapasCostoExcel(etapasFiltradas)
    } catch (err) {
      console.error('Error exportando etapas de costo:', err)
      setError(err?.message || 'No se pudieron exportar las etapas de costo.')
    }
  }

  const handleNuevaEtapa = () => {
    setModoEdicion(false)
    setEtapaSeleccionada(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditarEtapa = (etapa) => {
    setModoEdicion(true)
    setEtapaSeleccionada(etapa)
    setFormulario({
      etapa_costo: etapa.etapa_costo ?? '',
      estado: Boolean(etapa.estado),
    })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setEtapaSeleccionada(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
  }

  const handleChangeFormulario = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
    setErroresFormulario((actual) => ({ ...actual, [name]: '' }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!formulario.etapa_costo.trim()) {
      nuevosErrores.etapa_costo = 'La descripción de la etapa es obligatoria.'
    }
    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleGuardar = async () => {
    if (!validarFormulario()) return
    try {
      setGuardando(true)
      setError('')
      const datos = {
        etapa_costo: formulario.etapa_costo.trim(),
        estado: Boolean(formulario.estado),
      }
      if (modoEdicion) {
        await actualizarEtapaCosto(etapaSeleccionada.cod_etapa, datos)
        setMensaje('Etapa de costo actualizada correctamente.')
      } else {
        await crearEtapaCosto(datos)
        setMensaje('Etapa de costo creada correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      setEtapaSeleccionada(null)
      await cargarEtapas()
    } catch (err) {
      console.error('Error guardando etapa de costo:', err)
      setError(err?.message || 'No se pudo guardar la etapa de costo.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarCambioEstado = (etapa) => {
    setEtapaCambioEstado({ ...etapa, nuevoEstado: !Boolean(etapa.estado) })
  }

  const handleCerrarConfirmacionEstado = () => {
    if (!cambiandoEstado) setEtapaCambioEstado(null)
  }

  const handleConfirmarCambioEstado = async () => {
    if (!etapaCambioEstado) return
    const { cod_etapa, nuevoEstado } = etapaCambioEstado
    try {
      setCambiandoEstado(true)
      setError('')
      const etapaActualizada = await cambiarEstadoEtapaCosto(cod_etapa, nuevoEstado)
      setEtapas((actuales) => actuales.map((etapa) => (
        etapa.cod_etapa === cod_etapa ? etapaActualizada : etapa
      )))
      setMensaje(nuevoEstado
        ? 'Etapa de costo reactivada correctamente.'
        : 'Etapa de costo desactivada correctamente.')
      setEtapaCambioEstado(null)
      setPagina(0)
    } catch (err) {
      console.error('Error cambiando estado de etapa de costo:', err)
      setError(err?.message || 'No se pudo cambiar el estado de la etapa de costo.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    etapasFiltradas,
    etapasPaginadas,
    totalRegistros: etapasFiltradas.length,
    loading,
    guardando,
    error,
    mensaje,
    busqueda,
    filtroEstado,
    pagina,
    registrosPorPagina,
    dialogOpen,
    modoEdicion,
    formulario,
    erroresFormulario,
    etapaCambioEstado,
    cambiandoEstado,
    handleCambioBusqueda,
    handleCambioFiltroEstado,
    handleChangePagina,
    handleChangeRegistrosPorPagina,
    handleExportarExcel,
    handleNuevaEtapa,
    handleEditarEtapa,
    handleCerrarDialog,
    handleChangeFormulario,
    handleGuardar,
    handleSolicitarCambioEstado,
    handleCerrarConfirmacionEstado,
    handleConfirmarCambioEstado,
    handleCerrarMensaje: () => setMensaje(''),
    handleCerrarError: () => setError(''),
  }
}
