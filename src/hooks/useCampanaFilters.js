// Mantiene los filtros, la búsqueda y la paginación del módulo Campañas.
import { useEffect, useMemo, useState } from 'react'

export default function useCampanaFilters({ campanas, esModoContextual, codCcPkContextual, empresaGlobalId }) {
  const [busqueda, setBusqueda] = useState('')
  const [tipoCentroCostoFiltro, setTipoCentroCostoFiltro] = useState('')
  const [centroCostoFiltro, setCentroCostoFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [cierreFiltro, setCierreFiltro] = useState('')
  const [pagina, setPagina] = useState(0)
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10)

  const campanasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    let resultado = campanas

    if (esModoContextual) resultado = resultado.filter((campana) => String(campana.cod_cc_pk) === String(codCcPkContextual))
    if (empresaGlobalId) resultado = resultado.filter((campana) => String(campana.id_empresa) === String(empresaGlobalId))
    if (tipoCentroCostoFiltro) resultado = resultado.filter((campana) => String(campana.centro_costo?.id_tip_cc) === String(tipoCentroCostoFiltro))
    if (centroCostoFiltro) resultado = resultado.filter((campana) => String(campana.cod_cc_pk) === String(centroCostoFiltro))
    if (estadoFiltro !== '') resultado = resultado.filter((campana) => Boolean(campana.estado) === (estadoFiltro === 'true'))
    if (cierreFiltro !== '') resultado = resultado.filter((campana) => Boolean(campana.cierre_camp) === (cierreFiltro === 'true'))
    if (!texto) return resultado

    return resultado.filter((campana) => {
      const empresa = campana.empresa?.descripcion ?? ''
      const comercial = campana.empresa?.nombre_comercial ?? ''
      const centroCosto = campana.centro_costo?.desc_cc ?? ''
      const codigoCc = campana.centro_costo?.cod_cc?.toString() ?? ''
      const idCampana = campana.id_campana?.toString() ?? ''
      const idCampanaEmpresa = campana.id_campana_emp?.toString() ?? ''
      const nombre = campana.nombre_campana ?? ''
      const estado = campana.estado ? 'activo' : 'inactivo'
      const cierre = campana.cierre_camp ? 'cerrada' : 'abierta'
      return [empresa, comercial, centroCosto, codigoCc, idCampana, idCampanaEmpresa, nombre, estado, cierre].join(' ').toLowerCase().includes(texto)
    })
  }, [campanas, busqueda, empresaGlobalId, tipoCentroCostoFiltro, centroCostoFiltro, estadoFiltro, cierreFiltro, esModoContextual, codCcPkContextual])

  useEffect(() => {
    // Restablece la página cuando cambian los criterios del filtro.
    // eslint-disable-next-line react/set-state-in-effect
    setTipoCentroCostoFiltro('')
    setCentroCostoFiltro('')
    setPagina(0)
  }, [empresaGlobalId])

  useEffect(() => {
    // Restablece la página cuando cambian los demás criterios del filtro.
    // eslint-disable-next-line react/set-state-in-effect
    setPagina(0)
  }, [busqueda, tipoCentroCostoFiltro, centroCostoFiltro, estadoFiltro, cierreFiltro, codCcPkContextual])

  const campanasPaginadas = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    return campanasFiltradas.slice(inicio, inicio + registrosPorPagina)
  }, [campanasFiltradas, pagina, registrosPorPagina])

  function handleBusquedaChange(event) {
    setBusqueda(event.target.value)
    setPagina(0)
  }

  function handleTipoCentroCostoFiltroChange(event) {
    setTipoCentroCostoFiltro(event.target.value)
    setCentroCostoFiltro('')
    setPagina(0)
  }

  function handleCentroCostoFiltroChange(event) {
    setCentroCostoFiltro(event.target.value)
    setPagina(0)
  }

  function handleEstadoFiltroChange(event) {
    setEstadoFiltro(event.target.value)
    setPagina(0)
  }

  function handleCierreFiltroChange(event) {
    setCierreFiltro(event.target.value)
    setPagina(0)
  }

  function limpiarFiltros() {
    setTipoCentroCostoFiltro('')
    setCentroCostoFiltro('')
    setEstadoFiltro('')
    setCierreFiltro('')
    setBusqueda('')
    setPagina(0)
  }

  return {
    busqueda, setBusqueda, tipoCentroCostoFiltro, setTipoCentroCostoFiltro,
    centroCostoFiltro, setCentroCostoFiltro, estadoFiltro, setEstadoFiltro, cierreFiltro, setCierreFiltro,
    pagina, setPagina, registrosPorPagina, setRegistrosPorPagina, campanasFiltradas, campanasPaginadas,
    handleBusquedaChange, handleTipoCentroCostoFiltroChange,
    handleCentroCostoFiltroChange, handleEstadoFiltroChange, handleCierreFiltroChange, limpiarFiltros,
  }
}
