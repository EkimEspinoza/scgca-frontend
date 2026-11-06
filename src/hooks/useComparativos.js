import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  actualizarComparativo,
  cambiarEstadoComparativo,
  crearComparativo,
  obtenerComparativos,
} from '../services/comparativoService'

const formularioInicial = { descripcion: '', estado: true }

export function useComparativos() {
  const [comparativos, setComparativos] = useState([])
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
  const [comparativoSeleccionado, setComparativoSeleccionado] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [comparativoCambioEstado, setComparativoCambioEstado] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const cargaInicialIniciada = useRef(false)

  const cargarComparativos = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await obtenerComparativos()
      setComparativos(data || [])
    } catch (err) {
      console.error('Error cargando comparativos:', err)
      setError('No se pudieron cargar los comparativos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicialIniciada.current) return
    cargaInicialIniciada.current = true
    cargarComparativos()
  }, [cargarComparativos])

  const comparativosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return comparativos.filter((comparativo) => {
      const coincideTexto = comparativo.descripcion?.toLowerCase().includes(texto)
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && Boolean(comparativo.estado))
        || (filtroEstado === 'inactivos' && !Boolean(comparativo.estado))
      return coincideTexto && coincideEstado
    })
  }, [comparativos, busqueda, filtroEstado])

  const comparativosPaginados = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return comparativosFiltrados.slice(inicio, inicio + registrosPorPagina)
  }, [comparativosFiltrados, pagina, registrosPorPagina])

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
      const { exportarComparativosExcel } = await import('../services/excelService')
      exportarComparativosExcel(comparativosFiltrados)
    } catch (err) {
      console.error('Error exportando comparativos:', err)
      setError(err?.message || 'No se pudieron exportar los comparativos.')
    }
  }

  const handleNuevoComparativo = () => {
    setModoEdicion(false)
    setComparativoSeleccionado(null)
    setFormulario({ ...formularioInicial, estado: true })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditarComparativo = (comparativo) => {
    setModoEdicion(true)
    setComparativoSeleccionado(comparativo)
    setFormulario({
      descripcion: comparativo.descripcion || '',
      estado: comparativo.estado ?? true,
    })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setComparativoSeleccionado(null)
    setFormulario(formularioInicial)
    setErroresFormulario({})
  }

  const handleChangeFormulario = (event) => {
    const { name, value } = event.target
    const nuevoValor = name === 'descripcion' ? value.toUpperCase() : value
    setFormulario((prev) => ({ ...prev, [name]: nuevoValor }))
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria.'
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
        descripcion: formulario.descripcion.trim().toUpperCase(),
        estado: formulario.estado,
      }

      if (modoEdicion) {
        await actualizarComparativo(comparativoSeleccionado.id_comparativo, datos)
        setMensaje('Comparativo actualizado correctamente.')
      } else {
        await crearComparativo(datos)
        setMensaje('Comparativo creado correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      await cargarComparativos()
    } catch (err) {
      console.error('Error guardando comparativo:', err)
      setError(err?.message || 'No se pudo guardar el comparativo.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarCambioEstado = (comparativo) => {
    setComparativoCambioEstado({
      ...comparativo,
      nuevoEstado: !Boolean(comparativo.estado),
    })
  }

  const handleCerrarConfirmacionEstado = () => {
    if (!cambiandoEstado) setComparativoCambioEstado(null)
  }

  const handleConfirmarCambioEstado = async () => {
    if (!comparativoCambioEstado) return
    const { id_comparativo, nuevoEstado } = comparativoCambioEstado
    try {
      setCambiandoEstado(true)
      setError('')
      const comparativoActualizado = await cambiarEstadoComparativo(id_comparativo, nuevoEstado)
      setComparativos((actuales) => actuales.map((comparativo) => (
        comparativo.id_comparativo === id_comparativo ? comparativoActualizado : comparativo
      )))
      setMensaje(nuevoEstado
        ? 'Comparativo reactivado correctamente.'
        : 'Comparativo desactivado correctamente.')
      setComparativoCambioEstado(null)
      setPagina(0)
    } catch (err) {
      console.error('Error cambiando estado del comparativo:', err)
      setError(err?.message || 'No se pudo cambiar el estado del comparativo.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    comparativosFiltrados,
    comparativosPaginados,
    totalRegistros: comparativosFiltrados.length,
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
    comparativoCambioEstado,
    cambiandoEstado,
    handleCambioBusqueda,
    handleCambioFiltroEstado,
    handleChangePagina,
    handleChangeRegistrosPorPagina,
    handleExportarExcel,
    handleNuevoComparativo,
    handleEditarComparativo,
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
