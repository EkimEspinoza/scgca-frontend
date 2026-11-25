// Gestiona estado y acciones de useTipoJornal.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actualizarTipoJornal, cambiarEstadoTipoJornal, crearTipoJornal, obtenerTiposJornal } from '../services/tipoJornalService'

const formularioInicial = { Descripcion: '' }

export function useTipoJornal() {
  const [tipos, setTipos] = useState([])
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
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null)
  const [tipoCambioEstado, setTipoCambioEstado] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const cargaInicial = useRef(false)

  const cargarTipos = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setTipos(await obtenerTiposJornal())
    } catch (err) {
      console.error('Error cargando tipos de jornal:', err)
      setError(err?.message || 'No se pudieron cargar los tipos de jornal.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicial.current) return
    cargaInicial.current = true
    cargarTipos()
  }, [cargarTipos])

  const tiposFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return tipos.filter((tipo) => {
      const coincideTexto = String(tipo.Id_Tipo_Jornal).includes(texto)
        || tipo.Descripcion?.toLocaleLowerCase('es').includes(texto)
      const activo = Number(tipo.estado) === 1
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && activo)
        || (filtroEstado === 'inactivos' && !activo)
      return coincideTexto && coincideEstado
    })
  }, [tipos, busqueda, filtroEstado])

  const tiposPaginados = useMemo(() => tiposFiltrados.slice(pagina * registrosPorPagina, (pagina + 1) * registrosPorPagina), [tiposFiltrados, pagina, registrosPorPagina])
  const handleCambioBusqueda = (event) => { setBusqueda(event.target.value.toLocaleUpperCase('es')); setPagina(0) }
  const handleCambioFiltroEstado = (value) => { setFiltroEstado(value); setPagina(0) }
  const handleChangePagina = (_event, nuevaPagina) => setPagina(nuevaPagina)
  const handleChangeRegistrosPorPagina = (event) => { setRegistrosPorPagina(Number(event.target.value)); setPagina(0) }

  const handleExportarExcel = async () => {
    try {
      const { exportarTiposJornalExcel } = await import('../services/excelService')
      exportarTiposJornalExcel(tiposFiltrados)
    } catch (err) {
      setError(err?.message || 'No se pudieron exportar los tipos de jornal.')
    }
  }

  const handleNuevo = () => {
    setModoEdicion(false)
    setTipoSeleccionado(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditar = (tipo) => {
    setModoEdicion(true)
    setTipoSeleccionado(tipo)
    setFormulario({ Descripcion: tipo.Descripcion ?? '' })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setTipoSeleccionado(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
  }

  const handleChangeFormulario = (event) => {
    const { name, value } = event.target
    const valorFormulario = name === 'Descripcion' ? value.toLocaleUpperCase('es') : value
    setFormulario((actual) => ({ ...actual, [name]: valorFormulario }))
    setErroresFormulario((actual) => ({ ...actual, [name]: '' }))
  }

  const handleGuardar = async () => {
    const errores = formulario.Descripcion.trim() ? {} : { Descripcion: 'La descripción es obligatoria.' }
    setErroresFormulario(errores)
    if (Object.keys(errores).length) return
    try {
      setGuardando(true)
      setError('')
      if (modoEdicion) {
        await actualizarTipoJornal(tipoSeleccionado.Id_Tipo_Jornal, formulario)
        setMensaje('Tipo de jornal actualizado correctamente.')
      } else {
        await crearTipoJornal(formulario)
        setMensaje('Tipo de jornal creado correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      await cargarTipos()
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el tipo de jornal.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarCambioEstado = (tipo) => setTipoCambioEstado({ ...tipo, nuevoEstado: Number(tipo.estado) !== 1 ? 1 : 0 })
  const handleCerrarConfirmacionEstado = () => { if (!cambiandoEstado) setTipoCambioEstado(null) }
  const handleConfirmarCambioEstado = async () => {
    if (!tipoCambioEstado) return
    try {
      setCambiandoEstado(true)
      setError('')
      const actualizado = await cambiarEstadoTipoJornal(tipoCambioEstado.Id_Tipo_Jornal, tipoCambioEstado.nuevoEstado)
      setTipos((actuales) => actuales.map((tipo) => tipo.Id_Tipo_Jornal === actualizado.Id_Tipo_Jornal ? actualizado : tipo))
      setMensaje(actualizado.estado === 1 ? 'Tipo de jornal reactivado.' : 'Tipo de jornal desactivado.')
      setTipoCambioEstado(null)
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar el estado del tipo de jornal.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    tiposFiltrados, tiposPaginados, totalRegistros: tiposFiltrados.length, loading, guardando, cambiandoEstado,
    error, mensaje, busqueda, filtroEstado, pagina, registrosPorPagina, dialogOpen, modoEdicion, formulario,
    erroresFormulario, tipoCambioEstado, handleCambioBusqueda, handleCambioFiltroEstado, handleChangePagina,
    handleChangeRegistrosPorPagina, handleExportarExcel, handleNuevo, handleEditar, handleCerrarDialog,
    handleChangeFormulario, handleGuardar, handleSolicitarCambioEstado, handleCerrarConfirmacionEstado,
    handleConfirmarCambioEstado, handleCerrarMensaje: () => setMensaje(''), handleCerrarError: () => setError(''),
  }
}
