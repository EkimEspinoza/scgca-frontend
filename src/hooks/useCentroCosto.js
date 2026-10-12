import { useEffect, useMemo, useState } from 'react'
import { obtenerCentrosCosto, obtenerOpcionesFiltros, obtenerCentrosCostoParaExportar } from '../services/centroCostoService'
import { obtenerEmpresas } from '../services/empresaService'
import { obtenerTiposCentroCosto, obtenerTiposMaquinaria, obtenerComparativos, obtenerVariedades } from '../services/maestroService'
import { mostrarTipoMaquinaria, mostrarComparativo, mostrarVariedad, requiereLimpiarFiltrosDependientes } from '../components/centroCosto/centroCostoRules'

export function useCentroCosto() {

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

    const [empresaId, setEmpresaId] = useState('')
    const [estado, setEstado] = useState('')
    const [tipoCcId, setTipoCcId] = useState('')
    const [tipoMaqId, setTipoMaqId] = useState('')
    const [comparativoId, setComparativoId] = useState('')
    const [variedadId, setVariedadId] = useState('')
    const [busqueda, setBusqueda] = useState('')

    // ==========================================================
    // PAGINACIÓN
    // ==========================================================

    const [pagina, setPagina] = useState(0)
    const [registrosPorPagina, setRegistrosPorPagina] = useState(25)
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
    }, [empresaId, estado, tipoCcId, loadingMaestros])


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
                        busqueda,
                        pagina: pagina + 1,
                        registrosPorPagina,
                    })
                if (!vigente) return
                setCentros(resultado.data ?? [])
                setTotal(resultado.count ?? 0)
            } catch (err) {
                if (!vigente) return
                console.error(err)
                setError('No se pudieron cargar los centros de costo.')
            } finally {
                if (vigente) { setLoading(false) }
            }
        }

        if (!loadingMaestros) { void cargarCentros() }
        return () => { vigente = false }
    }, [
        empresaId, estado, tipoCcId, tipoMaqId, comparativoId, variedadId, busqueda, pagina, registrosPorPagina, loadingMaestros,
        mostrarTipoMaquinariaActual, mostrarComparativoActual, mostrarVariedadActual, recarga])

    // ==========================================================
    // LIMPIAR FILTROS DEPENDIENTES
    // ==========================================================

    const limpiarFiltrosDependientes =
        () => {
            setTipoCcId('')
            setTipoMaqId('')
            setComparativoId('')
            setVariedadId('')
        }

    // ==========================================================
    // MANEJO DE FILTROS
    // ==========================================================

    const handleEmpresaChange =
        (event) => {
            setEmpresaId(event.target.value)
            if (requiereLimpiarFiltrosDependientes('empresa')) { limpiarFiltrosDependientes() }
            setPagina(0)
        }

    const handleEstadoChange = (event) => {
        setEstado(event.target.value)
        if (requiereLimpiarFiltrosDependientes('estado')) { limpiarFiltrosDependientes() }
        setPagina(0)
    }

    const handleTipoCcChange =
        (event) => {
            setTipoCcId(event.target.value)
            if (requiereLimpiarFiltrosDependientes('tipoCc')) {
                setTipoMaqId('')
                setComparativoId('')
                setVariedadId('')
            } setPagina(0)
        }

    const handleTipoMaqChange =
        (event) => {
            setTipoMaqId(event.target.value)
            setPagina(0)
        }

    const handleComparativoChange =
        (event) => {
            setComparativoId(event.target.value)
            setPagina(0)
        }

    const handleVariedadChange =
        (event) => {
            setVariedadId(event.target.value)
            setPagina(0)
        }

    const handleBusquedaChange =
        (event) => {
            setBusqueda(event.target.value)
            setPagina(0)
        }

    // ==========================================================
    // LIMPIAR FILTROS
    // ==========================================================

    const limpiarFiltros = () => {
        setEmpresaId('')
        setEstado('')
        setTipoCcId('')
        setTipoMaqId('')
        setComparativoId('')
        setVariedadId('')
        setBusqueda('')
        setPagina(0)
    }

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


    const handleChangePagina =
        (
            _,
            nuevaPagina,
        ) => { setPagina(nuevaPagina) }

    const handleChangeRegistrosPorPagina =
        (event) => {
            setRegistrosPorPagina(parseInt(event.target.value, 10))
            setPagina(0)
        }

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

        handleEmpresaChange,
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
        cerrarNotificacion,

    }
}