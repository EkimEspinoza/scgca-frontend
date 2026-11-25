// Gestiona búsqueda, paginación y mantenimiento de las cuentas comparativo.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actualizarCuentaComparativo, cambiarEstadoCuentaComparativo, crearCuentaComparativo, obtenerCuentasComparativo, obtenerTiposCuentaActivos } from '../services/cuentaComparativoService'

const formularioInicial = { Des_Cuenta_Comparativo: '', Id_Tipo_Cuenta: '' }

export function useCuentaComparativo() {
  const [cuentas, setCuentas] = useState([])
  const [tiposCuenta, setTiposCuenta] = useState([])
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
  const [seleccionado, setSeleccionado] = useState(null)
  const [tipoCambioEstado, setTipoCambioEstado] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const inicializado = useRef(false)

  const cargar = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const [registros, tipos] = await Promise.all([obtenerCuentasComparativo(), obtenerTiposCuentaActivos()])
      setCuentas(registros); setTiposCuenta(tipos)
    } catch (err) { console.error('Error cargando cuentas comparativo:', err); setError(err?.message || 'No se pudieron cargar las cuentas comparativo.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (!inicializado.current) { inicializado.current = true; cargar() } }, [cargar])

  const cuentasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return cuentas.filter((cuenta) => {
      const coincideTexto = String(cuenta.Id_Cuenta_Comparativo).includes(texto)
        || cuenta.Des_Cuenta_Comparativo?.toLocaleLowerCase('es').includes(texto)
        || cuenta.tipoCuentaDescripcion?.toLocaleLowerCase('es').includes(texto)
      const activo = Number(cuenta.estado) === 1
      const coincideEstado = filtroEstado === 'todos' || (filtroEstado === 'activos' && activo) || (filtroEstado === 'inactivos' && !activo)
      return coincideTexto && coincideEstado
    })
  }, [cuentas, busqueda, filtroEstado])
  const cuentasPaginadas = useMemo(() => cuentasFiltradas.slice(pagina * registrosPorPagina, (pagina + 1) * registrosPorPagina), [cuentasFiltradas, pagina, registrosPorPagina])
  const handleCambioBusqueda = (event) => { setBusqueda(event.target.value.toLocaleUpperCase('es')); setPagina(0) }
  const handleCambioFiltroEstado = (value) => { setFiltroEstado(value); setPagina(0) }
  const handleChangePagina = (_event, nuevaPagina) => setPagina(nuevaPagina)
  const handleChangeRegistrosPorPagina = (event) => { setRegistrosPorPagina(Number(event.target.value)); setPagina(0) }
  const handleNuevo = () => { setModoEdicion(false); setSeleccionado(null); setFormulario({ ...formularioInicial }); setErroresFormulario({}); setDialogOpen(true) }
  const handleEditar = (cuenta) => {
    setModoEdicion(true); setSeleccionado(cuenta)
    setFormulario({ Des_Cuenta_Comparativo: cuenta.Des_Cuenta_Comparativo ?? '', Id_Tipo_Cuenta: String(cuenta.Id_Tipo_Cuenta ?? '') })
    setErroresFormulario({}); setDialogOpen(true)
  }
  const handleCerrarDialog = () => { if (!guardando) { setDialogOpen(false); setSeleccionado(null); setFormulario({ ...formularioInicial }); setErroresFormulario({}) } }
  const handleChangeFormulario = (event) => { const { name, value } = event.target; setFormulario((actual) => ({ ...actual, [name]: name === 'Des_Cuenta_Comparativo' ? value.toLocaleUpperCase('es') : value })); setErroresFormulario((actual) => ({ ...actual, [name]: '' })) }
  const handleTipoCuentaChange = (tipo) => { setFormulario((actual) => ({ ...actual, Id_Tipo_Cuenta: tipo ? String(tipo.Id_Tipo_Cuenta) : '' })); setErroresFormulario((actual) => ({ ...actual, Id_Tipo_Cuenta: '' })) }
  const handleGuardar = async () => {
    const errores = {}
    if (!formulario.Des_Cuenta_Comparativo.trim()) errores.Des_Cuenta_Comparativo = 'La descripción es obligatoria.'
    if (!formulario.Id_Tipo_Cuenta) errores.Id_Tipo_Cuenta = 'Selecciona un tipo de cuenta.'
    setErroresFormulario(errores)
    if (Object.keys(errores).length) return
    try {
      setGuardando(true); setError('')
      if (modoEdicion) { await actualizarCuentaComparativo(seleccionado.Id_Cuenta_Comparativo, formulario); setMensaje('Cuenta comparativo actualizada.') }
      else { await crearCuentaComparativo(formulario); setMensaje('Cuenta comparativo creada.'); setPagina(0) }
      setDialogOpen(false); await cargar()
    } catch (err) { setError(err?.message || 'No se pudo guardar la cuenta comparativo.') }
    finally { setGuardando(false) }
  }
  const handleSolicitarCambioEstado = (cuenta) => setTipoCambioEstado({ ...cuenta, nuevoEstado: Number(cuenta.estado) !== 1 ? 1 : 0 })
  const handleCerrarConfirmacionEstado = () => { if (!cambiandoEstado) setTipoCambioEstado(null) }
  const handleConfirmarCambioEstado = async () => {
    if (!tipoCambioEstado) return
    try {
      setCambiandoEstado(true); setError('')
      const actualizado = await cambiarEstadoCuentaComparativo(tipoCambioEstado.Id_Cuenta_Comparativo, tipoCambioEstado.nuevoEstado)
      setCuentas((actuales) => actuales.map((cuenta) => cuenta.Id_Cuenta_Comparativo === actualizado.Id_Cuenta_Comparativo ? { ...cuenta, ...actualizado } : cuenta))
      setMensaje(actualizado.estado === 1 ? 'Cuenta comparativo reactivada.' : 'Cuenta comparativo desactivada.'); setTipoCambioEstado(null)
    } catch (err) { setError(err?.message || 'No se pudo cambiar el estado de la cuenta comparativo.') }
    finally { setCambiandoEstado(false) }
  }
  const handleExportarExcel = async () => {
    try { const { exportarCuentasComparativoExcel } = await import('../services/excelService'); exportarCuentasComparativoExcel(cuentasFiltradas) }
    catch (err) { setError(err?.message || 'No se pudieron exportar las cuentas comparativo.') }
  }

  return {
    cuentasPaginadas, totalRegistros: cuentasFiltradas.length, tiposCuenta, loading, guardando, cambiandoEstado, error, mensaje,
    busqueda, filtroEstado, pagina, registrosPorPagina, dialogOpen, modoEdicion, formulario, erroresFormulario, tipoCambioEstado,
    handleCambioBusqueda, handleCambioFiltroEstado, handleChangePagina, handleChangeRegistrosPorPagina, handleExportarExcel,
    handleNuevo, handleEditar, handleCerrarDialog, handleChangeFormulario, handleTipoCuentaChange, handleGuardar,
    handleSolicitarCambioEstado, handleCerrarConfirmacionEstado, handleConfirmarCambioEstado,
    handleCerrarMensaje: () => setMensaje(''), handleCerrarError: () => setError(''),
  }
}
