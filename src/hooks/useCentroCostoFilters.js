// Gestiona filtros y paginación del catálogo de Centros de Costo.
import { useState } from 'react'
import { requiereLimpiarFiltrosDependientes } from '../components/centroCosto/centroCostoRules'

export function useCentroCostoFilters() {
    const [estado, setEstado] = useState('')
    const [tipoCcId, setTipoCcId] = useState('')
    const [tipoMaqId, setTipoMaqId] = useState('')
    const [comparativoId, setComparativoId] = useState('')
    const [variedadId, setVariedadId] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [busquedaAplicada, setBusquedaAplicada] = useState('')
    const [pagina, setPagina] = useState(0)
    const [registrosPorPagina, setRegistrosPorPagina] = useState(25)

    const limpiarFiltrosDependientes = () => {
        setTipoCcId('')
        setTipoMaqId('')
        setComparativoId('')
        setVariedadId('')
    }

    const handleEstadoChange = (event) => {
        setEstado(event.target.value)
        if (requiereLimpiarFiltrosDependientes('estado')) limpiarFiltrosDependientes()
        setPagina(0)
    }

    const handleTipoCcChange = (event) => {
        setTipoCcId(event.target.value)
        if (requiereLimpiarFiltrosDependientes('tipoCc')) {
            setTipoMaqId('')
            setComparativoId('')
            setVariedadId('')
        }
        setPagina(0)
    }

    const handleTipoMaqChange = (event) => {
        setTipoMaqId(event.target.value)
        setPagina(0)
    }

    const handleComparativoChange = (event) => {
        setComparativoId(event.target.value)
        setPagina(0)
    }

    const handleVariedadChange = (event) => {
        setVariedadId(event.target.value)
        setPagina(0)
    }

    const handleBusquedaChange = (event) => {
        setBusqueda(event.target.value)
        setPagina(0)
    }

    const limpiarFiltros = () => {
        setEstado('')
        setTipoCcId('')
        setTipoMaqId('')
        setComparativoId('')
        setVariedadId('')
        setBusqueda('')
        setPagina(0)
    }

    const handleChangePagina = (_, nuevaPagina) => setPagina(nuevaPagina)
    const handleChangeRegistrosPorPagina = (event) => {
        setRegistrosPorPagina(parseInt(event.target.value, 10))
        setPagina(0)
    }

    return {
        estado, setEstado, tipoCcId, setTipoCcId,
        tipoMaqId, setTipoMaqId, comparativoId, setComparativoId, variedadId, setVariedadId,
        busqueda, setBusqueda, busquedaAplicada, setBusquedaAplicada,
        pagina, setPagina, registrosPorPagina, setRegistrosPorPagina,
        handleEstadoChange, handleTipoCcChange, handleTipoMaqChange,
        handleComparativoChange, handleVariedadChange, handleBusquedaChange, limpiarFiltros,
        handleChangePagina, handleChangeRegistrosPorPagina,
    }
}
