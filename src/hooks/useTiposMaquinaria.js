import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  actualizarTipoMaquinaria,
  cambiarEstadoTipoMaquinaria,
  crearTipoMaquinaria,
  obtenerTiposMaquinaria,
} from '../services/tipoMaquinariaService'

const formularioInicial = { des_tipo_maquinaria: '', estado: true }

export function useTiposMaquinaria() {
  const [tiposMaquinaria, setTiposMaquinaria] = useState([])
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

  const cargarTiposMaquinaria = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await obtenerTiposMaquinaria()
      setTiposMaquinaria(data ?? [])
    } catch (err) {
      console.error('Error cargando tipos de maquinaria:', err)
      setError('No se pudieron cargar los tipos de maquinaria.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicialIniciada.current) return
    cargaInicialIniciada.current = true
    cargarTiposMaquinaria()
  }, [cargarTiposMaquinaria])

  const tiposMaquinariaFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return tiposMaquinaria.filter((tipo) => {
      const coincideTexto = String(tipo.des_tipo_maquinaria ?? '').toLocaleLowerCase('es').includes(texto)
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && Boolean(tipo.estado))
        || (filtroEstado === 'inactivos' && !Boolean(tipo.estado))
      return coincideTexto && coincideEstado
    })
  }, [tiposMaquinaria, busqueda, filtroEstado])

  const tiposMaquinariaPaginados = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return tiposMaquinariaFiltrados.slice(inicio, inicio + registrosPorPagina)
  }, [tiposMaquinariaFiltrados, pagina, registrosPorPagina])

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
      const { exportarTiposMaquinariaExcel } = await import('../services/excelService')
      exportarTiposMaquinariaExcel(tiposMaquinariaFiltrados)
    } catch (err) {
      console.error('Error exportando tipos de maquinaria:', err)
      setError(err?.message || 'No se pudieron exportar los tipos de maquinaria.')
    }
  }

  const handleNuevoTipo = () => {
    setModoEdicion(false)
    setTipoSeleccionado(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditarTipo = (tipo) => {
    setModoEdicion(true)
    setTipoSeleccionado(tipo)
    setFormulario({
      des_tipo_maquinaria: tipo.des_tipo_maquinaria ?? '',
      estado: tipo.estado ?? true,
    })
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
    const nuevoValor = name === 'des_tipo_maquinaria' ? value.toLocaleUpperCase('es') : value
    setFormulario((actual) => ({ ...actual, [name]: nuevoValor }))
    setErroresFormulario((actual) => ({ ...actual, [name]: '' }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!formulario.des_tipo_maquinaria?.trim()) {
      nuevosErrores.des_tipo_maquinaria = 'La descripción es obligatoria.'
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
        des_tipo_maquinaria: formulario.des_tipo_maquinaria.trim().toLocaleUpperCase('es'),
        estado: Boolean(formulario.estado),
      }
      if (modoEdicion) {
        await actualizarTipoMaquinaria(tipoSeleccionado.id_tipo_maq, datos)
        setMensaje('Tipo de maquinaria actualizado correctamente.')
      } else {
        await crearTipoMaquinaria(datos)
        setMensaje('Tipo de maquinaria creado correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      await cargarTiposMaquinaria()
    } catch (err) {
      console.error('Error guardando tipo de maquinaria:', err)
      setError(err?.message || 'No se pudo guardar el tipo de maquinaria.')
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
    const { id_tipo_maq, nuevoEstado } = tipoCambioEstado
    try {
      setCambiandoEstado(true)
      setError('')
      const tipoActualizado = await cambiarEstadoTipoMaquinaria(id_tipo_maq, nuevoEstado)
      setTiposMaquinaria((actuales) => actuales.map((tipo) =>
        tipo.id_tipo_maq === id_tipo_maq ? tipoActualizado : tipo,
      ))
      setMensaje(nuevoEstado
        ? 'Tipo de maquinaria reactivado correctamente.'
        : 'Tipo de maquinaria desactivado correctamente.')
      setTipoCambioEstado(null)
      setPagina(0)
    } catch (err) {
      console.error('Error cambiando estado del tipo de maquinaria:', err)
      setError(err?.message || 'No se pudo cambiar el estado del tipo de maquinaria.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    loading, guardando, error, mensaje, busqueda, filtroEstado, pagina, registrosPorPagina,
    dialogOpen, modoEdicion, formulario, erroresFormulario, tipoCambioEstado, cambiandoEstado,
    tiposMaquinariaPaginados, totalRegistros: tiposMaquinariaFiltrados.length,
    handleExportarExcel, handleNuevoTipo, handleCambioBusqueda, handleCambioFiltroEstado,
    handleChangePagina, handleChangeRegistrosPorPagina, handleEditarTipo, handleCerrarDialog,
    handleChangeFormulario, handleGuardar, handleSolicitarCambioEstado,
    handleCerrarConfirmacionEstado, handleConfirmarCambioEstado,
    handleCerrarMensaje: () => setMensaje(''),
    handleCerrarError: () => setError(''),
  }
}
