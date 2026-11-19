import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actualizarGrupoLabor, cambiarEstadoGrupoLabor, crearGrupoLabor, obtenerGruposLabor } from '../services/grupoLaborService'

const formularioInicial = { DescripcionLabor: '', TIPO_GRUPO: '1' }

export function useGrupoLabor() {
  const [grupos, setGrupos] = useState([])
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
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null)
  const [grupoCambioEstado, setGrupoCambioEstado] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const cargaInicial = useRef(false)

  const cargarGrupos = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setGrupos(await obtenerGruposLabor())
    } catch (err) {
      console.error('Error cargando grupos de labor:', err)
      setError(err?.message || 'No se pudieron cargar los grupos de labor.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicial.current) return
    cargaInicial.current = true
    cargarGrupos()
  }, [cargarGrupos])

  const gruposFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    return grupos.filter((grupo) => {
      const coincideTexto = String(grupo.Id_Grupo_Labor).includes(texto)
        || grupo.DescripcionLabor?.toLocaleLowerCase('es').includes(texto)
        || String(grupo.TIPO_GRUPO).includes(texto)
      const estado = Number(grupo.estado) === 1
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && estado)
        || (filtroEstado === 'inactivos' && !estado)
      return coincideTexto && coincideEstado
    })
  }, [grupos, busqueda, filtroEstado])

  const gruposPaginados = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return gruposFiltrados.slice(inicio, inicio + registrosPorPagina)
  }, [gruposFiltrados, pagina, registrosPorPagina])

  const handleCambioBusqueda = (event) => { setBusqueda(event.target.value.toLocaleUpperCase('es')); setPagina(0) }
  const handleCambioFiltroEstado = (value) => { setFiltroEstado(value); setPagina(0) }
  const handleChangePagina = (_event, nuevaPagina) => setPagina(nuevaPagina)
  const handleChangeRegistrosPorPagina = (event) => { setRegistrosPorPagina(Number(event.target.value)); setPagina(0) }
  const handleExportarExcel = async () => {
    try {
      const { exportarGruposLaborExcel } = await import('../services/excelService')
      exportarGruposLaborExcel(gruposFiltrados)
    } catch (err) {
      setError(err?.message || 'No se pudieron exportar los grupos de labor.')
    }
  }

  const handleNuevo = () => {
    setModoEdicion(false)
    setGrupoSeleccionado(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditar = (grupo) => {
    setModoEdicion(true)
    setGrupoSeleccionado(grupo)
    setFormulario({ DescripcionLabor: grupo.DescripcionLabor ?? '', TIPO_GRUPO: String(grupo.TIPO_GRUPO ?? 1) })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setGrupoSeleccionado(null)
    setFormulario({ ...formularioInicial })
    setErroresFormulario({})
  }

  const handleChangeFormulario = (event) => {
    const { name, value } = event.target
    const valorFormulario = name === 'DescripcionLabor' ? value.toLocaleUpperCase('es') : value
    setFormulario((actual) => ({ ...actual, [name]: valorFormulario }))
    setErroresFormulario((actual) => ({ ...actual, [name]: '' }))
  }

  const handleGuardar = async () => {
    const descripcion = formulario.DescripcionLabor.trim()
    const errores = descripcion ? {} : { DescripcionLabor: 'La descripción es obligatoria.' }
    setErroresFormulario(errores)
    if (Object.keys(errores).length) return

    try {
      setGuardando(true)
      setError('')
      if (modoEdicion) {
        await actualizarGrupoLabor(grupoSeleccionado.Id_Grupo_Labor, formulario)
        setMensaje('Grupo de labor actualizado correctamente.')
      } else {
        await crearGrupoLabor(formulario)
        setMensaje('Grupo de labor creado correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      await cargarGrupos()
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el grupo de labor.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarCambioEstado = (grupo) => setGrupoCambioEstado({ ...grupo, nuevoEstado: Number(grupo.estado) !== 1 ? 1 : 0 })
  const handleCerrarConfirmacionEstado = () => { if (!cambiandoEstado) setGrupoCambioEstado(null) }

  const handleConfirmarCambioEstado = async () => {
    if (!grupoCambioEstado) return
    try {
      setCambiandoEstado(true)
      setError('')
      const actualizado = await cambiarEstadoGrupoLabor(grupoCambioEstado.Id_Grupo_Labor, grupoCambioEstado.nuevoEstado)
      setGrupos((actuales) => actuales.map((grupo) => grupo.Id_Grupo_Labor === actualizado.Id_Grupo_Labor ? actualizado : grupo))
      setMensaje(actualizado.estado === 1 ? 'Grupo de labor reactivado.' : 'Grupo de labor desactivado.')
      setGrupoCambioEstado(null)
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar el estado del grupo de labor.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  return {
    gruposFiltrados, gruposPaginados, totalRegistros: gruposFiltrados.length, loading, guardando, cambiandoEstado,
    error, mensaje, busqueda, filtroEstado, pagina, registrosPorPagina, dialogOpen, modoEdicion, formulario,
    erroresFormulario, grupoCambioEstado, handleCambioBusqueda, handleCambioFiltroEstado, handleChangePagina,
    handleChangeRegistrosPorPagina, handleExportarExcel, handleNuevo, handleEditar, handleCerrarDialog,
    handleChangeFormulario, handleGuardar, handleSolicitarCambioEstado, handleCerrarConfirmacionEstado,
    handleConfirmarCambioEstado, handleCerrarMensaje: () => setMensaje(''), handleCerrarError: () => setError(''),
  }
}
