import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import {
  actualizarVariedad,
  cambiarEstadoVariedad,
  crearVariedad,
  obtenerVariedades,
} from '../services/variedadService'

const formularioInicial = { descripcion: '', estado: true }

export function useVariedades() {
  const { perfil } = useAuth()
  const puedeAdministrar = perfil?.permiso?.nombre === 'ADMIN'
  const [variedades, setVariedades] = useState([])
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
  const [variedadSeleccionada, setVariedadSeleccionada] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [variedadCambioEstado, setVariedadCambioEstado] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const cargaInicialIniciada = useRef(false)

  const cargarVariedades = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await obtenerVariedades()
      setVariedades(data ?? [])
    } catch (err) {
      console.error('Error cargando variedades:', err)
      setError('No se pudieron cargar las variedades.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicialIniciada.current) return
    cargaInicialIniciada.current = true
    cargarVariedades()
  }, [cargarVariedades])

  const variedadesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return variedades.filter((variedad) => {
      const coincideTexto = String(variedad.descripcion ?? '').toLocaleLowerCase('es').includes(texto)
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && Boolean(variedad.estado))
        || (filtroEstado === 'inactivos' && !Boolean(variedad.estado))
      return coincideTexto && coincideEstado
    })
  }, [variedades, busqueda, filtroEstado])

  const variedadesPaginadas = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return variedadesFiltradas.slice(inicio, inicio + registrosPorPagina)
  }, [variedadesFiltradas, pagina, registrosPorPagina])

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
      const { exportarVariedadesExcel } = await import('../services/excelService')
      exportarVariedadesExcel(variedadesFiltradas)
    } catch (err) {
      console.error('Error exportando variedades:', err)
      setError(err?.message || 'No se pudieron exportar las variedades.')
    }
  }

  const handleNuevaVariedad = () => {
    if (!puedeAdministrar) return
    setModoEdicion(false)
    setVariedadSeleccionada(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditarVariedad = (variedad) => {
    if (!puedeAdministrar) return
    setModoEdicion(true)
    setVariedadSeleccionada(variedad)
    setFormulario({ descripcion: variedad.descripcion ?? '', estado: variedad.estado ?? true })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setModoEdicion(false)
    setVariedadSeleccionada(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
  }

  const handleChangeFormulario = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({
      ...actual,
      [name]: name === 'descripcion' ? value.toLocaleUpperCase('es') : value,
    }))
    setErroresFormulario((actual) => ({ ...actual, [name]: '' }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!formulario.descripcion?.trim()) nuevosErrores.descripcion = 'La descripción es obligatoria.'
    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleGuardar = async () => {
    if (!puedeAdministrar || !validarFormulario()) return
    try {
      setGuardando(true)
      setError('')
      const datos = {
        descripcion: formulario.descripcion.trim().toLocaleUpperCase('es'),
        estado: Boolean(formulario.estado),
      }
      if (modoEdicion) {
        await actualizarVariedad(variedadSeleccionada.id_variedad, datos)
        setMensaje('Variedad actualizada correctamente.')
      } else {
        await crearVariedad(datos)
        setMensaje('Variedad creada correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      await cargarVariedades()
    } catch (err) {
      console.error('Error guardando variedad:', err)
      setError(err?.message || 'No se pudo guardar la variedad.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarCambioEstado = (variedad) => {
    if (!puedeAdministrar) return
    setVariedadCambioEstado({ ...variedad, nuevoEstado: !Boolean(variedad.estado) })
  }

  const handleCerrarConfirmacionEstado = () => {
    if (!cambiandoEstado) setVariedadCambioEstado(null)
  }

  const handleConfirmarCambioEstado = async () => {
    if (!puedeAdministrar || !variedadCambioEstado) return
    const { id_variedad, nuevoEstado } = variedadCambioEstado
    try {
      setCambiandoEstado(true)
      setError('')
      const variedadActualizada = await cambiarEstadoVariedad(id_variedad, nuevoEstado)
      setVariedades((actuales) => actuales.map((variedad) =>
        variedad.id_variedad === id_variedad ? variedadActualizada : variedad,
      ))
      setMensaje(nuevoEstado ? 'Variedad reactivada correctamente.' : 'Variedad desactivada correctamente.')
      setVariedadCambioEstado(null)
      setPagina(0)
    } catch (err) {
      console.error('Error cambiando estado de variedad:', err)
      setError(err?.message || 'No se pudo cambiar el estado de la variedad.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    puedeAdministrar, loading, guardando, error, mensaje, busqueda, filtroEstado, pagina,
    registrosPorPagina, dialogOpen, modoEdicion, formulario, erroresFormulario,
    variedadCambioEstado, cambiandoEstado, variedadesPaginadas,
    totalRegistros: variedadesFiltradas.length,
    handleExportarExcel, handleNuevaVariedad, handleCambioBusqueda, handleCambioFiltroEstado,
    handleChangePagina, handleChangeRegistrosPorPagina, handleEditarVariedad,
    handleCerrarDialog, handleChangeFormulario, handleGuardar, handleSolicitarCambioEstado,
    handleCerrarConfirmacionEstado, handleConfirmarCambioEstado,
    handleCerrarMensaje: () => setMensaje(''),
    handleCerrarError: () => setError(''),
  }
}
