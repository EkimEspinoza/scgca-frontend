import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  actualizarTipoCentroCosto,
  cambiarEstadoTipoCentroCosto,
  crearTipoCentroCosto,
  obtenerTiposCentroCosto,
} from '../services/tipoCentroCostoService'

const formularioInicial = { des_tip_cc: '', estado: true }

export function useTiposCentroCosto() {
  const [tipos, setTipos] = useState([])
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
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [tipoCambioEstado, setTipoCambioEstado] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const cargaInicialIniciada = useRef(false)

  const cargarTipos = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await obtenerTiposCentroCosto()
      setTipos(data ?? [])
    } catch (err) {
      console.error('Error cargando tipos de centro de costo:', err)
      setError('No se pudieron cargar los tipos de centro de costo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicialIniciada.current) return
    cargaInicialIniciada.current = true
    cargarTipos()
  }, [cargarTipos])

  const tiposFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return tipos.filter((tipo) => {
      const coincideTexto = String(tipo.des_tip_cc ?? '').toLocaleLowerCase('es').includes(texto)
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && Boolean(tipo.estado))
        || (filtroEstado === 'inactivos' && !Boolean(tipo.estado))
      return coincideTexto && coincideEstado
    })
  }, [tipos, busqueda, filtroEstado])

  const tiposPaginados = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return tiposFiltrados.slice(inicio, inicio + registrosPorPagina)
  }, [tiposFiltrados, pagina, registrosPorPagina])

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
      const { exportarTiposCentroCostoExcel } = await import('../services/excelService')
      exportarTiposCentroCostoExcel(tiposFiltrados)
    } catch (err) {
      console.error('Error exportando tipos de centro de costo:', err)
      setError(err?.message || 'No se pudieron exportar los tipos de centro de costo.')
    }
  }

  const handleNuevoTipoCentroCosto = () => {
    setModoEdicion(false)
    setTipoSeleccionado(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditar = (tipo) => {
    setModoEdicion(true)
    setTipoSeleccionado(tipo)
    setFormulario({ des_tip_cc: tipo.des_tip_cc ?? '', estado: Boolean(tipo.estado) })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setModoEdicion(false)
    setTipoSeleccionado(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
  }

  const handleChangeFormulario = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({
      ...actual,
      [name]: name === 'des_tip_cc' ? value.toLocaleUpperCase('es') : value,
    }))
    if (name === 'des_tip_cc' && erroresFormulario.des_tip_cc) {
      setErroresFormulario((actual) => ({ ...actual, des_tip_cc: '' }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!formulario.des_tip_cc?.trim()) {
      nuevosErrores.des_tip_cc = 'La descripción del tipo de centro de costo es obligatoria.'
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
        des_tip_cc: formulario.des_tip_cc.trim().toLocaleUpperCase('es'),
        estado: Boolean(formulario.estado),
      }

      if (!modoEdicion) {
        const nuevoTipo = await crearTipoCentroCosto(datos)
        setTipos((actuales) => [...actuales, nuevoTipo].sort((a, b) =>
          String(a.des_tip_cc ?? '').localeCompare(String(b.des_tip_cc ?? ''), 'es', { sensitivity: 'base' }),
        ))
        setMensaje('Tipo de centro de costo creado correctamente.')
      } else {
        const tipoActualizado = await actualizarTipoCentroCosto(tipoSeleccionado.id_tip_cc, datos)
        setTipos((actuales) => actuales
          .map((tipo) => tipo.id_tip_cc === tipoSeleccionado.id_tip_cc ? tipoActualizado : tipo)
          .sort((a, b) => String(a.des_tip_cc ?? '').localeCompare(String(b.des_tip_cc ?? ''), 'es', { sensitivity: 'base' })))
        setMensaje('Tipo de centro de costo actualizado correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      await cargarTipos()
    } catch (err) {
      console.error('Error guardando tipo de centro de costo:', err)
      setMensaje(err?.message || 'No se pudo guardar el tipo de centro de costo.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarCambioEstado = (tipo) => {
    setTipoCambioEstado({ ...tipo, nuevoEstado: !Boolean(tipo.estado) })
  }

  const handleCerrarConfirmacionEstado = () => {
    if (!cambiandoEstado) setTipoCambioEstado(null)
  }

  const handleConfirmarCambioEstado = async () => {
    if (!tipoCambioEstado) return
    const { id_tip_cc, nuevoEstado } = tipoCambioEstado
    try {
      setCambiandoEstado(true)
      setError('')
      const tipoActualizado = await cambiarEstadoTipoCentroCosto(id_tip_cc, nuevoEstado)
      setTipos((actuales) => actuales.map((tipo) => tipo.id_tip_cc === id_tip_cc ? tipoActualizado : tipo))
      setMensaje(nuevoEstado
        ? 'Tipo de centro de costo reactivado correctamente.'
        : 'Tipo de centro de costo desactivado correctamente.')
      setTipoCambioEstado(null)
      setPagina(0)
    } catch (err) {
      console.error('Error cambiando estado del tipo de centro de costo:', err)
      setError(err?.message || 'No se pudo cambiar el estado del tipo de centro de costo.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    loading, guardando, error, mensaje, busqueda, filtroEstado, pagina, registrosPorPagina,
    dialogOpen, modoEdicion, formulario, erroresFormulario, tipoCambioEstado, cambiandoEstado,
    tiposPaginados, totalRegistros: tiposFiltrados.length,
    handleExportarExcel, handleNuevoTipoCentroCosto, handleCambioBusqueda,
    handleCambioFiltroEstado, handleChangePagina, handleChangeRegistrosPorPagina,
    handleEditar, handleCerrarDialog, handleChangeFormulario, handleGuardar,
    handleSolicitarCambioEstado, handleCerrarConfirmacionEstado, handleConfirmarCambioEstado,
    handleCerrarMensaje: () => setMensaje(''),
    handleCerrarError: () => setError(''),
  }
}
