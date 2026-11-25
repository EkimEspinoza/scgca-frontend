// Gestiona búsqueda, paginación y acciones del catálogo Tipo de Cuenta.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actualizarTipoCuenta, cambiarEstadoTipoCuenta, crearTipoCuenta, obtenerTiposCuenta } from '../services/tipoCuentaService'

const formularioInicial = { DESCRIPCION_TIPO_CUENTA: '' }

export function useTipoCuenta() {
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
  const inicializado = useRef(false)

  const cargarTipos = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setTipos(await obtenerTiposCuenta())
    } catch (err) {
      console.error('Error cargando tipos de cuenta:', err)
      setError(err?.message || 'No se pudieron cargar los tipos de cuenta.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (inicializado.current) return
    inicializado.current = true
    cargarTipos()
  }, [cargarTipos])

  const tiposFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return tipos.filter((tipo) => {
      const coincideTexto = String(tipo.Id_Tipo_Cuenta).includes(texto) || tipo.DESCRIPCION_TIPO_CUENTA?.toLocaleLowerCase('es').includes(texto)
      const activo = Number(tipo.estado) === 1
      const coincideEstado = filtroEstado === 'todos' || (filtroEstado === 'activos' && activo) || (filtroEstado === 'inactivos' && !activo)
      return coincideTexto && coincideEstado
    })
  }, [tipos, busqueda, filtroEstado])
  const tiposPaginados = useMemo(() => tiposFiltrados.slice(pagina * registrosPorPagina, (pagina + 1) * registrosPorPagina), [tiposFiltrados, pagina, registrosPorPagina])

  const handleCambioBusqueda = (event) => { setBusqueda(event.target.value.toLocaleUpperCase('es')); setPagina(0) }
  const handleCambioFiltroEstado = (value) => { setFiltroEstado(value); setPagina(0) }
  const handleChangePagina = (_event, nuevaPagina) => setPagina(nuevaPagina)
  const handleChangeRegistrosPorPagina = (event) => { setRegistrosPorPagina(Number(event.target.value)); setPagina(0) }
  const handleNuevo = () => { setModoEdicion(false); setTipoSeleccionado(null); setFormulario({ ...formularioInicial }); setErroresFormulario({}); setDialogOpen(true) }
  const handleEditar = (tipo) => { setModoEdicion(true); setTipoSeleccionado(tipo); setFormulario({ DESCRIPCION_TIPO_CUENTA: tipo.DESCRIPCION_TIPO_CUENTA ?? '' }); setErroresFormulario({}); setDialogOpen(true) }
  const handleCerrarDialog = () => { if (guardando) return; setDialogOpen(false); setTipoSeleccionado(null); setFormulario({ ...formularioInicial }); setErroresFormulario({}) }
  const handleChangeFormulario = (event) => { const { name, value } = event.target; setFormulario((actual) => ({ ...actual, [name]: value.toLocaleUpperCase('es') })); setErroresFormulario((actual) => ({ ...actual, [name]: '' })) }
  const handleGuardar = async () => {
    const errores = formulario.DESCRIPCION_TIPO_CUENTA.trim() ? {} : { DESCRIPCION_TIPO_CUENTA: 'La descripción es obligatoria.' }
    setErroresFormulario(errores)
    if (Object.keys(errores).length) return
    try {
      setGuardando(true); setError('')
      if (modoEdicion) { await actualizarTipoCuenta(tipoSeleccionado.Id_Tipo_Cuenta, formulario); setMensaje('Tipo de cuenta actualizado correctamente.') }
      else { await crearTipoCuenta(formulario); setMensaje('Tipo de cuenta creado correctamente.'); setPagina(0) }
      setDialogOpen(false); await cargarTipos()
    } catch (err) { setError(err?.message || 'No se pudo guardar el tipo de cuenta.') }
    finally { setGuardando(false) }
  }
  const handleSolicitarCambioEstado = (tipo) => setTipoCambioEstado({ ...tipo, nuevoEstado: Number(tipo.estado) !== 1 ? 1 : 0 })
  const handleCerrarConfirmacionEstado = () => { if (!cambiandoEstado) setTipoCambioEstado(null) }
  const handleConfirmarCambioEstado = async () => {
    if (!tipoCambioEstado) return
    try {
      setCambiandoEstado(true); setError('')
      const actualizado = await cambiarEstadoTipoCuenta(tipoCambioEstado.Id_Tipo_Cuenta, tipoCambioEstado.nuevoEstado)
      setTipos((actuales) => actuales.map((tipo) => tipo.Id_Tipo_Cuenta === actualizado.Id_Tipo_Cuenta ? actualizado : tipo))
      setMensaje(actualizado.estado === 1 ? 'Tipo de cuenta reactivado.' : 'Tipo de cuenta desactivado.')
      setTipoCambioEstado(null)
    } catch (err) { setError(err?.message || 'No se pudo cambiar el estado del tipo de cuenta.') }
    finally { setCambiandoEstado(false) }
  }

  const handleExportarExcel = async () => {
    try { const { exportarTiposCuentaExcel } = await import('../services/excelService'); exportarTiposCuentaExcel(tiposFiltrados) }
    catch (err) { setError(err?.message || 'No se pudieron exportar los tipos de cuenta.') }
  }

  return {
    tiposPaginados, totalRegistros: tiposFiltrados.length, loading, guardando, cambiandoEstado, error, mensaje,
    busqueda, filtroEstado, pagina, registrosPorPagina, dialogOpen, modoEdicion, formulario, erroresFormulario, tipoCambioEstado,
    handleCambioBusqueda, handleCambioFiltroEstado, handleChangePagina, handleChangeRegistrosPorPagina, handleExportarExcel,
    handleNuevo, handleEditar, handleCerrarDialog, handleChangeFormulario, handleGuardar,
    handleSolicitarCambioEstado, handleCerrarConfirmacionEstado, handleConfirmarCambioEstado,
    handleCerrarMensaje: () => setMensaje(''), handleCerrarError: () => setError(''),
  }
}
