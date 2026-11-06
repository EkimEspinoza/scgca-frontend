import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  actualizarEmpresa,
  cambiarEstadoEmpresa,
  crearEmpresa,
  obtenerTodasLasEmpresas,
} from '../services/empresaService'

const formularioInicial = { descripcion: '', nombre_comercial: '', estado: true }

export function useEmpresa() {
  const [empresas, setEmpresas] = useState([])
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
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [empresaCambioEstado, setEmpresaCambioEstado] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const cargaInicialIniciada = useRef(false)

  const cargarEmpresas = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await obtenerTodasLasEmpresas()
      setEmpresas(data || [])
    } catch (err) {
      console.error('Error cargando empresas:', err)
      setError('No se pudieron cargar las empresas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cargaInicialIniciada.current) return
    cargaInicialIniciada.current = true
    cargarEmpresas()
  }, [cargarEmpresas])

  const empresasFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return empresas.filter((empresa) => {
      const coincideTexto = empresa.descripcion?.toLowerCase().includes(texto)
        || empresa.nombre_comercial?.toLowerCase().includes(texto)
      const coincideEstado = filtroEstado === 'todos'
        || (filtroEstado === 'activos' && Boolean(empresa.estado))
        || (filtroEstado === 'inactivos' && !Boolean(empresa.estado))
      return coincideTexto && coincideEstado
    })
  }, [empresas, busqueda, filtroEstado])

  const empresasPaginados = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return empresasFiltrados.slice(inicio, inicio + registrosPorPagina)
  }, [empresasFiltrados, pagina, registrosPorPagina])

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

  const handleNuevaEmpresa = () => {
    setModoEdicion(false)
    setEmpresaSeleccionada(null)
    setFormulario(formularioInicial)
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleEditarEmpresa = (empresa) => {
    setModoEdicion(true)
    setEmpresaSeleccionada(empresa)
    setFormulario({
      descripcion: empresa.descripcion || '',
      nombre_comercial: (empresa.nombre_comercial || '').toUpperCase(),
      estado: empresa.estado ?? true,
    })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setEmpresaSeleccionada(null)
    setFormulario(formularioInicial)
    setErroresFormulario({})
  }

  const handleChangeFormulario = (event) => {
    const { name, value } = event.target
    const nuevoValor = name === 'nombre_comercial' ? value.toUpperCase() : value
    setFormulario((prev) => ({ ...prev, [name]: nuevoValor }))
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!formulario.descripcion.trim()) nuevosErrores.descripcion = 'La descripción es obligatoria.'
    if (!formulario.nombre_comercial.trim()) nuevosErrores.nombre_comercial = 'El nombre comercial es obligatorio.'
    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleGuardar = async () => {
    if (!validarFormulario()) return
    try {
      setGuardando(true)
      setError('')
      const datos = {
        descripcion: formulario.descripcion.trim(),
        nombre_comercial: formulario.nombre_comercial.trim().toUpperCase(),
        estado: formulario.estado,
      }

      if (modoEdicion) {
        await actualizarEmpresa(empresaSeleccionada.id_empresa, datos)
        setMensaje('Empresa actualizada correctamente.')
      } else {
        await crearEmpresa(datos)
        setMensaje('Empresa creada correctamente.')
      }
      setDialogOpen(false)
      await cargarEmpresas()
    } catch (err) {
      console.error('Error guardando empresa:', err)
      setError(err?.message || 'No se pudo guardar la empresa.')
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarCambioEstado = (empresa) => {
    setEmpresaCambioEstado({ ...empresa, nuevoEstado: !Boolean(empresa.estado) })
  }

  const handleCerrarConfirmacionEstado = () => {
    if (!cambiandoEstado) setEmpresaCambioEstado(null)
  }

  const handleConfirmarCambioEstado = async () => {
    if (!empresaCambioEstado) return
    const { id_empresa, nuevoEstado } = empresaCambioEstado
    try {
      setCambiandoEstado(true)
      setError('')
      const empresaActualizada = await cambiarEstadoEmpresa(id_empresa, nuevoEstado)
      setEmpresas((actuales) => actuales.map((empresa) => (
        empresa.id_empresa === id_empresa ? empresaActualizada : empresa
      )))
      setMensaje(nuevoEstado
        ? 'Empresa reactivada correctamente.'
        : 'Empresa desactivada correctamente.')
      setEmpresaCambioEstado(null)
      setPagina(0)
    } catch (err) {
      console.error('Error cambiando estado de empresa:', err)
      setError(err?.message || 'No se pudo cambiar el estado de la empresa.')
    } finally {
      setCambiandoEstado(false)
    }
  }

  const handleExportarExcel = async () => {
    if (empresasFiltrados.length === 0) {
      setError('No hay empresas para exportar con los filtros actuales.')
      return
    }
    try {
      const { exportarEmpresasExcel } = await import('../services/excelService')
      exportarEmpresasExcel(empresasFiltrados)
    } catch (err) {
      console.error('Error exportando empresas:', err)
      setError(err?.message || 'No se pudieron exportar las empresas.')
    }
  }

  return {
    empresas,
    empresasFiltrados,
    empresasPaginados,
    totalRegistros: empresasFiltrados.length,
    loading,
    guardando,
    error,
    mensaje,
    busqueda,
    filtroEstado,
    pagina,
    registrosPorPagina,
    dialogOpen,
    modoEdicion,
    formulario,
    erroresFormulario,
    empresaCambioEstado,
    cambiandoEstado,
    handleCambioBusqueda,
    handleCambioFiltroEstado,
    handleChangePagina,
    handleChangeRegistrosPorPagina,
    handleNuevaEmpresa,
    handleEditarEmpresa,
    handleCerrarDialog,
    handleChangeFormulario,
    handleGuardar,
    handleSolicitarCambioEstado,
    handleCerrarConfirmacionEstado,
    handleConfirmarCambioEstado,
    handleExportarExcel,
    handleCerrarMensaje: () => setMensaje(''),
    handleCerrarError: () => setError(''),
  }
}
