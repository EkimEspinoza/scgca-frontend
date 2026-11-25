// Gestiona estado y acciones de useCentroCosto.
import { useEffect, useMemo, useState } from 'react'
import { useEmpresa } from '../context/useEmpresa'
import { useCentroCostoFilters } from './useCentroCostoFilters'
import { obtenerCentrosCosto, obtenerOpcionesFiltros, obtenerCentrosCostoParaExportar, cambiarEstadoCentroCosto } from '../services/centroCostoService'
import { obtenerEmpresas } from '../services/empresaService'
import { obtenerTiposCentroCosto, obtenerTiposMaquinaria, obtenerComparativos, obtenerVariedades } from '../services/maestroService'
import { mostrarTipoMaquinaria, mostrarComparativo, mostrarVariedad } from '../components/centroCosto/centroCostoRules'

export function useCentroCosto() {
    const { empresaActual } = useEmpresa()
    const empresaId = empresaActual?.id_empresa == null ? '' : String(empresaActual.id_empresa)
    const filtros = useCentroCostoFilters()
    const {
        estado, setEstado, tipoCcId, setTipoCcId,
        tipoMaqId, setTipoMaqId, comparativoId, setComparativoId, variedadId, setVariedadId,
        busqueda, setBusqueda, busquedaAplicada, setBusquedaAplicada,
        pagina, setPagina, registrosPorPagina, setRegistrosPorPagina,
        handleEstadoChange, handleTipoCcChange, handleTipoMaqChange,
        handleComparativoChange, handleVariedadChange, handleBusquedaChange, limpiarFiltros,
        handleChangePagina, handleChangeRegistrosPorPagina,
    } = filtros

    // ==========================================================
    // DATOS
    // ==========================================================

    const [centros, setCentros] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [tiposCentroCosto, setTiposCentroCosto] = useState([])
    const [tiposMaquinaria, setTiposMaquinaria] = useState([])
    const [comparativos, setComparativos] = useState([])
    const [variedades, setVariedades] = useState([])

    // ==========================================================
    // OPCIONES DEPENDIENTES
    // ==========================================================


    const [tiposCentroCostoDisponibles, setTiposCentroCostoDisponibles] = useState([])
    const [tiposMaquinariaDisponibles, setTiposMaquinariaDisponibles] = useState([])
    const [comparativosDisponibles, setComparativosDisponibles] = useState([])
    const [variedadesDisponibles, setVariedadesDisponibles] = useState([])

    // ==========================================================
    //ESTADOS DE CARGA
    // ==========================================================

    const [loading, setLoading] = useState(false)
    const [loadingMaestros, setLoadingMaestros] = useState(true)
    const [loadingOpciones, setLoadingOpciones] = useState(false)
    const [exportandoExcel, setExportandoExcel] = useState(false)

    // ==========================================================
    // ERROR
    // ==========================================================

    const [error, setError] = useState('')

    // ==========================================================
    // FORMULARIO
    // ==========================================================

    const [modalNuevo, setModalNuevo] = useState(false)
    const [centroCostoEditar, setCentroCostoEditar] = useState(null)
    const [cambioEstadoPendiente, setCambioEstadoPendiente] = useState(null)
    const [cambiandoEstado, setCambiandoEstado] = useState(false)

    // ==========================================================
    // RECARGA
    // ==========================================================

    const [recarga, setRecarga] = useState(0)

    // ==========================================================
    // NOTIFICACIÓN
    // ==========================================================

    const [notificacion, setNotificacion] = useState({ open: false, mensaje: '', severity: 'success' })

    // ==========================================================
    // FILTROS
    // ==========================================================


    // ==========================================================
    // PAGINACIÓN
    // ==========================================================

    const [total, setTotal] = useState(0)

    // ==========================================================
    // VISIBILIDAD DE FILTROS
    // ==========================================================

    const mostrarTipoMaquinariaActual = useMemo(() => mostrarTipoMaquinaria(tipoCcId), [tipoCcId])
    const mostrarComparativoActual = useMemo(() => mostrarComparativo(tipoCcId), [tipoCcId])
    const mostrarVariedadActual = useMemo(() => mostrarVariedad(tipoCcId), [tipoCcId])

    // ==========================================================
    // CARGAR MAESTROS
    // ==========================================================

    useEffect(() => {
        async function cargarMaestros() {
            try {
                setLoadingMaestros(true)
                setError('')
                const [empresasData, tiposCcData, tiposMaqData, comparativosData, variedadesData] = await
                    Promise.all([obtenerEmpresas(), obtenerTiposCentroCosto(), obtenerTiposMaquinaria(), obtenerComparativos(), obtenerVariedades()])
                setEmpresas(empresasData.filter((item) => item.estado === true))
                setTiposCentroCosto(tiposCcData.filter((item) => item.estado === true))
                setTiposMaquinaria(tiposMaqData.filter((item) => item.estado === true))
                setComparativos(comparativosData.filter((item) => item.estado === true))
                setVariedades(variedadesData.filter((item) => item.estado === true))
            } catch (err) {
                console.error(err)
                setError('No se pudieron cargar los filtros maestros.')
            } finally { setLoadingMaestros(false) }
        }
        cargarMaestros()
    }, [])

    // ==========================================================
    // CARGAR OPCIONES DEPENDIENTES
    // ==========================================================

    useEffect(() => {
        let vigente = true
        async function cargarOpciones() {
            try {
                setLoadingOpciones(true)
                const resultado =
                    await obtenerOpcionesFiltros({
                        empresaId: empresaId === '' ? null : Number(empresaId),
                        estado: estado === '' ? null : estado === 'ACTIVO',
                        tipoCcId: tipoCcId === '' ? null : Number(tipoCcId),
                    })
                if (!vigente) return
                setTiposCentroCostoDisponibles(resultado.tiposCentroCosto ?? [])
                setTiposMaquinariaDisponibles(resultado.tiposMaquinaria ?? [])
                setComparativosDisponibles(resultado.comparativos ?? [])
                setVariedadesDisponibles(resultado.variedades ?? [])
            } catch (err) {
                if (!vigente) return
                console.error(err)
                setError('No se pudieron cargar las opciones de los filtros.')
            } finally { if (vigente) { setLoadingOpciones(false) } }
        }
        if (!loadingMaestros) { void cargarOpciones() }
        return () => { vigente = false }
    }, [empresaId, estado, tipoCcId, loadingMaestros, recarga])


    // ==========================================================
    // TIPOS DE CENTRO DE COSTO DISPONIBLES
    // ==========================================================

    const tiposCentroCostoFiltrados =
        useMemo(() => {
            if (!tiposCentroCostoDisponibles || tiposCentroCostoDisponibles.length === 0) { return tiposCentroCosto }
            const idsDisponibles =
                new Set(
                    tiposCentroCostoDisponibles.map((item) => Number(typeof item === 'object' ? item.id_tip_cc : item,)))
            return tiposCentroCosto.filter((tipo) => idsDisponibles.has(Number(tipo.id_tip_cc)))
        }, [tiposCentroCosto, tiposCentroCostoDisponibles])

    // ==========================================================
    // VALIDAR FILTROS DEPENDIENTES
    // ==========================================================

    useEffect(() => {
        // Clear dependent selections when their available option lists change.
        const tipoCcValido = tipoCcId === '' || tiposCentroCostoFiltrados.some((tipo) => Number(tipo.id_tip_cc) === Number(tipoCcId))

        // eslint-disable-next-line react/set-state-in-effect
        if (!tipoCcValido) {
            // eslint-disable-next-line react/set-state-in-effect
            setTipoCcId('')
            // eslint-disable-next-line react/set-state-in-effect
            setTipoMaqId('')
            // eslint-disable-next-line react/set-state-in-effect
            setComparativoId('')
            // eslint-disable-next-line react/set-state-in-effect
            setVariedadId('')
        }
        if (tipoMaqId !== '' && !tiposMaquinariaDisponibles.includes(Number(tipoMaqId))) { setTipoMaqId('') }
        if (comparativoId !== '' && !comparativosDisponibles.includes(Number(comparativoId))) { setComparativoId('') }
        if (variedadId !== '' && !variedadesDisponibles.includes(Number(variedadId))) { setVariedadId('') }
    },
        [tiposCentroCostoFiltrados, tiposMaquinariaDisponibles, comparativosDisponibles, variedadesDisponibles, tipoCcId, tipoMaqId, comparativoId, variedadId])

    // ==========================================================
    // APLICAR BÚSQUEDA CON UNA PAUSA PARA EVITAR CONSULTAS POR TECLA
    // ==========================================================

    useEffect(() => {
        const temporizador = setTimeout(() => {
            setBusquedaAplicada(busqueda.trim())
        }, 350)

        return () => clearTimeout(temporizador)
    }, [busqueda])
    // ==========================================================
    // CARGAR CENTROS DE COSTO
    // ==========================================================

    useEffect(() => {
        let vigente = true

        async function cargarCentros() {
            try {
                setLoading(true)
                setError('')
                const resultado =
                    await obtenerCentrosCosto({
                        empresaId: empresaId === '' ? null : Number(empresaId),
                        estado: estado === '' ? null : estado === 'ACTIVO',
                        tipoCcId: tipoCcId === '' ? null : Number(tipoCcId),
                        tipoMaqId: mostrarTipoMaquinariaActual && tipoMaqId !== '' ? Number(tipoMaqId) : null,
                        comparativoId: mostrarComparativoActual && comparativoId !== '' ? Number(comparativoId) : null,
                        variedadId: mostrarVariedadActual && variedadId !== '' ? Number(variedadId) : null,
                        busqueda: busquedaAplicada,
                        pagina: pagina + 1,
                        registrosPorPagina,
                    })
                if (!vigente) return
                setCentros(resultado.data ?? [])
                setTotal(resultado.count ?? 0)
            } catch (err) {
                if (!vigente) return
                console.error('Error cargando los centros de costo:', err)
                const detalle = [err?.code, err?.message].filter(Boolean).join(' — ')
                setError(import.meta.env.DEV && detalle
                    ? `No se pudieron cargar los centros de costo. ${detalle}`
                    : 'No se pudieron cargar los centros de costo.')
            } finally {
                if (vigente) { setLoading(false) }
            }
        }

        if (!loadingMaestros) { void cargarCentros() }
        return () => { vigente = false }
    }, [
        empresaId, estado, tipoCcId, tipoMaqId, comparativoId, variedadId, busquedaAplicada, pagina, registrosPorPagina, loadingMaestros,
        mostrarTipoMaquinariaActual, mostrarComparativoActual, mostrarVariedadActual, recarga])

    // ==========================================================
    // LIMPIAR FILTROS DEPENDIENTES
    // ==========================================================

    const handleSolicitarCambioEstado = (centro) => {
        setCambioEstadoPendiente({
            ...centro,
            nuevoEstado: !Boolean(centro.estado),
        })
    }

    const handleCerrarConfirmacionEstado = () => {
        if (cambiandoEstado) return
        setCambioEstadoPendiente(null)
    }

    const handleConfirmarCambioEstado = async () => {
        if (!cambioEstadoPendiente) return

        const { cod_cc_pk, cod_cc, nuevoEstado } = cambioEstadoPendiente

        try {
            setCambiandoEstado(true)
            const actualizado = await cambiarEstadoCentroCosto(cod_cc_pk, nuevoEstado)
            setCentros((actuales) => actuales.map((centro) =>
                centro.cod_cc_pk === cod_cc_pk
                    ? { ...centro, ...actualizado }
                    : centro,
            ))
            setRecarga((valor) => valor + 1)
            setNotificacion({
                open: true,
                mensaje: nuevoEstado
                    ? `Centro de Costo ${cod_cc} activado correctamente.`
                    : `Centro de Costo ${cod_cc} desactivado correctamente. El registro se conservó.`,
                severity: 'success',
            })
            setCambioEstadoPendiente(null)
        } catch (err) {
            console.error('Error cambiando estado del Centro de Costo:', err)
            setNotificacion({
                open: true,
                mensaje: err?.message || 'No se pudo cambiar el estado del Centro de Costo.',
                severity: 'error',
            })
        } finally {
            setCambiandoEstado(false)
        }
    }
    // ==========================================================
    // LIMPIAR FILTROS
    // ==========================================================

    // ==========================================================
    // EXPORTAR A EXCEL
    // ==========================================================

    const handleExportarExcel =
        async () => {
            try {
                setExportandoExcel(true)
                setError('')
                const datos = await obtenerCentrosCostoParaExportar({
                    empresaId: empresaId === '' ? null : Number(empresaId),
                    estado: estado === '' ? null : estado === 'ACTIVO',
                    tipoCcId: tipoCcId === '' ? null : Number(tipoCcId),
                    tipoMaqId: mostrarTipoMaquinariaActual && tipoMaqId !== '' ? Number(tipoMaqId) : null,
                    comparativoId: mostrarComparativoActual && comparativoId !== '' ? Number(comparativoId) : null,
                    variedadId: mostrarVariedadActual && variedadId !== '' ? Number(variedadId) : null,
                    busqueda,
                })
                if (!datos.length) {
                    setNotificacion({
                        open: true,
                        mensaje: 'No existen registros para exportar con los filtros actuales.',
                        severity: 'warning'
                    })
                    return
                }
                const fecha = new Date().toISOString().slice(0, 10)
                const { exportarCentrosCostoExcel } = await import('../services/excelService')
                exportarCentrosCostoExcel(datos, `Centros_de_Costo_${fecha}`)
                setNotificacion({
                    open: true,
                    mensaje: `Se exportaron ${datos.length} registros correctamente.`,
                    severity: 'success',
                })
            } catch (err) {
                console.error('Error exportando Centros de Costo:', err)
                setNotificacion({
                    open: true,
                    mensaje: 'No se pudo generar el archivo Excel.',
                    severity: 'error',
                })
            } finally { setExportandoExcel(false) }
        }

    // ==========================================================
    // PAGINACIÓN
    // ==========================================================


    // ==========================================================
    // NUEVO CENTRO DE COSTO
    // ==========================================================

    const abrirNuevoCentroCosto =
        () => {
            setCentroCostoEditar(null)
            setModalNuevo(true)
        }

    // ==========================================================
    // EDITAR CENTRO DE COSTO
    // ==========================================================

    const abrirEditarCentroCosto =
        (centro) => {
            setCentroCostoEditar(centro)
            setModalNuevo(true)
        }

    // ==========================================================
    // CERRAR FORMULARIO
    // ==========================================================

    const cerrarNuevoCentroCosto =
        () => {
            setModalNuevo(false)
            setCentroCostoEditar(null)
        }

    // ==========================================================
    // CENTRO DE COSTO GUARDADO
    // ==========================================================

    const handleCentroCostoGuardado = (registro, modoEdicion = false) => {
        setRecarga((valor) => valor + 1)
        setNotificacion({
            open: true,
            mensaje: modoEdicion
                ? `Centro de Costo ${registro.cod_cc} actualizado correctamente.`
                : `Centro de Costo ${registro.cod_cc} registrado correctamente.`,
            severity: 'success',
        })
    }

    // ==========================================================
    // CERRAR NOTIFICACIÓN
    // ==========================================================

    const cerrarNotificacion = (_event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setNotificacion((prev) => ({ ...prev, open: false }))
    }

    // ==========================================================
    // RETORNO
    // ==========================================================

    return {

        // Datos

        centros,
        empresas,
        tiposCentroCosto,
        tiposCentroCostoFiltrados,
        tiposMaquinaria,
        comparativos,
        variedades,

        // Opciones dependientes

        tiposMaquinariaDisponibles,
        comparativosDisponibles,
        variedadesDisponibles,

        // Estados

        loading,
        loadingMaestros,
        loadingOpciones,
        exportandoExcel,
        error,

        // Formulario

        modalNuevo,
        cambioEstadoPendiente,
        cambiandoEstado,
        centroCostoEditar,

        // Notificación

        notificacion,

        // Filtros

        empresaId,
        estado,
        tipoCcId,
        tipoMaqId,
        comparativoId,
        variedadId,
        busqueda,

        // Visibilidad

        mostrarTipoMaquinaria: mostrarTipoMaquinariaActual,
        mostrarComparativo: mostrarComparativoActual,
        mostrarVariedad: mostrarVariedadActual,

        // Paginación

        pagina,
        registrosPorPagina,
        total,

        // Eventos

        handleEstadoChange,
        handleTipoCcChange,
        handleTipoMaqChange,
        handleComparativoChange,
        handleVariedadChange,
        handleBusquedaChange,
        limpiarFiltros,
        handleChangePagina,
        handleChangeRegistrosPorPagina,

        // Exportación

        handleExportarExcel,

        // Centro de Costo

        abrirNuevoCentroCosto,
        abrirEditarCentroCosto,
        cerrarNuevoCentroCosto,
        handleCentroCostoGuardado,
        handleSolicitarCambioEstado,
        handleCerrarConfirmacionEstado,
        handleConfirmarCambioEstado,
        cerrarNotificacion,

    }
}
