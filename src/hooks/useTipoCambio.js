// Gestiona estado y acciones de useTipoCambio.
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  actualizarTipoCambio, crearTipoCambio, obtenerSiguientePeriodo, obtenerTiposCambio,
  obtenerUltimoTipoCambio, prepararTipoCambioManual,
} from '../services/tipoCambioService'
import { formatearPeriodo, formularioTipoCambioInicial } from './tipoCambioFormatters'

export default function useTipoCambio() {
  const [tiposCambio, setTiposCambio] = useState([])
  const [ultimoTipoCambio, setUltimoTipoCambio] = useState(null)
  const [siguientePeriodo, setSiguientePeriodo] = useState(null)
  const [propuesta, setPropuesta] = useState(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null)
  const [formulario, setFormulario] = useState(formularioTipoCambioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [loading, setLoading] = useState(true)
  const [consultando, setConsultando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [dialogEdicionOpen, setDialogEdicionOpen] = useState(false)
  const [dialogPropuestaOpen, setDialogPropuestaOpen] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(0)
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10)
  const cargaInicialIniciada = useRef(false)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError('')
      const [historico, ultimo] = await Promise.all([obtenerTiposCambio(), obtenerUltimoTipoCambio()])
      setTiposCambio(historico || [])
      setUltimoTipoCambio(ultimo || null)
      try {
        setSiguientePeriodo(await obtenerSiguientePeriodo())
      } catch {
        setSiguientePeriodo(null)
      }
    } catch (err) {
      console.error('Error cargando tipos de cambio:', err)
      setError(err?.message || 'No se pudo cargar el histórico de tipos de cambio.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cargaInicialIniciada.current) return
    cargaInicialIniciada.current = true
    cargarDatos()
  }, [])

  const tiposCambioFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return tiposCambio
    return tiposCambio.filter((registro) => {
      const periodo = formatearPeriodo(registro.anho, registro.mes).toLowerCase()
      return String(registro.anho).includes(texto) || String(registro.mes).includes(texto) || periodo.includes(texto) || String(registro.tipo_cambio).includes(texto) || (registro.estado ? 'activo' : 'inactivo').includes(texto)
    })
  }, [tiposCambio, busqueda])

  const tiposCambioPaginados = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return tiposCambioFiltrados.slice(inicio, inicio + registrosPorPagina)
  }, [tiposCambioFiltrados, pagina, registrosPorPagina])

  const handleCambioBusqueda = (event) => {
    setBusqueda(event.target.value)
    setPagina(0)
  }
  const handleChangePagina = (_event, nuevaPagina) => setPagina(nuevaPagina)
  const handleChangeRegistrosPorPagina = (event) => {
    setRegistrosPorPagina(parseInt(event.target.value, 10))
    setPagina(0)
  }

  const handlePrepararIngresoManual = async () => {
    try {
      setConsultando(true)
      setError('')
      setPropuesta(null)
      setPropuesta(await prepararTipoCambioManual())
      setDialogPropuestaOpen(true)
    } catch (err) {
      console.error('Error preparando el tipo de cambio:', err)
      setError(err?.message || 'No se pudo preparar el registro manual.')
    } finally {
      setConsultando(false)
    }
  }

  const handleConfirmarPropuesta = async () => {
    if (!propuesta) return
    try {
      setGuardando(true)
      setError('')
      await crearTipoCambio({ anho: propuesta.anho, mes: propuesta.mes, tipo_cambio: propuesta.tipo_cambio })
      setDialogPropuestaOpen(false)
      setPropuesta(null)
      setMensaje('Tipo de cambio registrado correctamente.')
      setPagina(0)
      await cargarDatos()
    } catch (err) {
      console.error('Error guardando el tipo de cambio:', err)
      setError(err?.message || 'No se pudo registrar el tipo de cambio.')
    } finally {
      setGuardando(false)
    }
  }

  const handleEditarTipo = (registro) => {
    setTipoSeleccionado(registro)
    setFormulario({ tipo_cambio: String(registro.tipo_cambio ?? ''), estado: registro.estado ?? true })
    setErroresFormulario({})
    setDialogEdicionOpen(true)
  }
  const handleCerrarEdicion = () => {
    if (guardando) return
    setDialogEdicionOpen(false)
    setTipoSeleccionado(null)
    setFormulario(formularioTipoCambioInicial)
    setErroresFormulario({})
  }
  const handleChangeFormulario = (event) => {
    const { name, value } = event.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }))
  }
  const handleCambiarEstadoFormulario = () => setFormulario((prev) => ({ ...prev, estado: !prev.estado }))

  const validarFormulario = () => {
    const nuevosErrores = {}
    const valor = Number(formulario.tipo_cambio)
    if (formulario.tipo_cambio === '' || !Number.isFinite(valor) || valor <= 0) nuevosErrores.tipo_cambio = 'Ingresa un tipo de cambio mayor que cero.'
    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleGuardarEdicion = async () => {
    if (!tipoSeleccionado || !validarFormulario()) return
    try {
      setGuardando(true)
      setError('')
      await actualizarTipoCambio(tipoSeleccionado.id_tipo_cambio, { tipo_cambio: Number(formulario.tipo_cambio), estado: formulario.estado })
      setDialogEdicionOpen(false)
      setTipoSeleccionado(null)
      setMensaje('Tipo de cambio actualizado correctamente.')
      await cargarDatos()
    } catch (err) {
      console.error('Error actualizando el tipo de cambio:', err)
      setError(err?.message || 'No se pudo actualizar el tipo de cambio.')
    } finally {
      setGuardando(false)
    }
  }

  return {
    tiposCambio, ultimoTipoCambio, siguientePeriodo, propuesta, setPropuesta, tipoSeleccionado,
    formulario, erroresFormulario, loading, consultando, guardando, error, setError, mensaje, setMensaje,
    dialogEdicionOpen, setDialogEdicionOpen, dialogPropuestaOpen, setDialogPropuestaOpen,
    busqueda, pagina, registrosPorPagina, tiposCambioFiltrados, tiposCambioPaginados,
    cargarDatos, handleCambioBusqueda, handleChangePagina, handleChangeRegistrosPorPagina,
    handlePrepararIngresoManual, handleConfirmarPropuesta, handleEditarTipo, handleCerrarEdicion,
    handleChangeFormulario, handleCambiarEstadoFormulario, handleGuardarEdicion,
  }
}
