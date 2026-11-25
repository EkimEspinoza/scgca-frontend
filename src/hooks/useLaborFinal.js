// Gestiona estado y acciones de useLaborFinal.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actualizarLaborFinal, cambiarEstadoLaborFinal, crearLaborFinal, obtenerLaboresFinales } from '../services/laborFinalService'
import { obtenerGruposLabor } from '../services/grupoLaborService'
import { obtenerTiposJornal } from '../services/tipoJornalService'

const formularioInicial = { DESCRIPCION: '', Id_Grupo_Labor: '', id_Tipo_Jornal: '' }

export function useLaborFinal() {
  const [labores, setLabores] = useState([])
  const [gruposLabor, setGruposLabor] = useState([])
  const [tiposJornal, setTiposJornal] = useState([])
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
      const [laboresDatos, grupos, tipos] = await Promise.all([obtenerLaboresFinales(), obtenerGruposLabor(), obtenerTiposJornal()])
      const gruposPorId = new Map(grupos.map((grupo) => [Number(grupo.Id_Grupo_Labor), grupo]))
      const tiposPorId = new Map(tipos.map((tipo) => [Number(tipo.Id_Tipo_Jornal), tipo]))
      setLabores(laboresDatos.map((labor) => ({ ...labor, grupoLabor: gruposPorId.get(Number(labor.Id_Grupo_Labor)) ?? null, tipoJornal: tiposPorId.get(Number(labor.id_Tipo_Jornal)) ?? null })))
      setGruposLabor(grupos)
      setTiposJornal(tipos)
    } catch (err) {
      console.error('Error cargando labores finales:', err)
      setError(err?.message || 'No se pudieron cargar las labores finales.')
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
      const coincideTexto = String(labor.Id_Lab_Fin).includes(texto)
        || labor.DESCRIPCION?.toLocaleLowerCase('es').includes(texto)
        || labor.grupoLabor?.DescripcionLabor?.toLocaleLowerCase('es').includes(texto)
        || labor.tipoJornal?.Descripcion?.toLocaleLowerCase('es').includes(texto)
        || String(labor.id_Tipo_Jornal).includes(texto)
      const activo = Number(labor.estado) === 1
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && activo)
        || (filtroEstado === 'inactivos' && !activo)
      return coincideTexto && coincideEstado
    })
  }, [labores, busqueda, filtroEstado])

  const laboresPaginadas = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return laboresFiltradas.slice(inicio, inicio + registrosPorPagina)
  }, [laboresFiltradas, pagina, registrosPorPagina])

  const handleCambioBusqueda = (event) => { setBusqueda(event.target.value.toLocaleUpperCase('es')); setPagina(0) }
  const handleCambioFiltroEstado = (value) => { setFiltroEstado(value); setPagina(0) }
  const handleChangePagina = (_event, nuevaPagina) => setPagina(nuevaPagina)
  const handleChangeRegistrosPorPagina = (event) => { setRegistrosPorPagina(Number(event.target.value)); setPagina(0) }

  const handleExportarExcel = async () => {
    try {
      const { exportarLaboresFinalesExcel } = await import('../services/excelService')
      exportarLaboresFinalesExcel(laboresFiltradas)
    } catch (err) {
      setError(err?.message || 'No se pudieron exportar las labores finales.')
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
    setFormulario({ DESCRIPCION: labor.DESCRIPCION ?? '', Id_Grupo_Labor: String(labor.Id_Grupo_Labor ?? ''), id_Tipo_Jornal: String(labor.id_Tipo_Jornal ?? '') })
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
    if (!formulario.DESCRIPCION.trim()) errores.DESCRIPCION = 'La descripción es obligatoria.'
    if (!formulario.Id_Grupo_Labor) errores.Id_Grupo_Labor = 'Selecciona un grupo de labor.'
    if (!formulario.id_Tipo_Jornal) errores.id_Tipo_Jornal = 'Selecciona un tipo de jornal.'
    setErroresFormulario(errores)
    if (Object.keys(errores).length) return

    try {
      setGuardando(true)
      setError('')
      if (modoEdicion) {
        await actualizarLaborFinal(laborSeleccionada.Id_Lab_Fin, formulario)
        setMensaje('Labor final actualizada correctamente.')
      } else {
        await crearLaborFinal(formulario)
        setMensaje('Labor final creada correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      await cargarLabores()
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la labor final.')
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
      const actualizado = await cambiarEstadoLaborFinal(laborCambioEstado.Id_Lab_Fin, laborCambioEstado.nuevoEstado)
      setLabores((actuales) => actuales.map((labor) => labor.Id_Lab_Fin === actualizado.Id_Lab_Fin
        ? { ...labor, ...actualizado }
        : labor))
      setMensaje(actualizado.estado === 1 ? 'Labor final reactivada.' : 'Labor final desactivada.')
      setLaborCambioEstado(null)
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar el estado de la labor final.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    laboresFiltradas, laboresPaginadas, gruposLabor, tiposJornal, totalRegistros: laboresFiltradas.length, loading, guardando, cambiandoEstado,
    error, mensaje, busqueda, filtroEstado, pagina, registrosPorPagina, dialogOpen, modoEdicion, formulario,
    erroresFormulario, laborCambioEstado, handleCambioBusqueda, handleCambioFiltroEstado, handleChangePagina,
    handleChangeRegistrosPorPagina, handleExportarExcel, handleNuevo, handleEditar, handleCerrarDialog,
    handleChangeFormulario, handleGuardar, handleSolicitarCambioEstado, handleCerrarConfirmacionEstado,
    handleConfirmarCambioEstado, handleCerrarMensaje: () => setMensaje(''), handleCerrarError: () => setError(''),
  }
}
