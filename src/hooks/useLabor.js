// Gestiona estado y acciones de useLabor.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actualizarLabor, cambiarEstadoLabor, crearLabor, obtenerLabores } from '../services/laborService'
import { obtenerLaboresFinales } from '../services/laborFinalService'

const formularioInicial = { Lab_SCIRE: '', Id_Lab_Fin: '' }

export function useLabor() {
  const [labores, setLabores] = useState([])
  const [laboresFinales, setLaboresFinales] = useState([])
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
  const [laborSeleccionada, setLaborSeleccionada] = useState(null)
  const [laborCambioEstado, setLaborCambioEstado] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const cargaInicial = useRef(false)

  const cargarLabores = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [laboresDatos, finales] = await Promise.all([obtenerLabores(), obtenerLaboresFinales()])
      const finalesPorId = new Map(finales.map((laborFinal) => [Number(laborFinal.Id_Lab_Fin), laborFinal]))
      setLabores(laboresDatos.map((labor) => ({ ...labor, laborFinal: finalesPorId.get(Number(labor.Id_Lab_Fin)) ?? null })))
      setLaboresFinales(finales)
    } catch (err) {
      console.error('Error cargando labores:', err)
      setError(err?.message || 'No se pudieron cargar las labores.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicial.current) return
    cargaInicial.current = true
    cargarLabores()
  }, [cargarLabores])

  const laboresFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return labores.filter((labor) => {
      const coincideTexto = String(labor.Id_Lab).includes(texto)
        || labor.Lab_SCIRE?.toLocaleLowerCase('es').includes(texto)
        || labor.laborFinal?.DESCRIPCION?.toLocaleLowerCase('es').includes(texto)
        || String(labor.Id_Lab_Fin).includes(texto)
      const activo = Number(labor.estado) === 1
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && activo)
        || (filtroEstado === 'inactivos' && !activo)
      return coincideTexto && coincideEstado
    })
  }, [labores, busqueda, filtroEstado])

  const laboresPaginadas = useMemo(() => laboresFiltradas.slice(pagina * registrosPorPagina, (pagina + 1) * registrosPorPagina), [laboresFiltradas, pagina, registrosPorPagina])
  const handleCambioBusqueda = (event) => { setBusqueda(event.target.value.toLocaleUpperCase('es')); setPagina(0) }
  const handleCambioFiltroEstado = (value) => { setFiltroEstado(value); setPagina(0) }
  const handleChangePagina = (_event, nuevaPagina) => setPagina(nuevaPagina)
  const handleChangeRegistrosPorPagina = (event) => { setRegistrosPorPagina(Number(event.target.value)); setPagina(0) }

  const handleExportarExcel = async () => {
    try {
      const { exportarLaboresExcel } = await import('../services/excelService')
      exportarLaboresExcel(laboresFiltradas)
    } catch (err) {
      setError(err?.message || 'No se pudieron exportar las labores.')
    }
  }

  const handleNuevo = () => {
    setModoEdicion(false)
    setLaborSeleccionada(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditar = (labor) => {
    setModoEdicion(true)
    setLaborSeleccionada(labor)
    setFormulario({ Lab_SCIRE: labor.Lab_SCIRE ?? '', Id_Lab_Fin: String(labor.Id_Lab_Fin ?? '') })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setLaborSeleccionada(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
  }

  const handleChangeFormulario = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
    setErroresFormulario((actual) => ({ ...actual, [name]: '' }))
  }

  const handleGuardar = async () => {
    const errores = {}
    if (!formulario.Lab_SCIRE.trim()) errores.Lab_SCIRE = 'El nombre de la labor es obligatorio.'
    if (!formulario.Id_Lab_Fin) errores.Id_Lab_Fin = 'Selecciona una labor final.'
    setErroresFormulario(errores)
    if (Object.keys(errores).length) return

    try {
      setGuardando(true)
      setError('')
      if (modoEdicion) {
        await actualizarLabor(laborSeleccionada.Id_Lab, formulario)
        setMensaje('Labor actualizada correctamente.')
      } else {
        await crearLabor(formulario)
        setMensaje('Labor creada correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      await cargarLabores()
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la labor.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarCambioEstado = (labor) => setLaborCambioEstado({ ...labor, nuevoEstado: Number(labor.estado) !== 1 ? 1 : 0 })
  const handleCerrarConfirmacionEstado = () => { if (!cambiandoEstado) setLaborCambioEstado(null) }

  const handleConfirmarCambioEstado = async () => {
    if (!laborCambioEstado) return
    try {
      setCambiandoEstado(true)
      setError('')
      const actualizado = await cambiarEstadoLabor(laborCambioEstado.Id_Lab, laborCambioEstado.nuevoEstado)
      setLabores((actuales) => actuales.map((labor) => labor.Id_Lab === actualizado.Id_Lab ? { ...labor, ...actualizado } : labor))
      setMensaje(actualizado.estado === 1 ? 'Labor reactivada.' : 'Labor desactivada.')
      setLaborCambioEstado(null)
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar el estado de la labor.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    laboresFiltradas, laboresPaginadas, laboresFinales, totalRegistros: laboresFiltradas.length, loading, guardando, cambiandoEstado,
    error, mensaje, busqueda, filtroEstado, pagina, registrosPorPagina, dialogOpen, modoEdicion, formulario,
    erroresFormulario, laborCambioEstado, handleCambioBusqueda, handleCambioFiltroEstado, handleChangePagina,
    handleChangeRegistrosPorPagina, handleExportarExcel, handleNuevo, handleEditar, handleCerrarDialog,
    handleChangeFormulario, handleGuardar, handleSolicitarCambioEstado, handleCerrarConfirmacionEstado,
    handleConfirmarCambioEstado, handleCerrarMensaje: () => setMensaje(''), handleCerrarError: () => setError(''),
  }
}
