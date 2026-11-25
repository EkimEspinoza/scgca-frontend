// Gestiona consulta, filtros y mantenimiento del catálogo de Cuentas.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEmpresa } from '../context/useEmpresa'
import { actualizarCuenta, cambiarEstadoCuenta, crearCuenta, obtenerCuentas } from '../services/cuentaService'

const formularioInicial = { Id_Empresa: '', CUENTA: '', CUENTA_PK: '', DESCRIPCION_CUENTA: '', Id_Cuenta_Comparativo: '' }

export function useCuenta() {
  const { empresaActual } = useEmpresa()
  const idEmpresa = empresaActual?.id_empresa ?? null
  const [cuentas, setCuentas] = useState([])
  const [empresasCatalogo, setEmpresasCatalogo] = useState([])
  const [comparativosCatalogo, setComparativosCatalogo] = useState([])
  const [loading, setLoading] = useState(true)
  const [exportandoExcel, setExportandoExcel] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cuentaFiltro, setCuentaFiltro] = useState('todos')
  const [comparativoFiltro, setComparativoFiltro] = useState('todos')
  const [estado, setEstado] = useState('todos')
  const [pagina, setPagina] = useState(0)
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [seleccionada, setSeleccionada] = useState(null)
  const [tipoCambioEstado, setTipoCambioEstado] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const inicializado = useRef(false)

  const cargar = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const resultado = await obtenerCuentas()
      setCuentas(resultado.cuentas); setEmpresasCatalogo(resultado.empresas); setComparativosCatalogo(resultado.comparativos)
    } catch (err) { console.error('Error cargando cuentas:', err); setError(err?.message || 'No se pudieron cargar las cuentas.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (!inicializado.current) { inicializado.current = true; cargar() } }, [cargar])
  useEffect(() => { setCuentaFiltro('todos'); setPagina(0) }, [idEmpresa])

  const cuentasOpciones = useMemo(() => {
    const opciones = cuentas.filter((cuenta) => idEmpresa === null || Number(cuenta.Id_Empresa) === Number(idEmpresa))
    return [...new Map(opciones.map((cuenta) => [Number(cuenta.CUENTA_PK), cuenta])).values()].sort((a, b) => Number(a.CUENTA) - Number(b.CUENTA) || a.empresaNombre.localeCompare(b.empresaNombre, 'es'))
  }, [cuentas, idEmpresa])
  const filtradas = useMemo(() => {
    return cuentas.filter((cuenta) => {
      const coincideEmpresa = idEmpresa === null || Number(cuenta.Id_Empresa) === Number(idEmpresa)
      const coincideCuenta = cuentaFiltro === 'todos' || Number(cuenta.CUENTA_PK) === Number(cuentaFiltro)
      const coincideComparativo = comparativoFiltro === 'todos' || Number(cuenta.Id_Cuenta_Comparativo) === Number(comparativoFiltro)
      const activo = Number(cuenta.estado) === 1
      const coincideEstado = estado === 'todos' || (estado === 'activos' && activo) || (estado === 'inactivos' && !activo)
      return coincideEmpresa && coincideCuenta && coincideComparativo && coincideEstado
    })
  }, [cuentas, idEmpresa, cuentaFiltro, comparativoFiltro, estado])
  const paginadas = useMemo(() => filtradas.slice(pagina * registrosPorPagina, (pagina + 1) * registrosPorPagina), [filtradas, pagina, registrosPorPagina])
  const handleCuentaFiltro = (value) => { setCuentaFiltro(value); setPagina(0) }
  const handleComparativoFiltro = (value) => { setComparativoFiltro(value); setPagina(0) }
  const handleEstado = (event) => { setEstado(event.target.value); setPagina(0) }
  const handlePagina = (_event, nueva) => setPagina(nueva)
  const handleRegistrosPorPagina = (event) => { setRegistrosPorPagina(Number(event.target.value)); setPagina(0) }
  const handleNuevo = () => { setModoEdicion(false); setSeleccionada(null); setFormulario({ ...formularioInicial }); setErroresFormulario({}); setDialogOpen(true) }
  const handleEditar = (cuenta) => {
    setModoEdicion(true); setSeleccionada(cuenta)
    setFormulario({ Id_Empresa: String(cuenta.Id_Empresa), CUENTA: String(cuenta.CUENTA), CUENTA_PK: String(cuenta.CUENTA_PK), DESCRIPCION_CUENTA: cuenta.DESCRIPCION_CUENTA ?? '', Id_Cuenta_Comparativo: String(cuenta.Id_Cuenta_Comparativo) })
    setErroresFormulario({}); setDialogOpen(true)
  }
  const handleCerrarDialog = () => { if (!guardando) { setDialogOpen(false); setSeleccionada(null); setFormulario({ ...formularioInicial }); setErroresFormulario({}) } }
  const handleCambioFormulario = (event) => { const { name, value } = event.target; setFormulario((actual) => ({ ...actual, [name]: name === 'DESCRIPCION_CUENTA' ? value.toLocaleUpperCase('es') : value })); setErroresFormulario((actual) => ({ ...actual, [name]: '' })) }
  const handleCambioCatalogo = (event) => { const { name, value } = event.target; setFormulario((actual) => ({ ...actual, [name]: value })); setErroresFormulario((actual) => ({ ...actual, [name]: '' })) }
  const handleGuardar = async () => {
    const errores = {}
    if (!formulario.Id_Empresa) errores.Id_Empresa = 'Selecciona una empresa.'
    if (!/^\d+$/.test(formulario.CUENTA) || Number(formulario.CUENTA) <= 0) errores.CUENTA = 'Ingresa un código de cuenta válido.'
    if (!/^\d+$/.test(formulario.CUENTA_PK) || Number(formulario.CUENTA_PK) <= 0) errores.CUENTA_PK = 'Ingresa un código global válido.'
    if (!formulario.DESCRIPCION_CUENTA.trim()) errores.DESCRIPCION_CUENTA = 'La descripción es obligatoria.'
    if (!formulario.Id_Cuenta_Comparativo) errores.Id_Cuenta_Comparativo = 'Selecciona una cuenta comparativo.'
    setErroresFormulario(errores)
    if (Object.keys(errores).length) return
    try {
      setGuardando(true); setError('')
      if (modoEdicion) { await actualizarCuenta(seleccionada.ID_CUENTA, formulario); setMensaje('Cuenta actualizada correctamente.') }
      else { await crearCuenta(formulario); setMensaje('Cuenta creada correctamente.'); setPagina(0) }
      setDialogOpen(false); await cargar()
    } catch (err) { setError(err?.message || 'No se pudo guardar la cuenta.') }
    finally { setGuardando(false) }
  }
  const handleSolicitarCambioEstado = (cuenta) => setTipoCambioEstado({ ...cuenta, nuevoEstado: Number(cuenta.estado) !== 1 ? 1 : 0 })
  const handleCerrarConfirmacionEstado = () => { if (!cambiandoEstado) setTipoCambioEstado(null) }
  const handleConfirmarCambioEstado = async () => {
    if (!tipoCambioEstado) return
    try {
      setCambiandoEstado(true); setError('')
      const actualizado = await cambiarEstadoCuenta(tipoCambioEstado.ID_CUENTA, tipoCambioEstado.nuevoEstado)
      setCuentas((actuales) => actuales.map((cuenta) => cuenta.ID_CUENTA === actualizado.ID_CUENTA ? { ...cuenta, ...actualizado } : cuenta))
      setPagina(0)
      setMensaje(actualizado.estado === 1 ? 'Cuenta reactivada.' : 'Cuenta desactivada.'); setTipoCambioEstado(null)
    } catch (err) { setError(err?.message || 'No se pudo cambiar el estado de la cuenta.') }
    finally { setCambiandoEstado(false) }
  }

  const handleExportarExcel = async () => {
    try {
      setExportandoExcel(true)
      const { exportarCuentasExcel } = await import('../services/excelService')
      exportarCuentasExcel(filtradas)
    } catch (err) { setError(err?.message || 'No se pudieron exportar las cuentas.') }
    finally { setExportandoExcel(false) }
  }

  return {
    loading, exportandoExcel, guardando, cambiandoEstado, error, mensaje, empresasCatalogo, comparativosCatalogo, cuentasOpciones,
    idEmpresa, cuentaFiltro, comparativoFiltro, estado, pagina, registrosPorPagina, cuentas: paginadas, total: filtradas.length,
    dialogOpen, modoEdicion, formulario, erroresFormulario, tipoCambioEstado,
    handleCuentaFiltro, handleComparativoFiltro, handleEstado, handlePagina, handleRegistrosPorPagina, handleExportarExcel, handleNuevo, handleEditar,
    handleCerrarDialog, handleCambioFormulario, handleCambioCatalogo, handleGuardar, handleSolicitarCambioEstado,
    handleCerrarConfirmacionEstado, handleConfirmarCambioEstado, handleCerrarMensaje: () => setMensaje(''), handleCerrarError: () => setError(''),
  }
}
